import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { QdrantMemoryService } from './services/QdrantClient';
import { MemoryConfig, MemoryCreateRequest, MemorySearchRequest, MemoryUpdateRequest, MemoryDeleteRequest, MemoryType, MemorySource } from './models/Memory';
import { errorHandler } from './middleware/errorHandler';
import { metricsMiddleware } from './middleware/metrics';
import { tracingMiddleware } from './middleware/tracing';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8751;

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://192.168.1.47:3000'],
    credentials: true
  }
});

// Initialize Memory Service configuration
const memoryConfig: MemoryConfig = {
  embedding_model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
  embedding_dimension: parseInt(process.env.EMBEDDING_DIMENSION || '1536'),
  max_batch_size: parseInt(process.env.MAX_BATCH_SIZE || '100'),
  search_limit_default: parseInt(process.env.SEARCH_LIMIT_DEFAULT || '10'),
  search_threshold_default: parseFloat(process.env.SEARCH_THRESHOLD_DEFAULT || '0.7'),
  salience_decay_rate: parseFloat(process.env.SALIENCE_DECAY_RATE || '0.01'),
  freshness_weight: parseFloat(process.env.FRESHNESS_WEIGHT || '0.2'),
  diversity_weight: parseFloat(process.env.DIVERSITY_WEIGHT || '0.1'),
  mrr_lambda: parseFloat(process.env.MRR_LAMBDA || '0.5'),
  auto_cleanup_days: parseInt(process.env.AUTO_CLEANUP_DAYS || '365'),
  compression_enabled: process.env.COMPRESSION_ENABLED === 'true',
  cache_size_mb: parseInt(process.env.CACHE_SIZE_MB || '100'),
  retention_policy: {
    max_age_days: parseInt(process.env.MAX_AGE_DAYS || '730'),
    max_memories_per_actor: parseInt(process.env.MAX_MEMORIES_PER_ACTOR || '10000'),
    importance_threshold: parseFloat(process.env.IMPORTANCE_THRESHOLD || '0.3'),
    salience_threshold: parseFloat(process.env.SALIENCE_THRESHOLD || '0.2'),
    preserve_heritage: process.env.PRESERVE_HERITAGE !== 'false',
    preserve_high_importance: process.env.PRESERVE_HIGH_IMPORTANCE !== 'false',
    preserve_recent: parseInt(process.env.PRESERVE_RECENT || '30')
  }
};

const memoryService = new QdrantMemoryService(memoryConfig);

// Initialize the service
memoryService.initialize().then(() => {
  logger.info('Memory Service initialized successfully');
}).catch(error => {
  logger.error('Failed to initialize Memory Service:', error);
  process.exit(1);
});

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
app.get('/health', async (req, res) => {
  try {
    const stats = await memoryService.getCollectionStats();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      service: 'memory-service',
      collection_stats: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Create memory
app.post('/memories', async (req, res) => {
  try {
    const request: MemoryCreateRequest = req.body;
    
    if (!request.content || !request.metadata) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'content and metadata are required'
      });
    }

    const memory = await memoryService.createMemory(request);
    
    res.status(201).json({
      success: true,
      memory
    });
  } catch (error) {
    logger.error('Failed to create memory:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create memory'
    });
  }
});

// Search memories
app.post('/memories/search', async (req, res) => {
  try {
    const request: MemorySearchRequest = req.body;
    
    if (!request.query) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'query is required'
      });
    }

    const result = await memoryService.searchMemories(request);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    logger.error('Failed to search memories:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search memories'
    });
  }
});

// Get memory by ID
app.get('/memories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const memory = await memoryService.getMemoryById(id);
    
    if (!memory) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Memory not found'
      });
    }
    
    res.json({
      success: true,
      memory
    });
  } catch (error) {
    logger.error('Failed to get memory:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get memory'
    });
  }
});

// Update memory
app.put('/memories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const request: MemoryUpdateRequest = { id, ...req.body };
    
    const memory = await memoryService.updateMemory(request);
    
    res.json({
      success: true,
      memory
    });
  } catch (error) {
    logger.error('Failed to update memory:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Memory not found'
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update memory'
      });
    }
  }
});

// Delete memory
app.delete('/memories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { actor_id, permanent } = req.query;
    
    await memoryService.deleteMemory({ 
      id, 
      actor_id: actor_id as string,
      permanent: permanent === 'true'
    });
    
    res.json({
      success: true,
      message: 'Memory deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete memory:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete memory'
    });
  }
});

// Get collection statistics
app.get('/stats', async (req, res) => {
  try {
    const stats = await memoryService.getCollectionStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Failed to get stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get collection statistics'
    });
  }
});

// Get memory types and sources
app.get('/metadata', (req, res) => {
  res.json({
    success: true,
    data: {
      types: Object.values(MemoryType),
      sources: Object.values(MemorySource),
      config: memoryConfig
    }
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
      '/memories',
      '/memories/search',
      '/memories/:id',
      '/stats',
      '/metadata',
      '/metrics'
    ]
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Handle memory search via WebSocket
  socket.on('search-memories', async (data) => {
    try {
      const request: MemorySearchRequest = data;
      const result = await memoryService.searchMemories(request);
      
      socket.emit('search-result', {
        success: true,
        result,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('WebSocket search error:', error);
      socket.emit('error', {
        message: 'Failed to search memories',
        error: error.message
      });
    }
  });

  // Handle memory creation via WebSocket
  socket.on('create-memory', async (data) => {
    try {
      const request: MemoryCreateRequest = data;
      const memory = await memoryService.createMemory(request);
      
      socket.emit('memory-created', {
        success: true,
        memory,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('WebSocket create error:', error);
      socket.emit('error', {
        message: 'Failed to create memory',
        error: error.message
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

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
  logger.info(`Memory Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Qdrant URL: ${process.env.QDRANT_URL || 'http://localhost:6333'}`);
  logger.info(`Collection: ${process.env.QDRANT_COLLECTION || 'sallie_memories'}`);
});

export default app;
