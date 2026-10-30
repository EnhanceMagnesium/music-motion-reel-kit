# Remotion + HyperFrames hybrid proof

This isolated example compares the same synthetic orbit scene implemented as a native Remotion component and as an HTML/GSAP subcomposition hosted by HyperFrames Player inside Remotion. It is not a song production, does not use audio, and does not change the shared render entry or any existing production.

## What the proof exercises

- Remotion owns the overall composition, frame, dimensions, FPS, scene schedule, and still capture.
- Each fixture schedules the direct scene first and the HyperFrames version second. Both are driven by the same local scene time at corresponding sample positions.
- The HyperFrames bridge loads its pinned local player bundle, passes the HTML subcomposition through `srcdoc`, supplies the pinned local runtime URL, seeks the paused GSAP timeline to the Remotion scene time, then holds the Remotion capture until two browser animation frames have passed.
- The same scene layout is prepared for 4:5 (1080×1350) and 9:16 (1080×1920); the composition’s geometry scales from the chosen dimensions.
- Samples are deliberately requested out of chronological order to expose basic seek-order dependence.

The bridge uses the installed `@hyperframes/player` 0.8.130 web component and `@hyperframes/core` runtime from the kit’s pinned HyperFrames checkout. It does not create a second renderer or encode video. HyperFrames Player’s `seek()` API is not itself a render-completion promise; the small synchronous-GSAP fixture plus two animation-frame wait is only a prototype readiness strategy. It does not establish safe integration for asynchronous Canvas/WebGL work, video footage, long compositions, or full-song rendering.

## Run from the kit root

Print plans (no browser or media):

```sh
node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-hyperframes-hybrid/fixture-4x5 --plan
node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-hyperframes-hybrid/fixture-9x16 --plan
```

Render only the six comparison stills in each fixture (no video):

```sh
node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-hyperframes-hybrid/fixture-4x5 --stills=2.1,0.3,1.2,4.5,2.7,3.6 --out=review/stills-20261026
node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-hyperframes-hybrid/fixture-9x16 --stills=2.1,0.3,1.2,4.5,2.7,3.6 --out=review/stills-20261026
node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-hyperframes-hybrid/fixture-4x5 --stills=3.625 --out=review/stills-aligned-20261026
node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-hyperframes-hybrid/fixture-9x16 --stills=3.625 --out=review/stills-aligned-20261026
```

The direct timestamps map to 4:5 and 9:16 frames 7, 29, and 50. The paired HyperFrames frames are 65, 87, and 108, requested at 2.708333, 3.625, and 4.5 seconds. The middle time is 3.625 rather than 3.6 because the 2.4-second scene start rounds to frame 58 at 24 fps; this makes the local frame match exactly. The first batch's 3.6-second sample (frame 86) is retained as an unpaired diagnostic. The paths are intentionally unique and the shared renderer refuses to overwrite existing stills. Results and the comparison report are saved under this example. Do not treat them as user-approved artwork or as evidence about audio synchronization.

## Provenance

The `public/` bundles are copied unmodified from the pinned `repository-downloads/heygen-com/hyperframes` checkout. Exact source versions, commit and notices are recorded in `THIRD_PARTY_NOTICES/NOTICE.md`. The global player and runtime are Apache-2.0 artifacts. GSAP’s package states its Standard "no charge" terms; this internal technical fixture does not decide downstream redistribution or licensing questions.

## Decision boundary

This experiment informs Claude's per-scene implementation judgment; it is not a manual route choice for the user. Claude can choose a HyperFrames child composition when an inspected scene-specific HTML/GSAP or nested/footage-layering mechanism justifies the bridge, and can choose direct Remotion when it is simpler. The proof does not justify changing the shared production route. A general adapter should be promoted only when there is a repeated, concrete benefit and focused checks establish seek readiness, error handling, cleanup, performance, and compatible review/render behavior.
