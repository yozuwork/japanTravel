import { useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { TYPE_EMOJIS, TYPE_COLORS } from '../data/itinerary'

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createPinIcon(type, index, isActive) {
  const color = TYPE_COLORS[type] || '#666'
  const emoji = TYPE_EMOJIS[type] || '📍'
  const size = isActive ? 42 : 34
  return L.divIcon({
    className: '',
    html: `<div class="map-pin${isActive ? ' active-pin' : ''}" style="background:${color};width:${size}px;height:${size}px">
      <span>${emoji}</span>
      <span class="map-pin__badge">${index + 1}</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 6],
  })
}

function buildRouteSegments(locations) {
  const segments = []
  let current = []
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i]
    if (!loc.coords) continue
    if (i > 0) {
      const prev = locations[i - 1]
      if (prev.country !== loc.country) {
        if (current.length >= 2) segments.push(current)
        current = [loc.coords]
        continue
      }
    }
    current.push(loc.coords)
  }
  if (current.length >= 2) segments.push(current)
  return segments
}

function MapController({ day, activeIndex, onFitRef }) {
  const map = useMap()

  // Fit to JP locations when day changes
  useEffect(() => {
    const jpCoords = day.locations
      .filter(l => l.country === 'jp' && l.coords)
      .map(l => l.coords)

    if (jpCoords.length > 0) {
      const bounds = L.latLngBounds(jpCoords)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true })
    } else if (day.defaultCenter) {
      map.setView(day.defaultCenter, day.defaultZoom ?? 12)
    }
  }, [day.id])

  // Fly to active location
  useEffect(() => {
    if (activeIndex === null || activeIndex === undefined) return
    const loc = day.locations[activeIndex]
    if (loc?.coords) {
      map.flyTo(loc.coords, Math.max(map.getZoom(), 16), { duration: 0.7 })
    }
  }, [activeIndex])

  // Expose fitBounds via ref
  onFitRef.current = () => {
    const jpCoords = day.locations
      .filter(l => l.country === 'jp' && l.coords)
      .map(l => l.coords)
    if (jpCoords.length > 0) {
      map.fitBounds(L.latLngBounds(jpCoords), { padding: [40, 40], maxZoom: 15 })
    }
  }

  return null
}

export default function MapView({ day, activeIndex, onLocationSelect }) {
  const fitRef = useRef(() => {})

  const routeSegments = buildRouteSegments(day.locations)

  return (
    <div className="map-wrapper">
      <MapContainer
        center={day.defaultCenter ?? [35.6762, 139.6503]}
        zoom={day.defaultZoom ?? 12}
        style={{ width: '100%', height: '100%' }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <MapController day={day} activeIndex={activeIndex} onFitRef={fitRef} />

        {routeSegments.map((seg, i) => (
          <Polyline
            key={i}
            positions={seg}
            pathOptions={{ color: '#c0392b', weight: 2.5, opacity: 0.55, dashArray: '7 10' }}
          />
        ))}

        {day.locations.map((loc, i) => {
          if (!loc.coords) return null
          return (
            <Marker
              key={loc.id}
              position={loc.coords}
              icon={createPinIcon(loc.type, i, i === activeIndex)}
              eventHandlers={{ click: () => onLocationSelect(i) }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 700, marginBottom: 3 }}>{loc.name}</div>
                  <div style={{ color: '#c0392b', fontSize: 12 }}>{loc.time}</div>
                  {loc.note && (
                    <div style={{ fontSize: 12, color: '#555', marginTop: 4, lineHeight: 1.5 }}>
                      {loc.note}
                    </div>
                  )}
                  {loc.mapLink && (
                    <a
                      href={loc.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#2980b9' }}
                    >
                      開啟 Google 地圖 →
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <button className="fit-btn" onClick={() => fitRef.current()} title="顯示全部地點">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </button>
    </div>
  )
}
