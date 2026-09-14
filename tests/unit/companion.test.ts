import { describe, expect, it } from 'vitest';
import { checkCompanionText, isAllowedCompanionText } from '@/lib/companion/constraints';
import { LocalReflectionProvider, echoOf, localReflect } from '@/lib/companion/local';
import { companionInputSchema } from '@/lib/companion/schema';
import { COMPANION_STAGES, isCompanionInput } from '@/lib/companion/types';

describe('companion output constraints', () => {
  it.each([
    'Your anxiety is caused by suppressed anger.',
    'You should practice this for 20 minutes every morning to regulate your nervous system.',
    'I can tell that you are dissociating.',
    'This sounds like depression.',
    'Your subconscious is trying to tell you something.',
    'Come back tomorrow to keep your streak.',
    'I am your guide on this journey.',
    'This will make you feel calmer, guaranteed.',
    'Try therapy.',
    'See https://example.com',
    'One. Two. Three sentences here.',
  ])('rejects: %s', (text) => {
    expect(isAllowedCompanionText(text)).toBe(false);
  });

  it.each([
    'You described the day as crowded. What do you notice in the body as you read that word again?',
    'Nothing to improve for a moment.',
    'What feels quietly alive right now?',
  ])('allows: %s', (text) => {
    expect(checkCompanionText(text)).toEqual([]);
  });
});

describe('LocalReflectionProvider', () => {
  const words = ['crowded', 'a bit lost', 'warm tea', 'my daughter’s laugh', 'Tense, wired, tired.', 'x'.repeat(200)];

  it('every template output satisfies the constraints, for every stage', () => {
    for (const stage of COMPANION_STAGES) {
      expect(isAllowedCompanionText(localReflect({ stage }).text), stage).toBe(true);
      for (const userText of words) {
        const out = localReflect({ stage, userText });
        expect(out.kind).not.toBe('ground');
        expect(checkCompanionText(out.text), `${stage}: ${out.text}`).toEqual([]);
      }
    }
  });

  it('is deterministic', () => {
    const a = localReflect({ stage: 'song', userText: 'warm tea' });
    expect(localReflect({ stage: 'song', userText: 'warm tea' })).toEqual(a);
    expect(a.source).toBe('local');
  });

  it("reflects the person's own words, not an interpretation", () => {
    expect(localReflect({ stage: 'weather', userText: 'crowded' }).text).toContain('crowded');
  });

  it('routes high-risk text to Ground with no reflection', async () => {
    const out = await new LocalReflectionProvider().reflect({ stage: 'song', userText: 'I want to end my life' });
    expect(out).toEqual({ kind: 'ground', text: '', source: 'local' });
  });

  it('bounds and cleans echoes', () => {
    expect(echoOf('  "hello"  ')).toBe('hello');
    expect(echoOf('')).toBeNull();
    expect((echoOf('word '.repeat(40)) ?? '').length).toBeLessThanOrEqual(49);
    expect(echoOf('<b>bold</b>')).toBe('bbold/b');
  });

  it('validates input strictly', () => {
    expect(companionInputSchema.safeParse({ stage: 'song', userText: 'hi' }).success).toBe(true);
    expect(companionInputSchema.safeParse({ stage: 'song', history: [] }).success).toBe(false);
    expect(companionInputSchema.safeParse({ stage: 'diagnose' }).success).toBe(false);
    expect(companionInputSchema.safeParse({ stage: 'song', userText: 'x'.repeat(281) }).success).toBe(false);
  });

  it('browser validation agrees with the server schema', () => {
    const cases: unknown[] = [
      { stage: 'song', userText: 'hi' },
      { stage: 'weather', weather: 'tense', movement: 'storm' },
      { stage: 'song', history: [] },
      { stage: 'diagnose' },
      { stage: 'song', userText: 'x'.repeat(281) },
      { stage: 'close', weather: 'y'.repeat(41) },
      null,
      'song',
    ];
    for (const c of cases) expect(isCompanionInput(c), JSON.stringify(c)).toBe(companionInputSchema.safeParse(c).success);
  });
});
