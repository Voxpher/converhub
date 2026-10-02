import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/about`;
  return {
    title: `About Us | ${SITE_NAME}`,
    description: `${SITE_NAME} is a free online file converter with 35 tools — no signup, no watermarks, and privacy-first file handling.`,
    alternates: { canonical: url },
  };
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">About</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        About {SITE_NAME}
      </h1>

      <div className="mt-8 space-y-6 leading-relaxed text-slate-700 dark:text-slate-200">
        <p>
          {SITE_NAME} is a free online file converter built around a simple idea: converting a
          file should take seconds, cost nothing, and never compromise your privacy. Upload a file,
          pick what you need, download the result — no accounts, no installs, no learning curve.
        </p>
        <p>
          The site offers 35 tools across four categories. <strong>PDF tools</strong> merge, split,
          compress, and convert documents. <strong>Image tools</strong> convert formats, compress
          photos, and resize pictures. <strong>Audio &amp; video tools</strong> extract audio,
          convert formats, and trim clips. <strong>Utilities</strong> generate QR codes, count
          words, build hashtag sets, and resize images for social media.
        </p>
        <p>
          Everything is free, and everything stays free. There are no premium tiers, no watermarks
          stamped on your output, and no feature locked behind a signup wall. The service is
          supported by advertising rather than by selling access to tools — or access to you.
        </p>
        <p>
          Privacy is a design decision, not a marketing line. Files you upload are processed only
          to perform your conversion, and both uploads and outputs are permanently and
          automatically deleted 60 minutes after upload. We do not keep accounts, we do not build
          profiles, and we do not sell data — because there is nothing to sell.
        </p>
        <p>
          {SITE_NAME} also publishes practical, no-fluff guides in the{' '}
          <Link href="/blog" className="text-indigo-600 hover:underline dark:text-indigo-400">
            blog
          </Link>{' '}
          — how compression actually works, which image format to pick, and how to keep your files
          private online. If a tool is missing or something breaks,{' '}
          <Link href="/contact" className="text-indigo-600 hover:underline dark:text-indigo-400">
            tell us
          </Link>{' '}
          and we will look into it.
        </p>
      </div>
    </div>
  );
}
