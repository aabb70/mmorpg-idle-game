import { Router } from 'express'
import { 
  getUserEquipment, 
  equipItem, 
  unequipItem, 
  getEquipmentStats,
  getEquippableItems,
  initializeUserEquipmentSlots
} from '../controllers/equipmentController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// 獲取用戶裝備
router.get('/', authenticateToken, getUserEquipment)

// 獲取裝備屬性加成
router.get('/stats', authenticateToken, getEquipmentStats)

// 獲取可裝備的物品
router.get('/equippable', authenticateToken, getEquippableItems)

// 穿戴裝備
router.post('/equip', authenticateToken, equipItem)

// 卸下裝備
router.post('/unequip', authenticateToken, unequipItem)

export default router