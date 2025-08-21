import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material'
import { Add, Refresh, PlayArrow, Edit, Delete, Settings } from '@mui/icons-material'
import BossEditor from './BossEditor'
import BossSettings from './BossSettings'

interface Boss {
  id: string
  name: string
  description: string
  maxHealth: number
  attack: number
  defense: number
  level: number
  weaknessSkills: string[]
  goldReward: number
  expReward: number
  rarity: string
  imageUrl?: string
  itemDrops?: any[]
}

interface BossInstance {
  id: string
  currentHealth: number
  isActive: boolean
  isDefeated: boolean
  startTime: string
  endTime: string
  boss: Boss
}

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3',
  EPIC: '#9C27B0',
  LEGENDARY: '#FF6B35'
}

const skillNames = {
  MINING: '採礦',
  LOGGING: '伐木',
  FISHING: '釣魚',
  FORAGING: '採集',
  SMITHING: '鍛造',
  TAILORING: '裁縫',
  COOKING: '廚師',
  ALCHEMY: '煉金',
  CRAFTING: '工藝'
}

export default function BossManagement() {
  const [bosses, setBosses] = useState<Boss[]>([])
  const [currentBoss, setCurrentBoss] = useState<BossInstance | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [createInstanceDialog, setCreateInstanceDialog] = useState(false)
  const [selectedBossId, setSelectedBossId] = useState('')
  const [instanceDuration, setInstanceDuration] = useState(24)
  const [showEditor, setShowEditor] = useState(false)
  const [editingBossId, setEditingBossId] = useState<string | undefined>(undefined)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    fetchBosses()
    fetchCurrentBoss()
  }, [])

  const fetchBosses = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/bosses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBosses(data.bosses || [])
      } else {
        setMessage('獲取 Boss 列表失敗')
      }
    } catch (error) {
      console.error('獲取 Boss 列表錯誤:', error)
      setMessage('獲取 Boss 列表失敗')
    }
  }

  const fetchCurrentBoss = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/boss/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentBoss(data.bossInstance || null)
      }
    } catch (error) {
      console.error('獲取當前 Boss 錯誤:', error)
    }
  }

  const handleCreateInstance = async () => {
    if (!selectedBossId) {
      setMessage('請選擇 Boss')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/boss-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bossId: selectedBossId,
          duration: instanceDuration
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Boss 實例創建成功！')
        setCreateInstanceDialog(false)
        fetchCurrentBoss()
      } else {
        setMessage(data.error || 'Boss 實例創建失敗')
      }
    } catch (error) {
      console.error('創建 Boss 實例失敗:', error)
      setMessage('創建 Boss 實例失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleInitBosses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/init-bosses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        fetchBosses()
      } else {
        setMessage(data.error || '初始化 Boss 失敗')
      }
    } catch (error) {
      console.error('初始化 Boss 失敗:', error)
      setMessage('初始化 Boss 失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBoss = async (bossId: string) => {
    if (!confirm('確定要刪除這個Boss嗎？這將同時刪除所有相關實例和記錄。')) return

    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/bosses/${bossId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Boss刪除成功！')
        fetchBosses()
      } else {
        setMessage(data.error || 'Boss刪除失敗')
      }
    } catch (error) {
      console.error('Boss刪除失敗:', error)
      setMessage('Boss刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoss = () => {
    setEditingBossId(undefined)
    setShowEditor(true)
  }

  const handleEditBoss = (bossId: string) => {
    setEditingBossId(bossId)
    setShowEditor(true)
  }

  const handleEditorSave = () => {
    setShowEditor(false)
    setEditingBossId(undefined)
    fetchBosses()
    setMessage('Boss保存成功！')
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
    setEditingBossId(undefined)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW')
  }

  const getRemainingTime = (endTime: string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const diff = end - now
    
    if (diff <= 0) return '已結束'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}小時 ${minutes}分鐘`
  }

  if (showSettings) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button 
            onClick={() => setShowSettings(false)}
            sx={{ mr: 2 }}
          >
            ← 返回Boss管理
          </Button>
        </Box>
        <BossSettings />
      </Box>
    )
  }

  if (showEditor) {
    return (
      <BossEditor
        bossId={editingBossId}
        onSave={handleEditorSave}
        onCancel={handleEditorCancel}
      />
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Boss 管理
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setShowSettings(true)}
            disabled={loading}
          >
            Boss設置
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleInitBosses}
            disabled={loading}
          >
            初始化預設 Boss
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleCreateBoss}
            disabled={loading}
          >
            創建新 Boss
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={() => setCreateInstanceDialog(true)}
            disabled={loading || !bosses.length}
          >
            創建 Boss 實例
          </Button>
        </Box>
      </Box>

      {message && (
        <Alert 
          severity={message.includes('成功') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* 當前 Boss 狀態 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            當前活躍 Boss
          </Typography>
          {currentBoss ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>名稱:</strong> {currentBoss.boss.name}
                </Typography>
                <Typography variant="body1">
                  <strong>血量:</strong> {currentBoss.currentHealth.toLocaleString()} / {currentBoss.boss.maxHealth.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  <strong>等級:</strong> {currentBoss.boss.level}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>狀態:</strong> 
                  <Chip 
                    label={currentBoss.isDefeated ? '已擊敗' : '進行中'} 
                    color={currentBoss.isDefeated ? 'success' : 'warning'}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body1">
                  <strong>開始時間:</strong> {formatTime(currentBoss.startTime)}
                </Typography>
                <Typography variant="body1">
                  <strong>剩餘時間:</strong> {getRemainingTime(currentBoss.endTime)}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              當前沒有活躍的 Boss
            </Typography>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Boss 模板列表 */}
      <Typography variant="h6" gutterBottom>
        Boss 模板列表
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名稱</TableCell>
              <TableCell>等級</TableCell>
              <TableCell>稀有度</TableCell>
              <TableCell>血量</TableCell>
              <TableCell>攻擊/防禦</TableCell>
              <TableCell>弱點技能</TableCell>
              <TableCell>獎勵</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bosses.map((boss) => (
              <TableRow key={boss.id}>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {boss.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {boss.description}
                  </Typography>
                  {boss.itemDrops && boss.itemDrops.length > 0 && (
                    <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                      🎁 {boss.itemDrops.length} 種掉落物品
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{boss.level}</TableCell>
                <TableCell>
                  <Chip
                    label={boss.rarity}
                    size="small"
                    sx={{
                      backgroundColor: rarityColors[boss.rarity as keyof typeof rarityColors],
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell>{boss.maxHealth.toLocaleString()}</TableCell>
                <TableCell>{boss.attack} / {boss.defense}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {boss.weaknessSkills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skillNames[skill as keyof typeof skillNames] || skill}
                        size="small"
                        variant="outlined"
                        color="warning"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    金幣: {boss.goldReward}
                  </Typography>
                  <Typography variant="body2">
                    經驗: {boss.expReward}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditBoss(boss.id)}
                      disabled={loading}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBoss(boss.id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 創建 Boss 實例對話框 */}
      <Dialog 
        open={createInstanceDialog} 
        onClose={() => setCreateInstanceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>創建 Boss 實例</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>選擇 Boss</InputLabel>
                <Select
                  value={selectedBossId}
                  onChange={(e) => setSelectedBossId(e.target.value)}
                  label="選擇 Boss"
                >
                  {bosses.map((boss) => (
                    <MenuItem key={boss.id} value={boss.id}>
                      {boss.name} (Lv.{boss.level} - {boss.rarity})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="持續時間 (小時)"
                type="number"
                value={instanceDuration}
                onChange={(e) => setInstanceDuration(parseInt(e.target.value) || 24)}
                inputProps={{ min: 1, max: 168 }}
                helperText="Boss 實例的持續時間，1-168小時"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateInstanceDialog(false)}>
            取消
          </Button>
          <Button
            onClick={handleCreateInstance}
            variant="contained"
            disabled={loading || !selectedBossId}
          >
            {loading ? '創建中...' : '創建實例'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}