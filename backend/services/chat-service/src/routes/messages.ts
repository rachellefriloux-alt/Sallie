import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Send message to room
router.post('/send', [
  body('roomId').isUUID(),
  body('content').trim().isLength({ min: 1, max: 4000 }),
  body('type').isIn(['text', 'image', 'file', 'system']),
  body('replyTo').optional().isUUID(),
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
    const { roomId, content, type, replyTo } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // TODO: Implement message creation in database
    const message = {
      id: `msg-${Date.now()}`,
      content,
      sender: {
        id: userId,
        name: 'Current User',
        avatar: null,
      },
      room: roomId,
      type,
      replyTo,
      timestamp: new Date().toISOString(),
      edited: false,
      reactions: [],
    };

    // TODO: Emit message via WebSocket
    // io.to(roomId).emit('newMessage', message);

    logger.info(`Message sent to room ${roomId} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        message,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Edit message
router.put('/:id', [
  param('id').isUUID(),
  body('content').trim().isLength({ min: 1, max: 4000 }),
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
    const { content } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // TODO: Implement message editing in database
    const updatedMessage = {
      id,
      content,
      sender: {
        id: userId,
        name: 'Current User',
        avatar: null,
      },
      type: 'text',
      timestamp: new Date().toISOString(),
      edited: true,
      editedAt: new Date().toISOString(),
      reactions: [],
    };

    // TODO: Emit updated message via WebSocket
    // io.to(message.room).emit('messageUpdated', updatedMessage);

    logger.info(`Message ${id} edited by user ${userId}`);

    res.json({
      success: true,
      data: {
        message: updatedMessage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete message
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

    // TODO: Implement message deletion in database
    // TODO: Check if user owns the message or has admin rights

    // TODO: Emit message deletion via WebSocket
    // io.to(message.room).emit('messageDeleted', { id });

    logger.info(`Message ${id} deleted by user ${userId}`);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// React to message
router.post('/:id/reactions', [
  param('id').isUUID(),
  body('emoji').isLength({ min: 1, max: 10 }),
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
    const { emoji } = req.body;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // TODO: Implement reaction handling in database
    const reaction = {
      emoji,
      userId,
      timestamp: new Date().toISOString(),
    };

    // TODO: Emit reaction via WebSocket
    // io.to(message.room).emit('messageReaction', { messageId: id, reaction });

    logger.info(`Reaction ${emoji} added to message ${id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        reaction,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Remove reaction from message
router.delete('/:id/reactions/:emoji', [
  param('id').isUUID(),
  param('emoji').isLength({ min: 1, max: 10 }),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id, emoji } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // TODO: Implement reaction removal in database

    // TODO: Emit reaction removal via WebSocket
    // io.to(message.room).emit('messageReactionRemoved', { messageId: id, emoji, userId });

    logger.info(`Reaction ${emoji} removed from message ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Reaction removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Pin message
router.post('/:id/pin', [
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

    // TODO: Implement message pinning in database

    // TODO: Emit pin notification via WebSocket
    // io.to(message.room).emit('messagePinned', { messageId: id, pinnedBy: userId });

    logger.info(`Message ${id} pinned by user ${userId}`);

    res.json({
      success: true,
      message: 'Message pinned successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Unpin message
router.delete('/:id/pin', [
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

    // TODO: Implement message unpinning in database

    // TODO: Emit unpin notification via WebSocket
    // io.to(message.room).emit('messageUnpinned', { messageId: id, unpinnedBy: userId });

    logger.info(`Message ${id} unpinned by user ${userId}`);

    res.json({
      success: true,
      message: 'Message unpinned successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get pinned messages for room
router.get('/room/:roomId/pinned', [
  param('roomId').isUUID(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { roomId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    // TODO: Implement database query for pinned messages
    const pinnedMessages = [
      {
        id: 'msg-1',
        content: 'Important announcement!',
        sender: {
          id: 'user-1',
          name: 'John Doe',
          avatar: null,
        },
        room: roomId,
        type: 'text',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        edited: false,
        pinned: true,
        pinnedBy: 'user-1',
        pinnedAt: new Date(Date.now() - 3000000).toISOString(),
        reactions: [],
      },
    ];

    res.json({
      success: true,
      data: {
        messages: pinnedMessages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Search messages
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const query = req.query.q as string;
    const roomId = req.query.roomId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    if (!query) {
      throw createError('Search query is required', 400);
    }

    // TODO: Implement message search in database
    const messages = [
      {
        id: 'msg-1',
        content: `Message containing "${query}"`,
        sender: {
          id: 'user-1',
          name: 'John Doe',
          avatar: null,
        },
        room: roomId || 'room-1',
        type: 'text',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        edited: false,
        reactions: [],
      },
    ];

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          limit,
          offset,
          total: messages.length,
          hasMore: false,
        },
        query,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as messageRoutes };
