# Shared animation library — implementation report

## Current full-song duration addendum (2026-10-25)

The shared export plan now supports full-master song durations longer than the old 45-second legacy default. A new song declares its measured duration; absent `maxDurationSeconds` resolves to that duration, while an explicitly shorter limit remains a validation error. For a zero-offset full master, video frame count rounds up and planned audio duration remains the exact configured source duration. The Remotion `Html5Audio` receives that exact duration; the plan reports the video/audio endpoint difference, which is less than one frame. Explicit ranges retain their frame-bounded behavior. Current non-rendering checks: `node shared-animation-library/tests/verify-production.mjs` passed 27/27 and wrote `tests/verify-production-results.json`; `node shared-animation-library/tests/verify.mjs` passed 43/43 and wrote `tests/verify-results.json`. This establishes configuration and planned timing only; encoded endpoints, audible synchronization and actual full-song output require an authorized render and playback. No browser, still or video render was run in this pass.

## Current Remotion integration addendum (2026-10-25)

The shared Remotion engine is now installed at `remotion-runtime/` and selected through the single `render.mjs` front door. New songs use `PROJECT.renderEngine: 'remotion'`; existing p5 productions remain supported as the legacy/default route. Both use the common normalized `PROJECT` and `export-plan.mjs`, while their scene implementations remain separate. The synthetic Remotion example passes a no-media plan; the legacy p5 neutral example also passes its no-media plan through the same front door. JavaScript and JSX syntax checks passed; the pinned package set resolves; and the Remotion composition bundled successfully to a temporary directory that was removed afterwards. No Chrome browser session, scene draw, still, audio decode, encode, full-song video or visual review was performed. See `remotion-runtime/README.md` for the integration contract. This addendum supersedes earlier report statements that the shared library had no Remotion engine; older pass records below remain historical evidence.

Pass 1 (2026-10-07): built the library. Pass 2 (2026-10-08): repaired it per `compatibility-preparation/GPT_IMPLEMENTATION_REVIEW.txt` so it serves different songs. Originals, `renderer/` and `productions/` untouched.

## What works across productions now (non-rendering evidence)
Each production supplies: recording + `sourceAudioOffsetSeconds`, `config.js`, assets, scene modules, shot sequence, cues, particle events, visual treatment. Shared: engine base, `normalizeProject`, export planner, production-bound cache, supervised ffmpeg, numeric/timebase helpers, R06 particles, overlay dispatcher. See README for the contracts.

## Repairs against the review
| Finding | Repair | Evidence (tests/verify.mjs, 43 checks) |
|---|---|---|
| P1 audio ignores offset | `export-plan.mjs`: audio starts at `sourceAudioOffsetSeconds + firstFrame/fps`, same args in `--clip` and `--encode`; `PROJECT.audio` resolved by the config file | offset 0 and 10, whole excerpt and 2:4, fps 24/25/30; clip vs encode audio argument vectors equal; frame-time/audio-time/cue equation |
| P1 shared cwd cache | identity over entry + closure + config + assets + output settings; per-identity folder + `manifest.json`; explicit mismatch errors | identity differs per song/config/scene/transitive module/asset/fps/size; stable across folders; audio and unreferenced files excluded; missing referenced file/asset is an error; manifest compatibility matrix |
| P1 nonzero range encode | manifest interval; `-start_number`, `-frames:v`; `missingFrames` checks only the selected sequence | stale 300-frame cache cannot extend a 48-frame export; CLI `--encode` reports incomplete/incompatible caches without starting ffmpeg |
| P2 false success | `process-runner.mjs`: handlers at spawn; startup/exit/signal/pipe/early-exit failures stop feeding, remove `.part.mp4`, report stderr tail; rename only after exit 0 | test doubles for each failure kind, backpressure with dying encoder, render-side failure kills encoder |
| P2 particle state leak | try/finally around every save/restore pair in `line`, `at`, per-particle block (recorded adaptation) | injected throw in the real spark/debris/dust/confetti/ember paths with nonidentity matrix + sentinel state restores everything; unadapted original shown to leak; success-path traces still equal the original; kernel equals pinned text after reversing the adaptation |
| config normalization (historical result at the time of this pass) | `project-config.js` used by core, sizing script, driver, adapter | valid/invalid matrix (17 rejects), pass-through of production keys, then-current 45 s default; later replaced by duration-following default described above |
| P3 non-transactional install | validate/construct first; rollback of a new dispatcher | rejected installs leave fresh, legacy-hook and already-configured hosts unchanged |
| recorder transforms | full affine bookkeeping + paint snapshots | compose/restore checks, layer starts at identity, host matrix restored |
| beatPulse docs; timebase | documented explicit `beatSeconds`; `beatPulseForBpm`; safe-integer frames, finite outputs | probes incl. overflow cases |
| signed-zero wording | comparator is `Object.is` | see below |

Also found by the new tests: a nonzero-offset cue landing exactly on a frame (12.4 with offset 10, 30 fps) was one ulp *after* its own frame time (2.4000000000000004 > 72/30), so the burst missed its frame. Cue conversions now snap to 1e-9 s.

## What the numeric comparisons establish
For the aliases compared (all except `r02.beatPulse`, covered by its own probes), derived results equal the extracted pinned originals under `Object.is` on 6001 samples in [-1,2] plus the stated seed/window/exposure probes: NaN matches NaN and there is no +0/−0 difference. This is sampled evidence about those inputs, not a proof for all doubles, and not canvas/pixel equivalence. Park–Miller, Mulberry32, back variants and noise variants are separate named functions.

## Verification
`node shared-animation-library/tests/verify.mjs` → 43/43 (Node 26.7.0). Uses synthetic productions in a temp folder, recording contexts, process doubles and `render.mjs --plan/--encode` failure paths (no Chrome, no ffmpeg run). No media, pixels or browser.

## Still awaiting authorization / production work
HISTORICAL (Pass 2 text; ES-module loading and readiness for the neutral example were later reported, see CURRENT STATUS at the end) Browser: ES-module loading over `file://`, readiness under the real host, fonts/glyphs (Google Fonts CSS unhashed and network-loaded), p5.brush output, `setup/draw/renderAt`, real ffmpeg encode, A/V sync listening check. Per song: portrait scene layouts (timeline `placeholder`, `sheets.js` loops, demo and karaoke are landscape-authored), cue data, assets, offline fonts if wanted. Optional future modules: R03 interpolation, R06 geometry. Clip export has no resume (use `--frames` + `--encode` for resumable work).

## Next bounded action
With media authorization: one trivial portrait still through `render.mjs --stills` on a synthetic production to confirm browser load, readiness, hook order and fonts; then a short `--frames`/`--encode` roundtrip to confirm audio alignment by ear and by `ffprobe`.

---

# Pass 3 (2026-10-25): song-neutral production shell and R06 critter adapter
Authorized by the user's message of 2026-10-25 (shared-library code and documentation only). No browser, render, screenshot, FFmpeg, audio analysis, model or package install. `renderer/`, `productions/`, repository checkouts, installed manifests and Library settings untouched. Outside `shared-animation-library/` only the reusable source router text files (`reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt`, `01_TECHNIQUE_ROUTER.txt`) were updated, as requested for the handoff.

## State vocabulary for this pass
| Item | Source present | Source read | Adapted | Adapter implemented | Called by a scene | Browser/visual review |
|---|---|---|---|---|---|---|
| R06 critter rig + core helpers | yes | in full | yes | yes | neutral example `scene-b.mjs` (never run) | no |
| R06 burst particles (earlier pass) | yes | yes | yes | yes | production-owned events | no |
| R02 kinetic `reel.js` | yes | lines 1-140 in full, rest as index | no | no | no | no |
| R03 `riso.js`, `post.js` | yes | yes | no | no | no | no |
| R04 `analyze-beatgrid.py`, R07 `analyze.py`/`audio.ts` | yes | partly (output shape) | schema mapping only | importers exist | no | no |
| Fontsource (Inter 700 latin/latin-ext) | installed | package CSS + file magic | declaration helper | loader implemented (FontFace) | no | no |
Installed packages (Flubber, Lottie Web, Pixelmatch, WhisperX, Librosa, glTF fixture) remain installed material, not integrated capabilities.

## Conflicts noticed between instructions
`CLAUDE.md` says the current stage is text audit and that implementation needs authorization; the user's 2026-10-25 message authorizes exactly this bounded shared-library implementation, and the router (updated 2026-10-25) lists the portrait shell as the next foundation. Followed the latest direct instruction and its limits. `CLAUDE.md` also names `renderer/` as the pipeline; this pass leaves it untouched and extends `base/render.mjs` only through its existing config/identity path.

## Added
- `base/src/project-config.js`: additive production contract inside `normalizeProject` (see README).
- `production/` (manifest, scene-runtime, cue-schema, production-host, fontsource), `adapters/r06-critter-rig.mjs`, `examples/neutral-production/`.
- `export/cache-identity.mjs`: runtime-loaded modules, cue module, assets and fonts (string or object form) now invalidate the cache; legacy string-array configs hash as before.
- `base/studio.html`: one chained READY_PROMISES entry (overlays, then production). Behavior for a config without `scenes` is unchanged.

## Deliberate non-integrations (exact incompatibilities)
- R02 kinetic reel: fixed 1920x1080, global `KCUE`, owns `#out` through a three.js WebGL renderer and a second WebGL canvas, sets `window.DUR/PROJECT` itself. Kept as a separate entry/engine.
- R03 riso: `makeRiso(out)` calls `getContext('webgl2')` on the canvas it is handed; the shared `#out` is a 2D canvas whose `toDataURL` is the export path. A bridge needs its own WebGL canvas plus a readback/drawImage that cannot be verified without a browser. R03 `post.js` needs a three.js renderer/scene/camera and addons.

## Verification (no media)
`node shared-animation-library/tests/verify-production.mjs` → 25/25 (re-run 2026-10-25 after corrections); `node shared-animation-library/tests/verify.mjs` → 43/43 (unchanged suite). Details in README and `tests/verify-production-results.json`. Establishes: config validation, deterministic load order, error stages and rollback, SceneTime and out-of-order determinism through the real `timeline.js` shots/drawWorld in a vm, cue conversion rules, host wiring on fakes, identity sensitivity, `render.mjs --plan` on the example, critter call-trace equality with the pinned text and exception safety. Does NOT establish: that any script, ES module, FontFace or Image loads in a browser; that p5 globals used by the example scenes behave as assumed; what anything looks like; frame times; font glyph coverage; A/V sync; importer behavior on real Librosa/R04 output.

## Remaining gaps
HISTORICAL (browser load/ready since reported): browser load of the production host over `file://` and `window.ready`; the example/critter drawn at least once and reviewed at phone scale; hook-order check with karaoke; portrait layouts of `timeline.js placeholder`, `sheets.js`, demo and karaoke; Google Fonts CSS in `base/studio.html` still network-loaded; narrow R02 glyph port or an R03 riso/three bridge only when a song needs them; real analysis run and human confirmation of cues; WhisperX singing alignment assessment.

## Corrections (2026-10-25, second authorization)
Fixed: (1) scenes outside the half-open coverage `[start,end)` no longer draw/overlay (previously the first scene drew before its start and the last through `duration`); (2) failed `installProduction` now restores `registerSceneImpl`, removes its overlay layer, disposes only what it created/initialized. New regression checks in `tests/verify-production.mjs` (coverage via real `timeline.js` in a VM; failure cleanup on fresh and preconfigured hosts). README scene-loading routes rewritten; explicit `duration` required for new productions. The example declares no assets or fonts, so font/asset loading remains unverified by any example. Both suites run after the edits: 24/24 and 43/43, exit 0. `shots()` cannot be unregistered, so a failure inside `host.shots` itself is not undoable.

## Late-failure cleanup (2026-10-25, third authorization)
Fixed: a failure at `host.addEventListener` (after scene init) left `host.PRODUCTION` pointing at the disposed production and could block retry. `installProduction` now registers the pagehide listener before `shots()`, assigns `host.PRODUCTION` last, restores the prior `PRODUCTION` state (including absence) on failure and removes a registered listener. New regression check covers that stage on fresh and preconfigured hosts (hook restored, layer removed, created dispatcher disposed, pre-existing dispatcher and layers intact, scenes disposed, `PRODUCTION_ERROR` kept, retry reaches the same stage). `shots()` has no unregister; a partial mutation inside it cannot be undone. Only `verify-production.mjs` was run (25/25, exit 0); `verify.mjs` not re-run in this pass. No browser/font/asset/audio verification.

## Browser readiness (2026-10-25)
CURRENT STATUS (browser readiness, 2026-10-25). Claude reported one local-Mac headless-Chrome load of the neutral example (page loaded; `window.ready` true, meaning p5 setup completed; no `PRODUCTION_ERROR`; no console/page/request errors; `scene-overlays` layer registered; classic and ES-module scene files requested). These are Claude-reported observations from an inline script; no raw browser log was saved, so they are not independently corroborated. By source reading (p5 2.3.3 `_draw`: "we have to draw once even if looping is off"; `core.js` `draw()` calls `drawWorld(T)` with `T` = 0), p5 runs `draw()` once after setup, so the opening scene's draw path very likely ran once in the hidden p5 canvas. This is a conclusion from p5 and project source, not a browser-log observation. Not produced or exercised: `renderAt()` was never called, so no still or final composite exists and the `scene-overlays` draw behavior was not exercised; the later `hop`/critter scene was not drawn. Unverified and pending as separate stages: appearance, pixels, phone-size quality, visual acceptance, saved still rendering, overlay drawing, real font and asset loading (the example declares none), glyph coverage, audio analysis, encoding, audiovisual review. The example is 8 s long and does not test full-song duration handling or audio synchronization. See `BROWSER_READINESS_CHECK_2026-10-25.md`.
