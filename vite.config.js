import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const multer = require('multer')

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1')
const imagesDir = path.join(__dirname, 'public', 'images')
const manifestPath = path.join(imagesDir, 'manifest.json')

function readManifest() {
  try { return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) }
  catch { return {} }
}

function writeManifest(data) {
  fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2))
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })
    cb(null, imagesDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `_tmp_${Date.now()}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

export default defineConfig({
  base: '/japanTravel/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: '日本 6日5夜 旅遊行程',
        short_name: '日本旅遊',
        description: '東京6日5夜旅遊行程地圖導覽',
        theme_color: '#c0392b',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'zh-TW',
        orientation: 'any',
        icons: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
    {
      name: 'image-upload-server',
      configureServer(server) {
        // POST /api/upload-image  { image: File, locationId: string }
        server.middlewares.use('/api/upload-image', (req, res, next) => {
          if (req.method !== 'POST') return next()

          upload.fields([{ name: 'image', maxCount: 1 }])(req, res, err => {
            if (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ error: err.message }))
            }

            const locationId = req.body?.locationId
            const file = req.files?.image?.[0]

            if (!file || !locationId) {
              if (file) fs.unlinkSync(file.path)
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              return res.end(JSON.stringify({ error: 'Missing locationId or file' }))
            }

            const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
            const finalName = `${locationId}${ext}`
            const finalPath = path.join(imagesDir, finalName)

            // Remove old file if different extension
            const manifest = readManifest()
            const oldUrl = manifest[locationId]
            if (oldUrl) {
              const oldPath = path.join(__dirname, 'public', oldUrl)
              if (fs.existsSync(oldPath) && oldPath !== finalPath) fs.unlinkSync(oldPath)
            }

            fs.renameSync(file.path, finalPath)

            manifest[locationId] = `/images/${finalName}`
            writeManifest(manifest)

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ url: `/images/${finalName}`, locationId }))
          })
        })

        // DELETE /api/delete-image/:locationId
        server.middlewares.use('/api/delete-image', (req, res, next) => {
          if (req.method !== 'DELETE') return next()

          const locationId = req.url.replace('/', '')
          const manifest = readManifest()
          const url = manifest[locationId]

          if (url) {
            const filePath = path.join(__dirname, 'public', url)
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
            delete manifest[locationId]
            writeManifest(manifest)
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
        })
      },
    },
  ],
})
