import { Request, Response, NextFunction } from 'express';
import { register, Counter, Histogram, Registry } from 'prom-client';

// Create a registry for our metrics
const register = new Registry();

// Add default metrics
register.setDefaultLabels({
  app: 'sallie-ai-service',
});

// Define custom metrics
const httpRequestsTotal = new Counter({
  name: 'ai_http_requests_total',
  help: 'Total number of HTTP requests to AI service',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'ai_http_request_duration_seconds',
  help: 'Duration of AI HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

const aiRequestsTotal = new Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI processing requests',
  labelNames: ['model', 'operation', 'status'],
  registers: [register],
});

const aiRequestDuration = new Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI processing requests in seconds',
  labelNames: ['model', 'operation', 'status'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

const modelUsage = new Counter({
  name: 'model_usage_total',
  help: 'Total usage of AI models',
  labelNames: ['model', 'operation'],
  registers: [register],
});

// Middleware to track metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
};

// Function to track AI requests
export const trackAIRequest = (model: string, operation: string, status: string, duration: number) => {
  aiRequestsTotal
    .labels(model, operation, status)
    .inc();
  
  aiRequestDuration
    .labels(model, operation, status)
    .observe(duration);
  
  modelUsage
    .labels(model, operation)
    .inc();
};

// Function to get metrics for Prometheus
export const getMetrics = () => {
  return register.metrics();
};

export {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  aiRequestsTotal,
  aiRequestDuration,
  modelUsage,
};
