'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    dataLayer?: Array<unknown>;
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = 'ch-consent';

function ensureGtag(): (...args: unknown[]) => void {
  if (typeof window.gtag === 'function') return window.gtag;
  window.dataLayer = window.dataLayer || [];
  const stub = (...args: unknown[]) => {
    window.dataLayer!.push(args);
  };
  window.gtag = stub;
  return stub;
}

/**
 * Google Consent Mode v2 banner. Defaults everything to denied until the
 * visitor chooses, then stores the choice in localStorage ('ch-consent').
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored) return;

    const gtag = ensureGtag();
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500,
    });
    setVisible(true);
  }, []);

  const choose = (accepted: boolean) => {
    const gtag = ensureGtag();
    const value = accepted ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    });
    try {
      window.localStorage.setItem(STORAGE_KEY, accepted ? 'accepted' : 'declined');
    } catch {
      // Storage unavailable; banner simply hides for this session.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We use cookies for analytics and to show ads that keep ConvertHub free. You can accept
          or decline — see our{' '}
          <Link href="/cookies" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            cookie policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
