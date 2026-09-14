'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const SCREENS = [
  {
    eyebrow: '1 · Arrival',
    title: 'A quiet place to notice.',
    body: [
      'This is a reflective space. The art and a few words reflect what you choose to share — they do not tell you what you are feeling.',
      'There is no correct experience here, and nothing to get right.',
      'Everything is skippable. You can pause, ground or leave at any moment.',
    ],
  },
  {
    eyebrow: '2 · Ground',
    title: 'What this is, and is not.',
    body: [
      'AI for Meaning is for self-awareness. It is not therapy, medical care, diagnosis or a crisis service.',
      'Contemplative practices can sometimes bring up difficult feelings, memories or sensations. If something feels wrong, stop — Ground is always one tap away.',
      'If you live with trauma, psychosis, dissociation or a severe mental-health condition, practise with professional guidance. When a person is what is needed, please reach out to one.',
    ],
  },
  {
    eyebrow: '3 · Privacy',
    title: 'Your inner life stays yours.',
    body: [
      'No account is needed. The Mirror works entirely in your browser.',
      'Session history stays in this browser unless you export it, and you can erase it at any time.',
      'Microphone and camera are off by default. Nothing is secretly recorded.',
    ],
  },
  {
    eyebrow: '4 · Enter',
    title: 'Whenever you are ready.',
    body: ['A few minutes. Storm, then Stillness, then Song — each one optional.'],
  },
] as const;

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const screen = SCREENS[index]!;
  const last = index === SCREENS.length - 1;

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  return (
    <section aria-labelledby="onboarding-title" className="mx-auto flex w-full max-w-[560px] flex-col" data-testid="onboarding">
      <ol className="mb-8 flex items-center gap-2" aria-label={`Introduction, step ${index + 1} of ${SCREENS.length}`}>
        {SCREENS.map((s, i) => (
          <li
            key={s.eyebrow}
            aria-current={i === index ? 'step' : undefined}
            className={`h-[3px] flex-1 rounded-full transition-colors duration-700 ${i <= index ? 'bg-gold/80' : 'bg-white/10'}`}
          />
        ))}
      </ol>
      <div key={index} className="fade-in">
        <p className="eyebrow">{screen.eyebrow}</p>
        <h1 id="onboarding-title" ref={headingRef} tabIndex={-1} className="display-md mt-4 outline-none">
          {screen.title}
        </h1>
        <div className="mt-6 space-y-4 text-[1.02rem] leading-relaxed text-muted">
          {screen.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {index === 1 && (
          <p className="mt-5 text-[0.95rem]">
            <Link href="/ground" className="link-quiet">
              Read more about safety and human help
            </Link>
          </p>
        )}
        {index === 2 && (
          <p className="mt-5 text-[0.95rem]">
            <Link href="/privacy" className="link-quiet">
              Read the privacy policy
            </Link>
          </p>
        )}
      </div>
      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {index > 0 ? (
          <button type="button" className="pill pill-ghost" onClick={() => setIndex((i) => i - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        {last ? (
          <button type="button" className="pill pill-primary" onClick={onComplete} data-testid="onboarding-enter">
            Meet the weather
          </button>
        ) : (
          <button type="button" className="pill pill-primary" onClick={() => setIndex((i) => i + 1)} data-testid="onboarding-next">
            Continue
          </button>
        )}
      </div>
    </section>
  );
}
