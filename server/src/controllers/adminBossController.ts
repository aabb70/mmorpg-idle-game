import { Request, Response } from 'express'
import { PrismaClient, SkillType, Rarity } from '@prisma/client'

const prisma = new PrismaClient()

// 獲取所有 Boss 模板
export const getAllBosses = async (req: Request, res: Response): Promise<void> => {
  try {
    const bosses = await prisma.boss.findMany({
      include: {
        itemDrops: {
          include: {
            item: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    })

    res.json({
      success: true,
      bosses
    })
  } catch (error: any) {
    console.error('獲取 Boss 列表失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 創建新 Boss
export const createBoss = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      maxHealth,
      attack,
      defense,
      level,
      weaknessSkills,
      goldReward,
      expReward,
      imageUrl,
      rarity
    } = req.body

    // 檢查 Boss 名稱是否已存在
    const existingBoss = await prisma.boss.findFirst({
      where: { name }
    })

    if (existingBoss) {
      res.status(400).json({ success: false, error: 'Boss 名稱已存在' })
      return
    }

    // 創建 Boss
    const boss = await prisma.boss.create({
      data: {
        name,
        description,
        maxHealth: maxHealth || 100000,
        attack: attack || 100,
        defense: defense || 50,
        level: level || 1,
        weaknessSkills: weaknessSkills || [],
        goldReward: goldReward || 1000,
        expReward: expReward || 500,
        imageUrl: imageUrl || null,
        rarity: rarity || 'COMMON'
      }
    })

    res.json({
      success: true,
      boss
    })
  } catch (error: any) {
    console.error('創建 Boss 失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 更新 Boss
export const updateBoss = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      maxHealth,
      attack,
      defense,
      level,
      weaknessSkills,
      goldReward,
      expReward,
      imageUrl,
      rarity
    } = req.body

    // 檢查 Boss 是否存在
    const existingBoss = await prisma.boss.findUnique({
      where: { id }
    })

    if (!existingBoss) {
      res.status(404).json({ success: false, error: 'Boss 不存在' })
      return
    }

    // 如果修改名稱，檢查是否與其他 Boss 重複
    if (name !== existingBoss.name) {
      const duplicateBoss = await prisma.boss.findFirst({
        where: { name }
      })

      if (duplicateBoss) {
        res.status(400).json({ success: false, error: 'Boss 名稱已存在' })
        return
      }
    }

    // 更新 Boss
    const updatedBoss = await prisma.boss.update({
      where: { id },
      data: {
        name,
        description,
        maxHealth,
        attack,
        defense,
        level,
        weaknessSkills,
        goldReward,
        expReward,
        imageUrl,
        rarity
      }
    })

    res.json({
      success: true,
      boss: updatedBoss
    })
  } catch (error: any) {
    console.error('更新 Boss 失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 刪除 Boss
export const deleteBoss = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 檢查 Boss 是否存在
    const existingBoss = await prisma.boss.findUnique({
      where: { id }
    })

    if (!existingBoss) {
      res.status(404).json({ success: false, error: 'Boss 不存在' })
      return
    }

    // 檢查是否有活躍的實例
    const activeInstances = await prisma.bossInstance.count({
      where: { 
        bossId: id,
        isActive: true
      }
    })

    if (activeInstances > 0) {
      res.status(400).json({ 
        success: false, 
        error: `無法刪除 Boss：有 ${activeInstances} 個活躍的實例` 
      })
      return
    }

    // 刪除 Boss（會自動刪除相關實例和動作記錄）
    await prisma.boss.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Boss 已刪除'
    })
  } catch (error: any) {
    console.error('刪除 Boss 失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 創建 Boss 實例（手動觸發新 Boss）
export const createBossInstance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bossId, duration = 24 } = req.body

    // 檢查是否有活躍的 Boss
    const activeBoss = await prisma.bossInstance.findFirst({
      where: {
        isActive: true,
        endTime: { gte: new Date() }
      }
    })

    if (activeBoss) {
      res.status(400).json({ 
        success: false, 
        error: '當前已有活躍的 Boss 實例' 
      })
      return
    }

    // 獲取 Boss 模板
    const boss = await prisma.boss.findUnique({
      where: { id: bossId }
    })

    if (!boss) {
      res.status(404).json({ success: false, error: 'Boss 模板不存在' })
      return
    }

    // 創建新實例
    const endTime = new Date(Date.now() + duration * 60 * 60 * 1000) // duration 小時後

    const bossInstance = await prisma.bossInstance.create({
      data: {
        bossId,
        currentHealth: boss.maxHealth,
        endTime
      },
      include: {
        boss: true
      }
    })

    res.json({
      success: true,
      bossInstance
    })
  } catch (error: any) {
    console.error('創建 Boss 實例失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 初始化預設 Boss
export const initDefaultBosses = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🎯 開始初始化預設 Boss...')

    const defaultBosses = [
      {
        name: '森林守衛',
        description: '保護森林的強大守衛者，對伐木技能較弱',
        maxHealth: 50000,
        attack: 80,
        defense: 30,
        level: 1,
        weaknessSkills: [SkillType.LOGGING],
        goldReward: 500,
        expReward: 250,
        rarity: Rarity.COMMON
      },
      {
        name: '礦坑霸主',
        description: '深居礦坑的巨大生物，懼怕採礦工具',
        maxHealth: 75000,
        attack: 120,
        defense: 50,
        level: 5,
        weaknessSkills: [SkillType.MINING],
        goldReward: 800,
        expReward: 400,
        rarity: Rarity.UNCOMMON
      },
      {
        name: '深海海怪',
        description: '海洋深處的恐怖存在，釣魚高手能更有效對付它',
        maxHealth: 100000,
        attack: 150,
        defense: 70,
        level: 10,
        weaknessSkills: [SkillType.FISHING],
        goldReward: 1200,
        expReward: 600,
        rarity: Rarity.RARE
      },
      {
        name: '煉金術師之影',
        description: '被邪惡煉金術腐蝕的靈魂，對煉金和鍛造技能敏感',
        maxHealth: 150000,
        attack: 200,
        defense: 100,
        level: 15,
        weaknessSkills: [SkillType.ALCHEMY, SkillType.SMITHING],
        goldReward: 2000,
        expReward: 1000,
        rarity: Rarity.EPIC
      },
      {
        name: '全能魔王',
        description: '傳說中的終極Boss，所有技能都能對其造成傷害',
        maxHealth: 300000,
        attack: 300,
        defense: 150,
        level: 25,
        weaknessSkills: [SkillType.MINING, SkillType.LOGGING, SkillType.FISHING, SkillType.FORAGING, SkillType.SMITHING, SkillType.TAILORING, SkillType.COOKING, SkillType.ALCHEMY, SkillType.CRAFTING],
        goldReward: 5000,
        expReward: 2500,
        rarity: Rarity.LEGENDARY
      }
    ]

    // 清除現有的 Boss（如果需要）
    const existingBossCount = await prisma.boss.count()
    if (existingBossCount > 0) {
      console.log(`發現 ${existingBossCount} 個現有 Boss，跳過初始化`)
      res.json({
        success: true,
        message: `已有 ${existingBossCount} 個 Boss，無需初始化`
      })
      return
    }

    // 創建預設 Boss
    const createdBosses = []
    for (const bossData of defaultBosses) {
      const boss = await prisma.boss.create({
        data: bossData
      })
      createdBosses.push(boss)
      console.log(`✅ 創建 Boss: ${boss.name}`)
    }

    console.log(`🎉 成功初始化 ${createdBosses.length} 個預設 Boss`)

    res.json({
      success: true,
      message: `成功初始化 ${createdBosses.length} 個預設 Boss`,
      bosses: createdBosses
    })
  } catch (error: any) {
    console.error('❌ 初始化預設 Boss 失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 添加 Boss 物品掉落
export const addBossItemDrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bossId } = req.params
    const { itemId, dropRate, minQuantity, maxQuantity, killerOnly } = req.body

    // 檢查 Boss 是否存在
    const boss = await prisma.boss.findUnique({
      where: { id: bossId }
    })

    if (!boss) {
      res.status(404).json({ success: false, error: 'Boss 不存在' })
      return
    }

    // 檢查物品是否存在
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      res.status(404).json({ success: false, error: '物品不存在' })
      return
    }

    // 檢查是否已經存在相同的掉落設置
    const existingDrop = await prisma.bossItemDrop.findUnique({
      where: {
        bossId_itemId: {
          bossId,
          itemId
        }
      }
    })

    if (existingDrop) {
      res.status(400).json({ success: false, error: '該物品掉落已存在' })
      return
    }

    // 創建掉落設置
    const itemDrop = await prisma.bossItemDrop.create({
      data: {
        bossId,
        itemId,
        dropRate: parseFloat(dropRate) || 0.1,
        minQuantity: parseInt(minQuantity) || 1,
        maxQuantity: parseInt(maxQuantity) || 1,
        killerOnly: Boolean(killerOnly)
      },
      include: {
        item: true
      }
    })

    res.json({
      success: true,
      itemDrop
    })
  } catch (error: any) {
    console.error('添加 Boss 物品掉落失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 更新 Boss 物品掉落
export const updateBossItemDrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dropId } = req.params
    const { dropRate, minQuantity, maxQuantity, killerOnly } = req.body

    // 檢查掉落設置是否存在
    const existingDrop = await prisma.bossItemDrop.findUnique({
      where: { id: dropId }
    })

    if (!existingDrop) {
      res.status(404).json({ success: false, error: '掉落設置不存在' })
      return
    }

    // 更新掉落設置
    const updatedDrop = await prisma.bossItemDrop.update({
      where: { id: dropId },
      data: {
        dropRate: parseFloat(dropRate) || existingDrop.dropRate,
        minQuantity: parseInt(minQuantity) || existingDrop.minQuantity,
        maxQuantity: parseInt(maxQuantity) || existingDrop.maxQuantity,
        killerOnly: Boolean(killerOnly)
      },
      include: {
        item: true
      }
    })

    res.json({
      success: true,
      itemDrop: updatedDrop
    })
  } catch (error: any) {
    console.error('更新 Boss 物品掉落失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 刪除 Boss 物品掉落
export const deleteBossItemDrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dropId } = req.params

    // 檢查掉落設置是否存在
    const existingDrop = await prisma.bossItemDrop.findUnique({
      where: { id: dropId }
    })

    if (!existingDrop) {
      res.status(404).json({ success: false, error: '掉落設置不存在' })
      return
    }

    // 刪除掉落設置
    await prisma.bossItemDrop.delete({
      where: { id: dropId }
    })

    res.json({
      success: true,
      message: '掉落設置已刪除'
    })
  } catch (error: any) {
    console.error('刪除 Boss 物品掉落失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}