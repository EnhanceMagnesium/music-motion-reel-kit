# Repository Navigation and Use Guide

Updated 2026-10-27. Canonical source map for Claude Code and Codex Local in the connected music-motion-reel-kit.

## Recipient environment and preparation evidence

Checkout and installation statements in individual entries describe the original preparation environment and historical checks. A recursive GitHub clone fetches the pinned source checkouts, but does not install their dependencies or establish browser, render or OS compatibility. Check each actual path and local installation before use; select and prepare only relevant dependencies in the current environment. macOS-specific tools, binaries, Swift examples and past Chrome observations do not establish Windows or WSL readiness. Start with `../WINDOWS_SETUP_AND_COMPATIBILITY.md` for Windows and preserve each source's license and provenance.

## How to use this atlas

Start with the current song's supplied recording, lyrics, optional brief and named production folder. Translate those inputs into actual scene requirements before selecting repository techniques. For every song, create `productions/<song>/research/REPOSITORY_REVIEW.md` before finalizing the storyboard: rank and disposition all accessible R01–R16, record exact paths opened, then deeply inspect only plausible candidates. If any source is inaccessible, mark discovery incomplete for that entry. A valid result may be that no repository mechanism fits.

Paths below are relative to this kit root. The authoritative pinned checkouts live under repository-downloads/<owner>/<repo>/. The router, catalog, preparation ledger and license/asset records locate sources and describe preparation; they do not prove that a file was read, installed, integrated, rendered or visually accepted. Before adapting any source, confirm the router’s current commit and reuse role, read the complete relevant files and their dependency closure, follow imports, inspect terms for all media/fonts/assets, and record source classification and call site in the song’s source map.

### Evidence labels

- Catalogued: the router/ledger has a record.
- Checked out: local source exists at its pinned commit.
- Prepared: selected dependencies or a build step were installed/checked, within the recorded scope.
- Read: the named source body was directly inspected.
- Adapted: code or a mechanism was copied/changed into a local adapter with provenance.
- Integrated: a song scene or shared helper calls that adapter.
- Checked: a named static, non-rendering or browser assertion passed.
- Visually reviewed: a person inspected identified rendered images/video.
- Accepted: the user accepted the creative result.

These labels are separate. Do not upgrade one status because a later status sounds similar.

## Pinned repository map

- Song call-site pattern (proposed adaptation, not an existing integration): put a small pure helper such as `poseAt(t, seed)` in `productions/<song>/remotion/art/character.mjs`, import it from the named scene in `remotion/scenes.jsx`, and evaluate it from that component’s supplied Remotion frame/time. Do not call R01’s `render.mjs` from the shared pipeline.

### R01 — JohnHeibel/ClaudeAnimationBase

- URL/commit: https://github.com/JohnHeibel/ClaudeAnimationBase — 0ac8bf2b31942376cb6b8c4074715595d512acd2
- Local checkout: repository-downloads/JohnHeibel/ClaudeAnimationBase/
- Role/license: adaptable code; repository LICENSE is MIT. The specific character, assets and reference artwork still require their own terms.
- Prepared: p5, p5.brush and Puppeteer dependencies are installed; module resolution and existing Chrome launch were checked. This is not the shared Remotion engine.
- Start with: README.md, ANIMATION_GUIDE.md, package.json, render.mjs, src/core.js and src/timeline.js.
- Useful paths/symbols: src/core.js defines timing/motion helpers including seg, kf, spring, ring, stroll, camera helpers camBegin/camEnd and drawing primitives; src/timeline.js defines shots(list) and drawWorld(t); src/clawd.js contains the Clawd character and pose helpers (including clawd and turn); src/scenes/demo.js is a sample shot implementation.
- Best fit: expressive drawn characters, shot-local staging, hand-drawn timing, keyframe curves, character acting and reusable pose logic.
- Compatibility: p5 globals and stateful drawing are not React components. core.js is fixed at W=1920,H=1080; many coordinates and character shapes assume landscape. The guide’s seeded boil model is explicitly designed around deterministic time, but inspect every random call and p5 dependency before adapting. Port selected geometry or timing helpers into the song’s React scene folder or a small shared adapter; use scene time/frame and explicit seeds.
- Dependency closure: p5 + p5.brush + Puppeteer in R01; do not import its renderer or install its package into a song. Test only the selected p5.brush mechanism if a scene truly needs it.
- Inspection scope: README, ANIMATION_GUIDE, package.json, core.js and timeline.js, and signatures/selected code in clawd.js, config.js, demo.js and render.mjs. Other drawing helpers/assets were not exhaustively read.
- Reuse note: MIT permits adapting code with notice/license retention. Do not carry the Clawd identity, palette or P(doom) story into a song.

- Song call-site pattern (proposed adaptation): re-author one selected timing/type/painted mechanism as a helper under `productions/<song>/remotion/art/` or `motion/`, then import and call it from the relevant named scene component; the source template’s renderer/cue system is not the call site.

### R02 — tuzhechen2005/opus-video-skills

- URL/commit: https://github.com/tuzhechen2005/opus-video-skills — 59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1
- Local checkout: repository-downloads/tuzhechen2005/opus-video-skills/
- Role/license: adaptable code; MIT. Creator media and any separately named assets retain their own terms.
- Prepared: the painted-animation and kinetic-reel template dependency sets are installed; module resolution and Chrome launch were checked.
- Start with: README.md, skills/painted-animation/SKILL.md, skills/kinetic-reel/SKILL.md, each selected template’s package.json and render.mjs.
- Useful paths: skills/painted-animation/ for brush-based p5 character scenes, painted shot code and render procedures; skills/kinetic-reel/examples/work-reel-26/reel.js and cues.js for deterministic time-based kinetic type, shape continuity and timing; skills/kinetic-reel/template/music/score.mjs for a code-generated score example. This project’s user supplies a finished song, so do not substitute its synthesized score.
- Best fit: painted character acting, type hierarchy, shape morphs, mask transitions, procedural texture and shot-specific cue design.
- Compatibility: both templates are independent pipelines using p5/Canvas/WebGL and their own Chrome/FFmpeg scripts. Their 1920×1080 examples are not responsive proof. Port a selected pure time function or re-author its visual rule in the current song’s React scene; preserve arbitrary-time seekability, selected native dimensions and the supplied soundtrack.
- Dependency closure: template-level packages are installed as recorded in repository-preparation/DEPENDENCY_MATRIX.csv. A selected three.js, brush or shader example still needs its exact import closure inspected. No separate R02 renderer is the new-song route.
- Inspection scope: README, both SKILL.md files, package declarations and selected kinetic example/render paths. The full 60-file checkout and all examples were not read.
- Reuse note: MIT applies to authored code, not automatically to creator videos, music, fonts or third-party assets.

- Song call-site pattern (proposed adaptation): use the existing `shared-animation-library/adapters/remotion/woodcut/` only when a song specifically selects that material; the song’s scene imports `<WoodcutCanvas .../>` and supplies configured `width`, `height`, explicit `seed`, geometry inputs and frame/time. For other R03 materials, re-author an isolated song-local helper and cite its exact source.

### R03 — lemomo-ai/lemo-opuscar

- URL/commit: https://github.com/lemomo-ai/lemo-opuscar — b65efe6ea393fdc71212898ea4c57c754cfefa46
- Local checkout: repository-downloads/lemomo-ai/lemo-opuscar/
- Role/license: adaptable code and style guidance; root LICENSE is MIT. Inspect each style’s CREDITS, font and image terms separately.
- Prepared: shared Node/browser/Three dependencies and isolated Python environment are present; selected demo dependencies were checked. Not every style demo has been run.
- Start with: README.md, DIRECTOR.md, TECHNIQUE.md, core/README.md, core/lib.js and styles/README.md. A style’s STYLE.md and demo implementation are separate documents; inspect both.
- Useful paths/symbols: core/lib.js exposes clamp, lerp, seg, ss, eio, eo, ei, back, spring, mulberry, hash, vnoise, monotone, track and env. core/render/page.mjs exposes ROOT, server(), requireDemo(), takeSize(), openDemo() and closeServer(). Woodcut source lives in styles/woodcut/demo/engine/{index,knife,hatch,print,filter}.js; print.js exports makePrinter(W,H), and the demonstration film uses film.init(), captionAt(t) and render(g,t). Other task-specific material paths include styles/risograph/demo/, styles/engraving/demo/engine/burin.js, styles/paper-popup/demo/ and styles/halftone-dossier/demo/.
- Best fit: adaptable material effects, print/engraving, procedural ink, paper layers, shape geometry, easing/noise and character/prop craft.
- Compatibility: the source woodcut stage and STYLE layout are landscape-first (stage.js declares 1920×1080 and caption margin). A configurable printer size does not make its compositions portrait-responsive. WebGL printer owns a context and resources; use the already prepared adapter at shared-animation-library/adapters/remotion/woodcut/ as the Remotion bridge, inspect its upstream record, and avoid a second printer/context per frame. React/Remotion readiness, cleanup, performance and appearance are separate checks.
- Dependency closure: root Node/Three/Playwright and Python base scopes are prepared; selected demo-local packages, fonts and assets may have additional requirements. Read actual imports and local license records before using them.
- Inspection scope: root README/director/technique/package, core/lib.js, core/render/page.mjs and selected woodcut engine/film/material paths. The other style implementations were not read.
- Reuse note: the shared woodcut adapter is an existing adaptation, not proof of a song-level integration or visual acceptance. Keep style guides as inspiration and author a song-specific treatment; do not transplant a demo film.

- Call-site boundary: the standalone HyperFrames CLI remains outside the shared song render route. Claude may choose a HyperFrames Player child composition inside a Remotion scene when the actual planned scene benefits from its HTML/GSAP, nested composition or footage-layering model. Remotion remains the master clock, song audio owner, final composition and encoder. See `claude-finished-song-animation-project/14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt` and the isolated hybrid comparison; this is not blanket integration of the full engine.

### R04 — heygen-com/hyperframes

- URL/commit: https://github.com/heygen-com/hyperframes — 6791ea580c811fe3f1a532a2ced4bbed29008ee7
- Local checkout: repository-downloads/heygen-com/hyperframes/
- Role/license: timing and composition reference; Apache-2.0 for repository code, with third-party registry items separately governed.
- Prepared: filtered Bun workspace installed; selected core, engine, producer, player, studio and CLI packages built/import-checked. Optional cloud and playground packages were excluded. The repository has 171 LFS entries.
- Start with: README.md, docs/ and the package READMEs under packages/core, packages/engine, packages/producer and packages/cli. Read repository AGENTS.md before deeper work inside this checkout.
- Useful systems: packages/core/ for HTML/schema parsing, compilation, runtime and seek-by-frame adapters; packages/engine/ for browser/frame capture and encoding; packages/producer/ for orchestration/audio mix; packages/cli/ for its own command. README lists registry/blocks and registry/components.
- Best fit: study timeline declarations, compositional structure, seekable-frame architecture, layer handoffs and browser-to-encoder boundaries.
- Compatibility: the standalone HTML/data-attribute pipeline and CLI are not integrated as a full-song route through this kit’s shared render entry. The isolated `shared-animation-library/examples/remotion-hyperframes-hybrid/` fixture demonstrates one small synchronous HTML/GSAP child composition hosted inside Remotion. Claude chooses whether that model helps a scene; it does not replace Remotion’s clock, audio, composition, export or encoding. Do not copy registry blocks wholesale because the source exists.
- Dependency closure: filtered workspace only; do not assume every workspace package was installed. Its “build checked” and package imports are not proof of a rendered production.
- Inspection scope: root README/AGENTS, root package and core/engine/producer/CLI orientation documents. The 8,784-entry tree, all 171 LFS items and component registry were not read.
- Reuse note: Apache code may be studied/adapted with license notices, but this repository remains a separate prepared engine. Raw HTML composition fields can execute code; treat examples as trusted authored source, not arbitrary user input.

- Song call-site pattern (only if a selected utility is genuinely needed): place an approved offline analysis/helper script under `productions/<song>/research/` and save its output as a song-local data file; keep Remotion scenes importing only the resulting declared data or an explicitly adapted browser-safe helper. Do not start optional services or paid-model branches by default.

### R05 — makevoid/motion-graphics-music-video-skill

- URL/commit: https://github.com/makevoid/motion-graphics-music-video-skill — 1a06e673e3266f8ba94f9aad55669b00fd3a9fca
- Local checkout: repository-downloads/makevoid/motion-graphics-music-video-skill/
- Role/license: planning and source reference; root LICENSE is MIT. External model services, generated assets and creators have separate rights/costs.
- Prepared: local Node/p5 and isolated Python tools prepared; Swift VFX compiled; optional Ruby orchestration deferred. External FAL branches require credentials/costs and are outside the default workflow.
- Start with: README.md and .claude/skills/motion-graphics-music-video/SKILL.md, then references/tasks.md, references/testing.md and the exact scripts for a selected tool.
- Useful paths: scripts/tools/p5/render.mjs; scripts/tools/python/ for analysis, masks and audio tools; scripts/tools/vfx/ for compiled Swift filters; scripts/mv.rb for Ruby orchestration.
- Best fit: planning a music-video production, identifying an audio-analysis or cutout/VFX method, and comparing specialized tool roles.
- Compatibility: a multi-tool plugin workflow, not the shared Remotion route. Its README describes optional generated image/video services and orchestration. Port only a self-contained, licensed algorithm after reading it; adapt it to a Remotion scene or local prep tool. Do not let its external-model pipeline replace the user’s master or add cost without a clear in-scope need.
- Dependency closure: Node/Python/Swift preparation is recorded; Ruby, ImageMagick and external API branches are deferred/optional. Inspect the preparation receipt before invoking any script.
- Inspection scope: README, skill/selected task/testing instructions and script-directory inventory. Not every script or service adapter was read.
- Reuse note: MIT covers repository code, not generated outputs or third-party assets.

- Song call-site pattern (proposed re-authoring): add browser-safe Canvas drawing such as `drawTexture(ctx, time, seed)` in `productions/<song>/remotion/art/texture.mjs`; import it from the target named scene and call with the selected frame dimensions. Do not import the Node-only `run(F)` or `@napi-rs/canvas` into Remotion.

### R06 — buildwithhanif/claude-animation-skill

- URL/commit: https://github.com/buildwithhanif/claude-animation-skill — 4ddb8c80fdec96dc9f55d4b9bdee60bde6f0134b
- Local checkout: repository-downloads/buildwithhanif/claude-animation-skill/
- Role/license: adaptable drawing reference; MIT.
- Prepared: its native Node Canvas dependency is installed and selected imports were checked.
- Start with: README.md, plugins/claude-animation/skills/claude-animation/SKILL.md, lib/film.mjs, lib/core.mjs and one relevant example.
- Useful paths: lib/film.mjs exports exposure(t, track, fps) and run(F); a film supplies dimensions, fps, duration, setup(ctx) and frame(ctx,t,i). lib/ contains texture, pen, nature, lowpoly, fx and rig modules, including rigs/ant.mjs, rigs/bug.mjs, rigs/critter.mjs and rigs/bean.mjs. Examples include examples/ant-colony/film.mjs and examples/money-quest/film.mjs.
- Best fit: surface-detail bibles, hand-drawn character anatomy, rig concepts, material texture, frame exposure and closed-form Canvas drawing.
- Compatibility: run(F) is a Node export harness backed by native Canvas, not a React component. Re-author selected drawing functions using browser Canvas2D in the song’s React component; do not import Node-only fs/process/@napi-rs/canvas into the browser bundle. Match configured dimensions and derive output from frame/time plus explicit seeds.
- Dependency closure: @napi-rs/canvas and FFmpeg belong to this source renderer, not the shared Remotion runtime. The shared kit may use compatible browser Canvas primitives, but that is not the same dependency integration.
- Inspection scope: README, lib/film.mjs, template and lib inventory; not all rigs or demonstrations were read.
- Reuse note: retain MIT attribution for adapted code. A named example is a place to inspect, not a required style.

- Song call-site pattern (adapted architecture, not direct module reuse): map this song’s measured events into its own cue/section data in `productions/<song>/cues/`, then have a React scene read the normalized `cues` prop. Do not import R07’s audio, `data/audio.json`, fixed-size renderer or NERV art.

### R07 — bizarro/evangelion

- URL/commit: https://github.com/bizarro/evangelion — 8f670f3262c75a454d26e01e062da96db7eefb05
- Local checkout: repository-downloads/bizarro/evangelion/
- Role/license: adaptable architecture reference; MIT for code. Fonts, the separately licensed music and other media are governed by their own terms.
- Prepared: app dependencies installed and a compile check passed with a separate preparation config that omits absent soundtrack copying. The original audio-analysis/Demucs pipeline was not prepared as part of that check.
- Start with: README.md, docs/TREATMENT.md, docs/ENGINE.md, app/src/timeline.ts, app/src/main.ts, app/scripts/render.ts and app/src/engine/.
- Useful symbols: timeline.ts exports makeTimeline(_ly, au); main.ts builds an Engine, calls boot/init and exposes window.__viz.still(), png() and stream() for its own export page. analysis/analyze.py writes song-specific audio analysis; data/audio.json and data/spectrum.bin are that other production’s artifacts.
- Best fit: section/plate-based story structure, deterministic visuals driven by an audio-data schema, WebGL instrument visualizers, scene lazy loading and an explicit browser-export API.
- Compatibility: source assumes 1920×1080 in app/scripts/render.ts; it is a separate Vite/Three/WebGL app and embeds another song’s analysis and event timing. Reuse general schema or an isolated algorithm only after replacing all song-specific data and adapting dimensions, lifecycle and time props to Remotion. Do not reuse its NERV styling, sound, lyrics, palette or analysis values.
- Dependency closure: app-level Three/Vite/OpenType dependencies are installed. Python Demucs analysis is a separate environment/action and may use substantial compute; do not run automatically for another song.
- Inspection scope: README/audio explanation, docs/TREATMENT, docs/ENGINE, app/src/main.ts, timeline.ts, render.ts and package manifest.
- Reuse note: MIT code does not license its audio, font files, generated media or other third-party materials.

- Call-site boundary: study-only under the current rights record, so there is no permitted code/media call site. If an architectural idea matters, document it in the song’s research note and implement original code or use a separately licensed source such as R01.

### R08 — JohnHeibel/PDoomVideo

- URL/commit: https://github.com/JohnHeibel/PDoomVideo — fa546a38092e75f2b079e6a86d6abc54dd525d17
- Local checkout: repository-downloads/JohnHeibel/PDoomVideo/
- Role/license: read-only architecture study; no repository LICENSE/reuse grant was established. package.json metadata alone is not the license record.
- Prepared: p5, p5.brush and Puppeteer dependencies are present for study and the Chrome override is recorded.
- Start with: README.md, ANIMATION_GUIDE.md, STORYBOARD.md, src/core.js, src/timeline.js, render.mjs and selected src/ch/ scenes.
- Useful paths: src/{core,timeline,lyrics,cast,props,clawd}.js and src/ch/ for chapter implementations. Study its motion/timing architecture, character staging and evidence path, then use R01 as the MIT-licensed generalized code reference when appropriate.
- Best fit: learn from a completed source-organized music-video case and identify questions a generalized animation base addressed.
- Compatibility: p5/brush, landscape-first and song-specific. Not a Remotion module. Treat source code, bundled P(doom) music, media and visual identity as non-reusable unless their rights are separately established.
- Dependency closure: its packages are installed for study, not a production integration.
- Inspection scope: README, package, storyboard/guide and selected core/timeline paths. The full scene implementation and bundled media were not read or played.
- Reuse note: report this repository’s study role; do not adapt code under the current permissions.

- Call-site boundary: read-only architecture study with no reuse grant; do not import its engines or assets. A useful observation may become a new original helper in the song folder only after documenting the idea rather than copying its implementation.

### R09 — domenic/domenic.me

- URL/commit: https://github.com/domenic/domenic.me — db374f65ec29834c5f5120b93c696843cdaa85ae
- Local checkout: repository-downloads/domenic/domenic.me/
- Role/license: read-only architecture study; no reuse grant established.
- Prepared: self-contained browser-animation files were inventoried/syntax-checked; website build packages are deferred.
- Start with: src/posts/2026-09-26-how-we-didnt-start-the-scaling.md, src/we-didnt-start-the-scaling/assets/worker.js, page.mjs and engine/.
- Useful paths: worker.js coordinates the worker-driven sequence; page.mjs supplies the animation page/runtime; engine/{anisong,eurodance,k-pop,indie-folk,piano-rock,pop-punk}.js holds six song/genre-specific code systems. Read the selected engine and all helpers it imports.
- Best fit: study how independent genre systems model visual grammars, layered Canvas imagery, text and timed evolution. The anisong, Eurodance and K-pop files were the earlier study shortlist; consider the others only when the new song’s scene needs fit.
- Compatibility: browser-native implementations may assume their original landscape canvas, globals, page loader and asset URLs. No website dependency install is prepared. Do not reuse code, layouts, engine art or assets without an established grant; translate high-level ideas into original song art.
- Dependency closure: website/Eleventy dependencies are intentionally deferred. The self-contained animation files can be read without building the website.
- Inspection scope: README, cited post, worker/page wrappers and selected engine-file headers/structure. All six engines and complete helper closure were not read.
- Reuse note: keep as reference-only unless license/permission is resolved.

- Call-site boundary: no code, film or frame call site is authorized by this source’s study-only role. Record a non-copying cinematography observation in `productions/<song>/research/`; source actual footage for integration separately through the Moving Image Archive workflow.

### R10 — WinterArc21/Battle-of-Austerlitz-Film

- URL/commit: https://github.com/WinterArc21/Battle-of-Austerlitz-Film — 86dae32d20f0a0f2395e7dc8938846fd51e355a6
- Local checkout: repository-downloads/WinterArc21/Battle-of-Austerlitz-Film/
- Role/license: read-only cinematic/architecture study; no reuse grant for the film or code was established.
- Completeness: verified at the pinned commit: 37 tracked files, zero LFS entries, no submodule tree, and video/austerlitz.mp4 is a real MP4 blob (not an LFS pointer), about 85 MiB. Its README says the finished source film is one 5:01 film. That is the intended scope, not evidence of a partial archive. No reacquisition was needed. This does not establish reuse rights for the film or assets.
- Start with: README.md and data/timings.json; then web/main.js, web/film.js, web/script.js, web/engine/{renderer,gl,overlay,army,fx,sprites,shaders}.js and tools/{render,frames,serve,export}.mjs.
- Useful symbols: main.js exports film, init(gl,ov), renderFrame(T) and frameJPEG(T,q); engine/overlay.js exports caption, barText, title, quote, label, brushArrow, inkLine and inkZone. Renderer declares FW=1920,FH=1080; tools/render.mjs uses Playwright to seek scene time, stream frame JPEGs into FFmpeg, and muxes separate music/subtitles.
- Best fit: study shot scale, terrain/map staging, parallax, archival-like battle tableaux, lighting, dramatic reveals and how timeline state is separated from a WebGL renderer.
- Compatibility: fixed landscape/WebGL scene and independent browser renderer; not part of shared Remotion and not an archival-clip library. Do not run its renderer, extract its frames, reuse its film/audio/voices/fonts, or copy code under the no-reuse grant.
- Dependency closure: repository package uses Playwright and FFmpeg for its own workflow; the shared kit’s Playwright review helper is separate and uses playwright-core. A README claim or install does not make R10’s renderer the production route.
- Inspection scope: README/story structure, package, tracked tree, MP4 blob/header, web/main.js, film.js, render/frames scripts and selected renderer/overlay APIs. No R10 media playback, frame extraction or render was performed.
- Reuse note: one-film historical study only. Moving Image Archive is a different service and required per song.

- Song call-site pattern: query the local catalog and save a short source-discovery note at `productions/<song>/research/REPOSITORY_SHORTLIST.md`; there is no R11 animation dependency to import. Follow any linked creator/source URL and assess its independent rights before considering adaptation.

### R11 — guanmo-ai/awesome-ai-motion

- URL/commit: https://github.com/guanmo-ai/awesome-ai-motion — 203472a514a4d41c12b1cee8e82423b5ca311186
- Local checkout: repository-downloads/guanmo-ai/awesome-ai-motion/
- Role/license: catalog reference. MIT covers the repository’s authored catalog/code; third-party examples and creator works remain separately owned.
- Prepared: catalog only; no animation runtime or dependency install is needed.
- Start with: README.en.md, docs/DISCOVERY.md, data/cases.json, docs/ and prompts/.
- Data/API: cases.json is the authored case catalog; entries contain id, stage, title/titleEn, category, summaries, author, source, model, media, cover, prompt, metrics, verification and webPlayback. scripts/build.mjs generates public site views from the data source.
- Best fit: discover examples by category, inspect what an author actually disclosed, find original post/code links, and compare code/media evidence.
- Compatibility: not an animation engine. Repository license does not grant rights to listed video, prompts from individual creators, source code linked elsewhere, fonts or assets. Use the record to locate sources and perform an independent license/readability check.
- Dependency closure: no production dependency; site build is optional maintenance.
- Inspection scope: README/README.en, AGENTS.md, docs/DISCOVERY.md, data schema/sample, scripts/build.mjs and license/THIRD_PARTY boundaries. Not every case was reviewed.
- Reuse note: preserve source URL/creator attribution in a research note; do not download all videos/assets for a song.

- Song call-site pattern: record chosen catalog entry and creator URL in `productions/<song>/research/CODE_ANIMATION_REFERENCE_SHORTLIST.md`; re-author any selected mechanism as a song-local React helper imported by a named scene. The catalog itself has no runtime call site.

### R12 — yihui-dev/awesome-opus5-5-videos (Skillry discovery)

- URL/current commit: https://github.com/yihui-dev/awesome-opus5-5-videos — `92aee2f586ac0715cb3cbcb6384834f98a33383d` (2026-10-13).
- Current local checkout: `repository-downloads/yihui-dev/awesome-opus5-5-videos-20261026/`. The prior `.../awesome-opus5-5-videos/` checkout at `3d54892e2ae5b0e8d337171e6508bba4cec01ab8` is preserved as the historical September snapshot.
- Role/license: searchable code-animation prompt and metadata catalog. MIT covers the repository's authored compilation, not creator videos, linked source code, music, images or other assets.
- Contents checked: 707 tracked files, including 703 prompt Markdown files and a 703-record `data/videos.json`; 418 records carry a Skillry gallery URL. No video files, submodules, LFS objects, package manifests, animation runtime or engine are present. No package install was needed.
- Start with `README.md` and `data/videos.json`; use `node repository-preparation/tools/search-r12-skillry.mjs --limit=12 "scene need technique terms"` from the kit root; then read `prompts/<slug>.md` and follow its creator and Skillry links. See `repository-preparation/R12_SKILLRY_LOCAL_REFERENCE_REFRESH_2026-10-26.md` for counts, provenance, search procedure and verification.
- Data fields include slug, author, author_url, post_url, category, tech_tags, prompt, prompt_partial, poster_url, skillry_url and has_remake. There are 207 partial prompt records. Technology tags can describe a Skillry remake, so check the prompt file before attributing a technique to the original creator.
- Best fit: required per-song discovery of code-animation approaches that map to a real scene need. Save a focused shortlist and connect each selected mechanism to an original song-local helper or scene caller; do not ingest all 703 prompts into a production.
- Compatibility/reuse: catalog only, not a runtime, package, renderer or ready-made integration. Prompt text and previews are research leads; the repository MIT license does not grant rights to third-party video, code, image, sound or assets. Re-author the song's scene and check specific source terms before direct code/asset reuse.
- Inspection scope: current README/license, full JSON schema and counts, complete tracked-file inventory, selected prompt Markdown files and helper behavior. The 703 prompts and linked creator works were not individually reviewed.
- Required per-song scan/shortlist remains in `claude-finished-song-animation-project/12_CODE_ANIMATION_REFERENCE_WORKFLOW.txt`.

- Song call-site pattern: save the relevant evidence/visual-fit note in the song’s research/source map; there is no R13 runtime dependency. If a documented mechanism inspires original scene code, identify the exact case and retain source attribution while checking third-party rights separately.

### R13 — athemeroy/awesome-claude-5-5-videos

- URL/commit: https://github.com/athemeroy/awesome-claude-5-5-videos — 0b96ca1ec8e03fe72a1c349370ab5dad043c5a1b
- Local checkout: repository-downloads/athemeroy/awesome-claude-5-5-videos/
- Role/license: source-linked research and production-method reference. Repository LICENSE/THIRD_PARTY.md distinguish CC BY 4.0 annotations from excluded third-party material.
- Prepared: catalog/docs available; optional chart/thumbnail/content refresh packages are deferred.
- Start with: README.md, docs/visual-effects-fit.md, docs/production-brief.md, docs/prompt-playbook.zh-CN.md, docs/methodology.zh-CN.md, data/cases.csv, data/corpus-snapshot.json and THIRD_PARTY.md.
- Useful methods: production brief separates input/license, shot states, tool roles and acceptance evidence; visual-effects-fit.md compares the production path to the visual requirement and names observable failure tests; evidence/methodology pages label sample limits and creator claims.
- Best fit: decision frameworks, visual/task fit, evidence discipline, source/rights matrices and alternatives when code-only drawing is not the best solution.
- Compatibility: not an engine or code dependency. Research findings are dated and sampled; do not present them as a current leaderboard or complete census. Third-party case media, prompts and code need their own permissions.
- Dependency closure: chart/report dependencies are optional maintenance tooling, not song-production dependencies.
- Inspection scope: README, license/THIRD_PARTY, production brief, visual-effects-fit, selected method/playbook pages and data schema snapshot. The full corpus and all linked posts were not read.
- Reuse note: attribute copied/adapted CC BY 4.0 annotations as required; do not copy excluded material or imply the user’s animation has acquired third-party rights.

### R14 — whaleyxbt/claude-motion (motion craft and Remotion examples)

- URL/commit: https://github.com/whaleyxbt/claude-motion — `e627941543d9988b155dc610bb9cc0115a5e365e`
- Local checkout: `repository-downloads/whaleyxbt/claude-motion/` (66 tracked files; full non-shallow checkout; no submodules/LFS pointers; MIT LICENSE).
- Start with README.md, AGENTS.md, CLAUDE.md, package.json; then `src/lib.ts` and `src/components/primitives.tsx`. Read symbols: `clamp01`, `lerp`, `smooth`, `band`, `prog`, `sp`, `effortAt`, `rand`; components `Mask`, `Roll`, `Spark`, `Grain`, `WobbleFilter`.
- Candidate use: study/adapt individual mechanisms for frame-derived easing, masked type, value transitions, SVG accents or texture. The helper imports Remotion and its own timeline; FPS, square canvas and palette values are project-specific. Confirm dependency closure and adapt to song-local timing/dimensions and arbitrary-frame determinism.
- `sims/kit/runtime.js` (`runSim`, `sim.render(t)`) is a separate simulation interface. `sims/capture.mjs` and package scripts include independent media capture/render, synthetic SFX/mux and sheet generation. Do not run/adopt them in this kit.
- `motion-design` skill is installed as optional `motion-craft`. `review-loop`, `sound-design` and `web-sims` were declined for overlap/conflict with the kit quality, audio-master and renderer rules. No dependencies or demo were run.
- Read scope: README/AGENTS/CLAUDE/package, named helpers/primitives, simulation docs/runtime/capture, four named skills; not the entire repository. Canonical detail: `ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md`.

### R15 — LottieFiles/motion-design-skill (implementation-agnostic craft guidance)

- URL/commit: https://github.com/LottieFiles/motion-design-skill — `f9a8a041b85185ee4881b3471d3415e939aac772`
- Local checkout: `repository-downloads/LottieFiles/motion-design-skill/` (20 tracked files, MIT LICENSE, no runtime).
- Start with README.md and `skills/motion-design/SKILL.md`; then inspect relevant `director/`, `patterns/`, and `reference/` files. Main skill plus selected core philosophy, decision, narrative, emotion, motion-personality, choreography, multi-element and quality checklist files were read. Full support tree is copied into `lottiefiles-motion-principles`.
- Best fit: emotional target, setup/action/resolution, hero/support/ambient hierarchy and choreography before implementation. UI-specific timing tables and style archetypes do not set song timing or palette. No executable code/runtime integration.
- Reading scope: selected docs, not all 20 tracked files; see the canonical resource guide.

### R16 — greensock/gsap-skills (GSAP agent guidance)

- URL/commit: https://github.com/greensock/gsap-skills — `aed9cfd3277740755f6bfc1155c7aa645403b760`
- Local checkout: `repository-downloads/greensock/gsap-skills/` (44 tracked files, MIT LICENSE, no root runtime package).
- Selected paths: `skills/gsap-core/SKILL.md`, `gsap-timeline/SKILL.md`, `gsap-react/SKILL.md`, `gsap-performance/SKILL.md`, `gsap-plugins/SKILL.md`, `gsap-utils/SKILL.md`; symbols include `gsap.timeline`, `useGSAP`, `gsap.context`, `ctx.revert`, plugin registration and `gsap.utils`. The React example has its own GSAP dependencies.
- R16 itself is guidance and its React example has a separate dependency scope. A historical check on 2026-10-27 found GSAP absent from the shared runtime. Current shared runtime dependencies are `@remotion/gsap@4.0.538` and `gsap@3.15.0`, aligned with Remotion 4.0.538; use `useGsapTimeline` for optional, frame-driven DOM/SVG choreography. The song-neutral `shared-animation-library/examples/remotion-gsap-choreography/` fixture now demonstrates the hook through the shared renderer in 4:5 and 9:16. See `shared-animation-library/remotion-runtime/README.md` for constraints. R04 HyperFrames' player dependency remains separate.
- Reading scope: README/AGENTS/LICENSE, six selected skill bodies and React example/manifest; other skills inventoried. No runtime/demo executed; see canonical resource guide.

## Scene-need index

Use the labels as a first shortlist, then verify exact source and compatibility. “Study” entries remain study-only.

| Song scene or technical need | First candidates | What to look for |
|---|---|---|
| Character acting, poses, expressive silhouettes | R01, R02 painted, R06; R08 study | Rig/pose API, gesture readability, shape detail and time-pure motion |
| Painted, paper, ink, print, engraving, textured surface | R02 painted, R03, R06 | Brush/material engine, masking, hatching, texture layers and performance cost |
| Typography, lyric hierarchy, kinetic letterforms | R02 kinetic, R03 graphic styles, R10 study | Measure text, line breaks, transitions, glyph/font terms, frame assumptions |
| Canvas, SVG, DOM and simple 2D forms | R01, R02, R06, R09 study, R12, R14; R16 only if explicitly selected | Time-evaluated draw methods, scaling, compositing and deterministic random use |
| Three-dimensional object/camera/light | R02 kinetic, R03 selected Three demos, R07; R04 architecture | Camera model, coordinate scale, asset closure, GPU/lifecycle and resolution assumptions |
| Particles, noise, trails and procedural geometry | R01, R02, R03, R05, R06, R07, R14 | Per-element seeds, arbitrary-time evaluation, cache/cleanup and amount of fill/draw work |
| Music structure, beat grid, audio analysis | R02, R05, R07; R04 timing reference | Input audio version, analysis method, time units, confidence, song-specific data isolation |
| Timeline, frame seeking, browser-to-render boundaries | Shared Remotion docs first; R04, R06, R07, R10 study, R14; R16 only if explicitly selected | Frame/time contract, random seek order, buffering, readiness, outputs and error propagation |
| Visual-system discovery and creator examples | R03, R11, R12, R13, R15 | Find original source, separate statement from evidence, inspect creator license |
| Historical/cinematic staging | R10 study, R13 research | Shot scale, scene progression and visual grammar; no code/media reuse by default |
| Actual reusable archival footage | Moving Image Archive guide, separate from R01–R16 code repositories | Search/preview selected clips, confirm item terms, save provenance and integrate at least one clip |
| Reusable render engine for a new song | Shared Remotion renderer | Do not swap in R04, R05, R06, R08, R09 or R10 renderers |

For R14–R16, assess all initialized project-local motion skills against the song's scene needs before storyboard lock; see `ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md` and `../claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt`. Record the skill files opened and the decision informed. Direct code adoption remains selective; assessment does not create a runtime dependency or require adaptation.

## Required per-song repository review

Save `productions/<song>/research/REPOSITORY_REVIEW.md` before finalizing the storyboard and link it from the plan/report and checkpoint. It is the evidence record for discovery, not a claim that every checkout was deeply read or used.

Include one ranked row for every catalogued R01–R16. For each accessible entry, assign a distinct overall relevance rank (1 = strongest fit for this song, 16 = weakest), a fit label (strong/plausible/weak/no fit), a concise reason tied to actual scene requirements, exact local paths actually opened, inspection depth and disposition (shortlisted/adapted, relevant but not selected, no fit, study/catalog-only or otherwise). If inaccessible, mark unverified/unranked, explain the blocker and leave discovery incomplete; never report it as scanned or no-fit.

For promising candidates only, inspect actual source bodies and follow the relevant imports, dependency closure, license and asset terms. Record exact symbols and reading scope; a README/router/catalog entry or package presence alone is not source inspection. Do not deep-read irrelevant repos merely to inflate the work.

For each selected mechanism, add a trace: scene/need → repository URL and pinned commit → exact path/symbol → observed behavior → dependency/license and Remotion compatibility → copied/modified/re-authored status → song-local helper/scene file and concrete caller. Name why each relevant but unused candidate was not selected. A proposed mechanism without a caller is not integrated. Study-only or catalog-only repositories may inform research but do not create an executable call site; state their boundary. Keep R12/Skillry and Moving Image Archive evidence in their separate song-specific records.

Use one concise table, then a short candidate/call-site section. Rank for usefulness, not an adoption quota. “No suitable candidate” is acceptable when the evidence supports it; never manufacture repository usage. Preserve license credit and distinguish available, opened, inspected, prepared, adapted, integrated, checked, browser-reviewed and visually accepted states.
