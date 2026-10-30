// production-host.mjs — wires a declared production into the canonical base host (window). Called from the production page AFTER overlays:
//   (window.READY_PROMISES ||= []).push(import('../adapters/host-integration.mjs').then(m => m.installLibraryOverlays(window, N, opts))
//       .then(() => import('../production/production-host.mjs')).then(m => m.installProduction(window, N, { configUrl })))
// (ONE chained promise: core.js awaits READY_PROMISES with Promise.all, so separate pushes would race the dispatcher install.)
// A config without `scenes` makes this a no-op (returns null). It never touches #out, clears, renders or encodes.
// File URLs resolve against configUrl (the URL of the production's config.js), exactly like render.mjs / cache-identity resolve against the config folder.
// Failure cleanup (verified cases in tests/verify-production.mjs): registerSceneImpl restored/removed, scene overlay layer removed, a dispatcher created here disposed,
// a pre-existing dispatcher and its layers untouched, initialized scenes disposed. shots() has no unregister, so a failure inside host.shots itself is not undoable.
// Failure: the returned promise rejects with ProductionLoadError (stage/id/cause) and sets host.PRODUCTION_ERROR; core.js then never sets window.ready,
// and render.mjs logs the page error. Shots are registered only after every load and init step succeeded.
import { installOverlayDispatcher, getOverlayDispatcher } from "../adapters/overlay-dispatcher.mjs";
import { createSceneRegistry, startProduction, ProductionLoadError } from "./scene-runtime.mjs";
import { normalizeCues } from "./cue-schema.mjs";

export const SCENE_LAYER_ID = "scene-overlays";
export const SCENE_LAYER_ORDER = 15;   // above R06 particles (10), below karaoke/previous hook (20)
export { ProductionLoadError };

const urlOf = (configUrl, src) => new URL(src, configUrl).href;

/** Browser loaders over a window-like host. Exported so tests can drive them with a fake document. */
export function browserLoaders(host, configUrl, registry) {
  const doc = host.document;
  return {
    loadModule: ({ src, type }) => type === "module" ? import(/* @vite-ignore */ urlOf(configUrl, src)) : new Promise((res, rej) => {
      const s = doc.createElement("script"); s.async = false; s.src = urlOf(configUrl, src);
      s.onload = () => res(undefined); s.onerror = () => rej(new Error(`script failed to load: ${s.src}`)); doc.head.appendChild(s);
    }),
    async loadCues(project) { const m = await import(/* @vite-ignore */ urlOf(configUrl, project.cues.module)); return m.default; },
    async loadFont({ face, src }) {
      const f = new host.FontFace(face.family, `url(${JSON.stringify(urlOf(configUrl, src))})`, { ...(face.weight !== undefined ? { weight: String(face.weight) } : {}), ...(face.style ? { style: face.style } : {}), ...(face.unicodeRange ? { unicodeRange: face.unicodeRange } : {}) });
      await f.load(); doc.fonts.add(f); return f;
    },
    async loadAsset({ src, assetKind, id }) {
      const url = urlOf(configUrl, src);
      if (assetKind === "image") { const img = new host.Image(); img.src = url; await img.decode(); return img; }
      if (assetKind === "data") { const m = await import(/* @vite-ignore */ url); return m.default ?? m; }
      return Object.freeze({ id, url });   // 'other': resolved URL only; the scene that owns it loads it
    },
  };
}

export async function installProduction(host, project, { configUrl, loaders } = {}) {
  if (!project || project.normalized !== true) throw new TypeError("installProduction needs the object returned by normalizeProject(PROJECT)");
  if (!project.scenes || !project.scenes.length) return null;
  if (typeof host.shots !== "function") throw new TypeError("host has no shots(): load base/src/timeline.js first");
  if (host.PRODUCTION) throw new Error("a production is already installed on this host");
  const registry = createSceneRegistry();
  const hadReg = Object.prototype.hasOwnProperty.call(host, "registerSceneImpl"), prevReg = host.registerSceneImpl;
  const preDispatcher = getOverlayDispatcher(host);
  const hadProd = Object.prototype.hasOwnProperty.call(host, "PRODUCTION"), prevProd = host.PRODUCTION;
  let production = null, layerAdded = false, listenerAdded = false;
  const onHide = () => { if (production) production.dispose().catch(() => {}); };
  host.registerSceneImpl = (id, impl) => registry.register(id, impl);   // for classic-script modules; temporary until load succeeds
  try {
    const ld = loaders || browserLoaders(host, configUrl || host.location.href, registry);
    production = await startProduction({ project, registry, loaders: ld, normalizeCues, host });
    const dispatcher = installOverlayDispatcher(host);
    dispatcher.addLayer({ id: SCENE_LAYER_ID, order: SCENE_LAYER_ORDER, draw: (ctx, t) => production.overlay(ctx, t) }); layerAdded = true;
    if (typeof host.addEventListener === "function") { host.addEventListener("pagehide", onHide); listenerAdded = true; }
    host.shots(production.shots());
    host.PRODUCTION = production;   // last step: nothing after it can fail, so a failed install never leaves a pointer
    return production;
  } catch (e) {
    // restore the host: registration hook, our overlay layer, a dispatcher we created, and resources we initialized
    if (hadReg) host.registerSceneImpl = prevReg; else delete host.registerSceneImpl;
    const d = getOverlayDispatcher(host);
    if (d) { if (layerAdded) d.removeLayer(SCENE_LAYER_ID); if (!preDispatcher) d.dispose(); }
    if (listenerAdded && typeof host.removeEventListener === "function") { try { host.removeEventListener("pagehide", onHide); } catch {} }
    if (hadProd) host.PRODUCTION = prevProd; else delete host.PRODUCTION;
    if (production) await production.dispose().catch(() => {});
    host.PRODUCTION_ERROR = { stage: e.stage || "install", id: e.id || null, message: e.message };
    throw e;
  }
}
