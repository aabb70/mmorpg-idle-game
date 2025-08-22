import { PrismaClient, SkillType } from '@prisma/client'

const prisma = new PrismaClient()

async function initSkillItems() {
  console.log('開始初始化SkillItem...')
  
  // 首先獲取所有物品
  const items = await prisma.item.findMany()
  
  console.log(`找到 ${items.length} 個物品:`)
  items.forEach(item => {
    console.log(`- ${item.name} (${item.itemType})`)
  })
  
  if (items.length === 0) {
    console.log('沒有找到物品，請先運行 POST /api/init/database')
    return
  }

  // 清理現有SkillItem
  await prisma.skillItem.deleteMany()

  // 定義技能物品關係 - 使用數據庫中實際存在的物品
  const skillItemConfigs = [
    // 採礦技能
    { skillType: 'MINING', itemName: '銅礦石', minLevel: 1, maxLevel: 10, minRate: 0.7, maxRate: 0.9 },
    { skillType: 'MINING', itemName: '錫礦石', minLevel: 5, maxLevel: 20, minRate: 0.5, maxRate: 0.8 },

    // 伐木技能
    { skillType: 'LOGGING', itemName: '松木', minLevel: 1, maxLevel: 10, minRate: 0.7, maxRate: 0.9 },
    { skillType: 'LOGGING', itemName: '橡木', minLevel: 5, maxLevel: 25, minRate: 0.4, maxRate: 0.8 },
    { skillType: 'LOGGING', itemName: '竹材', minLevel: 10, maxLevel: 30, minRate: 0.3, maxRate: 0.7 },

    // 釣魚技能
    { skillType: 'FISHING', itemName: '青花魚', minLevel: 1, maxLevel: 8, minRate: 0.8, maxRate: 0.95 },
    { skillType: 'FISHING', itemName: '冰鱗鯉', minLevel: 5, maxLevel: 15, minRate: 0.6, maxRate: 0.8 },
    { skillType: 'FISHING', itemName: '夜梭魚', minLevel: 10, maxLevel: 25, minRate: 0.4, maxRate: 0.7 },
    { skillType: 'FISHING', itemName: '火斑鮮', minLevel: 15, maxLevel: 30, minRate: 0.3, maxRate: 0.6 },
    { skillType: 'FISHING', itemName: '潮紋石斑', minLevel: 20, maxLevel: 35, minRate: 0.2, maxRate: 0.5 },

    // 採集技能
    { skillType: 'FORAGING', itemName: '藥草', minLevel: 1, maxLevel: 12, minRate: 0.6, maxRate: 0.9 },
    { skillType: 'FORAGING', itemName: '羅勒', minLevel: 5, maxLevel: 20, minRate: 0.4, maxRate: 0.8 },
    { skillType: 'FORAGING', itemName: '薄荷', minLevel: 8, maxLevel: 25, minRate: 0.3, maxRate: 0.7 },
    { skillType: 'FORAGING', itemName: '辣椒', minLevel: 12, maxLevel: 30, minRate: 0.2, maxRate: 0.6 },

    // 工藝技能（紡織材料）
    { skillType: 'CRAFTING', itemName: '亞麻', minLevel: 1, maxLevel: 8, minRate: 0.6, maxRate: 0.8 },
    { skillType: 'CRAFTING', itemName: '棉花', minLevel: 5, maxLevel: 15, minRate: 0.5, maxRate: 0.7 },
    { skillType: 'CRAFTING', itemName: '羊毛', minLevel: 10, maxLevel: 25, minRate: 0.3, maxRate: 0.6 },
  ]

  const skillItems = []

  for (const config of skillItemConfigs) {
    const item = items.find(i => i.name === config.itemName)
    if (item) {
      skillItems.push({
        skillType: config.skillType as SkillType,
        itemId: item.id,
        minSkillLevel: config.minLevel,
        maxSkillLevel: config.maxLevel,
        minSuccessRate: config.minRate,
        maxSuccessRate: config.maxRate,
        isEnabled: true
      })
    } else {
      console.warn(`找不到物品: ${config.itemName}`)
    }
  }

  // 批次創建SkillItem記錄
  await prisma.skillItem.createMany({
    data: skillItems
  })

  console.log(`成功創建了 ${skillItems.length} 個 SkillItem 記錄`)

  // 顯示創建的記錄
  const createdSkillItems = await prisma.skillItem.findMany({
    include: {
      item: true
    }
  })

  console.log('創建的SkillItem記錄:')
  createdSkillItems.forEach(skillItem => {
    console.log(`- ${skillItem.skillType}: ${skillItem.item.name} (等級 ${skillItem.minSkillLevel}-${skillItem.maxSkillLevel}, 成功率 ${Math.round(skillItem.minSuccessRate * 100)}-${Math.round(skillItem.maxSuccessRate * 100)}%)`)
  })
}

// 直接執行初始化
initSkillItems()
  .then(() => {
    console.log('SkillItem 初始化完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('SkillItem 初始化失敗:', error)
    process.exit(1)
  })

export { initSkillItems }