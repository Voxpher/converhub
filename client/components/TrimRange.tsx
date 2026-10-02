'use client';

import { useEffect, useRef, useState } from 'react';

interface TrimRangeProps {
  file: File;
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}

/** Parse "mm:ss", "ss.s" or plain seconds into seconds. */
function parseSeconds(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  if (s.includes(':')) {
    const [m, sec] = s.split(':');
    const mins = Number(m);
    const secs = Number(sec);
    if (!Number.isFinite(mins) || !Number.isFinite(secs) || mins < 0 || secs < 0) return null;
    return mins * 60 + secs;
  }
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function formatClock(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Visual trim-range picker. Drag the two handles (or the selected region)
 * over the audio timeline; start/end are written back as plain seconds.
 */
export function TrimRange({ file, start, end, onChange }: TrimRangeProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: 'start' | 'end' | 'region'; grabOffset: number } | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    setDuration(null);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const startSec = (() => {
    const p = parseSeconds(start);
    return p === null || !Number.isFinite(p) ? 0 : Math.max(0, p);
  })();
  const endParsed = parseSeconds(end);
  const endSec = endParsed === null ? null : endParsed;
  const dur = duration ?? 0;
  const effEnd = endSec === null || endSec <= 0 || (dur > 0 && endSec > dur) ? dur : endSec;

  const clampStart = (v: number) => Math.max(0, Math.min(v, Math.max(0, effEnd - 0.5)));
  const clampEnd = (v: number) => Math.min(dur, Math.max(v, Math.min(dur, startSec + 0.5)));

  const emit = (s: number, e: number) => onChange(String(round1(s)), String(round1(e)));

  const posToSec = (clientX: number): number => {
    const el = trackRef.current;
    if (!el || dur <= 0) return 0;
    const box = el.getBoundingClientRect();
    const t = (clientX - box.left) / box.width;
    return Math.max(0, Math.min(dur, t * dur));
  };

  const onPointerDown = (mode: 'start' | 'end' | 'region') => (e: React.PointerEvent) => {
    if (dur <= 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { mode, grabOffset: mode === 'region' ? posToSec(e.clientX) - startSec : 0 };
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || dur <= 0) return;
    const sec = posToSec(e.clientX);
    if (drag.mode === 'start') emit(clampStart(sec), effEnd);
    else if (drag.mode === 'end') emit(startSec, clampEnd(sec));
    else {
      const len = effEnd - startSec;
      const ns = Math.max(0, Math.min(dur - len, sec - drag.grabOffset));
      emit(ns, ns + len);
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const pct = (v: number) => (dur > 0 ? `${(v / dur) * 100}%` : '0%');

  // Local text-field state, synced from props when not being edited.
  const [startText, setStartText] = useState(formatClock(startSec));
  const [endText, setEndText] = useState(end === '' ? '' : formatClock(effEnd));
  const [editing, setEditing] = useState<'start' | 'end' | null>(null);
  useEffect(() => {
    if (editing !== 'start') setStartText(formatClock(startSec));
    if (editing !== 'end') setEndText(end === '' ? '' : formatClock(effEnd));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, duration]);

  const commitText = (which: 'start' | 'end', raw: string) => {
    setEditing(null);
    if (which === 'end' && raw.trim() === '') {
      onChange(String(round1(startSec)), '');
      return;
    }
    const p = parseSeconds(raw);
    if (p === null) {
      // invalid → revert display
      setStartText(formatClock(startSec));
      setEndText(end === '' ? '' : formatClock(effEnd));
      return;
    }
    if (which === 'start') emit(clampStart(p), effEnd);
    else emit(startSec, clampEnd(p));
  };

  const inputCls =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm tabular-nums text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      {url && (
        <audio src={url} preload="metadata" className="hidden" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)} />
      )}
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Select the part to keep
      </p>

      {dur > 0 ? (
        <>
          <div
            ref={trackRef}
            className="relative mt-4 h-10 touch-none select-none rounded-lg bg-slate-200 dark:bg-slate-700"
            role="group"
            aria-label="Trim range timeline"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* selected region */}
            <div
              className="absolute inset-y-0 cursor-grab rounded-lg bg-indigo-500/70 active:cursor-grabbing"
              style={{ left: pct(startSec), width: `calc(${pct(effEnd)} - ${pct(startSec)})` }}
              onPointerDown={onPointerDown('region')}
              role="slider"
              aria-label="Selected region. Drag to move."
              aria-valuemin={0}
              aria-valuemax={Math.round(dur)}
              aria-valuenow={Math.round(startSec)}
              tabIndex={0}
              onKeyDown={(e) => {
                const step = e.shiftKey ? 5 : 1;
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  const d = e.key === 'ArrowLeft' ? -step : step;
                  const len = effEnd - startSec;
                  const ns = Math.max(0, Math.min(dur - len, startSec + d));
                  emit(ns, ns + len);
                }
              }}
            />
            {/* start handle */}
            <div
              className="absolute inset-y-0 w-6 -translate-x-1/2 cursor-ew-resize"
              style={{ left: pct(startSec) }}
              onPointerDown={onPointerDown('start')}
              role="slider"
              aria-label="Trim start"
              aria-valuemin={0}
              aria-valuemax={Math.round(dur)}
              aria-valuenow={Math.round(startSec)}
              aria-valuetext={formatClock(startSec)}
              tabIndex={0}
              onKeyDown={(e) => {
                const step = e.shiftKey ? 5 : 1;
                if (e.key === 'ArrowLeft') { e.preventDefault(); emit(clampStart(startSec - step), effEnd); }
                if (e.key === 'ArrowRight') { e.preventDefault(); emit(clampStart(startSec + step), effEnd); }
              }}
            >
              <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-indigo-700 dark:bg-indigo-300" />
            </div>
            {/* end handle */}
            <div
              className="absolute inset-y-0 w-6 -translate-x-1/2 cursor-ew-resize"
              style={{ left: pct(effEnd) }}
              onPointerDown={onPointerDown('end')}
              role="slider"
              aria-label="Trim end"
              aria-valuemin={0}
              aria-valuemax={Math.round(dur)}
              aria-valuenow={Math.round(effEnd)}
              aria-valuetext={formatClock(effEnd)}
              tabIndex={0}
              onKeyDown={(e) => {
                const step = e.shiftKey ? 5 : 1;
                if (e.key === 'ArrowLeft') { e.preventDefault(); emit(startSec, clampEnd(effEnd - step)); }
                if (e.key === 'ArrowRight') { e.preventDefault(); emit(startSec, clampEnd(effEnd + step)); }
              }}
            >
              <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-indigo-700 dark:bg-indigo-300" />
            </div>
          </div>
          <div className="mt-1.5 flex justify-between text-xs tabular-nums text-slate-500 dark:text-slate-400">
            <span>{formatClock(startSec)}</span>
            <span>{formatClock(effEnd)} of {formatClock(dur)}</span>
          </div>
        </>
      ) : (
        <div className="mt-4 h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" aria-label="Loading audio…" />
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="trim-start" className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Start (m:ss)
          </label>
          <input
            id="trim-start"
            className={inputCls}
            value={startText}
            onChange={(e) => { setEditing('start'); setStartText(e.target.value); }}
            onBlur={(e) => commitText('start', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            inputMode="numeric"
            placeholder="0:00"
          />
        </div>
        <div>
          <label htmlFor="trim-end" className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            End (m:ss, empty = rest)
          </label>
          <input
            id="trim-end"
            className={inputCls}
            value={endText}
            onChange={(e) => { setEditing('end'); setEndText(e.target.value); }}
            onBlur={(e) => commitText('end', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            inputMode="numeric"
            placeholder={formatClock(dur)}
          />
        </div>
      </div>
    </div>
  );
}
