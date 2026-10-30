// His Line v2r1 — shots s05-s08 (frames 289-549). Original code. Cue targets from HL.hits; registration from HL.fx.reg / HL.fx.regText; the ember is SCREEN-owned here (HL.fx.ember.screen).
// Registration story: s05 introduces the role swap (charcoal plate on bone), s06 collapses the double impression into register on its hit (the first "fix"), s07/s08 sweep wet (loose, offset, soft) to dry (registered).
// The primary readable impression of every word stays at offset 0; only secondary impressions are offset.
HL.module('shots_b', ['lib', 'cues', 'print', 'type', 'cam', 'trans', 'text', 'hits', 'fx'], HL => {
  const { C, W, H, m, print: P, type: T, cam: K, fx: X, hits: HT } = HL, { seg, ss, expoOut, eo, eio, back, lerp } = m, Q = HL.cue, F = f => f / HL.FPS, D = HL.DEED, LY = HL.LINE_Y, DIR = X.DIR;
  const ghostOf = t => { const r = X.reg(t); return { dx: r[0], dy: r[1], a: .32 }; };
  const deedEdges = [[[D.x, LY], [D.x, D.y], [D.x + D.w, D.y]], [[D.x + D.w, D.y], [D.x + D.w, D.y + D.h]], [[D.x + D.w, D.y + D.h], [D.x, D.y + D.h], [D.x, LY]]];

  // ---------- s05  frames 289-349  the turn: the ground flips and the completed hairline lands on frame 289 (M 12.05 energy re-entry); edges sprout from the line; the camera follows the construction ----------
  HL.shot('s05', (g, lt, p, S) => {
    const t = S.t, tc = HT.t('s05.cut'); P.paper(g);
    const [sx, sy] = m.shakeN(t, [[tc, 8]], .3), tp = HT.t('s05.punch');
    const zoom = 1 + .1 * seg(t, tc, tc + 2.5) + .25 * eo(seg(t, tp, tp + .25)), cy = 960 - 40 * ss(seg(t, HT.t('s05.edge1') - .34, HT.t('s05.edge3')));
    K.begin(g, { cx: 540, cy, zoom, rot: .021 * seg(t, tc, tc + 2.5), dx: sx, dy: sy });
    const kk = 6 * Math.exp(-(t - tc) * 7);                                                          // extra first-frame ghost: the role swap (charcoal impression on bone)
    P.ragLine(g, [-80, LY], [1160, LY], 1, { color: C.ink, lw: 5, seed: 6, ghost: { dx: X.reg(t)[0] + kk, dy: X.reg(t)[1] - kk * .6, a: .34 } });
    const stroke = col => { g.strokeStyle = col; g.lineWidth = 4.5; g.lineCap = 'round'; g.lineJoin = 'round'; deedEdges.forEach((pts, i) => { const tl = HT.t(`s05.edge${i + 1}`); P.polyPartial(g, pts, eio(seg(t, tl - .34, tl))); }); };
    P.plate(g, X.reg(t), 'rgba(35,34,32,.3)', 1, stroke, C.ink);
    K.end(g);
    P.field(g, [-100, 1420, 1300, 520], 26, (x, y) => Math.max(0, (y - 1420) / 500) * (1 + .25 * Q.pulseDecay(t, 10)), C.ink, .26, .4);   // screen-anchored (the paper owns the dots)
    X.drawEmber(g, t); const e = X.ember.screen(t), ra = seg(t, tc, tc + .35); if (ra > 0 && ra < 1) P.ring(g, e.x, e.y, e.r + 60 * eo(ra), 4, C.ember, 1 - ra);
    P.finish(g);
  });

  // ---------- s06  frames 350-401  curved double impressions become one readable phrase; the secondary impression settles into register on frame 394 (D 16.40) ----------
  HL.shot('s06', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s06.cut'); P.paper(g);
    K.begin(g, { cx: 540, cy: 1000, zoom: 1 + .3 * eio(seg(t, t0, t0 + 2.17)), rot: .035 * (1 - eio(seg(t, t0, t0 + 1.9))) });
    const straight = eio(seg(t, F(372), F(391))), d = X.regText(t);
    const defs = [[HL.CASE('the'), 790, 150, HT.t('s06.cut')], [HL.CASE('Westman’s'), 980, 108, HT.t('s06.word2')], [HL.CASE('line'), 1170, 150, HT.t('s06.word3')]];
    const setWord = (w, y, size, tw, wi, fill, ox, oy) => { const len = 760, x0 = 540 - len / 2, A = (wi % 2 ? -1 : 1) * 90 * (1 - straight);
      T.textAlong(g, w, u => [x0 + u * len + ox, y + oy + A * Math.sin(u * Math.PI)], { font: T.F(size), ls: 3, fill },
        (i, n) => { const s = seg(t, tw + i * .045, tw + i * .045 + .22); return { a: s > 0 ? 1 : 0, dy: (1 - expoOut(s)) * 70, s: .8 + .2 * expoOut(s) }; }); };
    if (d > .05) defs.forEach(([w, y, size, tw], wi) => setWord(w, y, size, tw, wi, 'rgba(110,100,86,.55)', d * DIR[0], d * DIR[1]));   // secondary impression (loose, up-right)
    defs.forEach(([w, y, size, tw], wi) => setWord(w, y, size, tw, wi, C.ink, 0, 0));                                                    // primary impression: stable, readable
    const tr = HT.t('s06.register'); P.ragLine(g, [120, 1290], [960, 1290], seg(t, tr - .3, tr), { color: C.ink, lw: 4, seed: 8, ghost: ghostOf(t) });
    K.end(g); X.drawEmber(g, t); P.finish(g);
  });

  // ---------- s07  frames 402-471  he reads: wet ink ahead of the marker is loose (offset, glossy); behind the dry front the print is registered; far plate gives depth ----------
  HL.shot('s07', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s07.cut'), tm = HT.t('s07.marker'), tEnd = F(467); P.dark(g, .06);
    const k = seg(t, tm, tEnd), mx = 150 + 1450 * k, dx = 150 + 1450 * .8 * k - 20, txt = HL.CASE(HL.TEXT.westman), size = 150;
    K.begin(g, { cx: 540 + (mx - 540) * .5, cy: 960, zoom: 1.9, rot: -.012 });                      // far plate: the deed's outline at 0.5x parallax
    g.strokeStyle = 'rgba(231,223,204,.11)'; g.lineWidth = 3; g.strokeRect(D.x, D.y, D.w, D.h); g.beginPath(); g.moveTo(D.x - 60, LY); g.lineTo(D.x + D.w + 60, LY); g.stroke(); K.end(g);
    K.begin(g, { cx: mx, cy: 1000, zoom: 1 + .05 * (t - t0) / S.dur, rot: -.012 });
    g.strokeStyle = 'rgba(231,223,204,.22)'; g.lineWidth = 2; [900, 1075].forEach(y => { g.beginPath(); g.moveTo(-400, y); g.lineTo(2400, y); g.stroke(); });
    g.font = T.F(size); g.letterSpacing = '4px'; g.textBaseline = 'alphabetic';
    g.save(); g.beginPath(); g.rect(-400, 700, dx + 400, 600); g.clip(); g.fillStyle = C.bone; g.globalAlpha = .88; g.fillText(txt, 150, 1075); g.restore();                // dry: registered, matte
    g.save(); g.beginPath(); g.rect(dx, 700, 3000, 600); g.clip();
    g.globalAlpha = .4; g.fillStyle = C.boneDim; g.fillText(txt, 150 + 9 * DIR[0], 1075 + 9 * DIR[1]);                                                                       // wet: loose secondary impression
    g.globalAlpha = 1; g.fillStyle = C.bone; g.fillText(txt, 150, 1075); g.globalAlpha = .35; g.fillStyle = '#fff'; g.fillText(txt, 147, 1071); g.restore();            // wet: primary + gloss
    g.fillStyle = C.boneDim; g.fillRect(dx - 1, 850, 3, 300);
    const mh = 420 + 40 * Q.pulseDecay(t, 10); g.fillStyle = C.bone; g.fillRect(mx - 3, 1000 - mh / 2, 6, mh); g.beginPath(); g.moveTo(mx - 16, 1000 - mh / 2); g.lineTo(mx + 16, 1000 - mh / 2); g.lineTo(mx, 1000 - mh / 2 + 36); g.closePath(); g.fill();
    g.save(); g.beginPath(); g.rect(dx, 1190, 3000, 40); g.clip(); P.plate(g, [9 * DIR[0], 9 * DIR[1]], C.boneDim, .4, col => P.halftone(g, [dx, 1190, 3000, 40], 36, 7, col, 0), C.bone); g.restore();
    g.save(); g.beginPath(); g.rect(-400, 1250, dx + 400, 40); g.clip(); P.halftone(g, [-400, 1250, dx + 400, 40], 36, 7, C.boneDim, 0); g.restore();
    K.end(g); X.drawEmber(g, t);
  });

  // ---------- s08  frames 472-549  the ink is open: translucent back-lit paper over the ember; the dry edge sweeps the words from soft/loose to crisp/registered ----------
  HL.shot('s08', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s08.cut'); g.fillStyle = C.charcoal; g.fillRect(0, 0, W, H);
    X.drawEmber(g, t, { glow: 2.2 });                                                                // the ember glows behind the sheet
    const z = 1 + .25 * eio(seg(t, t0, t0 + S.dur)), gr = g.createRadialGradient(540, 960, 40, 540, 960, 1250); gr.addColorStop(0, '#f4ecd8'); gr.addColorStop(.55, '#b9ad8f'); gr.addColorStop(1, '#2f2c26');
    g.save(); g.globalAlpha = .86; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); P.finish(g, 0, 0, W, H, .6, 1);
    K.begin(g, { cx: 540, cy: 980, zoom: z });
    const edge = 120 + 840 * seg(t, t0 + .4, t0 + 3.0), words = [[HL.CASE('the'), 760, 170], [HL.CASE('Westman’s'), 980, 120], [HL.CASE('line'), 1200, 170]];
    g.textAlign = 'center'; g.letterSpacing = '3px';
    words.forEach(([w, y, sz]) => {
      g.font = T.F(sz);
      g.save(); g.beginPath(); g.rect(edge, y - 220, 3000, 300); g.clip();                          // ahead of the edge: loose, soft, bleeding
      g.globalAlpha = .38; g.filter = 'blur(6px)'; g.fillStyle = C.inkWet; g.fillText(w, 540 + 10 * DIR[0], y + 10 * DIR[1]);
      g.globalAlpha = .78; g.filter = 'blur(10px)'; g.fillText(w, 540, y);
      g.globalAlpha = .35; g.filter = 'blur(4px)'; g.globalCompositeOperation = 'multiply'; g.fillText(w, 540 + 3, y + 4); g.restore();
      g.save(); g.beginPath(); g.rect(0, y - 220, edge, 300); g.clip(); g.fillStyle = C.inkWet; g.fillText(w, 540, y); g.restore();   // behind the edge: crisp, registered
    });
    g.fillStyle = 'rgba(255,250,235,.28)'; g.fillRect(edge - 16, 560, 16, 780); g.fillStyle = 'rgba(21,19,17,.55)'; g.fillRect(edge - 1.5, 560, 3, 780);
    K.end(g);
  });
});
