/**
 * Sallie Genesis Flow Service
 * Implements Section 9.2: Genesis Flow
 * Handles dream cycle, hypothesis management, veto system, and heritage promotion
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

// Import services
import { DreamCycleService } from './services/dreamCycleService';
import { HypothesisService } from './services/hypothesisService';
import { VetoSystemService } from './services/vetoSystemService';
import { HeritagePromotionService } from './services/heritagePromotionService';

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

const PORT = process.env.PORT || 8755;

// Initialize services
const dreamCycleService = new DreamCycleService();
const hypothesisService = new HypothesisService();
const vetoSystemService = new VetoSystemService();
const heritagePromotionService = new HeritagePromotionService();

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
    service: 'genesis-flow-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      dreamCycle: dreamCycleService.getStatus(),
      hypothesis: hypothesisService.getStatus(),
      vetoSystem: vetoSystemService.getStatus(),
      heritagePromotion: heritagePromotionService.getStatus()
    }
  });
});

// API Routes

// Dream Cycle Management
app.get('/api/dream-cycle/status', async (req, res) => {
  try {
    const status = await dreamCycleService.getCurrentStatus();
    res.json(status);
  } catch (error) {
    console.error('Failed to get dream cycle status:', error);
    res.status(500).json({
      error: 'Failed to retrieve dream cycle status',
      message: error.message
    });
  }
});

app.post('/api/dream-cycle/start', async (req, res) => {
  try {
    const result = await dreamCycleService.startDreamCycle();
    res.json(result);
  } catch (error) {
    console.error('Failed to start dream cycle:', error);
    res.status(500).json({
      error: 'Failed to start dream cycle',
      message: error.message
    });
  }
});

app.post('/api/dream-cycle/stop', async (req, res) => {
  try {
    const result = await dreamCycleService.stopDreamCycle();
    res.json(result);
  } catch (error) {
    console.error('Failed to stop dream cycle:', error);
    res.status(500).json({
      error: 'Failed to stop dream cycle',
      message: error.message
    });
  }
});

app.get('/api/dream-cycle/history', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const history = await dreamCycleService.getHistory(Number(limit), Number(offset));
    res.json(history);
  } catch (error) {
    console.error('Failed to get dream cycle history:', error);
    res.status(500).json({
      error: 'Failed to retrieve dream cycle history',
      message: error.message
    });
  }
});

// Hypothesis Management
app.get('/api/hypotheses', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const hypotheses = await hypothesisService.getHypotheses(status as string, Number(limit));
    res.json(hypotheses);
  } catch (error) {
    console.error('Failed to get hypotheses:', error);
    res.status(500).json({
      error: 'Failed to retrieve hypotheses',
      message: error.message
    });
  }
});

app.post('/api/hypotheses', async (req, res) => {
  try {
    const hypothesis = req.body;
    const result = await hypothesisService.createHypothesis(hypothesis);
    res.json(result);
  } catch (error) {
    console.error('Failed to create hypothesis:', error);
    res.status(500).json({
      error: 'Failed to create hypothesis',
      message: error.message
    });
  }
});

app.put('/api/hypotheses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await hypothesisService.updateHypothesis(id, updates);
    res.json(result);
  } catch (error) {
    console.error('Failed to update hypothesis:', error);
    res.status(500).json({
      error: 'Failed to update hypothesis',
      message: error.message
    });
  }
});

app.post('/api/hypotheses/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await hypothesisService.testHypothesis(id);
    res.json(result);
  } catch (error) {
    console.error('Failed to test hypothesis:', error);
    res.status(500).json({
      error: 'Failed to test hypothesis',
      message: error.message
    });
  }
});

// Veto System Management
app.get('/api/veto/active', async (req, res) => {
  try {
    const activeVetoes = await vetoSystemService.getActiveVetoes();
    res.json(activeVetoes);
  } catch (error) {
    console.error('Failed to get active vetoes:', error);
    res.status(500).json({
      error: 'Failed to retrieve active vetoes',
      message: error.message
    });
  }
});

app.post('/api/veto/trigger', async (req, res) => {
  try {
    const { reason, context, action } = req.body;
    const result = await vetoSystemService.triggerVeto(reason, context, action);
    res.json(result);
  } catch (error) {
    console.error('Failed to trigger veto:', error);
    res.status(500).json({
      error: 'Failed to trigger veto',
      message: error.message
    });
  }
});

app.post('/api/veto/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, reasoning } = req.body;
    const result = await vetoSystemService.resolveVeto(id, resolution, reasoning);
    res.json(result);
  } catch (error) {
    console.error('Failed to resolve veto:', error);
    res.status(500).json({
      error: 'Failed to resolve veto',
      message: error.message
    });
  }
});

// Heritage Promotion Management
app.get('/api/promotion/candidates', async (req, res) => {
  try {
    const candidates = await heritagePromotionService.getPromotionCandidates();
    res.json(candidates);
  } catch (error) {
    console.error('Failed to get promotion candidates:', error);
    res.status(500).json({
      error: 'Failed to retrieve promotion candidates',
      message: error.message
    });
  }
});

app.post('/api/promotion/promote', async (req, res) => {
  try {
    const { hypothesisId, reasoning } = req.body;
    const result = await heritagePromotionService.promoteToHeritage(hypothesisId, reasoning);
    res.json(result);
  } catch (error) {
    console.error('Failed to promote to heritage:', error);
    res.status(500).json({
      error: 'Failed to promote to heritage',
      message: error.message
    });
  }
});

app.get('/api/promotion/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const history = await heritagePromotionService.getPromotionHistory(Number(limit), Number(offset));
    res.json(history);
  } catch (error) {
    console.error('Failed to get promotion history:', error);
    res.status(500).json({
      error: 'Failed to retrieve promotion history',
      message: error.message
    });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to Genesis Flow Service:', socket.id);
  
  // Send current status on connection
  socket.emit('genesis-status', {
    dreamCycle: dreamCycleService.getStatus(),
    hypothesis: hypothesisService.getStatus(),
    vetoSystem: vetoSystemService.getStatus(),
    heritagePromotion: heritagePromotionService.getStatus()
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Service Event Handlers
dreamCycleService.on('dream-started', (data) => {
  io.emit('dream-started', data);
});

dreamCycleService.on('dream-completed', (data) => {
  io.emit('dream-completed', data);
  
  // Trigger hypothesis extraction
  hypothesisService.extractHypotheses(data).then(hypotheses => {
    if (hypotheses.length > 0) {
      io.emit('hypotheses-extracted', hypotheses);
    }
  });
});

hypothesisService.on('hypothesis-created', (hypothesis) => {
  io.emit('hypothesis-created', hypothesis);
});

hypothesisService.on('hypothesis-tested', (result) => {
  io.emit('hypothesis-tested', result);
  
  // Check for promotion candidates
  if (result.confidence > 0.8) {
    heritagePromotionService.evaluateForPromotion(hypothesis.id).then(evaluation => {
      if (evaluation.isCandidate) {
        io.emit('promotion-candidate', evaluation);
      }
    });
  }
});

vetoSystemService.on('veto-triggered', (veto) => {
  io.emit('veto-triggered', veto);
});

vetoSystemService.on('veto-resolved', (veto) => {
  io.emit('veto-resolved', veto);
});

heritagePromotionService.on('promotion-completed', (promotion) => {
  io.emit('promotion-completed', promotion);
});

// Initialize Services
async function initializeServices() {
  try {
    // Start dream cycle if enabled
    if (process.env.DREAM_CYCLE_ENABLED === 'true') {
      await dreamCycleService.start();
    }
    
    console.log('Genesis Flow Service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

// Scheduled Tasks
cron.schedule('0 2 * * *', async () => {
  // Daily at 2 AM: Run dream cycle
  try {
    if (process.env.DREAM_CYCLE_ENABLED === 'true') {
      await dreamCycleService.startDreamCycle();
      console.log('Daily dream cycle initiated');
    }
  } catch (error) {
    console.error('Daily dream cycle failed:', error);
  }
});

cron.schedule('*/30 * * * *', async () => {
  // Every 30 minutes: Check for hypothesis conflicts
  try {
    const conflicts = await hypothesisService.detectConflicts();
    if (conflicts.length > 0) {
      io.emit('hypothesis-conflicts', conflicts);
      console.log(`Detected ${conflicts.length} hypothesis conflicts`);
    }
  } catch (error) {
    console.error('Hypothesis conflict detection failed:', error);
  }
});

cron.schedule('0 */6 * * *', async () => {
  // Every 6 hours: Evaluate promotion candidates
  try {
    const candidates = await heritagePromotionService.getPromotionCandidates();
    if (candidates.length > 0) {
      io.emit('promotion-candidates', candidates);
      console.log(`Found ${candidates.length} promotion candidates`);
    }
  } catch (error) {
    console.error('Promotion candidate evaluation failed:', error);
  }
});

cron.schedule('0 0 * * *', async () => {
  // Daily: Cleanup old data
  try {
    await dreamCycleService.cleanupOldData();
    await hypothesisService.cleanupOldData();
    await vetoSystemService.cleanupOldData();
    await heritagePromotionService.cleanupOldData();
    
    console.log('Daily cleanup completed');
  } catch (error) {
    console.error('Daily cleanup failed:', error);
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
  
  // Stop services
  dreamCycleService.stop();
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  
  // Stop services
  dreamCycleService.stop();
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, async () => {
  console.log(`Sallie Genesis Flow Service running on port ${PORT}`);
  
  // Initialize services after server starts
  await initializeServices();
});

export default app;
