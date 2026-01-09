import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    statusCode,
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        stack: err.stack,
        statusCode,
      },
    });
  } else {
    res.status(statusCode).json({
      success: false,
      error: {
        message: statusCode === 500 ? 'Internal Server Error' : message,
        statusCode,
      },
    });
  }
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
