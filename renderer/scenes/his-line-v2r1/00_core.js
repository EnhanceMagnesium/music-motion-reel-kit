// His Line v2r1 — core namespace, module registry, shared constants. Original code (2026-10-05), revision R1 of the v2 core.
// Loaded first (see specs/his-line-v2r1.json "sceneScripts"). Classic script; every later file registers through HL.module().
(() => {
  const HL = (window.HL = window.HL || {});
  if (HL.loaded) throw new Error('HL core loaded twice');
  HL.version = 'his-line-v2r1.0';
  HL.W = 1080; HL.H = 1920; HL.FPS = 24; HL.FRAMES = 864;
  HL.loaded = ['core']; HL.shots = {}; HL.order = []; HL.state = { ready: false };
  HL.C = { charcoal: '#232220', ink: '#1f1d1b', inkWet: '#151311', bone: '#e7dfcc', boneDim: '#b3ab98', paper: '#e7dfcc', ember: '#cf532a', emberDeep: '#8f3516' };
  HL.FONT = { display: 'HL Display', label: 'HL Label' };
  // One shared deed (world pixels; centre on the line row). Every shot places it with its own camera/transform; no shot defines another deed rectangle.
  HL.DEED = { x: 180, y: 700, w: 720, h: 520 };
  HL.LINE_Y = 960;
  // Nearest-frame cut quantization: cut frame indices (first frame owned by each shot) and the end frame. Spec starts are derived from these (see tools/build_spec_v2r1.mjs).
  HL.CUT_FRAMES = [0, 80, 150, 237, 289, 350, 402, 472, 550, 610, 679, 749]; HL.END_FRAME = 864;
  HL.frameT = f => f / HL.FPS;             // sampling time of output frame f (renderer draws frame i at i / fps)
  HL.frameOf = t => Math.round(t * HL.FPS); // nearest output frame of a continuous time
  // HL.module(name, deps, fn): throws immediately (naming the module) when a dependency has not been loaded yet.
  HL.module = (name, deps, fn) => {
    for (const d of deps) if (!HL.loaded.includes(d)) throw new Error(`HL module '${name}' needs '${d}' loaded first (loaded: ${HL.loaded.join(', ')})`);
    fn(HL); HL.loaded.push(name);
  };
})();
