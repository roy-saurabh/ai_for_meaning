import { describe, expect, it } from 'vitest';
import {
  SESSION_DURATIONS,
  canGround,
  createSession,
  phaseProgress,
  replay,
  restoreSession,
  serialiseSession,
  transition,
  visualPhase,
  type SessionEvent,
  type SessionState,
} from '@/lib/mirror/machine';

const T0 = 1_780_000_000_000;
const tense = { kind: 'preset', id: 'tense' } as const;

function inStorm(config = {}): SessionState {
  return replay(
    [{ type: 'BEGIN' }, { type: 'SELECT_WEATHER', weather: tense }, { type: 'START_ARC', traceMode: 'none', now: T0 }],
    createSession(config),
  );
}

describe('session state machine', () => {
  it('walks arrival → weather → consent → storm', () => {
    const s = inStorm();
    expect(s.phase).toBe('storm');
    expect(s.weather).toEqual(tense);
    expect(s.startedAt).toBe(T0);
    expect(s.movementsVisited).toEqual(['storm']);
  });

  it('ignores events that are invalid for the current phase', () => {
    const s = createSession();
    expect(transition(s, { type: 'START_ARC', traceMode: 'none', now: T0 })).toBe(s);
    expect(transition(s, { type: 'SKIP' })).toBe(s);
    expect(transition(s, { type: 'SAVE', now: T0 })).toBe(s);
    const weather = transition(s, { type: 'BEGIN' });
    expect(transition(weather, { type: 'START_ARC', traceMode: 'none', now: T0 })).toBe(weather);
  });

  it('advances deterministically with TICK through the whole arc', () => {
    const d = SESSION_DURATIONS.standard;
    let s = inStorm();
    s = transition(s, { type: 'TICK', deltaMs: d.storm });
    expect(s.phase).toBe('transition_to_stillness');
    s = transition(s, { type: 'TICK', deltaMs: d.transition_to_stillness });
    expect(s.phase).toBe('stillness');
    s = transition(s, { type: 'TICK', deltaMs: d.stillness });
    expect(s.phase).toBe('song');
    s = transition(s, { type: 'TICK', deltaMs: d.song });
    expect(s.phase).toBe('close');
    expect(s.movementsVisited).toEqual(['storm', 'stillness', 'song']);
    expect(s.activeMs).toBe(d.storm + d.transition_to_stillness + d.stillness + d.song);
  });

  it('carries overflow from a large tick into the next phase', () => {
    const d = SESSION_DURATIONS.standard;
    const s = transition(inStorm(), { type: 'TICK', deltaMs: d.storm + 1_000 });
    expect(s.phase).toBe('transition_to_stillness');
    expect(s.elapsedInPhase).toBe(1_000);
  });

  it('skips Song when song is disabled', () => {
    const d = SESSION_DURATIONS.short;
    let s = inStorm({ length: 'short', songEnabled: false });
    s = transition(s, { type: 'SKIP' });
    expect(s.phase).toBe('stillness');
    s = transition(s, { type: 'TICK', deltaMs: d.stillness });
    expect(s.phase).toBe('close');
    expect(s.movementsVisited).not.toContain('song');
  });

  it('skip from Storm goes straight to Stillness and records the skip', () => {
    const s = transition(inStorm(), { type: 'SKIP' });
    expect(s.phase).toBe('stillness');
    expect(s.movementsSkipped).toEqual(['storm']);
    expect(transition(s, { type: 'SKIP' }).phase).toBe('song');
    expect(transition(transition(s, { type: 'SKIP' }), { type: 'SKIP' }).phase).toBe('close');
  });

  it('pause freezes time and resume returns to the same phase and elapsed time', () => {
    let s = transition(inStorm(), { type: 'TICK', deltaMs: 10_000 });
    s = transition(s, { type: 'PAUSE' });
    expect(s.phase).toBe('paused');
    expect(visualPhase(s)).toBe('storm');
    const frozen = transition(s, { type: 'TICK', deltaMs: 999_999 });
    expect(frozen).toBe(s);
    const resumed = transition(frozen, { type: 'RESUME' });
    expect(resumed.phase).toBe('storm');
    expect(resumed.elapsedInPhase).toBe(10_000);
  });

  it('hiding the tab pauses a timed phase but not untimed ones', () => {
    expect(transition(inStorm(), { type: 'VISIBILITY_HIDDEN' }).phase).toBe('paused');
    const weather = transition(createSession(), { type: 'BEGIN' });
    expect(transition(weather, { type: 'VISIBILITY_HIDDEN' }).phase).toBe('weather');
  });

  it('Ground is reachable from every active stage and never resumes escalation', () => {
    const start: SessionEvent[] = [
      { type: 'BEGIN' },
      { type: 'SELECT_WEATHER', weather: tense },
      { type: 'START_ARC', traceMode: 'none', now: T0 },
    ];
    const reach: Record<string, SessionEvent[]> = {
      weather: [{ type: 'BEGIN' }],
      consent: [{ type: 'BEGIN' }, { type: 'SELECT_WEATHER', weather: tense }],
      storm: start,
      transition_to_stillness: [...start, { type: 'TICK', deltaMs: SESSION_DURATIONS.standard.storm }],
      stillness: [...start, { type: 'SKIP' }],
      song: [...start, { type: 'SKIP' }, { type: 'SKIP' }],
      paused: [...start, { type: 'PAUSE' }],
    };
    for (const [phase, events] of Object.entries(reach)) {
      const s = replay(events);
      expect(s.phase).toBe(phase);
      expect(canGround(s.phase)).toBe(true);
      const grounded = transition(s, { type: 'GROUND' });
      expect(grounded.phase, `ground from ${phase}`).toBe('grounding');
      expect(grounded.groundUsed).toBe(true);
      // Time does not move Ground anywhere, and RESUME does nothing.
      expect(transition(grounded, { type: 'TICK', deltaMs: 1e9 })).toBe(grounded);
      expect(transition(grounded, { type: 'RESUME' })).toBe(grounded);
      // Ending from Ground finishes without asking about saving.
      const ended = transition(grounded, { type: 'END', now: T0 + 5 });
      expect(ended.phase).toBe('ended');
      expect(ended.saveDecision).toBe('discarded');
    }
    expect(transition(transition(inStorm(), { type: 'PAUSE' }), { type: 'GROUND' }).groundedFrom).toBe('storm');
  });

  it('END during the arc goes to close; save and discard finish', () => {
    const closed = transition(inStorm(), { type: 'END', now: T0 + 60_000 });
    expect(closed.phase).toBe('close');
    expect(closed.endedAt).toBe(T0 + 60_000);
    const saved = transition(transition(closed, { type: 'SET_CLOSING_WORD', word: 'warm' }), { type: 'SAVE', now: T0 + 70_000 });
    expect(saved.phase).toBe('ended');
    expect(saved.saveDecision).toBe('saved');
    expect(saved.closingWord).toBe('warm');
    expect(saved.endedAt).toBe(T0 + 60_000);
    expect(transition(closed, { type: 'DISCARD', now: T0 }).saveDecision).toBe('discarded');
  });

  it('END before the arc begins simply ends', () => {
    const s = transition(transition(createSession(), { type: 'BEGIN' }), { type: 'END', now: T0 });
    expect(s.phase).toBe('ended');
  });

  it('BACK steps back from consent and weather', () => {
    const consent = replay([{ type: 'BEGIN' }, { type: 'SELECT_WEATHER', weather: tense }]);
    expect(transition(consent, { type: 'BACK' }).phase).toBe('weather');
    expect(transition(transition(consent, { type: 'BACK' }), { type: 'BACK' }).phase).toBe('arrival');
  });

  it('RESTART returns to weather with a fresh session', () => {
    const ended = transition(transition(inStorm(), { type: 'END', now: T0 }), { type: 'DISCARD', now: T0 });
    const fresh = transition(ended, { type: 'RESTART' });
    expect(fresh.phase).toBe('weather');
    expect(fresh.weather).toBeNull();
    expect(fresh.movementsVisited).toEqual([]);
  });

  it('counts prompts shown', () => {
    const s = replay([{ type: 'PROMPT_SHOWN' }, { type: 'PROMPT_SHOWN' }], inStorm());
    expect(s.promptsShown).toBe(2);
  });

  it('reports phase progress', () => {
    const s = transition(inStorm(), { type: 'TICK', deltaMs: SESSION_DURATIONS.standard.storm / 2 });
    expect(phaseProgress(s)).toBeCloseTo(0.5);
    expect(phaseProgress(transition(s, { type: 'PAUSE' }))).toBeCloseTo(0.5);
    expect(phaseProgress(createSession())).toBe(0);
  });

  it('serialises and restores sessions paused, rejecting stale or invalid payloads', () => {
    const s = transition(inStorm(), { type: 'TICK', deltaMs: 5_000 });
    const restored = restoreSession(serialiseSession(s), T0 + 60_000);
    expect(restored?.phase).toBe('paused');
    expect(restored?.pausedFrom).toBe('storm');
    expect(restored?.elapsedInPhase).toBe(5_000);
    expect(restoreSession(serialiseSession(s), T0 + 3_600_000)).toBeNull();
    expect(restoreSession('{not json', T0)).toBeNull();
    expect(restoreSession(JSON.stringify({ state: { phase: 'nope' } }), T0)).toBeNull();
    expect(restoreSession(null, T0)).toBeNull();
    const ended = transition(transition(s, { type: 'END', now: T0 }), { type: 'DISCARD', now: T0 });
    expect(restoreSession(serialiseSession(ended), T0)).toBeNull();
  });
});
