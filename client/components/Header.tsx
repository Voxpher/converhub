'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { SITE_NAME } from '@/lib/site';
import { CATEGORIES, TOOLS, toolsByCategory } from '@/lib/tools';
import { CATEGORY_ICONS, toolIcon } from '@/lib/toolIcons';
import { ThemeToggle } from './ThemeToggle';

function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#4f46e5" />
      <path
        d="M9 11.5 16 8l7 3.5v7L16 22l-7-3.5Z"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M16 8v7m0 0 7-3.5M16 15 9 11.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const linkCls =
  'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white';

/** Desktop dropdown panel: tools grouped by category. */
function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open ]);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 ${linkCls}`}
      >
        Tools
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="All tools by category"
          className="absolute left-1/2 top-full z-50 mt-2 max-h-[70vh] w-[640px] -translate-x-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat.id];
              return (
                <div key={cat.id}>
                  <p className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <CatIcon className="h-4 w-4" />
                    {cat.name}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {toolsByCategory(cat.id).map((tool) => {
                      const Icon = toolIcon(tool.id);
                      return (
                        <li key={tool.id}>
                          <Link
                            role="menuitem"
                            href={`/tools/${tool.id}`}
                            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                            <span className="truncate">{tool.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <Link
            href="/#tools"
            className="mt-3 block rounded-xl bg-slate-100 px-3 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Browse all {TOOLS.length} tools
          </Link>
        </div>
      )}
    </div>
  );
}

/** Mobile menu: hamburger → panel with collapsible category groups. */
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('pdf');
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open ]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 max-h-[75vh] overflow-y-auto border-b border-slate-200 bg-white px-4 pb-6 pt-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          {CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat.id];
            const isOpen = expanded === cat.id;
            return (
              <div key={cat.id} className="border-b border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : cat.id)}
                  className="flex w-full items-center justify-between py-3 text-left font-semibold"
                >
                  <span className="inline-flex items-center gap-2">
                    <CatIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    {cat.name}
                    <span className="text-xs font-normal text-slate-400">
                      ({toolsByCategory(cat.id).length})
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <ul className="space-y-0.5 pb-3">
                    {toolsByCategory(cat.id).map((tool) => {
                      const Icon = toolIcon(tool.id);
                      return (
                        <li key={tool.id}>
                          <Link
                            href={`/tools/${tool.id}`}
                            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                            {tool.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
          <Link
            href="/#how-it-works"
            className="mt-3 block rounded-xl px-2 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            How it works
          </Link>
        </div>
      )}
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
          <ToolsDropdown />
          <Link href="/#how-it-works" className={`hidden ${linkCls} md:inline`}>
            How it works
          </Link>
          <span className="ml-1">
            <ThemeToggle />
          </span>
          <MobileMenu />
        </nav>
      </div>
    </header>
  );
}
