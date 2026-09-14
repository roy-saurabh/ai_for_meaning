'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { OrbMark, Wordmark } from '@/components/brand/Wordmark';

export const PRIMARY_NAV = [
  { href: '/mirror', label: 'The Mirror' },
  { href: '/sky', label: 'Inner Sky' },
  { href: '/science', label: 'Science' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/ground', label: 'Ground' },
] as const;

const SECONDARY_NAV = [
  { href: '/practice', label: 'Practice' },
  { href: '/honest-mirror', label: 'The Honest Mirror' },
  { href: '/about', label: 'About' },
  { href: '/settings', label: 'Settings' },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const toggle = toggleRef.current;
    document.documentElement.style.overflow = 'hidden';
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [toggleRef.current, ...focusables()].filter(Boolean) as HTMLElement[];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      if (previous && document.contains(previous)) previous.focus();
      else toggle?.focus();
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color] duration-500 ${
          scrolled || open
            ? 'border-[var(--line)] bg-[rgba(9,9,26,0.78)] backdrop-blur-md'
            : 'border-transparent bg-[rgba(9,9,26,0.25)] backdrop-blur-[6px]'
        }`}
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        <div className="wrap flex h-[var(--nav-h)] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg py-2" aria-label="AI for Meaning — home">
            <OrbMark size={20} />
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`inline-flex min-h-11 items-center rounded-full px-3.5 font-mono text-[0.78rem] tracking-[0.04em] transition-colors ${
                      isActive(item.href) ? 'text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/mirror" className="pill pill-primary pill-sm hidden sm:inline-flex">
              Enter
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="icon-btn lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                {open ? (
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-[rgba(9,9,26,0.96)] backdrop-blur-lg lg:hidden fade-in"
          style={{ top: 'calc(var(--nav-h) + var(--safe-top))', paddingBottom: 'var(--safe-bottom)' }}
          data-testid="mobile-menu"
        >
          <nav aria-label="Mobile" className="wrap flex min-h-full flex-col py-8">
            <ul className="flex flex-col">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href} className="border-b border-[var(--line)]">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className="flex min-h-16 items-center justify-between font-display text-[1.75rem] leading-none"
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-faint text-base">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-8 grid grid-cols-2 gap-2">
              {SECONDARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className="flex min-h-12 items-center rounded-2xl px-1 font-mono text-[0.8rem] text-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <Link href="/mirror" className="pill pill-primary w-full">
                Enter the Mirror
              </Link>
              <p className="label-mono mt-5 text-center normal-case tracking-[0.08em] text-faint">
                self-awareness · private by default · not therapy
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
