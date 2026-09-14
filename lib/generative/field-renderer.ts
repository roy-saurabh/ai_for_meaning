/**
 * MirrorFieldRenderer — Canvas2D renderer for the Breath Orb and the Inner Weather particle field.
 *
 * Render state only. It is told what scene to approach and what time it is; it never knows about
 * sessions, storage, audio or sensors. Canvas2D was chosen over WebGL: the look depends on soft
 * additive light rather than geometry, it is well within Canvas2D's budget at the particle counts
 * used here, and it avoids a large dependency on mobile (see docs/ADR/0003-canvas2d-renderer.md).
 */

import { breathEnvelope } from './breath';
import { approachScene, type FieldParams, type RGB } from './scenes';
import { mulberry32 } from './prng';

export type MotionLevel = 'full' | 'gentle' | 'minimal';

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  phase: number;
  group: 0 | 1;
  sizeJitter: number;
  order: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: RGB;
}

export interface FrameOptions {
  motion: MotionLevel;
  showOrb?: boolean;
  showField?: boolean;
  /** 0..1 external breath value (only when a Trace is connected). */
  breathOverride?: number | null;
  /** Global opacity for the field (used when the interface fades in and out). */
  fieldOpacity?: number;
  /** Orb position as fraction of canvas (defaults to centre). */
  orbCenter?: { x: number; y: number };
}

const SPRITE_SIZE = 64;
const MAX_SPRITES = 96;

export class MirrorFieldRenderer {
  private particles: Particle[] = [];
  private sparks: Spark[] = [];
  private current: FieldParams;
  private target: FieldParams;
  private timeConstant = 2.4;
  private width = 0;
  private height = 0;
  private sprites = new Map<string, HTMLCanvasElement>();
  private readonly rand: () => number;
  private sparkAccumulator = 0;
  private orbPhases: number[];

  constructor(
    initial: FieldParams,
    options: { seed?: number; maxParticles?: number } = {},
  ) {
    this.current = initial;
    this.target = initial;
    this.rand = mulberry32(options.seed ?? Math.floor(Math.random() * 2 ** 31));
    const count = options.maxParticles ?? 220;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        angle: this.rand() * Math.PI * 2,
        radius: Math.pow(this.rand(), 0.75),
        speed: 0.35 + this.rand() * 0.9,
        phase: this.rand() * Math.PI * 2,
        group: 0,
        sizeJitter: 0.6 + this.rand() * 0.8,
        order: this.rand(),
      });
    }
    this.orbPhases = Array.from({ length: 8 }, () => this.rand() * Math.PI * 2);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setTarget(params: FieldParams, timeConstant = 2.4): void {
    this.target = params;
    this.timeConstant = timeConstant;
  }

  /** Jump directly to the target (reduced motion, grounding, first paint). */
  snap(params?: FieldParams): void {
    if (params) this.target = params;
    this.current = this.target;
    this.sparks = [];
  }

  frame(ctx: CanvasRenderingContext2D, t: number, dt: number, options: FrameOptions): void {
    const { motion } = options;
    const w = this.width;
    const h = this.height;
    if (w === 0 || h === 0) return;

    if (motion === 'minimal') {
      this.current = this.target;
      this.sparks = [];
    } else {
      this.current = approachScene(this.current, this.target, dt, this.timeConstant);
    }
    const p = this.current;
    const gentle = motion === 'gentle';
    const motionScale = motion === 'minimal' ? 0 : gentle ? 0.45 : 1;

    // Always clear fully. (Fading the previous frame with destination-out leaves 8-bit residue that
    // builds into a visible haze; motion trails are drawn as soft ghost points instead.)
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    const short = Math.min(w, h);
    const center = options.orbCenter ?? { x: 0.5, y: 0.5 };
    const cx = w * center.x;
    const cy = h * center.y;
    const env =
      options.breathOverride ?? (motion === 'minimal' ? 0.55 : breathEnvelope(t, p.breathRate));
    const breath = (env - 0.5) * 2 * p.breathDepth * (gentle ? 0.6 : 1);

    if (options.showField !== false) {
      this.drawField(ctx, t, dt * motionScale, cx, cy, short, breath, motion, options.fieldOpacity ?? 1);
    }
    if (options.showOrb !== false) {
      this.drawOrb(ctx, t, cx, cy, short, breath, motion);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawField(
    ctx: CanvasRenderingContext2D,
    t: number,
    dt: number,
    cx: number,
    cy: number,
    short: number,
    breath: number,
    motion: MotionLevel,
    opacity: number,
  ): void {
    const p = this.current;
    const S = short * 0.5;
    const spread = p.spread * S * (1 + breath * 0.035);
    const count = this.particles.length;

    for (let i = 0; i < count; i++) {
      const part = this.particles[i]!;
      // Visibility by density with a soft edge so density changes fade rather than pop.
      const densityEdge = (p.density - part.order) / 0.08;
      if (densityEdge <= 0) {
        if (dt > 0) part.angle += dt * p.speed * part.speed * 0.22;
        continue;
      }
      const densityAlpha = Math.min(1, densityEdge);
      const inB = part.order < p.mix;
      const speed = p.speed * (inB ? p.mixSpeed : 1);

      if (dt > 0) {
        // Angular: smooth orbit, or compressed pulses when angularity is high.
        const pulse = p.angularity > 0 ? Math.max(0, Math.sin(t * 5.5 * part.speed + part.phase)) ** 6 : 0;
        part.angle += dt * speed * part.speed * (0.22 + p.angularity * 0.9 * pulse);
      }

      const wobble = Math.sin(t * (0.5 + part.speed) * Math.max(0.2, speed) + part.phase) * p.turbulence * 0.1;
      let r = part.radius + wobble;
      let expansionAlpha = 1;
      if (p.expansion > 0) {
        const cycle = (t * 0.025 * part.speed + part.phase / (Math.PI * 2)) % 1;
        r *= 1 + p.expansion * 0.35 * cycle;
        expansionAlpha = 1 - p.expansion * Math.pow(cycle, 3);
      }
      r = Math.max(0.02, r);
      const radius = r * spread;
      let angle = part.angle;
      if (p.angularity > 0) {
        // Compress the orbit into faceted steps.
        const facets = 7;
        const stepped = Math.round(angle / ((Math.PI * 2) / facets)) * ((Math.PI * 2) / facets);
        angle = angle + (stepped - angle) * p.angularity * 0.35;
      }
      const lift = (inB ? p.mixLift : p.lift) * spread * 0.5;
      let x = cx + Math.cos(angle) * radius;
      let y = cy - lift + Math.sin(angle) * radius * 0.8;
      if (p.gravity > 0) y += p.gravity * part.radius * part.radius * S * 0.32;

      // Empty regions: slowly rotating sectors where light thins out.
      let emptyAlpha = 1;
      if (p.emptiness > 0) {
        const sector = 0.5 + 0.5 * Math.sin(angle * 2 + t * 0.015 + this.orbPhases[0]!);
        emptyAlpha = sector < p.emptiness ? 0.06 : 1;
      }

      const twinkle = p.expansion > 0 && motion !== 'minimal' ? 0.55 + 0.45 * Math.sin(t * 1.1 * part.speed + part.phase) : 1;
      const alpha = p.alpha * densityAlpha * expansionAlpha * emptyAlpha * twinkle * opacity;
      if (alpha < 0.01) continue;

      const color = inB ? p.colorB : i % 2 === 0 ? p.colorA : mixColor(p.colorA, p.colorB, 0.5);
      const size = p.size * part.sizeJitter * (1 + p.softness * 1.4);
      // Parallax: outer particles drift very slightly with the breath.
      x += Math.cos(angle) * breath * part.radius * 2;
      y += Math.sin(angle) * breath * part.radius * 1.5;
      this.drawSprite(ctx, x, y, size * 2.2, color, p.softness, alpha);
      if (p.trail > 0.1 && motion === 'full') {
        // Ghost point slightly behind along the orbit: a cheap, residue-free motion trail.
        const lag = 0.05 + p.trail * 0.12;
        const gx = cx + Math.cos(angle - lag) * radius;
        const gy = cy - lift + Math.sin(angle - lag) * radius * 0.8;
        this.drawSprite(ctx, gx, gy, size * 1.8, color, Math.min(1, p.softness + 0.3), alpha * p.trail * 0.6);
      }
    }

    if (motion === 'full' && p.sparks > 0.02 && dt > 0) this.updateSparks(ctx, dt, cx, cy, spread, opacity);
    else if (this.sparks.length) this.sparks = [];
  }

  private updateSparks(ctx: CanvasRenderingContext2D, dt: number, cx: number, cy: number, spread: number, opacity: number): void {
    const p = this.current;
    this.sparkAccumulator += dt * p.sparks * 14;
    while (this.sparkAccumulator >= 1 && this.sparks.length < 40) {
      this.sparkAccumulator -= 1;
      const a = this.rand() * Math.PI * 2;
      const r0 = spread * (0.25 + this.rand() * 0.5);
      const v = spread * (0.25 + this.rand() * 0.35);
      this.sparks.push({
        x: cx + Math.cos(a) * r0,
        y: cy + Math.sin(a) * r0 * 0.8,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v * 0.8,
        life: 0,
        maxLife: 0.6 + this.rand() * 0.7,
        color: this.rand() > 0.5 ? [242, 170, 110] : [236, 130, 118],
      });
    }
    this.sparkAccumulator = Math.min(this.sparkAccumulator, 2);
    const alive: Spark[] = [];
    for (const s of this.sparks) {
      s.life += dt;
      if (s.life >= s.maxLife) continue;
      const k = s.life / s.maxLife;
      s.vx *= 1 - dt * 2.2;
      s.vy *= 1 - dt * 2.2;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const alpha = Math.sin(Math.PI * k) * 0.8 * opacity;
      this.drawSprite(ctx, s.x, s.y, 5, s.color, 0.1, alpha);
      alive.push(s);
    }
    this.sparks = alive;
  }

  private drawOrb(
    ctx: CanvasRenderingContext2D,
    t: number,
    cx: number,
    cy: number,
    short: number,
    breath: number,
    motion: MotionLevel,
  ): void {
    const p = this.current;
    const base = short * p.orbScale;
    const R = base * (1 + breath * 0.16);
    const shimmer = motion === 'minimal' ? 0 : Math.sin(t * 0.13 + this.orbPhases[1]!) * 0.06;
    const glow = Math.max(0, Math.min(1.2, p.orbGlow + shimmer));
    const [r, g, b] = p.orbColor;

    // 1. Faint violet halo
    const halo = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 3.4);
    halo.addColorStop(0, `rgba(154,140,255,${0.11 * glow})`);
    halo.addColorStop(0.45, `rgba(154,140,255,${0.045 * glow})`);
    halo.addColorStop(1, 'rgba(154,140,255,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 3.4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Outer membrane: asymmetric, slowly deforming
    const tt = motion === 'minimal' ? 4 : t;
    this.membranePath(ctx, cx, cy, R * 1.25, tt, 0, 0.035);
    const outer = ctx.createRadialGradient(cx, cy - R * 0.12, R * 0.1, cx, cy, R * 1.12);
    outer.addColorStop(0, `rgba(${r},${g},${b},${0.34 * glow})`);
    outer.addColorStop(0.5, `rgba(${r},${g},${b},${0.13 * glow})`);
    outer.addColorStop(0.85, `rgba(${r},${g},${b},${0.035 * glow})`);
    outer.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = outer;
    ctx.fill();

    // 3. Inner membrane
    this.membranePath(ctx, cx, cy, R * 0.78, tt * 1.3, 3, 0.05);
    const inner = ctx.createRadialGradient(cx - R * 0.06, cy - R * 0.12, 0, cx, cy, R * 0.72);
    inner.addColorStop(0, `rgba(255,236,200,${0.5 * glow})`);
    inner.addColorStop(0.5, `rgba(${r},${g},${b},${0.3 * glow})`);
    inner.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = inner;
    ctx.fill();

    // 4. Soft internal turbulence: a few slow warm eddies
    for (let i = 0; i < 3; i++) {
      const ph = this.orbPhases[2 + i]!;
      const a = tt * (0.07 + i * 0.03) + ph;
      const d = R * (0.18 + 0.1 * Math.sin(tt * 0.2 + ph));
      const ex = cx + Math.cos(a) * d;
      const ey = cy + Math.sin(a) * d * 0.9;
      const er = R * (0.35 + 0.08 * i);
      const eddy = ctx.createRadialGradient(ex, ey, 0, ex, ey, er);
      eddy.addColorStop(0, `rgba(255,214,150,${0.09 * glow})`);
      eddy.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = eddy;
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Warm central point
    const core = ctx.createRadialGradient(cx, cy - R * 0.06, 0, cx, cy, R * 0.34);
    core.addColorStop(0, `rgba(255,248,232,${Math.min(1, 0.85 * glow + 0.1)})`);
    core.addColorStop(0.35, `rgba(255,226,170,${0.45 * glow})`);
    core.addColorStop(1, 'rgba(255,226,170,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.34, 0, Math.PI * 2);
    ctx.fill();

    // 6. Restrained specular rim
    ctx.globalCompositeOperation = 'source-over';
    this.membranePath(ctx, cx, cy, R * 1.02, tt, 0, 0.03);
    ctx.strokeStyle = `rgba(255,240,220,${0.045 * glow})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
  }

  private membranePath(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    R: number,
    t: number,
    phaseOffset: number,
    amplitude: number,
  ): void {
    const steps = 64;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const deform =
        Math.sin(2 * th + t * 0.21 + this.orbPhases[(phaseOffset + 1) % 8]!) * amplitude +
        Math.sin(3 * th - t * 0.17 + this.orbPhases[(phaseOffset + 2) % 8]!) * amplitude * 0.6 +
        Math.sin(5 * th + t * 0.11 + this.orbPhases[(phaseOffset + 3) % 8]!) * amplitude * 0.3;
      const rr = R * (1 + deform);
      const x = cx + Math.cos(th) * rr;
      const y = cy + Math.sin(th) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  private drawSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: RGB,
    softness: number,
    alpha: number,
  ): void {
    const sprite = this.sprite(color, softness);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }

  private sprite(color: RGB, softness: number): HTMLCanvasElement {
    const q = (v: number) => Math.round(v / 12) * 12;
    const soft = Math.round(softness * 4) / 4;
    const key = `${q(color[0])},${q(color[1])},${q(color[2])},${soft}`;
    let sprite = this.sprites.get(key);
    if (sprite) return sprite;
    if (this.sprites.size >= MAX_SPRITES) {
      const oldest = this.sprites.keys().next().value;
      if (oldest !== undefined) this.sprites.delete(oldest);
    }
    sprite = document.createElement('canvas');
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const sctx = sprite.getContext('2d');
    if (sctx) {
      const c = SPRITE_SIZE / 2;
      const grad = sctx.createRadialGradient(c, c, 0, c, c, c);
      const [r, g, b] = [q(color[0]), q(color[1]), q(color[2])];
      const coreStop = 0.18 + (1 - soft) * 0.22;
      grad.addColorStop(0, `rgba(255,250,240,${0.9 - soft * 0.5})`);
      grad.addColorStop(coreStop * 0.5, `rgba(${r},${g},${b},0.95)`);
      grad.addColorStop(coreStop + soft * 0.3, `rgba(${r},${g},${b},${0.35 + (1 - soft) * 0.2})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    }
    this.sprites.set(key, sprite);
    return sprite;
  }
}

function mixColor(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Adaptive particle budget: fewer on small or low-power devices, or with reduced density. */
export function particleBudget(options: { width: number; reducedDensity: boolean }): number {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  let budget = options.width < 640 ? 150 : options.width < 1200 ? 210 : 260;
  if (cores <= 4) budget *= 0.75;
  if (options.reducedDensity) budget *= 0.5;
  return Math.round(budget);
}
