import React, { useState, memo } from 'react'
import { Box, Skeleton } from '@mui/material'
import { getItemIcon, getRarityFilter, getGameIconUrl } from '../utils/itemIcons'

interface ItemIconProps {
  itemName: string
  itemType?: string
  category?: string
  rarity?: string
  size?: number
  showRarityGlow?: boolean
  className?: string
  style?: React.CSSProperties
}

const ItemIcon: React.FC<ItemIconProps> = memo(({
  itemName,
  itemType,
  category,
  rarity = 'COMMON',
  size = 24,
  showRarityGlow = true,
  className = '',
  style = {}
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const iconName = getItemIcon(itemName, itemType, category)
  const iconUrl = getGameIconUrl(iconName)
  const filter = getRarityFilter(rarity)
  
  const isLegendary = rarity.toLowerCase().includes('legendary') || rarity === '傳奇'
  const isEpic = rarity.toLowerCase().includes('epic') || rarity === '史詩'

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // 錯誤時的後備圖標
  const fallbackIcon = () => (
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.6,
        color: 'text.secondary',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      📦
    </Box>
  )

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    display: 'inline-block',
    ...style
  }

  // 稀有度發光效果
  if (showRarityGlow) {
    if (isLegendary) {
      containerStyle.filter = `${filter} drop-shadow(0 0 ${size * 0.3}px #FFD700)`
      containerStyle.animation = 'legendary-glow 2s ease-in-out infinite alternate'
    } else if (isEpic) {
      containerStyle.filter = filter
      containerStyle.animation = 'epic-glow 2.5s ease-in-out infinite alternate'
    } else {
      containerStyle.filter = filter
    }
  } else {
    containerStyle.filter = filter
  }

  return (
    <Box className={className} sx={containerStyle}>
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width={size}
          height={size}
          sx={{
            borderRadius: '4px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        />
      )}
      
      {hasError ? (
        fallbackIcon()
      ) : (
        <img
          src={iconUrl}
          alt={itemName}
          width={size}
          height={size}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            display: isLoading ? 'none' : 'block',
            borderRadius: '4px',
            transition: 'all 0.2s ease-in-out'
          }}
        />
      )}
      
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
})

ItemIcon.displayName = 'ItemIcon'

export default ItemIcon

// 預載入圖標的 Hook
export const usePreloadIcon = (iconName: string) => {
  React.useEffect(() => {
    const img = new Image()
    img.src = getGameIconUrl(iconName)
  }, [iconName])
}

// 批量預載入圖標
export const preloadIcons = (iconNames: string[]) => {
  iconNames.forEach(iconName => {
    const img = new Image()
    img.src = getGameIconUrl(iconName)
  })
}