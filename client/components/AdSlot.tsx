'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

type AdSlotProps = {
  /** AdSense ad unit ID (data-ad-slot). Omit for auto/responsive units. */
  slot?: string;
  /** data-ad-format value. */
  format?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Lazy AdSense slot. Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT is set,
 * then pushes to adsbygoogle only when the slot scrolls near the viewport.
 */
export function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !pushedRef.current) {
            pushedRef.current = true;
            try {
              window.adsbygoogle = window.adsbygoogle || [];
              window.adsbygoogle.push({});
            } catch {
              // AdSense script not ready; keep the placeholder without throwing.
            }
            observer.disconnect();
          }
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // No publisher ID configured -> render nothing (no layout shift, no errors).
  if (!ADSENSE_CLIENT) return null;

  return (
    <div ref={containerRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
