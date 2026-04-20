import { useState, useEffect } from 'react'
import { MdClose, MdDirectionsWalk, MdStraighten } from 'react-icons/md'

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function fmtMinutes(secs) {
  const m = Math.round(secs / 60)
  if (m < 60) return `${m} 分鐘`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem ? `${h} 小時 ${rem} 分` : `${h} 小時`
}

export default function RouteInfoCard({ selA, selB, onClear }) {
  const [osrm, setOsrm] = useState(null)
  const [loading, setLoading] = useState(false)

  const straightKm = selA && selB
    ? haversineKm(selA.coords, selB.coords).toFixed(1)
    : null

  useEffect(() => {
    if (!selA?.coords || !selB?.coords) { setOsrm(null); return }

    setLoading(true)
    setOsrm(null)

    const [lat1, lon1] = selA.coords
    const [lat2, lon2] = selB.coords
    const url = `https://router.project-osrm.org/route/v1/foot/${lon1},${lat1};${lon2},${lat2}?overview=false`

    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.routes?.[0]) {
          setOsrm({
            distance: (d.routes[0].distance / 1000).toFixed(1),
            duration: d.routes[0].duration,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selA?.id, selB?.id])

  if (!selA && !selB) return null

  return (
    <div className={`route-card${selA && selB ? ' route-card--full' : ''}`}>
      <div className="route-card-row">
        <span className="sel-badge sel-a">A</span>
        <span className="route-name">{selA ? selA.name : '選擇起點'}</span>
        <span className="route-arrow">→</span>
        <span className="sel-badge sel-b">B</span>
        <span className="route-name">{selB ? selB.name : '選擇終點'}</span>
        <button className="route-clear-btn" onClick={onClear} title="清除選取">
          <MdClose size={15} />
        </button>
      </div>

      {selA && selB && (
        <div className="route-stats">
          <span className="route-stat">
            <MdStraighten size={13} />
            直線 {straightKm} km
          </span>
          {loading && <span className="route-stat route-loading">計算路程中…</span>}
          {osrm && (
            <>
              <span className="route-stat">
                <MdStraighten size={13} />
                路程 {osrm.distance} km
              </span>
              <span className="route-stat">
                <MdDirectionsWalk size={13} />
                步行 {fmtMinutes(osrm.duration)}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
