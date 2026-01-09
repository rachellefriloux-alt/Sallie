/**
 * Sallie Convergence Service
 * Implements Section 9.3: Great Convergence
 * Handles 14 questions, elastic mode, resonance detection, and heritage compilation
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
import fs from 'fs/promises';
import path from 'path';

// Import services
import { ConvergenceQuestionsService } from './services/convergenceQuestionsService';
import { ExtractionService } from './services/extractionService';
import { HeritageCompilationService } from './services/heritageCompilationService';
import { ResonanceDetectionService } from './services/resonanceDetectionService';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Configuration
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8757;

// Initialize services
const convergenceQuestionsService = new ConvergenceQuestionsService();
const extractionService = new ExtractionService();
const heritageCompilationService = new HeritageCompilationService();
const resonanceDetectionService = new ResonanceDetectionService();

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

// Authentication and rate limiting
app.use('/api', authMiddleware);
app.use('/api', rateLimitMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'convergence-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      questions: convergenceQuestionsService.getStatus(),
      extraction: extractionService.getStatus(),
      heritageCompilation: heritageCompilationService.getStatus(),
      resonanceDetection: resonanceDetectionService.getStatus()
    }
  });
});

// API Routes

// Convergence Status
app.get('/api/convergence/status', async (req, res) => {
  try {
    const status = await convergenceQuestionsService.getConvergenceStatus();
    res.json(status);
  } catch (error) {
    console.error('Failed to get convergence status:', error);
    res.status(500).json({
      error: 'Failed to retrieve convergence status',
      message: error.message
    });
  }
});

// 14 Questions Management
app.get('/api/convergence/questions', async (req, res) => {
  try {
    const questions = await convergenceQuestionsService.getQuestions();
    res.json(questions);
  } catch (error) {
    console.error('Failed to get convergence questions:', error);
    res.status(500).json({
      error: 'Failed to retrieve convergence questions',
      message: error.message
    });
  }
});

app.post('/api/convergence/questions/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const result = await convergenceQuestionsService.answerQuestion(id, answer);
    res.json(result);
  } catch (error) {
    console.error('Failed to answer question:', error);
    res.status(500).json({
      error: 'Failed to answer question',
      message: error.message
    });
  }
});

app.get('/api/convergence/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await convergenceQuestionsService.getQuestion(id);
    res.json(question);
  } catch (error) {
    console.error('Failed to get question:', error);
    res.status(500).json({
      error: 'Failed to retrieve question',
      message: error.message
    });
  }
});

// Extraction Prompts
app.get('/api/extraction/prompts', async (req, res) => {
  try {
    const prompts = await extractionService.getPrompts();
    res.json(prompts);
  } catch (error) {
    console.error('Failed to get extraction prompts:', error);
    res.status(500).json({
      error: 'Failed to retrieve extraction prompts',
      message: error.message
    });
  }
});

app.post('/api/extraction/prompts/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { context, parameters } = req.body;
    const result = await extractionService.executePrompt(id, context, parameters);
    res.json(result);
  } catch (error) {
    console.error('Failed to execute extraction prompt:', error);
    res.status(500).json({
      error: 'Failed to execute extraction prompt',
      message: error.message
    });
  }
});

// Heritage Compilation
app.get('/api/heritage/compilation', async (req, res) => {
  try {
    const compilation = await heritageCompilationService.getCurrentCompilation();
    res.json(compilation);
  } catch (error) {
    console.error('Failed to get heritage compilation:', error);
    res.status(500).json({
      error: 'Failed to retrieve heritage compilation',
      message: error.message
    });
  }
});

app.post('/api/heritage/compilation/generate', async (req, res) => {
  try {
    const result = await heritageCompilationService.generateCompilation();
    res.json(result);
  } catch (error) {
    console.error('Failed to generate heritage compilation:', error);
    res.status(500).json({
      error: 'Failed to generate heritage compilation',
      message: error.message
    });
  }
});

app.get('/api/heritage/compilation/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const history = await heritageCompilationService.getHistory(Number(limit), Number(offset));
    res.json(history);
  } catch (error) {
    console.error('Failed to get compilation history:', error);
    res.status(500).json({
      error: 'Failed to retrieve compilation history',
      message: error.message
    });
  }
});

// Resonance Detection
app.get('/api/resonance/detect', async (req, res) => {
  try {
    const { content, type } = req.query;
    const resonance = await resonanceDetectionService.detectResonance(content as string, type as string);
    res.json(resonance);
  } catch (error) {
    console.error('Failed to detect resonance:', error);
    res.status(500).json({
      error: 'Failed to detect resonance',
      message: error.message
    });
  }
});

app.post('/api/resonance/analyze', async (req, res) => {
  try {
    const { content, type, context } = req.body;
    const analysis = await resonanceDetectionService.analyzeResonance(content, type, context);
    res.json(analysis);
  } catch (error) {
    console.error('Failed to analyze resonance:', error);
    res.status(500).json({
      error: 'Failed to analyze resonance',
      message: error.message
    });
  }
});

app.get('/api/resonance/patterns', async (req, res) => {
  try {
    const patterns = await resonanceDetectionService.getResonancePatterns();
    res.json(patterns);
  } catch (error) {
    console.error('Failed to get resonance patterns:', error);
    res.status(500).json({
      error: 'Failed to retrieve resonance patterns',
      message: error.message
    });
  }
});

// Elastic Mode
app.post('/api/convergence/elastic-mode/enable', async (req, res) => {
  try {
    const result = await convergenceQuestionsService.enableElasticMode();
    res.json(result);
  } catch (error) {
    console.error('Failed to enable elastic mode:', error);
    res.status(500).json({
      error: 'Failed to enable elastic mode',
      message: error.message
    });
  }
});

app.post('/api/convergence/elastic-mode/disable', async (req, res) => {
  try {
    const result = await convergenceQuestionsService.disableElasticMode();
    res.json(result);
  } catch (error) {
    console.error('Failed to disable elastic mode:', error);
    res.status(500).json({
      error: 'Failed to disable elastic mode',
      message: error.message
    });
  }
});

app.get('/api/convergence/elastic-mode/status', async (req, res) => {
  try {
    const status = await convergenceQuestionsService.getElasticModeStatus();
    res.json(status);
  } catch (error) {
    console.error('Failed to get elastic mode status:', error);
    res.status(500).json({
      error: 'Failed to retrieve elastic mode status',
      message: error.message
    });
  }
});

// Mirror Test
app.post('/api/convergence/mirror-test', async (req, res) => {
  try {
    const { responses } = req.body;
    const result = await convergenceQuestionsService.performMirrorTest(responses);
    res.json(result);
  } catch (error) {
    console.error('Failed to perform mirror test:', error);
    res.status(500).json({
      error: 'Failed to perform mirror test',
      message: error.message
    });
  }
});

// Dynamic Q13
app.post('/api/convergence/dynamic-q13/generate', async (req, res) => {
  try {
    const { context, previousAnswers } = req.body;
    const question = await convergenceQuestionsService.generateDynamicQ13(context, previousAnswers);
    res.json(question);
  } catch (error) {
    console.error('Failed to generate dynamic Q13:', error);
    res.status(500).json({
      error: 'Failed to generate dynamic Q13',
      message: error.message
    });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to Convergence Service:', socket.id);
  
  // Send current status on connection
  socket.emit('convergence-status', {
    questions: convergenceQuestionsService.getStatus(),
    extraction: extractionService.getStatus(),
    heritageCompilation: heritageCompilationService.getStatus(),
    resonanceDetection: resonanceDetectionService.getStatus(),
    elasticMode: convergenceQuestionsService.getElasticModeStatus()
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Service Event Handlers
convergenceQuestionsService.on('question-answered', (data) => {
  io.emit('question-answered', data);
  
  // Check for convergence completion
  if (data.allQuestionsAnswered) {
    io.emit('convergence-ready', data);
  }
});

convergenceQuestionsService.on('convergence-completed', (data) => {
  io.emit('convergence-completed', data);
});

extractionService.on('extraction-completed', (data) => {
  io.emit('extraction-completed', data);
});

heritageCompilationService.on('compilation-updated', (data) => {
  io.emit('compilation-updated', data);
});

resonanceDetectionService.on('resonance-detected', (data) => {
  io.emit('resonance-detected', data);
});

// Initialize Services
async function initializeServices() {
  try {
    // Load convergence questions
    await convergenceQuestionsService.loadQuestions();
    
    // Initialize extraction prompts
    await extractionService.loadPrompts();
    
    // Initialize resonance patterns
    await resonanceDetectionService.loadPatterns();
    
    console.log('Convergence Service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

// Scheduled Tasks
cron.schedule('0 */6 * * *', async () => {
  // Every 6 hours: Check for resonance patterns
  try {
    const patterns = await resonanceDetectionService.analyzeRecentPatterns();
    if (patterns.length > 0) {
      io.emit('resonance-patterns-updated', patterns);
      console.log(`Detected ${patterns.length} resonance patterns`);
    }
  } catch (error) {
    console.error('Resonance pattern analysis failed:', error);
  }
});

cron.schedule('0 0 * * *', async () => {
  // Daily: Generate heritage compilation
  try {
    if (convergenceQuestionsService.isConvergenceComplete()) {
      await heritageCompilationService.generateCompilation();
      console.log('Daily heritage compilation generated');
    }
  } catch (error) {
    console.error('Daily heritage compilation failed:', error);
  }
});

cron.schedule('0 0 * * 0', async () => {
  // Weekly: Update extraction prompts
  try {
    await extractionService.updatePrompts();
    console.log('Weekly extraction prompts updated');
  } catch (error) {
    console.error('Weekly extraction prompts update failed:', error);
  }
});

cron.schedule('0 0 1 * *', async () => {
  // Monthly: Archive old data
  try {
    await convergenceQuestionsService.archiveOldData();
    await extractionService.archiveOldData();
    await heritageCompilationService.archiveOldData();
    await resonanceDetectionService.archiveOldData();
    
    console.log('Monthly data archiving completed');
  } catch (error) {
    console.error('Monthly data archiving failed:', error);
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
server.listen(PORT, async () => {
  console.log(`Sallie Convergence Service running on port ${PORT}`);
  
  // Initialize services after server starts
  await initializeServices();
});

export default app;
