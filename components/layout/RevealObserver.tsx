'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Reveal-on-scroll, purely cosmetic. Content is in the HTML regardless; without JavaScript the
 * `js-reveal` class is never added, so nothing is hidden. Under minimal motion CSS shows everything.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not([data-in])'));
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.setAttribute('data-in', ''));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in', '');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );
    elements.forEach((el) => io.observe(el));
    // Safety net: never leave content hidden (e.g. print, unusual scroll containers).
    const timer = window.setTimeout(() => elements.forEach((el) => el.setAttribute('data-in', '')), 4000);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
