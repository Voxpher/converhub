import { Router } from 'express';
import { randomUUID } from 'crypto';
import { conversionQueue, ConversionJobData } from '../config/queue';
import { createJobRecord } from '../services/jobStore';
import { selftestLimiter } from '../middleware/rateLimits';

const router = Router();

// Pipeline smoke test: enqueue a tiny job that exercises
// upload dir -> queue -> worker -> result -> download, end to end.
router.post('/', selftestLimiter, async (_req, res, next) => {
  try {
    const jobId = randomUUID();
    createJobRecord({ id: jobId, toolId: 'selftest', inputFiles: [], options: {} });
    const data: ConversionJobData = { jobId, toolId: 'selftest' };
    await conversionQueue.add('selftest', data, { jobId });
    res.status(202).json({ jobId, status: 'queued', statusUrl: `/api/jobs/${jobId}` });
  } catch (err) {
    next(err);
  }
});

export default router;
