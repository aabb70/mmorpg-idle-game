import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Divider
} from '@mui/material'
import { Add, Delete, Edit, Save, Cancel } from '@mui/icons-material'

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
  itemDrops?: BossItemDrop[]
}

interface BossItemDrop {
  id: string
  itemId: string
  item: {
    id: string
    name: string
    description: string
    rarity: string
    itemType: string
  }
  dropRate: number
  minQuantity: number
  maxQuantity: number
  killerOnly: boolean
}

interface Item {
  id: string
  name: string
  description: string
  itemType: string
  rarity: string
  baseValue: number
}

const skillTypes = [
  { value: 'MINING', label: '採礦' },
  { value: 'LOGGING', label: '伐木' },
  { value: 'FISHING', label: '釣魚' },
  { value: 'FORAGING', label: '採集' },
  { value: 'SMITHING', label: '鍛造' },
  { value: 'TAILORING', label: '裁縫' },
  { value: 'COOKING', label: '廚師' },
  { value: 'ALCHEMY', label: '煉金' },
  { value: 'CRAFTING', label: '工藝' }
]

const rarityTypes = [
  { value: 'COMMON', label: '普通', color: '#9E9E9E' },
  { value: 'UNCOMMON', label: '不常見', color: '#4CAF50' },
  { value: 'RARE', label: '稀有', color: '#2196F3' },
  { value: 'EPIC', label: '史詩', color: '#9C27B0' },
  { value: 'LEGENDARY', label: '傳奇', color: '#FF6B35' }
]

interface BossEditorProps {
  bossId?: string
  onSave?: () => void
  onCancel?: () => void
}

export default function BossEditor({ bossId, onSave, onCancel }: BossEditorProps) {
  const [boss, setBoss] = useState<Boss>({
    id: '',
    name: '',
    description: '',
    maxHealth: 100000,
    attack: 100,
    defense: 50,
    level: 1,
    weaknessSkills: [],
    goldReward: 1000,
    expReward: 500,
    rarity: 'COMMON',
    itemDrops: []
  })
  
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [addDropDialog, setAddDropDialog] = useState(false)
  const [newDrop, setNewDrop] = useState({
    itemId: '',
    dropRate: 0.1,
    minQuantity: 1,
    maxQuantity: 1,
    killerOnly: false
  })

  useEffect(() => {
    fetchItems()
    if (bossId) {
      fetchBoss()
    }
  }, [bossId])

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

  const fetchBoss = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/bosses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const foundBoss = data.bosses.find((b: Boss) => b.id === bossId)
        if (foundBoss) {
          setBoss(foundBoss)
        }
      }
    } catch (error) {
      console.error('獲取Boss資料失敗:', error)
    }
  }

  const handleSaveBoss = async () => {
    if (!boss.name.trim()) {
      setMessage('請輸入Boss名稱')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const isUpdate = Boolean(boss.id)
      const url = isUpdate 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/bosses/${boss.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/bosses`
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: boss.name,
          description: boss.description,
          maxHealth: boss.maxHealth,
          attack: boss.attack,
          defense: boss.defense,
          level: boss.level,
          weaknessSkills: boss.weaknessSkills,
          goldReward: boss.goldReward,
          expReward: boss.expReward,
          rarity: boss.rarity
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Boss ${isUpdate ? '更新' : '創建'}成功！`)
        if (!isUpdate) {
          setBoss(data.boss)
        }
        onSave?.()
      } else {
        setMessage(data.error || `Boss ${isUpdate ? '更新' : '創建'}失敗`)
      }
    } catch (error) {
      console.error(`Boss ${boss.id ? '更新' : '創建'}失敗:`, error)
      setMessage(`Boss ${boss.id ? '更新' : '創建'}失敗`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDrop = async () => {
    if (!newDrop.itemId || !boss.id) {
      setMessage('請選擇物品並確保Boss已保存')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/bosses/${boss.id}/drops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDrop)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('物品掉落添加成功！')
        setAddDropDialog(false)
        setNewDrop({
          itemId: '',
          dropRate: 0.1,
          minQuantity: 1,
          maxQuantity: 1,
          killerOnly: false
        })
        fetchBoss() // 重新加載Boss資料
      } else {
        setMessage(data.error || '添加物品掉落失敗')
      }
    } catch (error) {
      console.error('添加物品掉落失敗:', error)
      setMessage('添加物品掉落失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDrop = async (dropId: string) => {
    if (!confirm('確定要刪除這個掉落設置嗎？')) return

    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/boss-drops/${dropId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMessage('掉落設置刪除成功！')
        fetchBoss() // 重新加載Boss資料
      } else {
        const data = await response.json()
        setMessage(data.error || '刪除掉落設置失敗')
      }
    } catch (error) {
      console.error('刪除掉落設置失敗:', error)
      setMessage('刪除掉落設置失敗')
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    const rarityObj = rarityTypes.find(r => r.value === rarity)
    return rarityObj?.color || '#9E9E9E'
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {boss.id ? '編輯Boss' : '創建新Boss'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveBoss}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存Boss'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={onCancel}
          >
            取消
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

      <Grid container spacing={3}>
        {/* Boss基本資訊 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                基本資訊
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Boss名稱"
                    value={boss.name}
                    onChange={(e) => setBoss({...boss, name: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="描述"
                    value={boss.description}
                    onChange={(e) => setBoss({...boss, description: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="等級"
                    value={boss.level}
                    onChange={(e) => setBoss({...boss, level: parseInt(e.target.value) || 1})}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>稀有度</InputLabel>
                    <Select
                      value={boss.rarity}
                      onChange={(e) => setBoss({...boss, rarity: e.target.value})}
                      label="稀有度"
                    >
                      {rarityTypes.map((rarity) => (
                        <MenuItem key={rarity.value} value={rarity.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                backgroundColor: rarity.color,
                                borderRadius: '50%'
                              }}
                            />
                            {rarity.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Boss屬性 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                戰鬥屬性
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="最大血量"
                    value={boss.maxHealth}
                    onChange={(e) => setBoss({...boss, maxHealth: parseInt(e.target.value) || 100000})}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="攻擊力"
                    value={boss.attack}
                    onChange={(e) => setBoss({...boss, attack: parseInt(e.target.value) || 100})}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="防禦力"
                    value={boss.defense}
                    onChange={(e) => setBoss({...boss, defense: parseInt(e.target.value) || 50})}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="金幣獎勵"
                    value={boss.goldReward}
                    onChange={(e) => setBoss({...boss, goldReward: parseInt(e.target.value) || 1000})}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="經驗獎勵"
                    value={boss.expReward}
                    onChange={(e) => setBoss({...boss, expReward: parseInt(e.target.value) || 500})}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 弱點技能 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                弱點技能
              </Typography>
              
              <Autocomplete
                multiple
                options={skillTypes}
                getOptionLabel={(option) => option.label}
                value={skillTypes.filter(skill => boss.weaknessSkills.includes(skill.value))}
                onChange={(_, newValue) => {
                  setBoss({...boss, weaknessSkills: newValue.map(skill => skill.value)})
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.label}
                      color="warning"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="選擇弱點技能"
                    placeholder="Boss對這些技能更脆弱"
                  />
                )}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 物品掉落管理 */}
        {boss.id && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    物品掉落設置
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setAddDropDialog(true)}
                    disabled={loading}
                  >
                    添加掉落物品
                  </Button>
                </Box>

                {boss.itemDrops && boss.itemDrops.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>物品</TableCell>
                          <TableCell>掉落率</TableCell>
                          <TableCell>數量範圍</TableCell>
                          <TableCell>僅擊殺者</TableCell>
                          <TableCell>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {boss.itemDrops.map((drop) => (
                          <TableRow key={drop.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {drop.item.name}
                                </Typography>
                                <Chip
                                  label={drop.item.rarity}
                                  size="small"
                                  sx={{
                                    backgroundColor: getRarityColor(drop.item.rarity),
                                    color: 'white',
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {drop.item.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {(drop.dropRate * 100).toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {drop.minQuantity} - {drop.maxQuantity}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={drop.killerOnly ? '是' : '否'}
                                size="small"
                                color={drop.killerOnly ? 'warning' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteDrop(drop.id)}
                                disabled={loading}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    尚未設置任何掉落物品
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* 添加掉落物品對話框 */}
      <Dialog open={addDropDialog} onClose={() => setAddDropDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加Boss掉落物品</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={items}
                getOptionLabel={(item) => `${item.name} - ${item.description}`}
                value={items.find(item => item.id === newDrop.itemId) || null}
                onChange={(_, newValue) => {
                  setNewDrop({...newDrop, itemId: newValue?.id || ''})
                }}
                renderInput={(params) => (
                  <TextField {...params} label="選擇物品" />
                )}
                renderOption={(props, item) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2">{item.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip 
                          label={item.itemType} 
                          size="small" 
                        />
                        <Chip 
                          label={item.rarity} 
                          size="small"
                          sx={{
                            backgroundColor: getRarityColor(item.rarity),
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="掉落率 (0-1)"
                value={newDrop.dropRate}
                onChange={(e) => setNewDrop({...newDrop, dropRate: parseFloat(e.target.value) || 0.1})}
                inputProps={{ min: 0, max: 1, step: 0.01 }}
                helperText="0.1 = 10% 掉落率"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="最小數量"
                value={newDrop.minQuantity}
                onChange={(e) => setNewDrop({...newDrop, minQuantity: parseInt(e.target.value) || 1})}
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="最大數量"
                value={newDrop.maxQuantity}
                onChange={(e) => setNewDrop({...newDrop, maxQuantity: parseInt(e.target.value) || 1})}
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newDrop.killerOnly}
                    onChange={(e) => setNewDrop({...newDrop, killerOnly: e.target.checked})}
                  />
                }
                label="僅限擊殺者獲得"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDropDialog(false)}>
            取消
          </Button>
          <Button
            onClick={handleAddDrop}
            variant="contained"
            disabled={loading || !newDrop.itemId}
          >
            {loading ? '添加中...' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}