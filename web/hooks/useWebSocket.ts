'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

type WebSocketCallback = (data: WebSocketMessage) => void;

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const callbackRef = useRef<WebSocketCallback | null>(null);

  const connect = useCallback((onMessage: WebSocketCallback) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket('ws://192.168.1.47:8742/ws');
    callbackRef.current = onMessage;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Reconnect after 3 seconds
      setTimeout(() => connect(onMessage), 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callbackRef.current?.(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current = ws;
  }, []);

  const send = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return { connect, send, isConnected };
}

