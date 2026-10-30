// His Line v2 — shot registry and A/B transition compositor.
// ADAPTED (pattern + four transitions) from tuzhechen2005/opus-video-skills @ 59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1,
//   skills/kinetic-reel/template/reel/reel.js (MIT, (c) 2026 tuzhechen2005): renderInto()/frame() two-buffer scheme (lines 477-505),
//   trPush (383), trWipe (384), trSlats (385), trIris (371-382), one-frame flash on hard cuts (line ~503).
//   Changes: draw functions take their target context explicitly (no global ctx swap); no WebGL post; scene index/times from the spec; flip transition is new original code.
//
// DRAW CONTRACT   draw(g, lt, p, S)   g = target 2D context (main canvas or an offscreen buffer), lt = seconds since the shot's start,
//                 p = lt/duration, S = {t, start, end, dur, cue}. A draw function must be a pure function of (lt, S): no state across frames.
// COMPOSE (per output frame, scene row with transitionIn {type, dur}, only while t < start + dur):
//   1. clear bufA, bufB; reset state of each (identity transform, alpha 1, source-over, no shadow/filter/dash)
//   2. draw the OUTGOING shot into bufA at its last frame time  tA = prev.end - 1/fps  (lt = prev.dur - 1/fps)
//   3. draw the INCOMING shot into bufB at the real time t
//   4. k = (t - start)/dur; TRANS[type](k, bufA, bufB, g) paints the composite onto the main canvas; g is saved/restored around it
//   5. return; renderAt in studio.v3.html returns true and the renderer screenshots the main canvas.
HL.module('trans', ['lib', 'print'], HL => {
  const { clamp, ioExpo, eio } = HL.m, W = HL.W, H = HL.H;
  let bufA, bufB;
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  HL.initBuffers = () => { bufA = mk(); bufB = mk(); };
  const reset = g => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; g.filter = 'none'; g.setLineDash([]); g.lineWidth = 1; g.lineCap = 'butt'; g.lineJoin = 'miter'; g.letterSpacing = '0px'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; };
  HL.resetCtx = reset;
  const drawShot = (id, g, t, scene, spec) => {
    const s = HL.shots[id]; if (!s) throw new Error(`shot '${id}' not registered`);
    reset(g); g.clearRect(0, 0, W, H); g.save();
    const dur = scene.end - scene.start, lt = clamp(t - scene.start, 0, dur);
    s.draw(g, lt, lt / dur, { t, start: scene.start, end: scene.end, dur, cue: HL.cue, spec, id }); g.restore(); reset(g);
  };
  const TRANS = HL.TRANS = {
    push: (dx, dy) => (k, A, B, g) => { const e = ioExpo(k); g.drawImage(A, -dx * W * e, -dy * H * e); g.drawImage(B, dx * W * (1 - e), dy * H * (1 - e)); },
    wipe: (col) => (k, A, B, g) => { const x = eio(k) * (W + 40); g.drawImage(A, 0, 0); g.save(); g.beginPath(); g.rect(0, 0, x, H); g.clip(); g.drawImage(B, 0, 0); g.restore(); g.fillStyle = col; g.fillRect(x - 4, 0, 8, H); },
    slats: (n) => (k, A, B, g) => { g.drawImage(A, 0, 0); const sh = H / n; for (let i = 0; i < n; i++) { const kk = eio(clamp((k - i * .035) / .6)); if (kk <= 0) continue; g.save(); g.beginPath(); g.rect(0, i * sh, W, sh * kk + 1); g.clip(); g.drawImage(B, 0, 0); g.restore(); } },
    iris: (cx, cy, col) => (k, A, B, g) => { const r = eio(k) * Math.hypot(W, H); g.drawImage(A, 0, 0); g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip(); g.drawImage(B, 0, 0); g.restore(); g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); },
    // card flip: outgoing squashes to a line on the centre row, incoming opens from it (original)
    flip: () => (k, A, B, g) => { g.fillStyle = HL.C.charcoal; g.fillRect(0, 0, W, H); const s = k < .5 ? 1 - eio(k * 2) : eio(k * 2 - 1), img = k < .5 ? A : B; g.save(); g.translate(0, H / 2); g.scale(1, Math.max(.002, s)); g.drawImage(img, 0, -H / 2); g.restore(); },
  };
  const make = { push: o => TRANS.push(o.dx || 0, o.dy || 0), wipe: o => TRANS.wipe(o.col || HL.C.bone), slats: o => TRANS.slats(o.n || 12), iris: o => TRANS.iris(o.cx || W / 2, o.cy || H / 2, o.col || HL.C.bone), flip: () => TRANS.flip() };
  // register a shot: HL.shot('s05', draw) -> window.SCENES['hl-s05'] (called by studio.v3.html renderAt as (scene, p, spec, t))
  HL.shot = (id, draw) => {
    HL.shots[id] = { id, draw }; HL.order.push(id);
    window.SCENES = window.SCENES || {};
    window.SCENES['hl-' + id] = (scene, p, spec, t) => {
      const g = window.ctx2d, idx = spec.scenes.indexOf(scene), tin = scene.transitionIn;
      if (tin && idx > 0 && t < scene.start + tin.dur) {
        const prev = spec.scenes[idx - 1], pid = prev.type.replace(/^hl-/, '');
        drawShot(pid, bufA.getContext('2d'), prev.end - 1 / HL.FPS, prev, spec);
        drawShot(id, bufB.getContext('2d'), t, scene, spec);
        reset(g); g.save(); (make[tin.type] || (() => { throw new Error(`unknown transition '${tin.type}'`); }))(tin)(clamp((t - scene.start) / tin.dur), bufA, bufB, g); g.restore(); reset(g);
      } else {
        drawShot(id, g, t, scene, spec);
        if (scene.flashOnCut && t < scene.start + 1.5 / HL.FPS) { g.save(); g.globalAlpha = scene.flashOnCut; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }
      }
    };
  };
});
