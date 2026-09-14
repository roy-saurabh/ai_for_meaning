import Link from 'next/link';
import { PageHeader } from '@/components/primitives/PageHeader';
import { GatheringPresence } from '@/components/gathering/GatheringPresence';
import { PRACTICES, PRACTICE_CATEGORIES, type PracticeCategory } from '@/content/practices';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Practice library',
  description: 'A small library of gentle practices for Arrival, Storm, Stillness, Song and Grounding. Short, optional, and never forced — no breath-holding, no hyperventilation.',
  path: '/practice',
});

const ORDER: PracticeCategory[] = ['arrival', 'storm', 'stillness', 'song', 'grounding'];

export default function PracticeIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="A small library, on purpose."
        lead="Thirteen short practices. Each can be done in a minute or two, each step is optional, and nothing needs to be completed."
      />
      <div className="wrap pb-24">
        {ORDER.map((cat) => {
          const meta = PRACTICE_CATEGORIES[cat];
          const items = PRACTICES.filter((p) => p.category === cat);
          return (
            <section key={cat} aria-labelledby={`${cat}-title`} className="border-t border-[var(--line)] py-12 md:grid md:grid-cols-[1fr_2.4fr] md:gap-10">
              <header className="mb-6 md:mb-0">
                <h2 id={`${cat}-title`} className="text-[2rem]" style={{ color: meta.color }}>
                  {meta.name}
                </h2>
                <p className="mt-2 text-muted">{meta.body}</p>
              </header>
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/practice/${p.slug}`} className="membrane group flex h-full flex-col p-6 transition-colors hover:border-[var(--line-2)]" data-focus-shape="rect">
                      <span className="label-mono text-faint">{p.duration}</span>
                      <span className="mt-3 font-display text-[1.35rem] leading-tight">{p.title}</span>
                      <span className="mt-2 text-[0.93rem] text-muted">{p.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <section aria-labelledby="gathering-title" className="border-t border-[var(--line)] py-12 md:grid md:grid-cols-[1fr_2.4fr] md:gap-10">
          <header className="mb-6 md:mb-0">
            <h2 id="gathering-title" className="text-[2rem]">The Gathering</h2>
            <p className="mt-2 text-muted">Company without comparison.</p>
          </header>
          <div className="max-w-[420px]">
            <GatheringPresence />
          </div>
        </section>
      </div>
    </>
  );
}
