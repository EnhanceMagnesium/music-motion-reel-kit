// His Line — scene module (2026-10-05). Printed-layer grammar (two spot inks on a paper wall; after
// lemo-opuscar styles, MIT, R03) + one kinetic action (seal cross; after opus-video-skills kinetic-reel, MIT, R02).
// Original code; no source files copied. Deterministic: every pixel is a pure function of t.
(() => {
// ---------- EXACT DISPLAY STRINGS (edit here only) ----------
const TEXT = {
  civic: 'civic chamber',              // label face
  mediaLuna: 'Media Luna',             // label face, inside deed
  upon: 'upon the wall',               // display face
  westman: 'the Westman’s line',  // display face, on deed
  arrives1: 'The seal arrives',        // display face (line 8, part 1)
  arrives2: 'right on time.',          // display face (line 8, part 2)
};
const CASE = s => s.toUpperCase();     // typographic treatment only; strings above stay exact

// ---------- PALETTE: two spot inks + ember (seal only) ----------
const C = { wall: '#232220', wallInk: '#2c2a27', bone: '#e7dfcc', boneDim: 'rgba(231,223,204,', ink: '#1f1d1b', inkWet: '#151311', ember: '#cf532a', emberDeep: '#9e3a1b' };
const W = 1080, H = 1920, CX = 540, CY = 900;
const DISPLAY = 'HL Display', LABEL = 'HL Label';

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const r = (t, a, b) => clamp((t - a) / (b - a));
const io = x => x * x * (3 - 2 * x);
const oc = x => 1 - Math.pow(1 - x, 3);
const ic = x => x * x * x;
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let T = null, grain = null, deedGrain = null, bars = null;
window.SCENE_INIT = (spec, cues) => {
  const L = Object.fromEntries(cues.lines.map(l => [l.id, l]));
  const S = Object.fromEntries(cues.story_cues.map(c => [c.id, c.t]));
  const st = id => cues.structure.find(x => x.event.startsWith(id)).t;
  T = { L2: L.L2.start, L3: L.L3.start, L4: L.L4.start, L5: L.L5.start, L6: L.L6.start, L7: L.L7.start, L8: L.L8.start,
        FIX: S.fixes, STOP: st('stop begins'), LAND: S.seal_land, AEND: S.end_hold, END: spec.duration };
  // printed grain (bone speckle on wall), fixed seed
  grain = document.createElement('canvas'); grain.width = 1400; grain.height = 2400;
  const g = grain.getContext('2d'), R = rng(7);
  for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(231,223,204,${0.02 + R() * 0.05})`; const s = 1 + R() * 2.2; g.fillRect(R() * 1400, R() * 2400, s, s); }
  deedGrain = document.createElement('canvas'); deedGrain.width = 700; deedGrain.height = 900;
  const d = deedGrain.getContext('2d'), R2 = rng(11);
  for (let i = 0; i < 9000; i++) { d.fillStyle = `rgba(60,52,44,${0.03 + R2() * 0.06})`; const s = 1 + R2() * 1.6; d.fillRect(R2() * 700, R2() * 900, s, s); }
  const R3 = rng(23); bars = [];
  for (let row = 0; row < 26; row++) { let x = 0; const segs = []; while (x < 1) { const w = .08 + R3() * .22; segs.push([x, Math.min(w, 1 - x)]); x += w + .025; } bars.push(segs); }
};

// registration kick: one jolt at the landing, decays over ~0.3 s
const kick = t => { const k = t - T.LAND; return k < 0 ? 0 : Math.exp(-k * 14) * Math.cos(k * 60); };

function wipeText(ctx, str, x, y, size, color, p, { face = DISPLAY, weight = '700', squeeze = .86, align = 'left', track = 0, maxW = 0 } = {}) {
  if (p <= 0) return 0;
  ctx.save();
  ctx.font = `${weight} ${size}px "${face}"`;
  if (maxW) { const w0 = ctx.measureText(str).width * squeeze; if (w0 > maxW) { size = Math.floor(size * maxW / w0); ctx.font = `${weight} ${size}px "${face}"`; } }
  if (track) ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(str).width * squeeze;
  const x0 = align === 'center' ? x - w / 2 : x;
  ctx.beginPath(); ctx.rect(x0 - 4, y - size, (w + 8) * clamp(p), size * 1.35); ctx.clip(); // cut mask
  ctx.translate(x0, y); ctx.scale(squeeze, 1);
  ctx.fillStyle = color; ctx.fillText(str, 0, 0);
  ctx.restore();
  return w;
}

function drawSeal(ctx, x, y, rad, rot, lift, landed, t) {
  ctx.save();
  if (lift > 0) { // charcoal shadow on the paper while lifted
    ctx.fillStyle = `rgba(10,9,8,${0.35 * lift})`;
    ctx.beginPath(); ctx.arc(x + 16 * lift, y + 26 * lift, rad * (1 + .04 * lift), 0, Math.PI * 2); ctx.fill();
  }
  if (landed > 0) { // ink squash ring pressed into the paper
    ctx.strokeStyle = C.ember; ctx.globalAlpha = .55 * landed; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(x, y, rad * (1.12 + .06 * (1 - landed)), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.translate(x - 10 * lift, y - 16 * lift); ctx.rotate(rot); const sc = 1 + .07 * lift; ctx.scale(sc, sc);
  ctx.fillStyle = C.ember; ctx.beginPath();
  const n = 28; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? rad : rad * .93; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.fill();
  const kx = kick(t) * 5; // second ink plate slightly out of register, snaps back
  ctx.strokeStyle = C.emberDeep; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(kx, 0, rad * .72, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(kx, 0, rad * .62, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.emberDeep; ctx.fillRect(-rad * .42 + kx, -5, rad * .84, 10); // the line the seal fixes
  ctx.beginPath(); ctx.arc(kx, -rad * .3, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

window.SCENES['his-line'] = (scene, p, spec, t) => {
  const ctx = window.ctx2d;
  const k = kick(t) * 9;
  // camera: slight settle in the intro; refrain widens the wall (one continuous wall)
  const intro = 1.035 - .035 * io(r(t, 0, T.L2));
  const widen = 1 - .1 * io(r(t, T.L5, T.L6));
  const cam = intro * widen;
  const drop = io(r(t, T.L7, T.L7 + 1.6));        // last line: secondary layers leave
  const keepSecondary = 1 - drop;

  // ---- WALL (charcoal paper) ----
  ctx.fillStyle = C.wall; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(CX, CY); ctx.scale(cam, cam); ctx.translate(-CX, -CY);
  // bone plate (offset = misregistration + kick)
  ctx.save(); ctx.translate(2 + k, 1);
  ctx.globalAlpha = .9 * keepSecondary + .25; ctx.drawImage(grain, -160, -240); ctx.globalAlpha = 1;
  // wall courses: horizontal joints + staggered vertical joints
  for (let i = -6; i < 18; i++) {
    const y = 1252 - i * 148; if (Math.abs(y - 1252) < 1) continue;
    ctx.fillStyle = C.boneDim + (0.07 * keepSecondary) + ')'; ctx.fillRect(-300, y, W + 600, 3);
    for (let j = -3; j < 9; j++) { const x = j * 260 + (i % 2 ? 130 : 0); ctx.fillRect(x, y - 145, 3, 145); }
  }
  ctx.restore();
  // THE COURSE the deed sits on: stays for the whole piece
  ctx.save(); ctx.translate(-k * .6, 0);
  ctx.fillStyle = C.boneDim + '.55)'; ctx.fillRect(-400, 1250, W + 800, 10);
  ctx.fillStyle = C.boneDim + '.18)'; ctx.fillRect(-400, 1272, W + 800, 3);
  ctx.restore();

  // label: civic chamber (wall, above deed)
  const deedTop = 560 - 90 * io(r(t, T.L6, T.L6 + 1.8)); // refrain lengthens the deed; bottom stays on the course
  const deedBot = 1238, dx0 = 200, dx1 = 880, dW = dx1 - dx0, dH = deedBot - deedTop;
  ctx.save(); ctx.globalAlpha = io(r(t, T.L2 + .2, T.L2 + 1.0)) * keepSecondary;
  ctx.font = `400 27px "${LABEL}"`; ctx.letterSpacing = '7px'; ctx.fillStyle = C.bone; ctx.textAlign = 'center';
  ctx.fillText(CASE(TEXT.civic), CX, deedTop - 34); ctx.restore();

  // ---- DEED (bone paper, charcoal ink) ----
  ctx.save(); ctx.translate(k * .4, 0);
  ctx.fillStyle = 'rgba(8,7,6,.45)'; ctx.fillRect(dx0 + 10, deedTop + 14, dW, dH); // hang shadow
  ctx.fillStyle = C.bone; ctx.fillRect(dx0, deedTop, dW, dH);
  ctx.save(); ctx.beginPath(); ctx.rect(dx0, deedTop, dW, dH); ctx.clip(); ctx.drawImage(deedGrain, dx0 - 40, deedTop - 40); ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(dx0 + 26, deedTop + 26, dW - 52, dH - 52);
  ctx.lineWidth = 1.2; ctx.strokeRect(dx0 + 36, deedTop + 36, dW - 72, dH - 72);
  // Media Luna: a label inside the deed (not a map)
  ctx.font = `400 24px "${LABEL}"`; ctx.letterSpacing = '4px';
  const mlw = ctx.measureText(CASE(TEXT.mediaLuna)).width;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(dx0 + 64, deedTop + 70, mlw + 28, 46);
  ctx.fillStyle = C.ink; ctx.fillText(CASE(TEXT.mediaLuna), dx0 + 78, deedTop + 102);
  // deed body: abstract ink rules (no readable words)
  const bodyTop = deedTop + 150, wy = 860 - 20 * io(r(t, T.L6, T.L6 + 1.8));
  const sealX = dx1 - 175, sealY = wy + 175;
  ctx.fillStyle = 'rgba(31,29,27,.55)';
  for (let row = 0; row < bars.length; row++) {
    const y = bodyTop + row * 26; if (y > deedBot - 70) break; if (y > wy - 80 && y < wy + 50) continue; if (y > wy + 50 && y < sealY + 110 && dx0 + 70 + 0 < 0) continue;
    const nearSeal = y > sealY - 110 && y < sealY + 110; const span = nearSeal ? (sealX - 120) - (dx0 + 70) : dW - 140;
    for (const [a, w] of bars[row]) ctx.fillRect(dx0 + 70 + a * span, y, w * span, 7);
  }
  // THE WESTMAN'S LINE: the line the seal fixes
  const wp = io(r(t, T.L3, T.L3 + .9));
  const wet = 1 - r(t, T.LAND, T.LAND + .12);           // ink open until the seal lands
  const tw = wipeText(ctx, CASE(TEXT.westman), dx0 + 70, wy, 72, wet > 0 ? C.inkWet : C.ink, wp, { squeeze: .78, maxW: dW - 140 });
  if (wp > 0 && wet > 0) { // wet sheen moving through the open ink, clipped to the letters' band
    ctx.save(); ctx.beginPath(); ctx.rect(dx0 + 66, wy - 66, (tw + 8) * wp, 84); ctx.clip();
    ctx.globalCompositeOperation = 'source-atop';
    const sx = dx0 + 60 + ((t * 70) % (tw + 300)) - 150;
    const g = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0);
    g.addColorStop(0, 'rgba(231,223,204,0)'); g.addColorStop(.5, `rgba(231,223,204,${.10 * wet})`); g.addColorStop(1, 'rgba(231,223,204,0)');
    ctx.fillStyle = g; ctx.fillRect(dx0, wy - 70, dW, 90); ctx.restore();
  }
  // the line itself: a rule from the text into the seal's place
  const ruleP = io(r(t, T.L3 + .5, T.L3 + 1.1));
  ctx.fillStyle = wet > 0 ? C.inkWet : C.ink;
  ctx.fillRect(dx0 + 70, wy + 22, (sealX - (dx0 + 70)) * ruleP, 6);
  const tail = io(r(t, T.L3 + .5, T.FIX - .05));                     // ribbon from the line down to the seal's place
  if (tail > 0) ctx.fillRect(sealX - 3, wy + 22, 6, (sealY - wy - 22) * tail);
  ctx.restore();

  // ---- SEAL: absent → crosses on "fixes" → hovers → lands on the final word ----
  if (t >= T.FIX) {
    const cross = oc(r(t, T.FIX, T.FIX + 1.7));
    const x = sealX + (1 - cross) * 520, y = sealY - Math.sin(cross * Math.PI) * 140 - (1 - cross) * 60;
    const descend = io(r(t, T.L8, T.STOP));
    let lift = 1 - .6 * descend; let landed = 0;
    if (t >= T.LAND) { lift = 0; landed = 1 - r(t, T.LAND + 1.5, T.LAND + 2.5) * .3; }
    drawSeal(ctx, x, y, 80, (1 - cross) * -0.9, lift, landed, t);
  }

  // ---- REQUIRED DISPLAY PHRASES (middle band, below the course; never over the deed) ----
  const up = io(r(t, T.L2 + .6, T.L2 + 1.6)) * (1 - r(t, T.L3 - .25, T.L3 + .25));
  if (up > 0) wipeText(ctx, CASE(TEXT.upon), CX, 1392, 104, C.bone, up, { align: 'center', squeeze: .8 });
  const a1 = io(r(t, T.L8, T.L8 + .8)), a2 = io(r(t, T.L8 + 1.0, T.LAND));
  const outA = 1 - io(r(t, T.AEND - .7, T.AEND));          // end is image only
  if (a1 > 0 && outA > 0) {
    ctx.save(); ctx.globalAlpha = outA;
    wipeText(ctx, CASE(TEXT.arrives1), CX, 1372, 94, C.bone, a1, { align: 'center', squeeze: .8 });
    wipeText(ctx, CASE(TEXT.arrives2), CX, 1478, 94, C.bone, a2, { align: 'center', squeeze: .8 });
    ctx.restore();
  }
  ctx.restore(); // camera
};
})();
