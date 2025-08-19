import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import gameSlice from './slices/gameSlice'
import skillSlice from './slices/skillSlice'
import inventorySlice from './slices/inventorySlice'
import marketSlice from './slices/marketSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    game: gameSlice,
    skills: skillSlice,
    inventory: inventorySlice,
    market: marketSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch