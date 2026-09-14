'use client';

import { useMemo, useRef, useState } from 'react';
import { useCanvasLoop } from '@/components/generative/useCanvasLoop';
import { useMotion } from '@/components/settings/useSettings';
import { SKY_FAMILIES, type Sky, type SkyStar } from '@/lib/sky/generate';

interface SkyCanvasProps {
  sky: Sky;
  /** Accessible description per trace id (e.g. "12 Sep · Stillness · 4 min · one prompt"). */
  describe?: (star: SkyStar) => string;
  className?: string;
  interactive?: boolean;
  label: string;
}

/**
 * Renders a constellation. The canvas is decorative; when interactive, each trace's primary star is
 * also a real, focusable button carrying a factual description, so the sky is fully usable by keyboard
 * and screen reader.
 */
export function SkyCanvas({ sky, describe, className = '', interactive = false, label }: SkyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = useMotion();
  const [active, setActive] = useState<string | null>(null);
  const activeStar = useMemo(() => sky.stars.find((s) => s.key === active) ?? null, [sky, active]);

  useCanvasLoop(
    canvasRef,
    ({ ctx, width, height, t, still }) => {
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(1.6, Math.max(0.8, width / 700));

      for (const d of sky.dust) {
        ctx.fillStyle = `rgba(220,215,240,${d.alpha})`;
        ctx.beginPath();
        ctx.arc(d.x * width, d.y * height, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineWidth = 1;
      for (const link of sky.links) {
        ctx.strokeStyle = `rgba(143,183,255,${link.alpha})`;
        ctx.beginPath();
        ctx.moveTo(link.from.x * width, link.from.y * height);
        ctx.lineTo(link.to.x * width, link.to.y * height);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'lighter';
      for (const star of sky.stars) {
        const [r, g, b] = SKY_FAMILIES[star.family].rgb;
        const twinkle = still ? 1 : 0.8 + 0.2 * Math.sin(t * 0.6 + star.twinklePhase);
        const x = star.x * width;
        const y = star.y * height;
        const radius = star.r * scale;
        const highlight = star.traceId === activeStar?.traceId ? 1.6 : 1;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 6 * highlight);
        glow.addColorStop(0, `rgba(${r},${g},${b},${0.45 * star.alpha * twinkle})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 6 * highlight, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,250,240,${Math.min(1, star.alpha * twinkle + 0.1)})`;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    { motion, fps: 24, redrawKey: `${sky.stars.length}:${active ?? ''}` },
  );

  const primaries = sky.stars.filter((s) => s.primary);

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {interactive && describe ? (
        <ul aria-label={label} className="absolute inset-0 m-0 list-none p-0">
          {primaries.map((star) => (
            <li key={star.key}>
              <button
                type="button"
                className="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-offset-0"
                style={{ left: `${star.x * 100}%`, top: `${star.y * 100}%` }}
                aria-label={describe(star)}
                aria-pressed={active === star.key}
                onClick={() => setActive((a) => (a === star.key ? null : star.key))}
                onMouseEnter={() => setActive(star.key)}
                onFocus={() => setActive(star.key)}
                data-testid="sky-star"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="sr-only">{label}</p>
      )}
      {interactive && describe && activeStar && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--line-2)] bg-[rgba(9,9,26,0.9)] px-3.5 py-2 font-mono text-[0.72rem] tracking-[0.04em] text-ink"
          style={{
            left: `${Math.min(80, Math.max(20, activeStar.x * 100))}%`,
            top: `calc(${activeStar.y * 100}% ${activeStar.y > 0.7 ? '- 52px' : '+ 18px'})`,
          }}
          aria-hidden="true"
          data-testid="sky-tooltip"
        >
          {describe(activeStar)}
        </div>
      )}
    </div>
  );
}
