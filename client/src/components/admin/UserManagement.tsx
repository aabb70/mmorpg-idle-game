import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Alert
} from '@mui/material'
import {
  ExpandMore,
  ExpandLess,
  Edit,
  Delete,
  PersonAdd
} from '@mui/icons-material'

interface User {
  id: string
  username: string
  email: string
  level: number
  experience: number
  gold: number
  createdAt: string
  skills: Array<{
    skillType: string
    level: number
    experience: number
  }>
  inventory: Array<{
    quantity: number
    item: {
      id: string
      name: string
      itemType: string
    }
  }>
  _count: {
    marketListings: number
  }
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    user: User | null
    type: 'stats' | 'skill' | null
    skillType?: string
  }>({
    open: false,
    user: null,
    type: null
  })
  const [editValues, setEditValues] = useState({
    level: 0,
    experience: 0,
    gold: 0
  })
  const [message, setMessage] = useState('')

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('獲取用戶列表失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const handleEditStats = (user: User) => {
    setEditDialog({
      open: true,
      user,
      type: 'stats'
    })
    setEditValues({
      level: user.level,
      experience: user.experience,
      gold: user.gold
    })
  }

  const handleSaveStats = async () => {
    if (!editDialog.user) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${editDialog.user.id}/stats`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editValues)
        }
      )

      if (response.ok) {
        setMessage('用戶統計更新成功')
        fetchUsers()
        setEditDialog({ open: false, user: null, type: null })
      }
    } catch (error) {
      console.error('更新用戶統計失敗:', error)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`確定要刪除用戶 "${username}" 嗎？這將刪除所有相關數據且無法恢復！`)) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setMessage(`用戶 "${username}" 已被刪除`)
        fetchUsers()
      }
    } catch (error) {
      console.error('刪除用戶失敗:', error)
    }
  }

  if (loading) {
    return <Typography>載入中...</Typography>
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        用戶管理 ({users.length} 個用戶)
      </Typography>

      {message && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }} 
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>展開</TableCell>
              <TableCell>用戶名</TableCell>
              <TableCell>郵箱</TableCell>
              <TableCell>等級</TableCell>
              <TableCell>經驗值</TableCell>
              <TableCell>金幣</TableCell>
              <TableCell>註冊時間</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <>
                <TableRow key={user.id}>
                  <TableCell>
                    <IconButton
                      onClick={() => toggleExpanded(user.id)}
                      size="small"
                    >
                      {expandedUsers.has(user.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.level}</TableCell>
                  <TableCell>{user.experience}</TableCell>
                  <TableCell>{user.gold}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditStats(user)}
                      color="primary"
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={expandedUsers.has(user.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          詳細信息
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">技能:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {user.skills.map((skill) => (
                              <Chip
                                key={skill.skillType}
                                label={`${skill.skillType}: Lv.${skill.level} (${skill.experience} EXP)`}
                                size="small"
                                color="primary"
                              />
                            ))}
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">背包物品:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {user.inventory.map((inv, index) => (
                              <Chip
                                key={index}
                                label={`${inv.item.name} x${inv.quantity}`}
                                size="small"
                                color="secondary"
                              />
                            ))}
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          市場列表數量: {user._count.marketListings}
                        </Typography>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 編輯統計對話框 */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null, type: null })}>
        <DialogTitle>
          編輯用戶統計 - {editDialog.user?.username}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="等級"
            type="number"
            value={editValues.level}
            onChange={(e) => setEditValues(prev => ({ ...prev, level: parseInt(e.target.value) }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="經驗值"
            type="number"
            value={editValues.experience}
            onChange={(e) => setEditValues(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="金幣"
            type="number"
            value={editValues.gold}
            onChange={(e) => setEditValues(prev => ({ ...prev, gold: parseInt(e.target.value) }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null, type: null })}>
            取消
          </Button>
          <Button onClick={handleSaveStats} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}