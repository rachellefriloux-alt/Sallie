// Voice Interface Type Definitions

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  lastResponse: string;
  voiceEnabled: boolean;
  volume: number;
  emotion: string;
}

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export interface VoiceResponse {
  text: string;
  emotion: string;
  duration: number;
  audioUrl?: string;
}

export interface VoiceControlsProps {
  onTranscript: (transcript: string) => void;
  onVoiceCommand: (command: string) => void;
  className?: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface TextToSpeechRequest {
  text: string;
  emotion: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface TextToSpeechResponse {
  audioUrl: string;
  duration: number;
  success: boolean;
  error?: string;
}

export interface AudioContext {
  stream: MediaStream;
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[];
}

export interface VoiceSettings {
  language: string;
  sensitivity: number;
  autoSubmit: boolean;
  continuous: boolean;
  interimResults: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
}

export interface VoiceEmotion {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}
