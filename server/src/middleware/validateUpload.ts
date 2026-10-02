import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import FileType from 'file-type';
import { env } from '../config/env';
import { getTool, ToolDefinition } from '../services/toolRegistry';
import { jobDir } from '../utils/files';
import { BadRequestError } from '../utils/errors';

/** Issues a job id before multer runs so uploads land in the job's folder. */
export function assignJobId(req: Request, _res: Response, next: NextFunction): void {
  req.jobId = randomUUID();
  next();
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(jobDir(req.jobId), 'input');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const tool = getTool(req.params.toolId);
  if (!tool) {
    cb(new BadRequestError(`Unknown tool: ${req.params.toolId}`));
    return;
  }
  if (tool.inputMimes.length > 0 && !tool.inputMimes.includes(file.mimetype)) {
    cb(
      new BadRequestError(
        `"${file.originalname}" is not a supported file type for ${tool.name}.`,
      ),
    );
    return;
  }
  cb(null, true);
}

const baseUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 20,
  },
});

/**
 * Returns the multer middleware for a tool: array upload for file tools
 * (capped at tool.maxFiles), a no-op for tools that take no file.
 */
export function uploadForTool(tool: ToolDefinition) {
  if (!tool.requiresFile) {
    return (_req: Request, _res: Response, next: NextFunction): void => next();
  }
  return baseUpload.array('files', tool.maxFiles);
}

/**
 * Verifies every uploaded file's real content (magic bytes) matches the
 * tool's allowlist. A renamed .exe uploaded as .pdf is rejected here.
 */
export async function verifyMagicBytes(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const tool = getTool(req.params.toolId);
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!tool || files.length === 0) {
      next();
      return;
    }
    for (const file of files) {
      const full = file.path;
      const fd = fs.openSync(full, 'r');
      const head = Buffer.alloc(4100);
      const bytesRead = fs.readSync(fd, head, 0, 4100, 0);
      fs.closeSync(fd);

      const detected = await FileType.fromBuffer(head.subarray(0, bytesRead));
      const ext = path.extname(file.originalname).toLowerCase();

      let ok: boolean;
      if (detected) {
        ok = tool.inputMimes.includes(detected.mime);
      } else if (ext === '.svg' && tool.inputMimes.includes('image/svg+xml')) {
        // file-type cannot sniff SVG (it is plain text XML)
        ok = head.subarray(0, bytesRead).toString('utf8').includes('<svg');
      } else if (ext === '.txt' && tool.inputMimes.includes('text/plain')) {
        ok = true; // plain text has no magic bytes; extension was checked
      } else {
        ok = false;
      }

      if (!ok) {
        // Remove the whole job folder — nothing from this upload is kept.
        fs.rmSync(jobDir(req.jobId), { recursive: true, force: true });
        next(
          new BadRequestError(
            `"${file.originalname}": file content does not match its type. Please upload a genuine file.`,
          ),
        );
        return;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}
