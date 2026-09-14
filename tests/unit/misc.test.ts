import { describe, expect, it } from 'vitest';
import { references, verifiedReferences } from '@/content/references';
import { SCIENCE_THEMES } from '@/content/science';
import { getCompanionConfig } from '@/lib/env/server';
import { breathEnvelope, isExpanding } from '@/lib/generative/breath';
import { hashString, mulberry32 } from '@/lib/generative/prng';
import { STILLNESS_SCENE, WEATHER_SCENES, customWeatherScene, sceneFor } from '@/lib/generative/scenes';
import { normaliseCustomWeather } from '@/lib/mirror/weather';
import { InMemoryPresenceStore } from '@/lib/presence/registry';
import { FixedWindowLimiter } from '@/lib/security/rate-limit';
import { DEFAULT_SETTINGS, parseSettings } from '@/lib/settings/settings';
import { stripControl } from '@/lib/text/sanitize';
import { buildCsp } from '@/proxy';

const ZWSP = String.fromCharCode(0x200b);
const RLO = String.fromCharCode(0x202e);

describe('breath envelope', () => {
  it('is bounded, periodic and smooth at about six cycles per minute', () => {
    for (let t = 0; t < 30; t += 0.05) {
      const v = breathEnvelope(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(Math.abs(breathEnvelope(t + 0.05) - v)).toBeLessThan(0.05);
    }
    expect(breathEnvelope(1.3)).toBeCloseTo(breathEnvelope(11.3));
    expect(isExpanding(0.5)).toBe(true);
    expect(isExpanding(8)).toBe(false);
  });
});

describe('prng', () => {
  it('is deterministic', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('scenes', () => {
  it('gives each preset a distinct identity and avoids warning-red semantics for Tense', () => {
    const signatures = new Set(Object.values(WEATHER_SCENES).map((s) => JSON.stringify([s.colorA, s.speed, s.spread])));
    expect(signatures.size).toBe(6);
    const [r, g] = WEATHER_SCENES.tense.colorA;
    expect(g / r).toBeGreaterThan(0.4);
  });

  it('treats custom words deterministically without interpreting them', () => {
    expect(customWeatherScene('awful')).toEqual(customWeatherScene('awful'));
    expect(customWeatherScene('Awful ')).toEqual(customWeatherScene('awful'));
  });

  it('settles stillness inward over time', () => {
    expect(sceneFor('stillness', null, 1).spread).toBeLessThan(sceneFor('stillness', null, 0).spread);
    expect(sceneFor('stillness', null, 0).spread).toBe(STILLNESS_SCENE.spread);
  });

  it('grounding has no pacing', () => {
    expect(sceneFor('grounding', { kind: 'preset', id: 'tense' }).breathDepth).toBe(0);
  });
});

describe('text hygiene', () => {
  it('cleans and bounds custom words', () => {
    expect(normaliseCustomWeather('   ')).toBeNull();
    expect(normaliseCustomWeather(`  a${ZWSP}  b `)).toBe('a b');
    expect(normaliseCustomWeather('x'.repeat(100))).toHaveLength(40);
    expect(stripControl(`abc${RLO}def`)).toBe('abcdef');
  });
});

describe('presence registry', () => {
  it('counts, heartbeats and expires without identities', () => {
    let n = 0;
    const store = new InMemoryPresenceStore(1_000, 3, () => `id-${n++}`);
    const a = store.join(0);
    const b = store.join(0);
    expect(store.count(0)).toBe(2);
    expect('id' in a && store.heartbeat(a.id, 900)).toBe(true);
    expect(store.count(1_500)).toBe(1);
    expect('id' in b && store.heartbeat(b.id, 1_500)).toBe(false);
    store.join(1_500);
    store.join(1_500);
    expect(store.join(1_500)).toEqual({ error: 'full' });
    if ('id' in a) store.leave(a.id);
    expect(store.count(1_600)).toBe(2);
  });

  it('reports zero honestly when nobody is present', () => {
    expect(new InMemoryPresenceStore().count(Date.now())).toBe(0);
  });
});

describe('rate limiter', () => {
  it('limits per window', () => {
    const l = new FixedWindowLimiter(2, 1_000);
    expect(l.check('k', 0).ok).toBe(true);
    expect(l.check('k', 1).ok).toBe(true);
    const third = l.check('k', 2);
    expect(third.ok).toBe(false);
    expect(third.retryAfterSeconds).toBe(1);
    expect(l.check('k', 1_001).ok).toBe(true);
  });
});

describe('settings parsing', () => {
  it('falls back safely', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('garbage')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('{"motion":"wild","sound":"yes"}')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('{"motion":"minimal","sound":true}').motion).toBe('minimal');
  });

  it('defaults to silent and no experimental traces', () => {
    expect(DEFAULT_SETTINGS.sound).toBe(false);
    expect(DEFAULT_SETTINGS.experimentalBreathTrace).toBe(false);
  });
});

describe('content security policy', () => {
  it('is strict in production', () => {
    const csp = buildCsp('abc', false);
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("connect-src 'self'");
  });
});

describe('companion configuration', () => {
  it('stays local unless explicitly configured with a key', () => {
    expect(getCompanionConfig({}).provider).toBe('local');
    expect(getCompanionConfig({ MIRROR_COMPANION_PROVIDER: 'anthropic' }).provider).toBe('local');
    expect(getCompanionConfig({ MIRROR_COMPANION_PROVIDER: 'anthropic', MIRROR_COMPANION_API_KEY: 'k' }).provider).toBe('anthropic');
  });
});

describe('science content integrity', () => {
  it('every reference a theme cites exists and is verified', () => {
    const ids = new Set(verifiedReferences.map((r) => r.id));
    for (const theme of SCIENCE_THEMES) for (const id of theme.referenceIds) expect(ids.has(id), `${theme.id} → ${id}`).toBe(true);
  });

  it('reference ids are unique and DOIs are bare', () => {
    expect(new Set(references.map((r) => r.id)).size).toBe(references.length);
    for (const r of references) if (r.doi) expect(r.doi).toMatch(/^10\.\d{4,9}\/\S+$/);
  });

  it('science copy avoids forbidden claim language', () => {
    const text = JSON.stringify(SCIENCE_THEMES);
    for (const word of [/\bproves?\b/i, /\brewires?\b/i, /\bheals?\b/i, /clinically proven/i, /\btreats?\b/i]) expect(text).not.toMatch(word);
  });

  it('frames the Britton figures as findings of one study', () => {
    const challenges = SCIENCE_THEMES.find((t) => t.id === 'challenges')!;
    expect(challenges.summary).toMatch(/In one structured-interview study/);
    expect(challenges.doesNotShow).toMatch(/not a prevalence estimate/);
  });
});
