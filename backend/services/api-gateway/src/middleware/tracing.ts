import { Request, Response, NextFunction } from 'express';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace, SpanStatusCode } from '@opentelemetry/api';

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'sallie-api-gateway',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Initialize Jaeger exporter if configured
if (process.env.JAEGER_ENDPOINT) {
  const exporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT,
  });
  
  sdk.addSpanProcessor(new SimpleSpanProcessor(exporter));
}

// Start the SDK
sdk.start();

// Get tracer
const tracer = trace.getTracer('sallie-api-gateway');

// Middleware to add tracing to requests
export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`, {
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
      'user_agent': req.get('User-Agent') || '',
      'remote_addr': req.ip || req.connection.remoteAddress,
    },
  });

  // Add span to request for access in other middleware/routes
  (req as any).span = span;

  // Track response
  res.on('finish', () => {
    span.setAttributes({
      'http.status_code': res.statusCode,
      'http.status_text': res.statusMessage,
    });

    if (res.statusCode >= 400) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `HTTP ${res.statusCode}`,
      });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }

    span.end();
  });

  // Handle errors
  res.on('error', (error) => {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.end();
  });

  next();
};

// Function to trace service requests
export const traceServiceRequest = async <T>(
  serviceName: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const span = tracer.startSpan(`service.${serviceName}.${operation}`, {
    attributes: {
      'service.name': serviceName,
      'service.operation': operation,
    },
  });

  try {
    const result = await fn();
    
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    return result;
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    span.end();
    
    throw error;
  }
};

// Function to trace authentication operations
export const traceAuthentication = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const span = tracer.startSpan(`auth.${operation}`, {
    attributes: {
      'auth.operation': operation,
    },
  });

  try {
    const result = await fn();
    
    span.setAttributes({
      'auth.success': true,
    });
    
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    
    return result;
  } catch (error) {
    span.setAttributes({
      'auth.success': false,
      'auth.error': (error as Error).message,
    });
    
    span.recordException(error as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    span.end();
    
    throw error;
  }
};

// Function to add custom events to spans
export const addSpanEvent = (req: Request, eventName: string, attributes?: Record<string, any>) => {
  const span = (req as any).span;
  if (span) {
    span.addEvent(eventName, attributes);
  }
};

// Function to set span attributes
export const setSpanAttribute = (req: Request, key: string, value: any) => {
  const span = (req as any).span;
  if (span) {
    span.setAttribute(key, value);
  }
};

// Export tracer for use in other modules
export { tracer };

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry shut down successfully'))
    .catch((error) => console.error('Error shutting down OpenTelemetry', error))
    .finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry shut down successfully'))
    .catch((error) => console.error('Error shutting down OpenTelemetry', error))
    .finally(() => process.exit(0));
});
