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
  Tabs,
  Tab,
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
      id={`skills-tabpanel-${index}`}
      aria-labelledby={`skills-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

interface Item {
  id: string
  name: string
  description: string
  rarity: string
  baseValue: number
  // 從後端 API 返回的技能配置信息
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
  
  // 標籤狀態
  const [tabValue, setTabValue] = useState(0)
  
  // 目標訓練狀態
  const [selectedSkill, setSelectedSkill] = useState<SkillType | ''>('')
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
      // 靜默處理錯誤，不影響用戶體驗
      console.log('離線進度載入失敗，可能是後端還未更新')
    }
  }

  const loadAvailableItems = async () => {
    try {
      setIsTargetTrainingLoading(true)
      const response = await apiClient.getAvailableItems(selectedSkill as string)
      setAvailableItems(response.items || [])
      setSelectedItem('')
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

      dispatch(addNotification(`開始目標訓練：${response.training.targetItem.name} x${repetitions}`))
      setShowStartDialog(false)
      await loadOfflineProgress()
      
    } catch (error: any) {
      console.error('開始訓練失敗:', error)
      dispatch(addNotification('目標訓練功能暫時不可用，請使用普通訓練'))
    } finally {
      setIsTargetTrainingLoading(false)
    }
  }

  const handleStopTargetedTraining = async () => {
    try {
      setIsTargetTrainingLoading(true)
      const response = await apiClient.stopTargetedTraining()
      
      dispatch(addNotification('離線訓練已停止'))
      
      if (response.progress && response.progress.itemsGained > 0) {
        dispatch(addNotification(`獲得 ${currentTraining?.targetItem.name} x${response.progress.itemsGained}`))
      }
      
      await loadOfflineProgress()
      
    } catch (error: any) {
      console.error('停止訓練失敗:', error)
      dispatch(addNotification('停止訓練失敗'))
    } finally {
      setIsTargetTrainingLoading(false)
    }
  }

  const getSuccessRate = (item: Item, skillLevel: number) => {
    // 如果後端 API 返回了實際成功率，直接使用
    if (item.actualSuccessRate !== undefined) {
      return item.actualSuccessRate
    }
    
    // 否則使用舊的計算邏輯作為備選
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
        技能訓練
      </Typography>

      {/* 離線訓練狀態顯示 */}
      {currentTraining && currentTraining.isActive && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6">
              離線訓練中：{skillNames[currentTraining.skillType as SkillType]} - {currentTraining.targetItem.name}
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
            onClick={handleStopTargetedTraining}
            disabled={isTargetTrainingLoading}
          >
            停止離線訓練
          </Button>
        </Box>
      )}


      {/* 標籤界面 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="目標訓練" />
        </Tabs>
      </Box>

      {/* 目標訓練標籤 */}
      <TabPanel value={tabValue} index={0}>
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
                            label={rarityNames[item.rarity as keyof typeof rarityNames] || '普通'} 
                            size="small"
                            sx={{ 
                              color: 'white',
                              backgroundColor: rarityColors[item.rarity as keyof typeof rarityColors] || '#757575'
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
                              目標物品：{item.name} ({rarityNames[item.rarity as keyof typeof rarityNames] || '普通'})
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
                            
                            {/* 顯示材料需求 (如果是配方) */}
                            {(item as any).ingredients && (item as any).ingredients.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  製作所需材料：
                                </Typography>
                                {(item as any).ingredients.map((ingredient: any, index: number) => (
                                  <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                                    • {ingredient.item ? 
                                        ingredient.item.name : 
                                        ingredient.category ? 
                                          `任何 ${ingredient.category} 類型` : 
                                          `標籤: ${ingredient.tag?.name}`
                                      } × {ingredient.quantity * expectedItems}
                                  </Typography>
                                ))}
                              </Box>
                            )}
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
              disabled={!selectedSkill || !selectedItem || repetitions <= 0 || isTargetTrainingLoading}
              fullWidth
            >
              開始目標訓練
            </Button>

          </Box>
        )}
      </TabPanel>

      {/* 確認對話框 */}
      <Dialog open={showStartDialog} onClose={() => setShowStartDialog(false)}>
        <DialogTitle>確認開始目標訓練</DialogTitle>
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
                    
                    {/* 顯示材料需求 (如果是配方) */}
                    {(item as any).ingredients && (item as any).ingredients.length > 0 && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          所需材料：
                        </Typography>
                        {(item as any).ingredients.map((ingredient: any, index: number) => (
                          <Typography key={index} variant="body2" sx={{ ml: 1, fontSize: '0.85rem' }}>
                            • {ingredient.item ? 
                                ingredient.item.name : 
                                ingredient.category ? 
                                  `任何 ${ingredient.category} 類型` : 
                                  `標籤: ${ingredient.tag?.name}`
                              } × {ingredient.quantity * repetitions}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    
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
            onClick={handleStartTargetedTraining} 
            variant="contained"
            disabled={isTargetTrainingLoading}
          >
            確認開始
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}