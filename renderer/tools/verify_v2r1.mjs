// verify_v2r1.mjs — DRAW-ONLY determinism verifier for the His Line v2r1 revision. NOT EXECUTED in the R1 pass (needs separate authorization: it calls renderAt and reads canvas pixels).
// Takes no screenshot and writes no file. It uses the existing render.v3.mjs interface pieces unchanged: studio.v3.html, spec.sceneScripts (page.addScriptTag), window.prepare, window.renderAt, window.checksum.
// Usage (from renderer/):  node tools/verify_v2r1.mjs --spec=specs/his-line-v2r1.json [--seed=20261005]     Exit 0 = every checksum matched in every pass; non-zero otherwise.
// Passes: (1) each chosen frame twice back to back; (2) the full chosen list in a seeded SHUFFLED order; (3) reverse order; (4) direct seeks to far-apart frames and back. A frame's checksum must be identical in all passes.
// Chosen frames: every cut frame and its predecessor, every hit contact frame +-1, frames 785-795, 804, 827, 828, 838, 839, 863, plus a stride-24 sample of the whole timeline.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map(a => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const specPath = resolve(root, String(args.spec || 'specs/his-line-v2r1.json')), specDir = dirname(specPath), spec = JSON.parse(await readFile(specPath, 'utf8'));
const cues = JSON.parse(await readFile(resolve(specDir, spec.cues), 'utf8')), scripts = spec.sceneScripts.map(p => resolve(specDir, p));
for (const p of scripts) if (!existsSync(p)) throw new Error(`Scene script not found: ${p}`);
const chrome = process.env.CHROME_PATH || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!chrome) throw new Error('Google Chrome or Chromium not found; set CHROME_PATH');
const puppeteer = (await import('puppeteer-core')).default;
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--allow-file-access-from-files', '--disable-background-timer-throttling', '--font-render-hinting=none'] });
const errors = [];
try {
  const page = await browser.newPage(); await page.setViewport({ width: spec.width, height: spec.height, deviceScaleFactor: 1 });
  page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(pathToFileURL(resolve(root, 'studio.v3.html')).href, { waitUntil: 'load' });
  for (const p of scripts) { await page.addScriptTag({ path: p }); if (errors.length) throw new Error(`errors while loading ${p}: ${errors.join(' | ')}`); }
  await page.evaluate(a => window.prepare(a), { spec, cues, base: pathToFileURL(specDir + '/').href });
  const rep = await page.evaluate(() => window.HL_REPORT()); if (!rep.ready) throw new Error('scene set not ready');
  const frames = new Set([0, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 804, 827, 828, 838, 839, 863]);
  for (const f of rep.cuts) { frames.add(f); frames.add(f - 1); }
  for (let f = 0; f < spec.duration * spec.fps; f += 24) frames.add(f);
  const hitFrames = await page.evaluate(() => window.HL.hits.list.map(h => h.contactFrame)); for (const f of hitFrames) { frames.add(f - 1); frames.add(f); frames.add(f + 1); }
  const list = [...frames].filter(f => f >= 0 && f < spec.duration * spec.fps).sort((a, b) => a - b);
  const sum = async f => { await page.evaluate(a => window.renderAt(a.t, a.spec, a.cues), { t: f / spec.fps, spec, cues }); return page.evaluate(() => window.checksum()); };
  const first = new Map(); let bad = 0;
  const note = (pass, f, a, b) => { bad++; console.log(`MISMATCH pass=${pass} frame=${f}: ${a} vs ${b}`); };
  for (const f of list) { const a = await sum(f), b = await sum(f); if (a !== b) note('repeat', f, a, b); first.set(f, a); }
  let seed = Number(args.seed || 20261005) >>> 0; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const shuffled = [...list].sort(() => rnd() - .5); for (const f of shuffled) { const a = await sum(f); if (a !== first.get(f)) note('shuffled', f, first.get(f), a); }
  for (const f of [...list].reverse()) { const a = await sum(f); if (a !== first.get(f)) note('reverse', f, first.get(f), a); }
  const far = [790, 12, 863, 289, 3, 790, 749, 748, 790]; for (const f of far) { const a = await sum(f); if (first.has(f) && a !== first.get(f)) note('direct-seek', f, first.get(f), a); }
  if (errors.length) { bad++; console.log('page errors:', errors.join(' | ')); }
  console.log(`verify_v2r1: ${list.length} frames x (2 + shuffled + reverse) draws, ${far.length} direct seeks, ${bad} mismatch(es), no screenshots, no files written`);
  process.exitCode = bad ? 1 : 0;
} finally { await browser.close(); }
