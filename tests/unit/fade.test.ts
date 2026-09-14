import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FADE,
  LIGHTER_AFTER,
  OFFER_QUIET_AFTER,
  guidancePlan,
  migrateFade,
  recordCompletedSession,
  scaffoldingLevel,
  shouldOfferQuietEntry,
} from '@/lib/mirror/fade';

describe('the Fade', () => {
  it('starts with full scaffolding and recedes with familiarity', () => {
    expect(scaffoldingLevel(DEFAULT_FADE)).toBe('full');
    let prefs = DEFAULT_FADE;
    for (let i = 0; i < LIGHTER_AFTER; i++) prefs = recordCompletedSession(prefs);
    expect(scaffoldingLevel(prefs)).toBe('lighter');
    expect(guidancePlan(prefs, 'full').explainWeather).toBe(false);
    expect(guidancePlan(prefs, 'full').lineHoldMs).toBeLessThan(guidancePlan(DEFAULT_FADE, 'full').lineHoldMs);
  });

  it('offers quiet entry once, after enough sessions, never imposing it', () => {
    const experienced = { ...DEFAULT_FADE, completedSessions: OFFER_QUIET_AFTER };
    expect(shouldOfferQuietEntry(DEFAULT_FADE)).toBe(false);
    expect(shouldOfferQuietEntry(experienced)).toBe(true);
    expect(scaffoldingLevel(experienced)).not.toBe('quiet');
    expect(shouldOfferQuietEntry({ ...experienced, quietEntryOffered: true })).toBe(false);
    expect(scaffoldingLevel({ ...experienced, quietEntry: true })).toBe('quiet');
  });

  it('respects explicit preferences', () => {
    expect(guidancePlan({ ...DEFAULT_FADE, hideSongPrompt: true }, 'full').songPrompt).toBe(false);
    expect(guidancePlan({ ...DEFAULT_FADE, stillnessWithoutInstructions: true }, 'full').stillnessLines).toBe(false);
    expect(guidancePlan(DEFAULT_FADE, 'quiet').simpleClose).toBe(true);
  });

  it('migrates unknown or malformed records safely', () => {
    expect(migrateFade(null)).toEqual(DEFAULT_FADE);
    expect(migrateFade({ completedSessions: -4, quietEntry: 'yes' })).toEqual(DEFAULT_FADE);
    expect(migrateFade({ completedSessions: 7.8, quietEntry: true }).completedSessions).toBe(7);
  });

  it('exposes no score', () => {
    expect(Object.keys(guidancePlan(DEFAULT_FADE, 'full'))).not.toContain('score');
  });
});
