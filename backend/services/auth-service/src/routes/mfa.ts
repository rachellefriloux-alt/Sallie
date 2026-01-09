import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { User } from '../models/User';
import { Session } from '../models/Session';

const router = Router();

// Generate MFA secret and QR code
router.post('/setup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Sallie Studio (${user.email})`,
      issuer: 'Sallie Studio',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Store secret temporarily (not yet enabled)
    await User.updateMFASecret(userId, secret.base32);

    logger.info(`MFA setup initiated for user: ${user.email}`);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        backupCodes: await generateBackupCodes(userId),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Verify and enable MFA
router.post('/enable', [
  body('token').isLength({ min: 6, max: 6 }).isNumeric(),
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
    const { token } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.mfaSecret) {
      throw createError('MFA not set up. Please setup MFA first.', 400);
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 steps before/after
    });

    if (!verified) {
      throw createError('Invalid verification code', 400);
    }

    // Enable MFA
    await User.enableMFA(userId);

    // Invalidate all existing sessions (force re-login with MFA)
    await Session.revokeByUserId(userId);

    logger.info(`MFA enabled for user: ${user.email}`);

    res.json({
      success: true,
      message: 'MFA enabled successfully. Please login again.',
    });
  } catch (error) {
    next(error);
  }
});

// Disable MFA
router.post('/disable', [
  body('password').notEmpty(),
  body('token').optional().isLength({ min: 6, max: 6 }).isNumeric(),
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
    const { password, token } = req.body;

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

    // If MFA is enabled, verify current token
    if (user.mfaEnabled && user.mfaSecret) {
      if (!token) {
        throw createError('MFA token required', 400);
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: token,
        window: 2,
      });

      if (!verified) {
        throw createError('Invalid MFA token', 400);
      }
    }

    // Disable MFA
    await User.disableMFA(userId);

    logger.info(`MFA disabled for user: ${user.email}`);

    res.json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Verify MFA token (for login)
router.post('/verify', [
  body('token').isLength({ min: 6, max: 6 }).isNumeric(),
  body('tempToken').notEmpty(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { token, tempToken } = req.body;

    // Verify temp token and get user info
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded.mfaRequired) {
      throw createError('Invalid temporary token', 400);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw createError('MFA not enabled for this user', 400);
    }

    // Verify MFA token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!verified) {
      throw createError('Invalid MFA token', 400);
    }

    // Generate final JWT token
    const finalToken = jwt.sign(
      { userId: user.id, email: user.email, mfaVerified: true },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Create session
    await Session.create({
      userId: user.id,
      token: finalToken,
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip,
    });

    logger.info(`MFA verification successful for user: ${user.email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token: finalToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Verify backup code
router.post('/backup', [
  body('code').isLength({ min: 8, max: 8 }).isAlphanumeric(),
  body('tempToken').notEmpty(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { code, tempToken } = req.body;

    // Verify temp token and get user info
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify backup code
    const isValidBackupCode = await User.verifyBackupCode(decoded.userId, code);
    if (!isValidBackupCode) {
      throw createError('Invalid backup code', 400);
    }

    // Generate final JWT token
    const finalToken = jwt.sign(
      { userId: user.id, email: user.email, mfaVerified: true },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Create session
    await Session.create({
      userId: user.id,
      token: finalToken,
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip,
    });

    logger.info(`Backup code used for user: ${user.email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token: finalToken,
      },
      message: 'Backup code used successfully. Please generate new backup codes.',
    });
  } catch (error) {
    next(error);
  }
});

// Generate new backup codes
router.post('/backup/regenerate', [
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

    // Generate new backup codes
    const backupCodes = await generateBackupCodes(userId);

    logger.info(`New backup codes generated for user: ${user.email}`);

    res.json({
      success: true,
      data: {
        backupCodes,
      },
      message: 'New backup codes generated. Save them securely.',
    });
  } catch (error) {
    next(error);
  }
});

// Get MFA status
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
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
        mfaEnabled: user.mfaEnabled || false,
        hasBackupCodes: user.backupCodes && user.backupCodes.length > 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate backup codes
async function generateBackupCodes(userId: string): Promise<string[]> {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  
  // Hash and store backup codes
  const bcrypt = require('bcryptjs');
  const hashedCodes = await Promise.all(
    codes.map(code => bcrypt.hash(code, 10))
  );
  
  await User.updateBackupCodes(userId, hashedCodes);
  return codes;
}

export { router as mfaRoutes };
