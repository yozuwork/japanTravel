import { ITINERARY } from '../data/itinerary'

export default function Header({ currentDay, onDayChange }) {
  return (
    <header className="app-header">
      <div className="header-title">
        <span className="flag">🇯🇵</span>
        <span>日本 6日5夜 東京行程</span>
      </div>
      <nav className="day-tabs">
        {ITINERARY.map((day, i) => (
          <button
            key={day.id}
            className={`day-tab${i === currentDay ? ' active' : ''}${day.placeholder ? ' placeholder' : ''}`}
            onClick={() => onDayChange(i)}
          >
            {day.emoji} {day.date}
          </button>
        ))}
      </nav>
    </header>
  )
}
