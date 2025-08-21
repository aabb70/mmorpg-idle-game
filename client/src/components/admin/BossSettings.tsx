import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from '@mui/material'
import { Save, Refresh, SwapHoriz, Settings } from '@mui/icons-material'

interface BossSettings {
  id: string
  autoSwitchEnabled: boolean
  autoSwitchDelayHours: number
  defaultDurationHours: number
  bossSelectionMode: string
}

interface Boss {
  id: string
  name: string
  description: string
  level: number
  rarity: string
}

const selectionModes = [
  { value: 'RANDOM', label: '隨機選擇', description: '隨機選擇任意Boss' },
  { value: 'SEQUENTIAL', label: '按等級順序', description: '按Boss等級從低到高循環' },
  { value: 'WEIGHTED', label: '按稀有度權重', description: '普通Boss出現機率更高' }
]

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3',
  EPIC: '#9C27B0',
  LEGENDARY: '#FF6B35'
}

export default function BossSettings() {
  const [settings, setSettings] = useState<BossSettings>({
    id: '',
    autoSwitchEnabled: true,
    autoSwitchDelayHours: 1,
    defaultDurationHours: 24,
    bossSelectionMode: 'RANDOM'
  })
  
  const [bosses, setBosses] = useState<Boss[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [switchDialog, setSwitchDialog] = useState(false)
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null)
  const [switchDuration, setSwitchDuration] = useState(24)

  useEffect(() => {
    fetchSettings()
    fetchBosses()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/boss/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        setMessage('獲取Boss設置失敗')
      }
    } catch (error) {
      console.error('獲取Boss設置錯誤:', error)
      setMessage('獲取Boss設置失敗')
    }
  }

  const fetchBosses = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/bosses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBosses(data.bosses || [])
      }
    } catch (error) {
      console.error('獲取Boss列表錯誤:', error)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/boss/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Boss設置保存成功！')
        setSettings(data.settings)
      } else {
        setMessage(data.error || 'Boss設置保存失敗')
      }
    } catch (error) {
      console.error('保存Boss設置失敗:', error)
      setMessage('保存Boss設置失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSwitch = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/boss/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          forceBossId: selectedBoss?.id,
          durationHours: switchDuration
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || 'Boss切換成功！')
        setSwitchDialog(false)
        setSelectedBoss(null)
        setSwitchDuration(24)
      } else {
        setMessage(data.error || 'Boss切換失敗')
      }
    } catch (error) {
      console.error('手動切換Boss失敗:', error)
      setMessage('手動切換Boss失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoSwitch = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/boss/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          durationHours: settings.defaultDurationHours
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || '自動選擇Boss成功！')
      } else {
        setMessage(data.error || '自動選擇Boss失敗')
      }
    } catch (error) {
      console.error('自動選擇Boss失敗:', error)
      setMessage('自動選擇Boss失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Boss系統設置
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchSettings}
            disabled={loading}
          >
            重新載入
          </Button>
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={handleAutoSwitch}
            disabled={loading}
          >
            自動切換Boss
          </Button>
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={() => setSwitchDialog(true)}
            disabled={loading}
          >
            手動切換Boss
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存設置'}
          </Button>
        </Box>
      </Box>

      {message && (
        <Alert 
          severity={message.includes('成功') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 自動切換設置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Settings sx={{ mr: 1, verticalAlign: 'bottom' }} />
                自動切換設置
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSwitchEnabled}
                        onChange={(e) => setSettings({...settings, autoSwitchEnabled: e.target.checked})}
                      />
                    }
                    label="啟用自動切換"
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Boss被擊敗後自動切換到下一個Boss
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="切換延遲時間 (小時)"
                    value={settings.autoSwitchDelayHours}
                    onChange={(e) => setSettings({...settings, autoSwitchDelayHours: parseInt(e.target.value) || 1})}
                    inputProps={{ min: 0, max: 168 }}
                    helperText="Boss被擊敗後等待多久自動切換 (0-168小時)"
                    disabled={!settings.autoSwitchEnabled}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="預設持續時間 (小時)"
                    value={settings.defaultDurationHours}
                    onChange={(e) => setSettings({...settings, defaultDurationHours: parseInt(e.target.value) || 24})}
                    inputProps={{ min: 1, max: 168 }}
                    helperText="新Boss實例的預設持續時間 (1-168小時)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Boss選擇規則 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Boss選擇規則
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>選擇模式</InputLabel>
                <Select
                  value={settings.bossSelectionMode}
                  onChange={(e) => setSettings({...settings, bossSelectionMode: e.target.value})}
                  label="選擇模式"
                >
                  {selectionModes.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {mode.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {mode.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  當前規則說明：
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectionModes.find(mode => mode.value === settings.bossSelectionMode)?.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 系統狀態 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                系統狀態
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: settings.autoSwitchEnabled ? 'success.light' : 'grey.200', borderRadius: 1 }}>
                    <Typography variant="h4" color={settings.autoSwitchEnabled ? 'success.dark' : 'text.secondary'}>
                      {settings.autoSwitchEnabled ? '✓' : '✗'}
                    </Typography>
                    <Typography variant="subtitle2">
                      自動切換
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="h4" color="info.dark">
                      {settings.autoSwitchDelayHours}h
                    </Typography>
                    <Typography variant="subtitle2">
                      切換延遲
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="h4" color="warning.dark">
                      {settings.defaultDurationHours}h
                    </Typography>
                    <Typography variant="subtitle2">
                      預設持續時間
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 手動切換Boss對話框 */}
      <Dialog open={switchDialog} onClose={() => setSwitchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>手動切換Boss</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={bosses}
                getOptionLabel={(boss) => `${boss.name} (Lv.${boss.level} - ${boss.rarity})`}
                value={selectedBoss}
                onChange={(_, newValue) => setSelectedBoss(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="選擇Boss (留空自動選擇)" />
                )}
                renderOption={(props, boss) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: rarityColors[boss.rarity as keyof typeof rarityColors],
                          borderRadius: '50%'
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {boss.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lv.{boss.level} - {boss.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="持續時間 (小時)"
                value={switchDuration}
                onChange={(e) => setSwitchDuration(parseInt(e.target.value) || 24)}
                inputProps={{ min: 1, max: 168 }}
                helperText="新Boss實例的持續時間 (1-168小時)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSwitchDialog(false)}>
            取消
          </Button>
          <Button
            onClick={handleManualSwitch}
            variant="contained"
            disabled={loading}
          >
            {loading ? '切換中...' : '確認切換'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}