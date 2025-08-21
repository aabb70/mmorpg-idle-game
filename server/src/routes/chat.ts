import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { authenticateAdmin } from '../middleware/adminAuth'
import { getChatMessages, sendChatMessage, deleteChatMessage } from '../controllers/chatController'

const router = express.Router()

// 獲取聊天記錄（不需要認證，但可以限制頻率）
router.get('/messages', getChatMessages)

// 發送聊天消息（需要用戶認證）
router.post('/send', authenticateToken, sendChatMessage)

// 刪除聊天消息（需要管理員權限）
router.delete('/messages/:id', authenticateAdmin, deleteChatMessage)

export default router