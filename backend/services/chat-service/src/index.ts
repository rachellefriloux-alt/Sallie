import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { chatRoutes } from './routes/chat';
import { messageRoutes } from './routes/messages';
import { roomRoutes } from './routes/rooms';
import { healthRoutes } from './routes/health';
import { metricsMiddleware } from './middleware/metrics';
import { tracingMiddleware } from './middleware/tracing';
import { socketHandler } from './socket/socketHandler';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);
app.use(metricsMiddleware);
app.use(tracingMiddleware);

// Routes
app.use('/health', healthRoutes);
app.use('/chat', chatRoutes);
app.use('/messages', messageRoutes);
app.use('/rooms', roomRoutes);

// Socket.IO handling
socketHandler(io);

// Error handling
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  logger.info(`Chat Service running on port ${PORT}`);
});

export default app;
