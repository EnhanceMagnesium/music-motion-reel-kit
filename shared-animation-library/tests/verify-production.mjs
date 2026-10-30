// verify-production.mjs — non-rendering verification of the production shell: config contract, scene runtime, cue schema, asset/font declarations,
// production host, R06 critter adapter, cache identity of declared files. No browser, no pixels, no media, no audio, no models.
//   node shared-animation-library/tests/verify-production.mjs   -> writes tests/verify-production-results.json, exit 1 on any failure.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import vm from "node:vm";
import assert from "node:assert/strict"; import { fileURLToPath, pathToFileURL } from "node:url"; import { execFileSync, spawnSync } from "node:child_process";
import { recordingContext } from "./recording-context.mjs";
import normalizeProject from "../base/src/project-config.js";

const LIB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const KIT = path.dirname(LIB);
const imp = (rel) => import(pathToFileURL(path.join(LIB, rel)));
const SR = await imp("production/scene-runtime.mjs"), CS = await imp("production/cue-schema.mjs"), PH = await imp("production/production-host.mjs");
const MF = await imp("production/manifest.mjs"), FS = await imp("production/fontsource.mjs"), CI = await imp("export/cache-identity.mjs");
const EP = await imp("export/export-plan.mjs");
const CR = await imp("adapters/r06-critter-rig.mjs"), D = await imp("adapters/overlay-dispatcher.mjs"), H = await imp("adapters/host-integration.mjs");
const results = []; let failed = 0;
const check = async (group, name, establishes, fn) => { try { const detail = await fn(); results.push({ group, name, status: "PASS", establishes, detail }); } catch (e) { failed++; results.push({ group, name, status: "FAIL", establishes, error: String(e && e.message || e).slice(0, 600) }); } };
const read = (p) => fs.readFileSync(p, "utf8");
const throwsMsg = (fn, re) => assert.throws(fn, (e) => re.test(e.message), `expected /${re}/`);

const EX = path.join(LIB, "examples/neutral-production");
const exampleConfig = () => vm.runInNewContext(read(path.join(EX, "config.js")) + "\n;PROJECT");
const BASE = { productionId: "t", duration: 10, fps: 24, modules: [{ id: "m1", src: "a.js" }], scenes: [{ id: "s1", start: 0, end: 4, needs: ["m1"] }, { id: "s2", start: 4, end: 10 }] };
const norm = (o) => normalizeProject({ ...BASE, ...o });

// ============================================================ 1. configuration contract
await check("config", "neutral example config normalizes; legacy defaults remain intentional", "The example declaration is valid; legacy duration remains 11 s and an omitted maximum follows the resolved duration", () => {
  const n = normalizeProject(exampleConfig()); assert.equal(n.scenes.length, 2); assert.deepEqual(n.moduleLoadOrder, ["palette", "scene-a", "scene-b"]); assert.deepEqual(n.coverage, { start: 0, end: 8 });
  const legacy = normalizeProject({ duration: 11, bpm: 120, offset: 0, width: 1080, height: 1920, fps: 24, seed: 1, sourceAudioOffsetSeconds: 0 });
  assert.equal(legacy.scenes, undefined); assert.equal(legacy.moduleLoadOrder, undefined); assert.equal(legacy.normalized, true);
  assert.equal(legacy.duration, 11); assert.equal(legacy.maxDurationSeconds, 11);
  assert.deepEqual(normalizeProject({ ...legacy, assets: ["a.png"], fonts: ["f.woff2"] }).assets, ["a.png"]);
  return { scenes: n.scenes.map((s) => s.id) };
});
await check("config", "scene schedule rejections (overlap, gap, lead-in, tail, durations, ids, past duration)", "Invalid timing is refused at normalizeProject, before any renderer work", () => {
  const s = (a, b, id = "x") => ({ id, start: a, end: b });
  const cases = [
    [{ scenes: [s(0, 5, "a"), s(4, 10, "b")] }, /overlap/], [{ scenes: [s(0, 4, "a"), s(5, 10, "b")] }, /gap 4\.\.5s/], [{ scenes: [s(1, 10, "a")] }, /uncovered lead-in/],
    [{ scenes: [s(0, 8, "a")] }, /uncovered tail/], [{ scenes: [s(0, 0, "a")] }, /end > start/], [{ scenes: [s(0, 0.01, "a"), s(0.01, 10, "b")] }, /less than one frame/],
    [{ scenes: [s(0, 11, "a")] }, /past duration/], [{ scenes: [s(0, 5, "a"), s(5, 10, "a")] }, /duplicate scene id/], [{ scenes: [s(0, NaN, "a")] }, /finite number/],
    [{ scenes: [s(-1, 10, "a")] }, /negative/], [{ scenes: [{ id: "1bad", start: 0, end: 10 }] }, /identifier/], [{ productionId: undefined }, /productionId is required/],
    [{ scenes: [{ id: "a", start: 0, end: 10, needs: ["zz"] }] }, /unknown module "zz"/], [{ coverage: { start: 0, end: 12 } }, /coverage/], [{ coverage: { start: 0, end: 9 } }, /beyond the intended interval|coverage ends/],
  ];
  for (const [o, re] of cases) throwsMsg(() => norm(o), re);
  assert.equal(norm({ scenes: [s(0, 5, "b"), s(5, 10, "a")] }).scenes[0].id, "b");                          // unsorted input is sorted by start
  assert.equal(norm({ coverage: { start: 0, end: 10 } }).coverage.end, 10);
  const longSong = norm({ duration: 96, scenes: [s(0, 96, "full-song")] });
  assert.equal(longSong.duration, 96); assert.equal(longSong.maxDurationSeconds, 96);
  assert.equal(normalizeProject({ duration: 90, maxDurationSeconds: 90 }).maxDurationSeconds, 90);
  assert.equal(normalizeProject({ duration: 90, maxDurationSeconds: 100 }).maxDurationSeconds, 100);
  throwsMsg(() => normalizeProject({ duration: 90, maxDurationSeconds: 45 }), /exceeds explicit maxDurationSeconds/);
  throwsMsg(() => norm({ duration: 46, maxDurationSeconds: 45, scenes: [s(0, 46, "a")] }), /exceeds explicit maxDurationSeconds/);
  return { rejected: cases.length };
});
await check("export", "whole-master Remotion plan preserves a fractional full-song endpoint without a global duration ceiling", "Full zero-offset source rounds video frames up, reports the sub-frame difference and carries selected dimensions; explicit ranges keep nearest-frame behavior", () => {
  for (const [width, height, duration] of [[1080, 1350, 80.01], [1080, 1920, 80.02]]) {
    const project = normalizeProject({ productionId: `full-${height}`, renderEngine: "remotion", width, height, fps: 24, duration, sourceAudioOffsetSeconds: 0 });
    const plan = EP.planExport({ project, audio: "/song/full-master.wav", mode: "clip" });
    assert.deepEqual([plan.width, plan.height, plan.firstFrame, plan.endFrame, plan.frameCount], [width, height, 0, Math.ceil(duration * 24), Math.ceil(duration * 24)]);
    assert.equal(EP.wholeProjectFrameCount(project), plan.frameCount);
    assert.equal(plan.endRounding, "ceil-to-preserve-full-master");
    assert.ok(plan.frameQuantizationDifferenceSeconds >= 0 && plan.frameQuantizationDifferenceSeconds < 1 / project.fps);
    assert.equal(plan.audio.startSeconds, 0);
    assert.equal(plan.audio.durationSeconds, duration);
    assert.equal(plan.audioVideoEndpointDifferenceSeconds, plan.durationSeconds - duration);
    assert.equal(EP.audioDurationInFrames(project, plan.frameCount), duration * project.fps);
    const args = plan.ffmpegArgs({ output: "/out/full.mp4" });
    assert.equal(Number(args[args.indexOf("-t") + 1]), duration);
    const metadata = EP.projectCompositionMetadata(project);
    assert.deepEqual([metadata.width, metadata.height, metadata.fps, metadata.durationInFrames], [width, height, project.fps, plan.frameCount]);
  }
  const excerpt = normalizeProject({ productionId: "excerpt", duration: 80.01, fps: 24, sourceAudioOffsetSeconds: 12 });
  const excerptPlan = EP.planExport({ project: excerpt, audio: "/song/master.wav", mode: "clip" });
  assert.equal(excerptPlan.endRounding, "nearest-frame");
  assert.equal(excerptPlan.frameCount, Math.round(80.01 * 24));
  assert.equal(excerptPlan.audio.durationSeconds, excerptPlan.durationSeconds);
  assert.equal(EP.audioDurationInFrames(excerpt, excerptPlan.frameCount), excerptPlan.frameCount);
  const explicitRange = EP.planExport({ project: normalizeProject({ productionId: "range", duration: 80.01, fps: 24, sourceAudioOffsetSeconds: 0 }), range: [0, 80.01], mode: "clip" });
  assert.equal(explicitRange.endRounding, "nearest-frame");
  const composition = read(path.join(LIB, "remotion-runtime/src/song-composition.jsx"));
  assert.match(composition, /projectCompositionMetadata\(project\)/);
  assert.match(composition, /durationInFrames=\{audioDurationInFrames\(project, durationInFrames\)\}/);
  return { checkedDimensions: ["1080x1350", "1080x1920"], fractionalFullSongSeconds: [80.01, 80.02], fullAudioSpanFrames: [80.01 * 24, 80.02 * 24] };
});
await check("config", "coverage can be a sub-interval; modules: order, cycles, unknown refs, duplicates", "Deterministic stable topological load order and refusal of impossible module graphs", () => {
  const n = norm({ coverage: { start: 2, end: 10 }, scenes: [{ id: "a", start: 2, end: 6 }, { id: "b", start: 6, end: 10 }] }); assert.equal(n.coverage.start, 2);
  const mods = [{ id: "c", src: "c.js", requires: ["a", "b"] }, { id: "b", src: "b.js", requires: ["a"] }, { id: "a", src: "a.js" }, { id: "z", src: "z.js" }];
  const order = norm({ modules: mods, scenes: BASE.scenes.map((s) => ({ ...s, needs: [] })) }).moduleLoadOrder; assert.deepEqual(order, ["a", "b", "c", "z"]);
  assert.deepEqual(norm({ modules: mods, scenes: BASE.scenes.map((s) => ({ ...s, needs: [] })), moduleLoadOrder: ["hand", "edited"] }).moduleLoadOrder, ["a", "b", "c", "z"]);          // derived key is never trusted
  throwsMsg(() => norm({ modules: [{ id: "a", src: "a.js", requires: ["b"] }, { id: "b", src: "b.js", requires: ["a"] }] }), /cycle/);
  throwsMsg(() => norm({ modules: [{ id: "a", src: "a.js", requires: ["a"] }] }), /requires itself/); throwsMsg(() => norm({ modules: [{ id: "a", src: "a.js", requires: ["q"] }] }), /unknown module/);
  throwsMsg(() => norm({ modules: [{ id: "a", src: "a.js" }, { id: "a", src: "b.js" }] }), /duplicate module id/); throwsMsg(() => norm({ modules: [{ id: "a", src: "a.js", type: "esm" }] }), /type must be/);
  const again = normalizeProject(norm({})); assert.deepEqual(again.moduleLoadOrder, ["m1"]); assert.equal(again.scenes.length, 2);                                                       // idempotent
  return { order };
});
await check("config", "asset / font / cue declarations: paths, ids, shapes", "Absolute/URL/backslash paths, duplicate ids and ambiguous cue sources are refused", () => {
  for (const bad of ["/abs/x.png", "https://x/y.png", "C:\\x.png", "a\\b.png", ""]) throwsMsg(() => norm({ assets: [bad] }), /relative path/);
  throwsMsg(() => norm({ assets: [{ id: "a", src: "a.png" }, { id: "a", src: "b.png" }] }), /duplicate asset id/); throwsMsg(() => norm({ assets: [{ id: "a", src: "a.png", kind: "video" }] }), /kind must be/);
  throwsMsg(() => norm({ fonts: [{ family: "", src: "f.woff2" }] }), /family/); throwsMsg(() => norm({ fonts: [{ family: "F", src: "f.woff2" }, { family: "F", src: "f.woff2" }] }), /declared twice/);
  throwsMsg(() => norm({ cues: {} }), /exactly one/); throwsMsg(() => norm({ cues: { entries: [], module: "c.mjs" } }), /exactly one/); throwsMsg(() => norm({ cues: { module: "/c.mjs" } }), /relative path/);
  assert.ok(norm({ assets: ["a.png", { id: "b", src: "b.png", kind: "image" }], fonts: ["f.woff2", { family: "F", src: "g.woff2", weight: "700" }], cues: { module: "cues.mjs" } }));
});

// ============================================================ 2. cue schema and time bases
await check("cues", "source -> production conversion once, through the shared timebase", "Cues keep their source time, gain exactly one production time, and land on their frame", () => {
  const P = normalizeProject({ duration: 10, fps: 30, sourceAudioOffsetSeconds: 10 });
  const idx = CS.normalizeCues({ entries: [{ id: "k", kind: "accent", basis: "source", seconds: 12.4, evidence: "measured", tool: "x" }, { id: "p", kind: "accent", basis: "production", seconds: 1, evidence: "supplied" }] }, P);
  const k = idx.all.find((c) => c.id === "k"), p = idx.all.find((c) => c.id === "p");
  assert.equal(k.productionSeconds, 2.4); assert.ok(k.productionSeconds <= 72 / 30); assert.equal(k.sourceSeconds, 12.4); assert.equal(p.sourceSeconds, 11); assert.equal(p.productionSeconds, 1);
  assert.ok(k.converted && Object.isFrozen(k));
  throwsMsg(() => CS.normalizeCues({ entries: [k] }, P), /already converted/);
  const ob = { id: "q", kind: "beat", basis: "source", seconds: 3, evidence: "estimated" }; CS.normalizeCues({ entries: [ob] }, P); assert.deepEqual(ob, { id: "q", kind: "beat", basis: "source", seconds: 3, evidence: "estimated" });   // input untouched
  assert.equal(CS.normalizeCues(undefined, P).all.length, 0);
});
await check("cues", "evidence classes, supplied text, confirmation, interval/excerpt flags", "Measured/estimated/inferred/supplied/confirmed are distinct and enforced; lyric text must be supplied", () => {
  const P = normalizeProject({ duration: 10, sourceAudioOffsetSeconds: 5 }), e = (o) => ({ id: "c", kind: "lyric-line", basis: "source", seconds: 6, evidence: "estimated", ...o });
  throwsMsg(() => CS.normalizeCues({ entries: [e({ evidence: "guess" })] }, P), /evidence must be one of/); throwsMsg(() => CS.normalizeCues({ entries: [e({ evidence: "confirmed" })] }, P), /confirmedBy/);
  throwsMsg(() => CS.normalizeCues({ entries: [e({ text: "words" })] }, P), /textSource/); throwsMsg(() => CS.normalizeCues({ entries: [e({ basis: "clock" })] }, P), /basis/);
  throwsMsg(() => CS.normalizeCues({ entries: [e({ endSeconds: 5 })] }, P), /before seconds/); throwsMsg(() => CS.normalizeCues({ entries: [e({ confidence: 2 })] }, P), /confidence/);
  throwsMsg(() => CS.normalizeCues({ entries: [e(), e()] }, P), /duplicate cue id/); throwsMsg(() => CS.normalizeCues({ schemaVersion: 2, entries: [] }, P), /schemaVersion/);
  throwsMsg(() => CS.normalizeCues({ recording: { id: "r", sha256: "zz" }, entries: [] }, P), /sha256/);
  const idx = CS.normalizeCues({ recording: { id: "rec", sha256: "a".repeat(64) }, entries: [
    e({ id: "l1", text: "supplied words", textSource: "supplied", seconds: 6, endSeconds: 8, evidence: "supplied" }), e({ id: "early", seconds: 2 }), e({ id: "late", seconds: 30 }), e({ id: "conf", seconds: 9, evidence: "confirmed", confirmedBy: "listener" }),
    e({ id: "span", seconds: 4, endSeconds: 12 })] }, P);
  assert.deepEqual(idx.overlapping.map((c) => c.id), ["span", "l1", "conf"].sort((a, b) => idx.all.find((c) => c.id === a).productionSeconds - idx.all.find((c) => c.id === b).productionSeconds));   // 'early' (-3) and 'late' (25) are outside; 'span' ends past
  assert.equal(idx.all.find((c) => c.id === "early").inExcerpt, false); assert.equal(idx.all.find((c) => c.id === "span").inExcerpt, false); assert.equal(idx.all.find((c) => c.id === "span").overlapsExcerpt, true);
  assert.deepEqual(idx.between(1, 4).map((c) => c.id), ["l1"]); assert.deepEqual(idx.active(2).map((c) => c.id), ["span", "l1"]); assert.equal(idx.nextAfter(0.5, "lyric-line").id, "l1"); assert.equal(idx.lastAtOrBefore(5).id, "conf");
  assert.equal(idx.recording.id, "rec");
});
await check("cues", "analysis importers produce raw source-clock cues (shapes read from R04/R07 source)", "Estimate-labelled cues from synthetic documents in the shape the pinned code writes/reads; real analysis output NOT exercised", () => {
  const P = normalizeProject({ duration: 10, sourceAudioOffsetSeconds: 20 });
  const a = CS.fromBeatgridAudiomap({ grid: { beats_sec: [20.5, 21], downbeats_sec: [20.5] }, events: [{ t: 21.25, bar: 1, beat_in_bar: 2, step16: 5, grid: "weak", drum: "kick", energy: 0.8, feel: "x", special: null }], key_moments: [{ t: 25, kind: "SURGE" }], energy_phases: [{ start: 20, end: 24, level: "LOW" }] });
  const b = CS.fromAudioJson({ beats: [20.5], downbeats: [20.5], sections: [{ name: "verse", start: 20, end: 30 }], onsets: { kick: [[21, 0.9]] } }, { trackStartSourceSeconds: 0 });
  for (const entries of [a, b]) { const idx = CS.normalizeCues({ entries }, P); assert.ok(idx.all.length >= 4 && idx.all.every((c) => c.evidence === "estimated")); assert.equal(idx.all[0].productionSeconds, entries === a ? 0 : 0); }
  assert.equal(CS.normalizeCues({ entries: a }, P).all.find((c) => c.id === "onset:0").productionSeconds, 1.25);
  const shifted = CS.fromAudioJson({ beats: [1] }, { trackStartSourceSeconds: 20 }); assert.equal(CS.normalizeCues({ entries: shifted }, P).all[0].productionSeconds, 1);
  throwsMsg(() => CS.fromAudioJson(null), /object/);
});

// ============================================================ 3. scene runtime
const fakeLoaders = (log, over = {}) => ({
  loadModule: async (f) => { log.push("load:" + f.id); if (over.failModule === f.id) throw new Error("boom"); return over.exports?.[f.id]; },
  loadCues: async () => ({ entries: [] }), loadFont: async (f) => { log.push("font:" + f.face.family); if (over.failFont === f.face.family) throw new Error("no such font file"); },
  loadAsset: async (f) => { log.push("asset:" + f.id); if (over.failAsset === f.id) throw new Error("404"); return { id: f.id }; },
});
const mkImpl = (log, id, extra = {}) => ({ draw: (st) => log.push(`draw:${id}@${st.t.toFixed(3)}`), init: () => log.push("init:" + id), dispose: () => log.push("dispose:" + id), ...extra });
const PROD = normalizeProject({ productionId: "p", duration: 10, fps: 24, sourceAudioOffsetSeconds: 3, modules: [{ id: "lib", src: "lib.js" }, { id: "sc", src: "sc.js", requires: ["lib"] }],
  scenes: [{ id: "one", impl: "I1", start: 0, end: 4, needs: ["sc"], params: { k: 1 } }, { id: "two", impl: "I2", start: 4, end: 10 }], fonts: [{ family: "F", src: "f.woff2" }], assets: [{ id: "img", src: "i.png", kind: "image" }] });
const run = (log, impls, over = {}) => { const reg = SR.createSceneRegistry(); for (const [k, v] of Object.entries(impls)) reg.register(k, v); return SR.startProduction({ project: PROD, registry: reg, loaders: fakeLoaders(log, over), normalizeCues: CS.normalizeCues }); };
await check("runtime", "load order, readiness order, init order, reverse dispose", "Modules load in moduleLoadOrder, then cues/fonts/assets, then scene init in schedule order; dispose is the reverse", async () => {
  const log = [], p = await run(log, { I1: mkImpl(log, "I1"), I2: mkImpl(log, "I2") });
  assert.deepEqual(log.slice(0, 2), ["load:lib", "load:sc"]); assert.ok(log.includes("font:F") && log.includes("asset:img")); assert.deepEqual(log.filter((x) => x.startsWith("init")), ["init:I1", "init:I2"]);
  assert.ok(log.indexOf("init:I1") > log.indexOf("asset:img")); assert.equal(p.assets.get("img").id, "img");
  await p.dispose(); await p.dispose(); assert.deepEqual(log.filter((x) => x.startsWith("dispose")), ["dispose:I2", "dispose:I1"]); return log;
});
await check("runtime", "failures: module load, missing impl, font, asset, init (with rollback)", "Every failure is a ProductionLoadError naming the stage and id; a failed init disposes what was initialized", async () => {
  const E = SR.ProductionLoadError, rej = async (impls, over, stage, re) => { const log = []; await assert.rejects(() => run(log, impls, over), (e) => e instanceof E && e.stage === stage && re.test(e.message)); return log; };
  const ok = (log) => ({ I1: mkImpl(log, "I1"), I2: mkImpl(log, "I2") });
  await rej({}, { failModule: "sc" }, "module", /sc.*boom/); await rej({ I1: mkImpl([], "I1") }, {}, "impl", /scene "two".*"I2".*registered: I1/);
  await rej(ok([]), { failFont: "F" }, "font", /f\.woff2.*no such font file/); await rej(ok([]), { failAsset: "img" }, "asset", /i\.png.*404/);
  const log = []; await assert.rejects(() => run(log, { I1: mkImpl(log, "I1"), I2: mkImpl(log, "I2", { init: () => { throw new Error("init bad"); } }) }), (e) => e.stage === "init" && e.id === "two"); assert.deepEqual(log.filter((x) => x.startsWith("dispose")), ["dispose:I1"]);
  const reg = SR.createSceneRegistry(); assert.throws(() => reg.register("x", {}), /draw/); reg.register("x", mkImpl([], "x")); assert.throws(() => reg.register("x", mkImpl([], "x")), /already registered/); assert.throws(() => reg.register("y", { draw() {}, init: 1 }), /init must be a function/);
});
await check("runtime", "arbitrary-time determinism: SceneTime, seek contract, out-of-order frames", "draw gets authoritative t, local t, duration, source t; results do not depend on call order; seek() runs before every draw/overlay", async () => {
  const seen = [], seekLog = [];
  const impl = (id) => ({ draw: (st) => seen.push([id, st.t, st.localT, st.duration, st.sourceT, st.frame, st.sceneIndex, st.params?.k ?? null]), overlay: (c, st) => seen.push(["ov" + id, st.t]), seek: (st) => seekLog.push(st.t) });
  const p = await run([], { I1: impl("one"), I2: impl("two") }), ts = [0, 1.5, 3.999, 4, 7.25, 9.9, 2.5, 0.125], fns = p.shots();
  const draw = (t) => { const i = fns.map((f) => f[0]).filter((s) => s <= t).length - 1; fns[Math.max(0, i)][1](t, t - fns[Math.max(0, i)][0], 0); };
  for (const t of ts) draw(t); const fwd = seen.splice(0).map((x) => JSON.stringify(x));
  for (const t of [...ts].reverse()) draw(t); const rev = seen.splice(0).map((x) => JSON.stringify(x)).reverse();
  assert.deepEqual(fwd, rev);
  const d = JSON.parse(fwd[2]); assert.deepEqual(d, ["one", 3.999, 3.999, 4, 6.999, 96, 0, 1]);          // t, localT, duration, sourceT = 3 + t, frame = round(t*24)
  assert.deepEqual(JSON.parse(fwd[4]).slice(0, 5), ["two", 7.25, 3.25, 6, 10.25]);
  seekLog.length = 0; const ctx = recordingContext(); p.overlay(ctx, 5); assert.deepEqual(seekLog, [5]); p.overlay(ctx, 1); assert.deepEqual(seen.splice(0), [["ovtwo", 5], ["ovone", 1]]);
  assert.equal(SR.sceneIndexAt(PROD.scenes, -1), 0); assert.equal(SR.sceneIndexAt(PROD.scenes, 4), 1); assert.equal(SR.sceneIndexAt(PROD.scenes, 99), 1);
  assert.ok(Object.isFrozen(SR.sceneTimeAt(PROD, PROD.scenes, 0, 1, null)));
});
await check("runtime", "integration with the REAL base/src/timeline.js shots()/drawWorld", "Scenes registered through shots() are chosen and timed by the unmodified R02 timeline code", async () => {
  const log = [], p = await run([], { I1: { draw: (st) => log.push(["a", st.t, st.localT, st.duration]) }, I2: { draw: (st) => log.push(["b", st.t, st.localT, st.duration]) } });
  const ctx = vm.createContext({ DUR: PROD.duration, window: {}, flushLetters() {}, paint() {}, ellPts() {}, clawd() {}, feel() {}, PAL: {}, H: 1920, W: 1080, push() {}, pop() {}, translate() {}, rotate() {}, easeOut: (x) => x, ease: (x) => x, clamp: (x) => x, lerp: (a) => a, hash: () => 0, jit: () => 0 });
  vm.runInContext(read(path.join(LIB, "base/src/timeline.js")), ctx); vm.runInContext("shots", ctx)(p.shots());
  for (const t of [0, 3.9, 4, 9.5]) vm.runInContext("drawWorld", ctx)(t);
  assert.deepEqual(log.map((x) => x[0]), ["a", "a", "b", "b"]); assert.deepEqual(log[2].slice(1), [4, 0, 6]); assert.deepEqual(log[1].slice(1), [3.9, 3.9, 4]);
});

// ============================================================ 4. production host
const fakeHost = () => { const h = { calls: [], shots(list) { h.calls.push(list); } }; return h; };
await check("host", "installProduction: success wiring, layer order, no-op without scenes", "Shots registered after load; scene overlays sit between particles (10) and the previous hook/karaoke (20); no scenes = no-op", async () => {
  assert.equal(await PH.installProduction(fakeHost(), normalizeProject({}), {}), null);
  const host = fakeHost(); host.overlayHook = () => {};
  await H.installLibraryOverlays(host, normalizeProject({ seed: 1 }), { particleEvents: [{ id: "e", atVideoSeconds: 1, x: 1, y: 1, options: { kind: "dust" } }] });
  const log = [], reg = { I1: { draw() {}, overlay: () => log.push("o1") }, I2: { draw() {} } };
  const loaders = fakeLoaders([], {}); loaders.loadModule = async (f) => (f.id === "sc" ? { scenes: reg } : undefined);
  const prod = await PH.installProduction(host, PROD, { loaders });
  assert.equal(host.calls.length, 1); assert.equal(host.calls[0].length, 2); assert.equal(host.PRODUCTION, prod); assert.equal(typeof host.registerSceneImpl, "function");
  assert.deepEqual(D.getOverlayDispatcher(host).layerIds(), ["r06-burst-particles", "scene-overlays", "previous-hook"]);
  host.overlayHook(recordingContext(), 1); assert.deepEqual(log, ["o1"]); host.overlayHook(recordingContext(), 5); assert.deepEqual(log, ["o1"]);
  await assert.rejects(() => PH.installProduction(host, PROD, { loaders }), /already installed/);
});
await check("host", "installProduction failure leaves the host untouched and records the error", "A failed load registers no shots and adds no overlay layer", async () => {
  const host = fakeHost(), loaders = fakeLoaders([], { failModule: "lib" });
  await assert.rejects(() => PH.installProduction(host, PROD, { loaders }), (e) => e instanceof SR.ProductionLoadError && e.stage === "module");
  assert.equal(host.calls.length, 0); assert.equal(host.PRODUCTION, undefined); assert.equal(host.PRODUCTION_ERROR.stage, "module"); assert.equal(D.getOverlayDispatcher(host), undefined);
});
const PART = normalizeProject({ productionId: "part", duration: 10, fps: 24, coverage: { start: 2, end: 8 }, scenes: [{ id: "a", impl: "A", start: 2, end: 5 }, { id: "b", impl: "B", start: 5, end: 8 }] });
const partImpls = (log) => ({ A: { draw: (st) => log.push(["drawA", st.t, st.localT]), overlay: (c, st) => log.push(["ovA", st.t]) }, B: { draw: (st) => log.push(["drawB", st.t, st.localT]), overlay: (c, st) => log.push(["ovB", st.t]) } });
await check("coverage", "half-open coverage [start,end) through the real timeline.js shots()/drawWorld and the overlay path", "Outside coverage no scene draws or overlays; the later scene owns an internal boundary; timeline.js is unmodified", async () => {
  const log = [], reg = SR.createSceneRegistry(); for (const [k, v] of Object.entries(partImpls(log))) reg.register(k, v);
  const p = await SR.startProduction({ project: PART, registry: reg, loaders: fakeLoaders([], {}), normalizeCues: CS.normalizeCues });
  const ctx = vm.createContext({ DUR: PART.duration, window: {}, flushLetters() {}, paint() {}, ellPts() {}, clawd() {}, feel() {}, PAL: {}, H: 1920, W: 1080, push() {}, pop() {}, translate() {}, rotate() {}, easeOut: (x) => x, ease: (x) => x, clamp: (x) => x, lerp: (a) => a, hash: () => 0, jit: () => 0 });
  vm.runInContext(read(path.join(LIB, "base/src/timeline.js")), ctx); vm.runInContext("shots", ctx)(p.shots()); const world = vm.runInContext("drawWorld", ctx), oc = recordingContext();
  const e = 1e-6, cases = [[0, null], [1.999999, null], [2, "A"], [4.999999, "A"], [5, "B"], [7.999999, "B"], [8, null], [9.5, null]];
  for (const [t, want] of cases) { log.length = 0; world(t); p.overlay(oc, t);
    assert.deepEqual(log.map((x) => x[0]), want ? [`draw${want}`, `ov${want}`] : [], `t=${t}`);
    if (want) assert.equal(log[0][1], t); }
  log.length = 0; world(5); assert.equal(log[0][2], 0);   // local time at the boundary is 0 in the later scene
  return { cases: cases.length };
});
const stubHost = (extra = {}) => { const h = { calls: [], shots(l) { h.calls.push(l); }, ...extra }; return h; };
const modLoaders = (log, over = {}) => { const l = fakeLoaders(log, over); l.loadModule = async (f) => { if (over.failModule === f.id) throw new Error("boom"); return f.id === "sc" ? { scenes: { I1: mkImpl(log, "I1"), I2: mkImpl(log, "I2") } } : undefined; }; return l; };
await check("host", "failed-install cleanup: registerSceneImpl, overlay layer, dispatcher, disposal (fresh and preconfigured hosts)", "Verified failure cases restore the host; a pre-existing dispatcher and layers are never disposed or altered", async () => {
  const sentinel = () => {};
  for (const mode of ["module-load", "shots-throws"]) for (const pre of [false, true]) {
    const log = [], host = stubHost(); if (mode === "shots-throws") host.shots = () => { throw new Error("shots refused"); };
    let before = null; if (pre) { host.registerSceneImpl = sentinel; D.installOverlayDispatcher(host).addLayer({ id: "keep", order: 5, draw() {} }); before = D.getOverlayDispatcher(host); }
    await assert.rejects(() => PH.installProduction(host, PROD, { loaders: modLoaders(log, mode === "module-load" ? { failModule: "sc" } : {}) }), mode === "module-load" ? /boom/ : /shots refused/);
    const tag = `${mode}/${pre ? "pre" : "fresh"}`, d = D.getOverlayDispatcher(host);
    assert.ok(host.PRODUCTION_ERROR, tag); assert.equal(host.PRODUCTION, undefined, tag); assert.equal(host.calls.length, 0, tag);
    if (pre) { assert.equal(host.registerSceneImpl, sentinel, tag); assert.equal(d, before, tag); assert.equal(d.disposed, false, tag); assert.deepEqual(d.layerIds(), ["keep"], tag); }
    else { assert.equal(Object.prototype.hasOwnProperty.call(host, "registerSceneImpl"), false, tag); assert.equal(d, undefined, tag); assert.equal(host.overlayHook, undefined, tag); }
    if (mode === "shots-throws") assert.deepEqual(log.filter((x) => x.startsWith("dispose")), ["dispose:I2", "dispose:I1"], tag);   // initialized scenes released
  }
  const log = [], h = stubHost(); await PH.installProduction(h, PROD, { loaders: modLoaders(log) }); assert.equal(h.calls.length, 1);   // success path still installs
});
await check("host", "failed-install cleanup at the addEventListener stage (after scene init)", "A late failure leaves no stale host.PRODUCTION, restores registration hook, removes layer, disposes created dispatcher and initialized scenes, keeps pre-existing state", async () => {
  const sentinel = () => {}, prior = { prior: true };
  for (const pre of [false, true]) {
    const log = [], host = stubHost(); let removed = 0;
    host.addEventListener = () => { throw new Error("listener refused"); }; host.removeEventListener = () => { removed++; };
    let before = null; if (pre) { host.registerSceneImpl = sentinel; host.PRODUCTION = undefined; D.installOverlayDispatcher(host).addLayer({ id: "keep", order: 5, draw() {} }); before = D.getOverlayDispatcher(host); }
    await assert.rejects(() => PH.installProduction(host, PROD, { loaders: modLoaders(log) }), /listener refused/);
    const tag = pre ? "pre" : "fresh", d = D.getOverlayDispatcher(host);
    assert.equal(Object.prototype.hasOwnProperty.call(host, "PRODUCTION"), pre, tag); assert.equal(host.PRODUCTION, undefined, tag);
    assert.equal(host.calls.length, 0, tag); assert.equal(host.PRODUCTION_ERROR.message, "listener refused", tag);
    assert.deepEqual(log.filter((x) => x.startsWith("dispose")), ["dispose:I2", "dispose:I1"], tag); assert.equal(removed, 0, tag);   // listener never registered: nothing to remove
    if (pre) { assert.equal(host.registerSceneImpl, sentinel); assert.equal(d, before); assert.equal(d.disposed, false); assert.deepEqual(d.layerIds(), ["keep"]); }
    else { assert.equal(Object.prototype.hasOwnProperty.call(host, "registerSceneImpl"), false); assert.equal(d, undefined); }
    const retry = await PH.installProduction(host, PROD, { loaders: modLoaders([]), }).catch((e) => e); assert.match(String(retry.message), /listener refused/);   // a retry reaches the same stage, not "already installed"
  }
  const h = stubHost({ PRODUCTION: prior }); await assert.rejects(() => PH.installProduction(h, PROD, { loaders: modLoaders([]) }), /already installed/); assert.equal(h.PRODUCTION, prior);
  // listener registered, then a later stage fails: it is removed again
  const host2 = stubHost(); let added = 0, rem = 0; host2.addEventListener = () => { added++; }; host2.removeEventListener = () => { rem++; }; host2.shots = () => { throw new Error("shots refused"); };
  await assert.rejects(() => PH.installProduction(host2, PROD, { loaders: modLoaders([]) }), /shots refused/); assert.deepEqual([added, rem, host2.PRODUCTION], [1, 1, undefined]);
});
await check("host", "browser loaders against fakes: classic script, ES module, cues, font, assets", "URL resolution against the config URL; script/FontFace/Image paths work with fake DOM objects; real ES-module import of the example scene", async () => {
  const urls = [], head = { appendChild: (s) => { urls.push(s.src); queueMicrotask(() => s.src.endsWith("missing.js") ? s.onerror() : s.onload()); } };
  const fonts = []; const host = { document: { createElement: () => ({}), head, fonts: { add: (f) => fonts.push(f) } },
    FontFace: class { constructor(f, src, d) { this.f = f; this.src = src; this.d = d; } async load() { return this; } }, Image: class { async decode() {} set src(v) { this.u = v; } get src() { return this.u; } } };
  const cfgUrl = pathToFileURL(path.join(EX, "config.js")).href, L = PPH(host, cfgUrl);
  function PPH(h, u) { return PH.browserLoaders(h, u); }
  await L.loadModule({ id: "palette", src: "scenes/palette.js", type: "classic" }); assert.ok(urls[0].endsWith("/examples/neutral-production/scenes/palette.js"));
  await assert.rejects(() => L.loadModule({ id: "x", src: "missing.js", type: "classic" }), /failed to load/);
  const mod = await L.loadModule({ id: "scene-b", src: "scenes/scene-b.mjs", type: "module" }); assert.equal(typeof mod.scenes["critter-hop"].overlay, "function");
  await L.loadFont({ face: { family: "F", weight: "700", unicodeRange: "U+0000-00FF" }, src: "../fonts/f.woff2" }); assert.equal(fonts[0].d.weight, "700"); assert.ok(fonts[0].src.includes("/examples/fonts/f.woff2"));
  assert.equal((await L.loadAsset({ id: "i", src: "i.png", assetKind: "image" })).src.endsWith("/neutral-production/i.png"), true); assert.equal((await L.loadAsset({ id: "o", src: "o.glb", assetKind: "other" })).url.endsWith("o.glb"), true);
});

// ============================================================ 5. R06 critter adapter
const orig = () => {   // the pinned R06 text, executed as-is (no try/finally), with its own core.mjs helpers
  const RL = path.join(KIT, "repository-downloads/buildwithhanif/claude-animation-skill/plugins/claude-animation/skills/claude-animation/lib");
  const core = read(path.join(RL, "core.mjs")).replace(/^import .*$/m, "").replace(/^export \{.*\};$/m, "").replace(/^export /gm, "");
  const crit = read(path.join(RL, "rigs/critter.mjs")).replace(/^import .*$/m, "").replace(/^export /gm, "");
  return new Function(core + "\n" + crit + "\nreturn critter;")();
};
const POSES = [{}, { gait: 1.3 }, { gait: 2.2, sq: 1.2, face: "happy", t: 0.4 }, { punch: 1, punchBack: 0.5, arms: "guard", face: "angry" }, { kick: 0.8, face: "focus" }, { air: true, rot: 1.2, face: "surprised", flip: true },
  { crouch: 1, aura: 0.7, t: 1.1, color: "#3366CC" }, { flash: 0.6, face: "hurt", arms: "up", sq: 0.8 }, { face: "blink", color: "#88AA44", aura: 1, punch: 0.4 }];
await check("critter", "adapted critter = pinned text on the success path (recorded Canvas traces)", "For 9 poses incl. kick, aura, flash, rotation, flip the adapter issues the identical Canvas call/property sequence as the unmodified R06 critter", () => {
  const O = orig(); let calls = 0;
  for (const pose of POSES) { const a = recordingContext(), b = recordingContext(); O(a, 540, 1500, 2.2, pose); CR.critter(b, 540, 1500, 2.2, pose); assert.deepEqual(b.__trace, a.__trace, JSON.stringify(pose)); assert.equal(b.__depth, 0); calls += a.__trace.length; }
  return { poses: POSES.length, canvasCalls: calls };
});
await check("critter", "exception safety: a throwing draw call restores save depth and transform", "try/finally adaptation: every injected failure point leaves depth 0 and the host matrix; the unadapted original leaks", () => {
  const O = orig(), pose = { gait: 1, aura: 0.5, punch: 1, flash: 0.5, face: "angry", rot: 0.3, kick: 0 };
  const total = (() => { const r = recordingContext(); CR.critter(r, 0, 0, 1, pose); return r.__trace.length; })(); let leaks = 0, tried = 0;
  for (const method of ["fill", "stroke", "fillRect", "ellipse"]) {
    const nth = (() => { const r = recordingContext(); CR.critter(r, 0, 0, 1, pose); return r.__trace.filter((c) => c[0] === method).length; })();
    for (let n = 1; n <= nth; n += Math.max(1, Math.floor(nth / 6))) {
      for (const [fn, isAdapted] of [[CR.critter, true], [O, false]]) {
        const ctx = recordingContext({ matrix: [2, 0, 0, 2, 5, 7] }); let k = 0; const real = ctx[method]; const proxy = new Proxy(ctx, { get(t, key) { if (key === method) return (...a) => { if (++k === n) throw new Error("inject"); return real(...a); }; return t[key]; }, set(t, key, v) { t[key] = v; return true; } });
        try { fn(proxy, 10, 20, 1.5, pose); } catch (e) { assert.match(e.message, /inject/); }
        if (isAdapted) { assert.equal(ctx.__depth, 0, `${method}#${n}`); assert.deepEqual(ctx.__matrix, [2, 0, 0, 2, 5, 7]); tried++; } else if (ctx.__depth !== 0) leaks++;
      }
    }
  }
  assert.ok(leaks > 0, "baseline: original leaks save depth on the same failures"); return { total, injections: tried, originalLeakingRuns: leaks };
});
await check("critter", "pose track: interpolation, holds, closed-form gait, arbitrary-time purity, validation", "poseAt is a pure function of scene-local time; keyframe rules are exactly as documented", () => {
  const rig = CR.createCritterRig({ gaitRate: 10, poseTrack: [{ t: 1, face: "focus", crouch: 0, run: true }, { t: 3, crouch: 1, face: "happy", run: false, sq: 2 }, { t: 5, crouch: 0 }] });
  assert.equal(rig.poseAt(0).crouch, 0); assert.equal(rig.poseAt(0).face, "focus"); assert.equal(rig.poseAt(0).gait, 10 * 0);
  assert.equal(rig.poseAt(2).crouch, 0.5); assert.equal(rig.poseAt(3).crouch, 1); assert.equal(rig.poseAt(3).face, "happy"); assert.equal(rig.poseAt(3).gait, undefined); assert.equal(rig.poseAt(9).crouch, 0); assert.equal(rig.poseAt(1.5).gait, 15);
  assert.equal(rig.poseAt(4).sq, 2); assert.equal(rig.poseAt(2.9).face, "focus"); assert.equal(rig.poseAt(2).t, 2);
  const order = [4.2, 0.1, 3.3, 2.2, 4.2], first = order.map((t) => JSON.stringify(rig.poseAt(t))); assert.equal(first[0], first[4]); assert.deepEqual(order.slice().reverse().reverse().map((t) => JSON.stringify(rig.poseAt(t))), first);
  const draw = (t) => { const c = recordingContext(); rig.draw(c, { localT: t }, { x: (s) => 100 + s.localT, groundY: 900, scale: 2 }); return c.__trace; };
  assert.deepEqual(draw(2.2), draw(2.2)); assert.notDeepEqual(draw(2.2), draw(2.4));
  for (const [bad, re] of [[[], /non-empty/], [[{ t: 1 }, { t: 1 }], /ascending/], [[{ t: 0, nope: 1 }], /unknown pose key/], [[{ t: 0, face: "grumpy" }], /face/], [[{ t: 0, color: "red" }], /color/], [[{ t: NaN }], /finite/], [[{ t: 0, sq: Infinity }], /finite/]]) throwsMsg(() => CR.createCritterRig({ poseTrack: bad }), re);
  throwsMsg(() => rig.poseAt(NaN), /finite/);
});
await check("critter", "no hidden state or randomness in the adapter", "Static source scan of the adapter and production modules", () => {
  for (const f of ["adapters/r06-critter-rig.mjs", "production/scene-runtime.mjs", "production/cue-schema.mjs", "production/manifest.mjs", "production/production-host.mjs"]) {
    const src = read(path.join(LIB, f)).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""); assert.ok(!/\brandom\(|Date\.now|performance\.now|node:|require\(|@napi-rs|document\.write/.test(src), f);
  }
});

// ============================================================ 6. identity, CLI plan, fonts
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sal-prod-"));
const mkProd = (name, cfg, files) => { const d = path.join(tmp, name); fs.mkdirSync(d, { recursive: true }); for (const [f, c] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(d, f)), { recursive: true }); fs.writeFileSync(path.join(d, f), c); } fs.writeFileSync(path.join(d, "config.js"), `const PROJECT = ${JSON.stringify(cfg)};`); return d; };
const ident = (d, cfg) => CI.computeIdentity({ entryPath: path.join(d, "studio.html"), root: d, project: normalizeProject(cfg), configDir: d, output: { jpegQuality: 0.94 } });
await check("identity", "declared modules, cue module, assets and fonts participate in cache identity", "Editing any declared file (or an ES module it imports) changes the identity; a missing declared file is an explicit error", () => {
  const cfg = { productionId: "idt", duration: 6, modules: [{ id: "m", src: "m.mjs", type: "module" }, { id: "n", src: "n.js" }], scenes: [{ id: "s", start: 0, end: 6 }], cues: { module: "cues.mjs" }, assets: [{ id: "a", src: "a.png", kind: "image" }, "raw.bin"], fonts: [{ family: "F", src: "f.woff2" }] };
  const files = { "studio.html": '<script src="config.js"></script>', "m.mjs": 'import "./dep.mjs"; export const scenes = {};', "dep.mjs": "export const d = 1;", "n.js": "1;", "cues.mjs": "export default {entries: []};", "a.png": "A", "raw.bin": "R", "f.woff2": "F" };
  const d = mkProd("ident", cfg, files), base = ident(d, cfg).identity; assert.equal(ident(d, cfg).identity, base);
  for (const f of ["m.mjs", "dep.mjs", "n.js", "cues.mjs", "a.png", "raw.bin", "f.woff2"]) { const old = read(path.join(d, f)); fs.writeFileSync(path.join(d, f), old + "\n//x"); assert.notEqual(ident(d, cfg).identity, base, f); fs.writeFileSync(path.join(d, f), old); }
  assert.equal(ident(d, cfg).identity, base);
  assert.notEqual(ident(d, { ...cfg, scenes: [{ id: "s", start: 0, end: 6, params: { x: 1 } }] }).identity, base); assert.notEqual(ident(d, { ...cfg, productionId: "idt2" }).identity, base);
  fs.rmSync(path.join(d, "n.js")); throwsMsg(() => ident(d, cfg), /referenced file is missing/); fs.writeFileSync(path.join(d, "n.js"), "1;"); fs.rmSync(path.join(d, "f.woff2")); throwsMsg(() => ident(d, cfg), /declared fonts file is missing/);
  const decl = MF.declaredFiles(normalizeProject(cfg)); assert.deepEqual(decl.map((x) => x.kind), ["module", "module", "cues", "asset", "asset", "font"]);
});
await check("cli", "render.mjs --plan on the neutral example (no Chrome, no ffmpeg, no media)", "The real driver normalizes the example, resolves declared files and reports an identity whose closure includes the runtime-loaded scene modules and the critter adapter", () => {
  const out = execFileSync(process.execPath, [path.join(LIB, "base/render.mjs"), `--root=${EX}`, "--plan"], { encoding: "utf8", cwd: tmp });
  const j = JSON.parse(out); assert.equal(j.project.productionId, "neutral-example"); assert.equal(j.project.scenes.length, 2); assert.match(j.identity, /^[0-9a-f]{64}$/); assert.equal(j.plan.frameCount, 192);
  const again = JSON.parse(execFileSync(process.execPath, [path.join(LIB, "base/render.mjs"), `--root=${EX}`, "--plan"], { encoding: "utf8", cwd: tmp })); assert.equal(again.identity, j.identity);
  const cfgSrc = read(path.join(EX, "config.js")); const bad = path.join(tmp, "badprod"); fs.mkdirSync(bad); fs.copyFileSync(path.join(EX, "studio.html"), path.join(bad, "studio.html")); fs.writeFileSync(path.join(bad, "config.js"), cfgSrc.replace("start: 3.5, end: 8", "start: 3.9, end: 8"));
  const r = spawnSync(process.execPath, [path.join(LIB, "base/render.mjs"), `--root=${bad}`, "--plan"], { encoding: "utf8", cwd: tmp }); assert.equal(r.status, 1); assert.match(r.stderr, /gap 3\.5\.\.3\.9s/);
  const ci = CI.computeIdentity({ entryPath: path.join(EX, "studio.html"), root: EX, project: normalizeProject(exampleConfig()), configDir: EX, output: { jpegQuality: 0.94 } });
  const names = ci.files.map((f) => f.path.split(path.sep).join("/")); for (const need of ["scenes/scene-a.js", "scenes/scene-b.mjs", "scenes/palette.js", "../../adapters/r06-critter-rig.mjs", "../../production/production-host.mjs", "../../production/scene-runtime.mjs"]) assert.ok(names.includes(need), need);
  return { identity12: j.identity.slice(0, 12), frames: j.plan.frameCount };
});
await check("cli", "shared Remotion entry --plan uses full audio, selected dimensions and frame quantization without browser/media", "Synthetic audio file paths and project configs traverse the real shared entry and Remotion planning path; no audio is decoded and no composition bundle, browser, still or video is produced", () => {
  const summaries = [];
  for (const [width, height, duration] of [[1080, 1350, 80.01], [1080, 1920, 80.02]]) {
    const cfg = { productionId: `remotion-plan-check-${height}`, renderEngine: "remotion", width, height, fps: 24, duration, sourceAudioOffsetSeconds: 0, audio: "public/song.wav",
      remotion: { scenes: "remotion/scenes.jsx", publicDir: "public" }, scenes: [{ id: "whole", start: 0, end: duration }], assets: [], fonts: [] };
    const d = mkProd(`remotion-plan-check-${height}`, cfg, { "remotion/scenes.jsx": "export const scenes = {};", "public/song.wav": "synthetic path fixture; never decoded", "public/README.txt": "synthetic plan fixture" });
    const out = execFileSync(process.execPath, [path.join(KIT, "shared-animation-library/render.mjs"), `--root=${d}`, "--plan"], { encoding: "utf8", cwd: tmp });
    const plan = JSON.parse(out);
    assert.equal(plan.engine, "remotion");
    assert.deepEqual([plan.project.width, plan.project.height, plan.project.fps, plan.project.durationSeconds], [width, height, 24, duration]);
    assert.equal(plan.export.frameCount, Math.ceil(duration * 24));
    assert.equal(plan.export.durationSeconds, Math.ceil(duration * 24) / 24);
    assert.ok(plan.export.frameQuantizationDifferenceSeconds >= 0 && plan.export.frameQuantizationDifferenceSeconds < 1 / 24);
    assert.equal(plan.audioDeclared, true);
    assert.equal(plan.export.audio.durationSeconds, duration);
    assert.equal(plan.export.audioVideoEndpointDifferenceSeconds, plan.export.durationSeconds - duration);
    assert.match(plan.note, /Plan only: no browser, still, frame, or video was rendered\./i);
    summaries.push({ dimensions: `${width}x${height}`, audioSeconds: plan.export.audio.durationSeconds, frames: plan.export.frameCount, videoSeconds: plan.export.durationSeconds, endpointDifferenceSeconds: plan.export.audioVideoEndpointDifferenceSeconds });
  }
  const composition = read(path.join(LIB, "remotion-runtime/src/song-composition.jsx"));
  assert.match(composition, /durationInFrames=\{audioDurationInFrames\(project, durationInFrames\)\}/);
  const entry = read(path.join(LIB, "remotion-runtime/src/entry.jsx")); assert.match(entry, /calculateMetadata=\{\(\{ props \}\) => metadataFromProject\(props\.project\)\}/);
  return { engine: "remotion", plans: summaries };
});
await check("fonts", "Fontsource helper against the recorded local install (declaration only)", "Package CSS parsed; subset/weight resolve to existing woff2 files; entries pass normalizeProject and hash into identity; glyph coverage NOT checked", () => {
  const pk = path.join(KIT, "repository-preparation/additional-resources/javascript/node_modules/@fontsource");
  const faces = FS.fontsourceFaces({ packagesDir: pk, pkg: "inter", weight: 700, subsets: ["latin", "latin-ext"], configDir: EX });
  assert.equal(faces.length, 2); for (const f of faces) { assert.equal(f.family, "Inter"); assert.match(f.unicodeRange, /^U\+/); const abs = path.resolve(EX, f.src); assert.ok(fs.existsSync(abs)); assert.equal(fs.readFileSync(abs).subarray(0, 4).toString("latin1"), "wOF2"); }
  assert.ok(faces[0].unicodeRange.includes("U+0000-00FF"));
  const cfg = { productionId: "fonts", duration: 6, scenes: [{ id: "s", start: 0, end: 6 }], fonts: faces }; const n = normalizeProject(cfg); assert.equal(n.fonts.length, 2);
  const d = mkProd("fonts", cfg, { "studio.html": '<script src="config.js"></script>' }); const rel = faces.map((f) => ({ ...f, src: path.relative(d, path.resolve(EX, f.src)).split(path.sep).join("/") }));
  const id = CI.computeIdentity({ entryPath: path.join(d, "studio.html"), root: d, project: normalizeProject({ ...cfg, fonts: rel }), configDir: d, output: {} }); assert.equal(id.assets.length, 2);
  assert.throws(() => FS.fontsourceFaces({ packagesDir: pk, pkg: "inter", weight: 700, subsets: ["klingon"], configDir: EX }), /no "klingon" subset/); assert.throws(() => FS.fontsourceFaces({ packagesDir: pk, pkg: "inter", weight: 123, configDir: EX }), /not found/);
  return { family: "Inter 700", subsets: faces.map((f) => f.subset) };
});
await check("syntax", "node --check on every new/changed library file", "New modules and the edited classic script parse", () => {
  const files = ["base/src/project-config.js", "export/export-plan.mjs", "export/cache-identity.mjs", "production/manifest.mjs", "production/scene-runtime.mjs", "production/cue-schema.mjs", "production/production-host.mjs", "production/fontsource.mjs", "adapters/r06-critter-rig.mjs",
    "examples/neutral-production/config.js", "examples/neutral-production/scenes/palette.js", "examples/neutral-production/scenes/scene-a.js", "examples/neutral-production/scenes/scene-b.mjs", "tests/verify-production.mjs"];
  for (const f of files) execFileSync(process.execPath, ["--check", path.join(LIB, f)]); return { files: files.length };
});
fs.rmSync(tmp, { recursive: true, force: true });

const summary = { generated: "2026-10-25", node: process.version, checks: results.length, passed: results.length - failed, failed, results };
fs.writeFileSync(path.join(LIB, "tests/verify-production-results.json"), JSON.stringify(summary, null, 1) + "\n");
for (const r of results) console.log(`${r.status}  [${r.group}] ${r.name}${r.error ? "\n      " + r.error : ""}`);
console.log(`\n${summary.passed}/${summary.checks} passed`); process.exit(failed ? 1 : 0);
