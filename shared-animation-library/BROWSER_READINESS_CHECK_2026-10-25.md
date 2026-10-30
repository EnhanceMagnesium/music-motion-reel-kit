# Browser readiness check — neutral example (2026-10-25)

## Environment (local Mac session; Claude-reported from shell commands)
- Working directory: `.`
- OS: macOS 27.2 (Darwin 27.2.0, arm64, MacBook-Pro.local); Node v26.7.0
- Chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (headless via puppeteer-core)
- `puppeteer-core` resolved from `shared-animation-library/base` via the linked `base/node_modules` (R02 painted template install); no installs.

## Action taken
One inline Node script (no file created) run from `shared-animation-library/base`: launched Chrome with the `render.mjs` darwin settings (`--allow-file-access-from-files`, `--ignore-gpu-blocklist`, `--use-angle=metal`, `--enable-gpu-rasterization`, 1080x1920 viewport), attached console/pageerror/requestfailed/response/requestfinished listeners before navigation, opened `examples/neutral-production/studio.html?render` (`networkidle0`, 60 s), waited for `window.ready === true` (60 s), waited 2 s more, read page state with `page.evaluate`, closed the browser in `finally`. No rendering mode, `renderAt`, `renderSheet`, canvas pixel read, screenshot or image capture was used. (Correction: an earlier version of this report said "no frame was drawn"; that was too strong, see the next section.) Exit status 0.

## Observed (Claude-reported; no raw browser log was saved, so these are not independently corroborated)
- Page loaded; `window.ready === true`; `window.PRODUCTION_ERROR` null; `window.PRODUCTION` present with scenes `opening`, `hop`.
- `PROJECT` normalized in the page: 1080x1920, 24 fps, duration 8 s, productionId `neutral-example`, scenes opening 0–3.5 (impl `field`) and hop 3.5–8 (impl `critter-hop`), moduleLoadOrder palette → scene-a → scene-b, assets 0, fonts 0. `SHOTS.length` 2; `#out` canvas 1080x1920; `registerSceneImpl` is a function; `window.NEUTRAL` set by the classic palette script.
- Overlay dispatcher layer ids: `["scene-overlays"]` (no particle events were declared, and no previous hook existed).
- Local requests completed: studio.html, config.js, p5, p5.brush, project-config.js, core.js, clawd.js, timeline.js, sheets.js, adapters (host-integration, overlay-dispatcher, r06-burst-particles), numeric/timebase, production (production-host, scene-runtime, cue-schema, manifest), scenes/palette.js, scenes/scene-a.js (classic), scenes/scene-b.mjs (ES module) and adapters/r06-critter-rig.mjs (imported by scene-b).
- Console errors/warnings: none. Page errors: none. Failed requests: none. HTTP status >= 400: none. No startup scene-draw exception appeared in the Claude-reported console state.

## Startup draw (conclusion from source, not a log observation)
`window.ready === true` means p5 `setup()` completed. In p5 2.3.3 (`base/node_modules/p5/lib/p5.js`, `_draw`: "we have to draw once even if looping is off") p5 runs `draw()` once after setup even though `core.js` calls `noLoop()`. The project's `draw()` (`base/src/core.js`) returns early only if `window.ready` is false, otherwise calls `drawWorld(T)` with `T` initialised to 0. Therefore the opening scene's draw path (`field`, via `shots()`) very likely ran once in the hidden p5 canvas during startup. This is inferred from the p5 and project source; no browser log recorded it, and it does not show the draw succeeded visually.
What did not happen: `renderAt()` was never called, so no still and no final composite (the 2D `#out` composite, grain and overlay hook) exists. The `scene-overlays` layer was registered but its draw behavior was not exercised. The later `hop`/critter scene was not drawn.

## Limits (not established)
Appearance, pixels, phone-size quality and visual acceptance; saved still rendering; overlay drawing and the critter's behavior; drawing at any other timestamp; real font and asset loading (the example declares none); glyph coverage; performance; audio analysis; encoding; audiovisual review. The example is 8 s long and does not test full-song duration handling or audio synchronization. Each of these remains a separate pending stage.
