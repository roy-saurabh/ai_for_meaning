'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import {
  ARRIVAL,
  CLOSE,
  CONSENT,
  FADE_NOTE,
  MEETING,
  PAUSED,
  TRACE_COPY,
} from '@/content/mirror-copy';
import type { GuidancePlan } from '@/lib/mirror/fade';
import type { TraceMode } from '@/lib/mirror/machine';
import {
  CUSTOM_WEATHER_MAX_LENGTH,
  PRESET_WEATHER_IDS,
  WEATHER,
  normaliseCustomWeather,
  type WeatherChoice,
} from '@/lib/mirror/weather';
import { CLOSING_WORD_MAX } from '@/lib/storage/schema';
import type { TraceStatus } from '@/lib/traces/breath-trace';

function useFocusHeading<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [key]);
  return ref;
}

/* ── Arrival ─────────────────────────────────────────────────────────────── */

export function ArrivalStep({ onBegin, onReplayIntro }: { onBegin: () => void; onReplayIntro: () => void }) {
  const heading = useFocusHeading<HTMLHeadingElement>('arrival');
  return (
    <section aria-labelledby="arrival-title" className="fade-in flex flex-col items-center text-center" data-testid="arrival">
      <p className="eyebrow">{ARRIVAL.eyebrow}</p>
      <h1 id="arrival-title" ref={heading} tabIndex={-1} className="display-md mt-4 max-w-[20ch] outline-none">
        Take a moment. You have arrived.
      </h1>
      <p className="lead mt-4 max-w-[40ch]">There is no right way to be here.</p>
      <button type="button" className="pill pill-primary mt-9" onClick={onBegin} data-testid="begin">
        Meet the weather
      </button>
      <button type="button" className="pill pill-ghost pill-sm mt-3" onClick={onReplayIntro}>
        See the introduction again
      </button>
    </section>
  );
}

/* ── Weather ─────────────────────────────────────────────────────────────── */

export function WeatherStep({
  plan,
  initial,
  onSelect,
  onBack,
}: {
  plan: GuidancePlan;
  initial: WeatherChoice | null;
  onSelect: (weather: WeatherChoice) => void;
  onBack: () => void;
}) {
  const heading = useFocusHeading<HTMLHeadingElement>('weather');
  const [customOpen, setCustomOpen] = useState(initial?.kind === 'custom');
  const [custom, setCustom] = useState(initial?.kind === 'custom' ? initial.text : '');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customOpen) inputRef.current?.focus();
  }, [customOpen]);

  const submitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const text = normaliseCustomWeather(custom);
    if (text) onSelect({ kind: 'custom', text });
  };

  return (
    <section aria-labelledby="weather-title" className="fade-in mx-auto flex w-full max-w-[640px] flex-col items-center text-center" data-testid="weather-step">
      <h1 id="weather-title" ref={heading} tabIndex={-1} className="display-md max-w-[20ch] outline-none">
        {plan.explainWeather ? ARRIVAL.title : ARRIVAL.lighter}
      </h1>
      {plan.explainWeather && <p className="mt-4 max-w-[44ch] text-[0.98rem] text-muted">{ARRIVAL.note}</p>}

      <ul className="mt-8 flex flex-wrap justify-center gap-2.5" aria-label="Weather words">
        {PRESET_WEATHER_IDS.map((id) => (
          <li key={id}>
            <button
              type="button"
              className="pill min-w-[6.5rem] font-sans text-[0.98rem] tracking-normal"
              aria-pressed={initial?.kind === 'preset' && initial.id === id}
              onClick={() => onSelect({ kind: 'preset', id })}
              data-testid={`weather-${id}`}
            >
              {WEATHER[id].label}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="pill min-w-[6.5rem] font-sans text-[0.98rem] tracking-normal"
            aria-expanded={customOpen}
            aria-controls={`${inputId}-form`}
            onClick={() => setCustomOpen((v) => !v)}
            data-testid="weather-custom"
          >
            Something else
          </button>
        </li>
      </ul>

      {customOpen && (
        <form id={`${inputId}-form`} onSubmit={submitCustom} className="fade-in mt-6 flex w-full max-w-[420px] flex-col gap-3 sm:flex-row">
          <label htmlFor={inputId} className="sr-only">
            Your own word or short phrase for the weather
          </label>
          <input
            ref={inputRef}
            id={inputId}
            className="field text-center sm:text-left"
            value={custom}
            maxLength={CUSTOM_WEATHER_MAX_LENGTH}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="a word or short phrase"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="done"
            data-testid="weather-custom-input"
          />
          <button type="submit" className="pill pill-primary shrink-0" disabled={!normaliseCustomWeather(custom)}>
            This one
          </button>
        </form>
      )}

      <button type="button" className="pill pill-ghost pill-sm mt-8" onClick={onBack}>
        Back
      </button>
    </section>
  );
}

/* ── Consent (Trace choice) ──────────────────────────────────────────────── */

export function ConsentStep({
  weather,
  breathAvailable,
  traceStatus,
  onStart,
  onBack,
}: {
  weather: WeatherChoice;
  breathAvailable: boolean;
  traceStatus: TraceStatus;
  onStart: (mode: TraceMode) => void;
  onBack: () => void;
}) {
  const heading = useFocusHeading<HTMLHeadingElement>('consent');
  const [mode, setMode] = useState<TraceMode>('none');
  const meeting = weather.kind === 'preset' ? MEETING[weather.id] : MEETING.custom;
  const name = useId();
  const requesting = traceStatus === 'requesting';

  return (
    <section aria-labelledby="consent-title" className="fade-in mx-auto flex w-full max-w-[600px] flex-col" data-testid="consent-step">
      <p className="serif-italic text-center text-[clamp(1.25rem,1rem+1.1vw,1.7rem)] leading-snug">
        {weather.kind === 'custom' && <span className="not-italic text-gold">“{weather.text}.” </span>}
        {meeting}
      </p>
      <p className="sr-only">The art now shows {weather.kind === 'preset' ? WEATHER[weather.id].visualNote : 'a field shaped by your word'}.</p>

      <div className="hairline my-8" />

      <h1 id="consent-title" ref={heading} tabIndex={-1} className="text-center text-[1.5rem] outline-none">
        {CONSENT.title}
      </h1>
      <p className="mx-auto mt-2 max-w-[46ch] text-center text-[0.95rem] text-muted">{CONSENT.note}</p>

      <fieldset className="mt-6 grid gap-3">
        <legend className="sr-only">Sensing</legend>
        <label className={`membrane membrane-sm flex cursor-pointer gap-4 p-5 transition-colors ${mode === 'none' ? 'border-[var(--line-3)]' : ''}`}>
          <input type="radio" name={name} value="none" checked={mode === 'none'} onChange={() => setMode('none')} className="mt-1.5 h-4 w-4 accent-[#F2C14E]" data-testid="trace-none" />
          <span>
            <span className="flex flex-wrap items-center gap-3">
              <span className="font-medium">{TRACE_COPY.none.title}</span>
              <span className="label-mono text-teal">{TRACE_COPY.none.status}</span>
            </span>
            <span className="mt-1 block text-[0.92rem] text-muted">{TRACE_COPY.none.body}</span>
          </span>
        </label>

        {breathAvailable && (
          <label className={`membrane membrane-sm flex cursor-pointer gap-4 p-5 transition-colors ${mode === 'breath' ? 'border-[var(--line-3)]' : ''}`}>
            <input type="radio" name={name} value="breath" checked={mode === 'breath'} onChange={() => setMode('breath')} className="mt-1.5 h-4 w-4 accent-[#F2C14E]" data-testid="trace-breath" />
            <span>
              <span className="flex flex-wrap items-center gap-3">
                <span className="font-medium">{TRACE_COPY.breath.title}</span>
                <span className="label-mono text-amber">{TRACE_COPY.breath.status}</span>
              </span>
              <span className="mt-1 block text-[0.92rem] text-muted">{TRACE_COPY.breath.body}</span>
              <span className="mt-2 block text-[0.85rem] text-faint">Your browser will ask for microphone permission only if you begin with this selected.</span>
            </span>
          </label>
        )}

        <div className="grid gap-2 px-1 pt-1 sm:grid-cols-3">
          {TRACE_COPY.unavailable.map((t) => (
            <p key={t.title} className="flex items-center gap-2 text-[0.82rem] text-faint">
              <span className="status-dot" aria-hidden="true" />
              {t.title} — {t.body.toLowerCase()}
            </p>
          ))}
        </div>
      </fieldset>

      {(traceStatus === 'denied' || traceStatus === 'unavailable' || traceStatus === 'error') && (
        <p role="alert" className="mt-5 rounded-2xl border border-[rgba(232,147,91,0.4)] bg-[rgba(232,147,91,0.07)] p-4 text-[0.92rem] text-[#f3c29f]" data-testid="trace-error">
          {traceStatus === 'denied'
            ? 'Microphone permission was not given, so Breath-trace is off. The Mirror works fully without it — you can begin with no sensing.'
            : traceStatus === 'unavailable'
              ? 'No microphone is available on this device. The Mirror works fully without it.'
              : 'The microphone could not be started. The Mirror works fully without it.'}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" className="pill pill-ghost" onClick={onBack}>
          Choose another word
        </button>
        <button type="button" className="pill pill-primary" disabled={requesting} onClick={() => onStart(mode)} data-testid="start-arc">
          {requesting ? 'Waiting for permission…' : 'Begin'}
        </button>
      </div>
    </section>
  );
}

/* ── Paused ─────────────────────────────────────────────────────────────── */

export function PausedView() {
  const heading = useFocusHeading<HTMLHeadingElement>('paused');
  return (
    <section aria-labelledby="paused-title" className="fade-in text-center" data-testid="paused">
      <h1 id="paused-title" ref={heading} tabIndex={-1} className="display-md outline-none">
        {PAUSED.title}
      </h1>
      <p className="lead mx-auto mt-3 max-w-[36ch]">{PAUSED.note}</p>
    </section>
  );
}

/* ── Close ──────────────────────────────────────────────────────────────── */

export function CloseStep({
  plan,
  showFadeNote,
  saving,
  storageError,
  onSave,
  onDiscard,
}: {
  plan: GuidancePlan;
  showFadeNote: boolean;
  saving: boolean;
  storageError: string | null;
  onSave: (word: string | null) => void;
  onDiscard: () => void;
}) {
  const heading = useFocusHeading<HTMLHeadingElement>('close');
  const [word, setWord] = useState('');
  const wordId = useId();
  return (
    <section aria-labelledby="close-title" className="fade-in mx-auto flex w-full max-w-[520px] flex-col items-center text-center" data-testid="close-step">
      <p className="eyebrow">{CLOSE.eyebrow}</p>
      <h1 id="close-title" ref={heading} tabIndex={-1} className="display-md mt-4 outline-none">
        {CLOSE.title}
      </h1>
      <p className="lead mt-4 max-w-[40ch]">{plan.simpleClose ? CLOSE.simpleLead : CLOSE.lead}</p>
      {showFadeNote && <p className="mt-4 font-mono text-[0.75rem] tracking-[0.04em] text-faint">{FADE_NOTE}</p>}

      <div className="membrane mt-9 w-full p-6 text-left">
        <h2 className="text-[1.3rem]">{CLOSE.saveQuestion}</h2>
        {!plan.simpleClose && <p className="mt-2 text-[0.9rem] text-muted">{CLOSE.saveNote}</p>}
        <label htmlFor={wordId} className="mt-5 block text-[0.9rem] text-muted">
          {CLOSE.wordLabel}
        </label>
        <input
          id={wordId}
          className="field mt-2"
          value={word}
          maxLength={CLOSING_WORD_MAX}
          onChange={(e) => setWord(e.target.value)}
          placeholder={CLOSE.wordPlaceholder}
          autoComplete="off"
          spellCheck={false}
          data-testid="closing-word"
        />
        {storageError && (
          <p role="alert" className="mt-4 text-[0.9rem] text-[#f3c29f]">
            {storageError}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="pill pill-primary flex-1" disabled={saving} onClick={() => onSave(word.trim() || null)} data-testid="save-local">
            Keep locally
          </button>
          <button type="button" className="pill flex-1" disabled={saving} onClick={onDiscard} data-testid="discard">
            Finish without saving
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Ended ──────────────────────────────────────────────────────────────── */

export function EndedStep({
  saved,
  fromGround,
  offerQuiet,
  onAcceptQuiet,
  onDeclineQuiet,
  onRestart,
}: {
  saved: boolean;
  fromGround: boolean;
  offerQuiet: boolean;
  onAcceptQuiet: () => void;
  onDeclineQuiet: () => void;
  onRestart: () => void;
}) {
  const heading = useFocusHeading<HTMLHeadingElement>('ended');
  return (
    <section aria-labelledby="ended-title" className="fade-in mx-auto flex max-w-[520px] flex-col items-center text-center" data-testid="ended">
      <h1 id="ended-title" ref={heading} tabIndex={-1} className="display-md outline-none">
        {fromGround ? 'You can leave it here.' : 'Nothing needed to happen.'}
      </h1>
      <p className="lead mt-4">
        {saved ? 'A trace is kept in your Inner Sky, in this browser only.' : fromGround ? 'Take care of yourself. The Mirror will be here, or not, as you need.' : 'Nothing was saved.'}
      </p>

      {offerQuiet && (
        <div className="membrane mt-8 w-full p-6 text-left" data-testid="quiet-offer">
          <p className="font-display text-[1.25rem]">The mirror can become quieter from here.</p>
          <p className="mt-2 text-[0.92rem] text-muted">
            Quiet entry skips the introduction, uses fewer words, and lets the interface recede sooner. You can change this in Settings.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" className="pill pill-primary pill-sm" onClick={onAcceptQuiet}>
              Yes, quieter
            </button>
            <button type="button" className="pill pill-ghost pill-sm" onClick={onDeclineQuiet}>
              Keep it as it is
            </button>
          </div>
        </div>
      )}

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        {saved && (
          <Link href="/sky" className="pill pill-primary" data-testid="go-sky">
            See your Inner Sky
          </Link>
        )}
        <button type="button" className={`pill ${saved ? '' : 'pill-primary'}`} onClick={onRestart} data-testid="restart">
          Begin again
        </button>
        <Link href="/" className="pill pill-ghost">
          Leave
        </Link>
      </div>
    </section>
  );
}

/* ── Resume offer ───────────────────────────────────────────────────────── */

export function ResumeOffer({ onResume, onFresh }: { onResume: () => void; onFresh: () => void }) {
  const heading = useFocusHeading<HTMLHeadingElement>('resume');
  return (
    <section aria-labelledby="resume-title" className="fade-in text-center" data-testid="resume-offer">
      <h1 id="resume-title" ref={heading} tabIndex={-1} className="display-md outline-none">
        Continue where you were?
      </h1>
      <p className="lead mx-auto mt-3 max-w-[40ch]">Your session was interrupted. It will stay paused until you choose to go on.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" className="pill pill-primary" onClick={onResume}>
          Continue, paused
        </button>
        <button type="button" className="pill" onClick={onFresh}>
          Start fresh
        </button>
      </div>
    </section>
  );
}
