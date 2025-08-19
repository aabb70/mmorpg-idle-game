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

// 強制重新種子資料 API 端點
router.post('/reseed', async (req, res) => {
  try {
    console.log('開始強制重新種子資料...')
    
    // 直接執行種子資料，不檢查是否已有資料
    await seedDatabase()
    
    console.log('強制重新種子完成！')
    res.json({ message: '強制重新種子成功！', itemsCreated: true })
  } catch (error) {
    console.error('強制重新種子失敗:', error)
    res.status(500).json({ 
      message: '強制重新種子失敗', 
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

  // 建立完整物品清單
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
    prisma.item.create({
      data: {
        name: '金礦石',
        description: '珍貴的金屬礦石',
        itemType: 'MATERIAL',
        rarity: 'RARE',
        baseValue: 50,
      },
    }),

    // 伐木材料
    prisma.item.create({
      data: {
        name: '普通木材',
        description: '最基礎的木材',
        itemType: 'MATERIAL',
        rarity: 'COMMON',
        baseValue: 3,
      },
    }),
    prisma.item.create({
      data: {
        name: '硬木',
        description: '質地堅硬的木材',
        itemType: 'MATERIAL',
        rarity: 'UNCOMMON',
        baseValue: 12,
      },
    }),

    // 採集材料
    prisma.item.create({
      data: {
        name: '草藥',
        description: '常見的藥用植物',
        itemType: 'MATERIAL',
        rarity: 'COMMON',
        baseValue: 8,
      },
    }),
    prisma.item.create({
      data: {
        name: '魔法草',
        description: '蘊含魔力的稀有植物',
        itemType: 'MATERIAL',
        rarity: 'RARE',
        baseValue: 30,
      },
    }),

    // 釣魚材料
    prisma.item.create({
      data: {
        name: '小魚',
        description: '常見的淡水魚',
        itemType: 'MATERIAL',
        rarity: 'COMMON',
        baseValue: 6,
      },
    }),
    prisma.item.create({
      data: {
        name: '大魚',
        description: '較大的魚類',
        itemType: 'MATERIAL',
        rarity: 'UNCOMMON',
        baseValue: 18,
      },
    }),

    // 製作工具
    prisma.item.create({
      data: {
        name: '銅錘',
        description: '基礎的鍛造工具',
        itemType: 'TOOL',
        rarity: 'COMMON',
        baseValue: 25,
      },
    }),
    prisma.item.create({
      data: {
        name: '鐵錘',
        description: '更好的鍛造工具',
        itemType: 'TOOL',
        rarity: 'UNCOMMON',
        baseValue: 75,
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
    prisma.item.create({
      data: {
        name: '鐵劍',
        description: '更強的武器',
        itemType: 'EQUIPMENT',
        rarity: 'UNCOMMON',
        baseValue: 120,
      },
    }),

    // 消耗品
    prisma.item.create({
      data: {
        name: '麵包',
        description: '基礎的食物',
        itemType: 'CONSUMABLE',
        rarity: 'COMMON',
        baseValue: 10,
      },
    }),
    prisma.item.create({
      data: {
        name: '治療藥劑',
        description: '恢復體力的藥劑',
        itemType: 'CONSUMABLE',
        rarity: 'UNCOMMON',
        baseValue: 35,
      },
    }),

    // 服裝
    prisma.item.create({
      data: {
        name: '布衣',
        description: '基礎的服裝',
        itemType: 'EQUIPMENT',
        rarity: 'COMMON',
        baseValue: 20,
      },
    }),
    prisma.item.create({
      data: {
        name: '皮甲',
        description: '更好的防護服',
        itemType: 'EQUIPMENT',
        rarity: 'UNCOMMON',
        baseValue: 60,
      },
    }),
  ])

  // 建立配方
  const copperHammerItem = items.find(item => item.name === '銅錘')!
  const copperOreItem = items.find(item => item.name === '銅礦石')!
  const woodItem = items.find(item => item.name === '普通木材')!
  const ironHammerItem = items.find(item => item.name === '鐵錘')!
  const ironOreItem = items.find(item => item.name === '鐵礦石')!
  const copperSwordItem = items.find(item => item.name === '銅劍')!
  const ironSwordItem = items.find(item => item.name === '鐵劍')!
  const breadItem = items.find(item => item.name === '麵包')!
  const herbItem = items.find(item => item.name === '草藥')!
  const fishItem = items.find(item => item.name === '小魚')!
  const potionItem = items.find(item => item.name === '治療藥劑')!
  const clothItem = items.find(item => item.name === '布衣')!

  // 鍛造配方
  const copperHammerRecipe = await prisma.recipe.create({
    data: {
      itemId: copperHammerItem.id,
      skillType: 'SMITHING',
      skillLevel: 1,
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: copperHammerRecipe.id, itemId: copperOreItem.id, quantity: 3 },
      { recipeId: copperHammerRecipe.id, itemId: woodItem.id, quantity: 1 },
    ],
  })

  const ironHammerRecipe = await prisma.recipe.create({
    data: {
      itemId: ironHammerItem.id,
      skillType: 'SMITHING',
      skillLevel: 5,
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: ironHammerRecipe.id, itemId: ironOreItem.id, quantity: 3 },
      { recipeId: ironHammerRecipe.id, itemId: woodItem.id, quantity: 1 },
    ],
  })

  const copperSwordRecipe = await prisma.recipe.create({
    data: {
      itemId: copperSwordItem.id,
      skillType: 'SMITHING',
      skillLevel: 3,
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: copperSwordRecipe.id, itemId: copperOreItem.id, quantity: 5 },
      { recipeId: copperSwordRecipe.id, itemId: woodItem.id, quantity: 2 },
    ],
  })

  const ironSwordRecipe = await prisma.recipe.create({
    data: {
      itemId: ironSwordItem.id,
      skillType: 'SMITHING',
      skillLevel: 8,
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: ironSwordRecipe.id, itemId: ironOreItem.id, quantity: 5 },
      { recipeId: ironSwordRecipe.id, itemId: woodItem.id, quantity: 2 },
    ],
  })

  // 廚師配方
  const breadRecipe = await prisma.recipe.create({
    data: {
      itemId: breadItem.id,
      skillType: 'COOKING',
      skillLevel: 1,
    },
  })

  // 煉金配方
  const potionRecipe = await prisma.recipe.create({
    data: {
      itemId: potionItem.id,
      skillType: 'ALCHEMY',
      skillLevel: 3,
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: potionRecipe.id, itemId: herbItem.id, quantity: 2 },
      { recipeId: potionRecipe.id, itemId: fishItem.id, quantity: 1 },
    ],
  })

  // 裁縫配方
  const clothRecipe = await prisma.recipe.create({
    data: {
      itemId: clothItem.id,
      skillType: 'TAILORING',
      skillLevel: 1,
    },
  })

  console.log(`建立了 ${items.length} 個物品和多個配方`)
}

export default router