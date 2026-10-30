// ADAPTED FROM lemomo-ai/lemo-opuscar @ b65efe6ea393fdc71212898ea4c57c754cfefa46 (MIT, (c) 2026 LemoLab) — core/lib.js
// Adaptation: retained closure only: clamp, hash, mulberry (verbatim lines); the rest of core/lib.js is not used by the adapted modules
// See UPSTREAM_SOURCE_RECORD.md in this folder for hashes and the full change record. The original is not modified.
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
