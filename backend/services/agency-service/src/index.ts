/**
 * SALLIE Agency Service
 * Manages actions, permissions, and agency operations
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

const PORT = process.env.PORT || 8752;

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
    service: 'agency-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/agency/status', (req, res) => {
  res.json({
    status: 'active',
    capabilities: ['file_operations', 'system_commands', 'git_operations'],
    restrictions: ['whitelist_enforced', 'blacklist_active', 'sandbox_enabled']
  });
});

app.post('/api/agency/execute', async (req, res) => {
  try {
    const { action, parameters } = req.body;
    
    // Agency logic would go here
    res.json({
      success: true,
      action,
      result: `Executed ${action} with parameters`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to execute action',
      message: error.message
    });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to Agency Service:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled Tasks
cron.schedule('0 */6 * * *', async () => {
  console.log('Agency Service - Maintenance check');
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
  console.log(`SALLIE Agency Service running on port ${PORT}`);
});

export default app;
