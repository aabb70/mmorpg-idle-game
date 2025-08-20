import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import { RootState } from '../store/store'
import { addNotification } from '../store/slices/gameSlice'
import { apiClient } from '../utils/api'

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3', 
  EPIC: '#9C27B0',
  LEGENDARY: '#FF6B35',
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface PurchaseDialogState {
  isOpen: boolean
  listing: any | null
  quantity: number
  isLoading: boolean
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`market-tabpanel-${index}`}
      aria-labelledby={`market-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

export default function MarketPanel() {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [listings, setListings] = useState<any[]>([])
  const [myListings, setMyListings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [purchaseDialog, setPurchaseDialog] = useState<PurchaseDialogState>({
    isOpen: false,
    listing: null,
    quantity: 1,
    isLoading: false
  })

  // 載入市場資料
  useEffect(() => {
    loadMarketData()
  }, [tab])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      if (tab === 0) {
        const response = await apiClient.getMarketListings()
        setListings(response.listings || [])
      } else {
        const response = await apiClient.getMyListings()
        setMyListings(response.listings || [])
      }
    } catch (error) {
      console.error('載入市場資料失敗:', error)
      dispatch(addNotification('載入市場資料失敗'))
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing =>
    listing.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePurchaseClick = (listing: any) => {
    setPurchaseDialog({
      isOpen: true,
      listing,
      quantity: 1,
      isLoading: false
    })
  }

  const handlePurchaseConfirm = async () => {
    if (!purchaseDialog.listing) return

    try {
      setPurchaseDialog(prev => ({ ...prev, isLoading: true }))
      
      await apiClient.purchaseItem({
        listingId: purchaseDialog.listing.id,
        quantity: purchaseDialog.quantity
      })

      const totalCost = purchaseDialog.quantity * purchaseDialog.listing.pricePerUnit
      dispatch(addNotification(`成功購買 ${purchaseDialog.listing.itemName} x${purchaseDialog.quantity}，花費 ${totalCost} 金幣！`))
      
      handlePurchaseCancel()
      loadMarketData()
      
    } catch (error: any) {
      console.error('購買失敗:', error)
      dispatch(addNotification(error.message || '購買失敗，請稍後再試'))
    } finally {
      setPurchaseDialog(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handlePurchaseCancel = () => {
    setPurchaseDialog({
      isOpen: false,
      listing: null,
      quantity: 1,
      isLoading: false
    })
  }

  const handleRemoveListing = async (listingId: string) => {
    try {
      await apiClient.removeListing(listingId)
      dispatch(addNotification('商品下架成功！'))
      loadMarketData()
    } catch (error: any) {
      console.error('下架失敗:', error)
      dispatch(addNotification(error.message || '下架失敗，請稍後再試'))
    }
  }

  const handleQuantityChange = (value: number) => {
    const maxQuantity = purchaseDialog.listing?.quantity || 1
    const newQuantity = Math.max(1, Math.min(value, maxQuantity))
    setPurchaseDialog(prev => ({ ...prev, quantity: newQuantity }))
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        市場交易
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="瀏覽市場" />
          <Tab label="我的商品" />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="搜尋物品或賣家"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="normal"
          />
        </Box>

{loading ? (
          <Typography variant="body1" color="text.secondary">
            載入中...
          </Typography>
        ) : filteredListings.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? '沒有找到相關物品' : '目前市場上沒有物品'}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredListings.map((listing) => {
              const rarityColor = rarityColors[listing.itemRarity as keyof typeof rarityColors] || '#9E9E9E'
              const isLegendary = listing.itemRarity === 'LEGENDARY'
              const isEpic = listing.itemRarity === 'EPIC'
              
              return (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
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
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {listing.itemName}
                      </Typography>
                      {listing.itemRarity && (
                        <Chip
                          label={listing.itemRarity}
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
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      賣家：{listing.sellerName}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={`剩餘：${listing.quantity}`} size="small" color="info" />
                      <Chip
                        label={`${listing.pricePerUnit} 金幣/個`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1" color="primary" gutterBottom>
                      總價：{listing.totalPrice} 金幣
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        disabled={listing.sellerName === user?.username}
                        onClick={() => handlePurchaseClick(listing)}
                      >
                        {listing.sellerName === user?.username ? '自己的商品' : '購買'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )})}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tab} index={1}>
        {loading ? (
          <Typography variant="body1" color="text.secondary">
            載入中...
          </Typography>
        ) : myListings.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            你還沒有上架任何物品。前往背包頁面販售你的物品！
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {myListings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {listing.itemName}
                      </Typography>
                      {listing.itemRarity && (
                        <Chip
                          label={listing.itemRarity}
                          size="small"
                          sx={{
                            backgroundColor: rarityColors[listing.itemRarity as keyof typeof rarityColors] || '#9E9E9E',
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={`剩餘：${listing.quantity}`} size="small" color="info" />
                      <Chip
                        label={`${listing.pricePerUnit} 金幣/個`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1" color="primary" gutterBottom>
                      總價值：{listing.totalPrice} 金幣
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      上架時間：{new Date(listing.createdAt).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        fullWidth
                        onClick={() => handleRemoveListing(listing.id)}
                      >
                        下架商品
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* 購買對話框 */}
      <Dialog 
        open={purchaseDialog.isOpen} 
        onClose={handlePurchaseCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          購買物品：{purchaseDialog.listing?.itemName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                賣家：{purchaseDialog.listing?.sellerName}
              </Typography>
              <Typography variant="body2">
                庫存：{purchaseDialog.listing?.quantity} 個
              </Typography>
              <Typography variant="body2">
                單價：{purchaseDialog.listing?.pricePerUnit} 金幣/個
              </Typography>
              <Typography variant="body2" color="primary">
                你的金幣：{user?.gold || 0}
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="購買數量"
              type="number"
              value={purchaseDialog.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              inputProps={{ 
                min: 1, 
                max: purchaseDialog.listing?.quantity || 1 
              }}
              margin="normal"
            />

            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" color="primary">
                總費用：{purchaseDialog.quantity * (purchaseDialog.listing?.pricePerUnit || 0)} 金幣
              </Typography>
              <Typography variant="body2" color="text.secondary">
                每個 {purchaseDialog.listing?.pricePerUnit || 0} 金幣 × {purchaseDialog.quantity} 個
              </Typography>
              {(purchaseDialog.quantity * (purchaseDialog.listing?.pricePerUnit || 0)) > (user?.gold || 0) && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  金幣不足！
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePurchaseCancel}>
            取消
          </Button>
          <Button 
            onClick={handlePurchaseConfirm} 
            variant="contained"
            disabled={
              purchaseDialog.isLoading || 
              purchaseDialog.quantity <= 0 || 
              (purchaseDialog.quantity * (purchaseDialog.listing?.pricePerUnit || 0)) > (user?.gold || 0)
            }
          >
            {purchaseDialog.isLoading ? '購買中...' : '確認購買'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}