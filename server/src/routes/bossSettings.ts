import { Router } from 'express'
import { 
  getBossSettings,
  updateBossSettings,
  switchToNextBoss
} from '../controllers/bossSettingsController.js'
import { authenticateAdmin } from '../middleware/adminAuth.js'

const router = Router()

// 所有Boss設置路由都需要管理員認證
router.use(authenticateAdmin)

// Boss設置管理
router.get('/settings', getBossSettings)
router.put('/settings', updateBossSettings)

// 手動切換Boss
router.post('/switch', switchToNextBoss)

export default router