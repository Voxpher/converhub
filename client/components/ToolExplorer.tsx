'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES, type ToolCategory, type ToolMeta } from '@/lib/tools';
import { CATEGORY_ICONS } from '@/lib/toolIcons';
import { LayoutGrid } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { IconSearch } from './icons';

type Filter = 'all' | ToolCategory;

export function ToolExplorer({ tools }: { tools: ToolMeta[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (filter !== 'all' && tool.category !== filter) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        tool.id.replace(/-/g, ' ').includes(q)
      );
    });
  }, [tools, query, filter]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <label className="relative block">
          <span className="sr-only">Search tools</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <IconSearch />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, e.g. compress pdf, mp3, qr code..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-indigo-950"
          />
        </label>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tool categories">
          {[{ id: 'all' as const, name: 'All tools', description: '' }, ...CATEGORIES].map((cat) => {
            const CatIcon = cat.id === 'all' ? LayoutGrid : CATEGORY_ICONS[cat.id as ToolCategory];
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={filter === cat.id}
                onClick={() => setFilter(cat.id as Filter)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <CatIcon className="h-4 w-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
        {filtered.length} of {tools.length} tools
        {query.trim() && (
          <>
            {' '}
            matching <strong>“{query.trim()}”</strong>
          </>
        )}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <p className="font-medium">No tools match your search</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try “pdf”, “image”, “mp3” or “qr”.
          </p>
        </div>
      )}
    </div>
  );
}
