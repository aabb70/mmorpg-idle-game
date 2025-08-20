import { Router } from 'express'
import { 
  getItems, 
  getRecipes, 
  craftItem, 
  useItem,
  startTargetedTraining, 
  stopTargetedTraining, 
  getOfflineProgress, 
  getAvailableItems 
} from '../controllers/gameController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// 所有遊戲路由都需要認證
router.use(authenticateToken)

router.get('/items', getItems)
router.get('/recipes', getRecipes)
router.post('/craft', craftItem)
router.post('/use', useItem)

// 目標導向訓練路由
router.post('/start-targeted-training', startTargetedTraining)
router.post('/stop-targeted-training', stopTargetedTraining)
router.get('/offline-progress', getOfflineProgress)
router.get('/available-items/:skillType', getAvailableItems)

export default router