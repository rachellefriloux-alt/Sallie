import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

interface AuthenticatedSocket extends Socket {
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface SocketData {
  userId: string;
  roomId?: string;
  lastSeen?: Date;
}

const connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socket IDs
const userSockets = new Map<string, SocketData>(); // socketId -> SocketData
const roomUsers = new Map<string, Set<string>>(); // roomId -> Set of userIds

export const socketHandler = (io: SocketIOServer) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // TODO: Verify user exists in database
      const user = {
        id: decoded.userId,
        email: decoded.email,
        firstName: 'User',
        lastName: 'Name',
      };

      socket.userId = user.id;
      socket.user = user;

      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.userId} connected via socket ${socket.id}`);

    // Track user connection
    if (!connectedUsers.has(socket.userId)) {
      connectedUsers.set(socket.userId, new Set());
    }
    connectedUsers.get(socket.userId)!.add(socket.id);

    userSockets.set(socket.id, {
      userId: socket.userId,
      lastSeen: new Date(),
    });

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Send online status to friends
    socket.broadcast.emit('userOnline', {
      userId: socket.userId,
      user: socket.user,
    });

    // Handle joining rooms
    socket.on('joinRoom', async (data: { roomId: string }) => {
      try {
        const { roomId } = data;

        // TODO: Verify user has permission to join room
        socket.join(roomId);

        // Update tracking
        userSockets.set(socket.id, {
          ...userSockets.get(socket.id)!,
          roomId,
        });

        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId)!.add(socket.userId);

        // Notify room members
        socket.to(roomId).emit('userJoinedRoom', {
          roomId,
          user: socket.user,
        });

        // Send current room members to user
        const roomMemberIds = Array.from(roomUsers.get(roomId) || []);
        socket.emit('roomMembers', {
          roomId,
          members: roomMemberIds,
        });

        logger.info(`User ${socket.userId} joined room ${roomId}`);
      } catch (error) {
        logger.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving rooms
    socket.on('leaveRoom', async (data: { roomId: string }) => {
      try {
        const { roomId } = data;

        socket.leave(roomId);

        // Update tracking
        userSockets.set(socket.id, {
          ...userSockets.get(socket.id)!,
          roomId: undefined,
        });

        roomUsers.get(roomId)?.delete(socket.userId);

        // Notify room members
        socket.to(roomId).emit('userLeftRoom', {
          roomId,
          user: socket.user,
        });

        logger.info(`User ${socket.userId} left room ${roomId}`);
      } catch (error) {
        logger.error('Error leaving room:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
      const { roomId, isTyping } = data;
      
      socket.to(roomId).emit('userTyping', {
        roomId,
        userId: socket.userId,
        user: socket.user,
        isTyping,
      });
    });

    // Handle message sending
    socket.on('sendMessage', async (data: {
      roomId: string;
      content: string;
      type: string;
      replyTo?: string;
    }) => {
      try {
        const { roomId, content, type, replyTo } = data;

        // TODO: Save message to database
        const message = {
          id: `msg-${Date.now()}`,
          content,
          sender: socket.user,
          room: roomId,
          type,
          replyTo,
          timestamp: new Date().toISOString(),
          edited: false,
          reactions: [],
        };

        // Broadcast to room
        io.to(roomId).emit('newMessage', message);

        logger.info(`Message sent in room ${roomId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message editing
    socket.on('editMessage', async (data: {
      messageId: string;
      content: string;
      roomId: string;
    }) => {
      try {
        const { messageId, content, roomId } = data;

        // TODO: Update message in database
        const updatedMessage = {
          id: messageId,
          content,
          sender: socket.user,
          type: 'text',
          timestamp: new Date().toISOString(),
          edited: true,
          editedAt: new Date().toISOString(),
          reactions: [],
        };

        // Broadcast to room
        io.to(roomId).emit('messageUpdated', updatedMessage);

        logger.info(`Message ${messageId} edited by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message deletion
    socket.on('deleteMessage', async (data: {
      messageId: string;
      roomId: string;
    }) => {
      try {
        const { messageId, roomId } = data;

        // TODO: Delete message from database

        // Broadcast to room
        io.to(roomId).emit('messageDeleted', { messageId });

        logger.info(`Message ${messageId} deleted by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle message reactions
    socket.on('addReaction', async (data: {
      messageId: string;
      emoji: string;
      roomId: string;
    }) => {
      try {
        const { messageId, emoji, roomId } = data;

        // TODO: Add reaction to database
        const reaction = {
          emoji,
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to room
        io.to(roomId).emit('messageReaction', {
          messageId,
          reaction,
        });

        logger.info(`Reaction ${emoji} added to message ${messageId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error adding reaction:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle direct messages
    socket.on('sendDirectMessage', async (data: {
      recipientId: string;
      content: string;
      type: string;
    }) => {
      try {
        const { recipientId, content, type } = data;

        // TODO: Save direct message to database
        const message = {
          id: `dm-${Date.now()}`,
          content,
          sender: socket.user,
          recipient: { id: recipientId },
          type,
          timestamp: new Date().toISOString(),
          edited: false,
          reactions: [],
        };

        // Send to recipient
        io.to(`user:${recipientId}`).emit('newDirectMessage', message);
        // Send to sender for confirmation
        socket.emit('directMessageSent', message);

        logger.info(`Direct message sent from ${socket.userId} to ${recipientId}`);
      } catch (error) {
        logger.error('Error sending direct message:', error);
        socket.emit('error', { message: 'Failed to send direct message' });
      }
    });

    // Handle user status updates
    socket.on('updateStatus', (data: { status: string; customStatus?: string }) => {
      const { status, customStatus } = data;
      
      // Broadcast status to all connected users
      socket.broadcast.emit('userStatusUpdated', {
        userId: socket.userId,
        user: socket.user,
        status,
        customStatus,
      });

      logger.info(`User ${socket.userId} updated status to ${status}`);
    });

    // Handle read receipts
    socket.on('markAsRead', (data: { messageId: string; roomId?: string }) => {
      const { messageId, roomId } = data;
      
      // TODO: Update read status in database
      
      if (roomId) {
        // Notify room members
        socket.to(roomId).emit('messageRead', {
          messageId,
          userId: socket.userId,
        });
      } else {
        // Direct message
        socket.emit('directMessageRead', {
          messageId,
          userId: socket.userId,
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User ${socket.userId} disconnected: ${reason}`);

      // Clean up tracking
      connectedUsers.get(socket.userId)?.delete(socket.id);
      if (connectedUsers.get(socket.userId)?.size === 0) {
        connectedUsers.delete(socket.userId);
      }

      const socketData = userSockets.get(socket.id);
      if (socketData?.roomId) {
        roomUsers.get(socketData.roomId)?.delete(socket.userId);
      }

      userSockets.delete(socket.id);

      // Notify others if user is completely offline
      if (!connectedUsers.has(socket.userId)) {
        socket.broadcast.emit('userOffline', {
          userId: socket.userId,
          user: socket.user,
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Periodic cleanup of disconnected sockets
  setInterval(() => {
    const now = new Date();
    for (const [socketId, data] of userSockets.entries()) {
      if (data.lastSeen && (now.getTime() - data.lastSeen.getTime() > 300000)) { // 5 minutes
        userSockets.delete(socketId);
      }
    }
  }, 60000); // Check every minute
};

// Helper functions for external use
export const getOnlineUsers = (): string[] => {
  return Array.from(connectedUsers.keys());
};

export const getUsersInRoom = (roomId: string): string[] => {
  return Array.from(roomUsers.get(roomId) || []);
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const getUserSockets = (userId: string): string[] => {
  return Array.from(connectedUsers.get(userId) || []);
};
