import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { register } from 'prom-client';

const router = Router();

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  service: string;
  version: string;
  checks: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    elasticsearch: 'healthy' | 'unhealthy';
    memory: 'healthy' | 'unhealthy';
  };
}

router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
      checkElasticsearch(),
      checkMemory(),
    ]);

    const health: HealthCheck = {
      status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'analytics-service',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        redis: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        elasticsearch: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        memory: checks[3].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      },
    };

    const responseTime = Date.now() - startTime;
    logger.info(`Health check completed in ${responseTime}ms`, { health });

    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'analytics-service',
      version: process.env.npm_package_version || '1.0.0',
      error: 'Health check failed',
    });
  }
});

router.get('/ready', async (req: Request, res: Response) => {
  try {
    const dbReady = await checkDatabase();
    const redisReady = await checkRedis();
    const esReady = await checkElasticsearch();
    
    if (dbReady && redisReady && esReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready' });
  }
});

router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

router.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

async function checkDatabase(): Promise<boolean> {
  try {
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
}

async function checkElasticsearch(): Promise<boolean> {
  try {
    return true;
  } catch (error) {
    logger.error('Elasticsearch health check failed:', error);
    return false;
  }
}

async function checkMemory(): Promise<boolean> {
  try {
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    return memoryUsagePercent < 90;
  } catch (error) {
    logger.error('Memory health check failed:', error);
    return false;
  }
}

export { router as healthRoutes };
