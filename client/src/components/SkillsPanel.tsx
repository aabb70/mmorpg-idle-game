import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
} from '@mui/material'
import { 
  ArrowBack, 
  Build, 
  LocalFlorist, 
  Water, 
  Agriculture, 
  Construction,
  ContentCut,
  Restaurant,
  Science,
  Handyman
} from '@mui/icons-material'
import { RootState } from '../store/store'
import { SkillType } from '../store/slices/skillSlice'
import { addNotification } from '../store/slices/gameSlice'
import { apiClient } from '../utils/api'

const skillNames = {
  [SkillType.MINING]: '採礦',
  [SkillType.LOGGING]: '伐木',
  [SkillType.FISHING]: '釣魚',
  [SkillType.FORAGING]: '採集',
  [SkillType.SMITHING]: '鍛造',
  [SkillType.TAILORING]: '裁縫',
  [SkillType.COOKING]: '廚師',
  [SkillType.ALCHEMY]: '煉金',
  [SkillType.CRAFTING]: '工藝',
}

const skillIcons = {
  [SkillType.MINING]: Construction,
  [SkillType.LOGGING]: LocalFlorist,
  [SkillType.FISHING]: Water,
  [SkillType.FORAGING]: Agriculture,
  [SkillType.SMITHING]: Build,
  [SkillType.TAILORING]: ContentCut,
  [SkillType.COOKING]: Restaurant,
  [SkillType.ALCHEMY]: Science,
  [SkillType.CRAFTING]: Handyman,
}

const skillColors = {
  [SkillType.MINING]: '#8D6E63',
  [SkillType.LOGGING]: '#4CAF50',
  [SkillType.FISHING]: '#2196F3',
  [SkillType.FORAGING]: '#FF9800',
  [SkillType.SMITHING]: '#9E9E9E',
  [SkillType.TAILORING]: '#E91E63',
  [SkillType.COOKING]: '#FF5722',
  [SkillType.ALCHEMY]: '#9C27B0',
  [SkillType.CRAFTING]: '#795548',
}

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3',
  EPIC: '#9C27B0',
  LEGENDARY: '#FF6B35'
}

const rarityNames = {
  COMMON: '普通',
  UNCOMMON: '精良',
  RARE: '稀有',
  EPIC: '史詩',
  LEGENDARY: '傳奇'
}

interface Item {
  id: string
  name: string
  description: string
  rarity: string
  baseValue: number
  actualSuccessRate?: number
  minSuccessRate?: number
  maxSuccessRate?: number
  minSkillLevel?: number
  maxSkillLevel?: number
}

interface OfflineTraining {
  id: string
  skillType: string
  targetItem: Item
  repetitions: number
  completed: number
  startTime: string
  isActive: boolean
}

export default function SkillsPanel() {
  const dispatch = useDispatch()
  const { skills } = useSelector((state: RootState) => state.skills)
  
  // UI 狀態
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null)
  const [availableItems, setAvailableItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [repetitions, setRepetitions] = useState<number>(10)
  const [currentTraining, setCurrentTraining] = useState<OfflineTraining | null>(null)
  const [isTargetTrainingLoading, setIsTargetTrainingLoading] = useState(false)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [progress, setProgress] = useState<any>(null)

  // 載入離線訓練狀態
  useEffect(() => {
    loadOfflineProgress()
    const interval = setInterval(loadOfflineProgress, 5000)
    return () => clearInterval(interval)
  }, [])

  // 載入可用物品
  useEffect(() => {
    if (selectedSkill) {
      loadAvailableItems()
    }
  }, [selectedSkill])

  const loadOfflineProgress = async () => {
    try {
      const response = await apiClient.getOfflineProgress()
      if (response.hasTraining) {
        setCurrentTraining(response.training)
        setProgress(response.progress || null)
      } else {
        setCurrentTraining(null)
        setProgress(null)
      }
    } catch (error) {
      console.log('離線進度載入失敗，可能是後端還未更新')
    }
  }

  const loadAvailableItems = async () => {
    if (!selectedSkill) return
    
    try {
      setIsTargetTrainingLoading(true)
      console.log('載入技能物品:', selectedSkill)
      const response = await apiClient.getAvailableItems(selectedSkill)
      console.log('API 回應:', response)
      setAvailableItems(response.items || [])
    } catch (error) {
      console.log('載入可用物品失敗')
      setAvailableItems([])
    } finally {
      setIsTargetTrainingLoading(false)
    }
  }

  const handleStartTargetedTraining = async () => {
    if (!selectedSkill || !selectedItem || repetitions <= 0) {
      dispatch(addNotification('請選擇技能、目標物品和重複次數'))
      return
    }

    try {
      setIsTargetTrainingLoading(true)
      const response = await apiClient.startTargetedTraining({
        skillType: selectedSkill as string,
        targetItemId: selectedItem,
        repetitions
      })

      if (response.success) {
        dispatch(addNotification('開始專注練習！'))
        setCurrentTraining(response.training)
        setSelectedSkill(null) // 返回主頁面
        setSelectedItem('')
        setShowStartDialog(false)
      } else {
        dispatch(addNotification(response.error || '開始訓練失敗'))
      }
    } catch (error) {
      console.error('開始目標訓練失敗:', error)
      dispatch(addNotification('開始訓練失敗，請稍後再試'))
    } finally {
      setIsTargetTrainingLoading(false)
    }
  }

  const handleCancelTraining = async () => {
    try {
      const response = await apiClient.cancelTargetedTraining()
      if (response.success) {
        dispatch(addNotification('已取消專注練習'))
        setCurrentTraining(null)
        setProgress(null)
      }
    } catch (error) {
      console.error('取消訓練失敗:', error)
    }
  }

  const getSuccessRate = (item: Item, skillLevel: number) => {
    if (item.actualSuccessRate !== undefined) {
      return item.actualSuccessRate
    }
    
    const minRate = item.minSuccessRate || 0.3
    const maxRate = item.maxSuccessRate || 0.8
    const minLevel = item.minSkillLevel || 1
    const maxLevel = item.maxSkillLevel || 50
    
    if (skillLevel <= minLevel) return minRate
    if (skillLevel >= maxLevel) return maxRate
    
    const progress = (skillLevel - minLevel) / (maxLevel - minLevel)
    return minRate + (maxRate - minRate) * progress
  }

  const getTrainingTime = (item: Item) => {
    const baseTime = 5
    const rarityMultiplier = {
      COMMON: 1,
      UNCOMMON: 1.2,
      RARE: 1.5,
      EPIC: 2,
      LEGENDARY: 3
    }[item.rarity] || 1
    
    return Math.round(baseTime * rarityMultiplier)
  }

  // 主頁面 - 技能選擇
  const renderSkillSelection = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ 
        textAlign: 'center', 
        mb: 4,
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }}>
        🎯 生活技能練習
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
        選擇想要練習的技能，開始你的專注訓練之旅
      </Typography>

      {/* 技能按鈕網格 */}
      <Grid container spacing={3}>
        {Object.values(SkillType).map((skillType) => {
          const skill = skills[skillType]
          const IconComponent = skillIcons[skillType]
          const skillColor = skillColors[skillType]
          
          return (
            <Grid item xs={12} sm={6} md={4} key={skillType}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 8px 25px ${skillColor}40`,
                    borderColor: skillColor,
                  },
                  border: '2px solid transparent',
                  borderRadius: 3,
                  height: '140px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => setSelectedSkill(skillType)}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flex: 1,
                  textAlign: 'center'
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: skillColor, 
                      width: 56, 
                      height: 56, 
                      mb: 1,
                      boxShadow: `0 4px 12px ${skillColor}30`
                    }}
                  >
                    <IconComponent sx={{ fontSize: 30 }} />
                  </Avatar>
                  
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {skillNames[skillType]}
                  </Typography>
                  
                  <Chip 
                    label={`等級 ${skill?.level || 1}`}
                    size="small"
                    sx={{ 
                      bgcolor: `${skillColor}20`,
                      color: skillColor,
                      fontWeight: 'bold'
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )

  // 二級頁面 - 目標物品選擇
  const renderTargetSelection = () => {
    if (!selectedSkill) return null
    
    const skill = skills[selectedSkill]
    const IconComponent = skillIcons[selectedSkill]
    const skillColor = skillColors[selectedSkill]

    return (
      <Box>
        {/* 頁面頭部 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => setSelectedSkill(null)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Avatar 
            sx={{ 
              bgcolor: skillColor, 
              width: 40, 
              height: 40, 
              mr: 2
            }}
          >
            <IconComponent />
          </Avatar>
          
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {skillNames[selectedSkill]} 專注練習
            </Typography>
            <Typography variant="body2" color="text.secondary">
              等級 {skill?.level || 1} • 經驗值 {skill?.experience || 0}/{skill?.maxExperience || 100}
            </Typography>
          </Box>
        </Box>

        {/* 經驗值進度條 */}
        <Box sx={{ mb: 4 }}>
          <LinearProgress
            variant="determinate"
            value={((skill?.experience || 0) / (skill?.maxExperience || 100)) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: `${skillColor}20`,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: skillColor,
              },
            }}
          />
        </Box>

        {/* 目標物品選擇 */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>選擇練習目標</InputLabel>
              <Select
                value={selectedItem}
                label="選擇練習目標"
                onChange={(e) => setSelectedItem(e.target.value)}
                disabled={isTargetTrainingLoading}
              >
                {availableItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={rarityNames[item.rarity as keyof typeof rarityNames] || '普通'}
                        size="small"
                        sx={{
                          backgroundColor: rarityColors[item.rarity as keyof typeof rarityColors],
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                      {item.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="練習次數"
              type="number"
              value={repetitions}
              onChange={(e) => setRepetitions(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 1000 }}
              sx={{ mb: 3 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            {selectedItem && selectedSkill && (
              <Card sx={{ 
                background: `linear-gradient(135deg, ${skillColor}10 0%, transparent 50%)`,
                border: `1px solid ${skillColor}30`
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: skillColor }}>
                    📊 練習預覽
                  </Typography>
                  {availableItems.find(item => item.id === selectedItem) && (
                    <Box>
                      {(() => {
                        const item = availableItems.find(item => item.id === selectedItem)!
                        const skillLevel = skills[selectedSkill]?.level || 1
                        const successRate = getSuccessRate(item, skillLevel)
                        const trainingTime = getTrainingTime(item)
                        const expectedItems = Math.floor(repetitions * successRate)
                        const totalTime = repetitions * trainingTime

                        return (
                          <>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              🎯 目標：{item.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              📈 成功率：{Math.round(successRate * 100)}%
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              ⏱️ 每次：{trainingTime} 秒
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              🎁 預期收穫：約 {expectedItems} 個
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                              ⏰ 總時間：{Math.floor(totalTime / 60)} 分 {Math.round(totalTime % 60)} 秒
                            </Typography>
                          </>
                        )
                      })()}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* 開始按鈕 */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowStartDialog(true)}
            disabled={!selectedSkill || !selectedItem || repetitions <= 0 || isTargetTrainingLoading}
            sx={{
              bgcolor: skillColor,
              '&:hover': { bgcolor: `${skillColor}DD` },
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            🚀 開始專注練習
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 4 }}>
      {/* 進行中的訓練狀態 */}
      {currentTraining && currentTraining.isActive && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleCancelTraining}
            >
              取消
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            🎯 專注練習進行中
          </Typography>
          <Typography variant="body2">
            {skillNames[currentTraining.skillType as SkillType]} → {currentTraining.targetItem.name}
          </Typography>
          <Typography variant="body2">
            進度：{currentTraining.completed}/{currentTraining.repetitions}
            {progress && ` (${Math.round((currentTraining.completed / currentTraining.repetitions) * 100)}%)`}
          </Typography>
          {progress && (
            <LinearProgress
              variant="determinate"
              value={(currentTraining.completed / currentTraining.repetitions) * 100}
              sx={{ mt: 1, borderRadius: 1 }}
            />
          )}
        </Alert>
      )}

      {/* 主要內容 */}
      {(!currentTraining || !currentTraining.isActive) && (
        selectedSkill ? renderTargetSelection() : renderSkillSelection()
      )}

      {/* 確認對話框 */}
      <Dialog open={showStartDialog} onClose={() => setShowStartDialog(false)}>
        <DialogTitle>🎯 確認開始專注練習</DialogTitle>
        <DialogContent>
          <Typography>
            確定要開始專注練習嗎？
          </Typography>
          {selectedItem && selectedSkill && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              {(() => {
                const item = availableItems.find(item => item.id === selectedItem)
                if (!item) return null
                
                const skillLevel = skills[selectedSkill]?.level || 1
                const successRate = getSuccessRate(item, skillLevel)
                const expectedItems = Math.floor(repetitions * successRate)

                return (
                  <>
                    <Typography variant="body2">
                      🛠️ 技能：{skillNames[selectedSkill]} (等級 {skillLevel})
                    </Typography>
                    <Typography variant="body2">
                      🎯 目標：{item.name} × {repetitions}
                    </Typography>
                    <Typography variant="body2">
                      📈 成功率：{Math.round(successRate * 100)}%
                    </Typography>
                    <Typography variant="body2">
                      🎁 預期收穫：約 {expectedItems} 個
                    </Typography>
                  </>
                )
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStartDialog(false)}>
            取消
          </Button>
          <Button 
            onClick={handleStartTargetedTraining} 
            variant="contained"
            disabled={isTargetTrainingLoading}
          >
            {isTargetTrainingLoading ? '啟動中...' : '確認開始'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}