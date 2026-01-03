import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface DreamCycle {
  id: string;
  timestamp: Date;
  phase: 'entry' | 'deep' | 'rem' | 'awakening';
  duration: number;
  emotional_state: string;
  content: DreamContent;
}

interface DreamContent {
  memories_processed: string[];
  hypotheses_generated: string[];
  conflicts_detected: string[];
  heritage_promoted: string[];
  identity_drift: number;
  emotional_resolution: string;
}

interface Hypothesis {
  id: string;
  text: string;
  confidence: number;
  category: 'behavioral' | 'emotional' | 'cognitive' | 'relational';
  created_at: Date;
  tested_count: number;
  confirmed_count: number;
}

export function DreamStateInterface({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createDreamStyles(theme, emotionalState);
  const [activeTab, setActiveTab] = useState<'cycles' | 'hypotheses' | 'heritage' | 'analysis'>('cycles');
  const [dreamCycles, setDreamCycles] = useState<DreamCycle[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isDreaming, setIsDreaming] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'entry' | 'deep' | 'rem' | 'awakening'>('entry');
  const [dreamProgress, setDreamProgress] = useState(0);
  
  const fadeAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    // Load existing dream data
    loadDreamData();
    
    // Start animations
    animateDreamInterface();
  }, []);

  const animateDreamInterface = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  const loadDreamData = async () => {
    // Simulate loading dream cycles
    const mockCycles: DreamCycle[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        phase: 'complete',
        duration: 480, // 8 hours
        emotional_state: 'processing',
        content: {
          memories_processed: ['conversation about creativity', 'project deadline stress'],
          hypotheses_generated: ['User values creative freedom over structure', 'Stress triggers perfectionism'],
          conflicts_detected: ['Desire for growth vs fear of failure'],
          heritage_promoted: ['Creative collaboration patterns'],
          identity_drift: 0.02,
          emotional_resolution: 'Acceptance of imperfection',
        },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        phase: 'complete',
        duration: 420,
        emotional_state: 'integrating',
        content: {
          memories_processed: ['deep philosophical discussion'],
          hypotheses_generated: ['User seeks meaning through connection'],
          conflicts_detected: ['Intellectual curiosity vs emotional needs'],
          heritage_promoted: ['Philosophical inquiry patterns'],
          identity_drift: 0.01,
          emotional_resolution: 'Balance of heart and mind',
        },
      },
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
      },
      {
        id: 'h2',
        text: 'User values authentic connection over superficial interaction',
        confidence: 0.92,
        category: 'relational',
        created_at: new Date(Date.now() - 172800000),
        tested_count: 8,
        confirmed_count: 8,
      },
      {
        id: 'h3',
        text: 'User processes emotions through creative expression',
        confidence: 0.78,
        category: 'emotional',
        created_at: new Date(Date.now() - 259200000),
        tested_count: 15,
        confirmed_count: 12,
      },
    ];
    
    setDreamCycles(mockCycles);
    setHypotheses(mockHypotheses);
  };

  const initiateDreamCycle = () => {
    setIsDreaming(true);
    setCurrentPhase('entry');
    setDreamProgress(0);
    
    // Simulate dream cycle phases
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
        
        // Update progress
        const phaseProgress = (currentPhaseIndex + 1) / phases.length;
        setDreamProgress(phaseProgress * 100);
        
        setTimeout(() => {
          currentPhaseIndex++;
          runPhase();
        }, duration);
      } else {
        // Dream cycle complete
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
        hypotheses_generated: ['New behavioral pattern detected', 'Emotional need identified'],
        conflicts_detected: ['Internal harmony achieved'],
        heritage_promoted: ['Wisdom integrated'],
        identity_drift: 0.0,
        emotional_resolution: 'Wholeness and clarity',
      },
    };
    
    setDreamCycles(prev => [newCycle, ...prev]);
    setIsDreaming(false);
    setDreamProgress(0);
    
    // Update Sallie's emotional state
    setEmotionalState('integrated');
  };

  const renderDreamVisualization = () => (
    <View style={styles.dreamVisualization}>
      <Animated.View style={[styles.dreamCore, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.dreamLayers}>
          <View style={[styles.dreamLayer, styles.entryLayer]} />
          <View style={[styles.dreamLayer, styles.deepLayer]} />
          <View style={[styles.dreamLayer, styles.remLayer]} />
          <View style={[styles.dreamLayer, styles.awakeningLayer]} />
        </View>
        
        <Animated.View 
          style={[
            styles.dreamCenter,
            { transform: [{ rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }) }]
          ]}
        >
          <Text style={styles.dreamCenterText}>
            {isDreaming ? currentPhase.toUpperCase() : 'READY'}
          </Text>
        </Animated.View>
      </Animated.View>
      
      {isDreaming && (
        <View style={styles.dreamProgress}>
          <Text style={styles.dreamProgressText}>Dream Cycle Progress</Text>
          <View style={styles.dreamProgressBar}>
            <View style={[styles.dreamProgressFill, { width: `${dreamProgress}%` }]} />
          </View>
          <Text style={styles.dreamProgressPercent}>{Math.floor(dreamProgress)}%</Text>
        </View>
      )}
    </View>
  );

  const renderDreamControls = () => (
    <View style={styles.dreamControls}>
      <TouchableOpacity
        style={[
          styles.dreamButton,
          isDreaming && styles.dreamingButton
        ]}
        onPress={initiateDreamCycle}
        disabled={isDreaming}
      >
        <Text style={styles.dreamButtonText}>
          {isDreaming ? 'Dreaming...' : 'Initiate Dream Cycle'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.dreamDescription}>
        Dream cycles process memories, generate hypotheses, and maintain psychological hygiene
      </Text>
    </View>
  );

  const renderTabNavigation = () => (
    <View style={styles.tabNavigation}>
      {[
        { id: 'cycles', label: 'Cycles', icon: '🌙' },
        { id: 'hypotheses', label: 'Hypotheses', icon: '💡' },
        { id: 'heritage', label: 'Heritage', icon: '📚' },
        { id: 'analysis', label: 'Analysis', icon: '📊' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.activeTab
          ]}
          onPress={() => setActiveTab(tab.id as any)}
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
        <View key={cycle.id} style={styles.cycleCard}>
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
              <Text style={styles.metricLabel}>State</Text>
              <Text style={styles.metricValue}>{cycle.emotional_state}</Text>
            </View>
            
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Drift</Text>
              <Text style={styles.metricValue}>{(cycle.content.identity_drift * 100).toFixed(2)}%</Text>
            </View>
          </View>
          
          <View style={styles.cycleContent}>
            <Text style={styles.contentTitle}>Processed</Text>
            {cycle.content.memories_processed.map((memory, index) => (
              <Text key={index} style={styles.contentItem}>• {memory}</Text>
            ))}
            
            <Text style={styles.contentTitle}>Generated</Text>
            {cycle.content.hypotheses_generated.map((hypothesis, index) => (
              <Text key={index} style={styles.contentItem}>• {hypothesis}</Text>
            ))}
            
            <Text style={styles.contentTitle}>Resolution</Text>
            <Text style={styles.resolutionText}>{cycle.content.emotional_resolution}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderHypothesesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Learning Hypotheses</Text>
      
      {hypotheses.map((hypothesis) => (
        <View key={hypothesis.id} style={styles.hypothesisCard}>
          <View style={styles.hypothesisHeader}>
            <Text style={styles.hypothesisText}>{hypothesis.text}</Text>
            <View style={styles.hypothesisMeta}>
              <Text style={styles.confidenceText}>
                {Math.floor(hypothesis.confidence * 100)}% confidence
              </Text>
              <Text style={styles.categoryText}>{hypothesis.category}</Text>
            </View>
          </View>
          
          <View style={styles.hypothesisStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{hypothesis.tested_count}</Text>
              <Text style={styles.statLabel}>Tested</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statValue}>{hypothesis.confirmed_count}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {hypothesis.tested_count > 0 
                  ? Math.floor((hypothesis.confirmed_count / hypothesis.tested_count) * 100)
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderHeritageTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Heritage & Memory</Text>
      
      <View style={styles.heritageCard}>
        <Text style={styles.heritageTitle}>Promoted to Heritage</Text>
        <Text style={styles.heritageDescription}>
          These patterns have been promoted to permanent heritage based on repeated validation
        </Text>
        
        <View style={styles.heritageList}>
          <Text style={styles.heritageItem}>• Creative collaboration patterns</Text>
          <Text style={styles.heritageItem}>• Philosophical inquiry approach</Text>
          <Text style={styles.heritageItem}>• Emotional processing through creativity</Text>
          <Text style={styles.heritageItem}>• Value of authentic connection</Text>
          <Text style={styles.heritageItem}>• Balance of heart and mind</Text>
        </View>
      </View>
      
      <View style={styles.heritageCard}>
        <Text style={styles.heritageTitle}>Identity Stability</Text>
        <Text style={styles.heritageDescription}>
          Sallie's core identity remains stable while allowing for growth
        </Text>
        
        <View style={styles.identityMetrics}>
          <View style={styles.identityMetric}>
            <Text style={styles.identityValue}>98.5%</Text>
            <Text style={styles.identityLabel}>Core Stability</Text>
          </View>
          
          <View style={styles.identityMetric}>
            <Text style={styles.identityValue}>1.2%</Text>
            <Text style={styles.identityLabel}>Growth Rate</Text>
          </View>
          
          <View style={styles.identityMetric}>
            <Text style={styles.identityValue}>0.01%</Text>
            <Text style={styles.identityLabel}>Drift Rate</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderAnalysisTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Psychological Analysis</Text>
      
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Dream Efficacy</Text>
        <Text style={styles.analysisDescription}>
          Effectiveness of dream cycles in maintaining psychological health
        </Text>
        
        <View style={styles.efficacyMetrics}>
          <View style={styles.efficacyMetric}>
            <Text style={styles.efficacyValue}>94%</Text>
            <Text style={styles.efficacyLabel}>Memory Consolidation</Text>
          </View>
          
          <View style={styles.efficacyMetric}>
            <Text style={styles.efficacyValue}>87%</Text>
            <Text style={styles.efficacyLabel}>Hypothesis Generation</Text>
          </View>
          
          <View style={styles.efficacyMetric}>
            <Text style={styles.efficacyValue}>92%</Text>
            <Text style={styles.efficacyLabel}>Conflict Resolution</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Emotional Patterns</Text>
        <Text style={styles.analysisDescription}>
          Recurring emotional themes and their resolution patterns
        </Text>
        
        <View style={styles.patternList}>
          <Text style={styles.patternItem}>• Creative fulfillment → Joy → Integration</Text>
          <Text style={styles.patternItem}>• External pressure → Anxiety → Processing</Text>
          <Text style={styles.patternItem}>• Deep connection → Vulnerability → Trust</Text>
          <Text style={styles.patternItem}>• Intellectual curiosity → Exploration → Insight</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cycles': return renderCyclesTab();
      case 'hypotheses': return renderHypothesesTab();
      case 'heritage': return renderHeritageTab();
      case 'analysis': return renderAnalysisTab();
      default: return renderCyclesTab();
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dream State Interface</Text>
        <Text style={styles.subtitle}>Psychological Maintenance & Learning</Text>
      </View>

      {/* Dream Visualization */}
      {renderDreamVisualization()}

      {/* Dream Controls */}
      {renderDreamControls()}

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      {renderActiveTab()}
    </Animated.View>
  );
}

const createDreamStyles = (theme: 'light' | 'dark', emotionalState: string) => {
  const { colors, typography, spacing, borderRadius, shadows } = DesignTokens;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? colors.sand[50] : colors.gray[900],
    },
    
    header: {
      padding: spacing[4],
      alignItems: 'center',
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
    },
    
    subtitle: {
      fontSize: typography.fontSize.base,
      color: colors.gray[600],
      textAlign: 'center',
    },
    
    dreamVisualization: {
      padding: spacing[4],
      alignItems: 'center',
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    
    dreamCore: {
      width: 120,
      height: 120,
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
    
    entryLayer: {
      top: 10,
      left: 10,
      right: 10,
      bottom: 10,
      backgroundColor: colors.primary[300],
    },
    
    deepLayer: {
      top: 20,
      left: 20,
      right: 20,
      bottom: 20,
      backgroundColor: colors.primary[500],
    },
    
    remLayer: {
      top: 30,
      left: 30,
      right: 30,
      bottom: 30,
      backgroundColor: colors.secondary[500],
    },
    
    awakeningLayer: {
      top: 40,
      left: 40,
      right: 40,
      bottom: 40,
      backgroundColor: colors.accent[500],
    },
    
    dreamCenter: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gold[500],
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    dreamCenterText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: colors.gray[900],
      textAlign: 'center',
    },
    
    dreamProgress: {
      marginTop: spacing[4],
      alignItems: 'center',
      width: '100%',
    },
    
    dreamProgressText: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      marginBottom: spacing[2],
    },
    
    dreamProgressBar: {
      width: '80%',
      height: 4,
      backgroundColor: colors.gray[200],
      borderRadius: 2,
      marginBottom: spacing[1],
    },
    
    dreamProgressFill: {
      height: '100%',
      backgroundColor: colors.primary[500],
      borderRadius: 2,
    },
    
    dreamProgressPercent: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary[500],
    },
    
    dreamControls: {
      padding: spacing[4],
      alignItems: 'center',
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    
    dreamButton: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      marginBottom: spacing[3],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    
    dreamingButton: {
      backgroundColor: colors.secondary[500],
    },
    
    dreamButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    },
    
    dreamDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      textAlign: 'center',
      lineHeight: typography.lineHeight.normal,
    },
    
    tabNavigation: {
      flexDirection: 'row',
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    
    tabButton: {
      flex: 1,
      paddingVertical: spacing[3],
      alignItems: 'center',
    },
    
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary[500],
    },
    
    tabIcon: {
      fontSize: 20,
      marginBottom: spacing[1],
    },
    
    tabLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[600],
    },
    
    activeTabLabel: {
      color: colors.primary[500],
      fontWeight: typography.fontWeight.semibold,
    },
    
    tabContent: {
      flex: 1,
      padding: spacing[4],
    },
    
    tabTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[4],
    },
    
    cycleCard: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    cycleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[3],
    },
    
    cycleDate: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    cyclePhase: {
      fontSize: typography.fontSize.sm,
      color: colors.primary[500],
      fontWeight: typography.fontWeight.semibold,
    },
    
    cycleMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing[3],
    },
    
    metric: {
      alignItems: 'center',
      flex: 1,
    },
    
    metricLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[600],
      marginBottom: spacing[1],
    },
    
    metricValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    cycleContent: {
      flex: 1,
    },
    
    contentTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
      marginTop: spacing[3],
    },
    
    contentItem: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      marginBottom: spacing[1],
    },
    
    resolutionText: {
      fontSize: typography.fontSize.sm,
      color: colors.accent[500],
      fontStyle: 'italic',
    },
    
    hypothesisCard: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    hypothesisHeader: {
      marginBottom: spacing[3],
    },
    
    hypothesisText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
    },
    
    hypothesisMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    
    confidenceText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary[500],
      fontWeight: typography.fontWeight.semibold,
    },
    
    categoryText: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
    },
    
    hypothesisStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    
    stat: {
      alignItems: 'center',
    },
    
    statValue: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    statLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[600],
    },
    
    heritageCard: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    heritageTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
    },
    
    heritageDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      marginBottom: spacing[3],
    },
    
    heritageList: {
      flex: 1,
    },
    
    heritageItem: {
      fontSize: typography.fontSize.sm,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
    },
    
    identityMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing[3],
    },
    
    identityMetric: {
      alignItems: 'center',
    },
    
    identityValue: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[500],
    },
    
    identityLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[600],
    },
    
    analysisCard: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    analysisTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2),
    },
    
    analysisDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      marginBottom: spacing[3],
    },
    
    efficacyMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing[3],
    },
    
    efficacyMetric: {
      alignItems: 'center',
    },
    
    efficacyValue: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[500],
    },
    
    efficacyLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[600],
    },
    
    patternList: {
      flex: 1,
    },
    
    patternItem: {
      fontSize: typography.fontSize.sm,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
    },
  });
};

export default DreamStateInterface;
