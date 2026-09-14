import Link from 'next/link';
import { PageHeader } from '@/components/primitives/PageHeader';
import { GROUND } from '@/content/mirror-copy';
import { EMERGENCY_LINE, NOT_A_CRISIS_SERVICE, getHelpResource } from '@/lib/safety/help';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Ground — safety and human help',
  description: 'How AI for Meaning stays gentle, what to do if a practice feels wrong, and where to find human help. Not therapy and not a crisis service.',
  path: '/ground',
});

export default function GroundPage() {
  const help = getHelpResource();
  return (
    <>
      <PageHeader eyebrow="Ground" title="Back to the room." lead="Ground is the safety layer of AI for Meaning. It is always one tap away in the Mirror, and it is here, on its own, whenever you need it." />
      <div className="wrap grid gap-6 pb-24 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="now-title" className="membrane membrane-lg p-7 md:p-10" style={{ '--membrane-glow': 'rgba(232,147,91,0.10)' } as React.CSSProperties}>
          <h2 id="now-title" className="display-md">{GROUND.title}</h2>
          <ol className="mt-7 space-y-5">
            {GROUND.steps.map((s) => (
              <li key={s} className="flex gap-4 text-[1.15rem] leading-relaxed">
                <span aria-hidden="true" className="mt-[0.72em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8935B]" />
                {s}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="help-title" className="membrane membrane-lg p-7 md:p-10" data-testid="help-panel">
          <h2 id="help-title" className="text-[1.7rem]">Human help</h2>
          <p className="mt-4 text-[1.02rem] text-ink">{EMERGENCY_LINE}</p>
          <p className="mt-4 text-muted">
            <a href={help.url} className="link-quiet" target="_blank" rel="noopener noreferrer">{help.label}</a> — {help.description}
          </p>
          <p className="mt-4 text-muted">You can also contact a doctor, a mental-health professional, or someone you trust.</p>
          <p className="mt-6 text-[0.9rem] text-faint">{NOT_A_CRISIS_SERVICE}</p>
        </section>

        <section aria-labelledby="gentle-title" className="lg:col-span-2 mt-10 grid gap-10 md:grid-cols-2">
          <div className="prose-quiet">
            <h2 id="gentle-title">Why the Mirror is gentle</h2>
            <p>
              Contemplative practices are not risk-free. Research has documented a wide range of challenging experiences
              associated with meditation, from mild and passing to, for some people, lasting and difficult. In one
              structured-interview study of participants in mindfulness-based programs, most reported at least one
              meditation-related side effect, and some reported effects on daily functioning.{' '}
              <Link href="/science#challenges">Read the evidence and its limits</Link>.
            </p>
            <p>So the Mirror is built to be gentle:</p>
            <ul>
              <li>Short sessions, beginning with the body rather than long silent sitting.</li>
              <li>No hyperventilation, breath-holding, forced breathing, cold exposure or trance techniques.</li>
              <li>Breath pacing is only ever an optional visual rhythm you can change or stop.</li>
              <li>Every stage can be paused or skipped, and Ground stops movement, sound and pacing at once.</li>
              <li>Expansive moments are brief, and always come with an easy way back.</li>
            </ul>
          </div>
          <div className="prose-quiet">
            <h2>When to stop, and when to ask a person</h2>
            <ul>
              <li>Stop if you feel panicky, disconnected from yourself or your surroundings, overwhelmed by memories, or physically unwell.</li>
              <li>If you live with trauma, psychosis, dissociation, or a severe mental-health condition, practise with professional guidance.</li>
              <li>If difficult experiences continue after you stop, speak to a doctor or mental-health professional.</li>
              <li>If you might be in danger, contact your local emergency number now.</li>
            </ul>
            <h2>What happens if you write something worrying</h2>
            <p>
              If words you type in the Mirror plainly refer to suicide, self-harm or being in danger, the reflections stop and
              this page’s help information is shown instead. This is a narrow check for a short list of explicit phrases — it is
              not a risk assessment, it can miss things, and nothing about it is stored or sent. Ground and human help are
              always available whatever you write.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
