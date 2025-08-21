import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { PrismaClient, SkillType, Rarity } from '@prisma/client'

// 路由導入
import authRoutes from './routes/auth.js'
import gameRoutes from './routes/game.js'
import marketRoutes from './routes/market.js'
import initRoutes from './routes/init.js'
import adminRoutes from './routes/admin.js'
import adminItemRoutes from './routes/adminItems.js'
import adminBossRoutes from './routes/adminBoss.js'
import bossRoutes from './routes/boss.js'
import equipmentRoutes from './routes/equipment.js'
import bossSettingsRoutes from './routes/bossSettings.js'
import chatRoutes from './routes/chat.js'
import { checkAndSwitchBoss } from './controllers/bossSettingsController.js'

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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
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

// 調試配方端點 (無需認證)
app.get('/api/debug-recipes', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        item: true,
        ingredients: {
          include: {
            item: true,
            tag: true
          }
        }
      }
    })

    res.json({
      success: true,
      count: recipes.length,
      recipes: recipes.map(recipe => ({
        id: recipe.id,
        skillType: recipe.skillType,
        skillLevel: recipe.skillLevel,
        item: {
          id: recipe.item.id,
          name: recipe.item.name,
          rarity: recipe.item.rarity
        },
        ingredients: recipe.ingredients.map(ing => ({
          quantity: ing.quantity,
          item: ing.item ? ing.item.name : null,
          category: ing.category,
          tag: ing.tag ? ing.tag.name : null
        }))
      }))
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
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

// 初始化預設 Boss API (無需認證)
app.post('/api/init-bosses', async (req, res) => {
  try {
    console.log('🎯 開始初始化預設 Boss...')

    const defaultBosses = [
      {
        name: '森林守衛',
        description: '保護森林的強大守衛者，對伐木技能較弱',
        maxHealth: 50000,
        attack: 80,
        defense: 30,
        level: 1,
        weaknessSkills: [SkillType.LOGGING],
        goldReward: 500,
        expReward: 250,
        rarity: Rarity.COMMON
      },
      {
        name: '礦坑霸主',
        description: '深居礦坑的巨大生物，懼怕採礦工具',
        maxHealth: 75000,
        attack: 120,
        defense: 50,
        level: 5,
        weaknessSkills: [SkillType.MINING],
        goldReward: 800,
        expReward: 400,
        rarity: Rarity.UNCOMMON
      },
      {
        name: '深海海怪',
        description: '海洋深處的恐怖存在，釣魚高手能更有效對付它',
        maxHealth: 100000,
        attack: 150,
        defense: 70,
        level: 10,
        weaknessSkills: [SkillType.FISHING],
        goldReward: 1200,
        expReward: 600,
        rarity: Rarity.RARE
      },
      {
        name: '煉金術師之影',
        description: '被邪惡煉金術腐蝕的靈魂，對煉金和鍛造技能敏感',
        maxHealth: 150000,
        attack: 200,
        defense: 100,
        level: 15,
        weaknessSkills: [SkillType.ALCHEMY, SkillType.SMITHING],
        goldReward: 2000,
        expReward: 1000,
        rarity: Rarity.EPIC
      },
      {
        name: '全能魔王',
        description: '傳說中的終極Boss，所有技能都能對其造成傷害',
        maxHealth: 300000,
        attack: 300,
        defense: 150,
        level: 25,
        weaknessSkills: [SkillType.MINING, SkillType.LOGGING, SkillType.FISHING, SkillType.FORAGING, SkillType.SMITHING, SkillType.TAILORING, SkillType.COOKING, SkillType.ALCHEMY, SkillType.CRAFTING],
        goldReward: 5000,
        expReward: 2500,
        rarity: Rarity.LEGENDARY
      }
    ]

    // 檢查是否已有 Boss
    const existingBossCount = await prisma.boss.count()
    if (existingBossCount > 0) {
      console.log(`發現 ${existingBossCount} 個現有 Boss，跳過初始化`)
      res.json({
        success: true,
        message: `已有 ${existingBossCount} 個 Boss，無需初始化`
      })
      return
    }

    // 創建預設 Boss
    const createdBosses = []
    for (const bossData of defaultBosses) {
      const boss = await prisma.boss.create({
        data: bossData
      })
      createdBosses.push(boss)
      console.log(`✅ 創建 Boss: ${boss.name}`)
    }

    console.log(`🎉 成功初始化 ${createdBosses.length} 個預設 Boss`)

    res.json({
      success: true,
      message: `成功初始化 ${createdBosses.length} 個預設 Boss`,
      bosses: createdBosses
    })
  } catch (error: any) {
    console.error('❌ 初始化預設 Boss 失敗:', error)
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
app.use('/api/admin', adminItemRoutes)
app.use('/api/admin', adminBossRoutes)
app.use('/api/admin/boss', bossSettingsRoutes)
app.use('/api/boss', bossRoutes)
app.use('/api/equipment', equipmentRoutes)
app.use('/api/chat', chatRoutes)

// 將io實例設置到app中，供控制器使用
app.set('io', io)

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
  console.log(`🚀 服務器運行在 http://localhost:${PORT}`)
  
  // 檢查資料庫連接
  try {
    await prisma.$connect()
    console.log('資料庫連接成功')
    
    // 啟動Boss自動切換定時任務 (每30分鐘檢查一次)
    setInterval(async () => {
      try {
        await checkAndSwitchBoss()
      } catch (error) {
        console.error('Boss自動切換檢查失敗:', error)
      }
    }, 30 * 60 * 1000) // 30分鐘
    
    console.log('🤖 Boss自動切換定時任務已啟動 (每30分鐘檢查)')
  } catch (error) {
    console.error('資料庫連接失敗:', error)
  }
})

export { app, io, prisma }