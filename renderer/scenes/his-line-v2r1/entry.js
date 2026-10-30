// His Line v2r1 — entry script (loaded LAST). Verifies the module graph, initialises textures/buffers/cues/hits/ember, runs font measurements, and exposes a readiness report.
// Load order is defined by specs/his-line-v2r1.json "sceneScripts" (render.v3.mjs loads them one by one and fails naming the file that threw). `assets` entries are hashed only, never executed.
// SCENE_INIT performs NO scene-frame drawing: it allocates cached offscreen materials (paper/mottle/speck tiles, stamp erosion tile, two transition buffers) and measures text (measureText only).
HL.module('entry', ['core', 'lib', 'cues', 'print', 'type', 'cam', 'trans', 'text', 'hits', 'fx', 'shots_a', 'shots_b', 'shots_c'], HL => {
  const EXPECT = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12'];
  const FPS = HL.FPS, T = HL.type;
  // text-fit rows: [label, string, font, tracking px, max px or 0 = intentionally unbounded]. Real tracking per string (v2 measured every string at 3 px).
  const fitRows = () => [
    ['s02/s03 MEDIA LUNA label (400 px box, 24 px inset)', HL.CASE(HL.TEXT.mediaLuna), T.L(44), 6, 400 - 48], ['s03 CIVIC CHAMBER plaque (460 px box)', HL.CASE(HL.TEXT.civic), T.L(40), 8, 460 - 24],
    ['s12 MEDIA LUNA label (330 px box)', HL.CASE(HL.TEXT.mediaLuna), T.L(40), 5, 330 - 32],
    ['s06 THE', HL.CASE('the'), T.F(150), 3, 760], ['s06 WESTMAN’S', HL.CASE('Westman’s'), T.F(108), 3, 760], ['s06 LINE', HL.CASE('line'), T.F(150), 3, 760],
    ['s08 WESTMAN’S (x1.25 zoom)', HL.CASE('Westman’s'), T.F(120), 3, 1040 / 1.25], ['s08 THE', HL.CASE('the'), T.F(170), 3, 1040 / 1.25],
    ['s12 THE SEAL ARRIVES', HL.CASE(HL.TEXT.arrives1), T.F(86), 2, 1000], ['s12 RIGHT ON TIME. (96 px)', HL.CASE(HL.TEXT.arrives2), T.F(96), 2, 1000],
    ['s04 UPON (intentionally cropped)', 'UPON', T.F(400), -3, 0], ['s04 WALL (intentionally cropped)', 'WALL', T.F(400), -3, 0], ['s07 THE WESTMAN’S LINE (intentional pan)', HL.CASE(HL.TEXT.westman), T.F(150), 4, 0]];
  HL.textFit = () => { const c = document.createElement('canvas').getContext('2d');
    return fitRows().map(([n, s, f, ls, max]) => { c.font = f; c.letterSpacing = ls + 'px'; const w = Math.round(c.measureText(s).width); return { n, w, max, ok: !max || w <= max }; }); };
  window.SCENE_INIT = async (spec, cues) => {
    for (const f of [`700 40px "${HL.FONT.display}"`, `400 40px "${HL.FONT.label}"`]) if (!document.fonts.check(f)) throw new Error(`font not loaded: ${f}`);
    HL.cue.init(cues); HL.hits.init(); HL.print.init(); HL.initBuffers(); HL.fx.init();
    const miss = EXPECT.filter(id => !HL.shots[id] || !window.SCENES['hl-' + id]); if (miss.length) throw new Error(`shots not registered: ${miss.join(', ')}`);
    if (spec.scenes.length !== EXPECT.length) throw new Error(`spec has ${spec.scenes.length} scenes, expected ${EXPECT.length}`);
    // frame-aligned cuts (nearest-frame quantization): each scene start is at most 0.1 ms BELOW its cut frame time, so the loader's `t >= start` rule gives the new shot to exactly that frame
    spec.scenes.forEach((s, i) => {
      if (!window.SCENES[s.type]) throw new Error(`scene ${i} type '${s.type}' has no handler`);
      if (s.type !== 'hl-' + EXPECT[i]) throw new Error(`scene ${i} is '${s.type}', expected 'hl-${EXPECT[i]}'`);
      if (s.transitionIn && !HL.TRANS[s.transitionIn.type]) throw new Error(`scene ${i} unknown transition '${s.transitionIn.type}'`);
      const f = HL.CUT_FRAMES[i], ft = f / FPS; if (!(s.start <= ft + 1e-12 && ft - s.start < 1e-4)) throw new Error(`scene ${i} start ${s.start} is not frame-aligned to cut frame ${f} (${ft})`);
      const c = cues.shots.find(x => 'hl-' + x.id === s.type); if (!c) throw new Error(`no cue shot for ${s.type}`);
      if (Math.abs(c.start - s.start) > .5 / FPS + .001) throw new Error(`${s.type}: spec start ${s.start} differs from cue shot start ${c.start} by more than half a frame`);
      const e = i + 1 < spec.scenes.length ? spec.scenes[i + 1].start : spec.duration; if (Math.abs(s.end - e) > 1e-9) throw new Error(`${s.type}: end ${s.end} != next start ${e}`);
    });
    if (spec.duration * FPS !== HL.FRAMES) throw new Error(`spec duration ${spec.duration} s is not ${HL.FRAMES} frames at ${FPS} fps`);
    // iris centre must equal the ember's screen position at the OUTGOING frozen frame (computed from the compositor's own rule), within 1 px
    const iris = spec.scenes[11].transitionIn; if (iris.type === 'iris') { const e = HL.fx.ember.screen(HL.outgoingTime(spec.scenes[10])); if (Math.hypot(iris.cx - e.x, iris.cy - e.y) > 1) throw new Error(`iris centre (${iris.cx},${iris.cy}) != ember (${e.x.toFixed(2)},${e.y.toFixed(2)}) at the outgoing frame`); }
    HL.textFitResult = window.__HL_STUB ? [] : HL.textFit();   // measureText only; the Node stub cannot measure real fonts
    const bad = HL.textFitResult.filter(r => !r.ok); if (bad.length) throw new Error(`text does not fit: ${bad.map(r => `${r.n} ${r.w}px > ${Math.round(r.max)}px`).join('; ')}`);
    HL.state.ready = true; return true;
  };
  window.HL_REPORT = () => ({ version: HL.version, modules: HL.loaded, shots: HL.order, ready: HL.state.ready, hitCount: HL.hits.list.length, emberWaypoints: HL.fx.ember.waypoints.length, frames: HL.FRAMES, cuts: HL.CUT_FRAMES, textFit: HL.textFitResult });
  window.HL_TEXTCHECK = () => HL.textFit();
});
