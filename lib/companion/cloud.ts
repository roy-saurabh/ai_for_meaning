import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { CompanionConfig } from '@/lib/env/server';
import { checkText } from '@/lib/safety/gate';
import { isAllowedCompanionText } from './constraints';
import { localReflect } from './local';
import type { CompanionInput, CompanionOutput, MirrorCompanionProvider } from './types';

/**
 * Optional cloud Witness-Companion (Claude via the official Anthropic SDK).
 *
 * Guard rails, in order:
 *  1. The deterministic safety gate runs BEFORE any network call. High-risk text never leaves the
 *     server; the Ground pathway is returned instead.
 *  2. Only the current, minimal structured input is sent — never history, identifiers or metadata.
 *  3. The model must answer in a fixed JSON schema (kind + text).
 *  4. The answer is re-checked against the same constraint set as local templates. Any violation,
 *     refusal, timeout or error silently falls back to LocalReflectionProvider.
 *  5. Nothing about the request or response is logged.
 */

const SYSTEM_PROMPT = `You write one line for a contemplative, non-clinical self-awareness app called AI for Meaning. The app is a mirror, not a master: it helps a person notice their own experience and never directs, interprets or evaluates it.

You receive a small JSON object: the current stage of a short session (weather, stillness, song or close), optionally the person's chosen weather word, and optionally a few words they wrote.

Respond with exactly one of:
- "reflection": gently mirror the person's own words back to them, quoting their word or phrase exactly, without adding meaning.
- "question": one short, open question that points attention back to their present experience (for example the body, or what is here now).
- "pointer": one brief contemplative pointer, such as noticing that weather passes.

Hard limits. The text must:
- be at most two short sentences and under 180 characters;
- never diagnose, name conditions, or use clinical or therapeutic vocabulary;
- never advise, prescribe, or say what the person should, must or needs to do;
- never interpret causes, meaning, the past, trauma, or anything subconscious;
- never claim to know, sense or see what the person feels;
- never make health, nervous-system or neuroscience claims, or promise any outcome;
- never suggest returning to the app, routines, streaks or dependence on you;
- never speak as a guide, teacher, friend or conscious being;
- contain no markup, links, emoji or lists.

Write in plain, calm, sparse English. If the words suggest the person may be in danger, set kind to "ground" and text to an empty string.`;

const outputSchema = z.object({
  kind: z.enum(['reflection', 'question', 'pointer', 'ground']),
  text: z.string().max(240),
});

const OUTPUT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['reflection', 'question', 'pointer', 'ground'] },
    text: { type: 'string' },
  },
  required: ['kind', 'text'],
  additionalProperties: false,
} as const;

const REQUEST_TIMEOUT_MS = 8_000;

export class CloudReflectionProvider implements MirrorCompanionProvider {
  readonly id = 'cloud' as const;
  private readonly client: Anthropic;

  constructor(private readonly config: CompanionConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey ?? undefined,
      baseURL: config.baseUrl ?? undefined,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 1,
    });
  }

  async reflect(input: CompanionInput): Promise<CompanionOutput> {
    if (input.userText && checkText(input.userText).level === 'high-risk') {
      return { kind: 'ground', text: '', source: 'local' };
    }

    try {
      const response = await this.client.beta.messages.create({
        model: this.config.model,
        max_tokens: 2048,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: OUTPUT_JSON_SCHEMA },
        },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              stage: input.stage,
              weather: input.weather ?? null,
              movement: input.movement ?? null,
              words: input.userText ?? null,
            }),
          },
        ],
      });

      if (response.stop_reason === 'refusal') return localReflect(input);

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') return localReflect(input);

      const parsed = outputSchema.safeParse(JSON.parse(textBlock.text));
      if (!parsed.success) return localReflect(input);

      if (parsed.data.kind === 'ground') return { kind: 'ground', text: '', source: 'local' };
      const text = parsed.data.text.trim();
      if (!isAllowedCompanionText(text)) return localReflect(input);

      return { kind: parsed.data.kind, text, source: 'cloud' };
    } catch {
      // Timeouts, rate limits, network and API errors all degrade to the local provider.
      return localReflect(input);
    }
  }
}
