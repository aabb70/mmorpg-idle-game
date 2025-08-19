import { Request, Response } from 'express'
import { prisma } from '../index.js'

export const getMarketListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const listings = await prisma.marketListing.findMany({
      include: {
        seller: {
          select: {
            username: true
          }
        },
        item: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedListings = listings.map(listing => ({
      id: listing.id,
      sellerId: listing.sellerId,
      sellerName: listing.seller.username,
      itemId: listing.itemId,
      itemName: listing.item.name,
      quantity: listing.quantity,
      pricePerUnit: listing.pricePerUnit,
      totalPrice: listing.quantity * listing.pricePerUnit,
      createdAt: listing.createdAt.toISOString()
    }))

    res.json({ listings: formattedListings })
  } catch (error) {
    console.error('獲取市場列表錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const getMyListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId

    const listings = await prisma.marketListing.findMany({
      where: { sellerId: userId },
      include: {
        item: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedListings = listings.map(listing => ({
      id: listing.id,
      sellerId: listing.sellerId,
      itemId: listing.itemId,
      itemName: listing.item.name,
      quantity: listing.quantity,
      pricePerUnit: listing.pricePerUnit,
      totalPrice: listing.quantity * listing.pricePerUnit,
      createdAt: listing.createdAt.toISOString()
    }))

    res.json({ listings: formattedListings })
  } catch (error) {
    console.error('獲取我的商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { itemId, quantity, pricePerUnit } = req.body

    if (!itemId || !quantity || !pricePerUnit || quantity <= 0 || pricePerUnit <= 0) {
      res.status(400).json({ message: '無效的商品資訊' })
      return
    }

    // 檢查用戶是否擁有足夠的物品
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    })

    if (!inventoryItem || inventoryItem.quantity < quantity) {
      res.status(400).json({ message: '物品數量不足' })
      return
    }

    // 從背包中移除物品
    await prisma.inventoryItem.update({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      },
      data: {
        quantity: inventoryItem.quantity - quantity
      }
    })

    // 如果數量為 0，刪除背包項目
    if (inventoryItem.quantity === quantity) {
      await prisma.inventoryItem.delete({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        }
      })
    }

    // 創建市場列表
    const listing = await prisma.marketListing.create({
      data: {
        sellerId: userId,
        itemId,
        quantity,
        pricePerUnit
      },
      include: {
        seller: {
          select: {
            username: true
          }
        },
        item: true
      }
    })

    res.status(201).json({
      message: '商品上架成功',
      listing: {
        id: listing.id,
        sellerId: listing.sellerId,
        sellerName: listing.seller.username,
        itemId: listing.itemId,
        itemName: listing.item.name,
        quantity: listing.quantity,
        pricePerUnit: listing.pricePerUnit,
        totalPrice: listing.quantity * listing.pricePerUnit,
        createdAt: listing.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('上架商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const removeListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { listingId } = req.params

    // 檢查商品是否存在且屬於該用戶
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId }
    })

    if (!listing) {
      res.status(404).json({ message: '商品不存在' })
      return
    }

    if (listing.sellerId !== userId) {
      res.status(403).json({ message: '沒有權限操作此商品' })
      return
    }

    // 將物品歸還到背包
    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId: listing.itemId
        }
      }
    })

    if (existingInventoryItem) {
      await prisma.inventoryItem.update({
        where: {
          userId_itemId: {
            userId,
            itemId: listing.itemId
          }
        },
        data: {
          quantity: existingInventoryItem.quantity + listing.quantity
        }
      })
    } else {
      await prisma.inventoryItem.create({
        data: {
          userId,
          itemId: listing.itemId,
          quantity: listing.quantity
        }
      })
    }

    // 刪除市場列表
    await prisma.marketListing.delete({
      where: { id: listingId }
    })

    res.json({ message: '商品下架成功' })
  } catch (error) {
    console.error('下架商品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const purchaseItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { listingId, quantity } = req.body

    if (!listingId || !quantity || quantity <= 0) {
      res.status(400).json({ message: '無效的購買資訊' })
      return
    }

    // 獲取商品列表
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
      include: {
        item: true
      }
    })

    if (!listing) {
      res.status(404).json({ message: '商品不存在' })
      return
    }

    if (listing.sellerId === userId) {
      res.status(400).json({ message: '不能購買自己的商品' })
      return
    }

    if (quantity > listing.quantity) {
      res.status(400).json({ message: '購買數量超過可用數量' })
      return
    }

    // 計算總價
    const totalPrice = quantity * listing.pricePerUnit

    // 檢查買家金幣是否足夠
    const buyer = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!buyer || buyer.gold < totalPrice) {
      res.status(400).json({ message: '金幣不足' })
      return
    }

    // 執行交易
    await prisma.$transaction(async (tx) => {
      // 扣除買家金幣
      await tx.user.update({
        where: { id: userId },
        data: { gold: buyer.gold - totalPrice }
      })

      // 增加賣家金幣
      await tx.user.update({
        where: { id: listing.sellerId },
        data: { gold: { increment: totalPrice } }
      })

      // 將物品添加到買家背包
      const existingInventoryItem = await tx.inventoryItem.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId: listing.itemId
          }
        }
      })

      if (existingInventoryItem) {
        await tx.inventoryItem.update({
          where: {
            userId_itemId: {
              userId,
              itemId: listing.itemId
            }
          },
          data: {
            quantity: existingInventoryItem.quantity + quantity
          }
        })
      } else {
        await tx.inventoryItem.create({
          data: {
            userId,
            itemId: listing.itemId,
            quantity
          }
        })
      }

      // 更新或刪除市場列表
      if (quantity === listing.quantity) {
        await tx.marketListing.delete({
          where: { id: listingId }
        })
      } else {
        await tx.marketListing.update({
          where: { id: listingId },
          data: { quantity: listing.quantity - quantity }
        })
      }

      // 記錄購買訂單
      await tx.purchaseOrder.create({
        data: {
          buyerId: userId,
          listingId,
          quantity,
          totalPrice
        }
      })
    })

    res.json({
      message: '購買成功',
      item: listing.item.name,
      quantity,
      totalPrice
    })
  } catch (error) {
    console.error('購買物品錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}