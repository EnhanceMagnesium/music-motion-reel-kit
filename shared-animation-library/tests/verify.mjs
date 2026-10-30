// verify.mjs — non-rendering verification of the derived shared library. No browser, no pixels, no media.
//   node shared-animation-library/tests/verify.mjs   -> writes tests/verify-results.json, exit 1 on any failure.
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm"; import crypto from "node:crypto";
import assert from "node:assert/strict"; import { fileURLToPath, pathToFileURL } from "node:url"; import { execFileSync } from "node:child_process";
import { recordingContext } from "./recording-context.mjs";
import normalizeProject from "../base/src/project-config.js";   // CommonJS classic script: the SAME function the page and render.mjs run

const LIB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const KIT = path.dirname(LIB);
const results = []; let failed = 0;
const check = async (group, name, establishes, fn) => { try { const detail = await fn(); results.push({ group, name, status: "PASS", establishes, detail }); } catch (e) { failed++; results.push({ group, name, status: "FAIL", establishes, error: String(e && e.stack || e) }); } };
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const read = (p) => fs.readFileSync(p, "utf8");
const DL = path.join(KIT, "repository-downloads"), CAND = path.join(KIT, "compatibility-preparation/candidate-sources");
const R06 = "buildwithhanif/claude-animation-skill/plugins/claude-animation/skills/claude-animation/lib";

const num = await import(pathToFileURL(path.join(LIB, "numeric/numeric.mjs")));
const tb = await import(pathToFileURL(path.join(LIB, "numeric/timebase.mjs")));
const P = await import(pathToFileURL(path.join(LIB, "adapters/r06-burst-particles.mjs")));
const D = await import(pathToFileURL(path.join(LIB, "adapters/overlay-dispatcher.mjs")));
const H = await import(pathToFileURL(path.join(LIB, "adapters/host-integration.mjs")));

// ============================================================ 1. sources, hashes, syntax
await check("source", "staged manifest = original = staged hashes (all 26 records)", "Candidate copies are byte-identical to the pinned originals", () => {
  const m = JSON.parse(read(path.join(CAND, "STAGED_SOURCE_MANIFEST.json"))); let n = 0;
  for (const r of m.records) { const a = sha(r.staged), b = sha(r.original); assert.equal(a, r.sha256, r.staged); assert.equal(b, r.sha256, r.original); n++; } return { records: n };
});
await check("source", "verbatim library copies match staged hashes", "Adopted files that were NOT modified are byte-identical to the staged R02 files", () => {
  const verbatim = ["LICENSE", "README.md", "ANIMATION_GUIDE.md", "package.json", "package-lock.json", ".gitignore", "gpu_probe.mjs", "src/clawd.js", "src/timeline.js", "src/sheets.js", "src/karaoke.js", "src/scenes/demo.js", "docs/emotions.jpg", "docs/views.jpg"];
  for (const f of verbatim) assert.equal(sha(path.join(LIB, "base", f)), sha(path.join(CAND, "painted-base", f)), f); return { files: verbatim.length };
});
await check("source", "package.json and lock unchanged; installed deps match lock", "Original manifest/lock preserved; linked node_modules versions equal lock", () => {
  const lock = JSON.parse(read(path.join(LIB, "base/package-lock.json"))); const out = {};
  for (const [pk, want] of [["p5", "2.3.3"], ["p5.brush", "2.2.3"], ["puppeteer-core", "25.11.0"]]) { const inst = JSON.parse(read(path.join(LIB, "base/node_modules", pk, "package.json"))).version; assert.equal(inst, want); assert.equal(lock.packages["node_modules/" + pk].version, want); out[pk] = inst; } return out;
});
await check("source", "licenses present and byte-identical to originals", "R02 root MIT, R03 MIT, R06 MIT retained", () => {
  assert.equal(sha(path.join(LIB, "provenance/licenses/R06-LICENSE")), sha(path.join(DL, "buildwithhanif/claude-animation-skill/LICENSE")));
  assert.equal(sha(path.join(LIB, "base/LICENSE")), sha(path.join(CAND, "painted-base/LICENSE")));
  assert.equal(sha(path.join(LIB, "provenance/licenses/R03-LICENSE")), sha(path.join(CAND, "licenses/R03-LICENSE")));
  assert.equal(sha(path.join(LIB, "provenance/licenses/R02-root-LICENSE")), sha(path.join(CAND, "licenses/R02-root-LICENSE")));
});
await check("syntax", "node --check on every library .mjs/.js (non-HTML)", "All derived JavaScript parses", () => {
  const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === "node_modules") continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(mjs|js)$/.test(e.name)) files.push(p); } })(LIB);
  for (const f of files) execFileSync(process.execPath, ["--check", f]); return { files: files.length };
});

// ============================================================ 2. load graph, paths, dimensions
const scriptSrcs = (html) => [...html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
await check("graph", "portrait entry: ordered classic scripts all exist, order preserved", "Complete ordered global-script graph resolves (incl. linked p5/p5.brush)", () => {
  const dir = path.join(LIB, "base"), s = scriptSrcs(read(path.join(dir, "studio.html")));
  assert.deepEqual(s, ["node_modules/p5/lib/p5.min.js", "node_modules/p5.brush/dist/p5.brush.js", "src/config.js", "src/project-config.js", "src/core.js", "src/clawd.js", "src/timeline.js", "src/sheets.js"]);
  for (const f of s) assert.ok(fs.existsSync(path.join(dir, f)), f); assert.ok(read(path.join(dir, "studio.html")).includes("../adapters/host-integration.mjs")); assert.ok(fs.existsSync(path.join(LIB, "adapters/host-integration.mjs"))); return s;
});
await check("graph", "landscape example: authored order incl. demo, paths resolve", "Landscape example kept loadable in authored 1920x1080", () => {
  const dir = path.join(LIB, "base/examples/landscape"), s = scriptSrcs(read(path.join(dir, "studio.html")));
  assert.deepEqual(s.map((x) => x.replace("../../", "")), ["node_modules/p5/lib/p5.min.js", "node_modules/p5.brush/dist/p5.brush.js", "config.js", "src/project-config.js", "src/core.js", "src/clawd.js", "src/timeline.js", "src/sheets.js", "src/scenes/demo.js"]);
  for (const f of s) assert.ok(fs.existsSync(path.join(dir, f)), f); return s;
});
await check("graph", "browser module graph free of Node/native/p5/random", "Adapters/numeric have no node:, @napi-rs/canvas, p5 or Math.random references; every relative import resolves", () => {
  const files = ["numeric/numeric.mjs", "numeric/timebase.mjs", "adapters/r06-burst-particles.mjs", "adapters/overlay-dispatcher.mjs", "adapters/host-integration.mjs"]; const graph = {};
  for (const f of files) { const src = read(path.join(LIB, f)).replace(/\/\/.*$/gm, ""); assert.ok(!/node:|@napi-rs|createCanvas|Path2D|\brequire\(|\brandom\(|randomSeed|noiseSeed|\bp5\b|document\.|Date\.now/.test(src), f);
    graph[f] = [...src.matchAll(/(?:import|from)\s*["'](\.[^"']+)["']/g)].map((m) => m[1]); for (const i of graph[f]) assert.ok(fs.existsSync(path.join(LIB, path.dirname(f), i)), `${f} -> ${i}`); }
  return graph;
});
const evalProject = (p) => vm.runInNewContext(read(p) + "\n;PROJECT");
await check("config", "dimension propagation: config -> core W/H -> #out -> CSS ratio -> viewport", "One PROJECT source drives core.js, sizing script and render.mjs viewport; portrait default 1080x1920; landscape example 1920x1080", () => {
  const pc = evalProject(path.join(LIB, "base/src/config.js")), lc = evalProject(path.join(LIB, "base/examples/landscape/config.js"));
  assert.deepEqual([pc.width, pc.height, pc.fps], [1080, 1920, 24]); assert.deepEqual([lc.width, lc.height], [1920, 1080]);
  const core = read(path.join(LIB, "base/src/core.js")); assert.ok(/const CFG = normalizeProject\(PROJECT\);/.test(core) && /const W = CFG\.width, H = CFG\.height;/.test(core) && /DUR = CFG\.duration/.test(core)); assert.ok(!/=\s*1920|1080\s*;/.test(core.replace(/\/\/.*$/gm, "")));
  const w = vm.runInNewContext(`${read(path.join(LIB, "base/src/project-config.js"))}\n;const PROJECT=${JSON.stringify(pc)}; const CFG = normalizeProject(PROJECT); const W = CFG.width, H = CFG.height; [W,H]`, {}); assert.equal(JSON.stringify(w), "[1080,1920]");
  for (const f of ["studio.html", "examples/landscape/studio.html"]) { const h = read(path.join(LIB, "base", f)); assert.ok(h.includes("o.style.aspectRatio = w + ' / ' + h")); assert.ok(!/aspect-ratio:\s*16/.test(h)); }
  const r = read(path.join(LIB, "base/render.mjs")); assert.ok(r.includes("--window-size=${VIEW_W},${VIEW_H}") && r.includes("defaultViewport: { width: VIEW_W") && !/1920,1080/.test(r) && r.includes("pathToFileURL(ENTRY)") && r.includes("normalizeProject"));
  // the render driver's own config-derivation expressions, run on both entries
  const derive = (entry) => { const E = path.resolve(LIB, "base", entry), src = read(E).match(/<script[^>]+src="([^"]*config\.js)"/)[1]; const c = normalizeProject(evalProject(path.resolve(path.dirname(E), src))); return [c.width, c.height]; };
  assert.deepEqual(JSON.stringify(derive("studio.html")), "[1080,1920]"); assert.deepEqual(JSON.stringify(derive("examples/landscape/studio.html")), "[1920,1080]");
  return { portrait: [pc.width, pc.height], landscape: [lc.width, lc.height] };
});
await check("config", "readiness hook: core.js awaits READY_PROMISES; overlayHook retained", "R02 additions (EXTRA_FONTS, overlayHook) intact; adapter load is part of readiness", () => {
  const c = read(path.join(LIB, "base/src/core.js")); assert.ok(c.includes("...(window.READY_PROMISES || [])") && c.includes("window.EXTRA_FONTS") && c.includes("window.overlayHook(c, t)") && c.indexOf("READY_PROMISES") < c.indexOf("window.ready = true"));
});
await check("config", "core.js differs from staged R02 only in the documented edits (CFG-based W/H/timing, READY_PROMISES)", "Derivation is limited and diff-auditable", () => {
  const a = read(path.join(CAND, "painted-base/src/core.js")).split("\n"), b = read(path.join(LIB, "base/src/core.js")).split("\n");
  const removed = a.filter((l) => !b.includes(l)); assert.equal(removed.length, 3, "W/H line, BPM/OFF/DUR line and the font-load line are replaced");
  assert.ok(removed.some((l) => /const W = 1920/.test(l)) && removed.some((l) => /PROJECT\.bpm/.test(l)) && removed.some((l) => /document\.fonts\.load\('100px/.test(l))); return { addedLines: b.length - a.length };
});

// ============================================================ 3. numeric helpers vs original source
const isolate = (source, names, prelude = "") => vm.runInNewContext(`${prelude}\n${source.replace(/\bexport /g, "")}\n({${names.join(",")}})`, { Math });
const r03 = isolate(read(path.join(DL, "lemomo-ai/lemo-opuscar/core/lib.js")), ["clamp", "lerp", "seg", "ss", "ei", "eo", "eio", "back", "mulberry", "hash", "vnoise", "TAU"]);
const reel = read(path.join(DL, "tuzhechen2005/opus-video-skills/skills/kinetic-reel/template/reel/reel.js"));
const r02 = isolate(reel.split("// ---------- math ----------")[1].split("// ---------- canvases ----------")[0] + "\n" + reel.match(/const easeInOut =[^\n]+/)[0] + "\n" + reel.match(/const ioExpo =[^\n]+/)[0], ["clamp", "lerp", "seg", "ease", "easeOut", "easeIn", "expoOut", "backOut", "hash", "beatPulse", "TAU", "easeInOut"], "const BEAT = 60 / 120;");
const paintedCore = read(path.join(DL, "tuzhechen2005/opus-video-skills/skills/painted-animation/template/src/core.js"));
const r02p = isolate(paintedCore.match(/const clamp =[^\n]+/)[0] + "\n" + paintedCore.match(/const backOut =[^\n]+/)[0], ["backOut"]);
const core06 = read(path.join(DL, R06, "core.mjs"));
const r06 = isolate(core06.split("// ------------------------------------------------------------------ numbers")[1].split("// ------------------------------------------------------------------ canvas helpers")[0], ["clamp", "lerp", "ss", "hash", "rng", "noise1", "eOut", "eIn", "eIO", "eExpo", "eBack"]);
const { exposure: exp06 } = isolate(read(path.join(DL, R06, "film.mjs")).match(/export function exposure\([\s\S]+?\n}/)[0], ["exposure"]);
await check("numeric", "common + variant helpers equal original sources on sampled inputs (6001 samples, Object.is)", "For the aliases compared here (all except r02.beatPulse, checked separately), derived results are identical under Object.is -- NaN-for-NaN, no +0/-0 difference -- on 6001 samples in [-1,2] (plus the stated window/seed probes); this is sampled evidence, not a proof for all doubles", () => {
  let n = 0; const ex = (a, b, m) => { assert.ok(Object.is(a, b), `${m}: ${a} vs ${b}`); n++; };   // Object.is: NaN equals NaN, +0 differs from -0
  for (let i = -2000; i <= 4000; i++) { const x = i / 2000;
    for (const [d, o] of [[num.r03, r03], [num.r02, r02], [num.r06, r06]]) { ex(d.clamp(x), o.clamp(x), "clamp"); ex(d.lerp(-3, 9, x), o.lerp(-3, 9, x), "lerp"); ex(d.hash(x * 100), o.hash(x * 100), "hash"); }
    ex(num.r03.seg(x, .2, .8), r03.seg(x, .2, .8), "r03.seg"); ex(num.r02.seg(x, .2, .8), r02.seg(x, .2, .8), "r02.seg");
    ex(num.r03.ss(x), r03.ss(x), "r03.ss"); ex(num.r02.ease(x), r02.ease(x), "r02.ease"); ex(num.r06.ss(0, 1, x), r06.ss(0, 1, x), "r06.ss"); ex(num.r06.ss(.2, .9, x), r06.ss(.2, .9, x), "r06.ss win");
    ex(num.r03.eo(x), r03.eo(x), "eo"); ex(num.r02.easeOut(x), r02.easeOut(x), "easeOut"); ex(num.r06.eOut(x), r06.eOut(x), "eOut");
    ex(num.r03.ei(x), r03.ei(x), "ei"); ex(num.r02.easeIn(x), r02.easeIn(x), "easeIn"); ex(num.r06.eIn(x), r06.eIn(x), "eIn");
    ex(num.r03.eio(x), r03.eio(x), "eio"); ex(num.r02.easeInOut(x), r02.easeInOut(x), "easeInOut"); ex(num.r06.eIO(x), r06.eIO(x), "eIO");
    ex(num.r02.expoOut(x), r02.expoOut(x), "r02 expo"); ex(num.r06.eExpo(x), r06.eExpo(x), "r06 expo");
    ex(num.r02.backOut(x), r02.backOut(x), "r02 back"); ex(num.r02.paintedBackOut(x), r02p.backOut(x), "painted back");
    ex(num.r03.back(x), r03.back(x), "r03 back"); ex(num.r03.back(x, 2.2), r03.back(x, 2.2), "r03 back s"); ex(num.r06.eBack(x), r06.eBack(x), "r06 back"); ex(num.r06.eBack(x, 2.6), r06.eBack(x, 2.6), "r06 back s");
    ex(num.r03.vnoise(x * 7), r03.vnoise(x * 7), "vnoise"); ex(num.r06.noise1(x * 7), r06.noise1(x * 7), "noise1");
    ex(num.smoothstep(x), r03.ss(x), "common ss"); ex(num.smoothstepWindow(.2, .9, x), r06.ss(.2, .9, x), "common window"); ex(num.expoOut(x), r06.eExpo(x), "common expo"); }
  assert.equal(num.TAU, r03.TAU); assert.equal(num.TAU, r02.TAU);
  assert.notEqual(num.r02.backOut(.5), num.r03.back(.5)); assert.notEqual(num.r02.backOut(.5), num.r02.paintedBackOut(.5));
  assert.ok(Number.isNaN(num.seg(1, 1, 1)) && Number.isNaN(num.smoothstepWindow(1, 1, 1)));
  return { exactAssertions: n };
});
await check("numeric", "RNG variants: Park–Miller (seed normalisation, degenerate) and Mulberry32 equal originals", "Seeds incl. 0, negatives, fractions, 2^31-1 behave exactly as R06/R03; algorithms stay distinct", () => {
  let n = 0;
  for (const s of [1, 7, 0, -5, 2.7, 977, 1e9, 4294967294, 2147483647, 2147483648]) { const a = num.r06.rng(s), b = r06.rng(s); for (let i = 0; i < 1000; i++) { assert.equal(a(), b()); n++; } }
  for (const s of [1, 7, 0, -5, 123456789, 2 ** 31, 2 ** 32 + 5]) { const a = num.r03.mulberry(s), b = r03.mulberry(s); for (let i = 0; i < 1000; i++) { assert.equal(a(), b()); n++; } }
  assert.equal(num.r06.rng(2147483647)(), 0); assert.ok(num.parkMillerIsDegenerate(2147483647) && num.parkMillerIsDegenerate(2 * 2147483647) && !num.parkMillerIsDegenerate(0));
  assert.notEqual(num.r03.mulberry(7)(), num.r06.rng(7)()); return { draws: n };
});
await check("numeric", "beatPulse remainder, exposure track semantics equal originals", "Negative-time beatPulse and R06 exposure (epsilon, hold, pre-first-entry) preserved", () => {
  for (let i = -400; i <= 800; i++) { const t = i / 100; assert.equal(num.beatPulseR02(t, .5), r02.beatPulse(t)); assert.equal(num.beatPulseR02(t, .5, 3), r02.beatPulse(t, 3)); }
  assert.equal(num.beatPulseR02(-.25, num.beatSeconds(120)), Math.exp(3.5));
  const tr = [{ at: 0, on: 2 }, { at: 4.5, on: 1 }, { at: 8, hold: true }]; for (let i = -50; i <= 5000; i++) { const t = i / 400; assert.equal(num.exposureR06(t, tr, 24), exp06(t, tr, 24)); }
  assert.equal(num.exposureR06(1 / 24 - 1e-9, [{ at: 0, on: 1 }], 24), 1 / 24); assert.equal(num.exposureR06(9, tr, 24), 8);
});
await check("numeric", "selected caller expectations (original closure uses)", "R06 burst helper clamp/rng closure equals numeric exports; timebase conversions behave as contract", () => {
  for (let i = -20; i <= 40; i++) assert.equal(num.clamp(i / 20), r06.clamp(i / 20)); const a = num.parkMiller(977 + 2400), b = r06.rng(977 + 2400); for (let i = 0; i < 100; i++) assert.equal(a(), b());
  assert.equal(tb.frameToVideoSeconds(36, 24), 1.5); assert.throws(() => tb.frameToVideoSeconds(-1, 24)); assert.throws(() => tb.frameToVideoSeconds(1.5, 24)); assert.throws(() => tb.frameToVideoSeconds(1, 0));
});

// ============================================================ 4. particles: original-source traces
const stripExports = (s) => s.replace(/^import .*$/gm, "").replace(/^export \{[^}]*\};?$/gm, "").replace(/\bexport (const|function|async function)/g, "$1");
const originalSrc = stripExports(read(path.join(DL, R06, "core.mjs"))) + "\n" + stripExports(read(path.join(DL, R06, "fx.mjs")));
const origSandbox = { Math, createCanvas() { throw new Error("native canvas must not be used"); }, Path2D: class {} };
const orig = vm.runInNewContext(`${originalSrc}\n({burstParticles, clamp, rng})`, origSandbox);
await check("particles", "original bytes: staged/repository R06 files hash-equal; verbatim kernel text matches", "The baseline is the actual pinned source and the adapter kernel text is its burstParticles body", () => {
  for (const f of ["core.mjs", "fx.mjs", "film.mjs"]) assert.equal(sha(path.join(CAND, "r06-original", f)), sha(path.join(DL, R06, f)));
  const fx = read(path.join(DL, R06, "fx.mjs")), kern = fx.slice(fx.indexOf("export function burstParticles"), fx.indexOf("// dust puff at the feet")).trim();
  const core = read(path.join(DL, R06, "core.mjs")), ad = read(path.join(LIB, "adapters/r06-burst-particles.mjs"));
  // the single documented adaptation, reversed textually: try-wrapped save/restore pairs -> original save/restore
  const undo = (t) => t.split("ctx.save(); try { ").join("ctx.save(); ").split("} finally { ctx.restore(); }").join("ctx.restore();");
  assert.ok(undo(ad).includes(kern), "kernel == pinned body after reversing the try/finally adaptation");
  for (const name of ["poly", "ellipse", "stroke", "fill", "line", "at"]) { const orig = core.split("\n").find((l) => l.startsWith(`export function ${name}(`)).replace("export ", ""); assert.ok(undo(ad).includes(orig), `helper ${name}`); }
  assert.ok(ad.includes("try {") && (ad.match(/finally \{ ctx\.restore\(\); \}/g) || []).length === 3);
  return { kernelChars: kern.length, adaptedPairs: 3 };
});
const KINDS = P.PARTICLE_KINDS, NONDEF = { n: 9, speed: 300, life: .9, gravity: 400, colors: ["#123456", "#abcdef"], size: 12, spread: 1.2, dir: -.5 };
const timesFor = (t0, life) => [t0 - .01, t0, t0 + .1, t0 + life, t0 + life * 1.6, t0 + life * 1.6 + .01];
const origTrace = (t, t0, x, y, o) => { const c = recordingContext(); orig.burstParticles(c, t, t0, x, y, o); return c.__trace; };
const layerTrace = (events, t, seed, off) => { const c = recordingContext(); P.createParticleLayer({ events, seed, sourceAudioOffsetSeconds: off }).draw({ ctx: c, videoSeconds: t, width: 1080, height: 1920 }); return c.__trace; };
await check("particles", "all 5 kinds x defaults/nondefaults x seeds x t0 x 6 times: adapter trace == original trace", "Adapter reproduces the original's complete Canvas call/state/gradient traces; active traces contain drawing geometry", () => {
  let cases = 0, active = 0; const drawn = new Set();
  for (const kind of KINDS) for (const base of [{}, NONDEF]) for (const seed of [undefined, 1, 7, 123456]) for (const t0 of [0, 2.4, 10.123]) {
    const opts = { ...base, kind, ...(seed === undefined ? {} : { seed }) }, life = opts.life ?? .6;
    for (const t of timesFor(t0, life)) {
      const a = origTrace(t, t0, 540, 960, opts), b = layerTrace([{ id: "e", atVideoSeconds: t0, x: 540, y: 960, options: opts }], t); assert.deepEqual(b, a, `${kind} seed=${seed} t0=${t0} t=${t}`); cases++;
      if (a.length) { active++; if (a.some(([n]) => ["stroke", "fill", "fillRect", "strokeRect"].includes(n))) drawn.add(kind); } } }
  assert.deepEqual([...drawn].sort(), [...KINDS].sort()); return { cases, activeNonEmpty: active, kindsWithGeometry: [...drawn] };
});
await check("particles", "inactive outside [at, at+1.6*life]; no calls before/after", "Lifetime window", () => {
  const ev = [{ id: "a", atVideoSeconds: 2, x: 100, y: 100, options: { life: .5, kind: "dust" } }];
  for (const t of [1.99, 2 + .5 * 1.6 + .001, 50]) assert.equal(layerTrace(ev, t).length, 0); assert.ok(layerTrace(ev, 2).length > 0 && layerTrace(ev, 2.1).length > 0);   // particles individually fade by their own life (0.6-1.2 x life), so the 1.6 x life bound is an upper limit
});
await check("particles", "derived event seeds: stable, order-free, equal to original given the derived seed", "deriveEventSeed(productionSeed,id) is documented and used; trace equals original run with that explicit seed", () => {
  const id = "hit-3", s = P.deriveEventSeed(42, id); assert.equal(s, P.deriveEventSeed(42, id)); assert.notEqual(s, P.deriveEventSeed(43, id)); assert.notEqual(s, P.deriveEventSeed(42, "hit-4")); assert.ok(s >= 1 && s <= 16777215);
  for (const kind of KINDS) { const o = { kind }; assert.deepEqual(layerTrace([{ id, atVideoSeconds: 1.25, x: 5, y: 6, options: o }], 1.4, 42), origTrace(1.4, 1.25, 5, 6, { ...o, seed: s })); }
  // no production seed -> R06 default seed 1
  assert.deepEqual(layerTrace([{ id, atVideoSeconds: 1.25, x: 5, y: 6, options: {} }], 1.4), origTrace(1.4, 1.25, 5, 6, {}));
  return { derivedSeed: s };
});
await check("particles", "order independence and seed sensitivity", "Same time/input => identical trace regardless of earlier evaluations or event input order; seeds change trajectories", () => {
  const ev = [0, 1, 2].map((i) => ({ id: "e" + i, atVideoSeconds: 1 + i * .15, x: 200 + i * 300, y: 900, options: { kind: KINDS[i], life: .7 } })), t = 1.5;
  const fresh = () => P.createParticleLayer({ events: ev, seed: 9 }), tr = (L, tt) => { const c = recordingContext(); L.draw({ ctx: c, videoSeconds: tt, width: 1080, height: 1920 }); return c.__trace; };
  const L1 = fresh(), ref = tr(fresh(), t); for (const o of [[3, 0.5, 1.2, 3], [3]]) { const L = fresh(); let last; for (const tt of o) last = tr(L, tt); assert.deepEqual(last, tr(fresh(), 3)); }
  const mid = tr(L1, t); tr(L1, 0.2); tr(L1, 9); assert.deepEqual(tr(L1, t), ref); assert.deepEqual(mid, ref);
  assert.deepEqual(tr(P.createParticleLayer({ events: [...ev].reverse(), seed: 9 }), t), ref);
  assert.notDeepEqual(layerTrace([{ id: "x", atVideoSeconds: 1, x: 1, y: 1, options: { seed: 1 } }], 1.2), layerTrace([{ id: "x", atVideoSeconds: 1, x: 1, y: 1, options: { seed: 2 } }], 1.2));
  assert.notDeepEqual(tr(P.createParticleLayer({ events: ev, seed: 9 }), t), tr(P.createParticleLayer({ events: ev, seed: 10 }), t)); return { calls: ref.length };
});
await check("particles", "cue conversion, frame time, portrait coordinates, shot-boundary tail", "source 12.4/offset 10 -> 2.4 and back; frame i = i/fps; native 1080x1920 coords unscaled; tail survives a shot boundary", () => {
  const v = tb.sourceToVideoSeconds(12.4, 10); assert.ok(Math.abs(v - 2.4) < 1e-12); assert.ok(Math.abs(tb.videoToSourceSeconds(v, 10) - 12.4) < 1e-12);
  const viaSource = layerTrace([{ id: "c", atSourceSeconds: 12.4, x: 1000, y: 1800, options: { kind: "confetti" } }], tb.frameToVideoSeconds(60, 24), undefined, 10);
  const viaVideo = layerTrace([{ id: "c", atVideoSeconds: v, x: 1000, y: 1800, options: { kind: "confetti" } }], 2.5); assert.deepEqual(viaSource, viaVideo); assert.deepEqual(viaVideo, origTrace(2.5, v, 1000, 1800, { kind: "confetti" })); assert.ok(viaVideo.length > 0);
  const xs = viaVideo.filter(([n]) => n === "translate").map(([, a]) => a); assert.ok(xs.every(([x, y]) => x > 0 && x < 2000 && y > 1000)); // portrait-region coordinates, not rescaled to 1920/1080
  const boundary = 2.5, ev = [{ id: "b", atVideoSeconds: 2, x: 540, y: 960, options: { life: .6 } }]; assert.ok(layerTrace(ev, boundary - .1).length > 0 && layerTrace(ev, boundary + .1).length > 0);
  assert.throws(() => P.createParticleLayer({ events: [{ id: "both", atVideoSeconds: 1, atSourceSeconds: 2, x: 0, y: 0 }] }));
});
await check("particles", "validation fails before any drawing; zero count is a no-op", "Invalid life/colors/NaN/duplicate ids/kind/etc. rejected at construction; invalid evaluation rejected with zero calls", () => {
  const E = (o, extra = {}) => ({ id: "v", atVideoSeconds: 1, x: 1, y: 1, options: o, ...extra }); const bad = [E({ life: 0 }), E({ life: -1 }), E({ colors: [] }), E({ colors: [""] }), E({ kind: "star" }), E({ n: 1.5 }), E({ n: -1 }), E({ speed: NaN }), E({ size: -1 }), E({ gravity: Infinity }), E({ dir: NaN }), E({ seed: 1.5 }), E({ colours: ["red"] }), E({}, { x: NaN }), E({}, { atVideoSeconds: NaN }), E({}, { id: "" }), E({ seed: 2147483647 }, { atVideoSeconds: 0 })];
  for (const e of bad) assert.throws(() => P.createParticleLayer({ events: [e] }), RangeError, JSON.stringify(e));
  assert.throws(() => P.createParticleLayer({ events: [E({}), E({})] }), /duplicate/);
  const L = P.createParticleLayer({ events: [E({ n: 0 }), { id: "ok", atVideoSeconds: 1, x: 1, y: 1 }] }); const c = recordingContext();
  for (const a of [{ videoSeconds: NaN, width: 1080, height: 1920 }, { videoSeconds: 1, width: 0, height: 1920 }, { videoSeconds: 1, width: 1080, height: NaN }]) assert.throws(() => L.draw({ ctx: c, ...a })); assert.equal(c.__trace.length, 0);
  const z = recordingContext(); P.createParticleLayer({ events: [E({ n: 0 })] }).draw({ ctx: z, videoSeconds: 1.2, width: 1080, height: 1920 }); assert.equal(z.__trace.length, 0); return { rejected: bad.length + 1 };
});

// ============================================================ 5. dispatcher / lifecycle
const sentinel = { globalAlpha: .3, globalCompositeOperation: "multiply", shadowBlur: 9, shadowOffsetX: 4, shadowColor: "red", filter: "blur(2px)", lineWidth: 7, strokeStyle: "#0f0", fillStyle: "#00f" };
await check("dispatcher", "ordering, forwarding, state reset per layer, restoration on success and injected failure", "Layers run particles-then-previous hook with the actual ctx/t; each sees reset state; host state restored even on throw", () => {
  const host = {}, calls = []; host.overlayHook = (c, t) => { calls.push(["previous", c, t, c.globalAlpha, c.globalCompositeOperation]); c.globalAlpha = .1; c.shadowBlur = 5; c.translate(7, 7); };
  const d = D.installOverlayDispatcher(host); d.addLayer({ id: "particles", order: D.PARTICLE_LAYER_ORDER, draw: (c, t) => { calls.push(["particles", c, t, c.globalAlpha, c.globalCompositeOperation]); c.globalAlpha = .5; c.rotate(1); } });
  assert.deepEqual(d.layerIds(), ["particles", "previous-hook"]);
  const c = recordingContext(sentinel); const m0 = [...c.__matrix]; host.overlayHook(c, 3.25);
  assert.deepEqual(calls.map((x) => x[0]), ["particles", "previous"]); for (const x of calls) { assert.equal(x[1], c); assert.equal(x[2], 3.25); assert.equal(x[3], 1); assert.equal(x[4], "source-over"); }
  for (const [k, v] of Object.entries(sentinel)) assert.equal(c.__store[k], v, k); assert.equal(c.__depth, 0); assert.deepEqual(c.__matrix, m0);
  assert.ok(!c.__trace.some(([n]) => /clearRect|drawImage|toDataURL|fillRect/.test(n)));   // never clears or replaces host output
  d.addLayer({ id: "boom", order: 15, draw: (cc) => { cc.globalAlpha = .9; cc.shadowBlur = 3; throw new Error("injected"); } });
  const c2 = recordingContext(sentinel); assert.throws(() => host.overlayHook(c2, 1), /injected/); for (const [k, v] of Object.entries(sentinel)) assert.equal(c2.__store[k], v, "after failure " + k);
  assert.equal(c2.__depth, 0);
  assert.throws(() => host.overlayHook(recordingContext(), NaN), RangeError);
  d.removeLayer("boom"); const c3 = recordingContext(sentinel); const before = calls.length; host.overlayHook(c3, 2); assert.equal(calls.length, before + 2); assert.equal(c3.__depth, 0);
});
await check("dispatcher", "duplicate install, duplicate layer id, dispose restores previous hook", "Single dispatcher per host; previous hook restored; stale wrapper stays safe", () => {
  const host = {}, prev = () => {}; host.overlayHook = prev; const d1 = D.installOverlayDispatcher(host), d2 = D.installOverlayDispatcher(host); assert.equal(d1, d2); assert.equal(host.overlayHook, d1.hook);
  d1.addLayer({ id: "x", order: 1, draw() {} }); assert.throws(() => d1.addLayer({ id: "x", order: 2, draw() {} }), /duplicate/);
  d1.dispose(); assert.equal(host.overlayHook, prev); assert.equal(d1.disposed, true); assert.throws(() => d1.addLayer({ id: "y", order: 1, draw() {} })); d1.dispose();
  const d3 = D.installOverlayDispatcher(host); assert.notEqual(d3, d1); assert.equal(host[Symbol.for("shared-animation-library.overlayDispatcher")], d3); d3.dispose();
  const empty = {}; const d4 = D.installOverlayDispatcher(empty); assert.ok("overlayHook" in empty); d4.dispose(); assert.ok(!("overlayHook" in empty));
  // third party wrapped us, then we dispose: do not clobber their hook; disposed dispatcher forwards to the previous hook
  const h = {}, seen = []; h.overlayHook = (c, t) => seen.push("prev"); const d5 = D.installOverlayDispatcher(h); const wrapper = (c, t) => { seen.push("wrap"); d5.hook(c, t); }; h.overlayHook = wrapper; d5.dispose(); assert.equal(h.overlayHook, wrapper); wrapper(recordingContext(), 1); assert.deepEqual(seen, ["wrap", "prev"]);
});
await check("dispatcher", "host integration: readiness promise, layer wiring from PROJECT, karaoke-style previous hook composable", "installLibraryOverlays resolves before ready, wires video-local time + source offset + production seed, and keeps an existing hook as a layer", async () => {
  const host = { overlayHook: (c) => c.fillText("karaoke", 0, 0) }, project = normalizeProject({ width: 1080, height: 1920, seed: 5, sourceAudioOffsetSeconds: 10 });
  const p = H.installLibraryOverlays(host, project, { particleEvents: [{ id: "k", atSourceSeconds: 12.4, x: 540, y: 1500, options: { kind: "spark" } }] }); assert.ok(p instanceof Promise); const d = await p;
  assert.deepEqual(d.layerIds(), ["r06-burst-particles", "previous-hook"]); const c = recordingContext(); host.overlayHook(c, 2.5);
  const exp = origTrace(2.5, tb.sourceToVideoSeconds(12.4, 10), 540, 1500, { kind: "spark", seed: P.deriveEventSeed(5, "k") });
  assert.ok(JSON.stringify(c.__trace).includes(JSON.stringify(exp[1])));
  assert.ok(c.__trace.some(([n]) => n === "fillText")); assert.ok(c.__trace.findIndex(([n]) => n === "stroke") < c.__trace.findIndex(([n]) => n === "fillText"));
  assert.equal(await H.installLibraryOverlays(host, project, { particleEvents: [{ id: "k", atVideoSeconds: 1, x: 1, y: 1 }] }), d); assert.equal(d.layerIds().length, 2);   // second install: no duplicate layer
  d.dispose();
});

const { runReuseChecks } = await import(pathToFileURL(path.join(LIB, "tests/verify-reuse.mjs")));
await runReuseChecks(check);

fs.writeFileSync(path.join(LIB, "tests/verify-results.json"), JSON.stringify({ node: process.version, generatedFor: "non-rendering verification; no pixels, browser, screenshots or media", passed: results.length - failed, failed, results }, null, 1) + "\n");
for (const r of results) console.log(`${r.status}  [${r.group}] ${r.name}${r.error ? "\n      " + r.error.split("\n")[0] : ""}`);
console.log(`\n${results.length - failed}/${results.length} passed`); process.exit(failed ? 1 : 0);
