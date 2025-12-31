'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type RecordingState = 'idle' | 'listening' | 'processing' | 'error';

export interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
}

export interface UseSpeechRecognitionReturn {
  // State
  isListening: boolean;
  isSupported: boolean;
  recordingState: RecordingState;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  
  // Controls
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  
  // Config
  setLanguage: (lang: string) => void;
}

/**
 * Custom hook for Web Speech API speech recognition
 * Provides voice-to-text functionality in supported browsers (Chrome, Edge, Safari)
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    onTranscript,
  } = options;

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  // State
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Initialize SpeechRecognition
  const initRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = currentLanguage;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setRecordingState('listening');
      setError(null);
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setRecordingState((prev) => prev === 'error' ? 'error' : 'idle');
      setInterimTranscript('');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      isListeningRef.current = false;
      setRecordingState('error');

      // Map error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'no-speech': 'No speech was detected. Please try again.',
        'audio-capture': 'Microphone not available. Please check your device.',
        'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
        'network': 'Network error. Speech recognition requires an internet connection.',
        'aborted': 'Speech recognition was cancelled.',
        'service-not-allowed': 'Speech recognition service is not allowed.',
      };

      const errorMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      setError(errorMessage);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptText;
        } else {
          currentInterim += transcriptText;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        setInterimTranscript('');
        onTranscript?.(finalTranscript, true);
      } else if (currentInterim) {
        setInterimTranscript(currentInterim);
        onTranscript?.(currentInterim, false);
      }
    };

    return recognition;
  }, [isSupported, continuous, interimResults, currentLanguage, onTranscript]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setRecordingState('error');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.abort();
    }

    // Reset state
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    // Create new recognition instance
    const recognition = initRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        // Handle case where recognition is already started
        console.error('Failed to start speech recognition:', err);
        setError('Failed to start voice input. Please try again.');
        setRecordingState('error');
      }
    }
  }, [isSupported, initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      setRecordingState('processing');
      recognitionRef.current.stop();
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setRecordingState('idle');
  }, []);

  // Set language
  const setLanguage = useCallback((lang: string) => {
    setCurrentLanguage(lang);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  // Update recognition language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLanguage;
    }
  }, [currentLanguage]);

  return {
    isListening: recordingState === 'listening',
    isSupported,
    recordingState,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  };
}

export default useSpeechRecognition;
