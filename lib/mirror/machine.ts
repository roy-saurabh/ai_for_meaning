/**
 * The Witnessing Mirror — session finite-state machine.
 *
 * Pure and serialisable. No timers, no DOM, no rendering state. Time advances only through explicit
 * TICK events carrying elapsed active milliseconds, so the machine is deterministic, pause-aware and
 * trivially testable. The controller (useMirrorSession) owns the clock; renderers only read state.
 *
 *   arrival → weather → consent → storm → transition_to_stillness → stillness → song → close → ended
 *                                   ╰──────────── paused (from any timed phase) ────────────╯
 *                                   ╰──────────── grounding (from any phase after arrival) ─╯
 */

import type { WeatherChoice } from './weather';

export const PHASES = [
  'arrival',
  'weather',
  'consent',
  'storm',
  'transition_to_stillness',
  'stillness',
  'song',
  'close',
  'grounding',
  'paused',
  'ended',
] as const;
export type Phase = (typeof PHASES)[number];

export type Movement = 'storm' | 'stillness' | 'song';
export type TimedPhase = 'storm' | 'transition_to_stillness' | 'stillness' | 'song';
export type TraceMode = 'none' | 'breath';
export type GuidanceMode = 'full' | 'quiet';
export type SessionLength = 'short' | 'standard' | 'long';
export type SaveDecision = 'pending' | 'saved' | 'discarded';

export const TIMED_PHASES: readonly TimedPhase[] = [
  'storm',
  'transition_to_stillness',
  'stillness',
  'song',
];

export interface PhaseDurations {
  storm: number;
  transition_to_stillness: number;
  stillness: number;
  song: number;
}

export const SESSION_DURATIONS: Record<SessionLength, PhaseDurations> = {
  short: { storm: 45_000, transition_to_stillness: 10_000, stillness: 90_000, song: 40_000 },
  standard: { storm: 75_000, transition_to_stillness: 12_000, stillness: 180_000, song: 60_000 },
  long: { storm: 120_000, transition_to_stillness: 15_000, stillness: 360_000, song: 90_000 },
};

export interface SessionConfig {
  length: SessionLength;
  guidance: GuidanceMode;
  songEnabled: boolean;
}

export interface SessionState {
  phase: Phase;
  config: SessionConfig;
  durations: PhaseDurations;
  weather: WeatherChoice | null;
  traceMode: TraceMode;
  /** Active (unpaused) milliseconds spent in the current timed phase. */
  elapsedInPhase: number;
  /** Total active milliseconds across the arc. */
  activeMs: number;
  /** Phase to return to on RESUME. */
  pausedFrom: TimedPhase | null;
  /** Phase the person grounded from (for the record only; Ground never resumes escalation). */
  groundedFrom: Phase | null;
  movementsVisited: Movement[];
  movementsSkipped: Movement[];
  promptsShown: number;
  groundUsed: boolean;
  startedAt: number | null;
  endedAt: number | null;
  closingWord: string | null;
  saveDecision: SaveDecision;
}

export type SessionEvent =
  | { type: 'BEGIN' }
  | { type: 'SELECT_WEATHER'; weather: WeatherChoice }
  | { type: 'START_ARC'; traceMode: TraceMode; now: number }
  | { type: 'TICK'; deltaMs: number }
  | { type: 'SKIP' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'VISIBILITY_HIDDEN' }
  | { type: 'GROUND' }
  | { type: 'STAY_GROUNDED' }
  | { type: 'END'; now: number }
  | { type: 'PROMPT_SHOWN' }
  | { type: 'SET_CLOSING_WORD'; word: string | null }
  | { type: 'SAVE'; now: number }
  | { type: 'DISCARD'; now: number }
  | { type: 'RESTART'; config?: Partial<SessionConfig> }
  | { type: 'BACK' };

export const DEFAULT_CONFIG: SessionConfig = {
  length: 'standard',
  guidance: 'full',
  songEnabled: true,
};

export function createSession(config: Partial<SessionConfig> = {}): SessionState {
  const merged: SessionConfig = { ...DEFAULT_CONFIG, ...config };
  return {
    phase: 'arrival',
    config: merged,
    durations: SESSION_DURATIONS[merged.length],
    weather: null,
    traceMode: 'none',
    elapsedInPhase: 0,
    activeMs: 0,
    pausedFrom: null,
    groundedFrom: null,
    movementsVisited: [],
    movementsSkipped: [],
    promptsShown: 0,
    groundUsed: false,
    startedAt: null,
    endedAt: null,
    closingWord: null,
    saveDecision: 'pending',
  };
}

export function isTimedPhase(phase: Phase): phase is TimedPhase {
  return (TIMED_PHASES as readonly string[]).includes(phase);
}

/** Phases in which Ground me must be immediately available. */
export function canGround(phase: Phase): boolean {
  return phase !== 'arrival' && phase !== 'grounding' && phase !== 'ended' && phase !== 'close';
}

export function hasArcStarted(state: SessionState): boolean {
  return state.startedAt !== null;
}

function visit(list: Movement[], movement: Movement): Movement[] {
  return list.includes(movement) ? list : [...list, movement];
}

function movementOf(phase: TimedPhase): Movement | null {
  if (phase === 'storm') return 'storm';
  if (phase === 'stillness') return 'stillness';
  if (phase === 'song') return 'song';
  return null;
}

function enterPhase(state: SessionState, phase: Phase): SessionState {
  const next: SessionState = { ...state, phase, elapsedInPhase: 0 };
  if (phase === 'storm' || phase === 'stillness' || phase === 'song') {
    next.movementsVisited = visit(state.movementsVisited, phase);
  }
  return next;
}

/** The phase that naturally follows a timed phase. */
export function nextAfter(phase: TimedPhase, config: SessionConfig): Phase {
  switch (phase) {
    case 'storm':
      return 'transition_to_stillness';
    case 'transition_to_stillness':
      return 'stillness';
    case 'stillness':
      return config.songEnabled ? 'song' : 'close';
    case 'song':
      return 'close';
  }
}

function finish(state: SessionState, now: number, decision: SaveDecision): SessionState {
  return { ...state, phase: 'ended', endedAt: state.endedAt ?? now, saveDecision: decision };
}

export function transition(state: SessionState, event: SessionEvent): SessionState {
  switch (event.type) {
    case 'BEGIN':
      return state.phase === 'arrival' ? enterPhase(state, 'weather') : state;

    case 'SELECT_WEATHER':
      if (state.phase !== 'weather') return state;
      return enterPhase({ ...state, weather: event.weather }, 'consent');

    case 'BACK':
      if (state.phase === 'consent') return enterPhase(state, 'weather');
      if (state.phase === 'weather') return enterPhase(state, 'arrival');
      return state;

    case 'START_ARC':
      if (state.phase !== 'consent' || state.weather === null) return state;
      return enterPhase({ ...state, traceMode: event.traceMode, startedAt: event.now }, 'storm');

    case 'TICK': {
      if (!isTimedPhase(state.phase) || event.deltaMs <= 0) return state;
      const phase = state.phase;
      const elapsed = state.elapsedInPhase + event.deltaMs;
      const activeMs = state.activeMs + event.deltaMs;
      const duration = state.durations[phase];
      if (elapsed < duration) return { ...state, elapsedInPhase: elapsed, activeMs };
      // Carry overflow into the next phase so large ticks (e.g. a slow frame) stay deterministic.
      const overflow = elapsed - duration;
      const advanced = enterPhase({ ...state, activeMs: activeMs - overflow }, nextAfter(phase, state.config));
      return overflow > 0 && isTimedPhase(advanced.phase)
        ? transition(advanced, { type: 'TICK', deltaMs: overflow })
        : advanced;
    }

    case 'SKIP': {
      if (!isTimedPhase(state.phase)) return state;
      const movement = movementOf(state.phase);
      const skipped =
        movement && !state.movementsSkipped.includes(movement)
          ? [...state.movementsSkipped, movement]
          : state.movementsSkipped;
      // Skipping Storm goes straight to Stillness; the transition exists only as a gentle hand-off.
      const target =
        state.phase === 'storm' ? 'stillness' : nextAfter(state.phase, state.config);
      return enterPhase({ ...state, movementsSkipped: skipped }, target);
    }

    case 'PAUSE':
    case 'VISIBILITY_HIDDEN':
      if (!isTimedPhase(state.phase)) return state;
      return { ...state, phase: 'paused', pausedFrom: state.phase };

    case 'RESUME':
      if (state.phase !== 'paused' || state.pausedFrom === null) return state;
      return { ...state, phase: state.pausedFrom, pausedFrom: null };

    case 'GROUND':
      if (!canGround(state.phase)) return state;
      return {
        ...state,
        phase: 'grounding',
        groundedFrom: state.phase === 'paused' ? state.pausedFrom : state.phase,
        pausedFrom: null,
        elapsedInPhase: 0,
        groundUsed: true,
      };

    case 'STAY_GROUNDED':
      return state;

    case 'END':
      if (state.phase === 'ended') return state;
      // Ending from Ground never asks the person to make decisions about saving.
      if (state.phase === 'grounding' || !hasArcStarted(state)) {
        return finish(state, event.now, 'discarded');
      }
      if (state.phase === 'close') return finish(state, event.now, 'discarded');
      return { ...state, phase: 'close', pausedFrom: null, elapsedInPhase: 0, endedAt: event.now };

    case 'PROMPT_SHOWN':
      return { ...state, promptsShown: state.promptsShown + 1 };

    case 'SET_CLOSING_WORD':
      return { ...state, closingWord: event.word };

    case 'SAVE':
      return state.phase === 'close' ? finish(state, event.now, 'saved') : state;

    case 'DISCARD':
      return state.phase === 'close' ? finish(state, event.now, 'discarded') : state;

    case 'RESTART': {
      const fresh = createSession({ ...state.config, ...event.config });
      return enterPhase(fresh, 'weather');
    }
  }
}

/** Replays a list of events. Useful for tests and resuming. */
export function replay(events: SessionEvent[], initial = createSession()): SessionState {
  return events.reduce(transition, initial);
}

/** 0..1 progress through the current timed phase (0 for untimed phases). */
export function phaseProgress(state: SessionState): number {
  const phase = state.phase === 'paused' ? state.pausedFrom : state.phase;
  if (!phase || !isTimedPhase(phase)) return 0;
  return Math.min(1, state.elapsedInPhase / state.durations[phase]);
}

/** The phase that visuals should represent (paused keeps the underlying scene, frozen). */
export function visualPhase(state: SessionState): Phase {
  return state.phase === 'paused' && state.pausedFrom ? state.pausedFrom : state.phase;
}

/** Serialise for sessionStorage (resume after accidental reload). */
export function serialiseSession(state: SessionState): string {
  return JSON.stringify({ v: 1, state });
}

/**
 * Restore a serialised session. Returns null when the payload is invalid or stale. A resumed session
 * always comes back paused so nothing starts moving without the person choosing to continue.
 */
export function restoreSession(raw: string | null, now: number, maxAgeMs = 30 * 60_000): SessionState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('state' in parsed)) return null;
    const state = (parsed as { state: SessionState }).state;
    if (!state || typeof state.phase !== 'string' || !(PHASES as readonly string[]).includes(state.phase)) {
      return null;
    }
    if (state.phase === 'ended' || state.phase === 'arrival') return null;
    if (state.startedAt !== null && now - state.startedAt > maxAgeMs) return null;
    if (isTimedPhase(state.phase)) return { ...state, phase: 'paused', pausedFrom: state.phase };
    return state;
  } catch {
    return null;
  }
}
