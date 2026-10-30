# Production readiness report — music-motion-reel-kit

Date: 2026-10-05 05:45 America/Chicago · Prepared by Claude (cloud session linked to `macbook-pro-local`)

## 0. Status in one line
Renderer and source library are readable and their code is internally consistent. **Mac-side runtime checks are UNVERIFIED today** because the Mac shell environment failed to start. The renderer needs three small extensions before the first song render; none blocks scene planning.

## 1. Reconciliation with 25_GPT_IMPORT_VERIFICATION
These GPT corrections replace the claims in my earlier import completion summary:

| Earlier claim | Corrected record |
|---|---|
| 4,983 repository files saved | **5,123** (confirmed today: the ledger lists 5,123 across 13 repositories, 23 records total) |
| "66 exact file links" | **65 file links + 1 directory link** (W01 skills directory), all present |
| R08–R10 stored mode 0444 | Archive extraction gave 0644; **GPT set all raw files to 0444 after placement** |
| Every file hashed | 287 W01 remotion-dev/skills files had no per-file hash; **GPT added them in `source-library/index/GPT_SUPPLEMENTAL_HASHES.json`** (287 entries, read today) |
| R11 imported "within approved scope" | Imported with a `*` pattern. That is wider than manifest 15 and includes browse/, scripts/, tests/, .github/ and AGENTS.md. **These stay inert references; the approved role is catalog discovery only** |
| R04 "complete approved scope" | docs/ and skills/ only, with no packages/ implementation. Adequate for planning; anything more needs exact references |
| W03 "acquired" | Paraphrased extraction, not a full capture; the author source is in R09 (study-only) |

The original ledger and IMPORT_REPORT stay as acquisition records. GPT's file is the correction layer.

## 2. Paths successfully read (staged from the Mac, mtimes recorded)
Kit root: ``
- `renderer/render.mjs` (7,119 B), `renderer/studio.html` (4,150 B), `renderer/package.json`, `renderer/package-lock.json`, `renderer/README.md`, `renderer/specs/demo.json`
- `renderer/node_modules/puppeteer-core/package.json` → **puppeteer-core 25.12.0 installed** (zod is also present in node_modules)
- `renderer/out/vertical-system-demo-8cbf70fddef1/{status.json,render.log}`, `renderer/out/vertical-system-demo-90d2ebf285cf/status.json`
- `source-library/import-ledger.json` (863,662 B), `source-library/index/{ANIMATION_METHOD_INDEX.md, source-catalog.csv, deep-link-map.json, GPT_SUPPLEMENTAL_HASHES.json, GPT_IMPORT_VERIFICATION.txt}`
- `SESSION_CHECKPOINT.md`, `README.md`, `CLAUDE.md`
- Full directory listing (1,433 entries, depth 5) was also read.

## 3. Preflight — what was actually checked

### Your Mac (the rendering environment): UNVERIFIED today
- Exact error from the Mac shell tool: `Workspace unavailable. The isolated Linux environment on this device failed to start. Use device_stage_files / device_commit_files instead.`
- I therefore could not run `node`, `ffmpeg` or the preflight on the Mac.
- Reported by you, not verified: Node.js v26.7.0 at `~/.local/bin/node`.
- On-disk evidence, which proves files exist and does not prove they run today:
  - puppeteer-core 25.12.0 is installed in `renderer/node_modules`.
  - Two completed demo jobs exist, dated 2026-09-28, each with 96 frames and video.mp4 (461,662 B).
  - Job `90d2ebf285cf` hashes to the same version id that today's render.mjs + studio.html + demo.json produce. So the current renderer code has completed a full render on this Mac before.
- Not checked on the Mac: whether Chrome exists at `/Applications/Google Chrome.app/...` (the renderer's default path), FFmpeg version and PATH, and Node on PATH. `renderer/README.md` states that "the required software is installed on this Mac", but that is an unverified claim.

### Cloud workspace (code-level check only, not your Mac)
- Node v22.22.0, FFmpeg 6.1.1, Chromium 141.0.7390.37.
- `npm ci` was refused by the registry policy (403 on zod 3.25.76), so puppeteer-core could not be installed here.
- I stubbed the puppeteer import solely to exercise `--preflight`. Results:
  - Demo spec: `Preflight OK: 1080x1920, 96 frames`, job id `90d2ebf285cf`, which matches the Mac job above.
  - A 40.0 s test spec: `Preflight OK: 1080x1920, 960 frames`.
- What `--preflight` actually tests is limited. It runs `ffmpeg -version`, confirms a Chrome path exists, and validates spec fields and scene coverage. It does **not** launch Chrome or check Node/puppeteer versions, and it does not check that the audio file exists.

## 4. How the renderer handles production needs, and the gaps

| Need | Current behavior (from render.mjs/studio.html) | Gap to close during song production |
|---|---|---|
| **Audio excerpt** | `spec.audio` path relative to the spec. FFmpeg maps it from **source 0:00**, encodes AAC 192k and trims to `duration` with `-t` | **G1** No source offset. Either (a) make a documented excerpt WAV with ffmpeg `-ss/-t` (master untouched, sha256 recorded), or (b) add `audioStart` → `-ss` before `-i` audio. Plan: (a) for audibility checks plus (b) for traceability. No fades exist; add optional `afade` only if the brief needs it |
| **Precise scene timing** | `renderAt(t)` is a pure function of video time `index/fps`. Scenes must tile 0→duration exactly; scene types are limited to `title/dots/orbit` | **G2** Allowlist hard-codes three types: replace it with a check against functions registered in studio.html. **G3** No cue layer: add `cues` (lyric lines, hits, section marks in video-local seconds, derived from measured source times minus excerpt start) passed to scene functions. Use duration = frames/fps with an integer frame count (e.g. 38.0 s × 24 = 912 frames) |
| **Still/keyframe review** | Nothing dedicated. Frames are only written by a full job | **G4** Add `--stills=t1,t2,…` (or `--range a:b`) that writes PNGs to a separate `stills/` dir and skips encoding. Opening `studio.html` and calling `renderAt` in a browser also works for ad-hoc checks |
| **Saved frames** | Atomic PNG per frame (`.tmp.png` → rename) in `out/<slug>-<12-char hash>/frames/`. The hash covers spec + studio + renderer + audio size/mtime, so every revision gets a fresh job dir | Fine. Note that 912–1080 PNGs at 1080×1920 ≈ 40–60 MB per job; prune old jobs manually |
| **Resume** | Re-running the same command skips frames >1000 B. A lock file with stale-PID detection prevents double writers; `status.json` updates every 12 frames | Resume only works if nothing in the hash changed. **G5** Validity is size-only (a truncated-but-large PNG would pass, which is unlikely given the atomic rename). Acceptable as is. Fonts/assets loaded by studio.html are **not** in the hash: if assets are added, hash them too (part of G3/G4 work) |
| **Fonts/assets** | Uses system Georgia only | **G6** Add local font files plus an `assets/` folder with a manifest, and `document.fonts.ready` before first frame. Pending style choice |
| **Duration guard** | No cap | **G7** Add a validator rule: `duration ≤ 45` and warn outside 35–40. After encode, `ffprobe` the MP4 and write actual duration/frames into status.json |
| **Audio timing analysis** | None in kit | Measure the user's recording (onset/beat hypothesis per R02 `beat_grid.py` / R04 `analyze-beatgrid.py`, both reference). Lyric times are confirmed by listening/visual waveform; whisper.cpp also exists in your home folder for word-time hypotheses |

Approved roles still apply: R01/R02/R03/R06/R07 adaptable (copy into `source-library/adaptations/` with notice); R08–R10 study-only; R04/R05 reference; R11–R13 catalogs; Remotion not adopted.

## 5. Next production action
1. Send the Grok brief + Suno recording (as you planned).
2. I will:
   - record the brief/audio pairing and measure the recording;
   - propose excerpt boundaries (target 38.0 s = 912 frames at 24 fps);
   - implement G1–G4 + G7 in a new renderer revision;
   - render key stills, then the complete candidate.
3. Local commands once the song spec exists (run in Terminal from `renderer/`):
   ```sh
   export PATH="~/.local/bin:$PATH"
   node -v && ffmpeg -version | head -1 && ls "/Applications/Google Chrome.app"
   node render.mjs --spec=specs/<song>.json --preflight
   node render.mjs --spec=specs/<song>.json --detach
   ```

## 6. Remaining blocker
**Mac-side execution is unavailable to Claude.** The device shell environment failed to start, so Claude cannot run preflight, renders or ffprobe on the Mac, and none of the Mac runtime is verified today. Resolve it by either:
- restarting the Claude desktop app, and the Mac itself if needed, so the shell starts; or
- running the three verification commands above in Terminal and pasting the output.

Until then, Claude can render candidates in the cloud workspace only if puppeteer-core can be installed there. It is currently blocked by the npm 403 on zod; the fallback is the preinstalled Playwright Chromium driving the same studio.html. All files would be committed back to the kit.
