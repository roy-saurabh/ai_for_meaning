import { describe, expect, it } from 'vitest';
import { filterTraces, generateSky } from '@/lib/sky/generate';
import type { SessionTrace } from '@/lib/storage/schema';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 8, 14);

function trace(id: string, daysAgo: number, movements: SessionTrace['movementsVisited'], closingWord?: string): SessionTrace {
  return {
    id,
    createdAt: NOW - daysAgo * DAY,
    endedAt: NOW - daysAgo * DAY + 300_000,
    weather: 'tense',
    movementsVisited: movements,
    guidanceMode: 'full',
    traceMode: 'none',
    promptsShown: 1,
    groundUsed: false,
    savedToSky: true,
    schemaVersion: 1,
    ...(closingWord ? { closingWord } : {}),
  };
}

describe('Inner Sky generation', () => {
  const traces = [trace('a', 1, ['storm', 'stillness']), trace('b', 10, ['stillness', 'song'], 'warm'), trace('c', 40, ['storm'])];

  it('is deterministic for the same traces, regardless of input order', () => {
    expect(generateSky(traces)).toEqual(generateSky([...traces].reverse()));
  });

  it('adding a trace does not rearrange existing stars', () => {
    const before = generateSky(traces.slice(0, 2)).stars.filter((s) => s.traceId === 'a');
    const after = generateSky(traces).stars.filter((s) => s.traceId === 'a');
    expect(after).toEqual(before);
  });

  it('maps movements to families and positions by composition', () => {
    const sky = generateSky(traces);
    const a = sky.stars.filter((s) => s.traceId === 'a');
    expect(a.map((s) => s.family)).toEqual(['presence', 'rootedness']);
    expect(a.find((s) => s.family === 'rootedness')!.y).toBeGreaterThan(0.6);
    expect(sky.stars.filter((s) => s.traceId === 'b').some((s) => s.family === 'meaning')).toBe(true);
    expect(sky.links).toHaveLength(1);
  });

  it('marks exactly one primary star per trace', () => {
    const sky = generateSky(traces);
    for (const id of ['a', 'b', 'c']) expect(sky.stars.filter((s) => s.traceId === id && s.primary)).toHaveLength(1);
  });

  it('has no brightness-as-progress: a star does not grow as sessions accumulate', () => {
    const many = Array.from({ length: 30 }, (_, i) => trace(`t${i}`, i, ['stillness']));
    const alone = generateSky(many.slice(0, 1)).stars[0]!;
    const inCrowd = generateSky(many).stars.find((s) => s.traceId === 't0')!;
    expect(inCrowd.alpha).toBe(alone.alpha);
    expect(inCrowd.r).toBe(alone.r);
  });

  it('filters by window', () => {
    expect(filterTraces(traces, '14d', NOW).map((t) => t.id)).toEqual(['a', 'b']);
    expect(filterTraces(traces, '30d', NOW)).toHaveLength(2);
    expect(filterTraces(traces, 'all', NOW)).toHaveLength(3);
  });

  it('keeps stars inside the canvas', () => {
    const lots = Array.from({ length: 50 }, (_, i) => trace(`z${i}`, i, ['storm', 'stillness', 'song'], `word${i}`));
    for (const s of generateSky(lots).stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(1);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(1);
    }
  });
});
