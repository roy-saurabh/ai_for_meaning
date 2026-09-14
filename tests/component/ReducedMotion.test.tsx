import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useMotion } from '@/components/settings/useSettings';
import { SETTINGS_KEY, THEME_SCRIPT } from '@/lib/settings/settings';

function MotionProbe() {
  return <p data-testid="motion">{useMotion()}</p>;
}

const originalMatchMedia = window.matchMedia;

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe('reduced motion', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    delete document.documentElement.dataset.motion;
  });

  it('renderers receive minimal motion when the OS asks for reduced motion', async () => {
    mockReducedMotion(true);
    render(<MotionProbe />);
    expect(await screen.findByText('minimal')).toBeInTheDocument();
  });

  it('respects the local Minimal setting even without an OS preference', async () => {
    mockReducedMotion(false);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ motion: 'minimal' }));
    render(<MotionProbe />);
    expect(await screen.findByText('minimal')).toBeInTheDocument();
  });

  it('full motion otherwise', async () => {
    mockReducedMotion(false);
    render(<MotionProbe />);
    expect(await screen.findByText('full')).toBeInTheDocument();
  });

  it('the pre-paint script applies the same rule', () => {
    mockReducedMotion(true);
    new Function(THEME_SCRIPT)();
    expect(document.documentElement.dataset.motion).toBe('minimal');
  });
});
