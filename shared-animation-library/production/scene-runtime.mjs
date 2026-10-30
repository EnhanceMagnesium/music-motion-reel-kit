// scene-runtime.mjs — deterministic scene registration, load/readiness orchestration and seek-safe dispatch. Pure ES module: no DOM, no fs.
// Browser/Node specifics (script loading, FontFace, Image) are injected as `loaders`, so the same code runs in the page and in tests.
//
// SCENE IMPLEMENTATION (registered under an id; a scene's `impl` names it):
//   { draw(st), overlay?(ctx, st), init?(env), dispose?(env), seek?(st) }
//   draw    paints the WHOLE frame as a pure function of `st` (the shots() contract of base/src/timeline.js).
//   overlay optional crisp Canvas2D layer on the composited frame (native screen pixels, above grain, below karaoke): used by canvas mechanisms
//           (R06 critter rig, R06 particles). Called only while its scene is active.
//   init    once, after all modules, cues, fonts and assets are ready; may allocate buffers/caches from `env`; must not depend on time.
//   dispose once at teardown, reverse of init order; also runs for already-initialized scenes when a later init fails.
//   seek    OPTIONAL. Declares that the implementation keeps frame-history state; it is called with the SceneTime immediately BEFORE every
//           draw/overlay call and must make that call depend only on `st`. Without seek an implementation must be stateless between frames:
//           frames render in parallel and out of order, so no carry-over is allowed.
// SCENE TIME `st` (frozen; all times are PRODUCTION seconds unless named otherwise):
//   t authoritative production time · localT = t - scene.start · duration = scene.end - scene.start · frame = round(t*fps) (informational)
//   sourceT = master-recording time (timebase.mjs) · sceneId · sceneIndex · fps · width · height · params · cues (normalized cue index)
import { videoToSourceSeconds } from "../numeric/timebase.mjs";
import { declaredFiles } from "./manifest.mjs";

export class ProductionLoadError extends Error {
  constructor(stage, id, cause) { super(`production load failed at ${stage}${id ? ` "${id}"` : ""}: ${cause && cause.message || cause}`); this.name = "ProductionLoadError"; this.stage = stage; this.id = id; this.cause = cause; }
}

/** Production coverage is the half-open interval [coverage.start, coverage.end); outside it no scene draws or overlays. */
export function inCoverage(project, t) {
  const c = project.coverage || { start: 0, end: project.duration };
  return t >= c.start && t < c.end;
}

/** Index of the scene active at t — the same rule as base/src/timeline.js drawWorld: last scene with start <= t, else the first. */
export function sceneIndexAt(scenes, t) {
  let i = 0; while (i + 1 < scenes.length && t >= scenes[i + 1].start) i++;
  return i;
}

export function sceneTimeAt(project, scenes, index, t, cues) {
  const s = scenes[index];
  return Object.freeze({ t, localT: t - s.start, duration: s.end - s.start, frame: Math.round(t * project.fps), sourceT: videoToSourceSeconds(t, project.sourceAudioOffsetSeconds),
    sceneId: s.id, sceneIndex: index, fps: project.fps, width: project.width, height: project.height, params: s.params, cues });
}

export function createSceneRegistry() {
  const impls = new Map();
  return {
    register(id, impl) {
      if (typeof id !== "string" || !id) throw new TypeError("scene implementation id must be a non-empty string");
      if (!impl || typeof impl.draw !== "function") throw new TypeError(`scene implementation "${id}" needs a draw(st) function`);
      for (const k of ["overlay", "init", "dispose", "seek"]) if (impl[k] !== undefined && typeof impl[k] !== "function") throw new TypeError(`scene implementation "${id}".${k} must be a function`);
      if (impls.has(id)) throw new Error(`scene implementation "${id}" is already registered`);
      impls.set(id, impl);
    },
    has: (id) => impls.has(id), get: (id) => impls.get(id), ids: () => [...impls.keys()],
  };
}

/**
 * startProduction({ project, registry, loaders, normalizeCues, host })
 *   loaders.loadModule({id, src, type}) -> Promise (scripts may call registry.register; ES modules may also export `scenes` {implId: impl}, returned here)
 *   loaders.loadCues(project) -> Promise<cueDoc> | cueDoc | undefined ; loaders.loadFont(face-descriptor) ; loaders.loadAsset(descriptor) -> resource
 * Order: modules (project.moduleLoadOrder, sequential) -> cues -> fonts+assets (parallel; all failures reported, declaration order) -> scene->impl resolution -> init in scene order.
 * Returns { scenes, cues, assets, shots(), overlay(ctx,t), dispose() }. Any failure disposes whatever was initialized and throws ProductionLoadError.
 */
export async function startProduction({ project, registry, loaders, normalizeCues, host = null }) {
  const scenes = project.scenes || [];
  if (!scenes.length) throw new ProductionLoadError("config", null, new Error("project declares no scenes"));
  const files = declaredFiles(project), loaded = [];
  for (const f of files.filter((x) => x.kind === "module")) {
    let exportsObj;
    try { exportsObj = await loaders.loadModule(f); } catch (e) { throw new ProductionLoadError("module", f.id, e); }
    try { const map = exportsObj && exportsObj.scenes; if (map) for (const [id, impl] of Object.entries(map)) registry.register(id, impl); } catch (e) { throw new ProductionLoadError("module", f.id, e); }
    loaded.push(f.id);
  }
  let cues;
  try {
    const doc = project.cues ? (project.cues.entries ? project.cues : await loaders.loadCues(project)) : undefined;
    cues = normalizeCues(doc, project);
  } catch (e) { throw new ProductionLoadError("cues", null, e); }
  const settle = async (stage, items, fn) => {
    const res = await Promise.allSettled(items.map(fn)), bad = res.map((r, i) => [r, items[i]]).filter(([r]) => r.status === "rejected");
    if (bad.length) throw new ProductionLoadError(stage, bad.map(([, f]) => f.id).join(", "), new Error(bad.map(([r, f]) => `${f.src}: ${r.reason && r.reason.message || r.reason}`).join("; ")));
    return res.map((r) => r.value);
  };
  await settle("font", files.filter((x) => x.kind === "font"), (f) => loaders.loadFont(f));
  const assetFiles = files.filter((x) => x.kind === "asset"), assetValues = await settle("asset", assetFiles, (f) => loaders.loadAsset(f));
  const assets = new Map(assetFiles.map((f, i) => [f.id, assetValues[i]]));
  for (const s of scenes) {
    if (!registry.has(s.impl)) throw new ProductionLoadError("impl", s.id, new Error(`scene "${s.id}" names implementation "${s.impl}", which no loaded module registered (loaded modules: ${loaded.join(", ") || "none"}; registered: ${registry.ids().join(", ") || "none"})`));
  }
  const inited = []; let disposed = false;
  const dispose = async () => { if (disposed) return; disposed = true; const errs = []; for (const [impl, env] of inited.slice().reverse()) { try { if (impl.dispose) await impl.dispose(env); } catch (e) { errs.push(e); } } if (errs.length) throw new AggregateError(errs, "scene dispose failed"); };
  const fonts = files.filter((x) => x.kind === "font").map((x) => x.face.family);
  for (const s of scenes) {
    const impl = registry.get(s.impl); if (inited.some(([i]) => i === impl)) continue;
    const env = Object.freeze({ project, cues, assets, fonts, host, scene: s });
    try { if (impl.init) await impl.init(env); inited.push([impl, env]); }
    catch (e) { await dispose().catch(() => {}); throw new ProductionLoadError("init", s.id, e); }
  }
  const call = (impl, fn, t, ...pre) => { const i = sceneIndexAt(scenes, t), st = sceneTimeAt(project, scenes, i, t, cues); if (impl.seek) impl.seek(st); return fn(...pre, st); };
  return {
    scenes, cues, assets, dispose,
    shots: () => scenes.map((s, i) => [s.start, (t) => { if (!inCoverage(project, t)) return; const impl = registry.get(s.impl); const st = sceneTimeAt(project, scenes, i, t, cues); if (impl.seek) impl.seek(st); impl.draw(st); }]),
    overlay(ctx, t) { if (!inCoverage(project, t)) return; const i = sceneIndexAt(scenes, t), impl = registry.get(scenes[i].impl); if (impl.overlay) call(impl, (c, st) => impl.overlay(c, st), t, ctx); },
  };
}
