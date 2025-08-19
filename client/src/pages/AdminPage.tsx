import { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  Button,
  Alert
} from '@mui/material'
import AdminLoginForm from '../components/admin/AdminLoginForm'
import UserManagement from '../components/admin/UserManagement'
import ItemManagement from '../components/admin/ItemManagement'

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    // 檢查是否有管理員 token
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (token: string) => {
    localStorage.setItem('admin_token', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setTabValue(0)
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom color="error">
            🔒 管理員後台
          </Typography>
          <AdminLoginForm onLogin={handleLogin} />
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" color="error">
              🛠️ 管理員後台
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
            >
              登出
            </Button>
          </Box>

          <Alert severity="warning" sx={{ mb: 3 }}>
            ⚠️ 警告：這是管理員後台，請謹慎操作！所有更改都會直接影響遊戲資料庫。
          </Alert>

          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} centered>
            <Tab label="用戶管理" />
            <Tab label="物品發放" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <UserManagement />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ItemManagement />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  )
}