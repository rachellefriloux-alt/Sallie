import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { validateRequest } from './middleware/validation';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { metricsMiddleware } from './middleware/metrics';
import { tracingMiddleware } from './middleware/tracing';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8742;

// Redis client for rate limiting
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Rate limiter using Redis
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl_api_gateway',
  points: parseInt(process.env.API_RATE_LIMIT || '100'),
  duration: 60,
  blockDuration: 60,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      auth: 'unknown',
      chat: 'unknown',
      analytics: 'unknown',
      notifications: 'unknown',
      files: 'unknown',
      ai: 'unknown',
      websocket: 'unknown',
    },
  });
});

// Rate limiting middleware
const rateLimitMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
      retryAfter: secs,
    });
  }
};

// Apply rate limiting to all routes
app.use(rateLimitMiddleware);

// Service configurations
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8743',
    path: '/api/auth',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
  },
  chat: {
    target: process.env.CHAT_SERVICE_URL || 'http://localhost:8744',
    path: '/api/chat',
    changeOrigin: true,
    pathRewrite: { '^/api/chat': '' },
  },
  analytics: {
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8745',
    path: '/api/analytics',
    changeOrigin: true,
    pathRewrite: { '^/api/analytics': '' },
  },
  notifications: {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8746',
    path: '/api/notifications',
    changeOrigin: true,
    pathRewrite: { '^/api/notifications': '' },
  },
  files: {
    target: process.env.FILE_SERVICE_URL || 'http://localhost:8747',
    path: '/api/files',
    changeOrigin: true,
    pathRewrite: { '^/api/files': '' },
  },
  ai: {
    target: process.env.AI_SERVICE_URL || 'http://localhost:8748',
    path: '/api/ai',
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '' },
  },
  websocket: {
    target: process.env.WEBSOCKET_SERVICE_URL || 'http://localhost:8749',
    path: '/api/ws',
    changeOrigin: true,
    pathRewrite: { '^/api/ws': '' },
    ws: true,
  },
};

// Create proxy middleware for each service
Object.entries(services).forEach(([serviceName, config]) => {
  const proxy = createProxyMiddleware({
    target: config.target,
    changeOrigin: config.changeOrigin,
    pathRewrite: config.pathRewrite,
    ws: config.ws || false,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}:`, err);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Service Unavailable',
          message: `The ${serviceName} service is currently unavailable`,
          service: serviceName,
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add authentication headers if token exists
      const token = req.headers.authorization;
      if (token) {
        proxyReq.setHeader('Authorization', token);
      }
      
      // Add request ID for tracing
      const requestId = req.headers['x-request-id'] || generateRequestId();
      proxyReq.setHeader('X-Request-ID', requestId);
      
      logger.info(`Proxying ${req.method} ${req.path} to ${serviceName} service`);
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Response from ${serviceName} service: ${proxyRes.statusCode}`);
    },
  });

  app.use(config.path, proxy);
});

// Authentication middleware for protected routes
app.use('/api/protected', authMiddleware);

// Validation middleware
app.use('/api', validateRequest);

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
    availableRoutes: Object.keys(services).map(key => services[key].path),
  });
});

// Generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close Redis connection
  await redisClient.quit();
  
  // Close server
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  // Close Redis connection
  await redisClient.quit();
  
  // Close server
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Available services:', Object.keys(services));
});

export default app;
