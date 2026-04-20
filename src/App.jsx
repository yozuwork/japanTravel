import { useState, useEffect } from 'react'
import Header from './components/Header'
import MapView from './components/MapView'
import ItineraryPanel from './components/ItineraryPanel'
import { ITINERARY } from './data/itinerary'

const BASE = import.meta.env.BASE_URL

export default function App() {
  const [currentDay, setCurrentDay] = useState(0)
  const [activeIndex, setActiveIndex] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [imageMap, setImageMap] = useState({})

  const day = ITINERARY[currentDay]

  // Load image manifest on startup
  useEffect(() => {
    fetch(`${BASE}images/manifest.json?t=${Date.now()}`)
      .then(r => r.json())
      .then(data => setImageMap(data))
      .catch(() => {})
  }, [])

  function handleDayChange(i) {
    setCurrentDay(i)
    setActiveIndex(null)
  }

  function handleLocationSelect(i) {
    setActiveIndex(prev => (prev === i ? null : i))
  }

  function handleImageSaved(locationId, url) {
    setImageMap(prev => ({ ...prev, [locationId]: url }))
  }

  function handleImageDeleted(locationId) {
    setImageMap(prev => {
      const next = { ...prev }
      delete next[locationId]
      return next
    })
  }

  useEffect(() => {
    const on = () => setIsOffline(false)
    const off = () => setIsOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return (
    <>
      <Header currentDay={currentDay} onDayChange={handleDayChange} />

      <main className="app-main">
        <MapView
          day={day}
          activeIndex={activeIndex}
          onLocationSelect={handleLocationSelect}
        />
        <ItineraryPanel
          day={day}
          dayIndex={currentDay}
          activeIndex={activeIndex}
          onLocationSelect={handleLocationSelect}
          imageMap={imageMap}
          onImageSaved={handleImageSaved}
          onImageDeleted={handleImageDeleted}
        />
      </main>

      <div className={`offline-toast${isOffline ? ' show' : ''}`}>
        📵 離線模式 — 顯示已快取的地圖
      </div>
    </>
  )
}
