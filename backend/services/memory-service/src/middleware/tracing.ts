import { Request, Response, NextFunction } from 'express';
import { trace, Span, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'memory-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const span = trace.startSpan(`HTTP ${req.method} ${req.path}`, {
    kind: 'server',
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
      'user_agent': req.get('User-Agent') || '',
      'remote_addr': req.ip || '',
    },
  });

  // Add span to request for use in route handlers
  (req as any).span = span;

  res.on('finish', () => {
    if (res.statusCode >= 400) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `HTTP ${res.statusCode}`,
      });
    } else {
      span.setStatus({
        code: SpanStatusCode.OK,
      });
    }
    span.setAttributes({
      'http.status_code': res.statusCode,
    });
    span.end();
  });

  next();
};

export const createSpan = (name: string, parentSpan?: Span): Span => {
  return trace.startSpan(name, {
    parent: parentSpan,
  });
};

export const addSpanEvent = (span: Span, name: string, attributes?: Record<string, any>): void => {
  span.addEvent(name, attributes);
};

export const setSpanAttribute = (span: Span, key: string, value: any): void => {
  span.setAttribute(key, value);
};
