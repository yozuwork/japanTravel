import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import MapView from './components/MapView'
import ItineraryPanel from './components/ItineraryPanel'
import TransportMapPage from './components/TransportMapPage'
import { ITINERARY } from './data/itinerary'
import { TRANSPORT_ROUTES } from './data/transportRoutes'

const BASE = import.meta.env.BASE_URL
const SNAP_DEFAULT = 22
const SNAP_EXPANDED = 45

export default function App() {
  const [currentDay, setCurrentDay] = useState(0)
  const [activeIndex, setActiveIndex] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [imageMap, setImageMap] = useState({})
  const [selA, setSelA] = useState(null)
  const [selB, setSelB] = useState(null)
  const [mapHeightVh, setMapHeightVh] = useState(SNAP_DEFAULT)
  const [isResizing, setIsResizing] = useState(false)
  const [transportDayId, setTransportDayId] = useState(null)
  const prevHasSel = useRef(false)

  const day = ITINERARY[currentDay]
  const hasSel = activeIndex !== null || !!selA || !!selB

  // 選了地標或 A/B 時，若地圖還很小則自動展開
  useEffect(() => {
    if (hasSel && !prevHasSel.current) {
      setMapHeightVh(prev => prev < 35 ? SNAP_EXPANDED : prev)
    }
    prevHasSel.current = hasSel
  }, [hasSel])

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
      setSelA(selB)
      setSelB(null)
    } else if (selB?.id === loc.id) {
      setSelB(null)
    } else if (!selA) {
      setSelA(item)
    } else if (!selB) {
      setSelB(item)
    } else {
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

  if (transportDayId !== null && TRANSPORT_ROUTES[transportDayId]) {
    return (
      <TransportMapPage
        route={TRANSPORT_ROUTES[transportDayId]}
        onBack={() => setTransportDayId(null)}
      />
    )
  }

  return (
    <>
      <Header currentDay={currentDay} onDayChange={handleDayChange} />

      <main className={`app-main${isResizing ? ' resizing' : ''}`}>
        <MapView
          day={day}
          activeIndex={activeIndex}
          onLocationSelect={handleLocationSelect}
          selA={selA}
          selB={selB}
          mapHeightVh={mapHeightVh}
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
          mapHeightVh={mapHeightVh}
          onMapHeightChange={setMapHeightVh}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={() => setIsResizing(false)}
          onOpenTransport={id => setTransportDayId(id)}
        />
      </main>

      <div className={`offline-toast${isOffline ? ' show' : ''}`}>
        📵 離線模式 — 顯示已快取的地圖
      </div>
    </>
  )
}
