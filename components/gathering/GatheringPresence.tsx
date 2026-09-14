'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PRESENCE_HEARTBEAT_MS } from '@/lib/presence/constants';

type Status = 'idle' | 'joining' | 'present' | 'unavailable';

export function gatheringMessage(count: number, includesYou: boolean): string {
  const others = includesYou ? count - 1 : count;
  if (others <= 0) return includesYou ? 'The space is quiet right now. You are sitting here.' : 'The space is quiet right now.';
  if (includesYou) return others === 1 ? 'One other person is sitting quietly here with you.' : `${others} other people are sitting quietly here with you.`;
  return count === 1 ? '1 person is sitting quietly here right now.' : `${count} people are sitting quietly here right now.`;
}

/**
 * The Gathering: opt-in, anonymous, ephemeral company. Nothing is sent until the person taps
 * "Sit with the Gathering". Counts are real; the server never invents presence.
 */
export function GatheringPresence({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>('idle');
  const [count, setCount] = useState<number | null>(null);
  const idRef = useRef<string | null>(null);

  const call = useCallback(async (body: Record<string, string>) => {
    const res = await fetch('/api/presence', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      keepalive: body.action === 'leave',
    });
    return res;
  }, []);

  const leave = useCallback(() => {
    const id = idRef.current;
    idRef.current = null;
    if (id) void call({ action: 'leave', id }).catch(() => undefined);
  }, [call]);

  const join = useCallback(async () => {
    setStatus('joining');
    try {
      const res = await call({ action: 'join' });
      if (!res.ok) throw new Error('unavailable');
      const data = (await res.json()) as { id: string; count: number };
      idRef.current = data.id;
      setCount(data.count);
      setStatus('present');
    } catch {
      setStatus('unavailable');
    }
  }, [call]);

  useEffect(() => {
    if (status !== 'present') return;
    const beat = async () => {
      const id = idRef.current;
      if (!id || document.visibilityState !== 'visible') return;
      try {
        const res = await call({ action: 'heartbeat', id });
        if (res.status === 404) {
          const rejoin = await call({ action: 'join' });
          if (!rejoin.ok) throw new Error('unavailable');
          const data = (await rejoin.json()) as { id: string; count: number };
          idRef.current = data.id;
          setCount(data.count);
          return;
        }
        if (!res.ok) throw new Error('unavailable');
        const data = (await res.json()) as { count: number };
        setCount(data.count);
      } catch {
        setStatus('unavailable');
      }
    };
    const timer = window.setInterval(beat, PRESENCE_HEARTBEAT_MS);
    const onHide = () => leave();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pagehide', onHide);
    };
  }, [status, call, leave]);

  useEffect(() => leave, [leave]);

  if (status === 'present' && count !== null) {
    return (
      <div className={`flex flex-col items-center gap-2 ${compact ? '' : 'membrane membrane-sm p-5'}`} data-testid="gathering">
        <p className="flex items-center gap-2.5 text-[0.92rem] text-muted" aria-live="polite">
          <span className="status-dot" data-state="on" aria-hidden="true" />
          {gatheringMessage(count, true)}
        </p>
        <button
          type="button"
          className="font-mono text-[0.72rem] tracking-[0.06em] text-faint underline-offset-4 hover:text-muted hover:underline"
          onClick={() => {
            leave();
            setStatus('idle');
            setCount(null);
          }}
        >
          leave the Gathering
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${compact ? '' : 'membrane membrane-sm p-5'}`}>
      <button type="button" className="pill pill-sm pill-ghost" onClick={join} disabled={status === 'joining'} data-testid="gathering-join">
        {status === 'joining' ? 'Joining…' : 'Sit with the Gathering'}
      </button>
      {status === 'unavailable' ? (
        <p className="text-[0.8rem] text-faint">The Gathering is unavailable right now. Nothing else is affected.</p>
      ) : (
        !compact && <p className="text-[0.8rem] text-faint">Anonymous and temporary. No profile, no history.</p>
      )}
    </div>
  );
}
