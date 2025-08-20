import React from 'react'
import { Box } from '@mui/material'
import { getRarityFilter } from '../utils/itemIcons'

// 本地 SVG 圖標組件 - 重新設計更好看的圖標
const LocalSVGIcons: { [key: string]: React.ComponentType<{ size: number; color?: string }> } = {
  // 基本包裹圖標
  package: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 8L12 4L20 8V18L12 22L4 18V8Z" fill={color} opacity="0.8"/>
      <path d="M4 8L12 12L20 8" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M12 12V22" stroke={color} strokeWidth="2"/>
      <path d="M8 6L12 8L16 6" stroke="white" strokeWidth="1" opacity="0.6"/>
    </svg>
  ),
  
  // 劍類圖標 - 更精美的設計
  sword: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 劍身 */}
      <path d="M12 2L12 16" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      {/* 護手 */}
      <path d="M8 14L16 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* 劍柄 */}
      <path d="M12 16L12 20" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      {/* 劍尖 */}
      <path d="M12 2L10 4L14 4L12 2Z" fill={color}/>
      {/* 劍柄底部 */}
      <circle cx="12" cy="21" r="1" fill={color}/>
    </svg>
  ),

  // 魚類圖標 - 更可愛的魚
  fish: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 魚身 */}
      <ellipse cx="12" cy="12" rx="7" ry="4" fill={color} opacity="0.9"/>
      {/* 魚尾 */}
      <path d="M5 12L2 8L2 16L5 12Z" fill={color}/>
      {/* 背鰭 */}
      <path d="M12 8C14 6 16 7 18 8" stroke={color} strokeWidth="2" fill="none"/>
      {/* 腹鰭 */}
      <path d="M12 16C14 18 16 17 18 16" stroke={color} strokeWidth="2" fill="none"/>
      {/* 魚眼 */}
      <circle cx="15" cy="10" r="1.5" fill="white"/>
      <circle cx="15" cy="10" r="0.8" fill="#333"/>
    </svg>
  ),

  // 木材圖標 - 原木橫截面
  'wood-pile': ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 原木 */}
      <circle cx="12" cy="12" r="9" fill="#8B4513" stroke={color} strokeWidth="1"/>
      {/* 年輪 */}
      <circle cx="12" cy="12" r="7" fill="none" stroke={color} strokeWidth="1" opacity="0.6"/>
      <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="1" opacity="0.4"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.3"/>
      {/* 裂紋 */}
      <path d="M12 3L12 8M12 16L12 21M3 12L8 12M16 12L21 12" stroke={color} strokeWidth="1" opacity="0.5"/>
    </svg>
  ),

  // 礦石圖標 - 水晶結構
  ore: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 主要水晶 */}
      <path d="M12 3L8 8L12 18L16 8L12 3Z" fill={color} opacity="0.8"/>
      {/* 左側水晶 */}
      <path d="M6 10L4 12L6 16L10 14L6 10Z" fill={color} opacity="0.6"/>
      {/* 右側水晶 */}
      <path d="M18 10L20 12L18 16L14 14L18 10Z" fill={color} opacity="0.6"/>
      {/* 高光效果 */}
      <path d="M12 3L10 6L12 10L14 6L12 3Z" fill="white" opacity="0.4"/>
      {/* 底部陰影 */}
      <ellipse cx="12" cy="20" rx="8" ry="2" fill="black" opacity="0.2"/>
    </svg>
  ),

  // 食物圖標 - 麵包
  'bread-slice': ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 麵包外殼 */}
      <path d="M6 10C6 8 8 6 12 6C16 6 18 8 18 10V16C18 18 16 20 12 20C8 20 6 18 6 16V10Z" fill="#D2691E"/>
      {/* 麵包內部 */}
      <path d="M7 11C7 9.5 9 8.5 12 8.5C15 8.5 17 9.5 17 11V15C17 16.5 15 17.5 12 17.5C9 17.5 7 16.5 7 15V11Z" fill="#F5DEB3"/>
      {/* 表面紋路 */}
      <path d="M8 12H16M8 14H16" stroke="#D2691E" strokeWidth="0.5" opacity="0.6"/>
      {/* 邊緣高光 */}
      <path d="M8 10C8 9 9.5 8 12 8C14.5 8 16 9 16 10" stroke="white" strokeWidth="1" opacity="0.8"/>
    </svg>
  ),

  // 藥水圖標 - 魔法藥瓶
  'round-potion': ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 瓶塞 */}
      <rect x="10" y="2" width="4" height="3" rx="1" fill="#8B4513"/>
      {/* 瓶頸 */}
      <rect x="11" y="5" width="2" height="3" fill={color}/>
      {/* 瓶身 */}
      <path d="M8 8H16L17 19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19L8 8Z" fill={color}/>
      {/* 藥水液體 */}
      <path d="M8.5 10H15.5L16.2 18C16.2 18.8 15.6 19.5 14.8 19.5H9.2C8.4 19.5 7.8 18.8 7.8 18L8.5 10Z" fill="#00CED1" opacity="0.8"/>
      {/* 氣泡效果 */}
      <circle cx="10" cy="14" r="0.8" fill="white" opacity="0.6"/>
      <circle cx="13" cy="12" r="0.5" fill="white" opacity="0.4"/>
      <circle cx="14" cy="16" r="0.6" fill="white" opacity="0.5"/>
    </svg>
  ),

  // 盾牌圖標 - 騎士盾
  shield: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 盾牌主體 */}
      <path d="M12 2L4 6V12C4 17 8 21 12 21C16 21 20 17 20 12V6L12 2Z" fill={color}/>
      {/* 盾牌裝飾 */}
      <path d="M12 4L6 7V12C6 15.5 9 18.5 12 18.5C15 18.5 18 15.5 18 12V7L12 4Z" fill="none" stroke="white" strokeWidth="1" opacity="0.8"/>
      {/* 十字圖案 */}
      <path d="M12 8V14M9 11H15" stroke="white" strokeWidth="2" opacity="0.9"/>
    </svg>
  ),

  // 錘子圖標 - 戰錘
  hammer: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 錘柄 */}
      <rect x="11" y="8" width="2" height="14" rx="1" fill="#8B4513"/>
      {/* 錘頭 */}
      <rect x="6" y="4" width="12" height="6" rx="2" fill={color}/>
      {/* 錘頭細節 */}
      <rect x="7" y="5" width="10" height="4" rx="1" fill="white" opacity="0.3"/>
      {/* 握柄纏繞 */}
      <path d="M11.5 12L12.5 12M11.5 14L12.5 14M11.5 16L12.5 16M11.5 18L12.5 18" stroke="#654321" strokeWidth="0.5"/>
    </svg>
  ),

  // 金幣圖標 - 金色錢幣
  coins: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 後面的金幣 */}
      <circle cx="14" cy="14" r="6" fill="#FFD700" stroke="#FFA000" strokeWidth="1"/>
      {/* 前面的金幣 */}
      <circle cx="10" cy="10" r="7" fill="#FFD700" stroke="#FFA000" strokeWidth="2"/>
      {/* 前金幣內圈 */}
      <circle cx="10" cy="10" r="5" fill="none" stroke="#FFA000" strokeWidth="1"/>
      {/* 金幣符號 */}
      <text x="10" y="14" textAnchor="middle" fontSize="8" fill="#B8860B" fontWeight="bold">$</text>
      {/* 光澤效果 */}
      <path d="M6 7C6 7 8 5 10 5C12 5 14 7 14 7" stroke="white" strokeWidth="1" opacity="0.7"/>
    </svg>
  ),

  // 寶石圖標 - 多面切割鑽石
  gem: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 寶石主體 */}
      <path d="M7 9L12 3L17 9L15 20H9L7 9Z" fill={color} opacity="0.9"/>
      {/* 寶石頂面 */}
      <path d="M7 9L12 6L17 9L12 12L7 9Z" fill="white" opacity="0.6"/>
      {/* 寶石切面 */}
      <path d="M12 6L15 9L12 12L9 9L12 6Z" fill="white" opacity="0.8"/>
      {/* 寶石底部切面 */}
      <path d="M9 20L12 16L15 20" fill="white" opacity="0.3"/>
      {/* 光芒效果 */}
      <path d="M12 1L12 5M8 3L9 5M16 3L15 5" stroke="white" strokeWidth="1" opacity="0.8"/>
    </svg>
  )
}

interface LocalItemIconProps {
  itemName: string
  itemType?: string
  category?: string
  rarity?: string
  size?: number
  showRarityGlow?: boolean
}

// 獲取本地圖標名稱的簡化版本 - 更精確的匹配
const getLocalIconName = (itemName: string, itemType?: string): string => {
  const name = itemName.toLowerCase()

  // 武器類 - 優先匹配
  if (name.includes('劍') || name.includes('刀') || name.includes('劍')) return 'sword'
  if (name.includes('錘') || name.includes('鎚')) return 'hammer'
  
  // 魚類 - 詳細匹配
  if (name.includes('魚') || name.includes('鯉') || name.includes('鮭') || 
      name.includes('鯊') || name.includes('章魚') || name.includes('魷魚')) return 'fish'
  if (name.includes('蟹') || name.includes('蝦') || name.includes('龍蝦')) return 'fish'
  
  // 木材類
  if (name.includes('木') || name.includes('竹') || name.includes('樹')) return 'wood-pile'
  
  // 礦物類 - 更詳細
  if (name.includes('礦石') || name.includes('原石')) return 'ore'
  if (name.includes('錠') || name.includes('金屬')) return 'ore'  
  if (name.includes('石') || name.includes('岩') || name.includes('煤')) return 'ore'
  if (name.includes('水晶') || name.includes('寶石') || name.includes('鑽石')) return 'gem'
  
  // 食物類 - 更廣泛
  if (name.includes('麵包') || name.includes('包子') || name.includes('餅') || 
      name.includes('肉') || name.includes('魚排') || name.includes('湯') ||
      name.includes('飯') || name.includes('麵') || name.includes('食物')) return 'bread-slice'
  
  // 藥水類
  if (name.includes('藥水') || name.includes('藥劑') || name.includes('治療') ||
      name.includes('魔力') || name.includes('力量') || name.includes('藥')) return 'round-potion'
  
  // 防具類
  if (name.includes('盾') || name.includes('甲') || name.includes('鎧') ||
      name.includes('頭盔') || name.includes('護') || name.includes('防具')) return 'shield'
  
  // 工具類
  if (name.includes('鎬') || name.includes('斧') || name.includes('鋸') ||
      name.includes('鐮') || name.includes('釣竿') || name.includes('工具')) return 'hammer'
  
  // 金錢類
  if (name.includes('金幣') || name.includes('銀幣') || name.includes('錢') || 
      name.includes('幣') || name.includes('貨幣')) return 'coins'
  
  // 材料類
  if (name.includes('布') || name.includes('絲') || name.includes('線') ||
      name.includes('皮革') || name.includes('材料')) return 'ore'

  // 根據 itemType 判斷
  if (itemType) {
    const type = itemType.toLowerCase()
    if (type.includes('weapon') || type.includes('武器')) return 'sword'
    if (type.includes('food') || type.includes('食物')) return 'bread-slice'
    if (type.includes('tool') || type.includes('工具')) return 'hammer'
    if (type.includes('armor') || type.includes('防具')) return 'shield'
    if (type.includes('material') || type.includes('材料')) return 'ore'
    if (type.includes('potion') || type.includes('藥水')) return 'round-potion'
    if (type.includes('fish') || type.includes('魚')) return 'fish'
    if (type.includes('wood') || type.includes('木')) return 'wood-pile'
    if (type.includes('mining') || type.includes('礦')) return 'ore'
    if (type.includes('gem') || type.includes('寶石')) return 'gem'
    if (type.includes('currency') || type.includes('錢')) return 'coins'
  }
  
  return 'package' // 預設
}

const LocalItemIcon: React.FC<LocalItemIconProps> = ({
  itemName,
  itemType,
  category,
  rarity = 'COMMON',
  size = 24,
  showRarityGlow = true
}) => {
  const iconName = getLocalIconName(itemName, itemType)
  const IconComponent = LocalSVGIcons[iconName]
  const filter = getRarityFilter(rarity)
  
  const isLegendary = rarity.toLowerCase().includes('legendary') || rarity === '傳奇'
  const isEpic = rarity.toLowerCase().includes('epic') || rarity === '史詩'

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    display: 'inline-block',
    filter: showRarityGlow ? filter : 'none'
  }

  if (showRarityGlow) {
    if (isLegendary) {
      containerStyle.animation = 'legendary-glow 2s ease-in-out infinite alternate'
    } else if (isEpic) {
      containerStyle.animation = 'epic-glow 2.5s ease-in-out infinite alternate'
    }
  }

  return (
    <Box sx={containerStyle}>
      <IconComponent size={size} color="#ffffff" />
      
      {/* 稀有度邊框效果 */}
      {showRarityGlow && (isLegendary || isEpic) && (
        <Box
          sx={{
            position: 'absolute',
            top: -1,
            left: -1,
            right: -1,
            bottom: -1,
            border: isLegendary ? '2px solid #FFD700' : '1px solid #9C27B0',
            borderRadius: '6px',
            pointerEvents: 'none',
            opacity: 0.6,
            ...(isLegendary && {
              boxShadow: '0 0 10px #FFD700, inset 0 0 5px rgba(255, 215, 0, 0.3)',
            }),
            ...(isEpic && {
              boxShadow: '0 0 8px #9C27B0, inset 0 0 4px rgba(156, 39, 176, 0.3)',
            })
          }}
        />
      )}
    </Box>
  )
}

export default LocalItemIcon