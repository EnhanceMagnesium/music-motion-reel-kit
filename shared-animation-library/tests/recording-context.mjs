// Recording Canvas2D context: records method calls, property writes and gradient stops. Allocates no canvas, no pixels.
// Bookkeeping: property store + affine matrix [a,b,c,d,e,f] with a save/restore stack. translate / rotate / scale / transform /
// setTransform / resetTransform update the matrix exactly as Canvas2D does (new = current x operation), so transform-restoration checks
// are meaningful. `ctx.globalAlpha *= fade` behaves like a real context. `__snapshots` records state at each paint call.
// NOT established by this recorder: CSS-colour validity, real Canvas exceptions, pixels.
const DATA = { fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, lineJoin: "miter", lineCap: "butt", globalAlpha: 1, globalCompositeOperation: "source-over",
  shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowColor: "rgba(0,0,0,0)", filter: "none", font: "10px sans-serif", textAlign: "start", textBaseline: "alphabetic", lineDashOffset: 0 };
const mul = (m, [a2, b2, c2, d2, e2, f2]) => { const [a, b, c, d, e, f] = m; return [a * a2 + c * b2, b * a2 + d * b2, a * c2 + c * d2, b * c2 + d * d2, a * e2 + c * f2 + e, b * e2 + d * f2 + f]; };
const PAINT = new Set(["stroke", "fill", "fillRect", "strokeRect", "fillText", "strokeText"]);
export function recordingContext(initial = {}) {
  const { matrix: m0, ...props } = initial; const trace = [], snapshots = [];
  let store = { ...DATA, ...props }, matrix = m0 ? [...m0] : [1, 0, 0, 1, 0, 0]; const stack = [];
  const rec = (name, args) => trace.push([name, args.map((a) => (a && a.__gradient) ? { gradient: a.args, stops: a.stops } : a)]);
  const ops = {
    save: () => stack.push({ s: { ...store }, m: [...matrix] }),
    restore: () => { const p = stack.pop(); if (p) { store = p.s; matrix = p.m; } },
    translate: (x, y) => { matrix = mul(matrix, [1, 0, 0, 1, x, y]); },
    rotate: (r) => { const c = Math.cos(r), s = Math.sin(r); matrix = mul(matrix, [c, s, -s, c, 0, 0]); },
    scale: (x, y = x) => { matrix = mul(matrix, [x, 0, 0, y, 0, 0]); },
    transform: (...m) => { matrix = mul(matrix, m); },
    setTransform: (...m) => { matrix = m.length === 6 ? [...m] : matrix; },
    resetTransform: () => { matrix = [1, 0, 0, 1, 0, 0]; },
    createRadialGradient: (...args) => { const g = { __gradient: true, args, stops: [], addColorStop: (o, c) => g.stops.push([o, c]) }; return g; },
    createLinearGradient: (...args) => { const g = { __gradient: true, args, stops: [], addColorStop: (o, c) => g.stops.push([o, c]) }; return g; },
  };
  return new Proxy({}, {
    get(_, k) {
      if (k === "__trace") return trace; if (k === "__depth") return stack.length; if (k === "__store") return store; if (k === "__matrix") return matrix; if (k === "__snapshots") return snapshots;
      if (k in store) return store[k];
      if (typeof k === "symbol") return undefined;
      return (...args) => {
        rec(k, args); if (PAINT.has(k)) snapshots.push({ call: k, matrix: [...matrix], alpha: store.globalAlpha });
        return ops[k] ? ops[k](...args) : undefined;
      };
    },
    set(_, k, v) { rec("=" + k, [v]); store[k] = v; return true; },
    has(_, k) { return k in store; },
  });
}
