import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { FaMapMarkerAlt, FaCamera, FaTrash } from 'react-icons/fa'
import {
  MdAddPhotoAlternate, MdRadioButtonUnchecked,
  MdKeyboardArrowUp, MdKeyboardArrowDown,
  MdEdit, MdCheck, MdClose, MdZoomIn,
} from 'react-icons/md'
import { TYPE_ICONS, DAY_ICONS } from '../data/icons'
import RouteInfoCard from './RouteInfoCard'

/* ── Bottom-sheet drag handle ────────────── */
const BASE_SNAPS = [10, 22, 45, 75]
const HEADER_H = 80
const HANDLE_H = 44

function getMaxMapVh() {
  return ((window.innerHeight - HEADER_H - HANDLE_H) / window.innerHeight) * 100
}

function getSnaps() {
  const maxH = Math.round(getMaxMapVh())
  return [...BASE_SNAPS.filter(s => s < maxH - 8), maxH]
}

function DragHandle({ mapHeightVh, onMapHeightChange, onResizeStart, onResizeEnd }) {
  const ref = useRef(null)
  const drag = useRef(null)

  function onPointerDown(e) {
    e.preventDefault()
    ref.current.setPointerCapture(e.pointerId)
    drag.current = { startY: e.clientY, startH: mapHeightVh, maxH: getMaxMapVh() }
    onResizeStart?.()
  }

  function onPointerMove(e) {
    if (!drag.current) return
    const deltaPct = ((e.clientY - drag.current.startY) / window.innerHeight) * 100
    onMapHeightChange(Math.max(5, Math.min(drag.current.maxH, drag.current.startH + deltaPct)))
  }

  function onPointerUp(e) {
    if (!drag.current) return
    const deltaPct = ((e.clientY - drag.current.startY) / window.innerHeight) * 100
    const current = Math.max(5, Math.min(drag.current.maxH, drag.current.startH + deltaPct))
    const snapped = getSnaps().reduce((p, c) => Math.abs(c - current) < Math.abs(p - current) ? c : p)
    onMapHeightChange(snapped)
    drag.current = null
    onResizeEnd?.()
  }

  function toggleExpand(e) {
    e.stopPropagation()
    const maxH = Math.round(getMaxMapVh())
    onMapHeightChange(mapHeightVh < maxH - 8 ? maxH : 22)
  }

  const isFullMap = mapHeightVh >= Math.round(getMaxMapVh()) - 8

  return (
    <div ref={ref} className="panel-drag-handle"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <div className="drag-pill" />
      <button className="drag-expand-btn" onClick={toggleExpand} onPointerDown={e => e.stopPropagation()}>
        {isFullMap
          ? <><MdKeyboardArrowDown size={16} /><span>展開行程</span></>
          : <><MdKeyboardArrowUp size={16} /><span>看地圖</span></>}
      </button>
    </div>
  )
}

/* ── Constants ───────────────────────────── */
const IS_DEV = import.meta.env.DEV
const BASE = import.meta.env.BASE_URL

/* ── Lightbox ────────────────────────────── */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}><MdClose size={26} /></button>
      <img src={src} className="lightbox-img" onClick={e => e.stopPropagation()} alt="" />
    </div>,
    document.body
  )
}

/* ── Image area ──────────────────────────── */
function ImageArea({ locationId, imageUrl, onSaved, onDeleted, isEditing }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [lightbox, setLightbox] = useState(false)

  const displayUrl = preview || (imageUrl ? `${BASE.replace(/\/$/, '')}${imageUrl}` : null)

  // 非編輯模式且無圖片 → 隱藏
  if (!isEditing && !displayUrl) return null
  // 編輯模式但非 dev 環境且無圖片 → 隱藏上傳按鈕
  if (isEditing && !IS_DEV && !displayUrl) return null

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

  return (
    <div className="img-area">
      <input ref={inputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])} />

      {displayUrl ? (
        <>
          <div
            className="img-preview"
            onClick={isEditing && IS_DEV ? () => inputRef.current.click() : () => setLightbox(true)}
            style={isEditing && !IS_DEV ? { cursor: 'default' } : {}}
          >
            <img src={displayUrl} alt="location" />
            {uploading && <div className="img-uploading">上傳中…</div>}
            {/* 編輯模式：顯示換圖 / 刪除 */}
            {isEditing && IS_DEV && (
              <div className="img-overlay">
                <FaCamera size={13} color="white" />
                <button className="img-delete-btn" onClick={handleDelete} title="刪除圖片">
                  <FaTrash size={10} color="white" />
                </button>
              </div>
            )}
            {/* 瀏覽模式：顯示放大提示 */}
            {!isEditing && (
              <div className="img-overlay">
                <MdZoomIn size={22} color="white" />
              </div>
            )}
          </div>
          {lightbox && <Lightbox src={displayUrl} onClose={() => setLightbox(false)} />}
        </>
      ) : isEditing && IS_DEV ? (
        <button className="img-upload-btn" onClick={() => inputRef.current.click()} title="點擊上傳圖片">
          {uploading ? <span className="img-uploading-dot" /> : <MdAddPhotoAlternate size={22} color="#a0aec0" />}
          <span>新增照片</span>
        </button>
      ) : null}
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

  // 從 localStorage 載入已儲存的編輯內容
  const [editData, setEditData] = useState(() => {
    try {
      const s = localStorage.getItem(`jt_edit_${loc.id}`)
      return s ? JSON.parse(s) : null
    } catch { return null }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(null)

  // 顯示時優先用編輯後的資料，否則用原始資料
  const display = editData ? { ...loc, ...editData } : loc

  useEffect(() => {
    if (isActive && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [isActive])

  function startEdit(e) {
    e.stopPropagation()
    setDraft({ time: display.time ?? '', name: display.name ?? '', note: display.note ?? '' })
    setIsEditing(true)
  }

  function saveEdit(e) {
    e.stopPropagation()
    const merged = { ...(editData || {}), ...draft }
    setEditData(merged)
    try { localStorage.setItem(`jt_edit_${loc.id}`, JSON.stringify(merged)) } catch {}
    setIsEditing(false)
  }

  function cancelEdit(e) {
    e.stopPropagation()
    setIsEditing(false)
    setDraft(null)
  }

  return (
    <div ref={ref}
      className={`timeline-item${isActive ? ' active' : ''}${selState ? ` sel-${selState}` : ''}`}
      onClick={() => !isEditing && onSelect(index)}
    >
      <SelButton selState={selState} hasCoords={!!loc.coords} onClick={() => onToggleSel(loc, index)} />

      <div className="tl-left">
        <div className={`tl-dot dot-${loc.type}`}>
          {IconComponent ? <IconComponent size={14} color="white" /> : <FaMapMarkerAlt size={14} color="white" />}
        </div>
        <div className="tl-line" />
      </div>

      <div className={`tl-card${isEditing ? ' tl-card--editing' : ''}`}>
        {isEditing ? (
          /* ── 編輯模式 ── */
          <div className="tl-card-body">
            <input
              className="edit-input edit-input--time"
              value={draft.time}
              onChange={e => setDraft(d => ({ ...d, time: e.target.value }))}
              placeholder="時間（如 11:00 - 12:00）"
              onClick={e => e.stopPropagation()}
            />
            <input
              className="edit-input edit-input--name"
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="地點名稱"
              onClick={e => e.stopPropagation()}
            />
            <textarea
              className="edit-textarea"
              value={draft.note}
              onChange={e => setDraft(d => ({ ...d, note: e.target.value }))}
              placeholder="備註說明（可留空）"
              rows={3}
              onClick={e => e.stopPropagation()}
            />
            <div className="edit-actions">
              <button className="edit-save-btn" onClick={saveEdit}>
                <MdCheck size={14} />儲存
              </button>
              <button className="edit-cancel-btn" onClick={cancelEdit}>
                <MdClose size={14} />取消
              </button>
            </div>
          </div>
        ) : (
          /* ── 瀏覽模式 ── */
          <div className="tl-card-body">
            <div className="tl-time">{display.time}</div>
            <div className="tl-name">{display.name}</div>
            {display.note && <div className="tl-note">{display.note}</div>}
            {loc.mapLink && (
              <div className="tl-actions">
                <a href={loc.mapLink} target="_blank" rel="noreferrer"
                  className="map-btn" onClick={e => e.stopPropagation()}>
                  <FaMapMarkerAlt size={11} /> Google 地圖
                </a>
              </div>
            )}
          </div>
        )}

        <ImageArea
          locationId={loc.id}
          imageUrl={imageUrl}
          onSaved={onImageSaved}
          onDeleted={onImageDeleted}
          isEditing={isEditing}
        />

        {/* 編輯按鈕（瀏覽模式才顯示） */}
        {!isEditing && (
          <button className="tl-edit-btn" onClick={startEdit} title="編輯">
            <MdEdit size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Panel ───────────────────────────────── */
export default function ItineraryPanel({
  day, dayIndex, activeIndex, onLocationSelect,
  imageMap, onImageSaved, onImageDeleted,
  selA, selB, onToggleSelection, onClearSelection,
  mapHeightVh, onMapHeightChange, onResizeStart, onResizeEnd,
}) {
  const DayIcon = DAY_ICONS[dayIndex]

  function getSelState(locId) {
    if (selA?.id === locId) return 'a'
    if (selB?.id === locId) return 'b'
    return null
  }

  return (
    <aside className="itinerary-panel">
      <DragHandle
        mapHeightVh={mapHeightVh}
        onMapHeightChange={onMapHeightChange}
        onResizeStart={onResizeStart}
        onResizeEnd={onResizeEnd}
      />
      <div className="panel-head">
        <div className="panel-day-title">
          {DayIcon && <DayIcon size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
          {day.date}（{day.title}）
        </div>
        <div className="panel-day-sub">
          {day.placeholder ? '行程即將加入' : `共 ${day.locations.length} 個地點`}
        </div>
      </div>

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
