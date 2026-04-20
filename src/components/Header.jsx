import { MdTravelExplore } from 'react-icons/md'
import { ITINERARY } from '../data/itinerary'
import { DAY_ICONS } from '../data/icons'

export default function Header({ currentDay, onDayChange }) {
  return (
    <header className="app-header">
      <div className="header-title">
        <MdTravelExplore size={22} color="white" />
        <span>日本 6日5夜 東京行程</span>
      </div>
      <nav className="day-tabs">
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
    </header>
  )
}
