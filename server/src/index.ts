import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { ensureDataDir } from './utils/files';
import { redis } from './config/redis';
import { startWorker } from './workers/converter';
import { startCleanup } from './workers/cleanup';

async function main(): Promise<void> {
  ensureDataDir();

  try {
    await redis.ping();
  } catch (err) {
    logger.error(
      { err },
      `Cannot reach Redis at ${env.REDIS_URL}. Start it first, e.g. "docker compose up redis".`,
    );
    process.exit(1);
  }

  const worker = startWorker();
  startCleanup();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`ConvertHub API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutting down');
    server.close();
    await worker.close();
    redis.disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
