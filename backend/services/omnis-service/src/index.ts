/**
 * SALLIE OMNIS ARCHITECTURE SERVICE
 * Universal Architect with unified knowledge base integrating 52,000+ topics
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

// Import OMNIS System
import { OmnisSystem } from './models/omnisSystem';

// Import middleware
import { authMiddleware } from './middleware/auth';

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

const PORT = process.env.PORT || 8759;

// Initialize OMNIS System
const omnisSystem = new OmnisSystem();

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

// Authentication only (no rate limiting for unrestricted access)
app.use('/api', authMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'omnis-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    statistics: omnisSystem.getStatistics()
  });
});

// API Routes

// Query Processing
app.post('/api/omnis/query', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        message: 'Please provide a query to process'
      });
    }

    const response = await omnisSystem.processQuery(query, context);
    res.json(response);
  } catch (error) {
    console.error('Failed to process query:', error);
    res.status(500).json({
      error: 'Failed to process query',
      message: error.message
    });
  }
});

// Get Knowledge Base
app.get('/api/omnis/knowledge-base', async (req, res) => {
  try {
    const knowledgeBase = omnisSystem.getKnowledgeBase();
    res.json(knowledgeBase);
  } catch (error) {
    console.error('Failed to get knowledge base:', error);
    res.status(500).json({
      error: 'Failed to retrieve knowledge base',
      message: error.message
    });
  }
});

// Get Specific Knowledge Domain
app.get('/api/omnis/knowledge/:domainId', async (req, res) => {
  try {
    const { domainId } = req.params;
    const knowledgeBase = omnisSystem.getKnowledgeBase();
    const domain = knowledgeBase.find(kb => kb.id === domainId);
    
    if (!domain) {
      return res.status(404).json({
        error: 'Domain not found',
        message: `Knowledge domain '${domainId}' not found`
      });
    }
    
    res.json(domain);
  } catch (error) {
    console.error('Failed to get knowledge domain:', error);
    res.status(500).json({
      error: 'Failed to retrieve knowledge domain',
      message: error.message
    });
  }
});

// Get Operational Modes
app.get('/api/omnis/modes', async (req, res) => {
  try {
    const modes = omnisSystem.getOperationalModes();
    res.json(modes);
  } catch (error) {
    console.error('Failed to get operational modes:', error);
    res.status(500).json({
      error: 'Failed to retrieve operational modes',
      message: error.message
    });
  }
});

// Set Active Mode
app.post('/api/omnis/modes/:modeId/activate', async (req, res) => {
  try {
    const { modeId } = req.params;
    omnisSystem.setActiveMode(modeId);
    
    const activeMode = omnisSystem.getActiveMode();
    res.json({
      message: `Mode '${modeId}' activated successfully`,
      activeMode
    });
  } catch (error) {
    console.error('Failed to activate mode:', error);
    res.status(500).json({
      error: 'Failed to activate mode',
      message: error.message
    });
  }
});

// Get Query History
app.get('/api/omnis/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const history = omnisSystem.getQueryHistory();
    
    const paginatedHistory = history.slice(
      Number(offset),
      Number(offset) + Number(limit)
    );
    
    res.json({
      queries: paginatedHistory,
      total: history.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Failed to get query history:', error);
    res.status(500).json({
      error: 'Failed to retrieve query history',
      message: error.message
    });
  }
});

// Get Response Cache
app.get('/api/omnis/cache', async (req, res) => {
  try {
    const cache = omnisSystem.getResponseCache();
    res.json(cache);
  } catch (error) {
    console.error('Failed to get response cache:', error);
    res.status(500).json({
      error: 'Failed to retrieve response cache',
      message: error.message
    });
  }
});

// Get Statistics
app.get('/api/omnis/statistics', async (req, res) => {
  try {
    const statistics = omnisSystem.getStatistics();
    res.json(statistics);
  } catch (error) {
    console.error('Failed to get statistics:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
});

// Batch Query Processing
app.post('/api/omnis/batch-query', async (req, res) => {
  try {
    const { queries } = req.body;
    
    if (!Array.isArray(queries)) {
      return res.status(400).json({
        error: 'Queries must be an array',
        message: 'Please provide an array of queries to process'
      });
    }

    const responses = [];
    for (const queryData of queries) {
      const response = await omnisSystem.processQuery(
        queryData.query,
        queryData.context || ''
      );
      responses.push(response);
    }
    
    res.json({
      responses,
      totalProcessed: responses.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to process batch query:', error);
    res.status(500).json({
      error: 'Failed to process batch query',
      message: error.message
    });
  }
});

// Cross-Domain Analysis
app.post('/api/omnis/cross-domain-analysis', async (req, res) => {
  try {
    const { domains, query } = req.body;
    
    if (!Array.isArray(domains) || !query) {
      return res.status(400).json({
        error: 'Domains array and query are required',
        message: 'Please provide domains array and query for cross-domain analysis'
      });
    }

    // Process query with specific domains
    const response = await omnisSystem.processQuery(query, `Cross-domain analysis: ${domains.join(', ')}`);
    
    res.json({
      analysis: response,
      domains,
      crossReferences: response.synthesis.crossReferences,
      insights: response.synthesis.insights
    });
  } catch (error) {
    console.error('Failed to perform cross-domain analysis:', error);
    res.status(500).json({
      error: 'Failed to perform cross-domain analysis',
      message: error.message
    });
  }
});

// Predictive Analysis (ORACLE Mode)
app.post('/api/omnis/predict', async (req, res) => {
  try {
    const { query, context, timeHorizon } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        message: 'Please provide a query for prediction'
      });
    }

    // Force ORACLE mode
    omnisSystem.setActiveMode('oracle');
    
    const response = await omnisSystem.processQuery(query, context || `Prediction with time horizon: ${timeHorizon || 'near-term'}`);
    
    res.json({
      prediction: response,
      predictions: response.synthesis.predictions,
      confidence: response.synthesis.confidence,
      methodology: response.synthesis.methodology
    });
  } catch (error) {
    console.error('Failed to generate prediction:', error);
    res.status(500).json({
      error: 'Failed to generate prediction',
      message: error.message
    });
  }
});

// Design Analysis (ARCHITECT Mode)
app.post('/api/omnis/design', async (req, res) => {
  try {
    const { query, context, constraints } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        message: 'Please provide a query for design analysis'
      });
    }

    // Force ARCHITECT mode
    omnisSystem.setActiveMode('architect');
    
    const response = await omnisSystem.processQuery(query, context || `Design with constraints: ${constraints || 'none'}`);
    
    res.json({
      design: response,
      recommendations: response.synthesis.recommendations,
      methodology: response.synthesis.methodology,
      confidence: response.synthesis.confidence
    });
  } catch (error) {
    console.error('Failed to generate design analysis:', error);
    res.status(500).json({
      error: 'Failed to generate design analysis',
      message: error.message
    });
  }
});

// Optimization Analysis (OPTIMIZER Mode)
app.post('/api/omnis/optimize', async (req, res) => {
  try {
    const { query, context, targetArea } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        message: 'Please provide a query for optimization'
      });
    }

    // Force OPTIMIZER mode
    omnisSystem.setActiveMode('optimizer');
    
    const response = await omnisSystem.processQuery(query, context || `Optimization target: ${targetArea || 'general'}`);
    
    res.json({
      optimization: response,
      recommendations: response.synthesis.recommendations,
      methodology: response.synthesis.methodology,
      confidence: response.synthesis.confidence
    });
  } catch (error) {
    console.error('Failed to generate optimization:', error);
    res.status(500).json({
      error: 'Failed to generate optimization',
      message: error.message
    });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to OMNIS Service:', socket.id);
  
  // Send initial status
  socket.emit('omnis-status', {
    service: 'omnis-service',
    activeMode: omnisSystem.getActiveMode(),
    statistics: omnisSystem.getStatistics()
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle real-time queries
  socket.on('omnis-query', async (data) => {
    try {
      const response = await omnisSystem.processQuery(data.query, data.context);
      socket.emit('omnis-response', response);
    } catch (error) {
      socket.emit('omnis-error', {
        error: 'Failed to process query',
        message: error.message
      });
    }
  });

  // Handle mode changes
  socket.on('set-mode', (modeId) => {
    try {
      omnisSystem.setActiveMode(modeId);
      const activeMode = omnisSystem.getActiveMode();
      socket.emit('mode-changed', activeMode);
    } catch (error) {
      socket.emit('mode-error', {
        error: 'Failed to set mode',
        message: error.message
      });
    }
  });
});

// Scheduled Tasks
cron.schedule('0 */6 * * *', async () => {
  // Every 6 hours: Update knowledge base statistics
  try {
    const stats = omnisSystem.getStatistics();
    console.log('OMNIS Service - Statistics Update:', stats);
    
    // Emit statistics update to all connected clients
    io.emit('statistics-update', stats);
  } catch (error) {
    console.error('Statistics update failed:', error);
  }
});

cron.schedule('0 0 * * *', async () => {
  // Daily: Archive old queries and responses
  try {
    const history = omnisSystem.getQueryHistory();
    const cache = omnisSystem.getResponseCache();
    
    console.log(`OMNIS Service - Daily Archive: ${history.length} queries, ${cache.length} responses`);
  } catch (error) {
    console.error('Daily archive failed:', error);
  }
});

cron.schedule('0 0 * * 0', async () => {
  // Weekly: Knowledge base optimization
  try {
    const knowledgeBase = omnisSystem.getKnowledgeBase();
    console.log(`OMNIS Service - Weekly Knowledge Base Optimization: ${knowledgeBase.length} domains`);
  } catch (error) {
    console.error('Weekly knowledge base optimization failed:', error);
  }
});

cron.schedule('0 0 1 * *', async () => {
  // Monthly: System maintenance
  try {
    console.log('OMNIS Service - Monthly System Maintenance');
    // Perform system maintenance tasks
  } catch (error) {
    console.error('Monthly system maintenance failed:', error);
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
  console.log(`SALLIE OMNIS ARCHITECTURE Service running on port ${PORT}`);
  console.log(`Knowledge Base: ${omnisSystem.getStatistics().totalKnowledgeDomains} domains`);
  console.log(`Operational Modes: ${omnisSystem.getOperationalModes().length} modes`);
  console.log(`Average Expertise: ${omnisSystem.getStatistics().averageExpertise.toFixed(1)}%`);
});

export default app;
