/**
 * Convergence screen for mobile app.
 * Initial onboarding flow to help Sallie learn about the Creator.
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
} from 'react-native';
import { useTabletLayout } from '../hooks/useTabletLayout';
import APIClient from '../services/api_client';

interface Question {
  id: number;
  phase: string;
  text: string;
  purpose: string;
}

type ScreenState = 'welcome' | 'questioning' | 'completed';

export function ConvergenceScreen() {
  const [screenState, setScreenState] = useState<ScreenState>('welcome');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [sallieResponse, setSallieResponse] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 15 });
  const { isTablet, fontSize, spacing } = useTabletLayout();
  const apiClient = React.useRef(new APIClient()).current;

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // In a real implementation, this would check convergence status
      // For now, we'll start fresh
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  };

  const startConvergence = async () => {
    setLoading(true);
    try {
      // Start convergence session
      setScreenState('questioning');
      await loadNextQuestion();
    } catch (err) {
      console.error('Failed to start convergence:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    try {
      // In a real implementation, this would call the API
      // Mock data for now
      const mockQuestion: Question = {
        id: progress.current + 1,
        phase: 'TONE',
        text: 'How do you prefer to communicate?',
        purpose: 'Understanding your communication style',
      };
      setCurrentQuestion(mockQuestion);
      setSallieResponse('');
    } catch (err) {
      console.error('Failed to load question:', err);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    try {
      // In a real implementation, this would submit to the API
      // Mock response for now
      setSallieResponse("Thank you for sharing that. I'm learning more about you!");

      // Update progress
      const newProgress = { ...progress, current: progress.current + 1 };
      setProgress(newProgress);

      // Check if completed
      if (newProgress.current >= newProgress.total) {
        setTimeout(() => {
          setScreenState('completed');
        }, 2000);
      } else {
        // Load next question after showing response
        setTimeout(() => {
          setAnswer('');
          loadNextQuestion();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <Text style={[styles.welcomeTitle, isTablet && { fontSize: fontSize.xl }]}>
        Welcome to Convergence
      </Text>
      <Text style={styles.welcomeSubtitle}>Getting to know each other</Text>

      <Text style={styles.welcomeDescription}>
        Through 15 questions across 5 phases, Sallie will learn about you - your
        preferences, values, and how you'd like to work together.
      </Text>

      <View style={styles.phasesList}>
        <Text style={styles.phasesTitle}>Phases:</Text>
        <Text style={styles.phaseItem}>1. Tone — Communication style</Text>
        <Text style={styles.phaseItem}>2. Shadows — Challenges and boundaries</Text>
        <Text style={styles.phaseItem}>3. Aspirations — Dreams and goals</Text>
        <Text style={styles.phaseItem}>4. Ethics — Moral compass and values</Text>
        <Text style={styles.phaseItem}>5. Mirror — Reflection and synthesis</Text>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={startConvergence}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>Begin Convergence</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderQuestioning = () => (
    <KeyboardAvoidingView
      style={styles.questioningContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {currentQuestion && (
        <>
          <View style={styles.questionHeader}>
            <Text style={styles.questionPhase}>{currentQuestion.phase}</Text>
            <Text style={styles.questionNumber}>
              Question {currentQuestion.id} of {progress.total}
            </Text>
          </View>

          <Text style={[styles.questionText, isTablet && { fontSize: fontSize.large }]}>
            {currentQuestion.text}
          </Text>

          <Text style={styles.questionPurpose}>{currentQuestion.purpose}</Text>

          <TextInput
            style={styles.answerInput}
            placeholder="Type your answer..."
            placeholderTextColor="#6b7280"
            value={answer}
            onChangeText={setAnswer}
            multiline
            textAlignVertical="top"
            editable={!loading}
          />

          {sallieResponse ? (
            <View style={styles.responseContainer}>
              <Text style={styles.responseLabel}>Sallie</Text>
              <Text style={styles.responseText}>{sallieResponse}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, !answer.trim() && styles.submitButtonDisabled]}
            onPress={submitAnswer}
            disabled={loading || !answer.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(progress.current / progress.total) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress.current}/{progress.total}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );

  const renderCompleted = () => (
    <View style={styles.completedContainer}>
      <Text style={styles.completedEmoji}>🎉</Text>
      <Text style={[styles.completedTitle, isTablet && { fontSize: fontSize.xl }]}>
        Convergence Complete!
      </Text>
      <Text style={styles.completedDescription}>
        Sallie's Heritage has been compiled. She now has a foundational
        understanding of who you are and how you'd like to work together.
      </Text>
      <Text style={styles.completedNote}>
        You can always revisit and update these settings as your relationship
        evolves.
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, isTablet && styles.containerTablet]}
      contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
    >
      {screenState === 'welcome' && renderWelcome()}
      {screenState === 'questioning' && renderQuestioning()}
      {screenState === 'completed' && renderCompleted()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  containerTablet: {
    paddingHorizontal: 24,
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  contentTablet: {
    padding: 24,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#a78bfa',
    marginTop: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  phasesList: {
    marginTop: 32,
    alignSelf: 'stretch',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  phasesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  phaseItem: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  questioningContainer: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionPhase: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '600',
  },
  questionNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 28,
  },
  questionPurpose: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  answerInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#374151',
  },
  responseContainer: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  responseLabel: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '600',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  completedEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  completedDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  completedNote: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
