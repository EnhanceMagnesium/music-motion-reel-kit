// overlay-dispatcher.mjs — state-isolating, ordered dispatcher for the canonical base's single `overlayHook(ctx, t)` slot
// (src/core.js composite(): called after grain compositing). Pure ES module; `host` is any object (window in the browser).
//
// Layers: { id, order, draw(ctx, t) }. Drawn ascending by order, ties by registration. The hook that existed on the host
// at install time (e.g. karaoke.js) becomes layer "previous-hook" at PREVIOUS_HOOK_ORDER.
// Documented order: particles (10) below previous-hook/karaoke (20), so lyrics stay legible on top of effects.
// Each layer runs inside save()/try/finally/restore() after resetting transform, alpha, composite, shadow and filter.
// A layer that leaves its OWN nested saves unbalanced is its own bug (the r06 particle adapter balances its saves in finally).
// A layer error propagates (the host render rejects) after the context state has been restored; later layers do not run.
// Install AFTER karaoke.js: a script that assigns window.overlayHook later would overwrite the dispatcher.
export const PREVIOUS_HOOK_ID = "previous-hook";
export const PREVIOUS_HOOK_ORDER = 20;
export const PARTICLE_LAYER_ORDER = 10;
const MARK = Symbol.for("shared-animation-library.overlayDispatcher");

function resetState(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.shadowColor = "rgba(0,0,0,0)";
  if ("filter" in ctx) ctx.filter = "none";
}

/** The dispatcher installed on host, or undefined. */
export const getOverlayDispatcher = (host) => host[MARK];

export function installOverlayDispatcher(host) {
  if (host[MARK]) return host[MARK];                       // duplicate install: same instance, no re-wrapping
  const previous = host.overlayHook;
  const layers = []; let seq = 0, disposed = false;
  const sorted = () => layers.slice().sort((a, b) => a.order - b.order || a.seq - b.seq);
  if (typeof previous === "function") layers.push({ id: PREVIOUS_HOOK_ID, order: PREVIOUS_HOOK_ORDER, seq: seq++, draw: previous });
  function hook(ctx, t) {
    if (disposed) { if (typeof previous === "function") return previous(ctx, t); return; }   // stays valid if another wrapper sits above us
    if (!Number.isFinite(t)) throw new RangeError(`overlay time must be finite, got ${t}`);
    for (const L of sorted()) {
      ctx.save();
      try { resetState(ctx); L.draw(ctx, t); } finally { ctx.restore(); }
    }
  }
  const api = {
    hook,
    addLayer({ id, order, draw }) {
      if (disposed) throw new Error("dispatcher disposed");
      if (typeof id !== "string" || !id) throw new TypeError("layer id must be a non-empty string");
      if (layers.some((l) => l.id === id)) throw new Error(`duplicate layer id "${id}"`);
      if (!Number.isFinite(order)) throw new RangeError("layer order must be finite");
      if (typeof draw !== "function") throw new TypeError("layer draw must be a function");
      layers.push({ id, order, seq: seq++, draw });
    },
    removeLayer(id) { const i = layers.findIndex((l) => l.id === id); if (i >= 0) layers.splice(i, 1); return i >= 0; },
    layerIds: () => sorted().map((l) => l.id),
    get disposed() { return disposed; },
    dispose() {
      if (disposed) return; disposed = true; delete host[MARK];
      if (host.overlayHook === hook) { if (previous === undefined) delete host.overlayHook; else host.overlayHook = previous; }
    },
  };
  host[MARK] = api; host.overlayHook = hook;
  return api;
}
