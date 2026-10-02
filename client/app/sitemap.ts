import type { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/tools';
import { POSTS } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: 'weekly' as const, priority: 0.8 },
    ...POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...TOOLS.map((tool) => ({
      url: `${SITE_URL}/tools/${tool.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...['/privacy', '/terms', '/cookies', '/disclaimer', '/contact', '/about'].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
