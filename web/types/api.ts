// API Type Definitions

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface SpeechToTextRequest {
  audio: Blob;
  user_id: string;
  context?: string;
  expected_phrases?: string[];
}

export interface SpeechToTextResponse {
  transcript: string;
  confidence: number;
  alternatives?: string[];
  processing_time: number;
}

export interface TextToSpeechRequest {
  text: string;
  emotion: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export interface TextToSpeechResponse {
  audioUrl: string;
  duration: number;
  success: boolean;
  processing_time: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id?: string;
}

export interface LimbicStateUpdate {
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

export interface AgencyActionRequest {
  action_type: string;
  resource: string;
  parameters: Record<string, any>;
  trust_required?: number;
  context?: string;
}

export interface AgencyActionResponse {
  action_id: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rollback';
  result?: any;
  error?: string;
  execution_time: number;
}

export interface LearningDataRequest {
  user_id: string;
  skill_ids?: string[];
  time_range?: '1h' | '24h' | '7d' | '30d';
  include_metrics?: boolean;
}

export interface LearningDataResponse {
  skills: any[];
  metrics: any;
  sessions: any[];
  paths: any[];
}
