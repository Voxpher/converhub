import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/disclaimer`;
  return {
    title: `Disclaimer | ${SITE_NAME}`,
    description: `Important notes on ${SITE_NAME} conversions: best-effort results, verify output before relying on it, and limits of the free service.`,
    alternates: { canonical: url },
  };
}

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">Disclaimer</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Disclaimer</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: October 2, 2026</p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold">Conversions are best-effort</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            {SITE_NAME}&apos;s tools convert your files automatically. While we work hard to keep
            every conversion faithful, complex layouts, unusual fonts, embedded media, scanned
            images, or partially corrupt inputs can produce imperfect results — shifted formatting,
            misread characters, or dropped elements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Always verify the output</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            Please check every converted file before you rely on it, share it, or submit it
            anywhere. In particular, do not use converted output for critical purposes — legal
            filings, medical records, financial submissions, academic work, or compliance documents
            — without carefully verifying that the content is complete and accurate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">No professional advice</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            Nothing on this site — including blog articles and tool descriptions — constitutes
            legal, financial, medical, or other professional advice. Our guides explain how file
            conversion works; they are not a substitute for qualified professional judgement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Third-party content</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            The site may link to external websites (for example, Google&apos;s advertising
            controls). We are not responsible for the content, accuracy, or privacy practices of
            external sites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Keep backups</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            Always keep a copy of your original files before converting. Converted outputs are
            derived files, and originals are the safest source of truth if anything looks wrong.
          </p>
        </section>
      </div>
    </div>
  );
}
