'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useRef, useState } from 'react';
import { SONG_PROMPTS, STILLNESS_LINES, STORM_LINES, TRANSITION_LINES, lineAt } from '@/content/mirror-copy';
import { requestReflection } from '@/lib/companion/client';
import type { CompanionOutput } from '@/lib/companion/types';
import type { GuidancePlan } from '@/lib/mirror/fade';
import { phaseProgress, visualPhase, type SessionState } from '@/lib/mirror/machine';
import { weatherLabel } from '@/lib/mirror/weather';
import { checkText } from '@/lib/safety/gate';
import { GatheringPresence } from '@/components/gathering/GatheringPresence';

const ScribbleSurface = dynamic(() => import('@/components/generative/ScribbleSurface').then((m) => m.ScribbleSurface), { ssr: false });

/**
 * Which guidance line (if any) should show right now. Deterministic from session state, so tests and
 * resumed sessions agree. Returns the line index and text, or null when the interface is silent.
 */
export function guidanceLine(state: SessionState, plan: GuidancePlan): { key: string; text: string } | null {
  const phase = visualPhase(state);
  const elapsed = state.elapsedInPhase;
  const hold = plan.lineHoldMs;
  switch (phase) {
    case 'storm': {
      const index = Math.floor(elapsed / hold);
      return { key: `storm-${index}`, text: lineAt(STORM_LINES, index) };
    }
    case 'transition_to_stillness':
      return { key: 'transition', text: TRANSITION_LINES[0] ?? '' };
    case 'stillness': {
      if (!plan.stillnessLines) return null;
      if (elapsed < hold) return { key: 'still-0', text: STILLNESS_LINES[0] ?? '' };
      if (elapsed > hold * 3 && elapsed < hold * 4) return { key: 'still-1', text: STILLNESS_LINES[1] ?? '' };
      return null; // then silence — the interface fades
    }
    default:
      return null;
  }
}

interface ArcViewProps {
  state: SessionState;
  plan: GuidancePlan;
  cloudCompanion: boolean;
  onHoldChange: (hold: boolean) => void;
  onHighRisk: () => void;
  onContinue: () => void;
}

export function ArcView({ state, plan, cloudCompanion, onHoldChange, onHighRisk, onContinue }: ArcViewProps) {
  const phase = visualPhase(state);
  const line = guidanceLine(state, plan);
  const [scribble, setScribble] = useState(false);

  // Leaving Storm closes the scribble surface.
  const [lastPhase, setLastPhase] = useState(phase);
  if (lastPhase !== phase) {
    setLastPhase(phase);
    if (phase !== 'storm') setScribble(false);
  }

  return (
    <section aria-label={phase === 'song' ? 'Song' : phase === 'storm' ? 'Storm' : 'Stillness'} className="flex w-full flex-1 flex-col items-center justify-end pb-4 text-center" data-testid={`arc-${phase}`}>
      {phase === 'storm' && scribble && (
        <div className="fixed inset-0 z-10">
          <ScribbleSurface className="h-full w-full" label="Storm scribble surface" />
        </div>
      )}

      <div className="relative z-20 flex min-h-[9rem] w-full flex-col items-center justify-end">
        {phase === 'song' ? (
          <SongPrompt state={state} plan={plan} cloudCompanion={cloudCompanion} onHoldChange={onHoldChange} onHighRisk={onHighRisk} onContinue={onContinue} />
        ) : (
          <p key={line?.key ?? 'silent'} className={`serif-italic max-w-[24ch] text-[clamp(1.35rem,1.05rem+1.4vw,2.1rem)] leading-snug ${line ? 'fade-in' : 'opacity-0'}`} data-testid="guidance-line">
            {line?.text ?? ''}
          </p>
        )}

        {phase === 'storm' && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" className="pill pill-sm" aria-pressed={scribble} onClick={() => setScribble((v) => !v)} data-testid="toggle-scribble">
              {scribble ? 'Put the scribble away' : 'Scribble instead'}
            </button>
          </div>
        )}

        {phase === 'stillness' && (
          <div className={`mt-6 transition-opacity duration-1000 ${phaseProgress(state) > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
            <GatheringPresence compact />
          </div>
        )}
      </div>
      <p className="sr-only">Weather: {weatherLabel(state.weather)}.</p>
    </section>
  );
}

function SongPrompt({
  state,
  plan,
  cloudCompanion,
  onHoldChange,
  onHighRisk,
  onContinue,
}: Omit<ArcViewProps, 'state'> & { state: SessionState }) {
  const [text, setText] = useState('');
  const [reflection, setReflection] = useState<CompanionOutput | null>(null);
  const [pending, setPending] = useState(false);
  const inputId = useId();
  const promptIndex = state.movementsVisited.length + (state.weather?.kind === 'custom' ? 1 : 0);
  const prompt = lineAt(SONG_PROMPTS, promptIndex);
  const holdRef = useRef(onHoldChange);
  useEffect(() => {
    holdRef.current = onHoldChange;
  });
  useEffect(() => () => holdRef.current(false), []);

  if (!plan.songPrompt) {
    return (
      <div className="flex flex-col items-center">
        <p className="serif-italic max-w-[24ch] text-[clamp(1.35rem,1.05rem+1.4vw,2.1rem)] leading-snug fade-in">Let the field widen.</p>
        <button type="button" className="pill pill-sm mt-6" onClick={onContinue}>
          Continue
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const words = text.trim();
    if (!words) return;
    if (checkText(words).level === 'high-risk') {
      onHighRisk();
      return;
    }
    setPending(true);
    const out = await requestReflection({ stage: 'song', userText: words.slice(0, 280) }, cloudCompanion);
    setPending(false);
    if (out.kind === 'ground') {
      onHighRisk();
      return;
    }
    setReflection(out);
  };

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center">
      <p className="serif-italic max-w-[24ch] text-[clamp(1.35rem,1.05rem+1.4vw,2.1rem)] leading-snug fade-in" data-testid="song-prompt">
        {prompt}
      </p>
      {reflection ? (
        <div className="fade-in mt-6 flex flex-col items-center" data-testid="song-reflection">
          <p className="max-w-[40ch] text-[1.02rem] text-muted" aria-live="polite">
            {reflection.text}
          </p>
          <button type="button" className="pill pill-sm mt-5" onClick={onContinue}>
            Continue
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
          <label htmlFor={inputId} className="sr-only">
            Optional: a word or phrase for what feels alive. It is not saved.
          </label>
          <input
            id={inputId}
            className="field text-center sm:text-left"
            value={text}
            maxLength={280}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => onHoldChange(true)}
            onBlur={() => onHoldChange(text.trim().length > 0)}
            placeholder="optional — not saved"
            autoComplete="off"
            data-testid="song-input"
          />
          <button type="submit" className="pill shrink-0" disabled={pending || !text.trim()}>
            {pending ? '…' : 'Reflect'}
          </button>
        </form>
      )}
    </div>
  );
}
