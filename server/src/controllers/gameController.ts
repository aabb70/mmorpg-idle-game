import { Request, Response } from 'express'
import { prisma } from '../index.js'

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.item.findMany({
      orderBy: [
        { itemType: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    })

    // 添加版本訊息來確認部署狀態
    res.json({ 
      items, 
      serverVersion: "v1.1-testing-100percent-drop",
      itemCount: items.length,
      deployTime: new Date().toISOString()
    })
  } catch (error) {
    console.error('獲取物品列表錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const getRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        item: true,
        ingredients: {
          include: {
            item: true
          }
        }
      },
      orderBy: [
        { skillType: 'asc' },
        { skillLevel: 'asc' }
      ]
    })

    res.json({ recipes })
  } catch (error) {
    console.error('獲取配方列表錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const trainSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { skillType } = req.body

    if (!skillType) {
      res.status(400).json({ message: '需要指定技能類型' })
      return
    }

    // 獲取用戶技能
    const skill = await prisma.skill.findUnique({
      where: {
        userId_skillType: {
          userId,
          skillType
        }
      }
    })

    if (!skill) {
      res.status(404).json({ message: '技能不存在' })
      return
    }

    // 計算經驗獲得 (基礎值 + 隨機值)
    const baseExp = 10
    const randomExp = Math.floor(Math.random() * 10)
    const expGained = baseExp + randomExp

    // 更新技能經驗
    let newExp = skill.experience + expGained
    let newLevel = skill.level
    let maxExp = 100 * Math.pow(1.2, newLevel - 1)

    // 處理升級
    while (newExp >= maxExp) {
      newExp -= maxExp
      newLevel += 1
      maxExp = 100 * Math.pow(1.2, newLevel - 1)
    }

    // 更新資料庫
    const updatedSkill = await prisma.skill.update({
      where: {
        userId_skillType: {
          userId,
          skillType
        }
      },
      data: {
        level: newLevel,
        experience: newExp
      }
    })

    // 可能獲得材料 (根據技能類型) - 使用現有資料庫中的物品
    let itemsGained: any[] = []
    if (true) { // 100% 機率獲得物品進行測試
      // 根據技能類型選擇對應的材料 - 暫時使用現有物品
      const skillMaterials: Record<string, string[]> = {
        'MINING': ['銅礦石', '鐵礦石'],
        'LOGGING': ['普通木材'],
        'FISHING': ['銅礦石', '鐵礦石'], // 暫時用礦石代替魚，直到資料庫更新
        'FORAGING': ['普通木材'], // 暫時用木材代替草藥
        'SMITHING': ['銅錘', '銅劍'],
        'TAILORING': ['普通木材'], // 暫時用木材代替布料
        'COOKING': ['普通木材'], // 暫時用木材代替食物
        'ALCHEMY': ['銅礦石'], // 暫時用礦石代替藥劑
        'CRAFTING': ['銅錘'],
      }

      const possibleMaterials = skillMaterials[skillType] || []
      
      if (possibleMaterials.length > 0) {
        const randomMaterialName = possibleMaterials[Math.floor(Math.random() * possibleMaterials.length)]
        
        const materialItem = await prisma.item.findFirst({
          where: {
            name: randomMaterialName,
            itemType: 'MATERIAL'
          }
        })

        if (materialItem) {
          const quantity = Math.floor(Math.random() * 3) + 1

          // 添加到背包
          const existingInventoryItem = await prisma.inventoryItem.findUnique({
            where: {
              userId_itemId: {
                userId,
                itemId: materialItem.id
              }
            }
          })

          if (existingInventoryItem) {
            await prisma.inventoryItem.update({
              where: {
                userId_itemId: {
                  userId,
                  itemId: materialItem.id
                }
              },
              data: {
                quantity: existingInventoryItem.quantity + quantity
              }
            })
          } else {
            await prisma.inventoryItem.create({
              data: {
                userId,
                itemId: materialItem.id,
                quantity
              }
            })
          }

          itemsGained.push({
            id: materialItem.id,
            name: materialItem.name,
            quantity
          })
        }
      }
    }

    res.json({
      message: '技能訓練成功',
      skill: updatedSkill,
      expGained,
      leveledUp: newLevel > skill.level,
      itemsGained
    })
  } catch (error) {
    console.error('技能訓練錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const craftItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { recipeId } = req.body

    // 獲取配方
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        item: true,
        ingredients: {
          include: {
            item: true
          }
        }
      }
    })

    if (!recipe) {
      res.status(404).json({ message: '配方不存在' })
      return
    }

    // 檢查技能等級
    const skill = await prisma.skill.findUnique({
      where: {
        userId_skillType: {
          userId,
          skillType: recipe.skillType
        }
      }
    })

    if (!skill || skill.level < recipe.skillLevel) {
      res.status(400).json({ message: '技能等級不足' })
      return
    }

    // 檢查材料是否足夠
    for (const ingredient of recipe.ingredients) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId: ingredient.itemId
          }
        }
      })

      if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
        res.status(400).json({ 
          message: `材料不足: ${ingredient.item.name}` 
        })
        return
      }
    }

    // 執行製作 - 消耗材料
    for (const ingredient of recipe.ingredients) {
      await prisma.inventoryItem.update({
        where: {
          userId_itemId: {
            userId,
            itemId: ingredient.itemId
          }
        },
        data: {
          quantity: {
            decrement: ingredient.quantity
          }
        }
      })
    }

    // 清理數量為 0 的物品
    await prisma.inventoryItem.deleteMany({
      where: {
        userId,
        quantity: { lte: 0 }
      }
    })

    // 添加製作結果
    const existingResult = await prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId: recipe.itemId
        }
      }
    })

    if (existingResult) {
      await prisma.inventoryItem.update({
        where: {
          userId_itemId: {
            userId,
            itemId: recipe.itemId
          }
        },
        data: {
          quantity: existingResult.quantity + 1
        }
      })
    } else {
      await prisma.inventoryItem.create({
        data: {
          userId,
          itemId: recipe.itemId,
          quantity: 1
        }
      })
    }

    // 獲得經驗值
    const expGained = recipe.skillLevel * 5
    await prisma.skill.update({
      where: {
        userId_skillType: {
          userId,
          skillType: recipe.skillType
        }
      },
      data: {
        experience: {
          increment: expGained
        }
      }
    })

    res.json({
      message: '製作成功',
      item: recipe.item,
      expGained
    })
  } catch (error) {
    console.error('製作物品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}