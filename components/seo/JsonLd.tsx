import { serializeJsonLd } from '@/lib/seo/jsonld';

/** Structured data. Non-executable (application/ld+json), serialised with tag-breaking characters escaped. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
