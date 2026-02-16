class WebSocketService {
    constructor() {
      this.ws = null
      this.listeners = []
      this.reconnectAttempts = 0
      this.maxReconnectAttempts = 5
    }
  
    connect(pollId) {
      const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
      const wsUrl = `${WS_URL}/ws/polls/${pollId}/`
  
      this.ws = new WebSocket(wsUrl)
  
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }
  
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.listeners.forEach(listener => listener(data))
      }
  
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
  
      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
            this.connect(pollId)
          }, 2000 * this.reconnectAttempts)
        }
      }
    }
  
    disconnect() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
      this.listeners = []
    }
  
    subscribe(callback) {
      this.listeners.push(callback)
      return () => {
        this.listeners = this.listeners.filter(listener => listener !== callback)
      }
    }
  
    send(data) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data))
      }
    }
  }
  
  export default new WebSocketService()