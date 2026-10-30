// His Line v2 — shots s05-s08 (12.05-22.91 s). Original code. Timing: M re-entry 12.05; D pulses; words E (provisional); line 4 starts S 16.835.
HL.module('shots_b', ['lib', 'cues', 'print', 'type', 'cam', 'trans', 'text'], HL => {
  const { C, W, H, m, print: P, type: T } = HL, { seg, expoOut, eo, eio, kick, lerp } = m, Q = HL.cue;
  const pulse = (t, t0, k = 6) => { const f = ((t - t0) / Q.period); return Math.exp(-(f - Math.floor(f)) * k); };

  // ---------- s05  12.05-14.60  re-entry: ground flips to bone, the line is struck with a registration ghost; the ember point appears (M 12.05) ----------
  HL.shot('s05', (g, lt, p, S) => {
    P.paper(g); g.save();
    const shake = kick(lt, 0, 12, 55) * 10; g.translate(shake, 0);
    HL.cam.begin(g, { cx: 540, cy: 1000, zoom: 1 + .1 * seg(lt, 0, 2.55), rot: .006 * Math.sin(lt * 2.2) });
    g.strokeStyle = 'rgba(35,34,32,.28)'; g.lineWidth = 3; g.strokeRect(140, 560, 800, 640);
    const gh = lt < .25 ? 6 : 6 * Math.exp(-(lt - .25) * 7);
    P.ragLine(g, [-80, 1000], [1160, 1000], seg(lt, 0, .25), { color: C.ink, lw: 5, seed: 6, ghost: { dx: gh, dy: -gh * .6, a: .32 } });
    const pl = seg(lt, 0, .25); if (pl > 0 && pl < 1) P.bead(g, -80 + 1240 * pl, 1000, { color: C.ink, w: 56, h: 24 });
    // halftone band anchored to the paper (R03 risograph guidance: halftone belongs to the paper)
    P.halftone(g, [-100, 1420, 1300, 560], 26, (x, y) => Math.max(0, (y - 1420) / 560) * 10, C.ink, .26);
    HL.cam.end(g); g.restore();
    // ember point (the seal, far away): first appears on the re-entry, pulses on each D pulse
    const a = seg(lt, .05, .3), pu = pulse(S.t, 12.06);
    if (a > 0) { g.save(); g.globalAlpha = .28 * a * (.6 + .4 * pu); g.fillStyle = C.ember; g.beginPath(); g.arc(900, 300, 24, 0, m.TAU); g.fill(); g.globalAlpha = a; g.beginPath(); g.arc(900, 300, 8 + 3 * pu, 0, m.TAU); g.fill(); g.restore(); }
    P.finish(g);
  });

  // ---------- s06  14.60-16.77  THE / WESTMAN'S / LINE set along curved paths, then straightened (word starts on D pulses 14.60, 14.95, 15.32; letter times E) ----------
  HL.shot('s06', (g, lt, p, S) => {
    P.paper(g);
    HL.cam.begin(g, { cx: 540, cy: 1000, zoom: 1 + .3 * eio(seg(lt, 0, 2.17)), rot: .035 * (1 - eio(seg(lt, 0, 1.9))) });
    const straight = eio(seg(lt, .9, 1.7));
    const defs = [[HL.CASE('the'), 790, 150, 0], [HL.CASE('Westman’s'), 980, 108, .335], [HL.CASE('line'), 1170, 150, .72]];
    defs.forEach(([w, y, size, t0], wi) => {
      const len = 760, x0 = 540 - len / 2, A = (wi % 2 ? -1 : 1) * 90 * (1 - straight);
      T.textAlong(g, w, u => [x0 + u * len, y + A * Math.sin(u * Math.PI)], { font: T.F(size), ls: 3, fill: C.ink },
        (i, n) => { const s = seg(lt, t0 + i * .045, t0 + i * .045 + .22); return { a: s > 0 ? 1 : 0, dy: (1 - expoOut(s)) * 70, s: .8 + .2 * expoOut(s) }; });
    });
    P.ragLine(g, [120, 1290], [960, 1290], seg(lt, 1.5, 1.95), { color: C.ink, lw: 4, seed: 8 });
    HL.cam.end(g);
    const pu = pulse(S.t, 12.06);
    g.save(); g.globalAlpha = .3; g.fillStyle = C.ember; g.beginPath(); g.arc(880, 240, 32, 0, m.TAU); g.fill(); g.globalAlpha = 1; g.beginPath(); g.arc(880, 240, 14 + 2 * pu, 0, m.TAU); g.fill(); g.restore();
    P.finish(g);
  });

  // ---------- s07  16.77-19.65  he reads: tracking along the line; reading marker ahead of the drying front (line 4 starts S 16.835) ----------
  HL.shot('s07', (g, lt, p, S) => {
    P.dark(g, .06);
    const k = seg(lt, .1, 2.7), mx = 150 + 1450 * k, dx = 150 + 1450 * .8 * k - 20, txt = HL.CASE(HL.TEXT.westman), size = 150;
    HL.cam.begin(g, { cx: mx, cy: 1000, zoom: 1 + .05 * lt / 2.88, rot: -.012 });
    g.strokeStyle = 'rgba(231,223,204,.22)'; g.lineWidth = 2; [900, 1075].forEach(y => { g.beginPath(); g.moveTo(-400, y); g.lineTo(2400, y); g.stroke(); });
    g.font = T.F(size); g.letterSpacing = '4px'; g.textBaseline = 'alphabetic';
    // dry part (left of the front): matte, dimmer; wet part: bright with gloss
    g.save(); g.beginPath(); g.rect(-400, 700, dx + 400, 600); g.clip(); g.fillStyle = C.boneDim; g.fillText(txt, 150, 1075); g.restore();
    g.save(); g.beginPath(); g.rect(dx, 700, 3000, 600); g.clip(); g.fillStyle = C.bone; g.fillText(txt, 150, 1075); g.globalAlpha = .35; g.fillStyle = '#fff'; g.fillText(txt, 147, 1071); g.restore();
    // drying front + reading marker
    g.fillStyle = C.boneDim; g.fillRect(dx - 1, 850, 3, 300);
    g.fillStyle = C.bone; g.fillRect(mx - 3, 790, 6, 420); g.beginPath(); g.moveTo(mx - 16, 790); g.lineTo(mx + 16, 790); g.lineTo(mx, 826); g.closePath(); g.fill();
    // two dot rows: wet (bright) beyond the front, dry (dim) behind it
    g.save(); g.beginPath(); g.rect(dx, 1190, 3000, 40); g.clip(); P.halftone(g, [dx, 1190, 3000, 40], 36, 7, C.bone, 0); g.restore();
    g.save(); g.beginPath(); g.rect(-400, 1250, dx + 400, 40); g.clip(); P.halftone(g, [-400, 1250, dx + 400, 40], 36, 7, C.boneDim, 0); g.restore();
    HL.cam.end(g);
    const pu = pulse(S.t, 12.06);
    g.save(); g.globalAlpha = .32; g.fillStyle = C.ember; g.beginPath(); g.arc(860, 300, 36, 0, m.TAU); g.fill(); g.globalAlpha = 1; g.beginPath(); g.arc(860, 300, 18 + 2 * pu, 0, m.TAU); g.fill(); g.restore();
  });

  // ---------- s08  19.65-22.91  the ink is still open: back-lit sheet, soft ink ahead of a crisp drying edge (flip-in from s07; flicker every 4th D pulse) ----------
  HL.shot('s08', (g, lt, p, S) => {
    const z = 1 + .25 * eio(seg(lt, 0, 3.26));
    const gr = g.createRadialGradient(540, 960, 40, 540, 960, 1250); gr.addColorStop(0, '#f4ecd8'); gr.addColorStop(.55, '#b9ad8f'); gr.addColorStop(1, '#2f2c26');
    g.fillStyle = gr; g.fillRect(0, 0, W, H); P.finish(g, 0, 0, W, H, .6, 1);
    HL.cam.begin(g, { cx: 540, cy: 980, zoom: z });
    const edge = 120 + 840 * seg(lt, .4, 3.0), words = [[HL.CASE('the'), 760, 170], [HL.CASE('Westman’s'), 980, 120], [HL.CASE('line'), 1200, 170]];
    g.textAlign = 'center'; g.letterSpacing = '3px';
    words.forEach(([w, y, sz]) => {
      g.font = T.F(sz);
      g.save(); g.filter = 'blur(6px)'; g.globalAlpha = .75; g.fillStyle = C.inkWet; g.fillText(w, 540, y); g.restore();            // soft ink (open)
      g.save(); g.beginPath(); g.rect(0, y - 220, edge, 300); g.clip(); g.fillStyle = C.inkWet; g.fillText(w, 540, y); g.restore(); // crisp where dry
    });
    g.fillStyle = 'rgba(21,19,17,.55)'; g.fillRect(edge - 1.5, 560, 3, 780);
    HL.cam.end(g);
    // the seal shows through the paper: ember glow, low and blurred
    const pu = pulse(S.t, 12.06, 5);
    g.save(); g.filter = 'blur(18px)'; g.globalAlpha = .55; g.fillStyle = C.ember; g.beginPath(); g.arc(820, 1420, 54 + 6 * pu, 0, m.TAU); g.fill(); g.restore();
    const fl = Math.floor((S.t - 12.06) / Q.period) % 4 === 0 ? .07 * pulse(S.t, 12.06, 10) : 0;
    if (fl > 0) { g.globalAlpha = fl; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  });
});
