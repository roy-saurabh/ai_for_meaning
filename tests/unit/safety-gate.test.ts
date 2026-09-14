import { describe, expect, it } from 'vitest';
import { checkText } from '@/lib/safety/gate';
import { DEFAULT_HELP_RESOURCE, getHelpResource } from '@/lib/safety/help';

describe('narrow safety gate', () => {
  it.each([
    'I want to kill myself',
    'thinking about suicide',
    'i might hurt myself tonight',
    'I want to end my life',
    'I wish I were dead',
    'better off dead',
    'self-harm again',
    'I am not safe right now',
    'je veux me suicider',
    'quiero morir',
    'ich will mich umbringen',
    'SUICIDAL',
  ])('routes obvious high-risk language to Ground: %s', (text) => {
    expect(checkText(text).level).toBe('high-risk');
  });

  it.each(['tense', 'crowded day', 'my daughter’s laugh', 'dead tired', 'killing it at work', 'I could die laughing', 'heavy, foggy, numb', ''])(
    'does not flag ordinary language: %s',
    (text) => {
      expect(checkText(text).level).toBe('none');
    },
  );

  it('handles null and undefined', () => {
    expect(checkText(null).level).toBe('none');
    expect(checkText(undefined).level).toBe('none');
  });
});

describe('help resource', () => {
  it('defaults to an international directory', () => {
    expect(getHelpResource({})).toEqual(DEFAULT_HELP_RESOURCE);
  });

  it('accepts only https overrides', () => {
    expect(getHelpResource({ HELP_RESOURCE_URL: 'https://example.org/help', HELP_RESOURCE_LABEL: 'Example' }).url).toBe('https://example.org/help');
    expect(getHelpResource({ HELP_RESOURCE_URL: 'javascript:alert(1)' })).toEqual(DEFAULT_HELP_RESOURCE);
    expect(getHelpResource({ HELP_RESOURCE_URL: 'http://insecure.example' })).toEqual(DEFAULT_HELP_RESOURCE);
  });
});
