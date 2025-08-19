import { Router } from 'express'
import { prisma } from '../index.js'
import { execSync } from 'child_process'

const router = Router()

// 初始化資料庫的 API 端點
router.post('/database', async (req, res) => {
  try {
    console.log('開始初始化資料庫...')
    
    // 推送資料庫 schema
    console.log('推送資料庫 schema...')
    execSync('npx prisma db push', { cwd: process.cwd(), stdio: 'inherit' })
    
    // 檢查是否已有資料
    const itemCount = await prisma.item.count()
    
    if (itemCount === 0) {
      console.log('執行種子資料...')
      // 手動執行種子資料
      await seedDatabase()
      console.log('資料庫初始化完成！')
      res.json({ message: '資料庫初始化成功！', itemsCreated: true })
    } else {
      console.log('資料庫已有資料，跳過種子資料')
      res.json({ message: '資料庫已存在資料', itemsCreated: false, existingItems: itemCount })
    }
  } catch (error) {
    console.error('資料庫初始化失敗:', error)
    res.status(500).json({ 
      message: '資料庫初始化失敗', 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
})

// 手動種子資料函數
async function seedDatabase() {
  // 清理現有資料
  await prisma.recipeIngredient.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.marketListing.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.item.deleteMany()
  await prisma.user.deleteMany()

  // 建立基礎物品
  const items = await Promise.all([
    // 採礦材料
    prisma.item.create({
      data: {
        name: '銅礦石',
        description: '最基礎的金屬礦石',
        itemType: 'MATERIAL',
        rarity: 'COMMON',
        baseValue: 5,
      },
    }),
    prisma.item.create({
      data: {
        name: '鐵礦石',
        description: '常見的金屬礦石',
        itemType: 'MATERIAL',
        rarity: 'UNCOMMON',
        baseValue: 15,
      },
    }),
    // 木材
    prisma.item.create({
      data: {
        name: '普通木材',
        description: '最基礎的木材',
        itemType: 'MATERIAL',
        rarity: 'COMMON',
        baseValue: 3,
      },
    }),
    // 工具
    prisma.item.create({
      data: {
        name: '銅錘',
        description: '基礎的鍛造工具',
        itemType: 'TOOL',
        rarity: 'COMMON',
        baseValue: 25,
      },
    }),
    // 裝備
    prisma.item.create({
      data: {
        name: '銅劍',
        description: '基礎的武器',
        itemType: 'EQUIPMENT',
        rarity: 'COMMON',
        baseValue: 40,
      },
    }),
  ])

  // 建立基礎配方
  const copperHammerItem = items.find(item => item.name === '銅錘')!
  const copperOreItem = items.find(item => item.name === '銅礦石')!
  const woodItem = items.find(item => item.name === '普通木材')!

  const recipe = await prisma.recipe.create({
    data: {
      itemId: copperHammerItem.id,
      skillType: 'SMITHING',
      skillLevel: 1,
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: recipe.id, itemId: copperOreItem.id, quantity: 3 },
      { recipeId: recipe.id, itemId: woodItem.id, quantity: 1 },
    ],
  })

  console.log(`建立了 ${items.length} 個物品和 1 個配方`)
}

export default router