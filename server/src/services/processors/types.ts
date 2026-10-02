// Contract every conversion processor implements. A processor reads its input
// files from ctx.inputDir, writes exactly one output file into ctx.outputDir,
// reports progress, and returns the output's public file name + mime type.
// The worker writes result.json via completeJob() — processors never touch it.

import type { Job } from 'bullmq';
import type { ConversionJobData } from '../../config/queue';

export interface InputFileRef {
  /** Absolute path of the uploaded file on disk. */
  path: string;
  originalName: string;
  storedName: string;
  mime: string;
  size: number;
}

export interface ProcessorContext {
  job: Job<ConversionJobData>;
  jobId: string;
  toolId: string;
  inputDir: string;
  outputDir: string;
  files: InputFileRef[];
  options: Record<string, unknown>;
  onProgress(pct: number): Promise<void>;
}

export interface ProcessorResult {
  /** Public download name, e.g. "merged.pdf". Sanitised by the worker. */
  fileName: string;
  mime: string;
}

export type ProcessorFn = (ctx: ProcessorContext) => Promise<ProcessorResult>;
