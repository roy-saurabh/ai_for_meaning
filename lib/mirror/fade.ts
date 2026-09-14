/**
 * The Fade — local, adaptive reduction of scaffolding.
 *
 * There is deliberately no score. The only inputs are facts the person's own browser already holds
 * (how many sessions were completed, and explicit preferences). The output is a scaffolding level
 * that decides how much explanation, prompting and chrome the Mirror shows. It never claims to
 * measure progress, capacity or anything about the person.
 */

export type ScaffoldingLevel = 'full' | 'lighter' | 'quiet';

export interface FadePreferences {
  /** Completed arcs (reached close), counted locally. Never displayed as a number to the person. */
  completedSessions: number;
  /** The person accepted the offer of quiet entry (skip arrival explanation, fewer prompts). */
  quietEntry: boolean;
  /** The person prefers no Song prompt. */
  hideSongPrompt: boolean;
  /** Stillness without any instructions. */
  stillnessWithoutInstructions: boolean;
  /** Whether the quiet-entry offer has been shown (so it is offered once, not nagged). */
  quietEntryOffered: boolean;
  schemaVersion: 1;
}

export const DEFAULT_FADE: FadePreferences = {
  completedSessions: 0,
  quietEntry: false,
  hideSongPrompt: false,
  stillnessWithoutInstructions: false,
  quietEntryOffered: false,
  schemaVersion: 1,
};

/** Sessions after which explanatory copy begins to recede. */
export const LIGHTER_AFTER = 3;
/** Sessions after which quiet entry is offered (never imposed). */
export const OFFER_QUIET_AFTER = 6;

export function scaffoldingLevel(prefs: FadePreferences): ScaffoldingLevel {
  if (prefs.quietEntry) return 'quiet';
  if (prefs.completedSessions >= LIGHTER_AFTER) return 'lighter';
  return 'full';
}

export function shouldOfferQuietEntry(prefs: FadePreferences): boolean {
  return !prefs.quietEntry && !prefs.quietEntryOffered && prefs.completedSessions >= OFFER_QUIET_AFTER;
}

export function recordCompletedSession(prefs: FadePreferences): FadePreferences {
  return { ...prefs, completedSessions: prefs.completedSessions + 1 };
}

export interface GuidancePlan {
  /** How long (ms) a guidance line stays before dissolving. */
  lineHoldMs: number;
  /** Whether the Stillness phase shows its guiding lines at all. */
  stillnessLines: boolean;
  /** After how much Stillness (ms) the interface chrome recedes, leaving only the field. */
  chromeRecedesAfterMs: number;
  /** Whether Song asks its question. */
  songPrompt: boolean;
  /** Whether close uses the short form. */
  simpleClose: boolean;
  /** Whether weather explanation copy shows. */
  explainWeather: boolean;
}

export function guidancePlan(prefs: FadePreferences, guidance: 'full' | 'quiet'): GuidancePlan {
  const level = guidance === 'quiet' ? 'quiet' : scaffoldingLevel(prefs);
  switch (level) {
    case 'full':
      return {
        lineHoldMs: 14_000,
        stillnessLines: !prefs.stillnessWithoutInstructions,
        chromeRecedesAfterMs: 30_000,
        songPrompt: !prefs.hideSongPrompt,
        simpleClose: false,
        explainWeather: true,
      };
    case 'lighter':
      return {
        lineHoldMs: 9_000,
        stillnessLines: !prefs.stillnessWithoutInstructions,
        chromeRecedesAfterMs: 15_000,
        songPrompt: !prefs.hideSongPrompt,
        simpleClose: false,
        explainWeather: false,
      };
    case 'quiet':
      return {
        lineHoldMs: 6_000,
        stillnessLines: false,
        chromeRecedesAfterMs: 6_000,
        songPrompt: !prefs.hideSongPrompt,
        simpleClose: true,
        explainWeather: false,
      };
  }
}

export function migrateFade(raw: unknown): FadePreferences {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_FADE };
  const r = raw as Partial<Record<keyof FadePreferences, unknown>>;
  const count = typeof r.completedSessions === 'number' && Number.isFinite(r.completedSessions)
    ? Math.max(0, Math.floor(r.completedSessions))
    : 0;
  return {
    completedSessions: count,
    quietEntry: r.quietEntry === true,
    hideSongPrompt: r.hideSongPrompt === true,
    stillnessWithoutInstructions: r.stillnessWithoutInstructions === true,
    quietEntryOffered: r.quietEntryOffered === true,
    schemaVersion: 1,
  };
}
