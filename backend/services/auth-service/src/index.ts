/**
 * SALLIE Auth Service
 * Authentication and authorization management
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cron from 'node-cron';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Configuration
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8743;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Authentication logic would go here
    const token = jwt.sign(
      { 
        id: 'user123', 
        username, 
        role: 'user',
        permissions: ['read', 'write']
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: 'user123',
        username,
        role: 'user'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Registration logic would go here
    const hashedPassword = await bcrypt.hash(password, 10);
    
    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: 'new-user-id',
        username,
        email
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    res.json({
      valid: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    const newToken = jwt.sign(
      decoded,
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    res.status(401).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to Auth Service:', socket.id);
  
  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      socket.emit('authenticated', { user: decoded });
    } catch (error) {
      socket.emit('authentication-failed', { error: 'Invalid token' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled Tasks
cron.schedule('0 2 * * *', async () => {
  console.log('Auth Service - Token cleanup');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`SALLIE Auth Service running on port ${PORT}`);
});

export default app;
