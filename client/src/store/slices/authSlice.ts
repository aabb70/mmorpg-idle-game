import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  username: string
  email: string
  level: number
  experience: number
  gold: number
  health: number
  maxHealth: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.loading = false
      // 保存用戶資料到 localStorage
      localStorage.setItem('user_data', JSON.stringify(action.payload))
    },
    loginFailure: (state) => {
      state.loading = false
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        // 同步更新 localStorage 中的用戶資料
        localStorage.setItem('user_data', JSON.stringify(state.user))
      }
    },
    restoreAuth: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.loading = false
      // 更新 localStorage 中的用戶資料（以防數據有變化）
      localStorage.setItem('user_data', JSON.stringify(action.payload))
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, restoreAuth } = authSlice.actions
export default authSlice.reducer