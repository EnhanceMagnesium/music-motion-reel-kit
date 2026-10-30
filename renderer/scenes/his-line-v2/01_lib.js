// His Line v2 — math/easing helpers.
// ADAPTED from lemomo-ai/lemo-opuscar @ b65efe6ea393fdc71212898ea4c57c754cfefa46, core/lib.js (MIT, (c) 2026 LemoLab):
//   clamp, lerp, seg, ss, eio, eo, ei, back, spring, mulberry, hash, vnoise, TAU, monotone, track, env. Changes: wrapped as
//   HL.m (no ES-module export), Chinese comments removed. Added (original): expoOut, ioExpo, mix, ring.
// MIT notice: see productions/his-line/ASSET_AND_SOURCE_MANIFEST_v2.md and source-library/licenses/R03_lemomo-ai__lemo-opuscar_LICENSE.
HL.module('lib', ['core'], HL => {
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const eo = t => 1 - Math.pow(1 - clamp(t), 3);
  const ei = t => Math.pow(clamp(t), 3);
  const back = (t, s = 1.8) => { t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s); };
  const spring = (t, k = 7, z = .35) => { t = Math.max(0, t); return 1 - Math.exp(-z * k * t) * Math.cos(k * Math.sqrt(1 - z * z) * t * 1.6); };
  function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  const vnoise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); };
  const TAU = Math.PI * 2;
  function monotone(keys) {
    const n = keys.length, xs = keys.map(k => k[0]), ys = keys.map(k => k[1]);
    if (n === 1) return () => ys[0];
    const d = [], mm = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    mm[0] = d[0]; mm[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) mm[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { mm[i] = mm[i + 1] = 0; continue; }
      const a = mm[i] / d[i], b = mm[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); mm[i] = k * a * d[i]; mm[i + 1] = k * b * d[i]; }
    }
    return t => {
      if (t <= xs[0]) return ys[0]; if (t >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (t > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * mm[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * mm[i + 1];
    };
  }
  function track(keys) {
    const dim = keys[0][1].length, fs = [];
    for (let j = 0; j < dim; j++) fs.push(monotone(keys.map(k => [k[0], k[1][j]])));
    return t => fs.map(f => f(t));
  }
  const env = (t, a, b, fi = .3, fo = .3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
  // --- original additions ---
  const expoOut = x => { x = clamp(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); };
  const ioExpo = x => { x = clamp(x); return x === 0 ? 0 : x === 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2; };
  const hx = h => { h = h.replace('#', ''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };
  // damped kick at event time t0 (decays); sums over a list of event times
  const kick = (t, t0, k = 14, w = 60) => t < t0 ? 0 : Math.exp(-k * (t - t0)) * Math.cos(w * (t - t0));
  HL.m = { clamp, lerp, seg, ss, eio, eo, ei, back, spring, mulberry, hash, vnoise, TAU, monotone, track, env, expoOut, ioExpo, mix, kick };
});
