/**
 * Local settings. Stored in localStorage (synchronous, so accessibility preferences can apply before
 * first paint without a flash). Contains preferences only — no personal content.
 */

import type { GuidanceMode, SessionLength } from '@/lib/mirror/machine';

export const SETTINGS_KEY = 'afm.settings.v1';
export const ONBOARDING_KEY = 'afm.onboarded.v1';
export const SESSION_RESUME_KEY = 'afm.session.v1';
export const LOCAL_STORAGE_KEYS = [SETTINGS_KEY, ONBOARDING_KEY] as const;

export type MotionPreference = 'full' | 'gentle' | 'minimal';

export interface Settings {
  motion: MotionPreference;
  sound: boolean;
  sessionLength: SessionLength;
  songInvitations: boolean;
  guidance: GuidanceMode;
  reducedDensity: boolean;
  highContrast: boolean;
  largerText: boolean;
  /** Experimental: allow Breath-trace to be offered in the Mirror. Off by default. */
  experimentalBreathTrace: boolean;
  schemaVersion: 1;
}

export const DEFAULT_SETTINGS: Settings = {
  motion: 'full',
  sound: false,
  sessionLength: 'standard',
  songInvitations: true,
  guidance: 'full',
  reducedDensity: false,
  highContrast: false,
  largerText: false,
  experimentalBreathTrace: false,
  schemaVersion: 1,
};

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === 'string' && (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function parseSettings(raw: string | null): Settings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const r = JSON.parse(raw) as Record<string, unknown>;
    return {
      motion: oneOf(r.motion, ['full', 'gentle', 'minimal'] as const, DEFAULT_SETTINGS.motion),
      sound: r.sound === true,
      sessionLength: oneOf(r.sessionLength, ['short', 'standard', 'long'] as const, DEFAULT_SETTINGS.sessionLength),
      songInvitations: r.songInvitations !== false,
      guidance: oneOf(r.guidance, ['full', 'quiet'] as const, DEFAULT_SETTINGS.guidance),
      reducedDensity: r.reducedDensity === true,
      highContrast: r.highContrast === true,
      largerText: r.largerText === true,
      experimentalBreathTrace: r.experimentalBreathTrace === true,
      schemaVersion: 1,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readSettings(): Settings {
  return parseSettings(safeStorage()?.getItem(SETTINGS_KEY) ?? null);
}

export function writeSettings(settings: Settings): void {
  try {
    safeStorage()?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable: preferences simply won't persist */
  }
  applySettingsToDocument(settings);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('afm:settings', { detail: settings }));
}

/** Mirrors the inline ThemeScript: reflects accessibility preferences as data attributes on <html>. */
export function applySettingsToDocument(settings: Settings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const osReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  root.dataset.motion = osReduced ? 'minimal' : settings.motion;
  if (settings.highContrast) root.dataset.contrast = 'high';
  else delete root.dataset.contrast;
  if (settings.largerText) root.dataset.text = 'large';
  else delete root.dataset.text;
  if (settings.reducedDensity) root.dataset.density = 'reduced';
  else delete root.dataset.density;
}

export function isOnboarded(): boolean {
  try {
    return safeStorage()?.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function setOnboarded(value: boolean): void {
  try {
    const s = safeStorage();
    if (!s) return;
    if (value) s.setItem(ONBOARDING_KEY, '1');
    else s.removeItem(ONBOARDING_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * The effective motion level for renderers, combining the OS preference and the local setting.
 * 'minimal' means no continuous animation at all.
 */
export function effectiveMotion(settings: Settings): MotionPreference {
  if (typeof window === 'undefined') return 'minimal';
  const osReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (settings.motion === 'minimal') return 'minimal';
  if (osReduced) return 'minimal';
  return settings.motion;
}

/**
 * Inline, pre-hydration script body (rendered with the CSP nonce). Kept tiny and dependency-free.
 * Must stay behaviourally identical to applySettingsToDocument.
 */
export const THEME_SCRIPT = `(function(){try{var d=document.documentElement;d.classList.add('js-reveal');var s=JSON.parse(localStorage.getItem('${SETTINGS_KEY}')||'{}');var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;var m=s.motion==='gentle'||s.motion==='minimal'?s.motion:'full';d.dataset.motion=r?'minimal':m;if(s.highContrast===true)d.dataset.contrast='high';if(s.largerText===true)d.dataset.text='large';if(s.reducedDensity===true)d.dataset.density='reduced';}catch(e){}})();`;
