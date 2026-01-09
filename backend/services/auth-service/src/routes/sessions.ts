import { Router, Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { Session } from '../models/Session';
import { User } from '../models/User';

const router = Router();

// Get all active sessions for the current user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const sessions = await Session.findByUserId(userId);
    
    // Filter out inactive sessions and remove sensitive data
    const activeSessions = sessions
      .filter(session => session.isActive)
      .map(session => ({
        id: session.id,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        lastAccessAt: session.lastAccessAt,
        isCurrent: session.token === req.headers.authorization?.replace('Bearer ', ''),
      }));

    res.json({
      success: true,
      data: {
        sessions: activeSessions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get session details
router.get('/:id', [
  param('id').isUUID(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const session = await Session.findById(id);
    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check if session belongs to the current user
    if (session.userId !== userId) {
      throw createError('Unauthorized', 403);
    }

    // Get user information
    const user = await User.findById(session.userId);
    
    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          user: {
            id: user?.id,
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
          },
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          createdAt: session.createdAt,
          lastAccessAt: session.lastAccessAt,
          isActive: session.isActive,
          isCurrent: session.token === req.headers.authorization?.replace('Bearer ', ''),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Revoke a specific session
router.delete('/:id', [
  param('id').isUUID(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const session = await Session.findById(id);
    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check if session belongs to the current user
    if (session.userId !== userId) {
      throw createError('Unauthorized', 403);
    }

    // Don't allow revoking the current session through this endpoint
    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    if (session.token === currentToken) {
      throw createError('Cannot revoke current session. Use logout instead.', 400);
    }

    await Session.revoke(id);

    logger.info(`Session revoked: ${id} for user: ${userId}`);

    res.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Revoke all sessions except current
router.delete('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const currentToken = req.headers.authorization?.replace('Bearer ', '');

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    if (!currentToken) {
      throw createError('No token provided', 401);
    }

    // Revoke all sessions except current
    const revokedCount = await Session.revokeAllExceptCurrent(userId, currentToken);

    logger.info(`Revoked ${revokedCount} sessions for user: ${userId}`);

    res.json({
      success: true,
      message: `Revoked ${revokedCount} sessions successfully`,
      data: {
        revokedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Revoke all sessions (including current)
router.delete('/all/force', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // Revoke all sessions for the user
    const revokedCount = await Session.revokeByUserId(userId);

    logger.info(`Force revoked all ${revokedCount} sessions for user: ${userId}`);

    res.json({
      success: true,
      message: `Revoked all ${revokedCount} sessions successfully. Please login again.`,
      data: {
        revokedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get session statistics
router.get('/stats/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const stats = await Session.getStatsByUserId(userId);

    res.json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as sessionRoutes };
