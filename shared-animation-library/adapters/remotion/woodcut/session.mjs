// Framework-free woodcut session: one WebGL2 printer + mask/colour canvases + borrowed immutable geometry. Created and drawn only in a browser
// lifecycle (never at import or on the server). The React bridge (WoodcutCanvas.mjs) drives it; tests drive it with injected fakes.
import { assertDimension, assertSeed, deriveSeed, describeGeometry, geometryKey, inkSeedAt } from './determinism.mjs';
import { defaultGeometryCache } from './geometry-cache.mjs';
import { makePrinter as upstreamMakePrinter } from './print.mjs';

export class WoodcutError extends Error {
  constructor(code, message, cause) { super(`${code}: ${message}`); this.name = 'WoodcutError'; this.code = code; if (cause) this.cause = cause; }
}

const SESSIONS = { created: 0, disposed: 0 };
export const getWoodcutSessionStats = () => ({ ...SESSIONS, live: SESSIONS.created - SESSIONS.disposed });

/**
 * options: { width, height, seed, geometryVersion = 1, geometryParams = {}, buildGeometry, drawMask, drawColor?, printerOptions?, maskBackground = '#000',
 *            inkStepsPerSecond = 12, cache = defaultGeometryCache, onEvent? }
 *   buildGeometry({ width, height, seed, params, derive }) -> { strokes: Stroke[] | { name: Stroke[] }, ...plain data }   (pure; no frame, no Math.random)
 *   drawMask(g, ctx) / drawColor(g, ctx): may be async. ctx = { geometry, width, height, seed, frame, seconds, fps, derive, descriptor }
 *   printerOptions: object or (ctx) => object, passed to printer.render (inkSeed defaults to a pure stepped function of the frame)
 * env (tests only): { document, makePrinter }
 */
export function createWoodcutSession(options, env = {}) {
  const { width, height, seed, geometryVersion = 1, geometryParams = {}, buildGeometry, drawMask, drawColor = null, printerOptions = {},
    maskBackground = '#000', inkStepsPerSecond = 12, cache = defaultGeometryCache, onEvent = null } = options;
  assertDimension('width', width); assertDimension('height', height); assertSeed(seed);
  if (typeof buildGeometry !== 'function') throw new TypeError('buildGeometry must be a function');
  if (typeof drawMask !== 'function') throw new TypeError('drawMask must be a function');
  const doc = env.document ?? (typeof document !== 'undefined' ? document : null);
  if (!doc) throw new WoodcutError('NO_DOM', 'a browser document is required; create sessions in an effect, not at import or on the server');
  const makePrinter = env.makePrinter ?? upstreamMakePrinter;
  const emit = (event) => { if (onEvent) { try { onEvent({ ...event, width, height, seed }); } catch (e) { /* telemetry must never break drawing */ } } };
  const derive = (...labels) => deriveSeed(seed, ...labels);
  const key = geometryKey({ width, height, seed, version: geometryVersion, params: geometryParams });

  let printer = null, mask = null, maskCtx = null, colorCv = null, colorCtx = null, geometry = null, descriptor = null;
  let disposed = false, drawCount = 0, drawSeq = 0, chain = Promise.resolve();

  const releaseAll = () => {
    if (printer) { try { printer.dispose(); } catch (e) { /* already released */ } printer = null; }
    mask = maskCtx = colorCv = colorCtx = null;
  };

  const session = {
    key,
    get disposed() { return disposed; },
    get canvas() { return printer ? printer.canvas : null; },
    get descriptor() { return descriptor; },
    get drawCount() { return drawCount; },

    prepare() {
      if (disposed) throw new WoodcutError('DISPOSED', 'session already disposed');
      if (printer) return descriptor;
      try {
        geometry = cache.get(key, () => buildGeometry({ width, height, seed, params: geometryParams, derive }));
        descriptor = describeGeometry(key, geometry);
        mask = doc.createElement('canvas'); mask.width = width; mask.height = height;
        maskCtx = mask.getContext('2d');
        colorCv = doc.createElement('canvas'); colorCv.width = width; colorCv.height = height;
        colorCtx = colorCv.getContext('2d');
        if (!maskCtx || !colorCtx) throw new Error('2d canvas context unavailable');
        printer = makePrinter(width, height, { document: doc });
      } catch (error) {
        releaseAll();
        emit({ type: 'error', phase: 'prepare', message: String(error && error.message || error) });
        throw new WoodcutError('PREPARE_FAILED', String(error && error.message || error), error);
      }
      SESSIONS.created++;
      emit({ type: 'prepare', geometryKey: key, geometryHash: descriptor.hash, strokeCount: descriptor.strokeCount });
      return descriptor;
    },

    // Serialised: a draw never overlaps another on the shared canvases. A draw superseded by a newer request resolves { status: 'superseded' } without printing.
    draw({ frame, fps, seconds = frame / fps }) {
      const mySeq = ++drawSeq;
      const run = async () => {
        if (disposed) throw new WoodcutError('DISPOSED', 'session disposed before draw');
        if (!printer) throw new WoodcutError('NOT_PREPARED', 'prepare() has not completed');
        if (mySeq !== drawSeq) return { status: 'superseded', frame };
        if (printer.lost) throw new WoodcutError('CONTEXT_LOST', 'webgl2 context lost before draw');
        const t0 = Date.now();
        emit({ type: 'draw-start', frame, geometryKey: key });
        const ctx = { geometry, width, height, seed, frame, seconds, fps, derive, descriptor };
        try {
          // fresh state for every request: nothing may depend on a previously visited frame
          maskCtx.setTransform(1, 0, 0, 1, 0, 0); maskCtx.globalAlpha = 1; maskCtx.globalCompositeOperation = 'source-over'; maskCtx.clearRect(0, 0, width, height);
          if (maskBackground) { maskCtx.fillStyle = maskBackground; maskCtx.fillRect(0, 0, width, height); }
          colorCtx.setTransform(1, 0, 0, 1, 0, 0); colorCtx.globalAlpha = 1; colorCtx.globalCompositeOperation = 'source-over'; colorCtx.clearRect(0, 0, width, height);
          await drawMask(maskCtx, ctx);
          if (drawColor) await drawColor(colorCtx, ctx);
          if (disposed) throw new WoodcutError('DISPOSED', 'session disposed during draw');
          if (mySeq !== drawSeq) { emit({ type: 'draw-superseded', frame }); return { status: 'superseded', frame }; }
          const opts = { ...(typeof printerOptions === 'function' ? printerOptions(ctx) : printerOptions) };
          if (opts.inkSeed === undefined) opts.inkSeed = inkSeedAt({ seed, frame, fps, stepsPerSecond: inkStepsPerSecond });
          if (opts.seed === undefined) opts.seed = derive('paper') % 997;
          printer.render(mask, drawColor ? colorCv : null, opts);
          drawCount++;
          if (printer.lost) throw new WoodcutError('CONTEXT_LOST', 'webgl2 context lost during draw');
          const glError = printer.glError();
          if (glError !== 0) throw new WoodcutError('GL_ERROR', `gl.getError() = ${glError} after draw`);
          const result = { status: 'drawn', frame, seconds, geometryKey: key, geometryHash: descriptor.hash, strokeCount: descriptor.strokeCount, inkSeed: opts.inkSeed, glError, drawCount, ms: Date.now() - t0 };
          emit({ type: 'draw-done', ...result });
          return result;
        } catch (error) {
          const wrapped = error instanceof WoodcutError ? error : new WoodcutError('DRAW_FAILED', String(error && error.message || error), error);
          emit({ type: 'error', phase: 'draw', frame, code: wrapped.code, message: wrapped.message });
          throw wrapped;
        }
      };
      const p = chain.then(run, run);
      chain = p.then(() => undefined, () => undefined);
      return p;
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      const hadPrinter = Boolean(printer);
      releaseAll();
      if (hadPrinter) SESSIONS.disposed++;
      emit({ type: 'dispose', drawCount });
    },
  };
  return session;
}
