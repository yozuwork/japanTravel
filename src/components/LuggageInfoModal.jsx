import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MdClose } from 'react-icons/md'

export default function LuggageInfoModal({ onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-dialog" onClick={e => e.stopPropagation()}>
        <div className="lm-header">
          <div className="lm-header-title">
            <span className="lm-header-icon">🧳</span>
            <div>
              <div className="lm-title">京成上野站 人工行李寄物服務</div>
              <div className="lm-subtitle">Keisei Ueno Station Luggage Storage</div>
            </div>
          </div>
          <button className="lm-close" onClick={onClose}><MdClose size={20} /></button>
        </div>

        <div className="lm-body">

          {/* 位置 */}
          <div className="lm-section">
            <div className="lm-section-title">📍 位置資訊</div>
            <div className="lm-row">
              <span className="lm-label">地點</span>
              <span className="lm-value">京成上野站內「正面口」下來即可看到</span>
            </div>
            <div className="lm-row">
              <span className="lm-label">周邊</span>
              <span className="lm-value">服務處對面是松本清藥妝店；旁有電梯及通往地鐵銀座線、日比谷線的樓梯</span>
            </div>
          </div>

          {/* 營業時間 */}
          <div className="lm-section">
            <div className="lm-section-title">🕒 營業時間與服務</div>
            <div className="lm-row">
              <span className="lm-label">營業時間</span>
              <span className="lm-value lm-highlight">09:00 – 18:00</span>
            </div>
            <div className="lm-row">
              <span className="lm-label">語言服務</span>
              <span className="lm-value">中文・英文・日文</span>
            </div>
            <div className="lm-row">
              <span className="lm-label">可寄行李</span>
              <span className="lm-value">一般行李箱、胖胖箱、超大行李（28 吋以上）、滑雪板、高爾夫球具等</span>
            </div>
            <div className="lm-row">
              <span className="lm-label">寄放天數</span>
              <span className="lm-value">最長可達 11 天</span>
            </div>
          </div>

          {/* 費用 */}
          <div className="lm-section">
            <div className="lm-section-title">💰 寄放費用（日圓 / 天）</div>
            <div className="lm-table">
              <div className="lm-table-head">
                <span>行李類型</span>
                <span>單日費用</span>
                <span>備註</span>
              </div>
              <div className="lm-table-row">
                <span>小件行李</span>
                <span className="lm-price">¥500</span>
                <span>手提包、登機箱</span>
              </div>
              <div className="lm-table-row">
                <span>行李箱</span>
                <span className="lm-price">¥800</span>
                <span>24 吋以上行李箱</span>
              </div>
              <div className="lm-table-row">
                <span>超大件行李</span>
                <span className="lm-price">¥1,200</span>
                <span>滑雪用具、高爾夫球具等</span>
              </div>
              <div className="lm-table-row lm-table-row--accent">
                <span>加購優惠</span>
                <span className="lm-price">+¥200</span>
                <span>寄放一個行李箱，可加購一件小行李</span>
              </div>
            </div>
            <div className="lm-multi-day">
              <div className="lm-multi-title">多日寄放優惠（行李箱）</div>
              <div className="lm-multi-grid">
                {[
                  ['2 天', '¥1,300'],
                  ['3 天', '¥2,000'],
                  ['4 天', '¥2,700'],
                  ['11 天', '¥7,600'],
                ].map(([d, p]) => (
                  <div key={d} className="lm-multi-item">
                    <span className="lm-multi-days">{d}</span>
                    <span className="lm-multi-price">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="lm-section lm-section--warn">
            <div className="lm-section-title">⚠️ 注意事項</div>
            <ul className="lm-list">
              <li>貴重物品、護照、身分證件、危險物品、刀槍等<strong>不可寄放</strong></li>
              <li>人工寄物不需找自動置物櫃空位，對大型或特殊尺寸行李非常友善</li>
              <li>寄放後步行 3–8 分鐘即可抵達阿美橫丁、上野恩賜公園或上野動物園</li>
            </ul>
          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}
