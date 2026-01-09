import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { analyticsRoutes } from './routes/analytics';
import { metricsRoutes } from './routes/metrics';
import { reportsRoutes } from './routes/reports';
import { healthRoutes } from './routes/health';
import { metricsMiddleware } from './middleware/metrics';
import { tracingMiddleware } from './middleware/tracing';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
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
app.use('/analytics', analyticsRoutes);
app.use('/metrics', metricsRoutes);
app.use('/reports', reportsRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Analytics Service running on port ${PORT}`);
});

export default app;
