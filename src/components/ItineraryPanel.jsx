import { useEffect, useRef } from 'react'
import { TYPE_EMOJIS } from '../data/itinerary'

function TimelineItem({ loc, index, isActive, onSelect }) {
  const ref = useRef(null)

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
          {TYPE_EMOJIS[loc.type] ?? '📍'}
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
              🗺️ Google 地圖
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ItineraryPanel({ day, activeIndex, onLocationSelect }) {
  return (
    <aside className="itinerary-panel">
      <div className="panel-head">
        <div className="panel-day-title">
          {day.emoji} {day.date}（{day.title}）
        </div>
        <div className="panel-day-sub">
          {day.placeholder
            ? '行程即將加入'
            : `共 ${day.locations.length} 個地點`}
        </div>
      </div>

      {day.placeholder ? (
        <div className="placeholder-msg">
          <span className="ph-icon">{day.emoji}</span>
          <p>
            {day.date} {day.title}
            <br />行程規劃中，敬請期待！
          </p>
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
