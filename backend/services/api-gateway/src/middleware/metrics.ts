import { Request, Response, NextFunction } from 'express';
import { register, Counter, Histogram, Registry } from 'prom-client';

// Create a registry for our metrics
const register = new Registry();

// Add default metrics (CPU, memory, etc.)
register.setDefaultLabels({
  app: 'sallie-api-gateway',
});

// Define custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const activeConnections = new Counter({
  name: 'active_connections_total',
  help: 'Total number of active connections',
  registers: [register],
});

const serviceRequestsTotal = new Counter({
  name: 'service_requests_total',
  help: 'Total number of requests to backend services',
  labelNames: ['service', 'method', 'status_code'],
  registers: [register],
});

const serviceRequestDuration = new Histogram({
  name: 'service_request_duration_seconds',
  help: 'Duration of service requests in seconds',
  labelNames: ['service', 'method', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const authenticationTotal = new Counter({
  name: 'authentication_total',
  help: 'Total number of authentication attempts',
  labelNames: ['result'], // success, failure, invalid_token
  registers: [register],
});

const rateLimitHits = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint'],
  registers: [register],
});

// Middleware to track metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    // Record HTTP request metrics
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    // Decrement active connections
    activeConnections.dec();
  });
  
  next();
};

// Function to track service requests
export const trackServiceRequest = (service: string, method: string, statusCode: number, duration: number) => {
  serviceRequestsTotal
    .labels(service, method, statusCode.toString())
    .inc();
  
  serviceRequestDuration
    .labels(service, method, statusCode.toString())
    .observe(duration);
};

// Function to track authentication attempts
export const trackAuthentication = (result: 'success' | 'failure' | 'invalid_token') => {
  authenticationTotal.labels(result).inc();
};

// Function to track rate limit hits
export const trackRateLimit = (endpoint: string) => {
  rateLimitHits.labels(endpoint).inc();
};

// Function to get metrics for Prometheus
export const getMetrics = () => {
  return register.metrics();
};

// Function to reset all metrics (useful for testing)
export const resetMetrics = () => {
  register.clear();
};

export {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  serviceRequestsTotal,
  serviceRequestDuration,
  authenticationTotal,
  rateLimitHits,
};
