/**
 * SALLIE Sensor Service
 * Manages individual sensor operations and data collection
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

const PORT = process.env.PORT || 8760;

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
    service: 'sensor-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Sensor Routes
app.get('/api/sensor/status', (req, res) => {
  res.json({
    sensors: [
      {
        id: 'sensor-1',
        type: 'temperature',
        status: 'active',
        lastReading: 22.5,
        unit: 'celsius',
        timestamp: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/sensor/reading', async (req, res) => {
  try {
    const { sensorId, value, unit, metadata } = req.body;
    
    // Sensor reading storage logic would go here
    const reading = {
      id: `reading-${Date.now()}`,
      sensorId,
      value,
      unit,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      reading
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to store sensor reading',
      message: error.message
    });
  }
});

app.get('/api/sensor/:id/readings', (req, res) => {
  const { id } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  // Sensor readings retrieval logic would go here
  res.json({
    sensorId: id,
    readings: [
      {
        id: 'reading-1',
        value: 22.5,
        unit: 'celsius',
        timestamp: new Date().toISOString()
      }
    ],
    total: 1,
    limit: Number(limit),
    offset: Number(offset)
  });
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected to Sensor Service:', socket.id);
  
  socket.on('sensor-data', async (data) => {
    try {
      const reading = {
        id: `reading-${Date.now()}`,
        ...data,
        timestamp: new Date().toISOString()
      };
      
      socket.emit('sensor-reading-stored', reading);
    } catch (error) {
      socket.emit('sensor-storage-failed', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled Tasks
cron.schedule('*/1 * * * *', async () => {
  console.log('Sensor Service - Data collection');
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
  console.log(`SALLIE Sensor Service running on port ${PORT}`);
});

export default app;
