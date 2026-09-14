'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  createSession,
  isTimedPhase,
  restoreSession,
  serialiseSession,
  transition,
  type SessionConfig,
  type SessionEvent,
  type SessionState,
} from '@/lib/mirror/machine';
import { SESSION_RESUME_KEY } from '@/lib/settings/settings';
import { testHooks } from '@/lib/testing/test-mode';

const TICK_MS = 250;

type Action = SessionEvent | { type: '__REPLACE'; state: SessionState };

function reducer(state: SessionState, action: Action): SessionState {
  if (action.type === '__REPLACE') return action.state;
  return transition(state, action);
}

function readResume(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_RESUME_KEY);
  } catch {
    return null;
  }
}

function writeResume(state: SessionState): void {
  try {
    if (state.phase === 'ended' || state.phase === 'arrival' || state.phase === 'weather') {
      window.sessionStorage.removeItem(SESSION_RESUME_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_RESUME_KEY, serialiseSession(state));
    }
  } catch {
    /* sessionStorage unavailable */
  }
}

/**
 * The single session controller. It owns the clock and nothing else: all product logic lives in the
 * pure transition function. Time only advances while a timed phase is active AND the page is visible;
 * hiding the tab pauses the session (so nothing progresses unseen).
 */
export function useMirrorSession(config: Partial<SessionConfig>, options: { hold?: boolean } = {}) {
  const hold = options.hold ?? false;
  const [state, dispatchRaw] = useReducer(reducer, config, (c) => createSession(c));
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatch = useCallback((event: SessionEvent) => dispatchRaw(event), []);

  // Clock: accumulate real elapsed time between ticks (robust to throttled timers).
  useEffect(() => {
    if (!isTimedPhase(state.phase) || hold) return;
    const scale = testHooks()?.timeScale ?? 1;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(2_000, now - last) * scale;
      last = now;
      if (document.visibilityState === 'visible') dispatchRaw({ type: 'TICK', deltaMs: delta });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [state.phase, hold]);

  // Pause when the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') dispatchRaw({ type: 'VISIBILITY_HIDDEN' });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Persist minimal, serialisable state for resumption after an accidental reload (tab-scoped).
  useEffect(() => {
    writeResume(state);
  }, [state]);

  const resumable = useCallback((): SessionState | null => restoreSession(readResume(), Date.now()), []);
  const replaceState = useCallback((next: SessionState) => dispatchRaw({ type: '__REPLACE', state: next }), []);
  const clearResume = useCallback(() => {
    try {
      window.sessionStorage.removeItem(SESSION_RESUME_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { state, dispatch, stateRef, resumable, replaceState, clearResume };
}
