import Link from 'next/link';
import { SITE_NAME, SITE_TAGLINE, API_URL } from '@/lib/site';

const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  const year = new Date().getFullYear();
  const linkClass =
    'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400';
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">
              {SITE_NAME} <span className="font-normal text-slate-500">— {SITE_TAGLINE}</span>
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Files are processed securely and auto-deleted after 60 minutes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href={`${API_URL}/api/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              API status
            </a>
            <span className="text-slate-400 dark:text-slate-600">© {year} {SITE_NAME}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
