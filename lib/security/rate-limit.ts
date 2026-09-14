/**
 * Minimal in-memory fixed-window rate limiter for the small API surface.
 *
 * The client key is a salted, truncated SHA-256 of the forwarded address, held only in process memory
 * for at most one window, never logged or persisted. The salt is random per process, so keys cannot
 * be linked across restarts.
 */

import { createHash, randomBytes } from 'node:crypto';

const SALT = randomBytes(16).toString('hex');

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class FixedWindowLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 20_000,
  ) {}

  check(key: string, now: number): RateLimitResult {
    let entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (this.hits.size >= this.maxKeys) this.prune(now);
      entry = { count: 0, resetAt: now + this.windowMs };
      this.hits.set(key, entry);
    }
    entry.count += 1;
    const ok = entry.count <= this.limit;
    return {
      ok,
      remaining: Math.max(0, this.limit - entry.count),
      retryAfterSeconds: ok ? 0 : Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  private prune(now: number): void {
    for (const [k, v] of this.hits) if (v.resetAt <= now) this.hits.delete(k);
    // If still full (sustained flood), drop the oldest half rather than grow without bound.
    if (this.hits.size >= this.maxKeys) {
      let i = 0;
      for (const k of this.hits.keys()) {
        if (i++ > this.maxKeys / 2) break;
        this.hits.delete(k);
      }
    }
  }
}

export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-real-ip') ?? headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  return createHash('sha256').update(SALT).update(forwarded.trim()).digest('hex').slice(0, 16);
}

const globalForLimits = globalThis as unknown as { __afmLimiters?: Map<string, FixedWindowLimiter> };
const limiters = (globalForLimits.__afmLimiters ??= new Map());

export function limiter(name: string, limit: number, windowMs: number): FixedWindowLimiter {
  let l = limiters.get(name);
  if (!l) {
    l = new FixedWindowLimiter(limit, windowMs);
    limiters.set(name, l);
  }
  return l;
}
