import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const exampleRoot = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(exampleRoot, '../../..');
const evidenceName = `gsap_choreography_fixture_run_${new Date().toISOString().replace(/[-:.]/g, '')}_${process.pid}`;
const evidenceRoot = path.join(kitRoot, 'repository-preparation', evidenceName);
const sharedEntry = 'shared-animation-library/render.mjs';
const stillTimes = '2.00,0.50,3.50,2.01,1.00';
const variants = [
  { name: 'fixture-4x5', width: 1080, height: 1350 },
  { name: 'fixture-9x16', width: 1080, height: 1920 },
];

assert.equal(existsSync(evidenceRoot), false, `Refusing to overwrite evidence folder: ${evidenceRoot}`);
mkdirSync(evidenceRoot, { recursive: false });

const require = createRequire(import.meta.url);
const normalizeProject = require(path.join(kitRoot, 'shared-animation-library/base/src/project-config.js'));
const runtimePackage = JSON.parse(readFileSync(path.join(kitRoot, 'shared-animation-library/remotion-runtime/package.json'), 'utf8'));
const packageVersions = {
  remotion: runtimePackage.dependencies.remotion,
  remotionGsap: runtimePackage.dependencies['@remotion/gsap'],
  gsap: runtimePackage.dependencies.gsap,
};
assert.equal(packageVersions.remotion, '4.0.538');
assert.equal(packageVersions.remotionGsap, packageVersions.remotion);
assert.equal(packageVersions.gsap, '3.15.0');
const sourceFiles = variants.map(({ name }) => path.join(exampleRoot, name, 'remotion/scenes.jsx'));
const sceneSources = sourceFiles.map((sourceFile) => readFileSync(sourceFile, 'utf8'));
assert.equal(sceneSources[0], sceneSources[1], 'Format fixtures should share the same scene source');
assert.match(sceneSources[0], /useGsapTimeline/);
assert.match(sceneSources[0], /timeline\.fromTo\(/);
assert.doesNotMatch(sceneSources[0], /Math\.random\s*\(/, 'Scene code must not use unseeded randomness');
assert.doesNotMatch(sceneSources[0], /timeline\.(play|seek|restart|reverse)\s*\(/, 'Remotion must remain the timeline clock');
const configChecks = variants.map((variant) => {
  const configPath = path.join(exampleRoot, variant.name, 'config.js');
  const raw = vm.runInNewContext(`${readFileSync(configPath, 'utf8')}\n;PROJECT`, { URL, URLSearchParams, console });
  const project = normalizeProject(raw);
  assert.equal(project.renderEngine, 'remotion');
  assert.deepEqual([project.width, project.height], [variant.width, variant.height]);
  assert.equal(project.duration, 4);
  assert.equal(project.scenes.length, 1);
  assert.equal(project.scenes[0].impl, 'ChoreographyStudy');
  assert.equal(project.audio, undefined);
  return { productionId: project.productionId, renderEngine: project.renderEngine, width: project.width, height: project.height, fps: project.fps, duration: project.duration, scenes: project.scenes.map(({ id, impl, start, end }) => ({ id, impl, start, end })), audioDeclared: Boolean(project.audio) };
});
const staticCheck = {
  sceneSourcesIdentical: true,
  sceneUsesRemotionGsapHook: true,
  sceneUsesTimelineFromTo: true,
  noUnseededRandomness: true,
  noTimelinePlaybackOrSeekCalls: true,
  configs: configChecks,
};
writeFileSync(path.join(evidenceRoot, 'static-check.json'), `${JSON.stringify(staticCheck, null, 2)}\n`);

const runs = [];
function execute(label, args) {
  const command = `node ${args.join(' ')}`;
  const result = spawnSync(process.execPath, args, { cwd: kitRoot, encoding: 'utf8' });
  const record = {
    label,
    command,
    exitCode: result.status ?? 1,
    signal: result.signal ?? null,
    error: result.error?.message ?? null,
  };
  runs.push(record);
  writeFileSync(path.join(evidenceRoot, `${label}.stdout.txt`), result.stdout ?? '');
  writeFileSync(path.join(evidenceRoot, `${label}.stderr.txt`), result.stderr ?? '');
  writeFileSync(path.join(evidenceRoot, `${label}.status.json`), `${JSON.stringify(record, null, 2)}\n`);
  return record;
}

const planResults = variants.map(({ name }) => execute(`plan-${name}`, [
  sharedEntry,
  `--root=shared-animation-library/examples/remotion-gsap-choreography/${name}`,
  '--plan',
]));

let stillResults = [];
if (planResults.every(({ exitCode }) => exitCode === 0)) {
  stillResults = variants.map(({ name }) => {
    const reviewDir = `review/${evidenceName}`;
    const absoluteOutput = path.join(exampleRoot, name, reviewDir);
    assert.equal(existsSync(absoluteOutput), false, `Refusing to overwrite fixture still directory: ${absoluteOutput}`);
    return execute(`stills-${name}`, [
      sharedEntry,
      `--root=shared-animation-library/examples/remotion-gsap-choreography/${name}`,
      `--stills=${stillTimes}`,
      `--out=${reviewDir}`,
    ]);
  });
}

const imageChecks = [];
if (planResults.every(({ exitCode }) => exitCode === 0) && stillResults.every(({ exitCode }) => exitCode === 0)) {
  for (const variant of variants) {
    const reviewDir = path.join(exampleRoot, variant.name, 'review', evidenceName);
    const expected = ['t2_00.png', 't0_50.png', 't3_50.png', 't2_01.png', 't1_00.png'];
    const images = expected.map((filename) => {
      const imagePath = path.join(reviewDir, filename);
      assert.ok(existsSync(imagePath), `Missing still: ${imagePath}`);
      const bytes = readFileSync(imagePath);
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `Not a PNG: ${imagePath}`);
      const width = bytes.readUInt32BE(16);
      const height = bytes.readUInt32BE(20);
      assert.deepEqual([width, height], [variant.width, variant.height], `Wrong dimensions: ${imagePath}`);
      return { filename, width, height, sha256: createHash('sha256').update(bytes).digest('hex') };
    });
    const frame48a = images.find(({ filename }) => filename === 't2_00.png');
    const frame48b = images.find(({ filename }) => filename === 't2_01.png');
    assert.equal(frame48a.sha256, frame48b.sha256, `${variant.name}: times 2.00 and 2.01 did not produce identical frame-48 PNGs`);
    imageChecks.push({ variant: variant.name, expectedDimensions: [variant.width, variant.height], requestedTimes: stillTimes, expectedFrames: [48, 12, 84, 48, 24], images });
  }
}

const report = {
  purpose: 'Song-neutral GSAP choreography fixture; no song production was modified or rendered.',
  environment: { node: process.version, platform: process.platform, arch: process.arch },
  packageVersions,
  evidenceRoot,
  stillTimes,
  planResults,
  stillResults,
  imageChecks,
  overall: planResults.every(({ exitCode }) => exitCode === 0)
    && stillResults.length === variants.length
    && stillResults.every(({ exitCode }) => exitCode === 0)
    && imageChecks.length === variants.length,
};
writeFileSync(path.join(evidenceRoot, 'run-summary.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.overall) process.exitCode = 1;
