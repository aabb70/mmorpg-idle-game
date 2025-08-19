import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Alert,
  Autocomplete,
  Card,
  CardContent,
  Chip
} from '@mui/material'

interface User {
  id: string
  username: string
  email: string
}

interface Item {
  id: string
  name: string
  description: string
  itemType: string
  rarity: string
  baseValue: number
}

export default function ItemManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
    }
  }

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/game/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('獲取物品列表失敗:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchItems()
  }, [])

  const handleGiveItem = async () => {
    if (!selectedUser || !selectedItem || quantity <= 0) {
      setMessage('請選擇用戶、物品並輸入有效數量')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${selectedUser.id}/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            itemId: selectedItem.id,
            quantity: quantity
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessage(`成功發放 ${quantity} 個 "${selectedItem.name}" 給 ${selectedUser.username}`)
        // 重置選擇
        setSelectedUser(null)
        setSelectedItem(null)
        setQuantity(1)
      } else {
        const errorData = await response.json()
        setMessage(`發放失敗: ${errorData.message}`)
      }
    } catch (error) {
      setMessage('發放物品時發生錯誤')
      console.error('發放物品失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'default'
      case 'UNCOMMON': return 'primary'
      case 'RARE': return 'secondary'
      case 'EPIC': return 'warning'
      case 'LEGENDARY': return 'error'
      default: return 'default'
    }
  }

  const getTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'MATERIAL': return 'info'
      case 'TOOL': return 'success'
      case 'EQUIPMENT': return 'warning'
      case 'CONSUMABLE': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        物品發放系統
      </Typography>

      {message && (
        <Alert 
          severity={message.includes('成功') ? 'success' : 'error'} 
          sx={{ mb: 3 }} 
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 發放物品區域 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📦 發放物品
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Autocomplete
                options={users}
                getOptionLabel={(user) => `${user.username} (${user.email})`}
                value={selectedUser}
                onChange={(_, newValue) => setSelectedUser(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="選擇用戶" />
                )}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Autocomplete
                options={items}
                getOptionLabel={(item) => `${item.name} - ${item.description}`}
                value={selectedItem}
                onChange={(_, newValue) => setSelectedItem(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="選擇物品" />
                )}
                renderOption={(props, item) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">{item.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip 
                          label={item.itemType} 
                          size="small" 
                          color={getTypeColor(item.itemType) as any}
                        />
                        <Chip 
                          label={item.rarity} 
                          size="small" 
                          color={getRarityColor(item.rarity) as any}
                        />
                        <Chip 
                          label={`價值: ${item.baseValue}`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              />
            </FormControl>

            <TextField
              fullWidth
              label="數量"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              sx={{ mb: 3 }}
              inputProps={{ min: 1 }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleGiveItem}
              disabled={loading || !selectedUser || !selectedItem}
              size="large"
            >
              {loading ? '發放中...' : '發放物品'}
            </Button>
          </Paper>
        </Grid>

        {/* 物品列表區域 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎒 遊戲物品列表 ({items.length} 項)
            </Typography>
            
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {items.map((item) => (
                <Card key={item.id} sx={{ mb: 1, cursor: 'pointer' }} 
                      onClick={() => setSelectedItem(item)}
                      variant={selectedItem?.id === item.id ? 'outlined' : 'elevation'}>
                  <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip 
                            label={item.itemType} 
                            size="small" 
                            color={getTypeColor(item.itemType) as any}
                          />
                          <Chip 
                            label={item.rarity} 
                            size="small" 
                            color={getRarityColor(item.rarity) as any}
                          />
                        </Box>
                        <Typography variant="caption" align="center">
                          💰 {item.baseValue}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 選中的物品和用戶預覽 */}
      {(selectedUser || selectedItem) && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            📋 當前選擇
          </Typography>
          <Grid container spacing={2}>
            {selectedUser && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">目標用戶:</Typography>
                <Chip label={selectedUser.username} color="primary" />
              </Grid>
            )}
            {selectedItem && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">選中物品:</Typography>
                <Chip label={`${selectedItem.name} x${quantity}`} color="secondary" />
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Box>
  )
}