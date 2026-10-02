// Shared helpers for conversion processors: sandboxed command execution,
// output naming, and result recording.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { writeResult } from '../jobStore';
import { sanitizeFilename, jobDir } from '../../utils/files';
import { logger } from '../../utils/logger';
import type { ProcessorContext, ProcessorResult } from './types';

export interface RunCmdOptions {
  timeoutMs?: number;
  /** Extra env vars for the child. */
  env?: Record<string, string>;
}

/**
 * Runs a system binary WITHOUT a shell (argv array, never a command string),
 * with a hard timeout. Stdout/stderr are captured for logging, never echoed
 * to the client. Used for soffice, ffmpeg, pdftoppm, gs, qpdf, tesseract.
 */
export function runCmd(
  cmd: string,
  args: string[],
  opts: RunCmdOptions = {},
): Promise<{ stdout: string; stderr: string }> {
  const timeoutMs = opts.timeoutMs ?? 5 * 60 * 1000;
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      env: { ...process.env, ...opts.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d: Buffer) => {
      stderr += d.toString();
    });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Conversion timed out after ${Math.round(timeoutMs / 1000)}s.`));
    }, timeoutMs);
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Could not start converter (${cmd}): ${(err as Error).message}`));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        logger.warn({ cmd, code, stderr: stderr.slice(-2000) }, 'Converter exited non-zero');
        reject(new Error('Conversion failed. The file may be corrupt or unsupported.'));
      }
    });
  });
}

/** LibreOffice sandbox: isolated user profile per job, no macros, headless. */
export function sofficeEnv(jobId: string): Record<string, string> {
  const profile = path.join(jobDir(jobId), 'soffice-profile');
  fs.mkdirSync(profile, { recursive: true });
  return { HOME: profile };
}

/** Throws a clear error when an expected output file was not produced. */
export function requireOutput(p: string): void {
  if (!fs.existsSync(p) || fs.statSync(p).size === 0) {
    throw new Error('Conversion produced no output. The file may be corrupt or unsupported.');
  }
}

/** Builds a safe public output name from the first input's name. */
export function outputName(ctx: ProcessorContext, suffix: string, ext: string): string {
  const first = ctx.files[0]?.originalName ?? 'file';
  const base = path.basename(first, path.extname(first)).slice(0, 80) || 'file';
  return sanitizeFilename(`${base}${suffix}.${ext}`);
}

/**
 * Records the completed result and returns the ProcessorResult.
 * storedName is the on-disk name inside ctx.outputDir.
 */
export function completeJob(
  ctx: ProcessorContext,
  storedName: string,
  fileName: string,
  mime: string,
): ProcessorResult {
  const full = path.join(ctx.outputDir, storedName);
  requireOutput(full);
  const size = fs.statSync(full).size;
  writeResult(ctx.jobId, {
    status: 'completed',
    fileName: sanitizeFilename(fileName),
    storedName,
    size,
    mime,
    completedAt: new Date().toISOString(),
  });
  return { fileName: sanitizeFilename(fileName), mime };
}
