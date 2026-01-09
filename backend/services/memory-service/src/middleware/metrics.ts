import { Request, Response, NextFunction } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Register default metrics
collectDefaultMetrics();

// Custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const memoryOperationsTotal = new Counter({
  name: 'memory_operations_total',
  help: 'Total number of memory operations',
  labelNames: ['operation', 'status']
});

const memoryOperationDuration = new Histogram({
  name: 'memory_operation_duration_seconds',
  help: 'Duration of memory operations in seconds',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2]
});

const memoryCountGauge = new Gauge({
  name: 'memory_count',
  help: 'Total number of memories in collection'
});

const embeddingGenerationDuration = new Histogram({
  name: 'embedding_generation_duration_seconds',
  help: 'Time taken to generate embeddings',
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const searchResultCount = new Histogram({
  name: 'search_result_count',
  help: 'Number of results returned from search',
  buckets: [1, 5, 10, 20, 50, 100]
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
  });

  next();
};

export const recordMemoryOperation = (operation: string, duration: number, success: boolean): void => {
  memoryOperationsTotal
    .labels(operation, success ? 'success' : 'error')
    .inc();
  
  memoryOperationDuration
    .labels(operation)
    .observe(duration);
};

export const recordEmbeddingGeneration = (duration: number): void => {
  embeddingGenerationDuration.observe(duration);
};

export const recordSearchResults = (count: number): void => {
  searchResultCount.observe(count);
};

export const updateMemoryCount = (count: number): void => {
  memoryCountGauge.set(count);
};

export const getMetrics = (): string => {
  return register.metrics();
};
