import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS, getPost } from '@/lib/blog';
import { getTool } from '@/lib/tools';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { ToolCard } from '@/components/ToolCard';

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: 'Article not found' };
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} | ${SITE_NAME} Blog`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const related = post.relatedTools
    .map((id) => getTool(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: url,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">{post.title}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{post.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>{formatDate(post.date)}</span>
        <span aria-hidden="true">·</span>
        <span>{post.readMinutes} min read</span>
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-8 space-y-5 text-[1.05rem] leading-relaxed text-slate-700 dark:text-slate-200">
        {post.content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Try these tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-12">
        <Link
          href="/blog"
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to all articles
        </Link>
      </p>
    </article>
  );
}
