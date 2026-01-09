/**
 * SALLIE Heritage Service
 * Manages heritage compilation and preservation
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

const PORT = process.env.PORT || 8756;

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
    service: 'heritage-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Heritage Routes
app.get('/api/heritage/list', (req, res) => {
  res.json({
    heritage: [
      {
        id: 'heritage-1',
        title: 'First Heritage Compilation',
        createdAt: new Date().toISOString(),
        status: 'completed'
      }
    ]
  });
});

app.post('/api/heritage/compile', async (req, res) => {
  try {
    const { source, parameters } = req.body;
    
    // Heritage compilation logic would go here
    const heritage = {
      id: `heritage-${Date.now()}`,
      title: parameters.title || 'New Heritage',
      source,
      compiledAt: new Date().toISOString(),
      status: 'completed'
    };
    
    res.json({
      success: true,
      heritage
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to compile heritage',
      message: error.message
    });
  }
});

app.get('/api/heritage/:id', (req, res) => {
  const { id } = req.params;
  
  // Heritage retrieval logic would go here
  res.json({
    id,
    title: 'Heritage Item',
    content: 'Heritage content would be here',
    createdAt: new Date().toISOString()
  });
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to Heritage Service:', socket.id);
  
  socket.on('compile-heritage', async (data) => {
    try {
      const heritage = {
        id: `heritage-${Date.now()}`,
        ...data,
        compiledAt: new Date().toISOString()
      };
      
      socket.emit('heritage-compiled', heritage);
    } catch (error) {
      socket.emit('heritage-compilation-failed', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled Tasks
cron.schedule('0 0 * * *', async () => {
  console.log('Heritage Service - Daily heritage backup');
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
  console.log(`SALLIE Heritage Service running on port ${PORT}`);
});

export default app;
