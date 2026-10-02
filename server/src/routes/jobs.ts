import { Router } from 'express';
import { conversionQueue } from '../config/queue';
import { readMeta, readResult } from '../services/jobStore';
import { isValidJobId } from '../utils/files';
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();

type PublicStatus = 'queued' | 'active' | 'completed' | 'failed';

function mapState(state: string): PublicStatus {
  if (state === 'completed') return 'completed';
  if (state === 'failed') return 'failed';
  if (state === 'active') return 'active';
  return 'queued';
}

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidJobId(id)) throw new BadRequestError('Invalid job id.');

    const meta = readMeta(id);
    const job = await conversionQueue.getJob(id);
    if (!job && !meta) throw new NotFoundError('Job not found.');

    const toolId = meta?.toolId ?? job?.name ?? 'unknown';
    const createdAt = meta?.createdAt ?? null;

    // Durable result written by the worker — survives queue trimming.
    const result = readResult(id);
    if (result?.status === 'failed') {
      res.json({ id, toolId, status: 'failed', progress: 0, result: null, error: result.error, createdAt });
      return;
    }
    if (result?.status === 'completed') {
      res.json({
        id,
        toolId,
        status: 'completed',
        progress: 100,
        result: {
          fileName: result.fileName,
          size: result.size,
          mime: result.mime,
          downloadUrl: `/api/download/${id}`,
        },
        error: null,
        createdAt,
      });
      return;
    }

    if (!job) {
      res.json({ id, toolId, status: 'queued', progress: 0, result: null, error: null, createdAt });
      return;
    }

    const status = mapState(await job.getState());
    const progress =
      typeof job.progress === 'number' ? Math.max(0, Math.min(100, Math.round(job.progress))) : 0;
    res.json({
      id,
      toolId,
      status,
      progress,
      result: null,
      error: status === 'failed' ? job.failedReason || 'Conversion failed.' : null,
      createdAt,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
