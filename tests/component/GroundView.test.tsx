import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GroundView } from '@/components/safety/GroundView';
import { DEFAULT_HELP_RESOURCE } from '@/lib/safety/help';

describe('GroundView', () => {
  it('shows the deterministic grounding sequence and its three choices', async () => {
    const onEnd = vi.fn();
    render(<GroundView helpResource={DEFAULT_HELP_RESOURCE} highRisk={false} onEnd={onEnd} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Look around the room.' })).toHaveFocus();
    expect(screen.getByText('Notice three ordinary things you can see.')).toBeInTheDocument();
    expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Human help' }));
    expect(screen.getByTestId('help-panel')).toHaveTextContent(/local emergency number/i);
    expect(screen.getByRole('link', { name: DEFAULT_HELP_RESOURCE.label })).toHaveAttribute('href', DEFAULT_HELP_RESOURCE.url);
    await userEvent.click(screen.getByRole('button', { name: 'Stay here' }));
    await userEvent.click(screen.getByRole('button', { name: 'End session' }));
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('in the high-risk variant, shows human help immediately and states it is not a crisis service', () => {
    render(<GroundView helpResource={DEFAULT_HELP_RESOURCE} highRisk onEnd={() => undefined} />);
    expect(screen.getByTestId('high-risk')).toHaveTextContent(/reflections have stopped/i);
    expect(screen.getByTestId('help-panel')).toHaveTextContent(/not a crisis service/i);
  });
});
