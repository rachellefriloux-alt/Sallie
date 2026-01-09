import { 
  Message, 
  MessageType, 
  MessageStatus, 
  ProcessingStatus,
  MessageMetadata,
  Platform,
  MessageSource,
  Channel,
  ChannelType,
  VoiceMessage,
  EmotionalAnalysis,
  EmailMessage,
  EmailStatus,
  CommunicationRequest,
  CommunicationResponse,
  CommunicationConfig,
  VoiceConfig,
  EmailConfig
} from '../models/Communication';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import OpenAI from 'openai';
import { Anthropic } from 'anthropic';
import { ElevenLabs } from 'elevenlabs-node';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export class CommunicationManager extends EventEmitter {
  private config: CommunicationConfig;
  private openai: OpenAI;
  private anthropic: Anthropic;
  private elevenLabs: ElevenLabs;
  private emailTransporter: nodemailer.Transporter;
  private activeChannels: Map<string, Channel> = new Map();
  private messageQueue: Map<string, Message> = new Map();
  private processingQueue: CommunicationRequest[] = [];

  constructor(config: CommunicationConfig) {
    super();
    this.config = config;
    this.initializeServices();
    this.startBackgroundProcessors();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize AI services
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      }

      if (process.env.ANTHROPIC_API_KEY) {
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
      }

      if (process.env.ELEVENLABS_API_KEY) {
        this.elevenLabs = new ElevenLabs({
          apiKey: process.env.ELEVENLABS_API_KEY,
        });
      }

      // Initialize email service
      if (this.config.email.enabled) {
        this.emailTransporter = nodemailer.createTransporter({
          host: this.config.email.smtp_host,
          port: this.config.email.smtp_port,
          secure: this.config.email.smtp_secure,
          auth: {
            user: this.config.email.smtp_user,
            pass: this.config.email.smtp_pass,
          },
        });
      }

      logger.info('Communication Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Communication Manager:', error);
      throw error;
    }
  }

  private startBackgroundProcessors(): void {
    // Start message processing queue
    setInterval(() => {
      this.processMessageQueue();
    }, 1000);

    // Start email checking
    if (this.config.email.enabled) {
      setInterval(() => {
        this.checkEmailInbox();
      }, this.config.email.check_interval_minutes * 60 * 1000);
    }
  }

  public async sendMessage(request: CommunicationRequest): Promise<CommunicationResponse> {
    try {
      const message: Message = {
        id: uuidv4(),
        type: request.type,
        content: request.content,
        metadata: {
          source: MessageSource.USER_INPUT,
          platform: Platform.WEB,
          ...request.metadata,
        },
        created_at: Date.now(),
        updated_at: Date.now(),
        sender_id: 'sallie',
        recipient_id: request.recipient_id,
        channel_id: request.channel_id,
        status: MessageStatus.DRAFT,
        reactions: [],
        attachments: [],
        processing_status: ProcessingStatus.PENDING,
      };

      // Handle attachments
      if (request.attachments && request.attachments.length > 0) {
        message.attachments = await this.processAttachments(request.attachments);
      }

      // Add to queue for processing
      this.messageQueue.set(message.id, message);
      this.processingQueue.push(request);

      // Start processing
      const processingResult = await this.processMessage(message, request);

      return {
        message: processingResult.message,
        processing_status: processingResult.processing_status,
        delivery_status: processingResult.status,
        metadata: {
          processing_time_ms: processingResult.processing_time_ms,
        },
      };

    } catch (error) {
      logger.error('Failed to send message:', error);
      throw error;
    }
  }

  private async processMessage(message: Message, request: CommunicationRequest): Promise<Message> {
    const startTime = Date.now();

    try {
      message.processing_status = ProcessingStatus.PROCESSING;
      message.status = MessageStatus.PROCESSING;

      // Process based on message type
      switch (message.type) {
        case MessageType.VOICE:
          await this.processVoiceMessage(message);
          break;
        case MessageType.EMAIL:
          await this.processEmailMessage(message);
          break;
        case MessageType.TEXT:
          await this.processTextMessage(message);
          break;
        default:
          await this.processGenericMessage(message);
      }

      // Update status
      message.processing_status = ProcessingStatus.COMPLETED;
      message.status = MessageStatus.SENT;
      message.updated_at = Date.now();

      // Emit event
      this.emit('messageProcessed', message);

      return message;

    } catch (error) {
      message.processing_status = ProcessingStatus.FAILED;
      message.status = MessageStatus.FAILED;
      message.error = error.message;
      message.updated_at = Date.now();

      logger.error('Failed to process message:', error);
      this.emit('messageProcessingFailed', { message, error });
      
      return message;
    } finally {
      message.metadata = {
        ...message.metadata,
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  private async processVoiceMessage(message: Message): Promise<void> {
    if (!this.config.voice.enabled) {
      throw new Error('Voice processing is disabled');
    }

    const voiceAttachment = message.attachments.find(a => a.type === 'audio' || a.type === 'voice_note');
    if (!voiceAttachment) {
      throw new Error('No audio attachment found for voice message');
    }

    // Transcribe audio
    const transcription = await this.transcribeAudio(voiceAttachment.url);
    
    // Analyze emotion
    const emotionalAnalysis = await this.analyzeEmotion(transcription.text);

    // Create voice message record
    const voiceMessage: VoiceMessage = {
      id: uuidv4(),
      audio_url: voiceAttachment.url,
      duration: voiceAttachment.metadata?.duration || 0,
      transcription: transcription.text,
      confidence: transcription.confidence,
      language: transcription.language,
      emotional_analysis: emotionalAnalysis,
      processing_status: ProcessingStatus.COMPLETED,
    };

    // Update message content with transcription
    message.content = transcription.text;
    message.metadata = {
      ...message.metadata,
      transcription: transcription.text,
      emotional_tone: emotionalAnalysis.primary_emotion,
      language: transcription.language,
    };

    // Store voice message (in a real implementation, this would go to a database)
    this.emit('voiceMessageProcessed', voiceMessage);
  }

  private async processEmailMessage(message: Message): Promise<void> {
    if (!this.config.email.enabled) {
      throw new Error('Email processing is disabled');
    }

    const emailData = this.parseEmailContent(message.content);
    
    const emailMessage: EmailMessage = {
      id: uuidv4(),
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.body,
      html_body: emailData.html_body,
      attachments: emailData.attachments,
      headers: emailData.headers,
      received_at: Date.now(),
      processed_at: Date.now(),
      status: EmailStatus.UNREAD,
    };

    // Send email
    await this.sendEmail(emailMessage);

    // Update message metadata
    message.metadata = {
      ...message.metadata,
      email_info: emailMessage,
    };

    this.emit('emailMessageProcessed', emailMessage);
  }

  private async processTextMessage(message: Message): Promise<void> {
    // Analyze sentiment
    if (this.config.processing.sentiment_analysis_enabled) {
      const sentiment = await this.analyzeSentiment(message.content);
      message.metadata = {
        ...message.metadata,
        sentiment: sentiment.sentiment,
        keywords: sentiment.keywords,
      };
    }

    // Extract keywords
    if (this.config.processing.keyword_extraction_enabled) {
      const keywords = await this.extractKeywords(message.content);
      message.metadata = {
        ...message.metadata,
        keywords: keywords,
      };
    }

    // Auto-categorize
    if (this.config.processing.auto_categorization) {
      const category = await this.categorizeMessage(message);
      message.metadata = {
        ...message.metadata,
        context: category,
      };
    }
  }

  private async processGenericMessage(message: Message): Promise<void> {
    // Basic processing for system messages, notifications, etc.
    logger.info(`Processing generic message: ${message.type}`);
  }

  private async transcribeAudio(audioUrl: string): Promise<{ text: string; confidence: number; language: string }> {
    try {
      let transcription;

      switch (this.config.voice.transcription_service) {
        case 'openai':
          transcription = await this.transcribeWithOpenAI(audioUrl);
          break;
        case 'anthropic':
          transcription = await this.transcribeWithAnthropic(audioUrl);
          break;
        case 'elevenlabs':
          transcription = await this.transcribeWithElevenLabs(audioUrl);
          break;
        default:
          throw new Error(`Unsupported transcription service: ${this.config.voice.transcription_service}`);
      }

      return transcription;
    } catch (error) {
      logger.error('Failed to transcribe audio:', error);
      throw error;
    }
  }

  private async transcribeWithOpenAI(audioUrl: string): Promise<{ text: string; confidence: number; language: string }> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    // Download audio file
    const audioBuffer = await this.downloadFile(audioUrl);
    
    // Create temporary file
    const tempPath = path.join(process.cwd(), 'temp', `audio_${Date.now()}.mp3`);
    await fs.ensureDir(path.dirname(tempPath));
    await fs.writeFile(tempPath, audioBuffer);

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: 'whisper-1',
        language: 'en',
        response_format: 'json',
      });

      return {
        text: transcription.text,
        confidence: 0.95, // OpenAI doesn't provide confidence, using default
        language: transcription.language || 'en',
      };
    } finally {
      // Clean up temp file
      await fs.remove(tempPath);
    }
  }

  private async transcribeWithAnthropic(audioUrl: string): Promise<{ text: string; confidence: number; language: string }> {
    // Anthropic doesn't have a direct transcription API
    // This would require a custom implementation or fallback to OpenAI
    return this.transcribeWithOpenAI(audioUrl);
  }

  private async transcribeWithElevenLabs(audioUrl: string): Promise<{ text: string; confidence: number; language: string }> {
    if (!this.elevenLabs) {
      throw new Error('ElevenLabs client not initialized');
    }

    // Download audio file
    const audioBuffer = await this.downloadFile(audioUrl);
    
    // Create temporary file
    const tempPath = path.join(process.cwd(), 'temp', `audio_${Date.now()}.mp3`);
    await fs.ensureDir(path.dirname(tempPath));
    await fs.writeFile(tempPath, audioBuffer);

    try {
      const transcription = await this.elevenLabs.speechToText({
        audio: fs.createReadStream(tempPath),
        model_id: 'whisper-large-v3',
        language_code: 'en',
      });

      return {
        text: transcription.text,
        confidence: 0.95,
        language: 'en',
      };
    } finally {
      // Clean up temp file
      await fs.remove(tempPath);
    }
  }

  private async analyzeEmotion(text: string): Promise<EmotionalAnalysis> {
    try {
      const prompt = `Analyze the emotional content of this text and provide a JSON response with:
      - primary_emotion: the main emotion (joy, sadness, anger, fear, surprise, disgust, neutral)
      - confidence: confidence score 0-1
      - secondary_emotions: array of other emotions with confidence scores
      - arousal_level: 0-1 (calm to excited)
      - valence_level: 0-1 (negative to positive)
      
      Text: "${text}"`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const analysis = JSON.parse(response.content[0].text);

      return {
        primary_emotion: analysis.primary_emotion || 'neutral',
        confidence: analysis.confidence || 0.5,
        secondary_emotions: analysis.secondary_emotions || [],
        arousal_level: analysis.arousal_level || 0.5,
        valence_level: analysis.valence_level || 0.5,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to analyze emotion:', error);
      return {
        primary_emotion: 'neutral',
        confidence: 0.5,
        secondary_emotions: [],
        arousal_level: 0.5,
        valence_level: 0.5,
        timestamp: Date.now(),
      };
    }
  }

  private async analyzeSentiment(text: string): Promise<{ sentiment: string; keywords: string[] }> {
    try {
      const prompt = `Analyze the sentiment of this text and respond with JSON:
      {
        "sentiment": "positive|negative|neutral",
        "keywords": ["keyword1", "keyword2", "keyword3"]
      }
      
      Text: "${text}"`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        sentiment: result.sentiment || 'neutral',
        keywords: result.keywords || [],
      };
    } catch (error) {
      logger.error('Failed to analyze sentiment:', error);
      return {
        sentiment: 'neutral',
        keywords: [],
      };
    }
  }

  private async extractKeywords(text: string): Promise<string[]> {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word));

    // Remove duplicates and return top 10
    return [...new Set(words)].slice(0, 10);
  }

  private async categorizeMessage(message: Message): Promise<string> {
    // Simple categorization based on content and metadata
    const content = message.content.toLowerCase();
    
    if (content.includes('question') || content.includes('?')) {
      return 'question';
    } else if (content.includes('help') || content.includes('assist')) {
      return 'request';
    } else if (content.includes('thank') || content.includes('appreciate')) {
      return 'gratitude';
    } else if (content.includes('error') || content.includes('problem')) {
      return 'issue';
    } else {
      return 'general';
    }
  }

  private async sendEmail(emailMessage: EmailMessage): Promise<void> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not initialized');
    }

    const mailOptions = {
      from: this.config.email.smtp_user,
      to: emailMessage.to.join(', '),
      subject: emailMessage.subject,
      text: emailMessage.body,
      html: emailMessage.html_body,
      attachments: emailMessage.attachments.map(att => ({
        filename: att.filename,
        content: att.content_id ? att.content_id : att.url,
      })),
    };

    await this.emailTransporter.sendMail(mailOptions);
    logger.info(`Email sent to ${emailMessage.to.join(', ')}`);
  }

  private parseEmailContent(content: string): any {
    // Simple email parsing - in a real implementation, this would use a proper email parser
    const lines = content.split('\n');
    const headers: Record<string, string> = {};
    let bodyStart = 0;

    // Parse headers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === '') {
        bodyStart = i + 1;
        break;
      }
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        headers[key.toLowerCase()] = value;
      }
    }

    const body = lines.slice(bodyStart).join('\n');

    return {
      from: headers.from || 'unknown',
      to: headers.to ? headers.to.split(',').map((e: string) => e.trim()) : [],
      subject: headers.subject || 'No Subject',
      body,
      headers,
      attachments: [],
    };
  }

  private async processAttachments(attachments: Array<{
    type: string;
    data: string;
    name: string;
  }>): Promise<any[]> {
    const processedAttachments = [];

    for (const attachment of attachments) {
      try {
        // Save attachment to storage
        const savedAttachment = await this.saveAttachment(attachment);
        processedAttachments.push(savedAttachment);
      } catch (error) {
        logger.error(`Failed to process attachment ${attachment.name}:`, error);
      }
    }

    return processedAttachments;
  }

  private async saveAttachment(attachment: {
    type: string;
    data: string;
    name: string;
  }): Promise<any> {
    const id = uuidv4();
    const filename = `${id}_${attachment.name}`;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    await fs.ensureDir(path.dirname(filePath));
    
    // Save file
    if (attachment.data.startsWith('http')) {
      // Download from URL
      const buffer = await this.downloadFile(attachment.data);
      await fs.writeFile(filePath, buffer);
    } else {
      // Save base64 data
      const buffer = Buffer.from(attachment.data, 'base64');
      await fs.writeFile(filePath, buffer);
    }

    // Process image attachments
    if (['image', 'screenshot'].includes(attachment.type)) {
      await this.processImage(filePath);
    }

    // Get file stats
    const stats = await fs.stat(filePath);

    return {
      id,
      type: attachment.type,
      name: attachment.name,
      url: `/uploads/${filename}`,
      size: stats.size,
      mime_type: this.getMimeType(attachment.name),
      metadata: {},
      created_at: Date.now(),
    };
  }

  private async downloadFile(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${url}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  private async processImage(filePath: string): Promise<void> {
    try {
      // Generate thumbnail
      const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '_thumb$1');
      await sharp(filePath)
        .resize(200, 200, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      // Extract metadata
      const metadata = await sharp(filePath).metadata();
      
      logger.info(`Processed image: ${filePath}`, metadata);
    } catch (error) {
      logger.error(`Failed to process image ${filePath}:`, error);
    }
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private async processMessageQueue(): Promise<void> {
    while (this.processingQueue.length > 0) {
      const request = this.processingQueue.shift();
      try {
        await this.sendMessage(request);
      } catch (error) {
        logger.error('Failed to process queued message:', error);
      }
    }
  }

  private async checkEmailInbox(): Promise<void> {
    // This would implement email checking logic
    // For now, it's a placeholder
    logger.info('Checking email inbox...');
  }

  public async createChannel(channel: Omit<Channel, 'id' | 'created_at' | 'updated_at'>): Promise<Channel> {
    const newChannel: Channel = {
      id: uuidv4(),
      ...channel,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    this.activeChannels.set(newChannel.id, newChannel);
    this.emit('channelCreated', newChannel);

    return newChannel;
  }

  public async getChannel(id: string): Promise<Channel | null> {
    return this.activeChannels.get(id) || null;
  }

  public async getChannels(): Promise<Channel[]> {
    return Array.from(this.activeChannels.values());
  }

  public async getStats(): Promise<CommunicationStats> {
    // This would aggregate statistics from the database
    // For now, return placeholder stats
    return {
      total_messages: this.messageQueue.size,
      messages_by_type: {} as Record<MessageType, number>,
      messages_by_platform: {} as Record<Platform, number>,
      messages_by_status: {} as Record<MessageStatus, number>,
      total_channels: this.activeChannels.size,
      active_channels: this.activeChannels.size,
      total_attachments: 0,
      storage_used_mb: 0,
      average_response_time_ms: 0,
      voice_messages_processed: 0,
      emails_processed: 0,
      transcription_accuracy: 0.95,
      sentiment_distribution: {},
      daily_message_counts: [],
    };
  }
}
