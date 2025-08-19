const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://mmorpg-idle-game.onrender.com' 
    : 'http://localhost:5000')

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('auth_token')
    console.log('ApiClient 初始化，token:', this.token ? '已設定' : '未設定')
  }

  setToken(token: string) {
    console.log('設定新的 token:', token ? '已設定' : '未設定')
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}/api${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    console.log(`API 請求: ${endpoint}`, {
      url,
      hasToken: !!this.token,
      headers: { ...headers, Authorization: this.token ? '[已設定]' : '[未設定]' }
    })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log(`API 響應: ${endpoint}`, {
      status: response.status,
      ok: response.ok
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`API 錯誤: ${endpoint}`, errorData)
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // 認證相關
  async register(userData: { username: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { username: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async getProfile() {
    return this.request('/auth/profile')
  }

  // 遊戲相關
  async getItems() {
    return this.request('/game/items')
  }

  async getRecipes() {
    return this.request('/game/recipes')
  }

  async trainSkill(skillType: string) {
    return this.request('/game/train-skill', {
      method: 'POST',
      body: JSON.stringify({ skillType }),
    })
  }

  async craftItem(recipeId: string) {
    return this.request('/game/craft', {
      method: 'POST',
      body: JSON.stringify({ recipeId }),
    })
  }

  // 目標訓練相關
  async getAvailableItems(skillType: string) {
    return this.request(`/game/available-items/${skillType}`)
  }

  async startTargetedTraining(trainingData: { skillType: string; targetItemId: string; repetitions: number }) {
    return this.request('/game/start-targeted-training', {
      method: 'POST',
      body: JSON.stringify(trainingData),
    })
  }

  async stopTargetedTraining() {
    return this.request('/game/stop-targeted-training', {
      method: 'POST',
    })
  }

  async getOfflineProgress() {
    return this.request('/game/offline-progress')
  }

  // 市場相關
  async getMarketListings() {
    return this.request('/market/listings')
  }

  async getMyListings() {
    return this.request('/market/my-listings')
  }

  async createListing(listingData: { itemId: string; quantity: number; pricePerUnit: number }) {
    return this.request('/market/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    })
  }

  async removeListing(listingId: string) {
    return this.request(`/market/listings/${listingId}`, {
      method: 'DELETE',
    })
  }

  async purchaseItem(purchaseData: { listingId: string; quantity: number }) {
    return this.request('/market/purchase', {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    })
  }
}

export const apiClient = new ApiClient()