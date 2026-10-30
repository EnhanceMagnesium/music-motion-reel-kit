// verify-woodcut-adapter.mjs — focused, browser-free checks of shared-animation-library/adapters/remotion/woodcut/ and the technical fixture.
// Exercises the ACTUAL adapter code (determinism helpers, adapted knife/print modules, session, WoodcutCanvas server render) with injected fakes for
// the DOM/WebGL parts. It does not draw, read pixels, open a browser or render media. It does NOT prove anything about real WebGL drawing.
// usage: node verify-woodcut-adapter.mjs --out=<new evidence.json>     exit 0 = all pass, 1 = failure
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Writable } from 'node:stream';

const here = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(here, '..');
const KIT = path.resolve(LIB, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const t = a.replace(/^--/, ''); const i = t.indexOf('='); return i < 0 ? [t, true] : [t.slice(0, i), t.slice(i + 1)]; }));
const result = { check: 'woodcut adapter focused checks (browser-free, fakes for DOM/GL)', node: process.version, platform: process.platform, arch: process.arch, cwd: process.cwd(), assertions: [], status: 'not-run' };
const finish = (code) => {
  if (args.out) writeFileSync(path.resolve(String(args.out)), JSON.stringify(result, null, 1), { flag: 'wx' });
  console.log(JSON.stringify(result, null, 1)); process.exit(code);
};
const ok = (name, detail) => result.assertions.push({ name, pass: true, ...(detail === undefined ? {} : { detail }) });

// ---- stage a copy of adapter + fixture beside a symlinked node_modules so react/remotion resolve to the single runtime install ----
const tmp = mkdtempSync(path.join(os.tmpdir(), 'wnf-woodcut-'));
const stagedLib = path.join(tmp, 'shared-animation-library');
cpSync(path.join(LIB, 'adapters/remotion/woodcut'), path.join(stagedLib, 'adapters/remotion/woodcut'), { recursive: true });
cpSync(path.join(LIB, 'examples/remotion-woodcut-production/remotion'), path.join(stagedLib, 'examples/remotion-woodcut-production/remotion'), { recursive: true });
symlinkSync(path.join(LIB, 'remotion-runtime/node_modules'), path.join(tmp, 'node_modules'));
const imp = (rel) => import(pathToFileURL(path.join(stagedLib, rel)).href);
result.stagedCopy = tmp;
let exitCode = 1;
try {
  const det = await imp('adapters/remotion/woodcut/determinism.mjs');
  const cacheMod = await imp('adapters/remotion/woodcut/geometry-cache.mjs');
  const knife = await imp('adapters/remotion/woodcut/knife.mjs');
  const printMod = await imp('adapters/remotion/woodcut/print.mjs');
  const sessMod = await imp('adapters/remotion/woodcut/session.mjs');
  const fixGeo = await imp('examples/remotion-woodcut-production/remotion/fixture-geometry.mjs');

  // ---- 1 determinism helpers ----
  assert.equal(det.deriveSeed(7, 'fixture', 'carve-a'), det.deriveSeed(7, 'fixture', 'carve-a'));
  assert.notEqual(det.deriveSeed(7, 'fixture', 'carve-a'), det.deriveSeed(7, 'fixture', 'carve-b'));
  assert.notEqual(det.deriveSeed(7, 'x'), det.deriveSeed(8, 'x'));
  const base = { width: 1080, height: 1350, seed: 5, version: 1, params: { a: 1, b: [2, 3] } };
  const k0 = det.geometryKey(base);
  assert.equal(det.geometryKey({ ...base, params: { b: [2, 3], a: 1 } }), k0);
  for (const [name, change] of Object.entries({ width: { width: 1081 }, height: { height: 1920 }, seed: { seed: 6 }, version: { version: 2 }, params: { params: { a: 2, b: [2, 3] } } })) assert.notEqual(det.geometryKey({ ...base, ...change }), k0, `key ignores ${name}`);
  assert.throws(() => det.geometryKey({ ...base, width: 10 }), TypeError); assert.throws(() => det.geometryKey({ ...base, seed: 1.5 }), TypeError);
  assert.throws(() => det.geometryKey({ ...base, params: { f: () => 1 } }), TypeError); assert.throws(() => det.geometryKey({ ...base, params: { n: NaN } }), TypeError);
  assert.equal(det.inkSeedAt({ seed: 5, frame: 0, fps: 24 }), det.inkSeedAt({ seed: 5, frame: 1, fps: 24 }));
  assert.notEqual(det.inkSeedAt({ seed: 5, frame: 0, fps: 24 }), det.inkSeedAt({ seed: 5, frame: 2, fps: 24 }));
  assert.equal(det.inkSeedAt({ seed: 5, frame: 40, fps: 24 }), det.inkSeedAt({ seed: 5, frame: 40, fps: 24 }));
  assert.throws(() => det.inkSeedAt({ seed: 5, frame: -1, fps: 24 }), TypeError);
  ok('key/seed helpers: stable, order-insensitive, every key field matters, invalid input rejected, ink seed stepped (12/s) and pure', { keySample: k0, deriveSample: det.deriveSeed(7, 'fixture', 'carve-a'), ink: [0, 1, 2, 24, 40].map((f) => det.inkSeedAt({ seed: 5, frame: f, fps: 24 })) });

  // ---- 2 adapted mkStroke: explicit seed required; geometry never touches Math.random ----
  assert.throws(() => knife.mkStroke([[0, 0], [10, 0]], 2, {}), /explicit finite numeric seed/);
  assert.throws(() => knife.mkStroke([[0, 0], [10, 0]], 2, { seed: NaN }), TypeError);
  assert.equal(knife.mkStroke([[0, 0], [10, 0]], 2, { seed: 3 }).seed, 3);
  const realRandom = Math.random; let randomCalls = 0; Math.random = () => { randomCalls++; throw new Error('Math.random must not be used'); };
  let geoA;
  try { geoA = fixGeo.buildFixtureGeometry({ width: 1080, height: 1350, seed: 99, params: { rayCount: 28 }, derive: (...l) => det.deriveSeed(99, ...l) }); } finally { Math.random = realRandom; }
  assert.equal(randomCalls, 0);
  ok('mkStroke rejects a missing/NaN seed; building the fixture geometry made zero Math.random calls');

  // ---- 3 geometry determinism and independence from visit order ----
  const build = (w, h, seed, params) => fixGeo.buildFixtureGeometry({ width: w, height: h, seed, params, derive: (...l) => det.deriveSeed(seed, ...l) });
  const hashOf = (g) => det.hashStrokes(det.collectStrokes(g));
  const h1 = hashOf(build(1080, 1350, 99, { rayCount: 28 }));
  const h2 = hashOf(build(1080, 1920, 99, { rayCount: 28 }));
  const h3 = hashOf(build(1080, 1350, 100, { rayCount: 28 }));
  const h4 = hashOf(build(1080, 1350, 99, { rayCount: 18 }));
  const h1again = hashOf(build(1080, 1350, 99, { rayCount: 28 }));
  assert.equal(h1, h1again); assert.equal(h1, det.hashStrokes(det.collectStrokes(geoA)));
  assert.equal(new Set([h1, h2, h3, h4]).size, 4);
  ok('geometry hash: identical for identical inputs (after other builds), different for size/seed/params', { h_1080x1350: h1, h_1080x1920: h2, h_seed100: h3, h_rays18: h4, strokeCounts: Object.fromEntries(Object.entries(geoA.strokes).map(([k, v]) => [k, v.length])) });

  // ---- 4 bounded cache ----
  const cache = cacheMod.createGeometryCache(2); let builds = 0; const mk = (n) => () => { builds++; return { n }; };
  cache.get('a', mk(1)); cache.get('b', mk(2)); cache.get('a', mk(1)); cache.get('c', mk(3));
  assert.equal(builds, 3); assert.equal(cache.has('b'), false); assert.equal(cache.has('a'), true);
  assert.deepEqual(cache.stats(), { hits: 1, misses: 3, evictions: 1, size: 2, maxEntries: 2 });
  assert.throws(() => { cache.get('a', mk(1)).n = 5; }, TypeError);
  ok('geometry cache: bounded LRU, hit/miss/eviction counts, stored geometry frozen', cache.stats());

  // ---- shared fakes ----
  const makeCtx2d = (log, tag) => new Proxy({}, { get: (t, p) => (p in t ? t[p] : (...a) => { log.push([tag, String(p), ...a]); }), set: (t, p, v) => { t[p] = v; log.push([tag, `set:${String(p)}`, v]); return true; } });
  const makeFakeGL = (cfg = {}) => {
    const log = []; const counts = {}; const state = { lost: false, lose: 0 };
    const target = { __log: log, __counts: counts, __state: state };
    const gl = new Proxy(target, {
      get(t, p) {
        if (p in t) return t[p];
        if (typeof p !== 'string') return undefined;
        if (/^[A-Z][A-Z0-9_]+$/.test(p)) return [...p].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
        return (...a) => {
          counts[p] = (counts[p] || 0) + 1; log.push(p);
          if (p === 'createShader') { if (cfg.failShaderCreate && counts.createShader === cfg.failShaderCreate) return null; return { kind: 'shader', n: counts.createShader }; }
          if (p === 'getShaderParameter') return !(cfg.failCompileAt && counts.getShaderParameter === cfg.failCompileAt);
          if (p === 'getShaderInfoLog') return 'fake compile log';
          if (p === 'createProgram') return { kind: 'program' };
          if (p === 'getProgramParameter') return true;
          if (p === 'createBuffer') return { kind: 'buffer' };
          if (p === 'createTexture') return { kind: 'texture', n: counts.createTexture };
          if (p === 'getAttribLocation') return 0;
          if (p === 'getUniformLocation') return { kind: 'uniform', name: a[1] };
          if (p === 'isContextLost') return state.lost;
          if (p === 'getError') return cfg.glError ?? 0;
          if (p === 'getExtension') return a[0] === 'WEBGL_lose_context' ? { loseContext() { state.lose++; counts.loseContext = state.lose; state.lost = true; } } : null;
          return undefined;
        };
      },
    });
    return gl;
  };
  const makeDoc = (opts = {}) => {
    const created = []; const log = [];
    const doc = { created, log, createElement(tag) {
      assert.equal(tag, 'canvas');
      const listeners = {}; const gl = opts.noGL ? null : makeFakeGL(opts.gl);
      const cv = { width: 0, height: 0, style: {}, removed: false, listeners, gl,
        getContext(type) { if (type === '2d') return makeCtx2d(log, `2d#${created.indexOf(cv)}`); return type === 'webgl2' ? gl : null; },
        addEventListener(t, f) { (listeners[t] ||= []).push(f); }, removeEventListener(t, f) { listeners[t] = (listeners[t] || []).filter((x) => x !== f); }, remove() { cv.removed = true; },
        fire(t) { (listeners[t] || []).slice().forEach((f) => f({ type: t })); } };
      created.push(cv); return cv;
    } };
    return doc;
  };

  // ---- 5 adapted printer: shader text byte-identical; resource balance; failure/lost/dispose paths (fake WebGL) ----
  const upstreamPrint = readFileSync(path.join(KIT, 'repository-downloads/lemomo-ai/lemo-opuscar/styles/woodcut/demo/engine/print.js'), 'utf8');
  const adaptedPrint = readFileSync(path.join(LIB, 'adapters/remotion/woodcut/print.mjs'), 'utf8');
  const upHead = upstreamPrint.slice(upstreamPrint.indexOf('const VS ='), upstreamPrint.indexOf('export function makePrinter'));
  const adHead = adaptedPrint.slice(adaptedPrint.indexOf('export const VS ='), adaptedPrint.indexOf('const RESOURCE_STATS')).replace('export const VS =', 'const VS =').replace('export const FS =', 'const FS =');
  assert.equal(adHead, upHead);
  ok('VS/FS shader source and hex() in the adapted print.mjs are byte-identical to upstream print.js', { upstreamSha256: createHash('sha256').update(upstreamPrint).digest('hex'), headChars: upHead.length });

  const before = printMod.getPrinterStats();
  const d1 = makeDoc(); const pr = printMod.makePrinter(64, 48, { document: d1 }); const gl1 = d1.created[0].gl;
  assert.equal(gl1.__counts.createShader, 2); assert.equal(gl1.__counts.createTexture, 2); assert.equal(gl1.__counts.createBuffer, 1); assert.equal(gl1.__counts.createProgram, 1);
  assert.equal(pr.lost, false); assert.equal(pr.glError(), 0);
  pr.render({}, null, {}); pr.render({}, null, {}); pr.render({}, null, {});
  assert.equal(gl1.__counts.drawArrays, 3); assert.equal(gl1.__counts.loseContext || 0, 0, 'no per-frame loseContext');
  pr.dispose(); pr.dispose();
  assert.equal(gl1.__counts.deleteTexture, 2); assert.equal(gl1.__counts.deleteBuffer, 1); assert.equal(gl1.__counts.deleteProgram, 1); assert.equal(gl1.__counts.deleteShader, 2); assert.equal(gl1.__counts.loseContext, 1);
  assert.equal(d1.created[0].removed, true); assert.equal(d1.created[0].listeners.webglcontextlost.length, 0);
  assert.throws(() => pr.render({}, null, {}), /disposed/);
  const after = printMod.getPrinterStats(); assert.equal(after.created - before.created, 1); assert.equal(after.released - before.released, 1);
  ok('printer: creates 2 shaders/1 program/1 buffer/2 textures, 3 renders = 3 draws and 0 loseContext, dispose is idempotent and releases each handle once + one loseContext', { counts: { ...gl1.__counts } });

  const dFail = makeDoc({ gl: { failCompileAt: 2 } });
  assert.throws(() => printMod.makePrinter(64, 48, { document: dFail }), /fake compile log/);
  const gF = dFail.created[0].gl; assert.equal(gF.__counts.createShader, 2); assert.equal(gF.__counts.deleteShader, 2); assert.equal(gF.__counts.deleteProgram, 1); assert.equal(gF.__counts.createTexture || 0, 0);
  const dNull = makeDoc({ noGL: true }); assert.throws(() => printMod.makePrinter(64, 48, { document: dNull }), /webgl2 unavailable/);
  assert.throws(() => printMod.makePrinter(0, 10, { document: makeDoc() }), TypeError);
  const st = printMod.getPrinterStats(); assert.equal(st.created, st.released);
  ok('printer partial failure (fragment compile failure, no context, bad size) cleans up whatever was created and keeps created == released', { afterFailureCounts: { ...gF.__counts } });

  const dLost = makeDoc(); const pl = printMod.makePrinter(64, 48, { document: dLost });
  dLost.created[0].gl.__state.lost = true; dLost.created[0].fire('webglcontextlost');
  assert.equal(pl.lost, true); assert.throws(() => pl.render({}, null, {}), /context lost/); pl.dispose(); assert.equal(dLost.created[0].gl.__counts.loseContext || 0, 0);
  ok('printer: a lost context is reported (lost=true) and render throws instead of returning an empty frame');

  // ---- 6 session (fixture geometry, fake printer): fresh state each draw, order independence, supersession, failures, disposal ----
  const mkPrinterFake = (rec, opts = {}) => (w, h, env) => {
    const canvas = env.document.createElement('canvas'); canvas.width = w; canvas.height = h; const p = { disposed: 0, renders: [], lost: false };
    rec.push(p);
    return { canvas, get lost() { return p.lost; }, glError: () => opts.glError ?? 0, dispose() { p.disposed++; }, render(m, c, o) { p.renders.push({ o, hasColor: Boolean(c) }); return canvas; } };
  };
  const newSession = (over = {}, docOpts = {}) => {
    const doc = makeDoc(docOpts); const printers = []; const events = []; const order = [];
    const s = sessMod.createWoodcutSession({
      width: 1080, height: 1350, seed: 99, geometryParams: { rayCount: 28 }, buildGeometry: fixGeo.buildFixtureGeometry, cache: cacheMod.createGeometryCache(4),
      drawMask: (g, c) => { order.push(['mask', c.frame]); }, drawColor: (g, c) => { order.push(['color', c.frame]); }, onEvent: (e) => events.push(e), ...over,
    }, { document: doc, makePrinter: over.__mp ?? mkPrinterFake(printers) });
    return { s, doc, printers, events, order };
  };
  const A = newSession(); const desc = A.s.prepare(); assert.equal(A.printers.length, 1);
  const visit = [12, 60, 5, 60, 40, 2, 12]; const done = [];
  for (const f of visit) done.push(await A.s.draw({ frame: f, fps: 24 }));
  assert.deepEqual(done.map((d) => d.frame), visit); assert.ok(done.every((d) => d.status === 'drawn' && d.geometryHash === desc.hash));
  assert.deepEqual(done[0].inkSeed, done[6].inkSeed); assert.equal(done[0].geometryHash, done[6].geometryHash); assert.equal(A.printers[0].renders.length, visit.length);
  const logs = A.doc.log; const idxMask = logs.filter((l) => l[0] === '2d#0');
  assert.ok(idxMask.some((l) => l[1] === 'clearRect') && idxMask.some((l) => l[1] === 'setTransform'));
  const clears = idxMask.filter((l) => l[1] === 'clearRect').length; assert.equal(clears, visit.length);
  assert.ok(logs.filter((l) => l[0] === '2d#1' && l[1] === 'clearRect').length === visit.length);
  assert.equal(A.printers[0].renders.every((r) => r.hasColor), true); assert.ok(A.printers[0].renders.every((r) => Number.isInteger(r.o.inkSeed) && Number.isInteger(r.o.seed)));
  ok('session: non-monotonic frames with a repeat (12,60,5,60,40,2,12) all drawn; descriptors/ink seed for a revisited frame identical; transform reset + clear before every mask/colour draw', { visit, hash: desc.hash, inkSeeds: done.map((d) => d.inkSeed), strokeCount: desc.strokeCount });

  const gate = []; let release; const slow = newSession({ drawMask: (g, c) => { gate.push(c.frame); return c.frame === 1 ? new Promise((r) => { release = r; }) : undefined; } });
  slow.s.prepare(); const p1 = slow.s.draw({ frame: 1, fps: 24 }); await new Promise((r) => setTimeout(r, 10)); const p2 = slow.s.draw({ frame: 2, fps: 24 }); await new Promise((r) => setTimeout(r, 10)); release();
  const [r1, r2] = await Promise.all([p1, p2]); assert.equal(r1.status, 'superseded'); assert.equal(r2.status, 'drawn'); assert.equal(slow.printers[0].renders.length, 1); assert.deepEqual(gate, [1, 2]);
  const early = newSession({ drawMask: (g, c) => { gate.push(`early${c.frame}`); } }); early.s.prepare(); const [e1, e2] = await Promise.all([early.s.draw({ frame: 7, fps: 24 }), early.s.draw({ frame: 8, fps: 24 })]);
  assert.equal(e1.status, 'superseded'); assert.equal(e2.status, 'drawn'); assert.ok(!gate.includes('early7')); early.s.dispose();
  ok('session: a draw superseded by a newer frame never prints (both while it is mid-draw and before it starts); draws never overlap (serialised)', { midDraw: [r1.status, r2.status], beforeStart: [e1.status, e2.status] });

  const F = newSession({ drawMask: (g, c) => { if (c.frame === 3) throw new Error('boom'); } }); F.s.prepare();
  await assert.rejects(F.s.draw({ frame: 3, fps: 24 }), (e) => e.code === 'DRAW_FAILED' && /boom/.test(e.message)); assert.equal(F.printers[0].renders.length, 0);
  const ok4 = await F.s.draw({ frame: 4, fps: 24 }); assert.equal(ok4.status, 'drawn');
  const GE = newSession({ __mp: mkPrinterFake([], { glError: 1281 }) }); GE.s.prepare(); await assert.rejects(GE.s.draw({ frame: 1, fps: 24 }), (e) => e.code === 'GL_ERROR');
  const LS = newSession(); LS.s.prepare(); LS.printers[0].lost = true; await assert.rejects(LS.s.draw({ frame: 1, fps: 24 }), (e) => e.code === 'CONTEXT_LOST'); assert.equal(LS.printers[0].renders.length, 0);
  assert.ok(F.events.some((e) => e.type === 'error' && e.code === 'DRAW_FAILED'));
  ok('session failures are explicit errors (DRAW_FAILED, GL_ERROR, CONTEXT_LOST) with no print; the session can draw again after a draw failure');

  A.s.dispose(); A.s.dispose(); assert.equal(A.printers[0].disposed, 1); await assert.rejects(A.s.draw({ frame: 1, fps: 24 }), (e) => e.code === 'DISPOSED');
  const PF = newSession({ __mp: () => { throw new Error('printer init failed'); } }); assert.throws(() => PF.s.prepare(), (e) => e.code === 'PREPARE_FAILED'); PF.s.dispose();
  F.s.dispose(); GE.s.dispose(); LS.s.dispose(); slow.s.dispose();
  assert.equal(sessMod.getWoodcutSessionStats().live, 0);
  assert.equal(PF.doc.created.length >= 2, true);
  ok('session: dispose is idempotent (one printer.dispose), drawing after dispose rejects, prepare failure is a PREPARE_FAILED error, live sessions return to 0', sessMod.getWoodcutSessionStats());

  // ---- 7 server render of the React bridge through the fixture scene: no DOM/WebGL touched, readiness gate pending, clear errors ----
  const req = createRequire(path.join(LIB, 'remotion-runtime/package.json'));
  const React = (await import(pathToFileURL(req.resolve('react')).href)).default;
  const { renderToPipeableStream } = await import(pathToFileURL(req.resolve('react-dom/server')).href);
  const { Player } = await import(pathToFileURL(req.resolve('@remotion/player')).href);
  const scenesMod = await imp('examples/remotion-woodcut-production/remotion/scenes.mjs');
  assert.deepEqual(Object.keys(scenesMod.scenes), ['CarveA', 'CarveB']);
  const project = { seed: 7, width: 1080, height: 1920 };
  const Wrapper = () => React.createElement(scenesMod.scenes.CarveA, { project, scene: { id: 'carve-a', params: {} }, time: { frame: 5, fps: 24, localSeconds: 5 / 24, productionSeconds: 5 / 24 } });
  const html = await new Promise((resolve, reject) => { let out = ''; let firstError = null; const sink = new Writable({ write(c, _e, cb) { out += c.toString(); cb(); } }); sink.on('finish', () => (firstError ? reject(firstError) : resolve(out)));
    const stream = renderToPipeableStream(React.createElement(Player, { component: Wrapper, durationInFrames: 72, compositionWidth: 1080, compositionHeight: 1920, fps: 24, controls: false, acknowledgeRemotionLicense: true }), { onAllReady() { stream.pipe(sink); }, onShellError: reject, onError(e) { firstError = firstError || e; } }); });
  assert.match(html, /data-woodcut-status="pending"/); assert.match(html, /data-woodcut-frame="5"/); assert.ok(!/<canvas/i.test(html)); assert.match(html, /TECHNICAL FIXTURE/); assert.match(html, /width:1080px;height:1920px/);
  ok('server render of the fixture scene at 1080x1920: container sized from project, status pending, no <canvas> created, fixture label present (nothing created at import or SSR)');
  result.status = 'pass'; exitCode = 0;
} catch (error) {
  result.status = 'fail'; result.error = { name: error.name, message: String(error.message).split('\n').slice(0, 8).join(' | '), stack: String(error.stack).split('\n').slice(0, 6) }; exitCode = 1;
} finally {
  try { rmSync(tmp, { recursive: true, force: true }); result.stagedCopyRemoved = true; } catch (e) { result.stagedCopyRemoved = false; }
}
finish(exitCode);
