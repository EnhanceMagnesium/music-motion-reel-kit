// host-integration.mjs — wires library layers into the canonical base host (window).
// Called from the production page AFTER all classic scripts, via
//   (window.READY_PROMISES ||= []).push(import('../adapters/host-integration.mjs').then(m => m.installLibraryOverlays(window, normalizeProject(PROJECT), opts)))
// so core.js setup() awaits it before exposing window.ready. This module never touches #out, clears, renders or encodes.
import { installOverlayDispatcher, getOverlayDispatcher, PARTICLE_LAYER_ORDER } from "./overlay-dispatcher.mjs";
import { createParticleLayer } from "./r06-burst-particles.mjs";

export const PARTICLE_LAYER_ID = "r06-burst-particles";

/**
 * project: the object returned by normalizeProject() (src/project-config.js): width/height/seed/sourceAudioOffsetSeconds are already validated.
 * opts.particleEvents: events for createParticleLayer (production-owned; empty/omitted = dispatcher only).
 * TRANSACTIONAL: everything that can fail (project check, event validation, layer construction) happens before the host is touched; if
 * registration still fails after a NEW dispatcher was installed, that dispatcher is disposed (previous hook restored). A pre-existing
 * dispatcher and its previously valid layers are never disturbed by a rejected installation.
 */
export async function installLibraryOverlays(host, project, { particleEvents = [] } = {}) {
  if (!project || project.normalized !== true) throw new TypeError("installLibraryOverlays needs the object returned by normalizeProject(PROJECT)");
  const layer = particleEvents.length ? createParticleLayer({ events: particleEvents, seed: project.seed, sourceAudioOffsetSeconds: project.sourceAudioOffsetSeconds }) : null;   // throws before any host change
  const existing = getOverlayDispatcher(host), dispatcher = installOverlayDispatcher(host);
  try {
    if (layer && !dispatcher.layerIds().includes(PARTICLE_LAYER_ID))
      dispatcher.addLayer({ id: PARTICLE_LAYER_ID, order: PARTICLE_LAYER_ORDER, draw: (ctx, t) => layer.draw({ ctx, videoSeconds: t, width: project.width, height: project.height }) });
  } catch (e) { if (!existing) dispatcher.dispose(); throw e; }
  return dispatcher;
}
