'use client';

import { useEffect, useRef, useState } from 'react';
import {
  downloadUrl,
  pollJob,
  startJobWithoutFile,
  uploadForConversion,
  type JobStatus,
} from '@/lib/api';
import type { OptionField } from '@/lib/options';
import {
  IconCheck,
  IconClock,
  IconCopy,
  IconDownload,
  IconFile,
  IconShield,
  IconUpload,
  IconX,
} from './icons';
import { CropEditor, type CropValue } from './CropEditor';
import { TrimRange } from './TrimRange';

export interface ToolLayoutProps {
  toolId: string;
  name: string;
  tagline: string;
  acceptedExts: string[];
  maxSizeMB: number;
  multiple: boolean;
  optionsSchema: OptionField[];
  requiresFile: boolean;
  enabled: boolean;
  phase: number;
  /** 'text' shows the result inline with a copy button; default 'file'. */
  resultKind?: 'text' | 'file';
}

type Stage = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** Extension without leading dots, lowercase — for comparison. */
function normExt(e: string): string {
  return e.replace(/^\.+/, '').toLowerCase();
}

function defaultOptions(schema: OptionField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of schema) {
    if (f.default !== undefined) out[f.name] = f.default;
    else if (f.type === 'checkbox') out[f.name] = false;
  }
  return out;
}

function OptionControls({
  schema,
  values,
  onChange,
}: {
  schema: OptionField[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}) {
  if (schema.length === 0) return null;
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {schema.map((field) => {
        const value = values[field.name] ?? field.default ?? '';
        const id = `opt-${field.name}`;
        const label = (
          <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {field.label}
          </label>
        );
        const help = field.help ? (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{field.help}</p>
        ) : null;
        const inputCls =
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
        return (
          <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            {label}
            {field.type === 'select' ? (
              <select
                id={id}
                className={inputCls}
                value={String(value)}
                onChange={(e) => onChange(field.name, e.target.value)}
              >
                {(field.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'number' ? (
              <input
                id={id}
                type="number"
                className={inputCls}
                value={String(value)}
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                onChange={(e) => onChange(field.name, Number(e.target.value))}
              />
            ) : field.type === 'checkbox' ? (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  id={id}
                  type="checkbox"
                  className="h-4 w-4 rounded accent-indigo-600"
                  checked={Boolean(value)}
                  onChange={(e) => onChange(field.name, e.target.checked)}
                />
                {field.help ?? 'Enable'}
              </label>
            ) : field.type === 'textarea' ? (
              <textarea
                id={id}
                className={inputCls}
                rows={5}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                value={String(value)}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            ) : (
              <input
                id={id}
                type={field.type === 'password' ? 'password' : 'text'}
                className={inputCls}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                value={String(value)}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            )}
            {field.type !== 'checkbox' && help}
          </div>
        );
      })}
    </div>
  );
}

/** One selected file with a real media preview. Owns its object URL. */
function FilePreview({
  file,
  onRemove,
  canRemove,
}: {
  file: File;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const kind = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('audio/')
        ? 'audio'
        : 'other';

  return (
    <li className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
        {url && kind === 'image' && (
          <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />
        )}
        {url && kind === 'video' && (
          <video src={url} preload="metadata" muted playsInline className="h-full w-full object-cover" />
        )}
        {kind === 'audio' && (
          <span className="px-1 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
            Audio
          </span>
        )}
        {kind === 'other' && <IconFile className="h-6 w-6 text-slate-400" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{formatMB(file.size)}</p>
        {url && kind === 'video' && (
          <video src={url} controls preload="metadata" className="mt-1 h-8 w-full max-w-56 rounded" />
        )}
        {url && kind === 'audio' && (
          <audio src={url} controls preload="metadata" className="mt-1 h-8 w-full max-w-56" />
        )}
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="ml-1 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <IconX className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

/** Text result view: shows the text, copy button first, download second. */
function TextResult({
  jobId,
  fileName,
  onReset,
}: {
  jobId: string;
  fileName: string;
  onReset: () => void;
}) {
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(downloadUrl(jobId))
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const t = await r.text();
        if (alive) setText(t);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [jobId]);

  const copy = async () => {
    if (text == null) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        // ignore — user can still download
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
        <IconCheck className="h-6 w-6" />
      </span>
      <h2 className="mt-3 text-lg font-bold">Your result</h2>

      {failed ? (
        <div className="mt-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            We couldn&apos;t load the preview, but your file is ready.
          </p>
          <a
            href={downloadUrl(jobId)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <IconDownload className="h-5 w-5" />
            Download {fileName}
          </a>
        </div>
      ) : text === null ? (
        <div className="mx-auto mt-4 h-40 max-w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" aria-label="Loading result…" />
      ) : (
        <>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 text-left text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {text}
          </pre>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              {copied ? <IconCheck className="h-5 w-5" /> : <IconCopy className="h-5 w-5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={downloadUrl(jobId)}
              download={fileName}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <IconDownload className="h-5 w-5" />
              Download .txt
            </a>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Convert another file
      </button>
    </div>
  );
}

export function ToolLayout({
  toolId,
  name,
  tagline,
  acceptedExts,
  maxSizeMB,
  multiple,
  optionsSchema,
  requiresFile,
  enabled,
  phase,
  resultKind = 'file',
}: ToolLayoutProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [uploadPct, setUploadPct] = useState(0);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Record<string, unknown>>(() =>
    defaultOptions(optionsSchema),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900 dark:bg-amber-950/40">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
          <IconClock className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold">Coming in Phase {phase}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
          {name} is on the roadmap and not live yet. {tagline} Check back soon, or browse the
          tools that are already available.
        </p>
      </div>
    );
  }

  // BUG-1 fix: compare dot-stripped, lowercased extensions on BOTH sides.
  const acceptAttr = acceptedExts
    .map((e) => (e.startsWith('.') ? e : `.${e}`))
    .join(',');
  const displayExts = acceptedExts.map((e) => normExt(e).toUpperCase()).join(', ');

  const pickError = (f: File): string | null => {
    const ext = normExt(f.name.split('.').pop() || '');
    const allowed = acceptedExts.map(normExt);
    if (acceptedExts.length > 0 && !allowed.includes(ext)) {
      return `"${f.name}" is not supported here. Accepted formats: ${displayExts}`;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      return `"${f.name}" is ${formatMB(f.size)} — the limit is ${maxSizeMB} MB.`;
    }
    return null;
  };

  const onFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const next = multiple ? [...files] : [];
    for (const f of Array.from(incoming)) {
      const err = pickError(f);
      if (err) {
        setError(err);
        return;
      }
      next.push(f);
      if (next.length >= 20) break;
    }
    setError(null);
    setFiles(next);
  };

  const start = async () => {
    if (requiresFile && files.length === 0) return;
    setStage('uploading');
    setUploadPct(0);
    setError(null);
    setJob(null);
    try {
      const { jobId } = requiresFile
        ? await uploadForConversion(toolId, files, setUploadPct, options)
        : await startJobWithoutFile(toolId, options);
      setStage('processing');
      const final = await pollJob(jobId, (j) => setJob(j));
      setJob(final);
      if (final.status === 'completed') {
        setStage('done');
      } else {
        setStage('error');
        setError(final.error || 'Conversion failed. Please try again.');
      }
    } catch (e) {
      setStage('error');
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  };

  const reset = () => {
    setFiles([]);
    setStage('idle');
    setUploadPct(0);
    setJob(null);
    setError(null);
  };

  const isCropTool = toolId === 'image-crop';
  const isTrimTool = toolId === 'trim-audio';

  // Visual editors replace their raw number/text fields; the selects stay.
  const visibleSchema = optionsSchema.filter((f) => {
    if (isCropTool && ['x', 'y', 'width', 'height'].includes(f.name)) return false;
    if (isTrimTool && ['start', 'end'].includes(f.name)) return false;
    return true;
  });

  const setOption = (optName: string, value: unknown) =>
    setOptions((o) => ({ ...o, [optName]: value }));

  const cropValue: CropValue = {
    x: Number(options.x) || 0,
    y: Number(options.y) || 0,
    width: Number(options.width) || 0,
    height: Number(options.height) || 0,
  };
  const cropValid = !isCropTool || (cropValue.width > 0 && cropValue.height > 0);

  const busy = stage === 'uploading' || stage === 'processing';
  const progress = stage === 'uploading' ? uploadPct : (job?.progress ?? 0);
  const convertDisabled = (requiresFile && files.length === 0) || !cropValid;
  const actionLabel = requiresFile
    ? files.length > 0
      ? `Convert ${files.length === 1 ? files[0].name : `${files.length} files`}`
      : 'Select a file to start'
    : 'Generate';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Dropzone */}
      {requiresFile && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload ${multiple ? 'files' : 'a file'} for ${name}`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center px-6 py-12 text-center transition ${
            dragging
              ? 'bg-indigo-50 dark:bg-indigo-950/50'
              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/70'
          }`}
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white">
            <IconUpload className="h-6 w-6" />
          </span>
          <p className="mt-4 font-semibold">
            {multiple ? 'Drag and drop your files here' : 'Drag and drop your file here'}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            or <span className="font-medium text-indigo-600 dark:text-indigo-400">browse files</span>
          </p>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            {displayExts} · max {maxSizeMB} MB
            {multiple ? ' per file' : ''}
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={acceptAttr}
            multiple={multiple}
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
      )}

      <div className="border-t border-slate-200 p-6 dark:border-slate-800">
        {/* Selected files with previews */}
        {requiresFile && files.length > 0 && stage !== 'done' && (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <FilePreview
                key={`${f.name}-${f.size}-${i}`}
                file={f}
                canRemove={!busy}
                onRemove={() => setFiles(files.filter((_, j) => j !== i))}
              />
            ))}
          </ul>
        )}

        {/* Visual crop editor (replaces x/y/width/height fields) */}
        {isCropTool && files.length > 0 && !busy && stage !== 'done' && (
          <CropEditor
            file={files[0]}
            aspect={String(options.aspect ?? 'free')}
            value={cropValue}
            onChange={(v) =>
              setOptions((o) => ({ ...o, x: v.x, y: v.y, width: v.width, height: v.height }))
            }
          />
        )}

        {/* Visual trim range (replaces start/end text fields) */}
        {isTrimTool && files.length > 0 && !busy && stage !== 'done' && (
          <TrimRange
            file={files[0]}
            start={String(options.start ?? '0')}
            end={String(options.end ?? '')}
            onChange={(s, e) => setOptions((o) => ({ ...o, start: s, end: e }))}
          />
        )}

        {/* Options */}
        {!busy && stage !== 'done' && (
          <OptionControls schema={visibleSchema} values={options} onChange={setOption} />
        )}

        {/* Action button */}
        {stage === 'idle' && (
          <>
            <button
              type="button"
              onClick={start}
              disabled={convertDisabled}
              className="mt-4 w-full rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {actionLabel}
            </button>
            {isCropTool && files.length > 0 && !cropValid && (
              <p className="mt-2 text-center text-sm text-amber-600 dark:text-amber-400">
                Draw a crop area on the image to enable Convert.
              </p>
            )}
          </>
        )}

        {/* Progress */}
        {busy && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {stage === 'uploading' ? 'Uploading…' : 'Converting…'}
              </span>
              <span className="tabular-nums text-slate-500">{progress}%</span>
            </div>
            <div
              className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Keep this tab open. Large files take longer.
            </p>
          </div>
        )}

        {/* Error */}
        {stage === 'error' && error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Result — text tools show inline with copy first */}
        {stage === 'done' && job?.result && resultKind === 'text' && (
          <TextResult jobId={job.id} fileName={job.result.fileName} onReset={reset} />
        )}

        {/* Result — file tools keep the download button */}
        {stage === 'done' && job?.result && resultKind !== 'text' && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
              <IconCheck className="h-6 w-6" />
            </span>
            <p className="mt-3 font-semibold">Conversion complete</p>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {job.result.fileName} · {formatMB(job.result.size)}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <a
                href={downloadUrl(job.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                <IconDownload className="h-5 w-5" />
                Download file
              </a>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Convert another file
              </button>
            </div>
          </div>
        )}

        {/* Privacy note */}
        <p className="mt-5 flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500">
          <IconShield className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Your file is processed securely and auto-deleted from our servers after 60 minutes.
            We never share or reuse uploaded files.
          </span>
        </p>
      </div>
    </div>
  );
}
