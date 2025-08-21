import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import { Send, Chat, Refresh } from '@mui/icons-material'
import { RootState } from '../store/store'
import { io, Socket } from 'socket.io-client'

interface ChatUser {
  id: string
  username: string
  level: number
}

interface ChatMessage {
  id: string
  content: string
  messageType: 'GENERAL' | 'SYSTEM' | 'BOSS_DEFEAT' | 'LEVEL_UP'
  createdAt: string
  user: ChatUser
}

export default function ChatPanel() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // 自動滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化Socket.io連接和載入聊天記錄
  useEffect(() => {
    // 載入聊天記錄
    fetchChatMessages()

    // 建立Socket.io連接
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('聊天室連接成功')
      setConnecting(false)
      setError('')
    })

    socketInstance.on('disconnect', () => {
      console.log('聊天室連接斷開')
      setConnecting(true)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('聊天室連接錯誤:', error)
      setError('連接聊天室失敗')
      setConnecting(false)
    })

    // 監聽新消息
    socketInstance.on('newChatMessage', (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })

    // 監聽消息刪除
    socketInstance.on('messageDeleted', ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const fetchChatMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/messages?limit=100`)
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setError('')
      } else {
        setError('載入聊天記錄失敗')
      }
    } catch (error: any) {
      console.error('載入聊天記錄錯誤:', error)
      setError('載入聊天記錄失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || loading) return

    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        setNewMessage('')
        setError('')
        // 消息會通過Socket.io即時顯示，不需要手動添加
      } else {
        const data = await response.json()
        setError(data.error || '發送消息失敗')
      }
    } catch (error: any) {
      console.error('發送消息錯誤:', error)
      setError('發送消息失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return '剛剛'
    if (diffMinutes < 60) return `${diffMinutes}分鐘前`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}小時前`
    
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMessageTypeColor = (messageType: string) => {
    switch (messageType) {
      case 'SYSTEM': return 'info'
      case 'BOSS_DEFEAT': return 'success'
      case 'LEVEL_UP': return 'warning'
      default: return 'default'
    }
  }

  const isSystemMessage = (message: ChatMessage) => {
    return message.user.id === 'system' || message.messageType !== 'GENERAL'
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 聊天室標題 */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chat color="primary" />
            <Typography variant="h6">
              聊天室
            </Typography>
            {connecting && (
              <Chip 
                label="連接中..." 
                size="small" 
                color="warning"
                icon={<CircularProgress size={12} />}
              />
            )}
            {!connecting && socket?.connected && (
              <Chip label="已連接" size="small" color="success" />
            )}
          </Box>
          <IconButton size="small" onClick={fetchChatMessages} disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* 聊天消息列表 */}
      <Box 
        ref={chatContainerRef}
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 1,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px'
          }
        }}
      >
        {loading && messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List dense>
            {messages.map((message) => (
              <ListItem 
                key={message.id} 
                sx={{ 
                  px: 1, 
                  py: 0.5,
                  bgcolor: isSystemMessage(message) ? 'action.hover' : 'transparent',
                  borderRadius: 1,
                  mb: 0.5
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: isSystemMessage(message) ? 'bold' : 'normal',
                          color: isSystemMessage(message) ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {message.user.username}
                      </Typography>
                      
                      {!isSystemMessage(message) && (
                        <Chip 
                          label={`Lv.${message.user.level}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 16, fontSize: '0.7rem' }}
                        />
                      )}
                      
                      {message.messageType !== 'GENERAL' && (
                        <Chip 
                          label={message.messageType}
                          size="small"
                          color={getMessageTypeColor(message.messageType) as any}
                          sx={{ height: 16, fontSize: '0.7rem' }}
                        />
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 0.5,
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {message.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* 消息輸入區 */}
      {user ? (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="輸入消息..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || connecting}
              multiline
              maxRows={3}
              inputProps={{ maxLength: 500 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading || connecting}
              startIcon={loading ? <CircularProgress size={16} /> : <Send />}
              sx={{ minWidth: '60px' }}
            >
              發送
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {newMessage.length}/500 • 按Enter發送
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            請先登入才能發送消息
          </Typography>
        </Box>
      )}
    </Paper>
  )
}