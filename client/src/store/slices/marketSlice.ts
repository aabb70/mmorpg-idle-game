import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MarketListing {
  id: string
  sellerId: string
  sellerName: string
  itemId: string
  itemName: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
  createdAt: string
}

interface MarketState {
  listings: MarketListing[]
  myListings: MarketListing[]
  loading: boolean
  searchTerm: string
}

const initialState: MarketState = {
  listings: [],
  myListings: [],
  loading: false,
  searchTerm: '',
}

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setListings: (state, action: PayloadAction<MarketListing[]>) => {
      state.listings = action.payload
    },
    setMyListings: (state, action: PayloadAction<MarketListing[]>) => {
      state.myListings = action.payload
    },
    addListing: (state, action: PayloadAction<MarketListing>) => {
      state.listings.push(action.payload)
    },
    removeListing: (state, action: PayloadAction<string>) => {
      state.listings = state.listings.filter(listing => listing.id !== action.payload)
      state.myListings = state.myListings.filter(listing => listing.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
  },
})

export const {
  setListings,
  setMyListings,
  addListing,
  removeListing,
  setLoading,
  setSearchTerm,
} = marketSlice.actions
export default marketSlice.reducer