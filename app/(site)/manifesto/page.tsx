import Link from 'next/link';
import { PageHeader } from '@/components/primitives/PageHeader';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Manifesto',
  description: 'A mirror, not a master. Designed to fade. Honest about evidence. Private by default. Never manipulative. The AI for Meaning manifesto for contemplative, human-centred technology.',
  path: '/manifesto',
});

const TENETS = [
  { title: 'A mirror, not a master.', body: 'Technology that touches the inner life should reflect, not direct. It should never diagnose, prescribe, interpret or claim to know a person better than they know themselves.' },
  { title: 'Designed to fade.', body: 'The measure of a contemplative tool is how little it is needed. Guidance should thin as familiarity grows, and the software should be glad to be left behind.' },
  { title: 'The body comes first.', body: 'Let something move before asking for stillness. Invite, never command. Every step optional; every moment interruptible.' },
  { title: 'Aliveness, not optimisation.', body: 'The point is not a better score or a more productive self. It is noticing — and sometimes, what feels quietly alive.' },
  { title: 'Honest about evidence.', body: 'Say what research shows, what it does not, and where it is uncertain. Never turn one study into a universal claim. Keep philosophy and science apart.' },
  { title: 'Private by default.', body: 'An inner life should never become someone else’s asset. No accounts until they are needed, no trackers, no advertising, and data that stays with the person.' },
  { title: 'Company without comparison.', body: 'People can feel less alone without followers, rankings, streaks or feeds. Presence is enough.' },
  { title: 'Calm by doing less.', body: 'No dark patterns, no compulsive notifications, no engagement loops painted a softer colour. Quiet should be structural, not decorative.' },
  { title: 'A person, when a person is needed.', body: 'Software is never the only companion available. Safety is load-bearing, and human help is always one step away.' },
];

export default function ManifestoPage() {
  return (
    <>
      <PageHeader eyebrow="Manifesto" title="Technology that wants to be needed less." lead="Most software is measured by how much of a person’s attention it can hold. These are commitments for technology that goes the other way." />
      <div className="wrap pb-24">
        <ol className="grid gap-x-12 md:grid-cols-2">
          {TENETS.map((t, i) => (
            <li key={t.title} className="reveal border-t border-[var(--line)] py-8">
              <p className="font-mono text-[0.72rem] tracking-[0.18em] text-gold">{String(i + 1).padStart(2, '0')}</p>
              <h2 className="mt-3 text-[clamp(1.5rem,1.2rem+0.9vw,2rem)]">{t.title}</h2>
              <p className="mt-3 max-w-[52ch] text-[1.02rem] leading-relaxed text-muted">{t.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-16 flex flex-col items-start gap-4 border-t border-[var(--line)] pt-10">
          <p className="serif-italic max-w-[34ch] text-[clamp(1.4rem,1.1rem+1vw,2rem)] leading-snug">The mirror can become quieter from here.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/mirror" className="pill pill-primary">Enter the Mirror</Link>
            <Link href="/about" className="pill pill-ghost">About the movement</Link>
          </div>
        </div>
      </div>
    </>
  );
}
