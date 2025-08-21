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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Autocomplete
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'

interface Item {
  id: string
  name: string
  description: string
  itemType: string
  category: string | null
  rarity: string
  baseValue: number
  healthRestore?: number
  // 裝備屬性
  equipmentSlot?: string
  requiredSkill?: string
  attackBonus: number
  defenseBonus: number
  healthBonus: number
  skillLevelBonus: number
  tags: { id: string; name: string }[]
}

interface Tag {
  id: string
  name: string
}

export default function ItemEditor() {
  const [items, setItems] = useState<Item[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    itemType: 'MATERIAL',
    category: '',
    rarity: 'COMMON',
    baseValue: 0,
    healthRestore: '',
    // 裝備屬性
    equipmentSlot: '',
    requiredSkill: '',
    attackBonus: 0,
    defenseBonus: 0,
    healthBonus: 0,
    skillLevelBonus: 0,
    tags: [] as string[]
  })

  const itemTypes = ['MATERIAL', 'EQUIPMENT', 'CONSUMABLE', 'FOOD', 'POTION', 'MISC', 'TOOL']
  const categories = ['FISH', 'WOOD', 'METAL', 'FIBER', 'HERB', 'LIVESTOCK']
  const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']
  const equipmentSlots = [
    '', 'HEAD', 'HANDS', 'CHEST', 'LEGS', 'CLOAK',
    'MINING_TOOL', 'LOGGING_TOOL', 'FISHING_TOOL', 'FORAGING_TOOL',
    'SMITHING_TOOL', 'TAILORING_TOOL', 'COOKING_TOOL', 'ALCHEMY_TOOL', 'CRAFTING_TOOL'
  ]
  const skillTypes = [
    '', 'MINING', 'LOGGING', 'FISHING', 'FORAGING',
    'SMITHING', 'TAILORING', 'COOKING', 'ALCHEMY', 'CRAFTING'
  ]

  useEffect(() => {
    fetchItems()
    fetchTags()
  }, [])

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      } else {
        setMessage('獲取物品列表失敗')
      }
    } catch (error) {
      console.error('獲取物品列表錯誤:', error)
      setMessage('獲取物品列表失敗')
    }
  }

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tags`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('獲取標籤列表錯誤:', error)
    }
  }

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        description: item.description,
        itemType: item.itemType,
        category: item.category || '',
        rarity: item.rarity,
        baseValue: item.baseValue,
        healthRestore: item.healthRestore ? item.healthRestore.toString() : '',
        // 裝備屬性
        equipmentSlot: item.equipmentSlot || '',
        requiredSkill: item.requiredSkill || '',
        attackBonus: item.attackBonus || 0,
        defenseBonus: item.defenseBonus || 0,
        healthBonus: item.healthBonus || 0,
        skillLevelBonus: item.skillLevelBonus || 0,
        tags: item.tags.map(tag => tag.name)
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        itemType: 'MATERIAL',
        category: '',
        rarity: 'COMMON',
        baseValue: 0,
        healthRestore: '',
        // 裝備屬性
        equipmentSlot: '',
        requiredSkill: '',
        attackBonus: 0,
        defenseBonus: 0,
        healthBonus: 0,
        skillLevelBonus: 0,
        tags: []
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setMessage('')
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const url = editingItem 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/items/${editingItem.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/items`
      
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          category: formData.category || null,
          baseValue: Number(formData.baseValue),
          healthRestore: formData.healthRestore ? Number(formData.healthRestore) : null,
          // 裝備屬性
          equipmentSlot: formData.equipmentSlot || null,
          requiredSkill: formData.requiredSkill || null,
          attackBonus: Number(formData.attackBonus),
          defenseBonus: Number(formData.defenseBonus),
          healthBonus: Number(formData.healthBonus),
          skillLevelBonus: Number(formData.skillLevelBonus)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`物品${editingItem ? '更新' : '創建'}成功！`)
        fetchItems()
        handleCloseDialog()
      } else {
        setMessage(data.error || `物品${editingItem ? '更新' : '創建'}失敗`)
      }
    } catch (error) {
      console.error('操作失敗:', error)
      setMessage(`物品${editingItem ? '更新' : '創建'}失敗`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: Item) => {
    if (!confirm(`確定要刪除物品「${item.name}」嗎？此操作無法撤銷！`)) {
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('物品刪除成功！')
        fetchItems()
      } else {
        setMessage(data.error || '物品刪除失敗')
      }
    } catch (error) {
      console.error('刪除失敗:', error)
      setMessage('物品刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      COMMON: '#9E9E9E',
      UNCOMMON: '#4CAF50',
      RARE: '#2196F3',
      EPIC: '#9C27B0',
      LEGENDARY: '#FF9800'
    }
    return colors[rarity as keyof typeof colors] || colors.COMMON
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          物品編輯器
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          新增物品
        </Button>
      </Box>

      {message && (
        <Alert severity={message.includes('成功') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名稱</TableCell>
              <TableCell>類型</TableCell>
              <TableCell>分類</TableCell>
              <TableCell>稀有度</TableCell>
              <TableCell>基礎價值</TableCell>
              <TableCell>恢復生命值</TableCell>
              <TableCell>標籤</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.itemType}</TableCell>
                <TableCell>{item.category || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={item.rarity}
                    size="small"
                    sx={{
                      backgroundColor: getRarityColor(item.rarity),
                      color: 'white'
                    }}
                  />
                </TableCell>
                <TableCell>{item.baseValue}</TableCell>
                <TableCell>
                  {item.healthRestore ? (
                    <Chip
                      label={`❤️ ${item.healthRestore}`}
                      size="small"
                      color="success"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {item.tags.map((tag) => (
                      <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(item)}
                    disabled={loading}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item)}
                    disabled={loading}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 編輯對話框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? '編輯物品' : '新增物品'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="名稱"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>類型</InputLabel>
                <Select
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                  label="類型"
                >
                  {itemTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>分類</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="分類"
                >
                  <MenuItem value="">無</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>稀有度</InputLabel>
                <Select
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                  label="稀有度"
                >
                  {rarities.map((rarity) => (
                    <MenuItem key={rarity} value={rarity}>
                      {rarity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="基礎價值"
                type="number"
                value={formData.baseValue}
                onChange={(e) => setFormData({ ...formData, baseValue: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="恢復生命值"
                type="number"
                value={formData.healthRestore}
                onChange={(e) => setFormData({ ...formData, healthRestore: e.target.value })}
                inputProps={{ min: 0 }}
                helperText="藥劑類物品可設定恢復的生命值數量"
              />
            </Grid>

            {/* 裝備屬性欄位 - 只在物品類型為 EQUIPMENT 時顯示 */}
            {formData.itemType === 'EQUIPMENT' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>裝備槽位</InputLabel>
                    <Select
                      value={formData.equipmentSlot}
                      onChange={(e) => setFormData({ ...formData, equipmentSlot: e.target.value })}
                      label="裝備槽位"
                    >
                      {equipmentSlots.map((slot) => (
                        <MenuItem key={slot} value={slot}>
                          {slot || '無'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>需求技能</InputLabel>
                    <Select
                      value={formData.requiredSkill}
                      onChange={(e) => setFormData({ ...formData, requiredSkill: e.target.value })}
                      label="需求技能"
                    >
                      {skillTypes.map((skill) => (
                        <MenuItem key={skill} value={skill}>
                          {skill || '無'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="攻擊力加成"
                    type="number"
                    value={formData.attackBonus}
                    onChange={(e) => setFormData({ ...formData, attackBonus: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="防禦力加成"
                    type="number"
                    value={formData.defenseBonus}
                    onChange={(e) => setFormData({ ...formData, defenseBonus: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="生命值加成"
                    type="number"
                    value={formData.healthBonus}
                    onChange={(e) => setFormData({ ...formData, healthBonus: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="技能等級加成"
                    type="number"
                    value={formData.skillLevelBonus}
                    onChange={(e) => setFormData({ ...formData, skillLevelBonus: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={tags.map(tag => tag.name)}
                value={formData.tags}
                onChange={(_, newValue) => setFormData({ ...formData, tags: newValue })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="標籤"
                    placeholder="選擇或輸入新標籤"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name}
          >
            {loading ? '處理中...' : (editingItem ? '更新' : '創建')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}