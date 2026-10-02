// PDF processors (Phase 2). 18 tools.
// Binary-backed tools (poppler pdftoppm, LibreOffice, Ghostscript, qpdf,
// Tesseract) shell out via runCmd() — argv arrays, no shell, hard timeouts.
// Pure-JS tools use pdf-lib, pdfjs-dist, docx, exceljs and pptxgenjs.
// Passwords are passed only as argv entries and never logged.

import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, PageBreak } from 'docx';
import ExcelJS from 'exceljs';
import PptxGenJS from 'pptxgenjs';
import { runCmd, sofficeEnv, requireOutput, outputName, completeJob } from './helpers';
import { optStr, optNum } from '../options';
import type { ProcessorContext, ProcessorFn, ProcessorResult } from './types';

// archiver ships no bundled types and @types/archiver is not installed, so it
// is loaded via require() (typed as any) instead of an import statement.
// archiver v8: construct new ZipArchive(options) — the old archiver() factory
// was removed.
interface ArchiverInstance {
  on(event: 'error', cb: (err: Error) => void): void;
  pipe(stream: fs.WriteStream): void;
  file(filePath: string, opts: { name: string }): void;
  finalize(): Promise<void>;
}
const archiverLib = require('archiver') as {
  ZipArchive: new (options?: Record<string, unknown>) => ArchiverInstance;
};

const PDF_MIME = 'application/pdf';
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PPTX_MIME =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const ZIP_MIME = 'application/zip';

/** Friendly base name of the first input file, e.g. "report". */
function inputBase(ctx: ProcessorContext): string {
  return outputName(ctx, '', 'pdf').slice(0, -'.pdf'.length);
}

/**
 * Parses a page spec like "all", "1-3, 5" or "2, 4-6" into groups of
 * 1-based page numbers. Throws a user-facing error on bad input.
 */
export function parsePageSpec(spec: string, pageCount: number): number[][] {
  const s = spec.trim().toLowerCase();
  if (!s) throw new Error('Please enter at least one page or range.');
  if (s === 'all') {
    return [Array.from({ length: pageCount }, (_, i) => i + 1)];
  }
  const groups: number[][] = [];
  for (const rawPart of s.split(',')) {
    const part = rawPart.trim();
    if (!part) continue;
    const pages: number[] = [];
    const dash = part.indexOf('-');
    if (dash >= 0) {
      const start = Number(part.slice(0, dash).trim());
      const end = Number(part.slice(dash + 1).trim());
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 1 ||
        end > pageCount ||
        start > end
      ) {
        throw new Error(
          `Invalid page range "${part}". This PDF has ${pageCount} page${pageCount === 1 ? '' : 's'} (1-${pageCount}).`,
        );
      }
      for (let p = start; p <= end; p++) pages.push(p);
    } else {
      const n = Number(part);
      if (!Number.isInteger(n) || n < 1 || n > pageCount) {
        throw new Error(
          `Invalid page "${part}". This PDF has ${pageCount} page${pageCount === 1 ? '' : 's'} (1-${pageCount}).`,
        );
      }
      pages.push(n);
    }
    groups.push(pages);
  }
  if (groups.length === 0) throw new Error('Please enter at least one page or range.');
  return groups;
}

/** Minimal structural types for the pdfjs-dist legacy build API we use. */
interface PdfJsPage {
  getTextContent(): Promise<{ items: unknown[] }>;
}
interface PdfJsDocument {
  numPages: number;
  getPage(n: number): Promise<PdfJsPage>;
  destroy?: () => Promise<void>;
}
interface PdfJsApi {
  getDocument(params: { data: Uint8Array }): { promise: Promise<PdfJsDocument> };
}

/** Extracts plain text per page using pdfjs-dist (dynamic ESM import). */
async function pdfTextPerPage(buffer: Buffer): Promise<string[]> {
  // pdfjs-dist v6 is ESM-only; the server is CommonJS, so import dynamically.
  // The legacy build is required in Node.js — the modern build needs DOM APIs.
  // At runtime the ESM build exposes named exports on the namespace; the
  // bundled .d.mts nests them under .default, so accept either shape.
  const pdfjsNs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as {
    default?: PdfJsApi;
  } & PdfJsApi;
  const pdfjs: PdfJsApi = pdfjsNs.default ?? pdfjsNs;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let line: string[] = [];
      let lastY: number | null = null;
      for (const raw of content.items as unknown[]) {
        const item = raw as {
          str?: unknown;
          hasEOL?: boolean;
          transform?: unknown;
        };
        const str = typeof item.str === 'string' ? item.str : '';
        const t = item.transform as number[] | undefined;
        const y = Array.isArray(t) && typeof t[5] === 'number' ? (t[5] as number) : NaN;
        if (lastY === null || Number.isNaN(y) || Math.abs(y - lastY) < 3) {
          line.push(str);
          if (lastY === null && !Number.isNaN(y)) lastY = y;
        } else {
          lines.push(line.join(' '));
          line = [str];
          lastY = y;
        }
        if (item.hasEOL) {
          lines.push(line.join(' '));
          line = [];
          lastY = null;
        }
      }
      if (line.length > 0) lines.push(line.join(' '));
      pages.push(
        lines
          .map((l) => l.replace(/\s+/g, ' ').trim())
          .filter((l) => l.length > 0)
          .join('\n'),
      );
    }
  } finally {
    // destroy() is not present in every build; guard it.
    if (typeof doc.destroy === 'function') {
      await doc.destroy().catch(() => undefined);
    }
  }
  return pages;
}

/** Loads a PDF, with a clear error for corrupt or password-protected files. */
async function loadPdfFile(filePath: string): Promise<PDFDocument> {
  const bytes = fs.readFileSync(filePath);
  try {
    return await PDFDocument.load(bytes);
  } catch {
    throw new Error(
      'Could not read this PDF. It may be corrupt or password-protected — unlock it first.',
    );
  }
}

interface ZipEntry {
  path: string;
  name: string;
}

function zipFiles(entries: ZipEntry[], outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = new archiverLib.ZipArchive({ zlib: { level: 9 } });
    output.on('close', () => resolve());
    output.on('error', reject);
    archive.on('error', reject);
    archive.pipe(output);
    for (const e of entries) archive.file(e.path, { name: e.name });
    void archive.finalize();
  });
}

/** pdftoppm render helper: renders all pages, returns sorted page files. */
async function renderPages(
  ctx: ProcessorContext,
  flag: '-jpeg' | '-png',
  dpi: string,
  prefixName: string,
): Promise<string[]> {
  const input = ctx.files[0].path;
  const prefix = path.join(ctx.outputDir, prefixName);
  await runCmd('pdftoppm', [flag, '-r', dpi, input, prefix]);
  const ext = flag === '-png' ? '.png' : '.jpg';
  const pageNum = (f: string): number => {
    const m = f.slice(prefixName.length + 1, -ext.length).match(/^(\d+)$/);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
  };
  const files = fs
    .readdirSync(ctx.outputDir)
    .filter((f) => f.startsWith(prefixName + '-') && f.endsWith(ext))
    .sort((a, b) => pageNum(a) - pageNum(b) || a.localeCompare(b));
  if (files.length === 0) {
    throw new Error('No pages could be rendered from this PDF. It may be corrupt.');
  }
  return files;
}

/** LibreOffice headless conversion of one office document to PDF. */
async function sofficeToPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const input = ctx.files[0].path;
  await ctx.onProgress(10);
  await runCmd(
    'soffice',
    [
      '--headless',
      '--nologo',
      '--nodefault',
      '--nolockcheck',
      '--convert-to',
      'pdf',
      '--outdir',
      ctx.outputDir,
      input,
    ],
    { env: sofficeEnv(ctx.jobId), timeoutMs: 10 * 60 * 1000 },
  );
  await ctx.onProgress(80);
  const produced = path.join(ctx.outputDir, `${path.parse(input).name}.pdf`);
  requireOutput(produced);
  const stored = outputName(ctx, '', 'pdf');
  fs.renameSync(produced, path.join(ctx.outputDir, stored));
  return completeJob(ctx, stored, stored, PDF_MIME);
}

/* ------------------------------- processors ------------------------------ */

async function pdfToImage(ctx: ProcessorContext): Promise<ProcessorResult> {
  const format = optStr(ctx.options, 'format', 'jpg') === 'png' ? 'png' : 'jpg';
  const dpi = optStr(ctx.options, 'dpi', '150') === '300' ? '300' : '150';
  await ctx.onProgress(10);
  const rendered = await renderPages(ctx, format === 'png' ? '-png' : '-jpeg', dpi, 'page');
  await ctx.onProgress(70);
  const ext = format;
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';

  if (rendered.length === 1) {
    const stored = outputName(ctx, '-page-1', ext);
    fs.renameSync(
      path.join(ctx.outputDir, rendered[0]),
      path.join(ctx.outputDir, stored),
    );
    await ctx.onProgress(95);
    return completeJob(ctx, stored, stored, mime);
  }

  const base = inputBase(ctx);
  const entries: ZipEntry[] = rendered.map((f, i) => {
    const name = `${base}-page-${i + 1}.${ext}`;
    const from = path.join(ctx.outputDir, f);
    const to = path.join(ctx.outputDir, name);
    fs.renameSync(from, to);
    return { path: to, name };
  });
  const stored = outputName(ctx, '-pages', 'zip');
  await zipFiles(entries, path.join(ctx.outputDir, stored));
  await ctx.onProgress(95);
  return completeJob(ctx, stored, stored, ZIP_MIME);
}

async function pdfToWord(ctx: ProcessorContext): Promise<ProcessorResult> {
  await ctx.onProgress(10);
  const pages = await pdfTextPerPage(fs.readFileSync(ctx.files[0].path));
  await ctx.onProgress(55);
  if (!pages.some((p) => p.trim())) {
    throw new Error(
      'No text found in this PDF. It is probably a scanned image — try the OCR tool instead.',
    );
  }
  const children: Paragraph[] = [];
  pages.forEach((text, i) => {
    if (i > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
    for (const line of text.split('\n')) {
      children.push(new Paragraph({ children: [new TextRun(line || ' ')] }));
    }
  });
  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  const stored = outputName(ctx, '', 'docx');
  fs.writeFileSync(path.join(ctx.outputDir, stored), buffer);
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, DOCX_MIME);
}

async function pdfToExcel(ctx: ProcessorContext): Promise<ProcessorResult> {
  await ctx.onProgress(10);
  const pages = await pdfTextPerPage(fs.readFileSync(ctx.files[0].path));
  await ctx.onProgress(55);
  if (!pages.some((p) => p.trim())) {
    throw new Error(
      'No text found in this PDF. It is probably a scanned image — try the OCR tool instead.',
    );
  }
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Text');
  sheet.columns = [
    { header: 'Page', key: 'page', width: 8 },
    { header: 'Line', key: 'line', width: 120 },
  ];
  pages.forEach((text, i) => {
    const lines = text.split('\n');
    if (lines.length === 0) {
      sheet.addRow({ page: i + 1, line: '' });
    } else {
      for (const line of lines) sheet.addRow({ page: i + 1, line });
    }
  });
  const stored = outputName(ctx, '', 'xlsx');
  await workbook.xlsx.writeFile(path.join(ctx.outputDir, stored));
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, XLSX_MIME);
}

async function pdfToPowerpoint(ctx: ProcessorContext): Promise<ProcessorResult> {
  await ctx.onProgress(10);
  const rendered = await renderPages(ctx, '-png', '150', 'slide');
  await ctx.onProgress(50);
  const pptx = new PptxGenJS();
  for (const f of rendered) {
    const slide = pptx.addSlide();
    slide.addImage({
      path: path.join(ctx.outputDir, f),
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    });
  }
  const stored = outputName(ctx, '', 'pptx');
  await pptx.writeFile({ fileName: path.join(ctx.outputDir, stored) });
  await ctx.onProgress(90);
  // Clean up the intermediate PNGs; only the .pptx is delivered.
  for (const f of rendered) {
    try {
      fs.unlinkSync(path.join(ctx.outputDir, f));
    } catch {
      /* best effort */
    }
  }
  return completeJob(ctx, stored, stored, PPTX_MIME);
}

async function mergePdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  if (ctx.files.length < 2) {
    throw new Error('Please upload at least 2 PDF files to merge.');
  }
  const merged = await PDFDocument.create();
  for (let i = 0; i < ctx.files.length; i++) {
    const doc = await loadPdfFile(ctx.files[i].path);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
    await ctx.onProgress(Math.round(((i + 1) / ctx.files.length) * 85));
  }
  const stored = outputName(ctx, '-merged', 'pdf');
  fs.writeFileSync(path.join(ctx.outputDir, stored), await merged.save());
  await ctx.onProgress(95);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

async function splitPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const ranges = optStr(ctx.options, 'ranges', '');
  await ctx.onProgress(10);
  const doc = await loadPdfFile(ctx.files[0].path);
  const groups = parsePageSpec(ranges, doc.getPageCount());
  await ctx.onProgress(30);

  if (groups.length === 1) {
    const single = await PDFDocument.create();
    const pages = await single.copyPages(
      doc,
      groups[0].map((p) => p - 1),
    );
    pages.forEach((p) => single.addPage(p));
    const stored = outputName(ctx, '-split', 'pdf');
    fs.writeFileSync(path.join(ctx.outputDir, stored), await single.save());
    await ctx.onProgress(90);
    return completeJob(ctx, stored, stored, PDF_MIME);
  }

  const base = inputBase(ctx);
  const entries: ZipEntry[] = [];
  for (let g = 0; g < groups.length; g++) {
    const sub = await PDFDocument.create();
    const pages = await sub.copyPages(
      doc,
      groups[g].map((p) => p - 1),
    );
    pages.forEach((p) => sub.addPage(p));
    const name = `${base}-part-${g + 1}.pdf`;
    const filePath = path.join(ctx.outputDir, name);
    fs.writeFileSync(filePath, await sub.save());
    entries.push({ path: filePath, name });
    await ctx.onProgress(30 + Math.round(((g + 1) / groups.length) * 55));
  }
  const stored = outputName(ctx, '-split', 'zip');
  await zipFiles(entries, path.join(ctx.outputDir, stored));
  await ctx.onProgress(95);
  return completeJob(ctx, stored, stored, ZIP_MIME);
}

async function compressPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const raw = optStr(ctx.options, 'quality', 'ebook');
  const quality = ['screen', 'ebook', 'printer'].includes(raw) ? raw : 'ebook';
  const stored = outputName(ctx, '-compressed', 'pdf');
  const out = path.join(ctx.outputDir, stored);
  await ctx.onProgress(10);
  await runCmd(
    'gs',
    [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.5',
      `-dPDFSETTINGS=/${quality}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${out}`,
      ctx.files[0].path,
    ],
    { timeoutMs: 10 * 60 * 1000 },
  );
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

async function rotatePdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const rawAngle = optStr(ctx.options, 'angle', '90');
  const angle = ['90', '180', '270'].includes(rawAngle) ? Number(rawAngle) : 90;
  const pagesOpt = optStr(ctx.options, 'pages', 'all');
  await ctx.onProgress(10);
  const doc = await loadPdfFile(ctx.files[0].path);
  const groups = parsePageSpec(pagesOpt || 'all', doc.getPageCount());
  const targets = new Set<number>(groups.flat());
  for (const p of targets) {
    const page = doc.getPage(p - 1);
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  }
  await ctx.onProgress(70);
  const stored = outputName(ctx, '-rotated', 'pdf');
  fs.writeFileSync(path.join(ctx.outputDir, stored), await doc.save());
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

async function protectPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const password = optStr(ctx.options, 'password', '');
  if (!password) {
    throw new Error('Please provide a password to protect the PDF.');
  }
  const stored = outputName(ctx, '-protected', 'pdf');
  const out = path.join(ctx.outputDir, stored);
  await ctx.onProgress(10);
  // Password travels only as argv entries; runCmd never logs argv.
  await runCmd('qpdf', ['--encrypt', password, password, '128', '--', ctx.files[0].path, out]);
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

async function unlockPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const password = optStr(ctx.options, 'password', '');
  const stored = outputName(ctx, '-unlocked', 'pdf');
  const out = path.join(ctx.outputDir, stored);
  await ctx.onProgress(10);
  const args = ['--decrypt'];
  if (password) args.push(`--password=${password}`);
  args.push('--', ctx.files[0].path, out);
  await runCmd('qpdf', args);
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

async function watermarkPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const text = optStr(ctx.options, 'text', 'CONFIDENTIAL');
  if (!text.trim()) {
    throw new Error('Please enter the watermark text.');
  }
  const opacityPct = Math.min(60, Math.max(10, optNum(ctx.options, 'opacity', 25)));
  await ctx.onProgress(10);
  const doc = await loadPdfFile(ctx.files[0].path);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: Math.max(20, width / 2 - 150),
      y: height / 2,
      size: 48,
      opacity: opacityPct / 100,
      rotate: degrees(45),
      color: rgb(0.55, 0.55, 0.55),
    });
  }
  await ctx.onProgress(70);
  const stored = outputName(ctx, '-watermarked', 'pdf');
  fs.writeFileSync(path.join(ctx.outputDir, stored), await doc.save());
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

async function pageNumbersPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const rawPos = optStr(ctx.options, 'position', 'bottom-center');
  const position = ['bottom-center', 'bottom-right', 'top-center'].includes(rawPos)
    ? rawPos
    : 'bottom-center';
  const startAt = Math.max(1, Math.floor(optNum(ctx.options, 'startAt', 1)));
  await ctx.onProgress(10);
  const doc = await loadPdfFile(ctx.files[0].path);
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    let x = width / 2 - 8;
    let y = 24;
    if (position === 'bottom-right') {
      x = width - 44;
      y = 24;
    } else if (position === 'top-center') {
      x = width / 2 - 8;
      y = height - 32;
    }
    page.drawText(String(startAt + i), {
      x,
      y,
      size: 11,
      color: rgb(0.3, 0.3, 0.3),
    });
  });
  await ctx.onProgress(70);
  const stored = outputName(ctx, '-numbered', 'pdf');
  fs.writeFileSync(path.join(ctx.outputDir, stored), await doc.save());
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

async function ocrPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const rawLang = optStr(ctx.options, 'language', 'eng');
  const language = /^[a-z]{3}$/.test(rawLang) ? rawLang : 'eng';
  await ctx.onProgress(5);
  const rendered = await renderPages(ctx, '-png', '300', 'ocr-page');
  await ctx.onProgress(25);

  const ocrPdfs: string[] = [];
  for (let i = 0; i < rendered.length; i++) {
    const pngPath = path.join(ctx.outputDir, rendered[i]);
    const base = path.join(ctx.outputDir, `ocr-out-${i + 1}`);
    // tesseract writes <base>.pdf when the "pdf" config is given.
    await runCmd('tesseract', [pngPath, base, 'pdf', '--oem', '1', '-l', language], {
      timeoutMs: 120000,
    });
    const produced = `${base}.pdf`;
    requireOutput(produced);
    ocrPdfs.push(produced);
    try {
      fs.unlinkSync(pngPath);
    } catch {
      /* best effort */
    }
    await ctx.onProgress(25 + Math.round(((i + 1) / rendered.length) * 55));
  }

  const merged = await PDFDocument.create();
  for (const p of ocrPdfs) {
    const doc = await PDFDocument.load(fs.readFileSync(p));
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((pg) => merged.addPage(pg));
    try {
      fs.unlinkSync(p);
    } catch {
      /* best effort */
    }
  }
  const stored = outputName(ctx, '-ocr', 'pdf');
  fs.writeFileSync(path.join(ctx.outputDir, stored), await merged.save());
  await ctx.onProgress(95);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

async function pdfToText(ctx: ProcessorContext): Promise<ProcessorResult> {
  await ctx.onProgress(10);
  const pages = await pdfTextPerPage(fs.readFileSync(ctx.files[0].path));
  await ctx.onProgress(60);
  if (!pages.some((p) => p.trim())) {
    throw new Error(
      'No text found in this PDF. It is probably a scanned image — try the OCR tool instead.',
    );
  }
  const body = pages.map((t, i) => `--- Page ${i + 1} ---\n\n${t}`).join('\n\n');
  const stored = outputName(ctx, '', 'txt');
  fs.writeFileSync(path.join(ctx.outputDir, stored), body, 'utf8');
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, 'text/plain');
}

async function reorderPdf(ctx: ProcessorContext): Promise<ProcessorResult> {
  const orderStr = optStr(ctx.options, 'order', '');
  await ctx.onProgress(10);
  const doc = await loadPdfFile(ctx.files[0].path);
  const pageCount = doc.getPageCount();
  const parts = orderStr
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) {
    throw new Error('Please enter the new page order, e.g. "3, 1, 2".');
  }
  const order = parts.map((p) => {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 1 || n > pageCount) {
      throw new Error(
        `Invalid page "${p}". This PDF has ${pageCount} page${pageCount === 1 ? '' : 's'} (1-${pageCount}).`,
      );
    }
    return n;
  });
  if (new Set(order).size !== order.length) {
    throw new Error('Each page number may only appear once in the new order.');
  }
  if (order.length !== pageCount) {
    throw new Error(`Please list all ${pageCount} pages exactly once.`);
  }
  const out = await PDFDocument.create();
  const pages = await out.copyPages(
    doc,
    order.map((n) => n - 1),
  );
  pages.forEach((p) => out.addPage(p));
  await ctx.onProgress(70);
  const stored = outputName(ctx, '-reordered', 'pdf');
  fs.writeFileSync(path.join(ctx.outputDir, stored), await out.save());
  await ctx.onProgress(90);
  return completeJob(ctx, stored, stored, PDF_MIME);
}

/* --------------------------------- registry ------------------------------ */

export const PDF_PROCESSORS: Record<string, ProcessorFn> = {
  'pdf-to-image': pdfToImage,
  'pdf-to-word': pdfToWord,
  'word-to-pdf': sofficeToPdf,
  'pdf-to-excel': pdfToExcel,
  'excel-to-pdf': sofficeToPdf,
  'pdf-to-powerpoint': pdfToPowerpoint,
  'powerpoint-to-pdf': sofficeToPdf,
  'merge-pdf': mergePdf,
  'split-pdf': splitPdf,
  'compress-pdf': compressPdf,
  'rotate-pdf': rotatePdf,
  'protect-pdf': protectPdf,
  'unlock-pdf': unlockPdf,
  'watermark-pdf': watermarkPdf,
  'page-numbers-pdf': pageNumbersPdf,
  'ocr-pdf': ocrPdf,
  'pdf-to-text': pdfToText,
  'reorder-pdf': reorderPdf,
};
