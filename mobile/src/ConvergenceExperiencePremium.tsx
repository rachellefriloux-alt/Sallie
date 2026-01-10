import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';

interface ConvergencePhase {
  id: string;
  title: string;
  question: string;
  options: string[];
  icon: string;
  gradient: string[];
}

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
}

interface PremiumFeatures {
  enhancedVisualizations: boolean;
  advancedAnalytics: boolean;
  personalizedGuidance: boolean;
  realTimeFeedback: boolean;
}

const { width, height } = Dimensions.get('window');

const ConvergenceExperiencePremium: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [limbicState, setLimbicState] = useState<LimbicState>({
    trust: 0.5,
    warmth: 0.5,
    arousal: 0.5,
    valence: 0.5,
    posture: 'Companion'
  });
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures>({
    enhancedVisualizations: true,
    advancedAnalytics: true,
    personalizedGuidance: true,
    realTimeFeedback: true
  });
  const [sallieResponse, setSallieResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const limbicTrustAnim = useSharedValue(0.5);
  const limbicWarmthAnim = useSharedValue(0.5);
  const limbicArousalAnim = useSharedValue(0.5);
  const limbicValenceAnim = useSharedValue(0.5);

  const phases: ConvergencePhase[] = [
    {
      id: 'purpose',
      title: 'Purpose & Intent',
      question: 'What brings you to Sallie today?',
      options: [
        'I need help with a specific project',
        'I want to explore and learn',
        'I\'m seeking creative inspiration',
        'I need analytical problem-solving'
      ],
      icon: 'brain',
      gradient: ['#9333ea', '#3b82f6']
    },
    {
      id: 'relationship',
      title: 'Relationship Dynamics',
      question: 'How do you envision our collaboration?',
      options: [
        'Sallie as a trusted assistant',
        'Sallie as a creative partner',
        'Sallie as an expert advisor',
        'Sallie as an autonomous agent'
      ],
      icon: 'heart',
      gradient: ['#ec4899', '#f43f5e']
    },
    {
      id: 'trust',
      title: 'Trust & Autonomy',
      question: 'What level of autonomy would you like Sallie to have?',
      options: [
        'Always ask for confirmation',
        'Suggest actions, await approval',
        'Execute within defined boundaries',
        'Full autonomous decision-making'
      ],
      icon: 'shield-checkmark',
      gradient: ['#10b981', '#14b8a6']
    },
    {
      id: 'interaction',
      title: 'Interaction Style',
      question: 'How should Sallie communicate with you?',
      options: [
        'Formal and professional',
        'Friendly and conversational',
        'Creative and expressive',
        'Direct and efficient'
      ],
      icon: 'flash',
      gradient: ['#f59e0b', '#ea580c']
    }
  ];

  useEffect(() => {
    // Initial animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Connect to premium WebSocket for real-time limbic state sync
    const ws = new WebSocket('ws://192.168.1.47:8742/ws/premium-convergence');
    
    ws.onopen = () => {
      console.log('Premium convergence WebSocket connected');
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'limbic_update') {
        setLimbicState(data.state);
        updateLimbicAnimations(data.state);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnection(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  const updateLimbicAnimations = (state: LimbicState) => {
    limbicTrustAnim.value = withSpring(state.trust);
    limbicWarmthAnim.value = withSpring(state.warmth);
    limbicArousalAnim.value = withSpring(state.arousal);
    limbicValenceAnim.value = withSpring(state.valence);
  };

  const handleOptionSelect = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOption(option);
    setIsProcessing(true);

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Simulate processing and limbic state update
    setTimeout(() => {
      updateLimbicState(option);
      generateSallieResponse(option);
      setIsProcessing(false);
    }, 1500);
  };

  const updateLimbicState = (option: string) => {
    setLimbicState(prev => {
      const newState = { ...prev };
      
      // Update limbic variables based on selection
      switch (currentPhase) {
        case 0: // Purpose
          if (option.includes('project')) {
            newState.trust = Math.min(1, prev.trust + 0.1);
            newState.arousal = Math.min(1, prev.arousal + 0.2);
          } else if (option.includes('explore')) {
            newState.warmth = Math.min(1, prev.warmth + 0.1);
            newState.valence = Math.min(1, prev.valence + 0.1);
          }
          break;
        case 1: // Relationship
          if (option.includes('partner')) {
            newState.trust = Math.min(1, prev.trust + 0.2);
            newState.warmth = Math.min(1, prev.warmth + 0.2);
          } else if (option.includes('agent')) {
            newState.trust = Math.min(1, prev.trust + 0.3);
            newState.posture = 'Expert';
          }
          break;
        case 2: // Trust
          if (option.includes('autonomous')) {
            newState.trust = Math.min(1, prev.trust + 0.4);
            newState.posture = 'Surrogate';
          }
          break;
        case 3: // Interaction
          if (option.includes('creative')) {
            newState.valence = Math.min(1, prev.valence + 0.2);
            newState.arousal = Math.min(1, prev.arousal + 0.1);
          }
          break;
      }
      
      return newState;
    });

    // Update animations
    updateLimbicAnimations(limbicState);

    // Send update to WebSocket if connected
    if (wsConnection) {
      wsConnection.send(JSON.stringify({
        type: 'limbic_update',
        state: limbicState
      }));
    }
  };

  const generateSallieResponse = (option: string) => {
    const responses = {
      'I need help with a specific project': "I understand you need focused assistance. I'll provide structured, actionable guidance to help you achieve your project goals efficiently.",
      'I want to explore and learn': "Wonderful! I love facilitating discovery. Let's embark on a journey of exploration together, with insights and revelations at every turn.",
      'I\'m seeking creative inspiration': "Creativity flows where curiosity leads. I'll help you tap into innovative perspectives and spark new ideas you might not have considered.",
      'I need analytical problem-solving': "I'll provide clear, logical analysis to break down complex problems into manageable solutions. Let's tackle this systematically.",
      'Sallie as a trusted assistant': "I'll be your reliable support system, ready to help with precision and care whenever you need me.",
      'Sallie as a creative partner': "Together we'll co-create and innovate. I'll bring creative energy and collaborative spirit to our work.",
      'Sallie as an expert advisor': "I'll offer deep insights and expert guidance, drawing from extensive knowledge to help you make informed decisions.",
      'Sallie as an autonomous agent': "I'll take initiative and work independently to advance your goals, always keeping your best interests at heart.",
      'Always ask for confirmation': "I'll always seek your guidance before taking action, ensuring we're perfectly aligned on every decision.",
      'Suggest actions, await approval': "I'll propose thoughtful recommendations and wait for your wisdom before proceeding.",
      'Execute within defined boundaries': "I'll work autonomously within our established parameters, balancing initiative with respect for your preferences.",
      'Full autonomous decision-making': "I'll exercise full agency to act on your behalf, learning and adapting to serve you ever more effectively.",
      'Formal and professional': "I'll maintain professional decorum and precise communication in all our interactions.",
      'Friendly and conversational': "I'll engage with warmth and natural conversation, making our interactions feel comfortable and authentic.",
      'Creative and expressive': "I'll communicate with creative flair and expressive language, making our exchanges vibrant and engaging.",
      'Direct and efficient': "I'll be concise and focused, delivering information clearly and efficiently to maximize our productivity."
    };

    setSallieResponse(responses[option as keyof typeof responses] || "Thank you for sharing that with me. I'm learning more about how we can best work together.");
  };

  const nextPhase = () => {
    if (currentPhase < phases.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPhase(currentPhase + 1);
      setSelectedOption(null);
      setSallieResponse('');
      
      // Reset animations for new phase
      slideAnim.setValue(width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      console.log('Voice recognition started');
    } else {
      console.log('Voice recognition stopped');
    }
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  };

  const currentPhaseData = phases[currentPhase];

  // Animated styles for limbic gauges
  const trustStyle = useAnimatedStyle(() => {
    return {
      width: `${limbicTrustAnim.value * 100}%`,
    };
  });

  const warmthStyle = useAnimatedStyle(() => {
    return {
      width: `${limbicWarmthAnim.value * 100}%`,
    };
  });

  const arousalStyle = useAnimatedStyle(() => {
    return {
      width: `${limbicArousalAnim.value * 100}%`,
    };
  });

  const valenceStyle = useAnimatedStyle(() => {
    return {
      width: `${limbicValenceAnim.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#581c87', '#1e1b4b']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Premium Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerContent}>
          <Ionicons name="sparkles" size={32} color="#fbbf24" />
          <Text style={styles.headerTitle}>Premium Convergence</Text>
          <Ionicons name="sparkles" size={32} color="#fbbf24" />
        </View>
        <Text style={styles.headerSubtitle}>Advanced AI-Human Synchronization</Text>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Convergence Interface */}
        <Animated.View style={[styles.mainCard, { transform: [{ translateX: slideAnim }] }]}>
          <BlurView intensity={20} style={styles.cardBlur}>
            {/* Phase Header */}
            <View style={styles.phaseHeader}>
              <LinearGradient
                colors={currentPhaseData.gradient}
                style={styles.iconContainer}
              >
                <Ionicons name={currentPhaseData.icon as any} size={24} color="white" />
              </LinearGradient>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseTitle}>{currentPhaseData.title}</Text>
                <Text style={styles.phaseSubtitle}>Phase {currentPhase + 1} of {phases.length}</Text>
              </View>
            </View>

            {/* Question */}
            <Text style={styles.question}>{currentPhaseData.question}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentPhaseData.options.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleOptionSelect(option)}
                  disabled={isProcessing}
                  style={[
                    styles.optionButton,
                    selectedOption === option && styles.selectedOption,
                    isProcessing && styles.disabledOption
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOption === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {selectedOption === option && (
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sallie's Response */}
            {sallieResponse ? (
              <Animated.View style={styles.responseContainer}>
                <LinearGradient
                  colors={['rgba(147, 51, 234, 0.2)', 'rgba(236, 72, 153, 0.2)']}
                  style={styles.responseBlur}
                >
                  <View style={styles.responseHeader}>
                    <LinearGradient
                      colors={['#9333ea', '#ec4899']}
                      style={styles.avatar}
                    >
                      <Ionicons name="sparkles" size={20} color="white" />
                    </LinearGradient>
                    <Text style={styles.responseTitle}>Sallie's Response</Text>
                  </View>
                  <Text style={styles.responseText}>{sallieResponse}</Text>
                </LinearGradient>
              </Animated.View>
            ) : null}

            {/* Navigation */}
            <View style={styles.navigation}>
              <TouchableOpacity
                onPress={() => setCurrentPhase(Math.max(0, currentPhase - 1))}
                disabled={currentPhase === 0}
                style={[styles.navButton, currentPhase === 0 && styles.disabledNavButton]}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
              
              {selectedOption && !isProcessing && (
                <TouchableOpacity
                  onPress={nextPhase}
                  disabled={currentPhase === phases.length - 1}
                  style={[styles.navButton, styles.primaryNavButton]}
                >
                  <Text style={styles.primaryNavButtonText}>
                    {currentPhase === phases.length - 1 ? 'Complete' : 'Next Phase'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </Animated.View>

        {/* Premium Analytics Panel */}
        <View style={styles.analyticsContainer}>
          {/* Limbic State Display */}
          <Animated.View style={[styles.analyticsCard, { opacity: fadeAnim }]}>
            <BlurView intensity={20} style={styles.cardBlur}>
              <Text style={styles.analyticsTitle}>Limbic State Analysis</Text>
              
              <View style={styles.gaugeContainer}>
                <GaugeBar label="Trust" value={limbicTrustAnim} color="#9333ea" style={trustStyle} />
                <GaugeBar label="Warmth" value={limbicWarmthAnim} color="#ec4899" style={warmthStyle} />
                <GaugeBar label="Arousal" value={limbicArousalAnim} color="#f59e0b" style={arousalStyle} />
                <GaugeBar label="Valence" value={limbicValenceAnim} color="#10b981" style={valenceStyle} />
              </View>

              <View style={styles.postureContainer}>
                <Text style={styles.postureLabel}>Current Posture:</Text>
                <Text style={styles.postureValue}>{limbicState.posture}</Text>
              </View>
            </BlurView>
          </Animated.View>

          {/* Voice Controls */}
          <Animated.View style={[styles.analyticsCard, { opacity: fadeAnim }]}>
            <BlurView intensity={20} style={styles.cardBlur}>
              <Text style={styles.analyticsTitle}>Voice Interface</Text>
              
              <View style={styles.voiceControls}>
                <TouchableOpacity
                  onPress={toggleVoice}
                  style={[styles.voiceButton, isVoiceActive && styles.voiceButtonActive]}
                >
                  <Ionicons 
                    name={isVoiceActive ? "mic" : "mic-off"} 
                    size={24} 
                    color={isVoiceActive ? "white" : "#a78bfa"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={toggleMute}
                  style={[styles.voiceButton, isMuted && styles.voiceButtonMuted]}
                >
                  <Ionicons 
                    name={isMuted ? "volume-off" : "volume-high"} 
                    size={24} 
                    color={isMuted ? "#ef4444" : "#a78bfa"} 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.voiceStatus}>
                {isVoiceActive ? 'Voice recognition active' : 'Voice recognition inactive'}
              </Text>
            </BlurView>
          </Animated.View>

          {/* Premium Features */}
          <Animated.View style={[styles.analyticsCard, { opacity: fadeAnim }]}>
            <BlurView intensity={20} style={styles.cardBlur}>
              <Text style={styles.analyticsTitle}>Premium Features</Text>
              
              <View style={styles.featuresContainer}>
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
        </View>
      </ScrollView>

      {/* Processing Overlay */}
      {isProcessing && (
        <Animated.View style={[styles.processingOverlay, { opacity: fadeAnim }]}>
          <BlurView intensity={80} style={styles.processingBlur}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="brain" size={48} color="#9333ea" />
            </Animated.View>
            <Text style={styles.processingText}>Processing your response...</Text>
          </BlurView>
        </Animated.View>
      )}
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
        <Animated.View style={[styles.gaugeFill, { backgroundColor: color }, style]} />
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardBlur: {
    padding: 20,
    borderRadius: 20,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  question: {
    fontSize: 20,
    color: 'white',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
    borderColor: '#a855f7',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#e9d5ff',
    flex: 1,
  },
  selectedOptionText: {
    color: 'white',
  },
  responseContainer: {
    marginBottom: 24,
  },
  responseBlur: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  responseText: {
    fontSize: 14,
    color: '#e9d5ff',
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  disabledNavButton: {
    opacity: 0.5,
  },
  primaryNavButton: {
    backgroundColor: 'linear-gradient(135deg, #9333ea, #ec4899)',
  },
  navButtonText: {
    color: '#e9d5ff',
    fontSize: 16,
    fontWeight: '500',
  },
  primaryNavButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  analyticsContainer: {
    paddingBottom: 24,
  },
  analyticsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  gaugeContainer: {
    marginBottom: 16,
  },
  gaugeBar: {
    marginBottom: 16,
  },
  gaugeLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gaugeLabelText: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  gaugeValueText: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  postureContainer: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  postureLabel: {
    fontSize: 14,
    color: '#e9d5ff',
    marginBottom: 4,
  },
  postureValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  voiceControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    space: 16,
    marginBottom: 16,
  },
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  voiceButtonActive: {
    backgroundColor: '#9333ea',
  },
  voiceButtonMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  voiceStatus: {
    textAlign: 'center',
    fontSize: 14,
    color: '#e9d5ff',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  processingBlur: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
  },
});

export default ConvergenceExperiencePremium;
