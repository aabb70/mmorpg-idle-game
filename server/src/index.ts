import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// 路由導入
import authRoutes from './routes/auth.js'
import gameRoutes from './routes/game.js'
import marketRoutes from './routes/market.js'
import initRoutes from './routes/init.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://bespoke-lolly-ce99b9.netlify.app"],
    methods: ["GET", "POST"]
  }
})

const prisma = new PrismaClient()
const PORT = process.env.PORT || 5000

// 更新CORS設置以允許生產環境域名
app.use(cors({
  origin: ["http://localhost:3000", "https://bespoke-lolly-ce99b9.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MMORPG Idle Game Server is running!' })
})

// 公開API：檢查材料系統狀態
app.get('/api/material-status', async (req, res) => {
  try {
    const materialCount = await prisma.item.count({
      where: { itemType: 'MATERIAL' }
    })
    const tagCount = await prisma.tag.count()
    const recipeCount = await prisma.recipe.count()
    
    res.json({
      materialCount,
      tagCount,
      recipeCount,
      hasMaterialSystem: materialCount > 0 && tagCount > 0
    })
  } catch (error) {
    console.error('檢查材料系統狀態失敗:', error)
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

// 管理員API：初始化材料系統
app.post('/api/admin/init-materials', async (req, res) => {
  try {
    // 先測試資料庫連接
    await prisma.$connect()
    console.log('資料庫連接測試成功')
    
    // 測試簡單查詢
    const userCount = await prisma.user.count()
    console.log(`目前用戶數量: ${userCount}`)
    
    const { seedMaterialSystem } = await import('./seeds/materialSystem.js')
    await seedMaterialSystem(prisma)
    res.json({ success: true, message: '材料系統初始化完成' })
  } catch (error) {
    console.error('材料系統初始化失敗:', error)
    res.status(500).json({ success: false, error: (error as Error).message })
  }
})

// 診斷物品端點 (無需認證)
app.get('/api/debug-items', async (req, res) => {
  try {
    const materials = await prisma.item.findMany({
      where: { itemType: 'MATERIAL' },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    res.json({
      success: true,
      count: materials.length,
      materials: materials.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        rarity: item.rarity,
        tags: item.tags.map(t => t.tag.name)
      }))
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 緊急清理材料系統 API (無需認證)
app.post('/api/emergency-clean-materials', async (req, res) => {
  try {
    console.log('🚨 緊急清理舊材料系統...')
    
    // 清理舊的材料和相關數據
    await prisma.$transaction(async (tx: any) => {
      // 先刪除所有離線訓練記錄（避免外鍵約束）
      await tx.offlineTraining.deleteMany({})
      
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
    const { seedMaterialSystem } = await import('./seeds/materialSystem.js')
    await seedMaterialSystem(prisma)
    
    console.log('✅ 材料系統重新初始化完成')
    
    res.json({
      success: true,
      message: '緊急清理完成，材料系統已重新初始化',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ 緊急清理材料系統錯誤:', error)
    res.status(500).json({ success: false, message: '緊急清理失敗', error: error.message })
  }
})

// 應用路由
app.use('/api/auth', authRoutes)
app.use('/api/game', gameRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/init', initRoutes)
app.use('/api/admin', adminRoutes)

// Socket.io 連接處理
io.on('connection', (socket) => {
  console.log('用戶已連接:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('用戶已斷開連接:', socket.id)
  })
  
  // 加入遊戲房間
  socket.on('join-game', (userData) => {
    socket.join('game-room')
    socket.emit('game-joined', { message: '成功加入遊戲！' })
    
    // 廣播新玩家加入
    socket.to('game-room').emit('player-joined', {
      message: `${userData.username} 加入了遊戲！`
    })
  })
  
  // 技能訓練廣播
  socket.on('skill-level-up', (data) => {
    socket.to('game-room').emit('player-level-up', {
      username: data.username,
      skillType: data.skillType,
      level: data.level
    })
  })
  
  // 市場更新廣播
  socket.on('market-update', (data) => {
    socket.to('game-room').emit('market-changed', data)
  })
})

// 啟動服務器
server.listen(PORT, async () => {
  console.log(`服務器運行在 http://localhost:${PORT}`)
  
  // 檢查資料庫連接
  try {
    await prisma.$connect()
    console.log('資料庫連接成功')
  } catch (error) {
    console.error('資料庫連接失敗:', error)
  }
})

export { app, io, prisma }