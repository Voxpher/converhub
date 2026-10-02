import { Router } from 'express';
import { redis } from '../config/redis';
import { conversionQueue } from '../config/queue';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'converthub-server',
    timestamp: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
  });
});

// Readiness probe: API + Redis + queue must all be reachable.
router.get('/ready', async (_req, res) => {
  try {
    await redis.ping();
    const counts = await conversionQueue.getJobCounts('waiting', 'active', 'completed', 'failed');
    res.json({ status: 'ready', queue: counts });
  } catch {
    res.status(503).json({ status: 'not-ready', error: 'Redis or queue unavailable' });
  }
});

export default router;
