/**
 * The Gathering — ephemeral presence.
 *
 * Holds only random session ids and expiry times, in memory. No IP addresses, no identities, no
 * history. A presence that stops sending heartbeats disappears after the TTL. The PresenceStore
 * interface is what API routes depend on, so this can move to Redis (SET with EX) without changing
 * product semantics.
 */

import { PRESENCE_MAX_ENTRIES, PRESENCE_TTL_MS } from './constants';

export { PRESENCE_HEARTBEAT_MS, PRESENCE_MAX_ENTRIES, PRESENCE_TTL_MS } from './constants';

export interface PresenceStore {
  join(now: number): { id: string } | { error: 'full' };
  heartbeat(id: string, now: number): boolean;
  leave(id: string): void;
  count(now: number): number;
}

export class InMemoryPresenceStore implements PresenceStore {
  private readonly entries = new Map<string, number>();

  constructor(
    private readonly ttlMs = PRESENCE_TTL_MS,
    private readonly maxEntries = PRESENCE_MAX_ENTRIES,
    private readonly makeId: () => string = () => crypto.randomUUID(),
  ) {}

  private sweep(now: number): void {
    for (const [id, expires] of this.entries) {
      if (expires <= now) this.entries.delete(id);
    }
  }

  join(now: number): { id: string } | { error: 'full' } {
    this.sweep(now);
    if (this.entries.size >= this.maxEntries) return { error: 'full' };
    const id = this.makeId();
    this.entries.set(id, now + this.ttlMs);
    return { id };
  }

  heartbeat(id: string, now: number): boolean {
    const expires = this.entries.get(id);
    if (expires === undefined || expires <= now) {
      this.entries.delete(id);
      return false;
    }
    this.entries.set(id, now + this.ttlMs);
    return true;
  }

  leave(id: string): void {
    this.entries.delete(id);
  }

  count(now: number): number {
    this.sweep(now);
    return this.entries.size;
  }
}

// One store per server process (a single Node process on the VPS). Survives hot reload in dev.
const globalForPresence = globalThis as unknown as { __afmPresence?: PresenceStore };
export const presenceStore: PresenceStore = (globalForPresence.__afmPresence ??= new InMemoryPresenceStore());
