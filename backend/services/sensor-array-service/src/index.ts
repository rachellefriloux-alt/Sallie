/**
 * Sallie Sensor Array Service
 * Implements Section 10: Sensor Array
 * Monitors file system, system load, patterns, and user behavior
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
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

// Import services
import { FileWatcherService } from './services/fileWatcherService';
import { SystemMonitorService } from './services/systemMonitorService';
import { PatternDetectionService } from './services/patternDetectionService';
import { ProactiveEngagementService } from './services/proactiveEngagementService';

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

const PORT = process.env.PORT || 8754;

// Initialize services
const fileWatcherService = new FileWatcherService();
const systemMonitorService = new SystemMonitorService();
const patternDetectionService = new PatternDetectionService();
const proactiveEngagementService = new ProactiveEngagementService();

// Event emitter for sensor events
const sensorEvents = new EventEmitter();

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
    service: 'sensor-array-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      fileWatcher: fileWatcherService.getStatus(),
      systemMonitor: systemMonitorService.getStatus(),
      patternDetection: patternDetectionService.getStatus(),
      proactiveEngagement: proactiveEngagementService.getStatus()
    }
  });
});

// API Routes

// File System Monitoring
app.get('/api/files/watched', async (req, res) => {
  try {
    const watchedPaths = fileWatcherService.getWatchedPaths();
    res.json({ paths: watchedPaths });
  } catch (error) {
    console.error('Failed to get watched paths:', error);
    res.status(500).json({
      error: 'Failed to retrieve watched paths',
      message: error.message
    });
  }
});

app.post('/api/files/watch', async (req, res) => {
  try {
    const { paths } = req.body;
    const result = await fileWatcherService.watchPaths(paths);
    res.json(result);
  } catch (error) {
    console.error('Failed to setup file watching:', error);
    res.status(500).json({
      error: 'Failed to setup file watching',
      message: error.message
    });
  }
});

app.get('/api/files/events', async (req, res) => {
  try {
    const { limit = 100, since } = req.query;
    const events = await fileWatcherService.getFileEvents(Number(limit), since);
    res.json(events);
  } catch (error) {
    console.error('Failed to get file events:', error);
    res.status(500).json({
      error: 'Failed to retrieve file events',
      message: error.message
    });
  }
});

// System Monitoring
app.get('/api/system/status', async (req, res) => {
  try {
    const status = await systemMonitorService.getCurrentStatus();
    res.json(status);
  } catch (error) {
    console.error('Failed to get system status:', error);
    res.status(500).json({
      error: 'Failed to retrieve system status',
      message: error.message
    });
  }
});

app.get('/api/system/history', async (req, res) => {
  try {
    const { limit = 100, hours = 24 } = req.query;
    const history = await systemMonitorService.getHistory(Number(limit), Number(hours));
    res.json(history);
  } catch (error) {
    console.error('Failed to get system history:', error);
    res.status(500).json({
      error: 'Failed to retrieve system history',
      message: error.message
    });
  }
});

// Pattern Detection
app.get('/api/patterns/detected', async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    const patterns = await patternDetectionService.getDetectedPatterns(type, Number(limit));
    res.json(patterns);
  } catch (error) {
    console.error('Failed to get detected patterns:', error);
    res.status(500).json({
      error: 'Failed to retrieve detected patterns',
      message: error.message
    });
  }
});

app.post('/api/patterns/analyze', async (req, res) => {
  try {
    const { data, patternType } = req.body;
    const analysis = await patternDetectionService.analyzePattern(data, patternType);
    res.json(analysis);
  } catch (error) {
    console.error('Failed to analyze pattern:', error);
    res.status(500).json({
      error: 'Failed to analyze pattern',
      message: error.message
    });
  }
});

// Proactive Engagement
app.get('/api/engagement/suggestions', async (req, res) => {
  try {
    const suggestions = await proactiveEngagementService.getSuggestions();
    res.json(suggestions);
  } catch (error) {
    console.error('Failed to get engagement suggestions:', error);
    res.status(500).json({
      error: 'Failed to retrieve engagement suggestions',
      message: error.message
    });
  }
});

app.post('/api/engagement/trigger', async (req, res) => {
  try {
    const { type, context } = req.body;
    const result = await proactiveEngagementService.triggerEngagement(type, context);
    res.json(result);
  } catch (error) {
    console.error('Failed to trigger engagement:', error);
    res.status(500).json({
      error: 'Failed to trigger engagement',
      message: error.message
    });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to sensor array service:', socket.id);
  
  // Send current status on connection
  socket.emit('sensor-status', {
    fileWatcher: fileWatcherService.getStatus(),
    systemMonitor: systemMonitorService.getStatus(),
    patternDetection: patternDetectionService.getStatus(),
    proactiveEngagement: proactiveEngagementService.getStatus()
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Service Event Handlers
sensorEvents.on('file-event', (event) => {
  io.emit('file-event', event);
  
  // Check for patterns
  patternDetectionService.analyzeEvent(event).then(patterns => {
    if (patterns.length > 0) {
      io.emit('pattern-detected', patterns);
    }
  });
});

sensorEvents.on('system-alert', (alert) => {
  io.emit('system-alert', alert);
  
  // Trigger proactive engagement if needed
  if (alert.severity === 'high') {
    proactiveEngagementService.handleSystemAlert(alert);
  }
});

sensorEvents.on('pattern-detected', (pattern) => {
  io.emit('pattern-detected', pattern);
  
  // Handle proactive engagement based on pattern
  proactiveEngagementService.handlePattern(pattern);
});

// Initialize Services
async function initializeServices() {
  try {
    // Start file watching
    const watchPaths = (process.env.WATCH_PATHS || './work,./projects,./documents').split(',');
    await fileWatcherService.watchPaths(watchPaths);
    
    // Start system monitoring
    await systemMonitorService.start();
    
    // Start pattern detection
    await patternDetectionService.start();
    
    // Start proactive engagement
    await proactiveEngagementService.start();
    
    console.log('Sensor Array Service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

// Scheduled Tasks
cron.schedule('*/5 * * * *', async () => {
  // Every 5 minutes: Check system status
  try {
    const status = await systemMonitorService.getCurrentStatus();
    
    // Emit status via WebSocket
    io.emit('system-status', status);
    
    // Check for alerts
    if (status.cpu > 0.8 || status.memory > 0.9) {
      sensorEvents.emit('system-alert', {
        type: 'resource_high',
        severity: status.cpu > 0.9 || status.memory > 0.95 ? 'high' : 'medium',
        message: 'High resource usage detected',
        data: status
      });
    }
  } catch (error) {
    console.error('System status check failed:', error);
  }
});

cron.schedule('0 */2 * * *', async () => {
  // Every 2 hours: Analyze patterns
  try {
    const patterns = await patternDetectionService.analyzeRecentEvents();
    
    if (patterns.length > 0) {
      patterns.forEach(pattern => {
        sensorEvents.emit('pattern-detected', pattern);
      });
    }
  } catch (error) {
    console.error('Pattern analysis failed:', error);
  }
});

cron.schedule('0 0 * * *', async () => {
  // Daily: Cleanup old data
  try {
    await fileWatcherService.cleanupOldEvents();
    await systemMonitorService.cleanupOldData();
    await patternDetectionService.cleanupOldPatterns();
    
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
  fileWatcherService.stop();
  systemMonitorService.stop();
  patternDetectionService.stop();
  proactiveEngagementService.stop();
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  
  // Stop services
  fileWatcherService.stop();
  systemMonitorService.stop();
  patternDetectionService.stop();
  proactiveEngagementService.stop();
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, async () => {
  console.log(`Sallie Sensor Array Service running on port ${PORT}`);
  
  // Initialize services after server starts
  await initializeServices();
});

export default app;
