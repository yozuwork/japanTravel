import {
  FaUtensils,
  FaBed,
  FaCamera,
  FaTrain,
  FaShoppingBag,
  FaPlane,
  FaGamepad,
  FaLeaf,
  FaAnchor,
  FaCalendarAlt,
  FaHome,
} from 'react-icons/fa'

// Timeline dot & map marker icons, keyed by location type
export const TYPE_ICONS = {
  food: FaUtensils,
  hotel: FaBed,
  sightseeing: FaCamera,
  transit: FaTrain,
  shopping: FaShoppingBag,
  flight: FaPlane,
}

// Day tab icons, ordered by day index
export const DAY_ICONS = [
  FaPlane,        // Day 1 出發日
  FaGamepad,      // Day 2 秋葉原
  FaLeaf,         // Day 3 吉卜力
  FaAnchor,       // Day 4 鎌倉
  FaCalendarAlt,  // Day 5 待定
  FaHome,         // Day 6 回程
]
