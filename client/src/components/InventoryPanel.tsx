import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material'
import { RootState } from '../store/store'
import { addNotification } from '../store/slices/gameSlice'
import { updateUser } from '../store/slices/authSlice'
import { apiClient } from '../utils/api'
import EquipmentPanel from './EquipmentPanel'

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50', 
  RARE: '#2196F3',
  EPIC: '#9C27B0',
  LEGENDARY: '#FF6B35',
}

// 物品預設價格（根據稀有度）
const getDefaultPrice = (rarity: string, baseValue: number = 0) => {
  const rarityMultipliers = {
    COMMON: 1,
    UNCOMMON: 2,
    RARE: 5,
    EPIC: 15,
    LEGENDARY: 50
  }
  const multiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || 1
  return Math.max(1, Math.floor((baseValue || 10) * multiplier))
}

interface SellDialogState {
  isOpen: boolean
  item: any | null
  quantity: number
  pricePerUnit: number
  isLoading: boolean
}

export default function InventoryPanel() {
  const dispatch = useDispatch()
  const { items } = useSelector((state: RootState) => state.inventory)
  const { user } = useSelector((state: RootState) => state.auth)
  const [sellDialog, setSellDialog] = useState<SellDialogState>({
    isOpen: false,
    item: null,
    quantity: 1,
    pricePerUnit: 0,
    isLoading: false
  })


  const handleSellClick = (item: any) => {
    const defaultPrice = getDefaultPrice(item.rarity, item.baseValue || 10)
    setSellDialog({
      isOpen: true,
      item,
      quantity: 1,
      pricePerUnit: defaultPrice,
      isLoading: false
    })
  }

  const handleSellConfirm = async () => {
    if (!sellDialog.item) return

    try {
      setSellDialog(prev => ({ ...prev, isLoading: true }))
      
      await apiClient.createListing({
        itemId: sellDialog.item.id,
        quantity: sellDialog.quantity,
        pricePerUnit: sellDialog.pricePerUnit
      })

      dispatch(addNotification(`成功上架 ${sellDialog.item.name} x${sellDialog.quantity}！`))
      
      // 重新載入背包資料
      window.location.reload()
      
      handleSellCancel()
      
    } catch (error: any) {
      console.error('上架失敗:', error)
      dispatch(addNotification(error.message || '上架失敗，請稍後再試'))
    } finally {
      setSellDialog(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleSellCancel = () => {
    setSellDialog({
      isOpen: false,
      item: null,
      quantity: 1,
      pricePerUnit: 0,
      isLoading: false
    })
  }

  const handleQuantityChange = (value: number) => {
    const maxQuantity = sellDialog.item?.quantity || 1
    const newQuantity = Math.max(1, Math.min(value, maxQuantity))
    setSellDialog(prev => ({ ...prev, quantity: newQuantity }))
  }

  const handlePriceChange = (value: number) => {
    const newPrice = Math.max(1, value)
    setSellDialog(prev => ({ ...prev, pricePerUnit: newPrice }))
  }

  const setDefaultPrice = () => {
    if (!sellDialog.item) return
    const defaultPrice = getDefaultPrice(sellDialog.item.rarity, sellDialog.item.baseValue || 10)
    setSellDialog(prev => ({ ...prev, pricePerUnit: defaultPrice }))
  }

  const handleUseItem = async (item: any) => {
    if (!user) {
      dispatch(addNotification('用戶未登入'))
      return
    }

    // 檢查是否可以使用此物品
    if (!item.healthRestore && item.itemType !== 'POTION' && !item.name.includes('藥')) {
      dispatch(addNotification('此物品無法使用'))
      return
    }

    // 檢查生命值是否已滿
    if (user.health >= user.maxHealth) {
      dispatch(addNotification('生命值已滿，無需使用治療物品'))
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        dispatch(addNotification('認證失效，請重新登入'))
        return
      }

      // 發送使用物品的請求
      const response = await fetch('https://mmorpg-idle-game.onrender.com/api/game/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: 1
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // 計算恢復的生命值
        const restoreAmount = item.healthRestore || 50 // 預設恢復50點
        const newHealth = Math.min(user.health + restoreAmount, user.maxHealth)
        
        // 更新用戶生命值
        dispatch(updateUser({ health: newHealth }))
        
        // 顯示成功通知
        dispatch(addNotification(`使用 ${item.name}，恢復了 ${newHealth - user.health} 點生命值！`))
        
        // 重新載入背包資料
        window.location.reload()
        
      } else {
        const errorData = await response.json()
        dispatch(addNotification(errorData.message || '使用物品失敗'))
      }
    } catch (error: any) {
      console.error('使用物品錯誤:', error)
      dispatch(addNotification('使用物品失敗，請稍後再試'))
    }
  }

  const handleEquipItem = async (item: any) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        dispatch(addNotification('認證失效，請重新登入'))
        return
      }

      const response = await fetch('https://mmorpg-idle-game.onrender.com/api/equipment/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: item.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        dispatch(addNotification(data.message))
        
        // 重新載入頁面以更新裝備和背包
        window.location.reload()
      } else {
        const errorData = await response.json()
        dispatch(addNotification(errorData.message || '裝備失敗'))
      }
    } catch (error: any) {
      console.error('裝備物品錯誤:', error)
      dispatch(addNotification('裝備失敗，請稍後再試'))
    }
  }

  return (
    <Grid container spacing={3}>
      {/* 左側：背包 */}
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            背包
          </Typography>

          {items.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              背包是空的。開始訓練技能來獲得物品吧！
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {items.map((item) => {
                const rarityColor = rarityColors[item.rarity as keyof typeof rarityColors] || '#9E9E9E'
                const isLegendary = item.rarity === 'LEGENDARY'
                const isEpic = item.rarity === 'EPIC'
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                    <Card 
                      sx={{
                        ...(isLegendary && {
                          border: `2px solid ${rarityColor}`,
                          boxShadow: `0 0 20px ${rarityColor}40, 0 8px 32px rgba(0, 0, 0, 0.3)`,
                          animation: 'legendary-glow 2s ease-in-out infinite alternate',
                          '@keyframes legendary-glow': {
                            '0%': { boxShadow: `0 0 20px ${rarityColor}40, 0 8px 32px rgba(0, 0, 0, 0.3)` },
                            '100%': { boxShadow: `0 0 30px ${rarityColor}60, 0 12px 40px rgba(0, 0, 0, 0.4)` }
                          }
                        }),
                        ...(isEpic && {
                          border: `1px solid ${rarityColor}80`,
                          boxShadow: `0 0 15px ${rarityColor}30, 0 8px 32px rgba(0, 0, 0, 0.3)`,
                        })
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Chip
                            label={item.rarity}
                            size="small"
                            sx={{
                              backgroundColor: rarityColor,
                              color: 'white',
                              fontWeight: 'bold',
                              boxShadow: `0 2px 8px ${rarityColor}50`,
                              ...(isLegendary && {
                                background: `linear-gradient(45deg, ${rarityColor} 30%, #FFD700 90%)`,
                                color: '#000',
                              })
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          類型：{item.itemType}
                          {item.category && ` (${item.category})`}
                        </Typography>
                        {item.description && (
                          <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: 'text.primary' }}>
                            📄 {item.description}
                          </Typography>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            {item.tags.map((tag: any, index: number) => (
                              <Chip
                                key={index}
                                label={tag.name}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                              />
                            ))}
                          </Box>
                        )}
                        <Typography variant="h6" color="primary" gutterBottom>
                          數量：{item.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          建議售價：{getDefaultPrice(item.rarity, item.baseValue || 10)} 金幣
                        </Typography>
                        
                        {/* 顯示物品效果 */}
                        {(item.healthRestore || item.effect) && (
                          <Typography variant="body2" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {item.healthRestore && `❤️ 恢復 ${item.healthRestore} 生命值`}
                            {item.effect && ` ${item.effect}`}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                          {/* 裝備按鈕 - 只對裝備類型物品顯示 */}
                          {item.itemType === 'EQUIPMENT' && item.equipmentSlot && (
                            <Button
                              variant="contained"
                              color="warning"
                              size="small"
                              onClick={() => handleEquipItem(item)}
                              sx={{ flex: 1, minWidth: '70px' }}
                            >
                              裝備
                            </Button>
                          )}
                          
                          {/* 使用物品按鈕 - 只對藥劑類物品顯示 */}
                          {(item.itemType === 'POTION' || item.name.includes('藥') || item.healthRestore) && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleUseItem(item)}
                              sx={{ flex: 1, minWidth: '70px' }}
                            >
                              使用
                            </Button>
                          )}
                          
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleSellClick(item)}
                            sx={{ flex: 1, minWidth: '70px' }}
                          >
                            販售
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </Paper>
      </Grid>

      {/* 右側：裝備 */}
      <Grid item xs={12} lg={4}>
        <EquipmentPanel />
      </Grid>

      {/* 販售對話框 */}
      <Dialog 
        open={sellDialog.isOpen} 
        onClose={handleSellCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          販售物品：{sellDialog.item?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              庫存：{sellDialog.item?.quantity} 個
            </Alert>

            <TextField
              fullWidth
              label="數量"
              type="number"
              value={sellDialog.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              inputProps={{ 
                min: 1, 
                max: sellDialog.item?.quantity || 1 
              }}
              margin="normal"
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
              <TextField
                fullWidth
                label="單價（金幣）"
                type="number"
                value={sellDialog.pricePerUnit}
                onChange={(e) => handlePriceChange(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                margin="normal"
              />
              <Button
                variant="outlined"
                onClick={setDefaultPrice}
                sx={{ mt: 1, minWidth: 100 }}
              >
                建議價格
              </Button>
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" color="primary">
                總收入：{sellDialog.quantity * sellDialog.pricePerUnit} 金幣
              </Typography>
              <Typography variant="body2" color="text.secondary">
                每個 {sellDialog.pricePerUnit} 金幣 × {sellDialog.quantity} 個
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSellCancel}>
            取消
          </Button>
          <Button 
            onClick={handleSellConfirm} 
            variant="contained"
            disabled={sellDialog.isLoading || sellDialog.quantity <= 0 || sellDialog.pricePerUnit <= 0}
          >
            {sellDialog.isLoading ? '上架中...' : '確認上架'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}