import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/terms`;
  return {
    title: `Terms of Service | ${SITE_NAME}`,
    description: `The terms for using ${SITE_NAME}'s free online file conversion tools: acceptable use, no warranty, and liability limits.`,
    alternates: { canonical: url },
  };
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">Terms of Service</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: October 2, 2026</p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold">1. The service</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            {SITE_NAME} provides free online tools that convert, compress, and transform files you
            upload — including PDF, image, audio, video, and utility tools. The service is provided
            free of charge, with no account required. Uploaded files and converted outputs are
            automatically and permanently deleted 60 minutes after upload.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">2. Acceptable use</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">You agree that you will:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-slate-700 dark:text-slate-200">
            <li>
              Only upload files you own or have the legal right to convert — including the right to
              remove password protection or DRM where applicable.
            </li>
            <li>
              Not upload unlawful content, malware, or any file intended to harm, disrupt, or gain
              unauthorized access to systems.
            </li>
            <li>
              Not attempt to abuse, overload, or circumvent the service&apos;s rate limits, file size
              limits, or security measures.
            </li>
            <li>
              Not use the service to infringe anyone&apos;s copyright, trademark, privacy, or other
              rights — for example, by converting pirated media you do not own.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            We may block or throttle access for anyone who misuses the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">3. Your files, your responsibility</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            You remain solely responsible for the files you upload and for how you use converted
            outputs. Always keep a backup of important originals before converting, and verify the
            output before relying on it — especially for legal, medical, financial, or otherwise
            critical documents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">4. No warranty</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            The service is provided &quot;as is&quot; and &quot;as available&quot;, without warranties
            of any kind, express or implied — including warranties of accuracy, reliability,
            fitness for a particular purpose, or uninterrupted availability. Conversions are
            best-effort: complex layouts, unusual fonts, or corrupt inputs may produce imperfect
            results.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">5. Limitation of liability</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            To the maximum extent permitted by law, {SITE_NAME} and its operators will not be liable
            for any indirect, incidental, consequential, or punitive damages — including loss of
            data, loss of files, or reliance on converted output — arising from your use of the
            service. Because the service is free, our total liability for any claim is limited to
            the amount you paid for the service, which is zero.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">6. Changes</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            We may update these terms as the service evolves. Continued use of {SITE_NAME} after
            changes are posted constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">7. Contact</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            Questions about these terms:{' '}
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
