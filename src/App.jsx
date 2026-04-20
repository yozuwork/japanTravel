import { useState, useEffect } from 'react'
import Header from './components/Header'
import MapView from './components/MapView'
import ItineraryPanel from './components/ItineraryPanel'
import { ITINERARY } from './data/itinerary'

export default function App() {
  const [currentDay, setCurrentDay] = useState(0)
  const [activeIndex, setActiveIndex] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const day = ITINERARY[currentDay]

  function handleDayChange(i) {
    setCurrentDay(i)
    setActiveIndex(null)
  }

  function handleLocationSelect(i) {
    setActiveIndex(prev => (prev === i ? null : i))
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
          activeIndex={activeIndex}
          onLocationSelect={handleLocationSelect}
        />
      </main>

      <div className={`offline-toast${isOffline ? ' show' : ''}`}>
        📵 離線模式 — 顯示已快取的地圖
      </div>
    </>
  )
}
