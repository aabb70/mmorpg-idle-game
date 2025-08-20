import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Slider,
  Stack
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Sync as SyncIcon
} from '@mui/icons-material'
import { apiClient } from '../../utils/api'

const skillTypeNames = {
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

const rarityNames = {
  COMMON: '普通',
  UNCOMMON: '精良',
  RARE: '稀有',
  EPIC: '史詩',
  LEGENDARY: '傳奇'
}

const rarityColors = {
  COMMON: '#757575',
  UNCOMMON: '#4caf50',
  RARE: '#2196f3',
  EPIC: '#9c27b0',
  LEGENDARY: '#ff9800'
}

interface SkillItem {
  id: string
  skillType: string
  baseSuccessRate: number
  minSkillLevel: number
  maxSkillLevel: number | null
  isEnabled: boolean
  item: {
    id: string
    name: string
    description: string
    itemType: string
    category: string | null
    rarity: string
    baseValue: number
    tags: string[]
  }
}

interface Item {
  id: string
  name: string
  description: string
  itemType: string
  category: string | null
  rarity: string
  baseValue: number
  tags: string[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function SkillItemEditor() {
  const [skillItems, setSkillItems] = useState<SkillItem[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [skillTypes, setSkillTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [migrating, setMigrating] = useState(false)

  // 對話框狀態
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSkillItem, setEditingSkillItem] = useState<SkillItem | null>(null)

  // 表單狀態
  const [formData, setFormData] = useState({
    skillType: '',
    itemId: '',
    baseSuccessRate: 0.5,
    minSkillLevel: 1,
    maxSkillLevel: '',
    isEnabled: true
  })

  // 標籤狀態
  const [selectedTab, setSelectedTab] = useState(0)
  const [selectedSkillType, setSelectedSkillType] = useState<string>('')

  // 載入數據
  useEffect(() => {
    loadSkillItems()
    loadItems()
    loadSkillTypes()
  }, [])

  // 根據選擇的技能類型過濾數據
  useEffect(() => {
    if (selectedSkillType) {
      loadSkillItemsBySkill(selectedSkillType)
    } else {
      loadSkillItems()
    }
  }, [selectedSkillType])

  const loadSkillItems = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/admin/skill-items')
      setSkillItems(response.skillItems || [])
    } catch (error: any) {
      setError('載入技能物品配置失敗')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadSkillItemsBySkill = async (skillType: string) => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/admin/skill-items/${skillType}`)
      setSkillItems(response.skillItems || [])
    } catch (error: any) {
      setError('載入技能物品配置失敗')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadItems = async () => {
    try {
      const response = await apiClient.get('/admin/items')
      setItems(response.items || [])
    } catch (error: any) {
      console.error('載入物品失敗:', error)
    }
  }

  const loadSkillTypes = async () => {
    try {
      const response = await apiClient.get('/admin/skill-types')
      setSkillTypes(response.skillTypes || [])
    } catch (error: any) {
      console.error('載入技能類型失敗:', error)
    }
  }

  const handleCreateOrUpdate = async () => {
    try {
      setLoading(true)
      setError('')

      const data = {
        ...formData,
        maxSkillLevel: formData.maxSkillLevel === '' ? null : parseInt(formData.maxSkillLevel)
      }

      if (editingSkillItem) {
        await apiClient.put(`/admin/skill-items/${editingSkillItem.id}`, data)
        setSuccess('技能物品配置更新成功')
      } else {
        await apiClient.post('/admin/skill-items', data)
        setSuccess('技能物品配置創建成功')
      }

      setDialogOpen(false)
      setEditingSkillItem(null)
      resetForm()
      
      if (selectedSkillType) {
        loadSkillItemsBySkill(selectedSkillType)
      } else {
        loadSkillItems()
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '操作失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個技能物品配置嗎？')) return

    try {
      setLoading(true)
      await apiClient.delete(`/admin/skill-items/${id}`)
      setSuccess('技能物品配置刪除成功')
      
      if (selectedSkillType) {
        loadSkillItemsBySkill(selectedSkillType)
      } else {
        loadSkillItems()
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (skillItem: SkillItem) => {
    setEditingSkillItem(skillItem)
    setFormData({
      skillType: skillItem.skillType,
      itemId: skillItem.item.id,
      baseSuccessRate: skillItem.baseSuccessRate,
      minSkillLevel: skillItem.minSkillLevel,
      maxSkillLevel: skillItem.maxSkillLevel?.toString() || '',
      isEnabled: skillItem.isEnabled
    })
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingSkillItem(null)
    resetForm()
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      skillType: selectedSkillType || '',
      itemId: '',
      baseSuccessRate: 0.5,
      minSkillLevel: 1,
      maxSkillLevel: '',
      isEnabled: true
    })
  }

  const handleMigrate = async () => {
    if (!confirm('確定要同步現有的技能物品關係嗎？這會將遊戲中現有的技能-物品關係添加到管理系統中。')) return

    try {
      setMigrating(true)
      const response = await apiClient.post('/admin/skill-items/migrate')
      setSuccess(`同步完成！${response.message}`)
      
      if (selectedSkillType) {
        loadSkillItemsBySkill(selectedSkillType)
      } else {
        loadSkillItems()
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '同步失敗')
    } finally {
      setMigrating(false)
    }
  }

  const filteredSkillItems = selectedSkillType 
    ? skillItems.filter(item => item.skillType === selectedSkillType)
    : skillItems

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          技能物品管理
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={handleMigrate}
            disabled={migrating}
          >
            {migrating ? '同步中...' : '同步現有數據'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            添加技能物品配置
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 技能類型過濾 */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>篩選技能類型</InputLabel>
          <Select
            value={selectedSkillType}
            label="篩選技能類型"
            onChange={(e) => setSelectedSkillType(e.target.value)}
          >
            <MenuItem value="">全部技能</MenuItem>
            {skillTypes.map((skillType) => (
              <MenuItem key={skillType.value} value={skillType.value}>
                {skillType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 技能物品列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>技能類型</TableCell>
              <TableCell>物品</TableCell>
              <TableCell>稀有度</TableCell>
              <TableCell>基礎成功率</TableCell>
              <TableCell>技能等級要求</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSkillItems.map((skillItem) => (
              <TableRow key={skillItem.id}>
                <TableCell>
                  <Chip
                    label={skillTypeNames[skillItem.skillType as keyof typeof skillTypeNames]}
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {skillItem.item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {skillItem.item.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={rarityNames[skillItem.item.rarity as keyof typeof rarityNames]}
                    sx={{
                      color: 'white',
                      backgroundColor: rarityColors[skillItem.item.rarity as keyof typeof rarityColors]
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {Math.round(skillItem.baseSuccessRate * 100)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {skillItem.minSkillLevel}
                    {skillItem.maxSkillLevel && ` - ${skillItem.maxSkillLevel}`}
                    級
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={skillItem.isEnabled ? '啟用' : '禁用'}
                    color={skillItem.isEnabled ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(skillItem)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(skillItem.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 創建/編輯對話框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSkillItem ? '編輯技能物品配置' : '創建技能物品配置'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>技能類型</InputLabel>
              <Select
                value={formData.skillType}
                label="技能類型"
                onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
                disabled={!!editingSkillItem}
              >
                {skillTypes.map((skillType) => (
                  <MenuItem key={skillType.value} value={skillType.value}>
                    {skillType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>物品</InputLabel>
              <Select
                value={formData.itemId}
                label="物品"
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                disabled={!!editingSkillItem}
              >
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{item.name}</span>
                      <Chip
                        label={rarityNames[item.rarity as keyof typeof rarityNames]}
                        size="small"
                        sx={{
                          color: 'white',
                          backgroundColor: rarityColors[item.rarity as keyof typeof rarityColors]
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography gutterBottom>
                基礎成功率: {Math.round(formData.baseSuccessRate * 100)}%
              </Typography>
              <Slider
                value={formData.baseSuccessRate}
                onChange={(_, value) => setFormData({ ...formData, baseSuccessRate: value as number })}
                min={0}
                max={1}
                step={0.05}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 0.25, label: '25%' },
                  { value: 0.5, label: '50%' },
                  { value: 0.75, label: '75%' },
                  { value: 1, label: '100%' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              />
            </Box>

            <TextField
              fullWidth
              label="最低技能等級"
              type="number"
              value={formData.minSkillLevel}
              onChange={(e) => setFormData({ ...formData, minSkillLevel: parseInt(e.target.value) || 1 })}
              inputProps={{ min: 1, max: 100 }}
            />

            <TextField
              fullWidth
              label="最高技能等級 (可選)"
              type="number"
              value={formData.maxSkillLevel}
              onChange={(e) => setFormData({ ...formData, maxSkillLevel: e.target.value })}
              helperText="留空表示無上限"
              inputProps={{ min: 1, max: 100 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                />
              }
              label="啟用"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleCreateOrUpdate}
            variant="contained"
            disabled={loading || !formData.skillType || !formData.itemId}
            startIcon={<SaveIcon />}
          >
            {editingSkillItem ? '更新' : '創建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}