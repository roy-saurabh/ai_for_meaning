import Link from 'next/link';
import { HeroOrb } from '@/components/home/HeroOrb';
import { MirrorTeaser } from '@/components/home/MirrorTeaser';
import { SkyPreview } from '@/components/home/SkyPreview';
import { Section } from '@/components/primitives/Section';
import { JsonLd } from '@/components/seo/JsonLd';
import { ATTUNEMENTS, COMMITMENTS, MOVEMENTS, TAXONOMY } from '@/content/lexicon';
import { RESEARCH_NOTE, SCIENCE_THEMES, getThemeReferences, shortCitation } from '@/content/science';
import { siteJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Technology that returns you to yourself',
  description:
    'A living mirror for noticing your inner weather — built to reflect rather than direct, and designed to become quieter. No account, private by default, not therapy.',
  path: '/',
});

const HOME_SCIENCE = ['self-referential', 'interoception', 'awe', 'challenges'];

export default function HomePage() {
  const themes = SCIENCE_THEMES.filter((t) => HOME_SCIENCE.includes(t.id));

  return (
    <>
      <JsonLd data={siteJsonLd()} />

      {/* 1–3. Hero */}
      <section aria-labelledby="hero-title" className="relative flex min-h-[calc(100svh-var(--nav-h))] flex-col justify-center overflow-hidden pb-16 pt-6 md:pb-24">
        <div className="wrap flex flex-col items-center text-center">
          <HeroOrb />
          <h1 id="hero-title" className="display-xl fade-in -mt-6 max-w-[16ch] md:-mt-10">
            Technology that returns you to <span className="text-warm-gradient serif-italic pr-1">yourself</span>.
          </h1>
          <p className="lead fade-in mx-auto mt-6 max-w-[46ch]">
            A living mirror for noticing your inner weather — built to reflect rather than direct, and designed to become
            quieter as you need it less.
          </p>
          <div className="fade-in mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/mirror" className="pill pill-primary w-full sm:w-auto">
              Enter the Mirror
            </Link>
            <a href="#how-it-works" className="pill w-full sm:w-auto">
              See how it works
            </a>
          </div>
          <p className="fade-in mt-7 font-mono text-[0.72rem] tracking-[0.12em] text-faint">
            self-awareness · private by default · not therapy
          </p>
        </div>
      </section>

      {/* 2. Thesis */}
      <section aria-label="Thesis" className="py-10 md:py-16">
        <div className="wrap">
          <p className="reveal serif-italic mx-auto max-w-[30ch] text-center text-[clamp(1.6rem,1.1rem+2vw,2.6rem)] leading-[1.2] text-ink/90">
            A mirror for the one who notices — never a master that tells you who you are.
          </p>
        </div>
      </section>

      {/* 4. Five commitments */}
      <Section id="commitments" eyebrow="The stance" title="Five commitments" lead="The software is calm because it does less, not because it paints familiar engagement tricks a softer colour.">
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMMITMENTS.map((c, i) => (
            <li key={c.n} className={`membrane reveal p-7 ${i === 0 ? 'lg:col-span-1' : ''}`}>
              <p className="font-mono text-[0.72rem] tracking-[0.18em] text-gold">{c.n}</p>
              <h3 className="mt-4 text-[1.55rem]">{c.title}</h3>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-muted">{c.body}</p>
            </li>
          ))}
          <li className="reveal flex items-end p-7">
            <p className="serif-italic text-[1.2rem] leading-snug text-muted">
              No streaks. No scores. No notifications. No leaderboard. No account.
            </p>
          </li>
        </ol>
      </Section>

      {/* 5. Interactive Mirror teaser */}
      <Section
        id="how-it-works"
        eyebrow="The Witnessing Mirror"
        title="Choose a weather. Watch it come alive."
        lead="The art reflects the word you choose — metaphor, not measurement. Nothing is sensed, scored or stored in this preview."
      >
        <MirrorTeaser />
      </Section>

      {/* 6. Storm → Stillness → Song */}
      <Section id="arc" eyebrow="The arc" title={<>Storm → Stillness → Song</>} lead="A few minutes, in three movements. Each can be skipped. Ground is always one tap away.">
        <ol className="grid gap-4 md:grid-cols-3">
          {MOVEMENTS.map((m, i) => (
            <li key={m.id} className="membrane reveal flex flex-col p-7" style={{ '--membrane-glow': m.glow } as React.CSSProperties}>
              <p className="label-mono" style={{ color: m.color }}>
                Movement {i + 1} · {m.quality}
              </p>
              <h3 className="mt-5 text-[2rem]">{m.name}</h3>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-muted">{m.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 7. Taxonomy */}
      <Section id="taxonomy" eyebrow="A language for the inner life" title="The system, in its own words" lead="A small, precise vocabulary — evocative, and deliberately non-clinical.">
        <dl className="grid gap-x-10 gap-y-2 md:grid-cols-2">
          {TAXONOMY.map((item) => (
            <div key={item.term} className="reveal border-t border-[var(--line)] py-6">
              <dt className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="font-display text-[1.45rem]">{item.term}</span>
                <span className="label-mono text-faint">{item.kicker}</span>
              </dt>
              <dd className="mt-2 max-w-[52ch] text-[0.97rem] leading-relaxed text-muted">{item.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* 8. Inner Sky preview */}
      <Section id="inner-sky" eyebrow="Inner Sky" title="A constellation, not a dashboard" lead="Kept practice sessions become points of light in a private night sky, stored only in your browser. There are no scores to improve and no charts of what is missing.">
        <div className="membrane membrane-lg reveal overflow-hidden p-2 md:p-3" style={{ '--membrane-glow': 'rgba(92,123,200,0.10)' } as React.CSSProperties}>
          <SkyPreview />
          <div className="flex flex-col gap-4 border-t border-[var(--line)] px-4 py-5 md:flex-row md:items-center md:justify-between md:px-5">
            <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Families of light">
              {ATTUNEMENTS.map((a) => (
                <li key={a.id} className="flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.06em] text-muted">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                  {a.name}
                </li>
              ))}
            </ul>
            <p className="font-mono text-[0.72rem] tracking-[0.04em] text-faint">An illustrative sky. Yours begins empty.</p>
          </div>
        </div>
      </Section>

      {/* 9. Science beneath the poetry */}
      <Section id="science" eyebrow="Grounded, not hyped" title="The science beneath the poetry" lead={RESEARCH_NOTE}>
        <div className="grid gap-4 md:grid-cols-2">
          {themes.map((theme) => {
            const refs = getThemeReferences(theme);
            return (
              <article key={theme.id} className="membrane reveal flex flex-col p-7">
                <p className="label-mono text-teal">{theme.lens}</p>
                <h3 className="mt-4 text-[1.45rem]">{theme.title}</h3>
                <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{theme.designImplication}</p>
                {refs.length > 0 && (
                  <p className="mt-5 font-mono text-[0.7rem] leading-relaxed tracking-[0.02em] text-faint">
                    {refs.slice(0, 3).map(shortCitation).join(' · ')}
                  </p>
                )}
              </article>
            );
          })}
        </div>
        <div className="reveal mt-8 flex flex-wrap gap-3">
          <Link href="/science" className="pill">
            Read the science
          </Link>
          <Link href="/references" className="pill pill-ghost">
            All references
          </Link>
        </div>
      </Section>

      {/* 10. Safety / Ground */}
      <Section id="ground" eyebrow="The Ground" eyebrowColor="#E8935B" title="Gentle by design">
        <div className="membrane membrane-lg reveal grid gap-10 p-7 md:grid-cols-[1.1fr_1fr] md:p-10" style={{ '--membrane-glow': 'rgba(232,147,91,0.09)' } as React.CSSProperties}>
          <div>
            <p className="serif-italic text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] leading-snug">
              Look around the room. Let the screen become ordinary again.
            </p>
            <p className="mt-5 text-[0.97rem] leading-relaxed text-muted">
              Contemplative practice can sometimes bring up difficult experiences. Every stage can be paused or skipped, and
              Ground — which stops movement, sound and pacing and returns you to the room — is always one tap away.
            </p>
            <Link href="/ground" className="pill pill-ground mt-7">
              About the Ground
            </Link>
          </div>
          <ul className="space-y-4 text-[0.95rem] leading-relaxed text-muted">
            <li className="border-l border-[rgba(232,147,91,0.4)] pl-4">
              <strong className="font-medium text-ink">Not therapy.</strong> Not medical care, diagnosis, treatment or a substitute for them.
            </li>
            <li className="border-l border-[rgba(232,147,91,0.4)] pl-4">
              <strong className="font-medium text-ink">Not a crisis service.</strong> If you may be in danger, contact your local emergency number.
            </li>
            <li className="border-l border-[rgba(232,147,91,0.4)] pl-4">
              <strong className="font-medium text-ink">Take care with history.</strong> If you live with trauma, psychosis, dissociation or a severe mental-health condition, practise with professional guidance.
            </li>
            <li className="border-l border-[rgba(232,147,91,0.4)] pl-4">
              <strong className="font-medium text-ink">Stop whenever.</strong> Nothing needs to be finished.
            </li>
          </ul>
        </div>
      </Section>

      {/* 11. Movement / manifesto */}
      <Section id="manifesto" eyebrow="The movement" title="Software that wants to be needed less">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="reveal space-y-5 text-[1.08rem] leading-relaxed text-muted">
            <p>
              Most technology is measured by how much of your attention it can keep. AI for Meaning is measured the other way:
              by whether it helps you notice your own experience — and then gets out of the way.
            </p>
            <p>
              It reflects rather than directs. It says what the research does and does not show. It keeps your inner life in
              your own browser. And it grows quieter as it becomes familiar.
            </p>
          </div>
          <div className="reveal flex flex-col justify-end gap-4">
            <Link href="/manifesto" className="pill self-start">
              Read the manifesto
            </Link>
            <Link href="/honest-mirror" className="pill pill-ghost self-start">
              The Honest Mirror
            </Link>
          </div>
        </div>
      </Section>

      {/* 12. Final quiet CTA */}
      <section aria-labelledby="final-cta" className="py-24 md:py-36">
        <div className="wrap flex flex-col items-center text-center">
          <div className="orb-static is-breathing reveal h-16 w-16" aria-hidden="true" />
          <h2 id="final-cta" className="display-md reveal mt-10 max-w-[24ch]">
            There is nothing to achieve here.
          </h2>
          <p className="lead reveal mt-4">A few quiet minutes, whenever you like.</p>
          <Link href="/mirror" className="pill pill-primary reveal mt-9">
            Enter the Mirror
          </Link>
        </div>
      </section>
    </>
  );
}
