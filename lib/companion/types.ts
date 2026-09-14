import { z } from 'zod';

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

export const companionInputSchema = z
  .object({
    stage: z.enum(COMPANION_STAGES),
    weather: z.string().trim().max(40).optional(),
    movement: z.enum(['storm', 'stillness', 'song']).optional(),
    userText: z.string().max(COMPANION_USER_TEXT_MAX).optional(),
  })
  .strict();

export type CompanionInput = z.infer<typeof companionInputSchema>;

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
