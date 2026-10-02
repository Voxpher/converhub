// Audio/video processors (Phase 4). All conversions run through ffmpeg via
// fluent-ffmpeg. Each processor writes exactly one file into ctx.outputDir and
// finishes with completeJob(), which records the result for the worker.
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import type { ProcessorFn, ProcessorContext } from './types';
import { outputName, completeJob, requireOutput } from './helpers';
import { optStr, optNum } from '../options';

const FFMPEG_PATH = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
if (fs.existsSync(FFMPEG_PATH)) {
  ffmpeg.setFfmpegPath(FFMPEG_PATH);
}

/** Hard cap for any single ffmpeg run. */
const MAX_FFMPEG_MS = 10 * 60 * 1000;

interface FfmpegProgress {
  percent?: number;
}

/** Maps raw ffmpeg failures to messages that are safe to show to the user. */
function friendlyError(err: Error): string {
  const msg = err.message || '';
  if (/timed out/i.test(msg)) return msg;
  if (/Invalid data found|moov atom not found|not a valid/i.test(msg)) {
    return 'The uploaded file is not a valid media file or is corrupt.';
  }
  if (/Unknown encoder|not supported/i.test(msg)) {
    return 'The requested output format is not supported for this file.';
  }
  if (/No such file/i.test(msg)) {
    return 'The uploaded file could not be read. Please try uploading it again.';
  }
  return 'Conversion failed. The file may be corrupt or in an unsupported format.';
}

/**
 * Runs a fluent-ffmpeg command, forwarding progress to the job, killing the
 * process with SIGKILL if it exceeds the 10-minute cap, and resolving when
 * ffmpeg reports 'end'. Rejects with a user-friendly message on failure.
 */
function runFfmpeg(
  build: (cmd: ffmpeg.FfmpegCommand) => ffmpeg.FfmpegCommand,
  ctx: ProcessorContext,
  outPath: string,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    let command: ffmpeg.FfmpegCommand | undefined;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        command?.kill('SIGKILL');
      } catch {
        /* already dead */
      }
      reject(
        new Error('Conversion timed out after 10 minutes. Try a shorter or smaller file.'),
      );
    }, MAX_FFMPEG_MS);
    const finish = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };
    let cmd: ffmpeg.FfmpegCommand;
    try {
      cmd = build(ffmpeg());
    } catch (err) {
      finish(() => reject(err instanceof Error ? err : new Error(String(err))));
      return;
    }
    command = cmd;
    cmd
      .on('start', () => {
        void ctx.onProgress(5);
      })
      .on('progress', (progress: FfmpegProgress) => {
        const pct = Math.min(99, Math.max(6, Math.round(progress.percent || 0)));
        void ctx.onProgress(pct);
      })
      .on('error', (err: Error) => {
        finish(() => reject(new Error(friendlyError(err))));
      })
      .on('end', () => {
        finish(() => resolve());
      });
    cmd.save(outPath);
  });
}

function firstInput(ctx: ProcessorContext): { path: string; originalName: string } {
  const input = ctx.files[0];
  if (!input) throw new Error('No input file was provided.');
  return input;
}

/** On-disk name for the single output file (jobId-prefixed to avoid clashes). */
function diskName(ctx: ProcessorContext, publicName: string): string {
  return `${ctx.jobId}-${publicName}`;
}

const videoToMp3: ProcessorFn = async (ctx) => {
  const input = firstInput(ctx);
  const bitrate = optStr(ctx.options, 'bitrate', '192k');
  const safe = ['128k', '192k', '320k'].includes(bitrate) ? bitrate : '192k';
  const publicName = outputName(ctx, '', 'mp3');
  const outPath = path.join(ctx.outputDir, diskName(ctx, publicName));
  await runFfmpeg(
    (cmd) =>
      cmd
        .input(input.path)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate(safe)
        .outputOptions('-y'),
    ctx,
    outPath,
  );
  requireOutput(outPath);
  return completeJob(ctx, path.basename(outPath), publicName, 'audio/mpeg');
};

const mp4ToGif: ProcessorFn = async (ctx) => {
  const input = firstInput(ctx);
  const fps = Math.min(20, Math.max(5, Math.round(optNum(ctx.options, 'fps', 10))));
  const width = Math.min(800, Math.max(160, Math.round(optNum(ctx.options, 'width', 480))));
  const duration = Math.min(15, Math.max(1, optNum(ctx.options, 'duration', 6)));
  const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
  const publicName = outputName(ctx, '', 'gif');
  const outPath = path.join(ctx.outputDir, diskName(ctx, publicName));
  await runFfmpeg(
    (cmd) =>
      cmd.input(input.path).videoFilters(filter).duration(duration).outputOptions('-y'),
    ctx,
    outPath,
  );
  requireOutput(outPath);
  return completeJob(ctx, path.basename(outPath), publicName, 'image/gif');
};

const VIDEO_FORMATS: Record<string, { vcodec: string; acodec: string; ext: string; mime: string }> = {
  mp4: { vcodec: 'libx264', acodec: 'aac', ext: 'mp4', mime: 'video/mp4' },
  webm: { vcodec: 'libvpx-vp9', acodec: 'libopus', ext: 'webm', mime: 'video/webm' },
  mov: { vcodec: 'libx264', acodec: 'aac', ext: 'mov', mime: 'video/quicktime' },
};

const videoConvert: ProcessorFn = async (ctx) => {
  const input = firstInput(ctx);
  const format = optStr(ctx.options, 'format', 'mp4');
  const cfg = VIDEO_FORMATS[format] ?? VIDEO_FORMATS.mp4;
  const publicName = outputName(ctx, `-converted`, cfg.ext);
  const outPath = path.join(ctx.outputDir, diskName(ctx, publicName));
  await runFfmpeg(
    (cmd) =>
      cmd
        .input(input.path)
        .videoCodec(cfg.vcodec)
        .audioCodec(cfg.acodec)
        .outputOptions('-y'),
    ctx,
    outPath,
  );
  requireOutput(outPath);
  return completeJob(ctx, path.basename(outPath), publicName, cfg.mime);
};

const compressVideo: ProcessorFn = async (ctx) => {
  const input = firstInput(ctx);
  const crf = Math.min(35, Math.max(18, Math.round(optNum(ctx.options, 'crf', 26))));
  const preset = optStr(ctx.options, 'preset', 'veryfast');
  const safePreset = ['veryfast', 'medium', 'slow'].includes(preset) ? preset : 'veryfast';
  const publicName = outputName(ctx, '-compressed', 'mp4');
  const outPath = path.join(ctx.outputDir, diskName(ctx, publicName));
  await runFfmpeg(
    (cmd) =>
      cmd
        .input(input.path)
        .videoCodec('libx264')
        .outputOptions('-crf', String(crf), '-preset', safePreset, '-y')
        .audioCodec('aac'),
    ctx,
    outPath,
  );
  requireOutput(outPath);
  return completeJob(ctx, path.basename(outPath), publicName, 'video/mp4');
};

/** Parses "mm:ss", "ss.s" or plain seconds into seconds. Returns null if invalid. */
function parseTime(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d+(\.\d+)?$/.test(v)) return parseFloat(v);
  const m = /^(\d+):([0-5]?\d(?:\.\d+)?)$/.exec(v);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseFloat(m[2]);
}

const AUDIO_EXT_MIMES: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/x-m4a',
};

const trimAudio: ProcessorFn = async (ctx) => {
  const input = firstInput(ctx);
  const startRaw = optStr(ctx.options, 'start', '0:00');
  const endRaw = optStr(ctx.options, 'end', '');
  const start = parseTime(startRaw);
  if (start === null || start < 0) {
    throw new Error('Invalid start time. Use mm:ss, for example "1:30".');
  }
  const end = endRaw.trim() === '' ? null : parseTime(endRaw);
  if (endRaw.trim() !== '' && end === null) {
    throw new Error('Invalid end time. Use mm:ss, for example "0:45", or leave it empty.');
  }
  if (end !== null && end <= start) {
    throw new Error('End time must be after the start time.');
  }
  const inExt = (path.extname(input.originalName) || '.mp3').toLowerCase().slice(1);
  const ext = AUDIO_EXT_MIMES[inExt] ? inExt : 'mp3';
  const publicName = outputName(ctx, '-trimmed', ext);
  const outPath = path.join(ctx.outputDir, diskName(ctx, publicName));
  // With input seeking (-ss before -i) the output timeline restarts at 0, so
  // "-to <end>" would keep (end) seconds instead of stopping at <end>.
  // Using "-t <end-start>" trims exactly the requested section.
  const outOpts = ['-y'];
  if (end !== null) outOpts.push('-t', String(end - start));
  await runFfmpeg(
    (cmd) => {
      let c = cmd.input(input.path);
      if (start > 0) c = c.inputOptions('-ss', String(start));
      return c.outputOptions(...outOpts).audioCodec('copy');
    },
    ctx,
    outPath,
  );
  requireOutput(outPath);
  return completeJob(ctx, path.basename(outPath), publicName, AUDIO_EXT_MIMES[ext]);
};

const mergeAudio: ProcessorFn = async (ctx) => {
  const files = ctx.files;
  if (files.length < 2) {
    throw new Error('Please upload at least two audio files to merge.');
  }
  // Re-encode concat: normalise each input to the same sample rate / layout
  // first so files with different codecs or parameters join cleanly.
  const n = files.length;
  const normalise = files
    .map((_, i) => `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[a${i}]`)
    .join(';');
  const join = files.map((_, i) => `[a${i}]`).join('');
  const filter = `${normalise};${join}concat=n=${n}:v=0:a=1[out]`;
  const publicName = outputName(ctx, '-merged', 'mp3');
  const outPath = path.join(ctx.outputDir, diskName(ctx, publicName));
  await runFfmpeg(
    (cmd) => {
      for (const f of files) cmd.input(f.path);
      return cmd
        .complexFilter([filter])
        .outputOptions('-map', '[out]', '-y')
        .audioCodec('libmp3lame')
        .audioBitrate('192k');
    },
    ctx,
    outPath,
  );
  requireOutput(outPath);
  return completeJob(ctx, path.basename(outPath), publicName, 'audio/mpeg');
};

export const MEDIA_PROCESSORS: Record<string, ProcessorFn> = {
  'video-to-mp3': videoToMp3,
  'mp4-to-gif': mp4ToGif,
  'video-convert': videoConvert,
  'compress-video': compressVideo,
  'trim-audio': trimAudio,
  'merge-audio': mergeAudio,
};
