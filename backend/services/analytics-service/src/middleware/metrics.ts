import { Request, Response, NextFunction } from 'express';
import { register } from 'prom-client';
import { logger } from '../utils/logger';

// Create a Registry to register the metrics
const register = new register();

// Define custom metrics
const httpRequestDurationMicroseconds = new register.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestTotal = new register.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const activeConnections = new register.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    
    // Record metrics
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    // Decrement active connections
    activeConnections.dec();
    
    logger.info('Request completed', {
      method: req.method,
      route,
      statusCode: res.statusCode,
      duration,
    });
  });
  
  next();
};

export const getMetrics = async (): Promise<string> => {
  return await register.metrics();
};

export { register };
