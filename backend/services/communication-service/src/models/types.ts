/**
 * Communication Service Type Definitions
 * Implements data models from Section 15: Data Schemas
 */

export interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: 'COMPANION' | 'COPILOT' | 'PEER' | 'EXPERT';
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
}

export interface CommunicationRequest {
  id: string;
  type: 'text' | 'voice' | 'file';
  content: string;
  metadata?: {
    urgency?: 'low' | 'medium' | 'high';
    emotion?: string;
    context?: string;
    limbicState?: LimbicState;
    actorId?: string;
  };
  timestamp: Date;
}

export interface CommunicationResponse {
  id: string;
  requestId: string;
  type: 'text' | 'voice' | 'file';
  content: string;
  metadata?: {
    processingTime: number;
    confidence?: number;
    suggestions?: string[];
    limbicResponse?: {
      deltaTrust?: number;
      deltaWarmth?: number;
      deltaArousal?: number;
      deltaValence?: number;
    };
  };
  timestamp: Date;
}

export interface EmailDraft {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  tone: 'professional' | 'casual' | 'warm' | 'formal';
  extractedVoiceApplied: boolean;
  trustTierRequired: number;
  status: 'draft' | 'outbox' | 'sent' | 'failed';
  metadata?: {
    urgency?: 'low' | 'medium' | 'high';
    relationship?: string;
    context?: string;
    suggestedEdits?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceCommand {
  id: string;
  audioData: Buffer;
  format: 'wav' | 'mp3' | 'ogg' | 'flac';
  sampleRate: number;
  channels: number;
  duration: number;
  metadata?: {
    wakeWordDetected?: boolean;
    emotion?: string;
    noiseLevel?: number;
    confidence?: number;
  };
}

export interface VoiceResponse {
  id: string;
  commandId: string;
  transcription?: string;
  audioResponse?: Buffer;
  format: 'wav' | 'mp3' | 'ogg';
  metadata?: {
    confidence?: number;
    processingTime: number;
    emotionalProsody?: boolean;
    prosodyMarkers?: {
      pitch: number[];
      energy: number[];
      tempo: number;
    };
  };
}

export interface FileEvent {
  id: string;
  type: 'created' | 'modified' | 'deleted' | 'moved';
  path: string;
  oldPath?: string;
  timestamp: Date;
  metadata?: {
    size?: number;
    fileType?: string;
    contentHash?: string;
    permissions?: string;
    owner?: string;
  };
}

export interface ExtractedVoiceProfile {
  id: string;
  vocabularyMarkers: string[];
  sentenceRhythm: 'short' | 'medium' | 'long' | 'varied';
  formalityLevel: number; // 0.0 - 1.0
  humorStyle: 'dry' | 'playful' | 'absent';
  samplesAnalyzed: number;
  createdAt: Date;
  updatedAt: Date;
  patterns?: {
    greetings: string[];
    closings: string[];
    transitions: string[];
    emphasis: string[];
  };
}

export interface ConversationHistory {
  id: string;
  participants: string[];
  messages: CommunicationMessage[];
  metadata?: {
    startDate: Date;
    lastActivity: Date;
    messageCount: number;
    context?: string;
    limbicStates?: LimbicState[];
  };
}

export interface CommunicationMessage {
  id: string;
  sender: 'user' | 'sallie';
  content: string;
  type: 'text' | 'voice' | 'file';
  timestamp: Date;
  metadata?: {
    limbicState?: LimbicState;
    processingTime?: number;
    confidence?: number;
    attachments?: string[];
  };
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'voice-stream' | 'system' | 'limbic-update';
  data: any;
  roomId?: string;
  timestamp: Date;
}

export interface ServiceStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  details?: {
    [key: string]: any;
  };
}

export interface ChatRequest {
  message: string;
  context?: string;
  limbicState?: LimbicState;
  conversationId?: string;
  actorId?: string;
}

export interface EmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  context?: string;
  tone?: 'professional' | 'casual' | 'warm' | 'formal';
  useExtractedVoice?: boolean;
  trustTier: number;
}

export interface TTSRequest {
  text: string;
  limbicState?: LimbicState;
  voiceConfig?: {
    speed?: number;
    pitch?: number;
    emotion?: string;
  };
  format?: 'wav' | 'mp3' | 'ogg';
}

export interface FileAnalysisRequest {
  filePath: string;
  analysisType: 'content' | 'metadata' | 'structure' | 'relationships';
  depth?: 'shallow' | 'deep';
}

export interface FileAnalysisResult {
  filePath: string;
  analysisType: string;
  results: {
    content?: {
      summary: string;
      keyPoints: string[];
      sentiment?: string;
      topics?: string[];
    };
    metadata?: {
      size: number;
      type: string;
      created: Date;
      modified: Date;
      permissions: string;
    };
    structure?: {
      sections: string[];
      headings: string[];
      links: string[];
      images: string[];
    };
    relationships?: {
      references: string[];
      dependencies: string[];
      similarFiles: string[];
    };
  };
  processingTime: number;
  confidence: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  data?: any;
}
