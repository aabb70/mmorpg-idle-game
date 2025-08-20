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


export const startTargetedTraining = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { skillType, targetItemId, repetitions } = req.body

    if (!skillType || !targetItemId || !repetitions) {
      res.status(400).json({ message: '需要指定技能類型、目標物品和重複次數' })
      return
    }

    // 驗證目標物品是否存在且可通過該技能獲得
    const craftingSkills = ['SMITHING', 'TAILORING', 'COOKING', 'ALCHEMY']
    let targetItem: any = null

    if (craftingSkills.includes(skillType)) {
      // 對於製作職業，targetItemId 是 recipe ID
      const recipe = await prisma.recipe.findUnique({
        where: { id: targetItemId },
        include: {
          item: true
        }
      })

      if (!recipe) {
        res.status(404).json({ message: '目標配方不存在' })
        return
      }

      targetItem = recipe.item
    } else {
      // 對於採集職業，targetItemId 是 item ID
      targetItem = await prisma.item.findUnique({
        where: { id: targetItemId }
      })

      if (!targetItem) {
        res.status(404).json({ message: '目標物品不存在' })
        return
      }
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

  // 定義職業類型
  const craftingSkills = ['SMITHING', 'TAILORING', 'COOKING', 'ALCHEMY']
  const isCraftingSkill = craftingSkills.includes(training.skillType)

  let successfulAttempts = 0
  let actualTime = 3
  let actualSuccessRate = 0.5
  let attemptsPossible = 0

  if (isCraftingSkill) {
    // 製作職業：檢查是否是配方訓練
    const recipe = await prisma.recipe.findFirst({
      where: { itemId: training.targetItemId },
      include: {
        ingredients: {
          include: {
            item: true,
            tag: true
          }
        }
      }
    })

    if (!recipe) {
      throw new Error('配方不存在')
    }

    // 計算可以製作的次數（受材料限制）
    let maxPossibleCrafts = training.repetitions - training.completed
    
    for (const ingredient of recipe.ingredients) {
      // 檢查背包中的材料
      let availableQuantity = 0
      
      if (ingredient.itemId) {
        // 特定物品成分
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: {
            userId_itemId: {
              userId,
              itemId: ingredient.itemId
            }
          }
        })
        availableQuantity = inventoryItem?.quantity || 0
      } else if (ingredient.tagId) {
        // 標籤成分：找到所有符合標籤的物品
        const taggedItems = await prisma.inventoryItem.findMany({
          where: {
            userId,
            item: {
              tags: {
                some: {
                  tagId: ingredient.tagId
                }
              }
            }
          }
        })
        availableQuantity = taggedItems.reduce((sum, item) => sum + item.quantity, 0)
      } else if (ingredient.category) {
        // 分類成分
        const categoryItems = await prisma.inventoryItem.findMany({
          where: {
            userId,
            item: {
              category: ingredient.category as any
            }
          }
        })
        availableQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0)
      }

      const possibleFromThisIngredient = Math.floor(availableQuantity / ingredient.quantity)
      maxPossibleCrafts = Math.min(maxPossibleCrafts, possibleFromThisIngredient)
    }

    // 計算時間和成功率
    const rarity = training.targetItem.rarity
    const rarityMultipliers = {
      COMMON: { time: 1, success: 1 },
      UNCOMMON: { time: 1.5, success: 0.9 },
      RARE: { time: 2.5, success: 0.8 },
      EPIC: { time: 4, success: 0.7 },
      LEGENDARY: { time: 6, success: 0.6 }
    }

    const multiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || rarityMultipliers.COMMON
    actualTime = 5 * multiplier.time // 製作時間較長
    actualSuccessRate = Math.min(multiplier.success * (1 + skill.level * 0.02), 0.95)

    attemptsPossible = Math.floor(secondsPassed / actualTime)
    const actualAttempts = Math.min(attemptsPossible, maxPossibleCrafts)
    successfulAttempts = Math.floor(actualAttempts * actualSuccessRate)

    // 消耗材料
    if (successfulAttempts > 0) {
      for (const ingredient of recipe.ingredients) {
        const totalNeeded = successfulAttempts * ingredient.quantity
        let remaining = totalNeeded

        if (ingredient.itemId) {
          // 特定物品成分
          const inventoryItem = await prisma.inventoryItem.findUnique({
            where: {
              userId_itemId: {
                userId,
                itemId: ingredient.itemId
              }
            }
          })

          if (inventoryItem && remaining > 0) {
            const toConsume = Math.min(remaining, inventoryItem.quantity)
            await prisma.inventoryItem.update({
              where: {
                userId_itemId: {
                  userId,
                  itemId: ingredient.itemId
                }
              },
              data: {
                quantity: inventoryItem.quantity - toConsume
              }
            })
            remaining -= toConsume
          }
        } else if (ingredient.tagId || ingredient.category) {
          // 標籤或分類成分
          const whereClause = ingredient.tagId 
            ? {
                userId,
                item: {
                  tags: {
                    some: {
                      tagId: ingredient.tagId
                    }
                  }
                }
              }
            : {
                userId,
                item: {
                  category: ingredient.category as any
                }
              }

          const availableItems = await prisma.inventoryItem.findMany({
            where: whereClause,
            orderBy: { quantity: 'desc' }
          })

          for (const item of availableItems) {
            if (remaining <= 0) break
            
            const toConsume = Math.min(remaining, item.quantity)
            await prisma.inventoryItem.update({
              where: { id: item.id },
              data: {
                quantity: item.quantity - toConsume
              }
            })
            remaining -= toConsume
          }
        }
      }

      // 清理數量為 0 的物品
      await prisma.inventoryItem.deleteMany({
        where: {
          userId,
          quantity: { lte: 0 }
        }
      })
    }
  } else {
    // 採集職業：原有邏輯
    const rarity = training.targetItem.rarity
    let baseTime = 3
    let baseSuccessRate = 0.5

    const rarityMultipliers = {
      COMMON: { time: 1, success: 1 },
      UNCOMMON: { time: 1.5, success: 0.8 },
      RARE: { time: 2.5, success: 0.6 },
      EPIC: { time: 4, success: 0.4 },
      LEGENDARY: { time: 6, success: 0.2 }
    }

    const multiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || rarityMultipliers.COMMON
    actualTime = baseTime * multiplier.time
    actualSuccessRate = Math.min(baseSuccessRate * multiplier.success * (1 + skill.level * 0.05), 0.95)

    attemptsPossible = Math.floor(secondsPassed / actualTime)
    successfulAttempts = Math.floor(attemptsPossible * actualSuccessRate)
  }

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

      // 添加物品到背包（只有採集職業或製作職業都會獲得物品）
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

    // 定義採集職業和製作職業
    const gatheringSkills = ['MINING', 'LOGGING', 'FISHING', 'FORAGING', 'CRAFTING']
    const craftingSkills = ['SMITHING', 'TAILORING', 'COOKING', 'ALCHEMY']

    if (gatheringSkills.includes(skillType)) {
      // 採集職業：返回可獲得的材料
      const skillMaterialCategories: Record<string, string[]> = {
        'MINING': ['METAL'],
        'LOGGING': ['WOOD'], 
        'FISHING': ['FISH'],
        'FORAGING': ['HERB'],
        'CRAFTING': ['FIBER', 'LIVESTOCK'],
      }

      const categories = skillMaterialCategories[skillType] || []
      
      const items = await prisma.item.findMany({
        where: {
          itemType: 'MATERIAL',
          category: { in: categories as any[] }
        },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: [
          { rarity: 'asc' },
          { name: 'asc' }
        ]
      })

      res.json({ 
        type: 'materials',
        items: items.map(item => ({
          ...item,
          tags: item.tags.map(t => t.tag.name)
        }))
      })
    } else if (craftingSkills.includes(skillType)) {
      // 製作職業：返回可製作的配方
      const recipes = await prisma.recipe.findMany({
        where: {
          skillType: skillType as any
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
          { skillLevel: 'asc' },
          { item: { rarity: 'asc' } }
        ]
      })

      res.json({ 
        type: 'recipes',
        items: recipes.map(recipe => ({
          id: recipe.id,
          name: recipe.item.name,
          description: recipe.item.description,
          skillLevel: recipe.skillLevel,
          rarity: recipe.item.rarity,
          tags: recipe.item.tags.map(t => t.tag.name),
          ingredients: recipe.ingredients.map(ing => ({
            quantity: ing.quantity,
            item: ing.item ? {
              name: ing.item.name,
              tags: ing.item.tags.map(t => t.tag.name)
            } : null,
            tag: ing.tag ? ing.tag.name : null,
            category: ing.category
          }))
        }))
      })
    } else {
      res.status(400).json({ message: '無效的技能類型' })
    }
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
            itemId: ingredient.itemId!
          }
        }
      })

      if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
        res.status(400).json({ 
          message: `材料不足: ${ingredient.item?.name || '未知物品'}` 
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
            itemId: ingredient.itemId!
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