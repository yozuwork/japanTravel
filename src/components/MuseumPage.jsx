import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MdArrowBack, MdRoute, MdLanguage, MdInfoOutline, MdAccessTime, MdDirectionsWalk, MdDirectionsBus, MdTrain, MdLocationOn, MdHotel, MdPark, MdClose, MdAddPhotoAlternate, MdZoomIn, MdEdit, MdCheck } from 'react-icons/md'
import { FaLightbulb, FaCamera, FaTrash } from 'react-icons/fa'
import './MuseumPage.css'

const IS_DEV = import.meta.env.DEV
const BASE = import.meta.env.BASE_URL

const KAMATA = [
  {
    id: 'yamaguchi',
    name: '山口體驗美術館',
    badge: '步行首選',
    badgeColor: 'indigo',
    transportType: 'walk',
    transportText: <>從飯店步行約 <strong className="indigo">15-20</strong> 分鐘。</>,
    hours: '10:00–17:00',
    closed: '週一、二休館',
    desc: '館藏多元，包含世界知名大師至當代藝術家的作品。館內氣氛寧靜，非常適合靜心賞畫，同時提供正統抹茶體驗與日本傳統工藝品展示。',
    detail: '這是一間充滿文藝氣息的隱藏版美術館，館藏驚人，涵蓋了從畢卡索、雷諾瓦等世界級大師，到現代塗鴉藝術家班克斯（Banksy）的作品。除了欣賞跨時代的畫作，館內還提供正統的抹茶體驗與精緻的日本傳統工藝品展示，是遠離都市喧囂、享受靜謐藝術時光的絕佳去處。',
    website: 'https://www.google.com/search?q=山口體驗美術館',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=山口體驗美術館+大田區',
  },
  {
    id: 'ryushi',
    name: '大田區立龍子紀念館',
    badge: '公車直達',
    badgeColor: 'amber',
    transportType: 'bus',
    transportText: <>蒲田站搭乘巴士至「臼田坂下」，車程 <strong className="amber">12</strong> 分。</>,
    hours: '09:00–16:30',
    closed: '週一休館',
    desc: '展示日本畫大師川端龍子的氣勢宏大之作。建築對面還有他親自設計的禪意庭園，融合了自然與藝術的美感。',
    detail: '專門展示日本近代繪畫大師「川端龍子」的作品。為了讓大眾能舒適欣賞大尺寸的作品，龍子大師親自設計了這座紀念館。館內展示了多幅氣勢磅礡、充滿魄力的日本畫作。對面的「龍子公園」（龍子舊居與畫室）也是由大師親自設計，完美融合了自然與藝術的禪意。',
    website: 'https://www.ota-bunka.or.jp/facilities/ryushi',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=大田區立龍子紀念館',
  },
  {
    id: 'ota',
    name: '大田區立鄉土博物館',
    badge: '深度文化',
    badgeColor: 'green',
    transportType: 'bus',
    transportText: <>蒲田站搭乘巴士至「西馬込」，約需 <strong className="green">10-15</strong> 分。</>,
    hours: '09:00–17:00',
    closed: '週一休館',
    desc: '致力於保存大田區的人文歷史與工藝，包含馬込文士村資料、傳統海苔製作工藝重現，以及考古出土文物。',
    detail: '這裡展示了大田區從古至今的歷史演變與文化發展。常設展包含「馬込文士村」的相關資料（曾有多位知名作家與藝術家居住於此）、傳統海苔製作工藝的重現，以及考古出土文物。是深入了解當地風土民情與人文底蘊的最佳場域。',
    website: 'https://www.city.ota.tokyo.jp/shisetsu/hakubutsukan/',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=大田區立鄉土博物館',
  },
]

const UENO = [
  {
    id: 'nmwa',
    name: '國立西洋美術館',
    badge: '世界遺產',
    badgeColor: 'rose',
    transportType: 'train',
    transportText: <>JR「上野站」公園口步行 <strong className="rose">1</strong> 分鐘。</>,
    hours: '09:30–17:30',
    closed: '週一休館',
    desc: '由建築大師柯比意設計，名列世界文化遺產。館內主要展出莫內、羅丹等西洋美術大師的經典之作。',
    detail: '位於上野公園內，主館由20世紀最偉大的建築師之一勒·柯比意（Le Corbusier）設計，並於2016年被登錄為世界文化遺產。館內以松方幸次郎的豐富收藏為基礎，展出從中世紀末期到20世紀初的西洋美術作品，特別是館外的羅丹雕塑（如沉思者）與館內的莫內畫作最為著名。',
    website: 'https://www.nmwa.go.jp/',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=國立西洋美術館',
  },
  {
    id: 'tnm',
    name: '東京國立博物館',
    badge: '歷史最久',
    badgeColor: 'gray',
    transportType: 'walk',
    transportText: <>JR「上野站」公園口步行 <strong className="rose">10</strong> 分鐘。</>,
    hours: '09:30–17:00',
    closed: '週一休館',
    desc: '日本歷史最悠久、規模最大的博物館，藏有大量國寶與重要文化財，是了解日本歷史的必訪聖地。',
    detail: '創立於1872年，是日本歷史最悠久、規模最大的綜合性博物館。館藏超過11萬件，包含近百件國寶與近千件重要文化財。展品涵蓋日本及亞洲各地的考古文物、佛像、陶瓷、浮世繪與精美的武士刀具，是探索日本傳統文化的最高殿堂。',
    website: 'https://www.tnm.jp/',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=東京國立博物館',
  },
  {
    id: 'tobikan',
    name: '東京都美術館',
    badge: '特展匯聚',
    badgeColor: 'blue',
    transportType: 'walk',
    transportText: <>JR「上野站」公園口步行 <strong className="rose">7</strong> 分鐘。</>,
    hours: '09:30–17:30',
    closed: '第1、3週一休',
    desc: '館內無常設展覽，但經常舉辦極具話題性的世界級特展。紅磚建築由前川國男設計，極具建築特色。',
    detail: '1926年開館，是日本第一座公立美術館。現今具標誌性的紅磚建築由日本現代建築大師前川國男所設計。館內本身沒有常設展，而是作為國內外各大重量級特展（如印象派大展、梵谷展、慕夏展等）的舉辦場地，被譽為東京藝術活動的發信地。',
    website: 'https://www.tobikan.jp/',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=東京都美術館',
  },
  {
    id: 'kahaku',
    name: '國立科學博物館',
    badge: '自然奇觀',
    badgeColor: 'teal',
    transportType: 'walk',
    transportText: <>JR「上野站」公園口步行 <strong className="rose">5</strong> 分鐘。</>,
    hours: '09:00–17:00',
    closed: '週一休館',
    desc: '日本最具代表性的自然科學博物館，展有恐龍化石、宇宙探索、日本列島生態等超過500萬件館藏，老少皆宜。',
    detail: '正式名稱為「国立科学博物館」，是日本最具代表性的自然史與科學博物館。館內分為「日本館」和「地球館」兩大館區，展示恐龍化石復原骨架、忠犬八公標本、宇宙探索科技、人類演化史及日本列島的多樣生態，館藏超過500萬件，是橫跨所有年齡層都能盡興的必訪場所。',
    website: 'https://www.kahaku.go.jp/',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=国立科学博物館+上野',
  },
  {
    id: 'uenomori',
    name: '上野之森美術館',
    badge: '特展名所',
    badgeColor: 'purple',
    transportType: 'train',
    transportText: <>JR「上野站」公園口步行 <strong className="rose">2</strong> 分鐘。</>,
    hours: '10:00–17:00',
    closed: '展期間無休',
    desc: '緊鄰JR上野站，以舉辦大型人氣特展聞名。曾舉辦芸術祭大獎展、維梅爾展等熱門展覽，票價平實。',
    detail: '正式名稱為「上野の森美術館」，是日本美術協會附屬的私立美術館，也是上野地區唯一鄰近車站的美術館。以入場費相對平實、展期不定期更換的話題性特展著稱，歷年來舉辦過維梅爾展、竹久夢二展等深受好評的展覽。館外廣場的戶外展示同樣值得一看。',
    website: 'https://www.ueno-mori.org/',
    mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=上野の森美術館',
  },
]

/* ── Hero section (editable) ────────────── */
const HERO_STORAGE_KEY = 'jt_museum_hero'
const DEFAULT_HERO = {
  title: '雙城藝術地圖',
  subtitle: '精選 8 間美術館 · 含交通與路線規劃',
}

function HeroSection({ imageMap, onImageSaved, onImageDeleted }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [lightbox, setLightbox] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [heroText, setHeroText] = useState(() => {
    try {
      const s = localStorage.getItem(HERO_STORAGE_KEY)
      return s ? JSON.parse(s) : DEFAULT_HERO
    } catch { return DEFAULT_HERO }
  })
  const [draft, setDraft] = useState(null)

  const locationId = 'museum-hero'
  const storedUrl = imageMap[locationId]
  const displayUrl = preview || (storedUrl ? `${BASE.replace(/\/$/, '')}${storedUrl}` : null)
  const defaultImg = 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&q=80&w=800'

  async function handleFile(file) {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      form.append('locationId', locationId)
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) onImageSaved(locationId, data.url)
    } catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  async function handleDeleteImg(e) {
    e.stopPropagation()
    setPreview(null)
    await fetch(`/api/delete-image/${locationId}`, { method: 'DELETE' })
    onImageDeleted(locationId)
  }

  function startEdit(e) {
    e.stopPropagation()
    setDraft({ ...heroText })
    setIsEditing(true)
  }

  function saveEdit(e) {
    e.stopPropagation()
    setHeroText(draft)
    try { localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(draft)) } catch {}
    setIsEditing(false)
  }

  return (
    <div className="mp-hero">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {/* 背景圖 */}
      <img
        className="mp-hero-img"
        src={displayUrl || defaultImg}
        alt="hero"
        onError={e => { e.target.src = defaultImg }}
      />
      {uploading && <div className="mp-hero-uploading">上傳中…</div>}

      {/* 文字覆蓋層 */}
      <div className="mp-hero-overlay">
        {isEditing ? (
          <div className="mp-hero-edit-form" onClick={e => e.stopPropagation()}>
            <input
              className="mp-hero-input mp-hero-input--title"
              value={draft.title}
              onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              placeholder="標題"
            />
            <input
              className="mp-hero-input mp-hero-input--sub"
              value={draft.subtitle}
              onChange={e => setDraft(d => ({ ...d, subtitle: e.target.value }))}
              placeholder="副標題"
            />
            <button className="mp-hero-save-btn" onClick={saveEdit}>
              <MdCheck size={14} /> 儲存
            </button>
          </div>
        ) : (
          <>
            <h2>{heroText.title}</h2>
            <p>{heroText.subtitle}</p>
          </>
        )}
      </div>

      {/* DEV 控制列（圖片 + 文字編輯） */}
      {IS_DEV && !isEditing && (
        <div className="mp-hero-controls">
          <button className="mp-hero-ctrl-btn" onClick={() => inputRef.current.click()} title="更換背景圖">
            <FaCamera size={12} /> 換圖
          </button>
          {displayUrl && (
            <button className="mp-hero-ctrl-btn mp-hero-ctrl-btn--del" onClick={handleDeleteImg} title="移除自訂圖片">
              <FaTrash size={11} />
            </button>
          )}
          <button className="mp-hero-ctrl-btn" onClick={startEdit} title="編輯文字">
            <MdEdit size={13} /> 編輯文字
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Lightbox ───────────────────────────── */
function Lightbox({ src, onClose }) {
  return createPortal(
    <div className="mp-lightbox" onClick={onClose}>
      <button className="mp-lightbox-close" onClick={onClose}><MdClose size={26} /></button>
      <img src={src} className="mp-lightbox-img" onClick={e => e.stopPropagation()} alt="" />
    </div>,
    document.body
  )
}

/* ── Museum cover image ─────────────────── */
function MuseumImageArea({ museumId, imageUrl, onSaved, onDeleted }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [lightbox, setLightbox] = useState(false)

  const locationId = `museum-${museumId}`
  const displayUrl = preview || (imageUrl ? `${BASE.replace(/\/$/, '')}${imageUrl}` : null)

  async function handleFile(file) {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      form.append('locationId', locationId)
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) onSaved(locationId, data.url)
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(e) {
    e.stopPropagation()
    setPreview(null)
    await fetch(`/api/delete-image/${locationId}`, { method: 'DELETE' })
    onDeleted(locationId)
  }

  if (!IS_DEV && !displayUrl) return null

  return (
    <div className="mp-img-area">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      {displayUrl ? (
        <>
          <div
            className="mp-img-preview"
            onClick={IS_DEV ? () => inputRef.current.click() : () => setLightbox(true)}
          >
            <img src={displayUrl} alt="museum cover" />
            {uploading && <div className="mp-img-uploading">上傳中…</div>}
            {IS_DEV && (
              <div className="mp-img-overlay">
                <span className="mp-img-overlay-hint"><FaCamera size={13} /> 更換封面</span>
                <button className="mp-img-delete-btn" onClick={handleDelete} title="刪除封面">
                  <FaTrash size={12} />
                </button>
              </div>
            )}
            {!IS_DEV && (
              <div className="mp-img-overlay">
                <MdZoomIn size={22} />
              </div>
            )}
          </div>
          {lightbox && <Lightbox src={displayUrl} onClose={() => setLightbox(false)} />}
        </>
      ) : (
        <button className="mp-img-upload-btn" onClick={() => inputRef.current.click()}>
          {uploading
            ? <span className="mp-img-dot" />
            : <MdAddPhotoAlternate size={22} color="#a0aec0" />}
          <span>新增封面照片</span>
        </button>
      )}
    </div>
  )
}

const TRANSPORT_ICON = {
  walk: <MdDirectionsWalk size={18} />,
  bus: <MdDirectionsBus size={18} />,
  train: <MdTrain size={18} />,
}

function MuseumCard({ museum, accentColor, imageUrl, onImageSaved, onImageDeleted }) {
  const urlKey = `jt_museum_url_${museum.id}`
  const [website, setWebsite] = useState(() => {
    try { return localStorage.getItem(urlKey) || museum.website } catch { return museum.website }
  })
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')

  function startUrlEdit(e) {
    e.preventDefault()
    setUrlDraft(website)
    setEditingUrl(true)
  }

  function saveUrl() {
    const trimmed = urlDraft.trim()
    setWebsite(trimmed || museum.website)
    try { localStorage.setItem(urlKey, trimmed || museum.website) } catch {}
    setEditingUrl(false)
  }

  function cancelUrl() {
    setEditingUrl(false)
  }

  return (
    <div className="mp-card">
      <MuseumImageArea
        museumId={museum.id}
        imageUrl={imageUrl}
        onSaved={onImageSaved}
        onDeleted={onImageDeleted}
      />
      <div className="mp-card-top">
        <div className={`mp-card-name ${accentColor}-bar`}>{museum.name}</div>
        <span className={`mp-badge ${museum.badgeColor}`}>{museum.badge}</span>
      </div>
      <div className="mp-card-body">
        <div className="mp-transport-row">
          <span className="mp-transport-icon" style={{ color: accentColor === 'indigo' ? '#6366f1' : '#f43f5e' }}>
            {TRANSPORT_ICON[museum.transportType]}
          </span>
          <p className="mp-transport-text">{museum.transportText}</p>
        </div>
        <p className="mp-desc">{museum.desc}</p>
        <div className="mp-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MdAccessTime size={13} />{museum.hours}
          </span>
          <span className="mp-closed">{museum.closed}</span>
        </div>

        {/* URL 編輯區 */}
        {editingUrl ? (
          <div className="mp-url-edit">
            <div className="mp-url-edit-row">
              <MdLanguage size={14} style={{ flexShrink: 0, color: '#718096' }} />
              <input
                className="mp-url-input"
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                placeholder="https://..."
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') cancelUrl() }}
              />
            </div>
            <div className="mp-url-edit-actions">
              <button className="mp-hero-save-btn" onClick={saveUrl}>
                <MdCheck size={13} /> 儲存
              </button>
              <button className="mp-overview-cancel-btn" onClick={cancelUrl}>
                <MdClose size={13} /> 取消
              </button>
            </div>
          </div>
        ) : (
          <div className="mp-actions">
            <a href={website} target="_blank" rel="noreferrer" className="mp-btn gray-btn">
              <MdLanguage size={13} /> 官方網站
            </a>
            {IS_DEV ? (
              <button className="mp-btn gray-btn" onClick={startUrlEdit}>
                <MdEdit size={13} /> 編輯網址
              </button>
            ) : (
              <button className="mp-btn gray-btn" onClick={() => museum._onDetail()}>
                <MdInfoOutline size={13} /> 詳細介紹
              </button>
            )}
          </div>
        )}

        {/* 詳細介紹（DEV 模式下另起一行） */}
        {IS_DEV && !editingUrl && (
          <button className="mp-btn gray-btn mp-detail-btn" onClick={() => museum._onDetail()}>
            <MdInfoOutline size={13} /> 詳細介紹
          </button>
        )}

        <button
          className={`mp-route-btn ${accentColor}`}
          onClick={() => window.open(museum.mapUrl, '_blank')}
        >
          <MdRoute size={15} /> 開啟路線規劃
        </button>
      </div>
    </div>
  )
}

const OVERVIEW_KEY = 'jt_museum_overview'
const DEFAULT_OVERVIEW = '為您精心規劃的雙城藝術地圖。從充滿在地深度人文的蒲田地區（3間）出發，再延伸至擁有世界級展覽殿堂的上野恩賜公園（5間）。點擊各館按鈕即可查看詳情與規劃路線！'

export default function MuseumPage({ onBack, imageMap = {}, onImageSaved, onImageDeleted }) {
  const [activeTab, setActiveTab] = useState('kamata')
  const [modal, setModal] = useState(null)
  const [overview, setOverview] = useState(() => {
    try { return localStorage.getItem(OVERVIEW_KEY) || DEFAULT_OVERVIEW } catch { return DEFAULT_OVERVIEW }
  })
  const [editingOverview, setEditingOverview] = useState(false)
  const [overviewDraft, setOverviewDraft] = useState('')

  function openModal(m) { setModal(m) }
  function closeModal() { setModal(null) }

  function startOverviewEdit() {
    setOverviewDraft(overview)
    setEditingOverview(true)
  }
  function saveOverview() {
    setOverview(overviewDraft)
    try { localStorage.setItem(OVERVIEW_KEY, overviewDraft) } catch {}
    setEditingOverview(false)
  }

  const kamataWithCb = KAMATA.map(m => ({ ...m, _onDetail: () => openModal(m) }))
  const uenoWithCb   = UENO.map(m => ({ ...m, _onDetail: () => openModal(m) }))

  function imgUrl(id) { return imageMap[`museum-${id}`] ?? null }

  return (
    <div className="mp-page">
      {/* Header */}
      <div className="mp-header">
        <button className="mp-back-btn" onClick={onBack}>
          <MdArrowBack size={16} />返回行程
        </button>
        <div className="mp-header-title">
          <h1>東京雙城藝術散策</h1>
          <p>蒲田 × 上野：藝文場館導覽</p>
        </div>
      </div>

      <div className="mp-body">
        {/* Hero */}
        <HeroSection
          imageMap={imageMap}
          onImageSaved={onImageSaved}
          onImageDeleted={onImageDeleted}
        />

        {/* Overview */}
        <div className="mp-overview">
          {editingOverview ? (
            <div className="mp-overview-edit">
              <textarea
                className="mp-overview-textarea"
                value={overviewDraft}
                onChange={e => setOverviewDraft(e.target.value)}
                rows={4}
                autoFocus
              />
              <div className="mp-overview-edit-actions">
                <button className="mp-hero-save-btn" onClick={saveOverview}>
                  <MdCheck size={13} /> 儲存
                </button>
                <button className="mp-overview-cancel-btn" onClick={() => setEditingOverview(false)}>
                  <MdClose size={13} /> 取消
                </button>
              </div>
            </div>
          ) : (
            <div className="mp-overview-view">
              <span>{overview}</span>
              {IS_DEV && (
                <button className="mp-overview-edit-btn" onClick={startOverviewEdit} title="編輯說明文字">
                  <MdEdit size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mp-tabs">
          <button
            className={`mp-tab${activeTab === 'kamata' ? ' active-indigo' : ''}`}
            onClick={() => setActiveTab('kamata')}
          >
            <MdLocationOn size={15} /> 蒲田地區
          </button>
          <button
            className={`mp-tab${activeTab === 'ueno' ? ' active-rose' : ''}`}
            onClick={() => setActiveTab('ueno')}
          >
            <MdLocationOn size={15} /> 上野地區
          </button>
        </div>

        {/* 蒲田 */}
        {activeTab === 'kamata' && (
          <div className="mp-section indigo-bg">
            <p className="mp-section-hint"><MdHotel size={14} /> 從「東京蒲田阿吉爾飯店」出發的私房景點</p>
            {kamataWithCb.map(m => (
              <MuseumCard key={m.id} museum={m} accentColor="indigo"
                imageUrl={imgUrl(m.id)} onImageSaved={onImageSaved} onImageDeleted={onImageDeleted} />
            ))}
          </div>
        )}

        {/* 上野 */}
        {activeTab === 'ueno' && (
          <div className="mp-section rose-bg">
            <p className="mp-section-hint"><MdPark size={14} /> 匯集日本與世界殿堂級藝術的上野恩賜公園</p>
            {uenoWithCb.map(m => (
              <MuseumCard key={m.id} museum={m} accentColor="rose"
                imageUrl={imgUrl(m.id)} onImageSaved={onImageSaved} onImageDeleted={onImageDeleted} />
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="mp-tips">
          <h3><FaLightbulb color="#facc15" size={14} /> 參觀小指南</h3>
          <ul>
            <li>• 上野地區的美術館週末人潮眾多，強烈建議提早於官網線上購票。</li>
            <li>• 行動裝置開啟「路線規劃」會自動抓取您的當下位置，計算最快抵達路徑。</li>
            <li>• 上野 5 間場館距離很近，可安排一日走完國立西洋美術館 + 科學博物館 + 都美術館。</li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      <div
        className={`mp-modal-overlay${modal ? ' visible' : ''}`}
        onClick={closeModal}
      >
        <div className="mp-modal" onClick={e => e.stopPropagation()}>
          <div className="mp-modal-header">
            <h3>{modal?.name ?? ''}</h3>
            <button className="mp-modal-close-btn" onClick={closeModal}><MdClose size={20} /></button>
          </div>
          <div className="mp-modal-body">
            <p>{modal?.detail ?? ''}</p>
            <button className="mp-modal-footer" onClick={closeModal}>關閉視窗</button>
          </div>
        </div>
      </div>
    </div>
  )
}
