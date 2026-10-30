// Pure geometry for the technical fixture: seeded carved rays, a hand-cut border and a few stab flecks. Depends only on width, height, seed and
// parameters (never on a frame, Math.random or previous calls). DOM- and React-free so Node checks can run it.
import { cutAlong, flecks, rays, rect } from '../../../adapters/remotion/woodcut/index.mjs';
import { mulberry } from '../../../adapters/remotion/woodcut/lib.mjs';

export const FIXTURE_GEOMETRY_VERSION = 1;

export function buildFixtureGeometry({ width, height, seed, params, derive }) {
  const m = Math.min(width, height);
  const cx = width / 2, cy = height * 0.42, inset = m * 0.05;
  const rayStrokes = rays(cx, cy, {
    n: params.rayCount ?? 28, r0: m * 0.06, r1: [m * 0.28, m * 0.46], w: m * 0.028, seed: derive('rays') % 100000,
    reveal: { t0: 0.1, t1: 1.0, jit: 0.2 },
  });
  const border = cutAlong(rect(inset, inset, width - 2 * inset, height - 2 * inset), {
    closed: true, w: m * 0.006, seg: [m * 0.05, m * 0.14], gap: [1, m * 0.006], seed: derive('border') % 100000, reveal: { t0: 0.3, t1: 1.4, speed: 900 },
  });
  const rnd = mulberry(derive('fleck-points'));
  const points = Array.from({ length: 24 }, () => [width * (0.12 + 0.76 * rnd()), height * (0.74 + 0.18 * rnd())]);
  const fleckStrokes = flecks(points, { r: m * 0.006, seed: derive('fleck-shapes') % 100000 });
  fleckStrokes.forEach((s, i) => { s.t0 = 0.8 + 0.02 * i; s.dur = 0.12; });
  return { strokes: { border, rays: rayStrokes, flecks: fleckStrokes }, center: [cx, cy], radius: m * 0.2 };
}
