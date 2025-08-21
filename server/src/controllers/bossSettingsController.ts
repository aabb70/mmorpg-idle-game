import { Request, Response } from 'express'
import { PrismaClient, BossSelectionMode } from '@prisma/client'

const prisma = new PrismaClient()

// 獲取Boss設置
export const getBossSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.bossSettings.findFirst()
    
    // 如果沒有設置，創建預設設置
    if (!settings) {
      settings = await prisma.bossSettings.create({
        data: {
          autoSwitchEnabled: true,
          autoSwitchDelayHours: 1,
          defaultDurationHours: 24,
          bossSelectionMode: BossSelectionMode.RANDOM
        }
      })
    }

    res.json({
      success: true,
      settings
    })
  } catch (error: any) {
    console.error('獲取Boss設置失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 更新Boss設置
export const updateBossSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      autoSwitchEnabled,
      autoSwitchDelayHours,
      defaultDurationHours,
      bossSelectionMode
    } = req.body

    // 驗證輸入
    if (autoSwitchDelayHours !== undefined && (autoSwitchDelayHours < 0 || autoSwitchDelayHours > 168)) {
      res.status(400).json({ success: false, error: '自動切換延遲時間必須在0-168小時之間' })
      return
    }

    if (defaultDurationHours !== undefined && (defaultDurationHours < 1 || defaultDurationHours > 168)) {
      res.status(400).json({ success: false, error: '預設持續時間必須在1-168小時之間' })
      return
    }

    // 獲取現有設置或創建新設置
    let settings = await prisma.bossSettings.findFirst()
    
    if (settings) {
      // 更新現有設置
      settings = await prisma.bossSettings.update({
        where: { id: settings.id },
        data: {
          autoSwitchEnabled: autoSwitchEnabled !== undefined ? autoSwitchEnabled : settings.autoSwitchEnabled,
          autoSwitchDelayHours: autoSwitchDelayHours !== undefined ? autoSwitchDelayHours : settings.autoSwitchDelayHours,
          defaultDurationHours: defaultDurationHours !== undefined ? defaultDurationHours : settings.defaultDurationHours,
          bossSelectionMode: bossSelectionMode || settings.bossSelectionMode
        }
      })
    } else {
      // 創建新設置
      settings = await prisma.bossSettings.create({
        data: {
          autoSwitchEnabled: autoSwitchEnabled !== undefined ? autoSwitchEnabled : true,
          autoSwitchDelayHours: autoSwitchDelayHours !== undefined ? autoSwitchDelayHours : 1,
          defaultDurationHours: defaultDurationHours !== undefined ? defaultDurationHours : 24,
          bossSelectionMode: bossSelectionMode || BossSelectionMode.RANDOM
        }
      })
    }

    res.json({
      success: true,
      settings,
      message: 'Boss設置更新成功'
    })
  } catch (error: any) {
    console.error('更新Boss設置失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 手動切換到下一個Boss
export const switchToNextBoss = async (req: Request, res: Response): Promise<void> => {
  try {
    const { forceBossId, durationHours } = req.body

    // 檢查是否有活躍的Boss
    const activeBoss = await prisma.bossInstance.findFirst({
      where: {
        isActive: true,
        endTime: { gte: new Date() }
      }
    })

    if (activeBoss && !activeBoss.isDefeated) {
      res.status(400).json({ 
        success: false, 
        error: '當前有未被擊敗的活躍Boss，無法手動切換' 
      })
      return
    }

    // 停用當前Boss實例
    if (activeBoss) {
      await prisma.bossInstance.update({
        where: { id: activeBoss.id },
        data: { isActive: false }
      })
    }

    // 獲取Boss設置
    const settings = await prisma.bossSettings.findFirst()
    const duration = durationHours || settings?.defaultDurationHours || 24

    let nextBoss
    if (forceBossId) {
      // 手動指定Boss
      nextBoss = await prisma.boss.findUnique({
        where: { id: forceBossId }
      })
      
      if (!nextBoss) {
        res.status(404).json({ success: false, error: '指定的Boss不存在' })
        return
      }
    } else {
      // 根據設置選擇下一個Boss
      nextBoss = await selectNextBoss(settings?.bossSelectionMode || BossSelectionMode.RANDOM)
      
      if (!nextBoss) {
        res.status(404).json({ success: false, error: '沒有可用的Boss' })
        return
      }
    }

    // 創建新的Boss實例
    const endTime = new Date(Date.now() + duration * 60 * 60 * 1000)
    
    const newBossInstance = await prisma.bossInstance.create({
      data: {
        bossId: nextBoss.id,
        currentHealth: nextBoss.maxHealth,
        endTime
      },
      include: {
        boss: true
      }
    })

    res.json({
      success: true,
      bossInstance: newBossInstance,
      message: `成功切換到Boss: ${nextBoss.name}`
    })
  } catch (error: any) {
    console.error('手動切換Boss失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 選擇下一個Boss的邏輯
async function selectNextBoss(selectionMode: BossSelectionMode) {
  const bosses = await prisma.boss.findMany()
  
  if (bosses.length === 0) return null

  switch (selectionMode) {
    case BossSelectionMode.RANDOM:
      return bosses[Math.floor(Math.random() * bosses.length)]
      
    case BossSelectionMode.SEQUENTIAL:
      // 按等級順序選擇，找到當前最低等級未被擊敗的Boss
      const sortedBosses = bosses.sort((a, b) => a.level - b.level)
      return sortedBosses[0]
      
    case BossSelectionMode.WEIGHTED:
      // 按稀有度權重選擇，稀有度越低權重越高
      const weights = {
        'COMMON': 50,
        'UNCOMMON': 30,
        'RARE': 15,
        'EPIC': 4,
        'LEGENDARY': 1
      }
      
      const weightedBosses = bosses.flatMap(boss => 
        Array(weights[boss.rarity as keyof typeof weights] || 1).fill(boss)
      )
      
      return weightedBosses[Math.floor(Math.random() * weightedBosses.length)]
      
    default:
      return bosses[Math.floor(Math.random() * bosses.length)]
  }
}

// 自動切換Boss的定時任務函數
export const checkAndSwitchBoss = async (): Promise<void> => {
  try {
    const settings = await prisma.bossSettings.findFirst()
    
    if (!settings || !settings.autoSwitchEnabled) {
      return // 自動切換未啟用
    }

    // 查找已被擊敗且需要切換的Boss
    const defeatedBoss = await prisma.bossInstance.findFirst({
      where: {
        isActive: true,
        isDefeated: true,
        defeatedAt: {
          lte: new Date(Date.now() - settings.autoSwitchDelayHours * 60 * 60 * 1000)
        }
      },
      include: {
        boss: true
      }
    })

    if (!defeatedBoss) {
      return // 沒有需要切換的Boss
    }

    console.log(`🔄 自動切換Boss: ${defeatedBoss.boss.name} 已被擊敗超過 ${settings.autoSwitchDelayHours} 小時`)

    // 停用當前Boss實例
    await prisma.bossInstance.update({
      where: { id: defeatedBoss.id },
      data: { isActive: false }
    })

    // 選擇下一個Boss
    const nextBoss = await selectNextBoss(settings.bossSelectionMode)
    
    if (!nextBoss) {
      console.warn('⚠️ 沒有可用的Boss進行自動切換')
      return
    }

    // 創建新的Boss實例
    const endTime = new Date(Date.now() + settings.defaultDurationHours * 60 * 60 * 1000)
    
    const newBossInstance = await prisma.bossInstance.create({
      data: {
        bossId: nextBoss.id,
        currentHealth: nextBoss.maxHealth,
        endTime
      }
    })

    console.log(`✅ 自動切換成功: 新Boss ${nextBoss.name} 已啟動，持續時間 ${settings.defaultDurationHours} 小時`)
  } catch (error) {
    console.error('❌ 自動切換Boss失敗:', error)
  }
}