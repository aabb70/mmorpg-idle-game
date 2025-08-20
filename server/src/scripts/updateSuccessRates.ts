import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateSuccessRates() {
  console.log('開始更新成功率範圍...')
  
  const result = await prisma.skillItem.updateMany({
    data: {
      minSuccessRate: 0.3,
      maxSuccessRate: 0.8
    }
  })
  
  console.log(`更新了 ${result.count} 個記錄`)
  
  // 驗證更新結果
  const updated = await prisma.skillItem.findMany({
    select: {
      id: true,
      minSuccessRate: true,
      maxSuccessRate: true,
      item: {
        select: {
          name: true
        }
      }
    },
    take: 5
  })
  
  console.log('前5個記錄:')
  updated.forEach(item => {
    console.log(`${item.item.name}: ${item.minSuccessRate} - ${item.maxSuccessRate}`)
  })
}

updateSuccessRates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())