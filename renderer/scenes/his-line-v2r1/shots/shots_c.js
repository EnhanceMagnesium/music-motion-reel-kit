// His Line v2r1 — shots s09-s12 (frames 550-863). Original code. Cue targets from HL.hits (contact = frame 790 sampled at 32.916667 s, +6.7 ms from the measured M energy return 32.91; word identity U).
// s11 loosens the plates (drift 0 -> 18 px); s12 snaps them into register ON the contact frame. Ember: screen-owned s09-s11, becomes the world-owned seal in s12 (HL.fx.seal).
// Final phrase schedule (reading-window option 2) is exported as HL.finalPhrase so the numeric checks run the real function.
HL.module('shots_c', ['lib', 'cues', 'print', 'type', 'cam', 'trans', 'text', 'hits', 'fx'], HL => {
  const { C, W, H, m, print: P, type: T, cam: K, fx: X, hits: HT } = HL, { seg, ss, expoOut, eo, eio, ei, lerp } = m, Q = HL.cue, F = f => f / HL.FPS, D = HL.DEED, LY = HL.LINE_Y, DIR = X.DIR;
  const ghostOf = t => { const r = X.reg(t); return { dx: r[0], dy: r[1], a: .32 }; };
  const rectC = (g, sc, o = {}) => g.strokeRect(540 - D.w / 2 * sc + (o.dx || 0), LY - D.h / 2 * sc + (o.dy || 0), D.w * sc, D.h * sc);

  // ---------- s09  frames 550-609  the room answers: joints grow from the line, one outline (with a ghost double) radiates per pulse 50-55 ----------
  HL.shot('s09', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s09.cut'); P.paper(g);
    K.begin(g, { cx: 540, cy: 960, zoom: 1 - .28 * eio(seg(t, t0, t0 + 2.5)) });
    for (let i = -4; i <= 8; i++) { const x = 135 + i * 135, d = Math.abs(x - 540) / 700, s = seg(t, t0 + .12 + d * .25, t0 + .5 + d * .25); if (s <= 0) continue;
      g.strokeStyle = 'rgba(35,34,32,.55)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, 960 - 700 * eo(s)); g.lineTo(x, 960 + 700 * eo(s)); g.stroke(); }
    for (let k = 1; k <= 6; k++) { const tp = HT.t(`s09.o${k}`), a = seg(t, tp, tp + 1.0); if (a <= 0 || a >= 1) continue; const sc = 1 + 1.25 * eo(a), gd = 6 * (1 - a) + 2;
      g.save(); g.lineWidth = 3.2; g.globalAlpha = (1 - a) * .4; g.strokeStyle = C.ink; rectC(g, sc, { dx: gd * DIR[0], dy: gd * DIR[1] }); g.globalAlpha = (1 - a) * .8; rectC(g, sc); g.restore(); }
    P.scrap(g, D.x, D.y, D.w, D.h, { lift: .25, lw: 5 });
    const sl = seg(t, t0, t0 + .36); P.ragLine(g, [-200, LY], [1280, LY], sl, { color: C.ink, lw: 5, seed: 9, ghost: ghostOf(t) }); if (sl > 0 && sl < 1) P.bead(g, -200 + 1480 * sl, LY, { color: C.ink, w: 58, h: 26 });
    K.end(g); X.drawEmber(g, t); P.finish(g);
  });

  // ---------- s10  frames 610-678  the purchased room: back wall, floor and front edges on three planes, swell-hatch floor, the shared deed unrolls on the wall, its rule crosses the room ----------
  const BW = { x0: 220, y0: 500, x1: 860, y1: 1080 }, FL = { xl: 60, xr: 1020, y: 1560 };
  HL.shot('s10', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s10.cut'); P.paper(g);
    const e = eio(seg(t, t0, t0 + S.dur)), pan = 60 * e, shear = .18 * e, rot = .07 * e, land = [t0 + .34, HT.t('s10.stroke2'), HT.t('s10.stroke3'), HT.t('s10.stroke4')];
    const cam = f => ({ cx: 540 + pan * f, cy: 960, zoom: 1.05, shear, rot });
    const poly = (pts, i, col, ox = 0, oy = 0) => { g.strokeStyle = col; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round'; g.save(); g.translate(ox, oy); P.polyPartial(g, pts, seg(t, land[i] - .34, land[i])); g.restore(); };
    const stroke = (pts, i) => P.plate(g, X.reg(t), 'rgba(35,34,32,.28)', 1, col => poly(pts, i, col), C.ink);
    const wall = [[BW.x0, BW.y0], [BW.x1, BW.y0], [BW.x1, BW.y1], [BW.x0, BW.y1], [BW.x0, BW.y0]], floor = [[BW.x0, BW.y1], [FL.xl, FL.y], [FL.xr, FL.y], [BW.x1, BW.y1]];
    K.begin(g, cam(.6));                                                                              // back plane: wall, the shared deed (scaled .6 about the wall centre), rule
    stroke(wall, 0);
    const gr = eio(seg(t, t0 + 1.4, t0 + 2.6)) * 160; g.save(); g.translate(540, 790); g.scale(.6, .6); g.translate(-540, -LY);
    P.scrap(g, D.x, D.y, D.w, D.h + gr, { lift: .2, lw: 6 }); g.restore();
    const tr = HT.t('s10.rule'); P.ragLine(g, [BW.x0 - 40, 790], [BW.x1 + 40, 790], seg(t, tr - .3, tr), { color: C.ink, lw: 4, seed: 11, ghost: ghostOf(t) });
    K.end(g);
    K.begin(g, cam(1));                                                                               // floor plane
    stroke(floor, 1);
    const hp = seg(t, land[3], land[3] + 1.1); if (hp > 0) { g.save(); g.beginPath(); g.moveTo(BW.x0, BW.y1); g.lineTo(FL.xl, FL.y); g.lineTo(FL.xr, FL.y); g.lineTo(BW.x1, BW.y1); g.closePath(); g.clip();
      P.swellHatch(g, [0, BW.y1, W, FL.y - BW.y1], 18, .55, 'rgba(35,34,32,.45)', { lw: 2.6, seed: 7, p: hp }); g.restore(); }
    K.end(g);
    K.begin(g, cam(1.4));                                                                             // front plane: the side edges
    stroke([[BW.x0, BW.y0], [60, 300]], 2); stroke([[BW.x1, BW.y0], [1020, 300]], 3);
    K.end(g); X.drawEmber(g, t); P.finish(g);
  });

  // ---------- s11  frames 679-748  strip to the line: layers drop on pulses 64-67, then the plates loosen (drift 0 -> 18 px) while the ember arcs toward the deed ----------
  HL.shot('s11', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s11.cut'); P.dark(g, .05);
    const drop = id => { const tp = HT.t(id); return 1 - eo(seg(t, tp, tp + .2)); }, dr = X.regParts(t).drift, d = X.reg(t);
    K.begin(g, { cx: 540, cy: 960, zoom: 1 + .65 * eio(seg(t, t0, S.end)), rot: -.017 * ss(seg(t, t0, S.end)) });
    g.save(); g.globalAlpha = .55 * drop('s11.cut'); g.strokeStyle = C.bone; g.lineWidth = 3; [1.5, 2.1, 2.7].forEach(sc => rectC(g, sc)); g.restore();
    g.save(); g.globalAlpha = .4 * drop('s11.drop2'); g.strokeStyle = C.bone; g.lineWidth = 2.5; for (let i = -4; i <= 8; i++) { const x = 135 + i * 135; g.beginPath(); g.moveTo(x, 260); g.lineTo(x, 1660); g.stroke(); } g.restore();
    g.save(); g.globalAlpha = .3 * drop('s11.drop3'); g.strokeStyle = C.bone; g.lineWidth = 2; [820, 1100].forEach(y => { g.beginPath(); g.moveTo(-300, y); g.lineTo(1400, y); g.stroke(); }); g.restore();
    g.strokeStyle = C.bone; g.lineWidth = 4; g.beginPath(); g.moveTo(-200, LY); g.lineTo(1280, LY); g.stroke();                       // the line on the dark ground
    P.scrap(g, D.x, D.y, D.w, D.h, { lift: .15, lw: 5, stroke: 'rgba(0,0,0,0)' });
    P.plate(g, d, C.boneDim, dr > 0 ? .55 : .3, col => { g.strokeStyle = col; g.lineWidth = 5; g.strokeRect(D.x, D.y, D.w, D.h); }, C.ink);     // outline plate: primary at 0, ghost loosens with the drift
    g.save(); g.beginPath(); g.rect(D.x, D.y, D.w, D.h); g.clip(); g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(D.x, LY); g.lineTo(D.x + D.w, LY); g.stroke(); g.restore();
    K.end(g);
    g.globalAlpha = .45 * drop('s11.drop4'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    const e = X.ember.screen(t); X.drawMotes(g, t, 8, 31, e.x, e.y, ss(seg(t, F(708), F(730)))); X.drawEmber(g, t);
  });

  // ---------- s12  frames 749-863  the seal arrives ----------
  const tCon = () => HT.t('s12.contact');
  // camera: hover (= HL.fx.CAM12) until the contact frame, then a crash-in with decaying shake; the final hold drifts by 0.5 %
  const cam12 = t => { const tc = tCon(), [dx, dy] = m.shakeN(t, [[tc, 18]], .45);
    return { cx: 540, cy: 960, zoom: X.CAM12.zoom + .4 * expoOut(seg(t, tc, tc + 6 / HL.FPS)) - .08 * ss(seg(t, tc + 6 / HL.FPS, F(804))) + .01 * seg(t, F(804), 36), dx, dy }; };
  HL.cams = { s12: cam12 };
  HL.plans = HL.plans || {}; HL.plans.s12 = { lineGap: t => X.R_WORLD * .9 * (1 - ss(seg(t, tCon(), tCon() + 3 / HL.FPS))), flashAlpha: t => (Math.abs(t - tCon()) < .5 / HL.FPS ? .12 : 0) };
  // final phrase "RIGHT ON TIME." (lyric words, uppercase presentation): glyph schedule, group starts on the two measured vocal-group onsets (content U)
  const PH = HL.CASE(HL.TEXT.arrives2), GSTAG = .012, GREV = .035, GROUP = i => (i < 9 ? 0 : 1), GFIRST = [0, 9];
  const FP = HL.finalPhrase = { text: PH, size: 96, tracking: 2, y: 1490, stagger: GSTAG, reveal: GREV };
  FP.glyphStart = i => { const g = GROUP(i), k = PH.slice(GFIRST[g], i).replace(/ /g, '').length; return HT.t(g === 0 ? 's12.vocal1' : 's12.vocal2') + k * GSTAG; };
  FP.glyphs = () => [...PH].map((ch, i) => ({ i, ch, start: FP.glyphStart(i), end: FP.glyphStart(i) + GREV })).filter(x => x.ch !== ' ');
  FP.completeT = () => Math.max(...FP.glyphs().map(x => x.end));
  FP.completeFrame = () => Math.ceil(FP.completeT() * HL.FPS - 1e-9);                                  // first frame whose sample time >= completion
  FP.glyph = (i, t) => { const s = m.seg(t, FP.glyphStart(i), FP.glyphStart(i) + GREV); return { a: s, s: .8 + .2 * eo(s), dy: (1 - expoOut(s)) * 40 }; };
  FP.clear = t => 1 - seg(t, HT.t('s12.clear_start'), HT.t('s12.clear_end'));

  HL.shot('s12', (g, lt, p, S) => {
    const t = S.t, tc = tCon(), c = cam12(t), st = X.seal(t), z = c.zoom, d = X.reg(t); P.dark(g, .05);
    K.begin(g, c);
    P.scrap(g, D.x, D.y, D.w, D.h, { lift: 0, lw: 5 });
    g.fillStyle = C.ink; g.fillRect(D.x + 40, D.y + 44, 330, 66); T.letters(g, HL.CASE(HL.TEXT.mediaLuna), D.x + 56, D.y + 90, { font: T.L(40), ls: 5, fill: C.bone }, () => ({}));
    // the line: broken where the seal will land, closing through the seal over three frames from the contact frame; the ghost impression carries the drift until it snaps
    const gap = HL.plans.s12.lineGap(t), cx0 = D.x + D.w / 2, line = (col, ox, oy) => { g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(-200 + ox, LY + oy); g.lineTo(cx0 - gap + ox, LY + oy); g.moveTo(cx0 + gap + ox, LY + oy); g.lineTo(1280 + ox, LY + oy); g.stroke(); };
    line('rgba(231,223,204,.35)', d[0], d[1]); line(C.bone, 0, 0);
    g.save(); g.beginPath(); g.rect(D.x, D.y, D.w, D.h); g.clip(); line(C.ink, 0, 0); g.restore();
    // ember glow around the seal (same proportions as HL.fx.drawEmber so the hand-off from s11 is continuous), shadow to the lower right sized by lift
    const r0 = st.wr, [so1, so2] = [14 + 36 * st.lift, 22 + 54 * st.lift];
    g.save(); g.fillStyle = C.ember; g.globalAlpha = .10; g.beginPath(); g.arc(st.wx, st.wy, r0 * 2.6, 0, m.TAU); g.fill(); g.globalAlpha = .18; g.beginPath(); g.arc(st.wx, st.wy, r0 * 1.7, 0, m.TAU); g.fill(); g.restore();
    g.save(); g.globalAlpha = .35 * Math.min(1, .4 + st.lift); g.fillStyle = '#000'; g.beginPath(); g.ellipse(st.wx + so1, st.wy + so2, r0 * st.sx, r0 * .96 * st.sy, 0, 0, m.TAU); g.fill(); g.restore();
    P.stamp(g, st.wx, st.wy, { zoom: z, sx: st.sx, sy: st.sy, draw: (b, bx, by, k) => X.drawSeal(b, bx, by, k, st, [d[0] * k, d[1] * k]) });
    const ra = seg(t, tc, tc + .5); if (t >= tc && ra < 1) P.ring(g, st.wx, st.wy, X.R_WORLD + 150 * eo(ra), 6, C.ember, 1 - ra);
    X.drawSparks(g, t, tc, st.wx, st.wy, 28, 7);
    K.end(g);
    if (t >= tc) { const sc = K.toScreen(c, st.wx, st.wy); X.drawMotes(g, t, 10, 53, sc[0], sc[1], ss(seg(t, tc, tc + .3))); }
    if (HL.plans.s12.flashAlpha(t) > 0) { g.save(); g.globalAlpha = HL.plans.s12.flashAlpha(t); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }   // one flash frame on contact
    const clear = FP.clear(t), f1 = HL.CASE(HL.TEXT.arrives1);
    T.letters(g, f1, 540, 1385, { font: T.F(86), ls: 2, fill: C.bone, align: 'center' }, (i) => { const s = seg(t, 31.34 + i * .03, 31.49 + i * .03); return { a: s * clear, dy: (1 - expoOut(s)) * -40 }; });
    T.letters(g, PH, 540, FP.y, { font: T.F(FP.size), ls: FP.tracking, fill: C.bone, align: 'center' }, (i) => { const q = FP.glyph(i, t); return { a: q.a * clear, dy: q.dy, s: q.s }; });
  });
});
