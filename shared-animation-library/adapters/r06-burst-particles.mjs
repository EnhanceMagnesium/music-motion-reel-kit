// r06-burst-particles.mjs — browser adaptation of R06 burstParticles (spark, debris, dust, confetti, ember).
// Source: buildwithhanif/claude-animation-skill @ 4ddb8c80fdec96dc9f55d4b9bdee60bde6f0134b, MIT, (c) 2026 Hanif (@hanifproduktif)
//   plugins/claude-animation/skills/claude-animation/lib/fx.mjs  (burstParticles, copied verbatim as `burstParticles`)
//   plugins/claude-animation/skills/claude-animation/lib/core.mjs (clamp, rng, ellipse, line, poly, fill, stroke, at, INK)
// License text: provenance/licenses/R06-LICENSE. Hashes: provenance/PROVENANCE.json.
// INTENTIONAL ADAPTATION (the only change to the pinned bodies): every save()...restore() pair is wrapped as
//   save(); try { ...body... } finally { restore(); }
// in line(), at() and the per-particle block of burstParticles, so a drawing call that throws cannot leave nested Canvas saves
// (and their modified alpha / transform / composite state) behind. On the success path the recorded Canvas call sequence is
// identical to the original; tests/verify.mjs checks that by reversing exactly this textual change and comparing with the pinned source.
// No native Canvas, Node or DOM imports; no p5 or Math.random. Draws only into a caller-supplied Canvas2D context.
import { sourceToVideoSeconds } from '../numeric/timebase.mjs';

// ---- exact R06 helper closure (bodies unchanged) --------------------------------------------------------------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const rng = (seed) => { let s = Math.max(1, Math.floor(seed)) % 2147483647; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const INK = "#1E1612";
function poly(ctx, pts, close = true) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (close) ctx.closePath(); }
function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), rot, 0, Math.PI * 2); }
function stroke(ctx, w = 3, c = INK) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); }
function fill(ctx, c) { ctx.fillStyle = c; ctx.fill(); }
function line(ctx, pts, w = 2, c = INK, dash = null) { ctx.save(); try { if (dash) ctx.setLineDash(dash); poly(ctx, pts, false); stroke(ctx, w, c); } finally { ctx.restore(); } }
function at(ctx, x, y, s, r, fn) { ctx.save(); try { ctx.translate(x, y); if (r) ctx.rotate(r); if (s !== 1) ctx.scale(s, s); fn(); } finally { ctx.restore(); } }

// ---- R06 burstParticles (verbatim) -----------------------------------------------------------------------------
// kind: "spark" (streaks), "debris" (tumbling chunks), "dust" (puffs), "confetti", "ember" (rising glow)
export function burstParticles(ctx, t, t0, x, y, o = {}) {
  const d = t - t0, { n = 14, speed = 520, life = .6, gravity = 900, colors = ["#FFD35A", "#FFF3C4", "#F28C28"], size = 8, kind = "spark", seed = 1, spread = Math.PI * 2, dir = -Math.PI / 2 } = o;
  if (d < 0 || d > life * 1.6) return;
  const r = rng(seed * 977 + Math.floor(t0 * 1000));
  for (let i = 0; i < n; i++) {
    const a = dir + (r() - .5) * spread, sp = speed * (.45 + r() * .75), L = life * (.6 + r() * .6), dd = Math.min(d, L), fade = 1 - clamp(d / L);
    if (fade <= 0) { r(); r(); continue; }
    const px = x + Math.cos(a) * sp * dd, py = y + Math.sin(a) * sp * dd + (kind === "ember" ? -gravity * .3 * dd * dd : .5 * gravity * dd * dd), col = colors[i % colors.length], sz = size * (.6 + r() * .8);
    ctx.save(); try { ctx.globalAlpha *= fade;
    if (kind === "spark") { const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp + gravity * dd, vl = Math.hypot(vx, vy) || 1; line(ctx, [[px, py], [px - vx / vl * sz * 3, py - vy / vl * sz * 3]], sz * .55, col); }
    else if (kind === "debris") { at(ctx, px, py, 1, d * (6 + i), () => { poly(ctx, [[-sz, -sz * .6], [sz * .8, -sz], [sz, sz * .7], [-sz * .7, sz]]); fill(ctx, col); stroke(ctx, 1.8); }); }
    else if (kind === "dust") { const s2 = sz * (1 + d * 3); ellipse(ctx, px, py, s2, s2 * .7); fill(ctx, col); }
    else if (kind === "confetti") { at(ctx, px, py, 1, d * 8 + i, () => { ctx.scale(Math.cos(d * 10 + i), 1); ctx.fillStyle = col; ctx.fillRect(-sz / 2, -sz * .7, sz, sz * 1.4); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.strokeRect(-sz / 2, -sz * .7, sz, sz * 1.4); }); }
    else if (kind === "ember") { const g = ctx.createRadialGradient(px, py, 0, px, py, sz * 2); g.addColorStop(0, col); g.addColorStop(1, "rgba(255,200,80,0)"); ctx.fillStyle = g; ctx.fillRect(px - sz * 2, py - sz * 2, sz * 4, sz * 4); }
    } finally { ctx.restore(); }
  }
}

// ---- adapter-owned layer (validation, seeds, cue conversion, ordering) -----------------------------------------
export const PARTICLE_KINDS = Object.freeze(["spark", "debris", "dust", "confetti", "ember"]);
export const PARTICLE_DEFAULTS = Object.freeze({ n: 14, speed: 520, life: .6, gravity: 900, colors: Object.freeze(["#FFD35A", "#FFF3C4", "#F28C28"]), size: 8, kind: "spark", seed: 1, spread: Math.PI * 2, dir: -Math.PI / 2 });
const OPTION_KEYS = new Set(Object.keys(PARTICLE_DEFAULTS));
export const ACTIVE_LIFE_FACTOR = 1.6;   // a burst is drawable on [at, at + life * 1.6]

// Documented stable seed derivation: FNV-1a (32-bit) over the UTF-16 code points of `${productionSeed}|${eventId}`,
// mapped to 1 + h % 16777215 (range 1..2^24-1). Depends only on production seed and event id — never on call order.
export function deriveEventSeed(productionSeed, eventId) {
  let h = 2166136261; for (const ch of `${productionSeed}|${eventId}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return 1 + ((h >>> 0) % 16777215);
}

const fin = (v) => typeof v === "number" && Number.isFinite(v);
function fail(id, msg) { throw new RangeError(`particle event ${JSON.stringify(id)}: ${msg}`); }
function validateOptions(id, o) {
  for (const k of Object.keys(o)) if (!OPTION_KEYS.has(k)) fail(id, `unknown option "${k}"`);
  const v = { ...PARTICLE_DEFAULTS, ...Object.fromEntries(Object.entries(o).filter(([, x]) => x !== undefined)) };
  if (!PARTICLE_KINDS.includes(v.kind)) fail(id, `unsupported kind ${JSON.stringify(v.kind)}`);
  if (!Number.isInteger(v.n) || v.n < 0) fail(id, "n must be an integer >= 0");
  for (const k of ["speed", "gravity", "size"]) if (!fin(v[k]) || v[k] < 0) fail(id, `${k} must be a finite number >= 0`);
  if (!fin(v.life) || v.life <= 0) fail(id, "life must be a finite number > 0");
  for (const k of ["spread", "dir"]) if (!fin(v[k])) fail(id, `${k} must be finite`);
  if (!Array.isArray(v.colors) || !v.colors.length || v.colors.some((c) => typeof c !== "string" || !c.trim())) fail(id, "colors must be a non-empty array of CSS color strings");
  if (!Number.isSafeInteger(v.seed)) fail(id, "seed must be a safe integer");
  return v;
}

/**
 * createParticleLayer({ events, seed, sourceAudioOffsetSeconds })
 *  events[]: { id, atVideoSeconds | atSourceSeconds, x, y, options? }   (x/y native screen pixels, right/down positive)
 *  seed: production seed. If given, events without options.seed get deriveEventSeed(seed, id); if omitted they keep R06's default 1.
 *  Cues given as atSourceSeconds are converted ONCE here: video = source - sourceAudioOffsetSeconds.
 * Returns { draw({ctx, videoSeconds, width, height}), events (frozen resolved list), isActive(videoSeconds) }.
 */
export function createParticleLayer({ events = [], seed, sourceAudioOffsetSeconds = 0 } = {}) {
  if (!Array.isArray(events)) throw new TypeError("events must be an array");
  if (seed !== undefined && !Number.isSafeInteger(seed)) throw new RangeError("production seed must be a safe integer");
  const seen = new Set(), list = [];
  for (const e of events) {
    const id = e && e.id;
    if (typeof id !== "string" || !id) fail(id, "id must be a non-empty string");
    if (seen.has(id)) fail(id, "duplicate id"); seen.add(id);
    if ((e.atVideoSeconds === undefined) === (e.atSourceSeconds === undefined)) fail(id, "give exactly one of atVideoSeconds / atSourceSeconds");
    const at0 = e.atVideoSeconds !== undefined ? e.atVideoSeconds : sourceToVideoSeconds(e.atSourceSeconds, sourceAudioOffsetSeconds);
    if (!fin(at0)) fail(id, "event time must be finite");
    if (!fin(e.x) || !fin(e.y)) fail(id, "x and y must be finite");
    const opts = validateOptions(id, e.options || {});
    const user = e.options || {};
    let useSeed = user.seed !== undefined ? user.seed : seed !== undefined ? deriveEventSeed(seed, id) : PARTICLE_DEFAULTS.seed;
    opts.seed = useSeed;
    // R06's rng() collapses to an all-zero stream when floor(seed*977 + floor(t0*1000)) is a multiple of 2147483647.
    const s0 = Math.max(1, Math.floor(useSeed * 977 + Math.floor(at0 * 1000))) % 2147483647;
    if (s0 === 0) fail(id, "seed/time combination gives a degenerate R06 random stream; choose another seed");
    // Options handed to the verbatim kernel: only what the caller set (so source defaults apply), plus the resolved seed.
    const passed = { ...Object.fromEntries(Object.entries(user).filter(([, x]) => x !== undefined)), seed: useSeed };
    if (passed.colors) passed.colors = Object.freeze([...passed.colors]);
    list.push(Object.freeze({ id, at: at0, x: e.x, y: e.y, life: opts.life, passed: Object.freeze(passed), resolved: Object.freeze(opts) }));
  }
  // Canonical painter order: time, then id. Input order and evaluation order cannot change output.
  list.sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  Object.freeze(list);
  const isActive = (t) => list.some((e) => t >= e.at && t <= e.at + e.life * ACTIVE_LIFE_FACTOR);
  return Object.freeze({
    events: list,
    isActive,
    draw({ ctx, videoSeconds, width, height } = {}) {
      if (!ctx || typeof ctx.save !== "function") throw new TypeError("ctx must be a Canvas2D context");
      if (!fin(videoSeconds)) throw new RangeError(`videoSeconds must be finite, got ${videoSeconds}`);
      if (!fin(width) || !fin(height) || width <= 0 || height <= 0) throw new RangeError("width and height must be positive finite numbers");
      for (const e of list) burstParticles(ctx, videoSeconds, e.at, e.x, e.y, e.passed);
    },
  });
}
