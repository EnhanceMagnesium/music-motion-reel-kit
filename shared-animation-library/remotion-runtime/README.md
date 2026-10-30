# Remotion runtime in the shared animation library

This is the installed Remotion render engine for the active `music-motion-reel-kit`. It is part of the same shared library and uses the same per-song `PROJECT` configuration and export plan. There is one front door, `shared-animation-library/render.mjs`; this is not a separate video project. Existing p5 productions remain on the legacy engine. New song productions select Remotion explicitly with `PROJECT.renderEngine: 'remotion'`.

## Install record

`package.json` and `package-lock.json` pin `remotion`, `@remotion/bundler`, `@remotion/renderer`, and `@remotion/gsap` to 4.0.538, React/ReactDOM to 19.3.1, and the GSAP peer dependency to 3.15.0. Keep all `remotion` and `@remotion/*` versions aligned. Install only in this directory with `npm ci`. The CLI and Studio packages are not installed; Remotion is integrated through its programmatic server renderer and the shared project command. The active Mac installation is under this directory's `node_modules/` and occupies about 203 MB including the platform compositor binary.

Remotion's Free License currently includes eligible individuals (personal or commercial use) and teams/organizations of up to three people, subject to its current terms. Codec patent obligations are separate. Recheck the [license FAQ](https://www.remotion.dev/docs/license/faq) if the project or team changes.

## Song production contract

Keep every song's config, React scenes, media and outputs in its own production folder. The existing normalized `PROJECT` remains the single declaration for format, duration, frame rate, scene schedule, cues, audio, assets and fonts. Example:

```js
renderEngine: 'remotion',
remotion: {
  scenes: 'remotion/scenes.jsx',
  publicDir: 'public',
},
```

Declare the React scene registry in `remotion/scenes.jsx` as a named export `scenes`; keys must match `PROJECT.scenes[].impl`, or the scene `id` if `impl` is omitted. Registry values are React components. Each receives `{ project, scene, time, cues, assets, fonts, role }`. `time` contains local and production frames/times, fps, scene duration and source-recording time. Derive every frame from these values or Remotion's `useCurrentFrame()`; do not depend on previous frames.

`PROJECT.scenes` is the timed visual schedule. Optional `PROJECT.overlays` entries use the same `{id, impl?, start, end, params?}` shape and render above scenes. React components are not p5 scripts: `PROJECT.modules`, `registerSceneImpl()` and `draw(st)` do not load or adapt into Remotion automatically. Adapt a selected mechanism to a React component deliberately and retain its source attribution. Both engines share the timing/configuration contract; their scene code stays engine-specific.

## Choreograph with GSAP

Use GSAP when a scene benefits from choreographed sequences, staggers, holds or emphasis across DOM/SVG elements. Import `useGsapTimeline` from `@remotion/gsap`; the hook creates a paused, scoped timeline and seeks it from Remotion's current frame. Remotion stays the only clock. This is already installed in the shared runtime, so song productions do not install GSAP themselves.

```jsx
import {useGsapTimeline} from '@remotion/gsap';
import {AbsoluteFill} from 'remotion';

export const ChoreographedScene = () => {
  const scope = useGsapTimeline(({timeline, selector}) => {
    timeline.from(selector('[data-title]'), {
      y: 36,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    });
  });

  return (
    <AbsoluteFill ref={scope}>
      <h1 data-title>Song-specific title</h1>
    </AbsoluteFill>
  );
};
```

Keep the builder synchronous. Do not call playback/seek methods, add callbacks or free-running tweens, target plain JavaScript objects, or use unseeded randomness. The adapter currently supports DOM/SVG element targets, not Canvas/WebGL state or GSAP plugins. Derive numeric Canvas/WebGL values from `useCurrentFrame()` and Remotion interpolation instead. Keep tween counts bounded because each requested frame is evaluated from the timeline's start. See the [Remotion `useGsapTimeline` reference](https://www.remotion.dev/docs/gsap/use-gsap-timeline) for the full current constraints.

The song-neutral [GSAP choreography fixture](../examples/remotion-gsap-choreography/README.md) exercises this hook through the shared render entry at both 4:5 and 9:16. It covers a staged entrance, stagger, emphasis, progress sweep, hold, and repeated requests for the same quantized frame. The fixture is a mechanism check, not a song-style example or full-render evidence.

Claude may choose per scene to host a HyperFrames Player HTML/GSAP child composition inside a Remotion React scene when that scene's actual nested-composition or footage-layering needs make it useful. Remotion still supplies the scene's frame/time, master audio, composition dimensions and duration, final export and encoder; HyperFrames must not add a competing clock or soundtrack. The shared renderer does not expose a HyperFrames engine selection. The isolated proof and readiness limits are documented in `../examples/remotion-hyperframes-hybrid/` and `../../claude-finished-song-animation-project/14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt`.

Place the unchanged supplied master and all declared local media under the configured `publicDir`. `PROJECT.audio`, asset `src` values and font `src` values remain relative to the production folder. The shared runner checks paths, maps them to Remotion `staticFile()` URLs, loads declared image assets and font faces before drawing, and passes normalized cue entries to scenes. Mark image assets with `kind: 'image'` to include them in readiness loading. Keep lyric text supplied and cue timing evidence-labelled as defined by `production/cue-schema.mjs`.

New songs use the entire measured recording by default. Set `PROJECT.duration`, width and height explicitly. Choose the song's native 4:5 (1080×1350) or 9:16 (1080×1920) frame before storyboarding; compose for that frame. For a zero-offset full master, the shared plan rounds the video frame count up, while `Html5Audio` receives the exact measured source duration (`PROJECT.duration × fps` frames; Remotion 4.0.538 accepts a fractional frame duration). The planned video can end less than one frame after the audio; the master is not trimmed or padded by this plan. The plan reports the endpoint difference, but only an authorized render and playback can establish actual encoded endpoints and audible sync. Explicit ranges retain their nearest-frame, frame-bounded audio behavior. Use `claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt` for the authorized review sequence and evidence requirements. After a full candidate exists, the isolated Playwright helper in `shared-animation-library/quality-review/` checks browser decoding and captures selected candidate frames; it is a post-render QA tool, not part of the Remotion rendering runtime. See `claude-finished-song-animation-project/11_HEADLESS_BROWSER_FRAME_REVIEW.txt`.

## Shared commands

Run these from the kit root. The `--plan` command checks the song config and prints the frame/audio plan without opening Chrome or creating media:

```sh
node shared-animation-library/render.mjs --root=productions/<song> --plan
```

After the applicable production stage is authorized, the same front door can render stills or the full MP4:

```sh
node shared-animation-library/render.mjs --root=productions/<song> --stills=1.5,12.25 --out=out/stills
node shared-animation-library/render.mjs --root=productions/<song> --render --out=out/<song>.mp4
```

The shared wrapper refuses to overwrite outputs or write outside the song folder. It requires a locally installed Chrome/Chromium and passes its path to Remotion; it will not silently download a browser. The Remotion renderer uses its pinned platform compositor binary from this isolated dependency set. `base/render.mjs` remains available for the legacy p5 workflow. In local Claude Code Desktop, the Browser pane can open the rendered video for an interactive visual preview. The isolated Playwright package remains the saved post-render QA route in `quality-review/`; the pane does not replace it or the separate full playback with sound.

## Verification boundary

The shared route and package versions are source-inspected; a `--plan`, metadata probe, browser scene draw and encoded candidate are separate evidence. For Will Not Fade, the native plan and early browser-readiness results are recorded under `productions/will-not-fade/technical-review/`. The later adapter browser harness in `adapter_check_20261025-080044_83345/` passed five variants (4:5, 9:16, slow draw and controlled failure paths). That establishes only its instrumentation assertions, not visual quality or MP4 output. GPT’s fixture-only still review is saved at `gpt_fixture_stills_20261025-080452/`. Song-specific scenes were later implemented and 12 non-rendering assertions passed, as recorded in `IMPLEMENTATION_REPORT_2026-10-25.md`; the complete Will Not Fade song candidate has not been rendered or reviewed with sound. Read the current `productions/will-not-fade/CHECKPOINT.md` and dated reports for exact scope and chronology.

The eight-second neutral example is a synthetic wiring fixture, not evidence of full-song duration, synchronization or creative quality. Keep browser draw, encoding, audio decoding, synchronization, full playback, visual review and user acceptance separate. A successful `--plan` does not render a browser or media.
