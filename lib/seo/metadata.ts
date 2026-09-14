import type { Metadata } from 'next';
import { SITE_NAME, absoluteUrl } from './site';

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Exclude from search indexing (e.g. personal, local-only views). */
  noindex?: boolean;
}

/** Canonical, OpenGraph and Twitter metadata for a route, with one consistent shape. */
export function pageMetadata({ title, description, path, noindex }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = path === '/' ? `${SITE_NAME} — ${title}` : `${title} · ${SITE_NAME}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      locale: 'en_GB',
      images: [{ url: absoluteUrl('/og.png'), width: 1200, height: 630, alt: `${SITE_NAME} — A mirror, not a master.` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteUrl('/og.png')],
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
  };
}
