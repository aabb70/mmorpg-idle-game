import { Request, Response } from 'express'
import { prisma } from '../index.js'
import jwt from 'jsonwebtoken'
import { seedMaterialSystem } from '../seeds/materialSystem.js'

// 簡單的管理員認證 (在生產環境中應使用更安全的方式)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      res.status(401).json({ message: '管理員認證失敗' })
      return
    }

    const token = jwt.sign(
      { isAdmin: true, username },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    )

    res.json({
      message: '管理員登入成功',
      token,
      admin: { username, isAdmin: true }
    })
  } catch (error) {
    console.error('管理員登入錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        skills: true,
        inventory: {
          include: {
            item: true
          }
        },
        _count: {
          select: {
            marketListings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ users })
  } catch (error) {
    console.error('獲取用戶列表錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: true,
        inventory: {
          include: {
            item: true
          }
        },
        marketListings: {
          include: {
            item: true
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({ message: '用戶不存在' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('獲取用戶詳情錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const updateUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const { level, experience, gold } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        level: level !== undefined ? level : undefined,
        experience: experience !== undefined ? experience : undefined,
        gold: gold !== undefined ? gold : undefined
      }
    })

    res.json({
      message: '用戶統計更新成功',
      user: updatedUser
    })
  } catch (error) {
    console.error('更新用戶統計錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const updateUserSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const { skillType, level, experience } = req.body

    const updatedSkill = await prisma.skill.update({
      where: {
        userId_skillType: {
          userId,
          skillType
        }
      },
      data: {
        level: level !== undefined ? level : undefined,
        experience: experience !== undefined ? experience : undefined
      }
    })

    res.json({
      message: '用戶技能更新成功',
      skill: updatedSkill
    })
  } catch (error) {
    console.error('更新用戶技能錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const giveItemToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const { itemId, quantity } = req.body

    // 檢查物品是否存在
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      res.status(404).json({ message: '物品不存在' })
      return
    }

    // 檢查用戶是否已有該物品
    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    })

    if (existingInventoryItem) {
      // 更新數量
      await prisma.inventoryItem.update({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        },
        data: {
          quantity: existingInventoryItem.quantity + quantity
        }
      })
    } else {
      // 創建新的背包物品
      await prisma.inventoryItem.create({
        data: {
          userId,
          itemId,
          quantity
        }
      })
    }

    res.json({
      message: '物品發放成功',
      item: {
        name: item.name,
        quantity
      }
    })
  } catch (error) {
    console.error('發放物品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    // 使用事務刪除用戶及相關數據
    await prisma.$transaction(async (tx: any) => {
      // 刪除技能
      await tx.skill.deleteMany({
        where: { userId }
      })

      // 刪除背包物品
      await tx.inventoryItem.deleteMany({
        where: { userId }
      })

      // 刪除市場列表
      await tx.marketListing.deleteMany({
        where: { userId }
      })

      // 刪除用戶
      await tx.user.delete({
        where: { id: userId }
      })
    })

    res.json({ message: '用戶刪除成功' })
  } catch (error) {
    console.error('刪除用戶錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const cleanAndReinitializeMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🧹 開始清理舊材料系統...')
    
    // 清理舊的材料和相關數據
    await prisma.$transaction(async (tx: any) => {
      // 刪除所有背包中的舊材料物品
      await tx.inventoryItem.deleteMany({
        where: {
          item: {
            itemType: 'MATERIAL'
          }
        }
      })
      
      // 刪除所有配方成分
      await tx.recipeIngredient.deleteMany({})
      
      // 刪除所有配方
      await tx.recipe.deleteMany({})
      
      // 刪除所有物品標籤關聯
      await tx.itemTag.deleteMany({})
      
      // 刪除所有舊物品（材料、食物、藥劑等）
      await tx.item.deleteMany({
        where: {
          OR: [
            { itemType: 'MATERIAL' },
            { itemType: 'FOOD' },
            { itemType: 'POTION' },
            { itemType: 'EQUIPMENT' }
          ]
        }
      })
      
      // 刪除所有標籤
      await tx.tag.deleteMany({})
      
      console.log('🗑️ 舊數據清理完成')
    })
    
    // 重新初始化材料系統
    console.log('🔄 重新初始化材料系統...')
    await seedMaterialSystem(prisma)
    
    console.log('✅ 材料系統重新初始化完成')
    
    res.json({
      message: '材料系統已清理並重新初始化',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ 清理材料系統錯誤:', error)
    res.status(500).json({ message: '清理材料系統失敗', error: error.message })
  }
}