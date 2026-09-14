/**
 * Deterministic test hooks (VISUAL_TEST_MODE).
 *
 * Playwright injects `window.__AFM_TEST__` with an init script. Production visitors never have it, so
 * this has no effect on real sessions. When present:
 *  - frozenTime: renderers draw a single frame at this clock time (seconds) and never animate;
 *  - seed: particle fields use this seed instead of a random one;
 *  - timeScale: the Mirror session clock runs this many times faster (for end-to-end journeys).
 */

export interface TestHooks {
  frozenTime?: number;
  seed?: number;
  timeScale?: number;
}

declare global {
  interface Window {
    __AFM_TEST__?: TestHooks;
  }
}

export function testHooks(): TestHooks | null {
  if (typeof window === 'undefined') return null;
  const hooks = window.__AFM_TEST__;
  return hooks && typeof hooks === 'object' ? hooks : null;
}

export function isFrozen(): boolean {
  return typeof testHooks()?.frozenTime === 'number';
}
