// project-config.js — ONE normalization/validation of the production PROJECT (config.js) for every consumer.
// Classic script in the browser (defines global normalizeProject) AND CommonJS module in Node (render driver, tests):
// core.js, the sizing script, the adapter install and render.mjs all call this same function, so a supported override
// (width, height, fps, duration, bpm, offset, seed, sourceAudioOffsetSeconds) reaches every component identically.
// Theme, typography, cues, particle events stay production-specific: unknown keys (audio, ...) pass through untouched.
//
// PRODUCTION CONTRACT (additive; a config without these keys behaves exactly as before). All times are PRODUCTION seconds
// (excerpt-local video time; 0 = source time sourceAudioOffsetSeconds). Source-time cues are converted separately, once
// (production/cue-schema.mjs).
//   productionId  string          required when scenes are declared; names this production's outputs/caches
//   modules       [{id, src, type?:'classic'|'module', requires?:[moduleId]}]   scene/mechanism scripts; src relative to config.js
//   scenes        [{id, start, end, impl?, needs?:[moduleId], params?}]         contiguous schedule; impl defaults to id
//   coverage      {start,end}     interval the schedule must cover exactly (default 0..duration)
//   cues          {entries:[...]} | {module:'path'}                              see production/cue-schema.mjs
//   assets        [path | {id, src, kind?:'image'|'data'|'other'}]              relative to config.js
//   fonts         [path | {family, src, weight?, style?, unicodeRange?}]        relative to config.js (FontFace-loaded)
//   renderEngine  'p5'|'remotion'                                               p5 is the legacy default; new song productions use the shared Remotion route.
//   remotion      {scenes, publicDir?}                                          React scene-registry path and local media directory for Remotion.
// Derived (always recomputed, never trusted from input): moduleLoadOrder = stable topological order (ties by declaration order).
(function (root) {
  // duration remains an explicit per-production value for new songs. The legacy
  // fallback is 11 seconds; when no opt-in cap is supplied, the resolved cap
  // follows the resolved duration rather than imposing a global ceiling.
  const DEFAULTS = { width: 1080, height: 1920, fps: 24, duration: 11, bpm: 120, offset: 0, seed: 1, sourceAudioOffsetSeconds: 0 };
  const EPS = 1e-9;
  const fail = (m) => { throw new RangeError('PROJECT config: ' + m); };
  const num = (v, name) => (typeof v === 'number' && Number.isFinite(v)) ? v : fail(`${name} must be a finite number, got ${String(v)}`);
  const ID = /^[A-Za-z][A-Za-z0-9_.-]*$/;
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const ident = (v, what) => (typeof v === 'string' && ID.test(v)) ? v : fail(`${what} must be an identifier (letters, digits, _ . -; starting with a letter), got ${JSON.stringify(v)}`);
  // production-relative paths: no absolute paths, URL schemes, backslashes or empty strings (resolution is against the config file's folder)
  const relPath = (v, what) => (typeof v === 'string' && v.length && !/^([a-z][a-z0-9+.-]*:|\/|\\)/i.test(v) && !v.includes('\\')) ? v : fail(`${what} must be a relative path with forward slashes, got ${JSON.stringify(v)}`);
  const list = (v, what) => v === undefined ? [] : Array.isArray(v) ? v : fail(`${what} must be an array`);

  function validateModules(raw) {
    const seen = new Map(), mods = list(raw, 'modules').map((m, i) => {
      if (!isObj(m)) fail(`modules[${i}] must be an object`);
      const id = ident(m.id, `modules[${i}].id`);
      if (seen.has(id)) fail(`duplicate module id "${id}"`);
      const type = m.type === undefined ? 'classic' : m.type;
      if (type !== 'classic' && type !== 'module') fail(`module "${id}" type must be 'classic' or 'module', got ${JSON.stringify(m.type)}`);
      const requires = list(m.requires, `module "${id}" requires`).map((r) => ident(r, `module "${id}" requires entry`));
      if (new Set(requires).size !== requires.length) fail(`module "${id}" lists a requirement twice`);
      seen.set(id, i);
      return Object.freeze({ id, src: relPath(m.src, `module "${id}" src`), type, requires: Object.freeze(requires) });
    });
    for (const m of mods) for (const r of m.requires) {
      if (!seen.has(r)) fail(`module "${m.id}" requires unknown module "${r}"`);
      if (r === m.id) fail(`module "${m.id}" requires itself`);
    }
    // stable topological order: repeatedly take the first DECLARED module whose requirements are already emitted
    const done = new Set(), order = [];
    while (order.length < mods.length) {
      const next = mods.find((m) => !done.has(m.id) && m.requires.every((r) => done.has(r)));
      if (!next) fail(`module dependency cycle among: ${mods.filter((m) => !done.has(m.id)).map((m) => m.id).join(', ')}`);
      done.add(next.id); order.push(next.id);
    }
    return { mods: Object.freeze(mods), order: Object.freeze(order) };
  }

  function validateScenes(raw, p, moduleIds) {
    const scenes = list(raw, 'scenes').map((s, i) => {
      if (!isObj(s)) fail(`scenes[${i}] must be an object`);
      const id = ident(s.id, `scenes[${i}].id`);
      const start = num(s.start, `scene "${id}" start`), end = num(s.end, `scene "${id}" end`);
      if (start < 0) fail(`scene "${id}" start ${start}s is negative`);
      if (!(end > start)) fail(`scene "${id}" must have end > start, got ${start}..${end}`);
      if (end - start < 1 / p.fps - EPS) fail(`scene "${id}" lasts ${end - start}s, less than one frame at ${p.fps} fps`);
      if (end > p.duration + EPS) fail(`scene "${id}" ends at ${end}s, past duration ${p.duration}s`);
      const needs = list(s.needs, `scene "${id}" needs`).map((n) => ident(n, `scene "${id}" needs entry`));
      for (const n of needs) if (!moduleIds.has(n)) fail(`scene "${id}" needs unknown module "${n}"`);
      if (s.params !== undefined && !isObj(s.params)) fail(`scene "${id}" params must be an object`);
      return Object.freeze({ id, start, end, impl: s.impl === undefined ? id : ident(s.impl, `scene "${id}" impl`), needs: Object.freeze(needs), params: s.params });
    });
    const ids = new Set();
    for (const s of scenes) { if (ids.has(s.id)) fail(`duplicate scene id "${s.id}"`); ids.add(s.id); }
    scenes.sort((a, b) => a.start - b.start || a.end - b.end);
    const cov = p.coverage === undefined ? { start: 0, end: p.duration } : p.coverage;
    if (!isObj(cov)) fail('coverage must be {start, end}');
    num(cov.start, 'coverage.start'); num(cov.end, 'coverage.end');
    if (!(cov.end > cov.start) || cov.start < 0 || cov.end > p.duration + EPS) fail(`coverage ${cov.start}..${cov.end} must satisfy 0 <= start < end <= duration ${p.duration}`);
    if (scenes.length) {
      if (Math.abs(scenes[0].start - cov.start) > EPS) fail(`scene "${scenes[0].id}" starts at ${scenes[0].start}s but coverage starts at ${cov.start}s (uncovered lead-in)`);
      for (let i = 1; i < scenes.length; i++) {
        const a = scenes[i - 1], b = scenes[i];
        if (b.start < a.end - EPS) fail(`scenes "${a.id}" (${a.start}..${a.end}) and "${b.id}" (${b.start}..${b.end}) overlap`);
        if (b.start > a.end + EPS) fail(`gap ${a.end}..${b.start}s between scenes "${a.id}" and "${b.id}"`);
      }
      const last = scenes[scenes.length - 1];
      if (Math.abs(last.end - cov.end) > EPS) fail(`scene "${last.id}" ends at ${last.end}s but coverage ends at ${cov.end}s (${last.end < cov.end ? 'uncovered tail' : 'beyond the intended interval'})`);
    }
    return { scenes: Object.freeze(scenes), coverage: Object.freeze({ start: cov.start, end: cov.end }) };
  }

  function validateCues(c) {
    if (c === undefined) return undefined;
    if (!isObj(c)) fail('cues must be an object {entries:[...]} or {module:"path"}');
    const hasE = c.entries !== undefined, hasM = c.module !== undefined;
    if (hasE === hasM) fail('cues must declare exactly one of entries (inline) or module (path)');
    if (hasM) relPath(c.module, 'cues.module');
    else if (!Array.isArray(c.entries)) fail('cues.entries must be an array');
    return c;
  }

  function validateAssets(raw) {
    const ids = new Set();
    list(raw, 'assets').forEach((a, i) => {
      if (typeof a === 'string') { relPath(a, `assets[${i}]`); return; }
      if (!isObj(a)) fail(`assets[${i}] must be a path or {id, src, kind?}`);
      const id = ident(a.id, `assets[${i}].id`); relPath(a.src, `asset "${id}" src`);
      if (ids.has(id)) fail(`duplicate asset id "${id}"`); ids.add(id);
      if (a.kind !== undefined && !['image', 'data', 'other'].includes(a.kind)) fail(`asset "${id}" kind must be image, data or other`);
    });
  }
  function validateFonts(raw) {
    const keys = new Set();
    list(raw, 'fonts').forEach((f, i) => {
      if (typeof f === 'string') { relPath(f, `fonts[${i}]`); return; }
      if (!isObj(f)) fail(`fonts[${i}] must be a path or {family, src, weight?, style?, unicodeRange?}`);
      if (typeof f.family !== 'string' || !f.family) fail(`fonts[${i}].family must be a non-empty string`);
      relPath(f.src, `font "${f.family}" src`);
      for (const k of ['weight', 'style', 'unicodeRange']) if (f[k] !== undefined && typeof f[k] !== 'string' && typeof f[k] !== 'number') fail(`font "${f.family}" ${k} must be a string or number`);
      const key = [f.family, f.weight ?? '', f.style ?? '', f.unicodeRange ?? '', f.src].join('|');
      if (keys.has(key)) fail(`font "${f.family}" is declared twice with the same face and source`);
      keys.add(key);
    });
  }

  function normalizeProject(raw) {
    if (!raw || typeof raw !== 'object') fail('PROJECT must be an object');
    const p = { ...DEFAULTS, ...Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)) };
    if (raw.maxDurationSeconds === undefined) p.maxDurationSeconds = p.duration;
    for (const k of ['width', 'height']) { num(p[k], k); if (!(p[k] > 0) || !Number.isInteger(p[k])) fail(`${k} must be a positive integer (pixels), got ${p[k]}`); }
    for (const k of ['fps', 'duration', 'bpm', 'maxDurationSeconds']) if (!(num(p[k], k) > 0)) fail(`${k} must be > 0, got ${p[k]}`);
    if (p.duration > p.maxDurationSeconds) fail(`duration ${p.duration}s exceeds explicit maxDurationSeconds ${p.maxDurationSeconds}s`);
    num(p.offset, 'offset');   // seconds of the first downbeat in VIDEO time (may be negative when the excerpt starts after a downbeat)
    if (num(p.sourceAudioOffsetSeconds, 'sourceAudioOffsetSeconds') < 0) fail(`sourceAudioOffsetSeconds must be >= 0, got ${p.sourceAudioOffsetSeconds}`);
    if (!Number.isSafeInteger(p.seed)) fail(`seed must be a safe integer, got ${p.seed}`);
    // ---- production contract (all optional) ----
    delete p.moduleLoadOrder;
    if (p.productionId !== undefined) ident(p.productionId, 'productionId');
    const { mods, order } = validateModules(p.modules);
    const sched = validateScenes(p.scenes, p, new Set(mods.map((m) => m.id)));
    if (sched.scenes.length && p.productionId === undefined) fail('productionId is required when scenes are declared');
    validateCues(p.cues); validateAssets(p.assets); validateFonts(p.fonts);
    if (p.modules !== undefined) p.modules = mods;
    if (p.scenes !== undefined) { p.scenes = sched.scenes; p.coverage = sched.coverage; }
    if (mods.length) p.moduleLoadOrder = order;
    p.normalized = true;
    return Object.freeze(p);
  }
  normalizeProject.DEFAULTS = Object.freeze({ ...DEFAULTS });
  if (typeof module !== 'undefined' && module.exports) module.exports = normalizeProject; else root.normalizeProject = normalizeProject;
})(typeof window !== 'undefined' ? window : globalThis);
