import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConsentStep, WeatherStep } from '@/components/mirror/Steps';
import { DEFAULT_FADE, guidancePlan } from '@/lib/mirror/fade';

const plan = guidancePlan(DEFAULT_FADE, 'full');

describe('WeatherStep', () => {
  it('offers every preset plus a custom word, and selects by click or keyboard', async () => {
    const onSelect = vi.fn();
    render(<WeatherStep plan={plan} initial={null} onSelect={onSelect} onBack={() => undefined} />);
    for (const label of ['Tense', 'Heavy', 'Foggy', 'Bright', 'Numb', 'Mixed', 'Something else']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    await userEvent.click(screen.getByRole('button', { name: 'Heavy' }));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'preset', id: 'heavy' });

    screen.getByRole('button', { name: 'Numb' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'preset', id: 'numb' });
  });

  it('accepts a short custom phrase with a programmatic label', async () => {
    const onSelect = vi.fn();
    render(<WeatherStep plan={plan} initial={null} onSelect={onSelect} onBack={() => undefined} />);
    await userEvent.click(screen.getByRole('button', { name: 'Something else' }));
    const input = screen.getByLabelText(/your own word/i);
    const submit = screen.getByRole('button', { name: 'This one' });
    expect(submit).toBeDisabled();
    await userEvent.type(input, '  crowded  ');
    await userEvent.click(submit);
    expect(onSelect).toHaveBeenCalledWith({ kind: 'custom', text: 'crowded' });
  });
});

describe('ConsentStep', () => {
  it('defaults to no sensing, and only offers Breath-trace when enabled', async () => {
    const onStart = vi.fn();
    const { rerender } = render(
      <ConsentStep weather={{ kind: 'preset', id: 'tense' }} breathAvailable={false} traceStatus="inactive" onStart={onStart} onBack={() => undefined} />,
    );
    expect(screen.getByRole('radio', { name: /no sensing/i })).toBeChecked();
    expect(screen.queryByRole('radio', { name: /breath-trace/i })).not.toBeInTheDocument();
    expect(screen.getByText(/pulse-trace — not yet available/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Begin' }));
    expect(onStart).toHaveBeenCalledWith('none');

    rerender(<ConsentStep weather={{ kind: 'preset', id: 'tense' }} breathAvailable traceStatus="denied" onStart={onStart} onBack={() => undefined} />);
    expect(screen.getByRole('radio', { name: /breath-trace/i })).not.toBeChecked();
    expect(screen.getByRole('alert')).toHaveTextContent(/permission was not given/i);
    expect(screen.getByText(/does not measure breathing/i)).toBeInTheDocument();
  });
});
