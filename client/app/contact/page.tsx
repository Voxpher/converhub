import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { ContactForm } from './ContactForm';

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/contact`;
  return {
    title: `Contact Us | ${SITE_NAME}`,
    description: `Get in touch with the ${SITE_NAME} team — feedback, bug reports, and tool requests. We reply within a few business days.`,
    alternates: { canonical: url },
  };
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">Contact</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Contact us</h1>
      <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
        Found a bug, want a new tool, or just want to say hello? We read every message and usually
        reply within 2–3 business days.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Email us directly</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          <a
            href="mailto:hello@example.com"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            hello@example.com
          </a>{' '}
          (placeholder address — replace with the real support email before launch).
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Or draft a message below</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This opens your email app with the message pre-filled — nothing is sent or stored by{' '}
          {SITE_NAME}.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
