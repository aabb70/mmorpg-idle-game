import { PrismaClient } from '@prisma/client'
import { seedMaterialSystem } from './seeds/materialSystem.js'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🚀 開始初始化新的材料系統...')
    
    // 運行材料系統種子
    await seedMaterialSystem(prisma)
    
    console.log('✅ 材料系統初始化完成!')
  } catch (error) {
    console.error('❌ 材料系統初始化失敗:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()