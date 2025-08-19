import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Tab,
  Tabs,
} from '@mui/material'
import { loginSuccess } from '../store/slices/authSlice'
import { apiClient } from '../utils/api'

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function LoginPage() {
  const [tab, setTab] = useState(0)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogin = async () => {
    try {
      const response = await apiClient.login({ username, password })
      apiClient.setToken(response.token)
      dispatch(loginSuccess(response.user))
      navigate('/game')
    } catch (error) {
      console.error('登入失敗:', error)
      // 這裡可以顯示錯誤訊息
    }
  }

  const handleRegister = async () => {
    try {
      const response = await apiClient.register({ username, email, password })
      apiClient.setToken(response.token)
      dispatch(loginSuccess(response.user))
      navigate('/game')
    } catch (error) {
      console.error('註冊失敗:', error)
      // 這裡可以顯示錯誤訊息
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          MMORPG 放置遊戲
        </Typography>
        
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="登入" />
          <Tab label="註冊" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <TextField
            fullWidth
            label="用戶名"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            label="密碼"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleLogin}
          >
            登入
          </Button>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <TextField
            fullWidth
            label="用戶名"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            label="電子郵件"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="密碼"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleRegister}
          >
            註冊
          </Button>
        </TabPanel>
      </Paper>
    </Container>
  )
}