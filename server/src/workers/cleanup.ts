import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { JOBS_ROOT, ensureDataDir } from '../utils/files';
import { logger } from '../utils/logger';

/** Deletes job folders (uploads + outputs) older than FILE_TTL_MINUTES. */
async function sweep(): Promise<void> {
  try {
    ensureDataDir();
    const ttlMs = env.FILE_TTL_MINUTES * 60 * 1000;
    const now = Date.now();
    const entries = fs.readdirSync(JOBS_ROOT, { withFileTypes: true });
    let removed = 0;
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const full = path.join(JOBS_ROOT, entry.name);
      const mtime = fs.statSync(full).mtimeMs;
      if (now - mtime > ttlMs) {
        fs.rmSync(full, { recursive: true, force: true });
        removed++;
      }
    }
    if (removed > 0) logger.info({ removed }, 'Cleanup sweep removed expired job folders');
  } catch (err) {
    logger.error({ err }, 'Cleanup sweep failed');
  }
}

export function startCleanup(): void {
  void sweep();
  cron.schedule('*/10 * * * *', () => {
    void sweep();
  });
  logger.info({ ttlMinutes: env.FILE_TTL_MINUTES }, 'File cleanup scheduler started');
}
