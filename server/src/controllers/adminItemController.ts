import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 獲取所有物品
export const getAllItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.item.findMany({
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        recipes: {
          include: {
            ingredients: {
              include: {
                item: true,
                tag: true
              }
            }
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    })

    res.json({
      success: true,
      items: items.map(item => ({
        ...item,
        tags: item.tags.map(t => ({ id: t.tag.id, name: t.tag.name }))
      }))
    })
  } catch (error: any) {
    console.error('獲取物品列表失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 創建新物品
export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      itemType,
      category,
      rarity,
      baseValue,
      healthRestore,
      tags
    } = req.body

    // 檢查物品名稱是否已存在
    const existingItem = await prisma.item.findUnique({
      where: { name }
    })

    if (existingItem) {
      res.status(400).json({ success: false, error: '物品名稱已存在' })
      return
    }

    // 創建物品
    const item = await prisma.item.create({
      data: {
        name,
        description,
        itemType,
        category: category || null,
        rarity: rarity || 'COMMON',
        baseValue: baseValue || 0,
        healthRestore: healthRestore || null
      }
    })

    // 添加標籤
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // 查找或創建標籤
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        })

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName }
          })
        }

        // 關聯物品和標籤
        await prisma.itemTag.create({
          data: {
            itemId: item.id,
            tagId: tag.id
          }
        })
      }
    }

    // 返回完整物品資訊
    const createdItem = await prisma.item.findUnique({
      where: { id: item.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    res.json({
      success: true,
      item: {
        ...createdItem,
        tags: createdItem?.tags.map(t => ({ id: t.tag.id, name: t.tag.name })) || []
      }
    })
  } catch (error: any) {
    console.error('創建物品失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 更新物品
export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      itemType,
      category,
      rarity,
      baseValue,
      healthRestore,
      tags
    } = req.body

    // 檢查物品是否存在
    const existingItem = await prisma.item.findUnique({
      where: { id }
    })

    if (!existingItem) {
      res.status(404).json({ success: false, error: '物品不存在' })
      return
    }

    // 如果修改名稱，檢查是否與其他物品重複
    if (name !== existingItem.name) {
      const duplicateItem = await prisma.item.findUnique({
        where: { name }
      })

      if (duplicateItem) {
        res.status(400).json({ success: false, error: '物品名稱已存在' })
        return
      }
    }

    // 更新物品基本資訊
    await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        itemType,
        category: category || null,
        rarity: rarity || 'COMMON',
        baseValue: baseValue || 0,
        healthRestore: healthRestore || null
      }
    })

    // 更新標籤
    if (tags !== undefined) {
      // 刪除現有標籤關聯
      await prisma.itemTag.deleteMany({
        where: { itemId: id }
      })

      // 添加新標籤
      if (tags.length > 0) {
        for (const tagName of tags) {
          let tag = await prisma.tag.findUnique({
            where: { name: tagName }
          })

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName }
            })
          }

          await prisma.itemTag.create({
            data: {
              itemId: id,
              tagId: tag.id
            }
          })
        }
      }
    }

    // 返回更新後的物品資訊
    const updatedItem = await prisma.item.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    res.json({
      success: true,
      item: {
        ...updatedItem,
        tags: updatedItem?.tags.map(t => ({ id: t.tag.id, name: t.tag.name })) || []
      }
    })
  } catch (error: any) {
    console.error('更新物品失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 刪除物品
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 檢查物品是否存在
    const existingItem = await prisma.item.findUnique({
      where: { id }
    })

    if (!existingItem) {
      res.status(404).json({ success: false, error: '物品不存在' })
      return
    }

    // 檢查是否有用戶持有此物品
    const inventoryCount = await prisma.inventoryItem.count({
      where: { itemId: id }
    })

    if (inventoryCount > 0) {
      res.status(400).json({ 
        success: false, 
        error: `無法刪除物品：有 ${inventoryCount} 個用戶持有此物品` 
      })
      return
    }

    // 檢查是否有市場交易
    const marketCount = await prisma.marketListing.count({
      where: { itemId: id }
    })

    if (marketCount > 0) {
      res.status(400).json({ 
        success: false, 
        error: `無法刪除物品：市場上有 ${marketCount} 個相關交易` 
      })
      return
    }

    // 刪除物品（會自動刪除相關的標籤關聯和配方）
    await prisma.item.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '物品已刪除'
    })
  } catch (error: any) {
    console.error('刪除物品失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 獲取所有標籤
export const getAllTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    })

    res.json({
      success: true,
      tags
    })
  } catch (error: any) {
    console.error('獲取標籤列表失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}