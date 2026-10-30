// His Line v2 — shots s01-s04 (0.00-12.05 s). Original code. Timing sources: D detected pulses, ghost ticks (D,U), E estimated words, M energy events (see cues_v2.json).
// Techniques: print.ragLine/bead (adapted R03 wipeRegion + original bead), print.halftone/hatch (original), type.letters/halftoneWindow (adapted R02), cam (original), kick/spring (adapted R03 lib).
HL.module('shots_a', ['lib', 'cues', 'print', 'type', 'cam', 'trans', 'text'], HL => {
  const { C, W, H, m, print: P, type: T } = HL, { seg, expoOut, eo, eio, kick } = m, Q = HL.cue;

  // ---------- s01  0.00-3.34  hook: the line is struck, dot rows print on pulses (D 0.43, 1.16, 1.89, 2.62; period 0.3595) ----------
  HL.shot('s01', (g, lt) => {
    P.dark(g, .09);
    const zoom = 1 + 1.2 * expoOut(seg(lt, .43, .80)) - .18 * seg(lt, .8, 3.34);
    HL.cam.begin(g, { cx: 540, cy: 960, zoom });
    const pl = seg(lt, .06, .43), x1 = -60 + 1200 * pl;
    P.ragLine(g, [-60, 960], [1140, 960], pl, { color: C.bone, lw: 3.2, seed: 2, ghost: { dx: 3, dy: -2, a: .25 } });
    g.fillStyle = C.bone;
    for (let x = 0, i = 0; x <= 1080; x += 60, i++) if (x < x1 - 20) { g.globalAlpha = .7; g.fillRect(x - 1, 960 - (i % 3 ? 10 : 20), 2, i % 3 ? 20 : 40); }
    g.globalAlpha = 1;
    if (pl > 0 && pl < 1) P.bead(g, x1, 960, { color: C.bone, w: 50, h: 22 });
    [1.16, 1.89, 2.62].forEach((t0, i) => {
      const y = 1040 + i * 64, pr = seg(lt, t0, t0 + .30);
      if (pr <= 0) return;
      g.save(); g.clip(P.wipeRegion([-60, y - 24, 1200, 48], 'right', pr, i + 5, 30));
      P.halftone(g, [-60, y - 24, 1200, 48], 30, (x) => 7 * (.55 + .45 * Math.sin(x * .014 + i * 1.7)), C.bone, 0); g.restore();
    });
    HL.cam.end(g);
  });

  // ---------- s02  3.34-6.26  the deed is drawn by an instrument (four edge strokes start on consecutive D pulses 3.34, 3.71, 4.08, 4.44 -> lt 0, .36, .72, 1.08; fill 4.80, label 5.17, line 5.53) ----------
  const D = { x: 140, y: 560, w: 800, h: 640 };
  HL.shot('s02', (g, lt) => {
    P.paper(g); g.fillStyle = 'rgba(35,34,32,.04)'; g.fillRect(0, 0, W, H);
    const z = 1.45 - .53 * eio(seg(lt, 0, 2.9));
    HL.cam.begin(g, { cx: 540, cy: 880, zoom: z });
    const corners = [[D.x, D.y], [D.x + D.w, D.y], [D.x + D.w, D.y + D.h], [D.x, D.y + D.h]];
    g.strokeStyle = C.ink; g.lineWidth = 3; g.lineCap = 'round';
    corners.forEach(([x, y], i) => { const a = seg(lt, .0 + i * .08, .25 + i * .08), sx = i === 0 || i === 3 ? -1 : 1, sy = i < 2 ? -1 : 1; if (a <= 0) return;
      g.globalAlpha = a; g.beginPath(); g.moveTo(x + sx * 70, y + sy * 40); g.lineTo(x + sx * 40, y + sy * 40); g.lineTo(x + sx * 40, y + sy * 70); g.stroke(); });
    g.globalAlpha = 1;
    let pen = null; g.lineWidth = 5;
    for (let i = 0; i < 4; i++) {
      const a = corners[i], b = corners[(i + 1) % 4], s = seg(lt, i * .3595, i * .3595 + .34);
      if (s <= 0) continue; const e = eio(s), px = a[0] + (b[0] - a[0]) * e, py = a[1] + (b[1] - a[1]) * e;
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(px, py); g.stroke(); if (s < 1) pen = [px, py];
    }
    // deed fill after the outline closes
    const f = seg(lt, 1.46, 1.7); if (f > 0) { g.globalAlpha = f * .85; g.fillStyle = '#efe8d6'; g.fillRect(D.x + 3, D.y + 3, D.w - 6, D.h - 6); g.globalAlpha = 1; }
    // label box + MEDIA LUNA (D pulse 5.90 -> lt 2.56)
    const lb = seg(lt, 1.83, 2.15);
    if (lb > 0) { g.fillStyle = C.ink; g.fillRect(190, 610, 400 * eo(lb), 92);
      T.letters(g, HL.CASE(HL.TEXT.mediaLuna), 214, 668, { font: T.L(44), ls: 6, fill: C.bone }, (i, n) => ({ a: seg(lt, 2.0 + i * .035, 2.1 + i * .035), dy: (1 - expoOut(seg(lt, 2.0 + i * .035, 2.2 + i * .035))) * -18 })); }
    // the line across the deed
    P.ragLine(g, [D.x - 40, 1000], [D.x + D.w + 40, 1000], seg(lt, 2.19, 2.55), { color: C.ink, lw: 4, seed: 4 });
    if (pen) { g.save(); g.translate(pen[0], pen[1]); g.fillStyle = C.ink; g.beginPath(); g.moveTo(0, 0); g.lineTo(16, -34); g.lineTo(34, -26); g.closePath(); g.fill(); g.lineWidth = 16; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(26, -30); g.lineTo(92, -170); g.stroke(); g.restore(); }
    HL.cam.end(g); P.finish(g);
  });

  // ---------- s03  6.26-9.89  the wall is hatched in course by course (ghost ticks D,U); low-band level dims the lamp (M level); "civic chamber" E 6.6-7.6 ----------
  const ROWS = 12, RH = 130, WY0 = 420;
  function course(g, row, p, dirRight, alpha) {
    const y = WY0 + row * RH; if (p <= 0) return;
    g.save(); g.globalAlpha = alpha; g.clip(P.wipeRegion([-100, y, 1300, RH], dirRight ? 'right' : 'left', p, row + 3, 36));
    g.fillStyle = 'rgba(35,34,32,.07)'; g.fillRect(-100, y, 1300, RH);
    g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(-100, y); g.lineTo(1200, y); g.stroke();
    const off = (row % 2) * 110; g.lineWidth = 2.5;
    for (let x = -220 + off; x < 1200; x += 220) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + RH); g.stroke(); }
    P.hatch(g, [-100, y, 1300, RH], 16, .7, 'rgba(35,34,32,.35)', 1.6, 1); g.restore();
  }
  HL.shot('s03', (g, lt, p, S) => {
    P.paper(g);
    const tilt = eio(seg(lt, 0, 3.63)), cy = 960 + 480 * (1 - tilt);
    const ticks = Q.ghostIn(6.26, 9.89).map(t => t - 6.26);
    // far plate (parallax 0.6): faint big blocks
    HL.cam.begin(g, { cx: 540, cy: 960 + (cy - 960) * .6, zoom: 1 });
    g.strokeStyle = 'rgba(35,34,32,.14)'; g.lineWidth = 2;
    for (let r = 0; r < 9; r++) for (let x = -300 + (r % 2) * 180; x < 1300; x += 360) g.strokeRect(x, 200 + r * 240, 360, 240);
    HL.cam.end(g);
    HL.cam.begin(g, { cx: 540, cy, zoom: 1 });
    for (let j = 0; j < ROWS; j++) { const row = ROWS - 1 - j, t0 = ticks[Math.min(j, ticks.length - 1)] ?? .2 * j; course(g, row, seg(lt, t0, t0 + .28), j % 2 === 0, 1); }
    // deed pinned on the wall
    const dx = 140, dy = 560, dw = 800, dh = 540, sh = seg(lt, .0, .5);
    g.fillStyle = 'rgba(35,34,32,.28)'; g.fillRect(dx + 14, dy + 18, dw, dh);
    g.fillStyle = '#efe8d6'; g.fillRect(dx, dy, dw, dh); g.strokeStyle = C.ink; g.lineWidth = 4; g.strokeRect(dx, dy, dw, dh);
    g.fillStyle = C.ink; [[dx + 26, dy + 26], [dx + dw - 26, dy + 26], [dx + 26, dy + dh - 26], [dx + dw - 26, dy + dh - 26]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 9, 0, m.TAU); g.fill(); });
    g.fillRect(190, 640, 400, 92); T.letters(g, HL.CASE(HL.TEXT.mediaLuna), 214, 698, { font: T.L(44), ls: 6, fill: C.bone }, () => ({}));
    g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(dx - 40, 1000); g.lineTo(dx + dw + 40, 1000); g.stroke();
    // plaque: CIVIC CHAMBER (E 6.6-7.6 -> lt .34-1.34)
    const pp = seg(lt, .34, .7); g.fillStyle = C.ink; g.fillRect(340, 440, 400 * eo(pp), 76);
    T.letters(g, HL.CASE(HL.TEXT.civic), 540, 492, { font: T.L(40), ls: 8, fill: C.bone, align: 'center' }, (i, n) => ({ a: seg(lt, .5 + i * .06, .62 + i * .06) }));
    HL.cam.end(g);
    // near ledge (parallax 1.4)
    HL.cam.begin(g, { cx: 540, cy: 960 + (cy - 960) * 1.4, zoom: 1 });
    g.fillStyle = C.ink; g.fillRect(-50, 1860, 1200, 40); P.hatch(g, [-50, 1900, 1200, 120], 14, .8, C.ink, 2, 1, .8);
    HL.cam.end(g);
    g.fillStyle = C.ink; g.globalAlpha = .55 * (1 - Q.level(S.t)); g.fillRect(0, 0, W, H); g.globalAlpha = 1; P.finish(g);
  });

  // ---------- s04  9.89-12.05  UPON THE WALL cropped giant words, then the freeze at M 11.53 (word times E, provisional) ----------
  HL.shot('s04', (g, lt) => {
    P.dark(g, .05);
    const tFreeze = 11.53 - 9.89, zoom = 1 + .12 * eo(seg(lt, 0, tFreeze));
    HL.cam.begin(g, { cx: 540, cy: 960, zoom });
    const words = [['UPON', 640, 10], ['THE', 1090, -30], ['WALL', 1540, 10]];
    T.halftoneWindow(g, b => words.forEach(([w, y, xo], i) => T.letters(b, w, 540 + xo, y, { font: T.F(400), ls: -3, fill: '#000', align: 'center' },
      (k) => { const t0 = .0 + i * .22 + k * .03, e = seg(lt, t0, t0 + .32); return { dy: (1 - expoOut(e)) * -420, a: e > 0 ? 1 : 0 }; })), C.ink, C.bone, 12, 3.6);
    HL.cam.end(g);
    const dim = .4 * seg(lt, tFreeze, tFreeze + .2); if (dim > 0) { g.globalAlpha = dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  });
});
