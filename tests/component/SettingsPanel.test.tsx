import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SETTINGS_KEY } from '@/lib/settings/settings';
import { createSession, replay } from '@/lib/mirror/machine';
import { eraseDatabase, listTraces, saveTrace, traceFromSession } from '@/lib/storage/traces';

describe('SettingsPanel', () => {
  beforeEach(async () => {
    await eraseDatabase();
  });

  it('writes motion and accessibility preferences to local storage and the document', async () => {
    render(<SettingsPanel />);
    await userEvent.click(screen.getByRole('radio', { name: 'Minimal' }));
    expect(JSON.parse(window.localStorage.getItem(SETTINGS_KEY)!).motion).toBe('minimal');
    expect(document.documentElement.dataset.motion).toBe('minimal');
    await userEvent.click(screen.getByRole('switch', { name: 'High contrast' }));
    expect(document.documentElement.dataset.contrast).toBe('high');
    expect(screen.getByRole('switch', { name: 'Disable canvas motion' })).toHaveAttribute('aria-checked', 'true');
  });

  it('exports JSON through a download', async () => {
    const created: string[] = [];
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      created.push(this.download);
    });
    render(<SettingsPanel />);
    await userEvent.click(screen.getByTestId('export-json'));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(created[0]).toMatch(/^ai-for-meaning-export-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('deletes everything only after confirmation', async () => {
    const s = replay([{ type: 'BEGIN' }, { type: 'SELECT_WEATHER', weather: { kind: 'preset', id: 'numb' } }, { type: 'START_ARC', traceMode: 'none', now: 1 }, { type: 'END', now: 2 }], createSession());
    await saveTrace(traceFromSession(s, 'keep-me', 3)!);
    render(<SettingsPanel />);
    await userEvent.click(screen.getByTestId('delete-everything'));
    expect(await listTraces()).toHaveLength(1);
    await userEvent.click(screen.getByTestId('confirm-delete'));
    await waitFor(async () => expect(await listTraces()).toHaveLength(0));
    expect(await screen.findByText('Everything has been deleted from this browser.')).toBeInTheDocument();
  });
});
