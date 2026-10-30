// verify-remotion-composition.mjs — focused, browser-free regression for remotion-runtime/src/song-composition.jsx.
// It EVALUATES the real SongComposition / renderLayer / TimedLayer path with synthetic scenes via react-dom/server + @remotion/player (SSR at an
// initial frame). It catches a missing import (e.g. wholeProjectFrameCount) because renderLayer runs for every scheduled entry on first render.
// No Chrome, no Remotion bundler/renderer, no audio, no WebGL, no media. Uses only the installed remotion-runtime dependencies.
//
// usage: node verify-remotion-composition.mjs --out=<new-evidence.json> [--transpiled=<song-composition.js from an external JSX transpile>]
//   JSX is transformed with the runtime's own esbuild when it runs on this OS (native macOS install). Where it cannot (e.g. a Linux VM holding
//   the macOS esbuild binary), --transpiled may supply an externally transpiled copy; it must begin with "// source-sha256: <hex>" matching the
//   current song-composition.jsx, so the evaluated code provably comes from the current source. Exit 0 = all assertions passed; 1 = assertion/eval
//   failure; 3 = could not obtain JS for the composition (check NOT run).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Writable } from 'node:stream';

const here = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(here, '..');
const RUNTIME = path.join(LIB, 'remotion-runtime');
const SRC = path.join(RUNTIME, 'src/song-composition.jsx');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const t = a.replace(/^--/, ''); const i = t.indexOf('='); return i < 0 ? [t, true] : [t.slice(0, i), t.slice(i + 1)]; }));
const require = createRequire(import.meta.url);
const normalizeProject = require(path.join(LIB, 'base/src/project-config.js'));
const EP = await import(pathToFileURL(path.join(LIB, 'export/export-plan.mjs')).href);

const source = readFileSync(SRC, 'utf8');
const sourceSha = createHash('sha256').update(source).digest('hex');
const result = {
  check: 'song-composition real-path regression (browser-free)', node: process.version, platform: process.platform, arch: process.arch, cwd: process.cwd(),
  runtimeNodeModules: path.join(RUNTIME, 'node_modules'), sourceFile: SRC, sourceSha256: sourceSha, transpiler: null, assertions: [], status: 'not-run',
};
const finish = (code) => {
  if (args.out) writeFileSync(path.resolve(String(args.out)), JSON.stringify(result, null, 1), { flag: 'wx' });
  console.log(JSON.stringify(result, null, 1));
  process.exit(code);
};

// ---- obtain JS for the composition ----
let js;
try {
  const { transformSync } = createRequire(path.join(RUNTIME, 'package.json'))('esbuild');
  js = transformSync(source, { loader: 'jsx', jsx: 'automatic', format: 'esm', target: 'es2022' }).code;
  result.transpiler = `runtime esbuild (native ${process.platform}-${process.arch})`;
} catch (error) {
  result.esbuildUnavailable = String(error.message).split('\n')[0];
  if (typeof args.transpiled === 'string') {
    js = readFileSync(path.resolve(args.transpiled), 'utf8');
    const m = js.match(/^\/\/ source-sha256: ([0-9a-f]{64})/);
    if (!m || m[1] !== sourceSha) { result.status = 'refused'; result.reason = `--transpiled does not carry the current source hash (${m ? m[1] : 'no header'} vs ${sourceSha})`; finish(3); }
    result.transpiler = `external transpile supplied via --transpiled (${path.resolve(args.transpiled)}), hash-matched to current source`;
  } else { result.status = 'not-run'; result.reason = 'could not transform JSX here and no --transpiled given'; finish(3); }
}

// ---- stage into a temp dir whose node_modules is a symlink to the runtime install (single copy of react/remotion) ----
const tmp = mkdtempSync(path.join(os.tmpdir(), 'wnf-composition-'));
mkdirSync(path.join(tmp, 'src'));
symlinkSync(path.join(RUNTIME, 'node_modules'), path.join(tmp, 'node_modules'));
const exportPlanUrl = pathToFileURL(path.join(LIB, 'export/export-plan.mjs')).href;
const rewritten = js.replace(/(["'])\.\.\/\.\.\/export\/export-plan\.mjs\1/g, JSON.stringify(exportPlanUrl));
assert.notEqual(rewritten, js, 'expected to rewrite the export-plan import');
writeFileSync(path.join(tmp, 'src/song-composition.mjs'), rewritten);
writeFileSync(path.join(tmp, 'src/deps.mjs'), "export { default as React } from 'react'; export { renderToPipeableStream } from 'react-dom/server'; export { Player } from '@remotion/player';\n");
result.tempDir = tmp;
const { React, renderToPipeableStream, Player } = await import(pathToFileURL(path.join(tmp, 'src/deps.mjs')).href);
const comp = await import(pathToFileURL(path.join(tmp, 'src/song-composition.mjs')).href);

const ok = (name, detail) => result.assertions.push({ name, pass: true, ...(detail === undefined ? {} : { detail }) });
try {
  // ---- synthetic project: 24 fps, 67.640 s, zero offset; scenes/overlays ending early and exactly at the duration ----
  const project = normalizeProject({
    productionId: 'synthetic-regression', width: 1080, height: 1350, fps: 24, duration: 67.64, sourceAudioOffsetSeconds: 0,
    scenes: [{ id: 'EarlyEnd', start: 0, end: 40 }, { id: 'LastScene', start: 40, end: 67.64 }],
    overlays: [{ id: 'OverlayEarly', start: 10, end: 20 }, { id: 'OverlayLast', start: 60, end: 67.64 }],
  });
  const plan = EP.planExport({ project, audio: '/synthetic/master.m4a', mode: 'clip' });
  assert.equal(project.maxDurationSeconds, 67.64); ok('maxDurationSeconds resolves to duration');
  assert.equal(plan.frameCount, 1624); assert.equal(plan.firstFrame, 0); assert.equal(plan.endFrame, 1624); assert.equal(plan.endFrame - 1, 1623);
  assert.ok(Math.abs(plan.durationSeconds - 67.666667) < 1e-6); assert.equal(plan.audio.durationSeconds, 67.64);
  assert.ok(Math.abs(plan.audioVideoEndpointDifferenceSeconds - 0.026667) < 1e-6);
  assert.deepEqual(EP.projectCompositionMetadata(project), { width: 1080, height: 1350, fps: 24, durationInFrames: 1624 });
  assert.equal(EP.wholeProjectFrameCount(project), 1624);
  ok('full-project arithmetic', { frameCount: plan.frameCount, indices: '0..1623', exclusiveEnd: plan.endFrame, videoEndSeconds: plan.durationSeconds, audioSeconds: plan.audio.durationSeconds, differenceSeconds: plan.audioVideoEndpointDifferenceSeconds });

  const Marker = ({ scene, time, role }) => React.createElement('i', { 'data-role': role, 'data-id': scene.id, 'data-frame': time.frame, 'data-local': time.localFrame });
  const registry = { EarlyEnd: Marker, LastScene: Marker, OverlayEarly: Marker, OverlayLast: Marker };
  // Player wraps the composition in a lazy/Suspense boundary, so use the streaming SSR API and wait for all content (no Chrome, no layout).
  const html = (frame) => new Promise((resolve, reject) => {
    let out = ''; let firstError = null;
    const sink = new Writable({ write(chunk, _enc, cb) { out += chunk.toString(); cb(); } });
    sink.on('finish', () => (firstError ? reject(firstError) : resolve(out)));
    const stream = renderToPipeableStream(React.createElement(Player, {
      component: comp.SongComposition, inputProps: { project, sceneRegistry: registry, cueEntries: [] },
      durationInFrames: plan.frameCount, compositionWidth: project.width, compositionHeight: project.height, fps: project.fps,
      initialFrame: frame, controls: false, acknowledgeRemotionLicense: true,
    }), { onAllReady() { stream.pipe(sink); }, onShellError: reject, onError(error) { firstError = firstError || error; } });
  });
  const mounted = async (frame) => { const out = await html(frame); return [...out.matchAll(/<i [^>]*data-role="(scene|overlay)"[^>]*data-id="([A-Za-z]+)"[^>]*data-frame="(\d+)"[^>]*data-local="(\d+)"/g)].map((m) => ({ role: m[1], id: m[2], frame: Number(m[3]), local: Number(m[4]) })); };
  const ids = async (frame) => (await mounted(frame)).map((m) => `${m.role}:${m.id}`).sort();
  const expectIds = async (frame, want) => { assert.deepEqual(await ids(frame), want.slice().sort(), `frame ${frame}`); };

  // renderLayer runs for EVERY entry on first render, so merely rendering proves the end===duration branch evaluates without ReferenceError.
  await expectIds(0, ['scene:EarlyEnd']); ok('frame 0: first scene mounted');
  await expectIds(239, ['scene:EarlyEnd']); await expectIds(240, ['overlay:OverlayEarly', 'scene:EarlyEnd']); ok('overlay ending early starts at frame 240');
  await expectIds(479, ['overlay:OverlayEarly', 'scene:EarlyEnd']); await expectIds(480, ['scene:EarlyEnd']); ok('overlay ending early: last frame 479, exclusive end 480 (roundFrame path)');
  await expectIds(959, ['scene:EarlyEnd']); await expectIds(960, ['scene:LastScene']); ok('scene ending early: last frame 959, exclusive end 960 (roundFrame path)');
  await expectIds(1439, ['scene:LastScene']); await expectIds(1440, ['overlay:OverlayLast', 'scene:LastScene']); ok('overlay ending at duration starts at frame 1440');
  await expectIds(1623, ['overlay:OverlayLast', 'scene:LastScene']); ok('frame 1623 (last index): scene AND overlay ending exactly at duration are still mounted (end resolved to 1624, not Math.round 1623)');
  const last = (await mounted(1623)).find((m) => m.id === 'LastScene'); assert.equal(last.frame, 1623); assert.equal(last.local, 1623 - 960);
  ok('TimedLayer frame math at final index', last);
  assert.equal(Math.round(67.64 * 24 + 1e-9), 1623); ok('control: plain roundFrame of the duration would give 1623 (would drop the final frame)');
  result.status = 'pass';
  finish(0);
} catch (error) {
  result.status = 'fail'; result.error = { name: error.name, message: String(error.message).split('\n').slice(0, 6).join(' | ') };
  finish(1);
}
