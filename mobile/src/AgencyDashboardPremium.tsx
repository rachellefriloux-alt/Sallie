import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
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
} from 'lucide-react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

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

  // Animation values
  const pulseScale = useSharedValue(1);
  const rotationValue = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);

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

  // Pulse animation for connected status
  useEffect(() => {
    if (isConnected) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [isConnected]);

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

      setTrustInfo(mockTrustInfo);
      setAgencyStats(mockStats);
      setActiveActions(mockActiveActions);
      setActionHistory(mockHistory);
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
    switch (actionType) {
      case 'FILE_READ': return FileText;
      case 'FILE_WRITE': return FileText;
      case 'CODE_EXECUTE': return Code;
      case 'NETWORK_REQUEST': return Globe;
      case 'SYSTEM_COMMAND': return Terminal;
      case 'DATABASE_QUERY': return Database;
      case 'API_CALL': return Network;
      default: return Command;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'FILE_READ': return '#3B82F6';
      case 'FILE_WRITE': return '#10B981';
      case 'CODE_EXECUTE': return '#F59E0B';
      case 'NETWORK_REQUEST': return '#8B5CF6';
      case 'SYSTEM_COMMAND': return '#EF4444';
      case 'DATABASE_QUERY': return '#06B6D4';
      case 'API_CALL': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'executing': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'failed': return '#EF4444';
      case 'rollback': return '#F97316';
      default: return '#6B7280';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const successRate = useMemo(() => {
    if (!agencyStats) return 0;
    return (agencyStats.successful_actions / agencyStats.total_actions) * 100;
  }, [agencyStats]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingSpinner,
            { transform: [{ rotate: rotationValue }] }
          ]}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <AlertCircle size={20} color="#EF4444" />
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <LinearGradient
          colors={['#8B5CF6', '#6366F1', '#4F46E5']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#F59E0B', '#F97316', '#EF4444']}
                style={styles.crownIcon}
              >
                <Text style={styles.crownText}>👑</Text>
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Agency Dashboard</Text>
                <Text style={styles.headerSubtitle}>Autonomous Operations & Trust Management</Text>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <View style={styles.connectionStatus}>
                <Animated.View
                  style={[
                    styles.statusIndicator,
                    { transform: [{ scale: pulseScale }] }
                  ]}
                />
                <Text style={styles.statusText}>Connected</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAutoRefresh(!autoRefresh)}
                style={[
                  styles.iconButton,
                  autoRefresh && styles.iconButtonActive
                ]}
              >
                <RefreshCw 
                  size={16} 
                  color={autoRefresh ? "#FFFFFF" : "#9CA3AF"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Trust Status */}
      <BlurView intensity={20} tint="dark" style={styles.trustCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.trustCardGradient}
        >
          <View style={styles.trustHeader}>
            <Key size={20} color="#F59E0B" />
            <Text style={styles.trustTitle}>Trust Status</Text>
          </View>
          
          <View style={styles.trustMetrics}>
            <View style={styles.trustMetric}>
              <Text style={styles.trustMetricLabel}>Current Trust Score</Text>
              <Text style={styles.trustMetricValue}>{(trustInfo?.trust_score || 0) * 100}%</Text>
            </View>
            
            <View style={styles.trustMetric}>
              <Text style={styles.trustMetricLabel}>Current Tier</Text>
              <Text style={styles.trustMetricValue}>{trustInfo?.current_tier.name || 'Unknown'}</Text>
            </View>
          </View>

          <View style={styles.trustTiers}>
            <Text style={styles.trustTiersTitle}>Trust Tiers</Text>
            <View style={styles.trustTiersGrid}>
              {trustInfo?.all_tiers.map((tier, index) => (
                <TouchableOpacity
                  key={tier.tier}
                  style={[
                    styles.trustTier,
                    tier.tier === trustInfo.current_tier.tier && styles.trustTierActive
                  ]}
                  onPress={() => toggleSection(`tier-${tier.tier}`)}
                >
                  <Text style={styles.trustTierName}>{tier.name}</Text>
                  <Text style={styles.trustTierRange}>
                    {Math.round(tier.trust_min * 100)}%-{Math.round(tier.trust_max * 100)}%
                  </Text>
                  <View style={styles.trustTierProgress}>
                    <View 
                      style={[
                        styles.trustTierProgressFill,
                        { 
                          width: `${Math.max(0, Math.min(100, ((trustInfo.trust_score - tier.trust_min) / (tier.trust_max - tier.trust_min)) * 100))}%`,
                          backgroundColor: tier.color
                        }
                      ]} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Agency Statistics */}
      <BlurView intensity={20} tint="dark" style={styles.statsCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.statsCardGradient}
        >
          <Text style={styles.statsTitle}>Agency Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{agencyStats?.total_actions || 0}</Text>
              <Text style={styles.statLabel}>Total Actions</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{successRate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{agencyStats?.active_actions || 0}</Text>
              <Text style={styles.statLabel}>Active Actions</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{agencyStats?.rollbacks_initiated || 0}</Text>
              <Text style={styles.statLabel}>Rollbacks</Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Active Actions */}
      <BlurView intensity={20} tint="dark" style={styles.activeActionsCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.activeActionsCardGradient}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('active')}
          >
            <View style={styles.sectionHeaderLeft}>
              <Zap size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Active Actions</Text>
              <Text style={styles.sectionCount}>({activeActions.length})</Text>
            </View>
            {expandedSections.has('active') ? (
              <ChevronDown size={16} color="#9CA3AF" />
            ) : (
              <ChevronRight size={16} color="#9CA3AF" />
            )}
          </TouchableOpacity>
          
          {expandedSections.has('active') && (
            <View style={styles.actionsList}>
              {activeActions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Shield size={48} color="#374151" />
                  <Text style={styles.emptyStateText}>No active actions</Text>
                </View>
              ) : (
                activeActions.map((action) => (
                  <View key={action.id} style={styles.actionItem}>
                    <View style={styles.actionHeader}>
                      <View style={styles.actionIcon}>
                        {React.createElement(getActionIcon(action.action_type), {
                          size: 16,
                          color: getActionColor(action.action_type)
                        })}
                      </View>
                      <Text style={styles.actionType}>{action.action_type.replace('_', ' ')}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(action.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(action.status) }]}>
                          {action.status}
                        </Text>
                      </View>
                      <View style={[styles.riskBadge, { backgroundColor: getRiskColor(action.metadata.risk_level) + '20' }]}>
                        <Text style={[styles.riskText, { color: getRiskColor(action.metadata.risk_level) }]}>
                          {action.metadata.risk_level}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.actionResource}>Resource: {action.resource}</Text>
                    
                    <View style={styles.actionMeta}>
                      <Text style={styles.actionMetaText}>
                        ⏱ {new Date(action.created_at).toLocaleTimeString()}
                      </Text>
                      <Text style={styles.actionMetaText}>
                        🛡️ {Math.round(action.trust_required * 100)}%
                      </Text>
                      <Text style={styles.actionMetaText}>
                        ⚡ {action.metadata.urgency}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </LinearGradient>
      </BlurView>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowActionModal(true)}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1', '#4F46E5']}
            style={styles.controlButtonGradient}
          >
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Request Action</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowTakeTheWheel(true)}
        >
          <LinearGradient
            colors={['#10B981', '#059669', '#047857']}
            style={styles.controlButtonGradient}
          >
            <Rocket size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Take the Wheel</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: '#8B5CF6',
    borderTopColor: 'transparent',
    borderRadius: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crownIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  crownText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  iconButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  trustCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  trustCardGradient: {
    padding: 20,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  trustMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  trustMetric: {
    flex: 1,
  },
  trustMetricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  trustMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  trustTiers: {
    flex: 1,
  },
  trustTiersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  trustTiersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trustTier: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 2,
  },
  trustTierActive: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B20',
  },
  trustTierName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  trustTierRange: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  trustTierProgress: {
    height: 4,
    backgroundColor: '#1F2937',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trustTierProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  statsCardGradient: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#A78BFA',
    textAlign: 'center',
  },
  activeActionsCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  activeActionsCardGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  actionsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  actionItem: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '500',
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  riskText: {
    fontSize: 8,
    fontWeight: '500',
  },
  actionResource: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 8,
    marginLeft: 44,
  },
  actionMeta: {
    flexDirection: 'row',
    marginLeft: 44,
  },
  actionMetaText: {
    fontSize: 8,
    color: '#6B7280',
    marginRight: 12,
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});