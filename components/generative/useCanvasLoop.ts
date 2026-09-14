'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { MotionLevel } from '@/lib/generative/field-renderer';
import { testHooks } from '@/lib/testing/test-mode';

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Seconds of running (unpaused, visible) time. */
  t: number;
  /** Seconds since the previous drawn frame (0 for static redraws). */
  dt: number;
  /** True when this is a single static frame (minimal motion or visual-test freeze). */
  still: boolean;
}

export interface CanvasLoopOptions {
  motion: MotionLevel;
  /** Frame-rate ceiling. Ambient visuals rarely need 60fps. */
  fps?: number;
  /** When false, the loop stops (e.g. a paused session) but the last frame remains. */
  running?: boolean;
  /** Changing this forces a static redraw (for minimal motion when the scene changes). */
  redrawKey?: unknown;
  onResize?: (width: number, height: number) => void;
}

const MAX_DPR = 2;

/**
 * Drives a canvas with requestAnimationFrame, but only while it is useful: never when the document is
 * hidden, when the canvas is off-screen, when the owner says it is not running, or when motion is
 * minimal (in which case a single static frame is drawn on mount, resize and scene change).
 */
export function useCanvasLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draw: (frame: CanvasFrame) => void,
  { motion, fps = 60, running = true, redrawKey, onResize }: CanvasLoopOptions,
): void {
  const drawRef = useRef(draw);
  const onResizeRef = useRef(onResize);
  const stateRef = useRef({ width: 0, height: 0, t: 0, visible: true, hidden: false });

  useEffect(() => {
    drawRef.current = draw;
    onResizeRef.current = onResize;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const state = stateRef.current;
    const frozenTime = testHooks()?.frozenTime;
    const staticMode = motion === 'minimal' || typeof frozenTime === 'number';
    let raf = 0;
    let last = 0;
    let lastDrawn = 0;
    const interval = 1000 / fps;

    const drawStill = () => {
      if (state.width === 0) return;
      drawRef.current({ ctx, width: state.width, height: state.height, t: frozenTime ?? 8, dt: 0, still: true });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === state.width && h === state.height && canvas.width === Math.round(w * dpr)) return;
      state.width = w;
      state.height = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      onResizeRef.current?.(w, h);
      if (staticMode || !running) drawStill();
    };

    const shouldRun = () => !staticMode && running && state.visible && !state.hidden;

    const tick = (now: number) => {
      raf = 0;
      if (!shouldRun()) return;
      if (last === 0) last = now;
      if (now - lastDrawn >= interval - 1) {
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        lastDrawn = now;
        state.t += dt;
        drawRef.current({ ctx, width: state.width, height: state.height, t: state.t, dt, still: false });
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || !shouldRun()) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        state.visible = entries.some((e) => e.isIntersecting);
        if (state.visible) start();
        else stop();
      },
      { rootMargin: '80px' },
    );
    io.observe(canvas);

    const onVisibility = () => {
      state.hidden = document.visibilityState === 'hidden';
      if (state.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (staticMode || !running) drawStill();
    else start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef, motion, fps, running]);

  // Static redraw when the scene changes under minimal motion (or while paused).
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const state = stateRef.current;
    const frozenTime = testHooks()?.frozenTime;
    if (!ctx || state.width === 0) return;
    if (motion === 'minimal' || typeof frozenTime === 'number' || !running) {
      drawRef.current({ ctx, width: state.width, height: state.height, t: frozenTime ?? (running ? 8 : state.t || 8), dt: 0, still: true });
    }
  }, [canvasRef, motion, running, redrawKey]);
}
