import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { MdArrowBack, MdClose, MdChevronLeft, MdChevronRight, MdTrain, MdPlace, MdOpenInNew, MdMap } from 'react-icons/md'
import { FaStar } from 'react-icons/fa'

function createStopIcon(role, isActive) {
  const colorMap = {
    '出發站': '#e85d04',
    '轉乘站': '#7f8c8d',
    '抵達站': '#27ae60',
    '景點站': '#c0392b',
  }
  const color = colorMap[role] || '#666'
  const size = isActive ? 40 : 30

  return L.divIcon({
    className: '',
    html: `<div class="ts-pin${isActive ? ' ts-pin--active' : ''}" style="background:${color};width:${size}px;height:${size}px">
      <svg xmlns="http://www.w3.org/2000/svg" width="${isActive ? 18 : 14}" height="${isActive ? 18 : 14}" viewBox="0 0 24 24" fill="white">
        <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm0 2c3.51 0 5.44.48 5.93 2H6.07C6.56 4.48 8.49 4 12 4zm-5 4h10v3H7V8zm-1 6c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 6],
  })
}

function MapFlyTo({ coords, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, zoom || 14, { duration: 0.8 })
  }, [coords, zoom, map])
  return null
}

function MapFitAll({ stops }) {
  const map = useMap()
  useEffect(() => {
    const points = stops.filter(s => s.coords).map(s => s.coords)
    if (points.length >= 2) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 13 })
    }
  }, [stops, map])
  return null
}

function StarRating({ rating }) {
  return (
    <span className="ts-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <FaStar
          key={i}
          size={11}
          color={i <= Math.round(rating) ? '#f6ad55' : '#e2e8f0'}
        />
      ))}
    </span>
  )
}

function StationCard({ stop, index, total, onPrev, onNext, onClose }) {
  if (!stop) return null

  const roleColors = {
    '出發站': '#e85d04',
    '轉乘站': '#718096',
    '抵達站': '#27ae60',
    '景點站': '#c0392b',
  }

  return (
    <div className="ts-card">
      <button className="ts-card-close" onClick={onClose}><MdClose size={18} /></button>

      <div className="ts-card-role" style={{ background: roleColors[stop.role] || '#666' }}>
        {stop.role}
      </div>

      <div className="ts-card-header">
        <div className="ts-card-name">{stop.name}</div>
        <div className="ts-card-namesub">{stop.nameSub}</div>
        {stop.rating && (
          <div className="ts-card-rating">
            <span className="ts-rating-num">{stop.rating}</span>
            <StarRating rating={stop.rating} />
            <span className="ts-rating-count">（{stop.ratingCount?.toLocaleString()}）</span>
            <span className="ts-station-type">· {stop.stationType}</span>
          </div>
        )}
        {!stop.rating && stop.stationType && (
          <div className="ts-card-type-only">{stop.stationType}</div>
        )}
      </div>

      <div className="ts-card-divider" />

      <div className="ts-card-section">
        <div className="ts-card-section-title">
          <MdTrain size={14} />
          <span>克勞德的筆記</span>
        </div>
        <div className="ts-card-note">{stop.note}</div>
        {stop.tip && <div className="ts-card-tip">{stop.tip}</div>}
      </div>

      {stop.website && (
        <>
          <div className="ts-card-divider" />
          <a className="ts-card-link" href={`https://${stop.website}`} target="_blank" rel="noreferrer">
            <MdOpenInNew size={13} />
            <span>{stop.website}</span>
          </a>
        </>
      )}

      <div className="ts-card-divider" />
      <a className="ts-card-link ts-card-link--map" href={stop.mapLink} target="_blank" rel="noreferrer">
        <MdMap size={13} />
        <span>Google 地圖</span>
      </a>

      <div className="ts-card-divider" />
      <div className="ts-card-nav">
        <button className="ts-nav-btn" onClick={onPrev} disabled={index === 0}>
          <MdChevronLeft size={20} />
        </button>
        <span className="ts-nav-label">{index + 1} / {total}</span>
        <button className="ts-nav-btn" onClick={onNext} disabled={index === total - 1}>
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

function RouteStepList({ stops, activeIdx, onSelect }) {
  return (
    <div className="ts-steplist">
      {stops.map((stop, i) => {
        const roleColors = {
          '出發站': '#e85d04',
          '轉乘站': '#718096',
          '抵達站': '#27ae60',
          '景點站': '#c0392b',
        }
        return (
          <div key={stop.id}>
            <button
              className={`ts-step${i === activeIdx ? ' ts-step--active' : ''}`}
              onClick={() => onSelect(i)}
            >
              <div className="ts-step-dot" style={{ background: roleColors[stop.role] || '#666' }}>
                {i + 1}
              </div>
              <div className="ts-step-info">
                <div className="ts-step-name">{stop.name}</div>
                <div className="ts-step-role">{stop.role}</div>
              </div>
              {stop.lineAfter && (
                <div className="ts-step-line-badge" style={{ background: stop.lineColor || '#718096' }}>
                  {stop.lineAfter}
                </div>
              )}
            </button>
            {stop.lineAfter && (
              <div className="ts-step-connector">
                <div className="ts-step-connector-line" style={{ background: stop.lineColor || '#718096' }} />
                <span className="ts-step-connector-label" style={{ color: stop.lineColor || '#718096' }}>
                  {stop.lineAfter}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TransportMapPage({ route, onBack }) {
  const [activeIdx, setActiveIdx] = useState(null)
  const [showCard, setShowCard] = useState(false)

  const activeStop = activeIdx !== null ? route.stops[activeIdx] : null

  function handleSelect(i) {
    setActiveIdx(i)
    setShowCard(true)
  }

  function handleCloseCard() {
    setShowCard(false)
  }

  function handlePrev() {
    if (activeIdx > 0) setActiveIdx(i => i - 1)
  }

  function handleNext() {
    if (activeIdx < route.stops.length - 1) setActiveIdx(i => i + 1)
  }

  const routePoints = route.stops.filter(s => s.coords).map(s => s.coords)

  return (
    <div className="ts-page">
      {/* Header */}
      <div className="ts-header">
        <button className="ts-back-btn" onClick={onBack}>
          <MdArrowBack size={20} />
          <span>返回行程</span>
        </button>
        <div className="ts-header-title">
          <MdPlace size={16} style={{ marginRight: 4 }} />
          {route.date}　{route.title}
        </div>
      </div>

      <div className="ts-body">
        {/* Map */}
        <div className="ts-map-wrap">
          <MapContainer
            center={route.mapCenter}
            zoom={route.mapZoom}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {activeStop
              ? <MapFlyTo coords={activeStop.coords} zoom={14} />
              : <MapFitAll stops={route.stops} />
            }

            {/* Route polyline */}
            {routePoints.length >= 2 && (
              <Polyline
                positions={routePoints}
                pathOptions={{ color: '#c0392b', weight: 3, dashArray: '8 6', opacity: 0.7 }}
              />
            )}

            {/* Markers */}
            {route.stops.map((stop, i) => stop.coords && (
              <Marker
                key={stop.id}
                position={stop.coords}
                icon={createStopIcon(stop.role, i === activeIdx)}
                eventHandlers={{ click: () => handleSelect(i) }}
              />
            ))}
          </MapContainer>

          {/* Station card overlay on map */}
          {showCard && activeStop && (
            <div className="ts-card-overlay">
              <StationCard
                stop={activeStop}
                index={activeIdx}
                total={route.stops.length}
                onPrev={handlePrev}
                onNext={handleNext}
                onClose={handleCloseCard}
              />
            </div>
          )}
        </div>

        {/* Side panel (desktop) / bottom list (mobile) */}
        <div className="ts-side">
          <div className="ts-side-title">
            <MdTrain size={15} />
            <span>交通站點</span>
            <span className="ts-side-count">{route.stops.length} 站</span>
          </div>
          <RouteStepList
            stops={route.stops}
            activeIdx={activeIdx}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  )
}
