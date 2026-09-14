'use client';

import { useMemo, useRef } from 'react';
import { MirrorFieldRenderer, particleBudget } from '@/lib/generative/field-renderer';
import type { FieldParams } from '@/lib/generative/scenes';
import { testHooks } from '@/lib/testing/test-mode';
import { useMotion, useSettings } from '@/components/settings/useSettings';
import { useCanvasLoop } from './useCanvasLoop';

export interface FieldCanvasProps {
  scene: FieldParams;
  /** Seconds for the field to settle into a new scene. Short for Ground. */
  transitionSeconds?: number;
  running?: boolean;
  showOrb?: boolean;
  showField?: boolean;
  /** Reads the latest external breath value (only when a Trace is connected). */
  breathSource?: (() => number | null) | null;
  fieldOpacity?: number;
  orbCenter?: { x: number; y: number };
  className?: string;
  fps?: number;
  /** Stable key for scene changes under minimal motion. */
  sceneKey?: string;
}

/**
 * A decorative canvas. Always aria-hidden: every state it depicts is also available as DOM text in
 * the surrounding interface.
 */
export function FieldCanvas({
  scene,
  transitionSeconds = 2.4,
  running = true,
  showOrb = true,
  showField = true,
  breathSource = null,
  fieldOpacity = 1,
  orbCenter,
  className,
  fps = 60,
  sceneKey,
}: FieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = useMotion();
  const [settings] = useSettings();
  const rendererRef = useRef<MirrorFieldRenderer | null>(null);
  const lastSceneRef = useRef<FieldParams | null>(null);

  const seed = useMemo(() => testHooks()?.seed, []);

  useCanvasLoop(
    canvasRef,
    ({ ctx, t, dt, still, width, height }) => {
      if (!rendererRef.current) {
        rendererRef.current = new MirrorFieldRenderer(scene, {
          seed: seed ?? undefined,
          maxParticles: particleBudget({ width, reducedDensity: settings.reducedDensity }),
        });
      }
      const renderer = rendererRef.current;
      renderer.resize(width, height);
      if (lastSceneRef.current !== scene) {
        renderer.setTarget(scene, transitionSeconds);
        if (still) renderer.snap(scene);
        lastSceneRef.current = scene;
      }
      renderer.frame(ctx, t, dt, {
        motion: still ? 'minimal' : motion,
        showOrb,
        showField,
        breathOverride: breathSource ? breathSource() : null,
        fieldOpacity,
        orbCenter,
      });
    },
    {
      motion,
      fps: motion === 'gentle' ? Math.min(fps, 30) : fps,
      running,
      redrawKey: sceneKey ?? scene,
    },
  );

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={className} data-testid="field-canvas" />
  );
}
