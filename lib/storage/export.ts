/**
 * Export and erase. "Delete everything" must actually delete: IndexedDB, localStorage keys,
 * sessionStorage resume state, and cached pages that could contain nothing personal but are cleared
 * anyway so the browser returns to a first-visit state.
 */

import { WEATHER } from '@/lib/mirror/weather';
import { LOCAL_STORAGE_KEYS, SESSION_RESUME_KEY, readSettings } from '@/lib/settings/settings';
import { durationMinutes, type SessionTrace } from './schema';
import { eraseDatabase, listTraces, loadFade } from './traces';

export interface LocalExport {
  format: 'ai-for-meaning-local-export';
  exportedAt: string;
  schemaVersion: 1;
  note: string;
  settings: ReturnType<typeof readSettings>;
  fade: Awaited<ReturnType<typeof loadFade>>;
  traces: SessionTrace[];
}

export async function buildExport(now = new Date()): Promise<LocalExport> {
  const [traces, fade] = await Promise.all([listTraces().catch(() => []), loadFade()]);
  return {
    format: 'ai-for-meaning-local-export',
    exportedAt: now.toISOString(),
    schemaVersion: 1,
    note: 'Everything AI for Meaning stored in this browser. Nothing here was held on a server.',
    settings: readSettings(),
    fade,
    traces,
  };
}

const MOVEMENT_LABEL = { storm: 'Storm', stillness: 'Stillness', song: 'Song' } as const;

export function traceSummary(trace: SessionTrace, locale = 'en-GB'): string {
  const date = new Date(trace.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const weather = trace.weather === 'custom' ? (trace.customWeatherText ?? 'own word') : WEATHER[trace.weather].label;
  const movements = trace.movementsVisited.length
    ? trace.movementsVisited.map((m) => MOVEMENT_LABEL[m]).join(' → ')
    : 'no movements';
  const prompts = trace.promptsShown === 0 ? 'no prompts' : trace.promptsShown === 1 ? 'one prompt' : `${trace.promptsShown} prompts`;
  const parts = [date, weather, movements, `${durationMinutes(trace)} min`, prompts];
  if (trace.groundUsed) parts.push('grounded');
  if (trace.closingWord) parts.push(`“${trace.closingWord}”`);
  return parts.join(' · ');
}

export function buildReadableExport(data: LocalExport, locale = 'en-GB'): string {
  const lines = [
    'AI for Meaning — local export',
    `Exported ${new Date(data.exportedAt).toLocaleString(locale)}`,
    '',
    'This file contains everything this browser kept. No server held a copy.',
    '',
    `Traces kept in your Inner Sky: ${data.traces.length}`,
    '',
    ...data.traces.map((t) => `  ${traceSummary(t, locale)}`),
    '',
    'Preferences',
    `  Motion: ${data.settings.motion}`,
    `  Sound: ${data.settings.sound ? 'on' : 'off'}`,
    `  Session length: ${data.settings.sessionLength}`,
    `  Guidance: ${data.settings.guidance}`,
    `  Song invitations: ${data.settings.songInvitations ? 'shown' : 'hidden'}`,
    '',
  ];
  return lines.join('\n');
}

export function downloadFile(filename: string, contents: string, type: string): void {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function eraseEverything(): Promise<void> {
  await eraseDatabase();
  try {
    for (const key of LOCAL_STORAGE_KEYS) window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(SESSION_RESUME_KEY);
  } catch {
    /* storage unavailable */
  }
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('afm-')).map((k) => caches.delete(k)));
    }
  } catch {
    /* caches unavailable */
  }
  window.dispatchEvent(new CustomEvent('afm:erased'));
}
