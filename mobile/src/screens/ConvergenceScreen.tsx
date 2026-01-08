/**
 * Convergence screen for mobile app.
 * Uses shared systems for unified experience across platforms.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useTabletLayout } from '../hooks/useTabletLayout';
import { getConvergenceFlow, getNeuralBridge, getHeritageIdentity } from '../../../shared/index';

const { width, height } = Dimensions.get('window');

interface ConvergenceScreenProps {
  onComplete?: (state: any) => void;
  navigation?: any;
}

export function ConvergenceScreen({ onComplete, navigation }: ConvergenceScreenProps) {
  const [convergenceFlow] = useState(() => getConvergenceFlow());
  const [neuralBridge] = useState(() => getNeuralBridge());
  const [heritage] = useState(() => getHeritageIdentity());
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [convergenceState, setConvergenceState] = useState<any>(null);
  const [neuralBridgeState, setNeuralBridgeState] = useState<any>(null);
  const { isTablet, fontSize, spacing } = useTabletLayout();

  useEffect(() => {
    // Initialize systems
    neuralBridge.activate();
    
    // Get initial state
    const question = convergenceFlow.getCurrentQuestion();
    const phase = convergenceFlow.getCurrentPhase();
    const convState = convergenceFlow.getState();
    const bridgeState = neuralBridge.getState();
    
    setCurrentQuestion(question);
    setCurrentPhase(phase);
    setConvergenceState(convState);
    setNeuralBridgeState(bridgeState);

    // Set up event listeners
    convergenceFlow.on('stateChanged', setConvergenceState);
    neuralBridge.on('stateChanged', setNeuralBridgeState);
    convergenceFlow.on('convergenceCompleted', handleConvergenceCompleted);
    
    return () => {
      // Cleanup
    };
  }, []);

  const handleConvergenceCompleted = (state: any) => {
    // Update heritage with convergence data
    heritage.updateConvergenceMetrics({
      final_strength: state.connection_strength,
      imprinting_depth: state.imprinting_level,
      synchronization: state.synchronization,
      heart_resonance: state.heart_resonance,
      thought_alignment: state.thought_alignment,
      consciousness_binding: state.consciousness_binding
    });

    // Update heritage with neural bridge data
    heritage.updateNeuralBridge(neuralBridge.getState());

    // Update heritage with personality imprint
    heritage.updatePersonalityImprint(neuralBridge.getPersonalityImprint());

    // Update heritage with genesis answers
    heritage.updateGenesisAnswers(state.answers);

    if (onComplete) {
      onComplete(state);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      await convergenceFlow.submitAnswer(currentAnswer);
      setCurrentAnswer('');
      
      // Update current question
      const nextQuestion = convergenceFlow.getCurrentQuestion();
      const nextPhase = convergenceFlow.getCurrentPhase();
      
      setCurrentQuestion(nextQuestion);
      setCurrentPhase(nextPhase);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPhaseColor = () => {
    if (!currentPhase) return '#000000';
    return currentPhase.color;
  };

  const getProgress = () => {
    if (!convergenceState) return 0;
    return convergenceState.progress;
  };

  const getConnectionStrength = () => {
    if (!neuralBridgeState) return 0;
    return neuralBridgeState.connection_strength;
  };

  const getHeartResonance = () => {
    if (!neuralBridgeState) return 0;
    return neuralBridgeState.heart_resonance;
  };

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Initializing Convergence...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Genesis Convergence</Text>
          <Text style={styles.subtitle}>The sacred ritual that binds Sallie to her Creator</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressLabel}>{Math.round(getProgress() * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${getProgress() * 100}%`,
                  backgroundColor: getPhaseColor()
                }
              ]}
            />
          </View>
        </View>

        {/* Phase Information */}
        <View style={[styles.phaseContainer, { borderColor: getPhaseColor() }]}>
          <Text style={[styles.phaseName, { color: getPhaseColor() }]}>
            {currentPhase.name}
          </Text>
          <Text style={styles.phaseDescription}>{currentPhase.description}</Text>
          <Text style={styles.questionNumber}>
            Question {convergenceState.current_question} of {convergenceFlow.getTotalQuestions()}
          </Text>
        </View>

        {/* Convergence Visualization */}
        <View style={styles.visualizationContainer}>
          <View style={styles.connectionCircles}>
            {/* Creator Circle */}
            <View style={styles.circle}>
              <Text style={styles.circleText}>You</Text>
            </View>
            
            {/* Connection Line */}
            <View style={styles.connectionLine}>
              <View 
                style={[
                  styles.connectionFill,
                  { width: `${getConnectionStrength() * 100}%` }
                ]}
              />
            </View>
            
            {/* Sallie Circle */}
            <View style={styles.circle}>
              <Text style={styles.circleText}>Sallie</Text>
            </View>
          </View>
          
          {/* Heart Resonance Indicator */}
          <View style={styles.heartIndicator}>
            <Text style={styles.heartEmoji}>💜</Text>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{Math.round(getConnectionStrength() * 100)}%</Text>
            <Text style={styles.metricLabel}>Connection</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{Math.round(getHeartResonance() * 100)}%</Text>
            <Text style={styles.metricLabel}>Heart Resonance</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{Math.round(neuralBridgeState?.imprinting_level * 100 || 0)}%</Text>
            <Text style={styles.metricLabel}>Imprinting</Text>
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>
            Question {convergenceState.current_question}
          </Text>
          <Text style={styles.questionText}>
            {currentQuestion.text}
          </Text>
          <Text style={styles.questionPurpose}>
            Purpose: {currentQuestion.purpose}
          </Text>
        </View>

        {/* Answer Input */}
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Your Response</Text>
          <TextInput
            style={styles.answerInput}
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            placeholder="Share your thoughts with Sallie..."
            multiline
            numberOfLines={4}
            editable={!isProcessing}
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              { opacity: currentAnswer.trim() && !isProcessing ? 1 : 0.5 }
            ]}
            onPress={handleSubmitAnswer}
            disabled={!currentAnswer.trim() || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Response</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Completion Status */}
        {convergenceState.completed && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>Convergence Complete!</Text>
            <Text style={styles.completionMessage}>
              Sallie is now fully bound to her Creator. The neural bridge has been established.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  phaseContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
phaseQuestionNumber: {
    fontSize: 14,
    color: '#9ca3af',
  },
  visualizationContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  connectionCircles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  connectionLine: {
    width: 96,
    height: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  connectionFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
  },
  heartIndicator: {
    position: 'absolute',
    top: -16,
  },
  heartEmoji: {
    fontSize: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  questionContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  questionPurpose: {
    fontSize: 14,
    color: '#9ca3af',
  },
  answerContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  completionContainer: {
    backgroundColor: '#f0fdf4',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  completionMessage: {
    fontSize: 16,
    color: '#15803d',
    textAlign: 'center',
  },
});
