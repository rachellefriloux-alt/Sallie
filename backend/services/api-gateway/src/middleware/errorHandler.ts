import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(`${service} service is currently unavailable`, 503, 'SERVICE_UNAVAILABLE');
  }
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let err = { ...error };
  err.message = error.message;

  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: error.stack,
    statusCode: err.statusCode,
    code: err.code,
    details: err.details,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id'],
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    details = error.details;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    if ((error as any).code === 11000) {
      statusCode = 409;
      code = 'DUPLICATE_ENTRY';
      message = 'Duplicate entry found';
    }
  }

  // Don't expose stack trace in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response: any = {
    error: true,
    code,
    message,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  };

  // Include details if available and in development
  if (details && (isDevelopment || statusCode < 500)) {
    response.details = details;
  }

  // Include stack trace in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  errorHandler(error, req, res, () => {});
};

export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Circuit breaker error handler
export const circuitBreakerHandler = (
  serviceName: string,
  error: Error
): AppError => {
  if (error.message.includes('ECONNREFUSED')) {
    return new ServiceUnavailableError(serviceName);
  }
  if (error.message.includes('timeout')) {
    return new AppError(
      `${serviceName} service timeout`,
      504,
      'SERVICE_TIMEOUT'
    );
  }
  return new AppError(
    `${serviceName} service error: ${error.message}`,
    502,
    'SERVICE_ERROR',
    { originalError: error.message }
  );
};

// Error response formatter
export const formatErrorResponse = (
  error: ApiError,
  includeStack: boolean = false
) => {
  const response: any = {
    error: true,
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  };

  if (error.details) {
    response.details = error.details;
  }

  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

// Error logging utility
export const logError = (
  error: Error,
  context: {
    request?: Request;
    service?: string;
    operation?: string;
    userId?: string;
  } = {}
) => {
  const logData = {
    error: error.message,
    stack: error.stack,
    name: error.name,
    context: {
      service: context.service,
      operation: context.operation,
      userId: context.userId,
      url: context.request?.url,
      method: context.request?.method,
      ip: context.request?.ip,
      userAgent: context.request?.get('User-Agent'),
      requestId: context.request?.headers['x-request-id'],
    },
  };

  if (error instanceof AppError && error.statusCode < 500) {
    logger.warn('Client error:', logData);
  } else {
    logger.error('Server error:', logData);
  }
};
