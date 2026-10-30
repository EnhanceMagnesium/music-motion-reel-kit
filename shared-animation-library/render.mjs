#!/usr/bin/env node
// Shared render front door: routes legacy p5 projects and new Remotion projects from the same song PROJECT config.
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const normalizeProject = require('./base/src/project-config.js');
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const text = arg.replace(/^--/, '');
  const split = text.indexOf('=');
  return split < 0 ? [text, true] : [text.slice(0, split), text.slice(split + 1)];
}));
const fail = (message) => { console.error(`Shared renderer: ${message}`); process.exit(2); };

if (args.help || !args.root) {
  console.log('Usage: node shared-animation-library/render.mjs --root=<song-production> --plan | --render | --stills=t1,t2,...');
  console.log('The song config selects renderEngine: "p5" (legacy default) or "remotion". Existing p5 flags pass through to base/render.mjs.');
  if (!args.root && !args.help) process.exitCode = 2;
} else {
  const productionRoot = path.resolve(String(args.root));
  const configPath = path.join(productionRoot, 'config.js');
  let project;
  try {
    const raw = vm.runInNewContext(readFileSync(configPath, 'utf8') + '\n;PROJECT', { URL, URLSearchParams, console });
    project = normalizeProject(raw);
  } catch (error) {
    fail(`could not load/normalize ${configPath}: ${error.message}`);
  }

  const engine = project.renderEngine || 'p5';
  if (engine === 'remotion') {
    try {
      const { renderRemotion } = await import('./remotion-runtime/render.mjs');
      await renderRemotion({ root: productionRoot, project, args });
    } catch (error) {
      fail(error.stack || error.message);
    }
  } else if (engine === 'p5') {
    const passthrough = process.argv.slice(2);
    const result = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'base/render.mjs'), ...passthrough], { stdio: 'inherit', cwd: process.cwd() });
    if (result.error) fail(result.error.message);
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  } else {
    fail(`unknown PROJECT.renderEngine "${engine}"; use "p5" or "remotion"`);
  }
}
