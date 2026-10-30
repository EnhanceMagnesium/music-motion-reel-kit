# Storyboard coverage guidance detail — 2026-10-29

## Purpose

Expanded the active kit's two-layer pre-code storyboard into a repeatable procedure. Layer one is a second-by-second map across the full measured audio stream. Layer two is a set of drawn SVG panels at distinct visual setups and meaningful action-state changes. The map records continuous time coverage; the boards show designed visual states. Several rows may reuse one panel, and a row may cite more than one panel when a scene/action boundary falls inside that second.

The user-supplied 90–301 sample-image counts are only a scale cue for complete temporal coverage. This update does not infer the reference videos' storyboard method or panel counts, and does not require production research into those videos. Risk-based pre-export/post-render QA sampling remains separate under guide 07.

## Expanded operating detail

- Defines exact row cardinality and half-open interval math: for measured audio duration `D`, rows `n = 0…ceil(D)-1` cover `[n, min(n+1, D))`; the last row ends exactly at `D`.
- Specifies how to label timing evidence and confidence, preserve provisional lyric timing, represent quiet/instrumental/ending periods, and record a scene boundary within a one-second interval.
- Explains row-by-row setup, focal composition, visible starting state, code-action phase, change from prior second, footage source/footprint, panel references, continuity rationale and post-code caller trace.
- Gives panel-creation triggers (meaningful change in framing, focal subject, pose/state, interaction, reveal, action phase, footage relationship or consequence) and clarifies that interpolation or elapsed time alone does not require a panel.
- Sets map/board audits and a panel-to-time-to-component trace without imposing a universal number of panels, cuts, footage-area quota or QA stills.

## Changed paths

- `claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt` — expanded canonical method, row definitions, panel triggers, audits and implementation trace.
- `repository-preparation/templates/SONG_SECOND_BY_SECOND_COVERAGE_TEMPLATE.csv` — clarified fields for interval, evidence, setup, state/action progression, boundary, continuity, footage, panel and caller.
- `repository-preparation/templates/SONG_VISUAL_STORYBOARD_TEMPLATE.md` — row completion method, exact count/end checks, panel decision criteria and audit prompts.
- `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt` and `08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt` — require the detailed map/check before panel drawing and code.
- `repository-preparation/README.txt` — indexes this update record.
- This report.

## Verification and scope

- Re-read the active kit's local instructions, guide 19, both templates, canonical launch prompt and one-prompt workflow before editing.
- Checked that the guide and template use the same interval formula, row fields, panel references, subsecond-boundary handling and separation from QA still sampling.
- Confirmed there is no existing song-local `SECOND_BY_SECOND_COVERAGE.csv` to leave out of sync.
- No song production, scene code, renderer, reference media or QA guidance was changed. No test suite, browser, still render, video render or media analysis was run.
- The paste-ready Goal and Project Instructions were not edited; their previously counted lengths remain 7,979 and 15,992 characters respectively.
