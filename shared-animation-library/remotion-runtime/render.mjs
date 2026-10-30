import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { normalizeCues } from '../production/cue-schema.mjs';
import { planExport, roundFrame } from '../export/export-plan.mjs';

const runtimeRoot = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const normalizeProject = require('../base/src/project-config.js');
const die = (message) => { throw new Error(`Remotion render: ${message}`); };
const asPublicPath = (value) => value.split(path.sep).join('/');
const parseTimes = (raw) => raw.split(',').map((x) => Number(x.trim()));

function within(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}

function localFile(productionRoot, relativePath, what) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath)) die(`${what} must be a non-empty relative path`);
  const full = path.resolve(productionRoot, relativePath);
  if (!within(productionRoot, full)) die(`${what} escapes the song production folder: ${relativePath}`);
  if (!existsSync(full)) die(`${what} does not exist: ${full}`);
  return full;
}

function remotionConfig(project) {
  const r = project.remotion;
  if (!r || typeof r !== 'object' || Array.isArray(r)) die('PROJECT.renderEngine is "remotion" but PROJECT.remotion is missing');
  if (typeof r.scenes !== 'string' || !r.scenes) die('PROJECT.remotion.scenes must name the song React scene registry');
  if (r.publicDir !== undefined && (typeof r.publicDir !== 'string' || !r.publicDir)) die('PROJECT.remotion.publicDir must be a relative folder path');
  if (r.publicDir && path.isAbsolute(r.publicDir)) die('PROJECT.remotion.publicDir must be relative to the song folder');
  return r;
}

function resolveMediaPath(productionRoot, publicRoot, src, what) {
  const full = localFile(productionRoot, src, what);
  if (!within(publicRoot, full)) die(`${what} must be located inside PROJECT.remotion.publicDir so Remotion can serve it: ${src}`);
  return asPublicPath(path.relative(publicRoot, full));
}

async function readCueDocument(productionRoot, project) {
  if (!project.cues) return undefined;
  if (Array.isArray(project.cues.entries)) return project.cues;
  if (typeof project.cues.module !== 'string') die('PROJECT.cues must contain inline entries or a module path');
  const file = localFile(productionRoot, project.cues.module, 'PROJECT.cues.module');
  if (path.extname(file).toLowerCase() === '.json') return JSON.parse(readFileSync(file, 'utf8'));
  const loaded = await import(pathToFileURL(file).href);
  return loaded.default ?? loaded;
}

function mediaMaps(productionRoot, publicRoot, project) {
  const assets = {};
  const imageAssets = [];
  for (const item of project.assets || []) {
    const id = typeof item === 'string' ? item : item.id;
    const src = typeof item === 'string' ? item : item.src;
    const kind = typeof item === 'string' ? undefined : item.kind;
    assets[id] = resolveMediaPath(productionRoot, publicRoot, src, `PROJECT asset "${id}"`);
    if (kind === 'image') imageAssets.push({ id, path: assets[id] });
  }
  const fonts = {};
  const fontSpecs = [];
  for (const item of project.fonts || []) {
    const src = typeof item === 'string' ? item : item.src;
    const family = typeof item === 'string' ? path.basename(item, path.extname(item)) : item.family;
    const fontPath = resolveMediaPath(productionRoot, publicRoot, src, `PROJECT font "${family}"`);
    fonts[family] = fontPath;
    fontSpecs.push({ family, path: fontPath, weight: typeof item === 'string' ? undefined : item.weight, style: typeof item === 'string' ? undefined : item.style, unicodeRange: typeof item === 'string' ? undefined : item.unicodeRange });
  }
  const audioPublicPath = project.audio ? resolveMediaPath(productionRoot, publicRoot, project.audio, 'PROJECT.audio') : null;
  return { assets, fonts, imageAssets, fontSpecs, audioPublicPath };
}

function outputPath(productionRoot, raw, fallback, what) {
  if (raw !== undefined && (typeof raw !== 'string' || !raw || path.isAbsolute(raw))) die(`${what} must be a non-empty path relative to the song folder`);
  const full = path.resolve(productionRoot, raw ?? fallback);
  if (!within(productionRoot, full)) die(`${what} must stay inside the song folder`);
  return full;
}

function validateOverlaySchedule(project) {
  for (const overlay of project.overlays || []) {
    if (!overlay || typeof overlay !== 'object' || Array.isArray(overlay)) die('PROJECT.overlays entries must be objects');
    const id = overlay.id;
    if (typeof id !== 'string' || !id) die('each PROJECT.overlays entry needs a non-empty id');
    if (typeof overlay.start !== 'number' || !Number.isFinite(overlay.start) || typeof overlay.end !== 'number' || !Number.isFinite(overlay.end)) die(`overlay "${id}" needs finite start and end seconds`);
    if (overlay.start < 0 || overlay.end <= overlay.start || overlay.end > project.duration + 1e-9) die(`overlay "${id}" must satisfy 0 <= start < end <= PROJECT.duration`);
  }
}

function browserExecutable(args) {
  const candidates = [
    args.chrome,
    process.env.CHROME_EXECUTABLE,
    process.env.CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) die('no local Chrome/Chromium was found. Pass --chrome=/absolute/path/to/Chrome; the renderer will not download a browser implicitly');
  return path.resolve(found);
}

function parseSceneTimes(project, args) {
  if (args.stills === true || typeof args.stills !== 'string') die('--stills requires comma-separated seconds, for example --stills=1.2,8.5');
  const times = parseTimes(args.stills);
  if (!times.length || times.some((t) => !Number.isFinite(t) || t < 0 || t >= project.duration)) die(`all still times must satisfy 0 <= t < PROJECT.duration (${project.duration}s)`);
  return times;
}

export async function renderRemotion({ root, project, args }) {
  const productionRoot = path.resolve(root);
  const r = remotionConfig(project);
  if (!project.scenes?.length) die('Remotion productions require a non-empty PROJECT.scenes schedule');
  validateOverlaySchedule(project);
  const scenesFile = localFile(productionRoot, r.scenes, 'PROJECT.remotion.scenes');
  const publicRoot = localFile(productionRoot, r.publicDir || 'public', 'PROJECT.remotion.publicDir');
  if (!within(productionRoot, publicRoot)) die('PROJECT.remotion.publicDir must stay inside the song production folder');
  if (project.audio && !args.plan && !existsSync(path.resolve(productionRoot, project.audio))) die(`PROJECT.audio does not exist: ${path.resolve(productionRoot, project.audio)}`);
  const media = mediaMaps(productionRoot, publicRoot, project);
  const cueDoc = await readCueDocument(productionRoot, project);
  const cues = normalizeCues(cueDoc, project).all;
  const inputProps = {
    project: JSON.parse(JSON.stringify(project)),
    cueEntries: JSON.parse(JSON.stringify(cues)),
    assetPaths: media.assets,
    fontPaths: media.fonts,
    imageAssets: media.imageAssets,
    fontSpecs: media.fontSpecs,
    audioPublicPath: media.audioPublicPath,
  };
  const exportPlan = planExport({ project, audio: project.audio ? path.resolve(productionRoot, project.audio) : null, mode: 'clip' });

  if (args.plan) {
    console.log(JSON.stringify({
      engine: 'remotion',
      productionRoot,
      sceneRegistry: scenesFile,
      publicDirectory: publicRoot,
      compositionId: 'song-reel',
      project: { productionId: project.productionId, width: project.width, height: project.height, fps: project.fps, durationSeconds: project.duration },
      export: { frameCount: exportPlan.frameCount, durationSeconds: exportPlan.durationSeconds, frameQuantizationDifferenceSeconds: exportPlan.durationSeconds - project.duration, audio: exportPlan.audio, audioVideoEndpointDifferenceSeconds: exportPlan.audioVideoEndpointDifferenceSeconds },
      audioDeclared: Boolean(project.audio),
      scenes: project.scenes.map((s) => ({ id: s.id, impl: s.impl || s.id, start: s.start, end: s.end })),
      overlays: (project.overlays || []).map((s) => ({ id: s.id, impl: s.impl || s.id, start: s.start, end: s.end })),
      note: 'Plan only: no browser, still, frame, or video was rendered.',
    }, null, 2));
    return;
  }

  const isRender = Boolean(args.render);
  const isStills = args.stills !== undefined;
  if (Number(isRender) + Number(isStills) !== 1) die('choose exactly one mode: --plan, --render, or --stills=seconds,...');
  if (isRender && !project.audio) die('a song render requires PROJECT.audio pointing to the supplied full recording inside PROJECT.remotion.publicDir');
  const chrome = browserExecutable(args);
  const serveUrl = await bundle({
    entryPoint: path.join(runtimeRoot, 'src/entry.jsx'),
    rootDir: runtimeRoot,
    publicDir: publicRoot,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: { ...(config.resolve?.alias || {}), '@song-scenes': scenesFile },
        modules: [...(config.resolve?.modules || ['node_modules']), path.join(runtimeRoot, 'node_modules')],
      },
    }),
  });
  const composition = await selectComposition({ serveUrl, id: 'song-reel', inputProps, browserExecutable: chrome });
  if (composition.width !== project.width || composition.height !== project.height || composition.fps !== project.fps || composition.durationInFrames !== exportPlan.frameCount) {
    die(`Remotion metadata disagrees with shared PROJECT/export plan (got ${composition.width}x${composition.height}@${composition.fps}, ${composition.durationInFrames} frames; expected ${project.width}x${project.height}@${project.fps}, ${exportPlan.frameCount} frames)`);
  }

  if (isRender) {
    const output = outputPath(productionRoot, args.out, `out/${project.productionId || 'song-reel'}.mp4`, 'output path');
    if (existsSync(output)) die(`refusing to overwrite existing output: ${output}`);
    mkdirSync(path.dirname(output), { recursive: true });
    const concurrency = args.workers ? Number(args.workers) : Math.max(1, Math.min(2, os.cpus().length - 1));
    if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 4) die('--workers must be an integer from 1 to 4');
    console.log(`Remotion render: ${project.width}x${project.height} @ ${project.fps} fps; ${exportPlan.frameCount} frames (${exportPlan.durationSeconds}s video) with audio selection ${exportPlan.audio.durationSeconds}s from ${project.audio}`);
    await renderMedia({ composition, serveUrl, codec: 'h264', outputLocation: output, inputProps, browserExecutable: chrome, concurrency, overwrite: false, logLevel: 'info' });
    console.log(`Wrote ${output}`);
    console.log(`Planned video duration ${exportPlan.durationSeconds}s; source audio duration ${exportPlan.audio.durationSeconds}s; video-minus-audio endpoint difference ${exportPlan.audioVideoEndpointDifferenceSeconds}s; frame quantization difference ${exportPlan.durationSeconds - project.duration}s.`);
    return;
  }

  const times = parseSceneTimes(project, args);
  const outputDir = outputPath(productionRoot, args.out, 'out/stills', 'still output directory');
  const targets = times.map((seconds) => path.join(outputDir, `t${seconds.toFixed(2).replace('.', '_')}.png`));
  if (new Set(targets).size !== targets.length) die('still times produce duplicate two-decimal output names; choose distinct times');
  const existing = targets.find((target) => existsSync(target));
  if (existing) die(`refusing to overwrite existing still: ${existing}`);
  mkdirSync(outputDir, { recursive: true });
  for (let i = 0; i < times.length; i++) {
    const frame = roundFrame(times[i], project.fps);
    await renderStill({ composition, serveUrl, output: targets[i], frame, imageFormat: 'png', inputProps, browserExecutable: chrome, overwrite: false, logLevel: 'info' });
    console.log(`${targets[i]}  frame=${frame} time=${frame / project.fps}s (${composition.width}x${composition.height})`);
  }
}
