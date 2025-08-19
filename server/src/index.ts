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
    res.status(500).json({ success: false, error: error.message })
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