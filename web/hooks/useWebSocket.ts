'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type WebSocketMessage = {
  type: string;
  data?: any;
  timestamp?: number;
  roomId?: string;
  [key: string]: any;
};

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export function useWebSocket(url?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://192.168.1.47:8749/ws';

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        if (event.wasClean) {
          console.log('WebSocket closed cleanly');
        } else {
          console.log('WebSocket closed unexpectedly');
          // Attempt to reconnect
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            setConnectionStatus('reconnecting');
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            setError('Max reconnection attempts reached');
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setConnectionStatus('disconnected');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          setLastMessage(event.data);
        } catch (error) {
          console.error('Failed to handle WebSocket message:', error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError('Failed to create connection');
      setConnectionStatus('disconnected');
    }
  }, [wsUrl]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(messageStr);
      return true;
    } else {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    sendMessage({
      type: 'join-room',
      roomId,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  const leaveRoom = useCallback((roomId: string) => {
    sendMessage({
      type: 'leave-room', 
      roomId,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    sendMessage,
    joinRoom,
    leaveRoom,
    connect,
    disconnect
  };
}

