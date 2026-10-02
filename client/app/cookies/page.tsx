import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/cookies`;
  return {
    title: `Cookie Policy | ${SITE_NAME}`,
    description: `What cookies ${SITE_NAME} uses — consent choices, theme preference, and advertising cookies — and how to manage them.`,
    alternates: { canonical: url },
  };
}

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">Cookie Policy</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Cookie Policy</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: October 2, 2026</p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold">What cookies are</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            Cookies are small text files stored by your browser. {SITE_NAME} uses as few as
            possible — only what is needed for the site to remember your choices and to keep the
            free service running through advertising.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Cookies we set</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-slate-700 dark:text-slate-200">
            <li>
              <strong>Consent choice.</strong> Remembers whether you accepted or declined optional
              cookies, so we do not ask you on every visit.
            </li>
            <li>
              <strong>Theme preference.</strong> Remembers your dark/light mode choice on your device.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            These are strictly necessary for the preferences you set and contain no personal
            information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Advertising cookies</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            {SITE_NAME} is supported by advertising, including Google AdSense. Google and its
            partners may set cookies to serve personalized ads based on your visits to this and
            other sites. Where the law requires it, we ask for your consent before these
            advertising cookies are used, and you can change your choice at any time.
          </p>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            You can also opt out of personalized advertising directly through Google&apos;s{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Ads Settings
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">How to manage cookies</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            You can block or delete cookies at any time through your browser settings — every major
            browser offers this under Privacy or Settings. Note that blocking all cookies may
            prevent the site from remembering your theme or consent choice, but the conversion
            tools themselves will keep working.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Questions</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            See our{' '}
            <Link href="/privacy" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Privacy Policy
            </Link>{' '}
            for the full picture, or email{' '}
            <a
              href="mailto:hello@example.com"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              hello@example.com
            </a>{' '}
            (placeholder address — replace with the real support email before launch).
          </p>
        </section>
      </div>
    </div>
  );
}
