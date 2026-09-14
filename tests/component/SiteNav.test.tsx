import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SiteNav } from '@/components/layout/SiteNav';

vi.mock('next/navigation', () => ({ usePathname: () => '/science' }));

describe('SiteNav', () => {
  it('marks the current page and exposes a skip link', () => {
    render(<SiteNav />);
    const primary = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primary).getByRole('link', { name: 'Science' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });

  it('opens an accessible mobile menu that closes with Escape and restores focus', async () => {
    render(<SiteNav />);
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    const dialog = screen.getByRole('dialog', { name: 'Site menu' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('link', { name: /The Mirror/ })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });
});
