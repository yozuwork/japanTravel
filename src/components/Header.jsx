import { useRef, useState, useEffect } from 'react'
import { MdTravelExplore, MdMuseum, MdChevronRight } from 'react-icons/md'
import { ITINERARY } from '../data/itinerary'
import { DAY_ICONS } from '../data/icons'

export default function Header({ currentDay, onDayChange, onOpenMuseum }) {
  const tabsRef = useRef(null)
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const el = tabsRef.current
    if (!el) return

    function check() {
      // 距離右端 < 8px 就隱藏提示
      setShowHint(el.scrollWidth - el.scrollLeft - el.clientWidth > 8)
    }

    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  return (
    <header className="app-header">
      <div className="header-title">
        <MdTravelExplore size={22} color="white" />
        <span>日本 6日5夜 東京行程</span>
        <button
          onClick={onOpenMuseum}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(255,255,255,.18)',
            border: '1.5px solid rgba(255,255,255,.4)',
            borderRadius: 8,
            color: 'white',
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <MdMuseum size={14} />
          美術館
        </button>
      </div>

      {/* 分頁列 + 右側滑動提示 */}
      <div className="day-tabs-wrap">
        <nav ref={tabsRef} className="day-tabs">
          {ITINERARY.map((day, i) => {
            const Icon = DAY_ICONS[i]
            return (
              <button
                key={day.id}
                className={`day-tab${i === currentDay ? ' active' : ''}${day.placeholder ? ' placeholder' : ''}`}
                onClick={() => onDayChange(i)}
              >
                {Icon && <Icon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                {day.date}
              </button>
            )
          })}
        </nav>

        {/* 右側漸層 + 箭頭提示，捲到底後隱藏 */}
        <div className={`day-tabs-hint${showHint ? '' : ' day-tabs-hint--hidden'}`}>
          <MdChevronRight size={18} color="white" />
        </div>
      </div>
    </header>
  )
}
