import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/privacy`;
  return {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `How ${SITE_NAME} handles your files and data: no accounts, automatic 60-minute deletion, and advertising disclosures.`,
    alternates: { canonical: url },
  };
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">Privacy Policy</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: October 2, 2026</p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold">The short version</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            {SITE_NAME} is a free file converter that needs no account and collects no personal
            profile about you. Files you upload are processed to perform your conversion and then
            permanently and automatically deleted 60 minutes after upload. We do not sell, rent, or
            share your files or personal data with anyone.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">What we collect</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-slate-700 dark:text-slate-200">
            <li>
              <strong>Files you upload.</strong> Needed solely to perform the conversion you
              requested. Both the upload and the converted output are deleted automatically 60
              minutes after upload.
            </li>
            <li>
              <strong>Basic technical logs.</strong> Our servers keep standard operational logs
              (such as request timestamps and error messages) to keep the service secure and
              reliable. These logs contain no file contents.
            </li>
            <li>
              <strong>Preferences stored on your device.</strong> Choices like dark/light mode are
              saved in your own browser, not on our servers.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            We do not require accounts, so we do not collect names, email addresses, or passwords in
            the course of using the tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">How long we keep files</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            Uploaded files and converted outputs are automatically and permanently deleted 60
            minutes after upload. There is no way to recover a file after deletion, and we cannot
            retrieve files on your behalf — so please download your converted file promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Cookies</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            We use a small number of cookies: one to remember your consent choice and one to
            remember your theme preference. Advertising partners may set their own cookies as
            described below. You can control cookies anytime through your browser settings; see our{' '}
            <Link href="/cookies" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Cookie Policy
            </Link>{' '}
            for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Advertising</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            {SITE_NAME} is free to use and is supported by advertising, including Google AdSense.
            Google may use cookies to serve ads based on your prior visits to this and other
            websites. Google&apos;s use of advertising cookies enables it and its partners to serve
            ads based on your visit to our site. You may opt out of personalized advertising by
            visiting Google&apos;s{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Ads Settings
            </a>
            . Where required by law, we ask for your consent before personalized ads are shown.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Your rights</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            Because files auto-delete after 60 minutes and we keep no accounts, there is usually
            nothing to access or erase. If you believe we hold any personal data about you and want
            it reviewed or removed, contact us at the address below and we will respond within 30
            days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Contact</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">
            For privacy questions, email{' '}
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
