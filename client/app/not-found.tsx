import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-slate-500 dark:text-slate-400">
        The page you are looking for does not exist on {SITE_NAME}.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        Back to all tools
      </Link>
    </div>
  );
}
