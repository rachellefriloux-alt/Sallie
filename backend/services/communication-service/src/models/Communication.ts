export interface Message {
  id: string;
  type: MessageType;
  content: string;
  metadata: MessageMetadata;
  created_at: number;
  updated_at: number;
  sender_id: string;
  recipient_id?: string;
  channel_id?: string;
  thread_id?: string;
  status: MessageStatus;
  reactions: Reaction[];
  attachments: Attachment[];
  processing_status: ProcessingStatus;
  error?: string;
}

export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  EMAIL = 'email',
  SYSTEM = 'system',
  NOTIFICATION = 'notification',
  THOUGHT = 'thought',
  DREAM = 'dream',
  CONVERGENCE = 'convergence',
  HERITAGE = 'heritage'
}

export enum MessageStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PROCESSING = 'processing'
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface MessageMetadata {
  emotional_tone?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
  source: MessageSource;
  platform: Platform;
  language?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  limbic_state?: {
    trust: number;
    warmth: number;
    arousal: number;
    valence: number;
    posture: string;
  };
  transcription?: string;
  email_info?: EmailMessage;
  processing_time_ms?: number;
}

export enum MessageSource {
  USER_INPUT = 'user_input',
  AI_RESPONSE = 'ai_response',
  SYSTEM_GENERATED = 'system_generated',
  EMAIL_IMPORT = 'email_import',
  VOICE_TRANSCRIPTION = 'voice_transcription',
  SENSOR_ARRAY = 'sensor_array'
}

export enum Platform {
  WEB = 'web',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  EMAIL = 'email',
  VOICE = 'voice'
}

export interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  created_at: number;
}

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  url: string;
  size: number;
  mime_type: string;
  metadata: AttachmentMetadata;
  created_at: number;
}

export enum AttachmentType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  VOICE_NOTE = 'voice_note',
  SCREENSHOT = 'screenshot'
}

export interface AttachmentMetadata {
  duration?: number; // for audio/video
  dimensions?: { width: number; height: number }; // for images/video
  transcription?: string; // for audio
  thumbnail?: string;
  extracted_text?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  participants: string[];
  created_at: number;
  updated_at: number;
  last_message_at?: number;
  metadata: ChannelMetadata;
  settings: ChannelSettings;
}

export enum ChannelType {
  DIRECT = 'direct',
  GROUP = 'group',
  SYSTEM = 'system',
  EMAIL = 'email',
  VOICE = 'voice',
  THOUGHTS = 'thoughts'
}

export interface ChannelMetadata {
  description?: string;
  purpose?: string;
  created_by: string;
  is_archived: boolean;
  is_pinned: boolean;
  tags: string[];
}

export interface ChannelSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  voice_notifications: boolean;
  auto_reply_enabled: boolean;
  message_retention_days: number;
  access_level: 'public' | 'private' | 'restricted';
}

export interface VoiceMessage {
  id: string;
  audio_url: string;
  duration: number;
  transcription: string;
  confidence: number;
  language: string;
  speaker_id?: string;
  emotional_analysis: EmotionalAnalysis;
  processing_status: ProcessingStatus;
}

export interface EmotionalAnalysis {
  primary_emotion: string;
  confidence: number;
  secondary_emotions: Array<{
    emotion: string;
    confidence: number;
  }>;
  arousal_level: number;
  valence_level: number;
  timestamp: number;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  html_body?: string;
  attachments: EmailAttachment[];
  headers: Record<string, string>;
  received_at: number;
  processed_at: number;
  status: EmailStatus;
}

export enum EmailStatus {
  UNREAD = 'unread',
  READ = 'read',
  REPLIED = 'replied',
  FORWARDED = 'forwarded',
  DELETED = 'deleted',
  ARCHIVED = 'archived'
}

export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  content_id?: string;
  url?: string;
}

export interface CommunicationStats {
  total_messages: number;
  messages_by_type: Record<MessageType, number>;
  messages_by_platform: Record<Platform, number>;
  messages_by_status: Record<MessageStatus, number>;
  total_channels: number;
  active_channels: number;
  total_attachments: number;
  storage_used_mb: number;
  average_response_time_ms: number;
  voice_messages_processed: number;
  emails_processed: number;
  transcription_accuracy: number;
  sentiment_distribution: Record<string, number>;
  daily_message_counts: Array<{
    date: string;
    count: number;
  }>;
}

export interface CommunicationConfig {
  voice: VoiceConfig;
  email: EmailConfig;
  processing: ProcessingConfig;
  storage: StorageConfig;
  notifications: NotificationConfig;
}

export interface VoiceConfig {
  enabled: boolean;
  transcription_service: 'openai' | 'anthropic' | 'elevenlabs';
  max_duration_seconds: number;
  supported_formats: string[];
  quality_preset: 'low' | 'medium' | 'high';
  auto_transcription: boolean;
  language_detection: boolean;
  emotion_analysis: boolean;
}

export interface EmailConfig {
  enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass: string;
  imap_host: string;
  imap_port: number;
  imap_secure: boolean;
  imap_user: string;
  imap_pass: string;
  check_interval_minutes: number;
  auto_reply_enabled: boolean;
  signature: string;
}

export interface ProcessingConfig {
  max_concurrent_transcriptions: number;
  transcription_timeout_seconds: number;
  email_processing_batch_size: number;
  sentiment_analysis_enabled: boolean;
  keyword_extraction_enabled: boolean;
  auto_categorization: boolean;
  content_moderation: boolean;
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'minio';
  bucket_name?: string;
  region?: string;
  access_key?: string;
  secret_key?: string;
  endpoint_url?: string;
  max_file_size_mb: number;
  allowed_file_types: string[];
  retention_days: number;
  compression_enabled: boolean;
}

export interface NotificationConfig {
  webhooks: WebhookConfig[];
  email_notifications: EmailNotificationConfig;
  push_notifications: PushNotificationConfig;
  real_time_updates: boolean;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  enabled: boolean;
}

export interface EmailNotificationConfig {
  enabled: boolean;
  events: string[];
  template_directory: string;
}

export interface PushNotificationConfig {
  enabled: boolean;
  service: 'fcm' | 'apns' | 'custom';
  api_key?: string;
  apns_key_id?: string;
  apns_team_id?: string;
}

export interface CommunicationRequest {
  type: MessageType;
  content: string;
  recipient_id?: string;
  channel_id?: string;
  metadata?: Partial<MessageMetadata>;
  attachments?: Array<{
    type: AttachmentType;
    data: string; // base64 or URL
    name: string;
  }>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: number;
}

export interface CommunicationResponse {
  message: Message;
  processing_status: ProcessingStatus;
  delivery_status: MessageStatus;
  error?: string;
  metadata: {
    processing_time_ms: number;
    transcriptions?: VoiceMessage;
    email_info?: EmailMessage;
  };
}
