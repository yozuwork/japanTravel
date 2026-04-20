import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { MdZoomOutMap } from 'react-icons/md'
import { TYPE_COLORS } from '../data/itinerary'
import { TYPE_ICONS } from '../data/icons'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createPinIcon(type, index, isActive, selState) {
  const color = TYPE_COLORS[type] || '#666'
  const IconComponent = TYPE_ICONS[type]
  const size = isActive || selState ? 42 : 34
  const iconSize = size > 34 ? 17 : 14

  const svgHtml = IconComponent
    ? renderToStaticMarkup(<IconComponent size={iconSize} color="white" />)
    : ''

  const selBadge = selState
    ? `<span class="map-pin__sel map-pin__sel--${selState}">${selState.toUpperCase()}</span>`
    : ''

  return L.divIcon({
    className: '',
    html: `<div class="map-pin${isActive ? ' active-pin' : ''}${selState ? ` pin-sel-${selState}` : ''}" style="background:${color};width:${size}px;height:${size}px">
      ${svgHtml}
      <span class="map-pin__badge">${index + 1}</span>
      ${selBadge}
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
    if (i > 0 && locations[i - 1].country !== loc.country) {
      if (current.length >= 2) segments.push(current)
      current = [loc.coords]
      continue
    }
    current.push(loc.coords)
  }
  if (current.length >= 2) segments.push(current)
  return segments
}

function MapController({ day, activeIndex, onFitRef }) {
  const map = useMap()

  useEffect(() => {
    const jpCoords = day.locations.filter(l => l.country === 'jp' && l.coords).map(l => l.coords)
    if (jpCoords.length > 0) {
      map.fitBounds(L.latLngBounds(jpCoords), { padding: [40, 40], maxZoom: 15, animate: true })
    } else if (day.defaultCenter) {
      map.setView(day.defaultCenter, day.defaultZoom ?? 12)
    }
  }, [day.id])

  useEffect(() => {
    if (activeIndex == null) return
    const loc = day.locations[activeIndex]
    if (loc?.coords) map.flyTo(loc.coords, Math.max(map.getZoom(), 16), { duration: 0.7 })
  }, [activeIndex])

  onFitRef.current = () => {
    const jpCoords = day.locations.filter(l => l.country === 'jp' && l.coords).map(l => l.coords)
    if (jpCoords.length > 0)
      map.fitBounds(L.latLngBounds(jpCoords), { padding: [40, 40], maxZoom: 15 })
  }

  return null
}

export default function MapView({ day, activeIndex, onLocationSelect, selA, selB }) {
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

        {/* A→B selection route line */}
        {selA?.coords && selB?.coords && (
          <Polyline
            positions={[selA.coords, selB.coords]}
            pathOptions={{ color: '#3182ce', weight: 4, opacity: 0.85 }}
          />
        )}

        {day.locations.map((loc, i) => {
          if (!loc.coords) return null
          const selState = selA?.id === loc.id ? 'a' : selB?.id === loc.id ? 'b' : null
          return (
            <Marker
              key={loc.id}
              position={loc.coords}
              icon={createPinIcon(loc.type, i, i === activeIndex, selState)}
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
                    <a href={loc.mapLink} target="_blank" rel="noreferrer"
                      style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#2980b9' }}>
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
        <MdZoomOutMap size={20} />
      </button>
    </div>
  )
}
