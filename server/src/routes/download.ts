import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { readResult } from '../services/jobStore';
import { isValidJobId, jobDir, sanitizeFilename } from '../utils/files';
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidJobId(id)) throw new BadRequestError('Invalid job id.');

    const result = readResult(id);
    if (!result || result.status !== 'completed') {
      throw new NotFoundError('Download is not ready yet.');
    }

    const filePath = path.join(jobDir(id), 'output', result.storedName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('Output file has expired or is missing.');
    }

    res.setHeader('Content-Type', result.mime);
    res.setHeader('Content-Length', String(result.size));
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(result.fileName)}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
