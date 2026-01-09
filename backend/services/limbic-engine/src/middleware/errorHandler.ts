import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = statusCode < 500;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };

  if (err instanceof AppError) {
    // Operational error: send message to client
    logger.error(`Operational Error: ${err.message}`, {
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(error.statusCode).json({
      success: false,
      error: err.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  } else {
    // Programming error: don't leak error details
    logger.error(`Programming Error: ${err.message}`, {
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(500).json({
      success: false,
      error: 'Something went wrong',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  }
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
