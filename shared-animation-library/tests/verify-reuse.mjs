// verify-reuse.mjs — reuse-across-productions regressions (synthetic songs/themes). Non-rendering: no browser, no ffmpeg, no pixels, no media.
// Called from verify.mjs with its check() helper. Temp productions live under os.tmpdir() and are removed afterwards.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import vm from "node:vm";
import { EventEmitter } from "node:events"; import assert from "node:assert/strict"; import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { recordingContext } from "./recording-context.mjs";
import normalizeProject from "../base/src/project-config.js";

const LIB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(path.join(LIB, p)));
const { planExport, missingFrames, frameFileName } = await imp("export/export-plan.mjs");
const { computeIdentity, buildManifest, checkManifest } = await imp("export/cache-identity.mjs");
const { startProcess, runClipExport, runEncode, ExportError } = await imp("export/process-runner.mjs");
const P = await imp("adapters/r06-burst-particles.mjs"), D = await imp("adapters/overlay-dispatcher.mjs"), H = await imp("adapters/host-integration.mjs");
const tb = await imp("numeric/timebase.mjs"), num = await imp("numeric/numeric.mjs");

// ---- synthetic productions (different songs / themes / sizes) --------------------------------------------------------------
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "sal-reuse-"));
function makeProduction(name, { cfg, scene = "// scene", helper = "export const k = 1;", asset = "asset-bytes", audio = "audio-bytes" }) {
  const dir = path.join(TMP, name); fs.mkdirSync(path.join(dir, "src/scenes"), { recursive: true }); fs.mkdirSync(path.join(dir, "assets"), { recursive: true });
  fs.copyFileSync(path.join(LIB, "base/src/project-config.js"), path.join(dir, "src/project-config.js"));
  fs.writeFileSync(path.join(dir, "src/config.js"), `const PROJECT = ${JSON.stringify({ assets: ["../assets/a.bin"], audio: "../assets/song.wav", ...cfg })};\n`);
  fs.writeFileSync(path.join(dir, "src/scenes/s1.js"), scene); fs.writeFileSync(path.join(dir, "assets/a.bin"), asset); fs.writeFileSync(path.join(dir, "assets/song.wav"), audio);
  fs.writeFileSync(path.join(dir, "mods-a.mjs"), `import { k } from "./mods-b.mjs"; export const a = k;`); fs.writeFileSync(path.join(dir, "mods-b.mjs"), helper);
  fs.writeFileSync(path.join(dir, "unrelated.txt"), "not referenced");
  fs.writeFileSync(path.join(dir, "studio.html"), `<!doctype html><link rel="stylesheet" href="https://fonts.example/x.css"><script src="src/config.js"></script><script src="src/project-config.js"></script><script src="src/scenes/s1.js"></script>\n<script>import('./mods-a.mjs')</script>`);
  return dir;
}
const identityOf = (dir, extra = {}) => { const raw = vm.runInNewContext(fs.readFileSync(path.join(dir, "src/config.js"), "utf8") + "\n;PROJECT"); const project = normalizeProject({ ...raw, ...extra });
  return computeIdentity({ entryPath: path.join(dir, "studio.html"), root: dir, project, configDir: path.join(dir, "src"), output: { jpegQuality: .94 } }); };
const songA = { cfg: { width: 1080, height: 1920, fps: 24, duration: 38, sourceAudioOffsetSeconds: 0 } };
const songB = { cfg: { width: 720, height: 1280, fps: 30, duration: 36, sourceAudioOffsetSeconds: 10, bpm: 96 }, scene: "// theme B scene" };

export async function runReuseChecks(check) {
  // ================================================================= 1. configuration contract
  await check("config", "normalizeProject: defaults, validation, pass-through", "One validated contract: finite positive integer dims, positive fps/duration/bpm, finite non-negative source offset, safe-integer seed, no global duration ceiling; production keys pass through", () => {
    const d = normalizeProject({}); assert.deepEqual([d.width, d.height, d.fps, d.duration, d.sourceAudioOffsetSeconds, d.seed, d.maxDurationSeconds], [1080, 1920, 24, 11, 0, 1, 11]); assert.equal(d.normalized, true); assert.ok(Object.isFrozen(d));
    const o = normalizeProject({ width: 720, height: 1280, fps: 30, duration: 36, sourceAudioOffsetSeconds: 10, offset: -.2, audio: "x.wav", theme: "ink" }); assert.deepEqual([o.width, o.height, o.fps, o.offset, o.audio, o.theme], [720, 1280, 30, -.2, "x.wav", "ink"]);
    const bad = [{ width: 0 }, { width: 1080.5 }, { width: NaN }, { width: Infinity }, { height: -1 }, { width: "1080" }, { fps: 0 }, { fps: NaN }, { duration: 0 }, { duration: -3 }, { bpm: 0 }, { sourceAudioOffsetSeconds: -1 }, { sourceAudioOffsetSeconds: NaN }, { sourceAudioOffsetSeconds: Infinity }, { seed: 1.5 }, { offset: NaN }];
    for (const b of bad) assert.throws(() => normalizeProject(b), RangeError, JSON.stringify(b)); assert.throws(() => normalizeProject(null));
    assert.equal(normalizeProject({ duration: 120 }).maxDurationSeconds, 120);  // no arbitrary global duration ceiling
    assert.equal(normalizeProject({ duration: 60, maxDurationSeconds: 90 }).duration, 60);   // cap is a deliberate, explicit production setting
    return { rejected: bad.length };
  });
  await check("config", "supported overrides reach every consumer (core text, sizing script, driver, adapter install)", "core.js, both entry pages, render.mjs and host-integration all consume normalizeProject output", () => {
    for (const f of ["base/src/core.js", "base/studio.html", "base/examples/landscape/studio.html", "base/render.mjs", "adapters/host-integration.mjs"]) assert.ok(/normalizeProject|normalized/.test(fs.readFileSync(path.join(LIB, f), "utf8")), f);
    const core = fs.readFileSync(path.join(LIB, "base/src/core.js"), "utf8"); assert.ok(!/PROJECT\.(width|height|bpm|duration|offset)/.test(core.replace(/\/\/.*$/gm, "").replace("normalizeProject(PROJECT)", "")));
  });
  await check("config", "readiness wait expression: delayed and rejected READY_PROMISES (extracted from core.js, no setup/draw)", "Window.ready is set only after fonts AND adapter promises resolve; a rejected adapter promise prevents ready", async () => {
    const core = fs.readFileSync(path.join(LIB, "base/src/core.js"), "utf8"), a = core.indexOf("await Promise.all(["), b = core.indexOf("window.ready = true"); assert.ok(a > 0 && b > a);
    const expr = core.slice(a, b);   // "await Promise.all([...]);"
    const mk = (promises) => { const win = { READY_PROMISES: promises, EXTRA_FONTS: [["12px X", "t"]] }, loaded = []; const doc = { fonts: { load: (f) => { loaded.push(f); return Promise.resolve(); } } };
      return { win, loaded, run: new vm.Script(`(async () => { ${expr} window.ready = true; })()`).runInNewContext({ window: win, document: doc, Promise }) }; };
    let release; const slow = new Promise((r) => { release = r; }); const t1 = mk([slow]); await new Promise((r) => setTimeout(r, 5)); assert.equal(t1.win.ready, undefined); release(); await t1.run; assert.equal(t1.win.ready, true); assert.ok(t1.loaded.includes("12px X"));
    const t2 = mk([Promise.reject(new Error("adapter failed"))]); await assert.rejects(t2.run, /adapter failed/); assert.equal(t2.win.ready, undefined);
  });

  // ================================================================= 2. export planning: audio / frame alignment
  const audioVec = (args) => { const i = args.indexOf("-ss"); return args.slice(i, i + 5); };
  await check("export", "plan: zero vs nonzero recording offset, whole excerpt vs nonzero range", "Audio starts at sourceAudioOffsetSeconds + local range start; frames start at round(a*fps); count is exact; --clip and --encode use the identical audio arguments", () => {
    const A = normalizeProject({ ...songA.cfg }), B = normalizeProject({ ...songB.cfg });
    const whole = planExport({ project: A, audio: "/a.wav", mode: "clip" }); assert.deepEqual([whole.firstFrame, whole.frameCount, whole.audio.startSeconds, whole.audio.durationSeconds], [0, 912, 0, 38]);
    const z = planExport({ project: A, range: [2, 4], audio: "/a.wav", mode: "clip" }); assert.deepEqual([z.firstFrame, z.endFrame, z.frameCount, z.audio.startSeconds], [48, 96, 48, 2]);
    const o = planExport({ project: B, range: [2, 4], audio: "/b.wav", mode: "clip" }), e = planExport({ project: B, range: [2, 4], audio: "/b.wav", mode: "encode" });
    assert.deepEqual([o.firstFrame, o.frameCount, o.audio.startSeconds, o.audio.durationSeconds], [60, 60, 12, 2]);   // 10 (offset) + 2 (range start)
    const ca = o.ffmpegArgs({ output: "o.mp4" }), ea = e.ffmpegArgs({ framesDir: "F", output: "o.mp4" });
    assert.deepEqual(audioVec(ca), ["-ss", "12", "-t", "2", "-i"]); assert.deepEqual(audioVec(ca), audioVec(ea)); assert.deepEqual(ca.slice(ca.indexOf("-ss"), ca.indexOf("-ss") + 6), ea.slice(ea.indexOf("-ss"), ea.indexOf("-ss") + 6));
    assert.ok(ea.includes("-start_number") && ea[ea.indexOf("-start_number") + 1] === "60" && ea[ea.indexOf("-frames:v") + 1] === "60"); assert.ok(ca[ca.indexOf("-frames:v") + 1] === "60");
    assert.ok(ea.join(" ").includes("F/f%05d.jpg")); const wholeB = planExport({ project: B, audio: "/b.wav", mode: "clip" }); assert.equal(wholeB.audio.startSeconds, 10);
    const noAudio = planExport({ project: A, range: [0, 1], mode: "clip" }); assert.ok(!noAudio.ffmpegArgs({ output: "o" }).includes("-ss"));
  });
  await check("export", "plan: rounding convention, cue/frame/audio agree, different fps", "A frame's source time = offset + i/fps equals audio.start + (i-first)/fps for every selected frame; ranges snap to frame boundaries; invalid ranges rejected", () => {
    for (const cfg of [songA.cfg, songB.cfg, { width: 1080, height: 1920, fps: 25, duration: 40, sourceAudioOffsetSeconds: 7.25 }]) {
      const pr = normalizeProject(cfg), plan = planExport({ project: pr, range: [3.37, 9.91], audio: "/x", mode: "clip" });
      for (const j of [0, 1, plan.frameCount - 1]) { const i = plan.firstFrame + j; assert.ok(Math.abs((pr.sourceAudioOffsetSeconds + i / pr.fps) - (plan.audio.startSeconds + j / pr.fps)) < 1e-9); assert.equal(plan.frameTimes(j), i / pr.fps); }
      assert.equal(plan.firstFrame, Math.round(3.37 * pr.fps)); assert.equal(plan.endFrame, Math.round(9.91 * pr.fps)); assert.equal(plan.durationSeconds, plan.frameCount / pr.fps);
    }
    const cue = tb.sourceToVideoSeconds(12.4, 10), pl = planExport({ project: normalizeProject(songB.cfg), range: [2, 4], audio: "/b", mode: "clip" }); const frame = cue * 30;   // 72 -> local frame 12 of the export
    assert.ok(Math.abs(frame - 72) < 1e-9 && Math.abs((frame - pl.firstFrame) / 30 + pl.audio.startSeconds - 12.4) < 1e-9);
    const pr = normalizeProject(songA.cfg); for (const r of [[-1, 2], [3, 3], [4, 2], [2, 2.01], [0, 39], [NaN, 2]]) assert.throws(() => planExport({ project: pr, range: r, mode: "clip" }), RangeError, String(r));
    assert.throws(() => planExport({ project: { fps: 24 }, mode: "clip" }), TypeError); assert.throws(() => planExport({ project: pr, mode: "nope" }), RangeError);
  });

  // ================================================================= 3. cache identity / manifest / stale frames
  await check("cache", "identity: different productions differ; same production stable; closure-sensitive; audio and unrelated files excluded", "Identity covers entry, local scripts, transitive modules, config, declared assets and output settings only", () => {
    const A = makeProduction("songA", songA), B = makeProduction("songB", songB), A2 = makeProduction("songA2", songA);
    const iA = identityOf(A), iB = identityOf(B); assert.notEqual(iA.identity, iB.identity); assert.equal(iA.identity.length, 64); assert.equal(iA.short, iA.identity.slice(0, 12));
    assert.equal(identityOf(A).identity, iA.identity); assert.equal(identityOf(A2).identity, iA.identity, "same content in another folder -> same identity (paths are root-relative)");
    const changed = (mut) => { const d = makeProduction("tmp" + Math.random().toString(36).slice(2), songA); mut(d); return identityOf(d).identity; };
    assert.notEqual(changed((d) => fs.writeFileSync(path.join(d, "src/scenes/s1.js"), "// edited")), iA.identity, "scene module");
    assert.notEqual(changed((d) => fs.writeFileSync(path.join(d, "mods-b.mjs"), "export const k = 2;")), iA.identity, "transitively imported module");
    assert.notEqual(changed((d) => fs.writeFileSync(path.join(d, "assets/a.bin"), "other")), iA.identity, "declared asset");
    assert.notEqual(changed((d) => fs.writeFileSync(path.join(d, "studio.html"), fs.readFileSync(path.join(d, "studio.html"), "utf8") + "\n<!-- no -->\n<p>x</p>")), iA.identity, "entry page");
    assert.equal(changed((d) => fs.writeFileSync(path.join(d, "assets/song.wav"), "different audio")), iA.identity, "audio is not part of the frame identity");
    assert.equal(changed((d) => fs.writeFileSync(path.join(d, "unrelated.txt"), "changed")), iA.identity, "unreferenced file");
    for (const k of [{ fps: 30 }, { width: 540, height: 960 }, { sourceAudioOffsetSeconds: 3 }, { seed: 9 }]) assert.notEqual(identityOf(A, k).identity, iA.identity, JSON.stringify(k));
    assert.deepEqual(iA.external, ["https://fonts.example/x.css"]);   // unhashable external dependency is listed, not hidden
    const files = iA.files.map((f) => f.path); assert.ok(files.includes("mods-b.mjs") && files.includes("src/scenes/s1.js") && !files.includes("unrelated.txt") && !files.some((f) => f.endsWith(".wav")));
    const broken = makeProduction("broken", songA); fs.rmSync(path.join(broken, "src/scenes/s1.js")); assert.throws(() => identityOf(broken), /missing/);
    const noAsset = makeProduction("noasset", songA); fs.rmSync(path.join(noAsset, "assets/a.bin")); assert.throws(() => identityOf(noAsset), /declared assets file is missing/);
    return { closureFiles: files.length };
  });
  await check("cache", "manifest contents; compatible resume vs incompatible-cache detection", "Manifest records identity, dimensions, fps, interval, count, soundtrack offset; resume allowed only for same identity/dims/fps/entry/quality, with explicit mismatch reasons", () => {
    const A = makeProduction("mA", songA), idA = identityOf(A), pr = normalizeProject(songA.cfg);
    const plan1 = planExport({ project: pr, range: [2, 4], audio: "/a.wav", mode: "encode" }), m1 = buildManifest({ id: idA, plan: plan1, entry: "studio.html" });
    assert.deepEqual([m1.identity, m1.width, m1.height, m1.fps, m1.interval.firstFrame, m1.interval.frameCount, m1.soundtrack.sourceAudioOffsetSeconds, m1.soundtrack.startSeconds], [idA.identity, 1080, 1920, 24, 48, 48, 0, 2]);
    const plan2 = planExport({ project: pr, range: [10, 12], mode: "frames" }), m2 = buildManifest({ id: idA, plan: plan2, entry: "studio.html" });
    assert.deepEqual(checkManifest(m1, m2), { compatible: true, mismatches: [] });   // other interval of the same production resumes
    const B = makeProduction("mB", songB), idB = identityOf(B), prB = normalizeProject(songB.cfg), mB = buildManifest({ id: idB, plan: planExport({ project: prB, range: [2, 4], mode: "frames" }), entry: "studio.html" });
    const c = checkManifest(m1, mB); assert.equal(c.compatible, false); for (const k of ["identity", "width", "height", "fps"]) assert.ok(c.mismatches.some((x) => x.startsWith(k + ":")), k);
    assert.equal(checkManifest(m1, { ...m2, entry: "examples/landscape/studio.html" }).compatible, false); assert.equal(checkManifest(m1, { ...m2, jpegQuality: .8 }).compatible, false);
    assert.equal(checkManifest(null, m2).compatible, false); assert.equal(checkManifest({ ...m1, schema: 0 }, m2).compatible, false);
    return { mismatchFields: c.mismatches.length };
  });
  await check("cache", "stale trailing frames cannot extend an export", "missingFrames looks only at the selected sequence; encode arguments carry -start_number and an exact -frames:v bound", () => {
    const pr = normalizeProject(songA.cfg), plan = planExport({ project: pr, range: [2, 4], audio: "/a.wav", mode: "encode" });
    const onDisk = new Set(Array.from({ length: 300 }, (_, i) => frameFileName(i)));   // an older, longer export left f00000..f00299
    assert.deepEqual(missingFrames(plan, (n) => onDisk.has(n)), []); onDisk.delete(frameFileName(70)); assert.deepEqual(missingFrames(plan, (n) => onDisk.has(n)), [frameFileName(70)]);
    const args = plan.ffmpegArgs({ framesDir: "F", output: "o" }); assert.equal(args[args.indexOf("-frames:v") + 1], "48"); assert.equal(args[args.indexOf("-start_number") + 1], "48");
    assert.ok(args.indexOf("-start_number") < args.indexOf("-i"), "-start_number is an input option");
  });
  await check("cache", "driver CLI (--plan / --encode) on synthetic productions, no Chrome, no ffmpeg run", "render.mjs resolves root/entry/config/audio itself: dims, audio seek with offset+range start, per-production cache dirs; incompatible or incomplete caches fail explicitly", () => {
    const A = makeProduction("cliA", songA), B = makeProduction("cliB", songB), render = path.join(LIB, "base/render.mjs");
    const cli = (cwd, ...a) => spawnSync(process.execPath, [render, ...a], { cwd, encoding: "utf8" });
    const pa = cli(TMP, `--root=${A}`, "--plan", "--clip", "--range=2:4"), pb = cli(TMP, `--root=${B}`, "--plan", "--encode", "--range=2:4"); assert.equal(pa.status, 0, pa.stderr); assert.equal(pb.status, 0, pb.stderr);
    const ja = JSON.parse(pa.stdout), jb = JSON.parse(pb.stdout);
    assert.deepEqual([ja.project.width, ja.project.height, ja.plan.firstFrame, ja.plan.audio.startSeconds], [1080, 1920, 48, 2]); assert.deepEqual([jb.project.width, jb.project.height, jb.plan.firstFrame, jb.plan.audio.startSeconds], [720, 1280, 60, 12]);
    assert.deepEqual(audioVec(jb.ffmpeg), ["-ss", "12", "-t", "2", "-i"]); assert.equal(jb.ffmpeg[jb.ffmpeg.indexOf("-start_number") + 1], "60"); assert.notEqual(ja.identity, jb.identity); assert.notEqual(ja.framesDir, jb.framesDir);
    assert.ok(ja.ffmpeg.includes(path.join(A, "assets/song.wav")), "PROJECT.audio resolves relative to the config file");
    const bad = cli(TMP, `--root=${A}`, "--plan", "--width=720"); assert.notEqual(bad.status, 0); assert.match(bad.stderr, /not an override/);
    // encode: no frames yet -> explicit cache error (no ffmpeg started); then a manifest from ANOTHER production -> explicit mismatch listing
    const enc = cli(TMP, `--root=${B}`, "--encode", "--range=2:4"); assert.equal(enc.status, 1); assert.match(enc.stderr, /no compatible saved frames/);
    fs.mkdirSync(jb.framesDir.replace(/.*\/out\//, path.join(TMP, "out/")), { recursive: true });
    const framesDirB = path.join(TMP, "out", path.basename(path.dirname(jb.framesDir)), "frames"); fs.mkdirSync(framesDirB, { recursive: true });
    const prA = normalizeProject(songA.cfg); fs.writeFileSync(path.join(framesDirB, "manifest.json"), JSON.stringify(buildManifest({ id: identityOf(A), plan: planExport({ project: prA, range: [2, 4], mode: "frames" }), entry: "studio.html" })));
    const enc2 = cli(TMP, `--root=${B}`, "--encode", "--range=2:4"); assert.equal(enc2.status, 1); assert.match(enc2.stderr, /identity:|width:|fps:/);
    const prB = normalizeProject(songB.cfg); fs.writeFileSync(path.join(framesDirB, "manifest.json"), JSON.stringify(buildManifest({ id: identityOf(B), plan: planExport({ project: prB, range: [2, 4], mode: "frames" }), entry: "studio.html" })));
    fs.writeFileSync(path.join(framesDirB, frameFileName(60)), Buffer.alloc(2000, 1));   // 1 of 60 frames present
    const enc3 = cli(TMP, `--root=${B}`, "--encode", "--range=2:4"); assert.equal(enc3.status, 1); assert.match(enc3.stderr, /59 of 60 selected frames are missing/);
  });

  // ================================================================= 4. encoder failure handling (test doubles)
  const fakeSpawn = (script) => { const calls = { spawned: [], stdinWrites: 0, killed: 0, destroyed: 0 };
    const spawn = (cmd, args, opts) => { calls.spawned.push([cmd, args, opts]); const child = new EventEmitter(); child.stderr = new EventEmitter(); child.kill = () => { calls.killed++; };
      const stdin = new EventEmitter(); stdin.destroyed = false; stdin.destroy = () => { stdin.destroyed = true; calls.destroyed++; }; stdin.ended = false; stdin.end = () => { stdin.ended = true; script.onEnd && script.onEnd(child); };
      stdin.write = (b) => { calls.stdinWrites++; if (script.onWrite) script.onWrite(child, calls.stdinWrites, stdin); return script.backpressure ? false : true; }; child.stdin = stdin; if (script.onSpawn) queueMicrotask(() => script.onSpawn(child)); return child; };
    return { spawn, calls }; };
  const plan3 = planExport({ project: normalizeProject({ ...songA.cfg, duration: 5 }), range: [0, 0.25], audio: "/a.wav", mode: "clip" });   // 6 frames
  const ioStub = () => { const log = []; return { log, rename: async (a, b) => log.push(["rename", a, b]), remove: async (p) => log.push(["remove", p]) }; };
  await check("failure", "handlers attached at spawn; success only after exit 0; part file renamed last", "Completion is reported after a clean encoder exit, never before", async () => {
    const f = fakeSpawn({ onEnd: (c) => setTimeout(() => c.emit("close", 0, null), 15) }), io = ioStub(); let resolved = false;
    const p = runClipExport({ plan: plan3, output: "/out/v.mp4", renderFrame: async () => Buffer.alloc(10), io: { ...io, spawn: f.spawn } }).then(() => { resolved = true; });
    assert.equal(f.calls.spawned.length, 1); await new Promise((r) => setTimeout(r, 5)); assert.equal(resolved, false, "not complete before the encoder exits");
    await p; assert.equal(f.calls.stdinWrites, 6); assert.deepEqual(io.log, [["rename", "/out/v.part.mp4", "/out/v.mp4"]]);
    const args = f.calls.spawned[0][1]; assert.equal(args[args.length - 1], "/out/v.part.mp4"); assert.deepEqual(audioVec(args), ["-ss", "0", "-t", "0.25", "-i"]);
    const f2 = fakeSpawn({}); startProcess("ffmpeg", [], { spawn: f2.spawn, feed: true }); // listeners must exist synchronously after spawn
    const ev = new EventEmitter(); const f3 = (c, a, o) => { const ch = f2.spawn(c, a, o); return ch; }; const ch = f3("x", [], {}); void ev; void ch;
    let child; startProcess("ffmpeg", [], { spawn: (c, a, o) => (child = f2.spawn(c, a, o)), feed: true }); assert.ok(child.listenerCount("error") >= 1 && child.listenerCount("close") >= 1 && child.stdin.listenerCount("error") >= 1);
  });
  await check("failure", "failed startup (async error event and synchronous throw)", "ENOENT-style failures reject with an actionable message and no rename", async () => {
    const io = ioStub(), f = fakeSpawn({ onSpawn: (c) => c.emit("error", Object.assign(new Error("spawn ffmpeg ENOENT"), { code: "ENOENT" })) });
    await assert.rejects(runClipExport({ plan: plan3, output: "/o/v.mp4", renderFrame: async () => Buffer.alloc(10), io: { ...io, spawn: f.spawn } }), (e) => e instanceof ExportError && e.kind === "startup" && /ENOENT/.test(e.message) && /installed and on PATH/.test(e.message));
    assert.ok(!io.log.some(([k]) => k === "rename")); assert.ok(io.log.some(([k, p]) => k === "remove" && p === "/o/v.part.mp4"));
    await assert.rejects(runEncode({ plan: planExport({ project: normalizeProject(songA.cfg), range: [0, 1], mode: "encode" }), framesDir: "F", output: "/o/v.mp4", io: { ...ioStub(), spawn: () => { throw new Error("EACCES"); } } }), (e) => e.kind === "startup" && /EACCES/.test(e.message));
  });
  await check("failure", "nonzero exit mid-feed stops feeding; early exit with code 0; signal; broken input pipe", "A failed encoder is never fed again; each failure kind is reported; resumable work (frames dir) is not touched; partial output removed", async () => {
    const run = async (script, frames = 6) => { const io = ioStub(), f = fakeSpawn(script); let rendered = 0; const err = await runClipExport({ plan: plan3, output: "/o/v.mp4", renderFrame: async () => { rendered++; await new Promise((r) => setImmediate(r)); return Buffer.alloc(10); }, io: { ...io, spawn: f.spawn } }).then(() => null, (e) => e); return { err, f, io, rendered }; };
    let r = await run({ onWrite: (c, n) => { if (n === 2) { c.stderr.emit("data", "Unknown encoder 'libx264'"); setImmediate(() => c.emit("close", 1, null)); } } });
    assert.ok(r.err instanceof ExportError && r.err.kind === "exit" && /code 1/.test(r.err.message) && /Unknown encoder/.test(r.err.message)); assert.ok(r.f.calls.stdinWrites < 6 && r.rendered < 6, "stopped feeding"); assert.ok(r.f.calls.destroyed >= 1);
    assert.ok(!r.io.log.some(([k]) => k === "rename")); assert.deepEqual(r.io.log.filter(([k]) => k === "remove"), [["remove", "/o/v.part.mp4"]]);
    r = await run({ onWrite: (c, n) => { if (n === 3) setImmediate(() => c.emit("close", 0, null)); } }); assert.equal(r.err.kind, "early-exit"); assert.ok(/before all input/.test(r.err.message)); assert.ok(r.f.calls.stdinWrites < 6);
    r = await run({ onWrite: (c, n) => { if (n === 1) setImmediate(() => c.emit("close", null, "SIGKILL")); } }); assert.equal(r.err.kind, "signal");
    r = await run({ onWrite: (c, n, stdin) => { if (n === 2) setImmediate(() => stdin.emit("error", Object.assign(new Error("write EPIPE"), { code: "EPIPE" }))); } }); assert.equal(r.err.kind, "input"); assert.ok(/EPIPE/.test(r.err.message));
    r = await run({ onEnd: (c) => setImmediate(() => c.emit("close", 69, null)) }); assert.equal(r.err.kind, "exit", "failure at the very end (after all input) is still a failure"); assert.ok(!r.io.log.some(([k]) => k === "rename"));
    const f = fakeSpawn({}), io = ioStub(); await assert.rejects(runClipExport({ plan: plan3, output: "/o/v.mp4", renderFrame: async (j) => { if (j === 2) throw new Error("page crashed"); return Buffer.alloc(10); }, io: { ...io, spawn: f.spawn } }), (e) => e.kind === "render" && /page crashed/.test(e.message)); assert.ok(f.calls.killed >= 1);
    const be = await run({ backpressure: true, onWrite: (c, n, stdin) => { setImmediate(() => stdin.emit("drain")); } }.constructor === Object ? { backpressure: true, onWrite: (c, n, stdin) => setImmediate(() => { stdin.emit("drain"); }), onEnd: (c) => setImmediate(() => c.emit("close", 0, null)) } : {}); assert.equal(be.err, null, "drain waits resolve");
    const stuck = await run({ backpressure: true, onWrite: (c, n) => { if (n === 2) setImmediate(() => c.emit("close", 1, null)); else setImmediate(() => c.stdin.emit("drain")); } }); assert.equal(stuck.err.kind, "exit", "a waiting drain does not hang when the encoder dies");
  });

  // ================================================================= 5. particle exception safety (actual drawing paths)
  const SENT = { globalAlpha: .3, globalCompositeOperation: "multiply", shadowBlur: 9, shadowColor: "red", filter: "blur(2px)", lineWidth: 7, strokeStyle: "#0f0", fillStyle: "#00f", matrix: [2, 0, 0, 2, 30, 40] };
  const failing = (inner, method, nth = 1) => { let n = 0; return new Proxy(inner, { get(t, k) { if (k === method) return (...a) => { if (++n === nth) throw new Error(`injected ${method}`); return inner[k](...a); }; return inner[k]; }, set(t, k, v) { inner[k] = v; return true; }, has(t, k) { return k in inner; } }); };
  const KIND_FAIL = { spark: ["stroke", 1], debris: ["fill", 1], dust: ["fill", 1], confetti: ["strokeRect", 1], ember: ["createRadialGradient", 1] };
  const ev = (kind) => [{ id: "e", atVideoSeconds: 0, x: 540, y: 960, options: { kind, n: 6 } }];
  const restored = (c) => { for (const [k, v] of Object.entries(SENT)) { if (k === "matrix") assert.deepEqual(c.__matrix, v, "matrix"); else assert.equal(c.__store[k], v, k); } assert.equal(c.__depth, 0, "save depth"); };
  await check("adapter", "failures inside real particle drawing paths restore host state (all 5 kinds, nonidentity transform)", "A throwing stroke/fill/strokeRect/createRadialGradient inside spark/debris+dust/confetti/ember leaves depth, alpha, composite, shadow, filter, line/fill styles and the affine matrix as found", async () => {
    const proj = normalizeProject({ width: 1080, height: 1920 });
    for (const kind of P.PARTICLE_KINDS) { const host = {}, d = await H.installLibraryOverlays(host, proj, { particleEvents: ev(kind) });
      const [method, nth] = KIND_FAIL[kind]; for (const n of [nth, nth + 2]) { const c = recordingContext(SENT), f = failing(c, method, n); assert.throws(() => host.overlayHook(f, .1), new RegExp("injected " + method)); restored(c); }
      const ok = recordingContext(SENT); host.overlayHook(ok, .1); restored(ok); assert.ok(ok.__trace.length > 0, kind); d.dispose(); }
  });
  await check("adapter", "baseline: the unadapted original leaks state on the same failure (regression is real)", "Reproduces the reviewed defect on the pinned source so the try/finally adaptation is demonstrably necessary", async () => {
    const fs2 = await import("node:fs"); const dl = path.join(LIB, "..", "repository-downloads/buildwithhanif/claude-animation-skill/plugins/claude-animation/skills/claude-animation/lib");
    const strip = (s) => s.replace(/^import .*$/gm, "").replace(/^export \{[^}]*\};?$/gm, "").replace(/\bexport (const|function|async function)/g, "$1");
    const orig = vm.runInNewContext(`${strip(fs2.readFileSync(path.join(dl, "core.mjs"), "utf8"))}\n${strip(fs2.readFileSync(path.join(dl, "fx.mjs"), "utf8"))}\n({burstParticles})`, { Math, createCanvas() {}, Path2D: class {} });
    const c = recordingContext(SENT), f = failing(c, "stroke", 1); assert.throws(() => orig.burstParticles(f, .1, 0, 540, 960, { kind: "spark" })); assert.ok(c.__depth > 0 && c.__store.globalAlpha !== .3);
  });
  await check("adapter", "recording context: affine bookkeeping is meaningful", "translate/rotate/scale/transform/setTransform/resetTransform compose like Canvas2D; save/restore restores the matrix; paint snapshots show in-layer transforms", () => {
    const c = recordingContext({ matrix: [1, 0, 0, 1, 5, 6] }); c.save(); c.translate(10, 20); assert.deepEqual(c.__matrix, [1, 0, 0, 1, 15, 26]); c.scale(2, 3); assert.deepEqual(c.__matrix, [2, 0, 0, 3, 15, 26]);
    c.rotate(Math.PI / 2); const m = c.__matrix; assert.ok(Math.abs(m[0]) < 1e-12 && Math.abs(m[1] - 3) < 1e-12 && Math.abs(m[2] + 2) < 1e-12 && Math.abs(m[3]) < 1e-12, "M x R: rotated x-axis is scaled by sy");
    c.resetTransform(); assert.deepEqual(c.__matrix, [1, 0, 0, 1, 0, 0]); c.setTransform(1, 0, 0, 1, 7, 8); c.transform(2, 0, 0, 2, 1, 1); assert.deepEqual(c.__matrix, [2, 0, 0, 2, 8, 9]); c.restore(); assert.deepEqual(c.__matrix, [1, 0, 0, 1, 5, 6]);
    const host = {}; D.installOverlayDispatcher(host); host.overlayHook(recordingContext(SENT), 1);
    const dctx = recordingContext(SENT), d2 = {}; const disp = D.installOverlayDispatcher(d2); let inside; disp.addLayer({ id: "t", order: 1, draw: (cc) => { inside = [...cc.__matrix]; cc.translate(3, 4); } }); d2.overlayHook(dctx, 1);
    assert.deepEqual(inside, [1, 0, 0, 1, 0, 0], "layer starts from the identity transform"); assert.deepEqual(dctx.__matrix, SENT.matrix, "host's nonidentity transform restored");
    const pctx = recordingContext(); P.createParticleLayer({ events: ev("debris") }).draw({ ctx: pctx, videoSeconds: .1, width: 1080, height: 1920 });
    assert.ok(pctx.__snapshots.length > 0 && pctx.__snapshots.every((s) => s.matrix[4] !== 0 && Math.abs(Math.hypot(s.matrix[0], s.matrix[1]) - 1) < 1e-9), "debris paints under translate+rotate");
    assert.deepEqual(pctx.__matrix, [1, 0, 0, 1, 0, 0]);
  });

  // ================================================================= 6. rejected installations leave the host unchanged
  await check("adapter", "rejected installations: host hook, marks and previously valid layers unchanged", "Validation precedes mutation; a rejected install never wraps a fresh host, never alters a legacy hook, never removes earlier valid layers", async () => {
    const proj = normalizeProject({ width: 1080, height: 1920, seed: 3 }), MARK = Symbol.for("shared-animation-library.overlayDispatcher");
    const badSets = [[{ id: "b", atVideoSeconds: 1, x: 1, y: 1, options: { life: 0 } }], [{ id: "d", atVideoSeconds: 1, x: 1, y: 1 }, { id: "d", atVideoSeconds: 2, x: 1, y: 1 }], [{ id: "k", atVideoSeconds: 1, x: 1, y: 1, options: { kind: "star" } }]];
    for (const bad of badSets) {
      const fresh = {}; await assert.rejects(H.installLibraryOverlays(fresh, proj, { particleEvents: bad })); assert.deepEqual(Reflect.ownKeys(fresh), [], "fresh host untouched");
      const legacy = () => {}, h2 = { overlayHook: legacy }; await assert.rejects(H.installLibraryOverlays(h2, proj, { particleEvents: bad })); assert.equal(h2.overlayHook, legacy); assert.ok(!(MARK in h2));
      const h3 = {}; const d = await H.installLibraryOverlays(h3, proj, { particleEvents: [{ id: "good", atVideoSeconds: 0, x: 540, y: 960, options: { kind: "dust" } }] }); const hook = h3.overlayHook, ids = d.layerIds(), c0 = recordingContext(); hook(c0, .1);
      await assert.rejects(H.installLibraryOverlays(h3, proj, { particleEvents: bad })); assert.equal(h3.overlayHook, hook); assert.deepEqual(d.layerIds(), ids); assert.equal(h3[MARK], d); const c1 = recordingContext(); h3.overlayHook(c1, .1); assert.deepEqual(c1.__trace, c0.__trace);
    }
    const h4 = {}; await assert.rejects(H.installLibraryOverlays(h4, { width: 1080, height: 1920 }, {}), TypeError); assert.deepEqual(Reflect.ownKeys(h4), []);
    const h5 = {}; await assert.rejects(H.installLibraryOverlays(h5, proj, { particleEvents: [{ id: "q", atVideoSeconds: NaN, x: 0, y: 0 }] }), RangeError); assert.deepEqual(Reflect.ownKeys(h5), []);
    const h6 = {}; const d6 = await H.installLibraryOverlays(h6, proj, { particleEvents: [{ id: "q", atVideoSeconds: 1, x: 0, y: 0 }] }); const again = await H.installLibraryOverlays(h6, proj, { particleEvents: [{ id: "r", atVideoSeconds: 1, x: 0, y: 0 }] });
    assert.equal(again, d6); assert.equal(d6.layerIds().filter((i) => i === H.PARTICLE_LAYER_ID).length, 1, "second valid install keeps the first layer, no duplicate");
  });

  // ================================================================= 7. reuse across different songs / themes
  await check("reuse", "two different productions: own offsets, dimensions, fps, cues, particle events through the shared mechanisms", "Same library code serves 1080x1920@24 (offset 0) and 720x1280@30 (offset 10): cue time, frame time, coordinates and seeds follow each production's config", async () => {
    for (const [cfg, srcCue, x, y, fr] of [[songA.cfg, 3.5, 540, 1500, 84], [songB.cfg, 12.4, 360, 900, 72]]) {
      const pr = normalizeProject(cfg), host = {}; const d = await H.installLibraryOverlays(host, pr, { particleEvents: [{ id: "hit", atSourceSeconds: srcCue, x, y, options: { kind: "confetti", n: 8 } }] });
      const t = tb.frameToVideoSeconds(fr, pr.fps), c = recordingContext(); host.overlayHook(c, t);
      const direct = recordingContext(); P.createParticleLayer({ events: [{ id: "hit", atVideoSeconds: tb.sourceToVideoSeconds(srcCue, pr.sourceAudioOffsetSeconds), x, y, options: { kind: "confetti", n: 8 } }], seed: pr.seed }).draw({ ctx: direct, videoSeconds: t, width: pr.width, height: pr.height });
      assert.ok(c.__snapshots.length > 0, "cue is active on its own frame"); assert.ok(JSON.stringify(c.__trace).includes(JSON.stringify(direct.__trace[1])));
      assert.ok(c.__snapshots.every((s) => s.matrix[4] < pr.width * 1.5 && s.matrix[5] < pr.height * 1.5), "coordinates are in this production's pixel space"); d.dispose();
    }
    assert.equal(tb.sourceToVideoSeconds(12.4, 10), 2.4); assert.ok(tb.sourceToVideoSeconds(12.4, 10) <= 72 / 30, "cue never lands after its own frame time through float noise");
    assert.notEqual(identityOf(makeProduction("rA", songA)).identity, identityOf(makeProduction("rB", songB)).identity);
  });
  await check("numeric", "beatPulse API exception and tempo-bound form; strict timebase", "r02.beatPulse takes explicit seconds-per-beat; beatPulseForBpm(bpm) reproduces the source call shape exactly; frame indices must be safe integers; overflow rejected", () => {
    const f = num.r02.beatPulseForBpm(120); for (let i = -40; i <= 80; i++) { const t = i / 10; assert.ok(Object.is(f(t), Math.exp(-((t / (60 / 120)) % 1) * 7))); assert.ok(Object.is(f(t, 3), Math.exp(-((t / (60 / 120)) % 1) * 3))); }
    assert.ok(Number.isNaN(num.r02.beatPulse(.25)), "source call shape without beatSeconds is NOT supported on the namespace"); assert.ok(Object.is(num.r02.beatPulse(.25, 60 / 120, 3), f(.25, 3)));
    assert.throws(() => tb.frameToVideoSeconds(2 ** 53, 24)); assert.throws(() => tb.frameToVideoSeconds(1, Number.MIN_VALUE), /overflowed/); assert.throws(() => tb.videoToSourceSeconds(Number.MAX_VALUE, Number.MAX_VALUE), /overflowed/); assert.throws(() => tb.sourceToVideoSeconds(Number.MAX_VALUE, -Number.MAX_VALUE), /overflowed/);
  });
  fs.rmSync(TMP, { recursive: true, force: true });
}
