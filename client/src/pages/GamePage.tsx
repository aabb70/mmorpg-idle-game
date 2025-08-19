import { useEffect } from 'react'
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
import { setSkills } from '../store/slices/skillSlice'
import { setItems } from '../store/slices/inventorySlice'
import { restoreAuth, logout } from '../store/slices/authSlice'
import SkillsPanel from '../components/SkillsPanel'
import InventoryPanel from '../components/InventoryPanel'
import MarketPanel from '../components/MarketPanel'
import { socketManager } from '../utils/socket'
import { useNavigate } from 'react-router-dom'

export default function GamePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentView } = useSelector((state: RootState) => state.game)

  useEffect(() => {
    console.log('GamePage useEffect 觸發，用戶狀態:', user)
    
    // 如果用戶狀態為空，嘗試從 localStorage 恢復
    if (!user) {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      console.log('檢查 localStorage:', { token: !!token, userData: !!userData })
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          console.log('從 localStorage 恢復用戶資料:', parsedUser)
          dispatch(restoreAuth(parsedUser))
          return // 等待下次 useEffect 觸發
        } catch (error) {
          console.error('解析用戶資料失敗:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
        }
      }
    }
    
    if (user) {
      console.log('用戶已登入，開始載入資料')
      // 載入用戶完整資料
      loadUserData()
      
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
  }, [user, dispatch])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('沒有找到認證 token')
        return
      }

      console.log('開始載入用戶資料...', new Date().toISOString())
      const response = await fetch('https://mmorpg-idle-game.onrender.com/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('載入用戶資料成功:', data)
        
        // 更新技能資料
        if (data.skills && data.skills.length > 0) {
          dispatch(setSkills(data.skills))
          console.log('技能資料已更新到 Redux store')
        }
        
        // 更新背包資料
        if (data.inventory) {
          dispatch(setItems(data.inventory))
          console.log('背包資料已更新到 Redux store', data.inventory)
        }
        
      } else {
        console.error('載入用戶資料失敗:', response.status)
        const errorData = await response.text()
        console.error('錯誤詳情:', errorData)
      }
    } catch (error) {
      console.error('載入用戶資料錯誤:', error)
    }
  }

  const handleLogout = () => {
    // 清除 localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    // 清除 Redux 狀態
    dispatch(logout())
    // 導航到登入頁面
    navigate('/')
  }

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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip label={`${user.username}`} color="secondary" />
              <Chip label={`等級 ${user.level}`} color="primary" />
              <Chip label={`金幣 ${user.gold}`} sx={{ backgroundColor: '#FFD700' }} />
              <Button 
                variant="outlined" 
                color="inherit" 
                size="small"
                onClick={handleLogout}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                登出
              </Button>
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