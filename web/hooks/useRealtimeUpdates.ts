import { useState, useEffect, useCallback, useRef } from 'react';

interface RealtimeMessage {
  id: string;
  type: 'message' | 'status' | 'presence' | 'typing' | 'system';
  data: any;
  timestamp: number;
  userId?: string;
  channelId?: string;
}

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastConnected: number | null;
  reconnectAttempts: number;
}

interface PresenceInfo {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
  typing?: boolean;
  channelId?: string;
}

interface RealtimeConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enablePresence: boolean;
  enableTyping: boolean;
}

export function useRealtimeUpdates(config: Partial<RealtimeConfig> = {}) {
  const defaultConfig: RealtimeConfig = {
    url: 'ws://192.168.1.47:8742/ws',
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    enablePresence: true,
    enableTyping: true,
  };

  const finalConfig = { ...defaultConfig, ...config };

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0,
  });

  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [presence, setPresence] = useState<Map<string, PresenceInfo>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<string, number>>(new Map());

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<RealtimeMessage[]>([]);

  // WebSocket connection
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus(prev => ({
      ...prev,
      connecting: true,
      error: null,
    }));

    try {
      const ws = new WebSocket(finalConfig.url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null,
          lastConnected: Date.now(),
          reconnectAttempts: 0,
        }));

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) {
            sendMessage(message);
          }
        }

        // Start heartbeat
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          connecting: false,
        }));

        stopHeartbeat();

        // Attempt reconnection if not explicitly closed
        if (event.code !== 1000 && connectionStatus.reconnectAttempts < finalConfig.maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          error: 'Connection error',
          connecting: false,
        }));
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: 'Failed to connect',
      }));
    }
  }, [finalConfig, connectionStatus.reconnectAttempts]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }

    setConnectionStatus(prev => ({
      ...prev,
      connected: false,
      connecting: false,
      reconnectAttempts: 0,
    }));
  }, []);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      return;
    }

    const delay = finalConfig.reconnectInterval * Math.pow(2, connectionStatus.reconnectAttempts);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionStatus(prev => ({
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));
      connect();
      reconnectTimeoutRef.current = null;
    }, delay);
  }, [connect, finalConfig.reconnectInterval, connectionStatus.reconnectAttempts]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, finalConfig.heartbeatInterval);
  }, [finalConfig.heartbeatInterval]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((message: RealtimeMessage) => {
    setMessages(prev => [...prev, message]);

    switch (message.type) {
      case 'presence':
        if (finalConfig.enablePresence && message.data.userId) {
          setPresence(prev => {
            const newPresence = new Map(prev);
            newPresence.set(message.data.userId, {
              userId: message.data.userId,
              status: message.data.status,
              lastSeen: message.timestamp,
              typing: message.data.typing || false,
              channelId: message.channelId,
            });
            return newPresence;
          });
        }
        break;

      case 'typing':
        if (finalConfig.enableTyping && message.data.userId) {
          setTypingUsers(prev => {
            const newTyping = new Map(prev);
            if (message.data.typing) {
              newTyping.set(message.data.userId, message.timestamp);
            } else {
              newTyping.delete(message.data.userId);
            }
            return newTyping;
          });
        }
        break;

      case 'system':
        // Handle system messages (e.g., user joined/left)
        console.log('System message:', message.data);
        break;
    }
  }, [finalConfig.enablePresence, finalConfig.enableTyping]);

  // Send message
  const sendMessage = useCallback((message: Partial<RealtimeMessage>) => {
    const fullMessage: RealtimeMessage = {
      id: Date.now().toString(),
      type: message.type || 'message',
      data: message.data,
      timestamp: Date.now(),
      userId: message.userId,
      channelId: message.channelId,
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(fullMessage));
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(fullMessage);
      
      // Try to connect if not connected
      if (!connectionStatus.connected && !connectionStatus.connecting) {
        connect();
      }
    }

    return fullMessage.id;
  }, [connectionStatus.connected, connectionStatus.connecting, connect]);

  // Send chat message
  const sendChatMessage = useCallback((content: string, channelId?: string) => {
    return sendMessage({
      type: 'message',
      data: { content },
      channelId,
    });
  }, [sendMessage]);

  // Send typing indicator
  const sendTyping = useCallback((typing: boolean, channelId?: string) => {
    return sendMessage({
      type: 'typing',
      data: { typing },
      channelId,
    });
  }, [sendMessage]);

  // Update presence
  const updatePresence = useCallback((status: PresenceInfo['status']) => {
    return sendMessage({
      type: 'presence',
      data: { status },
    });
  }, [sendMessage]);

  // Get online users
  const getOnlineUsers = useCallback(() => {
    return Array.from(presence.values()).filter(p => p.status === 'online');
  }, [presence]);

  // Get typing users in channel
  const getTypingUsers = useCallback((channelId?: string) => {
    const now = Date.now();
    const typingTimeout = 5000; // 5 seconds

    return Array.from(typingUsers.entries())
      .filter(([userId, timestamp]) => {
        const isRecent = now - timestamp < typingTimeout;
        const isInChannel = !channelId || presence.get(userId)?.channelId === channelId;
        return isRecent && isInChannel;
      })
      .map(([userId]) => userId);
  }, [typingUsers, presence]);

  // Clean up old typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const typingTimeout = 5000;

      setTypingUsers(prev => {
        const newTyping = new Map();
        prev.forEach((timestamp, userId) => {
          if (now - timestamp < typingTimeout) {
            newTyping.set(userId, timestamp);
          }
        });
        return newTyping;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    // Connection
    connectionStatus,
    connect,
    disconnect,
    
    // Messages
    messages,
    sendMessage,
    sendChatMessage,
    
    // Presence
    presence,
    updatePresence,
    getOnlineUsers,
    
    // Typing
    typingUsers,
    sendTyping,
    getTypingUsers,
    
    // Utilities
    isConnected: connectionStatus.connected,
    isConnecting: connectionStatus.connecting,
    error: connectionStatus.error,
  };
}

// Realtime context for global access
import { createContext, useContext } from 'react';

const RealtimeContext = createContext<ReturnType<typeof useRealtimeUpdates> | null>(null);

export const RealtimeProvider = ({ children, config }: { 
  children: React.ReactNode;
  config?: Partial<RealtimeConfig>;
}) => {
  const realtime = useRealtimeUpdates(config);
  
  return (
    <RealtimeContext.Provider value={realtime}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
