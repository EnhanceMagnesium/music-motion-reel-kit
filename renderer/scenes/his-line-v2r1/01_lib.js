// His Line v2r1 — math/easing helpers.
// ADAPTED from lemomo-ai/lemo-opuscar @ b65efe6ea393fdc71212898ea4c57c754cfefa46, core/lib.js (MIT, Copyright (c) 2026 LemoLab):
//   clamp, lerp, seg, ss, eio, eo, ei, back, spring, mulberry, hash, vnoise, TAU, monotone, track, env. Changes: wrapped as
//   HL.m (no ES-module export), Chinese comments removed.
// ADAPTED from buildwithhanif/claude-animation-skill @ 4ddb8c80fdec96dc9f55d4b9bdee60bde6f0134b, plugins/claude-animation/skills/claude-animation/lib/fx.mjs
//   shake() lines 20-26 (MIT, Copyright (c) 2026 Hanif (@hanifproduktif)) -> shakeN(). Changes: ES export removed, parameter names, returns a plain pair.
// ORIGINAL additions (guidance only): expoOut, ioExpo, hx, mix, kick (damped cosine at one event; informed by R01 ClaudeAnimationBase core.js spring/ring L59-60, not copied),
//   hold (sample-and-hold with bounded release; deliberately NOT R06 timeWarp, which delays later time), h2/rnd (per-index hashed constants).
//   NOT present in HL.m (v2 header claimed it): ring. (HL.print.ring is a different function.)
// MIT notices: source-library/adaptations/NOTICES.md; license copies in source-library/licenses/ (R03, R06).
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
  // decaying multi-event shake (adapted from R06 fx.mjs shake L20-26): events [[t0, amp], ...] -> [dx, dy]
  const shakeN = (t, events, dur = .45) => {
    let x = 0, y = 0;
    for (const [t0, amp] of events) { const d = t - t0; if (d < 0 || d > dur) continue; const k = Math.exp(-d * 9) * amp; x += Math.sin(d * 97 + t0) * k; y += Math.cos(d * 83 + t0 * 3) * k * .8; }
    return [x, y];
  };
  // sample-and-hold local clock. spans [[h0, h1, rel]]: inside [h0,h1) returns h0 (the channel holds its pose). After h1 the channel catches up over `rel` seconds with a smoothstep
  // so there is NO position jump at h1 (th(h1) = h0) and NO accumulated delay (th(t) = t for t >= h1 + rel). Pure function of t: any query order or direct seek gives the same value.
  const hold = (t, spans) => {
    let th = t;
    for (const [h0, h1, rel = 0] of spans) {
      if (t >= h0 && t < h1) return h0;
      if (rel > 0 && t >= h1 && t < h1 + rel) { const u = (t - h1) / rel, s = u * u * (3 - 2 * u); th = Math.min(th, t - (h1 - h0) * (1 - s)); }
    }
    return th;
  };
  // per-index hashed constants: independent of evaluation order, of other indices and of particle death (R06 burstParticles consumes a shared stream; this does not)
  const h2 = (seed, i, k) => hash(seed * 12.9898 + i * 78.233 + k * 37.719 + 5.31);
  HL.m = { clamp, lerp, seg, ss, eio, eo, ei, back, spring, mulberry, hash, vnoise, TAU, monotone, track, env, expoOut, ioExpo, mix, kick, shakeN, hold, h2 };
});
