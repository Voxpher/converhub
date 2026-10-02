import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categoryName, getTool, TOOLS, toolsByCategory } from '@/lib/tools';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { ToolLayout } from '@/components/ToolLayout';
import { ToolCard } from '@/components/ToolCard';
import { AdSlot } from '@/components/AdSlot';

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ toolId: tool.id }));
}

export function generateMetadata({ params }: { params: { toolId: string } }): Metadata {
  const tool = getTool(params.toolId);
  if (!tool) return { title: 'Tool not found' };
  const url = `${SITE_URL}/tools/${tool.id}`;
  return {
    title: `${tool.name} — Free Online`,
    description: tool.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${tool.name} — Free Online | ${SITE_NAME}`,
      description: tool.metaDescription,
      url,
      type: 'website',
    },
  };
}

const FALLBACK_HOW_TO = [
  'Upload your file using the dropzone above (or drag and drop it).',
  'Press convert and watch the live progress bar.',
  'Download your converted file, or convert another one.',
];

const FALLBACK_FAQ = [
  {
    q: 'Are my files private?',
    a: 'Yes. Uploaded files are processed securely and permanently deleted from our servers 60 minutes after upload. We never share, sell or reuse them.',
  },
  {
    q: 'Is ConvertHub free?',
    a: 'Yes, every tool is free to use with no signup and no watermarks on your output files.',
  },
];

export default function ToolPage({ params }: { params: { toolId: string } }) {
  const tool = getTool(params.toolId);
  if (!tool) notFound();

  const howTo = tool.howTo.length > 0 ? tool.howTo : FALLBACK_HOW_TO;
  const faqs = tool.faq.length > 0 ? tool.faq : FALLBACK_FAQ;

  const related = toolsByCategory(tool.category)
    .filter((t) => t.id !== tool.id)
    .slice(0, 6);

  const pageUrl = `${SITE_URL}/tools/${tool.id}`;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${tool.name}`,
    description: tool.tagline,
    step: howTo.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: `Step ${i + 1}`,
      text: s,
    })),
  };
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} — ${SITE_NAME}`,
    url: pageUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/#tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          {categoryName(tool.category)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">{tool.name}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{tool.name}</h1>
      <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">{tool.tagline}</p>

      <div className="mt-8">
        <ToolLayout
          toolId={tool.id}
          name={tool.name}
          tagline={tool.tagline}
          acceptedExts={tool.exts}
          maxSizeMB={100}
          multiple={tool.multiple}
          optionsSchema={tool.options}
          requiresFile={tool.requiresFile}
          enabled={tool.available}
          phase={tool.phase}
          resultKind={tool.resultKind}
        />
      </div>

      {/* Ad: below the converter, above "How to" */}
      <div className="my-8 min-h-[100px]" aria-label="Advertisement">
        <AdSlot format="horizontal" className="my-8" />
      </div>

      {/* How to */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">How to use {tool.name}</h2>
        <ol className="mt-4 space-y-3">
          {howTo.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 text-slate-600 dark:text-slate-300">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <summary className="cursor-pointer font-medium">{faq.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Ad: below FAQ, above Related tools */}
      <div className="my-8 min-h-[100px]" aria-label="Advertisement">
        <AdSlot format="rectangle" className="my-8" />
      </div>

      {/* Related tools */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Related tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 text-center">
        <Link
          href="/#tools"
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Browse all {TOOLS.length} {SITE_NAME} tools
        </Link>
      </p>
    </article>
  );
}
