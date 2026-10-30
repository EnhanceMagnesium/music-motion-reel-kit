# Renderer v2 — changes and local commands (2026-10-05)

## What changed from v1
- **Spec fields:**
  - `audioStart` gives a source offset in seconds, applied at ffmpeg input; the master file is never modified.
  - `sceneScript` names a scene module that registers itself in `window.SCENES`.
  - `cues` is a JSON file passed to the scene.
  - `fonts` lists FontFace files.
  - `assets` lists extra files to include in the job hash.
- **Job hash** now covers the spec, studio.html, render.mjs, the scene script, cues, assets, and the audio bytes.
- `--stills=t1,t2,…` writes PNGs to `out/<job>/stills/` without encoding.
- `--range=a:b` renders a frame range only.
- **Validation:** `duration*fps` must be an integer, a duration over 45 s is an error, and a duration outside 35–40 s is a warning.
- **After encoding**, ffprobe is written into `status.json` (`export`), and the job fails if the export runs longer than 45 s.
- **Audio** is padded with silence (`apad`) only past the master's end, so an image-only hold can follow the song.
- **Driver:** uses puppeteer-core if installed (it is on the Mac), otherwise Playwright.
- The demo spec still works through the registry.

## Local commands (Mac Terminal, from `renderer/`)
```sh
export PATH="~/.local/bin:$PATH"
node -v; ffmpeg -version | head -1
node render.mjs --spec=specs/his-line.json --preflight
node render.mjs --spec=specs/his-line.json --stills=0,13.3,32.95   # quick look
node render.mjs --spec=specs/his-line.json --detach                 # full render, resumable
cat out/his-line-*/status.json                                      # progress / export probe
```
To resume after an interruption, run the same `--detach` command again; finished frames are skipped. Any edit to the scene, cues, spec, fonts or audio produces a new job directory.
The Mac's Chrome renders text slightly differently from the cloud Chromium 141, so a Mac render will have the same job hash but slightly different pixels from candidate 1 unless its frames are reused.
