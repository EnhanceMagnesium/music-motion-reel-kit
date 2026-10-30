# Second-by-second storyboard coverage update — 2026-10-28

## Purpose

The active kit now requires two linked pre-code planning layers for every song:

1. A compact CSV row for every one-second interval of the measured full recording, from time zero through the final partial interval.
2. Low-fidelity scene SVG boards with entry, development and payoff panels, plus additional panels for each distinct composition/setup or meaningful action change.

The CSV ensures no part of a long song disappears from planning. It is a time coverage index, not a cut schedule: a continuous action or intentional hold can point to the same board panel across multiple seconds with its visual reason stated. Drawn panels capture meaningful scene/action states, not every second.

## Basis and boundaries

The six supplied reference sample counts ranged from 90 to 301 images because the set samples approximately once per second. The kit uses that range only as a reminder to cover the whole runtime at one-second resolution. It does not claim those were original storyboard counts, infer the references' production process, or carry their artwork into song planning.

The visual storyboard remains a pre-code design artifact. Pre-export and post-render review follow the separate risk-based quality guide; this update does not require a still for every second, replace full-candidate playback, or establish motion or sync.

## Changed paths

- `claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt` — canonical two-layer coverage rule, interval definition, panel semantics and coverage gate.
- `repository-preparation/templates/SONG_SECOND_BY_SECOND_COVERAGE_TEMPLATE.csv` — companion row schema and example.
- `repository-preparation/templates/SONG_VISUAL_STORYBOARD_TEMPLATE.md` — links both deliverables, panel/time mapping and audit checks.
- `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt` and `CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt` — require both planning layers before code.
- `claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`, `02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`, root `PROJECT_INSTRUCTIONS.md`, and `CLAUDE.md` — workflow and operating-instruction alignment.
- `claude-finished-song-animation-project/00_SETUP_README.txt`, root `README.md` and `repository-preparation/README.txt` — template navigation.
- This report — durable scope and rationale.

## Verification

- Read the active kit's `AGENTS.md`, current storyboard guide/template, one-song prompt, one-prompt workflow, setup index, repository preparation index, root Claude instructions, root project instructions, paste-ready Project Instructions, and Codex Local full-song prompt before editing.
- Confirmed the CSV template fields cover timestamp interval, scene, lyric/instrumental event, timing evidence, visible state, code-built action, footage source interval/footprint, board panel and change/hold reason.
- Confirmed the guide defines intervals as `[n, min(n+1, measured_duration))`, preserving the full-song endpoint without forcing cuts each second.
- Checked the template files and all updated workflow pointers by direct reread. No media, production scene, renderer, or song checkpoint was changed. No render or test was run.
- Paste-ready Goal remains 7,979 characters. Paste-ready Project Instructions contain 15,992 characters, including spaces and line breaks (8 characters below the 16,000-character field limit).
