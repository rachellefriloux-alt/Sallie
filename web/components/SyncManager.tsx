'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface SyncEvent {
  event_type: string;
  platform: string;
  user_id: string;
  data: any;
  timestamp: string;
  event_id: string;
}

interface ConnectionState {
  connected: boolean;
  platform: string;
  last_sync: string;
  error?: string;
}

export class SyncManager {
  private static instance: SyncManager;
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, (event: SyncEvent) => void> = new Map();
  private userId: string = 'default_user';
  private platform: string = 'web';
  private connectionState: ConnectionState = {
    connected: false,
    platform: 'web',
    last_sync: new Date().toISOString()
  };

  private constructor() {}

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  connect(userId: string, platform: string = 'web') {
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
        this.connectionState.connected = true;
        this.connectionState.last_sync = new Date().toISOString();
        this.reconnectAttempts = 0;
        this.notifyConnectionChange();
        
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
        this.connectionState.connected = false;
        this.notifyConnectionChange();
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionState.error = 'Connection error';
        this.notifyConnectionChange();
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.connectionState.error = 'Failed to connect';
      this.notifyConnectionChange();
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
    
    this.connectionState.connected = false;
    this.notifyConnectionChange();
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
    // Call registered event handlers
    const handler = this.eventHandlers.get(event.event_type);
    if (handler) {
      handler(event);
    }
    
    // Update connection state
    this.connectionState.last_sync = event.timestamp;
    this.notifyConnectionChange();
  }

  private handleStateUpdate(data: any) {
    // Handle state update events
    const handler = this.eventHandlers.get('state_update');
    if (handler) {
      handler({
        event_type: 'state_update',
        platform: data.platform || 'server',
        user_id: data.user_id,
        data: data.data,
        timestamp: data.timestamp,
        event_id: data.event_id
      });
    }
    
    this.connectionState.last_sync = data.timestamp;
    this.notifyConnectionChange();
  }

  onEvent(eventType: string, handler: (event: SyncEvent) => void) {
    this.eventHandlers.set(eventType, handler);
  }

  offEvent(eventType: string) {
    this.eventHandlers.delete(eventType);
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  private notifyConnectionChange() {
    // Trigger connection state change notification
    const handler = this.eventHandlers.get('connection_change');
    if (handler) {
      handler({
        event_type: 'connection_change',
        platform: this.platform,
        user_id: this.userId,
        data: this.connectionState,
        timestamp: new Date().toISOString(),
        event_id: `connection_change_${Date.now()}`
      });
    }
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

// Hook for using SyncManager in React components
export function useSyncManager(userId: string, platform: string = 'web') {
  const syncManager = SyncManager.getInstance();
  const [connectionState, setConnectionState] = useState<ConnectionState>(syncManager.getConnectionState());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect when component mounts
    syncManager.connect(userId, platform);
    setIsConnected(true);

    // Set up event handlers
    const handleConnectionChange = (event: SyncEvent) => {
      setConnectionState(event.data);
      setIsConnected(event.data.connected);
      
      if (event.data.error) {
        toast.error(`Sync error: ${event.data.error}`);
      } else if (event.data.connected) {
        toast.success('Connected to sync server');
      } else {
        toast.warning('Disconnected from sync server');
      }
    };

    syncManager.onEvent('connection_change', handleConnectionChange);

    // Cleanup on unmount
    return () => {
      syncManager.offEvent('connection_change');
      syncManager.disconnect();
      setIsConnected(false);
    };
  }, [userId, platform]);

  return {
    syncManager,
    connectionState,
    isConnected,
    sendEvent: syncManager.sendEvent.bind(syncManager),
    updateLimbicState: syncManager.updateLimbicState.bind(syncManager),
    updateCognitiveState: syncManager.updateCognitiveState.bind(syncManager),
    changeAvatarForm: syncManager.changeAvatarForm.bind(syncManager),
    switchRole: syncManager.switchRole.bind(syncManager),
    changeRoom: syncManager.changeRoom.bind(syncManager),
    switchMode: syncManager.switchMode.bind(syncManager),
    sendMessage: syncManager.sendMessage.bind(syncManager)
  };
}

// Hook for real-time state synchronization
export function useRealtimeSync<T>(
  userId: string,
  eventType: string,
  initialState: T,
  platform: string = 'web'
) {
  const [state, setState] = useState<T>(initialState);
  const { syncManager } = useSyncManager(userId, platform);

  useEffect(() => {
    const handleEvent = (event: SyncEvent) => {
      setState(event.data);
    };

    syncManager.onEvent(eventType, handleEvent);

    return () => {
      syncManager.offEvent(eventType);
    };
  }, [userId, platform, eventType]);

  return state;
}

// Hook for sync status indicator
export function useSyncStatus(userId: string, platform: string = 'web') {
  const { connectionState, isConnected } = useSyncManager(userId, platform);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    const handleEvent = (event: SyncEvent) => {
      setLastSyncTime(event.timestamp);
      setSyncCount(prev => prev + 1);
    };

    syncManager.onEvent('state_update', handleEvent);

    return () => {
      syncManager.offEvent('state_update');
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
