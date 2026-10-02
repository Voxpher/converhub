// Image processors (Phase 3). All conversions run through sharp; the
// multi-image tool assembles its PDF with pdf-lib.
import fs from 'fs';
import path from 'path';
import sharp, { Sharp, Metadata, FitEnum } from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { outputName, completeJob, requireOutput } from './helpers';
import { optNum, optStr } from '../options';
import type { ProcessorContext, ProcessorFn, ProcessorResult } from './types';

type OutFormat = 'jpeg' | 'png' | 'webp';

const FORMAT_MIME: Record<OutFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const FORMAT_EXT: Record<OutFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
};

const EXT_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

/** Lower-cased extension of a file name, e.g. ".jpg". */
function extOf(name: string): string {
  return path.extname(name).toLowerCase();
}

/** Maps an input extension to a sharp output format. */
function fmtOfExt(ext: string): OutFormat {
  if (ext === '.png') return 'png';
  if (ext === '.webp') return 'webp';
  return 'jpeg';
}

function parseFormat(value: string): OutFormat {
  if (value === 'png' || value === 'webp' || value === 'jpeg') return value;
  throw new Error('Choose an output format: JPEG, PNG or WebP.');
}

function clampQuality(q: number): number {
  return Math.min(100, Math.max(1, Math.round(q)));
}

function firstInput(ctx: ProcessorContext): ProcessorContext['files'][number] {
  const input = ctx.files[0];
  if (!input) throw new Error('No file was uploaded.');
  return input;
}

/** Turns a sharp/libvips failure into a user-facing message. */
function conversionError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (/heif|heic/i.test(msg)) {
    return new Error(
      'This HEIC/HEIF image could not be decoded on the server. ' +
        'Convert it to JPEG on your device first and try again.',
    );
  }
  return new Error('Could not process this image. It may be corrupt or in an unsupported format.');
}

/** Runs the sharp pipeline and writes the single output file. */
async function render(
  ctx: ProcessorContext,
  pipe: Sharp,
  suffix: string,
  format: OutFormat,
  mime: string,
): Promise<ProcessorResult> {
  const publicName = outputName(ctx, suffix, FORMAT_EXT[format]);
  const outPath = path.join(ctx.outputDir, publicName);
  try {
    await pipe.toFile(outPath);
  } catch (err) {
    throw conversionError(err);
  }
  requireOutput(outPath);
  await ctx.onProgress(90);
  return completeJob(ctx, publicName, publicName, mime);
}

// ---------------------------------------------------------------------------
// 1. image-convert — change format between JPEG / PNG / WebP
// ---------------------------------------------------------------------------
async function convertImage(ctx: ProcessorContext): Promise<ProcessorResult> {
  const input = firstInput(ctx);
  await ctx.onProgress(10);
  const format = parseFormat(optStr(ctx.options, 'format', 'jpeg'));
  const quality = clampQuality(optNum(ctx.options, 'quality', 85));
  await ctx.onProgress(30);
  return render(
    ctx,
    sharp(input.path).toFormat(format, { quality }),
    '-converted',
    format,
    FORMAT_MIME[format],
  );
}

// ---------------------------------------------------------------------------
// 2. image-compress — shrink file size, optionally changing format
// ---------------------------------------------------------------------------
async function compressImage(ctx: ProcessorContext): Promise<ProcessorResult> {
  const input = firstInput(ctx);
  await ctx.onProgress(10);
  const quality = clampQuality(optNum(ctx.options, 'quality', 75));
  const choice = optStr(ctx.options, 'format', 'keep');
  const format: OutFormat = choice === 'keep' ? fmtOfExt(extOf(input.originalName)) : parseFormat(choice);
  await ctx.onProgress(30);
  const opts = format === 'png' ? { compressionLevel: 9, quality } : { quality };
  return render(
    ctx,
    sharp(input.path).toFormat(format, opts),
    '-compressed',
    format,
    FORMAT_MIME[format],
  );
}

// ---------------------------------------------------------------------------
// 3. image-resize — change dimensions in pixels
// ---------------------------------------------------------------------------
async function resizeImage(ctx: ProcessorContext): Promise<ProcessorResult> {
  const input = firstInput(ctx);
  await ctx.onProgress(10);
  const w = Math.round(optNum(ctx.options, 'width', 0));
  const h = Math.round(optNum(ctx.options, 'height', 0));
  if (w <= 0 && h <= 0) throw new Error('Enter a width and/or height.');
  const fit = optStr(ctx.options, 'fit', 'inside') as 'inside' | 'fill' | 'cover';
  if (fit !== 'inside' && fit !== 'fill' && fit !== 'cover') {
    throw new Error('Choose a resize mode.');
  }
  const format = fmtOfExt(extOf(input.originalName));
  await ctx.onProgress(30);
  return render(
    ctx,
    sharp(input.path)
      .resize(w > 0 ? w : null, h > 0 ? h : null, { fit })
      .toFormat(format, { quality: 90 }),
    '-resized',
    format,
    FORMAT_MIME[format],
  );
}

// ---------------------------------------------------------------------------
// 4. image-crop — centered aspect preset or manual x/y/width/height
// ---------------------------------------------------------------------------
async function cropImage(ctx: ProcessorContext): Promise<ProcessorResult> {
  const input = firstInput(ctx);
  await ctx.onProgress(10);
  let meta: Metadata;
  try {
    meta = await sharp(input.path).metadata();
  } catch (err) {
    throw conversionError(err);
  }
  const imgW = meta.width ?? 0;
  const imgH = meta.height ?? 0;
  if (!imgW || !imgH) throw new Error('Could not read this image. It may be corrupt.');

  const aspect = optStr(ctx.options, 'aspect', 'free');
  let box: { left: number; top: number; width: number; height: number };

  if (aspect === 'free') {
    const x = Math.max(0, Math.round(optNum(ctx.options, 'x', 0)));
    const y = Math.max(0, Math.round(optNum(ctx.options, 'y', 0)));
    const w = Math.round(optNum(ctx.options, 'width', 0));
    const h = Math.round(optNum(ctx.options, 'height', 0));
    if (w <= 0 || h <= 0) {
      throw new Error('Enter a crop width and height, or choose an aspect-ratio preset.');
    }
    const left = Math.min(x, imgW - 1);
    const top = Math.min(y, imgH - 1);
    const cw = Math.min(w, imgW - left);
    const ch = Math.min(h, imgH - top);
    if (cw <= 0 || ch <= 0) throw new Error('Crop area is outside the image bounds.');
    box = { left, top, width: cw, height: ch };
  } else {
    const [aw, ah] = aspect.split(':').map(Number);
    if (!aw || !ah) throw new Error('Choose an aspect ratio.');
    const target = aw / ah;
    let cw: number;
    let ch: number;
    if (imgW / imgH > target) {
      ch = imgH;
      cw = Math.round(ch * target);
    } else {
      cw = imgW;
      ch = Math.round(cw / target);
    }
    cw = Math.max(1, cw);
    ch = Math.max(1, ch);
    box = {
      left: Math.max(0, Math.round((imgW - cw) / 2)),
      top: Math.max(0, Math.round((imgH - ch) / 2)),
      width: cw,
      height: ch,
    };
  }

  await ctx.onProgress(40);
  const format = fmtOfExt(extOf(input.originalName));
  return render(ctx, sharp(input.path).extract(box), '-cropped', format, FORMAT_MIME[format]);
}

// ---------------------------------------------------------------------------
// 5. remove-metadata — strip EXIF/GPS, apply orientation, keep format
// ---------------------------------------------------------------------------
async function removeMetadata(ctx: ProcessorContext): Promise<ProcessorResult> {
  const input = firstInput(ctx);
  await ctx.onProgress(10);
  const format = fmtOfExt(extOf(input.originalName));
  await ctx.onProgress(30);
  // .rotate() applies the EXIF orientation so the pixels stay upright;
  // no .withMetadata() means all EXIF/GPS data is dropped.
  return render(ctx, sharp(input.path).rotate().toFormat(format), '-clean', format, FORMAT_MIME[format]);
}

// ---------------------------------------------------------------------------
// 6. image-to-base64 — data URI written to a .txt file
// ---------------------------------------------------------------------------
async function imageToBase64(ctx: ProcessorContext): Promise<ProcessorResult> {
  const input = firstInput(ctx);
  await ctx.onProgress(10);
  const ext = extOf(input.originalName);
  const mime = EXT_MIME[ext];
  if (!mime) throw new Error('This file type cannot be encoded as Base64 here.');
  let buf: Buffer;
  try {
    buf = await fs.promises.readFile(input.path);
  } catch {
    throw new Error('Could not read the uploaded file.');
  }
  await ctx.onProgress(50);
  const dataUri = `data:${mime};base64,${buf.toString('base64')}`;
  const publicName = outputName(ctx, '', 'txt');
  await fs.promises.writeFile(path.join(ctx.outputDir, publicName), dataUri, 'utf8');
  await ctx.onProgress(90);
  return completeJob(ctx, publicName, publicName, 'text/plain');
}

// ---------------------------------------------------------------------------
// 7. image-to-pdf — up to 20 images, one full-bleed page each
// ---------------------------------------------------------------------------
async function imageToPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  if (!ctx.files.length) throw new Error('No files were uploaded.');
  await ctx.onProgress(5);
  const pdf = await PDFDocument.create();
  let done = 0;
  for (const f of ctx.files) {
    let jpegBuf: Buffer;
    try {
      jpegBuf = await sharp(f.path).jpeg({ quality: 90 }).toBuffer();
    } catch (err) {
      throw conversionError(err);
    }
    const meta = await sharp(jpegBuf).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (!w || !h) throw new Error(`Could not read the dimensions of ${f.originalName}.`);
    // Cap the long edge at 1440 px so the PDF stays a sane size.
    const scale = Math.min(1, 1440 / Math.max(w, h));
    const pw = Math.max(1, Math.round(w * scale));
    const ph = Math.max(1, Math.round(h * scale));
    const page = pdf.addPage([pw, ph]);
    const img = await pdf.embedJpg(jpegBuf);
    page.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
    done += 1;
    await ctx.onProgress(Math.round(5 + (85 * done) / ctx.files.length));
  }
  const bytes = await pdf.save();
  const publicName = outputName(ctx, '', 'pdf');
  await fs.promises.writeFile(path.join(ctx.outputDir, publicName), bytes);
  await ctx.onProgress(95);
  return completeJob(ctx, publicName, publicName, 'application/pdf');
}

export const IMAGE_PROCESSORS: Record<string, ProcessorFn> = {
  'image-convert': convertImage,
  'image-compress': compressImage,
  'image-resize': resizeImage,
  'image-crop': cropImage,
  'remove-metadata': removeMetadata,
  'image-to-base64': imageToBase64,
  'image-to-pdf': imageToPdf,
};
