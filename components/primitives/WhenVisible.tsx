'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Renders children only once the placeholder is near the viewport, so heavy client islands (canvas
 * code) are neither downloaded nor hydrated during initial page load.
 */
export function WhenVisible({ children, fallback, rootMargin = '200px', className }: { children: ReactNode; fallback?: ReactNode; rootMargin?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capability fallback
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
