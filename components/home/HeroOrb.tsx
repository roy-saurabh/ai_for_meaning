'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { ARRIVAL_SCENE } from '@/lib/generative/scenes';

const FieldCanvas = dynamic(() => import('@/components/generative/FieldCanvas').then((m) => m.FieldCanvas), {
  ssr: false,
});

const HERO_SCENE = { ...ARRIVAL_SCENE, density: 0.3, spread: 0.95, orbScale: 0.2, alpha: 0.45, size: 1.6 };

/**
 * The hero orb. A CSS orb renders immediately (no JavaScript, no LCP cost); the living canvas orb is
 * loaded after the page is idle and fades in over it.
 */
export function HeroOrb() {
  const [ready, setReady] = useState(false);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    const handle = idle(() => setReady(true));
    return () => {
      if (window.cancelIdleCallback && typeof handle === 'number') window.cancelIdleCallback(handle);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setPainted(true), 120);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return (
    <div className="relative mx-auto aspect-square w-[min(78vw,400px)]" aria-hidden="true">
      <div
        className={`orb-static is-breathing absolute inset-[27%] transition-opacity duration-[1600ms] ${painted ? 'opacity-0' : 'opacity-100'}`}
      />
      {ready && (
        <div className={`absolute -inset-[30%] transition-opacity duration-[1600ms] ${painted ? 'opacity-100' : 'opacity-0'}`}>
          <FieldCanvas scene={HERO_SCENE} className="h-full w-full" fps={45} sceneKey="hero" />
        </div>
      )}
    </div>
  );
}
