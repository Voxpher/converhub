import type { Metadata } from 'next';
import { CATEGORIES, TOOLS } from '@/lib/tools';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import { ToolExplorer } from '@/components/ToolExplorer';
import { IconClock, IconShield, IconUpload } from '@/components/icons';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Free Online File Converter`,
  description: SITE_DESCRIPTION,
};

const STEPS = [
  {
    icon: IconUpload,
    title: '1. Upload your file',
    text: 'Drag and drop a file into any tool. Files stay on your device until you hit convert.',
  },
  {
    icon: IconClock,
    title: '2. We convert it',
    text: 'Heavy jobs run on our servers in a managed queue. Watch live progress, no signup needed.',
  },
  {
    icon: IconShield,
    title: '3. Download, then it is gone',
    text: 'Grab your converted file. Everything is auto-deleted from our servers after 60 minutes.',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Free Online File Converter
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Convert PDF, images, audio and video in seconds. No signup, no watermarks, no
            software to install.
          </p>
        </div>
      </section>

      {/* Tool grid */}
      <section id="tools" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
        <ToolExplorer tools={TOOLS} />
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories overview for SEO */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Every tool, one place</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800"
            >
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{cat.description}</p>
              <p className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {TOOLS.filter((t) => t.category === cat.id).length} tools planned
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
