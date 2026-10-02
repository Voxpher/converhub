import { Worker, Job } from 'bullmq';
import fs from 'fs';
import path from 'path';
import { QUEUE_NAME, ConversionJobData } from '../config/queue';
import { createRedisConnection } from '../config/redis';
import { getTool } from '../services/toolRegistry';
import { getProcessor } from '../services/processors';
import { jobDir } from '../utils/files';
import { readMeta, writeResult, InputFileInfo } from '../services/jobStore';
import { sanitizeFilename } from '../utils/files';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import type { ProcessorContext, InputFileRef } from '../services/processors/types';

async function handleSelfTest(job: Job<ConversionJobData>): Promise<void> {
  const { jobId } = job.data;
  await job.updateProgress(30);

  const outDir = path.join(jobDir(jobId), 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const content =
    `ConvertHub pipeline self-test: OK\n` + `job: ${jobId}\n` + `${new Date().toISOString()}\n`;
  const storedName = 'selftest.txt';
  fs.writeFileSync(path.join(outDir, storedName), content);

  await job.updateProgress(90);
  writeResult(jobId, {
    status: 'completed',
    fileName: 'converthub-selftest.txt',
    storedName,
    size: Buffer.byteLength(content),
    mime: 'text/plain',
    completedAt: new Date().toISOString(),
  });
  await job.updateProgress(100);
}

function toFileRef(jobId: string, info: InputFileInfo): InputFileRef {
  return {
    path: path.join(jobDir(jobId), 'input', info.storedName),
    originalName: info.originalName,
    storedName: info.storedName,
    mime: info.mime,
    size: info.size,
  };
}

async function runProcessor(job: Job<ConversionJobData>): Promise<void> {
  const { jobId, toolId, options } = job.data;

  const tool = getTool(toolId);
  if (!tool || !tool.enabled) {
    throw new Error(`Tool not available: ${toolId}`);
  }
  const processor = getProcessor(toolId);
  if (!processor) {
    throw new Error(`No processor registered for tool: ${toolId}`);
  }

  const meta = readMeta(jobId);
  const inputFiles = (meta?.inputFiles ?? []).map((info) => toFileRef(jobId, info));
  for (const f of inputFiles) {
    if (!fs.existsSync(f.path)) {
      throw new Error(`Input file is missing: ${sanitizeFilename(f.originalName)}`);
    }
  }

  const inputDir = path.join(jobDir(jobId), 'input');
  const outputDir = path.join(jobDir(jobId), 'output');
  fs.mkdirSync(outputDir, { recursive: true });

  const ctx: ProcessorContext = {
    job,
    jobId,
    toolId,
    inputDir,
    outputDir,
    files: inputFiles,
    options: options ?? {},
    onProgress: async (pct: number) => {
      await job.updateProgress(Math.max(0, Math.min(100, Math.round(pct))));
    },
  };

  await ctx.onProgress(5);
  const result = await processor(ctx);
  await ctx.onProgress(100);
  logger.info({ jobId, toolId, fileName: result.fileName }, 'Job processed');
}

export function startWorker(): Worker<ConversionJobData> {
  const worker = new Worker<ConversionJobData>(
    QUEUE_NAME,
    async (job) => {
      const { jobId, toolId } = job.data;
      logger.info({ jobId, toolId }, 'Processing job');

      if (toolId === 'selftest') {
        await handleSelfTest(job);
        return;
      }
      await runProcessor(job);
    },
    { connection: createRedisConnection(), concurrency: env.WORKER_CONCURRENCY },
  );

  worker.on('completed', (job) => logger.info({ jobId: job.id }, 'Job completed'));
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'Job failed');
    const jobId = job?.data?.jobId;
    if (typeof jobId === 'string') {
      try {
        writeResult(jobId, {
          status: 'failed',
          error: err.message || 'Conversion failed.',
          failedAt: new Date().toISOString(),
        });
      } catch (writeErr) {
        logger.error({ writeErr }, 'Could not write failure result');
      }
    }
  });
  worker.on('error', (err) => logger.error({ err: err.message }, 'Worker error'));

  logger.info('Conversion worker started');
  return worker;
}
