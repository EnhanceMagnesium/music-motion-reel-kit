// cache-identity.mjs — reproducible identity for cached frames of ONE production, plus manifest compatibility checks.
// Pattern follows renderer/render.v3.mjs (sha256 over spec + scene scripts + cues + assets -> 12-hex job version), but the
// closure is discovered from the entry page instead of hand-listed, and the whole repository collection is never hashed.
//
// Identity covers: entry page bytes; every local classic script / stylesheet it references; every local ES module reachable by
// import / dynamic import from the page or from those modules; the DECLARED production modules and cue module (PROJECT.modules / PROJECT.cues.module, loaded
// at runtime by production/production-host.mjs rather than by script tags) with their own import closures; the normalized PROJECT (including scenes and
// inline cues); declared assets and fonts (PROJECT.assets / PROJECT.fonts, strings or {src} objects, paths relative to the config file); output settings (width, height, fps, jpeg quality, frame naming); and, for third-party packages
// under node_modules, package-lock.json plus installed p5 / p5.brush versions (not their bytes). Audio is NOT part of the frame identity
// (frames do not depend on the soundtrack); it is recorded separately in the manifest. External URLs (e.g. Google Fonts CSS) cannot be
// hashed: they are listed in `externalUrls` and are a known reproducibility gap.
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, relative, sep } from "node:path";
import { declaredFiles } from "../production/manifest.mjs";

export const IDENTITY_SCHEMA = 1;
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const isExternal = (u) => /^([a-z]+:)?\/\//i.test(u) || /^data:/i.test(u);

function localSpecifiers(text, isHtml) {
  const out = [];
  if (isHtml) {
    const t = text.replace(/<!--[\s\S]*?-->/g, "");
    for (const m of t.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) out.push(m[1]);
    for (const m of t.matchAll(/<link[^>]*\shref="([^"]+)"/g)) out.push(m[1]);
  }
  const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
  for (const m of code.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) out.push(m[1]);
  for (const m of code.matchAll(/\b(?:import|export)\s[^"'();]*?from\s*["']([^"']+)["']/g)) out.push(m[1]);
  for (const m of code.matchAll(/\bimport\s*["']([^"']+)["']/g)) out.push(m[1]);
  return out;
}

/** Walk the dependency closure of entryPath. Throws an explicit error for a referenced local file that is missing. */
export function collectClosure(entryPath, { root }) {
  const files = new Map(), external = new Set(), packages = new Set(), queue = [resolve(entryPath)];
  while (queue.length) {
    const f = queue.pop(); if (files.has(f)) continue;
    if (!existsSync(f)) throw new Error(`identity closure: referenced file is missing: ${f}`);
    const buf = readFileSync(f); files.set(f, sha(buf));
    if (!/\.(html|mjs|js)$/.test(f)) continue;
    const isHtml = f.endsWith(".html"), text = buf.toString("utf8");
    for (const s of localSpecifiers(text, isHtml)) {
      if (isExternal(s)) { external.add(s); continue; }
      if (!isHtml && !s.startsWith(".")) continue;             // bare module specifier inside code: not a local file
      const p = resolve(dirname(f), s.split(/[?#]/)[0]);
      const rel = relative(root, p).split(sep);
      if (rel[0] === "node_modules") { packages.add(rel[1].startsWith("@") ? rel.slice(1, 3).join("/") : rel[1]); continue; }
      if (!/\.(js|mjs|css|html)$/.test(p)) continue;
      queue.push(p);
    }
  }
  return { files, external: [...external].sort(), packages: [...packages].sort() };
}

/**
 * computeIdentity({ entryPath, root, project, configDir, output }) -> { identity (64 hex), short (12), files:[{path,sha256}], external, packages, assets }
 * project = normalized PROJECT (assets/fonts keys optional, relative to configDir). output = { jpegQuality }.
 */
export function computeIdentity({ entryPath, root, project, configDir, output = {} }) {
  const { files, external, packages } = collectClosure(entryPath, { root }), extPkgs = new Set(packages), extExternal = new Set(external);
  const assets = [];
  for (const d of declaredFiles(project)) {
    const p = resolve(configDir, d.src);
    if (d.kind === "module" || d.kind === "cues") {                      // runtime-loaded scene/mechanism code: hash it and everything it imports
      const c = collectClosure(p, { root });
      for (const [f, h] of c.files) files.set(f, h);
      c.packages.forEach((x) => extPkgs.add(x)); c.external.forEach((x) => extExternal.add(x));
      continue;
    }
    const key = d.kind === "asset" ? "assets" : "fonts";
    if (!existsSync(p)) throw new Error(`identity: declared ${key} file is missing: ${p}`);
    assets.push({ path: relative(root, p), sha256: sha(readFileSync(p)) });
  }
  const pkgInfo = {};
  for (const name of [...extPkgs].sort()) { const pj = resolve(root, "node_modules", name, "package.json"); pkgInfo[name] = existsSync(pj) ? JSON.parse(readFileSync(pj, "utf8")).version : null; }
  const lock = resolve(root, "package-lock.json");
  const settings = { width: project.width, height: project.height, fps: project.fps, jpegQuality: output.jpegQuality ?? null, naming: "f%05d.jpg", ...output };
  const listing = [...files].map(([p, h]) => ({ path: relative(root, p), sha256: h })).sort((a, b) => a.path.localeCompare(b.path));
  const body = JSON.stringify({ schema: IDENTITY_SCHEMA, entry: relative(root, resolve(entryPath)), files: listing, assets, packages: pkgInfo, lock: existsSync(lock) ? sha(readFileSync(lock)) : null,
    project: Object.fromEntries(Object.entries(project).sort()), settings });
  const identity = sha(body);
  return { identity, short: identity.slice(0, 12), files: listing, assets, packages: pkgInfo, external: [...extExternal].sort(), settings };
}

/** Manifest saved next to cached frames. */
export function buildManifest({ id, plan, entry }) {
  return {
    schema: IDENTITY_SCHEMA, identity: id.identity, entry, width: plan.width, height: plan.height, fps: plan.fps, jpegQuality: id.settings.jpegQuality,
    interval: { firstFrame: plan.firstFrame, endFrame: plan.endFrame, frameCount: plan.frameCount, localStartSeconds: plan.localStartSeconds, localEndSeconds: plan.localEndSeconds },
    soundtrack: { sourceAudioOffsetSeconds: plan.sourceAudioOffsetSeconds, startSeconds: plan.audio ? plan.audio.startSeconds : null, durationSeconds: plan.audio ? plan.audio.durationSeconds : null, path: plan.audio ? plan.audio.path : null },
    files: id.files, assets: id.assets, packages: id.packages, externalUrls: id.external,
  };
}

/** Compare an existing manifest with the one this run needs. Frames are per-index images, so a different INTERVAL of the same identity is compatible. */
export function checkManifest(existing, expected) {
  if (!existing || typeof existing !== "object") return { compatible: false, mismatches: ["manifest missing or unreadable"] };
  const mismatches = [];
  for (const k of ["schema", "identity", "width", "height", "fps", "jpegQuality", "entry"]) if (existing[k] !== expected[k]) mismatches.push(`${k}: cached ${JSON.stringify(existing[k])} vs requested ${JSON.stringify(expected[k])}`);
  return { compatible: mismatches.length === 0, mismatches };
}
