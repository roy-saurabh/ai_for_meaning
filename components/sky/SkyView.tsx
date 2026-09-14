'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ATTUNEMENTS } from '@/content/lexicon';
import { WEATHER } from '@/lib/mirror/weather';
import { filterTraces, generateSky, type SkyStar, type SkyWindow } from '@/lib/sky/generate';
import { durationMinutes, type SessionTrace } from '@/lib/storage/schema';
import { StorageUnavailableError, deleteTrace, listTraces } from '@/lib/storage/traces';

const SkyCanvas = dynamic(() => import('./SkyCanvas').then((m) => m.SkyCanvas), { ssr: false });

const WINDOWS: Array<{ id: SkyWindow; label: string }> = [
  { id: '14d', label: '14 days' },
  { id: '30d', label: '30 days' },
  { id: 'all', label: 'All traces' },
];

const MOVEMENT_LABEL = { storm: 'Storm', stillness: 'Stillness', song: 'Song' } as const;

/** "12 Sep · Stillness · 4 min · one prompt" — facts only. */
export function starDescription(trace: SessionTrace): string {
  const date = new Date(trace.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const movements = trace.movementsVisited.length ? trace.movementsVisited.map((m) => MOVEMENT_LABEL[m]).join(' → ') : 'Arrival';
  const prompts = trace.promptsShown === 0 ? 'no prompts' : trace.promptsShown === 1 ? 'one prompt' : `${trace.promptsShown} prompts`;
  return `${date} · ${movements} · ${durationMinutes(trace)} min · ${prompts}`;
}

type LoadState = { status: 'loading' } | { status: 'ready'; traces: SessionTrace[] } | { status: 'error'; message: string };

export function SkyView() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [window, setWindow] = useState<SkyWindow>('all');
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      setState({ status: 'ready', traces: await listTraces() });
    } catch (err) {
      const reason = err instanceof StorageUnavailableError ? err.reason : 'unknown';
      setState({
        status: 'error',
        message:
          reason === 'unsupported' || reason === 'blocked'
            ? 'This browser is not allowing local storage (private browsing can do this), so there is no Inner Sky to show.'
            : 'The Inner Sky could not be read from this browser just now.',
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading from IndexedDB (external system)
    void load();
    const onErased = () => void load();
    globalThis.addEventListener('afm:erased', onErased);
    return () => globalThis.removeEventListener('afm:erased', onErased);
  }, [load]);

  const traces = useMemo(() => (state.status === 'ready' ? filterTraces(state.traces, window, now) : []), [state, window, now]);
  const sky = useMemo(() => generateSky(traces), [traces]);
  const byId = useMemo(() => new Map(traces.map((t) => [t.id, t])), [traces]);
  const describe = useCallback((star: SkyStar) => {
    const trace = byId.get(star.traceId);
    return trace ? starDescription(trace) : '';
  }, [byId]);

  if (state.status === 'loading') {
    return <div className="membrane membrane-lg h-[380px]" aria-busy="true" aria-label="Loading your Inner Sky" />;
  }

  if (state.status === 'error') {
    return (
      <div className="membrane membrane-lg p-8 text-center" role="status">
        <p className="text-muted">{state.message}</p>
      </div>
    );
  }

  const total = state.traces.length;

  if (total === 0) {
    return (
      <div className="membrane membrane-lg flex min-h-[380px] flex-col items-center justify-center p-10 text-center" data-testid="sky-empty">
        <p className="font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.3rem)] leading-tight">Nothing here yet.</p>
        <p className="serif-italic mt-2 text-[1.2rem] text-muted">A sky does not need to be filled.</p>
        <Link href="/mirror" className="pill mt-9">
          Enter the Mirror
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div role="radiogroup" aria-label="Time window" className="flex gap-1 rounded-full border border-[var(--line)] p-1">
          {WINDOWS.map((w) => (
            <button
              key={w.id}
              type="button"
              role="radio"
              aria-checked={window === w.id}
              className={`min-h-10 rounded-full px-4 font-mono text-[0.75rem] tracking-[0.04em] transition-colors ${
                window === w.id ? 'bg-ink text-night' : 'text-muted hover:text-ink'
              }`}
              onClick={() => setWindow(w.id)}
            >
              {w.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[0.72rem] tracking-[0.04em] text-faint" data-testid="sky-count">
          {traces.length === 1 ? 'one trace' : `${traces.length} traces`} {window !== 'all' ? `in the last ${window === '14d' ? '14' : '30'} days` : 'kept in this browser'}
        </p>
      </div>

      <div className="membrane membrane-lg overflow-hidden" style={{ '--membrane-glow': 'rgba(92,123,200,0.10)' } as React.CSSProperties}>
        {traces.length === 0 ? (
          <div className="flex h-[380px] items-center justify-center p-8 text-center">
            <p className="serif-italic text-[1.2rem] text-muted">No traces in this window. The sky is still here.</p>
          </div>
        ) : (
          <SkyCanvas
            sky={sky}
            describe={describe}
            interactive
            className="h-[min(62vh,520px)] min-h-[320px] w-full"
            label="Your traces as stars. Each star describes one kept session."
          />
        )}
        <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--line)] px-5 py-4" aria-label="Families of light">
          {ATTUNEMENTS.map((a) => (
            <li key={a.id} className="flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.06em] text-muted">
              <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: a.color }} />
              {a.name}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 max-w-[70ch] text-[0.88rem] leading-relaxed text-faint">
        The sky is a reflective picture of practice — which movements a session visited, and any closing word you chose. It is
        not a measurement of presence, meaning or anything else about you.
      </p>

      <details className="mt-10 group">
        <summary className="pill cursor-pointer list-none">Traces as a list</summary>
        <ol className="mt-5 divide-y divide-[var(--line)] border-y border-[var(--line)]" data-testid="trace-list">
          {[...traces].reverse().map((trace) => (
            <li key={trace.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-mono text-[0.8rem] tracking-[0.03em] text-ink">{starDescription(trace)}</p>
                <p className="mt-1 text-[0.85rem] text-muted">
                  Weather: {trace.weather === 'custom' ? trace.customWeatherText ?? 'your own word' : WEATHER[trace.weather].label}
                  {trace.closingWord ? ` · carried word: “${trace.closingWord}”` : ''}
                </p>
              </div>
              <button
                type="button"
                className="pill pill-ghost pill-sm"
                onClick={async () => {
                  await deleteTrace(trace.id);
                  await load();
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[0.85rem] text-faint">
          Export or erase everything in <Link href="/settings" className="link-quiet">Settings</Link>.
        </p>
      </details>
    </div>
  );
}
