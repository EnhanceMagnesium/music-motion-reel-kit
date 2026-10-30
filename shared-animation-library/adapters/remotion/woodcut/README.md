# Remotion woodcut adapter

Reusable mechanism that lets a Remotion scene (shared runtime, `renderEngine: 'remotion'`) print a **woodcut relief** with the engine adapted from `lemomo-ai/lemo-opuscar` (MIT; see `UPSTREAM_SOURCE_RECORD.md` and `LICENSE.lemo-opuscar`). It holds no song characters, lyrics or narrative; scenes supply geometry and drawing. Status labels used in reports: **written** = source exists; **checked** = focused non-browser checks passed; **browser-drawn** = observed in Chrome through the Remotion composition; **visually reviewed** = a person judged saved images (none yet). At the time of writing this adapter is *written* and *checked* only; see `productions/will-not-fade/technical-review/ADAPTER_IMPLEMENTATION_REPORT_2026-10-25.md`.

## Loading
```js
import { WoodcutCanvas, deriveSeed, rays, cutAlong, flecks, drawStrokes, plate, ellipse } from '../../../adapters/remotion/woodcut/woodcut.mjs';
```
Registry files may be `.mjs` (no JSX needed) or `.jsx`; `PROJECT.remotion.scenes` can name either. Use explicit file extensions in imports (the bundler treats `.mjs` as strict ESM).

## `WoodcutCanvas` props
| Prop | Meaning |
|---|---|
| `width`, `height` | integers 16–8192; pass `project.width/height` so the canvas matches the actual composition (4:5 or 9:16). |
| `seed` | explicit stable safe integer for geometry (e.g. `deriveSeed(project.seed, 'scene', scene.id)`). Never derive it from the frame. |
| `geometryVersion`, `geometryParams` | bump the version when the builder changes; params must be plain JSON. With width, height and seed they form the cache key (`geometryKey`). |
| `buildGeometry({width,height,seed,params,derive})` | **pure** builder returning `{ strokes: Stroke[] \| {name: Stroke[]}, ...plain data }`. Result is cached (bounded LRU, 8 entries) and frozen. No frame, no `Math.random`. |
| `drawMask(g, ctx)` / `drawColor(g, ctx)` | may be async. `g` is a freshly cleared 2D context (identity transform, alpha 1, mask pre-filled black = uncut wood; white = cut). `ctx = {geometry,width,height,seed,frame,seconds,fps,derive,descriptor}`. Reveal progress comes from time (e.g. `drawStrokes(g, strokes, {t: time.localSeconds})`). |
| `printerOptions` | object or `(ctx) => object` for `printer.render` (paper/ink colours, `mode`, `edge`, `plateAmt`, …). Defaults: `inkSeed` = pure stepped function of the frame (`inkSeedAt`, 12 steps/s), `seed` derived from the geometry seed. |
| `time` (or `frame` + `fps`) | the `time` object the shared runtime passes to scenes. |
| `errorMode` | `'cancel'` (default: Remotion `cancelRender`) or `'report'` (release readiness, call `onError`, show `data-woodcut-status="error"`). Errors are never swallowed. |
| `onEvent`, `onDrawn`, `onError` | telemetry/callbacks (`prepare`, `ready-raise`, `draw-start`, `draw-done`, `ready-release`, `error`, `dispose`). |

## Lifecycle and readiness
Nothing touches the DOM or WebGL at import or on the server. A layout effect creates a session (geometry from the cache, mask/colour canvases, one printer) and mounts the WebGL canvas; its cleanup disposes the printer. A second layout effect, keyed by frame, raises a `delayRender` handle synchronously in the commit, draws the requested frame, and releases the handle only when that draw has completed or failed; frame change, config change and unmount release the previous handle in cleanup, and a draw superseded by a newer frame never prints. The printer is created once per mount and released on unmount (one `loseContext()` at dispose, none per frame).
Read from installed Remotion 4.0.538: `useDelayRender()` returns `{delayRender, continueRender, cancelRender}`; `cancelRender` throws after recording the error. `remotion_setFrame` itself holds a handle until the next animation frame, so the adapter's per-frame handle is raised in the commit that applies the frame.

## Determinism
Static geometry depends only on `(width, height, seed, geometryVersion, geometryParams)`. The upstream `Math.random` fallback in `mkStroke` is replaced by a required finite seed. Frame-varying ink noise is derived by the pure `inkSeedAt({seed, frame, fps})`. Descriptor equality (`geometryHash` over stroke data) supports reproducible inputs; it is not pixel equality.

## Limits
Region/`shape()` hatching is retained but reads back a scratch canvas (see the change record) and is not used by the fixture. No fonts, assets or textures are handled here. WebGL output was never read back or saved by this pass. Performance, visual quality and encoded frame equality are untested.
