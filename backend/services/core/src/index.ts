/**
 * SALLIE Core Service
 * Central coordination and orchestration service
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Configuration
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'core-service',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/core/status', (req, res) => {
  res.json({
    service: 'Sallie Core Service',
    status: 'active',
    version: '1.0.0',
    capabilities: [
      'orchestration',
      'coordination',
      'central-management',
      'service-discovery'
    ]
  });
});

// Socket.IO for real-time coordination
io.on('connection', (socket) => {
  console.log('Core service connected:', socket.id);
  
  socket.on('service-register', (data) => {
    console.log('Service registered:', data);
    socket.broadcast.emit('service-registered', data);
  });
  
  socket.on('service-status', (data) => {
    socket.broadcast.emit('service-status-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Core service disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8760;
server.listen(PORT, () => {
  console.log(`🧠 Sallie Core Service running on port ${PORT}`);
});

export { app, io };
