import { useEffect, useRef } from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { TYPE_ICONS, DAY_ICONS } from '../data/icons'

function TimelineItem({ loc, index, isActive, onSelect }) {
  const ref = useRef(null)
  const IconComponent = TYPE_ICONS[loc.type]

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isActive])

  return (
    <div
      ref={ref}
      className={`timeline-item${isActive ? ' active' : ''}`}
      onClick={() => onSelect(index)}
    >
      <div className="tl-left">
        <div className={`tl-dot dot-${loc.type}`}>
          {IconComponent
            ? <IconComponent size={14} color="white" />
            : <FaMapMarkerAlt size={14} color="white" />}
        </div>
        <div className="tl-line" />
      </div>

      <div className="tl-card">
        <div className="tl-time">{loc.time}</div>
        <div className="tl-name">{loc.name}</div>
        {loc.note && <div className="tl-note">{loc.note}</div>}
        {loc.mapLink && (
          <div className="tl-actions">
            <a
              href={loc.mapLink}
              target="_blank"
              rel="noreferrer"
              className="map-btn"
              onClick={e => e.stopPropagation()}
            >
              <FaMapMarkerAlt size={11} /> Google 地圖
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ItineraryPanel({ day, activeIndex, onLocationSelect, dayIndex }) {
  const DayIcon = DAY_ICONS[dayIndex]

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

      {day.placeholder ? (
        <div className="placeholder-msg">
          <div className="ph-icon">
            {DayIcon && <DayIcon size={48} color="#cbd5e0" />}
          </div>
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
            />
          ))}
        </div>
      )}
    </aside>
  )
}
