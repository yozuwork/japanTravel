import { useEffect, useRef, useState } from 'react'
import { FaMapMarkerAlt, FaCamera, FaTrash } from 'react-icons/fa'
import { MdAddPhotoAlternate, MdRadioButtonUnchecked } from 'react-icons/md'
import { TYPE_ICONS, DAY_ICONS } from '../data/icons'
import RouteInfoCard from './RouteInfoCard'

const IS_DEV = import.meta.env.DEV
const BASE = import.meta.env.BASE_URL

/* ── Image upload area ───────────────────── */
function ImageArea({ locationId, imageUrl, onSaved, onDeleted }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

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
    <div className="img-area">
      <input ref={inputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])} />

      {displayUrl ? (
        <div className="img-preview" onClick={() => IS_DEV && inputRef.current.click()}>
          <img src={displayUrl} alt="location" />
          {uploading && <div className="img-uploading">上傳中…</div>}
          {IS_DEV && (
            <div className="img-overlay">
              <FaCamera size={13} color="white" />
              <button className="img-delete-btn" onClick={handleDelete} title="刪除圖片">
                <FaTrash size={10} color="white" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="img-upload-btn" onClick={() => inputRef.current.click()} title="點擊上傳圖片">
          {uploading
            ? <span className="img-uploading-dot" />
            : <MdAddPhotoAlternate size={22} color="#a0aec0" />}
          <span>新增照片</span>
        </button>
      )}
    </div>
  )
}

/* ── Selection button ────────────────────── */
function SelButton({ selState, hasCoords, onClick }) {
  return (
    <button
      className={`tl-sel-btn${selState ? ` tl-sel-btn--${selState}` : ''}`}
      onClick={e => { e.stopPropagation(); onClick() }}
      title={selState === 'a' ? '已選為起點 A（點擊取消）' : selState === 'b' ? '已選為終點 B（點擊取消）' : '選為路線端點'}
      disabled={!hasCoords}
    >
      {selState === 'a' ? 'A' : selState === 'b' ? 'B' : <MdRadioButtonUnchecked size={14} />}
    </button>
  )
}

/* ── Single timeline item ────────────────── */
function TimelineItem({ loc, index, isActive, onSelect, imageUrl, onImageSaved, onImageDeleted, selState, onToggleSel }) {
  const ref = useRef(null)
  const IconComponent = TYPE_ICONS[loc.type]

  useEffect(() => {
    if (isActive && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [isActive])

  return (
    <div ref={ref}
      className={`timeline-item${isActive ? ' active' : ''}${selState ? ` sel-${selState}` : ''}`}
      onClick={() => onSelect(index)}
    >
      <SelButton selState={selState} hasCoords={!!loc.coords} onClick={() => onToggleSel(loc, index)} />

      <div className="tl-left">
        <div className={`tl-dot dot-${loc.type}`}>
          {IconComponent ? <IconComponent size={14} color="white" /> : <FaMapMarkerAlt size={14} color="white" />}
        </div>
        <div className="tl-line" />
      </div>

      <div className="tl-card">
        <div className="tl-card-body">
          <div className="tl-time">{loc.time}</div>
          <div className="tl-name">{loc.name}</div>
          {loc.note && <div className="tl-note">{loc.note}</div>}
          {loc.mapLink && (
            <div className="tl-actions">
              <a href={loc.mapLink} target="_blank" rel="noreferrer"
                className="map-btn" onClick={e => e.stopPropagation()}>
                <FaMapMarkerAlt size={11} /> Google 地圖
              </a>
            </div>
          )}
        </div>

        <ImageArea locationId={loc.id} imageUrl={imageUrl} onSaved={onImageSaved} onDeleted={onImageDeleted} />
      </div>
    </div>
  )
}

/* ── Panel ───────────────────────────────── */
export default function ItineraryPanel({
  day, dayIndex, activeIndex, onLocationSelect,
  imageMap, onImageSaved, onImageDeleted,
  selA, selB, onToggleSelection, onClearSelection,
}) {
  const DayIcon = DAY_ICONS[dayIndex]

  function getSelState(locId) {
    if (selA?.id === locId) return 'a'
    if (selB?.id === locId) return 'b'
    return null
  }

  return (
    <aside className="itinerary-panel">
      <div className="panel-head">
        <div className="panel-day-title">
          {DayIcon && <DayIcon size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
          {day.date}（{day.title}）
        </div>
        <div className="panel-day-sub">
          {day.placeholder ? '行程即將加入' : `共 ${day.locations.length} 個地點`}
        </div>
      </div>

      {/* Route info card – appears when any selection exists */}
      <RouteInfoCard selA={selA} selB={selB} onClear={onClearSelection} />

      {day.placeholder ? (
        <div className="placeholder-msg">
          <div className="ph-icon">{DayIcon && <DayIcon size={48} color="#cbd5e0" />}</div>
          <p>{day.date} {day.title}<br />行程規劃中，敬請期待！</p>
        </div>
      ) : (
        <div className="timeline">
          {day.locations.map((loc, i) => (
            <TimelineItem
              key={loc.id}
              loc={loc}
              index={i}
              isActive={i === activeIndex}
              onSelect={onLocationSelect}
              imageUrl={imageMap[loc.id] ?? null}
              onImageSaved={onImageSaved}
              onImageDeleted={onImageDeleted}
              selState={getSelState(loc.id)}
              onToggleSel={onToggleSelection}
            />
          ))}
        </div>
      )}
    </aside>
  )
}
