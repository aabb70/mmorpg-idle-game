import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
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
} from '@mui/material'
import { RootState } from '../store/store'
import { SkillType, setActiveSkill, startTraining, stopTraining, addExperience } from '../store/slices/skillSlice'
import { addItem } from '../store/slices/inventorySlice'
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

const skillMaterials: Record<SkillType, string[]> = {
  [SkillType.MINING]: ['銅礦石', '鐵礦石', '金礦石'],
  [SkillType.LOGGING]: ['普通木材', '硬木'],
  [SkillType.FISHING]: ['小魚', '大魚'],
  [SkillType.FORAGING]: ['草藥', '魔法草'],
  [SkillType.SMITHING]: ['銅錘', '鐵錘', '銅劍', '鐵劍'],
  [SkillType.TAILORING]: ['布衣', '皮甲'],
  [SkillType.COOKING]: ['麵包'],
  [SkillType.ALCHEMY]: ['治療藥劑'],
  [SkillType.CRAFTING]: ['銅錘', '鐵錘'],
}

export default function SkillsPanel() {
  const dispatch = useDispatch()
  const { skills, activeSkill, isTraining } = useSelector((state: RootState) => state.skills)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [recentRewards, setRecentRewards] = useState<string[]>([])

  const handleStartTraining = async (skillType: SkillType) => {
    dispatch(setActiveSkill(skillType))
    dispatch(startTraining())
    setTrainingProgress(0)
    setRecentRewards([])

    // 開始訓練進度條
    const trainingTime = 3000 // 3秒訓練時間
    const interval = 50 // 50ms 更新一次
    const increment = 100 / (trainingTime / interval)

    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          completeTraining(skillType)
          return 100
        }
        return prev + increment
      })
    }, interval)
  }

  const completeTraining = async (skillType: SkillType) => {
    try {
      console.log('開始訓練技能:', skillType)
      
      // 調用後端 API
      const response = await apiClient.trainSkill(skillType)
      console.log('技能訓練響應:', response)
      
      // 更新前端狀態
      dispatch(addExperience({ 
        skillType, 
        amount: response.expGained 
      }))

      // 顯示獲得的物品
      if (response.itemsGained && response.itemsGained.length > 0) {
        const rewards = response.itemsGained.map((item: any) => 
          `${item.name} x${item.quantity}`
        )
        setRecentRewards(rewards)
        
        // 添加到背包
        response.itemsGained.forEach((item: any) => {
          dispatch(addItem({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            itemType: 'MATERIAL',
            rarity: 'COMMON'
          }))
        })
        
        // 顯示物品獲得通知
        const itemMessage = response.itemsGained.map((item: any) => 
          `獲得 ${item.name} x${item.quantity}`
        ).join(', ')
        dispatch(addNotification(`🎁 ${itemMessage}`))
      } else {
        // 如果沒有獲得物品也要提示
        dispatch(addNotification('🎯 訓練完成，但這次沒有獲得物品'))
      }

      // 顯示經驗通知
      const expMessage = `${skillNames[skillType]} +${response.expGained} 經驗`
      dispatch(addNotification(`⭐ ${expMessage}`))

      if (response.leveledUp) {
        dispatch(addNotification(`🎉 ${skillNames[skillType]} 升級了！`))
      }

    } catch (error) {
      console.error('訓練失敗:', error)
      dispatch(addNotification('訓練失敗，請稍後再試'))
    } finally {
      dispatch(stopTraining())
      setTrainingProgress(0)
      
      // 3秒後清除獎勵顯示
      setTimeout(() => setRecentRewards([]), 3000)
    }
  }

  const handleStopTraining = () => {
    dispatch(stopTraining())
    setTrainingProgress(0)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        技能訓練
      </Typography>

      {activeSkill && isTraining && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6">
              正在訓練：{skillNames[activeSkill]}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={trainingProgress} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                訓練進度：{Math.round(trainingProgress)}%
              </Typography>
            </Box>
          </Alert>
          
          {recentRewards.length > 0 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">獲得物品：</Typography>
              <Box sx={{ mt: 1 }}>
                {recentRewards.map((reward, index) => (
                  <Chip 
                    key={index} 
                    label={reward} 
                    color="success" 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Alert>
          )}
          
          <Button variant="contained" color="secondary" onClick={handleStopTraining}>
            停止訓練
          </Button>
        </Box>
      )}

      <Grid container spacing={2}>
        {Object.values(SkillType).map((skillType) => {
          const skill = skills[skillType]
          const progressPercent = (skill.experience / skill.maxExperience) * 100

          return (
            <Grid item xs={12} sm={6} md={4} key={skillType}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {skillNames[skillType]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    等級 {skill.level}
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercent}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {skill.experience} / {skill.maxExperience} 經驗
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    可能獲得：{skillMaterials[skillType].slice(0, 2).join('、')}
                    {skillMaterials[skillType].length > 2 && '...'}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isTraining && activeSkill !== skillType}
                    onClick={() => handleStartTraining(skillType)}
                  >
                    {activeSkill === skillType && isTraining ? '訓練中...' : '開始訓練'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Paper>
  )
}