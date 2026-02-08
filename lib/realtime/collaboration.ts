// Collaboration manager for real-time editing
// Note: Requires WebSocket server implementation

export interface CollaborationEvent {
  type: 'element_added' | 'element_updated' | 'element_deleted' | 'element_moved' | 'selection_changed' | 'cursor_moved';
  pageId: string;
  userId: string;
  timestamp: number;
  data: any;
}

export class CollaborationManager {
  private ws: WebSocket | null = null;
  private pageId: string;
  private userId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(event: CollaborationEvent) => void>> = new Map();

  constructor(pageId: string, userId: string) {
    this.pageId = pageId;
    this.userId = userId;
  }

  on(event: string, callback: (data: CollaborationEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  emit(event: string, data: CollaborationEvent) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  connect() {
    if (typeof window === 'undefined') return;
    
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:3001`;
    try {
      this.ws = new WebSocket(`${wsUrl}/collaboration/${this.pageId}?userId=${this.userId}`);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.emit('connected', {} as CollaborationEvent);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: CollaborationEvent = JSON.parse(event.data);
          if (message.userId !== this.userId) {
            this.emit('remote_change', message);
          }
        } catch (error) {
          console.error('Error parsing collaboration message:', error);
        }
      };

      this.ws.onerror = (error) => {
        this.emit('error', error as any);
      };

      this.ws.onclose = () => {
        this.emit('disconnected', {} as CollaborationEvent);
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(event: Omit<CollaborationEvent, 'pageId' | 'userId' | 'timestamp'>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: CollaborationEvent = {
        ...event,
        pageId: this.pageId,
        userId: this.userId,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
