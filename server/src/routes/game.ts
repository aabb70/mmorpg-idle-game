import { Router } from 'express'
import { getItems, getRecipes, trainSkill, craftItem } from '../controllers/gameController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// 所有遊戲路由都需要認證
router.use(authenticateToken)

router.get('/items', getItems)
router.get('/recipes', getRecipes)
router.post('/train-skill', trainSkill)
router.post('/craft', craftItem)

export default router