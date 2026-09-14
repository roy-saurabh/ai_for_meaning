/**
 * LocalReflectionProvider — the production default.
 *
 * Fully offline and deterministic: the same input always yields the same line. The person's own
 * words are reflected back verbatim (bounded), wrapped in reviewed templates that only notice, ask
 * or point — never interpret.
 */

import { hashString } from '@/lib/generative/prng';
import { checkText } from '@/lib/safety/gate';
import { stripControl, stripQuotes } from '@/lib/text/sanitize';
import type { CompanionInput, CompanionOutput, MirrorCompanionProvider } from './types';

const ECHO_MAX = 48;

/** Extract a short, safe echo of the person's words (a word or brief phrase). */
export function echoOf(text: string): string | null {
  const cleaned = stripQuotes(stripControl(text)).replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  if (cleaned.length <= ECHO_MAX) return cleaned.replace(/[.!?,;:]+$/, '');
  // Prefer the first clause when the text is long.
  const clause = cleaned.split(/[.!?;:,—–-]\s/)[0] ?? cleaned;
  const bounded = clause.length <= ECHO_MAX ? clause : `${clause.slice(0, ECHO_MAX).replace(/\s+\S*$/, '')}…`;
  return bounded.replace(/[.!?,;:]+$/, '');
}

type Template = (echo: string) => string;

const WITH_WORDS: Record<CompanionInput['stage'], { kind: CompanionOutput['kind']; t: Template }[]> = {
  weather: [
    { kind: 'question', t: (e) => `You named it “${e}.” What do you notice in the body as you read that word again?` },
    { kind: 'reflection', t: (e) => `“${e}” — here, for now. Where, if anywhere, does it sit?` },
    { kind: 'question', t: (e) => `You wrote “${e}.” Is it the same as a moment ago, or already shifting?` },
  ],
  stillness: [
    { kind: 'reflection', t: (e) => `“${e}.” You can let that word be there without doing anything with it.` },
    { kind: 'question', t: (e) => `“${e}” — is it in the foreground right now, or somewhere further off?` },
  ],
  song: [
    { kind: 'reflection', t: (e) => `“${e}.” You noticed that without being asked to fix anything.` },
    { kind: 'question', t: (e) => `“${e}” — what is it like to stay with that for one more breath?` },
    { kind: 'reflection', t: (e) => `You found “${e}.” It can simply be noticed.` },
  ],
  close: [
    { kind: 'reflection', t: (e) => `“${e}.” A word to carry, or to leave here. Either is fine.` },
    { kind: 'reflection', t: (e) => `You chose “${e}.” Nothing more is needed from it.` },
  ],
};

const WITHOUT_WORDS: Record<CompanionInput['stage'], { kind: CompanionOutput['kind']; text: string }[]> = {
  weather: [
    { kind: 'pointer', text: 'Weather moves. You are the one noticing it.' },
    { kind: 'question', text: 'Where in the body is this weather easiest to notice?' },
  ],
  stillness: [
    { kind: 'pointer', text: 'Nothing to improve for a moment.' },
    { kind: 'question', text: 'What is here, before any word for it?' },
    { kind: 'pointer', text: 'Thoughts can pass like weather. There is no need to follow them.' },
  ],
  song: [
    { kind: 'question', text: 'What feels quietly alive right now?' },
    { kind: 'question', text: 'Is there anything here worth carrying into the rest of your day?' },
  ],
  close: [
    { kind: 'pointer', text: 'Nothing needed to happen.' },
    { kind: 'question', text: 'Is anything different, or much the same? Both are fine.' },
  ],
};

function choose<T>(items: readonly T[], key: string): T {
  const item = items[hashString(key) % items.length];
  if (item === undefined) throw new Error('Empty template list');
  return item;
}

export function localReflect(input: CompanionInput): CompanionOutput {
  if (input.userText && checkText(input.userText).level === 'high-risk') {
    return { kind: 'ground', text: '', source: 'local' };
  }
  const echo = input.userText ? echoOf(input.userText) : null;
  const key = `${input.stage}|${input.weather ?? ''}|${input.movement ?? ''}|${echo ?? ''}`;
  if (echo) {
    const template = choose(WITH_WORDS[input.stage], key);
    return { kind: template.kind, text: template.t(echo), source: 'local' };
  }
  const line = choose(WITHOUT_WORDS[input.stage], key);
  return { kind: line.kind, text: line.text, source: 'local' };
}

export class LocalReflectionProvider implements MirrorCompanionProvider {
  readonly id = 'local' as const;
  async reflect(input: CompanionInput): Promise<CompanionOutput> {
    return localReflect(input);
  }
}
