import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimits';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';
import toolsRouter from './routes/tools';
import convertRouter from './routes/convert';
import jobsRouter from './routes/jobs';
import downloadRouter from './routes/download';
import selftestRouter from './routes/selftest';

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }),
  );
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '256kb' }));
  app.use(globalLimiter);

  app.use('/api/health', healthRouter);
  app.use('/api/tools', toolsRouter);
  app.use('/api/convert', convertRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/download', downloadRouter);
  app.use('/api/selftest', selftestRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
