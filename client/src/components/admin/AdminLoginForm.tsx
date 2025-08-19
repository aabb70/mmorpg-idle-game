import { useState } from 'react'
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert
} from '@mui/material'

interface AdminLoginFormProps {
  onLogin: (token: string) => void
}

export default function AdminLoginForm({ onLogin }: AdminLoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        onLogin(data.token)
      } else {
        const errorData = await response.json()
        setError(errorData.message || '登入失敗')
      }
    } catch (err) {
      setError('連接服務器失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        請輸入管理員帳號密碼
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="管理員帳號"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="密碼"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="error"
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? '登入中...' : '登入管理員後台'}
      </Button>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 提示：預設管理員帳號是 admin，密碼是 admin123
        </Typography>
      </Box>
    </Box>
  )
}