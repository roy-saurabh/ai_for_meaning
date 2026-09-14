import { PageHeader } from '@/components/primitives/PageHeader';
import { ReferenceCard } from '@/components/science/ReferenceCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { verifiedReferences } from '@/content/references';
import { RESEARCH_NOTE } from '@/content/science';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'References',
  description: 'The complete, verified reference library behind AI for Meaning — each entry with its study type, a cautious interpretation, and its limitations.',
  path: '/references',
});

export default function ReferencesPage() {
  const refs = [...verifiedReferences].sort((a, b) => a.authors[0]!.localeCompare(b.authors[0]!) || a.year - b.year);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Science', path: '/science' },
          { name: 'References', path: '/references' },
        ])}
      />
      <PageHeader
        eyebrow="References"
        title="The reference library."
        lead={`${refs.length} sources, each checked against Crossref or PubMed before appearing here. Every entry says what kind of evidence it is, what it found, and where its limits are.`}
      >
        <p className="fade-in mt-6 max-w-[62ch] text-[0.92rem] text-faint">{RESEARCH_NOTE}</p>
      </PageHeader>
      <div className="wrap max-w-[920px] pb-24">
        {refs.map((r) => (
          <ReferenceCard key={r.id} reference={r} />
        ))}
      </div>
    </>
  );
}
