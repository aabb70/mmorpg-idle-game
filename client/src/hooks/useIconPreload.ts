import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { getItemIcon, getGameIconUrl } from '../utils/itemIcons'

// 預載入背包物品圖標
export const useInventoryIconPreload = () => {
  const { items } = useSelector((state: RootState) => state.inventory)

  useEffect(() => {
    const preloadIcons = async () => {
      const iconPromises = items.map(item => {
        const iconName = getItemIcon(item.name, item.itemType, item.category)
        const iconUrl = getGameIconUrl(iconName)
        
        return new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve() // 即使失敗也繼續
          img.src = iconUrl
        })
      })

      await Promise.all(iconPromises)
    }

    if (items.length > 0) {
      preloadIcons()
    }
  }, [items])
}

// 預載入技能相關圖標
export const useSkillIconPreload = () => {
  useEffect(() => {
    // 常用的技能物品圖標
    const commonSkillIcons = [
      'ore', 'metal-bar', 'gold-bar', 'gem', 'coal', 'stone-pile',
      'wood-pile', 'oak', 'pine-tree', 'bamboo', 'wood-beam',
      'fish', 'fish-escape', 'crab', 'shrimp', 'seaweed',
      'cherry', 'berries-bowl', 'berry', 'flower', 'mushroom', 'acorn',
      'sword', 'shield', 'leather-armor', 'ring', 'necklace',
      'bread-slice', 'meal', 'round-potion', 'wine-bottle',
      'coins', 'spell-book', 'scroll-unfurled', 'package'
    ]

    const preloadPromises = commonSkillIcons.map(iconName => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = getGameIconUrl(iconName)
      })
    })

    Promise.all(preloadPromises).then(() => {
      console.log('技能圖標預載入完成')
    })
  }, [])
}

// 批量預載入指定圖標
export const preloadIconsByNames = (itemNames: string[], itemTypes?: string[]) => {
  const iconPromises = itemNames.map((name, index) => {
    const iconName = getItemIcon(name, itemTypes?.[index])
    const iconUrl = getGameIconUrl(iconName)
    
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = iconUrl
    })
  })

  return Promise.all(iconPromises)
}