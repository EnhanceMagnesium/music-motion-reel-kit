// Public entry of the Remotion woodcut adapter. Import from here in scene registries:
//   import { WoodcutCanvas, rays, cutAlong, flecks, drawStrokes, plate, ellipse, deriveSeed } from '../../../adapters/remotion/woodcut/woodcut.mjs';
// Provenance: adapted from lemomo-ai/lemo-opuscar @ b65efe6ea393fdc71212898ea4c57c754cfefa46 (MIT). See UPSTREAM_SOURCE_RECORD.md.
export { WoodcutCanvas } from './WoodcutCanvas.mjs';
export { createWoodcutSession, WoodcutError, getWoodcutSessionStats } from './session.mjs';
export { getPrinterStats, makePrinter } from './print.mjs';
export { createGeometryCache, defaultGeometryCache } from './geometry-cache.mjs';
export { assertDimension, assertSeed, canonicalJSON, collectStrokes, deriveSeed, describeGeometry, geometryKey, hashString, hashStrokes, inkSeedAt } from './determinism.mjs';
export { INK, PAPER, COPPER, WOOD, cutAlong, ellipse, fillPoly, flecks, offsetPoly, pathOf, plate, rays, rect, shape,
  mkStroke, spline, resample, drawStrokes, strokePath, progOf, chip, xform, Region, hatch, lines, reliefTone, light, dirAngle, dirRadial, dirRing, dirContour } from './index.mjs';
