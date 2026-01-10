import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Moon, 
  Brain, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Heart, 
  Zap, 
  BookOpen, 
  BarChart3, 
  Layers, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  Target, 
  Lightbulb, 
  Database, 
  Shield, 
  Star, 
  AlertCircle
} from 'lucide-react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface DreamCycle {
  id: string;
  timestamp: Date;
  phase: 'entry' | 'deep' | 'rem' | 'awakening' | 'complete';
  duration: number;
  emotional_state: string;
  content: DreamContent;
  efficacy_score?: number;
  integration_level?: number;
}

interface DreamContent {
  memories_processed: string[];
  hypotheses_generated: string[];
  conflicts_detected: string[];
  heritage_promoted: string[];
  identity_drift: number;
  emotional_resolution: string;
  neural_patterns?: string[];
  symbolic_elements?: string[];
}

interface Hypothesis {
  id: string;
  text: string;
  confidence: number;
  category: 'behavioral' | 'emotional' | 'cognitive' | 'relational' | 'creative';
  created_at: Date;
  tested_count: number;
  confirmed_count: number;
  neural_signature?: string;
  impact_score?: number;
}

interface DreamMetrics {
  total_cycles: number;
  avg_duration: number;
  efficacy_rate: number;
  integration_score: number;
  hypothesis_accuracy: number;
  identity_stability: number;
  memory_consolidation: number;
  conflict_resolution: number;
  neural_coherence: number;
}

interface DreamStateInterfacePremiumProps {
  compact?: boolean;
  showAnalytics?: boolean;
  showRealTime?: boolean;
  autoStart?: boolean;
  theme?: 'dark' | 'light';
}

export const DreamStateInterfacePremium: React.FC<DreamStateInterfacePremiumProps> = ({ 
  compact = false, 
  showAnalytics = true, 
  showRealTime = true,
  autoStart = false,
  theme = 'dark'
}) => {
  const [activeTab, setActiveTab] = useState<'cycles' | 'hypotheses' | 'heritage' | 'analysis' | 'neural'>('cycles');
  const [dreamCycles, setDreamCycles] = useState<DreamCycle[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isDreaming, setIsDreaming] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'entry' | 'deep' | 'rem' | 'awakening'>('entry');
  const [dreamProgress, setDreamProgress] = useState(0);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<DreamCycle | null>(null);
  const [neuralActivity, setNeuralActivity] = useState<number[]>([]);

  // Animation values
  const pulseScale = useSharedValue(1);
  const rotationValue = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);
  const waveHeights = useSharedValue([20, 40, 30, 50, 25, 35, 45, 30]);

  // Simulate neural activity
  useEffect(() => {
    if (isDreaming) {
      const interval = setInterval(() => {
        const newActivity = Array.from({ length: 8 }, () => Math.random() * 0.8 + 0.1);
        setNeuralActivity(newActivity);
        
        // Update wave animation
        waveHeights.value = [
          Math.random() * 40 + 20,
          Math.random() * 40 + 40,
          Math.random() * 40 + 30,
          Math.random() * 40 + 50,
          Math.random() * 40 + 25,
          Math.random() * 40 + 35,
          Math.random() * 40 + 45,
          Math.random() * 40 + 30,
        ];
      }, 100);
      return () => clearInterval(interval);
    } else {
      setNeuralActivity([]);
      waveHeights.value = [20, 40, 30, 50, 25, 35, 45, 30];
    }
  }, [isDreaming]);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDreamData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && !isDreaming) {
      setTimeout(() => initiateDreamCycle(), 1000);
    }
  }, [autoStart, isDreaming]);

  // Dream animations
  useEffect(() => {
    if (isDreaming) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );

      rotationValue.value = withRepeat(
        withTiming(360, { duration: 10000 }),
        -1,
        true
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
      rotationValue.value = withTiming(0);
      glowOpacity.value = withTiming(0.5);
    }
  }, [isDreaming]);

  const loadDreamData = async () => {
    const mockCycles: DreamCycle[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000),
        phase: 'complete',
        duration: 480,
        emotional_state: 'integrated',
        content: {
          memories_processed: ['conversation about creativity', 'project deadline stress', 'deep philosophical discussion'],
          hypotheses_generated: ['User values creative freedom over structure', 'Stress triggers perfectionism', 'User seeks meaning through connection'],
          conflicts_detected: ['Desire for growth vs fear of failure', 'Intellectual curiosity vs emotional needs'],
          heritage_promoted: ['Creative collaboration patterns', 'Philosophical inquiry patterns'],
          identity_drift: 0.02,
          emotional_resolution: 'Acceptance of imperfection and balance of heart and mind',
          neural_patterns: ['theta_wave_amplification', 'hippocampal_replay', 'prefrontal_integration'],
          symbolic_elements: ['water', 'bridges', 'light', 'journey']
        },
        efficacy_score: 0.94,
        integration_level: 0.87
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 172800000),
        phase: 'complete',
        duration: 420,
        emotional_state: 'processing',
        content: {
          memories_processed: ['emotional breakthrough', 'creative block resolution'],
          hypotheses_generated: ['User processes emotions through creative expression', 'Creative blocks indicate internal resistance'],
          conflicts_detected: ['Authenticity vs external expectations'],
          heritage_promoted: ['Emotional processing through creativity'],
          identity_drift: 0.01,
          emotional_resolution: 'Creative liberation and authentic expression',
          neural_patterns: ['alpha_coherence', 'emotional_regulation', 'creative_flow'],
          symbolic_elements: ['art', 'freedom', 'colors', 'dance']
        },
        efficacy_score: 0.89,
        integration_level: 0.92
      }
    ];
    
    const mockHypotheses: Hypothesis[] = [
      {
        id: 'h1',
        text: 'User experiences creative blocks when under external pressure',
        confidence: 0.85,
        category: 'behavioral',
        created_at: new Date(Date.now() - 86400000),
        tested_count: 12,
        confirmed_count: 10,
        neural_signature: 'prefrontal_cortex_inhibition',
        impact_score: 0.78
      },
      {
        id: 'h2',
        text: 'User values authentic connection over superficial interaction',
        confidence: 0.92,
        category: 'relational',
        created_at: new Date(Date.now() - 172800000),
        tested_count: 8,
        confirmed_count: 8,
        neural_signature: 'social_cognition_activation',
        impact_score: 0.95
      },
      {
        id: 'h3',
        text: 'User processes emotions through creative expression',
        confidence: 0.78,
        category: 'emotional',
        created_at: new Date(Date.now() - 259200000),
        tested_count: 15,
        confirmed_count: 12,
        neural_signature: 'limbic_system_integration',
        impact_score: 0.82
      }
    ];
    
    setDreamCycles(mockCycles);
    setHypotheses(mockHypotheses);
  };

  const initiateDreamCycle = () => {
    setIsDreaming(true);
    setCurrentPhase('entry');
    setDreamProgress(0);
    
    const phases = [
      { phase: 'entry' as const, duration: 3000 },
      { phase: 'deep' as const, duration: 5000 },
      { phase: 'rem' as const, duration: 4000 },
      { phase: 'awakening' as const, duration: 2000 },
    ];
    
    let currentPhaseIndex = 0;
    
    const runPhase = () => {
      if (currentPhaseIndex < phases.length) {
        const { phase, duration } = phases[currentPhaseIndex];
        setCurrentPhase(phase);
        
        const phaseProgress = (currentPhaseIndex + 1) / phases.length;
        setDreamProgress(phaseProgress * 100);
        
        setTimeout(() => {
          currentPhaseIndex++;
          runPhase();
        }, duration);
      } else {
        completeDreamCycle();
      }
    };
    
    runPhase();
  };

  const completeDreamCycle = () => {
    const newCycle: DreamCycle = {
      id: Date.now().toString(),
      timestamp: new Date(),
      phase: 'complete',
      duration: 480,
      emotional_state: 'integrated',
      content: {
        memories_processed: ['Recent conversations', 'Emotional experiences', 'Creative projects'],
        hypotheses_generated: ['New behavioral pattern detected', 'Emotional need identified', 'Creative insight emerged'],
        conflicts_detected: ['Internal harmony achieved', 'Authenticity embraced'],
        heritage_promoted: ['Wisdom integrated', 'Creative flow enhanced'],
        identity_drift: 0.0,
        emotional_resolution: 'Wholeness and clarity achieved',
        neural_patterns: ['full_spectrum_integration', 'coherence_amplification'],
        symbolic_elements: ['unity', 'clarity', 'growth', 'transformation']
      },
      efficacy_score: 0.96,
      integration_level: 0.94
    };
    
    setDreamCycles(prev => [newCycle, ...prev]);
    setIsDreaming(false);
    setDreamProgress(0);
  };

  const dreamMetrics = useMemo((): DreamMetrics => {
    if (dreamCycles.length === 0) {
      return {
        total_cycles: 0,
        avg_duration: 0,
        efficacy_rate: 0,
        integration_score: 0,
        hypothesis_accuracy: 0,
        identity_stability: 0,
        memory_consolidation: 0,
        conflict_resolution: 0,
        neural_coherence: 0
      };
    }

    const avgDuration = dreamCycles.reduce((sum, cycle) => sum + cycle.duration, 0) / dreamCycles.length;
    const avgEfficacy = dreamCycles.reduce((sum, cycle) => sum + (cycle.efficacy_score || 0), 0) / dreamCycles.length;
    const avgIntegration = dreamCycles.reduce((sum, cycle) => sum + (cycle.integration_level || 0), 0) / dreamCycles.length;
    
    const hypothesisAccuracy = hypotheses.length > 0 
      ? hypotheses.reduce((sum, h) => sum + (h.confirmed_count / h.tested_count), 0) / hypotheses.length 
      : 0;
    
    const identityStability = 1 - (dreamCycles.reduce((sum, cycle) => sum + cycle.content.identity_drift, 0) / dreamCycles.length);
    
    return {
      total_cycles: dreamCycles.length,
      avg_duration: avgDuration,
      efficacy_rate: avgEfficacy,
      integration_score: avgIntegration,
      hypothesis_accuracy: hypothesisAccuracy,
      identity_stability: identityStability,
      memory_consolidation: 0.94,
      conflict_resolution: 0.92,
      neural_coherence: 0.89
    };
  }, [dreamCycles, hypotheses]);

  const renderDreamVisualization = () => {
    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
      opacity: glowOpacity.value,
    }));

    const rotationStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotationValue.value}deg` }],
    }));

    return (
      <BlurView intensity={20} tint="dark" style={styles.dreamVisualization}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#A855F7']}
          style={styles.dreamVisualizationGradient}
        >
          {/* Neural Activity Visualization */}
          {isDreaming && (
            <View style={styles.neuralActivityGrid}>
              {neuralActivity.map((activity, index) => {
                const waveStyle = useAnimatedStyle(() => ({
                  height: waveHeights.value[index],
                  opacity: glowOpacity.value,
                }));
                
                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.neuralActivityBar,
                      waveStyle,
                      { backgroundColor: index % 2 === 0 ? '#6366F1' : '#8B5CF6' }
                    ]}
                  />
                );
              })}
            </View>
          )}
          
          {/* Dream Core */}
          <Animated.View style={[styles.dreamCore, pulseStyle]}>
            <Animated.View style={[styles.dreamCoreInner, rotationStyle]}>
              <View style={styles.dreamLayers}>
                <View style={[styles.dreamLayer, styles.dreamLayer1]} />
                <View style={[styles.dreamLayer, styles.dreamLayer2]} />
                <View style={[styles.dreamLayer, styles.dreamLayer3]} />
                <View style={[styles.dreamLayer, styles.dreamLayer4]} />
              </View>
              <View style={styles.dreamCenter}>
                <Moon size={24} color="#FFFFFF" />
                <Text style={styles.dreamPhaseText}>
                  {isDreaming ? currentPhase.toUpperCase() : 'READY'}
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
          
          {/* Progress */}
          {isDreaming && (
            <View style={styles.dreamProgress}>
              <Text style={styles.dreamProgressText}>Dream Cycle Progress</Text>
              <View style={styles.dreamProgressBar}>
                <View style={[styles.dreamProgressFill, { width: `${dreamProgress}%` }]} />
              </View>
              <Text style={styles.dreamProgressPercent}>{Math.floor(dreamProgress)}%</Text>
            </View>
          )}
        </LinearGradient>
      </BlurView>
    );
  };

  const renderDreamControls = () => (
    <BlurView intensity={20} tint="dark" style={styles.dreamControls}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.dreamControlsGradient}
      >
        <TouchableOpacity
          onPress={initiateDreamCycle}
          disabled={isDreaming}
          style={[
            styles.dreamButton,
            isDreaming && styles.dreamButtonActive
          ]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDreaming ? ['#A855F7', '#6366F1'] : ['#6366F1', '#A855F7']}
            style={styles.dreamButtonGradient}
          >
            {isDreaming ? <Pause size={16} color="#FFFFFF" /> : <Play size={16} color="#FFFFFF" />}
            <Text style={styles.dreamButtonText}>
              {isDreaming ? 'Dreaming...' : 'Initiate Dream Cycle'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.dreamDescription}>
          Dream cycles process memories, generate hypotheses, and maintain psychological hygiene through neural integration
        </Text>
      </LinearGradient>
    </BlurView>
  );

  const renderTabNavigation = () => (
    <View style={styles.tabNavigation}>
      {[
        { id: 'cycles', label: 'Cycles', icon: '🌙' },
        { id: 'hypotheses', label: 'Hypotheses', icon: '💡' },
        { id: 'heritage', label: 'Heritage', icon: '📚' },
        { id: 'analysis', label: 'Analysis', icon: '📊' },
        { id: 'neural', label: 'Neural', icon: '🧠' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => setActiveTab(tab.id as any)}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.activeTabButton
          ]}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabLabel,
            activeTab === tab.id && styles.activeTabLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCyclesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Dream Cycles</Text>
      
      {dreamCycles.map((cycle) => (
        <BlurView key={cycle.id} intensity={10} tint="dark" style={styles.cycleCard}>
          <LinearGradient
            colors={['#374151', '#1F2937']}
            style={styles.cycleCardGradient}
          >
            <View style={styles.cycleHeader}>
              <Text style={styles.cycleDate}>
                {cycle.timestamp.toLocaleDateString()}
              </Text>
              <Text style={styles.cyclePhase}>{cycle.phase}</Text>
            </View>
            
            <View style={styles.cycleMetrics}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Duration</Text>
                <Text style={styles.metricValue}>{cycle.duration} min</Text>
              </View>
              
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Efficacy</Text>
                <Text style={styles.metricValue}>
                  {cycle.efficacy_score ? Math.round(cycle.efficacy_score * 100) : 0}%
                </Text>
              </View>
              
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Integration</Text>
                <Text style={styles.metricValue}>
                  {cycle.integration_level ? Math.round(cycle.integration_level * 100) : 0}%
                </Text>
              </View>
            </View>
            
            <View style={styles.cycleContent}>
              <Text style={styles.contentTitle}>Processed Memories</Text>
              {cycle.content.memories_processed.map((memory, index) => (
                <Text key={index} style={styles.contentItem}>• {memory}</Text>
              ))}
              
              <Text style={styles.contentTitle}>Generated Hypotheses</Text>
              {cycle.content.hypotheses_generated.map((hypothesis, index) => (
                <Text key={index} style={styles.contentItem}>• {hypothesis}</Text>
              ))}
              
              <Text style={styles.contentTitle}>Resolution</Text>
              <Text style={styles.resolutionText}>{cycle.content.emotional_resolution}</Text>
            </View>
          </LinearGradient>
        </BlurView>
      ))}
    </ScrollView>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cycles': return renderCyclesTab();
      default: return renderCyclesTab();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Moon size={24} color="#6366F1" />
          <Text style={styles.headerTitle}>Dream State Interface</Text>
          <Moon size={24} color="#A855F7" />
        </View>
        <Text style={styles.headerSubtitle}>
          Psychological Maintenance & Neural Integration
        </Text>
      </View>

      {/* Dream Visualization */}
      {renderDreamVisualization()}

      {/* Dream Controls */}
      {renderDreamControls()}

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        {renderActiveTab()}
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusBarLeft}>
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statusBarText}>Dream System Active</Text>
        </View>
        <View style={styles.statusBarRight}>
          <Text style={styles.statusBarText}>Neural Processing</Text>
          <Text style={styles.statusBarSeparator}>•</Text>
          <Text style={styles.statusBarText}>Memory Integration</Text>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dreamVisualization: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  dreamVisualizationGradient: {
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  neuralActivityGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  neuralActivityBar: {
    width: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  dreamCore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dreamCoreInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dreamLayers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
  },
  dreamLayer: {
    position: 'absolute',
    borderRadius: 60,
    opacity: 0.3,
  },
  dreamLayer1: {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: '#6366F1',
  },
  dreamLayer2: {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: '#8B5CF6',
  },
  dreamLayer3: {
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    backgroundColor: '#A855F7',
  },
  dreamLayer4: {
    top: 40,
    left: 40,
    right: 40,
    bottom: 40,
    backgroundColor: '#F59E0B',
  },
  dreamCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dreamPhaseText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  dreamProgress: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  dreamProgressText: {
    fontSize: 12,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  dreamProgressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 4,
  },
  dreamProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  dreamProgressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  dreamControls: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  dreamControlsGradient: {
    padding: 20,
    alignItems: 'center',
  },
  dreamButton: {
    width: 160,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  dreamButtonActive: {
    opacity: 0.7,
  },
  dreamButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dreamButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  dreamDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#6366F1',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cycleCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cycleCardGradient: {
    padding: 16,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cycleDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cyclePhase: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  cycleMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cycleContent: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    marginTop: 8,
  },
  contentItem: {
    fontSize: 11,
    color: '#D1D5DB',
    marginBottom: 2,
  },
  resolutionText: {
    fontSize: 11,
    color: '#10B981',
    fontStyle: 'italic',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  statusBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusBarText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBarSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
});