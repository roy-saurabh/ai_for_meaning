'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { WhenVisible } from '@/components/primitives/WhenVisible';
import { generateSky } from '@/lib/sky/generate';
import type { SessionTrace } from '@/lib/storage/schema';

const SkyCanvas = dynamic(() => import('@/components/sky/SkyCanvas').then((m) => m.SkyCanvas), { ssr: false });

/** Illustrative traces for the homepage preview only. Clearly labelled; never mixed with real data. */
function illustrativeTraces(): SessionTrace[] {
  const base = Date.UTC(2026, 8, 1);
  const pattern: Array<SessionTrace['movementsVisited']> = [
    ['storm', 'stillness'],
    ['stillness'],
    ['storm', 'stillness', 'song'],
    ['stillness', 'song'],
    ['storm'],
    ['storm', 'stillness', 'song'],
    ['stillness'],
    ['storm', 'stillness'],
    ['stillness', 'song'],
    ['storm', 'stillness', 'song'],
  ];
  const words = ['warm', undefined, 'enough', undefined, undefined, 'light', undefined, 'here', undefined, 'open'];
  return pattern.map((movements, i) => ({
    id: `illustrative-${i}`,
    createdAt: base + i * 1.4 * 86_400_000,
    endedAt: base + i * 1.4 * 86_400_000 + 5 * 60_000,
    weather: 'mixed',
    movementsVisited: movements,
    guidanceMode: 'full',
    traceMode: 'none',
    promptsShown: 2,
    groundUsed: false,
    ...(words[i] ? { closingWord: words[i] } : {}),
    savedToSky: true,
    schemaVersion: 1,
  }));
}

export function SkyPreview() {
  const sky = useMemo(() => generateSky(illustrativeTraces(), { dustCount: 110 }), []);
  return (
    <WhenVisible className="h-[260px] w-full md:h-[320px]">
      <SkyCanvas
      sky={sky}
      className="h-[260px] w-full md:h-[320px]"
        label="An illustrative Inner Sky: a scattering of teal, amber, violet, gold and pale-blue points of light."
      />
    </WhenVisible>
  );
}
