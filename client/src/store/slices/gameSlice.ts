import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GameState {
  isConnected: boolean
  currentView: 'skills' | 'inventory' | 'market' | 'crafting' | 'boss'
  notifications: string[]
}

const initialState: GameState = {
  isConnected: false,
  currentView: 'skills',
  notifications: [],
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setCurrentView: (state, action: PayloadAction<GameState['currentView']>) => {
      state.currentView = action.payload
    },
    addNotification: (state, action: PayloadAction<string>) => {
      state.notifications.push(action.payload)
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications.splice(action.payload, 1)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  setConnected,
  setCurrentView,
  addNotification,
  removeNotification,
  clearNotifications,
} = gameSlice.actions
export default gameSlice.reducer