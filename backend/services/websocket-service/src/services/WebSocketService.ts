import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import Redis from 'ioredis';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface WebSocketMessage {
  id: string;
  type: string;
  event: string;
  data: any;
  userId?: string;
  roomId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  maxParticipants?: number;
  participants: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Participant {
  userId: string;
  socketId: string;
  username: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  metadata: Record<string, any>;
}

export interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  totalMessages: number;
  messagesPerSecond: number;
  averageLatency: number;
  roomsCount: number;
  timestamp: Date;
}

export interface MessageQueue {
  name: string;
  topic: string;
  messages: WebSocketMessage[];
  maxSize: number;
  ttl: number;
}

export class WebSocketService {
  private io: SocketIOServer;
  private redis: Redis;
  private db: Knex;
  private kafkaProducer: any; // Kafka producer
  private kafkaConsumer: any; // Kafka consumer
  private connectedUsers: Map<string, Participant> = new Map();
  private rooms: Map<string, Room> = new Map();
  private messageQueues: Map<string, MessageQueue> = new Map();
  private stats: ConnectionStats;

  constructor(io: SocketIOServer, redis: Redis, db: Knex) {
    this.io = io;
    this.redis = redis;
    this.db = db;
    
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      totalMessages: 0,
      messagesPerSecond: 0,
      averageLatency: 0,
      roomsCount: 0,
      timestamp: new Date()
    };

    this.initializeRedisAdapter();
    this.initializeKafka();
    this.setupEventHandlers();
    this.initializeStatsTracking();
  }

  private async initializeRedisAdapter(): Promise<void> {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      
      await Promise.all([pubClient.connect(), subClient.connect()]);
      
      this.io.adapter(createAdapter(pubClient, subClient));
      logger.info('Redis adapter initialized for Socket.IO');
    } catch (error) {
      logger.error('Failed to initialize Redis adapter', { error });
    }
  }

  private async initializeKafka(): Promise<void> {
    try {
      // Initialize Kafka producer and consumer
      const { Kafka } = require('kafkajs');
      
      const kafka = new Kafka({
        clientId: 'websocket-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
      });

      this.kafkaProducer = kafka.producer();
      this.kafkaConsumer = kafka.consumer({ groupId: 'websocket-service' });

      await this.kafkaProducer.connect();
      await this.kafkaConsumer.connect();

      // Subscribe to relevant topics
      await this.kafkaConsumer.subscribe({ 
        topics: ['websocket-events', 'user-notifications', 'system-events'],
        fromBeginning: false
      });

      // Start consuming messages
      this.kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.handleKafkaMessage(topic, message);
        }
      });

      logger.info('Kafka producer and consumer initialized');
    } catch (error) {
      logger.error('Failed to initialize Kafka', { error });
    }
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    // Handle Redis events for cross-server communication
    this.redis.subscribe('websocket-events', (message) => {
      const event = JSON.parse(message);
      this.handleRedisEvent(event);
    });
  }

  private async handleConnection(socket: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Authenticate user
      const token = socket.handshake.auth.token;
      const user = await this.authenticateUser(token);
      
      if (!user) {
        socket.disconnect();
        return;
      }

      // Create participant
      const participant: Participant = {
        userId: user.id,
        socketId: socket.id,
        username: user.username,
        avatar: user.avatar,
        status: 'online',
        lastSeen: new Date(),
        metadata: {
          userAgent: socket.handshake.headers['user-agent'],
          ip: socket.handshake.address,
          connectedAt: new Date()
        }
      };

      // Store participant
      this.connectedUsers.set(user.id, participant);
      await this.redis.hset('participants', user.id, JSON.stringify(participant));

      // Update stats
      this.stats.activeConnections++;
      this.stats.totalConnections++;

      // Join user to their personal room
      socket.join(`user:${user.id}`);

      // Setup socket event handlers
      this.setupSocketEventHandlers(socket, participant);

      // Send welcome message
      socket.emit('connected', {
        userId: user.id,
        socketId: socket.id,
        timestamp: new Date(),
        latency: Date.now() - startTime
      });

      // Broadcast user online status
      this.broadcastUserStatus(user.id, 'online');

      logger.info(`User connected via WebSocket`, {
        userId: user.id,
        socketId: socket.id,
        ip: socket.handshake.address
      });

    } catch (error) {
      logger.error('Failed to handle WebSocket connection', { error, socketId: socket.id });
      socket.disconnect();
    }
  }

  private setupSocketEventHandlers(socket: any, participant: Participant): void {
    // Join room
    socket.on('join-room', async (data) => {
      await this.handleJoinRoom(socket, participant, data);
    });

    // Leave room
    socket.on('leave-room', async (data) => {
      await this.handleLeaveRoom(socket, participant, data);
    });

    // Send message
    socket.on('send-message', async (data) => {
      await this.handleSendMessage(socket, participant, data);
    });

    // Typing indicators
    socket.on('typing-start', (data) => {
      this.handleTypingIndicator(socket, participant, data, 'start');
    });

    socket.on('typing-stop', (data) => {
      this.handleTypingIndicator(socket, participant, data, 'stop');
    });

    // User status updates
    socket.on('update-status', async (data) => {
      await this.handleStatusUpdate(socket, participant, data);
    });

    // Room management
    socket.on('create-room', async (data) => {
      await this.handleCreateRoom(socket, participant, data);
    });

    socket.on('delete-room', async (data) => {
      await this.handleDeleteRoom(socket, participant, data);
    });

    // Disconnection
    socket.on('disconnect', async () => {
      await this.handleDisconnection(socket, participant);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error', { error, socketId: socket.id, userId: participant.userId });
    });
  }

  private async handleJoinRoom(socket: any, participant: Participant, data: { roomId: string; password?: string }): Promise<void> {
    try {
      const room = await this.getRoom(data.roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Check if room is private and requires password
      if (room.type === 'private' && data.password !== room.metadata?.password) {
        socket.emit('error', { message: 'Invalid password' });
        return;
      }

      // Check max participants
      if (room.maxParticipants && room.participants.length >= room.maxParticipants) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // Join socket room
      socket.join(`room:${room.id}`);
      
      // Add participant to room
      if (!room.participants.includes(participant.userId)) {
        room.participants.push(participant.userId);
        await this.updateRoom(room);
      }

      // Notify room participants
      socket.to(`room:${room.id}`).emit('user-joined', {
        userId: participant.userId,
        username: participant.username,
        timestamp: new Date()
      });

      // Send room data to user
      socket.emit('room-joined', {
        room: await this.sanitizeRoom(room),
        participants: await this.getRoomParticipants(room.id)
      });

      logger.info(`User joined room`, {
        userId: participant.userId,
        roomId: room.id,
        roomName: room.name
      });

    } catch (error) {
      logger.error('Failed to join room', { error, userId: participant.userId, roomId: data.roomId });
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  private async handleLeaveRoom(socket: any, participant: Participant, data: { roomId: string }): Promise<void> {
    try {
      const room = await this.getRoom(data.roomId);
      
      if (!room) {
        return;
      }

      // Leave socket room
      socket.leave(`room:${room.id}`);
      
      // Remove participant from room
      room.participants = room.participants.filter(id => id !== participant.userId);
      await this.updateRoom(room);

      // Notify room participants
      socket.to(`room:${room.id}`).emit('user-left', {
        userId: participant.userId,
        username: participant.username,
        timestamp: new Date()
      });

      logger.info(`User left room`, {
        userId: participant.userId,
        roomId: room.id,
        roomName: room.name
      });

    } catch (error) {
      logger.error('Failed to leave room', { error, userId: participant.userId, roomId: data.roomId });
    }
  }

  private async handleSendMessage(socket: any, participant: Participant, data: {
    roomId?: string;
    type: string;
    content: any;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const message: WebSocketMessage = {
        id: uuidv4(),
        type: data.type,
        event: 'message',
        data: data.content,
        userId: participant.userId,
        roomId: data.roomId,
        timestamp: new Date(),
        metadata: data.metadata
      };

      // Store message
      await this.storeMessage(message);

      // Send to room or direct message
      if (data.roomId) {
        socket.to(`room:${data.roomId}`).emit('message', message);
        socket.emit('message-delivered', { messageId: message.id });
      } else {
        // Direct message logic
        const targetUserId = data.content.targetUserId;
        if (targetUserId) {
          this.io.to(`user:${targetUserId}`).emit('message', message);
          socket.emit('message-delivered', { messageId: message.id });
        }
      }

      // Publish to Kafka for cross-service communication
      await this.publishToKafka('websocket-events', {
        type: 'message_sent',
        message,
        participant
      });

      // Update stats
      this.stats.totalMessages++;
      await this.updateMessageStats();

      logger.info(`Message sent`, {
        messageId: message.id,
        userId: participant.userId,
        roomId: data.roomId,
        type: data.type
      });

    } catch (error) {
      logger.error('Failed to send message', { error, userId: participant.userId });
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTypingIndicator(socket: any, participant: Participant, data: { roomId?: string; targetUserId?: string }, action: 'start' | 'stop'): void {
    const eventData = {
      userId: participant.userId,
      username: participant.username,
      action,
      timestamp: new Date()
    };

    if (data.roomId) {
      socket.to(`room:${data.roomId}`).emit('typing-indicator', eventData);
    } else if (data.targetUserId) {
      this.io.to(`user:${data.targetUserId}`).emit('typing-indicator', eventData);
    }
  }

  private async handleStatusUpdate(socket: any, participant: Participant, data: { status: string }): Promise<void> {
    participant.status = data.status;
    participant.lastSeen = new Date();
    
    // Update in memory and Redis
    this.connectedUsers.set(participant.userId, participant);
    await this.redis.hset('participants', participant.userId, JSON.stringify(participant));

    // Broadcast status change
    this.broadcastUserStatus(participant.userId, data.status);

    logger.info(`User status updated`, {
      userId: participant.userId,
      status: data.status
    });
  }

  private async handleCreateRoom(socket: any, participant: Participant, data: {
    name: string;
    description?: string;
    type: 'public' | 'private';
    maxParticipants?: number;
    password?: string;
  }): Promise<void> {
    try {
      const room: Room = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        type: data.type,
        maxParticipants: data.maxParticipants,
        participants: [participant.userId],
        createdBy: participant.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        metadata: {
          password: data.password
        }
      };

      // Store room
      await this.storeRoom(room);
      this.rooms.set(room.id, room);

      // Join creator to room
      socket.join(`room:${room.id}`);

      // Send room data to creator
      socket.emit('room-created', await this.sanitizeRoom(room));

      logger.info(`Room created`, {
        roomId: room.id,
        roomName: room.name,
        createdBy: participant.userId
      });

    } catch (error) {
      logger.error('Failed to create room', { error, userId: participant.userId });
      socket.emit('error', { message: 'Failed to create room' });
    }
  }

  private async handleDeleteRoom(socket: any, participant: Participant, data: { roomId: string }): Promise<void> {
    try {
      const room = await this.getRoom(data.roomId);
      
      if (!room || room.createdBy !== participant.userId) {
        socket.emit('error', { message: 'Room not found or permission denied' });
        return;
      }

      // Remove all participants
      for (const userId of room.participants) {
        this.io.to(`user:${userId}`).emit('room-deleted', {
          roomId: room.id,
          message: 'Room has been deleted'
        });
        this.io.in(`room:${room.id}`).socketsLeave(`room:${room.id}`);
      }

      // Delete room
      await this.deleteRoom(room.id);
      this.rooms.delete(room.id);

      // Update stats
      this.stats.roomsCount = this.rooms.size;

      logger.info(`Room deleted`, {
        roomId: room.id,
        roomName: room.name,
        deletedBy: participant.userId
      });

    } catch (error) {
      logger.error('Failed to delete room', { error, userId: participant.userId });
      socket.emit('error', { message: 'Failed to delete room' });
    }
  }

  private async handleDisconnection(socket: any, participant: Participant): Promise<void> {
    try {
      // Remove from connected users
      this.connectedUsers.delete(participant.userId);
      await this.redis.hdel('participants', participant.userId);

      // Update stats
      this.stats.activeConnections--;

      // Leave all rooms
      const userRooms = await this.getUserRooms(participant.userId);
      for (const room of userRooms) {
        room.participants = room.participants.filter(id => id !== participant.userId);
        await this.updateRoom(room);

        // Notify room participants
        socket.to(`room:${room.id}`).emit('user-left', {
          userId: participant.userId,
          username: participant.username,
          timestamp: new Date()
        });
      }

      // Broadcast user offline status
      this.broadcastUserStatus(participant.userId, 'offline');

      logger.info(`User disconnected`, {
        userId: participant.userId,
        socketId: socket.id,
        duration: Date.now() - participant.metadata.connectedAt
      });

    } catch (error) {
      logger.error('Failed to handle disconnection', { error, userId: participant.userId });
    }
  }

  private async handleKafkaMessage(topic: string, message: any): Promise<void> {
    try {
      const data = JSON.parse(message.value.toString());
      
      switch (topic) {
        case 'user-notifications':
          await this.handleUserNotification(data);
          break;
        case 'system-events':
          await this.handleSystemEvent(data);
          break;
        case 'websocket-events':
          await this.handleWebSocketEvent(data);
          break;
      }

    } catch (error) {
      logger.error('Failed to handle Kafka message', { error, topic });
    }
  }

  private async handleRedisEvent(event: any): Promise<void> {
    // Handle cross-server WebSocket events
    switch (event.type) {
      case 'broadcast':
        this.io.emit(event.event, event.data);
        break;
      case 'room-broadcast':
        this.io.to(`room:${event.roomId}`).emit(event.event, event.data);
        break;
      case 'user-message':
        this.io.to(`user:${event.userId}`).emit(event.event, event.data);
        break;
    }
  }

  private async handleUserNotification(notification: any): Promise<void> {
    // Send notification to specific user
    this.io.to(`user:${notification.userId}`).emit('notification', notification);
  }

  private async handleSystemEvent(event: any): Promise<void> {
    // Broadcast system events to all connected users
    this.io.emit('system-event', event);
  }

  private async handleWebSocketEvent(event: any): Promise<void> {
    // Handle WebSocket events from other services
    switch (event.type) {
      case 'message_sent':
        // Already handled in send-message
        break;
      case 'user_status_update':
        this.broadcastUserStatus(event.userId, event.status);
        break;
    }
  }

  private async authenticateUser(token: string): Promise<any> {
    try {
      if (!token) {
        return null;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Verify user exists and is active
      const user = await this.db('users').where('id', decoded.userId).first();
      return user || null;

    } catch (error) {
      logger.error('Authentication failed', { error });
      return null;
    }
  }

  private async publishToKafka(topic: string, message: any): Promise<void> {
    try {
      await this.kafkaProducer.send({
        topic,
        messages: [{
          key: message.id || uuidv4(),
          value: JSON.stringify(message),
          timestamp: Date.now()
        }]
      });
    } catch (error) {
      logger.error('Failed to publish to Kafka', { error, topic });
    }
  }

  private async storeMessage(message: WebSocketMessage): Promise<void> {
    await this.db('messages').insert({
      id: message.id,
      type: message.type,
      event: message.event,
      data: JSON.stringify(message.data),
      userId: message.userId,
      roomId: message.roomId,
      timestamp: message.timestamp,
      metadata: JSON.stringify(message.metadata || {})
    });
  }

  private async storeRoom(room: Room): Promise<void> {
    await this.db('rooms').insert({
      id: room.id,
      name: room.name,
      description: room.description,
      type: room.type,
      maxParticipants: room.maxParticipants,
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      isActive: room.isActive,
      metadata: JSON.stringify(room.metadata || {})
    });

    // Store participants
    for (const userId of room.participants) {
      await this.db('room_participants').insert({
        roomId: room.id,
        userId,
        joinedAt: new Date()
      });
    }
  }

  private async updateRoom(room: Room): Promise<void> {
    await this.db('rooms')
      .where('id', room.id)
      .update({
        updatedAt: new Date(),
        metadata: JSON.stringify(room.metadata || {})
      });

    // Update participants
    await this.db('room_participants')
      .where('roomId', room.id)
      .del();

    for (const userId of room.participants) {
      await this.db('room_participants')
        .insert({
          roomId: room.id,
          userId,
          joinedAt: new Date()
        })
        .onConflict()
        .ignore();
    }
  }

  private async deleteRoom(roomId: string): Promise<void> {
    await this.db('rooms').where('id', roomId).del();
    await this.db('room_participants').where('roomId', roomId).del();
  }

  private async getRoom(roomId: string): Promise<Room | null> {
    const cached = this.rooms.get(roomId);
    if (cached) {
      return cached;
    }

    const room = await this.db('rooms').where('id', roomId).first();
    if (room) {
      const participants = await this.db('room_participants')
        .where('roomId', roomId)
        .pluck('userId');

      const fullRoom: Room = {
        ...room,
        participants,
        metadata: room.metadata ? JSON.parse(room.metadata) : {}
      };

      this.rooms.set(roomId, fullRoom);
      return fullRoom;
    }

    return null;
  }

  private async getUserRooms(userId: string): Promise<Room[]> {
    const roomIds = await this.db('room_participants')
      .where('userId', userId)
      .pluck('roomId');

    const rooms: Room[] = [];
    for (const roomId of roomIds) {
      const room = await this.getRoom(roomId);
      if (room) {
        rooms.push(room);
      }
    }

    return rooms;
  }

  private async getRoomParticipants(roomId: string): Promise<Participant[]> {
    const room = await this.getRoom(roomId);
    if (!room) {
      return [];
    }

    const participants: Participant[] = [];
    for (const userId of room.participants) {
      const participant = this.connectedUsers.get(userId);
      if (participant) {
        participants.push(participant);
      }
    }

    return participants;
  }

  private async sanitizeRoom(room: Room): Promise<Room> {
    // Remove sensitive information
    return {
      ...room,
      metadata: {
        ...room.metadata,
        password: undefined
      }
    };
  }

  private broadcastUserStatus(userId: string, status: string): void {
    this.io.emit('user-status', {
      userId,
      status,
      timestamp: new Date()
    });

    // Also publish to Redis for cross-server sync
    this.redis.publish('websocket-events', JSON.stringify({
      type: 'user_status_update',
      userId,
      status
    }));
  }

  private initializeStatsTracking(): void {
    setInterval(async () => {
      await this.updateMessageStats();
    }, 1000); // Update every second
  }

  private async updateMessageStats(): Promise<void> {
    const now = Date.now();
    const timeDiff = (now - this.stats.timestamp.getTime()) / 1000;
    
    if (timeDiff > 0) {
      this.stats.messagesPerSecond = this.stats.totalMessages / timeDiff;
    }
    
    this.stats.timestamp = new Date();
    this.stats.roomsCount = this.rooms.size;

    // Cache stats
    await this.redis.setex('websocket-stats', 60, JSON.stringify(this.stats));
  }

  async getStats(): Promise<ConnectionStats> {
    return this.stats;
  }

  async getConnectedUsers(): Promise<Participant[]> {
    return Array.from(this.connectedUsers.values());
  }

  async getActiveRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(room => room.isActive);
  }
}
