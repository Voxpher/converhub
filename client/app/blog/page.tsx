import type { Metadata } from 'next';
import Link from 'next/link';
import { POSTS } from '@/lib/blog';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/blog`;
  const description =
    'Practical guides on PDF, image, audio and video conversion — plus privacy tips for using free online tools.';
  return {
    title: `Blog — Free File Conversion Guides | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Blog | ${SITE_NAME}`,
      description,
      url,
      type: 'website',
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">Blog</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {SITE_NAME} Blog
      </h1>
      <p className="mt-2 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
        Practical guides on converting PDF, image, audio and video files — and on keeping
        your files private while you do it.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
          >
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug tracking-tight">
              <Link href={`/blog/${post.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {formatDate(post.date)} · {post.readMinutes} min read
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
