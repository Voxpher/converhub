import dotenv from 'dotenv';

dotenv.config();

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function str(name: string, fallback: string): string {
  const raw = process.env[name];
  return raw && raw.length > 0 ? raw : fallback;
}

export const env = {
  NODE_ENV: str('NODE_ENV', 'development'),
  PORT: num('PORT', 4000),
  REDIS_URL: str('REDIS_URL', 'redis://localhost:6379'),
  DATA_DIR: str('DATA_DIR', './data'),
  FILE_TTL_MINUTES: num('FILE_TTL_MINUTES', 60),
  MAX_FILE_SIZE_MB: num('MAX_FILE_SIZE_MB', 100),
  CLIENT_URL: str('CLIENT_URL', 'http://localhost:3000'),
  LOG_LEVEL: str('LOG_LEVEL', 'info'),
  WORKER_CONCURRENCY: num('WORKER_CONCURRENCY', 2),
  RATE_LIMIT_WINDOW_MS: num('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  RATE_LIMIT_MAX: num('RATE_LIMIT_MAX', 300),
  CONVERT_RATE_LIMIT_MAX: num('CONVERT_RATE_LIMIT_MAX', 30),
  SELFTEST_RATE_LIMIT_MAX: num('SELFTEST_RATE_LIMIT_MAX', 10),
};

export const IS_PROD = env.NODE_ENV === 'production';
