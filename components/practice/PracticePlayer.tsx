'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import type { Practice } from '@/content/practices';
import { DEFAULT_CYCLES_PER_MINUTE, MAX_CYCLES_PER_MINUTE, MIN_CYCLES_PER_MINUTE } from '@/lib/generative/breath';
import { STILLNESS_SCENE } from '@/lib/generative/scenes';

const FieldCanvas = dynamic(() => import('@/components/generative/FieldCanvas').then((m) => m.FieldCanvas), {
  ssr: false,
  loading: () => <div className="orb-static absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" />,
});
const ScribbleSurface = dynamic(() => import('@/components/generative/ScribbleSurface').then((m) => m.ScribbleSurface), { ssr: false });

/** Step-through practice. Steps advance only when the person chooses; nothing auto-plays. */
export function PracticePlayer({ practice }: { practice: Practice }) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [pacing, setPacing] = useState(true);
  const [cpm, setCpm] = useState(DEFAULT_CYCLES_PER_MINUTE);
  const stepRef = useRef<HTMLParagraphElement>(null);
  const sliderId = useId();
  const last = step >= practice.steps.length - 1;

  useEffect(() => {
    if (started) stepRef.current?.focus({ preventScroll: true });
  }, [step, started]);

  const orbScene = {
    ...STILLNESS_SCENE,
    density: practice.surface === 'orb-paced' ? 0.25 : 0.4,
    breathRate: cpm,
    breathDepth: practice.surface === 'orb-paced' ? (pacing ? 0.7 : 0) : 0.35,
    orbScale: 0.16,
  };

  return (
    <div className="grid gap-6">
      {practice.surface !== 'none' && (
        <div className="membrane membrane-lg relative h-[min(56vh,460px)] min-h-[300px] overflow-hidden">
          {practice.surface === 'scribble' ? (
            <ScribbleSurface className="h-full w-full" label={`${practice.title} scribble surface`} />
          ) : (
            <FieldCanvas scene={orbScene} className="absolute inset-0 h-full w-full" sceneKey={`${cpm}:${pacing}`} fps={45} />
          )}
        </div>
      )}

      {practice.surface === 'orb-paced' && (
        <div className="membrane membrane-sm flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <label htmlFor={sliderId} className="font-medium">
              Visual pace: {cpm} cycles per minute
            </label>
            <p className="mt-1 text-[0.85rem] text-muted">A visual pacing option only — breathe however is comfortable.</p>
            <input
              id={sliderId}
              type="range"
              min={MIN_CYCLES_PER_MINUTE}
              max={MAX_CYCLES_PER_MINUTE}
              step={0.5}
              value={cpm}
              onChange={(e) => setCpm(Number(e.target.value))}
              className="mt-3 w-full accent-[#6FD6C4]"
              disabled={!pacing}
            />
          </div>
          <button type="button" className="pill pill-sm" aria-pressed={!pacing} onClick={() => setPacing((p) => !p)}>
            {pacing ? 'Stop pacing' : 'Resume pacing'}
          </button>
        </div>
      )}

      <div className="membrane membrane-lg p-6 md:p-8">
        {!started ? (
          <div className="flex flex-col items-start gap-4">
            {practice.note && <p className="max-w-[60ch] text-[0.95rem] text-muted">{practice.note}</p>}
            <button type="button" className="pill pill-primary" onClick={() => setStarted(true)}>
              Begin
            </button>
          </div>
        ) : (
          <div>
            <p className="label-mono text-faint" aria-hidden="true">
              {step + 1} / {practice.steps.length}
            </p>
            <p
              key={step}
              ref={stepRef}
              tabIndex={-1}
              className="serif-italic fade-in mt-4 max-w-[30ch] text-[clamp(1.4rem,1.1rem+1.2vw,2rem)] leading-snug outline-none"
              aria-live="polite"
            >
              <span className="sr-only">
                Step {step + 1} of {practice.steps.length}:{' '}
              </span>
              {practice.steps[step]}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {step > 0 && (
                <button type="button" className="pill pill-ghost" onClick={() => setStep((s) => s - 1)}>
                  Back
                </button>
              )}
              {last ? (
                <button
                  type="button"
                  className="pill pill-primary"
                  onClick={() => {
                    setStarted(false);
                    setStep(0);
                  }}
                >
                  Finish
                </button>
              ) : (
                <button type="button" className="pill pill-primary" onClick={() => setStep((s) => s + 1)}>
                  Next
                </button>
              )}
              <Link href="/ground" className="pill pill-ground">
                Ground
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
