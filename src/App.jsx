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
  const [selA, setSelA] = useState(null) // { id, name, coords, index }
  const [selB, setSelB] = useState(null)

  const day = ITINERARY[currentDay]

  useEffect(() => {
    fetch(`${BASE}images/manifest.json?t=${Date.now()}`)
      .then(r => r.json())
      .then(setImageMap)
      .catch(() => {})
  }, [])

  function handleDayChange(i) {
    setCurrentDay(i)
    setActiveIndex(null)
  }

  function handleLocationSelect(i) {
    setActiveIndex(prev => (prev === i ? null : i))
  }

  function handleToggleSelection(loc, index) {
    if (!loc.coords) return
    const item = { id: loc.id, name: loc.name, coords: loc.coords, index }

    if (selA?.id === loc.id) {
      // Deselect A → promote B to A
      setSelA(selB)
      setSelB(null)
    } else if (selB?.id === loc.id) {
      // Deselect B
      setSelB(null)
    } else if (!selA) {
      setSelA(item)
    } else if (!selB) {
      setSelB(item)
    } else {
      // Both full → restart with this item as A
      setSelA(item)
      setSelB(null)
    }
  }

  function clearSelection() {
    setSelA(null)
    setSelB(null)
  }

  function handleImageSaved(locationId, url) {
    setImageMap(prev => ({ ...prev, [locationId]: url }))
  }

  function handleImageDeleted(locationId) {
    setImageMap(prev => { const n = { ...prev }; delete n[locationId]; return n })
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
          selA={selA}
          selB={selB}
        />
        <ItineraryPanel
          day={day}
          dayIndex={currentDay}
          activeIndex={activeIndex}
          onLocationSelect={handleLocationSelect}
          imageMap={imageMap}
          onImageSaved={handleImageSaved}
          onImageDeleted={handleImageDeleted}
          selA={selA}
          selB={selB}
          onToggleSelection={handleToggleSelection}
          onClearSelection={clearSelection}
        />
      </main>

      <div className={`offline-toast${isOffline ? ' show' : ''}`}>
        📵 離線模式 — 顯示已快取的地圖
      </div>
    </>
  )
}
