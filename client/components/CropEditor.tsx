'use client';

import { useEffect, useRef, useState } from 'react';

export interface CropValue {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropEditorProps {
  file: File;
  aspect: string;
  value: CropValue;
  onChange: (v: CropValue) => void;
}

function parseAspect(aspect: string): number | null {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(aspect.trim());
  if (!m) return null;
  const w = parseFloat(m[1]);
  const h = parseFloat(m[2]);
  if (!w || !h) return null;
  return w / h;
}

const MIN = 10; // minimum crop size in original pixels

/**
 * Visual crop editor. Coordinates are always in ORIGINAL image pixels.
 * The box is drawn on a scaled-to-fit preview and converted back.
 */
export function CropEditor({ file, aspect, value, onChange }: CropEditorProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [disp, setDisp] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<CropValue | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: 'draw' | 'move' | 'resize';
    startX: number; // original px
    startY: number;
    orig: CropValue;
  } | null>(null);
  const ratio = parseAspect(aspect);
  const ratioRef = useRef(ratio);
  ratioRef.current = ratio;

  // Object URL lifecycle
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    setNatural(null);
    setDisp(null);
    setRect(null);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const commit = (r: CropValue) => {
    const clean = {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
    setRect(clean);
    onChange(clean);
  };

  const initRect = (nw: number, nh: number) => {
    const r = ratioRef.current;
    let w = Math.round(nw * 0.8);
    let h = r ? Math.round(w / r) : Math.round(nh * 0.8);
    if (h > nh * 0.9 && r) {
      h = Math.round(nh * 0.9);
      w = Math.round(h * r);
    }
    w = Math.max(MIN, Math.min(w, nw));
    h = Math.max(MIN, Math.min(h, nh));
    const v: CropValue =
      value.width > 0 && value.height > 0
        ? {
            x: Math.max(0, Math.min(value.x, nw - MIN)),
            y: Math.max(0, Math.min(value.y, nh - MIN)),
            width: Math.max(MIN, Math.min(value.width, nw)),
            height: Math.max(MIN, Math.min(value.height, nh)),
          }
        : { x: Math.round((nw - w) / 2), y: Math.round((nh - h) / 2), width: w, height: h };
    // If an aspect is locked, force the incoming value to it too.
    if (r) {
      v.height = Math.max(MIN, Math.round(v.width / r));
      if (v.y + v.height > nh) v.y = Math.max(0, nh - v.height);
    }
    commit(v);
  };

  // Re-apply aspect lock to the current box when the aspect option changes.
  useEffect(() => {
    if (!rect || !natural) return;
    const r = ratioRef.current;
    if (!r) return;
    const h = Math.max(MIN, Math.round(rect.width / r));
    const clamped: CropValue = {
      ...rect,
      height: h,
      y: Math.min(rect.y, natural.h - h),
    };
    commit(clamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNatural({ w: nw, h: nh });
    setDisp({ w: img.clientWidth, h: img.clientHeight });
    initRect(nw, nh);
  };

  if (!url) return null;
  const scale = natural && disp ? disp.w / natural.w : 1;

  const toOrig = (clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el || !natural) return { x: 0, y: 0 };
    const box = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(natural.w, ((clientX - box.left) / box.width) * natural.w)),
      y: Math.max(0, Math.min(natural.h, ((clientY - box.top) / box.height) * natural.h)),
    };
  };

  const applyRatio = (r: CropValue, anchorX: number, anchorY: number): CropValue => {
    const ra = ratioRef.current;
    if (!ra) return r;
    // width-driven; if it overflows vertically, fall back to height-driven
    let h = r.width / ra;
    if (anchorY + h > (natural?.h ?? 0)) {
      h = (natural?.h ?? 0) - anchorY;
      r.width = h * ra;
    }
    return { ...r, height: Math.max(MIN, h) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!rect || !natural) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const p = toOrig(e.clientX, e.clientY);
    const d = rect;
    const s = scale;
    const cornerTol = 24 / s; // 24 displayed px tolerance
    const nearSE =
      Math.abs(p.x - (d.x + d.width)) < cornerTol && Math.abs(p.y - (d.y + d.height)) < cornerTol;
    if (nearSE) {
      dragRef.current = { mode: 'resize', startX: p.x, startY: p.y, orig: { ...d } };
    } else if (p.x >= d.x && p.x <= d.x + d.width && p.y >= d.y && p.y <= d.y + d.height) {
      dragRef.current = { mode: 'move', startX: p.x, startY: p.y, orig: { ...d } };
    } else {
      dragRef.current = { mode: 'draw', startX: p.x, startY: p.y, orig: { x: p.x, y: p.y, width: 0, height: 0 } };
    }
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !natural) return;
    const p = toOrig(e.clientX, e.clientY);
    const { w: nw, h: nh } = natural;
    if (drag.mode === 'draw') {
      const x1 = Math.min(drag.startX, p.x);
      const y1 = Math.min(drag.startY, p.y);
      let r: CropValue = {
        x: x1,
        y: y1,
        width: Math.abs(p.x - drag.startX),
        height: Math.abs(p.y - drag.startY),
      };
      r = applyRatio(r, x1, y1);
      r.width = Math.min(r.width, nw - r.x);
      r.height = Math.min(r.height, nh - r.y);
      commit(r);
    } else if (drag.mode === 'move') {
      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;
      const o = drag.orig;
      commit({
        x: Math.max(0, Math.min(nw - o.width, o.x + dx)),
        y: Math.max(0, Math.min(nh - o.height, o.y + dy)),
        width: o.width,
        height: o.height,
      });
    } else {
      const o = drag.orig;
      let w = Math.max(MIN, Math.min(p.x - o.x, nw - o.x));
      let r: CropValue = { ...o, width: w };
      r = applyRatio(r, o.x, o.y);
      r.height = Math.max(MIN, Math.min(r.height, nh - o.y));
      if (ratioRef.current) r.width = r.height * (ratioRef.current as number);
      commit(r);
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const dr = rect
    ? { x: rect.x * scale, y: rect.y * scale, w: rect.width * scale, h: rect.height * scale }
    : null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        Draw your crop area on the image
        {ratio ? ` (locked to ${aspect})` : ''}
      </p>
      <div className="flex justify-center rounded-xl bg-slate-100 p-3 dark:bg-slate-800/60">
        <div
          ref={wrapRef}
          className="relative inline-block touch-none select-none overflow-hidden rounded-lg"
          style={{ maxWidth: '100%' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="application"
          aria-label="Crop area editor. Drag on the image to draw a crop box, drag inside it to move, drag the bottom-right handle to resize."
        >
          <img
            src={url}
            alt="Crop preview"
            onLoad={onImgLoad}
            className="block max-h-[420px] w-auto max-w-full"
            draggable={false}
          />
          {dr && disp && (
            <>
              {/* dimmed areas outside the box */}
              <div className="pointer-events-none absolute left-0 top-0 h-full bg-black/50" style={{ width: dr.x }} />
              <div className="pointer-events-none absolute top-0 h-full bg-black/50" style={{ left: dr.x + dr.w, right: 0 }} />
              <div className="pointer-events-none absolute top-0 bg-black/50" style={{ left: dr.x, width: dr.w, height: dr.y }} />
              <div className="pointer-events-none absolute bg-black/50" style={{ left: dr.x, top: dr.y + dr.h, width: dr.w, bottom: 0 }} />
              {/* crop box */}
              <div
                className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                style={{ left: dr.x, top: dr.y, width: dr.w, height: dr.h }}
              >
                {/* rule of thirds */}
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/60" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/60" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/60" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/60" />
                {/* resize handle */}
                <div className="absolute -bottom-2.5 -right-2.5 h-5 w-5 rounded-sm border-2 border-indigo-600 bg-white dark:bg-slate-100" />
              </div>
            </>
          )}
        </div>
      </div>
      {rect && natural && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          Crop area: {rect.width} × {rect.height} px
          {rect.width === 0 || rect.height === 0
            ? ' — draw a box on the image to enable Convert.'
            : ''}
        </p>
      )}
    </div>
  );
}
