import knex from 'knex';
import { logger } from '../utils/logger';

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sallie_chat',
  pool: {
    min: 2,
    max: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
  },
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
});

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeConnection = async (): Promise<void> => {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

export default db;
