// render.mjs: renders the entry page in headless Chrome. Derived from the R01/R02 painted template driver (see ../provenance/PROVENANCE.json).
//
//   Look at it:
//     node render.mjs --sheet=0.5,1,1.5,2 [--cols=4] [--w=480] --out=out/check/a.jpg        contact sheet of chosen times
//     node render.mjs --strip=2.0:2.5 [--cols=6] [--w=320] --out=out/check/strip.jpg        EVERY frame in a stretch (motion)
//     node render.mjs --sheet=2.1,2.2 --crop=760,300,400,400 --w=600 --out=out/check/face.jpg full-res crops (details)
//     node render.mjs --stills=1.2,3.4 --out=out/stills                                     full-res PNGs
//   Make the video:
//     node render.mjs --clip [--range=0:4] --out=out/video.mp4                               straight to MP4 (one worker)
//     node render.mjs --frames [--range=0:8] --workers=4                                     JPEG frames -> out/<entry>-<identity>/frames (parallel, resumable)
//     node render.mjs --encode [--range=0:8] --out=out/video.mp4                             those saved frames -> MP4 (same range as --frames)
//   Check without rendering anything:
//     node render.mjs --plan [--clip|--frames|--encode] [--range=a:b]                        print plan, cache identity, ffmpeg arguments; exit
//   Standalone loops: add --loop=<name> (times are then loop times; --encode with --loop needs an explicit --range).
//   Music: --audio=<file> (relative to cwd) or PROJECT.audio (relative to the config file). The SAME audio resolution, offset and range start
//   apply to --clip and --encode. Other flags: --fps=<n> (only numeric override), --chrome=<path>, --root=<dir>, --entry=<file>.
//
// ROOTS. Inputs (entry page, config.js, node_modules) resolve against --root (default: this file's directory); outputs (--out, out/...) and
// --audio resolve against the current directory. Dimensions, duration, offsets and seed come ONLY from the entry's config.js, normalized once
// by src/project-config.js (the same function the page runs), so the viewport can never disagree with the page.
//
// TIMING CONTRACT, CACHES AND FAILURE HANDLING: ../export/export-plan.mjs, ../export/cache-identity.mjs, ../export/process-runner.mjs.
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync, renameSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve, basename, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { homedir } from 'node:os';
import { planExport, frameFileName, missingFrames } from '../export/export-plan.mjs';
import { computeIdentity, buildManifest, checkManifest } from '../export/cache-identity.mjs';
import { runClipExport, runEncode, ExportError } from '../export/process-runner.mjs';
const normalizeProject = createRequire(import.meta.url)('./src/project-config.js');

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const die = (m, code = 1) => { console.error(m); process.exit(code); };
const JPEG_Q = { clip: .93, frames: .94 };
const times = s => String(s).split(',').map(Number);
const span = s => String(s).split(':').map(Number);
// comma-separated fields, keeping commas inside parentheses ('PLK.MX(1.38),PLK.WL,500,300'); numbers stay numbers
const fields = s => { const out = []; let d = 0, cur = ''; for (const ch of String(s)) { if (ch === ',' && !d) { out.push(cur); cur = ''; continue; } d += ch === '(' ? 1 : ch === ')' ? -1 : 0; cur += ch; } out.push(cur); return out.map(v => isNaN(+v) ? v : +v); };

// ---- roots, config, normalized PROJECT -------------------------------------------------------------------------------------------
const ROOT = resolve(args.root || dirname(fileURLToPath(import.meta.url)));
const ENTRY = resolve(ROOT, args.entry || 'studio.html');
if (!existsSync(ENTRY)) die(`entry page not found: ${ENTRY}`);
for (const k of ['width', 'height']) if (args[k] !== undefined) die(`--${k} is not an override: dimensions come only from config.js so the page, canvas and viewport agree`);
const cfgSrc = (readFileSync(ENTRY, 'utf8').replace(/<!--[\s\S]*?-->/g, '').match(/<script[^>]+src="([^"]*config\.js)"/) || [])[1];
if (!cfgSrc || /project-config\.js$/.test(cfgSrc)) die('entry page has no config.js script: cannot derive the project configuration');
const CONFIG_PATH = resolve(dirname(ENTRY), cfgSrc);
let PROJECT;
try { PROJECT = normalizeProject({ ...vm.runInNewContext(readFileSync(CONFIG_PATH, 'utf8') + '\n;PROJECT'), ...(args.fps ? { fps: +args.fps } : {}) }); }
catch (e) { die(`${e.message}\n  (config: ${CONFIG_PATH})`); }
const fps = PROJECT.fps, VIEW_W = PROJECT.width, VIEW_H = PROJECT.height;
const audioArg = args.audio ? resolve(args.audio) : PROJECT.audio ? resolve(dirname(CONFIG_PATH), PROJECT.audio) : null;
if (audioArg && !existsSync(audioArg)) die(`audio file not found: ${audioArg}`);
const mode = args.clip ? 'clip' : args.encode ? 'encode' : args.frames ? 'frames' : null;
const spanArg = args.range ? span(args.range) : (typeof args.clip === 'string' ? span(args.clip) : null);
const planFor = (length) => planExport({ project: PROJECT, range: spanArg, length, audio: mode === 'frames' ? null : audioArg, mode: mode || 'frames' });

// cache identity (hashes the entry's dependency closure, declared assets, config and output settings -- never the whole repository set)
const identityFor = () => computeIdentity({ entryPath: ENTRY, root: ROOT, project: PROJECT, configDir: dirname(CONFIG_PATH), output: { jpegQuality: JPEG_Q.frames, ...(args.loop ? { loop: args.loop } : {}) } });
const jobDirFor = id => resolve('out', `${basename(dirname(ENTRY)) === 'landscape' ? 'landscape' : basename(ENTRY, '.html')}-${id.short}`);

const report = (e) => { console.error(e instanceof ExportError ? `\nEXPORT FAILED (${e.kind}): ${e.message}` : `\nFAILED: ${e && e.stack || e}`); };

if (args.plan) {
  const m = mode || 'clip'; let plan;
  try { plan = planExport({ project: PROJECT, range: spanArg, audio: audioArg, mode: m === 'frames' ? 'clip' : m }); } catch (e) { die(e.message); }
  const id = identityFor(), job = jobDirFor(id);
  console.log(JSON.stringify({ entry: ENTRY, config: CONFIG_PATH, project: PROJECT, plan: { ...plan, frameTimes: undefined, frameIndices: undefined, ffmpegArgs: undefined },
    identity: id.identity, framesDir: join(job, 'frames'), ffmpeg: plan.ffmpegArgs({ framesDir: join(job, 'frames'), output: args.out || 'out/video.mp4' }) }, null, 1));
  process.exit(0);
}

const run = (fn) => fn().catch((e) => { report(e); process.exitCode = 1; });

if (args.encode) {
  await run(async () => {
    if (args.loop && !spanArg) throw new ExportError('config', '--encode with --loop needs an explicit --range=a:b (loop length is only known to the page)');
    const plan = planFor(), id = identityFor(), job = jobDirFor(id), framesDir = join(job, 'frames');
    const man = readManifest(framesDir), check = checkManifest(man, buildManifest({ id, plan, entry: relEntry() }));
    if (!check.compatible) throw new ExportError('cache', `no compatible saved frames in ${framesDir}\n  ${check.mismatches.join('\n  ')}\n  render them first: node render.mjs --frames${args.range ? ' --range=' + args.range : ''}`);
    const missing = missingFrames(plan, (n) => { const f = join(framesDir, n); return existsSync(f) && statSync(f).size >= 1000; });
    if (missing.length) throw new ExportError('cache', `${missing.length} of ${plan.frameCount} selected frames are missing/incomplete (first: ${missing.slice(0, 5).join(', ')}); run --frames with the same --range to resume`);
    const out = resolve(args.out || join(job, 'video.mp4')); mkdirSync(dirname(out), { recursive: true });
    console.log(`encoding frames ${plan.firstFrame}..${plan.endFrame - 1} (${plan.frameCount} @ ${fps} fps = ${plan.durationSeconds}s)${plan.audio ? `, audio from source ${plan.audio.startSeconds}s for ${plan.audio.durationSeconds}s` : ''} -> ${out}`);
    await runEncode({ plan, framesDir, output: out, io: { rename: async (a, b) => renameSync(a, b), remove: async (p) => rmSync(p, { force: true }) } });
    console.log('wrote ' + out);
  });
  process.exit(process.exitCode || 0);
}
function relEntry() { return ENTRY.slice(ROOT.length + 1); }
function readManifest(dir) { try { return JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')); } catch { return null; } }

const CHROMES = [args.chrome, process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', ...playwrightChromes()];
function playwrightChromes() {
  const dir = `${homedir()}/.cache/ms-playwright`;
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(n => /^chromium-\d+$/.test(n)).sort((a, b) => b.split('-')[1] - a.split('-')[1]).map(n => `${dir}/${n}/chrome-linux64/chrome`);
}
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) die('Chrome not found: pass --chrome=<path> or set CHROME_PATH');

// --soft-gl: no GPU on this machine; render WebGL in software (SwiftShader). --gpu-angle=vulkan|gl-egl: headless Linux on an NVIDIA GPU.
const ANGLE = { vulkan: ['--use-angle=vulkan', '--enable-features=Vulkan'], 'gl-egl': ['--use-angle=gl-egl'] };
if (args['gpu-angle'] && !ANGLE[args['gpu-angle']]) die(`--gpu-angle must be one of ${Object.keys(ANGLE)}`);
const gpu = args['soft-gl'] ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : args['gpu-angle'] ? ANGLE[args['gpu-angle']]
  : process.platform === 'win32' ? ['--use-angle=d3d11'] : process.platform === 'darwin' ? ['--use-angle=metal'] : ['--use-gl=angle'];
const sandbox = process.platform === 'linux' ? ['--no-sandbox'] : [];
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0, defaultViewport: { width: VIEW_W, height: VIEW_H, deviceScaleFactor: 1 },
  args: [...sandbox, '--allow-file-access-from-files', '--ignore-gpu-blocklist', ...gpu, '--enable-gpu-rasterization', `--window-size=${VIEW_W},${VIEW_H}`, '--disable-renderer-backgrounding', '--disable-background-timer-throttling']
});
async function openPage(tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(ENTRY).href + '?render', { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  if (args.loop) {
    const ok = await page.evaluate(name => { if (!LOOPS[name]) return false; window.LOOP = LOOPS[name]; return true; }, args.loop);
    if (!ok) die(`no loop named "${args.loop}"`);
  }
  return page;
}
const frameOf = async (page, t, type, q) => {
  const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
};
const lengthOf = page => page.evaluate(() => window.LOOP ? window.LOOP.len : DUR);

await run(async () => {
  if (args.sheet || args.strip) {
    const page = await openPage(), out = args.out || 'out/sheet.jpg'; mkdirSync(dirname(out), { recursive: true });
    let ts;
    if (args.strip) { const [a, b] = span(args.strip); ts = []; for (let i = Math.round(a * fps); i <= Math.round(b * fps); i++) ts.push(i / fps); }
    else ts = times(args.sheet);
    const crop = args.crop ? times(args.crop) : null, at = args['crop-at'] ? fields(args['crop-at']) : null;
    const { url, ms } = await page.evaluate((ts, c, w, crop, at) => window.renderSheet(ts, c, w, crop, at), ts, +(args.cols || (args.strip ? 6 : 3)), +(args.w || (args.strip ? 320 : 640)), crop, at);
    writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
    console.log(`${out}  (${ts.length} frames)  ms/frame: ${ms.join(' ')}`);
  } else if (args.stills) {
    const page = await openPage(), out = args.out || 'out/stills'; mkdirSync(out, { recursive: true });
    console.log('GPU:', await page.evaluate(() => window.gpuInfo()));
    for (const s of times(args.stills)) {
      const t0 = Date.now(), buf = await frameOf(page, s, 'image/png');
      const f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`; writeFileSync(f, buf);
      console.log(`${f}  ${Date.now() - t0} ms`);
    }
  } else if (args.png) {
    const probe = await openPage(), plan = planFor(await lengthOf(probe)); await probe.close();
    const out = args.out || `out/${args.loop ? 'loop_' + args.loop : 'png'}`, workers = +(args.workers || 3); mkdirSync(out, { recursive: true });
    let next = 0; const start = Date.now();
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = await openPage('#' + w);
      while (next < plan.frameCount) { const j = next++; writeFileSync(`${out}/f${String(j).padStart(4, '0')}.png`, await frameOf(page, plan.frameTimes(j), 'image/png')); }
    }));
    console.log(`${plan.frameCount} frames -> ${out}  (${((Date.now() - start) / plan.frameCount).toFixed(0)} ms/frame; file f0000 = production frame ${plan.firstFrame})`);
  } else if (args.frames) {
    const probe = await openPage(), plan = planFor(await lengthOf(probe)); await probe.close();
    const id = identityFor(), job = jobDirFor(id), framesDir = join(job, 'frames'), workers = +(args.workers || 4);
    const expected = buildManifest({ id, plan, entry: relEntry() }), existing = readManifest(framesDir);
    mkdirSync(framesDir, { recursive: true });
    if (existing) { const c = checkManifest(existing, expected); if (!c.compatible) throw new ExportError('cache', `cached frames in ${framesDir} belong to a different production/configuration; refusing to reuse them:\n  ${c.mismatches.join('\n  ')}\n  (delete that folder or change --out root to start fresh)`); }
    writeFileSync(join(framesDir, 'manifest.json'), JSON.stringify(expected, null, 1) + '\n');
    const todo = plan.frameIndices().filter(i => { const f = join(framesDir, frameFileName(i)); return !existsSync(f) || statSync(f).size < 1000; });
    console.log(`frames ${plan.firstFrame}..${plan.endFrame - 1} @ ${fps} fps in ${framesDir}\n${todo.length} to render (${plan.frameCount - todo.length} already done and compatible), ${workers} workers`);
    let next = 0, done = 0; const start = Date.now();
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = await openPage('#' + w);
      while (next < todo.length) {
        const i = todo[next++], f = join(framesDir, frameFileName(i));
        const buf = await frameOf(page, i / fps, 'image/jpeg', JPEG_Q.frames);
        writeFileSync(f + '.tmp', buf); renameSync(f + '.tmp', f);
        if (++done % 24 === 0 || done === todo.length) { const el = (Date.now() - start) / 1000; console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame effective  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`); }
      }
    }));
  } else if (args.clip) {
    const page = await openPage(), plan = planFor(await lengthOf(page));
    const out = resolve(args.out || 'out/clip.mp4'); mkdirSync(dirname(out), { recursive: true });
    console.log(`clip: frames ${plan.firstFrame}..${plan.endFrame - 1} (${plan.frameCount} @ ${fps} fps = ${plan.durationSeconds}s)${plan.audio ? `, audio from source ${plan.audio.startSeconds}s` : ', no audio'}`);
    const start = Date.now();
    await runClipExport({ plan, output: out, io: { rename: async (a, b) => renameSync(a, b), remove: async (p) => rmSync(p, { force: true }) },
      renderFrame: (j) => frameOf(page, plan.frameTimes(j), 'image/jpeg', JPEG_Q.clip),
      onProgress: (n, total) => { if (n % 24 === 1 || n === total) console.log(`frame ${n}/${total}  ${((Date.now() - start) / n).toFixed(0)} ms/frame`); } });
    console.log(`wrote ${out}`);
  } else {
    console.log('nothing to do: see the usage notes at the top of render.mjs');
  }
});
await browser.close().catch(() => {});
process.exit(process.exitCode || 0);
