import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

export const JOBS_ROOT = path.join(env.DATA_DIR, 'jobs');

export function ensureDataDir(): void {
  fs.mkdirSync(JOBS_ROOT, { recursive: true });
}

/** UUIDs issued by this server: letters, digits and hyphens. Blocks path traversal. */
export function isValidJobId(id: string): boolean {
  return /^[A-Za-z0-9-]{8,64}$/.test(id);
}

export function jobDir(jobId: string): string {
  return path.join(JOBS_ROOT, jobId);
}

/** Strips directories and unsafe characters from a user-supplied filename. */
export function sanitizeFilename(name: string): string {
  const base = path
    .basename(name)
    .replace(/[^\w.\-() ]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return base.length > 0 ? base.slice(0, 120) : 'file';
}
