'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotion } from '@/components/settings/useSettings';

/**
 * Scribble — a tactile Storm interaction.
 *
 * Draw freely. The line begins amber/rose, its width follows speed, it slowly diffuses, breaks into
 * particles and fades. Nothing is saved, judged or interpreted: strokes exist only in memory for a
 * few seconds and are gone when the component unmounts.
 */

interface Point {
  x: number;
  y: number;
  w: number;
  born: number;
  hue: number;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
}

const LINE_LIFE = 3.2; // seconds before a segment has fully dissolved
const MAX_POINTS = 1600;

function strokeColor(hue: number, alpha: number): string {
  // hue 0 → amber (232,147,91); 1 → rose (232,106,106)
  const r = 232;
  const g = Math.round(147 - 41 * hue);
  const b = Math.round(91 + 15 * hue);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function ScribbleSurface({ className, label = 'Scribble surface' }: { className?: string; label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Point[][]>([]);
  const motesRef = useRef<Mote[]>([]);
  const activeRef = useRef<{ id: number; last: { x: number; y: number; t: number } } | null>(null);
  const rafRef = useRef(0);
  const renderRef = useRef<() => void>(() => undefined);
  const motion = useMotion();
  const [hasDrawn, setHasDrawn] = useState(false);

  const now = () => performance.now() / 1000;

  const render = useCallback(() => {
    rafRef.current = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const t = now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const reduced = motion === 'minimal';
    const life = reduced ? LINE_LIFE * 0.6 : LINE_LIFE;
    let alive = false;

    strokesRef.current = strokesRef.current
      .map((stroke) => stroke.filter((p) => t - p.born < life))
      .filter((stroke) => stroke.length > 0);

    for (const stroke of strokesRef.current) {
      for (let i = 1; i < stroke.length; i++) {
        const a = stroke[i - 1]!;
        const b = stroke[i]!;
        const age = (t - b.born) / life;
        const alpha = Math.max(0, 1 - age) ** 1.4;
        // Diffusion: the line widens and softens as it ages.
        ctx.strokeStyle = strokeColor(b.hue, alpha * 0.85);
        ctx.lineWidth = b.w * (1 + age * 2.2);
        ctx.shadowColor = strokeColor(b.hue, alpha * 0.6);
        ctx.shadowBlur = reduced ? 0 : 8 + age * 18;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        // Break into particles as it ages.
        if (!reduced && age > 0.35 && Math.random() < 0.035 && motesRef.current.length < 500) {
          motesRef.current.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30 - 8,
            life: 0,
            max: 0.8 + Math.random() * 1.2,
            r: 0.8 + Math.random() * 1.6,
            color: strokeColor(b.hue, 1),
          });
        }
      }
      alive = true;
    }
    ctx.shadowBlur = 0;

    const dt = 1 / 60;
    motesRef.current = motesRef.current.filter((m) => {
      m.life += dt;
      if (m.life >= m.max) return false;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.vx *= 0.985;
      m.vy *= 0.985;
      const a = Math.sin((m.life / m.max) * Math.PI) * 0.7;
      ctx.globalAlpha = a;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });
    if (motesRef.current.length) alive = true;
    ctx.globalCompositeOperation = 'source-over';

    if (alive && document.visibilityState === 'visible') rafRef.current = requestAnimationFrame(() => renderRef.current());
  }, [motion]);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  const kick = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(render);
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      kick();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      strokesRef.current = [];
      motesRef.current = [];
    };
  }, [kick]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    activeRef.current = { id: e.pointerId, last: { ...p, t: now() } };
    strokesRef.current.push([{ ...p, w: 3, born: now(), hue: Math.random() }]);
    setHasDrawn(true);
    kick();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const active = activeRef.current;
    if (!active || active.id !== e.pointerId) return;
    const p = point(e);
    const t = now();
    const dist = Math.hypot(p.x - active.last.x, p.y - active.last.y);
    if (dist < 1.5) return;
    const speed = dist / Math.max(0.004, t - active.last.t);
    // Velocity-sensitive width: slow strokes are fuller, fast strokes thinner.
    const width = Math.max(1.2, Math.min(9, 10 - speed / 180)) * (e.pressure > 0 && e.pressure !== 0.5 ? 0.6 + e.pressure : 1);
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    if (stroke) {
      const prevHue = stroke[stroke.length - 1]?.hue ?? 0.5;
      stroke.push({ ...p, w: width, born: t, hue: Math.min(1, Math.max(0, prevHue + (Math.random() - 0.5) * 0.08)) });
      const total = strokesRef.current.reduce((n, s) => n + s.length, 0);
      if (total > MAX_POINTS) strokesRef.current[0]?.shift();
    }
    active.last = { ...p, t };
    kick();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeRef.current?.id === e.pointerId) activeRef.current = null;
  };

  return (
    <div className={`relative ${className ?? ''}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${label}. Draw freely with a finger, pen or mouse. Lines fade on their own and nothing is saved.`}
        className="absolute inset-0 h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        data-testid="scribble-canvas"
      />
      {!hasDrawn && (
        <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center label-mono text-faint">
          draw anywhere · nothing is kept
        </p>
      )}
    </div>
  );
}
