import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateMaxSkillLevel() {
  console.log('開始設定最高技能等級...')
  
  // 設定所有小於等於0的maxSkillLevel為50
  const result = await prisma.skillItem.updateMany({
    where: {
      OR: [
        { maxSkillLevel: { lte: 0 } },
        { maxSkillLevel: undefined }
      ]
    },
    data: {
      maxSkillLevel: 50
    }
  })
  
  console.log(`更新了 ${result.count} 個記錄的最高技能等級`)
  
  // 同時移除baseSuccessRate（準備移除該欄位）
  try {
    await prisma.$executeRaw`ALTER TABLE skill_items DROP COLUMN IF EXISTS "baseSuccessRate"`
    console.log('已移除baseSuccessRate欄位')
  } catch (error) {
    console.log('移除baseSuccessRate欄位時出現錯誤（可能已不存在）:', error)
  }
}

updateMaxSkillLevel()
  .catch(console.error)
  .finally(() => prisma.$disconnect())