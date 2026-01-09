import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
    }

    // Attach user info to request
    req.user = decoded;
    
    logger.info(`User ${decoded.userId} authenticated successfully`);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
    
    logger.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Permission '${permission}' required`,
      });
    }

    next();
  };
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${role}' required`,
      });
    }

    next();
  };
};

function extractToken(req: Request): string | null {
  // Extract from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Extract from query parameter (for WebSocket connections)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }

  // Extract from cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

export { AuthenticatedRequest };
