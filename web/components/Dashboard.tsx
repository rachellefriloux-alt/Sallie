'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { ConnectionStatus } from './ConnectionStatus';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLimbicStore } from '@/store/useLimbicStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useKeyboardShortcuts, defaultShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Enhanced types for better type safety
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  metadata?: {
    processingTime?: number;
    confidence?: number;
    emotionalTone?: string;
    relatedDimension?: string;
  };
}

interface DashboardState {
  messages: Message[];
  isTyping: boolean;
  currentResponseId: string | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  performanceMetrics: {
    renderTime: number;
    messageLatency: number;
    memoryUsage: number;
  };
}

export function Dashboard() {
  // Enhanced state management with better structure
  const [state, setState] = useState<DashboardState>({
    messages: [],
    isTyping: false,
    currentResponseId: null,
    connectionQuality: 'good',
    performanceMetrics: {
      renderTime: 0,
      messageLatency: 0,
      memoryUsage: 0,
    },
  });

  // Refs for performance optimization
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<number>(0);
  const connectionRetryRef = useRef<number>(0);

  // Enhanced hooks with better error handling
  const { connect, send, isConnected, connectionMetrics } = useWebSocket({
    autoReconnect: true,
    maxRetries: 5,
    retryDelay: 1000,
  });
  
  const { state: limbicState, updateState } = useLimbicStore();
  const { settings, updateSettings } = useSettingsStore();
  const { showNotification } = useNotificationSystem();
  const { startMeasure, endMeasure } = usePerformanceMonitor();

  // Enhanced keyboard shortcuts with context awareness
  useKeyboardShortcuts({
    ...defaultShortcuts,
    'Ctrl+Shift+C': () => clearChat(),
    'Ctrl+Shift+S': () => toggleSettings(),
    'Ctrl+Shift+H': () => toggleHelp(),
    'Escape': () => handleEscape(),
  });

  // Performance monitoring
  useEffect(() => {
    const measurePerformance = () => {
      const start = performance.now();
      
      // Measure render performance
      const renderTime = performance.now() - start;
      
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          renderTime,
          memoryUsage: performance.memory?.usedJSHeapSize || 0,
        },
      }));
    };

    const rafId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Enhanced WebSocket connection with better error handling
  useEffect(() => {
    const startTime = Date.now();
    
    connect((data) => {
      const latency = Date.now() - startTime;
      
      try {
        switch (data.type) {
          case 'typing':
            handleTypingIndicator(data);
            break;
          case 'response_chunk':
            handleStreamingResponse(data, latency);
            break;
          case 'response':
            handleCompleteResponse(data, latency);
            break;
          case 'limbic_update':
            handleLimbicUpdate(data);
            break;
          case 'ghost_tap':
            handleGhostTap(data);
            break;
          case 'error':
            handleError(data);
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        showNotification('Error processing message', 'error');
      }
    });

    return () => {
      // Cleanup WebSocket connection
    };
  }, [connect, showNotification]);

  // Enhanced message handlers with better error handling
  const handleTypingIndicator = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      isTyping: data.status === 'thinking',
    }));
  }, []);

  const handleStreamingResponse = useCallback((data: any, latency: number) => {
    setState(prev => {
      const { currentResponseId } = prev;
      
      if (currentResponseId) {
        // Update existing message
        return {
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === currentResponseId
              ? {
                  ...msg,
                  text: msg.text + data.content,
                  metadata: {
                    ...msg.metadata,
                    processingTime: latency,
                  },
                }
              : msg
          ),
        };
      } else {
        // Start new message
        const newId = Date.now().toString();
        return {
          ...prev,
          currentResponseId: newId,
          messages: [...prev.messages, {
            id: newId,
            text: data.content,
            sender: 'ai',
            timestamp: Date.now(),
            status: 'sent',
            metadata: {
              processingTime: latency,
              confidence: data.confidence,
              emotionalTone: data.emotionalTone,
            },
          }],
        };
      }
    });

    if (data.is_complete) {
      setState(prev => ({
        ...prev,
        currentResponseId: null,
        isTyping: false,
      }));
    }
  }, []);

  const handleCompleteResponse = useCallback((data: any, latency: number) => {
    setState(prev => ({
      ...prev,
      isTyping: false,
      currentResponseId: null,
      messages: [...prev.messages, {
        id: Date.now().toString(),
        text: data.content,
        sender: 'ai',
        timestamp: Date.now(),
        status: 'sent',
        metadata: {
          processingTime: latency,
          confidence: data.confidence,
          emotionalTone: data.emotionalTone,
          relatedDimension: data.relatedDimension,
        },
      }],
    }));
  }, []);

  const handleLimbicUpdate = useCallback((data: any) => {
    updateState(data.state);
    
    // Show notification for significant limbic changes
    if (data.state.significance > 0.7) {
      showNotification('Sallie\'s emotional state has changed significantly', 'info');
    }
  }, [updateState, showNotification]);

  const handleGhostTap = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: Date.now().toString(),
        text: data.content,
        sender: 'system',
        timestamp: Date.now(),
        status: 'delivered',
      }],
    }));
  }, []);

  const handleError = useCallback((data: any) => {
    showNotification(data.message || 'An error occurred', 'error');
    setState(prev => ({
      ...prev,
      connectionQuality: 'poor',
    }));
  }, [showNotification]);

  // Enhanced message sending with better error handling
  const addMessage = useCallback((
    text: string,
    sender: 'user' | 'ai' | 'system',
    id?: string,
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error',
    metadata?: Message['metadata']
  ) => {
    const messageId = id || Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      text,
      sender,
      timestamp: Date.now(),
      status: status || (sender === 'user' ? 'sending' : 'delivered'),
      metadata,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return messageId;
  }, []);

  const handleSend = useCallback((text: string) => {
    if (!text.trim() || !isConnected) {
      if (!isConnected) {
        showNotification('Not connected to server', 'error');
      }
      return;
    }

    const messageId = addMessage(text, 'user', undefined, 'sending');
    
    try {
      // Send via WebSocket with enhanced metadata
      send(JSON.stringify({
        type: 'chat',
        content: text,
        timestamp: Date.now(),
        messageId,
        metadata: {
          limbicState,
          settings,
        },
      }));

      // Update status to sent after successful send
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? { ...msg, status: 'sent' } : msg
          ),
        }));
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, status: 'error' } : msg
        ),
      }));
      showNotification('Failed to send message', 'error');
    }
  }, [addMessage, isConnected, send, limbicState, settings, showNotification]);

  // Enhanced utility functions
  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      currentResponseId: null,
    }));
    showNotification('Chat cleared', 'info');
  }, [showNotification]);

  const toggleSettings = useCallback(() => {
    updateSettings({ showSettings: !settings.showSettings });
  }, [updateSettings, settings.showSettings]);

  const toggleHelp = useCallback(() => {
    showNotification('Help panel coming soon', 'info');
  }, [showNotification]);

  const handleEscape = useCallback(() => {
    // Handle escape key based on current context
    if (state.currentResponseId) {
      // Cancel current response
      setState(prev => ({
        ...prev,
        currentResponseId: null,
        isTyping: false,
      }));
    }
  }, [state.currentResponseId]);

  // Enhanced connection quality assessment
  const connectionQuality = useMemo(() => {
    if (!isConnected) return 'disconnected';
    if (connectionMetrics.latency < 50) return 'excellent';
    if (connectionMetrics.latency < 200) return 'good';
    return 'poor';
  }, [isConnected, connectionMetrics.latency]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [state.messages]);

  return (
    <motion.div 
      className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Accessibility skip link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>
      
      {/* Enhanced Sidebar with animations */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Sidebar 
          limbicState={limbicState} 
          isConnected={isConnected}
        />
      </motion.div>
      
      {/* Main Content Area */}
      <main 
        id="main-content" 
        className="flex-1 flex flex-col relative"
        role="main"
      >
        {/* Enhanced Header with Connection Status */}
        <motion.header 
          className="flex items-center justify-between p-4 border-b border-purple-800/30 backdrop-blur-sm bg-purple-900/10"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sallie Studio
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionQuality === 'excellent' ? 'bg-green-400' :
                connectionQuality === 'good' ? 'bg-yellow-400' :
                connectionQuality === 'poor' ? 'bg-orange-400' :
                'bg-red-400'
              }`} />
              <span className="text-sm text-gray-400 capitalize">
                {connectionQuality}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            <div className="text-xs text-gray-500">
              Latency: {connectionMetrics.latency}ms
            </div>
          </div>
        </motion.header>
        
        {/* Enhanced Chat Area */}
        <motion.div 
          ref={messageContainerRef}
          className="flex-1 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ChatArea
            messages={state.messages}
            onSend={handleSend}
            isConnected={isConnected}
            isTyping={state.isTyping}
            voiceLanguage={settings.voiceLanguage}
            performanceMetrics={state.performanceMetrics}
          />
        </motion.div>
      </main>
      
      {/* Enhanced Keyboard Shortcuts Panel */}
      <AnimatePresence>
        {settings.showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <KeyboardShortcutsPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Monitor (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/50 text-white p-2 rounded text-xs">
          <div>Render: {state.performanceMetrics.renderTime.toFixed(2)}ms</div>
          <div>Memory: {(state.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
          <div>Messages: {state.messages.length}</div>
        </div>
      )}
    </motion.div>
  );
}
