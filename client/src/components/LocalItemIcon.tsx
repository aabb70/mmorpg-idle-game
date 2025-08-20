import React from 'react'
import { Box } from '@mui/material'
import { getRarityFilter } from '../utils/itemIcons'

// 本地 SVG 圖標組件
const LocalSVGIcons: { [key: string]: React.ComponentType<{ size: number; color?: string }> } = {
  // 基本圖標
  package: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M12 12L22 7" stroke={color} strokeWidth="2"/>
      <path d="M12 12V22" stroke={color} strokeWidth="2"/>
      <path d="M12 12L2 7" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  
  // 武器圖標
  sword: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14.5 2L20 7.5L13 14.5L12 13.5L18.5 7L14.5 3L11 6.5L12 7.5L5.5 14L2 17.5L6.5 22L10 18.5L16.5 12L17.5 13L20.5 10L14.5 2Z" fill={color}/>
    </svg>
  ),

  // 魚類圖標
  fish: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6.5 12C6.5 12 4 10 2 12C4 14 6.5 12 6.5 12ZM21 12C19 10 17 12 17 12C17 12 19 14 21 12ZM17 12C17 12 14 8 12 8C10 8 7 12 7 12C7 12 10 16 12 16C14 16 17 12 17 12Z" fill={color}/>
      <circle cx="14" cy="10.5" r="1" fill="currentColor"/>
    </svg>
  ),

  // 木材圖標
  'wood-pile': ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="3" rx="1.5" fill={color}/>
      <rect x="3" y="9" width="18" height="3" rx="1.5" fill={color}/>
      <rect x="3" y="13" width="18" height="3" rx="1.5" fill={color}/>
      <rect x="3" y="17" width="18" height="3" rx="1.5" fill={color}/>
    </svg>
  ),

  // 礦石圖標
  ore: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" fill={color} opacity="0.8"/>
      <path d="M8 9L10 7L12 9L16 7L18 9L16 11L14 13L12 15L10 13L8 11L8 9Z" fill="currentColor"/>
    </svg>
  ),

  // 食物圖標
  'bread-slice': ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 8C4 6 6 4 12 4C18 4 20 6 20 8V18C20 19 19 20 12 20C5 20 4 19 4 18V8Z" fill={color}/>
      <path d="M5 10H19M5 13H19M5 16H19" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),

  // 藥水圖標
  'round-potion': ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 3V5H15V3H9Z" fill={color}/>
      <path d="M8 5H16L18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7L8 5Z" fill={color}/>
      <circle cx="12" cy="13" r="2" fill="currentColor" opacity="0.7"/>
      <circle cx="9" cy="11" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="15" cy="15" r="1" fill="currentColor" opacity="0.5"/>
    </svg>
  ),

  // 防具圖標
  shield: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6V12C4 16.55 7.84 20.74 9 21C10.16 20.74 20 16.55 20 12V6L12 2Z" fill={color}/>
      <path d="M12 6L8 10V14L12 18L16 14V10L12 6Z" fill="currentColor" opacity="0.7"/>
    </svg>
  ),

  // 工具圖標
  hammer: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 20L4 18L7 21L5 23L2 20Z" fill={color}/>
      <path d="M8.5 16.5L15.5 9.5L14 8L7 15L8.5 16.5Z" fill={color}/>
      <path d="M16 8L19 5L20 6L17 9L16 8Z" fill={color}/>
      <rect x="14" y="6" width="4" height="2" rx="1" transform="rotate(45 16 7)" fill={color}/>
    </svg>
  ),

  // 金幣圖標
  coins: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="12" r="7" fill="#FFD700" stroke={color} strokeWidth="1"/>
      <circle cx="15" cy="8" r="6" fill="#FFA000" stroke={color} strokeWidth="1"/>
      <text x="9" y="15" textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">$</text>
      <text x="15" y="11" textAnchor="middle" fontSize="7" fill={color} fontWeight="bold">$</text>
    </svg>
  ),

  // 寶石圖標
  gem: ({ size, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 9L12 3L18 9L15 21H9L6 9Z" fill={color}/>
      <path d="M8 9L12 6L16 9L14 18H10L8 9Z" fill="currentColor" opacity="0.7"/>
      <path d="M12 6L14 8L12 10L10 8L12 6Z" fill="white" opacity="0.9"/>
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

// 獲取本地圖標名稱的簡化版本
const getLocalIconName = (itemName: string, itemType?: string): string => {
  const name = itemName.toLowerCase()

  // 武器類
  if (name.includes('劍') || name.includes('刀')) return 'sword'
  
  // 魚類
  if (name.includes('魚') || name.includes('蟹') || name.includes('蝦')) return 'fish'
  
  // 木材類
  if (name.includes('木') || name.includes('竹')) return 'wood-pile'
  
  // 礦物類
  if (name.includes('礦') || name.includes('石') || name.includes('錠')) return 'ore'
  
  // 食物類
  if (name.includes('麵包') || name.includes('包子') || name.includes('餅')) return 'bread-slice'
  
  // 藥水類
  if (name.includes('藥水') || name.includes('藥劑')) return 'round-potion'
  
  // 防具類
  if (name.includes('盾') || name.includes('甲')) return 'shield'
  
  // 工具類
  if (name.includes('錘') || name.includes('斧') || name.includes('鎬')) return 'hammer'
  
  // 金錢類
  if (name.includes('金幣') || name.includes('錢') || name.includes('幣')) return 'coins'
  
  // 寶石類
  if (name.includes('寶石') || name.includes('鑽石') || name.includes('水晶')) return 'gem'

  // 根據 itemType 判斷
  if (itemType) {
    if (itemType.includes('WEAPON')) return 'sword'
    if (itemType.includes('FOOD')) return 'bread-slice'
    if (itemType.includes('TOOL')) return 'hammer'
    if (itemType.includes('ARMOR')) return 'shield'
    if (itemType.includes('MATERIAL')) return 'ore'
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