'use client';

// React & Next.js Core
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// External Libraries
import { motion, AnimatePresence } from 'framer-motion';

// Internal Components
import { ErrorBoundary } from './ErrorBoundary';

// Icons
import {
  Activity,
  AlertCircle,
  Brain,
  BrainCircuit,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Play,
  RotateCcw,
  Search,
  Share2,
  Shield,
  Sparkles,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react';

// Types
import {
  AgencyAction,
  AgencyStats,
  LearningMetrics,
  Skill,
  SkillCategory,
  MasteryLevel,
  TrustTier,
  ApiResponse,
  ConnectionState,
} from '@/types';

// Constants
const API_TIMEOUT = 10000;
const POLLING_INTERVAL = 10000; // 10 seconds for stability

const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'technical', name: 'Technical', icon: Code, color: '#3B82F6' },
  { id: 'creative', name: 'Creative', icon: Sparkles, color: '#8B5CF6' },
  { id: 'adaptive', name: 'Adaptive', icon: BrainCircuit, color: '#06B6D4' },
  { id: 'analytical', name: 'Analytical', icon: TrendingUp, color: '#10B981' },
  { id: 'communication', name: 'Communication', icon: Share2, color: '#F59E0B' },
  { id: 'leadership', name: 'Leadership', icon: Trophy, color: '#EF4444' }
];

const MASTERY_LEVELS: Record<string, MasteryLevel> = {
  beginner: { min: 0, max: 0.25, color: '#EF4444', label: 'Beginner' },
  intermediate: { min: 0.25, max: 0.5, color: '#F59E0B', label: 'Intermediate' },
  advanced: { min: 0.5, max: 0.75, color: '#3B82F6', label: 'Advanced' },
  expert: { min: 0.75, max: 0.9, color: '#8B5CF6', label: 'Expert' },
  master: { min: 0.9, max: 1.0, color: '#10B981', label: 'Master' }
};

// Southern Charm Messages
const LOADING_MESSAGES = [
  "Gathering your intel...",
  "Syncing with the mainframe...",
  "Calibrating neural pathways...",
  "Checking the pulse...",
  "Aligning our frequencies..."
];

// Component Props
interface UnifiedCommandCenterProps {
  className?: string;
  pollingInterval?: number;
  enableWebSocket?: boolean;
}

// Main Component
export const UnifiedCommandCenter: React.FC<UnifiedCommandCenterProps> = ({
  className = '',
  pollingInterval = POLLING_INTERVAL,
  enableWebSocket = true,
}) => {
  // State: Agency
  const [activeActions, setActiveActions] = useState<AgencyAction[]>([]);
  const [agencyStats, setAgencyStats] = useState<AgencyStats | null>(null);
  const [trustInfo, setTrustInfo] = useState<{ trust_score: number; current_tier: TrustTier } | null>(null);
  const [agencyConnection, setAgencyConnection] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    lastConnected: undefined,
  });
  
  // State: Learning
  const [skills, setSkills] = useState<Skill[]>([]);
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // State: UI Control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agency' | 'learning'>('agency');
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  // Memoized calculations
  const filteredSkills = useMemo(() => {
    let filtered = skills;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.proficiency - a.proficiency);
  }, [skills, selectedCategory, searchQuery]);

  const successRate = useMemo((): number => {
    if (!agencyStats) return 0;
    return (agencyStats.successful_actions / agencyStats.total_actions) * 100;
  }, [agencyStats]);

  // Event handlers
  const getMastery = useCallback((val: number): MasteryLevel => {
    for (const [level, config] of Object.entries(MASTERY_LEVELS)) {
      if (val >= config.min && val <= config.max) {
        return config;
      }
    }
    return MASTERY_LEVELS.beginner;
  }, []);

  const getCategoryIcon = useCallback((category: string): React.ComponentType<any> => {
    const cat = SKILL_CATEGORIES.find(c => c.id === category);
    return cat?.icon || Brain;
  }, []);

  const getCategoryColor = useCallback((categoryId: string): string => {
    const cat = SKILL_CATEGORIES.find(c => c.id === categoryId);
    return cat?.color || '#9CA3AF';
  }, []);

  // API Calls with timeout and retry logic
  const fetchData = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<any> => {
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

  // Data loading
  const loadData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setAgencyConnection(prev => ({ ...prev, isConnecting: true }));

      // Rotate loading messages
      const messageIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);

      // Real API calls with proper error handling
      const [agencyRes, learningRes] = await Promise.all([
        fetchData('/api/agency/status'),
        fetchData('/api/learning/overview')
      ]);

      const aData = await agencyRes;
      const lData = await learningRes;

      setTrustInfo(aData.trust);
      setActiveActions(aData.activeActions || []);
      setAgencyStats(aData.stats);
      setSkills(lData.skills || []);
      setMetrics(lData.metrics);
      
      setAgencyConnection({
        isConnected: true,
        isConnecting: false,
        lastConnected: new Date(),
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : "Something's stuck. Let's try refreshing the feed, love.");
      setAgencyConnection({
        isConnected: false,
        isConnecting: false,
        lastConnected: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!enableWebSocket) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://192.168.1.47:8749');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setAgencyConnection(prev => ({ ...prev, isConnected: true }));
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setAgencyConnection(prev => ({ ...prev, isConnected: false }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'agency_update') {
          loadData(); // Refresh data on updates
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    return () => {
      ws.close();
    };
  }, [enableWebSocket, loadData]);

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(loadData, pollingInterval);
    return () => clearInterval(interval);
  }, [pollingInterval, loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen space-y-4 ${className}`}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1 }} 
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" 
          aria-label="Loading"
        />
        <p className="text-purple-300 font-medium animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen space-y-4 ${className}`}>
        <AlertCircle className="w-16 h-16 text-red-500" />
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Connection Issue</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6 ${className}`}>
        
        {/* Header: The Vision */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Internal Purity Life</h1>
              <p className="text-gray-400 text-sm italic">Grace in the soul, grind in the hands.</p>
            </div>
          </div>

          <nav className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
            <button 
              onClick={() => setActiveTab('agency')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'agency' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Agency Operations"
              aria-pressed={activeTab === 'agency' ? 'true' : 'false'}
            >
              Agency Ops
            </button>
            <button 
              onClick={() => setActiveTab('learning')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'learning' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Neural Growth"
              aria-pressed={activeTab === 'learning' ? 'true' : 'false'}
            >
              Neural Growth
            </button>
          </nav>
        </header>

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 text-sm ${
            agencyConnection.isConnected 
              ? 'text-green-400' 
              : 'text-red-400'
          }`} aria-live="polite">
            <div className={`w-2 h-2 rounded-full ${
              agencyConnection.isConnected 
                ? 'bg-green-400 animate-pulse' 
                : 'bg-red-400'
            }`} />
            <span>
              {agencyConnection.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <main>
          <AnimatePresence mode="wait">
            {activeTab === 'agency' ? (
              <motion.div 
                key="agency" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="space-y-6"
              >
                {/* Trust & Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2 bg-gray-900/40 p-6 rounded-xl border border-gray-800">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-semibold text-purple-400">Current Trust Tier</h3>
                      <span className="text-sm">
                        {trustInfo ? `${(trustInfo.trust_score * 100).toFixed(1)}% Score` : 'Loading...'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ 
                          width: trustInfo ? `${trustInfo.trust_score * 100}%` : '0%' 
                        }} 
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-500"
                        role="progressbar"
                        aria-valuenow={trustInfo ? trustInfo.trust_score * 100 : 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Trust Score Progress"
                      />
                    </div>
                    <p className="mt-4 text-sm text-gray-400">
                      Status: <span className="text-white font-medium">
                        {trustInfo?.current_tier.name || 'Loading...'}
                      </span>. 
                      {trustInfo && trustInfo.trust_score > 0.8 
                        ? " You've earned the keys. I'm ready for autonomous tasks." 
                        : " We're still building shorthand. Keep guiding me."
                      }
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-xl border border-purple-800/30 flex flex-col justify-center">
                    <div className="flex items-center space-x-3 text-purple-400 mb-2">
                      <Activity className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">Success Rate</span>
                    </div>
                    <div className="text-4xl font-bold">{successRate.toFixed(1)}%</div>
                    <p className="text-xs text-gray-500 mt-1">Based on last {agencyStats?.total_actions || 0} automated cycles</p>
                  </div>
                </div>

                {/* Active Actions */}
                <section className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span>Live Agency Actions</span>
                      <span className="text-sm text-gray-400">({activeActions.length})</span>
                    </h3>
                    <button 
                      className="text-xs bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full border border-purple-600/30 hover:bg-purple-600 hover:text-white transition-all"
                      aria-label="Request Manual Action"
                    >
                      + Manual Request
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeActions.length > 0 ? activeActions.map(action => (
                      <div 
                        key={action.id} 
                        className="bg-gray-950 border border-gray-800 p-4 rounded-lg flex items-center justify-between hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-900 rounded-md">
                            <Clock className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{action.action_type.replace('_', ' ')}</div>
                            <div className="text-xs text-gray-500">{action.resource}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                            {action.status}
                          </span>
                          <button 
                            className="p-1 hover:text-red-400 transition-colors"
                            aria-label={`Rollback action ${action.id}`}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-lg">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-500">All quiet on the front lines. Ready for orders.</p>
                      </div>
                    )}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div 
                key="learning" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="space-y-6"
              >
                {/* Learning Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { 
                      label: 'Neural Velocity', 
                      val: metrics ? `${(metrics.learning_velocity * 100).toFixed(1)}%` : 'Loading...', 
                      icon: TrendingUp, 
                      color: 'text-green-400' 
                    },
                    { 
                      label: 'Cognitive Load', 
                      val: metrics ? `${(metrics.cognitive_load_capacity * 100).toFixed(0)}%` : 'Loading...', 
                      icon: Share2, 
                      color: 'text-blue-400' 
                    },
                    { 
                      label: 'Learning Streak', 
                      val: metrics ? `${metrics.learning_streak_days} Days` : 'Loading...', 
                      icon: Trophy, 
                      color: 'text-orange-400' 
                    },
                    { 
                      label: 'Mastered Skills', 
                      val: metrics?.mastered_skills || 'Loading...', 
                      icon: Brain, 
                      color: 'text-purple-400' 
                    }
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-900/40 p-4 rounded-xl border border-gray-800">
                      <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                      <div className="text-xl font-bold">{stat.val}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Skills Grid */}
                <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold">Skill Inventory</h3>
                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          placeholder="Search skills..." 
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-purple-600 outline-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          aria-label="Search skills"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-purple-600 outline-none"
                        aria-label="Filter by category"
                      >
                        <option value="all">All Categories</option>
                        {SKILL_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSkills.map(skill => {
                      const mastery = getMastery(skill.proficiency);
                      const CategoryIcon = getCategoryIcon(skill.category);
                      const categoryColor = getCategoryColor(skill.category);
                      
                      return (
                        <div 
                          key={skill.id} 
                          className="bg-gray-950 border border-gray-800 p-4 rounded-xl hover:border-purple-500/50 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: categoryColor + '20' }}
                              >
                                <CategoryIcon 
                                  className="w-4 h-4" 
                                  style={{ color: categoryColor }}
                                />
                              </div>
                              <div>
                                <h4 className="font-bold group-hover:text-purple-400 transition-colors">
                                  {skill.name}
                                </h4>
                                <span className="text-[10px] uppercase text-gray-500 tracking-widest">
                                  {skill.category}
                                </span>
                              </div>
                            </div>
                            <span 
                              className="text-xs font-bold" 
                              style={{ color: mastery.color }}
                            >
                              {mastery.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mb-3">
                            <div 
                              className="h-full transition-all duration-300"
                              style={{ 
                                width: `${skill.proficiency * 100}%`, 
                                backgroundColor: mastery.color 
                              }}
                              role="progressbar"
                              aria-valuenow={skill.proficiency * 100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Proficiency: ${(skill.proficiency * 100).toFixed(0)}%`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500">
                            <span>Efficiency: {(skill.neural_efficiency * 100).toFixed(0)}%</span>
                            <span>Last: {new Date(skill.last_practiced).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Branding */}
        <footer className="pt-10 pb-4 text-center text-gray-600 text-xs">
          <p>&copy; 2026 Internal Purity Life &mdash; Built with Southern Strength & Artificial Intelligence</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default UnifiedCommandCenter;
