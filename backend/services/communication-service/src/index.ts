/**
 * Sallie Communication Service
 * Multi-Modal Communication Hub - Email, Voice, Text, File Interface
 * Implements Section 9: Communication Architecture from canonical spec
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';

// Import services
import { EmailService } from './services/emailService';
import { VoiceService } from './services/voiceService';
import { FileService } from './services/fileService';
import { TextService } from './services/textService';
import { ExtractedVoiceService } from './services/extractedVoiceService';
import { WebSocketService } from './services/websocketService';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { validationMiddleware } from './middleware/validation';

// Import models
import { CommunicationRequest, EmailDraft, VoiceCommand, FileEvent } from './models/types';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8753;

// Initialize services
const emailService = new EmailService();
const voiceService = new VoiceService();
const fileService = new FileService();
const textService = new TextService();
const extractedVoiceService = new ExtractedVoiceService();
const websocketService = new WebSocketService(io);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Authentication and rate limiting
app.use('/api', authMiddleware);
app.use('/api', rateLimitMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'communication-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      email: emailService.getStatus(),
      voice: voiceService.getStatus(),
      file: fileService.getStatus(),
      extractedVoice: extractedVoiceService.getStatus()
    }
  });
});

// API Routes

// Text Communication (Section 9.1.1)
app.post('/api/text/chat', validationMiddleware.validateChatRequest, async (req, res) => {
  try {
    const request: CommunicationRequest = req.body;
    const response = await textService.processMessage(request);
    res.json(response);
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message
    });
  }
});

app.get('/api/text/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const history = await textService.getConversationHistory(
      Number(limit),
      Number(offset)
    );
    res.json(history);
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversation history',
      message: error.message
    });
  }
});

// Email Communication (Section 8.2.2)
app.post('/api/email/draft', validationMiddleware.validateEmailRequest, async (req, res) => {
  try {
    const draftRequest = req.body;
    const draft = await emailService.createDraft(draftRequest);
    res.json(draft);
  } catch (error) {
    console.error('Email draft creation error:', error);
    res.status(500).json({
      error: 'Failed to create email draft',
      message: error.message
    });
  }
});

app.post('/api/email/send', async (req, res) => {
  try {
    const { draftId, trustTier } = req.body;
    
    // Check permissions based on trust tier
    if (trustTier < 2) {
      return res.status(403).json({
        error: 'Insufficient trust tier to send emails',
        requiredTier: 2
      });
    }

    const result = await emailService.sendDraft(draftId, trustTier);
    res.json(result);
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

app.get('/api/email/outbox', async (req, res) => {
  try {
    const outbox = await emailService.getOutbox();
    res.json(outbox);
  } catch (error) {
    console.error('Outbox retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve outbox',
      message: error.message
    });
  }
});

// Voice Communication (Section 9.1.2)
app.post('/api/voice/stt', validationMiddleware.validateVoiceRequest, async (req, res) => {
  try {
    const voiceCommand: VoiceCommand = req.body;
    const transcription = await voiceService.speechToText(voiceCommand);
    res.json(transcription);
  } catch (error) {
    console.error('STT error:', error);
    res.status(500).json({
      error: 'Failed to process speech-to-text',
      message: error.message
    });
  }
});

app.post('/api/voice/tts', validationMiddleware.validateTTSRequest, async (req, res) => {
  try {
    const { text, limbicState, voiceConfig } = req.body;
    const audioResponse = await voiceService.textToSpeech(text, limbicState, voiceConfig);
    res.json(audioResponse);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({
      error: 'Failed to process text-to-speech',
      message: error.message
    });
  }
});

app.post('/api/voice/wake-word', async (req, res) => {
  try {
    const { audioData } = req.body;
    const detected = await voiceService.detectWakeWord(audioData);
    res.json(detected);
  } catch (error) {
    console.error('Wake word detection error:', error);
    res.status(500).json({
      error: 'Failed to detect wake word',
      message: error.message
    });
  }
});

// Extracted Voice Service (Section 8.2.2)
app.post('/api/voice/extracted/calibrate', async (req, res) => {
  try {
    const { writingSamples } = req.body;
    const voiceProfile = await extractedVoiceService.calibrateVoice(writingSamples);
    res.json(voiceProfile);
  } catch (error) {
    console.error('Voice calibration error:', error);
    res.status(500).json({
      error: 'Failed to calibrate extracted voice',
      message: error.message
    });
  }
});

app.get('/api/voice/extracted/profile', async (req, res) => {
  try {
    const profile = await extractedVoiceService.getVoiceProfile();
    res.json(profile);
  } catch (error) {
    console.error('Voice profile retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve voice profile',
      message: error.message
    });
  }
});

// File Interface (Section 9.1.3)
app.post('/api/file/watch', async (req, res) => {
  try {
    const { paths } = req.body;
    const watcher = await fileService.setupFileWatcher(paths);
    res.json(watcher);
  } catch (error) {
    console.error('File watcher setup error:', error);
    res.status(500).json({
      error: 'Failed to setup file watcher',
      message: error.message
    });
  }
});

app.get('/api/file/events', async (req, res) => {
  try {
    const { limit = 100, since } = req.query;
    const events = await fileService.getFileEvents(Number(limit), since);
    res.json(events);
  } catch (error) {
    console.error('File events retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve file events',
      message: error.message
    });
  }
});

app.post('/api/file/analyze', validationMiddleware.validateFileRequest, async (req, res) => {
  try {
    const { filePath, analysisType } = req.body;
    const analysis = await fileService.analyzeFile(filePath, analysisType);
    res.json(analysis);
  } catch (error) {
    console.error('File analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze file',
      message: error.message
    });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to communication service:', socket.id);
  
  websocketService.registerClient(socket);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
  });
  
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Client ${socket.id} left room ${roomId}`);
  });
  
  socket.on('typing-start', (data) => {
    socket.to(data.roomId).emit('user-typing', data);
  });
  
  socket.on('typing-stop', (data) => {
    socket.to(data.roomId).emit('user-stop-typing', data);
  });
  
  socket.on('voice-stream-start', (data) => {
    websocketService.handleVoiceStream(socket, data);
  });
  
  socket.on('voice-stream-data', (data) => {
    websocketService.processVoiceStream(socket, data);
  });
  
  socket.on('voice-stream-end', (data) => {
    websocketService.endVoiceStream(socket, data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    websocketService.unregisterClient(socket);
  });
});

// Scheduled Tasks
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily communication cleanup...');
  try {
    await emailService.cleanupOldDrafts();
    await textService.archiveOldConversations();
    await fileService.cleanupOldEvents();
    console.log('Daily cleanup completed');
  } catch (error) {
    console.error('Daily cleanup error:', error);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Sallie Communication Service running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;
