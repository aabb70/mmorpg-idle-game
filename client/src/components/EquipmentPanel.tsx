import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material'
import { Shield, Construction, Restaurant, LocalFlorist, LocalFireDepartment } from '@mui/icons-material'
import { addNotification } from '../store/slices/gameSlice'

const equipmentSlots = {
  HEAD: { name: '頭部', icon: '🎩' },
  HANDS: { name: '手部', icon: '🧤' },
  CHEST: { name: '上衣', icon: '👕' },
  LEGS: { name: '下褲', icon: '👖' },
  CLOAK: { name: '披風', icon: '🧥' },
  MINING_TOOL: { name: '採礦工具', icon: '⛏️' },
  LOGGING_TOOL: { name: '伐木工具', icon: '🪓' },
  FISHING_TOOL: { name: '釣魚工具', icon: '🎣' },
  FORAGING_TOOL: { name: '採集工具', icon: '🥄' },
  SMITHING_TOOL: { name: '鍛造工具', icon: '🔨' },
  TAILORING_TOOL: { name: '裁縫工具', icon: '✂️' },
  COOKING_TOOL: { name: '廚師工具', icon: '🍳' },
  ALCHEMY_TOOL: { name: '煉金工具', icon: '⚗️' },
  CRAFTING_TOOL: { name: '工藝工具', icon: '🔧' }
}

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3', 
  EPIC: '#9C27B0',
  LEGENDARY: '#FF6B35'
}

interface Equipment {
  slot: string
  item: any | null
}

interface Stats {
  attackBonus: number
  defenseBonus: number
  healthBonus: number
  skillBonuses: Record<string, number>
}

export default function EquipmentPanel() {
  const dispatch = useDispatch()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [stats, setStats] = useState<Stats>({
    attackBonus: 0,
    defenseBonus: 0,
    healthBonus: 0,
    skillBonuses: {}
  })
  const [loading, setLoading] = useState(true)
  const [unequipping, setUnequipping] = useState<string | null>(null)

  useEffect(() => {
    loadUserEquipment()
    loadEquipmentStats()
  }, [])

  const loadUserEquipment = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('https://mmorpg-idle-game.onrender.com/api/equipment', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // 初始化所有槽位
        const allSlots = Object.keys(equipmentSlots).map(slot => {
          const existingEquipment = data.equipments.find((eq: any) => eq.slot === slot)
          return {
            slot,
            item: existingEquipment?.item || null
          }
        })
        
        setEquipments(allSlots)
      }
    } catch (error) {
      console.error('載入裝備錯誤:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEquipmentStats = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('https://mmorpg-idle-game.onrender.com/api/equipment/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('載入裝備屬性錯誤:', error)
    }
  }

  const handleUnequip = async (slot: string) => {
    try {
      setUnequipping(slot)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('https://mmorpg-idle-game.onrender.com/api/equipment/unequip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slot })
      })

      if (response.ok) {
        const data = await response.json()
        dispatch(addNotification(data.message))
        
        // 重新載入裝備和屬性
        await loadUserEquipment()
        await loadEquipmentStats()
        
        // 觸發背包重新載入
        window.location.reload()
      } else {
        const errorData = await response.json()
        dispatch(addNotification(errorData.message || '卸下裝備失敗'))
      }
    } catch (error) {
      console.error('卸下裝備錯誤:', error)
      dispatch(addNotification('卸下裝備失敗，請稍後再試'))
    } finally {
      setUnequipping(null)
    }
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          載入裝備中...
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Shield />
        裝備
      </Typography>

      {/* 屬性加成顯示 */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          屬性加成
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Chip 
              label={`⚔️ 攻擊: +${stats.attackBonus}`}
              color={stats.attackBonus > 0 ? 'error' : 'default'}
              variant={stats.attackBonus > 0 ? 'filled' : 'outlined'}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Chip 
              label={`🛡️ 防禦: +${stats.defenseBonus}`}
              color={stats.defenseBonus > 0 ? 'primary' : 'default'}
              variant={stats.defenseBonus > 0 ? 'filled' : 'outlined'}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Chip 
              label={`❤️ 生命: +${stats.healthBonus}`}
              color={stats.healthBonus > 0 ? 'success' : 'default'}
              variant={stats.healthBonus > 0 ? 'filled' : 'outlined'}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Chip 
              label={`✨ 技能: +${Object.values(stats.skillBonuses).reduce((sum, val) => sum + val, 0)}`}
              color={Object.keys(stats.skillBonuses).length > 0 ? 'secondary' : 'default'}
              variant={Object.keys(stats.skillBonuses).length > 0 ? 'filled' : 'outlined'}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* 基礎裝備槽位 */}
      <Typography variant="h6" gutterBottom>
        基礎裝備
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {['HEAD', 'HANDS', 'CHEST', 'LEGS', 'CLOAK'].map((slot) => {
          const equipment = equipments.find(eq => eq.slot === slot)
          const slotInfo = equipmentSlots[slot as keyof typeof equipmentSlots]
          
          return (
            <Grid item xs={6} sm={4} md={2.4} key={slot}>
              <Card 
                sx={{ 
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1,
                  ...(equipment?.item && {
                    border: `2px solid ${rarityColors[equipment.item.rarity as keyof typeof rarityColors] || '#9E9E9E'}40`,
                    backgroundColor: `${rarityColors[equipment.item.rarity as keyof typeof rarityColors] || '#9E9E9E'}10`
                  })
                }}
              >
                <Typography variant="caption" align="center" sx={{ mb: 1 }}>
                  {slotInfo.name}
                </Typography>
                
                {equipment?.item ? (
                  <>
                    <Avatar sx={{ 
                      bgcolor: rarityColors[equipment.item.rarity as keyof typeof rarityColors] || '#9E9E9E',
                      mb: 1,
                      fontSize: '1.5rem'
                    }}>
                      {slotInfo.icon}
                    </Avatar>
                    <Typography variant="caption" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {equipment.item.name}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleUnequip(slot)}
                      disabled={unequipping === slot}
                      sx={{ fontSize: '0.7rem', py: 0.5 }}
                    >
                      {unequipping === slot ? '卸下中...' : '卸下'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Avatar sx={{ bgcolor: 'grey.300', mb: 1, fontSize: '1.5rem' }}>
                      {slotInfo.icon}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" align="center">
                      空
                    </Typography>
                  </>
                )}
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* 技能裝備槽位 */}
      <Typography variant="h6" gutterBottom>
        技能裝備
      </Typography>
      <Grid container spacing={2}>
        {['MINING_TOOL', 'LOGGING_TOOL', 'FISHING_TOOL', 'FORAGING_TOOL', 'SMITHING_TOOL', 
          'TAILORING_TOOL', 'COOKING_TOOL', 'ALCHEMY_TOOL', 'CRAFTING_TOOL'].map((slot) => {
          const equipment = equipments.find(eq => eq.slot === slot)
          const slotInfo = equipmentSlots[slot as keyof typeof equipmentSlots]
          
          return (
            <Grid item xs={6} sm={4} md={3} key={slot}>
              <Card 
                sx={{ 
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1,
                  ...(equipment?.item && {
                    border: `2px solid ${rarityColors[equipment.item.rarity as keyof typeof rarityColors] || '#9E9E9E'}40`,
                    backgroundColor: `${rarityColors[equipment.item.rarity as keyof typeof rarityColors] || '#9E9E9E'}10`
                  })
                }}
              >
                <Typography variant="caption" align="center" sx={{ mb: 1 }}>
                  {slotInfo.name}
                </Typography>
                
                {equipment?.item ? (
                  <>
                    <Avatar sx={{ 
                      bgcolor: rarityColors[equipment.item.rarity as keyof typeof rarityColors] || '#9E9E9E',
                      mb: 1,
                      fontSize: '1.5rem'
                    }}>
                      {slotInfo.icon}
                    </Avatar>
                    <Typography variant="caption" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {equipment.item.name}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleUnequip(slot)}
                      disabled={unequipping === slot}
                      sx={{ fontSize: '0.7rem', py: 0.5 }}
                    >
                      {unequipping === slot ? '卸下中...' : '卸下'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Avatar sx={{ bgcolor: 'grey.300', mb: 1, fontSize: '1.5rem' }}>
                      {slotInfo.icon}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" align="center">
                      空
                    </Typography>
                  </>
                )}
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* 技能加成詳情 */}
      {Object.keys(stats.skillBonuses).length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            技能等級加成
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(stats.skillBonuses).map(([skill, bonus]) => (
              <Chip
                key={skill}
                label={`${skill}: +${bonus}`}
                color="secondary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  )
}