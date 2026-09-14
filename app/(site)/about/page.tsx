import Link from 'next/link';
import { ProsePage } from '@/components/primitives/ProsePage';
import { DEPTHS } from '@/content/lexicon';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'About',
  description: 'The ideas behind AI for Meaning: contemplative inspiration, human-centred design, and why philosophy and science are kept clearly apart.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <ProsePage eyebrow="About" title="A movement toward quieter technology." lead="AI for Meaning is a project and a design philosophy: that technology can help people notice their own experience — and then step back.">
      <h2>Why this exists</h2>
      <p>
        The tools that shape daily life are usually designed to capture attention. Wellbeing apps often borrow the same
        machinery — streaks, reminders, scores — and paint it a calmer colour. AI for Meaning tries something different: an
        experience that is calm because it does less, that treats the person as the only authority on their inner life, and
        that counts needing it less as success.
      </p>

      <h2>The design philosophy</h2>
      <ul>
        <li><strong>Reflect, don’t direct.</strong> The Mirror responds to what you choose. It asks rather than tells.</li>
        <li><strong>Agency over engagement.</strong> Nothing nudges you to return. Everything can be skipped.</li>
        <li><strong>Local first.</strong> No account. Your history lives in your browser.</li>
        <li><strong>Honest limits.</strong> Clear about evidence, clear about what this is not, clear about when a person is needed.</li>
      </ul>
      <p>
        These principles belong to a wider tradition of human-centred and agency-preserving technology — systems designed to
        support human judgement rather than replace it.
      </p>

      <h2>Contemplative inspiration</h2>
      <p>
        The shape of the experience is inspired in part by ideas associated with the Indian teacher Osho (1931–1990): the
        practice of <em>witnessing</em> — watching thoughts and feelings without being carried away by them; the idea of
        <em> active meditation</em>, in which movement and release come before silence; an emphasis on celebration and
        aliveness rather than withdrawal from life, which he described with the image of “Zorba the Buddha”; and a strong
        scepticism toward borrowed authority and dependence on teachers.
      </p>
      <p>
        These are paraphrases of influences, not quotations, and not an endorsement of any teacher or organisation. Osho’s life
        and movement remain the subject of serious controversy. AI for Meaning is not affiliated with any Osho organisation, and
        it is deliberately not a guru — human or software.
      </p>

      <h2>Philosophy and science, kept apart</h2>
      <p>
        Contemplative ideas give the product its language — Inner Weather, the Witness, Storm, Stillness, Song. Research gives
        some of its design decisions a basis. The two are not the same, and neither proves the other. Where this site speaks
        about science, it uses research constructs and cites sources.{' '}
        <Link href="/science">Read the science</Link>.
      </p>

      <h2>Depths, not levels</h2>
      <p>The experience is imagined as a series of invitations, never requirements:</p>
      <ul>
        {DEPTHS.map((d) => (
          <li key={d.name}>
            <strong>{d.name}.</strong> {d.body}
          </li>
        ))}
      </ul>
      <p>Today the Mirror offers the early Depths, and a Fade that lets guidance recede. Nothing here is a ladder to climb.</p>
    </ProsePage>
  );
}
