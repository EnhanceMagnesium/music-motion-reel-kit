# Reusable animation kit edit checkpoint

## Living checkpoint policy

Use this as the running change log for the reusable animation kit itself. Whenever Codex or Claude changes the kit's instructions, shared tools, templates, source maps or reusable workflow, add a short dated entry saying what changed, why, which files, what was checked, what remains and the next kit edit. Do not add an entry when a task only uses the kit to make or review a song; record that work in the song's `productions/<song>/CHECKPOINT.md`. Preserve older entries as history. Link a detailed report when useful.

## 2026-10-30 — Windows long paths and installer alerts

Added a per-user Git `core.longpaths` option, its scope and Windows/tool limitations, plus a procedure for recording and evaluating Norton installer alerts in `WINDOWS_SETUP_AND_COMPATIBILITY.md`. Microsoft documentation was checked; no Windows configuration, antivirus setting or installer was changed. Windows behavior remains unverified on a recipient machine.

## 2026-10-30 — Windows sharing audit

Reviewed the current GitHub source workspace, Cursor/Grok guidance, repository atlas, shared entry and Remotion/Playwright browser discovery for OS-specific assumptions. Clarified that preparation receipts are historical and do not install dependencies in a clone, distinguished the GitHub submodule workspace from the older starter package, made the Claude launch guidance environment-neutral, and identified that the GitHub clone must create its own song input folder. Updated the Windows guide, Cursor launch prompt, Claude templates, atlas and this log; see `WINDOWS_CURSOR_SOURCE_WORKSPACE_AUDIT_2026-10-30.md`. Verified 51 links, 16 gitlinks and the no-media help command. Paste-ready Goal/Instructions: 7,985/15,977 characters. Browser overrides, platform-specific dependencies, missing song inputs and a real Windows plan/render/review remain to be validated on Windows; no Windows compatibility is claimed from Mac source inspection. Next: run the guide on the recipient's Windows machine and repair observed defects.

## 2026-10-30 — Windows terminal profile recommendation

Recommended PowerShell as the starting Cursor profile for native Windows, with documented selection steps and separate checks for the agent and Grok Bot execution environments. Updated `WINDOWS_SETUP_AND_COMPATIBILITY.md`; checked Cursor documentation and the wording locally. A Windows setup and render remain unverified. Next: collect actual Windows readiness findings.

## 2026-10-30 — Windows setup and compatibility guide

Added `WINDOWS_SETUP_AND_COMPATIBILITY.md` and links from the README, Cursor prompt and shared renderer README. The guide covers native Windows versus WSL or remote shells, recursive source checkout, isolated Node dependencies, explicit Chrome selection, FFmpeg, and staged evidence. Source inspection identified Mac/Linux browser defaults with explicit overrides. Checked the new links and source claims on the Mac; Windows installation, browser execution and rendering remain unverified. Next: use findings from an actual Windows setup to address concrete compatibility defects.

## 2026-10-30 — Cursor/Grok Bot share starter completed

Added the Cursor project rule and completed the curated starter folder and dated zip promised by the active README. This makes the local-first workflow portable for a collaborator while excluding the owner's song materials, reference folders, full upstream checkouts, installed dependencies, credentials and generated media. Updated the compatibility guide and repository-preparation index to describe the current files and handoff. The archive passed `unzip -t`; 84 relative Markdown links resolved with no missing targets; scans found no owner home path, contact email, or song media. No render, media search, audio analysis or dependency installation occurred. Detailed scope and SHA-256 are in `CURSOR_GROKBOT_SHARE_PACKAGE_REPORT_2026-10-30.md`.

Remaining: the package has not been installed or run on the recipient's computer. The Prelinger route-availability policy and Internet Archive helper allowlist remain inconsistent; the package records that open item and does not claim it resolved. Recommended next kit edit: reconcile the user-directed Prelinger availability basis with download eligibility and provenance, then refresh the packaged copies and zip.

## Current reusable production workflow — 2026-10-29

The original active kit at `` is authoritative. The Downloads migration copy is historical. Keep each song's inputs, measured facts, creative decisions, research, code, footage, review, candidate and song checkpoint inside its own `productions/<song>/` folder. Start a separate song conversation; do not carry another song's palette, narrative, timing or artwork forward. `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt` is the canonical Claude start; `CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt` is the Codex Local counterpart. GPT review is optional, not a required future-production gate.

### Creative and code-animation direction

- Use the entire supplied master at its measured audio-stream duration by default. Choose 4:5 or 9:16 and a song-specific palette from that song's evidence; record the reasons and compose natively. Do not use a fixed reel-length ceiling, house palette or prior song's design.
- Treat archival footage duration and its visible frame footprint/attention as separate decisions. Preserve useful selected clips and source intervals when composition is the issue. Each footage-bearing scene still needs a concrete code-authored action; code-led focal moments should carry the larger arc where the song calls for them. There is no universal footage-area quota. This positive craft direction is canonical in `../claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt`.
- For every song, scan/rank all catalogued R01–R16 against actual scene needs and record exact paths read and scene/helper call sites. Assess R14–R16 skills before storyboard lock; use is selective. Keep R12/Skillry code-animation discovery, code-source study, and footage search as separate evidence tracks. Do not force repository use or copy demos/media.

### Two-layer pre-code storyboard

Every song now has two linked planning layers before scene-art code:

1. `storyboard/SECOND_BY_SECOND_COVERAGE.csv`: for measured audio duration `D`, exactly `ceil(D)` consecutive rows `n=0…ceil(D)-1`, each covering `[n, min(n+1, D))`. Record every lyric, instrumental, quiet, transition and ending interval; use the measured endpoint, preserve timing uncertainty, describe the visual setup/state and code-action progression, mark meaningful change or reasoned continuity, and link panel IDs. Record exact scene boundaries that fall inside a second.
2. `storyboard/STORYBOARD.md` plus original SVG boards: draw panels for every distinct setup and meaningful action-state change. Normally show each scene's entry, development and payoff; link each panel to its time range and coverage rows. Seconds may share a panel and a row may link to multiple panels. Do not force a cut or drawing every second.

The supplied reference set's 90–301 one-second image counts motivate whole-song coverage only. They do not reveal those videos' storyboard methods or panel counts, and are not a cue to study or imitate their production details. QA still selection stays risk-based under guide 07, separate from both planning layers. Canonical method and templates: `../claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt`, `templates/SONG_SECOND_BY_SECOND_COVERAGE_TEMPLATE.csv`, `templates/SONG_VISUAL_STORYBOARD_TEMPLATE.md`.

### Shared renderer and motion tools

- `shared-animation-library/render.mjs` is the single production entry. New songs use the installed Remotion route; existing p5 songs remain on the supported legacy route. Remotion owns the full-song frame clock, dimensions, master audio, final composition and encoding.
- GSAP is installed in the shared Remotion runtime (`gsap` 3.15.0, `@remotion/gsap` 4.0.538). `useGsapTimeline` supports paused, Remotion-frame-driven DOM/SVG choreography; the song remains on the shared entry. The limited reusable fixture and evidence are in `shared-animation-library/examples/remotion-gsap-choreography/` and `GSAP_CHOREOGRAPHY_FIXTURE_REPORT_2026-10-28.md`. The older `FOOTAGE_COMPOSITION_AND_MOTION_GUIDANCE_UPDATE_2026-10-28.md` predates that verification where it says GSAP was unavailable; use current runtime docs/package manifest and the later fixture report.
- HyperFrames is available at Claude's discretion as a scene-level HTML/GSAP child when it materially helps. Remotion still renders the song and owns its clock/audio/export. The hybrid proof is limited; it does not establish general compatibility for all HyperFrames scenes, video, Canvas or WebGL. See `../claude-finished-song-animation-project/14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt`.
- Do not install another renderer or per-song runtime for these routes. Keep frame/time evaluation deterministic, use explicit seeds, wait for asynchronous scene readiness and clean up graphics resources.

### Footage discovery, rights and provenance

The active policy requires a suitable reviewed clip from the Moving Image Archive, Wikimedia Commons and Internet Archive for each finished song; Prelinger is an Internet Archive collection/discovery route, not a fourth provider. Search the MIA page at `https://www.movingimagearchive.com/#search`, using song-specific natural-language shot needs, actual previews and a saved query log. Search Commons and Internet Archive separately through `shared-animation-library/media-discovery/`; public reads do not need OAuth, while Commons requires the user's truthful contact in the request User-Agent. Preserve distinct item provenance, file hashes, source intervals, scene callers and mute source audio by default.

Prelinger-specific user direction: material found through the Prelinger archive route is available as archive footage for this workflow; record that archive authorization basis and never relabel it “public domain” unless item evidence actually says so. **Implementation reconciliation remains open:** the current media-discovery CLI/README and guide 15 still apply a narrower item-level Public Domain/CC0/CC BY allowlist to Internet Archive downloads, while this user direction treats Prelinger archive authorization as a usable basis. Before relying on the helper for a Prelinger item, reconcile its rights handling and documentation with this direction without erasing item-specific restrictions or making an unsupported public-domain claim. See `PRELINGER_DISCOVERY_ROUTE_UPDATE_2026-10-27.md`, `MEDIA_API_IMPLEMENTATION_REPORT_2026-10-27.md` and `../shared-animation-library/media-discovery/README.md`.

### Review and evidence boundaries

Use the no-media shared plan first. Remotion `--stills` is pre-export scene still output. After a complete candidate is authorized, the installed headless Playwright helper decodes/captures risk-selected frames and FFmpeg creates a contact sheet; in Claude Desktop the Browser pane is an additional preview, not a replacement. Then inspect original captures and review the entire candidate at normal speed with sound; keep technical output, visual review, temporal stability, actual sync/listening and the user's creative acceptance distinct. Limit corrections to the bounded rounds in guide 07; do not blanket-sample each half-second or render endless rounds.

When a candidate shows flicker/dropout risk, use the shared encoded-frame stability scan, inspect contiguous frames and compare render-worker behavior only with controlled evidence. Stabilize temporal defects before optional word-level lyric timing refinement. A one-song `--workers=1` result is not a shared default. Guide 18 and `TEMPORAL_STABILITY_AND_WORD_TIMING_KIT_UPDATE_2026-10-28.md` hold the reusable procedure and its limits.

### Local execution and comparison continuity

An initiating prompt can authorize named local production stages but cannot grant an execution environment. For rendering, verify the current Claude/Codex task is Local on the Mac and can access the active kit, Node/Remotion, Chrome, Playwright and FFmpeg; a new task must verify its own environment. Do not repeat manual Terminal handoffs when the selected native Code task can run the command. A Claude/Codex comparison uses identical recording, lyrics, brief, guidance and references but separate production roots and output files, never two writers in one song folder.

Environment note from this conversation (not a Remotion blocker): the user reported installing Homebrew `python@3.15` version 3.15.2. The most recent shown shell configuration still placed the Python 3.14 alias directory ahead of Homebrew's general `python3`; automatic default selection after the 3.15 install was not verified. Re-check before relying on Python scripts. The shared Remotion production path itself is Node-based.

## Kit-level update — 2026-10-29

Expanded the two-layer storyboard from a concise rule into field-by-field coverage, exact interval arithmetic, timing-evidence handling, within-second boundary representation, panel triggers, board-to-row links, coverage gates and post-code caller trace. Updated both templates, the Claude launch prompt, the one-prompt workflow and this index. The saved detail record is `STORYBOARD_COVERAGE_GUIDANCE_DETAIL_2026-10-29.md`; the earlier initial update is `SECOND_BY_SECOND_STORYBOARD_COVERAGE_UPDATE_2026-10-28.md`. No song production, renderer or media was changed in this pass; no media analysis, browser, render or test suite was run. Paste-ready Goal/Instructions remain 7,979/15,992 characters.

## Kit-wide report index for this conversation

- `../claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt` and root `../CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt` — complete authorized per-song workflows.
- `../claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt`, `11_HEADLESS_BROWSER_FRAME_REVIEW.txt` and `18_TEMPORAL_STABILITY_AND_WORD_TIMING.txt` — bounded QA, Playwright/FFmpeg and temporal/lyric evidence.
- `../claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt`, `15_MEDIA_API_DISCOVERY_WORKFLOW.txt`, `12_CODE_ANIMATION_REFERENCE_WORKFLOW.txt` — separate footage and code-reference channels.
- `../claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt`, `16_SOURCE_PROVENANCE_AND_BUILD_TRACE.txt`, `../repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md`, `ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md` — R01–R16 navigation and per-song source tracing.
- `../claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt`, `../claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt` and `STORYBOARD_COVERAGE_GUIDANCE_DETAIL_2026-10-29.md` — code-led composition and full-song storyboard.
- `FOOTAGE_COMPOSITION_AND_MOTION_GUIDANCE_UPDATE_2026-10-28.md`, `GSAP_CHOREOGRAPHY_FIXTURE_REPORT_2026-10-28.md`, `TEMPORAL_STABILITY_AND_WORD_TIMING_KIT_UPDATE_2026-10-28.md`, `MIA_SEARCH_LEARNING_REVIEW_I_AM_PROMETHEAN_2026-10-28.md`, `ANIMATION_AGENT_SKILL_RESOURCES_REPORT_2026-10-27.md`, `MEDIA_API_IMPLEMENTATION_REPORT_2026-10-27.md`, `PRELINGER_DISCOVERY_ROUTE_UPDATE_2026-10-27.md` — dated implementation/evidence details; retain their evidence boundaries and older findings as historical.

## Checkpoint update — 2026-10-29

This entry consolidates the kit-wide decisions and changes from the current conversation into this existing checkpoint so the next kit pass can resume from one durable status. The current operating contract, links to its detailed subject guides/reports, and the open Prelinger rights-policy reconciliation are recorded above. The two-layer storyboard is the latest completed guidance change; its standalone detail record is `STORYBOARD_COVERAGE_GUIDANCE_DETAIL_2026-10-29.md`.

Changed in this checkpointing pass: `repository-preparation/CHECKPOINT.md` (living status and history index), root `AGENTS.md` and `CLAUDE.md` (require future kit-level updates here), `repository-preparation/README.txt` and root `README.md` (checkpoint discovery pointers). Read the existing repository-preparation and shared-library checkpoints plus current active render, source, footage, GSAP, storyboard and quality guidance. No renderer or production code was changed; no song production was changed; no media, browser, tests or renders were run.

Next kit-level item to resolve: reconcile the user-directed Prelinger archive authorization basis with the current media-discovery helper's narrower rights allowlist and its guide wording, without describing the basis as public domain unless that is what the item's evidence states. Re-check the Homebrew Python default only if a future kit script actually requires Python; it does not block the Node-based Remotion route.

### Scope clarification — 2026-10-29

This checkpoint records edits to the reusable kit, not every conversation about it. When Codex or Claude changes the kit itself, add an entry; when a task only uses the kit to make or review a song, use that song's checkpoint instead. This clarification edits the checkpoint policy and its discovery pointers in `AGENTS.md`, `CLAUDE.md`, `README.md` and `repository-preparation/README.txt` so future agents apply that boundary.

### Wording clarification — 2026-10-29

Simplified the rule so the trigger is easy to apply: record changes to the reusable kit; keep work that only uses the kit in the individual song checkpoint. Updated `repository-preparation/CHECKPOINT.md`, `AGENTS.md`, `CLAUDE.md`, `README.md` and `repository-preparation/README.txt`.

---

2026-10-05, America/Chicago.

Completed: 13 pinned full working copies; 13,674 tracked entries independently hash verified; 171 LFS entries retrieved; selected engines and representative examples installed and technically checked; repository/dependency/license/storage catalogs saved; compact source router updated.

Recorded optional scopes: R03 voice/music/dev tiers; Hyperframes cloud/playground; R05 Ruby/ImageMagick/external services; R07 analysis/Demucs and missing soundtrack; Domenic website build; catalog maintenance. These are explicitly deferred rather than claimed installed.

Historical source scopes and current complete clones are distinct. The complete clones live in repository-downloads/. Prepared environments are local to their selected project/workspace.

No production media or renderer changes. Visual review has not occurred. Future task: select a treatment for the supplied song/theme, choose source mechanisms through the router, inspect full relevant functions, then implement and review only the authorized stage.

See README.txt and REPOSITORY_LIBRARY_CATALOG.csv for final results and all detailed receipt paths.

## 2026-10-27 song-build provenance integration

Added the per-song source/skill provenance policy and copy-ready template: `../claude-finished-song-animation-project/16_SOURCE_PROVENANCE_AND_BUILD_TRACE.txt` and `templates/SONG_RESOURCE_PROVENANCE_TEMPLATE.md`. Claude, Codex and comparison launch guidance now records R01–R16 decisions and any R14–R16 skill files actually consulted, then traces selected mechanisms to local scene callers. No renderer, package, song or media was changed. Details: `SONG_BUILD_PROVENANCE_INTEGRATION_2026-10-27.md`.
