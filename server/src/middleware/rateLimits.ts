import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

export const convertLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.CONVERT_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many conversions from this IP, please try again later.',
});

export const selftestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.SELFTEST_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many self-tests, please try again later.',
});
