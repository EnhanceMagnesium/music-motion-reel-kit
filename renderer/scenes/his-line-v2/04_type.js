// His Line v2 — type helpers.
// ADAPTED from tuzhechen2005/opus-video-skills @ 59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1, skills/kinetic-reel/template/reel/reel.js (MIT, (c) 2026 tuzhechen2005; see licenses/R02):
//   letters() (per-letter animation, lines 228-244), the texWindow() idea (letters as windows onto a texture, lines 345-350), bez() (line 356).
//   Changes: ctx passed explicitly (no module-level ctx swap); font from HL.FONT; textAlong() and halftoneWindow() are new original code built on those ideas.
HL.module('type', ['lib', 'print'], HL => {
  const { clamp, TAU } = HL.m;
  const F = size => `700 ${size}px "${HL.FONT.display}"`;
  const L = size => `400 ${size}px "${HL.FONT.label}"`;
  // per-letter animation: fn(i,n) -> {dx,dy,r,s,a,fill}; returns total width
  function letters(g, s, x, y, o, fn) {
    g.save(); g.font = o.font; g.letterSpacing = (o.ls || 0) + 'px';
    const total = g.measureText(s).width, x0 = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x, n = s.length;
    for (let i = 0; i < n; i++) {
      const ch = s[i]; if (ch === ' ') continue;
      const px = g.measureText(s.slice(0, i)).width, cw = g.measureText(ch).width, a = fn(i, n);
      if ((a.a ?? 1) <= .001) continue;
      g.save(); g.globalAlpha = a.a ?? 1; g.translate(x0 + px + cw / 2 + (a.dx || 0), y + (a.dy || 0)); g.rotate(a.r || 0); g.scale(a.s ?? 1, a.s ?? 1);
      g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = a.fill || o.fill || HL.C.bone; g.fillText(ch, 0, 0); g.restore();
    }
    g.restore(); return total;
  }
  const measure = (g, s, font, ls = 0) => { g.save(); g.font = font; g.letterSpacing = ls + 'px'; const w = g.measureText(s).width; g.restore(); return w; };
  // text along a path: pathFn(u in 0..1) -> [x,y]; letters appear by fn(i,n) -> {a, dy, s}
  function textAlong(g, s, pathFn, o, fn) {
    const N = 160, pts = [], cum = [0]; for (let i = 0; i <= N; i++) pts.push(pathFn(i / N));
    for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const at = d => { d = clamp(d, 0, cum[N]); let i = 1; while (i < N && cum[i] < d) i++; const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return { x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k, a: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) }; };
    g.save(); g.font = o.font; g.letterSpacing = (o.ls || 0) + 'px'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const total = g.measureText(s).width; let d = o.startAt ?? (cum[N] - total) / 2;
    for (let i = 0; i < s.length; i++) {
      const cw = g.measureText(s[i]).width, q = at(d + cw / 2), a = fn ? fn(i, s.length) : { a: 1 }; d += cw;
      if (s[i] === ' ' || (a.a ?? 1) <= .001) continue;
      g.save(); g.globalAlpha = a.a ?? 1; g.translate(q.x, q.y + (a.dy || 0)); g.rotate(q.a); g.scale(a.s ?? 1, a.s ?? 1); g.fillStyle = a.fill || o.fill || HL.C.bone; g.fillText(s[i], 0, 0); g.restore();
    }
    g.restore(); return total;
  }
  // letters as windows onto a halftone-dot texture: draw() paints the glyph shapes; dots show only inside them
  let buf = null;
  function halftoneWindow(g, draw, dotColor, bgColor, pitch = 12, rad = 4.4) {
    if (!buf) { buf = document.createElement('canvas'); buf.width = HL.W; buf.height = HL.H; }
    const b = buf.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, HL.W, HL.H);
    draw(b);
    b.globalCompositeOperation = 'source-in'; b.fillStyle = bgColor; b.fillRect(0, 0, HL.W, HL.H);
    b.globalCompositeOperation = 'source-atop'; HL.print.halftone(b, [0, 0, HL.W, HL.H], pitch, rad, dotColor, .26); b.globalCompositeOperation = 'source-over';
    g.drawImage(buf, 0, 0);
  }
  HL.type = { F, L, letters, measure, textAlong, halftoneWindow };
});
