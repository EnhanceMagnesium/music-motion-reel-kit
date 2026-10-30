#!/usr/bin/env node
// Heuristic scan for isolated one-frame image anomalies and coarse per-second
// adjacent-frame luma changes in an already-rendered candidate. This is QA,
// not a renderer and not a pass/fail judgment.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const usage = `Usage:
  node shared-animation-library/quality-review/temporal-stability-scan.mjs \\
    --video=productions/<song>/out/<candidate>.mp4 \\
    --out=productions/<song>/review/temporal-stability-candidate-01.json \\
    [--gray-size=120x150] [--threshold=0.05] [--ffmpeg=/path/to/ffmpeg] [--ffprobe=/path/to/ffprobe]

The scan decodes an existing video to small grayscale frames. It writes JSON
only; it does not render video, save stills, make a contact sheet, or judge
whether detected changes are intentional.`;

function fail(message, code = 2) {
  console.error(`${message}\n\n${usage}`);
  process.exit(code);
}

const options = {};
for (const arg of process.argv.slice(2)) {
  if (arg === '--help' || arg === '-h') {
    console.log(usage);
    process.exit(0);
  }
  const match = /^--([^=]+)=(.*)$/.exec(arg);
  if (!match) fail(`Invalid argument: ${arg}`);
  options[match[1]] = match[2];
}

const video = options.video ? path.resolve(options.video) : '';
const out = options.out ? path.resolve(options.out) : '';
if (!video || !out) fail('Both --video and --out are required.');
if (!fs.existsSync(video) || !fs.statSync(video).isFile()) fail(`Video file not found: ${video}`);
if (video === out) fail('Output JSON path must differ from the video path.');
if (fs.existsSync(out)) fail(`Refusing to overwrite existing output: ${out}`);

const ffmpeg = options.ffmpeg || 'ffmpeg';
const ffprobe = options.ffprobe || 'ffprobe';
const sizeMatch = /^(\d+)x(\d+)$/.exec(options['gray-size'] || '120x150');
if (!sizeMatch) fail('--gray-size must look like 120x150.');
const grayWidth = Number(sizeMatch[1]);
const grayHeight = Number(sizeMatch[2]);
if (grayWidth < 8 || grayHeight < 8 || grayWidth > 1024 || grayHeight > 1024) {
  fail('--gray-size values must be between 8 and 1024 pixels.');
}
const threshold = Number(options.threshold ?? '0.05');
if (!Number.isFinite(threshold) || threshold < 0) fail('--threshold must be a non-negative grayscale value.');

function runFfprobe() {
  const result = spawnSync(ffprobe, [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,avg_frame_rate,r_frame_rate,nb_frames,duration',
    '-of', 'json', video,
  ], { encoding: 'utf8' });
  if (result.error) throw new Error(`Could not launch ffprobe (${ffprobe}): ${result.error.message}`);
  if (result.status !== 0) throw new Error(`ffprobe exited ${result.status}: ${result.stderr.trim()}`);
  const stream = JSON.parse(result.stdout).streams?.[0];
  if (!stream) throw new Error('ffprobe found no video stream.');
  const parseRate = (value) => {
    const [n, d] = String(value || '').split('/').map(Number);
    return Number.isFinite(n) && Number.isFinite(d) && d !== 0 ? n / d : NaN;
  };
  const fps = parseRate(stream.avg_frame_rate) || parseRate(stream.r_frame_rate);
  if (!Number.isFinite(fps) || fps <= 0) throw new Error('Could not determine a positive video frame rate.');
  return { stream, fps };
}

const meanAbs = (a, b) => {
  let total = 0;
  for (let i = 0; i < a.length; i++) total += Math.abs(a[i] - b[i]);
  return total / a.length;
};

async function decodeAndScan(fps) {
  const frameBytes = grayWidth * grayHeight;
  const filter = `scale=${grayWidth}:${grayHeight}:force_original_aspect_ratio=decrease,pad=${grayWidth}:${grayHeight}:(ow-iw)/2:(oh-ih)/2:color=black,format=gray`;
  const args = [
    '-hide_banner', '-loglevel', 'error', '-i', video, '-map', '0:v:0',
    '-vf', filter, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1',
  ];
  const child = spawn(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const isolated = [];
  const perSecond = [];
  let pending = Buffer.alloc(0);
  let older = null;
  let previous = null;
  let frameCount = 0;
  let stderr = '';

  const consume = (frame) => {
    if (previous) {
      const adjacent = meanAbs(previous, frame);
      const second = Math.floor(frameCount / fps);
      const bucket = perSecond[second] || (perSecond[second] = { second, count: 0, sum: 0, max: 0 });
      bucket.count++;
      bucket.sum += adjacent;
      bucket.max = Math.max(bucket.max, adjacent);
    }
    if (older && previous) {
      const left = meanAbs(older, previous);
      const right = meanAbs(previous, frame);
      const neighbors = meanAbs(older, frame);
      const score = Math.min(left, right) - neighbors;
      if (score > threshold) {
        const index = frameCount - 1;
        isolated.push({
          frame: index,
          secondsAtNominalFps: Number((index / fps).toFixed(6)),
          scoreGrayLevels: Number(score.toFixed(6)),
          previousToCandidate: Number(left.toFixed(6)),
          candidateToNext: Number(right.toFixed(6)),
          previousToNext: Number(neighbors.toFixed(6)),
        });
      }
    }
    older = previous;
    previous = frame;
    frameCount++;
  };

  const result = await new Promise((resolve, reject) => {
    child.stdout.on('data', (chunk) => {
      pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
      while (pending.length >= frameBytes) {
        consume(Buffer.from(pending.subarray(0, frameBytes)));
        pending = pending.subarray(frameBytes);
      }
    });
    child.stderr.on('data', (chunk) => {
      if (stderr.length < 65536) stderr += chunk.toString('utf8').slice(0, 65536 - stderr.length);
    });
    child.on('error', (error) => reject(new Error(`Could not launch ffmpeg (${ffmpeg}): ${error.message}`)));
    child.on('close', (code, signal) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited ${code ?? 'null'}${signal ? ` (${signal})` : ''}: ${stderr.trim()}`));
      if (pending.length !== 0) return reject(new Error(`Decoded output ended with ${pending.length} incomplete frame bytes.`));
      if (frameCount < 1) return reject(new Error('ffmpeg decoded no video frames.'));
      resolve({ frameCount, isolated, perSecond });
    });
  });

  return {
    ...result,
    perSecondAdjacentFrameLuma: result.perSecond.map(({ second, count, sum, max }) => ({
      second,
      pairCount: count,
      meanAbsoluteDifferenceGrayLevels: Number((sum / count).toFixed(6)),
      maxAbsoluteDifferenceGrayLevels: Number(max.toFixed(6)),
    })),
  };
}

try {
  const { stream, fps } = runFfprobe();
  const scan = await decodeAndScan(fps);
  const stat = fs.statSync(video);
  const report = {
    status: 'scan-completed-review-required',
    video,
    videoBytes: stat.size,
    sourceFrameSize: { width: Number(stream.width), height: Number(stream.height) },
    frameRate: fps,
    sourceFrameCountReported: stream.nb_frames ? Number(stream.nb_frames) : null,
    decodedFrameCount: scan.frameCount,
    decodedDurationAtNominalFpsSeconds: Number((scan.frameCount / fps).toFixed(6)),
    method: {
      downscaledGrayscaleSize: { width: grayWidth, height: grayHeight },
      isolatedFrameHeuristic: 'Flag a center frame when it differs from both adjacent frames more than those adjacent frames differ from each other.',
      thresholdGrayLevels: threshold,
      isolatedCandidateCount: scan.isolated.length,
      adjacentFrameLumaSummary: 'Per-second mean and maximum absolute grayscale difference; diagnostic only, with no pass threshold.',
    },
    isolatedFrameCandidates: scan.isolated,
    perSecondAdjacentFrameLuma: scan.perSecondAdjacentFrameLuma,
    tools: { ffmpeg, ffprobe },
    limits: [
      'The isolated-frame heuristic can flag intentional one-frame events and can miss multi-frame or periodic flicker.',
      'Downscaled grayscale differences do not identify the cause or judge whether motion is artistically intentional.',
      'Per-second luma values are comparative diagnostics, not a quality score or universal acceptance threshold.',
      'This scan does not establish smooth motion, playback performance, audio sync, visual acceptance, or user acceptance.',
    ],
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (fs.existsSync(out)) throw new Error(`Refusing to overwrite existing output: ${out}`);
  fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify({ status: report.status, decodedFrameCount: scan.frameCount, isolatedFrameCandidateCount: scan.isolated.length, output: out }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
