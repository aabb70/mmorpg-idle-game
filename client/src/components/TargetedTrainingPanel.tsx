import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
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

const rarityColors = {
  COMMON: '#757575',
  UNCOMMON: '#4caf50',
  RARE: '#2196f3',
  EPIC: '#9c27b0',
  LEGENDARY: '#ff9800'
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

export default function TargetedTrainingPanel() {
  const dispatch = useDispatch()
  const { skills } = useSelector((state: RootState) => state.skills)
  
  const [selectedSkill, setSelectedSkill] = useState<SkillType | ''>('')
  const [availableItems, setAvailableItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [repetitions, setRepetitions] = useState<number>(10)
  const [currentTraining, setCurrentTraining] = useState<OfflineTraining | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [progress, setProgress] = useState<any>(null)

  // 載入離線訓練狀態
  useEffect(() => {
    loadOfflineProgress()
    const interval = setInterval(loadOfflineProgress, 5000) // 每5秒更新一次
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
      console.error('載入離線進度失敗:', error)
    }
  }

  const loadAvailableItems = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAvailableItems(selectedSkill as string)
      setAvailableItems(response.items || [])
      setSelectedItem('')
    } catch (error) {
      console.error('載入可用物品失敗:', error)
      dispatch(addNotification('載入可用物品失敗'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTraining = async () => {
    if (!selectedSkill || !selectedItem || repetitions <= 0) {
      dispatch(addNotification('請選擇技能、目標物品和重複次數'))
      return
    }

    try {
      setIsLoading(true)
      const response = await apiClient.startTargetedTraining({
        skillType: selectedSkill as string,
        targetItemId: selectedItem,
        repetitions
      })

      dispatch(addNotification(`開始目標訓練：${response.training.targetItem.name} x${repetitions}`))
      setShowStartDialog(false)
      await loadOfflineProgress()
      
    } catch (error: any) {
      console.error('開始訓練失敗:', error)
      dispatch(addNotification(error.message || '開始訓練失敗'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopTraining = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.stopTargetedTraining()
      
      dispatch(addNotification('離線訓練已停止'))
      
      if (response.progress && response.progress.itemsGained > 0) {
        dispatch(addNotification(`獲得 ${currentTraining?.targetItem.name} x${response.progress.itemsGained}`))
      }
      
      await loadOfflineProgress()
      
    } catch (error: any) {
      console.error('停止訓練失敗:', error)
      dispatch(addNotification(error.message || '停止訓練失敗'))
    } finally {
      setIsLoading(false)
    }
  }

  const getSuccessRate = (item: Item, skillLevel: number) => {
    const rarityMultipliers = {
      COMMON: 1,
      UNCOMMON: 0.8,
      RARE: 0.6,
      EPIC: 0.4,
      LEGENDARY: 0.2
    }

    const baseRate = 0.5
    const multiplier = rarityMultipliers[item.rarity as keyof typeof rarityMultipliers] || 1
    const skillBonus = skillLevel * 0.05
    return Math.min(baseRate * multiplier * (1 + skillBonus), 0.95)
  }

  const getTrainingTime = (item: Item) => {
    const rarityMultipliers = {
      COMMON: 1,
      UNCOMMON: 1.5,
      RARE: 2.5,
      EPIC: 4,
      LEGENDARY: 6
    }

    const baseTime = 3
    const multiplier = rarityMultipliers[item.rarity as keyof typeof rarityMultipliers] || 1
    return baseTime * multiplier
  }

  const calculateProgress = () => {
    if (!currentTraining) return 0
    return Math.min((currentTraining.completed / currentTraining.repetitions) * 100, 100)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        目標導向訓練
      </Typography>

      {currentTraining && currentTraining.isActive && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6">
              正在訓練：{skillNames[currentTraining.skillType as SkillType]} - {currentTraining.targetItem.name}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={calculateProgress()} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                進度：{currentTraining.completed} / {currentTraining.repetitions} 
                ({Math.round(calculateProgress())}%)
              </Typography>
            </Box>
            
            {progress && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  已獲得物品：{progress.itemsGained || 0} 個
                </Typography>
                <Typography variant="body2">
                  獲得經驗：{progress.expGained || 0} 點
                </Typography>
                {progress.isCompleted && (
                  <Chip label="訓練完成！" color="success" sx={{ mt: 1 }} />
                )}
              </Box>
            )}
          </Alert>
          
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleStopTraining}
            disabled={isLoading}
          >
            停止離線訓練
          </Button>
        </Box>
      )}

      {(!currentTraining || !currentTraining.isActive) && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>選擇技能</InputLabel>
                <Select
                  value={selectedSkill}
                  label="選擇技能"
                  onChange={(e) => setSelectedSkill(e.target.value as SkillType)}
                >
                  {Object.values(SkillType).map((skillType) => (
                    <MenuItem key={skillType} value={skillType}>
                      {skillNames[skillType]} (等級 {skills[skillType]?.level || 1})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={!selectedSkill}>
                <InputLabel>選擇目標物品</InputLabel>
                <Select
                  value={selectedItem}
                  label="選擇目標物品"
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  {availableItems.map((item) => (
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
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="重複次數"
                type="number"
                value={repetitions}
                onChange={(e) => setRepetitions(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 1000 }}
              />
            </Grid>
          </Grid>

          {selectedItem && selectedSkill && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  訓練預覽
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
                          <Typography variant="body2">
                            目標物品：{item.name} ({rarityNames[item.rarity as keyof typeof rarityNames]})
                          </Typography>
                          <Typography variant="body2">
                            成功率：{Math.round(successRate * 100)}%
                          </Typography>
                          <Typography variant="body2">
                            每次訓練時間：{trainingTime} 秒
                          </Typography>
                          <Typography variant="body2">
                            預期獲得物品：約 {expectedItems} 個
                          </Typography>
                          <Typography variant="body2">
                            總預計時間：{Math.floor(totalTime / 60)} 分 {Math.round(totalTime % 60)} 秒
                          </Typography>
                        </>
                      )
                    })()}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowStartDialog(true)}
            disabled={!selectedSkill || !selectedItem || repetitions <= 0 || isLoading}
            fullWidth
          >
            開始目標訓練
          </Button>
        </Box>
      )}

      {/* 確認對話框 */}
      <Dialog open={showStartDialog} onClose={() => setShowStartDialog(false)}>
        <DialogTitle>確認開始訓練</DialogTitle>
        <DialogContent>
          <Typography>
            確定要開始目標訓練嗎？
          </Typography>
          {selectedItem && selectedSkill && (
            <Box sx={{ mt: 2 }}>
              {(() => {
                const item = availableItems.find(item => item.id === selectedItem)
                if (!item) return null
                
                const skillLevel = skills[selectedSkill]?.level || 1
                const successRate = getSuccessRate(item, skillLevel)
                const expectedItems = Math.floor(repetitions * successRate)

                return (
                  <>
                    <Typography variant="body2">
                      技能：{skillNames[selectedSkill]} (等級 {skillLevel})
                    </Typography>
                    <Typography variant="body2">
                      目標：{item.name} x{repetitions}
                    </Typography>
                    <Typography variant="body2">
                      預期獲得：約 {expectedItems} 個
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      訓練將在背景進行，即使關閉網頁也會繼續
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
            onClick={handleStartTraining} 
            variant="contained"
            disabled={isLoading}
          >
            確認開始
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}