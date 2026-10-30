// His Line v2 — entry script (loaded LAST). Verifies the module graph, initialises textures/buffers/cues, and exposes a readiness report.
// Load order is defined by specs/his-line-v2.json "sceneScripts" (render.v3.mjs loads them one by one and fails naming the file that threw).
HL.module('entry', ['core', 'lib', 'cues', 'print', 'type', 'cam', 'trans', 'text', 'shots_a', 'shots_b', 'shots_c'], HL => {
  const EXPECT = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12'];
  // called by studio.v3.html prepare() after the spec fonts have loaded
  window.SCENE_INIT = async (spec, cues) => {
    for (const f of [`700 40px "${HL.FONT.display}"`, `400 40px "${HL.FONT.label}"`]) if (!document.fonts.check(f)) throw new Error(`font not loaded: ${f}`);
    HL.cue.init(cues); HL.print.init(); HL.initBuffers();
    const miss = EXPECT.filter(id => !HL.shots[id] || !window.SCENES['hl-' + id]); if (miss.length) throw new Error(`shots not registered: ${miss.join(', ')}`);
    spec.scenes.forEach((s, i) => { if (!window.SCENES[s.type]) throw new Error(`scene ${i} type '${s.type}' has no handler`);
      if (s.transitionIn && !HL.TRANS[s.transitionIn.type]) throw new Error(`scene ${i} unknown transition '${s.transitionIn.type}'`); });
    // the spec rows must match cues_v2 shot times (single source of truth check)
    spec.scenes.forEach(s => { const c = cues.shots.find(x => 'hl-' + x.id === s.type); if (!c) throw new Error(`no cue shot for ${s.type}`);
      if (Math.abs(c.start - s.start) > .001 || Math.abs(c.end - s.end) > .001) throw new Error(`${s.type}: spec ${s.start}-${s.end} != cues ${c.start}-${c.end}`); });
    HL.state.ready = true; return true;
  };
  window.HL_REPORT = () => ({ version: HL.version, modules: HL.loaded, shots: HL.order, ready: HL.state.ready });
  // text-fit table for the preflight smoke (no drawing): [label, string, font, max px]
  window.HL_TEXTCHECK = () => {
    const c = document.createElement('canvas').getContext('2d'), rows = [
      ['s03 civic chamber label', HL.CASE(HL.TEXT.civic), HL.type.L(40), 380], ['s02 media luna label', HL.CASE(HL.TEXT.mediaLuna), HL.type.L(44), 380],
      ['s06 THE', HL.CASE('the'), HL.type.F(150), 760], ['s06 WESTMAN’S', HL.CASE('Westman’s'), HL.type.F(108), 760], ['s06 LINE', HL.CASE('line'), HL.type.F(150), 760],
      ['s08 WESTMAN’S (x1.25 zoom)', HL.CASE('Westman’s'), HL.type.F(120), 1040 / 1.25], ['s08 THE', HL.CASE('the'), HL.type.F(170), 1040 / 1.25],
      ['s12 THE SEAL ARRIVES', HL.CASE(HL.TEXT.arrives1), HL.type.F(86), 1000], ['s12 RIGHT ON TIME.', HL.CASE(HL.TEXT.arrives2), HL.type.F(86), 1000],
      ['s04 UPON (intentionally cropped)', 'UPON', HL.type.F(400), 1250], ['s04 WALL (intentionally cropped)', 'WALL', HL.type.F(400), 1250]];
    return rows.map(([n, s, f, max]) => { c.font = f; c.letterSpacing = '3px'; const w = Math.round(c.measureText(s).width); return { n, w, max, ok: w <= max }; });
  };
});
