# Song candidate browser review

This isolated QA package provides headless Playwright review of an already-rendered Remotion MP4. It does not participate in `shared-animation-library/render.mjs` rendering, and it does not install dependencies in individual song folders.

Install with the package lock when needed:

```sh
npm ci --prefix shared-animation-library/quality-review
```

No Playwright browser is downloaded. The CLI uses the same external local Chrome/Chromium selected by the shared Remotion renderer (override with `--chrome=/absolute/path/to/Chrome`). This avoids a second browser installation, while keeping browser protocol compatibility dependent on the locally installed Chrome version. The current pinned Playwright Core version and license are in `package.json` and `package-lock.json`.

After an authorized full render, run from the kit root with a compact, risk-based time list:

```sh
node shared-animation-library/quality-review/playwright-video-review.mjs \
  --root=productions/<song> \
  --video=out/<candidate>.mp4 \
  --times=0,4.2,12.5,28.0,67.0 \
  --out=review/playwright-round-01
```

The helper serves the candidate on loopback with byte-range support, launches a fresh headless browser profile, confirms browser decoding and configured dimensions, seeks and captures each requested frame, writes JSON evidence, and uses FFmpeg to make a contact sheet. Output is confined to the named song folder. Existing output paths are refused.

The PNGs are visual evidence from selected moments only. The helper mutes audio and does not establish synchronization, full-playback quality, visual acceptance, or behavior between samples. Follow `claude-finished-song-animation-project/11_HEADLESS_BROWSER_FRAME_REVIEW.txt` and the canonical `07_QUALITY_REVIEW_AND_ACCEPTANCE.txt`.

## Temporal stability scan

For an authorized rendered candidate with animated texture, SVG filters, nested effects, or a reported flicker/dropout, scan the complete encoded file before making word-level lyric timing refinements:

```sh
node shared-animation-library/quality-review/temporal-stability-scan.mjs \
  --video=productions/<song>/out/<candidate>.mp4 \
  --out=productions/<song>/review/temporal-stability-candidate-01.json
```

This built-in helper uses the existing `ffprobe` and `ffmpeg`; it adds no package and writes JSON only. It flags possible isolated-frame anomalies and summarizes adjacent-frame grayscale change by second. Treat the output as a locator: inspect flagged frames with their immediate neighbors and use playback to distinguish intentional action from a defect. A zero count is not proof that all flicker or dropouts are absent. For a suspected multi-worker-only issue, compare otherwise identical candidates with `--workers=1` as a production-specific diagnostic; one song's result does not change the shared render default. See `../../claude-finished-song-animation-project/18_TEMPORAL_STABILITY_AND_WORD_TIMING.txt` for interpretation and evidence requirements.


## Browser compatibility boundary

This package is pinned to `playwright-core` and uses an existing system Chrome/Chromium to avoid downloading another browser. Playwright’s [official BrowserType documentation](https://playwright.dev/docs/api/class-browsertype) says it works best with its bundled Chromium, gives no guarantee for another browser version, and advises extreme caution with `executablePath`. Stock Chrome may be useful for proprietary media codecs; the actual candidate MP4 decode/capture is the relevant compatibility evidence. The installed system-Chrome route is an explicit project choice, not a guarantee: a blank-page smoke does not prove that a real candidate MP4 decodes, seeks or captures correctly. Preserve actual candidate-review evidence and report failures. Do not change versions or install a browser without a concrete compatibility defect.

