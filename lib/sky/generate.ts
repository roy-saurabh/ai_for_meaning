/**
 * Inner Sky generation — deterministic composition from saved practice facts.
 *
 * This is visual memory, not assessment. Numbers here exist only to place light on a canvas. There is
 * deliberately no "more sessions = brighter" mapping: each trace adds a few points whose position,
 * size and colour come from its own id and the movements it visited. The same traces always produce
 * the same sky.
 *
 * Families of light (a reflective representation of practice interaction, not measurement):
 *   Presence — teal, central        ← Stillness
 *   Rootedness — amber, lower field ← Storm
 *   Spaciousness — violet, outer    ← Song
 *   Aliveness — gold, outer         ← Song
 *   Meaning — pale blue, links      ← a closing word
 */

import { seededRandom, range, clamp, hashString } from '@/lib/generative/prng';
import type { SessionTrace } from '@/lib/storage/schema';

export type SkyFamily = 'presence' | 'rootedness' | 'spaciousness' | 'aliveness' | 'meaning';

export const SKY_FAMILIES: Record<SkyFamily, { label: string; color: string; rgb: readonly [number, number, number] }> = {
  presence: { label: 'Presence', color: '#6FD6C4', rgb: [111, 214, 196] },
  rootedness: { label: 'Rootedness', color: '#E8935B', rgb: [232, 147, 91] },
  spaciousness: { label: 'Spaciousness', color: '#9A8CFF', rgb: [154, 140, 255] },
  aliveness: { label: 'Aliveness', color: '#F2C14E', rgb: [242, 193, 78] },
  meaning: { label: 'Meaning', color: '#8FB7FF', rgb: [143, 183, 255] },
};

export interface SkyStar {
  key: string;
  traceId: string;
  family: SkyFamily;
  /** Normalised position 0..1 */
  x: number;
  y: number;
  /** Radius in CSS px at 1x (before responsive scaling). */
  r: number;
  alpha: number;
  twinklePhase: number;
  /** The primary star of a trace carries the accessible label. */
  primary: boolean;
}

export interface SkyLink {
  key: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  alpha: number;
}

export interface Sky {
  stars: SkyStar[];
  links: SkyLink[];
  /** Faint background dust, deterministic from a fixed seed. */
  dust: Array<{ x: number; y: number; r: number; alpha: number }>;
}

export type SkyWindow = '14d' | '30d' | 'all';

const DAY = 86_400_000;

export function filterTraces(traces: SessionTrace[], window: SkyWindow, now: number): SessionTrace[] {
  if (window === 'all') return traces;
  const days = window === '14d' ? 14 : 30;
  return traces.filter((t) => t.createdAt >= now - days * DAY);
}

export function generateSky(traces: SessionTrace[], options: { dustSeed?: number; dustCount?: number } = {}): Sky {
  const sorted = [...traces].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
  const stars: SkyStar[] = [];
  const links: SkyLink[] = [];

  for (const trace of sorted) {
    const rand = seededRandom(trace.id);
    const visited = trace.movementsVisited;
    let primaryAssigned = false;
    const traceStars: SkyStar[] = [];

    const add = (family: SkyFamily, x: number, y: number, r: number, alpha: number) => {
      const star: SkyStar = {
        key: `${trace.id}:${traceStars.length}`,
        traceId: trace.id,
        family,
        x: clamp(x, 0.03, 0.97),
        y: clamp(y, 0.05, 0.95),
        r,
        alpha,
        twinklePhase: rand() * Math.PI * 2,
        primary: !primaryAssigned,
      };
      primaryAssigned = true;
      traceStars.push(star);
    };

    if (visited.includes('stillness')) {
      // Central teal stars: gathered around the middle, gently scattered.
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 1.6) * 0.26;
      add('presence', 0.5 + Math.cos(angle) * dist, 0.46 + Math.sin(angle) * dist * 0.8, range(rand, 1.6, 2.6), range(rand, 0.65, 0.95));
    }
    if (visited.includes('storm')) {
      // Warm traces in the lower field.
      add('rootedness', range(rand, 0.1, 0.9), range(rand, 0.68, 0.92), range(rand, 1.2, 2.2), range(rand, 0.55, 0.85));
    }
    if (visited.includes('song')) {
      // Sparse outer points, violet and gold.
      const angle = rand() * Math.PI * 2;
      const dist = range(rand, 0.34, 0.47);
      add(rand() > 0.5 ? 'spaciousness' : 'aliveness', 0.5 + Math.cos(angle) * dist, 0.46 + Math.sin(angle) * dist * 0.9, range(rand, 1, 1.9), range(rand, 0.5, 0.8));
    }
    if (traceStars.length === 0) {
      // A session that visited no movement still leaves one quiet point.
      add('presence', range(rand, 0.2, 0.8), range(rand, 0.25, 0.75), 1, 0.45);
    }

    if (trace.closingWord) {
      // A closing word adds a pale-blue point and a subtle line whose geometry comes from the word.
      const wordRand = seededRandom(hashString(trace.closingWord.toLowerCase()) ^ hashString(trace.id));
      const anchor = traceStars[0];
      if (anchor) {
        const angle = wordRand() * Math.PI * 2;
        const len = range(wordRand, 0.05, 0.11);
        const x = clamp(anchor.x + Math.cos(angle) * len, 0.03, 0.97);
        const y = clamp(anchor.y + Math.sin(angle) * len, 0.05, 0.95);
        add('meaning', x, y, range(wordRand, 1.1, 1.8), 0.75);
        links.push({ key: `${trace.id}:link`, from: { x: anchor.x, y: anchor.y }, to: { x, y }, alpha: 0.22 });
      }
    }

    stars.push(...traceStars);
  }

  const dustRand = seededRandom(options.dustSeed ?? 7);
  const dust = Array.from({ length: options.dustCount ?? 140 }, () => ({
    x: dustRand(),
    y: dustRand(),
    r: range(dustRand, 0.3, 0.9),
    alpha: range(dustRand, 0.05, 0.22),
  }));

  return { stars, links, dust };
}
