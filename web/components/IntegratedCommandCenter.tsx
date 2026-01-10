'use client';

// React & Next.js Core
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// External Libraries
import { motion, AnimatePresence } from 'framer-motion';

// Internal Components
import { ErrorBoundary } from './ErrorBoundary';

// Icons
import {
  Zap,
  Activity,
  BrainCircuit,
  TrendingUp,
  Shield,
  Smartphone,
  BarChart3,
  Radio,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Database,
  Cpu,
  HardDrive,
} from 'lucide-react';

// Types
import {
  ApiResponse,
  ConnectionState,
  LearningMetrics,
  NeuralAnalytics,
  SystemFeed,
} from '@/types';

// Component Props
interface IntegratedCommandCenterProps {
  className?: string;
  wsUrl?: string;
  pollingInterval?: number;
  enableMobileOptimizations?: boolean;
}

// Constants
const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.internalpurity.life/v1/ws';
const RECONNECT_DELAY = 5000;
const MAX_LOG_ENTRIES = 50;
const API_TIMEOUT = 10000;

// Mock Neural Analytics Data
const MOCK_ANALYTICS: NeuralAnalytics = {
  cognitive_retention: 88,
  decision_latency: 1.2,
  focus_endurance: 4.5,
  error_rate: 0.02,
  neural_efficiency: 92,
  learning_velocity: 0.87,
  cognitive_load: 0.74,
  memory_utilization: 0.65,
  processing_speed: 0.95,
};

// Main Component
export const IntegratedCommandCenter: React.FC<IntegratedCommandCenterProps> = ({
  className = '',
  wsUrl = DEFAULT_WS_URL,
  pollingInterval = 10000,
  enableMobileOptimizations = true,
}) => {
  // --- WebSocket & Connectivity ---
  const [socketStatus, setSocketStatus] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    lastConnected: undefined,
  });
  const [liveLog, setLiveLog] = useState<SystemFeed[]>([]);
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Real-Time Data State ---
  const [metrics, setMetrics] = useState<NeuralAnalytics | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [systemHealth, setSystemHealth] = useState<{
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  } | null>(null);

  // --- Mobile Detection ---
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Memoized calculations
  const connectionStatusText = useMemo((): string => {
    if (socketStatus.isConnecting) return 'Connecting...';
    if (socketStatus.isConnected) return 'Live Link Active';
    return 'Offline - Reconnecting';
  }, [socketStatus]);

  const connectionStatusColor = useMemo((): string => {
    if (socketStatus.isConnecting) return 'text-yellow-500';
    if (socketStatus.isConnected) return 'text-green-500';
    return 'text-red-500';
  }, [socketStatus]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // WebSocket connection with enhanced error handling
  const connectWebSocket = useCallback(() => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setSocketStatus(prev => ({ ...prev, isConnecting: true }));

    try {
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        setSocketStatus({
          isConnected: true,
          isConnecting: false,
          lastConnected: new Date(),
        });
        addLog('Neural link established.', 'info');
        
        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      socket.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'METRIC_UPDATE':
              setMetrics(data.payload);
              addLog('Metrics updated', 'info');
              break;
            case 'AGENCY_ALERT':
              addLog(data.message, 'warn');
              break;
            case 'SYSTEM_HEALTH':
              setSystemHealth(data.payload);
              break;
            case 'SYNC_COMPLETE':
              setIsSyncing(false);
              addLog('Sync completed successfully', 'info');
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
          addLog('Message parsing error', 'warn');
        }
      };

      socket.current.onclose = (event) => {
        setSocketStatus({
          isConnected: false,
          isConnecting: false,
          lastConnected: undefined,
        });
        
        addLog(`Connection lost: ${event.reason || 'Unknown reason'}`, 'warn');
        
        // Auto-reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, liveLog.length), 30000);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      };

      socket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        addLog('WebSocket connection error', 'warn');
        setSocketStatus({
          isConnected: false,
          isConnecting: false,
          lastConnected: undefined,
        });
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setSocketStatus({
        isConnected: false,
        isConnecting: false,
        lastConnected: undefined,
      });
      addLog('Failed to establish neural link', 'warn');
    }
  }, [wsUrl, liveLog.length]);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [connectWebSocket]);

  // Add log entry with automatic cleanup
  const addLog = useCallback((msg: string, type: 'info' | 'warn' | 'error') => {
    setLiveLog(prev => {
      const newEntry: SystemFeed = {
        id: Date.now().toString(),
        timestamp: new Date(),
        message: msg,
        type,
      };
      
      const updated = [newEntry, ...prev];
      return updated.slice(0, MAX_LOG_ENTRIES);
    });
  }, []);

  // API call with timeout and retry logic
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, []);

  // Sync data with enhanced error handling
  const syncData = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    addLog('Initiating manual sync...', 'info');
    
    try {
      const response = await apiCall('/api/v1/agency/sync', { method: 'POST' });
      
      if (response.success) {
        addLog('Manual sync successful.', 'info');
        
        // Send sync command via WebSocket if available
        if (socket.current?.readyState === WebSocket.OPEN) {
          socket.current.send(JSON.stringify({
            type: 'SYNC_REQUEST',
            timestamp: new Date().toISOString(),
          }));
        }
      } else {
        throw new Error(response.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      addLog('Sync hiccup. Check your connection, love.', 'warn');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, apiCall]);

  // Load initial metrics
  const loadMetrics = useCallback(async () => {
    try {
      // In production, this would fetch from your analytics API
      setMetrics(MOCK_ANALYTICS);
      
      // Mock system health data
      setSystemHealth({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        storage: Math.random() * 100,
        network: Math.random() * 100,
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
      addLog('Failed to load analytics data', 'warn');
    }
  }, []);

  // Initialize data
  useEffect(() => {
    loadMetrics();
    
    // Set up periodic metrics refresh
    const interval = setInterval(loadMetrics, pollingInterval);
    return () => clearInterval(interval);
  }, [loadMetrics, pollingInterval]);

  // Format timestamp for display
  const formatTimestamp = useCallback((date: Date): string => {
    return date.toLocaleTimeString([], { hour12: false });
  }, []);

  // Skill data for mobile cards
  const skillsData = useMemo(() => [
    {
      id: '1',
      name: 'Technical Mastery',
      description: 'Advanced coding and system architecture',
      level: 92,
      trend: 'up',
      icon: BrainCircuit,
      color: 'purple',
    },
    {
      id: '2',
      name: 'Creative Flow',
      description: 'Innovation and design thinking',
      level: 87,
      trend: 'up',
      icon: TrendingUp,
      color: 'green',
    },
    {
      id: '3',
      name: 'Neural Processing',
      description: 'Deep learning and pattern recognition',
      level: 95,
      trend: 'stable',
      icon: Cpu,
      color: 'blue',
    },
    ], []);

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-black text-slate-100 p-4 ${enableMobileOptimizations ? 'md:p-8' : 'p-4'} select-none ${className}`}>
        
        {/* Status Bar: Mobile Optimized Height */}
        <div className="flex items-center justify-between mb-8 bg-slate-900/50 p-4 rounded-2xl border border-white/5 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              socketStatus.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className={`text-xs font-mono uppercase tracking-widest text-slate-400 ${connectionStatusColor}`}>
              {connectionStatusText}
            </span>
            {socketStatus.lastConnected && (
              <span className="text-xs text-slate-500 hidden md:block">
                Last: {formatTimestamp(socketStatus.lastConnected)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection Status Icon */}
            {socketStatus.isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            
            <button 
              onClick={syncData}
              disabled={isSyncing}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sync data"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin text-yellow-500' : 'text-slate-400'}`} />
            </button>
            
            {enableMobileOptimizations && (
              <button
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        <div className={`grid ${enableMobileOptimizations ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
          
          {/* Advanced Analytics: Deep Performance Metrics */}
          <section className={`${enableMobileOptimizations ? 'lg:col-span-2' : 'lg:col-span-2'} space-y-6`}>
            <div className="bg-gradient-to-br from-slate-900 to-black p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="text-purple-500" />
                  Advanced Neural Analytics
                </h2>
                {socketStatus.isConnected && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live</span>
                  </div>
                )}
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics && (
                  <>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[10px] text-slate-500 uppercase">Cognitive Retention</p>
                      <p className="text-2xl font-bold text-indigo-400">{metrics.cognitive_retention}%</p>
                      <div className="text-xs text-slate-600 mt-1">+2.3% from last week</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[10px] text-slate-500 uppercase">Decision Latency</p>
                      <p className="text-2xl font-bold text-green-400">{metrics.decision_latency}s</p>
                      <div className="text-xs text-slate-600 mt-1">Optimal range</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[10px] text-slate-500 uppercase">Focus Endurance</p>
                      <p className="text-2xl font-bold text-orange-400">{metrics.focus_endurance}h</p>
                      <div className="text-xs text-slate-600 mt-1">Peak performance</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[10px] text-slate-500 uppercase">Error Rate</p>
                      <p className="text-2xl font-bold text-red-400">{metrics.error_rate}%</p>
                      <div className="text-xs text-slate-600 mt-1">Excellent</div>
                    </div>
                  </>
                )}
              </div>

              {/* Additional Metrics */}
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-500 uppercase">Neural Efficiency</p>
                      <Database className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xl font-bold text-blue-400">{metrics.neural_efficiency}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-500 uppercase">Learning Velocity</p>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-green-400">{(metrics.learning_velocity * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-500 uppercase">Cognitive Load</p>
                      <Cpu className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-xl font-bold text-orange-400">{(metrics.cognitive_load * 100).toFixed(0)}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Optimization: Touch-Friendly Skill Cards */}
            <div className={`grid ${enableMobileOptimizations ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'} gap-4`}>
              {skillsData.map((skill) => {
                const IconComponent = skill.icon;
                return (
                  <motion.div 
                    key={skill.id}
                    whileTap={{ scale: enableMobileOptimizations ? 0.97 : 1 }}
                    className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${skill.color}20` }}
                      >
                        <IconComponent 
                          className={`w-6 h-6`}
                          style={{ color: skill.color === 'purple' ? '#a855f7' : skill.color === 'green' ? '#10b981' : skill.color === 'blue' ? '#3b82f6' : '#f59e0b' }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{skill.name}</h3>
                        <p className="text-xs text-slate-500">{skill.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold" style={{ color: skill.color === 'purple' ? '#a855f7' : skill.color === 'green' ? '#10b981' : skill.color === 'blue' ? '#3b82f6' : '#f59e0b' }}>
                            {skill.level}%
                          </span>
                          {skill.trend === 'up' && (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    {skill.trend === 'up' && (
                      <TrendingUp className="text-green-500 w-5 h-5" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Live Feed Sidebar */}
          <aside className="space-y-6">
            <div className="bg-slate-900/20 p-6 rounded-3xl border border-white/5 h-full min-h-[400px]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Live System Feed
                {socketStatus.isConnected && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </h3>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto">
                <AnimatePresence>
                  {liveLog.map((log, i) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`text-xs p-3 rounded-lg border ${
                        log.type === 'error' 
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : log.type === 'warn'
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="opacity-50 whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="flex-1 break-words">{log.message}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* System Health Indicators */}
              {systemHealth && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                    System Health
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">CPU</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${systemHealth.cpu}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{systemHealth.cpu.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Memory</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${systemHealth.memory}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{systemHealth.memory.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Storage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all"
                            style={{ width: `${systemHealth.storage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{systemHealth.storage.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default IntegratedCommandCenter;
