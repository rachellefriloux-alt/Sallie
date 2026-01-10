'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  GitBranch, 
  Activity,
  Settings,
  Play,
  RotateCcw,
  Eye,
  Lock,
  Unlock,
  TrendingUp,
  Users,
  FileText,
  Database,
  Cpu,
  HardDrive,
  Brain,
  Sparkles,
  Target,
  Rocket,
  Crown,
  Key,
  Sword,
  Heart,
  Star,
  Gauge,
  Layers,
  Command,
  Terminal,
  Code,
  Globe,
  Network,
  ZapOff,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Pause,
  SkipForward,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface AgencyDashboardPremiumProps {
  className?: string;
  compact?: boolean;
  showAdvancedMetrics?: boolean;
  realTimeUpdates?: boolean;
}

interface TrustTier {
  tier: number;
  name: string;
  trust_min: number;
  trust_max: number;
  permissions: string[];
  restrictions: string[];
  color: string;
}

interface AgencyAction {
  id: string;
  action_type: string;
  resource: string;
  parameters: any;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rollback';
  trust_required: number;
  created_at: string;
  completed_at?: string;
  error?: string;
  metadata: {
    source: string;
    context: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    requires_confirmation: boolean;
    auto_rollback: boolean;
  };
  execution_log?: string[];
  rollback_available: boolean;
}

interface AgencyStats {
  total_actions: number;
  successful_actions: number;
  failed_actions: number;
  active_actions: number;
  rollbacks_initiated: number;
  rollbacks_successful: number;
  avg_execution_time: number;
  trust_score: number;
  current_tier: number;
  capabilities_used: number;
  security_events: number;
  performance_metrics: {
    cpu_usage: number;
    memory_usage: number;
    network_latency: number;
    response_time: number;
  };
}

interface CapabilityContract {
  id: string;
  name: string;
  description: string;
  category: string;
  trust_required: number;
  risk_level: string;
  usage_count: number;
  last_used: string;
  success_rate: number;
  enabled: boolean;
  restrictions: string[];
}

const MOCK_TRUST_TIERS: TrustTier[] = [
  {
    tier: 1,
    name: 'Observer',
    trust_min: 0.0,
    trust_max: 0.3,
    permissions: ['read_only', 'basic_queries'],
    restrictions: ['no_file_access', 'no_network', 'no_execution'],
    color: '#6B7280'
  },
  {
    tier: 2,
    name: 'Assistant',
    trust_min: 0.3,
    trust_max: 0.6,
    permissions: ['read_files', 'basic_commands', 'network_read'],
    restrictions: ['no_system_changes', 'no_sensitive_data'],
    color: '#3B82F6'
  },
  {
    tier: 3,
    name: 'Collaborator',
    trust_min: 0.6,
    trust_max: 0.8,
    permissions: ['file_operations', 'network_full', 'code_execution'],
    restrictions: ['no_system_admin', 'no_critical_operations'],
    color: '#8B5CF6'
  },
  {
    tier: 4,
    name: 'Partner',
    trust_min: 0.8,
    trust_max: 0.95,
    permissions: ['system_operations', 'autonomous_decisions', 'resource_management'],
    restrictions: ['no_destructive_actions', 'requires_approval'],
    color: '#F59E0B'
  },
  {
    tier: 5,
    name: 'Sovereign',
    trust_min: 0.95,
    trust_max: 1.0,
    permissions: ['full_system_access', 'autonomous_execution', 'self_modification'],
    restrictions: ['ethical_boundaries_only'],
    color: '#EF4444'
  }
];

const ACTION_TYPES = {
  FILE_READ: { icon: FileText, color: '#3B82F6', risk: 'low' },
  FILE_WRITE: { icon: FileText, color: '#10B981', risk: 'medium' },
  CODE_EXECUTE: { icon: Code, color: '#F59E0B', risk: 'high' },
  NETWORK_REQUEST: { icon: Globe, color: '#8B5CF6', risk: 'medium' },
  SYSTEM_COMMAND: { icon: Terminal, color: '#EF4444', risk: 'critical' },
  DATABASE_QUERY: { icon: Database, color: '#06B6D4', risk: 'low' },
  API_CALL: { icon: Network, color: '#6366F1', risk: 'medium' }
};

export const AgencyDashboardPremium: React.FC<AgencyDashboardPremiumProps> = ({ 
  className = '',
  compact = false,
  showAdvancedMetrics = true,
  realTimeUpdates = true
}) => {
  const [trustInfo, setTrustInfo] = useState<{ trust_score: number; current_tier: TrustTier; all_tiers: TrustTier[] } | null>(null);
  const [activeActions, setActiveActions] = useState<AgencyAction[]>([]);
  const [actionHistory, setActionHistory] = useState<AgencyAction[]>([]);
  const [agencyStats, setAgencyStats] = useState<AgencyStats | null>(null);
  const [capabilities, setCapabilities] = useState<CapabilityContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AgencyAction | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showTakeTheWheel, setShowTakeTheWheel] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['trust', 'active']));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    if (!realTimeUpdates || !autoRefresh) return;

    const interval = setInterval(() => {
      loadAgencyData();
    }, 2000);
    return () => clearInterval(interval);
  }, [realTimeUpdates, autoRefresh]);

  // Initialize data
  useEffect(() => {
    loadAgencyData();
  }, []);

  const loadAgencyData = useCallback(async () => {
    try {
      // Simulate API calls
      const mockTrustInfo = {
        trust_score: 0.87,
        current_tier: MOCK_TRUST_TIERS[3],
        all_tiers: MOCK_TRUST_TIERS
      };

      const mockStats: AgencyStats = {
        total_actions: 1247,
        successful_actions: 1189,
        failed_actions: 58,
        active_actions: 3,
        rollbacks_initiated: 12,
        rollbacks_successful: 11,
        avg_execution_time: 2.3,
        trust_score: 0.87,
        current_tier: 4,
        capabilities_used: 156,
        security_events: 2,
        performance_metrics: {
          cpu_usage: 23.4,
          memory_usage: 67.8,
          network_latency: 12.3,
          response_time: 145.6
        }
      };

      const mockActiveActions: AgencyAction[] = [
        {
          id: '1',
          action_type: 'CODE_EXECUTE',
          resource: './scripts/backup.py',
          parameters: { mode: 'incremental', compression: true },
          status: 'executing',
          trust_required: 0.75,
          created_at: new Date(Date.now() - 120000).toISOString(),
          metadata: {
            source: 'scheduled_task',
            context: 'Automated backup system',
            urgency: 'medium',
            risk_level: 'medium',
            requires_confirmation: false,
            auto_rollback: true
          },
          execution_log: ['Starting backup process...', 'Checking file permissions...', 'Initiating backup...'],
          rollback_available: true
        },
        {
          id: '2',
          action_type: 'NETWORK_REQUEST',
          resource: 'https://api.github.com/repos/sallie/studio',
          parameters: { method: 'GET', headers: { 'Accept': 'application/json' } },
          status: 'pending',
          trust_required: 0.65,
          created_at: new Date(Date.now() - 60000).toISOString(),
          metadata: {
            source: 'user_request',
            context: 'Repository status check',
            urgency: 'low',
            risk_level: 'low',
            requires_confirmation: false,
            auto_rollback: false
          },
          rollback_available: false
        }
      ];

      const mockHistory: AgencyAction[] = [
        {
          id: '3',
          action_type: 'FILE_WRITE',
          resource: './config/settings.json',
          parameters: { theme: 'dark', auto_save: true },
          status: 'completed',
          trust_required: 0.55,
          created_at: new Date(Date.now() - 300000).toISOString(),
          completed_at: new Date(Date.now() - 240000).toISOString(),
          metadata: {
            source: 'user_request',
            context: 'Configuration update',
            urgency: 'low',
            risk_level: 'low',
            requires_confirmation: false,
            auto_rollback: true
          },
          rollback_available: true
        }
      ];

      const mockCapabilities: CapabilityContract[] = [
        {
          id: '1',
          name: 'File System Access',
          description: 'Read and write files within designated directories',
          category: 'System',
          trust_required: 0.6,
          risk_level: 'medium',
          usage_count: 234,
          last_used: new Date(Date.now() - 3600000).toISOString(),
          success_rate: 0.98,
          enabled: true,
          restrictions: ['no_system_files', 'sandboxed']
        },
        {
          id: '2',
          name: 'Network Communication',
          description: 'Make HTTP requests to external services',
          category: 'Network',
          trust_required: 0.7,
          risk_level: 'medium',
          usage_count: 156,
          last_used: new Date(Date.now() - 7200000).toISOString(),
          success_rate: 0.95,
          enabled: true,
          restrictions: ['whitelisted_domains', 'rate_limited']
        }
      ];

      setTrustInfo(mockTrustInfo);
      setAgencyStats(mockStats);
      setActiveActions(mockActiveActions);
      setActionHistory(mockHistory);
      setCapabilities(mockCapabilities);
      setIsConnected(true);
      setError(null);
    } catch (error) {
      console.error('Failed to load agency data:', error);
      setError('Failed to load agency data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getActionIcon = (actionType: string) => {
    const action = ACTION_TYPES[actionType as keyof typeof ACTION_TYPES];
    return action?.icon || Command;
  };

  const getActionColor = (actionType: string) => {
    const action = ACTION_TYPES[actionType as keyof typeof ACTION_TYPES];
    return action?.color || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'executing': return 'text-blue-400 bg-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      case 'rollback': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const successRate = useMemo(() => {
    if (!agencyStats) return 0;
    return (agencyStats.successful_actions / agencyStats.total_actions) * 100;
  }, [agencyStats]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl border border-purple-800/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Agency Dashboard</h2>
              <p className="text-purple-200">Autonomous Operations & Trust Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
              isConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Toggle auto-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`p-2 rounded-lg transition-colors ${
                realTimeMode ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Toggle real-time mode"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trust Tier Display */}
        {trustInfo && (
          <div className="bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Key className="w-5 h-5 text-yellow-400" />
                <span>Trust Status</span>
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-purple-300">
                  Trust Score: {(trustInfo.trust_score * 100).toFixed(1)}%
                </span>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    {trustInfo.current_tier.name}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {trustInfo.all_tiers.map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    tier.tier === trustInfo.current_tier.tier
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                  onClick={() => toggleSection(`tier-${tier.tier}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{tier.name}</span>
                    <span className="text-xs text-gray-400">Tier {tier.tier}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {(tier.trust_min * 100).toFixed(0)}% - {(tier.trust_max * 100).toFixed(0)}%
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(0, Math.min(100, ((trustInfo.trust_score - tier.trust_min) / (tier.trust_max - tier.trust_min)) * 100))}%`,
                        backgroundColor: tier.color
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Agency Stats */}
      {agencyStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl border border-purple-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm text-purple-300 font-medium">Total Actions</div>
                <div className="text-2xl font-bold text-white">{agencyStats.total_actions}</div>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
            <div className="text-xs text-purple-400">
              {agencyStats.active_actions} active
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl border border-green-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm text-green-300 font-medium">Success Rate</div>
                <div className="text-2xl font-bold text-white">{successRate.toFixed(1)}%</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="text-xs text-green-400">
              {agencyStats.successful_actions} successful
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl border border-blue-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm text-blue-300 font-medium">Avg Execution</div>
                <div className="text-2xl font-bold text-white">{agencyStats.avg_execution_time}s</div>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-xs text-blue-400">
              Response time
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 rounded-xl border border-orange-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm text-orange-300 font-medium">Rollbacks</div>
                <div className="text-2xl font-bold text-white">{agencyStats.rollbacks_initiated}</div>
              </div>
              <RotateCcw className="h-8 w-8 text-orange-400" />
            </div>
            <div className="text-xs text-orange-400">
              {agencyStats.rollbacks_successful} successful
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Metrics */}
      {showAdvancedMetrics && agencyStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-purple-400" />
              <span>Performance Metrics</span>
            </h3>
            <button
              onClick={() => toggleSection('performance')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {expandedSections.has('performance') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          
          {expandedSections.has('performance') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{agencyStats.performance_metrics.cpu_usage.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">CPU Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{agencyStats.performance_metrics.memory_usage.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{agencyStats.performance_metrics.network_latency.toFixed(1)}ms</div>
                <div className="text-sm text-gray-400">Network Latency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{agencyStats.performance_metrics.response_time.toFixed(0)}ms</div>
                <div className="text-sm text-gray-400">Response Time</div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Active Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Active Actions</span>
            <span className="text-sm text-gray-400">({activeActions.length})</span>
          </h3>
          <button
            onClick={() => toggleSection('active')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.has('active') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        
        {expandedSections.has('active') && (
          <div className="space-y-3">
            {activeActions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p>No active actions</p>
              </div>
            ) : (
              activeActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg bg-gray-800`}>
                          {React.createElement(getActionIcon(action.action_type), { 
                            className: "w-4 h-4", 
                            style: { color: getActionColor(action.action_type) } 
                          })}
                        </div>
                        <span className="font-medium text-white">
                          {action.action_type.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(action.status)}`}>
                          {action.status}
                        </span>
                        <div className={`flex items-center space-x-1 text-xs ${
                          action.metadata.risk_level === 'critical' ? 'text-red-400' :
                          action.metadata.risk_level === 'high' ? 'text-orange-400' :
                          action.metadata.risk_level === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>{action.metadata.risk_level}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400 mb-2">
                        Resource: <span className="text-white">{action.resource}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 w-3" />
                          <span>{new Date(action.created_at).toLocaleTimeString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Shield className="w-3 w-3" />
                          <span>Trust: {(action.trust_required * 100).toFixed(0)}%</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 w-3" />
                          <span>{action.metadata.urgency}</span>
                        </span>
                      </div>

                      {action.execution_log && action.execution_log.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400 font-mono bg-black/30 p-2 rounded">
                          {action.execution_log[action.execution_log.length - 1]}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedAction(action)}
                        className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      {action.rollback_available && action.status === 'completed' && (
                        <button
                          className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {/* Action History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Recent Actions</span>
          </h3>
          <button
            onClick={() => toggleSection('history')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.has('history') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        
        {expandedSections.has('history') && (
          <div className="space-y-2">
            {actionHistory.slice(0, 10).map((action) => (
              <div
                key={action.id}
                className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-3 hover:bg-gray-900/50 transition-colors cursor-pointer"
                onClick={() => setSelectedAction(action)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded bg-gray-800`}>
                      {React.createElement(getActionIcon(action.action_type), { 
                        className: "w-3 h-3", 
                        style: { color: getActionColor(action.action_type) } 
                      })}
                    </div>
                    <span className="font-medium text-white text-sm">
                      {action.action_type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(action.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowActionModal(true)}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-4 flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          <Zap className="w-5 h-5" />
          <span className="font-semibold">Request Action</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTakeTheWheel(true)}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-4 flex items-center justify-center space-x-2 hover:from-green-700 hover:to-emerald-700 transition-all"
        >
          <Rocket className="w-5 h-5" />
          <span className="font-semibold">Take the Wheel</span>
        </motion.button>
      </motion.div>
    </div>
  );
};