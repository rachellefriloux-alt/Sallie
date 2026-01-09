/**
 * SALLIE Limbic Service
 * Manages emotional state and limbic system operations
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

const PORT = process.env.PORT || 8750;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'limbic-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Limbic System Routes
app.get('/api/limbic/state', (req, res) => {
  res.json({
    trust: 0.75,
    warmth: 0.68,
    arousal: 0.72,
    valence: 0.65,
    empathy: 0.61,
    intuition: 0.67,
    creativity: 0.58,
    wisdom: 0.62,
    humor: 0.45,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/limbic/update', async (req, res) => {
  try {
    const { state } = req.body;
    
    // Limbic state update logic would go here
    const updatedState = {
      ...state,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      state: updatedState
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update limbic state',
      message: error.message
    });
  }
});

app.post('/api/limbic/process-emotion', async (req, res) => {
  try {
    const { emotion, intensity, context } = req.body;
    
    // Emotion processing logic would go here
    const processedEmotion = {
      emotion,
      intensity,
      context,
      processed: true,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      emotion: processedEmotion
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process emotion',
      message: error.message
    });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to Limbic Service:', socket.id);
  
  socket.on('emotion-input', async (data) => {
    try {
      const processedEmotion = {
        ...data,
        processed: true,
        timestamp: new Date().toISOString()
      };
      
      socket.emit('emotion-processed', processedEmotion);
    } catch (error) {
      socket.emit('emotion-processing-failed', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled Tasks
cron.schedule('*/10 * * * *', async () => {
  console.log('Limbic Service - Emotional state decay');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`SALLIE Limbic Service running on port ${PORT}`);
});

export default app;
