import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  ButtonGroup,
} from '@mui/material'
import { RootState } from '../store/store'
import { setCurrentView } from '../store/slices/gameSlice'
import SkillsPanel from '../components/SkillsPanel'
import InventoryPanel from '../components/InventoryPanel'
import MarketPanel from '../components/MarketPanel'
import { socketManager } from '../utils/socket'

export default function GamePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentView } = useSelector((state: RootState) => state.game)

  useEffect(() => {
    if (user) {
      // 連接 Socket.io
      socketManager.connect()
      socketManager.joinGame({ username: user.username })
      
      // 監聽其他玩家的活動
      socketManager.on('player-joined', (data: any) => {
        console.log(data.message)
      })
      
      socketManager.on('player-level-up', (data: any) => {
        console.log(`${data.username} 的 ${data.skillType} 技能升到了 ${data.level} 級！`)
      })
    }
    
    return () => {
      socketManager.disconnect()
    }
  }, [user])

  const renderCurrentView = () => {
    switch (currentView) {
      case 'skills':
        return <SkillsPanel />
      case 'inventory':
        return <InventoryPanel />
      case 'market':
        return <MarketPanel />
      default:
        return <SkillsPanel />
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MMORPG 放置遊戲
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`${user.username}`} color="secondary" />
              <Chip label={`等級 ${user.level}`} color="primary" />
              <Chip label={`金幣 ${user.gold}`} sx={{ backgroundColor: '#FFD700' }} />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <ButtonGroup variant="contained" fullWidth>
                <Button
                  onClick={() => dispatch(setCurrentView('skills'))}
                  variant={currentView === 'skills' ? 'contained' : 'outlined'}
                >
                  技能
                </Button>
                <Button
                  onClick={() => dispatch(setCurrentView('inventory'))}
                  variant={currentView === 'inventory' ? 'contained' : 'outlined'}
                >
                  背包
                </Button>
                <Button
                  onClick={() => dispatch(setCurrentView('market'))}
                  variant={currentView === 'market' ? 'contained' : 'outlined'}
                >
                  市場
                </Button>
              </ButtonGroup>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            {renderCurrentView()}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}