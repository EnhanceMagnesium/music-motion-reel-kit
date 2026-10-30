// Bounded LRU cache for immutable CPU geometry. The cache owns the geometry objects; sessions only borrow them and must not mutate them
// (the top-level object is frozen; stroke typed arrays cannot be frozen, so treat them as read-only). No WebGL object is ever cached here.
export function createGeometryCache(maxEntries = 8) {
  if (!Number.isInteger(maxEntries) || maxEntries < 1) throw new TypeError('maxEntries must be a positive integer');
  const map = new Map();
  const stats = { hits: 0, misses: 0, evictions: 0 };
  return {
    get(key, build) {
      if (typeof key !== 'string' || !key) throw new TypeError('cache key must be a non-empty string');
      if (map.has(key)) { const v = map.get(key); map.delete(key); map.set(key, v); stats.hits++; return v; }
      stats.misses++;
      const value = Object.freeze(build());
      map.set(key, value);
      while (map.size > maxEntries) { map.delete(map.keys().next().value); stats.evictions++; }
      return value;
    },
    has: (key) => map.has(key),
    clear() { map.clear(); },
    stats: () => ({ ...stats, size: map.size, maxEntries }),
  };
}

export const defaultGeometryCache = createGeometryCache(8);
