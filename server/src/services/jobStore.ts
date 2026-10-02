import fs from 'fs';
import path from 'path';
import { jobDir } from '../utils/files';

export interface InputFileInfo {
  originalName: string;
  storedName: string;
  size: number;
  mime: string;
}

export interface JobMeta {
  id: string;
  toolId: string;
  status: 'queued';
  createdAt: string;
  inputFiles: InputFileInfo[];
  options: Record<string, unknown>;
}

export type JobResult =
  | {
      status: 'completed';
      fileName: string;
      storedName: string;
      size: number;
      mime: string;
      completedAt: string;
    }
  | { status: 'failed'; error: string; failedAt: string };

function metaPath(jobId: string): string {
  return path.join(jobDir(jobId), 'meta.json');
}

function resultPath(jobId: string): string {
  return path.join(jobDir(jobId), 'result.json');
}

export function createJobRecord(opts: {
  id: string;
  toolId: string;
  inputFiles: InputFileInfo[];
  options: Record<string, unknown>;
}): JobMeta {
  const meta: JobMeta = {
    id: opts.id,
    toolId: opts.toolId,
    status: 'queued',
    createdAt: new Date().toISOString(),
    inputFiles: opts.inputFiles,
    options: opts.options,
  };
  fs.mkdirSync(jobDir(opts.id), { recursive: true });
  fs.writeFileSync(metaPath(opts.id), JSON.stringify(meta));
  return meta;
}

export function readMeta(jobId: string): JobMeta | null {
  try {
    return JSON.parse(fs.readFileSync(metaPath(jobId), 'utf8')) as JobMeta;
  } catch {
    return null;
  }
}

export function writeResult(jobId: string, result: JobResult): void {
  fs.mkdirSync(jobDir(jobId), { recursive: true });
  fs.writeFileSync(resultPath(jobId), JSON.stringify(result));
}

export function readResult(jobId: string): JobResult | null {
  try {
    return JSON.parse(fs.readFileSync(resultPath(jobId), 'utf8')) as JobResult;
  } catch {
    return null;
  }
}
