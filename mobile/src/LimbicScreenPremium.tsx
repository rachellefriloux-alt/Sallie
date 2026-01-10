import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate, withRepeat, withSequence } from 'react-native-reanimated';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
}

interface LimbicHistory {
  timestamp: Date;
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  trigger: string;
}

interface PremiumFeatures {
  enhancedVisualizations: boolean;
  advancedAnalytics: boolean;
  personalizedGuidance: boolean;
  realTimeFeedback: boolean;
  predictiveInsights: boolean;
}

const { width, height } = Dimensions.get('window');

const LimbicScreenPremium: React.FC = () => {
  const [limbicState, setLimbicState] = useState<LimbicState>({
    trust: 0.5,
    warmth: 0.5,
    arousal: 0.5,
    valence: 0.5,
    posture: 'Companion'
  });
  
  const [limbicHistory, setLimbicHistory] = useState<LimbicHistory[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures>({
    enhancedVisualizations: true,
    advancedAnalytics: true,
    personalizedGuidance: true,
    realTimeFeedback: true,
    predictiveInsights: true
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  
  // Reanimated values
  const trustAnim = useSharedValue(0.5);
  const warmthAnim = useSharedValue(0.5);
  const arousalAnim = useSharedValue(0.5);
  const valenceAnim = useSharedValue(0.5);
  const pulseValue = useSharedValue(1);

  const timeRanges = ['15m', '1h', '6h', '24h', '7d'];
  const postures = ['Companion', 'Co-Pilot', 'Peer', 'Expert', 'Surrogate'];

  useEffect(() => {
    // Initial animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Continuous rotation for central indicator
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    // Continuous pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Connect to WebSocket
    connectWebSocket();
    
    // Generate mock history data
    generateMockHistory();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://192.168.1.47:8742/ws/limbic-state');
    
    ws.onopen = () => {
      console.log('Limbic screen WebSocket connected');
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'limbic_update') {
        updateLimbicState(data.state);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnection(null);
    };
  };

  const generateMockHistory = () => {
    const mockData: LimbicHistory[] = [];
    const now = new Date();
    
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now.getTime() - i * 60000); // 1 minute intervals
      mockData.push({
        timestamp,
        trust: 0.3 + Math.random() * 0.4,
        warmth: 0.4 + Math.random() * 0.3,
        arousal: 0.2 + Math.random() * 0.6,
        valence: 0.35 + Math.random() * 0.3,
        posture: postures[Math.floor(Math.random() * postures.length)],
        trigger: ['User Interaction', 'System Event', 'Voice Command', 'Autonomous Action'][Math.floor(Math.random() * 4)]
      });
    }
    
    setLimbicHistory(mockData.reverse());
  };

  const updateLimbicState = (newState: LimbicState) => {
    setLimbicState(newState);
    
    // Update animations
    trustAnim.value = withSpring(newState.trust);
    warmthAnim.value = withSpring(newState.warmth);
    arousalAnim.value = withSpring(newState.arousal);
    valenceAnim.value = withSpring(newState.valence);
    
    // Add to history
    const historyEntry: LimbicHistory = {
      timestamp: new Date(),
      ...newState,
      trigger: 'Real-time Update'
    };
    
    setLimbicHistory(prev => [...prev.slice(-49), historyEntry]);
    
    // Haptic feedback for significant changes
    const significantChange = Math.abs(newState.trust - limbicState.trust) > 0.1 ||
                            Math.abs(newState.warmth - limbicState.warmth) > 0.1;
    if (significantChange) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const toggleRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording session
      console.log('Started limbic state recording');
    } else {
      // Stop recording session
      console.log('Stopped limbic state recording');
    }
  };

  const exportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log('Exporting limbic state data...');
    // Implement data export functionality
  };

  // Animated styles
  const trustStyle = useAnimatedStyle(() => ({
    width: `${trustAnim.value * 100}%`,
  }));

  const warmthStyle = useAnimatedStyle(() => ({
    width: `${warmthAnim.value * 100}%`,
  }));

  const arousalStyle = useAnimatedStyle(() => ({
    width: `${arousalAnim.value * 100}%`,
  }));

  const valenceStyle = useAnimatedStyle(() => ({
    width: `${valenceAnim.value * 100}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnim.value * 360}deg` }],
  }));

  const renderHistoryItem = ({ item }: { item: LimbicHistory }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyTimestamp}>
        <Text style={styles.historyTimeText}>
          {item.timestamp.toLocaleTimeString()}
        </Text>
        <Text style={styles.historyTriggerText}>{item.trigger}</Text>
      </View>
      <View style={styles.historyValues}>
        <View style={styles.miniGauge}>
          <View style={[styles.miniGaugeFill, { width: `${item.trust * 100}%`, backgroundColor: '#9333ea' }]} />
        </View>
        <View style={styles.miniGauge}>
          <View style={[styles.miniGaugeFill, { width: `${item.warmth * 100}%`, backgroundColor: '#ec4899' }]} />
        </View>
        <View style={styles.miniGauge}>
          <View style={[styles.miniGaugeFill, { width: `${item.arousal * 100}%`, backgroundColor: '#f59e0b' }]} />
        </View>
        <View style={styles.miniGauge}>
          <View style={[styles.miniGaugeFill, { width: `${item.valence * 100}%`, backgroundColor: '#10b981' }]} />
        </View>
      </View>
      <Text style={styles.historyPostureText}>{item.posture}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#581c87', '#1e1b4b']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerContent}>
            <Ionicons name="pulse" size={32} color="#fbbf24" />
            <Text style={styles.headerTitle}>Limbic State Monitor</Text>
            <Ionicons name="pulse" size={32} color="#fbbf24" />
          </View>
          <Text style={styles.headerSubtitle}>Advanced Neural Interface Analytics</Text>
        </Animated.View>

        {/* Central Limbic Visualization */}
        <Animated.View style={[styles.centralViz, { opacity: fadeAnim }]}>
          <BlurView intensity={20} style={styles.centralBlur}>
            <View style={styles.centralCircle}>
              <Animated.View style={[styles.pulsingCircle, pulseStyle]}>
                <LinearGradient
                  colors={['#9333ea', '#ec4899', '#f59e0b', '#10b981']}
                  style={styles.gradientCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>
              <Animated.View style={[styles.rotatingRing, rotationStyle]}>
                <View style={styles.ringSegment} />
                <View style={styles.ringSegment} />
                <View style={styles.ringSegment} />
                <View style={styles.ringSegment} />
              </Animated.View>
              <View style={styles.centerContent}>
                <Text style={styles.centerValue}>{Math.round((limbicState.trust + limbicState.warmth + limbicState.arousal + limbicState.valence) / 4 * 100)}%</Text>
                <Text style={styles.centerLabel}>Overall State</Text>
                <Text style={styles.centerPosture}>{limbicState.posture}</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Limbic Gauges */}
        <Animated.View style={[styles.gaugesContainer, { opacity: fadeAnim }]}>
          <BlurView intensity={20} style={styles.gaugesBlur}>
            <Text style={styles.sectionTitle}>Limbic Variables</Text>
            
            <View style={styles.gaugeGrid}>
              <GaugeBar label="Trust" value={trustAnim} color="#9333ea" style={trustStyle} />
              <GaugeBar label="Warmth" value={warmthAnim} color="#ec4899" style={warmthStyle} />
              <GaugeBar label="Arousal" value={arousalAnim} color="#f59e0b" style={arousalStyle} />
              <GaugeBar label="Valence" value={valenceAnim} color="#10b981" style={valenceStyle} />
            </View>
          </BlurView>
        </Animated.View>

        {/* Analytics Panel */}
        <Animated.View style={[styles.analyticsContainer, { opacity: fadeAnim }]}>
          <BlurView intensity={20} style={styles.analyticsBlur}>
            <View style={styles.analyticsHeader}>
              <Text style={styles.sectionTitle}>Advanced Analytics</Text>
              <TouchableOpacity onPress={() => setShowAnalytics(!showAnalytics)}>
                <Ionicons name={showAnalytics ? "chevron-up" : "chevron-down"} size={24} color="#e9d5ff" />
              </TouchableOpacity>
            </View>

            {showAnalytics && (
              <View style={styles.analyticsContent}>
                {/* Time Range Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangeContainer}>
                  {timeRanges.map(range => (
                    <TouchableOpacity
                      key={range}
                      onPress={() => setSelectedTimeRange(range)}
                      style={[
                        styles.timeRangeButton,
                        selectedTimeRange === range && styles.selectedTimeRange
                      ]}
                    >
                      <Text style={[
                        styles.timeRangeText,
                        selectedTimeRange === range && styles.selectedTimeRangeText
                      ]}>
                        {range}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Statistics */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{limbicHistory.length}</Text>
                    <Text style={styles.statLabel}>Data Points</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.round(limbicHistory.reduce((acc, h) => acc + h.trust, 0) / limbicHistory.length * 100)}%
                    </Text>
                    <Text style={styles.statLabel}>Avg Trust</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {limbicHistory.filter(h => h.posture === limbicState.posture).length}
                    </Text>
                    <Text style={styles.statLabel}>Current Posture Count</Text>
                  </View>
                </View>
              </View>
            )}
          </BlurView>
        </Animated.View>

        {/* History Timeline */}
        <Animated.View style={[styles.historyContainer, { opacity: fadeAnim }]}>
          <BlurView intensity={20} style={styles.historyBlur}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>State History</Text>
              <View style={styles.historyControls}>
                <TouchableOpacity onPress={toggleRecording} style={styles.recordButton}>
                  <Ionicons 
                    name={isRecording ? "stop" : "radio"} 
                    size={20} 
                    color={isRecording ? "#ef4444" : "#e9d5ff"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={exportData} style={styles.exportButton}>
                  <Ionicons name="download" size={20} color="#e9d5ff" />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={limbicHistory.slice(-10)}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
            />
          </BlurView>
        </Animated.View>

        {/* Premium Features */}
        <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
          <BlurView intensity={20} style={styles.featuresBlur}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            
            <View style={styles.featuresGrid}>
              {Object.entries(premiumFeatures).map(([feature, enabled]) => (
                <View key={feature} style={styles.featureItem}>
                  <Text style={styles.featureText}>
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <View style={[styles.featureIndicator, { backgroundColor: enabled ? '#10b981' : '#6b7280' }]} />
                </View>
              ))}
            </View>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Gauge Bar Component
const GaugeBar: React.FC<{
  label: string;
  value: any;
  color: string;
  style: any;
}> = ({ label, value, color, style }) => {
  return (
    <View style={styles.gaugeBar}>
      <View style={styles.gaugeLabel}>
        <Text style={styles.gaugeLabelText}>{label}</Text>
        <Text style={styles.gaugeValueText}>{Math.round(value.value * 100)}%</Text>
      </View>
      <View style={styles.gaugeTrack}>
        <Animated.View style={[styles.gaugeFill, style]} />
      </View>
      <View style={styles.gaugeMarkers}>
        <View style={[styles.gaugeMarker, { left: '25%' }]} />
        <View style={[styles.gaugeMarker, { left: '50%' }]} />
        <View style={[styles.gaugeMarker, { left: '75%' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    textAlign: 'center',
  },
  centralViz: {
    marginVertical: 24,
  },
  centralBlur: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  centralCircle: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulsingCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  gradientCircle: {
    flex: 1,
    borderRadius: 90,
    opacity: 0.3,
  },
  rotatingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringSegment: {
    position: 'absolute',
    width: 4,
    height: 20,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
  centerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  centerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  centerLabel: {
    fontSize: 14,
    color: '#e9d5ff',
    marginTop: 4,
  },
  centerPosture: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginTop: 8,
  },
  gaugesContainer: {
    marginBottom: 24,
  },
  gaugesBlur: {
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  gaugeGrid: {
    gap: 16,
  },
  gaugeBar: {
    marginBottom: 20,
  },
  gaugeLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gaugeLabelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e9d5ff',
  },
  gaugeValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  gaugeTrack: {
    height: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 6,
  },
  gaugeMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    flexDirection: 'row',
  },
  gaugeMarker: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  analyticsContainer: {
    marginBottom: 24,
  },
  analyticsBlur: {
    borderRadius: 16,
    padding: 20,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsContent: {
    gap: 16,
  },
  timeRangeContainer: {
    marginBottom: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    marginRight: 8,
  },
  selectedTimeRange: {
    backgroundColor: '#9333ea',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  selectedTimeRangeText: {
    color: 'white',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#e9d5ff',
    marginTop: 4,
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyBlur: {
    borderRadius: 16,
    padding: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyControls: {
    flexDirection: 'row',
    gap: 12,
  },
  recordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 51, 234, 0.2)',
  },
  historyTimestamp: {
    flex: 1,
  },
  historyTimeText: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  historyTriggerText: {
    fontSize: 10,
    color: '#a78bfa',
    marginTop: 2,
  },
  historyValues: {
    flex: 2,
    flexDirection: 'row',
    gap: 4,
  },
  miniGauge: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniGaugeFill: {
    height: '100%',
  },
  historyPostureText: {
    fontSize: 12,
    color: '#fbbf24',
    marginLeft: 8,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresBlur: {
    borderRadius: 16,
    padding: 20,
  },
  featuresGrid: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#e9d5ff',
    flex: 1,
  },
  featureIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default LimbicScreenPremium;
