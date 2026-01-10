'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
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
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Zap, 
  Shield, 
  Activity,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Cpu,
  MemoryStick,
  Globe,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  Command,
  Moon,
  Sun,
  Bell,
  BellOff,
  Volume2,
  VolumeX
} from 'lucide-react';

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
    limbicState?: {
      trust: number;
      warmth: number;
      arousal: number;
      valence: number;
      posture: string;
    };
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
    cpuUsage: number;
  };
  systemStatus: {
    ghostInterface: boolean;
    cliInterface: boolean;
    activeVeto: boolean;
    foundryEval: boolean;
    memoryHygiene: boolean;
    voiceCommands: boolean;
    undoWindow: boolean;
    brainForge: boolean;
  };
  uiState: {
    sidebarCollapsed: boolean;
    showSystemPanel: boolean;
    showPerformancePanel: boolean;
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    soundEnabled: boolean;
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
      cpuUsage: 0,
    },
    systemStatus: {
      ghostInterface: true,
      cliInterface: true,
      activeVeto: true,
      foundryEval: true,
      memoryHygiene: true,
      voiceCommands: true,
      undoWindow: true,
      brainForge: true,
    },
    uiState: {
      sidebarCollapsed: false,
      showSystemPanel: false,
      showPerformancePanel: false,
      theme: 'dark',
      notifications: true,
      soundEnabled: true,
    },
  });

  // Enhanced hooks with better performance
  const { connect, disconnect, isConnected, connectionMetrics } = useWebSocket();
  const { limbicState, updateLimbicState } = useLimbicStore();
  const { settings, updateSettings } = useSettingsStore();
  const { showNotification } = useNotificationSystem();
  const { performanceData } = usePerformanceMonitor();
  
  // Refs for better performance
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Enhanced animation values
  const sidebarWidth = useMotionValue(280);
  const sidebarSpring = useSpring(sidebarWidth);
  const headerOpacity = useMotionValue(1);
  const headerSpring = useSpring(headerOpacity);

  // Enhanced performance monitoring
  useEffect(() => {
    const measurePerformance = () => {
      const startTime = performance.now();
      
      // Measure render performance
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        setState(prev => ({
          ...prev,
          performanceMetrics: {
            ...prev.performanceMetrics,
            renderTime,
            memoryUsage: performance.memory?.usedJSHeapSize || 0,
            cpuUsage: performanceData?.cpuUsage || 0,
            messageLatency: connectionMetrics.latency,
          },
        }));
      });
    };

    const rafId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(rafId);
  }, [connectionMetrics.latency, performanceData]);

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
          case 'system_status':
            handleSystemStatus(data);
            break;
          case 'performance_update':
            handlePerformanceUpdate(data);
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
      disconnect();
    };
  }, [connect, disconnect, showNotification]);

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
              limbicState: data.limbicState,
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
      messages: [...prev.messages, {
        id: Date.now().toString(),
        text: data.content,
        sender: 'ai',
        timestamp: Date.now(),
        status: 'delivered',
        metadata: {
          processingTime: latency,
          confidence: data.confidence,
          emotionalTone: data.emotionalTone,
          limbicState: data.limbicState,
        },
      }],
      currentResponseId: null,
      isTyping: false,
    }));
  }, []);

  const handleLimbicUpdate = useCallback((data: any) => {
    updateLimbicState(data);
  }, [updateLimbicState]);

  const handleGhostTap = useCallback((data: any) => {
    showNotification(data.message, 'info');
  }, [showNotification]);

  const handleSystemStatus = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      systemStatus: {
        ...prev.systemStatus,
        ...data.systems,
      },
    }));
  }, []);

  const handlePerformanceUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        ...data.metrics,
      },
    }));
  }, []);

  const handleError = useCallback((data: any) => {
    showNotification(data.message || 'An error occurred', 'error');
    setState(prev => ({
      ...prev,
      isTyping: false,
      currentResponseId: null,
    }));
  }, [showNotification]);

  // Enhanced message sending with better error handling
  const handleSend = useCallback(async (message: string, metadata?: any) => {
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: Date.now(),
        status: 'sending',
        metadata,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      // Send message to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          metadata,
          limbicState,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === userMessage.id
            ? { ...msg, status: 'delivered' }
            : msg
        ),
      }));

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Failed to send message', 'error');
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === userMessage.id
            ? { ...msg, status: 'error' }
            : msg
        ),
      }));
      
      throw error;
    }
  }, [limbicState, settings, showNotification]);

  // Enhanced keyboard shortcuts
  const { shortcuts, addShortcut, removeShortcut } = useKeyboardShortcuts({
    'toggle-sidebar': () => {
      setState(prev => ({
        ...prev,
        uiState: {
          ...prev.uiState,
          sidebarCollapsed: !prev.uiState.sidebarCollapsed,
        },
      }));
    },
    'toggle-system-panel': () => {
      setState(prev => ({
        ...prev,
        uiState: {
          ...prev.uiState,
          showSystemPanel: !prev.uiState.showSystemPanel,
        },
      }));
    },
    'toggle-performance-panel': () => {
      setState(prev => ({
        ...prev,
        uiState: {
          ...prev.uiState,
          showPerformancePanel: !prev.uiState.showPerformancePanel,
        },
      }));
    },
    'toggle-theme': () => {
      setState(prev => ({
        ...prev,
        uiState: {
          ...prev.uiState,
          theme: prev.uiState.theme === 'dark' ? 'light' : 'dark',
        },
      }));
    },
    'toggle-notifications': () => {
      setState(prev => ({
        ...prev,
        uiState: {
          ...prev.uiState,
          notifications: !prev.uiState.notifications,
        },
      }));
    },
    'toggle-sound': () => {
      setState(prev => ({
        ...prev,
        uiState: {
          ...prev.uiState,
          soundEnabled: !prev.uiState.soundEnabled,
        },
      }));
    },
  });

  // Enhanced connection quality calculation
  const connectionQuality = useMemo(() => {
    const { latency, packetLoss } = connectionMetrics;
    
    if (latency < 50 && packetLoss < 0.01) return 'excellent';
    if (latency < 100 && packetLoss < 0.05) return 'good';
    if (latency < 200 && packetLoss < 0.1) return 'poor';
    return 'disconnected';
  }, [connectionMetrics]);

  // Enhanced system status calculation
  const systemHealth = useMemo(() => {
    const systems = Object.values(state.systemStatus);
    const activeSystems = systems.filter(Boolean).length;
    const totalSystems = systems.length;
    return (activeSystems / totalSystems) * 100;
  }, [state.systemStatus]);

  // Enhanced performance score calculation
  const performanceScore = useMemo(() => {
    const { renderTime, messageLatency, memoryUsage, cpuUsage } = state.performanceMetrics;
    
    const renderScore = Math.max(0, 100 - renderTime);
    const latencyScore = Math.max(0, 100 - messageLatency / 10);
    const memoryScore = Math.max(0, 100 - (memoryUsage / 1024 / 1024 / 100));
    const cpuScore = Math.max(0, 100 - cpuUsage);
    
    return (renderScore + latencyScore + memoryScore + cpuScore) / 4;
  }, [state.performanceMetrics]);

  return (
    <motion.div 
      className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Enhanced Sidebar */}
      <motion.aside
        className="relative z-20 h-full bg-slate-800/50 backdrop-blur-xl border-r border-purple-500/20"
        style={{ width: sidebarSpring }}
        animate={{
          width: state.uiState.sidebarCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Sidebar
          collapsed={state.uiState.sidebarCollapsed}
          systemStatus={state.systemStatus}
          performanceScore={performanceScore}
        />
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className="flex-1 flex flex-col relative z-10"
        style={{ marginLeft: state.uiState.sidebarCollapsed ? 80 : 280 }}
      >
        {/* Enhanced Header with Premium Design */}
        <motion.header 
          className="relative bg-slate-800/30 backdrop-blur-xl border-b border-purple-500/20"
          style={{ opacity: headerSpring }}
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20" />
          
          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section - Title and Status */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Sallie Studio
                    </h1>
                    <p className="text-sm text-purple-300/70">
                      Your AI companion's control center
                    </p>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-slate-700/50 rounded-xl border border-purple-500/20">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionQuality === 'excellent' ? 'bg-green-400' :
                    connectionQuality === 'good' ? 'bg-yellow-400' :
                    connectionQuality === 'poor' ? 'bg-orange-400' :
                    'bg-red-400'
                  } animate-pulse`} />
                  <div className="flex items-center space-x-2">
                    {connectionQuality === 'disconnected' ? (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    ) : (
                      <Wifi className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {connectionQuality}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Controls and Status */}
              <div className="flex items-center space-x-4">
                {/* System Health */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">
                    {systemHealth.toFixed(0)}%
                  </span>
                </div>

                {/* Performance Score */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">
                    {performanceScore.toFixed(0)}%
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    className="p-2 rounded-lg bg-slate-700/50 border border-purple-500/20 hover:bg-slate-700/70 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setState(prev => ({
                      ...prev,
                      uiState: { ...prev.uiState, showSystemPanel: !prev.uiState.showSystemPanel }
                    }))}
                  >
                    <Settings className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    className="p-2 rounded-lg bg-slate-700/50 border border-purple-500/20 hover:bg-slate-700/70 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setState(prev => ({
                      ...prev,
                      uiState: { ...prev.uiState, notifications: !prev.uiState.notifications }
                    }))}
                  >
                    {state.uiState.notifications ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    className="p-2 rounded-lg bg-slate-700/50 border border-purple-500/20 hover:bg-slate-700/70 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setState(prev => ({
                      ...prev,
                      uiState: { ...prev.uiState, theme: prev.uiState.theme === 'dark' ? 'light' : 'dark' }
                    }))}
                  >
                    {state.uiState.theme === 'dark' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* System Status Bar */}
            <AnimatePresence>
              {state.uiState.showSystemPanel && (
                <motion.div
                  className="mt-4 grid grid-cols-8 gap-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {Object.entries(state.systemStatus).map(([system, active]) => (
                    <div
                      key={system}
                      className="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 rounded-lg border border-purple-500/20"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        active ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <span className="text-xs font-medium capitalize">
                        {system.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>
        
        {/* Enhanced Chat Area */}
        <motion.div 
          ref={messageContainerRef}
          className="flex-1 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChatArea
            messages={state.messages}
            onSend={handleSend}
            isConnected={isConnected}
            isTyping={state.isTyping}
            voiceLanguage={settings.voiceLanguage}
            performanceMetrics={state.performanceMetrics}
            systemStatus={state.systemStatus}
            theme={state.uiState.theme}
          />
        </motion.div>

        {/* Enhanced Performance Panel */}
        <AnimatePresence>
          {state.uiState.showPerformancePanel && (
            <motion.div
              className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300">Render: {state.performanceMetrics.renderTime.toFixed(2)}ms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MemoryStick className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300">Memory: {(state.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300">CPU: {state.performanceMetrics.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-green-400" />
                  <span className="text-green-300">Latency: {state.performanceMetrics.messageLatency}ms</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Enhanced Keyboard Shortcuts Panel */}
      <AnimatePresence>
        {settings.showKeyboardShortcuts && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-slate-800 rounded-2xl border border-purple-500/20 p-6 max-w-2xl w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <KeyboardShortcutsPanel />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
