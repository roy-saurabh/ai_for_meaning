/**
 * Scene parameters — the render-side description of what the field should look like.
 *
 * Pure data derived from domain state (weather + phase). Renderers interpolate toward a target scene;
 * they never read or mutate session state. Weather visuals are metaphorical: no preset is "good" or
 * "bad", and Tense deliberately avoids warning-red semantics (rose is softened toward amber).
 */

import type { Phase } from '@/lib/mirror/machine';
import type { PresetWeatherId, WeatherChoice } from '@/lib/mirror/weather';
import { hashString, mulberry32, range } from './prng';

export type RGB = readonly [number, number, number];

export interface FieldParams {
  colorA: RGB;
  colorB: RGB;
  /** Fraction of the particle pool that is visible (0..1). */
  density: number;
  /** Angular speed multiplier. */
  speed: number;
  /** Radial wobble amplitude. */
  turbulence: number;
  /** Field radius as a fraction of half the short side. */
  spread: number;
  /** Vertical centre offset (-1 lower .. +1 higher), as fraction of spread. */
  lift: number;
  /** Base particle radius in CSS px. */
  size: number;
  /** 0 crisp .. 1 very soft/diffuse. */
  softness: number;
  /** 0 smooth orbits .. 1 compressed, angular, jittery orbits. */
  angularity: number;
  /** Downward settling of outer particles (0..1). */
  gravity: number;
  /** Large empty sectors (0..1). */
  emptiness: number;
  /** Short-lived sparks (0..1). */
  sparks: number;
  /** Outward drift and twinkle (0..1). */
  expansion: number;
  /** Motion trail persistence (0 none .. 1 long). */
  trail: number;
  /** Particle opacity multiplier. */
  alpha: number;
  /** Fraction of particles in the second field (for Mixed). */
  mix: number;
  /** Speed multiplier for the second field. */
  mixSpeed: number;
  /** Lift for the second field. */
  mixLift: number;
  orbColor: RGB;
  orbGlow: number;
  /** Orb scale relative to short side. */
  orbScale: number;
  /** Visual breathing cycles per minute (pacing option only). */
  breathRate: number;
  /** Amount the breath envelope moves the orb (0 still .. 1 full). */
  breathDepth: number;
}

const BASE: FieldParams = {
  colorA: [242, 193, 78],
  colorB: [154, 140, 255],
  density: 0.7,
  speed: 0.6,
  turbulence: 0.6,
  spread: 0.82,
  lift: 0,
  size: 2.2,
  softness: 0.3,
  angularity: 0,
  gravity: 0,
  emptiness: 0,
  sparks: 0,
  expansion: 0,
  trail: 0.15,
  alpha: 0.7,
  mix: 0,
  mixSpeed: 1,
  mixLift: 0,
  orbColor: [242, 193, 78],
  orbGlow: 0.7,
  orbScale: 0.13,
  breathRate: 6,
  breathDepth: 0.6,
};

export const WEATHER_SCENES: Record<PresetWeatherId, FieldParams> = {
  tense: {
    ...BASE,
    colorA: [236, 122, 112],
    colorB: [232, 147, 91],
    density: 0.85,
    speed: 1.45,
    turbulence: 1.1,
    spread: 0.56,
    size: 1.6,
    softness: 0.12,
    angularity: 0.75,
    trail: 0.3,
    alpha: 0.72,
    orbColor: [240, 150, 110],
    orbGlow: 0.62,
    orbScale: 0.11,
    breathRate: 8,
    breathDepth: 0.35,
  },
  heavy: {
    ...BASE,
    colorA: [92, 123, 200],
    colorB: [96, 104, 140],
    density: 0.55,
    speed: 0.32,
    turbulence: 0.35,
    spread: 0.78,
    lift: -0.28,
    size: 3.4,
    softness: 0.4,
    gravity: 0.65,
    trail: 0.08,
    alpha: 0.58,
    orbColor: [120, 140, 205],
    orbGlow: 0.45,
    orbScale: 0.12,
    breathRate: 4.5,
    breathDepth: 0.45,
  },
  foggy: {
    ...BASE,
    colorA: [170, 150, 190],
    colorB: [130, 132, 160],
    density: 0.65,
    speed: 0.45,
    turbulence: 0.5,
    spread: 0.95,
    size: 6.5,
    softness: 0.95,
    trail: 0.05,
    alpha: 0.26,
    orbColor: [190, 176, 210],
    orbGlow: 0.4,
    orbScale: 0.15,
    breathRate: 5,
    breathDepth: 0.4,
  },
  bright: {
    ...BASE,
    colorA: [242, 193, 78],
    colorB: [232, 147, 91],
    density: 0.5,
    speed: 0.75,
    turbulence: 0.5,
    spread: 1.05,
    lift: 0.12,
    size: 2.1,
    softness: 0.25,
    expansion: 0.45,
    trail: 0.12,
    alpha: 0.78,
    orbColor: [248, 205, 110],
    orbGlow: 0.95,
    orbScale: 0.14,
    breathRate: 6,
    breathDepth: 0.6,
  },
  numb: {
    ...BASE,
    colorA: [140, 134, 168],
    colorB: [108, 104, 134],
    density: 0.28,
    speed: 0.18,
    turbulence: 0.2,
    spread: 0.9,
    size: 2,
    softness: 0.3,
    emptiness: 0.75,
    trail: 0.02,
    alpha: 0.5,
    orbColor: [150, 144, 180],
    orbGlow: 0.25,
    orbScale: 0.1,
    breathRate: 5,
    breathDepth: 0.25,
  },
  mixed: {
    ...BASE,
    colorA: [242, 193, 78],
    colorB: [92, 123, 200],
    density: 0.72,
    speed: 0.8,
    turbulence: 0.7,
    spread: 0.85,
    size: 2.4,
    softness: 0.35,
    trail: 0.14,
    alpha: 0.68,
    mix: 0.5,
    mixSpeed: 0.4,
    mixLift: -0.2,
    orbColor: [210, 170, 150],
    orbGlow: 0.6,
    orbScale: 0.12,
    breathRate: 6,
    breathDepth: 0.5,
  },
};

/** A calm, idle scene used before any weather is chosen (arrival, homepage). */
export const ARRIVAL_SCENE: FieldParams = {
  ...BASE,
  colorA: [242, 193, 78],
  colorB: [154, 140, 255],
  density: 0.35,
  speed: 0.35,
  turbulence: 0.4,
  spread: 0.9,
  size: 1.8,
  softness: 0.4,
  trail: 0.08,
  alpha: 0.5,
  orbGlow: 0.85,
  orbScale: 0.14,
};

/** Grounding: stable, low-motion, no escalation, no pacing. */
export const GROUND_SCENE: FieldParams = {
  ...BASE,
  colorA: [190, 180, 170],
  colorB: [150, 160, 170],
  density: 0.18,
  speed: 0.06,
  turbulence: 0.05,
  spread: 0.95,
  size: 1.6,
  softness: 0.3,
  trail: 0,
  alpha: 0.35,
  orbColor: [220, 205, 180],
  orbGlow: 0.3,
  orbScale: 0.1,
  breathRate: 6,
  breathDepth: 0,
};

/**
 * Custom weather words: a deterministic variation within gentle bounds, seeded by the text itself.
 * The text is never interpreted — "awful" and "lovely" are treated identically except for their hash.
 */
export function customWeatherScene(text: string): FieldParams {
  const rand = mulberry32(hashString(text.trim().toLowerCase()));
  const palettes: ReadonlyArray<readonly [RGB, RGB]> = [
    [[154, 140, 255], [111, 214, 196]],
    [[242, 193, 78], [154, 140, 255]],
    [[232, 147, 91], [92, 123, 200]],
    [[143, 183, 255], [170, 150, 190]],
    [[111, 214, 196], [242, 193, 78]],
  ];
  const [a, b] = palettes[Math.floor(rand() * palettes.length)] ?? palettes[0]!;
  return {
    ...BASE,
    colorA: a,
    colorB: b,
    density: range(rand, 0.4, 0.8),
    speed: range(rand, 0.3, 1),
    turbulence: range(rand, 0.3, 0.8),
    spread: range(rand, 0.65, 1),
    lift: range(rand, -0.15, 0.15),
    size: range(rand, 1.8, 3.4),
    softness: range(rand, 0.2, 0.6),
    trail: range(rand, 0.05, 0.2),
    alpha: range(rand, 0.5, 0.75),
    orbColor: a,
    orbGlow: range(rand, 0.5, 0.85),
  };
}

export function weatherScene(weather: WeatherChoice | null): FieldParams {
  if (!weather) return ARRIVAL_SCENE;
  return weather.kind === 'preset' ? WEATHER_SCENES[weather.id] : customWeatherScene(weather.text);
}

/** Storm: release, not danger. Wider, more directional energy, soft sparks. */
export function stormScene(base: FieldParams): FieldParams {
  return {
    ...base,
    colorA: blend(base.colorA, [232, 147, 91], 0.35),
    colorB: blend(base.colorB, [236, 122, 112], 0.3),
    density: Math.min(1, base.density + 0.2),
    speed: Math.max(0.9, base.speed * 1.6),
    turbulence: Math.max(0.9, base.turbulence * 1.5),
    spread: Math.min(1.1, base.spread * 1.18),
    angularity: Math.min(1, base.angularity + 0.25),
    sparks: 0.6,
    trail: 0.35,
    gravity: base.gravity * 0.5,
    emptiness: base.emptiness * 0.4,
    alpha: Math.min(0.85, base.alpha + 0.1),
    orbGlow: Math.min(1, base.orbGlow + 0.15),
    breathRate: 7,
    breathDepth: 0.45,
  };
}

/** Stillness: inward, slow, teal/violet, open negative space. */
export const STILLNESS_SCENE: FieldParams = {
  ...BASE,
  colorA: [111, 214, 196],
  colorB: [154, 140, 255],
  density: 0.42,
  speed: 0.16,
  turbulence: 0.12,
  spread: 0.5,
  size: 1.9,
  softness: 0.35,
  trail: 0.05,
  alpha: 0.55,
  orbColor: [160, 220, 210],
  orbGlow: 0.7,
  orbScale: 0.12,
  breathRate: 6,
  breathDepth: 0.55,
};

/** Song: expansion, not fireworks. Violet, gold, pale blue; broad and slow. */
export const SONG_SCENE: FieldParams = {
  ...BASE,
  colorA: [154, 140, 255],
  colorB: [242, 193, 78],
  density: 0.75,
  speed: 0.3,
  turbulence: 0.25,
  spread: 1.25,
  lift: 0.05,
  size: 1.9,
  softness: 0.3,
  expansion: 0.85,
  trail: 0.06,
  alpha: 0.7,
  mix: 0.22,
  mixSpeed: 0.7,
  orbColor: [200, 190, 255],
  orbGlow: 0.8,
  orbScale: 0.13,
  breathRate: 5,
  breathDepth: 0.5,
};

export function blend(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/**
 * Map the Mirror's visual phase to a target scene. `progress` (0..1) lets Stillness keep settling
 * inward over its duration — the interface itself fading with it.
 */
export function sceneFor(phase: Phase, weather: WeatherChoice | null, progress = 0): FieldParams {
  const base = weatherScene(weather);
  switch (phase) {
    case 'arrival':
      return ARRIVAL_SCENE;
    case 'weather':
    case 'consent':
      return base;
    case 'storm':
      return stormScene(base);
    case 'transition_to_stillness':
      return mixScenes(stormScene(base), STILLNESS_SCENE, 0.5 + progress * 0.5);
    case 'stillness': {
      const settle = Math.min(1, progress * 1.4);
      return {
        ...STILLNESS_SCENE,
        spread: STILLNESS_SCENE.spread - settle * 0.12,
        density: STILLNESS_SCENE.density - settle * 0.14,
        speed: STILLNESS_SCENE.speed - settle * 0.06,
      };
    }
    case 'song':
      return SONG_SCENE;
    case 'close':
    case 'ended':
      return { ...SONG_SCENE, density: 0.4, speed: 0.18, expansion: 0.4, spread: 1 };
    case 'grounding':
      return GROUND_SCENE;
    case 'paused':
      return base;
  }
}

export function mixScenes(a: FieldParams, b: FieldParams, t: number): FieldParams {
  const out = { ...a } as Record<keyof FieldParams, unknown>;
  for (const key of Object.keys(a) as Array<keyof FieldParams>) {
    const av = a[key];
    const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') out[key] = av + (bv - av) * t;
    else if (Array.isArray(av) && Array.isArray(bv)) out[key] = blend(av as RGB, bv as RGB, t);
  }
  return out as unknown as FieldParams;
}

/** Frame-rate independent exponential approach toward a target scene. */
export function approachScene(current: FieldParams, target: FieldParams, dtSeconds: number, timeConstant: number): FieldParams {
  const k = 1 - Math.exp(-dtSeconds / Math.max(0.001, timeConstant));
  return mixScenes(current, target, k);
}
