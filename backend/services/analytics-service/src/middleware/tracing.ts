import { Request, Response, NextFunction } from 'express';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { logger } from '../utils/logger';

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'analytics-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
sdk.start();

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Add tracing headers
  const traceId = generateTraceId();
  req.headers['x-trace-id'] = traceId;
  res.setHeader('x-trace-id', traceId);
  
  logger.info('Request traced', {
    traceId,
    method: req.method,
    url: req.url,
  });
  
  next();
};

function generateTraceId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => logger.info('OpenTelemetry shut down successfully'))
    .catch((error) => logger.error('Error shutting down OpenTelemetry', error))
    .finally(() => process.exit(0));
});
