import IORedis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

// Every BullMQ client needs its own connection with maxRetriesPerRequest: null.
// Do NOT share one connection between Queue and Worker (the worker uses
// blocking Redis commands).
export function createRedisConnection(): IORedis {
  const conn = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  conn.on('error', (err) => logger.error({ err: err.message }, 'Redis connection error'));
  return conn;
}

// Lightweight shared connection for health checks and misc reads.
export const redis = createRedisConnection();
redis.on('ready', () => logger.info('Redis ready'));
