import {
  FaUtensils,
  FaBed,
  FaCamera,
  FaTrain,
  FaShoppingBag,
  FaPlane,
  FaGamepad,
  FaLeaf,
  FaWater,
  FaBuilding,
  FaHome,
} from 'react-icons/fa'

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
  FaPlane,      // Day 1 出發日
  FaGamepad,    // Day 2 秋葉原
  FaLeaf,       // Day 3 吉卜力・吉祥寺・下北澤
  FaWater,      // Day 4 江之島・熱海
  FaBuilding,   // Day 5 台場・澀谷・池袋
  FaHome,       // Day 6 上野・自由活動・回國
]
