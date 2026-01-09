import { Request, Response, NextFunction } from 'express';
import { trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { logger } from '../utils/logger';

const tracer = trace.getTracer('auth-service');

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`, {
    kind: SpanKind.SERVER,
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
      'http.host': req.get('host') || '',
      'user.agent': req.get('User-Agent') || '',
    },
  });

  // Add span to request for later use
  (req as any).span = span;

  res.on('finish', () => {
    span.setAttributes({
      'http.status_code': res.statusCode,
    });

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

    span.end();
  });

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
