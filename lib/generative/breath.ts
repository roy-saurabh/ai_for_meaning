/**
 * Visual breathing rhythm.
 *
 * This is a pacing option for the art — an optional, adjustable visual rhythm — not a physiological
 * target or a treatment. The default of six cycles per minute is simply a slow, comfortable-looking
 * pace. When no Trace is connected, nothing here claims to reflect the person's actual breath.
 */

export const DEFAULT_CYCLES_PER_MINUTE = 6;
export const MIN_CYCLES_PER_MINUTE = 3;
export const MAX_CYCLES_PER_MINUTE = 12;

/** Proportion of each cycle spent expanding. Slightly shorter expansion reads as a gentle release. */
const EXPAND_FRACTION = 0.42;

/**
 * Expansion envelope in [0, 1] at time t (seconds). Smooth (C1-continuous) raised-cosine segments with
 * an asymmetric expand/release, so the orb swells and settles rather than bouncing.
 */
export function breathEnvelope(t: number, cyclesPerMinute = DEFAULT_CYCLES_PER_MINUTE): number {
  const cpm = Math.min(MAX_CYCLES_PER_MINUTE, Math.max(MIN_CYCLES_PER_MINUTE, cyclesPerMinute));
  const period = 60 / cpm;
  const p = (((t % period) + period) % period) / period;
  if (p < EXPAND_FRACTION) {
    const u = p / EXPAND_FRACTION;
    return 0.5 - 0.5 * Math.cos(Math.PI * u);
  }
  const u = (p - EXPAND_FRACTION) / (1 - EXPAND_FRACTION);
  return 0.5 + 0.5 * Math.cos(Math.PI * u);
}

/** Whether the envelope is currently expanding (for the optional text equivalent). */
export function isExpanding(t: number, cyclesPerMinute = DEFAULT_CYCLES_PER_MINUTE): boolean {
  const period = 60 / cyclesPerMinute;
  const p = (((t % period) + period) % period) / period;
  return p < EXPAND_FRACTION;
}
