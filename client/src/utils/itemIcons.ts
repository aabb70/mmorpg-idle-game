// 物品圖標映射系統
interface IconMapping {
  [key: string]: string
}

// 基於物品類型的圖標映射
const typeIconMapping: IconMapping = {
  // 採礦相關
  'MATERIAL_MINING': 'stone-pile',
  'ORE': 'ore',
  'METAL': 'metal-bar',
  'GEM': 'gem',
  'COAL': 'coal',
  'STONE': 'stone-pile',
  
  // 伐木相關
  'MATERIAL_LOGGING': 'wood-pile',
  'WOOD': 'wood-pile',
  'LOG': 'log',
  'PLANK': 'wood-beam',
  
  // 釣魚相關
  'MATERIAL_FISHING': 'fish',
  'FISH': 'fish',
  'SEAFOOD': 'shrimp',
  'WATER_PLANT': 'seaweed',
  
  // 採集相關
  'MATERIAL_FORAGING': 'berries-bowl',
  'HERB': 'berry',
  'FRUIT': 'cherry',
  'FLOWER': 'flower',
  'MUSHROOM': 'mushrooms',
  'SEED': 'acorn',
  
  // 工藝品
  'CRAFTED': 'gear',
  'TOOL': 'hammer',
  'WEAPON': 'sword',
  'ARMOR': 'chest-armor',
  'ACCESSORY': 'ring',
  
  // 食物
  'FOOD': 'meal',
  'DRINK': 'bottle-vapors',
  'POTION': 'round-potion',
  'INGREDIENT': 'powder',
  
  // 其他
  'CURRENCY': 'coins',
  'BOOK': 'book-cover',
  'SCROLL': 'scroll-unfurled',
  'KEY': 'key',
  'MISC': 'package'
}

// 基於物品名稱的特殊映射（優先級更高）
const nameIconMapping: IconMapping = {
  // 採礦
  '銅礦': 'ore',
  '鐵礦': 'metal-bar',
  '金礦': 'gold-bar',
  '鑽石': 'gem',
  '煤炭': 'coal',
  '石頭': 'stone-pile',
  
  // 伐木
  '橡木': 'oak',
  '松木': 'pine-tree',
  '竹子': 'bamboo',
  '木板': 'wood-beam',
  
  // 釣魚
  '鯉魚': 'fish',
  '鮭魚': 'fish-escape',
  '螃蟹': 'crab',
  '蝦子': 'shrimp',
  '海藻': 'seaweed',
  
  // 採集
  '蘋果': 'cherry',
  '莓果': 'berries-bowl',
  '藥草': 'berry',
  '花朵': 'flower',
  '蘑菇': 'mushroom',
  '種子': 'acorn',
  
  // 製作物品
  '鐵劍': 'sword',
  '鐵盾': 'shield',
  '皮甲': 'leather-armor',
  '戒指': 'ring',
  '項鍊': 'necklace',
  
  // 食物
  '麵包': 'bread-slice',
  '燉菜': 'meal',
  '藥水': 'round-potion',
  '紅酒': 'wine-bottle',
  
  // 其他
  '金幣': 'coins',
  '寶石': 'gem',
  '魔法書': 'spell-book',
  '卷軸': 'scroll-unfurled'
}

// 獲取物品圖標名稱
export const getItemIcon = (itemName: string, itemType?: string, category?: string): string => {
  // 1. 優先檢查名稱映射
  if (nameIconMapping[itemName]) {
    return nameIconMapping[itemName]
  }
  
  // 2. 檢查類型映射
  if (itemType && typeIconMapping[itemType]) {
    return typeIconMapping[itemType]
  }
  
  // 3. 檢查類別映射
  if (category && typeIconMapping[category]) {
    return typeIconMapping[category]
  }
  
  // 4. 根據名稱關鍵字推測
  const name = itemName.toLowerCase()
  
  if (name.includes('礦') || name.includes('石')) return 'ore'
  if (name.includes('木') || name.includes('竹')) return 'wood-pile'
  if (name.includes('魚') || name.includes('蟹') || name.includes('蝦')) return 'fish'
  if (name.includes('草') || name.includes('花') || name.includes('果')) return 'berry'
  if (name.includes('劍') || name.includes('刀')) return 'sword'
  if (name.includes('盾') || name.includes('甲')) return 'shield'
  if (name.includes('戒') || name.includes('鍊')) return 'ring'
  if (name.includes('藥') || name.includes('水')) return 'round-potion'
  if (name.includes('書') || name.includes('卷')) return 'book-cover'
  if (name.includes('金') || name.includes('幣')) return 'coins'
  
  // 5. 預設圖標
  return 'package'
}

// 稀有度色彩濾鏡
export const getRarityFilter = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common':
    case '普通':
      return 'brightness(0.8) sepia(0) saturate(0.8)'
    
    case 'uncommon':
    case '精良':
      return 'brightness(1) sepia(0.2) saturate(1.2) hue-rotate(90deg)'
    
    case 'rare':
    case '稀有':
      return 'brightness(1.1) sepia(0.3) saturate(1.5) hue-rotate(200deg)'
    
    case 'epic':
    case '史詩':
      return 'brightness(1.2) sepia(0.4) saturate(1.8) hue-rotate(270deg)'
    
    case 'legendary':
    case '傳奇':
      return 'brightness(1.3) sepia(0.8) saturate(2) hue-rotate(45deg) drop-shadow(0 0 8px #FFD700)'
    
    default:
      return 'brightness(1)'
  }
}

// Game-icons.net URL 生成器
export const getGameIconUrl = (iconName: string, size: '1x1' | '2x1' | '3x1' = '1x1'): string => {
  return `https://game-icons.net/icons/ffffff/000000/${size}/${iconName}.svg`
}