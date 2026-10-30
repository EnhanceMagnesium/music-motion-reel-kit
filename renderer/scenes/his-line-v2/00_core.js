// His Line v2 — core namespace, module registry and load-order check. Original code (2026-10-05).
// Loaded first (see specs/his-line-v2.json "sceneScripts"). Classic script; every later file registers through HL.module().
(() => {
  const HL = (window.HL = window.HL || {});
  if (HL.loaded) throw new Error('HL core loaded twice');
  HL.version = 'his-line-v2.0-stage1';
  HL.W = 1080; HL.H = 1920; HL.FPS = 24;
  HL.loaded = ['core']; HL.shots = {}; HL.order = []; HL.state = { ready: false };
  HL.C = { charcoal: '#232220', ink: '#1f1d1b', inkWet: '#151311', bone: '#e7dfcc', boneDim: '#b3ab98', paper: '#e7dfcc', ember: '#cf532a', emberDeep: '#8f3516' };
  HL.FONT = { display: 'HL Display', label: 'HL Label' };
  // HL.module(name, deps, fn): throws immediately (naming the file's module) when a dependency has not been loaded yet.
  HL.module = (name, deps, fn) => {
    for (const d of deps) if (!HL.loaded.includes(d)) throw new Error(`HL module '${name}' needs '${d}' loaded first (loaded: ${HL.loaded.join(', ')})`);
    fn(HL); HL.loaded.push(name);
  };
})();
