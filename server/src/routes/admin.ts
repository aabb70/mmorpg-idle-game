import { Router } from 'express'
import { 
  getAllUsers, 
  getUserById, 
  updateUserStats,
  giveItemToUser,
  updateUserSkills,
  deleteUser,
  adminLogin,
  cleanAndReinitializeMaterials
} from '../controllers/adminController.js'
import { initializeUserEquipmentSlots } from '../controllers/equipmentController.js'
import { authenticateAdmin } from '../middleware/adminAuth.js'

const router = Router()

// 管理員登入 (不需要認證)
router.post('/login', adminLogin)

// 所有其他路由都需要管理員認證
router.use(authenticateAdmin)

// 用戶管理
router.get('/users', getAllUsers)
router.get('/users/:userId', getUserById)
router.put('/users/:userId/stats', updateUserStats)
router.put('/users/:userId/skills', updateUserSkills)
router.delete('/users/:userId', deleteUser)

// 物品管理
router.post('/users/:userId/items', giveItemToUser)

// 系統管理
router.post('/clean-materials', cleanAndReinitializeMaterials)

// 裝備系統管理
router.post('/init-equipment-slots', initializeUserEquipmentSlots)

export default router