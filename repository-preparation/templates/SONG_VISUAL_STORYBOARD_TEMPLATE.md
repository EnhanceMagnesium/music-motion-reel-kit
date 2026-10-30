# [Song title] — visual storyboard

> Copy to `productions/<song>/storyboard/STORYBOARD.md`. Also copy `SONG_SECOND_BY_SECOND_COVERAGE_TEMPLATE.csv` beside this file as `SECOND_BY_SECOND_COVERAGE.csv`, replacing its placeholder row. Draw original low-fidelity SVG panels in `storyboard/boards/` at the selected output ratio. Follow `claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt`. Together these form the two-layer pre-code storyboard: a row for every second of the full song, then panels for distinct setups and meaningful action changes. They are not the post-render QA sample.

## Song and format

- Recording identity / source path:
- Measured audio-stream duration:
- Selected dimensions / fps and reason:
- Visual premise and full-song arc:
- Palette and color roles:
- Timing confidence / listening status:
- Board status / last updated:
- Second-by-second coverage CSV:

## Full-song beat and scene map

Include every lyric phrase and meaningful instrumental event from opening through ending. Label timing evidence; link cue data rather than duplicating it.

| Beat | Phrase / instrumental event | Time range + evidence | Scene ID | What changes visually | Code-built focal action | Archive role / clip link | Board panel |
|---|---|---|---|---|---|---|---|
| B01 | [text/event] | [start–end; supplied/measured/estimated/listened] | [S01] | [specific change] | [initiates → changes → result] | [none or support/focal + manifest] | [boards/S01.svg#S01-P01] |

## Second-by-second coverage map

Let `D` be the measured audio-stream duration. Replace the example row and create exactly `ceil(D)` data rows, indexed consecutively from `0` through `ceil(D)-1`. Row `n` covers `[n, min(n+1, D))`: the first starts at 0, each complete interval is one second, and the final interval ends exactly at `D`. Example: for a 78.4-second stream, the last row is `[78, 78.4)`. Keep the grid in seconds; do not round its endpoint to the video frame grid or to a whole second.

Use every column in the CSV. Each row records: section and lyric/instrumental event; cue IDs and timing evidence/confidence; scene or exact within-second scene boundary; setup/framing/focal composition; visible starting state; code action and progression through the interval; meaningful change from the prior interval; any footage asset/source interval and separately recorded frame footprint/attention role; board panel IDs; continuity/hold rationale; and, after implementation, the corresponding component/cue/frame/helper/footage caller. If a cut occurs inside an interval, list each scene’s exact subrange and reference both panel states in that row. If lyric timing is provisional, say so and preserve its uncertainty; do not imply one-second bins are vocal-timing measurements.

The row describes the visual state/action for that interval, not a single still. State what the viewer sees at the beginning, the action phase or evolution within the second, and the resulting state by the end where relevant. Name the subject and the causal event. An action can progress across many rows, but each row must describe its actual phase/state or meaningful increment. Do not use “continues,” “same scene,” “music continues,” or “caption holds” alone: add what is visible, what advances (if anything), the linked panel, and why that sustained state is intentional. Instrumental, quiet, transitional and ending intervals are required too.

The map is a continuity/coverage index, not a cut schedule. Consecutive rows may reference the same panel when a setup continues. A second can refer to multiple panels when it contains a meaningful change. Do not force a cut or an extra drawing for every row. The user-supplied reference sample counts (90–301 one-second samples per video) motivate whole-song temporal coverage only; they do not describe the references’ original storyboard process or establish a target count of drawn panels. QA still selection stays risk-based under guide 07.

### Row-writing check

- Is every second represented, including the full ending and final partial interval?
- Can a reader picture the focal composition and describe the code-built action at this time without opening the source code?
- Does this row state a real change from the previous one, or give a specific reason and musical/story purpose for continuity?
- Are lyric/cue timing source and confidence honest? Are subsecond scene/cue boundaries recorded when known?
- Does any footage have a separate source interval and screen-space role, with code action described independently?
- Does the panel reference show the relevant state, and does every distinct setup/action change have an appropriate panel?

## Scene board register

| Scene + interval | Purpose | Entry → development → payoff | Code-built focal action | Footage interval, viewport + role | Difference from adjacent/repeated scenes | Board SVG | Component caller after coding |
|---|---|---|---|---|---|---|---|
| S01 [start–end] | [why it exists] | [causal sequence] | [visible action, not decoration] | [none or guide 17 fields] | [staging/action difference] | [boards/S01.svg] | [fill after coding] |

## Panel and state-change register

Add one row for every panel inside every scene SVG. This register makes the link between a distinct visual state, its exact time span and the second rows auditable.

| Panel ID | Scene | Lyric/event + cue evidence | Exact time range | Setup + focal composition | State/action change shown | Coverage row indexes | SVG link |
|---|---|---|---|---|---|---|---|
| S01-P01 | S01 | [event; timing evidence/confidence] | [start–end] | [viewpoint, grouping, depth, focus] | [specific key state/action] | [0–1] | [boards/S01.svg#S01-P01] |

## Per-scene staging notes

Repeat for every scene. Link an SVG with purposeful key poses for entry, development, payoff and each distinct composition/setup or meaningful action change. A new panel is warranted when the viewer's reading materially changes: framing/viewpoint, focal subject or grouping, depth, pose/state, interaction, reveal, action phase, relationship to footage, or consequence. Do not add a panel merely because one second elapsed or a small element interpolated. Continuous motion may use arrows or numbered key poses in one panel when composition and reading remain stable. Add panels for actual setup/action changes rather than a uniform time grid; link each panel to its exact time range and matching CSV rows.

### S01 — [name] ([start–end])

- Purpose / lyric or instrumental beat:
- First visual read:
- Subject and depth-plane placement:
- Entry: starting arrangement and initiating action:
- Development: visible change, path, interaction or camera shift:
- Payoff/resolution: resulting arrangement and transition out:
- Primary code-built action and why it advances the song:
- Secondary motion, only if it reinforces the primary action:
- Lyric/type treatment and timing confidence:
- Archive asset, source interval, on-screen viewport/frame share, attention role and relationship to code action (or “none”):
- Difference from neighbor or previous return of motif:
- After coding: component / helper / cue IDs / footage caller:
- Staging or readability risk:
- Board SVG: `boards/S01.svg`

## Code-action and coverage audit

- [ ] Opening, every section, lyric phrase, instrumental passage and ending have beat/scene coverage.
- [ ] `SECOND_BY_SECOND_COVERAGE.csv` has continuous coverage from 0 to measured song duration, one row per second (with a clipped final interval if needed), and no unexplained gaps.
- [ ] Its data-row count is `ceil(measured_audio_duration_seconds)`; indexes, start/end bounds and final endpoint have been checked, including any cut inside a second.
- [ ] Every row says what is visible, what the focal code action does during the interval, how it differs from the prior interval or why it intentionally holds, and which board panel(s) apply.
- [ ] Every distinct visual setup/action change has a linked panel; stable seconds can reference that panel without forcing cuts.
- [ ] Every scene has an entry/development/payoff sequence or a justified intentional hold.
- [ ] Code-created story action is named in every scene; captions, frames, tints, texture and particles do not stand in for it.
- [ ] Each major section has a code-led focal moment.
- [ ] Footage time and on-frame footprint are separate; successful choices/durations are preserved unless a song-specific reason requires a change.
- [ ] Repeated phrases/formations have an intentional framing, scale, action, perspective or escalation change.
- [ ] Scene openings, transitions and ending form one visual arc.
- [ ] Boards use this song's selected dimensions and show safe areas/type placement.
- [ ] Source mechanisms and footage have planned scene callers and separate provenance.
- [ ] Remaining gaps are resolved or recorded with a reason before coding.

## Board-to-code review

| Scene/beat | Planned state | Rendered still frame/time | Match or divergence | Evidence-based change or accepted difference |
|---|---|---|---|---|
| [S01/B01] | [board panel] | [review path] | [observed fact] | [action] |

Use the smallest risk-based still sample needed to compare implementation with intent. Motion, pacing, sync, rights and creative acceptance require their own evidence under guide 07.
