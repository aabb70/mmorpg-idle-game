import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  itemType: string
  rarity: string
}

interface InventoryState {
  items: InventoryItem[]
  loading: boolean
}

const initialState: InventoryState = {
  items: [],
  loading: false,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload
    },
    addItem: (state, action: PayloadAction<InventoryItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeItem: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload
      const item = state.items.find(item => item.id === id)
      if (item) {
        item.quantity -= quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter(item => item.id !== id)
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setItems, addItem, removeItem, setLoading } = inventorySlice.actions
export default inventorySlice.reducer