// Music motion reel renderer v2 (2026-10-05). Baseline: v1 render.mjs (kept as render.v1.mjs.bak).
// Adds: sceneScript + cues + assets hashed into job version; audioStart offset; --stills; --range;
// 45 s hard cap; ffprobe of export; puppeteer-core OR playwright driver.
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, rename, stat, open, rm } from 'node:fs/promises';
import { basename, dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const item = argv[i].replace(/^--/, '');
  const eq = item.indexOf('=');
  if (eq >= 0) args[item.slice(0, eq)] = item.slice(eq + 1);
  else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[item] = argv[++i];
  else args[item] = true;
}
const HARD_CAP = 45;
const specPath = resolve(root, String(args.spec || 'specs/demo.json'));
const specDir = dirname(specPath);
const studioPath = join(root, 'studio.html');
const spec = JSON.parse(await readFile(specPath, 'utf8'));
const rel = p => resolve(specDir, p);

const sceneScriptPath = spec.sceneScript ? rel(spec.sceneScript) : null;
const cuesPath = spec.cues ? rel(spec.cues) : null;
const cues = cuesPath ? JSON.parse(await readFile(cuesPath, 'utf8')) : null;
const assetPaths = (spec.assets || []).map(rel);

function validate(s) {
  for (const key of ['width', 'height', 'fps', 'duration']) {
    if (!Number.isFinite(s[key]) || s[key] <= 0) throw new Error(`Invalid ${key}`);
  }
  if (s.width % 2 || s.height % 2) throw new Error('Width and height must be even for H.264');
  if (s.duration > HARD_CAP + 1e-9) throw new Error(`Duration ${s.duration}s exceeds hard cap ${HARD_CAP}s`);
  const frames = s.duration * s.fps;
  if (Math.abs(frames - Math.round(frames)) > 1e-6) throw new Error(`duration*fps must be an integer (got ${frames})`);
  if (s.duration < 35 || s.duration > 40) console.warn(`WARNING: duration ${s.duration}s is outside the 35-40 s target`);
  if (!Array.isArray(s.scenes) || !s.scenes.length) throw new Error('At least one scene is required');
  let end = 0;
  for (const scene of s.scenes) {
    if (Math.abs(scene.start - end) > .001 || scene.end <= scene.start) throw new Error('Scenes must cover the timeline without gaps or overlaps');
    if (!/^[a-z0-9-]+$/i.test(scene.type)) throw new Error(`Bad scene type: ${scene.type}`);
    end = scene.end;
  }
  if (Math.abs(end - s.duration) > .001) throw new Error('Scenes must end at duration');
  if (s.audioStart != null && !(s.audioStart >= 0)) throw new Error('audioStart must be >= 0');
}
validate(spec);

const audioPath = spec.audio ? rel(spec.audio) : null;
if (audioPath && !existsSync(audioPath)) throw new Error(`Audio not found: ${audioPath}`);
const hash = createHash('sha256').update(JSON.stringify(spec));
for (const p of [studioPath, fileURLToPath(import.meta.url), sceneScriptPath, cuesPath, ...assetPaths].filter(Boolean)) hash.update(await readFile(p));
if (audioPath) hash.update(await readFile(audioPath));
const version = hash.digest('hex').slice(0, 12);
const slug = String(spec.name || basename(specPath, '.json')).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
const jobDir = join(root, 'out', `${slug}-${version}`);
const framesDir = join(jobDir, 'frames');
const stillsDir = join(jobDir, 'stills');
const statusPath = join(jobDir, 'status.json');
const outputPath = join(jobDir, 'video.mp4');
const lockPath = join(jobDir, '.render.lock');
const frameCount = Math.round(spec.duration * spec.fps);
const chrome = process.env.CHROME_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'
].find(existsSync);

async function run(cmd, cmdArgs) {
  await new Promise((good, bad) => {
    const child = spawn(cmd, cmdArgs, { stdio: 'inherit' });
    child.on('error', bad);
    child.on('close', code => code === 0 ? good() : bad(new Error(`${cmd} exited ${code}`)));
  });
}
async function writeStatus(stage, extra = {}) {
  const data = { name: spec.name, version, stage, frameCount, fps: spec.fps, duration: spec.duration, outputPath, updatedAt: new Date().toISOString(), ...extra };
  const temp = `${statusPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 2));
  await rename(temp, statusPath);
}
const frameFile = i => join(framesDir, `frame-${String(i).padStart(6, '0')}.png`);
async function validFrame(i) { try { return (await stat(frameFile(i))).size > 1000; } catch { return false; } }

// ---- browser driver: puppeteer-core if installed, else playwright ----
async function launch() {
  const req = createRequire(import.meta.url);
  const launchArgs = ['--allow-file-access-from-files', '--disable-background-timer-throttling', '--font-render-hinting=none'];
  try {
    const puppeteer = (await import('puppeteer-core')).default;
    if (!chrome) throw new Error('Google Chrome or Chromium not found; set CHROME_PATH');
    const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: launchArgs });
    return { name: 'puppeteer-core', close: () => b.close(), newPage: async () => {
      const p = await b.newPage(); await p.setViewport({ width: spec.width, height: spec.height, deviceScaleFactor: 1 }); return p; } };
  } catch (e) {
    if (!/Cannot find (package|module)/.test(String(e))) throw e;
    const { chromium } = req('playwright');
    const b = await chromium.launch({ executablePath: chrome || undefined, args: launchArgs });
    return { name: 'playwright', close: () => b.close(), newPage: async () => {
      const p = await b.newPage({ viewport: { width: spec.width, height: spec.height }, deviceScaleFactor: 1 }); return p; } };
  }
}
async function preparePage(browser) {
  const page = await browser.newPage();
  page.on?.('pageerror', e => console.error('PAGE ERROR', e));
  await page.goto(pathToFileURL(studioPath).href, { waitUntil: 'load' });
  if (sceneScriptPath) await page.addScriptTag({ path: sceneScriptPath });
  await page.evaluate(a => window.prepare(a), { spec, cues, base: pathToFileURL(specDir + '/').href });
  return page;
}
async function drawTo(page, t, target) {
  await page.evaluate(a => window.renderAt(a.t, a.spec, a.cues), { t, spec, cues });
  const temp = `${target}.tmp.png`;
  await page.screenshot({ path: temp, type: 'png' });
  await rename(temp, target);
}

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,nb_frames,duration', '-of', 'json', file]).toString();
  return JSON.parse(out);
}

if (args.preflight) {
  await run('ffmpeg', ['-version']);
  const drv = await launch(); console.log(`Driver: ${drv.name}`); await drv.close();
  if (audioPath) { const p = probe(audioPath); console.log(`Audio: ${audioPath} (${(+p.format.duration).toFixed(3)} s), audioStart ${spec.audioStart || 0}`); }
  console.log(`Preflight OK: ${spec.width}x${spec.height}, ${frameCount} frames @ ${spec.fps} = ${spec.duration}s, Chrome: ${chrome || '(playwright bundled)'}`);
  console.log(`Job directory: ${jobDir}`);
  process.exit(0);
}

if (args.stills) {
  await mkdir(stillsDir, { recursive: true });
  const times = String(args.stills).split(',').map(Number);
  const browser = await launch(); const page = await preparePage(browser);
  for (const t of times) { const f = join(stillsDir, `still-${t.toFixed(3)}s.png`); await drawTo(page, t, f); console.log(f); }
  await browser.close(); process.exit(0);
}

await mkdir(framesDir, { recursive: true });
if (args.detach) {
  const log = await open(join(jobDir, 'render.log'), 'a');
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), `--spec=${specPath}`, `--workers=${args.workers || 2}`], {
    cwd: root, detached: true, stdio: ['ignore', log.fd, log.fd], env: process.env
  });
  child.unref(); await log.close();
  console.log(`Started local render, PID ${child.pid}\nStatus: ${statusPath}\nLog: ${join(jobDir, 'render.log')}`);
  process.exit(0);
}

let lock;
try { lock = await open(lockPath, 'wx'); }
catch {
  const oldPid = Number(await readFile(lockPath, 'utf8').catch(() => '0'));
  let running = false;
  if (oldPid) { try { process.kill(oldPid, 0); running = true; } catch {} }
  if (running) throw new Error(`Render already running as PID ${oldPid}`);
  await rm(lockPath, { force: true }); lock = await open(lockPath, 'wx');
}
await lock.writeFile(String(process.pid));

const [rA, rB] = args.range ? String(args.range).split(':').map(Number) : [0, frameCount];
try {
  await writeStatus('rendering', { rendered: 0 });
  const browser = await launch();
  let next = rA, rendered = 0;
  const workers = Math.max(1, Math.min(8, Number(args.workers || 2)));
  try {
    await Promise.all(Array.from({ length: workers }, async () => {
      const page = await preparePage(browser);
      while (true) {
        const i = next++; if (i >= rB) break;
        if (!await validFrame(i)) await drawTo(page, i / spec.fps, frameFile(i));
        rendered++;
        if (rendered % 24 === 0) await writeStatus('rendering', { rendered, range: [rA, rB] });
      }
    }));
  } finally { await browser.close(); }
  if (args.range) { await writeStatus('range-complete', { range: [rA, rB] }); console.log('Range done'); process.exit(0); }

  for (let i = 0; i < frameCount; i++) if (!await validFrame(i)) throw new Error(`Missing frame ${i}`);
  await writeStatus('encoding', { rendered: frameCount });
  const cmd = ['-y', '-hide_banner', '-loglevel', 'error', '-stats', '-framerate', String(spec.fps), '-i', join(framesDir, 'frame-%06d.png')];
  if (audioPath) {
    // Source offset applied at input; master file itself is never modified. Silence padded only past the master's end.
    cmd.push('-ss', String(spec.audioStart || 0), '-i', audioPath, '-map', '0:v:0', '-map', '1:a:0', '-af', 'apad');
  }
  cmd.push('-t', String(spec.duration), '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(spec.fps));
  if (audioPath) cmd.push('-c:a', 'aac', '-b:a', '192k'); else cmd.push('-an');
  cmd.push('-movflags', '+faststart', outputPath);
  await run('ffmpeg', cmd);
  const p = probe(outputPath);
  const actual = +p.format.duration;
  if (actual > HARD_CAP) throw new Error(`Export ${actual}s exceeds hard cap`);
  await writeStatus('complete', { rendered: frameCount, export: p });
  console.log(`Done: ${outputPath} (${actual.toFixed(3)} s)`);
} catch (error) {
  await writeStatus('failed', { error: String(error) });
  throw error;
} finally {
  await lock.close(); await rm(lockPath, { force: true });
}
