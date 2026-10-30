# Visual storyboard resource update — 2026-10-28

## Purpose

This project-guidance pass makes pre-code visual storyboarding a required production artifact. It responds to the concern that a scene schedule and footage plan can still leave the song's visual action incompletely staged. The change is for the reusable kit; it does not revise any song's art or renderer.

## Evidence reviewed

- `productions/the-series-dplus/research/PLAN.md` and `CHECKPOINT.md`: a 78.4-second song mapped to 12 named scenes and recorded with scene-specific intended actions.
- `productions/the-series-dplus/out/stills_r1/`: 26 PNGs.
- `productions/the-series-dplus/out/stills_r2/`: 7 PNGs.
- `productions/the-series-dplus/out/stills_r3/`: 4 PNGs.
- `productions/the-series-dplus/out/stills_r4/`: 4 PNGs.
- The four rounds contain 41 rendered still instances at 28 unique timestamps. Rounds 3 and 4 both revisit 67.20, 68.00, 70.50 and 73.00 seconds.
- Visually inspected `review/sheet_r1_small.jpg`, `sheet_r2.jpg`, `sheet_r3.jpg` and `sheet_r4.jpg`. The initial sheet samples many scene moments; later sheets concentrate on the ending and a focused recheck. There is no `productions/the-series-dplus/storyboard/` directory.
- A production-wide filename search found only `productions/i-am-promethean/research/STORYBOARD.md`; it is a written seven-interval narrative/shot outline for a 171.7335-second track, not a set of visual storyboard panels. No `*.svg` scene boards were found under `productions/`.

The Dplus files are post-code still-review evidence. They support which sampled frames were inspected and which timestamps were revisited. They do not establish motion between samples or substitute for a pre-code storyboard. The Promethean text plan records narrative beats, but without drawn scene panels it does not provide a visual composition/action board. The Dplus plan describes action and its source contains 12 named scene components; this report does not conclude that the Dplus video lacks animation or judge its visual quality.

## Reusable resource added

- Canonical workflow: `claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt`.
- Per-song copy template: `repository-preparation/templates/SONG_VISUAL_STORYBOARD_TEMPLATE.md`.
- Each production now maps the entire duration, lyric phrases and instrumental events to scene beats, then creates an original low-fidelity SVG board per scene with purposeful entry, development and payoff states. The board names the code-built focal action, repeat variation, footage relationship and future component caller.
- Footage screen-time and on-frame footprint remain separate, preserving successful footage use while code action takes more of the visual storytelling where the song needs it. There is no universal area or duration quota.
- The pre-code board, risk-based rendered stills, temporal checks and full-candidate playback have distinct roles. The still review uses the board as a coverage map but does not render every board panel automatically.

## Exact changed paths

- `claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt` — new canonical guide.
- `repository-preparation/templates/SONG_VISUAL_STORYBOARD_TEMPLATE.md` — new per-song template.
- `claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt` — routes scene planning through the new board.
- `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt` — requires full visual boards before song-scene coding.
- `claude-finished-song-animation-project/04_REUSABLE_PRODUCTION_STANDARD.txt` — makes scene boards part of standing shot design.
- `claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt` — ties risk-based sample choice to storyboard intent while keeping QA separate.
- `claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt` — adds the visual storyboard to the canonical end-to-end sequence.
- `claude-finished-song-animation-project/00_SETUP_README.txt` — indexes the guide and template.
- `claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt` — adds the board requirement to the reusable Project Instructions template.
- `PROJECT_INSTRUCTIONS.md` — adds the standing requirement for local Claude/Codex work.
- `CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt` — requires the same pre-code board in Codex production tasks.
- `README.md` — links the canonical guide and template.
- `repository-preparation/README.txt` — indexes the visual-storyboard resource.
- `reusable-animation-context/VERIFIED_PRODUCTION_LESSONS.md` — adds evidence-based Lesson L25.
- `repository-preparation/VISUAL_STORYBOARD_RESOURCE_UPDATE_2026-10-28.md` — this report.

## Checks and limits

- No song scenes, config, assets, audio, clips or outputs were edited.
- No tests, renderer, browser, still generation, media processing or video export were run.
- The paste-ready Goal remains 7,979 characters. The paste-ready Project Instructions are 15,992 characters, including spaces and line breaks, below the 16,000-character limit.
- Static path validation found all 15 changed/new report and guide paths present; the Goal and Instructions templates remain below their limits. No code/media tests were run or needed for these guidance-only changes.
