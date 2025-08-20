import { Router } from 'express'
import { 
  getCurrentBoss,
  attackBoss,
  getBossHistory
} from '../controllers/bossController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// 所有 Boss 路由都需要認證
router.use(authenticateToken)

// 獲取當前活躍的 Boss
router.get('/current', getCurrentBoss)

// 攻擊 Boss
router.post('/attack', attackBoss)

// 獲取 Boss 戰鬥歷史
router.get('/history', getBossHistory)

export default router