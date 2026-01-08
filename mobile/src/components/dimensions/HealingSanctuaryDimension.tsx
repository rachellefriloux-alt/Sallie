/**
 * Enhanced Healing Sanctuary Dimension - Mobile Version
 * Complete mental health and wellness management with top-tier quality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'react-native-svg-charts';

const { width, height } = Dimensions.get('window');

interface MentalHealthMetrics {
  bipolar: {
    currentPhase: 'depressive' | 'stable' | 'hypomanic' | 'creative-manic' | 'full-manic';
    stability: number;
    medication: 'stable' | 'adjusting' | 'ineffective' | 'not-taken';
    triggers: string[];
    copingStrategies: string[];
    nextAppointment: string;
    moodHistory: Array<{
      date: string;
      mood: string;
      energy: number;
      sleep: number;
      medications: number;
      stress: number;
    }>;
  };
  adhd: {
    focus: number;
    hyperfocus: 'inactive' | 'building' | 'active' | 'deep';
    medication: 'effective' | 'adjusting' | 'ineffective' | 'not-taken';
    challenges: string[];
    strengths: string[];
    strategies: string[];
    productivity: number;
  };
  ptsd: {
    stability: number;
    triggers: string[];
    coping: string[];
    therapy: 'not-started' | 'early' | 'ongoing' | 'advanced' | 'maintenance';
    progress: number;
    nightmares: 'frequent' | 'occasional' | 'reduced' | 'rare';
    flashbacks: 'frequent' | 'occasional' | 'manageable' | 'rare';
  };
  overall: {
    stress: number;
    anxiety: number;
    depression: number;
    happiness: number;
    resilience: number;
    sleep: number;
    social: number;
    purpose: number;
  };
}

interface HealingSanctuaryDimensionProps {
  navigation: any;
}

const therapies = [
  { id: 'bipolar', name: 'Bipolar Management', icon: '🌊', color: 'blue' },
  { id: 'adhd', name: 'ADHD Focus', icon: '🧠', color: 'purple' },
  { id: 'ptsd', name: 'PTSD Healing', icon: '🛡️', color: 'green' },
  { id: 'overall', name: 'Overall Wellness', icon: '💚', color: 'emerald' }
];

export function HealingSanctuaryDimension({ navigation }: HealingSanctuaryDimensionProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState('bipolar');
  const [showDetails, setShowDetails] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [mentalHealthMetrics, setMentalHealthMetrics] = useState<MentalHealthMetrics>({
    bipolar: {
      currentPhase: 'stable',
      stability: 78,
      medication: 'stable',
      triggers: ['stress', 'sleep-disruption', 'caffeine', 'seasonal-changes'],
      copingStrategies: ['routine', 'meditation', 'exercise', 'creative-expression', 'social-support'],
      nextAppointment: '2024-01-15',
      moodHistory: [
        { date: '2024-01-08', mood: 'elevated', energy: 85, sleep: 6, medications: 8, stress: 30 },
        { date: '2024-01-07', mood: 'stable', energy: 72, sleep: 8, medications: 8, stress: 25 },
        { date: '2024-01-06', mood: 'depressed', energy: 45, sleep: 10, medications: 8, stress: 40 },
        { date: '2024-01-05', mood: 'stable', energy: 68, sleep: 7, medications: 8, stress: 20 },
        { date: '2024-01-04', mood: 'hypomanic', energy: 90, sleep: 5, medications: 8, stress: 35 },
        { date: '2024-01-03', mood: 'stable', energy: 75, sleep: 8, medications: 8, stress: 22 },
        { date: '2024-01-02', mood: 'stable', energy: 70, sleep: 9, medications: 8, stress: 18 },
      ]
    },
    adhd: {
      focus: 65,
      hyperfocus: 'active',
      medication: 'effective',
      challenges: ['time-management', 'organization', 'completion', 'impulse-control'],
      strengths: ['creativity', 'problem-solving', 'hyperfocus', 'pattern-recognition', 'energy'],
      strategies: ['pomodoro', 'body-doubling', 'gamification', 'visual-aids', 'movement-breaks'],
      productivity: 82
    },
    ptsd: {
      stability: 85,
      triggers: ['loud-noises', 'crowds', 'conflict', 'anniversaries', 'certain-smells'],
      coping: ['grounding', 'breathing', 'safe-space', 'mindfulness', 'progressive-relaxation'],
      therapy: 'ongoing',
      progress: 72,
      nightmares: 'reduced',
      flashbacks: 'manageable'
    },
    overall: {
      stress: 25,
      anxiety: 30,
      depression: 20,
      happiness: 85,
      resilience: 78,
      sleep: 75,
      social: 80,
      purpose: 90
    }
  });

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const { bipolar, adhd, ptsd, overall } = mentalHealthMetrics;
    
    return {
      overallStability: Math.round(((bipolar.stability + adhd.focus + ptsd.stability) / 3)),
      medicationCompliance: [bipolar.medication, adhd.medication].filter(m => m === 'stable' || m === 'effective').length * 50,
      copingEffectiveness: Math.round((bipolar.copingStrategies.length + adhd.strategies.length + ptsd.coping.length) / 3),
      therapyProgress: ptsd.progress,
      wellnessScore: Math.round((overall.happiness + overall.resilience + overall.social + overall.purpose) / 4),
      riskLevel: overall.stress > 70 || overall.anxiety > 70 ? 'high' : overall.stress > 40 || overall.anxiety > 40 ? 'moderate' : 'low'
    };
  }, [mentalHealthMetrics]);

  // Animation effects
  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  }, []);

  // Handle therapy selection
  const handleTherapySelect = useCallback((therapyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTherapy(therapyId);
    setShowDetails(true);
  }, []);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'thriving': return '#10b981';
      case 'connected': return '#3b82f6';
      case 'vibrant': return '#8b5cf6';
      case 'growing': return '#f59e0b';
      case 'struggling': return '#f97316';
      case 'distant': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'thriving': return '🌟';
      case 'connected': return '💫';
      case 'vibrant': return '✨';
      case 'growing': return '🌱';
      case 'struggling': return '🌧';
      case 'distant': return '❄️';
      default: return '⚪';
    }
  };

  // Selected therapy data
  const selectedTherapyData = useMemo(() => {
    return therapies.find(t => t.id === selectedTherapy);
  }, [selectedTherapy]);

  // Therapy-specific metrics
  const therapyMetrics = useMemo(() => {
    return mentalHealthMetrics[selectedTherapy as keyof MentalHealthMetrics] || mentalHealthMetrics.overall;
  }, [selectedTherapy, mentalHealthMetrics]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Healing Sanctuary</Text>
          <Text style={styles.subtitle}>Mental Health & Wellness</Text>
        </View>
      </LinearGradient>

      {/* Metrics Overview */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics */}
        <Animated.View
          style={[
            styles.metricsContainer,
            {
              opacity: animationValue,
              transform: [{ translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }) }],
            },
          ]}
        >
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.overallStability}%</Text>
              <Text style={styles.metricLabel}>Avg Energy</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.wellnessScore}</Text>
              <Text style={styles.metricLabel}>Wellness</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.therapyProgress}%</Text>
              <Text style={styles.metricLabel}>Progress</Text>
            </View>
          </View>

          {/* Overall Health Bar */}
          <View style={styles.healthBarContainer}>
            <Text style={styles.healthBarLabel}>Overall Family Health</Text>
            <View style={styles.healthBarBackground}>
              <Animated.View
                style={[
                  styles.healthBarFill,
                  {
                    width: animationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, `${mentalHealthMetrics.overall.happiness}%`],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.healthBarValue}>{mentalHealthMetrics.overall.happiness}%</Text>
          </View>
        </Animated.View>

        {/* Therapy Tabs */}
        <View style={styles.therapyTabsContainer}>
          {therapies.map((therapy) => (
            <TouchableOpacity
              key={therapy.id}
              style={[
                styles.therapyTab,
                selectedTherapy === therapy.id && styles.therapyTabActive
              ]}
              onPress={() => handleTherapySelect(therapy.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.therapyIcon}>{therapy.icon}</Text>
              <Text style={[
                styles.therapyName,
                selectedTherapy === therapy.id && styles.therapyNameActive
              ]}>
                {therapy.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Therapy Details */}
        <View style={styles.therapyDetailsContainer}>
          {/* Current Phase Status */}
          {selectedTherapy === 'bipolar' && (
            <View style={styles.therapyCard}>
              <Text style={styles.cardTitle}>Current Phase</Text>
              <View style={styles.phaseContainer}>
                <Text style={styles.phaseLabel}>Phase</Text>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseText}>{mentalHealthMetrics.bipolar.currentPhase}</Text>
                </View>
              </View>
              <View style={styles.phaseContainer}>
                <Text style={styles.phaseLabel}>Stability</Text>
                <View style={styles.stabilityBar}>
                  <View style={styles.stabilityBackground}>
                    <View 
                      style={[
                        styles.stabilityFill,
                        { width: `${mentalHealthMetrics.bipolar.stability}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.stabilityValue}>{mentalHealthMetrics.bipolar.stability}%</Text>
                </View>
              </View>
              <View style={styles.phaseContainer}>
                <Text style={styles.phaseLabel}>Medication</Text>
                <View style={[
                  styles.medicationBadge,
                  { backgroundColor: mentalHealthMetrics.bipolar.medication === 'stable' ? '#10b981' : 
                                   mentalHealthMetrics.bipolar.medication === 'adjusting' ? '#f59e0b' : '#ef4444' }
                ]}>
                  <Text style={styles.medicationText}>{mentalHealthMetrics.bipolar.medication}</Text>
                </View>
              </View>
            </View>
          )}

          {/* ADHD Focus Metrics */}
          {selectedTherapy === 'adhd' && (
            <View style={styles.therapyCard}>
              <Text style={styles.cardTitle}>Focus & Productivity</Text>
              <View style={styles.focusContainer}>
                <Text style={styles.focusLabel}>Current Focus</Text>
                <View style={styles.focusBar}>
                  <View style={styles.focusBackground}>
                    <View 
                      style={[
                        styles.focusFill,
                        { width: `${mentalHealthMetrics.adhd.focus}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.focusValue}>{mentalHealthMetrics.adhd.focus}%</Text>
                </View>
              </View>
              <View style={styles.focusContainer}>
                <Text style={styles.focusLabel}>Hyperfocus</Text>
                <View style={[
                  styles.hyperfocusBadge,
                  { backgroundColor: mentalHealthMetrics.adhd.hyperfocus === 'deep' ? '#8b5cf6' :
                                   mentalHealthMetrics.adhd.hyperfocus === 'active' ? '#3b82f6' : '#6b7280' }
                ]}>
                  <Text style={styles.hyperfocusText}>{mentalHealthMetrics.adhd.hyperfocus}</Text>
                </View>
              </View>
              <View style={styles.focusContainer}>
                <Text style={styles.focusLabel}>Productivity</Text>
                <View style={styles.productivityBar}>
                  <View style={styles.productivityBackground}>
                    <View 
                      style={[
                        styles.productivityFill,
                        { width: `${mentalHealthMetrics.adhd.productivity}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.productivityValue}>{mentalHealthMetrics.adhd.productivity}%</Text>
                </View>
              </View>
            </View>
          )}

          {/* PTSD Progress */}
          {selectedTherapy === 'ptsd' && (
            <View style={styles.therapyCard}>
              <Text style={styles.cardTitle}>Healing Progress</Text>
              <View style={styles.ptsdContainer}>
                <Text style={styles.ptsdLabel}>Stability</Text>
                <View style={styles.ptsdBar}>
                  <View style={styles.ptsdBackground}>
                    <View 
                      style={[
                        styles.ptsdFill,
                        { width: `${mentalHealthMetrics.ptsd.stability}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.ptsdValue}>{mentalHealthMetrics.ptsd.stability}%</Text>
                </View>
              </View>
              <View style={styles.ptsdContainer}>
                <Text style={styles.ptsdLabel}>Therapy Progress</Text>
                <View style={styles.therapyBar}>
                  <View style={styles.therapyBackground}>
                    <View 
                      style={[
                        styles.therapyFill,
                        { width: `${mentalHealthMetrics.ptsd.progress}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.therapyValue}>{mentalHealthMetrics.ptsd.progress}%</Text>
                </View>
              </View>
              <View style={styles.ptsdContainer}>
                <Text style={styles.ptsdLabel}>Nightmares</Text>
                <View style={[
                  styles.nightmaresBadge,
                  { backgroundColor: mentalHealthMetrics.ptsd.nightmares === 'rare' ? '#10b981' :
                                   mentalHealthMetrics.ptsd.nightmares === 'reduced' ? '#3b82f6' : '#f59e0b' }
                ]}>
                  <Text style={styles.nightmaresText}>{mentalHealthMetrics.ptsd.nightmares}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Overall Wellness */}
          {selectedTherapy === 'overall' && (
            <View style={styles.therapyCard}>
              <Text style={styles.cardTitle}>Overall Wellness Metrics</Text>
              <View style={styles.wellnessGrid}>
                {[
                  { label: 'Stress', value: mentalHealthMetrics.overall.stress, color: '#ef4444' },
                  { label: 'Anxiety', value: mentalHealthMetrics.overall.anxiety, color: '#f59e0b' },
                  { label: 'Depression', value: mentalHealthMetrics.overall.depression, color: '#6b7280' },
                  { label: 'Happiness', value: mentalHealthMetrics.overall.happiness, color: '#10b981' },
                  { label: 'Resilience', value: mentalHealthMetrics.overall.resilience, color: '#3b82f6' },
                  { label: 'Sleep', value: mentalHealthMetrics.overall.sleep, color: '#8b5cf6' },
                  { label: 'Social', value: mentalHealthMetrics.overall.social, color: '#ec4899' },
                  { label: 'Purpose', value: mentalHealthMetrics.overall.purpose, color: '#f97316' },
                ].map((metric, index) => (
                  <View key={index} style={styles.wellnessMetric}>
                    <Text style={styles.wellnessLabel}>{metric.label}</Text>
                    <View style={styles.wellnessBar}>
                      <View style={styles.wellnessBackground}>
                        <View 
                          style={[
                            styles.wellnessFill,
                            { width: `${metric.value}%`, backgroundColor: metric.color }
                          ]}
                        />
                      </View>
                      <Text style={styles.wellnessValue}>{metric.value}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Coping Strategies */}
          <View style={styles.therapyCard}>
            <Text style={styles.cardTitle}>Coping Strategies</Text>
            <View style={styles.strategiesGrid}>
              {(selectedTherapy === 'bipolar' ? mentalHealthMetrics.bipolar.copingStrategies :
                selectedTherapy === 'adhd' ? mentalHealthMetrics.adhd.strategies :
                selectedTherapy === 'ptsd' ? mentalHealthMetrics.ptsd.coping :
                []).map((strategy, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.strategyItem}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.strategyCheck}>✓</Text>
                  <Text style={styles.strategyText}>{strategy}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>Call Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🧘</Text>
              <Text style={styles.actionLabel}>Start Meditation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionLabel}>Log Mood</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionLabel}>Schedule Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  metricsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  healthBarContainer: {
    marginTop: 10,
  },
  healthBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  healthBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  healthBarValue: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  therapyTabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  therapyTab: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  therapyTabActive: {
    backgroundColor: '#8b5cf6',
  },
  therapyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  therapyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  therapyNameActive: {
    color: '#ffffff',
  },
  therapyDetailsContainer: {
    marginBottom: 20,
  },
  therapyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  phaseContainer: {
    marginBottom: 16,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  phaseBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  phaseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  stabilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stabilityBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  stabilityFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  stabilityValue: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  medicationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  medicationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  focusContainer: {
    marginBottom: 16,
  },
  focusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  focusBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  focusFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  focusValue: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  hyperfocusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  hyperfocusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  productivityBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productivityBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  productivityFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  productivityValue: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  ptsdContainer: {
    marginBottom: 16,
  },
  ptsdLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  ptsdBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ptsdBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  ptsdFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  ptsdValue: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  therapyBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  therapyBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  therapyFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  therapyValue: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  nightmaresBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  nightmaresText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  wellnessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wellnessMetric: {
    width: '48%',
    marginBottom: 16,
  },
  wellnessLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  wellnessBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wellnessBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  wellnessFill: {
    height: '100%',
    borderRadius: 3,
  },
  wellnessValue: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  strategiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  strategyItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  strategyCheck: {
    fontSize: 16,
    color: '#10b981',
    marginRight: 8,
  },
  strategyText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },
});
