# ADR 0003 — Custom Canvas2D renderer instead of WebGL/Three.js

**Status:** accepted · 2026-09-14

## Context
The signature visuals (breath orb, weather fields, sky, scribble) depend on soft additive light, not
geometry or shaders. Mobile performance and bundle size matter; LCP must not depend on the art.

## Decision
A small custom Canvas2D renderer (`lib/generative/field-renderer.ts`) with cached radial sprites,
additive compositing, ≤ 260 particles adapted to device, DPR ≤ 2, fps caps, off-screen/hidden pausing,
and a static-frame mode for reduced motion. Scenes are pure parameter objects interpolated over time.

## Consequences
- No 3D dependency; the whole generative layer is a few kilobytes and dynamically imported.
- Some effects (true blur, bloom) are approximated with sprite softness. WebGL can be introduced later
  behind the same `FieldParams` interface if a measurable aesthetic gain justifies it.
- Destination-out trail fading was rejected: 8-bit alpha residue accumulates into a visible haze.
