import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { IS_PROD, env } from '../config/env';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: 'Route not found', code: 'NOT_FOUND' } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        error: {
          message: `File too large — the limit is ${env.MAX_FILE_SIZE_MB} MB.`,
          code: 'FILE_TOO_LARGE',
        },
      });
      return;
    }
    res.status(400).json({ error: { message: `Upload error: ${err.message}`, code: 'UPLOAD_ERROR' } });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { message: err.message, code: err.code } });
    return;
  }

  if (typeof err === 'object' && err !== null && 'type' in err && err.type === 'entity.parse.failed') {
    res.status(400).json({ error: { message: 'Invalid JSON in request body', code: 'BAD_JSON' } });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: {
      message: 'Something went wrong on our side. Please try again.',
      code: 'INTERNAL_ERROR',
      ...(IS_PROD ? {} : { detail: String((err as Error)?.message ?? err) }),
    },
  });
}
