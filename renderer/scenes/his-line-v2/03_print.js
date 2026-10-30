// His Line v2 — printed-paper drawing helpers.
// ADAPTED from lemomo-ai/lemo-opuscar @ b65efe6ea393fdc71212898ea4c57c754cfefa46, styles/silkscreen-poster/demo/engine/silk.js (MIT, (c) 2026 LemoLab):
//   noiseField, makeTextures (paper/mottle/speck tiles), texFill, paperSheet, inkFinish, wipeRegion, wipeFront.
//   Changes: ES exports -> HL.print; Chinese comments removed; paper hex taken from HL.C; N reduced to 384 for startup time.
//   The squeegee BEAD (bead()) is a reduced ORIGINAL drawing inspired by silk.js squeegee() (shadow, body, highlight stripe, drips); no lines copied.
// Original: halftone(), hatch(), ragLine(), ring().
HL.module('print', ['lib'], HL => {
  const { clamp, lerp, hash, mulberry, TAU } = HL.m;
  const hex2rgb = h => { h = h.replace('#', ''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  function tile(n, fn) { const c = document.createElement('canvas'); c.width = c.height = n; fn(c.getContext('2d'), n); return c; }
  function noiseField(n, seed, cell) {
    const r = mulberry(seed), gw = Math.ceil(n / cell), grid = [];
    for (let i = 0; i < gw * gw; i++) grid.push(r());
    const at = (x, y) => grid[((y % gw + gw) % gw) * gw + ((x % gw + gw) % gw)];
    const out = new Float32Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const fx = x / cell, fy = y / cell, ix = Math.floor(fx), iy = Math.floor(fy), ux = fx - ix, uy = fy - iy;
      const sx = ux * ux * (3 - 2 * ux), sy = uy * uy * (3 - 2 * uy);
      out[y * n + x] = lerp(lerp(at(ix, iy), at(ix + 1, iy), sx), lerp(at(ix, iy + 1), at(ix + 1, iy + 1), sx), sy);
    }
    return out;
  }
  function makeTextures(paperHex, seed = 7) {
    const N = 384, P = hex2rgb(paperHex);
    const n1 = noiseField(N, seed, 48), n2 = noiseField(N, seed + 1, 12), n3 = noiseField(N, seed + 2, 4);
    const paper = tile(N, g => {
      const im = g.createImageData(N, N);
      for (let i = 0; i < N * N; i++) { const v = (n1[i] - .5) * 10 + (n2[i] - .5) * 6 + (n3[i] - .5) * 7; im.data[i * 4] = P[0] + v; im.data[i * 4 + 1] = P[1] + v; im.data[i * 4 + 2] = P[2] + v * 1.1; im.data[i * 4 + 3] = 255; }
      g.putImageData(im, 0, 0);
      const r = mulberry(seed + 9);
      for (let k = 0; k < 600; k++) {
        const x = r() * N, y = r() * N, a = r() * Math.PI, l = 3 + r() * 9;
        g.strokeStyle = r() < .5 ? 'rgba(255,255,250,.28)' : 'rgba(120,100,70,.10)'; g.lineWidth = .6 + r() * .5;
        for (const ox of [0, -N, N]) for (const oy of [0, -N, N]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); }
      }
    });
    const ns = noiseField(N, seed + 5, 24);
    const mottle = tile(N, g => {
      const im = g.createImageData(N, N), r = mulberry(seed + 11), col = new Float32Array(N);
      for (let x = 0; x < N; x++) col[x] = r() < .06 ? r() : 0;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; const v = 255 - (n1[i] * 10 + ns[i] * 8 + n3[i] * 6) - col[x] * 10 * (.5 + .5 * n2[i]); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
      g.putImageData(im, 0, 0);
    });
    const speck = tile(N, g => {
      const r = mulberry(seed + 21); g.fillStyle = paperHex;
      for (let k = 0; k < 360; k++) { const x = r() * N, y = r() * N, s = r() < .9 ? .5 + r() * .9 : 1.4 + r() * 1.6; g.globalAlpha = .35 + r() * .5; g.beginPath(); g.ellipse(x, y, s, s * (.6 + r() * .5), r() * 3, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    });
    return { paper, mottle, speck, N };
  }
  function texFill(ctx, tex, x, y, w, h, unit = .6, op = 'source-over', alpha = 1, off = [0, 0]) {
    const p = ctx.createPattern(tex, 'repeat'); p.setTransform(new DOMMatrix([unit, 0, 0, unit, off[0], off[1]]));
    ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = alpha; ctx.fillStyle = p; ctx.fillRect(x, y, w, h); ctx.restore();
  }
  function wipeRegion(box, dir, p, seed = 1, tail = 26, step = 5) {
    const [x, y, w, h] = box, path = new Path2D();
    if (p >= 1) { path.rect(x - 4000, y - 4000, w + 8000, h + 8000); return path; }
    if (p <= 0) return path;
    const along = dir === 'down' || dir === 'up' ? h : w, across = dir === 'down' || dir === 'up' ? w : h;
    const front = -tail + p * (along + tail * 2), pts = [];
    for (let s = -8; s <= across + 8; s += step) {
      const n = hash(Math.floor(s / step) * 7.13 + seed * 31.7), n2 = hash(Math.floor(s / step / 3) * 3.7 + seed);
      pts.push([s, front - tail * (n * .65 + n2 * .35)]);
    }
    const P = (a, b) => dir === 'down' ? [x + a, y + b] : dir === 'up' ? [x + a, y + h - b] : dir === 'right' ? [x + b, y + a] : [x + w - b, y + a];
    let q = P(-8, -4000); path.moveTo(q[0], q[1]);
    for (const [a, b] of pts) { q = P(a, b); path.lineTo(q[0], q[1]); }
    q = P(across + 8, -4000); path.lineTo(q[0], q[1]); path.closePath(); return path;
  }
  function wipeFront(box, dir, p, tail = 26) {
    const [x, y, w, h] = box, along = dir === 'down' || dir === 'up' ? h : w, f = -tail + p * (along + tail * 2);
    return dir === 'down' ? y + f : dir === 'up' ? y + h - f : dir === 'right' ? x + f : x + w - f;
  }
  const P = HL.print = { texFill, wipeRegion, wipeFront, makeTextures, T: null, ready: false };
  P.init = () => { P.T = makeTextures(HL.C.paper, 7); P.ready = true; };
  P.paper = (g, x = 0, y = 0, w = HL.W, h = HL.H, unit = .6) => texFill(g, P.T.paper, x, y, w, h, unit);
  P.finish = (g, x = 0, y = 0, w = HL.W, h = HL.H, unit = .6, amt = 1) => {
    texFill(g, P.T.mottle, x, y, w, h, unit * 1.4, 'multiply', .55 * amt, [13, 7]);
    texFill(g, P.T.speck, x, y, w, h, unit, 'source-over', .5 * amt, [5, 11]);
  };
  // charcoal ground with faint bone dust
  P.dark = (g, amt = .07) => { g.fillStyle = HL.C.charcoal; g.fillRect(0, 0, HL.W, HL.H); texFill(g, P.T.speck, 0, 0, HL.W, HL.H, .8, 'source-over', amt, [31, 17]); };
  // --- original ---
  // ruled line from a to b, drawn up to progress p with a ragged front (wipeRegion clip). o: color, lw, ghost {dx,dy,a}, seed
  P.ragLine = (g, a, b, p, o = {}) => {
    if (p <= 0) return;
    const lw = o.lw || 3, x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), y0 = Math.min(a[1], b[1]) - 30, hh = Math.abs(b[1] - a[1]) + 60;
    g.save(); g.clip(wipeRegion([x0 - 6, y0, x1 - x0 + 12, hh], 'right', clamp(p), o.seed || 3, o.tail || 40));
    g.lineCap = 'round';
    if (o.ghost) { g.globalAlpha = o.ghost.a ?? .3; g.strokeStyle = o.color; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0] + o.ghost.dx, a[1] + o.ghost.dy); g.lineTo(b[0] + o.ghost.dx, b[1] + o.ghost.dy); g.stroke(); g.globalAlpha = 1; }
    g.strokeStyle = o.color; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore();
  };
  // squeegee bead at the front of a line (reduced original drawing)
  P.bead = (g, x, y, o = {}) => {
    const w = o.w || 46, h = o.h || 20, col = o.color || HL.C.bone;
    g.save(); g.translate(x, y);
    g.globalAlpha = .25; g.fillStyle = '#000'; g.beginPath(); g.ellipse(6, 8, w * .5, h * .5, 0, 0, TAU); g.fill();
    g.globalAlpha = 1; g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, w * .5, h * .5, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-w * .08, -h * .15, w * .3, h * .16, 0, 0, TAU); g.fill();
    g.fillStyle = col; g.beginPath(); g.ellipse(-w * .55, 3, 5, 3, 0, 0, TAU); g.fill();
    g.restore();
  };
  // halftone dots in a box; r(x,y) -> radius px (0 skips); angle in radians
  P.halftone = (g, box, pitch, rad, color, angle = .26) => {
    const [bx, by, bw, bh] = box, ca = Math.cos(angle), sa = Math.sin(angle);
    g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip(); g.fillStyle = color;
    const cx = bx + bw / 2, cy = by + bh / 2, R = Math.hypot(bw, bh) / 2;
    for (let u = -R; u <= R; u += pitch) for (let v = -R; v <= R; v += pitch) {
      const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca, r = typeof rad === 'function' ? rad(x, y) : rad;
      if (r > .3) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    }
    g.restore();
  };
  // parallel hatch lines inside a rect, drawn up to progress p
  P.hatch = (g, box, spacing, angle, color, lw = 2, p = 1, alpha = 1) => {
    const [bx, by, bw, bh] = box; if (p <= 0) return;
    g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip(); g.strokeStyle = color; g.lineWidth = lw; g.globalAlpha = alpha;
    const ca = Math.cos(angle), sa = Math.sin(angle), R = Math.hypot(bw, bh), cx = bx + bw / 2, cy = by + bh / 2, n = Math.floor(R / spacing);
    for (let i = -n; i <= n; i++) { const ox = cx - sa * i * spacing, oy = cy + ca * i * spacing; g.beginPath(); g.moveTo(ox - ca * R * (1 - 2 * 0), oy - sa * R); g.lineTo(ox - ca * R + ca * 2 * R * p, oy - sa * R + sa * 2 * R * p); g.stroke(); }
    g.restore();
  };
  P.ring = (g, x, y, r, lw, color, a = 1) => { if (r <= 0 || a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = color; g.lineWidth = lw; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore(); };
});
