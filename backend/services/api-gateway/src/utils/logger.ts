import winston from 'winston';
import Elasticsearch from 'winston-elasticsearch';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Add Elasticsearch transport if configured
if (process.env.ELASTICSEARCH_URL) {
  transports.push(
    new Elasticsearch({
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
      },
      index: 'api-gateway-logs',
      transformer: (logData) => {
        return {
          '@timestamp': new Date().toISOString(),
          message: logData.message,
          level: logData.level,
          service: 'api-gateway',
          environment: process.env.NODE_ENV || 'development',
          ...logData.meta,
        };
      },
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logger
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'],
      userId: req.user?.userId,
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });
  
  next();
};

// Service logging utility
export const serviceLogger = (serviceName: string) => {
  return {
    info: (message: string, meta?: any) => {
      logger.info(message, { service: serviceName, ...meta });
    },
    warn: (message: string, meta?: any) => {
      logger.warn(message, { service: serviceName, ...meta });
    },
    error: (message: string, meta?: any) => {
      logger.error(message, { service: serviceName, ...meta });
    },
    debug: (message: string, meta?: any) => {
      logger.debug(message, { service: serviceName, ...meta });
    },
  };
};

// Performance logging
export const performanceLogger = {
  log: (operation: string, duration: number, meta?: any) => {
    logger.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      type: 'performance',
      ...meta,
    });
  },
  
  slowQuery: (query: string, duration: number, threshold: number = 1000) => {
    if (duration > threshold) {
      logger.warn(`Slow query detected: ${query}`, {
        query,
        duration: `${duration}ms`,
        threshold: `${threshold}ms`,
        type: 'slow_query',
      });
    }
  },
};

// Security logging
export const securityLogger = {
  auth: (event: string, userId: string, ip: string, meta?: any) => {
    logger.info(`Auth event: ${event}`, {
      event,
      userId,
      ip,
      type: 'auth',
      ...meta,
    });
  },
  
  security: (event: string, severity: 'low' | 'medium' | 'high', meta?: any) => {
    const logMethod = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    logger[logMethod](`Security event: ${event}`, {
      event,
      severity,
      type: 'security',
      ...meta,
    });
  },
  
  suspicious: (event: string, ip: string, userAgent: string, meta?: any) => {
    logger.warn(`Suspicious activity: ${event}`, {
      event,
      ip,
      userAgent,
      type: 'suspicious',
      ...meta,
    });
  },
};

// Business metrics logging
export const metricsLogger = {
  counter: (metric: string, value: number = 1, meta?: any) => {
    logger.info(`Counter: ${metric}`, {
      metric,
      value,
      type: 'counter',
      ...meta,
    });
  },
  
  gauge: (metric: string, value: number, meta?: any) => {
    logger.info(`Gauge: ${metric}`, {
      metric,
      value,
      type: 'gauge',
      ...meta,
    });
  },
  
  histogram: (metric: string, value: number, meta?: any) => {
    logger.info(`Histogram: ${metric}`, {
      metric,
      value,
      type: 'histogram',
      ...meta,
    });
  },
};

// Error logging with context
export const logError = (error: Error, context?: any) => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    type: 'error',
    ...context,
  });
};

// Structured logging for API responses
export const logApiResponse = (
  req: any,
  res: any,
  responseBody?: any,
  processingTime?: number
) => {
  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    processingTime: processingTime ? `${processingTime}ms` : undefined,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id'],
    userId: req.user?.userId,
    type: 'api_response',
  };

  if (responseBody && process.env.NODE_ENV === 'development') {
    logData.responseBody = responseBody;
  }

  if (res.statusCode >= 400) {
    logger.warn('API Response', logData);
  } else {
    logger.info('API Response', logData);
  }
};

// Health check logging
export const healthLogger = {
  check: (service: string, status: 'healthy' | 'unhealthy', responseTime?: number, error?: string) => {
    const logData = {
      service,
      status,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      error,
      type: 'health_check',
    };

    if (status === 'healthy') {
      logger.info('Health check', logData);
    } else {
      logger.error('Health check failed', logData);
    }
  },
};

export { logger, stream };
