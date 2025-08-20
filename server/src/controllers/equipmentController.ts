import { Request, Response } from 'express'
import { prisma } from '../index.js'

// 獲取用戶裝備
export const getUserEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId

    const equipments = await prisma.userEquipment.findMany({
      where: { userId },
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
      }
    })

    res.json({ equipments })
  } catch (error) {
    console.error('獲取用戶裝備錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 穿戴裝備
export const equipItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { itemId } = req.body

    if (!itemId) {
      res.status(400).json({ message: '必須指定物品ID' })
      return
    }

    // 檢查物品是否存在且為裝備類型
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      res.status(404).json({ message: '物品不存在' })
      return
    }

    if (item.itemType !== 'EQUIPMENT' || !item.equipmentSlot) {
      res.status(400).json({ message: '該物品不是裝備或沒有設置裝備槽位' })
      return
    }

    // 檢查用戶是否擁有該物品
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    })

    if (!inventoryItem || inventoryItem.quantity < 1) {
      res.status(400).json({ message: '你沒有該物品或數量不足' })
      return
    }

    // 檢查技能裝備的技能要求
    if (item.requiredSkill) {
      const userSkill = await prisma.skill.findUnique({
        where: {
          userId_skillType: {
            userId,
            skillType: item.requiredSkill
          }
        }
      })

      if (!userSkill) {
        res.status(400).json({ message: '你沒有該技能，無法裝備此物品' })
        return
      }
    }

    await prisma.$transaction(async (tx) => {
      // 檢查該槽位是否已有裝備
      const existingEquipment = await tx.userEquipment.findUnique({
        where: {
          userId_slot: {
            userId,
            slot: item.equipmentSlot!
          }
        }
      })

      if (existingEquipment && existingEquipment.itemId) {
        // 如果已有裝備，先卸下（將裝備放回背包）
        const existingItem = await tx.inventoryItem.findUnique({
          where: {
            userId_itemId: {
              userId,
              itemId: existingEquipment.itemId
            }
          }
        })

        if (existingItem) {
          await tx.inventoryItem.update({
            where: {
              userId_itemId: {
                userId,
                itemId: existingEquipment.itemId
              }
            },
            data: {
              quantity: existingItem.quantity + 1
            }
          })
        } else {
          await tx.inventoryItem.create({
            data: {
              userId,
              itemId: existingEquipment.itemId,
              quantity: 1
            }
          })
        }
      }

      // 穿戴新裝備
      await tx.userEquipment.upsert({
        where: {
          userId_slot: {
            userId,
            slot: item.equipmentSlot!
          }
        },
        update: {
          itemId
        },
        create: {
          userId,
          slot: item.equipmentSlot!,
          itemId
        }
      })

      // 從背包移除裝備
      if (inventoryItem.quantity === 1) {
        await tx.inventoryItem.delete({
          where: {
            userId_itemId: {
              userId,
              itemId
            }
          }
        })
      } else {
        await tx.inventoryItem.update({
          where: {
            userId_itemId: {
              userId,
              itemId
            }
          },
          data: {
            quantity: inventoryItem.quantity - 1
          }
        })
      }
    })

    res.json({
      message: '裝備穿戴成功',
      item: item
    })
  } catch (error) {
    console.error('穿戴裝備錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 卸下裝備
export const unequipItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { slot } = req.body

    if (!slot) {
      res.status(400).json({ message: '必須指定裝備槽位' })
      return
    }

    const equipment = await prisma.userEquipment.findUnique({
      where: {
        userId_slot: {
          userId,
          slot
        }
      },
      include: {
        item: true
      }
    })

    if (!equipment || !equipment.itemId) {
      res.status(400).json({ message: '該槽位沒有裝備' })
      return
    }

    await prisma.$transaction(async (tx) => {
      // 將裝備放回背包
      const existingInventoryItem = await tx.inventoryItem.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId: equipment.itemId!
          }
        }
      })

      if (existingInventoryItem) {
        await tx.inventoryItem.update({
          where: {
            userId_itemId: {
              userId,
              itemId: equipment.itemId!
            }
          },
          data: {
            quantity: existingInventoryItem.quantity + 1
          }
        })
      } else {
        await tx.inventoryItem.create({
          data: {
            userId,
            itemId: equipment.itemId!,
            quantity: 1
          }
        })
      }

      // 清空裝備槽位
      await tx.userEquipment.update({
        where: {
          userId_slot: {
            userId,
            slot
          }
        },
        data: {
          itemId: null
        }
      })
    })

    res.json({
      message: '裝備卸下成功',
      item: equipment.item
    })
  } catch (error) {
    console.error('卸下裝備錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 計算用戶裝備屬性加成
export const getEquipmentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId

    const equipments = await prisma.userEquipment.findMany({
      where: { 
        userId,
        itemId: { not: null }
      },
      include: {
        item: true
      }
    })

    let totalStats = {
      attackBonus: 0,
      defenseBonus: 0,
      healthBonus: 0,
      skillBonuses: {} as Record<string, number>
    }

    equipments.forEach(equipment => {
      if (equipment.item) {
        totalStats.attackBonus += equipment.item.attackBonus
        totalStats.defenseBonus += equipment.item.defenseBonus
        totalStats.healthBonus += equipment.item.healthBonus
        
        // 處理技能等級加成
        if (equipment.item.skillLevelBonus > 0 && equipment.item.requiredSkill) {
          const skillKey = equipment.item.requiredSkill
          totalStats.skillBonuses[skillKey] = (totalStats.skillBonuses[skillKey] || 0) + equipment.item.skillLevelBonus
        }
      }
    })

    res.json({
      stats: totalStats,
      equipments: equipments.map(eq => ({
        slot: eq.slot,
        item: eq.item
      }))
    })
  } catch (error) {
    console.error('獲取裝備屬性錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 獲取可裝備的物品
export const getEquippableItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { slot } = req.query

    let whereClause: any = {
      itemType: 'EQUIPMENT',
      equipmentSlot: { not: null }
    }

    if (slot) {
      whereClause.equipmentSlot = slot
    }

    // 獲取用戶背包中的裝備
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        userId,
        quantity: { gt: 0 },
        item: whereClause
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
      }
    })

    const equippableItems = inventoryItems.map(invItem => ({
      ...invItem.item,
      quantity: invItem.quantity,
      tags: invItem.item.tags.map(t => t.tag.name)
    }))

    res.json({ items: equippableItems })
  } catch (error) {
    console.error('獲取可裝備物品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 管理員API：為所有用戶初始化裝備槽位
export const initializeUserEquipmentSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    // 獲取所有用戶
    const users = await prisma.user.findMany({
      select: { id: true }
    })

    const equipmentSlots = [
      'HEAD', 'HANDS', 'CHEST', 'LEGS', 'CLOAK',
      'MINING_TOOL', 'LOGGING_TOOL', 'FISHING_TOOL', 'FORAGING_TOOL',
      'SMITHING_TOOL', 'TAILORING_TOOL', 'COOKING_TOOL', 'ALCHEMY_TOOL', 'CRAFTING_TOOL'
    ]

    let initializedCount = 0
    let skippedCount = 0

    for (const user of users) {
      // 檢查用戶是否已經有裝備槽位
      const existingSlots = await prisma.userEquipment.findMany({
        where: { userId: user.id }
      })

      if (existingSlots.length === 0) {
        // 為用戶創建所有裝備槽位
        await prisma.userEquipment.createMany({
          data: equipmentSlots.map(slot => ({
            userId: user.id,
            slot: slot as any
          }))
        })
        initializedCount++
      } else {
        // 檢查是否有缺失的槽位
        const existingSlotNames = existingSlots.map(slot => slot.slot)
        const missingSlots = equipmentSlots.filter(slot => !existingSlotNames.includes(slot as any))
        
        if (missingSlots.length > 0) {
          await prisma.userEquipment.createMany({
            data: missingSlots.map(slot => ({
              userId: user.id,
              slot: slot as any
            }))
          })
          initializedCount++
        } else {
          skippedCount++
        }
      }
    }

    res.json({
      message: '用戶裝備槽位初始化完成',
      usersInitialized: initializedCount,
      usersSkipped: skippedCount,
      totalUsers: users.length
    })
  } catch (error) {
    console.error('初始化用戶裝備槽位錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}