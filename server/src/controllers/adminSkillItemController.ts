import { Request, Response } from 'express'
import { PrismaClient, SkillType } from '@prisma/client'

const prisma = new PrismaClient()

// 獲取所有技能物品配置
export const getAllSkillItems = async (req: Request, res: Response) => {
  try {
    const skillItems = await prisma.skillItem.findMany({
      include: {
        item: {
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          }
        }
      },
      orderBy: [
        { skillType: 'asc' },
        { minSkillLevel: 'asc' },
        { item: { name: 'asc' } }
      ]
    })

    const formattedSkillItems = skillItems.map(skillItem => ({
      id: skillItem.id,
      skillType: skillItem.skillType,
      baseSuccessRate: skillItem.baseSuccessRate,
      minSkillLevel: skillItem.minSkillLevel,
      maxSkillLevel: skillItem.maxSkillLevel,
      isEnabled: skillItem.isEnabled,
      item: {
        id: skillItem.item.id,
        name: skillItem.item.name,
        description: skillItem.item.description,
        itemType: skillItem.item.itemType,
        category: skillItem.item.category,
        rarity: skillItem.item.rarity,
        baseValue: skillItem.item.baseValue,
        tags: skillItem.item.tags.map(t => t.tag.name)
      }
    }))

    res.json({
      success: true,
      skillItems: formattedSkillItems
    })
  } catch (error: any) {
    console.error('獲取技能物品配置失敗:', error)
    res.status(500).json({
      success: false,
      message: '獲取技能物品配置失敗',
      error: error.message
    })
  }
}

// 根據技能類型獲取技能物品配置
export const getSkillItemsBySkill = async (req: Request, res: Response) => {
  try {
    const { skillType } = req.params

    const skillItems = await prisma.skillItem.findMany({
      where: {
        skillType: skillType as SkillType
      },
      include: {
        item: {
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          }
        }
      },
      orderBy: [
        { minSkillLevel: 'asc' },
        { item: { name: 'asc' } }
      ]
    })

    res.json({
      success: true,
      skillItems: skillItems.map(skillItem => ({
        id: skillItem.id,
        skillType: skillItem.skillType,
        baseSuccessRate: skillItem.baseSuccessRate,
        minSkillLevel: skillItem.minSkillLevel,
        maxSkillLevel: skillItem.maxSkillLevel,
        isEnabled: skillItem.isEnabled,
        item: {
          id: skillItem.item.id,
          name: skillItem.item.name,
          description: skillItem.item.description,
          itemType: skillItem.item.itemType,
          category: skillItem.item.category,
          rarity: skillItem.item.rarity,
          baseValue: skillItem.item.baseValue,
          tags: skillItem.item.tags.map(t => t.tag.name)
        }
      }))
    })
  } catch (error: any) {
    console.error('獲取技能物品配置失敗:', error)
    res.status(500).json({
      success: false,
      message: '獲取技能物品配置失敗',
      error: error.message
    })
  }
}

// 創建技能物品配置
export const createSkillItem = async (req: Request, res: Response) => {
  try {
    const {
      skillType,
      itemId,
      baseSuccessRate,
      minSkillLevel,
      maxSkillLevel,
      isEnabled
    } = req.body

    // 驗證必填字段
    if (!skillType || !itemId) {
      return res.status(400).json({
        success: false,
        message: '技能類型和物品ID是必填的'
      })
    }

    // 驗證成功率範圍
    if (baseSuccessRate < 0 || baseSuccessRate > 1) {
      return res.status(400).json({
        success: false,
        message: '基礎成功率必須在0到1之間'
      })
    }

    // 檢查是否已存在相同的技能物品配置
    const existingSkillItem = await prisma.skillItem.findUnique({
      where: {
        skillType_itemId: {
          skillType: skillType as SkillType,
          itemId
        }
      }
    })

    if (existingSkillItem) {
      return res.status(400).json({
        success: false,
        message: '該技能和物品的配置已存在'
      })
    }

    // 驗證物品是否存在
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '指定的物品不存在'
      })
    }

    const skillItem = await prisma.skillItem.create({
      data: {
        skillType: skillType as SkillType,
        itemId,
        baseSuccessRate: parseFloat(baseSuccessRate),
        minSkillLevel: parseInt(minSkillLevel) || 1,
        maxSkillLevel: maxSkillLevel ? parseInt(maxSkillLevel) : null,
        isEnabled: isEnabled !== false
      },
      include: {
        item: true
      }
    })

    res.status(201).json({
      success: true,
      message: '技能物品配置創建成功',
      skillItem
    })
  } catch (error: any) {
    console.error('創建技能物品配置失敗:', error)
    res.status(500).json({
      success: false,
      message: '創建技能物品配置失敗',
      error: error.message
    })
  }
}

// 更新技能物品配置
export const updateSkillItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      baseSuccessRate,
      minSkillLevel,
      maxSkillLevel,
      isEnabled
    } = req.body

    // 驗證成功率範圍
    if (baseSuccessRate !== undefined && (baseSuccessRate < 0 || baseSuccessRate > 1)) {
      return res.status(400).json({
        success: false,
        message: '基礎成功率必須在0到1之間'
      })
    }

    // 檢查技能物品配置是否存在
    const existingSkillItem = await prisma.skillItem.findUnique({
      where: { id }
    })

    if (!existingSkillItem) {
      return res.status(404).json({
        success: false,
        message: '技能物品配置不存在'
      })
    }

    const updateData: any = {}
    
    if (baseSuccessRate !== undefined) {
      updateData.baseSuccessRate = parseFloat(baseSuccessRate)
    }
    if (minSkillLevel !== undefined) {
      updateData.minSkillLevel = parseInt(minSkillLevel)
    }
    if (maxSkillLevel !== undefined) {
      updateData.maxSkillLevel = maxSkillLevel ? parseInt(maxSkillLevel) : null
    }
    if (isEnabled !== undefined) {
      updateData.isEnabled = isEnabled
    }

    const updatedSkillItem = await prisma.skillItem.update({
      where: { id },
      data: updateData,
      include: {
        item: true
      }
    })

    res.json({
      success: true,
      message: '技能物品配置更新成功',
      skillItem: updatedSkillItem
    })
  } catch (error: any) {
    console.error('更新技能物品配置失敗:', error)
    res.status(500).json({
      success: false,
      message: '更新技能物品配置失敗',
      error: error.message
    })
  }
}

// 刪除技能物品配置
export const deleteSkillItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // 檢查技能物品配置是否存在
    const existingSkillItem = await prisma.skillItem.findUnique({
      where: { id }
    })

    if (!existingSkillItem) {
      return res.status(404).json({
        success: false,
        message: '技能物品配置不存在'
      })
    }

    await prisma.skillItem.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '技能物品配置刪除成功'
    })
  } catch (error: any) {
    console.error('刪除技能物品配置失敗:', error)
    res.status(500).json({
      success: false,
      message: '刪除技能物品配置失敗',
      error: error.message
    })
  }
}

// 獲取所有技能類型
export const getSkillTypes = async (req: Request, res: Response) => {
  try {
    const skillTypes = Object.values(SkillType)
    
    const skillTypeNames = {
      MINING: '採礦',
      LOGGING: '伐木',
      FISHING: '釣魚',
      FORAGING: '採集',
      SMITHING: '鍛造',
      TAILORING: '裁縫',
      COOKING: '廚師',
      ALCHEMY: '煉金',
      CRAFTING: '工藝'
    }

    res.json({
      success: true,
      skillTypes: skillTypes.map(type => ({
        value: type,
        name: skillTypeNames[type] || type
      }))
    })
  } catch (error: any) {
    console.error('獲取技能類型失敗:', error)
    res.status(500).json({
      success: false,
      message: '獲取技能類型失敗',
      error: error.message
    })
  }
}

// 批量更新技能物品配置
export const batchUpdateSkillItems = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: '更新數據必須是數組'
      })
    }

    const results = []

    for (const update of updates) {
      const { id, baseSuccessRate, minSkillLevel, maxSkillLevel, isEnabled } = update

      try {
        const updateData: any = {}
        
        if (baseSuccessRate !== undefined) {
          updateData.baseSuccessRate = parseFloat(baseSuccessRate)
        }
        if (minSkillLevel !== undefined) {
          updateData.minSkillLevel = parseInt(minSkillLevel)
        }
        if (maxSkillLevel !== undefined) {
          updateData.maxSkillLevel = maxSkillLevel ? parseInt(maxSkillLevel) : null
        }
        if (isEnabled !== undefined) {
          updateData.isEnabled = isEnabled
        }

        const updatedSkillItem = await prisma.skillItem.update({
          where: { id },
          data: updateData,
          include: {
            item: true
          }
        })

        results.push({
          success: true,
          id,
          skillItem: updatedSkillItem
        })
      } catch (error: any) {
        results.push({
          success: false,
          id,
          error: error.message
        })
      }
    }

    res.json({
      success: true,
      message: '批量更新完成',
      results
    })
  } catch (error: any) {
    console.error('批量更新技能物品配置失敗:', error)
    res.status(500).json({
      success: false,
      message: '批量更新技能物品配置失敗',
      error: error.message
    })
  }
}