// r06-critter-rig.mjs — browser adaptation of the R06 "critter" rig (a blocky hero with squash/stretch, run, jump, punch, kick, hurt, aura)
// plus a scene-facing, seek-safe pose track.
// Source: buildwithhanif/claude-animation-skill @ 4ddb8c80fdec96dc9f55d4b9bdee60bde6f0134b, MIT, (c) 2026 Hanif (@hanifproduktif)
//   plugins/claude-animation/skills/claude-animation/lib/rigs/critter.mjs  (function `critter`, body adapted as stated below)
//   plugins/claude-animation/skills/claude-animation/lib/core.mjs          (clamp, lerp, rad, rrect, poly, ellipse, stroke, fill, line, hatch, INK, bodies unchanged except hatch/line)
// License text: provenance/licenses/R06-LICENSE. Hashes/records: provenance/PROVENANCE.json.
// INTENTIONAL ADAPTATION (the only changes to the pinned bodies):
//   1. every ctx.save() ... ctx.restore() pair is written scoped(ctx, () => {...}) = save(); try { ... } finally { restore(); }, in critter(), line() and
//      hatch(), so a throwing draw call cannot leak transform/alpha/clip state (same fix as r06-burst-particles.mjs). Success-path Canvas call
//      sequence is identical to the original; tests/verify-production.mjs compares recorded traces against the pinned text.
//   2. imports of "@napi-rs/canvas" (core.mjs) are not carried: this module is Canvas2D-host only and needs no canvas creation.
//   3. `at` (imported by the original but unused by critter) is not carried.
// DETERMINISM: critter() is a pure function of (ctx state, x, y, s, pose): no Math.random, no Date, no hidden state. The original reads `pose.t`
// only for the aura's flame wobble; createCritterRig() passes the scene-local time there.
// COORDINATES: critter local space faces +x, origin on the ground under the body centre, feet on y = 0, body 130 x 100 at s = 1 (pixels, y down).
// The scene-facing API places it in NATIVE SCREEN PIXELS of the overlay Canvas2D context (the overlay layer is unscaled and untranslated).

// ---- R06 core.mjs helper closure -------------------------------------------------------------------------------------------------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const rad = (d) => d * Math.PI / 180;
const INK = "#1E1612";
const rrect = (x, y, w, h, r) => { const p = [], k = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
  for (const [cx, cy, a0] of k) for (let i = 0; i <= 4; i++) { const a = rad(a0 + i * 22.5); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; };
function scoped(ctx, fn) { ctx.save(); try { fn(); } finally { ctx.restore(); } }                      // adaptation 1
function poly(ctx, pts, close = true) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (close) ctx.closePath(); }
function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), rot, 0, Math.PI * 2); }
function stroke(ctx, w = 3, c = INK) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); }
function fill(ctx, c) { ctx.fillStyle = c; ctx.fill(); }
function line(ctx, pts, w = 2, c = INK, dash = null) { scoped(ctx, () => { if (dash) ctx.setLineDash(dash); poly(ctx, pts, false); stroke(ctx, w, c); }); }
function hatch(ctx, clipFn, ang, gap, c, w = 1, a = .35, box = [-600, -600, 2600, 2600]) {
  scoped(ctx, () => { clipFn(); ctx.clip(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.globalAlpha *= a;
    const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0);
    ctx.translate(cx, cy); ctx.rotate(ang); ctx.beginPath(); for (let d = -R; d < R; d += gap) { ctx.moveTo(-R, d); ctx.lineTo(R, d); } ctx.stroke(); });
}

// ---- R06 critter (body from rigs/critter.mjs; pairs wrapped per adaptation 1) ------------------------------------------------------
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(clamp(k > 0 ? v + (255 - v) * k : v * (1 + k), 0, 255))); return `rgb(${c.join(",")})`; }

export function critter(ctx, x, y, s = 1, p = {}) {
  const col = p.color || "#D97757", flip = !!p.flip, sq = p.sq ?? 1, crouch = p.crouch || 0, face = p.face || "normal", t = p.t || 0;
  const BW = 130 * Math.sqrt(sq), BH = 100 / Math.sqrt(sq) * (1 - crouch * .18), LEG = p.air ? 8 : 14 * (1 - crouch * .5), cy = -LEG - BH / 2;
  scoped(ctx, () => { ctx.translate(x, y); ctx.scale(s * (flip ? -1 : 1), s);
    // aura behind everything
    if (p.aura > 0) { const a = p.aura, g = ctx.createRadialGradient(0, cy, 20, 0, cy, 170 + 40 * a); g.addColorStop(0, `rgba(255,190,110,${.55 * a})`); g.addColorStop(1, "rgba(255,190,110,0)"); ctx.fillStyle = g; ctx.fillRect(-260, cy - 260, 520, 520);
      for (let i = 0; i < 9; i++) { const u = i / 9, fx = -BW / 2 - 10 + u * (BW + 20), h = (60 + 50 * Math.abs(Math.sin(t * 9 + i * 1.7))) * a;
        ctx.beginPath(); ctx.moveTo(fx - 14, -LEG); ctx.quadraticCurveTo(fx - 18, -LEG - h * .6, fx + Math.sin(t * 7 + i) * 8, -LEG - BH - h * .4); ctx.quadraticCurveTo(fx + 18, -LEG - h * .6, fx + 14, -LEG); ctx.closePath();
        ctx.fillStyle = `rgba(255,${150 + (i % 3) * 30},70,${.35 * a})`; ctx.fill(); } }
    // contact shadow
    if (!p.air) scoped(ctx, () => { ctx.globalAlpha *= .25; ellipse(ctx, 0, 2, BW * .62, 8); fill(ctx, "#2A1A10"); });
    scoped(ctx, () => { if (p.rot) { ctx.translate(0, cy); ctx.rotate(p.rot); ctx.translate(0, -cy); }
      // legs: four stubs, far pair darker; running alternates pairs
      const run = p.gait !== undefined, ph = p.gait || 0;
      const legX = [-44, -16, 16, 44];
      legX.forEach((lx, i) => { const far = i % 2 === 1, pair = (i === 0 || i === 3) ? 0 : 1, sw = run ? Math.sin(ph + pair * Math.PI) : 0;
        const lift = run ? Math.max(0, Math.cos(ph + pair * Math.PI)) * 10 : 0, kx = (p.kick && i === 3) ? p.kick * 60 : 0, ky = (p.kick && i === 3) ? -p.kick * 30 : 0;
        const L = p.air ? LEG + 4 : LEG, x0 = lx * (BW / 130) + sw * 12, y0 = -L - lift * .5;
        if (kx) { poly(ctx, rrect(x0 - 8, -L - 10, 16 + kx, 16, 6)); fill(ctx, shade(col, -.15)); stroke(ctx, 2.6); poly(ctx, rrect(x0 + kx - 4, -L - 16 + ky * .2, 22, 26, 7)); fill(ctx, shade(col, .05)); stroke(ctx, 2.8); return; }
        poly(ctx, rrect(x0 - 8, y0 - 4, 16, L + 4 - lift * .5, 4)); fill(ctx, far ? shade(col, -.35) : shade(col, -.15)); stroke(ctx, 2.6); });
      // rear arm
      const arm = (front, jab) => { const ax = front ? BW / 2 - 6 : -BW / 2 + 6, ay = cy + 8, up = p.arms === "up", guard = p.arms === "guard";
        const ext = jab * 78, ex = ax + (front ? 1 : -1) * (up ? 4 : 10) + (front ? ext : ext * .6 * (front ? 1 : 1)), ey = up ? ay - 48 : guard ? ay - 18 : ay + 6 - jab * 6;
        const fx = front ? ex : (jab > 0 ? ax + ext : ex);
        scoped(ctx, () => { poly(ctx, rrect(Math.min(ax, fx) - 2, ey - 10, Math.abs(fx - ax) + 4 + 16, 20, 8)); fill(ctx, shade(col, front ? -.05 : -.3)); stroke(ctx, 2.6);
          if (jab > .3) { poly(ctx, rrect(fx + 4, ey - 15, 30, 30, 9)); fill(ctx, shade(col, .1)); stroke(ctx, 3); line(ctx, [[fx + 12, ey - 6], [fx + 12, ey + 6]], 2, "rgba(30,20,15,.5)"); } }); };
      arm(false, p.punchBack || 0);
      // body: gradient + pixel grid + hatch + rim + specular
      const B = rrect(-BW / 2, cy - BH / 2, BW, BH, 20);
      const g = ctx.createLinearGradient(-BW / 2, cy - BH / 2, BW / 2, cy + BH / 2); g.addColorStop(0, shade(col, .28)); g.addColorStop(.55, col); g.addColorStop(1, shade(col, -.28));
      poly(ctx, B); fill(ctx, g);
      scoped(ctx, () => { poly(ctx, B); ctx.clip();
        ctx.strokeStyle = "rgba(90,35,15,.12)"; ctx.lineWidth = 1.2; for (let gx = -BW / 2; gx < BW / 2; gx += 13) { ctx.beginPath(); ctx.moveTo(gx, cy - BH / 2); ctx.lineTo(gx, cy + BH / 2); ctx.stroke(); } for (let gy = cy - BH / 2; gy < cy + BH / 2; gy += 13) { ctx.beginPath(); ctx.moveTo(-BW / 2, gy); ctx.lineTo(BW / 2, gy); ctx.stroke(); }
        hatch(ctx, () => { ctx.beginPath(); ctx.rect(-BW / 2, cy + BH * .1, BW, BH); }, rad(-50), 6, "#7A2E14", 1, .3, [-BW / 2, cy, BW / 2, cy + BH / 2]);
        line(ctx, [[-BW / 2 + 14, cy + BH / 2 - 7], [BW / 2 - 14, cy + BH / 2 - 7]], 4, "rgba(255,210,170,.5)"); });
      poly(ctx, B); stroke(ctx, 3.4);
      poly(ctx, rrect(-BW / 2 + 12, cy - BH / 2 + 9, BW * .32, 10, 5)); fill(ctx, "rgba(255,255,255,.55)");
      // eyes (side view: both on the front half)
      const ex = [BW * .1, BW * .34], eyY = cy - BH * .06;
      const eye = (xx) => {
        if (face === "blink") line(ctx, [[xx - 7, eyY + 4], [xx + 7, eyY + 4]], 4);
        else if (face === "happy") { ctx.beginPath(); ctx.moveTo(xx - 9, eyY + 6); ctx.lineTo(xx, eyY - 6); ctx.lineTo(xx + 9, eyY + 6); stroke(ctx, 4.4); }
        else if (face === "hurt") { line(ctx, [[xx - 8, eyY - 8], [xx + 8, eyY + 8]], 4); line(ctx, [[xx + 8, eyY - 8], [xx - 8, eyY + 8]], 4); }
        else { const tall = face === "surprised" ? 32 : face === "focus" ? 16 : 26, w = face === "surprised" ? 15 : 13;
          poly(ctx, rrect(xx - w / 2, eyY - tall / 2, w, tall, 4)); fill(ctx, "#1A120E"); ellipse(ctx, xx - 2, eyY - tall / 2 + 6, 3, 4); fill(ctx, "#fff");
          if (face === "angry" || face === "focus") line(ctx, [[xx - 12, eyY - tall / 2 - 12 + (xx > BW * .2 ? 6 : 0)], [xx + 12, eyY - tall / 2 - 12 + (xx > BW * .2 ? 0 : 6)]], 5); } };
      ex.forEach(eye);
      if (face === "surprised") { ctx.font = "bold 64px sans-serif"; ctx.fillStyle = INK; ctx.fillText("!", BW * .2, cy - BH / 2 - 26); }
      if (face === "happy" || face === "hurt") { ellipse(ctx, BW * .44, cy + BH * .22, 9, 5); fill(ctx, "rgba(229,72,77,.45)"); }
      // front arm on top
      arm(true, p.punch || 0);
      // hit flash
      if (p.flash > 0) scoped(ctx, () => { ctx.globalAlpha *= p.flash; poly(ctx, B); fill(ctx, "#FFFFFF"); });
    });
  });
}

// ---- scene-facing API ------------------------------------------------------------------------------------------------------------
export const CRITTER_FACES = Object.freeze(["normal", "blink", "happy", "angry", "hurt", "surprised", "focus"]);
export const CRITTER_ARMS = Object.freeze(["rest", "up", "guard"]);
const NUMERIC = ["sq", "rot", "punch", "punchBack", "kick", "crouch", "aura", "flash"];       // eased between keyframes
const DISCRETE = ["face", "arms", "air", "flip", "run", "color"];                              // held from the earlier keyframe
const smooth = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
const bad = (m) => { throw new RangeError("critter rig: " + m); };

/**
 * createCritterRig({ poseTrack, gaitRate = 14 })
 *   poseTrack  [{ t, ...pose }] keyframes in SCENE-LOCAL seconds (ascending, unique). Pose keys: sq rot punch punchBack kick crouch aura flash (numbers, smoothstep-eased
 *              between keyframes) and face arms air flip run color (held from the earlier keyframe). `run:true` runs the gait at gaitRate rad/s, phase = gaitRate * t (closed form).
 *              Before the first / after the last keyframe the pose is held.
 *   -> { poseAt(localT) -> critter pose, draw(ctx, st, placement) }
 *   placement  { x, groundY, scale = 1 } where x / groundY / scale may each be a number or (st) => number, in native screen pixels of the overlay context.
 * INPUTS: ctx = overlay Canvas2D context (screen pixels), st = SceneTime from scene-runtime (only st.localT is read). OUTPUT LAYER: the overlay layer above the painted frame.
 * CLOCK: scene-local seconds; every call is a pure function of (poseTrack, st.localT, placement): arbitrary-time seekable, no carried state.
 */
export function createCritterRig({ poseTrack, gaitRate = 14 } = {}) {
  if (!Array.isArray(poseTrack) || !poseTrack.length) bad("poseTrack must be a non-empty array of keyframes");
  if (!(typeof gaitRate === "number" && Number.isFinite(gaitRate))) bad("gaitRate must be a finite number");
  const keys = poseTrack.map((k, i) => {
    if (!k || typeof k !== "object" || typeof k.t !== "number" || !Number.isFinite(k.t)) bad(`poseTrack[${i}].t must be a finite number`);
    for (const key of Object.keys(k)) if (key !== "t" && !NUMERIC.includes(key) && !DISCRETE.includes(key)) bad(`poseTrack[${i}] has unknown pose key "${key}"`);
    for (const n of NUMERIC) if (k[n] !== undefined && !(typeof k[n] === "number" && Number.isFinite(k[n]))) bad(`poseTrack[${i}].${n} must be a finite number`);
    if (k.face !== undefined && !CRITTER_FACES.includes(k.face)) bad(`poseTrack[${i}].face must be one of ${CRITTER_FACES.join(", ")}`);
    if (k.arms !== undefined && !CRITTER_ARMS.includes(k.arms)) bad(`poseTrack[${i}].arms must be one of ${CRITTER_ARMS.join(", ")}`);
    if (k.color !== undefined && !/^#[0-9a-f]{6}$/i.test(k.color)) bad(`poseTrack[${i}].color must be a #rrggbb string (the rig derives shades from it)`);
    return Object.freeze({ ...k });
  });
  for (let i = 1; i < keys.length; i++) if (!(keys[i].t > keys[i - 1].t)) bad(`poseTrack times must be strictly ascending (index ${i})`);
  const ops = (v) => typeof v === "function" ? v : () => v;
  function poseAt(localT) {
    if (typeof localT !== "number" || !Number.isFinite(localT)) bad(`localT must be a finite number, got ${localT}`);
    let i = 0; while (i + 1 < keys.length && localT >= keys[i + 1].t) i++;
    const pose = { t: localT };
    const prev = (n) => { for (let j = i; j >= 0; j--) if (keys[j][n] !== undefined) return keys[j]; return undefined; };
    for (const n of NUMERIC) {
      const a = prev(n); if (!a) continue;
      const b = keys.slice(i + 1).find((q) => q[n] !== undefined);
      pose[n] = b ? lerp(a[n], b[n], smooth((localT - a.t) / (b.t - a.t))) : a[n];
    }
    for (const n of DISCRETE) { const a = prev(n); if (a && n !== "run") pose[n] = a[n]; }
    const r = prev("run"); if (r && r.run) pose.gait = gaitRate * localT;
    return pose;
  }
  return Object.freeze({
    poseAt,
    draw(ctx, st, placement = {}) {
      const px = ops(placement.x), py = ops(placement.groundY), ps = ops(placement.scale ?? 1);
      critter(ctx, px(st), py(st), ps(st), poseAt(st.localT));
    },
  });
}
