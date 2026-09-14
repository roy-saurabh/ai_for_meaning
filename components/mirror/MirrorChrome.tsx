'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import type { Phase, SessionState } from '@/lib/mirror/machine';
import { OrbMark } from '@/components/brand/Wordmark';

export const PHASE_LABEL: Record<Phase, string> = {
  arrival: 'Arrival',
  weather: 'Inner weather',
  consent: 'Before we begin',
  storm: 'Storm · release',
  transition_to_stillness: 'Settling',
  stillness: 'Stillness · witnessing',
  song: 'Song · aliveness',
  close: 'Close',
  grounding: 'Ground',
  paused: 'Paused',
  ended: 'Rest',
};

const noopSubscribe = () => () => undefined;

interface TopBarProps {
  phase: Phase | 'onboarding';
  receded: boolean;
  canGround: boolean;
  onGround: () => void;
  sound: { supported: boolean; on: boolean; onToggle: () => void; hidden?: boolean };
  traceActive: boolean;
}

export function MirrorTopBar({ phase, receded, canGround, onGround, sound, traceActive }: TopBarProps) {
  const label = phase === 'onboarding' ? 'Welcome' : PHASE_LABEL[phase];
  // Client-only capability, read without a hydration mismatch.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return (
    <header
      className={`relative z-20 flex items-center justify-between gap-3 px-4 pt-safe transition-opacity duration-[1200ms] sm:px-6 ${
        receded ? 'opacity-40 focus-within:opacity-100 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <Link
        href="/"
        className={`flex min-h-12 items-center gap-2 rounded-full pr-3 transition-opacity ${receded ? 'opacity-0 focus-visible:opacity-100' : ''}`}
        aria-label="Leave the Mirror and go to the AI for Meaning home page"
      >
        <OrbMark size={20} />
        <span className="hidden font-display text-[1.02rem] sm:inline">
          AI for <span className="italic text-gold/95">Meaning</span>
        </span>
      </Link>

      <p className={`label-mono hidden truncate text-center text-teal md:block ${receded ? 'opacity-0' : ''}`} data-testid="phase-label">
        {label}
      </p>

      <div className="flex items-center gap-2">
        {traceActive && (
          <span className="label-mono flex items-center gap-2 rounded-full border border-[var(--line-2)] px-3 py-2 normal-case tracking-[0.06em] text-ink">
            <span className="status-dot" data-state="on" aria-hidden="true" />
            <span>Breath-trace on</span>
          </span>
        )}
        {hydrated && sound.supported && !sound.hidden && (
          <button
            type="button"
            className="icon-btn"
            aria-pressed={sound.on}
            aria-label={sound.on ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on'}
            onClick={sound.onToggle}
            data-testid="sound-toggle"
          >
            {sound.on ? (
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 8h3l4-3v10l-4-3H4z" fill="currentColor" />
                <path d="M13.5 7.5a3.5 3.5 0 010 5M15.5 5.5a6.3 6.3 0 010 9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 8h3l4-3v10l-4-3H4z" fill="currentColor" opacity="0.7" />
                <path d="M14 8l4 4M18 8l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
        {canGround && (
          <button type="button" className="pill pill-ground pill-sm" onClick={onGround} data-testid="ground-me">
            Ground me
          </button>
        )}
      </div>
    </header>
  );
}

interface ArcControlsProps {
  state: SessionState;
  receded: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onEnd: () => void;
}

const SKIP_LABEL: Partial<Record<Phase, string>> = {
  storm: 'Skip Storm',
  transition_to_stillness: 'Go to Stillness',
  stillness: 'Skip Stillness',
  song: 'Finish Song',
};

export function ArcControls({ state, receded, onPause, onResume, onSkip, onEnd }: ArcControlsProps) {
  const paused = state.phase === 'paused';
  const underlying = paused ? state.pausedFrom : state.phase;
  const skipLabel = underlying ? SKIP_LABEL[underlying] : undefined;
  return (
    <nav
      aria-label="Session controls"
      className={`relative z-20 flex flex-wrap items-center justify-center gap-2 px-4 pb-safe pt-3 transition-opacity duration-[1200ms] ${
        receded ? 'opacity-0 focus-within:opacity-100 hover:opacity-100' : 'opacity-100'
      }`}
      data-receded={receded}
    >
      {paused ? (
        <button type="button" className="pill pill-primary" onClick={onResume} data-testid="resume">
          Resume
        </button>
      ) : (
        <button type="button" className="pill" onClick={onPause} data-testid="pause">
          Pause
        </button>
      )}
      {!paused && skipLabel && (
        <button type="button" className="pill" onClick={onSkip} data-testid="skip">
          {skipLabel}
        </button>
      )}
      <button type="button" className="pill pill-ghost" onClick={onEnd} data-testid="end">
        End session
      </button>
    </nav>
  );
}

/** A single, sparing polite announcement region for phase changes. */
export function Announcer({ message }: { message: string }) {
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true" data-testid="announcer">
      {message}
    </p>
  );
}
