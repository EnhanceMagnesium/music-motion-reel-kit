// His Line v2r1 — shots s01-s04 (video frames 0-288). Original code. Cue targets come from HL.hits (08_hits.js); registration from HL.fx.reg (09_fx.js).
// Techniques: print.ragLine/bead/wipeRegion (v2, adapted R03 wipeRegion), print.scrap/plate/swellHatch/field (v2r1 original, informed by R03 engraving/halftone-dossier STYLE and R09 zine vocabulary, study only),
// type.letters (adapted R02) / halftoneWindow (original), cam (original), m.hold (sample-and-hold), fx.reg (registration). Light from the upper left, shadows to the lower right.
HL.module('shots_a', ['lib', 'cues', 'print', 'type', 'cam', 'trans', 'text', 'hits', 'fx'], HL => {
  const { C, W, H, m, print: P, type: T, cam: K, fx: X, hits: HT } = HL, { seg, ss, expoOut, eo, eio, hold, back } = m, Q = HL.cue, F = f => f / HL.FPS, D = HL.DEED, LY = HL.LINE_Y;
  const ghostOf = t => { const r = X.reg(t); return { dx: r[0], dy: r[1], a: .3 }; };
  HL.plans = HL.plans || {};   // pure plan functions the shots call and the numeric checks exercise

  // ---------- s01  frames 0-79  hook: a bead makes the line (lands on D 0.43 = frame 10); ticks pop on pulses; three density bands print on I/D pulses; a paper edge prepares s02 ----------
  const camY = K.path([[0, { cy: 960 }], [.8, { cy: 960 }], [1.45, { cy: 1005 }], [2.2, { cy: 1065 }], [2.9, { cy: 1112 }], [3.34, { cy: 1125 }]]);
  HL.shot('s01', (g, lt, p, S) => {
    const t = S.t; P.dark(g, .09);
    const tL = HT.t('s01.line_lands'), zoom = 1 + 1.2 * expoOut(seg(t, tL, tL + .37)) - .18 * seg(t, tL + .37, 3.34), cy = camY(t).cy;
    K.begin(g, { cx: 540, cy, zoom, rot: -.0436 * ss(seg(t, .8, 3.33)) });
    const pl = seg(t, .06, tL), x1 = -60 + 1200 * pl;
    P.ragLine(g, [-60, LY], [1140, LY], pl, { color: C.bone, lw: 3.2, seed: 2, ghost: ghostOf(t) });
    g.fillStyle = C.bone;
    for (let x = 0, i = 0; x <= 1080; x += 60, i++) if (x < x1 - 20) { const h = (i % 3 ? 10 : 20) + (i % 2 === 0 ? 22 * Q.pulseDecay(t, 10) : 0); g.globalAlpha = .7; g.fillRect(x - 1, LY - h, 2, 2 * h); }
    g.globalAlpha = 1;
    if (pl > 0 && pl < 1) P.bead(g, x1, LY, { color: C.bone, w: 50, h: 22 });
    ['s01.band1', 's01.band2', 's01.band3'].forEach((id, i) => {
      const tl = HT.t(id), y = 1040 + i * 64, pr = seg(t, tl - .30, tl); if (pr <= 0) return;
      const box = [-60, y - 24, 1200, 48], dens = (x) => (.55 + .45 * Math.sin(x * .014 + i * 1.7)) * (.65 + .35 * Q.level(t));
      g.save(); g.clip(P.wipeRegion(box, 'right', pr, i + 5, 30));
      P.plate(g, X.reg(t), C.boneDim, .35, col => P.field(g, box, 30, dens, col, 0, .25), C.bone); g.restore();
      if (pr < 1) P.bead(g, -60 + 1200 * pr, y, { color: C.bone, w: 44, h: 20 });
    });
    K.end(g);
    const e = ss(seg(t, F(72), F(80))), w = 40 * e;   // the bone paper edge of s02 slides in from the right (match for the cut)
    if (w > 0) { P.paper(g, W - w, 0, w, H); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(W - w - 3, 0, 3, H); }
  });

  // ---------- s02  frames 80-149  a visible pen draws the deed (edges land on D pulses 9-12), paper, label, rule; the deed lifts into the s03 cut ----------
  const corners = [[D.x, D.y], [D.x + D.w, D.y], [D.x + D.w, D.y + D.h], [D.x, D.y + D.h]];
  HL.shot('s02', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s02.cut'), tLift = HT.t('s02.lift'), tRule = HT.t('s02.rule');
    P.paper(g); g.fillStyle = 'rgba(35,34,32,.04)'; g.fillRect(0, 0, W, H);
    const hl = .22 * (1 - seg(t, t0, t0 + .5)); if (hl > 0) { g.fillStyle = `rgba(35,34,32,${hl})`; g.fillRect(0, LY - 1.6, W, 3.2); }   // the s01 hairline fades out at y 960
    const lift = ss(seg(t, tRule, tLift)), z = 1.45 - .53 * eio(seg(t, t0, t0 + 2.9)), rot = .052 * (1 - eio(seg(t, t0, tLift)));
    K.begin(g, { cx: 540, cy: LY, zoom: z, rot });
    const tfill = HT.t('s02.fill'), tlab = HT.t('s02.label'), a = seg(t, tfill - .24, tfill), up = -12 * lift;
    g.save(); g.translate(0, up);
    if (a > 0) P.scrap(g, D.x, D.y, D.w, D.h, { lift, alpha: a, lw: 5 });
    // corner brackets stamp in as each edge lands
    g.strokeStyle = C.ink; g.lineWidth = 3; g.lineCap = 'round';
    corners.forEach(([x, y], i) => { const tl = HT.t(`s02.edge${i + 1}`), b = back(seg(t, tl, tl + .2)); if (b <= 0) return; const sx = (i === 0 || i === 3) ? -1 : 1, sy = i < 2 ? -1 : 1, L = 34 * b;
      g.beginPath(); g.moveTo(x + sx * (14 + L), y + sy * 14); g.lineTo(x + sx * 14, y + sy * 14); g.lineTo(x + sx * 14, y + sy * (14 + L)); g.stroke(); });
    // the four edges: edge i lands on its pulse, drawn over the preceding 0.34 s
    let pen = null; const edge = col => { g.strokeStyle = col; g.lineWidth = 5; g.lineCap = 'round'; for (let i = 0; i < 4; i++) { const tl = HT.t(`s02.edge${i + 1}`), s = eio(seg(t, tl - .34, tl)); if (s <= 0) continue; const tip = P.polyPartial(g, [corners[i], corners[(i + 1) % 4]], s); if (s < 1) pen = tip; } };
    P.plate(g, X.reg(t), 'rgba(35,34,32,.3)', 1, edge, C.ink);
    // label scrap + MEDIA LUNA (lyric word, uppercase presentation)
    const la = seg(t, tlab - .2, tlab), bx = D.x + 48, by = D.y + 56;
    if (la > 0) { P.plate(g, X.reg(t), 'rgba(35,34,32,.35)', 1, col => { g.fillStyle = col; g.fillRect(bx, by, 400 * eo(la), 88); }, C.ink);
      T.letters(g, HL.CASE(HL.TEXT.mediaLuna), bx + 24, by + 58, { font: T.L(44), ls: 6, fill: C.bone }, (i) => ({ a: seg(t, tlab + .06 + i * .035, tlab + .16 + i * .035), dy: (1 - expoOut(seg(t, tlab + .06 + i * .035, tlab + .26 + i * .035))) * -18 })); }
    P.ragLine(g, [D.x - 40, LY], [D.x + D.w + 40, LY], seg(t, tRule - .3, tRule), { color: C.ink, lw: 4, seed: 4, ghost: ghostOf(t) });
    if (pen) { g.save(); g.translate(pen[0], pen[1]); g.globalAlpha = .25; g.fillStyle = '#000'; g.beginPath(); g.moveTo(10, 8); g.lineTo(34, -40); g.lineTo(150, -190); g.lineTo(168, -176); g.lineTo(52, -26); g.closePath(); g.fill(); g.globalAlpha = 1;
      g.fillStyle = C.ink; g.beginPath(); g.moveTo(0, 0); g.lineTo(18, -40); g.lineTo(38, -30); g.closePath(); g.fill(); g.lineWidth = 20; g.strokeStyle = C.ink; g.lineCap = 'round'; g.beginPath(); g.moveTo(28, -35); g.lineTo(122, -176); g.stroke(); g.restore(); }
    g.restore(); K.end(g); P.finish(g);
  });

  // ---------- s03  frames 150-236  the deed enters the wall; twelve courses complete on I ticks 0-8; plaque; three parallax planes; the lamp follows the measured low-band level ----------
  const ROWS = 12, RH = 130, WY0 = 420, tickOf = j => Math.floor(j * 9 / ROWS);   // 12 courses on 9 usable ghost ticks (the tenth tick is the cut)
  HL.plans.s03 = { rows: ROWS, tickOf, hitId: j => `s03.course${tickOf(j)}`, completeFrame: j => HT.frame(`s03.course${tickOf(j)}`), progress: (j, t) => { const id = `s03.course${tickOf(j)}`, tl = HT.t(id); return seg(t, tl - HT.lead(id), tl); } };
  const course = (g, t, row, p, dirRight) => {
    const y = WY0 + row * RH; if (p <= 0) return;
    g.save(); g.clip(P.wipeRegion([-100, y, 1300, RH], dirRight ? 'right' : 'left', p, row + 3, 36));
    g.fillStyle = 'rgba(35,34,32,.07)'; g.fillRect(-100, y, 1300, RH);
    const ra = X.reg(t); g.strokeStyle = 'rgba(35,34,32,.22)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-100 + ra[0], y + ra[1]); g.lineTo(1200 + ra[0], y + ra[1]); g.stroke();   // ghost impression of the ledge
    g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(-100, y); g.lineTo(1200, y); g.stroke();
    const off = (row % 2) * 110; g.lineWidth = 2.5; for (let x = -220 + off; x < 1200; x += 220) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + RH); g.stroke(); }
    P.swellHatch(g, [-100, y, 1300, RH], 16, .7, 'rgba(35,34,32,.42)', { lw: 2.6, seed: row + 1 }); g.restore();
  };
  HL.shot('s03', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s03.cut'); P.paper(g);
    const tilt = eio(seg(t, t0, t0 + S.dur)), cy = 960 + 480 * (1 - tilt);
    K.begin(g, { cx: 540, cy: 960 + (cy - 960) * .6 });                                             // far plane (0.6)
    g.strokeStyle = 'rgba(35,34,32,.14)'; g.lineWidth = 2; for (let r = 0; r < 9; r++) for (let x = -300 + (r % 2) * 180; x < 1300; x += 360) g.strokeRect(x, 200 + r * 240, 360, 240);
    K.end(g);
    K.begin(g, { cx: 540, cy });                                                                     // wall plane (1.0)
    for (let j = 0; j < ROWS; j++) course(g, t, ROWS - 1 - j, HL.plans.s03.progress(j, t), j % 2 === 0);
    const drop = seg(t, t0, t0 + .5), dy = -320 * (1 - eo(drop));
    P.scrap(g, D.x, D.y + dy, D.w, D.h, { lift: 1 - eo(drop), lw: 4 });
    g.save(); g.translate(0, dy); g.fillStyle = C.ink; g.fillRect(D.x + 48, D.y + 56, 400, 88);
    T.letters(g, HL.CASE(HL.TEXT.mediaLuna), D.x + 72, D.y + 114, { font: T.L(44), ls: 6, fill: C.bone }, () => ({}));
    g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(D.x - 40, LY); g.lineTo(D.x + D.w + 40, LY); g.stroke();
    [[D.x + 26, D.y + 26], [D.x + D.w - 26, D.y + 26], [D.x + 26, D.y + D.h - 26], [D.x + D.w - 26, D.y + D.h - 26]].forEach(([x, y], i) => {   // pins spring in on the first four ticks
      const tp = HT.t(`s03.course${i}`), r = 9 * back(seg(t, tp, tp + .15)); if (r > 0) { g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, r, 0, m.TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .3, 0, m.TAU); g.fill(); } });
    g.restore();
    const tpq = HT.t('s03.plaque'), pa = seg(t, tpq - .24, tpq), pw = 460 * eo(pa);                    // plaque scrap 460 px wide (the 417 px label fits inside)
    if (pa > 0) { P.scrap(g, 540 - 230, 560, pw, 76, { fill: C.ink, stroke: C.ink, lift: .3 * (1 - pa), lw: 2 });
      T.letters(g, HL.CASE(HL.TEXT.civic), 540, 610, { font: T.L(40), ls: 8, fill: C.bone, align: 'center' }, (i) => ({ a: seg(t, tpq + i * .04, tpq + .1 + i * .04) })); }
    K.end(g);
    K.begin(g, { cx: 540, cy: 960 + (cy - 960) * 1.4 });                                             // near plane (1.4)
    g.fillStyle = C.ink; g.fillRect(-50, 1860, 1200, 40); P.swellHatch(g, [-50, 1900, 1200, 120], 14, .8, C.ink, { lw: 2.4, seed: 99, alpha: .8 });
    K.end(g);
    g.fillStyle = C.ink; g.globalAlpha = .55 * (1 - Q.level(t)); g.fillRect(0, 0, W, H); g.globalAlpha = 1; P.finish(g);   // lamp follows the measured low-band level
  });

  HL.plans.s04 = { bead: t => seg(t, F(HL.CUT_FRAMES[4]) - HT.lead('s05.cut'), F(HL.CUT_FRAMES[4])), holdSpans: () => [[HT.t('s04.hold'), F(HL.CUT_FRAMES[4]), 0]] };
  // ---------- s04  frames 237-288  oversized cropped words thin with the low-band level; selected channels hold through the pause (M 11.53) while the bead anticipates s05 ----------
  HL.shot('s04', (g, lt, p, S) => {
    const t = S.t, t0 = HT.t('s04.cut'), tH0 = HT.t('s04.hold'), tCut = F(HL.CUT_FRAMES[4]);
    P.dark(g, .05);
    const th = hold(t, HL.plans.s04.holdSpans());                                                            // held clock for words/zoom/dots; the bead and dim use the real clock
    const zoom = 1 + .12 * eo(seg(th, t0, tH0)), words = [['UPON', 640, 10, HT.t('s04.cut')], ['THE', 1090, -30, HT.t('s04.word2')], ['WALL', 1540, 10, HT.t('s04.word3')]];
    const draw = (b, fill) => words.forEach(([w, y, xo, tw]) => T.letters(b, w, 540 + xo, y, { font: T.F(400), ls: -3, fill, align: 'center' },
      (k) => { const e = seg(th, tw + k * .03, tw + k * .03 + .32); return { dy: (1 - expoOut(e)) * -420, a: e > 0 ? 1 : 0 }; }));
    K.begin(g, { cx: 540, cy: 960, zoom });
    const r = X.reg(th); g.save(); g.translate(r[0] * 2, r[1] * 2); draw(g, 'rgba(231,223,204,.16)'); g.restore();   // secondary impression (the primary window below stays readable)
    T.halftoneWindow(g, b => draw(b, '#000'), C.ink, C.bone, 12, 3.6 * (.55 + .45 * Q.level(th)));
    K.end(g);
    const dim = .4 * seg(t, tH0, tH0 + .2); if (dim > 0) { g.globalAlpha = dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    const pl = HL.plans.s04.bead(t);                                              // bone bead crosses y 960, landing on frame 289 where s05 flips the ground
    if (pl > 0) { P.ragLine(g, [-60, LY], [1140, LY], pl, { color: C.bone, lw: 5, seed: 6, ghost: ghostOf(t) }); if (pl < 1) P.bead(g, -60 + 1200 * pl, LY, { color: C.bone, w: 56, h: 24 }); }
  });
});
