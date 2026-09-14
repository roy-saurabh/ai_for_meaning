import type { Reference } from '@/content/references';

const EVIDENCE_LABEL: Record<Reference['evidenceType'], string> = {
  neuroimaging: 'Neuroimaging study',
  experimental: 'Experimental study',
  'cross-sectional': 'Cross-sectional study',
  'experience-sampling': 'Experience-sampling study',
  psychometric: 'Measurement study',
  review: 'Review',
  'systematic-review': 'Systematic review',
  'meta-analysis': 'Meta-analysis',
  qualitative: 'Qualitative study',
  'mixed-methods': 'Mixed-methods study',
  theoretical: 'Theoretical paper',
  book: 'Book',
};

export function formatCitation(r: Reference): string {
  const authors = r.authors.length > 1 ? `${r.authors.slice(0, -1).join(', ')}, & ${r.authors[r.authors.length - 1]}` : r.authors[0] ?? '';
  const volume = r.volume ? `, ${r.volume}${r.issue ? `(${r.issue})` : ''}` : '';
  const pages = r.pages ? `, ${r.pages}` : '';
  return `${authors} (${r.year}). ${r.title}. ${r.publication}${volume}${pages}.`;
}

export function ReferenceCard({ reference: r, compact = false }: { reference: Reference; compact?: boolean }) {
  return (
    <article id={r.id} className="scroll-mt-28 border-t border-[var(--line)] py-6">
      <p className="label-mono text-teal">
        {EVIDENCE_LABEL[r.evidenceType]} · {r.year}
      </p>
      <h3 className="mt-2 font-display text-[1.2rem] leading-snug">{r.title}</h3>
      <p className="mt-2 text-[0.88rem] leading-relaxed text-faint">{formatCitation(r)}</p>
      {!compact && (
        <>
          <p className="mt-3 max-w-[70ch] text-[0.95rem] leading-relaxed text-muted">{r.interpretation}</p>
          <p className="mt-2 max-w-[70ch] text-[0.9rem] leading-relaxed text-muted">
            <span className="text-ink/80">Limits: </span>
            {r.limitations}
          </p>
        </>
      )}
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.75rem]">
        {r.doi && (
          <a href={`https://doi.org/${r.doi}`} className="text-[#9fb8ff] underline decoration-[#9fb8ff]/40 underline-offset-4 hover:decoration-[#9fb8ff]" rel="noopener noreferrer" target="_blank">
            doi:{r.doi}
          </a>
        )}
        {r.url && (
          <a href={r.url} className="text-[#9fb8ff] underline decoration-[#9fb8ff]/40 underline-offset-4 hover:decoration-[#9fb8ff]" rel="noopener noreferrer" target="_blank">
            {r.url.includes('pubmed') ? 'PubMed' : 'Publisher'}
          </a>
        )}
      </p>
    </article>
  );
}
