# Upstream source record — Remotion woodcut adapter

Source: `lemomo-ai/lemo-opuscar`, local `repository-downloads/lemomo-ai/lemo-opuscar/`, commit **b65efe6ea393fdc71212898ea4c57c754cfefa46** (checkout HEAD read on 2026-10-25). Licence: MIT, (c) 2026 LemoLab, copied here as `LICENSE.lemo-opuscar` (upstream `LICENSE` sha256 `f6d14d5ea5f60387eff5e7916f490e9d743986be48138d9ce187d69cbe536756`). The demo's third-party assets (fonts, music, voices, images; see upstream `styles/woodcut/demo/CREDITS`) keep their own licences and are **not** used or copied here; no demo film, story, score or media was taken.
The upstream checkout is unmodified.

## Adapted modules (upstream file boundaries kept; `.js` -> `.mjs` so Node and the bundler treat them as ESM)
| Adapted file | Upstream path (under repo root) | Upstream sha256 | Adapted sha256 (at creation) |
|---|---|---|---|
| `lib.mjs` | `core/lib.js` | `770c8fde7c43e6a8aa9f69235869eb2a6ef5dc43453d0e56d4ff0da576c83907` | `4d6b0f20fc2b75b1ef5a80f18241f36f2172c57512a2c39d2997ead652d4bac1` |
| `knife.mjs` | `styles/woodcut/demo/engine/knife.js` | `4e5a29c14cf564625d5d3cad29966c289eee0aad4701cdc3f5728a960d91b431` | `38ab804d381e492ecf4a8993d3fe8af46fb4154ab61f2ed6e1e1eb42b1485f37` |
| `hatch.mjs` | `styles/woodcut/demo/engine/hatch.js` | `4327d8b90fa799edd92961f7764bf47790aa2d346b1995e5fbf6a6d1a935e862` | `a19a2362e00311f5170ae559454ad89aec55a167523b8c69517fcc3c2d6503c5` |
| `print.mjs` | `styles/woodcut/demo/engine/print.js` | `7a1314ee1de99b330c463e543b0eb7b1b9dcd59d232fabe184d49ff9c4ee26e3` | `10cc1a0ccd0145d27f8dd772d98c74b867d516dd5d5a7934cc93bc6909d46cb9` |
| `index.mjs` | `styles/woodcut/demo/engine/index.js` | `c153e7c96c79d920b360242d6eccc8b64046066389e2c90a29030d2f22114b97` | `203154fb725178109939f9a96181a5198c2f77eca066f72b91e22a1cfea52c07` |

Not taken: `styles/woodcut/demo/engine/filter.js` (no selected helper needs it), the upstream `index.js` barrel line that imports it, and the rest of `core/lib.js`.

## Change record
- `lib.mjs`: only `clamp`, `hash`, `mulberry` (verbatim lines) — the retained closure of `/core/lib.js` imports used by knife/hatch/index.
- `knife.mjs`: import `/core/lib.js` -> `./lib.mjs`. `mkStroke` no longer falls back to `Math.random() * 1000`; it requires an explicit finite numeric seed and throws otherwise (every upstream helper in this folder already passes one).
- `hatch.mjs`: imports rewritten to `./lib.mjs`, `./knife.mjs`; otherwise verbatim. Note: `Region` rasterises polygons on a module-level scratch 2D canvas and reads it back with `getImageData` to build its distance field. That is CPU geometry construction, not inspection of output; it is not used by the technical fixture and is not covered by the browser checks.
- `index.mjs`: only palette constants, `pathOf`, `fillPoly`, `offsetPoly`, `cutAlong`, `flecks`, `rays`, `shape`, `plate`, `ellipse`, `rect` (verbatim bodies) plus re-exports of the knife/hatch helpers; the document-dependent `canvas()` helper, the `print.js`/`filter.js` imports and the `woodcutFilter` re-export are omitted.
- `print.mjs`: `VS`, `FS` and `hex()` byte-identical to upstream (now exported; verified by `tests/verify-woodcut-adapter.mjs`). `makePrinter(W, H, env)` keeps the GL call sequence and `render()` body but adds: positive-integer size check, injectable `document`, retained shader/program/buffer/texture handles, `dispose()` (idempotent; deletes every retained handle, detaches shaders, removes the listener and canvas, one `WEBGL_lose_context.loseContext()` at dispose only, never per frame), cleanup of partially initialised resources on any failure, `webglcontextlost` detection (`lost`; `render()` throws instead of returning an empty frame), and `glError()`. Shader behaviour is unchanged.

## Written for this adapter (not upstream code)
`determinism.mjs`, `geometry-cache.mjs`, `session.mjs`, `WoodcutCanvas.mjs`, `woodcut.mjs`.
