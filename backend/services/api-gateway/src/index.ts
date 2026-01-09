/**
 * SALLIE API Gateway
 * Central routing and authentication gateway
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
import { createProxyMiddleware } from 'http-proxy-middleware';

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

const PORT = process.env.PORT || 8742;

// Service URLs
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:8743',
  chat: process.env.CHAT_SERVICE_URL || 'http://localhost:8744',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8745',
  notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:8746',
  file: process.env.FILE_SERVICE_URL || 'http://localhost:8747',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:8748',
  websocket: process.env.WEBSOCKET_SERVICE_URL || 'http://localhost:8749',
  limbic: process.env.LIMBIC_SERVICE_URL || 'http://localhost:8750',
  memory: process.env.MEMORY_SERVICE_URL || 'http://localhost:8751',
  agency: process.env.AGENCY_SERVICE_URL || 'http://localhost:8752',
  communication: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:8753',
  convergence: process.env.CONVERGENCE_SERVICE_URL || 'http://localhost:8754',
  genesis: process.env.GENESIS_SERVICE_URL || 'http://localhost:8755',
  heritage: process.env.HERITAGE_SERVICE_URL || 'http://localhost:8756',
  omnis: process.env.OMNIS_SERVICE_URL || 'http://localhost:8759',
  sensor: process.env.SENSOR_SERVICE_URL || 'http://localhost:8760',
  sensorArray: process.env.SENSOR_ARRAY_SERVICE_URL || 'http://localhost:8761'
};

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
    service: 'api-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: Object.keys(SERVICES).length
  });
});

// Service Routes with Proxy Middleware
Object.entries(SERVICES).forEach(([service, url]) => {
  app.use(`/api/${service}`, createProxyMiddleware({
    target: url,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${service}`]: '/api'
    }
  }));
});

// Gateway-specific routes
app.get('/api/gateway/services', (req, res) => {
  res.json({
    services: Object.keys(SERVICES),
    urls: SERVICES,
    status: 'active'
  });
});

app.get('/api/gateway/status', async (req, res) => {
  const serviceStatus = {};
  
  for (const [service, url] of Object.entries(SERVICES)) {
    try {
      const response = await fetch(`${url}/health`);
      serviceStatus[service] = {
        url,
        status: response.ok ? 'healthy' : 'unhealthy',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      serviceStatus[service] = {
        url,
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
  
  res.json(serviceStatus);
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to API Gateway:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled Tasks
cron.schedule('*/5 * * * *', async () => {
  console.log('API Gateway - Service health check');
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

// Start server
server.listen(PORT, () => {
  console.log(`SALLIE API Gateway running on port ${PORT}`);
  console.log(`Proxying to ${Object.keys(SERVICES).length} services`);
});

export default app;
