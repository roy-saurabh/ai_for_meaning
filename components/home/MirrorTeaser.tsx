'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { WhenVisible } from '@/components/primitives/WhenVisible';
import { MEETING } from '@/content/mirror-copy';
import { sceneFor } from '@/lib/generative/scenes';
import { PRESET_WEATHER_IDS, WEATHER, type PresetWeatherId } from '@/lib/mirror/weather';

const FieldCanvas = dynamic(() => import('@/components/generative/FieldCanvas').then((m) => m.FieldCanvas), {
  ssr: false,
  loading: () => <div className="orb-static absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" />,
});

/** An interactive glimpse of the Witnessing Mirror: choose a weather, watch the field respond. */
export function MirrorTeaser() {
  const [weather, setWeather] = useState<PresetWeatherId>('tense');
  const scene = sceneFor('weather', { kind: 'preset', id: weather });

  return (
    <div className="membrane membrane-lg reveal overflow-hidden" style={{ '--membrane-glow': 'rgba(154,140,255,0.08)' } as React.CSSProperties}>
      <div className="relative h-[min(62vh,500px)] min-h-[340px] bg-[radial-gradient(120%_90%_at_50%_0%,rgba(154,140,255,0.06),transparent_60%)]">
        <WhenVisible className="absolute inset-0" fallback={<div className="orb-static absolute left-1/2 top-[42%] h-24 w-24 -translate-x-1/2 -translate-y-1/2" />}>
          <FieldCanvas scene={scene} className="absolute inset-0 h-full w-full" fps={45} sceneKey={weather} />
        </WhenVisible>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-center md:p-10">
          <p className="label-mono text-teal">Meeting the weather · {WEATHER[weather].label}</p>
          <p className="serif-italic mx-auto mt-3 max-w-[26ch] text-[clamp(1.25rem,1rem+1.2vw,1.8rem)] leading-snug" aria-live="polite">
            {MEETING[weather]}
          </p>
          <p className="sr-only">The art shows {WEATHER[weather].visualNote}.</p>
        </div>
      </div>
      <div className="border-t border-[var(--line)] p-5 md:p-7">
        <fieldset>
          <legend className="mx-auto mb-4 block text-center text-[0.95rem] text-muted">How is your inner weather right now?</legend>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESET_WEATHER_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className="pill pill-sm font-sans text-[0.9rem] tracking-normal"
                aria-pressed={weather === id}
                onClick={() => setWeather(id)}
              >
                {WEATHER[id].label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/mirror" className="pill pill-primary">
            Enter the full Mirror
          </Link>
          <p className="label-mono normal-case tracking-[0.06em] text-faint">A preview. Nothing is saved.</p>
        </div>
      </div>
    </div>
  );
}
