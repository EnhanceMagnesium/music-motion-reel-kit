// His Line v2r1 — camera helper (original; guidance: R01 ClaudeAnimationBase src/core.js camBegin L91 / toScreen L93-97, world point lands at screen centre; no code copied).
// Transform order of begin(): screen = (sx+dx, sy+dy) + Rot(rot) . Shear(shear) . Scale(zoom) . (world - (cx,cy)); toScreen/toWorld implement exactly this order.
HL.module('cam', ['lib'], HL => {
  const D = { cx: HL.W / 2, cy: HL.H / 2, zoom: 1, rot: 0, sx: HL.W / 2, sy: HL.H / 2, shear: 0, dx: 0, dy: 0 };
  const norm = o => Object.assign({}, D, o);
  const toScreen = (o, x, y) => {
    const c = norm(o), u = (x - c.cx) * c.zoom, v = (y - c.cy) * c.zoom, u2 = u + c.shear * v, cs = Math.cos(c.rot), sn = Math.sin(c.rot);
    return [c.sx + c.dx + u2 * cs - v * sn, c.sy + c.dy + u2 * sn + v * cs];
  };
  const toWorld = (o, X, Y) => {
    const c = norm(o), cs = Math.cos(c.rot), sn = Math.sin(c.rot), a = X - c.sx - c.dx, b = Y - c.sy - c.dy;
    const u2 = a * cs + b * sn, v = -a * sn + b * cs, u = u2 - c.shear * v;
    return [u / c.zoom + c.cx, v / c.zoom + c.cy];
  };
  HL.cam = {
    // world point (cx,cy) lands at screen point (sx,sy) (default centre); zoom, rot (rad), skew x (shear), dx/dy screen offsets (shake)
    begin(g, o = {}) { const c = norm(o); g.save(); g.translate(c.sx + c.dx, c.sy + c.dy); g.rotate(c.rot); g.transform(1, 0, c.shear, 1, 0, 0); g.scale(c.zoom, c.zoom); g.translate(-c.cx, -c.cy); },
    end(g) { g.restore(); },
    toScreen, toWorld,
    // keyframed camera path: keys [[t, {cx,cy,zoom,rot,...}], ...] -> (t) => camera options (monotone cubic per channel via HL.m.track)
    path(keys) {
      const names = [...new Set(keys.flatMap(k => Object.keys(k[1])))], f = HL.m.track(keys.map(k => [k[0], names.map(n => k[1][n] ?? D[n])]));
      return t => Object.fromEntries(f(t).map((v, i) => [names[i], v]));
    },
  };
});
