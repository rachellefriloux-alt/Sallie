'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Enhanced WebSocket Message Types
interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
  roomId?: string;
  userId?: string;
  platform?: string;
  messageId?: string;
  [key: string]: any;
}

// Limbic State Update
interface LimbicUpdate {
  trust?: number;
  warmth?: number;
  arousal?: number;
  valence?: number;
  posture?: number;
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
}

// Convergence State Update
interface ConvergenceUpdate {
  current_question?: number;
  progress?: number;
  connection_strength?: number;
  imprinting_level?: number;
  synchronization?: number;
  heart_resonance?: number;
  answers?: Record<number, string>;
  completed?: boolean;
}

// Connection Status Types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Sync Event Types
export enum SyncEventType {
  LIMBIC_UPDATE = 'limbic_update',
  CONVERGENCE_UPDATE = 'convergence_update',
  POSTURE_CHANGE = 'posture_change',
  STATE_SYNC = 'state_sync',
  HEARTBEAT = 'heartbeat',
  DREAM_CYCLE = 'dream_cycle',
  ENCRYPTION_KEY = 'encryption_key'
}

// Platform Types
export enum PlatformType {
  WEB = 'web',
  DESKTOP = 'desktop',
  MOBILE = 'mobile'
}

export function usePremiumWebSocket(userId?: string, platform: PlatformType = PlatformType.WEB) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const messageQueue = useRef<WebSocketMessage[]>([]);
  const encryptionKey = useRef<string | null>(null);
  const lastPingTime = useRef<number>(0);
  const connectionStartTime = useRef<number>(0);

  // WebSocket URL with fallback
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://192.168.1.47:8749/ws';

  // Generate encryption key
  const generateEncryptionKey = useCallback(() => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }, []);

  // Encrypt message (simple XOR for demo - in production use proper encryption)
  const encryptMessage = useCallback((message: string, key: string) => {
    if (!encryptionEnabled || !key) return message;
    
    const encrypted = [];
    for (let i = 0; i < message.length; i++) {
      encrypted.push(message.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(String.fromCharCode(...encrypted));
  }, [encryptionEnabled]);

  // Decrypt message
  const decryptMessage = useCallback((encrypted: string, key: string) => {
    if (!encryptionEnabled || !key) return encrypted;
    
    try {
      const decoded = atob(encrypted);
      const decrypted = [];
      for (let i = 0; i < decoded.length; i++) {
        decrypted.push(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return String.fromCharCode(...decrypted);
    } catch (e) {
      console.error('Decryption failed:', e);
      return encrypted;
    }
  }, [encryptionEnabled]);

  // Calculate connection quality
  const calculateConnectionQuality = useCallback(() => {
    if (!isConnected) return 0;
    
    const baseQuality = 100;
    const latencyPenalty = Math.min(latency / 100, 50); // Penalty for high latency
    const reconnectPenalty = reconnectAttempts.current * 5; // Penalty for reconnections
    
    return Math.max(0, baseQuality - latencyPenalty - reconnectPenalty);
  }, [isConnected, latency]);

  // Heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const pingTime = Date.now();
        lastPingTime.current = pingTime;
        
        const heartbeat: WebSocketMessage = {
          type: SyncEventType.HEARTBEAT,
          timestamp: pingTime,
          userId,
          platform
        };
        
        wsRef.current.send(JSON.stringify(heartbeat));
      }
    }, 30000); // 30 seconds
  }, [userId, platform]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Enhanced connect function with encryption
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    setError(null);
    connectionStartTime.current = Date.now();

    try {
      const ws = new WebSocket(`${wsUrl}/${platform}/${userId || 'anonymous'}`);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        setConnectionQuality(100);
        
        // Generate and exchange encryption keys
        const key = generateEncryptionKey();
        encryptionKey.current = key;
        setEncryptionEnabled(true);
        
        // Send encryption key
        const keyMessage: WebSocketMessage = {
          type: SyncEventType.ENCRYPTION_KEY,
          data: { key },
          timestamp: Date.now(),
          userId,
          platform
        };
        
        ws.send(JSON.stringify(keyMessage));
        
        // Start heartbeat
        startHeartbeat();
        
        // Send queued messages
        while (messageQueue.current.length > 0) {
          const queuedMessage = messageQueue.current.shift();
          if (queuedMessage) {
            ws.send(JSON.stringify(queuedMessage));
          }
        }
        
        console.log('Premium WebSocket connected with encryption');
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        stopHeartbeat();
        
        if (event.wasClean) {
          console.log('WebSocket closed cleanly');
        } else {
          console.log('WebSocket closed unexpectedly');
          
          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            setConnectionStatus('reconnecting');
            
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            setError('Max reconnection attempts reached');
            setConnectionStatus('error');
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setConnectionStatus('error');
        setIsConnected(false);
        stopHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          
          // Handle heartbeat response
          if (messageData.type === SyncEventType.HEARTBEAT && messageData.timestamp) {
            const currentLatency = Date.now() - messageData.timestamp;
            setLatency(currentLatency);
            setConnectionQuality(calculateConnectionQuality());
            return;
          }
          
          // Decrypt message if encryption is enabled
          if (encryptionEnabled && encryptionKey.current && messageData.encrypted) {
            messageData.data = decryptMessage(messageData.data, encryptionKey.current);
          }
          
          setLastMessage(messageData);
        } catch (error) {
          console.error('Failed to handle WebSocket message:', error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError('Failed to create connection');
      setConnectionStatus('error');
      setIsConnected(false);
      stopHeartbeat();
    }
  }, [wsUrl, userId, platform, generateEncryptionKey, startHeartbeat, stopHeartbeat, calculateConnectionQuality]);

  // Enhanced disconnect function
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setConnectionQuality(0);
    setLatency(0);
  }, [stopHeartbeat]);

  // Enhanced send message with encryption and queuing
  const sendMessage = useCallback((message: string | WebSocketMessage, priority: boolean = false) => {
    const messageObj: WebSocketMessage = typeof message === 'string' 
      ? { type: 'message', data: message, timestamp: Date.now() }
      : { ...message, timestamp: message.timestamp || Date.now() };
    
    // Add user and platform info
    messageObj.userId = messageObj.userId || userId;
    messageObj.platform = messageObj.platform || platform;
    messageObj.messageId = messageObj.messageId || `msg_${Date.now()}_${Math.random()}`;

    // Encrypt sensitive data
    if (encryptionEnabled && encryptionKey.current && messageObj.data) {
      messageObj.data = encryptMessage(JSON.stringify(messageObj.data), encryptionKey.current);
      messageObj.encrypted = true;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(messageObj);
      wsRef.current.send(messageStr);
      return true;
    } else {
      // Queue message for later delivery
      if (priority) {
        messageQueue.current.unshift(messageObj);
      } else {
        messageQueue.current.push(messageObj);
      }
      console.warn('WebSocket not connected, message queued');
      return false;
    }
  }, [userId, platform, encryptMessage]);

  // Limbic state update
  const updateLimbicState = useCallback((limbicUpdate: LimbicUpdate) => {
    const message: WebSocketMessage = {
      type: SyncEventType.LIMBIC_UPDATE,
      data: limbicUpdate,
      timestamp: Date.now(),
      userId,
      platform
    };
    
    return sendMessage(message, true); // High priority
  }, [sendMessage, userId, platform]);

  // Convergence state update
  const updateConvergenceState = useCallback((convergenceUpdate: ConvergenceUpdate) => {
    const message: WebSocketMessage = {
      type: SyncEventType.CONVERGENCE_UPDATE,
      data: convergenceUpdate,
      timestamp: Date.now(),
      userId,
      platform
    };
    
    return sendMessage(message, true); // High priority
  }, [sendMessage, userId, platform]);

  // Posture change
  const changePosture = useCallback((posture: string) => {
    const message: WebSocketMessage = {
      type: SyncEventType.POSTURE_CHANGE,
      data: { posture },
      timestamp: Date.now(),
      userId,
      platform
    };
    
    return sendMessage(message);
  }, [sendMessage, userId, platform]);

  // Request state sync
  const requestStateSync = useCallback(() => {
    const message: WebSocketMessage = {
      type: SyncEventType.STATE_SYNC,
      data: { request: 'full_sync' },
      timestamp: Date.now(),
      userId,
      platform
    };
    
    return sendMessage(message, true);
  }, [sendMessage, userId, platform]);

  // Join room
  const joinRoom = useCallback((roomId: string) => {
    const message: WebSocketMessage = {
      type: 'join-room',
      roomId,
      timestamp: Date.now(),
      userId,
      platform
    };
    
    return sendMessage(message);
  }, [sendMessage, userId, platform]);

  // Leave room
  const leaveRoom = useCallback((roomId: string) => {
    const message: WebSocketMessage = {
      type: 'leave-room', 
      roomId,
      timestamp: Date.now(),
      userId,
      platform
    };
    
    return sendMessage(message);
  }, [sendMessage, userId, platform]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Update connection quality
  useEffect(() => {
    setConnectionQuality(calculateConnectionQuality());
  }, [calculateConnectionQuality]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    connectionQuality,
    latency,
    encryptionEnabled,
    
    // Connection methods
    connect,
    disconnect,
    sendMessage,
    
    // Sallie-specific methods
    updateLimbicState,
    updateConvergenceState,
    changePosture,
    requestStateSync,
    
    // Room methods
    joinRoom,
    leaveRoom,
    
    // Utilities
    reconnectAttempts: reconnectAttempts.current,
    queuedMessages: messageQueue.current.length
  };
}
