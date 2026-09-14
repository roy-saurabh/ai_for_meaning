import { z } from 'zod';
import { error, json, readJson } from '@/lib/api/responses';
import { presenceStore } from '@/lib/presence/registry';
import { clientKey, limiter } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('join') }).strict(),
  z.object({ action: z.literal('heartbeat'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('leave'), id: z.uuid() }).strict(),
]);

/** GET: the current count only. */
export function GET(request: Request) {
  const rl = limiter('presence-get', 60, 60_000).check(clientKey(request.headers), Date.now());
  if (!rl.ok) return error(429, 'Too many requests', { 'Retry-After': String(rl.retryAfterSeconds) });
  return json({ count: presenceStore.count(Date.now()) });
}

/** POST: join / heartbeat / leave. No identity, no IP stored; ids are random and expire. */
export async function POST(request: Request) {
  const rl = limiter('presence-post', 30, 60_000).check(clientKey(request.headers), Date.now());
  if (!rl.ok) return error(429, 'Too many requests', { 'Retry-After': String(rl.retryAfterSeconds) });

  const parsed = bodySchema.safeParse(await readJson(request, 512));
  if (!parsed.success) return error(400, 'Invalid request');

  const now = Date.now();
  switch (parsed.data.action) {
    case 'join': {
      const result = presenceStore.join(now);
      if ('error' in result) return error(503, 'The Gathering is full right now');
      return json({ id: result.id, count: presenceStore.count(now) });
    }
    case 'heartbeat': {
      if (!presenceStore.heartbeat(parsed.data.id, now)) return error(404, 'Presence expired');
      return json({ count: presenceStore.count(now) });
    }
    case 'leave': {
      presenceStore.leave(parsed.data.id);
      return json({ count: presenceStore.count(now) });
    }
  }
}
