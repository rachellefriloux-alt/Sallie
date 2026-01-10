'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LimbicGaugesPremium } from './LimbicGaugesPremium';
import { useLimbicStore } from '@/store/useLimbicStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LimbicEngineServiceImpl, LimbicEngineWebSocket, LimbicEngineUtils, LimbicState } from '@/shared/services/limbicEngineImpl';
import { 
  Heart, 
  Brain, 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  BarChart3,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const LIMBIC_ENGINE_URL = process.env.NEXT_PUBLIC_LIMBIC_ENGINE_URL || 'http://localhost:8750';

interface LimbicHistoryEntry {
  timestamp: number;
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
  posture: string;
  event?: string;
  trigger?: string;
  confidence?: number;
}

interface TrustTier {
  tier: number;
  name: string;
  description: string;
  permissions: string[];
  requirements: string[];
  benefits: string[];
}

interface LimbicScreenPremiumProps {
  compact?: boolean;
  showHistory?: boolean;
  showAnalytics?: boolean;
  realTimeUpdates?: boolean;
}

export function LimbicScreenPremium({ 
  compact = false, 
  showHistory = true, 
  showAnalytics = true,
  realTimeUpdates = true 
}: LimbicScreenPremiumProps) {
  const { state: limbicState, updateState } = useLimbicStore();
  const [history, setHistory] = useState<LimbicHistoryEntry[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LimbicHistoryEntry | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [trustTier, setTrustTier] = useState<TrustTier | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'posture' | 'event' | 'threshold'>('all');

  const { connect } = useWebSocket();

  // Initialize Limbic Engine service connection
  useEffect(() => {
    const initializeLimbicEngine = async () => {
      setIsLoading(true);
      try {
        const limbicService = new LimbicEngineServiceImpl();
        
        // Load current state
        const currentState = await limbicService.getCurrentState();
        updateState(currentState);
        
        // Load trust tier
        const trustInfo = await limbicService.getTrustTier();
        setTrustTier(trustInfo.current);
        
        // Load history
        await loadHistory();
        
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Limbic Engine');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLimbicEngine();
  }, [updateState]);

  // Load history data
  const loadHistory = async () => {
    try {
      const limbicService = new LimbicEngineServiceImpl();
      const historyData = await limbicService.getHistory(timeRange);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Auto-refresh history
  useEffect(() => {
    if (!autoRefresh || !realTimeUpdates) return;

    const interval = setInterval(() => {
      loadHistory();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, realTimeUpdates, timeRange]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;

    const ws = new WebSocket(`${LIMBIC_ENGINE_URL}/ws`);
    
    ws.onopen = () => {
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'state_update') {
          updateState(data.state);
        } else if (data.type === 'history_entry') {
          setHistory(prev => [data.entry, ...prev].slice(0, 1000)); // Keep last 1000 entries
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };
    
    ws.onerror = () => {
      setError('WebSocket connection failed');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [updateState, realTimeUpdates]);

  // Filter and search history
  const filteredHistory = useMemo(() => {
    let filtered = history;

    // Apply time range filter
    const now = Date.now();
    const timeRanges = {
      '1h': now - 60 * 60 * 1000,
      '24h': now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000
    };

    filtered = filtered.filter(entry => entry.timestamp >= timeRanges[timeRange]);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.posture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.trigger?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      switch (filterType) {
        case 'posture':
          filtered = filtered.filter(entry => entry.event === 'posture_change');
          break;
        case 'event':
          filtered = filtered.filter(entry => entry.event && entry.event !== 'posture_change');
          break;
        case 'threshold':
          filtered = filtered.filter(entry => 
            entry.trust > 0.9 || entry.trust < 0.1 ||
            entry.warmth > 0.9 || entry.warmth < 0.1 ||
            entry.arousal > 0.9 || entry.arousal < 0.1
          );
          break;
      }
    }

    return filtered;
  }, [history, timeRange, searchTerm, filterType]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (filteredHistory.length === 0) return null;

    const avgTrust = filteredHistory.reduce((sum, entry) => sum + entry.trust, 0) / filteredHistory.length;
    const avgWarmth = filteredHistory.reduce((sum, entry) => sum + entry.warmth, 0) / filteredHistory.length;
    const avgArousal = filteredHistory.reduce((sum, entry) => sum + entry.arousal, 0) / filteredHistory.length;
    const avgValence = filteredHistory.reduce((sum, entry) => sum + entry.valence, 0) / filteredHistory.length;

    const postureChanges = filteredHistory.filter(entry => entry.event === 'posture_change').length;
    const significantEvents = filteredHistory.filter(entry => entry.event && entry.event !== 'posture_change').length;

    const trend = {
      trust: calculateTrend(filteredHistory.map(entry => entry.trust)),
      warmth: calculateTrend(filteredHistory.map(entry => entry.warmth)),
      arousal: calculateTrend(filteredHistory.map(entry => entry.arousal)),
      valence: calculateTrend(filteredHistory.map(entry => entry.valence))
    };

    return {
      avgTrust,
      avgWarmth,
      avgArousal,
      avgValence,
      postureChanges,
      significantEvents,
      trend,
      totalEntries: filteredHistory.length
    };
  }, [filteredHistory]);

  const calculateTrend = (values: number[]): 'up' | 'down' | 'stable' => {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-Math.min(10, values.length));
    const older = values.slice(-Math.min(20, values.length), -Math.min(10, values.length));
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (Math.abs(diff) < 0.05) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const exportHistory = () => {
    const data = JSON.stringify(filteredHistory, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `limbic-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshData = async () => {
    setIsLoading(true);
    await loadHistory();
    setIsLoading(false);
  };

  if (isLoading && !limbicState) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-64"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  return (
    <div className={`space-y-6 ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: isConnected ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Brain className="w-6 h-6 text-violet-400" />
              <span>Limbic System</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h2>
            <p className="text-sm text-gray-400">
              {isConnected ? 'Real-time monitoring active' : 'Connection lost'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            title={showAdvancedMetrics ? 'Hide advanced metrics' : 'Show advanced metrics'}
          >
            {showAdvancedMetrics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'bg-violet-600 hover:bg-violet-700' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportHistory}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            title="Export history"
          >
            <Download className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Limbic Gauges */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <LimbicGaugesPremium 
            state={limbicState} 
            animated={true}
            compact={compact}
            showAdvanced={showAdvancedMetrics}
          />
        </motion.div>

        {/* History and Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Analytics */}
          {showAnalytics && analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                  <span>Analytics</span>
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{timeRange}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-400">
                    {(analytics.avgTrust * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Avg Trust</div>
                  <motion.div
                    animate={{ scale: analytics.trend.trust === 'up' ? [1, 1.2, 1] : 1 }}
                    className="text-xs mt-1"
                  >
                    {analytics.trend.trust === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                    {analytics.trend.trust === 'down' && <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />}
                    {analytics.trend.trust === 'stable' && <Activity className="w-3 h-3 text-yellow-400" />}
                  </motion.div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {(analytics.avgWarmth * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Avg Warmth</div>
                  <motion.div
                    animate={{ scale: analytics.trend.warmth === 'up' ? [1, 1.2, 1] : 1 }}
                    className="text-xs mt-1"
                  >
                    {analytics.trend.warmth === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                    {analytics.trend.warmth === 'down' && <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />}
                    {analytics.trend.warmth === 'stable' && <Activity className="w-3 h-3 text-yellow-400" />}
                  </motion.div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {(analytics.avgArousal * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Avg Energy</div>
                  <motion.div
                    animate={{ scale: analytics.trend.arousal === 'up' ? [1, 1.2, 1] : 1 }}
                    className="text-xs mt-1"
                  >
                    {analytics.trend.arousal === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                    {analytics.trend.arousal === 'down' && <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />}
                    {analytics.trend.arousal === 'stable' && <Activity className="w-3 h-3 text-yellow-400" />}
                  </motion.div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {analytics.postureChanges}
                  </div>
                  <div className="text-xs text-gray-400">Posture Changes</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* History */}
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-violet-400" />
                  <span>History</span>
                </h3>
                
                <div className="flex items-center space-x-2">
                  {/* Time Range Selector */}
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600"
                    title="Select time range"
                    aria-label="Select time range for history"
                  >
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                  </select>

                  {/* Filter Type */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600"
                    title="Select filter type"
                    aria-label="Select filter type for history"
                  >
                    <option value="all">All Events</option>
                    <option value="posture">Posture Changes</option>
                    <option value="event">Significant Events</option>
                    <option value="threshold">Threshold Crossings</option>
                  </select>

                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="bg-gray-700 text-white text-xs pl-7 pr-2 py-1 rounded border border-gray-600 w-24"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredHistory.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No history entries found
                  </div>
                ) : (
                  filteredHistory.slice(0, 50).map((entry, index) => (
                    <motion.div
                      key={entry.timestamp}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedEvent(entry)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-sm font-medium text-white">
                          {entry.posture}
                        </div>
                        {entry.event && (
                          <div className="text-xs text-violet-400">
                            {entry.event}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-violet-400 rounded-full" style={{ opacity: entry.trust }} aria-hidden="true" />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full" style={{ opacity: entry.warmth }} aria-hidden="true" />
                        <div className="w-2 h-2 bg-amber-400 rounded-full" style={{ opacity: entry.arousal }} aria-hidden="true" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Selected Event Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Posture:</span>
                  <span className="text-white">{selectedEvent.posture}</span>
                </div>

                {selectedEvent.event && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Event:</span>
                    <span className="text-white">{selectedEvent.event}</span>
                  </div>
                )}

                {selectedEvent.trigger && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trigger:</span>
                    <span className="text-white">{selectedEvent.trigger}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-gray-400">State Values:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Trust: {(selectedEvent.trust * 100).toFixed(1)}%</div>
                    <div>Warmth: {(selectedEvent.warmth * 100).toFixed(1)}%</div>
                    <div>Energy: {(selectedEvent.arousal * 100).toFixed(1)}%</div>
                    <div>Mood: {(selectedEvent.valence * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}