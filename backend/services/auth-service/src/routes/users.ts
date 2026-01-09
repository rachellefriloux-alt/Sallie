import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { User } from '../models/User';

const router = Router();

// Get user profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          preferences: user.preferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('avatar').optional().isURL(),
  body('preferences').optional().isObject(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = (req as any).user?.userId;
    const { firstName, lastName, avatar, preferences } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const updatedUser = await User.update(userId, {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      avatar: avatar || user.avatar,
      preferences: preferences || user.preferences,
    });

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          preferences: updatedUser.preferences,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.updatePassword(userId, hashedNewPassword);

    // Invalidate all sessions for this user
    const { Session } = require('../models/Session');
    await Session.invalidateByUserId(userId);

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/account', [
  body('password').notEmpty(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = (req as any).user?.userId;
    const { password } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid password', 400);
    }

    // Delete user (this should cascade delete sessions and other data)
    await User.delete(userId);

    logger.info(`User account deleted: ${user.email}`);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID (admin only)
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
    const requestingUser = (req as any).user;

    // Check if user is admin or requesting their own profile
    if (requestingUser?.userId !== id && !requestingUser?.isAdmin) {
      throw createError('Unauthorized', 403);
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          preferences: user.preferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
