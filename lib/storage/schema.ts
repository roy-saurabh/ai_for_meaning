/**
 * Local data schema (IndexedDB). Versioned; every record carries schemaVersion.
 *
 * A SessionTrace holds facts about a practice session only. It never holds raw audio, camera frames,
 * sensor streams, reflections the companion produced, or anything the person did not explicitly
 * choose to keep.
 */

import type { GuidanceMode, Movement, TraceMode } from '@/lib/mirror/machine';
import { isPresetWeatherId, type PresetWeatherId } from '@/lib/mirror/weather';
import { cleanShortText } from '@/lib/text/sanitize';

export const DB_NAME = 'ai-for-meaning';
export const DB_VERSION = 1;
export const TRACE_SCHEMA_VERSION = 1;
export const CLOSING_WORD_MAX = 32;

export interface SessionTrace {
  id: string;
  createdAt: number;
  endedAt: number;
  /** Preset weather id, or 'custom' when the person wrote their own word. */
  weather: PresetWeatherId | 'custom';
  customWeatherText?: string;
  movementsVisited: Movement[];
  guidanceMode: GuidanceMode;
  traceMode: TraceMode;
  /** Number of guidance prompts shown (a fact about the interface, not about the person). */
  promptsShown: number;
  groundUsed: boolean;
  closingWord?: string;
  savedToSky: true;
  schemaVersion: typeof TRACE_SCHEMA_VERSION;
}

const MOVEMENTS: readonly Movement[] = ['storm', 'stillness', 'song'];

/**
 * Normalise any stored or imported record into the current schema. Returns null for records that
 * cannot be made valid. Pure; used by the IndexedDB upgrade path and by tests.
 */
export function migrateTrace(raw: unknown): SessionTrace | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || r.id.length === 0 || r.id.length > 64) return null;
  const createdAt = typeof r.createdAt === 'number' && Number.isFinite(r.createdAt) ? r.createdAt : null;
  if (createdAt === null) return null;
  const endedAt = typeof r.endedAt === 'number' && Number.isFinite(r.endedAt) ? r.endedAt : createdAt;

  const weather = isPresetWeatherId(r.weather) ? r.weather : r.weather === 'custom' ? 'custom' : null;
  if (weather === null) return null;

  const movements = Array.isArray(r.movementsVisited)
    ? MOVEMENTS.filter((m) => (r.movementsVisited as unknown[]).includes(m))
    : [];

  const trace: SessionTrace = {
    id: r.id,
    createdAt,
    endedAt: Math.max(createdAt, endedAt),
    weather,
    movementsVisited: movements,
    guidanceMode: r.guidanceMode === 'quiet' ? 'quiet' : 'full',
    traceMode: r.traceMode === 'breath' ? 'breath' : 'none',
    promptsShown:
      typeof r.promptsShown === 'number' && Number.isFinite(r.promptsShown) ? Math.max(0, Math.floor(r.promptsShown)) : 0,
    groundUsed: r.groundUsed === true,
    savedToSky: true,
    schemaVersion: TRACE_SCHEMA_VERSION,
  };
  if (weather === 'custom' && typeof r.customWeatherText === 'string') {
    const text = cleanShortText(r.customWeatherText, 40);
    if (text) trace.customWeatherText = text;
  }
  if (typeof r.closingWord === 'string') {
    const word = cleanShortText(r.closingWord, CLOSING_WORD_MAX);
    if (word) trace.closingWord = word;
  }
  return trace;
}

export function durationMinutes(trace: Pick<SessionTrace, 'createdAt' | 'endedAt'>): number {
  return Math.max(1, Math.round((trace.endedAt - trace.createdAt) / 60_000));
}
