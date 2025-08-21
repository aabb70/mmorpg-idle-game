import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Paper,
  Typography,
  Box,
  Button,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider
} from '@mui/material'
import { SportsMartialArts, Timer, LocalFireDepartment, Star } from '@mui/icons-material'
import { RootState } from '../store/store'
import { addNotification } from '../store/slices/gameSlice'
import { updateUser } from '../store/slices/authSlice'

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
}

interface BossInstance {
  id: string
  currentHealth: number
  isActive: boolean
  isDefeated: boolean
  startTime: string
  endTime: string
  boss: Boss
  actions: BossAction[]
}

interface BossAction {
  id: string
  damage: number
  skillUsed: string
  isCritical: boolean
  createdAt: string
  user: {
    username: string
  }
}

interface LeaderboardEntry {
  userId: string
  username: string
  level: number
  totalDamage: number
}

interface BossData {
  bossInstance: BossInstance | null
  damageLeaderboard: LeaderboardEntry[]
  timeRemaining: number
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

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3', 
  EPIC: '#9C27B0',
  LEGENDARY: '#FF6B35'
}

export default function BossPanel() {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [bossData, setBossData] = useState<BossData | null>(null)
  const [loading, setLoading] = useState(false)
  const [attacking, setAttacking] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<string>('MINING')
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [error, setError] = useState('')

  // 定時更新 Boss 數據
  useEffect(() => {
    fetchBossData()
    const interval = setInterval(fetchBossData, 30000) // 每30秒更新一次
    return () => clearInterval(interval)
  }, [])

  // 冷卻時間倒計時
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownRemaining])

  const fetchBossData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('https://mmorpg-idle-game.onrender.com/api/boss/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBossData(data)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch boss data')
      }
    } catch (error: any) {
      console.error('獲取 Boss 數據錯誤:', error)
      setError('網路連接錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleAttack = async () => {
    if (!user || !bossData || attacking) return

    try {
      setAttacking(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('https://mmorpg-idle-game.onrender.com/api/boss/attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skillType: selectedSkill
        })
      })

      const data = await response.json()

      if (response.ok) {
        // 顯示攻擊結果
        const criticalText = data.isCritical ? ' (暴擊!)' : ''
        const message = `${data.message} 造成 ${data.damage} 點傷害${criticalText}`
        dispatch(addNotification(message))

        // 更新用戶生命值
        dispatch(updateUser({ health: data.newHealth }))

        // 設置冷卻時間
        setCooldownRemaining(300) // 5分鐘 = 300秒

        // 立即更新 Boss 數據
        fetchBossData()

        if (data.bossDefeated) {
          dispatch(addNotification('🎉 Boss 被擊敗了！獎勵已發放！'))
        }
      } else {
        if (response.status === 429) {
          // 攻擊冷卻中
          setCooldownRemaining(data.remainingCooldown || 300)
        }
        dispatch(addNotification(data.message || '攻擊失敗'))
      }
    } catch (error: any) {
      console.error('攻擊 Boss 錯誤:', error)
      dispatch(addNotification('攻擊失敗，請稍後再試'))
    } finally {
      setAttacking(false)
    }
  }

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime()
    const actionTime = new Date(dateString).getTime()
    const diffMinutes = Math.floor((now - actionTime) / (1000 * 60))
    
    if (diffMinutes < 1) return '剛剛'
    if (diffMinutes < 60) return `${diffMinutes}分鐘前`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}小時前`
    return `${Math.floor(diffHours / 24)}天前`
  }

  if (loading && !bossData) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          載入 Boss 數據...
        </Typography>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchBossData}>
          重新載入
        </Button>
      </Paper>
    )
  }

  if (!bossData || !bossData.bossInstance) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          當前沒有活躍的 Boss
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          請稍候，新的 Boss 即將出現...
        </Typography>
      </Paper>
    )
  }

  const { bossInstance, damageLeaderboard, timeRemaining } = bossData
  const boss = bossInstance.boss
  const healthPercentage = (bossInstance.currentHealth / boss.maxHealth) * 100
  const isDefeated = bossInstance.isDefeated
  const rarityColor = rarityColors[boss.rarity as keyof typeof rarityColors] || rarityColors.COMMON

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SportsMartialArts />
        Boss 戰鬥
      </Typography>

      {/* 獎勵規則說明 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🏆 Boss戰鬥獎勵規則
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1 }}>
          <li><strong>按傷害貢獻分配</strong>：獎勵根據你對Boss造成的傷害比例分配</li>
          <li><strong>擊殺者額外獎勵</strong>：給予Boss最後一擊的玩家額外獲得20%金幣和經驗</li>
          <li><strong>團隊合作</strong>：所有參與攻擊的玩家都能獲得獎勵</li>
          <li><strong>裝備加成</strong>：裝備的攻擊力和技能加成會影響傷害輸出</li>
        </Box>
        <Typography variant="body2" color="text.secondary">
          💡 小貼士：使用Boss弱點技能可造成1.5倍傷害！
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Boss 信息 */}
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${rarityColor}20 0%, transparent 50%)`,
              border: `2px solid ${rarityColor}40`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                    {boss.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {boss.description}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={boss.rarity}
                    sx={{
                      backgroundColor: rarityColor,
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    等級 {boss.level}
                  </Typography>
                </Box>
              </Box>

              {/* Boss 血量條 */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" color="error">
                    ❤️ 生命值
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {bossInstance.currentHealth.toLocaleString()} / {boss.maxHealth.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={healthPercentage}
                  sx={{
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 10,
                      background: isDefeated 
                        ? 'linear-gradient(90deg, #666 0%, #999 100%)'
                        : 'linear-gradient(90deg, #f44336 0%, #ff6b6b 100%)',
                      boxShadow: '0 0 10px rgba(244, 67, 54, 0.5)',
                    },
                  }}
                />
                {isDefeated && (
                  <Typography variant="h6" color="success.main" sx={{ textAlign: 'center', mt: 1 }}>
                    🎉 Boss 已被擊敗！
                  </Typography>
                )}
              </Box>

              {/* 剩餘時間 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Timer color="primary" />
                <Typography variant="body1">
                  剩餘時間: {formatTime(timeRemaining)}
                </Typography>
              </Box>

              {/* Boss 屬性 */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">攻擊力</Typography>
                  <Typography variant="h6" color="error">{boss.attack}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">防禦力</Typography>
                  <Typography variant="h6" color="primary">{boss.defense}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">獎勵金幣</Typography>
                  <Typography variant="h6" color="warning.main">{boss.goldReward}</Typography>
                </Grid>
              </Grid>

              {/* 弱點技能 */}
              {boss.weaknessSkills.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    弱點技能 (額外傷害):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {boss.weaknessSkills.map((skill: string) => (
                      <Chip
                        key={skill}
                        label={skillNames[skill as keyof typeof skillNames] || skill}
                        size="small"
                        color="warning"
                        icon={<LocalFireDepartment />}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* 攻擊控制 */}
              {!isDefeated && user && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    選擇技能攻擊
                  </Typography>
                  
                  {user.health <= 0 ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      生命值不足！請先使用治療藥劑恢復生命值
                    </Alert>
                  ) : (
                    <>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>選擇技能</InputLabel>
                            <Select
                              value={selectedSkill}
                              onChange={(e) => setSelectedSkill(e.target.value)}
                              label="選擇技能"
                            >
                              {Object.entries(skillNames).map(([skill, name]) => (
                                <MenuItem key={skill} value={skill}>
                                  {name}
                                  {boss.weaknessSkills.includes(skill) && (
                                    <Chip size="small" label="弱點" color="warning" sx={{ ml: 1 }} />
                                  )}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Button
                            variant="contained"
                            color="error"
                            size="large"
                            fullWidth
                            onClick={handleAttack}
                            disabled={attacking || cooldownRemaining > 0}
                            startIcon={attacking ? <CircularProgress size={20} /> : <SportsMartialArts />}
                          >
                            {attacking ? '攻擊中...' : 
                             cooldownRemaining > 0 ? `冷卻中 (${cooldownRemaining}s)` : 
                             '攻擊！'}
                          </Button>
                        </Grid>
                      </Grid>
                      
                      {cooldownRemaining > 0 && (
                        <LinearProgress
                          variant="determinate"
                          value={(300 - cooldownRemaining) / 300 * 100}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />
                      )}
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 排行榜 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star color="warning" />
                傷害排行榜
              </Typography>
              
              {damageLeaderboard.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  還沒有人攻擊這個 Boss
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {damageLeaderboard.map((entry, index) => (
                    <Box
                      key={entry.userId}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index === damageLeaderboard.length - 1 ? 'none' : '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={index + 1}
                          size="small"
                          color={index === 0 ? 'warning' : index < 3 ? 'primary' : 'default'}
                        />
                        <Typography variant="body2" sx={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                          {entry.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (Lv.{entry.level})
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                        {entry.totalDamage.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* 最近攻擊記錄 */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                最近攻擊記錄
              </Typography>
              
              {bossInstance.actions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  暫無攻擊記錄
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {bossInstance.actions.slice(0, 10).map((action) => (
                    <Box
                      key={action.id}
                      sx={{
                        py: 0.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        fontSize: '0.875rem'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.primary">
                          {action.user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(action.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="error">
                        {skillNames[action.skillUsed as keyof typeof skillNames]} 
                        造成 {action.damage} 傷害
                        {action.isCritical && ' (暴擊!)'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  )
}