import Link from 'next/link';
import { PageHeader } from '@/components/primitives/PageHeader';
import { formatCitation } from '@/components/science/ReferenceCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { RESEARCH_NOTE, SCIENCE_THEMES, getThemeReferences } from '@/content/science';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'The science beneath the poetry',
  description:
    'How research on mind-wandering, decentering, interoception, awe, meaning, slow breathing and meditation-related challenges informs the design of AI for Meaning — and what that research does not show.',
  path: '/science',
});

export default function SciencePage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Science', path: '/science' }])} />
      <PageHeader
        eyebrow="Science"
        title="The science beneath the poetry."
        lead="The language of AI for Meaning is contemplative. The design decisions underneath it are informed by research — described here carefully, with its limits."
      >
        <p className="membrane membrane-sm fade-in mt-8 max-w-[62ch] p-5 text-[0.95rem] text-ink/90" style={{ '--membrane-glow': 'rgba(111,214,196,0.08)' } as React.CSSProperties} data-testid="research-note">
          <span className="label-mono mr-2 text-teal">Note</span>
          {RESEARCH_NOTE}
        </p>
      </PageHeader>

      <div className="wrap pb-10">
        <nav aria-label="Themes" className="mb-14 flex flex-wrap gap-2">
          {SCIENCE_THEMES.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="pill pill-sm pill-ghost">
              {t.lens}: {t.title}
            </a>
          ))}
        </nav>

        <div className="space-y-6">
          {SCIENCE_THEMES.map((theme) => {
            const refs = getThemeReferences(theme);
            return (
              <section key={theme.id} id={theme.id} aria-labelledby={`${theme.id}-title`} className="membrane membrane-lg scroll-mt-24 grid gap-8 p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
                <header>
                  <p className="label-mono text-teal">{theme.lens}</p>
                  <h2 id={`${theme.id}-title`} className="mt-4 text-[clamp(1.6rem,1.3rem+1vw,2.2rem)]">
                    {theme.title}
                  </h2>
                  <p className="mt-3 font-mono text-[0.75rem] leading-relaxed tracking-[0.02em] text-faint">{theme.construct}</p>
                </header>
                <div className="space-y-5 text-[1rem] leading-relaxed text-muted">
                  <p>{theme.summary}</p>
                  <div className="border-l border-[var(--line-2)] pl-4">
                    <h3 className="label-mono text-ink/80">In the design</h3>
                    <p className="mt-2">{theme.designImplication}</p>
                  </div>
                  <div className="border-l border-[rgba(232,147,91,0.45)] pl-4">
                    <h3 className="label-mono text-amber">What this does not show</h3>
                    <p className="mt-2">{theme.doesNotShow}</p>
                  </div>
                  {refs.length > 0 && (
                    <div>
                      <h3 className="label-mono text-faint">References</h3>
                      <ul className="mt-2 space-y-2">
                        {refs.map((r) => (
                          <li key={r.id} className="text-[0.85rem] leading-relaxed text-faint">
                            <Link href={`/references#${r.id}`} className="hover:text-muted">
                              {formatCitation(r)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <section aria-labelledby="philosophy-title" className="mt-20 max-w-[66ch]">
          <p className="eyebrow">A separate question</p>
          <h2 id="philosophy-title" className="display-md mt-4">Philosophy is not evidence.</h2>
          <div className="prose-quiet mt-5">
            <p>
              AI for Meaning also draws on contemplative philosophy — the idea of a witnessing awareness, of movement before
              stillness, of celebration. Those ideas shape the product’s language and feel. They are not scientific claims, and
              the research above does not prove them. <Link href="/about">About the philosophy</Link>.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
