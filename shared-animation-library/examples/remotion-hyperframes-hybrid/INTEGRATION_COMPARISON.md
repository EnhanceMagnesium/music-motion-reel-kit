# Remotion + HyperFrames scene comparison

**Purpose:** bounded synthetic proof of the proposed arrangement: Remotion owns the production clock and final composition; a HyperFrames HTML/GSAP subcomposition supplies one scene layer. The reference is the same scene written directly in Remotion. This is a technical comparison, not a production integration or song render.

## Result

The hybrid worked for this small, synchronous HTML/GSAP scene in both 4:5 and 9:16. Across three matched local frames per format, the artwork appeared effectively the same as the direct Remotion scene. ImageMagick absolute-error comparisons report about 0.13–0.21% normalized pixel difference across the six pairs, concentrated in text/edge rasterization and small marker-edge differences; the broad layout, colors, geometry and motion positions agree. This shows no image-quality gain from wrapping this particular scene in HyperFrames.

The hybrid's integration burden is materially higher. The direct scene uses the existing Remotion component contract and its `time.localSeconds`. The hybrid adds an HTML/CSS composition, GSAP timeline and runtime, HyperFrames Player custom element, local vendor assets, async custom-element loading, pause/seek handling, a per-frame Remotion delay handle, and a two-animation-frame wait before capture. That is reasonable when an existing HyperFrames composition or its nested HTML/GSAP system brings scene content that would otherwise need to be rebuilt. It is unnecessary overhead for scenes that can be expressed directly in Remotion.

**Operating rule:** Remotion remains the default master composition and sole final renderer. Claude chooses per scene whether a concrete HyperFrames source or subcomposition gives a clear craft or implementation advantage; this routine technical judgment does not require the user to select the route or approve a comparison. Do not require a hybrid bridge for every song and do not change the shared render entry based on this one simple fixture.

## Implementation exercised

- The 4:5 and 9:16 fixtures both use the shared Remotion entry, no audio, and a 4.8-second synthetic schedule: native Remotion scene first, HyperFrames scene second.
- Direct Remotion scene animation is derived from the current scene frame/local time. The HyperFrames document declares a paused GSAP timeline with the same 2.4-second linear rotation.
- The React wrapper loads the pinned local Player bundle, creates a same-origin `srcdoc` subcomposition with the local runtime URL, waits for Player readiness, pauses and seeks it to the Remotion scene's local time, then holds Remotion capture until two `requestAnimationFrame` callbacks have run. Cleanup releases the active Remotion delay handle; the upstream Player's `disconnectedCallback` stops its probe/clocks and tears down media when React removes it.
- Requested sample order is non-chronological. Direct frame samples are 7, 29 and 50. Matching HyperFrames samples are frames 65, 87 and 108. The hybrid sequence begins at frame 58 because its 2.4-second schedule boundary rounds to frame 58 at 24 fps. Therefore frame 87 (3.625 s), not frame 86 (3.6 s), corresponds to direct local frame 29. The first-batch frame 86 is preserved but excluded from the matched-pair comparison.

The Player's documented `seek(timeInSeconds)` is a playback seek API. It does not return a completion promise. For this synchronous GSAP fixture, the screenshots show the requested states after readiness and the bridge's two-frame wait. This does not prove that arbitrary asynchronous assets, Canvas/WebGL drawing, video clips, or long/full-song sequences settle correctly. The two-frame wait is a prototype policy, not a measured performance benchmark. [HyperFrames Player API](https://hyperframes.heygen.com/packages/player)

## Plans and still evidence

No-media plans succeeded:

- `node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-hyperframes-hybrid/fixture-4x5 --plan` — exit 0; 1080×1350, 24 fps, 4.8 seconds, 116 planned frames, no audio.
- `node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-hyperframes-hybrid/fixture-9x16 --plan` — exit 0; 1080×1920, 24 fps, 4.8 seconds, 116 planned frames, no audio.

Still renders used the shared Remotion path, not a video render. Six PNGs were captured for each format in out-of-order request sequence `2.1,0.3,1.2,4.5,2.7,3.6`. One additional middle HyperFrames sample at `3.625` seconds was captured per format to match the direct sample's local frame exactly. All PNGs are 1080×1350 or 1080×1920 as configured:

- 4:5 initial set: `fixture-4x5/review/stills-20261026/`; corrected matched sample: `fixture-4x5/review/stills-aligned-20261026/t3_63.png`.
- 9:16 initial set: `fixture-9x16/review/stills-20261026/`; corrected matched sample: `fixture-9x16/review/stills-aligned-20261026/t3_63.png`.

Matched pair map and absolute-error metric (normalized value in parentheses):

| Ratio | Direct frame/time | HyperFrames frame/time | AE |
|---|---:|---:|---:|
| 4:5 | 7 / 0.2917 s | 65 / 2.7083 s | 3004.33 (0.00206058) |
| 4:5 | 29 / 1.2083 s | 87 / 3.6250 s | 2590.73 (0.00177690) |
| 4:5 | 50 / 2.0833 s | 108 / 4.5000 s | 2799.42 (0.00192004) |
| 9:16 | 7 / 0.2917 s | 65 / 2.7083 s | 3395.29 (0.00163739) |
| 9:16 | 29 / 1.2083 s | 87 / 3.6250 s | 2740.26 (0.00132150) |
| 9:16 | 50 / 2.0833 s | 108 / 4.5000 s | 3084.10 (0.00148732) |

The 4:5 early pair's difference image is `comparisons/4x5-early-difference.png`. The visual files are synthetic method comparisons, not approved design or song artwork.

## Effort and payload

The scene registry is 138 lines including the direct implementation, subcomposition HTML template, and bridge lifecycle. The shared renderer itself required no changes. The hybrid fixture copies three prebuilt assets into each production public folder:

- HyperFrames Player 0.8.130 global build: 102,809 bytes.
- HyperFrames runtime built from the same pinned checkout: 487,089 bytes.
- GSAP 3.15.0 distribution: 72,927 bytes.
- Total: 662,825 bytes per fixture public folder (1,325,650 bytes across the two dimension fixtures because their folders are isolated).

A shared adapter could vendor these assets once, but would add a maintained bridge surface to the shared library, plus runtime version pinning, error/timeout behavior, resource checks and tests for async readiness, out-of-order seeks, unmount, and both formats. In a real song, an existing HyperFrames composition could make that setup worthwhile; this matched vector motion scene does not.

## Provenance and verification limits

The Player and runtime bundles are unmodified artifacts from local `repository-downloads/heygen-com/hyperframes`, source commit `6791ea580c811fe3f1a532a2ced4bbed29008ee7`, package version 0.8.130. GSAP 3.15.0 was copied from that checkout's dependency tree. See `THIRD_PARTY_NOTICES/NOTICE.md` and the Apache license copy there. No dependency was installed or version changed.

Verified here: shared no-media plans; Remotion browser still capture in both frame sizes; visual comparison of the specified samples; seek-order operation across requested samples; local third-party asset provenance and byte sizes.

Not verified: any encoded video; full-song capture speed; audio, sync or mux; async Canvas/WebGL or footage; frame-by-frame cross-renderer pixel identity; memory/performance under long renders; broad error recovery; user acceptance. A few stills cannot establish pacing, transitions, or motion between samples.

No shared renderer, project-wide guidance, pinned repository, dependency manifest, or song production was changed.
