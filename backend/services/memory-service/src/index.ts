/**
 * SALLIE Memory Service
 * Manages memory storage, retrieval, and vector operations
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

const PORT = process.env.PORT || 8751;

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
    service: 'memory-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Memory Routes
app.get('/api/memory/search', (req, res) => {
  const { query, limit = 10 } = req.query;
  
  // Memory search logic would go here
  res.json({
    memories: [
      {
        id: 'memory-1',
        content: 'Sample memory content',
        relevance: 0.95,
        timestamp: new Date().toISOString()
      }
    ],
    query,
    total: 1
  });
});

app.post('/api/memory/store', async (req, res) => {
  try {
    const { content, metadata, tags } = req.body;
    
    // Memory storage logic would go here
    const memory = {
      id: `memory-${Date.now()}`,
      content,
      metadata,
      tags,
      storedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      memory
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to store memory',
      message: error.message
    });
  }
});

app.get('/api/memory/:id', (req, res) => {
  const { id } = req.params;
  
  // Memory retrieval logic would go here
  res.json({
    id,
    content: 'Memory content',
    metadata: {},
    tags: [],
    createdAt: new Date().toISOString()
  });
});

app.delete('/api/memory/:id', (req, res) => {
  const { id } = req.params;
  
  // Memory deletion logic would go here
  res.json({
    success: true,
    message: `Memory ${id} deleted`
  });
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to Memory Service:', socket.id);
  
  socket.on('memory-search', async (data) => {
    try {
      const results = {
        memories: [
          {
            id: 'memory-1',
            content: 'Search result',
            relevance: 0.95,
            timestamp: new Date().toISOString()
          }
        ],
        query: data.query
      };
      
      socket.emit('memory-search-results', results);
    } catch (error) {
      socket.emit('memory-search-failed', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled Tasks
cron.schedule('0 */4 * * *', async () => {
  console.log('Memory Service - Memory consolidation');
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
  console.log(`SALLIE Memory Service running on port ${PORT}`);
});

export default app;
