# Temporal Stability and Word-Timing Kit Update

Date: 2026-10-28  
Scope: reusable production guidance and shared candidate-review support. This is not a song-scene edit or a new media review.

## Case lesson recorded

The *Chalk it up to White wellbeing, the Spirit of the West* case showed two separate temporal problems and two useful remedies:

- Rapidly reseeded chalk texture and grain created visible frame-to-frame shimmer. The chalk texture and grain are now held still in the corrected scene code. In the saved title-region comparison, mean adjacent-frame luma change declined from 1.205 in candidate 4 to 0.005 in candidate 9. The value is specific to that measured region and setup, not a general pass threshold.
- Some SVG-filtered strokes disappeared for single frames in the two-worker export, although corresponding still renders looked correct. The same scene/configuration rendered with `--workers=1` had zero flagged dropout frames across 4,273 frames. This supports a one-worker workaround for this production and a controlled diagnostic for future cases. It does not establish a general Remotion defect or justify changing the shared worker default.

The previous word-timing pass also showed why cue precision needs evidence. Heuristic word times drifted roughly four seconds early across a verse. whisper.cpp DTW token starts and a vocal-band mid/side check better supported phrase starts in this mix, but word-level times remained estimates without listening confirmation. Preserve the approved lyrics and distinguish measured, estimated, interpolated and listened-confirmed timing.

Evidence inspected: `productions/chalk-it-up-white-wellbeing-the-spirit-of-the-west/technical-review/revision_flash_sync/flicker_comparison.txt`, its `blink_scan_c4.json` and `blink_scan_c5.json`, saved render evidence for candidates 4–9, and `analysis/WORD_TIMING_NOTES.md`. The source production and its records were left unchanged; the report records provenance for general lessons without carrying its creative choices into the reusable kit.

## Reusable workflow change

The active kit now has a dependency-free helper at `shared-animation-library/quality-review/temporal-stability-scan.mjs`. On an already-rendered candidate, it uses the existing `ffprobe` and `ffmpeg` to decode low-resolution grayscale frames and writes a JSON report containing suspected isolated-frame anomalies and coarse per-second adjacent-frame luma changes. It does not render a video, save stills or create a contact sheet. Its output is a locator for human review, not a visual-quality score. Inspect flagged frames with immediate neighbors and use playback to assess motion. A zero count does not prove the absence of every kind of flicker or dropout.

When temporal artifacts are visible or plausible, the production sequence is now explicit: stabilize texture and check encoded-frame behavior first; then refine word-level lyric entrances/highlights when the song’s chosen treatment or the user’s request calls for word-level display. Word timestamps do not automatically set scene cuts. If a multi-worker-only defect is suspected, compare one-worker and existing-worker renders with scene inputs fixed, save distinct candidates, and change no shared default based on one song.

## Files changed in the active kit

- `shared-animation-library/quality-review/temporal-stability-scan.mjs` — new streaming, JSON-only candidate scan.
- `shared-animation-library/quality-review/README.md` and `shared-animation-library/README.md` — document scan invocation, boundaries and one-worker diagnostic.
- `claude-finished-song-animation-project/18_TEMPORAL_STABILITY_AND_WORD_TIMING.txt` — new canonical procedure and evidence limits.
- `repository-preparation/templates/WORD_TIMING_REPORT_TEMPLATE.md` — new reusable record for cue method, exceptions, validation and listening status.
- `claude-finished-song-animation-project/00_SETUP_README.txt`, `03_REUSABLE_SOURCE_ROUTER.txt`, `04_REUSABLE_PRODUCTION_STANDARD.txt`, `05_NEW_SONG_CONVERSATION_PROMPT.txt`, `07_QUALITY_REVIEW_AND_ACCEPTANCE.txt`, `08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`, and `11_HEADLESS_BROWSER_FRAME_REVIEW.txt` — concise pointers and review-sequence updates.
- `CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt`, `PROJECT_INSTRUCTIONS.md`, `README.md`, and `CLAUDE.md` — route future Codex/Claude runs through the same temporal checks.
- `reusable-animation-context/VERIFIED_PRODUCTION_LESSONS.md` — clarified L24 with the evidence-backed scanner promotion and conditional word-level timing practice.

No song-specific scenes, configs, cues, audio, rendered candidates, stills or checkpoint were changed. Goal and Project Instructions paste-ready field files were not edited.

## Checks and boundaries

- `node --check shared-animation-library/quality-review/temporal-stability-scan.mjs` — exit 0.
- `node shared-animation-library/quality-review/temporal-stability-scan.mjs --help` — exit 0; usage and no-render behavior printed.
- `rg` cross-reference search over the active guides and roots — exit 0; new guide/helper references resolve in the inspected files.
- The helper was not run on any media in this pass. No song was rendered, decoded, played, listened to, or visually reviewed. Its behavior on other songs and codecs remains to be established when used on an authorized candidate.

The scanner reports nominal-fps frame times and downscaled grayscale differences. It can flag intentional flashes/cuts, miss periodic or multi-frame shimmer, and cannot explain a cause. Use it alongside adjacent-frame inspection and normal-speed playback. The Chalk case’s worker finding remains production-specific until another controlled comparison demonstrates the same behavior elsewhere.
