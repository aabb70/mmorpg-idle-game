import { Request, Response } from 'express'
import { PrismaClient, ChatMessageType } from '@prisma/client'
import { Server as SocketIOServer } from 'socket.io'

const prisma = new PrismaClient()

// 獲取聊天記錄
export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 50, offset = 0 } = req.query
    
    const messages = await prisma.chatMessage.findMany({
      where: {
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            level: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    // 反轉消息順序，讓最新消息在底部
    const reversedMessages = messages.reverse()

    res.json({
      success: true,
      messages: reversedMessages
    })
  } catch (error: any) {
    console.error('獲取聊天記錄失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 發送聊天消息
export const sendChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ success: false, error: '未授權' })
      return
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ success: false, error: '消息內容不能為空' })
      return
    }

    if (content.length > 500) {
      res.status(400).json({ success: false, error: '消息內容過長（最多500字符）' })
      return
    }

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        level: true
      }
    })

    if (!user) {
      res.status(404).json({ success: false, error: '用戶不存在' })
      return
    }

    // 創建聊天消息
    const message = await prisma.chatMessage.create({
      data: {
        userId,
        content: content.trim(),
        messageType: ChatMessageType.GENERAL
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            level: true
          }
        }
      }
    })

    // 通過Socket.io廣播消息
    const io: SocketIOServer = req.app.get('io')
    if (io) {
      io.emit('newChatMessage', message)
    }

    res.json({
      success: true,
      message
    })
  } catch (error: any) {
    console.error('發送聊天消息失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 發送系統消息（用於Boss擊敗、升級等公告）
export const sendSystemMessage = async (content: string, messageType: ChatMessageType = ChatMessageType.SYSTEM, io?: SocketIOServer) => {
  try {
    // 創建系統消息（使用系統用戶ID或第一個用戶ID作為佔位符）
    const systemUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' }
    })

    if (!systemUser) return

    const message = await prisma.chatMessage.create({
      data: {
        userId: systemUser.id, // 系統消息暫時使用第一個用戶的ID
        content,
        messageType
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            level: true
          }
        }
      }
    })

    // 修改消息以顯示為系統消息
    const systemMessage = {
      ...message,
      user: {
        id: 'system',
        username: '系統',
        level: 999
      }
    }

    // 廣播系統消息
    if (io) {
      io.emit('newChatMessage', systemMessage)
    }

    return systemMessage
  } catch (error) {
    console.error('發送系統消息失敗:', error)
  }
}

// 管理員刪除消息
export const deleteChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const adminUserId = req.user?.id

    if (!adminUserId) {
      res.status(401).json({ success: false, error: '未授權' })
      return
    }

    // 檢查消息是否存在
    const message = await prisma.chatMessage.findUnique({
      where: { id }
    })

    if (!message) {
      res.status(404).json({ success: false, error: '消息不存在' })
      return
    }

    // 標記消息為已刪除
    const deletedMessage = await prisma.chatMessage.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy: adminUserId,
        deletedAt: new Date()
      }
    })

    // 通知所有客戶端刪除消息
    const io: SocketIOServer = req.app.get('io')
    if (io) {
      io.emit('messageDeleted', { messageId: id })
    }

    res.json({
      success: true,
      message: '消息已刪除'
    })
  } catch (error: any) {
    console.error('刪除聊天消息失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}