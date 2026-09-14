/**
 * The Witness-Companion contract.
 *
 * A companion may do exactly four things: reflect the person's own words back, ask one open question,
 * offer a brief contemplative pointer, or hand over to the deterministic Ground pathway. It never
 * diagnoses, prescribes, interprets, claims to know what someone feels, or encourages dependence.
 */

export const COMPANION_STAGES = ['weather', 'stillness', 'song', 'close'] as const;
export type CompanionStage = (typeof COMPANION_STAGES)[number];

export const COMPANION_KINDS = ['reflection', 'question', 'pointer', 'ground'] as const;
export type CompanionKind = (typeof COMPANION_KINDS)[number];

export const COMPANION_TEXT_MAX = 200;
export const COMPANION_USER_TEXT_MAX = 280;

export interface CompanionInput {
  stage: CompanionStage;
  weather?: string;
  movement?: 'storm' | 'stillness' | 'song';
  userText?: string;
}

/**
 * Dependency-free validation for the browser (keeps Zod — which feature-detects eval — out of client
 * bundles under the strict CSP). The server validates again with the Zod schema in ./schema.ts.
 */
export function isCompanionInput(value: unknown): value is CompanionInput {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const allowed = new Set(['stage', 'weather', 'movement', 'userText']);
  if (Object.keys(v).some((k) => !allowed.has(k))) return false;
  if (!(COMPANION_STAGES as readonly unknown[]).includes(v.stage)) return false;
  if (v.weather !== undefined && (typeof v.weather !== 'string' || v.weather.trim().length > 40)) return false;
  if (v.movement !== undefined && !['storm', 'stillness', 'song'].includes(v.movement as string)) return false;
  if (v.userText !== undefined && (typeof v.userText !== 'string' || v.userText.length > COMPANION_USER_TEXT_MAX)) return false;
  return true;
}

export interface CompanionOutput {
  kind: CompanionKind;
  /** Plain text. Always rendered as a text node, never as HTML. Empty for kind 'ground'. */
  text: string;
  /** Which provider produced the text (for transparency in the UI). */
  source: 'local' | 'cloud';
}

export interface MirrorCompanionProvider {
  readonly id: 'local' | 'cloud';
  reflect(input: CompanionInput): Promise<CompanionOutput>;
}
