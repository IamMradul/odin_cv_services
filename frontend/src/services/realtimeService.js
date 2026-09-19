// Realtime service — WebSocket/Socket.IO stub
// Phase 9: Replace with real Socket.IO or native WebSocket connection

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

class RealtimeService {
  constructor() {
    this._listeners = {};
    this._listeners = new Map();
    this._connected = false;
    this._ws = null;
  }

  connect() {
    if (this._ws) return;
    this._ws = new WebSocket(`${WS_URL}/ws/events`);
    
    this._ws.onopen = () => {
      this._connected = true;
      console.log('RealtimeService connected');
    };
    
    this._ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event) {
          this._dispatch(msg.event, msg.data);
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };
    
    this._ws.onclose = () => {
      this._connected = false;
      console.log('RealtimeService disconnected');
      setTimeout(() => {
        this._ws = null;
        this.connect();
      }, 3000);
    };
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  disconnect() {
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
    this._connected = false;
  }

  off(event, callback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(callback);
    }
  }

  _dispatch(event, data) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).forEach(cb => cb(data));
    }
  }

  isConnected() {
    return this._connected;
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
