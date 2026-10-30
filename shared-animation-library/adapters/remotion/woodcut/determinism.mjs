// Pure, DOM-free helpers for reproducible woodcut geometry. Nothing here reads Math.random, Date, a mutable global or the current frame
// unless the caller passes it explicitly.

export const MAX_DIMENSION = 8192;

export function assertDimension(name, value) {
  if (!Number.isInteger(value) || value < 16 || value > MAX_DIMENSION) throw new TypeError(`${name} must be an integer from 16 to ${MAX_DIMENSION} (got ${value})`);
  return value;
}

export function assertSeed(seed) {
  if (typeof seed !== 'number' || !Number.isSafeInteger(seed)) throw new TypeError(`seed must be a safe integer (got ${seed})`);
  return seed;
}

// 32-bit FNV-1a over UTF-16 code units
export function hashString(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

// Stable derived stream seed: the same (base, labels) always yields the same uint32; different labels give independent streams.
export function deriveSeed(base, ...labels) {
  assertSeed(base);
  return hashString(`${base}|${labels.map(String).join('|')}`);
}

// JSON with sorted keys; rejects values that cannot be part of a reproducible key.
export function canonicalJSON(value) {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'number') { if (!Number.isFinite(value)) throw new TypeError('geometry parameters must be finite'); return JSON.stringify(value); }
  if (t === 'string' || t === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(',')}]`;
  if (t === 'object') return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonicalJSON(value[k])}`).join(',')}}`;
  throw new TypeError(`geometry parameters must be plain JSON data (found ${t})`);
}

// Complete cache key for immutable geometry: dimensions, explicit stable seed, geometry version and parameters. Never the frame.
export function geometryKey({ width, height, seed, version = 1, params = {} }) {
  assertDimension('width', width); assertDimension('height', height); assertSeed(seed);
  if (!Number.isInteger(version) || version < 1) throw new TypeError('geometry version must be a positive integer');
  return `woodcut-geometry:v${version}:${width}x${height}:seed${seed}:${canonicalJSON(params)}`;
}

// Optional stepped ink variation, derived purely from the frame (separate from the stable geometry seed). Default: a new impression 12 times per second.
export function inkSeedAt({ seed, frame, fps, stepsPerSecond = 12 }) {
  assertSeed(seed);
  if (!Number.isInteger(frame) || frame < 0) throw new TypeError(`frame must be a non-negative integer (got ${frame})`);
  if (!(fps > 0) || !(stepsPerSecond > 0)) throw new TypeError('fps and stepsPerSecond must be positive');
  const step = Math.floor((frame * stepsPerSecond) / fps + 1e-9);
  return deriveSeed(seed, 'ink', step) % 997;
}

// Content hash of stroke data (FNV-1a over the numeric payload). A descriptor for determinism checks, not a pixel hash.
export function hashStrokes(strokes) {
  let h = 0x811c9dc5;
  const mix = (n) => { h ^= n >>> 0; h = Math.imul(h, 0x01000193); };
  const f32 = new Float32Array(1); const u32 = new Uint32Array(f32.buffer);
  const mixNum = (x) => { f32[0] = x; mix(u32[0]); };
  for (const s of strokes) {
    for (let i = 0; i < s.p.length; i++) mixNum(s.p[i]);
    for (let i = 0; i < s.w.length; i++) mixNum(s.w[i]);
    mixNum(s.seed); mixNum(s.t0); mixNum(s.dur); mixNum(s.chip);
    for (let i = 0; i < s.kind.length; i++) mix(s.kind.charCodeAt(i));
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// All strokes of a geometry object: `strokes` may be an array or a {name: Stroke[]} record.
export function collectStrokes(geometry) {
  const s = geometry && geometry.strokes;
  if (Array.isArray(s)) return s;
  if (s && typeof s === 'object') return Object.keys(s).sort().flatMap((k) => s[k]);
  return [];
}

export function describeGeometry(key, geometry) {
  const strokes = collectStrokes(geometry);
  return { key, hash: hashStrokes(strokes), strokeCount: strokes.length };
}
