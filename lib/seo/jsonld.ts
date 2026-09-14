import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from './site';

/** Serialise JSON-LD safely for inline embedding (escapes characters that could close the tag). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl('/icons/icon-512.png'),
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#app`,
        name: `${SITE_NAME} — The Witnessing Mirror`,
        url: absoluteUrl('/mirror'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript. Works offline after first visit.',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        description:
          'A reflective, non-clinical web experience for noticing inner weather through responsive art. No account; session history stays in the browser.',
      },
    ],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
