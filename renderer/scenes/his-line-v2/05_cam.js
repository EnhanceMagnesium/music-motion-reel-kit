// His Line v2 — camera helper (original; idea after R01 ClaudeAnimationBase src/core.js camBegin/camEnd: world point lands at screen centre).
HL.module('cam', ['lib'], HL => {
  HL.cam = {
    // world point (cx,cy) lands at screen point (sx,sy) (default centre); zoom, rot (rad), skew x (shear)
    begin(g, { cx = HL.W / 2, cy = HL.H / 2, zoom = 1, rot = 0, sx = HL.W / 2, sy = HL.H / 2, shear = 0, dx = 0, dy = 0 } = {}) {
      g.save(); g.translate(sx + dx, sy + dy); g.rotate(rot); g.transform(1, 0, shear, 1, 0, 0); g.scale(zoom, zoom); g.translate(-cx, -cy);
    },
    end(g) { g.restore(); }
  };
});
