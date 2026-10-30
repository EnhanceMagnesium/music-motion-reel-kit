# Remotion GSAP choreography fixture

This is a song-neutral, four-second technical fixture for the shared Remotion route. It demonstrates GSAP as a way to **choreograph code-built action**: a staged entrance, orbit, staggered markers, a sequence label, a progress sweep, a brief emphasis pulse, and a closing hold.

The graphic and its test colors are arbitrary fixture content. They do not establish a visual style, palette, or design default for a song. There is no recording, footage, lyric, song artwork, or audio sync claim here.

## Integration

Both fixtures use `PROJECT.renderEngine: 'remotion'`, a named React scene registry, and the common `shared-animation-library/render.mjs` entry. They are explicitly authored at 1080×1350 (4:5) and 1080×1920 (9:16), each at 24 fps. The scene reads its dimensions from normalized `project` and uses `useGsapTimeline` from the already installed `@remotion/gsap` 4.0.538 with GSAP 3.15.0. No song or per-production packages are added.

Remotion supplies the frame clock. The GSAP builder is synchronous and scoped to the scene root; its paused timeline is evaluated from the requested Remotion frame. The fixture uses only DOM elements. For Canvas/WebGL scenes, continue deriving numeric draw state from `useCurrentFrame()` and Remotion interpolation rather than targeting canvas state with GSAP.

## Run the bounded check

From the kit root, use:

```sh
node shared-animation-library/examples/remotion-gsap-choreography/run-fixture-checks.mjs
```

The runner first records no-media plans for both configurations. Only if both plans pass, it uses the shared renderer to create five PNGs per format at requested times `2.00, 0.50, 3.50, 2.01, 1.00` seconds. At 24 fps, 2.00 and 2.01 seconds both resolve to frame 48. The non-monotonic sequence and equal-frame image hashes provide a bounded repeated-frame determinism check. It writes unique command stdout/stderr/status files and an image-check record under `repository-preparation/gsap_choreography_fixture_run_<timestamp>_<pid>/`; rendered fixture PNGs remain inside each fixture's `review/` folder. Existing evidence and images are never overwritten.

The shared still command starts a browser-backed still render for each requested frame. This check establishes successful bundling, composition metadata validation, PNG output, and byte-identical output for the two requests that quantize to the same frame. It does not establish continuous motion quality, performance during a full render, song suitability, or audio/video synchronization.

## Files

- `fixture-4x5/` — config, scene registry, and empty Remotion public directory.
- `fixture-9x16/` — same scene mechanism with a separate explicit 9:16 config.
- `run-fixture-checks.mjs` — guarded runner for the no-media plans and the ten authorized fixture stills.
- `fixture-*/review/` — generated stills, kept separate from song productions.
