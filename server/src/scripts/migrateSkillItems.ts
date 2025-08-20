import { PrismaClient, SkillType, MaterialCategory } from '@prisma/client'

const prisma = new PrismaClient()

// 定義技能和材料分類的映射關係
const skillMaterialCategories: Record<SkillType, MaterialCategory[]> = {
  MINING: ['METAL'],
  LOGGING: ['WOOD'],
  FISHING: ['FISH'],
  FORAGING: ['HERB'],
  CRAFTING: ['FIBER', 'LIVESTOCK'],
  SMITHING: [], // 製作職業，不直接獲得材料
  TAILORING: [],
  COOKING: [],
  ALCHEMY: []
}

// 預設的成功率和等級要求
const defaultSkillItemSettings = {
  baseSuccessRate: 0.7, // 70%基礎成功率
  minSkillLevel: 1,
  maxSkillLevel: null,
  isEnabled: true
}

async function migrateSkillItems() {
  console.log('開始遷移技能物品關係...')
  
  let totalMigrated = 0
  
  for (const [skillType, categories] of Object.entries(skillMaterialCategories)) {
    if (categories.length === 0) continue // 跳過製作職業
    
    console.log(`\n處理技能: ${skillType} (分類: ${categories.join(', ')})`)
    
    // 查找該技能對應分類的所有物品
    const items = await prisma.item.findMany({
      where: {
        itemType: 'MATERIAL',
        category: { in: categories }
      }
    })
    
    console.log(`找到 ${items.length} 個物品`)
    
    for (const item of items) {
      try {
        // 檢查是否已存在
        const existing = await prisma.skillItem.findUnique({
          where: {
            skillType_itemId: {
              skillType: skillType as SkillType,
              itemId: item.id
            }
          }
        })
        
        if (existing) {
          console.log(`  跳過已存在: ${item.name}`)
          continue
        }
        
        // 創建技能物品關係
        await prisma.skillItem.create({
          data: {
            skillType: skillType as SkillType,
            itemId: item.id,
            ...defaultSkillItemSettings
          }
        })
        
        console.log(`  ✓ 創建: ${item.name}`)
        totalMigrated++
        
      } catch (error) {
        console.error(`  ✗ 創建失敗: ${item.name}`, error)
      }
    }
  }
  
  console.log(`\n遷移完成！總共創建了 ${totalMigrated} 個技能物品關係`)
}

async function main() {
  try {
    await migrateSkillItems()
  } catch (error) {
    console.error('遷移失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()