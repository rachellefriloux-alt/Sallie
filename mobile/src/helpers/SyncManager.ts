import { EventEmitter } from 'events';
import { useState, useEffect } from 'react';

const API_BASE = 'http://192.168.1.47:8742';

export interface SyncEvent {
  event_type: string;
  platform: string;
  user_id: string;
  data: any;
  timestamp: string;
  event_id: string;
}

export interface ConnectionState {
  connected: boolean;
  platform: string;
  last_sync: string;
  error?: string;
}

export class SyncManager extends EventEmitter {
  private static instance: SyncManager;
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private userId: string = 'default_user';
  private platform: string = 'mobile';
  private connectionState: ConnectionState = {
    connected: false,
    platform: 'mobile',
    last_sync: new Date().toISOString()
  };

  private constructor() {
    super();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  connect(userId: string, platform: string = 'mobile') {
    this.userId = userId;
    this.platform = platform;
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${API_BASE.replace('http', 'ws')}/sync/ws/${platform}/${userId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.updateConnectionState(true, 'Connected');
        this.reconnectAttempts = 0;
        this.emit('connection_change', this.connectionState);
        
        // Request initial state
        this.sendEvent('sync_request', {});
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            return;
          }
          
          if (data.type === 'state_update') {
            this.handleStateUpdate(data);
            return;
          }
          
          this.handleSyncEvent(data as SyncEvent);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.updateConnectionState(false, 'Disconnected');
        this.emit('connection_change', this.connectionState);
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionState(false, 'Connection error');
        this.emit('connection_change', this.connectionState);
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.updateConnectionState(false, 'Failed to connect');
      this.emit('connection_change', this.connectionState);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.updateConnectionState(false, 'Disconnected');
    this.emit('connection_change', this.connectionState);
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      this.connect(this.userId, this.platform);
    }, this.reconnectDelay);
  }

  sendEvent(eventType: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        event_type: eventType,
        data: data
      };
      
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send event');
    }
  }

  private handleSyncEvent(event: SyncEvent) {
    // Emit event for listeners
    this.emit(event.event_type, event);
    
    // Update connection state
    this.connectionState.last_sync = event.timestamp;
    this.emit('connection_change', this.connectionState);
  }

  private handleStateUpdate(data: any) {
    // Handle state update events
    this.emit('state_update', {
      event_type: 'state_update',
      platform: data.platform || 'server',
      user_id: data.user_id,
      data: data.data,
      timestamp: data.timestamp,
      event_id: data.event_id
    });
    
    this.connectionState.last_sync = data.timestamp;
    this.emit('connection_change', this.connectionState);
  }

  private updateConnectionState(connected: boolean, message: string = '') {
    this.connectionState.connected = connected;
    this.connectionState.error = connected ? null : message;
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  // Convenience methods for common events
  updateLimbicState(variables: Record<string, number>) {
    this.sendEvent('limbic_update', { variables });
  }

  updateCognitiveState(state: Record<string, any>) {
    this.sendEvent('cognitive_update', { state });
  }

  changeAvatarForm(form: string) {
    this.sendEvent('avatar_change', { form });
  }

  switchRole(role: string) {
    this.sendEvent('role_switch', { role });
  }

  changeRoom(room: string) {
    this.sendEvent('room_change', { room });
  }

  switchMode(mode: string) {
    this.sendEvent('mode_switch', { mode });
  }

  sendMessage(content: string, sender: string = 'user') {
    this.sendEvent('message_sent', {
      content,
      sender,
      message_id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }
}

// Hook for using SyncManager in React Native components
export function useSyncManager(userId: string, platform: string = 'mobile') {
  const [connectionState, setConnectionState] = useState<ConnectionState>(() => 
    SyncManager.getInstance().getConnectionState()
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const syncManager = SyncManager.getInstance();
    
    // Connect when component mounts
    syncManager.connect(userId, platform);
    setIsConnected(true);

    // Set up event listeners
    const handleConnectionChange = (state: ConnectionState) => {
      setConnectionState(state);
      setIsConnected(state.connected);
    };

    syncManager.on('connection_change', handleConnectionChange);

    // Cleanup on unmount
    return () => {
      syncManager.off('connection_change', handleConnectionChange);
      syncManager.disconnect();
      setIsConnected(false);
    };
  }, [userId, platform]);

  return {
    syncManager: SyncManager.getInstance(),
    connectionState,
    isConnected,
    sendEvent: (eventType: string, data: any) => 
      SyncManager.getInstance().sendEvent(eventType, data),
    updateLimbicState: (variables: Record<string, number>) => 
      SyncManager.getInstance().updateLimbicState(variables),
    updateCognitiveState: (state: Record<string, any>) => 
      SyncManager.getInstance().updateCognitiveState(state),
    changeAvatarForm: (form: string) => 
      SyncManager.getInstance().changeAvatarForm(form),
    switchRole: (role: string) => 
      SyncManager.getInstance().switchRole(role),
    changeRoom: (room: string) => 
      SyncManager.getInstance().changeRoom(room),
    switchMode: (mode: string) => 
      SyncManager.getInstance().switchMode(mode),
    sendMessage: (content: string, sender?: string) => 
      SyncManager.getInstance().sendMessage(content, sender)
  };
}

// Hook for real-time state synchronization
export function useRealtimeSync<T>(
  userId: string,
  eventType: string,
  initialState: T,
  platform: string = 'mobile'
) {
  const [state, setState] = useState<T>(initialState);
  const syncManager = SyncManager.getInstance();

  useEffect(() => {
    const handleEvent = (event: SyncEvent) => {
      setState(event.data);
    };

    syncManager.on(eventType, handleEvent);

    return () => {
      syncManager.off(eventType, handleEvent);
    };
  }, [userId, platform, eventType]);

  return state;
}

// Hook for sync status indicator
export function useSyncStatus(userId: string, platform: string = 'mobile') {
  const { connectionState, isConnected } = useSyncManager(userId, platform);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    const syncManager = SyncManager.getInstance();
    
    const handleEvent = (event: SyncEvent) => {
      setLastSyncTime(event.timestamp);
      setSyncCount(prev => prev + 1);
    };

    syncManager.on('state_update', handleEvent);

    return () => {
      syncManager.off('state_update', handleEvent);
    };
  }, [userId, platform]);

  return {
    isConnected,
    lastSyncTime,
    syncCount,
    platform: connectionState.platform,
    error: connectionState.error
  };
}

export default SyncManager;
