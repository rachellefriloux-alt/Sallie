'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePremiumWebSocket, PlatformType, SyncEventType } from '@/hooks/usePremiumWebSocket';
import { PremiumConnectionIndicator } from '@/components/ui/ConnectionIndicator';

// Voice Interface Types
interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  lastResponse: string;
  voiceEnabled: boolean;
  volume: number;
  emotion: string;
}

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

interface VoiceResponse {
  text: string;
  emotion: string;
  duration: number;
  audioUrl?: string;
}

// Voice Hook
export function useVoiceInterface(userId: string = 'convergence_user') {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    lastResponse: '',
    voiceEnabled: true,
    volume: 0.8,
    emotion: 'warm'
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize voice recording
  const initializeVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        setVoiceState(prev => ({ ...prev, isProcessing: true }));
        
        // Send to STT service
        await sendToSTT(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      return true;
    } catch (error) {
      console.error('Error initializing voice recording:', error);
      return false;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) {
      const initialized = await initializeVoiceRecording();
      if (!initialized) return;
    }

    audioChunksRef.current = [];
    mediaRecorderRef.current?.start();
    
    setVoiceState(prev => ({
      ...prev,
      isRecording: true,
      transcript: '',
      isProcessing: false
    }));
  }, [initializeVoiceRecording]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && voiceState.isRecording) {
      mediaRecorderRef.current.stop();
      
      setVoiceState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: true
      }));
    }
  }, [voiceState.isRecording]);

  // Send audio to STT service
  const sendToSTT = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('user_id', userId);
      formData.append('context', JSON.stringify({
        expected_phrases: [
          'hello sallie',
          'how are you',
          'next question',
          'previous question',
          'help me',
          'thank you',
          'goodbye'
        ]
      }));

      // Mock STT service call (in production, would call actual STT endpoint)
      const mockTranscript = await mockSTTService(formData);
      
      setVoiceState(prev => ({
        ...prev,
        transcript: mockTranscript,
        isProcessing: false
      }));

      return mockTranscript;
    } catch (error) {
      console.error('Error sending to STT:', error);
      setVoiceState(prev => ({
        ...prev,
        isProcessing: false,
        transcript: 'Sorry, I had trouble understanding that.'
      }));
      return '';
    }
  }, [userId]);

  // Mock STT service (in production, would call actual endpoint)
  const mockSTTService = useCallback(async (formData: FormData): Promise<string> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock transcripts based on context
    const context = JSON.parse(formData.get('context') as string || '{}');
    const expectedPhrases = context.expected_phrases || [];
    
    if (Math.random() > 0.3 && expectedPhrases.length > 0) {
      return expectedPhrases[Math.floor(Math.random() * expectedPhrases.length)];
    }
    
    const mockResponses = [
      "Hello Sallie",
      "How are you doing today",
      "Can you help me with this question",
      "Thank you for your help",
      "I need some guidance",
      "Let's talk about the convergence",
      "I have a question for you"
    ];
    
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }, []);

  // Text to Speech
  const speak = useCallback(async (text: string, emotion: string = 'warm') => {
    try {
      setVoiceState(prev => ({
        ...prev,
        isSpeaking: true,
        lastResponse: text,
        emotion
      }));

      // Mock TTS service call (in production, would call actual TTS endpoint)
      const audioUrl = await mockTTSService(text, emotion);
      
      // Play audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }

      // Simulate speaking duration
      const duration = text.length * 0.1; // Rough estimate
      setTimeout(() => {
        setVoiceState(prev => ({
          ...prev,
          isSpeaking: false
        }));
      }, duration * 1000);

      return audioUrl;
    } catch (error) {
      console.error('Error in TTS:', error);
      setVoiceState(prev => ({
        ...prev,
        isSpeaking: false
      }));
      return '';
    }
  }, []);

  // Mock TTS service (in production, would call actual endpoint)
  const mockTTSService = useCallback(async (text: string, emotion: string): Promise<string> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock audio URL (in production, would return actual audio file)
    return `/api/tts/audio/${Date.now()}.wav`;
  }, []);

  // Toggle voice
  const toggleVoice = useCallback(() => {
    setVoiceState(prev => ({
      ...prev,
      voiceEnabled: !prev.voiceEnabled
    }));
  }, []);

  // Set emotion
  const setEmotion = useCallback((emotion: string) => {
    setVoiceState(prev => ({
      ...prev,
      emotion
    }));
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    setVoiceState(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume))
    }));
    
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    voiceState,
    startRecording,
    stopRecording,
    speak,
    toggleVoice,
    setEmotion,
    setVolume,
    audioRef
  };
}

// Voice Controls Component
export function VoiceControls({ 
  onTranscript, 
  onVoiceCommand,
  className = '' 
}: {
  onTranscript: (transcript: string) => void;
  onVoiceCommand: (command: string) => void;
  className?: string;
}) {
  const {
    voiceState,
    startRecording,
    stopRecording,
    speak,
    toggleVoice,
    setEmotion,
    setVolume,
    audioRef
  } = useVoiceInterface();

  // Handle transcript changes
  useEffect(() => {
    if (voiceState.transcript) {
      onTranscript(voiceState.transcript);
      onVoiceCommand(voiceState.transcript);
    }
  }, [voiceState.transcript, onTranscript, onVoiceCommand]);

  const handleRecordToggle = () => {
    if (voiceState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 ${className}`}>
      <audio ref={audioRef} className="hidden" />
      
      {/* Voice Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Voice Interface</h3>
        <button
          onClick={toggleVoice}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            voiceState.voiceEnabled
              ? 'bg-green-500 text-white'
              : 'bg-gray-500 text-gray-300'
          }`}
        >
          {voiceState.voiceEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handleRecordToggle}
          disabled={!voiceState.voiceEnabled || voiceState.isProcessing}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            voiceState.isRecording
              ? 'bg-red-500 animate-pulse'
              : voiceState.isProcessing
              ? 'bg-yellow-500 animate-spin'
              : 'bg-purple-500 hover:bg-purple-600'
          } ${!voiceState.voiceEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {voiceState.isRecording ? (
            <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
          ) : voiceState.isProcessing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className="text-sm text-gray-300 mb-1">
            {voiceState.isRecording ? 'Recording...' : 
             voiceState.isProcessing ? 'Processing...' : 
             'Tap to speak'}
          </div>
          
          {voiceState.transcript && (
            <div className="text-white text-sm">
              "{voiceState.transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Voice Settings */}
      {voiceState.voiceEnabled && (
        <div className="space-y-3">
          {/* Emotion Selection */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Voice Emotion</label>
            <div className="flex space-x-2">
              {['warm', 'caring', 'wise', 'gentle', 'encouraging'].map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setEmotion(emotion)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    voiceState.emotion === emotion
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Volume: {Math.round(voiceState.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={voiceState.volume * 100}
              onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Last Response */}
      {voiceState.lastResponse && (
        <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="text-sm text-gray-300 mb-1">Last Response:</div>
          <div className="text-white text-sm italic">
            "{voiceState.lastResponse}"
          </div>
          {voiceState.isSpeaking && (
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Voice Commands Component
export function VoiceCommands({ onCommand }: { onCommand: (command: string) => void }) {
  const commands: VoiceCommand[] = [
    {
      command: 'next question',
      action: () => onCommand('next_question'),
      description: 'Go to next question'
    },
    {
      command: 'previous question',
      action: () => onCommand('previous_question'),
      description: 'Go to previous question'
    },
    {
      command: 'help me',
      action: () => onCommand('help'),
      description: 'Get help with current question'
    },
    {
      command: 'repeat',
      action: () => onCommand('repeat'),
      description: 'Repeat the question'
    },
    {
      command: 'save progress',
      action: () => onCommand('save'),
      description: 'Save current progress'
    }
  ];

  return (
    <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Voice Commands</h3>
      
      <div className="space-y-2">
        {commands.map((cmd, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
            <div>
              <div className="text-white font-medium">"{cmd.command}"</div>
              <div className="text-gray-400 text-sm">{cmd.description}</div>
            </div>
            <button
              onClick={cmd.action}
              className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Voice Status Indicator
export function VoiceStatusIndicator({ voiceState, className = '' }: { voiceState: VoiceState; className?: string }) {
  const getStatusColor = () => {
    if (voiceState.isRecording) return 'bg-red-500';
    if (voiceState.isProcessing) return 'bg-yellow-500';
    if (voiceState.isSpeaking) return 'bg-green-500';
    if (!voiceState.voiceEnabled) return 'bg-gray-500';
    return 'bg-purple-500';
  };

  const getStatusText = () => {
    if (voiceState.isRecording) return 'Recording';
    if (voiceState.isProcessing) return 'Processing';
    if (voiceState.isSpeaking) return 'Speaking';
    if (!voiceState.voiceEnabled) return 'Disabled';
    return 'Ready';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${
        voiceState.isRecording || voiceState.isSpeaking ? 'animate-pulse' : ''
      }`} />
      <span className="text-sm text-gray-300">{getStatusText()}</span>
    </div>
  );
}
