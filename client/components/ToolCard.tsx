import Link from 'next/link';
import type { ToolMeta } from '@/lib/tools';
import { toolIcon } from '@/lib/toolIcons';

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = toolIcon(tool.id);
  return (
    <Link
      href={`/tools/${tool.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Icon className="h-5 w-5" />
        </span>
        {tool.available ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            Live
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            Phase {tool.phase}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-semibold tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tool.tagline}</p>
    </Link>
  );
}
