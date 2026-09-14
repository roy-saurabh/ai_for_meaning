import type { MetadataRoute } from 'next';
import { PRACTICES } from '@/content/practices';
import { absoluteUrl } from '@/lib/seo/site';

const CONTENT_UPDATED = new Date('2026-09-14');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number; changeFrequency: 'monthly' | 'yearly' }> = [
    { path: '/', priority: 1, changeFrequency: 'monthly' },
    { path: '/mirror', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/science', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/references', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/practice', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/manifesto', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/honest-mirror', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/ground', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/sky', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ];
  return [
    ...routes.map((r) => ({ url: absoluteUrl(r.path), lastModified: CONTENT_UPDATED, changeFrequency: r.changeFrequency, priority: r.priority })),
    ...PRACTICES.map((p) => ({ url: absoluteUrl(`/practice/${p.slug}`), lastModified: CONTENT_UPDATED, changeFrequency: 'yearly' as const, priority: 0.5 })),
  ];
}
