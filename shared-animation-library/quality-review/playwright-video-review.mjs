#!/usr/bin/env node
// Browser-decode selected frames from an already-rendered song candidate.
// This is a review helper, not the renderer and not an audio-sync or visual-acceptance test.
import { createRequire } from 'node:module';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { chromium } from 'playwright-core';
import { wholeProjectFrameCount } from '../export/export-plan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(here, '../..');
const require = createRequire(import.meta.url);
const normalizeProject = require('../base/src/project-config.js');
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const text = arg.replace(/^--/, '');
  const split = text.indexOf('=');
  return split < 0 ? [text, true] : [text.slice(0, split), text.slice(split + 1)];
}));
const fail = (message) => { throw new Error(message); };
const within = (parent, child) => {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
};
const sha256 = async (file) => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
};
const usage = () => {
  console.log('Usage: node shared-animation-library/quality-review/playwright-video-review.mjs --root=productions/<song> --video=out/<candidate>.mp4 --times=0,4.2,12.5 --out=review/browser-round-01 [--chrome=/absolute/path/to/Chrome]');
  console.log('Samples an already-rendered MP4 in headless Chrome, saves browser-decoded PNGs and a JSON report, then uses FFmpeg to make a contact sheet.');
};

if (args.help || !args.root || !args.video || !args.times || !args.out) {
  usage();
  if (!args.help) process.exitCode = 2;
} else {
  let productionRoot;
  let outputDir;
  let browser;
  let server;
  let report;
  try {
    productionRoot = path.resolve(process.cwd(), String(args.root));
    if (!within(kitRoot, productionRoot)) fail('--root must be inside the active kit');
    const configPath = path.join(productionRoot, 'config.js');
    if (!existsSync(configPath)) fail(`song config not found: ${configPath}`);
    const rawProject = vm.runInNewContext(readFileSync(configPath, 'utf8') + '\n;PROJECT', { URL, URLSearchParams, console });
    const project = normalizeProject(rawProject);
    if (project.renderEngine !== 'remotion') fail('this browser review helper currently supports rendered Remotion MP4 candidates only');

    const videoPath = path.resolve(productionRoot, String(args.video));
    if (!within(productionRoot, videoPath)) fail('--video must stay inside the song production folder');
    if (!existsSync(videoPath) || !statSync(videoPath).isFile()) fail(`video file not found: ${videoPath}`);
    if (path.extname(videoPath).toLowerCase() !== '.mp4') fail('--video must point to an MP4 candidate');

    const times = String(args.times).split(',').map((x) => Number(x.trim()));
    if (!times.length || times.some((t) => !Number.isFinite(t) || t < 0 || t >= project.duration)) fail(`each sample time must satisfy 0 <= t < PROJECT.duration (${project.duration}s)`);
    if (new Set(times).size !== times.length) fail('--times must not contain duplicates');

    outputDir = path.resolve(productionRoot, String(args.out));
    if (!within(productionRoot, outputDir)) fail('--out must stay inside the song production folder');
    if (existsSync(outputDir)) fail(`refusing to overwrite existing review evidence: ${outputDir}`);

    const chromeCandidates = [
      args.chrome,
      process.env.CHROME_EXECUTABLE,
      process.env.CHROME_BIN,
      process.env.CHROME_PATH,
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ].filter(Boolean);
    const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));
    if (!chromePath) fail('Chrome/Chromium not found; pass --chrome=/absolute/path/to/Chrome or set CHROME_EXECUTABLE');

    const ffmpeg = process.env.FFMPEG || 'ffmpeg';
    const ffmpegProbe = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8' });
    if (ffmpegProbe.error || ffmpegProbe.status !== 0) fail(`FFmpeg is required for the contact sheet: ${ffmpegProbe.error?.message || ffmpegProbe.stderr || `exit ${ffmpegProbe.status}`}`);

    const frameCount = wholeProjectFrameCount(project);
    const expectedVideoDurationSeconds = frameCount / project.fps;
    const videoHash = await sha256(videoPath);
    mkdirSync(path.dirname(outputDir), { recursive: true });
    mkdirSync(outputDir, { recursive: false });
    report = {
      status: 'running',
      tool: 'Playwright headless video decode and sampled-frame capture',
      candidate: path.relative(productionRoot, videoPath),
      candidateSha256: videoHash,
      project: {
        productionId: project.productionId,
        width: project.width,
        height: project.height,
        fps: project.fps,
        configuredAudioDurationSeconds: project.duration,
        expectedVideoFrameCount: frameCount,
        expectedVideoDurationSeconds,
      },
      browser: { executable: chromePath, version: null },
      samples: [],
      diagnostics: { consoleErrors: [], pageErrors: [], failedRequests: [] },
      ffmpegContactSheet: { status: 'pending', path: 'contact-sheet.png' },
      limits: [
        'Headless decoding and sampled screenshots do not establish visual quality or user creative acceptance.',
        'This helper mutes and does not listen to audio; it does not establish audio/video synchronization.',
        'This helper checks the already-rendered MP4, not scene behavior between sampled times.',
      ],
    };

    const fileStat = statSync(videoPath);
    server = createServer((req, res) => {
      if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
      if (req.url === '/') {
        const html = `<!doctype html><meta charset="utf-8"><title>Song candidate frame review</title><style>html,body{margin:0;width:100%;height:100%;background:#111;display:grid;place-items:center}video{display:block;width:${project.width}px;height:${project.height}px;object-fit:contain;background:#000}</style><video id="candidate" src="/candidate.mp4" preload="auto" muted playsinline></video>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(html), 'Cache-Control': 'no-store' });
        res.end(html);
        return;
      }
      if (req.url !== '/candidate.mp4') { res.writeHead(404); res.end('Not found'); return; }
      const range = req.headers.range;
      if (!range) {
        res.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Length': fileStat.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
        if (req.method === 'HEAD') { res.end(); return; }
        createReadStream(videoPath).pipe(res);
        return;
      }
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) { res.writeHead(416, { 'Content-Range': `bytes */${fileStat.size}` }); res.end(); return; }
      let start = match[1] ? Number(match[1]) : 0;
      let end = match[2] ? Number(match[2]) : fileStat.size - 1;
      if (!match[1] && match[2]) { const suffixLength = Number(match[2]); start = Math.max(0, fileStat.size - suffixLength); end = fileStat.size - 1; }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= fileStat.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${fileStat.size}` }); res.end(); return;
      }
      end = Math.min(end, fileStat.size - 1);
      res.writeHead(206, {
        'Content-Type': 'video/mp4',
        'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
      });
      if (req.method === 'HEAD') { res.end(); return; }
      createReadStream(videoPath, { start, end }).pipe(res);
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    const origin = `http://127.0.0.1:${address.port}`;

    browser = await chromium.launch({ executablePath: chromePath, headless: true });
    report.browser.version = browser.version();
    const context = await browser.newContext({ viewport: { width: project.width, height: project.height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    page.on('console', (message) => { if (message.type() === 'error') report.diagnostics.consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => report.diagnostics.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      const error = request.failure()?.errorText || 'unknown request failure';
      const expectedAbort = error.includes('ERR_ABORTED');
      report.diagnostics.failedRequests.push({ url: request.url(), error, classification: expectedAbort ? 'seek-or-navigation-abort' : 'unexpected' });
    });
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const video = document.querySelector('#candidate');
      return video && (video.readyState >= 1 || video.error !== null);
    }, undefined, { timeout: 60000 });
    const metadata = await page.locator('#candidate').evaluate((video) => ({
      durationSeconds: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      readyState: video.readyState,
      networkState: video.networkState,
      muted: video.muted,
      error: video.error ? { code: video.error.code, message: video.error.message } : null,
      canPlayMp4: video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
    }));
    report.videoMetadata = metadata;
    if (metadata.error) fail(`browser could not load candidate video: ${JSON.stringify(metadata.error)}`);
    if (metadata.width !== project.width || metadata.height !== project.height) fail(`candidate dimensions ${metadata.width}x${metadata.height} do not match PROJECT ${project.width}x${project.height}`);
    if (!Number.isFinite(metadata.durationSeconds) || metadata.durationSeconds <= 0) fail('browser reported an invalid candidate duration');

    for (const [index, seconds] of times.entries()) {
      const sample = await page.locator('#candidate').evaluate(async (video, target) => {
        video.pause();
        if (Math.abs(video.currentTime - target) > 0.0005) {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`seek to ${target}s timed out`)), 60000);
            video.addEventListener('seeked', () => { clearTimeout(timer); resolve(); }, { once: true });
            video.currentTime = target;
          });
        }
        if (video.readyState < 2) await new Promise((resolve, reject) => {
          if (video.readyState >= 2) { resolve(); return; }
          const timer = setTimeout(() => reject(new Error(`decoded frame at ${target}s timed out`)), 60000);
          const onLoaded = () => { clearTimeout(timer); resolve(); };
          video.addEventListener('loadeddata', onLoaded, { once: true });
          if (video.readyState >= 2) onLoaded();
        });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return { requestedSeconds: target, browserCurrentTimeSeconds: video.currentTime, readyState: video.readyState, width: video.videoWidth, height: video.videoHeight };
      }, seconds);
      const fileName = `frame-${String(index + 1).padStart(3, '0')}.png`;
      const framePath = path.join(outputDir, fileName);
      await page.locator('#candidate').screenshot({ path: framePath, animations: 'disabled' });
      report.samples.push({ ...sample, frameIndexNearest: Math.round(seconds * project.fps), file: fileName });
      writeFileSync(path.join(outputDir, 'browser-review.json'), JSON.stringify(report, null, 2) + '\n');
    }

    await browser.close();
    browser = null;
    await new Promise((resolve) => server.close(resolve));
    server = null;

    const rows = Math.ceil(times.length / 3);
    const contactSheet = path.join(outputDir, 'contact-sheet.png');
    const filter = `scale=360:-2:flags=lanczos,tile=3x${rows}:nb_frames=${times.length}:padding=10:margin=10:color=0x202020`;
    const ffmpegArgs = [
      '-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-start_number', '1',
      '-i', path.join(outputDir, 'frame-%03d.png'), '-vf', filter, '-frames:v', '1', contactSheet,
    ];
    const contactResult = spawnSync(ffmpeg, ffmpegArgs, { encoding: 'utf8' });
    report.ffmpegContactSheet = {
      status: contactResult.status === 0 && !contactResult.error ? 'created' : 'failed',
      path: 'contact-sheet.png',
      command: [ffmpeg, ...ffmpegArgs],
      stderr: contactResult.stderr || '',
      exitCode: contactResult.status,
    };
    if (contactResult.error || contactResult.status !== 0) fail(`FFmpeg contact-sheet creation failed: ${contactResult.error?.message || contactResult.stderr || `exit ${contactResult.status}`}`);

    const endpointDifferenceSeconds = metadata.durationSeconds - project.duration;
    report.durationComparison = {
      configuredAudioDurationSeconds: project.duration,
      expectedVideoDurationSeconds,
      browserReportedVideoDurationSeconds: metadata.durationSeconds,
      browserVideoMinusConfiguredAudioSeconds: endpointDifferenceSeconds,
      withinOneFrameOfExpected: Math.abs(metadata.durationSeconds - expectedVideoDurationSeconds) <= 1 / project.fps + 0.01,
    };
    report.diagnostics.browserErrors = report.diagnostics.consoleErrors.length + report.diagnostics.pageErrors.length;
    const unexpectedRequestFailures = report.diagnostics.failedRequests.filter((request) => request.classification === 'unexpected').length;
    report.status = report.diagnostics.browserErrors === 0 && unexpectedRequestFailures === 0 ? 'headless-decode-and-capture-passed' : 'completed-with-browser-diagnostics';
    writeFileSync(path.join(outputDir, 'browser-review.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ status: report.status, candidate: videoPath, dimensions: `${metadata.width}x${metadata.height}`, videoDurationSeconds: metadata.durationSeconds, sampledFrames: report.samples.length, contactSheet, evidence: path.join(outputDir, 'browser-review.json') }, null, 2));
    if (report.status !== 'headless-decode-and-capture-passed' || report.diagnostics.failedRequests.some((request) => request.classification === 'unexpected')) process.exitCode = 1;
  } catch (error) {
    if (report && outputDir) {
      report.status = 'failed';
      report.error = error.stack || error.message;
      try { writeFileSync(path.join(outputDir, 'browser-review.json'), JSON.stringify(report, null, 2) + '\n'); } catch {}
    }
    console.error(`Playwright video review: ${error.stack || error.message}`);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) await new Promise((resolve) => server.close(resolve)).catch(() => {});
  }
}
