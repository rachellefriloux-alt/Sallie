import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Heart, 
  Brain, 
  Zap, 
  Smile, 
  Compass, 
  Lightbulb, 
  Sparkles, 
  Crown, 
  Laugh,
  TrendingUp,
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  BarChart3,
  Calendar,
  Search,
  Filter
} from 'lucide-react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
}

interface LimbicGaugesPremiumProps {
  state: LimbicState;
  animated?: boolean;
  compact?: boolean;
  showAdvanced?: boolean;
}

interface GaugeConfig {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  gradient: string[];
  description: string;
  threshold?: {
    low: number;
    medium: number;
    high: number;
  };
}

export const LimbicGaugesPremium: React.FC<LimbicGaugesPremiumProps> = ({ 
  state, 
  animated = true, 
  compact = false,
  showAdvanced = true 
}) => {
  const [hoveredGauge, setHoveredGauge] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (animated) {
      // Pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      // Glow animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 })
        ),
        -1,
        true
      );

      const interval = setInterval(() => {
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 1000);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  const coreGauges: GaugeConfig[] = useMemo(() => [
    {
      label: 'Trust',
      value: state.trust,
      color: '#8B5CF6',
      icon: <Heart size={16} color="#8B5CF6" />,
      gradient: ['#8B5CF6', '#A855F7', '#6366F1'],
      description: 'Foundation of our relationship',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Warmth',
      value: state.warmth,
      color: '#06B6D4',
      icon: <Zap size={16} color="#06B6D4" />,
      gradient: ['#06B6D4', '#3B82F6', '#6366F1'],
      description: 'Emotional connection and comfort',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Energy',
      value: state.arousal,
      color: '#F59E0B',
      icon: <Brain size={16} color="#F59E0B" />,
      gradient: ['#F59E0B', '#F97316', '#EF4444'],
      description: 'Cognitive activation and engagement',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Mood',
      value: (state.valence + 1) / 2,
      color: '#10B981',
      icon: <Smile size={16} color="#10B981" />,
      gradient: ['#10B981', '#22C55E', '#14B8A6'],
      description: 'Current emotional state',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    }
  ], [state.trust, state.warmth, state.arousal, state.valence]);

  const advancedGauges: GaugeConfig[] = useMemo(() => [
    {
      label: 'Empathy',
      value: state.empathy || 0,
      color: '#EC4899',
      icon: <Heart size={16} color="#EC4899" />,
      gradient: ['#EC4899', '#F43F5E', '#EF4444'],
      description: 'Understanding and sharing feelings',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Intuition',
      value: state.intuition || 0,
      color: '#A855F7',
      icon: <Compass size={16} color="#A855F7" />,
      gradient: ['#A855F7', '#8B5CF6', '#6366F1'],
      description: 'Instinctive understanding',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Creativity',
      value: state.creativity || 0,
      color: '#EAB308',
      icon: <Lightbulb size={16} color="#EAB308" />,
      gradient: ['#EAB308', '#F59E0B', '#F97316'],
      description: 'Creative problem-solving',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Wisdom',
      value: state.wisdom || 0,
      color: '#6366F1',
      icon: <Crown size={16} color="#6366F1" />,
      gradient: ['#6366F1', '#4F46E5', '#8B5CF6'],
      description: 'Deep understanding and judgment',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Humor',
      value: state.humor || 0,
      color: '#22C55E',
      icon: <Laugh size={16} color="#22C55E" />,
      gradient: ['#22C55E', '#10B981', '#14B8A6'],
      description: 'Playful interaction and wit',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    }
  ], [state.empathy, state.intuition, state.creativity, state.wisdom, state.humor]);

  const getStatusLevel = (value: number, threshold?: { low: number; medium: number; high: number }) => {
    if (!threshold) return 'medium';
    if (value >= threshold.high) return 'high';
    if (value >= threshold.medium) return 'medium';
    return 'low';
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'high': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'low': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderGauge = (gauge: GaugeConfig, index: number) => {
    const statusLevel = getStatusLevel(gauge.value, gauge.threshold);
    const percentage = gauge.value * 100;
    const animatedWidth = useSharedValue(0);
    
    // Animate progress bar
    useEffect(() => {
      animatedWidth.value = withTiming(gauge.value, { duration: 800 });
    }, [gauge.value]);

    const progressStyle = useAnimatedStyle(() => ({
      width: `${animatedWidth.value * 100}%`,
    }));

    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
      opacity: glowOpacity.value,
    }));

    return (
      <BlurView key={gauge.label} intensity={20} tint="dark" style={styles.gaugeContainer}>
        <View style={styles.gaugeHeader}>
          <View style={styles.gaugeTitleContainer}>
            <Animated.View style={pulseStyle}>
              {gauge.icon}
            </Animated.View>
            <Text style={[styles.gaugeLabel, { color: gauge.color }]}>
              {gauge.label}
            </Text>
          </View>
          <View style={styles.gaugeValueContainer}>
            <Text style={styles.gaugeValue}>
              {percentage.toFixed(0)}%
            </Text>
            <Animated.View 
              style={[
                styles.statusIndicator, 
                { backgroundColor: getStatusColor(statusLevel) },
                pulseStyle
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View 
              style={[
                styles.progressFill,
                progressStyle
              ]}
            >
              <LinearGradient
                colors={gauge.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientFill}
              />
            </Animated.View>
          </View>
        </View>

        {hoveredGauge === gauge.label && (
          <View style={styles.descriptionTooltip}>
            <Text style={styles.descriptionText}>
              {gauge.description}
            </Text>
          </View>
        )}
      </BlurView>
    );
  };

  const postureColors: Record<string, string> = {
    'COMPANION': '#EC4899',
    'CO-PILOT': '#3B82F6', 
    'PEER': '#10B981',
    'EXPERT': '#8B5CF6',
    'SURROGATE': '#F59E0B',
    'PARTNER': '#EF4444'
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Sparkles size={20} color="#EAB308" />
          <Text style={styles.headerTitle}>Emotional State</Text>
          <Sparkles size={20} color="#EAB308" />
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time psychological monitoring
        </Text>
      </View>

      {/* Core Gauges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Dimensions</Text>
        <View style={styles.gaugesGrid}>
          {coreGauges.map((gauge, index) => renderGauge(gauge, index))}
        </View>
      </View>

      {/* Current Posture */}
      <BlurView intensity={30} tint="dark" style={styles.postureContainer}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.postureGradient}
        >
          <Text style={styles.postureLabel}>Current Mode</Text>
          <Animated.Text 
            style={[
              styles.postureValue,
              { color: postureColors[state.posture] || '#8B5CF6' },
              useAnimatedStyle(() => ({
                transform: [{ scale: pulseScale.value }],
                textShadowColor: postureColors[state.posture] || '#8B5CF6',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: pulseAnimation ? 20 : 0,
              }))
            ]}
          >
            {state.posture || 'PEER'}
          </Animated.Text>
          <Text style={styles.postureDescription}>
            Behavioral configuration
          </Text>
        </LinearGradient>
      </BlurView>

      {/* Advanced Capabilities */}
      {showAdvanced && (
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            style={styles.advancedHeader}
          >
            <Text style={styles.sectionTitle}>Advanced Capabilities</Text>
            {showAdvancedMetrics ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
          </TouchableOpacity>
          
          {showAdvancedMetrics && (
            <View style={styles.gaugesGrid}>
              {advancedGauges.filter(gauge => gauge.value > 0).map((gauge, index) => renderGauge(gauge, index + coreGauges.length))}
            </View>
          )}
        </View>
      )}

      {/* System Status */}
      <View style={styles.statusBar}>
        <View style={styles.statusIndicatorContainer}>
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statusText}>System Active</Text>
        </View>
        <Text style={styles.statusSeparator}>•</Text>
        <Text style={styles.statusText}>Real-time Updates</Text>
        <Text style={styles.statusSeparator}>•</Text>
        <Text style={styles.statusText}>Premium Analytics</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  advancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gaugesGrid: {
    gap: 12,
  },
  gaugeContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gaugeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  gaugeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  gradientFill: {
    flex: 1,
  },
  descriptionTooltip: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    zIndex: 10,
  },
  descriptionText: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  postureContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 24,
    overflow: 'hidden',
  },
  postureGradient: {
    padding: 20,
    alignItems: 'center',
  },
  postureLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postureValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postureDescription: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 12,
  },
});