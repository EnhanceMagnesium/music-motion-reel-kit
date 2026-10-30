# GSAP choreography fixture report — 2026-10-28

## Scope

This pass establishes a reusable, song-neutral example of the installed GSAP adapter inside the active shared Remotion route. It does not modify a song, render an MP4, add packages, or change package versions.

## Integration verified

- `shared-animation-library/render.mjs` loaded each fixture's normalized `PROJECT` and routed it through `shared-animation-library/remotion-runtime/render.mjs`.
- The shared Remotion runtime already contains aligned `remotion`, `@remotion/gsap`, `@remotion/bundler`, and `@remotion/renderer` 4.0.538 packages with GSAP 3.15.0. No install or upgrade occurred.
- The scene imports `useGsapTimeline` from `@remotion/gsap`. The fixture uses that paused, scoped timeline for a title entrance, orbit, staggered nodes, an emphasized word, a progress sweep, a pulse, and a closing hold. The fixture has no audio, footage or song narrative.
- Separate config files explicitly set 1080×1350 and 1080×1920 at 24 fps. Both use the same scene source, confirmed byte-for-byte equal. All visual values are based on scene markup and normalized dimensions; no unseeded random state is used.
- The timeline builder makes no playback, seek, restart or reverse calls. The shared still renderer bundles the scene in Chrome and validates composition metadata before capture.

## Commands and results

From the active kit root:

| Command | Result |
|---|---|
| `node --check shared-animation-library/examples/remotion-gsap-choreography/run-fixture-checks.mjs` | Exit 0. |
| `node shared-animation-library/examples/remotion-gsap-choreography/run-fixture-checks.mjs` | Exit 0; static checks, both plans, both still captures, dimensions, and repeated-frame hashes passed. |

The runner recorded the exact subcommands and raw output in `repository-preparation/gsap_choreography_fixture_run_20261028T221220625Z_4807/`. Before any browser command it verifies the aligned package versions declared by the shared runtime and runs static checks on the scene/config source.

- `plan-fixture-4x5.stdout.txt`, `.stderr.txt`, and `.status.json`: shared no-media plan exit 0; 1080×1350, 24 fps, 96 frames, no audio.
- `plan-fixture-9x16.stdout.txt`, `.stderr.txt`, and `.status.json`: shared no-media plan exit 0; 1080×1920, 24 fps, 96 frames, no audio.
- `stills-fixture-4x5.*` and `stills-fixture-9x16.*`: shared `--stills` browser-backed captures, both exit 0.
- `static-check.json`: configs normalize to the intended dimensions; two scene files match; GSAP hook is present; no unseeded randomness or free-running timeline calls are present.
- `run-summary.json`: environment, package versions, exact commands, exit statuses, image dimensions, frame indexes and SHA-256 hashes.

Each format rendered five PNGs in the requested nonchronological time order `2.00, 0.50, 3.50, 2.01, 1.00` seconds. At 24 fps these requests correspond to frames `48, 12, 84, 48, 24`; the two distinct still filenames for frame 48 have identical SHA-256 values within each format. PNGs are under:

- `shared-animation-library/examples/remotion-gsap-choreography/fixture-4x5/review/gsap_choreography_fixture_run_20261028T221220625Z_4807/`
- `shared-animation-library/examples/remotion-gsap-choreography/fixture-9x16/review/gsap_choreography_fixture_run_20261028T221220625Z_4807/`

Representative opening, action and hold stills were inspected at their native 1080-pixel width. The center orbit and staged type remain within the frame, with additional vertical breathing room in the 9:16 composition. These are observations about this fixture's captured frames only.

## What the evidence establishes

The installed `useGsapTimeline` adapter works in a React scene bundled by the shared Remotion renderer. Both supported portrait dimensions flow through the actual config and metadata path. Browser-backed still output succeeds at selected frames in nonchronological order, and two requested timestamps that quantize to the same frame yield matching PNG bytes. The mechanism can therefore support bounded, time-based DOM choreography without an independent GSAP playback clock.

## Remaining limits

No MP4 was rendered. The captures do not establish continuous motion or transition quality between samples, full-render performance, audio timing/synchronization, suitability for any song, or creative acceptance. The check revisits frame 48 through two still requests in the shared-renderer invocation; it does not claim a long-lived interactive Player's DOM was scrubbed repeatedly in one browser page. Canvas/WebGL output is outside the GSAP adapter's target contract and remains frame-derived.

## Changed paths

- `shared-animation-library/examples/remotion-gsap-choreography/` — new four-second fixture, separate 4:5 and 9:16 configs, identical React scene registries, runner and README.
- `shared-animation-library/remotion-runtime/README.md` — link to the tested fixture and evidence boundary.
- `shared-animation-library/README.md` — index entry for the fixture.
- `claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt` — song-use pointer.
- `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md` — R16 current integration pointer.
- `repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md` — verification status reconciled with the fixture evidence.
- `reusable-animation-context/VERIFIED_PRODUCTION_LESSONS.md` — L21 records the reusable, evidence-backed lesson.
- `repository-preparation/gsap_choreography_fixture_run_20261028T221220625Z_4807/` — raw command evidence and verification summary.

No song folder, shared runtime source implementation, package manifest or lockfile was changed.
