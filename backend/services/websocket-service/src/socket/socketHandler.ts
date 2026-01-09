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
  rooms: Set<string>;
  lastSeen?: Date;
  metadata?: Record<string, any>;
}

const connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socket IDs
const userSockets = new Map<string, SocketData>(); // socketId -> SocketData
const roomMembers = new Map<string, Set<string>>(); // room -> Set of userIds
const socketRooms = new Map<string, Set<string>>(); // socketId -> Set of rooms

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
      rooms: new Set(),
      lastSeen: new Date(),
    });

    socketRooms.set(socket.id, new Set());

    // Join user to their personal room
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    socketRooms.get(socket.id)!.add(userRoom);

    // Send connection confirmation
    socket.emit('connected', {
      socketId: socket.id,
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });

    // Broadcast user online status
    socket.broadcast.emit('userOnline', {
      userId: socket.userId,
      user: socket.user,
      timestamp: new Date().toISOString(),
    });

    // Handle joining rooms
    socket.on('joinRoom', async (data: { room: string; metadata?: any }) => {
      try {
        const { room, metadata } = data;

        // Join the room
        socket.join(room);
        socketRooms.get(socket.id)!.add(room);

        // Update tracking
        const socketData = userSockets.get(socket.id)!;
        socketData.rooms.add(room);
        if (metadata) {
          socketData.metadata = { ...socketData.metadata, ...metadata };
        }

        // Track room membership
        if (!roomMembers.has(room)) {
          roomMembers.set(room, new Set());
        }
        roomMembers.get(room)!.add(socket.userId);

        // Notify room members
        socket.to(room).emit('userJoinedRoom', {
          room,
          user: socket.user,
          timestamp: new Date().toISOString(),
        });

        // Send current room members to user
        const roomMemberIds = Array.from(roomMembers.get(room) || []);
        socket.emit('roomMembers', {
          room,
          members: roomMemberIds,
          timestamp: new Date().toISOString(),
        });

        logger.info(`User ${socket.userId} joined room ${room}`);
      } catch (error) {
        logger.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room', timestamp: new Date().toISOString() });
      }
    });

    // Handle leaving rooms
    socket.on('leaveRoom', async (data: { room: string }) => {
      try {
        const { room } = data;

        socket.leave(room);
        socketRooms.get(socket.id)!.delete(room);

        // Update tracking
        const socketData = userSockets.get(socket.id)!;
        socketData.rooms.delete(room);

        roomMembers.get(room)?.delete(socket.userId);

        // Notify room members
        socket.to(room).emit('userLeftRoom', {
          room,
          user: socket.user,
          timestamp: new Date().toISOString(),
        });

        logger.info(`User ${socket.userId} left room ${room}`);
      } catch (error) {
        logger.error('Error leaving room:', error);
        socket.emit('error', { message: 'Failed to leave room', timestamp: new Date().toISOString() });
      }
    });

    // Handle sending messages to rooms
    socket.on('sendMessage', async (data: {
      room: string;
      event: string;
      data: any;
      target?: 'room' | 'user' | 'broadcast';
      targetId?: string;
    }) => {
      try {
        const { room, event, data: messageData, target = 'room', targetId } = data;

        const message = {
          id: `msg-${Date.now()}`,
          sender: socket.user,
          room,
          event,
          data: messageData,
          timestamp: new Date().toISOString(),
        };

        switch (target) {
          case 'room':
            socket.to(room).emit(event, message);
            break;
          case 'user':
            if (targetId) {
              io.to(`user:${targetId}`).emit(event, message);
            }
            break;
          case 'broadcast':
            socket.broadcast.emit(event, message);
            break;
        }

        // Send confirmation to sender
        socket.emit('messageSent', {
          ...message,
          delivered: true,
          timestamp: new Date().toISOString(),
        });

        logger.info(`Message sent to ${target} ${targetId || room} by user ${socket.userId}: ${event}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message', timestamp: new Date().toISOString() });
      }
    });

    // Handle direct messages to users
    socket.on('sendDirectMessage', async (data: {
      targetUserId: string;
      event: string;
      data: any;
    }) => {
      try {
        const { targetUserId, event, data: messageData } = data;

        const message = {
          id: `dm-${Date.now()}`,
          sender: socket.user,
          targetUserId,
          event,
          data: messageData,
          timestamp: new Date().toISOString(),
        };

        // Send to target user
        io.to(`user:${targetUserId}`).emit('directMessage', message);

        // Send confirmation to sender
        socket.emit('directMessageSent', {
          ...message,
          delivered: true,
          timestamp: new Date().toISOString(),
        });

        logger.info(`Direct message sent from ${socket.userId} to ${targetUserId}: ${event}`);
      } catch (error) {
        logger.error('Error sending direct message:', error);
        socket.emit('error', { message: 'Failed to send direct message', timestamp: new Date().toISOString() });
      }
    });

    // Handle presence updates
    socket.on('updatePresence', (data: {
      status?: 'online' | 'away' | 'busy' | 'offline';
      metadata?: Record<string, any>;
    }) => {
      try {
        const { status, metadata } = data;

        // Update user presence
        const presenceData = {
          userId: socket.userId,
          user: socket.user,
          status: status || 'online',
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
        };

        // Broadcast to all connected users
        socket.broadcast.emit('presenceUpdated', presenceData);

        // Update tracking
        const socketData = userSockets.get(socket.id);
        if (socketData) {
          socketData.metadata = { ...socketData.metadata, ...metadata };
        }

        logger.info(`Presence updated for user ${socket.userId}: ${status}`);
      } catch (error) {
        logger.error('Error updating presence:', error);
        socket.emit('error', { message: 'Failed to update presence', timestamp: new Date().toISOString() });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: {
      room?: string;
      targetUserId?: string;
      isTyping: boolean;
    }) => {
      try {
        const { room, targetUserId, isTyping } = data;

        const typingData = {
          userId: socket.userId,
          user: socket.user,
          isTyping,
          timestamp: new Date().toISOString(),
        };

        if (room) {
          socket.to(room).emit('userTyping', { ...typingData, room });
        } else if (targetUserId) {
          io.to(`user:${targetUserId}`).emit('userTyping', typingData);
        }

      } catch (error) {
        logger.error('Error handling typing indicator:', error);
      }
    });

    // Handle room status updates
    socket.on('updateRoomStatus', (data: {
      room: string;
      status: Record<string, any>;
    }) => {
      try {
        const { room, status } = data;

        const statusData = {
          room,
          status,
          updatedBy: socket.user,
          timestamp: new Date().toISOString(),
        };

        socket.to(room).emit('roomStatusUpdated', statusData);

        logger.info(`Room status updated for ${room} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error updating room status:', error);
        socket.emit('error', { message: 'Failed to update room status', timestamp: new Date().toISOString() });
      }
    });

    // Handle heartbeat/ping
    socket.on('ping', () => {
      socket.emit('pong', {
        timestamp: new Date().toISOString(),
      });
    });

    // Handle getting online users
    socket.on('getOnlineUsers', () => {
      const onlineUsers = Array.from(connectedUsers.keys());
      socket.emit('onlineUsers', {
        users: onlineUsers,
        count: onlineUsers.length,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle getting room members
    socket.on('getRoomMembers', (data: { room: string }) => {
      try {
        const { room } = data;
        const members = Array.from(roomMembers.get(room) || []);
        socket.emit('roomMembers', {
          room,
          members,
          count: members.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Error getting room members:', error);
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
      if (socketData) {
        // Remove user from all rooms
        socketData.rooms.forEach(room => {
          roomMembers.get(room)?.delete(socket.userId);
          socket.to(room).emit('userLeftRoom', {
            room,
            user: socket.user,
            timestamp: new Date().toISOString(),
          });
        });

        userSockets.delete(socket.id);
      }

      socketRooms.delete(socket.id);

      // Notify others if user is completely offline
      if (!connectedUsers.has(socket.userId)) {
        socket.broadcast.emit('userOffline', {
          userId: socket.userId,
          user: socket.user,
          timestamp: new Date().toISOString(),
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
        socketRooms.delete(socketId);
      }
    }
  }, 60000); // Check every minute

  // Handle server-wide events
  io.on('connection', (socket) => {
    // Send server status
    socket.emit('serverStatus', {
      status: 'online',
      connectedUsers: connectedUsers.size,
      activeRooms: roomMembers.size,
      timestamp: new Date().toISOString(),
    });
  });
};

// Helper functions for external use
export const getOnlineUsers = (): string[] => {
  return Array.from(connectedUsers.keys());
};

export const getUsersInRoom = (room: string): string[] => {
  return Array.from(roomMembers.get(room) || []);
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const getUserSockets = (userId: string): string[] => {
  return Array.from(connectedUsers.get(userId) || []);
};

export const getRoomCount = (): number => {
  return roomMembers.size;
};

export const broadcastToRoom = (io: SocketIOServer, room: string, event: string, data: any) => {
  io.to(room).emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const broadcastToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const broadcastToAll = (io: SocketIOServer, event: string, data: any) => {
  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};
