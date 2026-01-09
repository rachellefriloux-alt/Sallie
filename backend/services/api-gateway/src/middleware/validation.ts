import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

// Common validation schemas
const commonSchemas = {
  id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(100).required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
  search: Joi.object({
    query: Joi.string().min(1).max(100).required(),
    filters: Joi.object().optional(),
  }),
};

// Route-specific validation schemas
const routeSchemas = {
  'POST /api/auth/login': Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    rememberMe: Joi.boolean().default(false),
  }),
  'POST /api/auth/register': Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: commonSchemas.password,
    name: commonSchemas.name,
    acceptTerms: Joi.boolean().valid(true).required(),
  }),
  'POST /api/auth/refresh': Joi.object({
    refreshToken: Joi.string().required(),
  }),
  'POST /api/chat/messages': Joi.object({
    content: Joi.string().min(1).max(4000).required(),
    channelId: Joi.string().uuid().optional(),
    metadata: Joi.object().optional(),
  }),
  'GET /api/chat/messages': Joi.object({
    channelId: Joi.string().uuid().required(),
    ...commonSchemas.pagination.describe,
  }),
  'POST /api/analytics/events': Joi.object({
    events: Joi.array().items(
      Joi.object({
        type: Joi.string().valid(
          'page_view', 'click', 'scroll', 'form_submit', 
          'search', 'error', 'performance', 'ai_interaction'
        ).required(),
        category: Joi.string().required(),
        action: Joi.string().required(),
        label: Joi.string().optional(),
        value: Joi.number().optional(),
        properties: Joi.object().optional(),
      })
    ).min(1).max(100).required(),
  }),
  'POST /api/files/upload': Joi.object({
    file: Joi.object().required(),
    folder: Joi.string().optional(),
    isPublic: Joi.boolean().default(false),
  }),
  'POST /api/notifications/send': Joi.object({
    userId: Joi.string().uuid().required(),
    title: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(1000).required(),
    type: Joi.string().valid('info', 'success', 'warning', 'error').default('info'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    channels: Joi.array().items(
      Joi.string().valid('in_app', 'email', 'push', 'sms')
    ).default(['in_app']),
  }),
  'POST /api/ai/chat': Joi.object({
    message: Joi.string().min(1).max(4000).required(),
    model: Joi.string().valid('gpt-4', 'gpt-3.5-turbo', 'claude-3').default('gpt-4'),
    temperature: Joi.number().min(0).max(2).default(0.7),
    maxTokens: Joi.number().min(1).max(4000).default(1000),
    context: Joi.object().optional(),
  }),
};

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const routeKey = `${req.method} ${req.route?.path || req.path}`;
  const schema = routeSchemas[routeKey as keyof typeof routeSchemas];

  if (!schema) {
    // No validation schema found for this route
    return next();
  }

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    logger.warn(`Validation failed for ${routeKey}:`, validationErrors);

    return res.status(400).json({
      error: 'Validation Error',
      message: 'Request validation failed',
      errors: validationErrors,
    });
  }

  // Replace request body with validated and sanitized data
  req.body = value;
  next();
};

export const validateQuery = (
  schema: Joi.ObjectSchema,
  source: 'query' | 'params' = 'query'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === 'query' ? req.query : req.params;
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn(`Query/Param validation failed:`, validationErrors);

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Query/parameter validation failed',
        errors: validationErrors,
      });
    }

    // Update request with validated data
    if (source === 'query') {
      req.query = value as any;
    } else {
      req.params = value as any;
    }

    next();
  };
};

export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Sanitize string inputs to prevent XSS
  const sanitizeString = (str: string): string => {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

export const rateLimitValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  const checkSuspicious = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }
    if (Array.isArray(obj)) {
      return obj.some(checkSuspicious);
    }
    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(checkSuspicious);
    }
    return false;
  };

  const isSuspicious = 
    checkSuspicious(req.body) || 
    checkSuspicious(req.query) || 
    checkSuspicious(req.params);

  if (isSuspicious) {
    logger.warn('Suspicious request detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      body: req.body,
      query: req.query,
    });

    return res.status(400).json({
      error: 'Bad Request',
      message: 'Request contains suspicious content',
    });
  }

  next();
};

export { commonSchemas, routeSchemas };
