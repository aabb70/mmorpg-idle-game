import { Request, Response } from 'express'
import { prisma } from '../index.js'

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.item.findMany({
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { itemType: 'asc' },
        { category: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    })

    // 格式化物品數據，包含標籤信息
    const formattedItems = items.map(item => ({
      ...item,
      tags: item.tags.map(t => t.tag.name)
    }))

    // 添加版本訊息來確認部署狀態
    res.json({ 
      items: formattedItems, 
      serverVersion: "v2.0-material-system",
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
        item: {
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          }
        },
        ingredients: {
          include: {
            item: {
              include: {
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            },
            tag: true
          }
        }
      },
      orderBy: [
        { skillType: 'asc' },
        { skillLevel: 'asc' }
      ]
    })

    // 格式化配方數據
    const formattedRecipes = recipes.map(recipe => ({
      ...recipe,
      item: {
        ...recipe.item,
        tags: recipe.item.tags.map(t => t.tag.name)
      },
      ingredients: recipe.ingredients.map(ing => ({
        id: ing.id,
        quantity: ing.quantity,
        // 特定物品需求
        item: ing.item ? {
          ...ing.item,
          tags: ing.item.tags.map(t => t.tag.name)
        } : null,
        // 材料分類需求
        category: ing.category,
        // 標籤需求
        tag: ing.tag ? ing.tag.name : null
      }))
    }))

    res.json({ recipes: formattedRecipes })
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

    // 可能獲得材料 (根據技能類型和新的材料分類系統)
    let itemsGained: any[] = []
    if (true) { // 100% 機率獲得物品進行測試
      // 根據技能類型選擇對應的材料類別
      const skillMaterialCategories: Record<string, string[]> = {
        'MINING': ['METAL'],
        'LOGGING': ['WOOD'], 
        'FISHING': ['FISH'],
        'FORAGING': ['HERB'],
        'SMITHING': [], // 製作職業，不產生原材料
        'TAILORING': [], // 製作職業，不產生原材料
        'COOKING': [], // 製作職業，不產生原材料
        'ALCHEMY': [], // 製作職業，不產生原材料
        'CRAFTING': ['FIBER', 'LIVESTOCK'], // 工藝可以產生纖維和畜牧產品
      }

      const categories = skillMaterialCategories[skillType] || []
      
      if (categories.length > 0) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)]
        
        // 根據分類和技能等級獲取合適的材料
        const materialItems = await prisma.item.findMany({
          where: {
            itemType: 'MATERIAL',
            category: randomCategory as any
          },
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          }
        })
        
        if (materialItems.length > 0) {
          // 根據稀有度和技能等級選擇材料
          const availableMaterials = materialItems.filter(item => {
            const rarityLevel = {
              'COMMON': 1,
              'UNCOMMON': 2,
              'RARE': 3,
              'EPIC': 4,
              'LEGENDARY': 5
            }[item.rarity] || 1
            
            // 技能等級越高，越容易獲得稀有材料
            const skillRarityChance = Math.min(newLevel / 10, 0.8)
            return rarityLevel <= (1 + skillRarityChance * 4)
          })
          
          if (availableMaterials.length > 0) {
            const selectedMaterial = availableMaterials[Math.floor(Math.random() * availableMaterials.length)]
            const quantity = Math.floor(Math.random() * 3) + 1

            // 添加到背包
            const existingInventoryItem = await prisma.inventoryItem.findUnique({
              where: {
                userId_itemId: {
                  userId,
                  itemId: selectedMaterial.id
                }
              }
            })

            if (existingInventoryItem) {
              await prisma.inventoryItem.update({
                where: {
                  userId_itemId: {
                    userId,
                    itemId: selectedMaterial.id
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
                  itemId: selectedMaterial.id,
                  quantity
                }
              })
            }

            itemsGained.push({
              id: selectedMaterial.id,
              name: selectedMaterial.name,
              quantity,
              tags: selectedMaterial.tags.map(t => t.tag.name)
            })
          }
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

export const startTargetedTraining = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { skillType, targetItemId, repetitions } = req.body

    if (!skillType || !targetItemId || !repetitions) {
      res.status(400).json({ message: '需要指定技能類型、目標物品和重複次數' })
      return
    }

    // 驗證目標物品是否存在且可通過該技能獲得
    const targetItem = await prisma.item.findUnique({
      where: { id: targetItemId }
    })

    if (!targetItem) {
      res.status(404).json({ message: '目標物品不存在' })
      return
    }

    // 檢查是否有正在進行的離線訓練
    const existingTraining = await prisma.offlineTraining.findUnique({
      where: { userId }
    })

    if (existingTraining && existingTraining.isActive) {
      res.status(400).json({ message: '已有正在進行的離線訓練' })
      return
    }

    // 創建或更新離線訓練記錄
    const offlineTraining = await prisma.offlineTraining.upsert({
      where: { userId },
      update: {
        skillType,
        targetItemId,
        repetitions,
        completed: 0,
        startTime: new Date(),
        lastUpdate: new Date(),
        isActive: true
      },
      create: {
        userId,
        skillType,
        targetItemId,
        repetitions,
        completed: 0,
        startTime: new Date(),
        lastUpdate: new Date(),
        isActive: true
      },
      include: {
        targetItem: true
      }
    })

    res.json({
      message: '目標訓練已開始',
      training: offlineTraining
    })
  } catch (error) {
    console.error('開始目標訓練錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const stopTargetedTraining = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId

    const training = await prisma.offlineTraining.findUnique({
      where: { userId },
      include: { targetItem: true }
    })

    if (!training || !training.isActive) {
      res.status(404).json({ message: '沒有正在進行的離線訓練' })
      return
    }

    // 計算離線進度
    const progressResult = await calculateOfflineProgress(userId, training)

    // 停止訓練
    await prisma.offlineTraining.update({
      where: { userId },
      data: {
        isActive: false,
        completed: progressResult.totalCompleted,
        lastUpdate: new Date()
      }
    })

    res.json({
      message: '離線訓練已停止',
      progress: progressResult
    })
  } catch (error) {
    console.error('停止離線訓練錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const getOfflineProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId

    const training = await prisma.offlineTraining.findUnique({
      where: { userId },
      include: { targetItem: true }
    })

    if (!training) {
      res.json({ hasTraining: false })
      return
    }

    if (!training.isActive) {
      res.json({ 
        hasTraining: true, 
        isActive: false,
        training
      })
      return
    }

    // 計算當前進度
    const progressResult = await calculateOfflineProgress(userId, training)

    res.json({
      hasTraining: true,
      isActive: true,
      training,
      progress: progressResult
    })
  } catch (error) {
    console.error('獲取離線進度錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 計算離線進度的輔助函數
async function calculateOfflineProgress(userId: string, training: any) {
  const now = new Date()
  const timeDiff = now.getTime() - training.lastUpdate.getTime()
  const secondsPassed = Math.floor(timeDiff / 1000)

  // 獲取用戶技能等級
  const skill = await prisma.skill.findUnique({
    where: {
      userId_skillType: {
        userId,
        skillType: training.skillType
      }
    }
  })

  if (!skill) {
    throw new Error('技能不存在')
  }

  // 計算基礎訓練時間（秒）和成功率
  const rarity = training.targetItem.rarity
  let baseTime = 3 // 基礎 3 秒
  let baseSuccessRate = 0.5 // 基礎 50% 成功率

  // 根據稀有度調整時間和成功率
  const rarityMultipliers = {
    COMMON: { time: 1, success: 1 },
    UNCOMMON: { time: 1.5, success: 0.8 },
    RARE: { time: 2.5, success: 0.6 },
    EPIC: { time: 4, success: 0.4 },
    LEGENDARY: { time: 6, success: 0.2 }
  }

  const multiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || rarityMultipliers.COMMON
  const actualTime = baseTime * multiplier.time
  const actualSuccessRate = Math.min(baseSuccessRate * multiplier.success * (1 + skill.level * 0.05), 0.95) // 技能等級影響成功率，最高 95%

  // 計算可以完成的嘗試次數
  const attemptsPossible = Math.floor(secondsPassed / actualTime)
  const successfulAttempts = Math.floor(attemptsPossible * actualSuccessRate)
  const newCompleted = Math.min(training.completed + successfulAttempts, training.repetitions)

  // 如果有新的成功嘗試，更新資料庫
  if (successfulAttempts > 0) {
    await prisma.$transaction(async (tx) => {
      // 更新離線訓練進度
      await tx.offlineTraining.update({
        where: { userId },
        data: {
          completed: newCompleted,
          lastUpdate: now
        }
      })

      // 添加物品到背包
      if (successfulAttempts > 0) {
        const existingInventoryItem = await tx.inventoryItem.findUnique({
          where: {
            userId_itemId: {
              userId,
              itemId: training.targetItemId
            }
          }
        })

        if (existingInventoryItem) {
          await tx.inventoryItem.update({
            where: {
              userId_itemId: {
                userId,
                itemId: training.targetItemId
              }
            },
            data: {
              quantity: existingInventoryItem.quantity + successfulAttempts
            }
          })
        } else {
          await tx.inventoryItem.create({
            data: {
              userId,
              itemId: training.targetItemId,
              quantity: successfulAttempts
            }
          })
        }
      }

      // 添加經驗值
      const expPerSuccess = 10
      const totalExp = successfulAttempts * expPerSuccess
      
      if (totalExp > 0) {
        let currentSkill = await tx.skill.findUnique({
          where: {
            userId_skillType: {
              userId,
              skillType: training.skillType
            }
          }
        })

        if (currentSkill) {
          let newExp = currentSkill.experience + totalExp
          let newLevel = currentSkill.level
          let maxExp = 100 * Math.pow(1.2, newLevel - 1)

          // 處理升級
          while (newExp >= maxExp) {
            newExp -= maxExp
            newLevel += 1
            maxExp = 100 * Math.pow(1.2, newLevel - 1)
          }

          await tx.skill.update({
            where: {
              userId_skillType: {
                userId,
                skillType: training.skillType
              }
            },
            data: {
              level: newLevel,
              experience: newExp
            }
          })
        }
      }
    })
  }

  return {
    secondsPassed,
    attemptsPossible,
    successfulAttempts,
    totalCompleted: newCompleted,
    itemsGained: successfulAttempts,
    expGained: successfulAttempts * 10,
    isCompleted: newCompleted >= training.repetitions
  }
}

export const getAvailableItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skillType } = req.params

    if (!skillType) {
      res.status(400).json({ message: '需要指定技能類型' })
      return
    }

    // 根據技能類型獲取對應的物品
    const skillMaterials: Record<string, string[]> = {
      'MINING': ['銅礦石', '鐵礦石', '金礦石'],
      'LOGGING': ['普通木材', '硬木'],
      'FISHING': ['小魚', '大魚'],
      'FORAGING': ['草藥', '魔法草'],
      'SMITHING': ['銅錘', '鐵錘', '銅劍', '鐵劍'],
      'TAILORING': ['布衣', '皮甲'],
      'COOKING': ['麵包'],
      'ALCHEMY': ['治療藥劑'],
      'CRAFTING': ['銅錘', '鐵錘'],
    }

    const materialNames = skillMaterials[skillType] || []
    
    const items = await prisma.item.findMany({
      where: {
        name: { in: materialNames },
        itemType: 'MATERIAL'
      },
      orderBy: [
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    })

    res.json({ items })
  } catch (error) {
    console.error('獲取可用物品錯誤:', error)
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