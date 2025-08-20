import React from 'react'
import { Box, LinearProgress, Typography, Chip } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

interface HealthBarProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  variant?: 'standard' | 'compact'
}

const HealthBar: React.FC<HealthBarProps> = ({ 
  size = 'medium', 
  showText = true,
  variant = 'standard'
}) => {
  const { user } = useSelector((state: RootState) => state.auth)
  
  if (!user) return null

  const health = user.health || 100
  const maxHealth = user.maxHealth || 100
  const healthPercentage = (health / maxHealth) * 100

  // 根據血量百分比決定顏色
  const getHealthColor = () => {
    if (healthPercentage > 60) return '#4caf50' // 綠色
    if (healthPercentage > 30) return '#ff9800' // 橙色
    return '#f44336' // 紅色
  }

  // 根據尺寸設置高度
  const getBarHeight = () => {
    switch (size) {
      case 'small': return 6
      case 'medium': return 8
      case 'large': return 12
      default: return 8
    }
  }

  const barHeight = getBarHeight()
  const healthColor = getHealthColor()

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" sx={{ color: healthColor, fontWeight: 'bold', fontSize: '0.8rem' }}>
            ❤️
          </Typography>
          <Typography variant="caption" sx={{ color: healthColor, fontWeight: 'bold', minWidth: '45px' }}>
            {health}/{maxHealth}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 60 }}>
          <LinearProgress
            variant="determinate"
            value={healthPercentage}
            sx={{
              height: barHeight,
              borderRadius: barHeight / 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: barHeight / 2,
                backgroundColor: healthColor,
                transition: 'all 0.3s ease-in-out',
              },
            }}
          />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      {showText && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography 
            variant={size === 'large' ? 'h6' : 'body2'} 
            sx={{ 
              color: healthColor, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            ❤️ 生命值
          </Typography>
          <Chip
            label={`${health} / ${maxHealth}`}
            size="small"
            sx={{
              backgroundColor: healthColor,
              color: 'white',
              fontWeight: 'bold',
              fontSize: size === 'large' ? '0.875rem' : '0.75rem',
            }}
          />
        </Box>
      )}
      
      <LinearProgress
        variant="determinate"
        value={healthPercentage}
        sx={{
          height: barHeight,
          borderRadius: barHeight / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
          '& .MuiLinearProgress-bar': {
            borderRadius: barHeight / 2,
            background: `linear-gradient(90deg, ${healthColor} 0%, ${healthColor}dd 50%, ${healthColor} 100%)`,
            boxShadow: `0 0 ${barHeight}px ${healthColor}40`,
            transition: 'all 0.3s ease-in-out',
          },
        }}
      />
      
      {/* 危險狀態提示 */}
      {healthPercentage <= 20 && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label="⚠️ 生命值危險！"
            color="error"
            size="small"
            sx={{
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.6 },
                '100%': { opacity: 1 },
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default HealthBar