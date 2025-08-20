import { Router } from 'express'
import { 
  getAllBosses,
  createBoss,
  updateBoss,
  deleteBoss,
  createBossInstance,
  initDefaultBosses
} from '../controllers/adminBossController.js'
import { authenticateAdmin } from '../middleware/adminAuth.js'

const router = Router()

// 所有管理員 Boss 路由都需要管理員認證
router.use(authenticateAdmin)

// Boss 管理
router.get('/bosses', getAllBosses)
router.post('/bosses', createBoss)
router.put('/bosses/:id', updateBoss)
router.delete('/bosses/:id', deleteBoss)

// Boss 實例管理
router.post('/boss-instance', createBossInstance)

// 初始化預設 Boss
router.post('/init-bosses', initDefaultBosses)

export default router