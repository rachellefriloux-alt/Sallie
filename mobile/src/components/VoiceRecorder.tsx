/**
 * Voice Recorder Component - Mobile Version
 * Complete voice recording functionality with top-tier quality
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

interface VoiceRecorderProps {
  onRecordingComplete?: (audioUri: string, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  maxDuration?: number; // in seconds
  enabled?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  maxDuration = 60,
  enabled = true,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));
  const [showModal, setShowModal] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  const animationValue = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const levelsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  // Cleanup function
  const cleanupRecording = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (levelsIntervalRef.current) {
      clearInterval(levelsIntervalRef.current);
    }
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.log('Error stopping recording:', error);
      }
    }
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.log('Error unloading sound:', error);
      }
    }
  }, [recording, sound]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!enabled) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please grant microphone permission to record audio.');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);
      setShowModal(true);
      
      if (onRecordingStart) {
        onRecordingStart();
      }

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

      // Start audio levels animation
      levelsIntervalRef.current = setInterval(() => {
        setAudioLevels(prev => {
          const newLevels = [...prev.slice(1), Math.random() * 100];
          return newLevels;
        });
      }, 100);

      // Start animations
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  }, [enabled, maxDuration, onRecordingStart]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!recording) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Stop timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (levelsIntervalRef.current) {
        clearInterval(levelsIntervalRef.current);
      }

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri && onRecordingComplete) {
        onRecordingComplete(uri, recordingDuration);
      }

      // Reset state
      setIsRecording(false);
      setIsPaused(false);
      setRecording(null);
      setAudioLevels(new Array(20).fill(0));
      
      if (onRecordingStop) {
        onRecordingStop();
      }

      // Reset animations
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Close modal after a short delay
      setTimeout(() => {
        setShowModal(false);
      }, 500);

    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  }, [recording, recordingDuration, onRecordingComplete, onRecordingStop]);

  // Pause/Resume recording
  const togglePause = useCallback(async () => {
    if (!recording) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (isPaused) {
        await recording.startAsync();
        setIsPaused(false);
        
        // Resume timers
        intervalRef.current = setInterval(() => {
          setRecordingDuration(prev => {
            const newDuration = prev + 1;
            if (newDuration >= maxDuration) {
              stopRecording();
            }
            return newDuration;
          });
        }, 1000);
        
        levelsIntervalRef.current = setInterval(() => {
          setAudioLevels(prev => {
            const newLevels = [...prev.slice(1), Math.random() * 100];
            return newLevels;
          });
        }, 100);
      } else {
        await recording.pauseAsync();
        setIsPaused(true);
        
        // Pause timers
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (levelsIntervalRef.current) {
          clearInterval(levelsIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Failed to toggle pause:', error);
    }
  }, [recording, isPaused, maxDuration, stopRecording]);

  // Cancel recording
  const cancelRecording = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    await cleanupRecording();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingDuration(0);
    setAudioLevels(new Array(20).fill(0));
    setShowModal(false);
    
    if (onRecordingStop) {
      onRecordingStop();
    }
  }, [cleanupRecording, onRecordingStop]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Create pan responder for swipe to cancel
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 50;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy < -100) {
        cancelRecording();
      }
    },
  });

  return (
    <>
      {/* Main Button */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          !enabled && styles.mainButtonDisabled,
          isRecording && styles.mainButtonRecording,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={!enabled}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.buttonInner,
            {
              transform: [{ scale: isRecording ? pulseAnimation : 1 }],
            },
          ]}
        >
          <Text style={[
            styles.buttonText,
            isRecording && styles.buttonTextRecording,
          ]}>
            {isRecording ? '⏹️' : '🎤'}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Recording Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent} {...panResponder.panHandlers}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recording Voice</Text>
              <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Duration */}
            <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>

            {/* Audio Levels */}
            <View style={styles.audioLevelsContainer}>
              {audioLevels.map((level, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.audioLevel,
                    {
                      height: level * 0.5,
                      backgroundColor: level > 70 ? '#ef4444' : 
                                     level > 40 ? '#f59e0b' : '#10b981',
                    },
                  ]}
                />
              ))}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${(recordingDuration / maxDuration) * 100}%`],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((recordingDuration / maxDuration) * 100)}%
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  styles.pauseButton,
                  !isRecording && styles.controlButtonDisabled,
                ]}
                onPress={togglePause}
                disabled={!isRecording}
              >
                <Text style={styles.controlButtonText}>
                  {isPaused ? '▶️' : '⏸️'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={stopRecording}
              >
                <Text style={styles.controlButtonText}>⏹️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.cancelButtonModal]}
                onPress={cancelRecording}
              >
                <Text style={styles.controlButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <Text style={styles.instructionsText}>
              {isRecording ? 'Tap stop to finish recording' : 'Swipe up to cancel'}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0.1,
  },
  mainButtonRecording: {
    backgroundColor: '#ef4444',
  },
  buttonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
  },
  buttonTextRecording: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  durationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  audioLevelsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    width: '100%',
    marginBottom: 20,
  },
  audioLevel: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
    minWidth: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonModal: {
    backgroundColor: '#6b7280',
  },
  controlButtonText: {
    fontSize: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
