/**
 * IndexedDB persistence for Inner Sky traces and local preferences.
 * Browser-only. Every function degrades gracefully when IndexedDB is unavailable (private modes,
 * blocked storage, quota) by throwing a typed StorageUnavailableError the UI can explain.
 */

import { openDB, deleteDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DEFAULT_FADE, migrateFade, type FadePreferences } from '@/lib/mirror/fade';
import type { SessionState } from '@/lib/mirror/machine';
import { DB_NAME, DB_VERSION, migrateTrace, TRACE_SCHEMA_VERSION, type SessionTrace } from './schema';
import { cleanShortText } from '@/lib/text/sanitize';

interface AfmDB extends DBSchema {
  traces: {
    key: string;
    value: SessionTrace;
    indexes: { createdAt: number };
  };
  meta: {
    key: string;
    value: unknown;
  };
}

export class StorageUnavailableError extends Error {
  constructor(
    public readonly reason: 'unsupported' | 'blocked' | 'quota' | 'unknown',
    cause?: unknown,
  ) {
    super(`Local storage unavailable: ${reason}`);
    this.name = 'StorageUnavailableError';
    if (cause !== undefined) this.cause = cause;
  }
}

let dbPromise: Promise<IDBPDatabase<AfmDB>> | null = null;

function classify(error: unknown): StorageUnavailableError {
  if (error instanceof StorageUnavailableError) return error;
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'QuotaExceededError') return new StorageUnavailableError('quota', error);
  if (name === 'InvalidStateError' || name === 'SecurityError') return new StorageUnavailableError('blocked', error);
  return new StorageUnavailableError('unknown', error);
}

export function getDB(): Promise<IDBPDatabase<AfmDB>> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new StorageUnavailableError('unsupported'));
  }
  if (!dbPromise) {
    dbPromise = openDB<AfmDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Version 0 → 1: initial schema. Future versions add cases below and migrate records with
        // migrateTrace() inside the upgrade transaction.
        if (oldVersion < 1) {
          const traces = db.createObjectStore('traces', { keyPath: 'id' });
          traces.createIndex('createdAt', 'createdAt');
          db.createObjectStore('meta');
        }
      },
      blocking() {
        // Another tab wants a newer version (or deletion): close so it can proceed.
        void dbPromise?.then((db) => db.close());
        dbPromise = null;
      },
    }).catch((error: unknown) => {
      dbPromise = null;
      throw classify(error);
    });
  }
  return dbPromise;
}

export function newTraceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Build the trace the person chose to keep from a finished session. Pure. */
export function traceFromSession(state: SessionState, id: string, now: number): SessionTrace | null {
  if (!state.weather || state.startedAt === null) return null;
  const trace: SessionTrace = {
    id,
    createdAt: state.startedAt,
    endedAt: state.endedAt ?? now,
    weather: state.weather.kind === 'preset' ? state.weather.id : 'custom',
    movementsVisited: state.movementsVisited,
    guidanceMode: state.config.guidance,
    traceMode: state.traceMode,
    promptsShown: state.promptsShown,
    groundUsed: state.groundUsed,
    savedToSky: true,
    schemaVersion: TRACE_SCHEMA_VERSION,
  };
  if (state.weather.kind === 'custom') trace.customWeatherText = state.weather.text;
  if (state.closingWord) {
    const word = cleanShortText(state.closingWord, 32);
    if (word) trace.closingWord = word;
  }
  return trace;
}

export async function saveTrace(trace: SessionTrace): Promise<void> {
  try {
    const db = await getDB();
    await db.put('traces', trace);
  } catch (error) {
    throw classify(error);
  }
}

export async function listTraces(): Promise<SessionTrace[]> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex('traces', 'createdAt');
    return all.map(migrateTrace).filter((t): t is SessionTrace => t !== null);
  } catch (error) {
    throw classify(error);
  }
}

export async function deleteTrace(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('traces', id);
}

const FADE_KEY = 'fade';

export async function loadFade(): Promise<FadePreferences> {
  try {
    const db = await getDB();
    return migrateFade(await db.get('meta', FADE_KEY));
  } catch {
    return { ...DEFAULT_FADE };
  }
}

export async function saveFade(prefs: FadePreferences): Promise<void> {
  try {
    const db = await getDB();
    await db.put('meta', prefs, FADE_KEY);
  } catch {
    // Fade preferences are a convenience; failing to store them must never interrupt a session.
  }
}

export async function resetFade(): Promise<void> {
  await saveFade({ ...DEFAULT_FADE });
}

/** Delete the entire local database. Resolves once IndexedDB confirms deletion. */
export async function eraseDatabase(): Promise<void> {
  if (dbPromise) {
    try {
      (await dbPromise).close();
    } catch {
      /* already closed */
    }
    dbPromise = null;
  }
  if (typeof indexedDB === 'undefined') return;
  await deleteDB(DB_NAME);
}
