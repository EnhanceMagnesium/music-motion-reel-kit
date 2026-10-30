// His Line v2 — shots s09-s12 (22.91-36.00 s). Original code. Timing: refrain S 22.979 ~ D pulse 22.91; line 6 S 25.452 ~ D 25.43; line 7 S 28.324 ~ D 28.31;
// line 8 S 31.197 ~ D 31.19; M last low hit 32.42; M low-energy interval 32.71-32.87; M energy return 32.91 (word identity U); vocal groups M 33.10/33.40 (content U).
HL.module('shots_c', ['lib', 'cues', 'print', 'type', 'cam', 'trans', 'text'], HL => {
  const { C, W, H, m, print: P, type: T } = HL, { seg, expoOut, eo, eio, kick, lerp, spring, back } = m, Q = HL.cue;
  const DEED = { x: 240, y: 740, w: 600, h: 440 };
  const deed = (g, grow = 0) => {
    const { x, y, w, h } = DEED; g.fillStyle = 'rgba(35,34,32,.25)'; g.fillRect(x + 12, y + 16, w, h + grow);
    g.fillStyle = '#efe8d6'; g.fillRect(x, y, w, h + grow); g.strokeStyle = C.ink; g.lineWidth = 5; g.strokeRect(x, y, w, h + grow);
  };

  // ---------- s09  22.91-25.43  refrain: the room answers. The line shoots edge to edge, wall joints redraw from it, outlines expand each D pulse ----------
  HL.shot('s09', (g, lt, p, S) => {
    P.paper(g);
    HL.cam.begin(g, { cx: 540, cy: 960, zoom: 1 - .28 * eio(seg(lt, 0, 2.52)) });
    const sl = seg(lt, 0, .36);
    for (let i = -4; i <= 8; i++) { const x = 135 + i * 135, d = Math.abs(x - 540) / 700, s = seg(lt, .12 + d * .25, .5 + d * .25); if (s <= 0) continue;
      g.strokeStyle = 'rgba(35,34,32,.55)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, 960 - 700 * eo(s)); g.lineTo(x, 960 + 700 * eo(s)); g.stroke(); }
    // nested outlines: one per D pulse, expanding from the deed
    Q.pulsesIn(23.27, 25.43).forEach((tp, k) => { const a = seg(lt, tp - 22.91, tp - 22.91 + 1.0); if (a <= 0 || a >= 1) return; const sc = 1 + 1.25 * eo(a);
      g.save(); g.globalAlpha = (1 - a) * .8; g.strokeStyle = C.ink; g.lineWidth = 3.2; g.strokeRect(540 - DEED.w / 2 * sc, 960 - DEED.h / 2 * sc, DEED.w * sc, DEED.h * sc); g.restore(); });
    deed(g);
    P.ragLine(g, [-200, 960], [1280, 960], sl, { color: C.ink, lw: 5, seed: 9 });
    if (sl > 0 && sl < 1) P.bead(g, -200 + 1480 * sl, 960, { color: C.ink, w: 58, h: 26 });
    HL.cam.end(g); P.finish(g);
  });

  // ---------- s10  25.43-28.31  the purchased room keeps the holding: oblique room drawn in four strokes, the deed unrolls, camera shear (line 6 S 25.452) ----------
  HL.shot('s10', (g, lt, p, S) => {
    P.paper(g);
    HL.cam.begin(g, { cx: 540, cy: 960, zoom: 1.05, shear: .18 * eio(seg(lt, 0, 2.88)) });
    const BW = { x0: 220, y0: 500, x1: 860, y1: 1080 }, FL = { xl: 60, xr: 1020, y: 1560 };
    const strokes = [[[BW.x0, BW.y0], [BW.x1, BW.y0], [BW.x1, BW.y1], [BW.x0, BW.y1], [BW.x0, BW.y0]], [[BW.x0, BW.y1], [FL.xl, FL.y], [FL.xr, FL.y], [BW.x1, BW.y1]], [[BW.x0, BW.y0], [60, 300]], [[BW.x1, BW.y0], [1020, 300]]];
    g.strokeStyle = C.ink; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
    strokes.forEach((pts, i) => { const s = seg(lt, i * .36, i * .36 + .34); if (s <= 0) return; const segs = pts.length - 1, f = s * segs; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let k = 0; k < segs; k++) { const q = Math.min(1, Math.max(0, f - k)); if (q <= 0) break; g.lineTo(lerp(pts[k][0], pts[k + 1][0], q), lerp(pts[k][1], pts[k + 1][1], q)); } g.stroke(); });
    const hp = seg(lt, 1.5, 2.6); if (hp > 0) { g.save(); g.beginPath(); g.moveTo(BW.x0, BW.y1); g.lineTo(FL.xl, FL.y); g.lineTo(FL.xr, FL.y); g.lineTo(BW.x1, BW.y1); g.closePath(); g.clip(); P.hatch(g, [0, BW.y1, W, FL.y - BW.y1], 18, .55, 'rgba(35,34,32,.4)', 1.8, hp); g.restore(); }
    // deed on the back wall, unrolling downward
    const gr = eio(seg(lt, 1.4, 2.6)) * 220, dx = 340, dy = 600, dw = 400, dh = 220;
    g.fillStyle = 'rgba(35,34,32,.25)'; g.fillRect(dx + 10, dy + 12, dw, dh + gr); g.fillStyle = '#efe8d6'; g.fillRect(dx, dy, dw, dh + gr); g.lineWidth = 4; g.strokeRect(dx, dy, dw, dh + gr);
    g.fillStyle = 'rgba(35,34,32,.18)'; g.beginPath(); g.ellipse(dx + dw / 2, dy + dh + gr - 10, dw / 2 - 6, 12, 0, 0, m.TAU); g.fill();
    g.lineWidth = 4; g.beginPath(); g.moveTo(dx - 30, 710); g.lineTo(dx + dw + 30, 710); g.stroke();
    HL.cam.end(g); P.finish(g);
  });

  // ---------- s11  28.31-31.19  strip to the line: layers drop on D pulses 28.31, 28.68, 29.04, 29.40; crash-in; the ember point drifts in (line 7 S 28.324) ----------
  HL.shot('s11', (g, lt, p, S) => {
    P.dark(g, .05);
    const zoom = 1 + .5 * eio(seg(lt, 0, 1.79));
    HL.cam.begin(g, { cx: 540, cy: 960, zoom });
    const drop = k => 1 - eo(seg(lt, [0, .37, .73, 1.09][k], [0, .37, .73, 1.09][k] + .2));
    g.save(); g.globalAlpha = .55 * drop(0); g.strokeStyle = C.bone; g.lineWidth = 3; [1.5, 2.1, 2.7].forEach(sc => g.strokeRect(540 - DEED.w / 2 * sc, 960 - DEED.h / 2 * sc, DEED.w * sc, DEED.h * sc)); g.restore();
    g.save(); g.globalAlpha = .4 * drop(1); g.strokeStyle = C.bone; g.lineWidth = 2.5; for (let i = -4; i <= 8; i++) { const x = 135 + i * 135; g.beginPath(); g.moveTo(x, 260); g.lineTo(x, 1660); g.stroke(); } g.restore();
    g.save(); g.globalAlpha = .3 * drop(2); g.strokeStyle = C.bone; g.lineWidth = 2; [820, 1100].forEach(y => { g.beginPath(); g.moveTo(-300, y); g.lineTo(1400, y); g.stroke(); }); g.restore();
    deed(g); g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(-200, 960); g.lineTo(1280, 960); g.stroke();
    HL.cam.end(g);
    // the vignette (lamp) drops last
    g.globalAlpha = .45 * drop(3); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    // ember point drifts toward the deed, growing
    const e = eio(seg(lt, .2, 2.88)), ex = lerp(860, 700, e), ey = lerp(300, 560, e), er = lerp(18, 46, e);
    g.save(); g.globalAlpha = .3; g.fillStyle = C.ember; g.beginPath(); g.arc(ex, ey, er * 1.8, 0, m.TAU); g.fill(); g.globalAlpha = 1; g.beginPath(); g.arc(ex, ey, er, 0, m.TAU); g.fill(); g.restore();
  });

  // ---------- s12  31.19-36.00  payoff: the seal arrives. Hover, freeze in the low-energy interval (M 32.71-32.87), slam on the energy return (M 32.91), image-only end ----------
  const seal = (g, x, y, R, sx, sy, lift, gloss) => {
    g.save(); g.translate(x, y); g.scale(sx, sy);
    g.globalAlpha = .35 * Math.min(1, .4 + lift); g.fillStyle = '#000'; g.beginPath(); g.ellipse(14 + 36 * lift, 22 + 54 * lift, R, R * .96, 0, 0, m.TAU); g.fill(); g.globalAlpha = 1;
    g.fillStyle = C.ember; g.beginPath(); for (let i = 0; i < 64; i++) { const a = i / 64 * m.TAU, r = R * (1 + (i % 2 ? .035 : 0)); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
    g.strokeStyle = C.emberDeep; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, R * .86, 0, m.TAU); g.stroke();
    g.strokeStyle = 'rgba(231,223,204,.6)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, R * .7, 0, m.TAU); g.stroke();
    g.strokeStyle = 'rgba(231,223,204,.85)'; g.lineWidth = 6; g.beginPath(); g.moveTo(-R * .5, 0); g.lineTo(R * .5, 0); g.stroke();       // the line, at the seal's centre
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * R * .22, -R * .08); g.lineTo(i * R * .22, R * .08); g.stroke(); }
    if (gloss > 0) { g.globalAlpha = .5 * gloss; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-R * .35, -R * .45, R * .28, R * .12, -.5, 0, m.TAU); g.fill(); }
    g.restore();
  };
  HL.shot('s12', (g, lt, p, S) => {
    const tFreeze0 = 32.71 - 31.19, tFreeze1 = 32.87 - 31.19, tHit = 32.91 - 31.19, R = 120;
    P.dark(g, .05);
    const kk = kick(lt, tHit, 14, 60) * 18;
    HL.cam.begin(g, { cx: 540, cy: 960, zoom: 1.5, dy: kk });
    deed(g); g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(-200, 960); g.lineTo(1280, 960); g.stroke();
    g.fillStyle = C.ink; g.fillRect(DEED.x + 30, DEED.y + 40, 260, 62); T.letters(g, HL.CASE(HL.TEXT.mediaLuna), DEED.x + 46, DEED.y + 83, { font: T.L(30), ls: 4, fill: C.bone }, () => ({}));
    // seal path: grows from the ember point, hovers (sway stops in the freeze), then slams
    const arrive = spring(seg(lt, 0, 1.0), 5, .5), swayT = Math.min(lt, tFreeze0);
    const hx = 640 + 8 * Math.sin(swayT * 2.1), hy = 560 + 10 * Math.sin(swayT * 1.7 + 1);
    let x, y, sx = 1, sy = 1, lift = 1, r = lerp(46, R, Math.min(1.1, arrive));
    if (lt < tHit) { x = hx; y = hy; if (lt < 1.0) { x = lerp(700, hx, eio(seg(lt, 0, 1.0))); y = lerp(560, hy, eio(seg(lt, 0, 1.0))); } }
    else { const s = eio(seg(lt, tHit, tHit + .125)); x = lerp(hx, 700, s); y = lerp(hy, 960, s); lift = 1 - s; r = R * lerp(1.12, 1, s);
      const sq = Math.exp(-(lt - tHit - .125) * 12) * (lt > tHit + .125 ? 1 : 0); sx = 1 + .1 * sq; sy = 1 - .1 * sq; }
    const gloss = lt < tHit ? 1 : 1 - seg(lt, tHit, tHit + .3);
    // ink ring from the seal on contact (seal ink = ember)
    const ra = seg(lt, tHit + .08, tHit + .6); if (ra > 0 && ra < 1) P.ring(g, 700, 960, R + 150 * eo(ra), 6, C.ember, 1 - ra);
    seal(g, x, y, r, sx, sy, lift, gloss);
    HL.cam.end(g);
    // phrases (screen space). E times: THE SEAL ARRIVES from S 31.197; RIGHT ON / TIME. on M vocal groups 33.10 / 33.40 (content U). Cleared 34.1-34.8
    const clear = 1 - seg(S.t, 34.1, 34.8), f1 = HL.CASE(HL.TEXT.arrives1);
    T.letters(g, f1, 540, 1385, { font: T.F(86), ls: 2, fill: C.bone, align: 'center' }, (i) => { const s = seg(lt, .15 + i * .03, .3 + i * .03); return { a: s * clear, dy: (1 - expoOut(s)) * -40 }; });
    const f3 = HL.CASE('right on time.');   // 'RIGHT ON ' on the first vocal group (M 33.10), 'TIME.' on the second (M 33.40); word identity U
    T.letters(g, f3, 540, 1485, { font: T.F(86), ls: 2, fill: C.bone, align: 'center' }, (i) => { const t0 = i < 9 ? 33.10 + i * .02 : 33.40 + (i - 9) * .02, s = seg(S.t, t0, t0 + .1); return { a: s * clear, dy: (1 - expoOut(s)) * 40 }; });
    // end hold: not frozen, the lamp breathes +-3%
    const br = S.t > 34.81 ? .03 * Math.sin((S.t - 34.81) * 2.6) : 0; g.globalAlpha = Math.abs(br); g.fillStyle = br > 0 ? '#fff' : '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  });
});
