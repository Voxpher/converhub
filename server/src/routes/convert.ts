import { Router, Request, Response, NextFunction } from 'express';
import { getTool, ToolDefinition } from '../services/toolRegistry';
import { createJobRecord } from '../services/jobStore';
import { conversionQueue, ConversionJobData } from '../config/queue';
import { assignJobId, uploadForTool, verifyMagicBytes } from '../middleware/validateUpload';
import { validateOptions } from '../services/options';
import { convertLimiter } from '../middleware/rateLimits';
import { AppError, BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();

function parseOptions(raw: unknown): Record<string, unknown> {
  if (raw == null || raw === '') return {};
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    } catch {
      // fall through to the error below
    }
  }
  throw new BadRequestError('Invalid options JSON.');
}

/** Resolves the tool and attaches its upload middleware for this request. */
function toolUpload(req: Request, res: Response, next: NextFunction): void {
  const tool: ToolDefinition | undefined = getTool(req.params.toolId);
  if (!tool) {
    next(new NotFoundError(`Unknown tool: ${req.params.toolId}`));
    return;
  }
  if (!tool.enabled) {
    next(
      new AppError(
        501,
        `${tool.name} is not live yet — it ships in Phase ${tool.phase}.`,
        'TOOL_NOT_LIVE',
      ),
    );
    return;
  }
  req.toolDef = tool;
  uploadForTool(tool)(req, res, next);
}

router.post(
  '/:toolId',
  convertLimiter,
  assignJobId,
  toolUpload,
  verifyMagicBytes,
  async (req, res, next) => {
    try {
      const tool = req.toolDef as ToolDefinition;
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (tool.requiresFile && files.length === 0) {
        throw new BadRequestError('Please attach a file to convert.');
      }

      let options: Record<string, unknown>;
      try {
        options = validateOptions(tool.optionsSchema, parseOptions(req.body?.options));
      } catch (err) {
        throw new BadRequestError((err as Error).message);
      }

      const meta = createJobRecord({
        id: req.jobId,
        toolId: tool.id,
        inputFiles: files.map((f) => ({
          originalName: f.originalname,
          storedName: f.filename,
          size: f.size,
          mime: f.mimetype,
        })),
        options,
      });

      const data: ConversionJobData = { jobId: meta.id, toolId: tool.id, options: meta.options };
      await conversionQueue.add(tool.id, data, { jobId: meta.id });

      res.status(202).json({
        jobId: meta.id,
        status: 'queued',
        statusUrl: `/api/jobs/${meta.id}`,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
