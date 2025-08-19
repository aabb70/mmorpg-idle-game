import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class SocketManager {
  private socket: Socket | null = null
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map()

  connect(token?: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      }
    })

    this.socket.on('connect', () => {
      console.log('Socket 已連接')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket 已斷開')
    })

    // 恢復事件監聽器
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback)
      })
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)

    if (this.socket?.connected) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      const callbacks = this.listeners.get(event) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
      this.socket?.off(event, callback)
    } else {
      this.listeners.delete(event)
      this.socket?.off(event)
    }
  }

  joinGame(userData: { username: string }) {
    this.emit('join-game', userData)
  }

  notifySkillLevelUp(data: { username: string; skillType: string; level: number }) {
    this.emit('skill-level-up', data)
  }

  notifyMarketUpdate(data: any) {
    this.emit('market-update', data)
  }
}

export const socketManager = new SocketManager()