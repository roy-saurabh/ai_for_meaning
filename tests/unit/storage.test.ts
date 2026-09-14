import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_FADE } from '@/lib/mirror/fade';
import { createSession, replay } from '@/lib/mirror/machine';
import { ONBOARDING_KEY, SESSION_RESUME_KEY, SETTINGS_KEY } from '@/lib/settings/settings';
import { buildExport, buildReadableExport, eraseEverything, traceSummary } from '@/lib/storage/export';
import { durationMinutes, migrateTrace } from '@/lib/storage/schema';
import { deleteTrace, eraseDatabase, listTraces, loadFade, saveFade, saveTrace, traceFromSession } from '@/lib/storage/traces';

const T0 = Date.UTC(2026, 8, 12, 19, 0);

function finishedSession() {
  return replay(
    [
      { type: 'BEGIN' },
      { type: 'SELECT_WEATHER', weather: { kind: 'custom', text: 'crowded' } },
      { type: 'START_ARC', traceMode: 'none', now: T0 },
      { type: 'SKIP' },
      { type: 'PROMPT_SHOWN' },
      { type: 'END', now: T0 + 4 * 60_000 },
      { type: 'SET_CLOSING_WORD', word: 'enough' },
    ],
    createSession(),
  );
}

describe('trace schema and migrations', () => {
  it('builds a minimal factual trace from a session', () => {
    const t = traceFromSession(finishedSession(), 'id-1', T0 + 5 * 60_000)!;
    expect(t).toMatchObject({
      id: 'id-1',
      weather: 'custom',
      customWeatherText: 'crowded',
      movementsVisited: ['storm', 'stillness'],
      promptsShown: 1,
      closingWord: 'enough',
      schemaVersion: 1,
    });
    expect(durationMinutes(t)).toBe(4);
    for (const forbidden of ['audio', 'reflection', 'userText', 'songText']) expect(t).not.toHaveProperty(forbidden);
  });

  it('does not create a trace for a session that never started', () => {
    expect(traceFromSession(createSession(), 'x', T0)).toBeNull();
  });

  it('migrates and sanitises stored records', () => {
    expect(migrateTrace(null)).toBeNull();
    expect(migrateTrace({ id: 'a' })).toBeNull();
    expect(migrateTrace({ id: 'a', createdAt: T0, weather: 'volcanic' })).toBeNull();
    const m = migrateTrace({
      id: 'a',
      createdAt: T0,
      endedAt: T0 - 10,
      weather: 'custom',
      customWeatherText: '  so  much  ',
      movementsVisited: ['storm', 'hacking', 'song'],
      closingWord: 'x'.repeat(100),
      rawAudio: [1, 2, 3],
    })!;
    expect(m.endedAt).toBe(T0);
    expect(m.customWeatherText).toBe('so much');
    expect(m.movementsVisited).toEqual(['storm', 'song']);
    expect(m.closingWord).toHaveLength(32);
    expect(m).not.toHaveProperty('rawAudio');
  });
});

describe('IndexedDB persistence, export and erase', () => {
  beforeEach(async () => {
    await eraseDatabase();
  });

  it('saves, lists in chronological order, and deletes traces', async () => {
    const s = finishedSession();
    await saveTrace(traceFromSession(s, 'b', T0)!);
    await saveTrace({ ...traceFromSession(s, 'a', T0)!, createdAt: T0 - 1000 });
    expect((await listTraces()).map((t) => t.id)).toEqual(['a', 'b']);
    await deleteTrace('a');
    expect((await listTraces()).map((t) => t.id)).toEqual(['b']);
  });

  it('persists Fade preferences', async () => {
    expect(await loadFade()).toEqual(DEFAULT_FADE);
    await saveFade({ ...DEFAULT_FADE, completedSessions: 4 });
    expect((await loadFade()).completedSessions).toBe(4);
  });

  it('exports everything as JSON and readable text', async () => {
    await saveTrace(traceFromSession(finishedSession(), 'e1', T0)!);
    const data = await buildExport(new Date(T0));
    expect(data.format).toBe('ai-for-meaning-local-export');
    expect(data.traces).toHaveLength(1);
    const text = buildReadableExport(data);
    expect(text).toContain('Traces kept in your Inner Sky: 1');
    expect(text).toContain('crowded');
    expect(traceSummary(data.traces[0]!)).toMatch(/Storm → Stillness · 4 min · one prompt/);
  });

  it('erase actually deletes local data', async () => {
    await saveTrace(traceFromSession(finishedSession(), 'gone', T0)!);
    await saveFade({ ...DEFAULT_FADE, completedSessions: 9 });
    window.localStorage.setItem(SETTINGS_KEY, '{"motion":"minimal"}');
    window.localStorage.setItem(ONBOARDING_KEY, '1');
    window.sessionStorage.setItem(SESSION_RESUME_KEY, '{}');
    await eraseEverything();
    expect(await listTraces()).toEqual([]);
    expect(await loadFade()).toEqual(DEFAULT_FADE);
    expect(window.localStorage.getItem(SETTINGS_KEY)).toBeNull();
    expect(window.localStorage.getItem(ONBOARDING_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_RESUME_KEY)).toBeNull();
  });
});
