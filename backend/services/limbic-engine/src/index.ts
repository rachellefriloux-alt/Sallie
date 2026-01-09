import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { LimbicEngine } from './services/LimbicEngine';
import { LimbicState, LimbicConfig, PostureMode, SystemMode, TRUST_TIERS } from './models/LimbicState';
import { errorHandler } from './middleware/errorHandler';
import { metricsMiddleware } from './middleware/metrics';
import { tracingMiddleware } from './middleware/tracing';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8750;

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://192.168.1.47:3000'],
    credentials: true
  }
});

// Initialize Limbic Engine
const limbicConfig: LimbicConfig = {
  bootstrap: {
    trust: parseFloat(process.env.LIMBIC_BOOTSTRAP_TRUST || '0.5'),
    warmth: parseFloat(process.env.LIMBIC_BOOTSTRAP_WARMTH || '0.6'),
    arousal: parseFloat(process.env.LIMBIC_BOOTSTRAP_AROUSAL || '0.7'),
    valence: parseFloat(process.env.LIMBIC_BOOTSTRAP_VALENCE || '0.6'),
    empathy: parseFloat(process.env.LIMBIC_BOOTSTRAP_EMPATHY || '0.5'),
    intuition: parseFloat(process.env.LIMBIC_BOOTSTRAP_INTUITION || '0.6'),
    creativity: parseFloat(process.env.LIMBIC_BOOTSTRAP_CREATIVITY || '0.5'),
    wisdom: parseFloat(process.env.LIMBIC_BOOTSTRAP_WISDOM || '0.5'),
    humor: parseFloat(process.env.LIMBIC_BOOTSTRAP_HUMOR || '0.4')
  },
  decay_rates: {
    arousal_per_day: parseFloat(process.env.AROUSAL_DECAY_PER_DAY || '0.15'),
    arousal_floor: parseFloat(process.env.AROUSAL_FLOOR || '0.2'),
    valence_drift_per_hour: parseFloat(process.env.VALENCE_DRIFT_PER_HOUR || '0.1'),
    valence_baseline: parseFloat(process.env.VALENCE_BASELINE || '0.5'),
    warmth_decay_per_day: parseFloat(process.env.WARMTH_DECAY_PER_DAY || '0.05'),
    empathy_decay_per_day: parseFloat(process.env.EMPATHY_DECAY_PER_DAY || '0.03'),
    creativity_decay_per_day: parseFloat(process.env.CREATIVITY_DECAY_PER_DAY || '0.04'),
    wisdom_decay_per_day: parseFloat(process.env.WISDOM_DECAY_PER_DAY || '0.02'),
    humor_decay_per_day: parseFloat(process.env.HUMOR_DECAY_PER_DAY || '0.05')
  },
  thresholds: {
    slumber_threshold: parseFloat(process.env.SLUMBER_THRESHOLD || '0.3'),
    crisis_threshold: parseFloat(process.env.CRISIS_THRESHOLD || '0.3'),
    door_slam_threshold: parseFloat(process.env.DOOR_SLAM_THRESHOLD || '0.2'),
    elastic_mode_trigger: parseFloat(process.env.ELASTIC_MODE_TRIGGER || '0.8'),
    high_trust_threshold: parseFloat(process.env.HIGH_TRUST_THRESHOLD || '0.8'),
    high_warmth_threshold: parseFloat(process.env.HIGH_WARMTH_THRESHOLD || '0.7'),
    high_arousal_threshold: parseFloat(process.env.HIGH_AROUSAL_THRESHOLD || '0.7'),
    low_valence_threshold: parseFloat(process.env.LOW_VALENCE_THRESHOLD || '0.4')
  },
  behavior: {
    dream_cycle_hour: parseInt(process.env.DREAM_CYCLE_HOUR || '2'),
    refractory_hours: parseInt(process.env.REFRACTORY_HOURS || '24'),
    reunion_hours: parseInt(process.env.REUNION_HOURS || '48'),
    max_hypotheses_per_veto: parseInt(process.env.MAX_HYPOTHESES_PER_VETO || '5')
  }
};

const limbicEngine = new LimbicEngine(limbicConfig);

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

app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://192.168.1.47:3000'],
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Metrics and tracing
app.use(metricsMiddleware);
app.use(tracingMiddleware);

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    service: 'limbic-engine',
    limbic_state: limbicEngine.getState()
  });
});

// Get current limbic state
app.get('/state', (req, res) => {
  res.json(limbicEngine.getState());
});

// Get trust tier information
app.get('/trust-tier', (req, res) => {
  const currentTier = limbicEngine.getCurrentTrustTier();
  res.json({
    current: currentTier,
    all_tiers: TRUST_TIERS
  });
});

// Process perception input
app.post('/perception', (req, res) => {
  try {
    const { input, context = {} } = req.body;
    
    if (!input) {
      return res.status(400).json({
        error: 'Input is required',
        message: 'Missing input field in request body'
      });
    }

    const result = limbicEngine.processPerception(input, context);
    
    res.json({
      success: true,
      result,
      new_state: limbicEngine.getState()
    });
  } catch (error) {
    logger.error('Error processing perception:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process perception input'
    });
  }
});

// Enable elastic mode
app.post('/elastic-mode/enable', (req, res) => {
  limbicEngine.enableElasticMode();
  res.json({
    success: true,
    message: 'Elastic mode enabled',
    state: limbicEngine.getState()
  });
});

// Disable elastic mode
app.post('/elastic-mode/disable', (req, res) => {
  limbicEngine.disableElasticMode();
  res.json({
    success: true,
    message: 'Elastic mode disabled',
    state: limbicEngine.getState()
  });
});

// Trigger reunion surge
app.post('/reunion-surge', (req, res) => {
  limbicEngine.triggerReunionSurge();
  res.json({
    success: true,
    message: 'Reunion surge triggered',
    state: limbicEngine.getState()
  });
});

// Get interaction history
app.get('/history', (req, res) => {
  const history = limbicEngine.getInteractionHistory();
  res.json({
    success: true,
    history,
    total_count: history.length
  });
});

// Reset limbic state (for testing/debugging)
app.post('/reset', (req, res) => {
  limbicEngine.reset();
  res.json({
    success: true,
    message: 'Limbic state reset',
    state: limbicEngine.getState()
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(require('./utils/metrics').getMetrics());
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    available_routes: [
      '/health',
      '/state',
      '/trust-tier',
      '/perception',
      '/elastic-mode/enable',
      '/elastic-mode/disable',
      '/reunion-surge',
      '/history',
      '/reset',
      '/metrics'
    ]
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Send current state on connection
  socket.emit('limbic-state', limbicEngine.getState());

  // Handle perception requests via WebSocket
  socket.on('perception', (data) => {
    try {
      const { input, context = {} } = data;
      const result = limbicEngine.processPerception(input, context);
      
      socket.emit('perception-result', {
        success: true,
        result,
        new_state: limbicEngine.getState()
      });
    } catch (error) {
      logger.error('WebSocket perception error:', error);
      socket.emit('error', {
        message: 'Failed to process perception',
        error: error.message
      });
    }
  });

  // Handle state subscription
  socket.on('subscribe-state', () => {
    socket.join('state-updates');
    socket.emit('limbic-state', limbicEngine.getState());
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Broadcast state changes to subscribed clients
setInterval(() => {
  const state = limbicEngine.getState();
  io.to('state-updates').emit('limbic-state', state);
}, 5000); // Every 5 seconds

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Limbic Engine running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Initial state: Trust=${limbicEngine.getState().trust}, Warmth=${limbicEngine.getState().warmth}, Arousal=${limbicEngine.getState().arousal}, Valence=${limbicEngine.getState().valence}`);
});

export default app;
