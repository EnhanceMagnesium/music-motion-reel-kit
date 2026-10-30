# Project guidance update — 2026-10-26

This is a first-party guidance reconciliation in the original active `music-motion-reel-kit`. It updates the operating model after the isolated Remotion + HyperFrames comparison. It does not change Will Not Fade's artwork, configs, scenes, media or prior outputs.

## Current operating model

- Remotion remains the song's master clock and final composition/encoder. It owns full measured duration, frame dimensions, scene schedule, lyrics/cues, the supplied master audio, the shared export plan and final output.
- Claude decides per scene whether to implement directly in Remotion or host a HyperFrames Player HTML/GSAP child composition. This is normal implementation discretion; the user does not have to choose a route, request a comparison, or approve each use.
- HyperFrames may contribute when an inspected HTML/GSAP, nested-composition or footage-layering mechanism fits a real scene need. It is not a competing full-song renderer, independent audio clock, or new `render.mjs` engine route.
- If Claude chooses the child-composition model, it must map Remotion frame/time to a paused deterministic child timeline, support out-of-order/repeated frames, await player/assets with reliable readiness, clean up resources, preserve license provenance, use the song's explicit frame size, and keep the supplied master as the soundtrack by default.
- The synthetic comparison supports only one small synchronous DOM/GSAP fixture. It showed near-matching sampled images and a materially larger integration surface; it does not establish footage, async Canvas/WebGL, full-song performance, encoding or sync.
- Song isolation, full measured recording, per-song 4:5/9:16 selection, song-specific palette, the required scan/rank of R01–R13 and R12/Skillry discovery, the required Moving Image Archive clip, Playwright/FFmpeg post-render review, bounded corrections, local evidence and one-prompt authorization remain in force.

## Canonical references

- Scene-routing policy: `claude-finished-song-animation-project/14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt`.
- One-song authorization: `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`.
- Remotion and scene/export contract: `shared-animation-library/README.md` and `shared-animation-library/remotion-runtime/README.md`.
- Evidence for the comparison: `shared-animation-library/examples/remotion-hyperframes-hybrid/INTEGRATION_COMPARISON.md`.
- R04 discovery: `claude-finished-song-animation-project/03_REUSABLE_SOURCE_ROUTER.txt`, `claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt`, `reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt`, and `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md`.
- Ongoing evidence-backed learning: `reusable-animation-context/VERIFIED_PRODUCTION_LESSONS.md` (L18).

## Paste-ready field counts

Counts include all characters read from each file, including spaces and line breaks:

- Goal at the original guidance pass: **3,513 / 8,000**. At the user-requested follow-up expansion, the current file is **7,974 / 8,000**.
- Project Instructions at the original guidance pass: **11,891 / 16,000**. At the user-requested follow-up expansion, the current file is **15,945 / 16,000**.

These are local paste-ready templates; Claude's settings and Project Library were not changed.

## Scope and verification

Updated paths:

- `claude-finished-song-animation-project/00_SETUP_README.txt`
- `claude-finished-song-animation-project/01_PROJECT_DESCRIPTION_TO_PASTE.txt`
- `claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`
- `claude-finished-song-animation-project/03_REUSABLE_SOURCE_ROUTER.txt`
- `claude-finished-song-animation-project/04_REUSABLE_PRODUCTION_STANDARD.txt`
- `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`
- `claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt`
- `claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`
- `claude-finished-song-animation-project/12_CODE_ANIMATION_REFERENCE_WORKFLOW.txt`
- `claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt`
- `claude-finished-song-animation-project/14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt` (new)
- Root `README.md`, `CLAUDE.md`, `PROJECT_INSTRUCTIONS.md`, `CLAUDE_ANIMATION_VIDEO_RUNBOOK.txt`, and `GROK_ANIMATION_VIDEO_BRIEF.txt`
- `reusable-animation-context/00_REUSABLE_SOURCE_LIBRARY_GUIDE.txt`
- `reusable-animation-context/01_TECHNIQUE_ROUTER.txt`
- `reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt`
- `reusable-animation-context/VERIFIED_PRODUCTION_LESSONS.md` (L18 wording aligned with Claude's discretion)
- `reusable-animation-context/PROJECT_GUIDANCE_UPDATE_2026-10-26.md` (this report)
- `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md` (R04 role/compatibility)
- `shared-animation-library/README.md`
- `shared-animation-library/remotion-runtime/README.md`
- `shared-animation-library/examples/remotion-hyperframes-hybrid/README.md`
- `shared-animation-library/examples/remotion-hyperframes-hybrid/INTEGRATION_COMPARISON.md`

The connected kit is the source of truth; the Downloads migration copy was not edited. Already-consistent archive, Playwright, reference-craft and repository-license details were left unchanged. Legacy context bundles and historical song-specific records were also left unchanged.

No packages, settings or repository source were changed. No tests, `--plan`, browser run, new still render, audio/video processing, or video render were run in this documentation pass. The earlier comparison evidence remains in the isolated example and must not be generalized beyond its tested fixture.

The one-prompt workflow still depends on Claude's actual session having local access to the kit and compatible native tools. Guidance cannot convert a Linux/cloud session to the Mac environment or grant missing filesystem, browser, network or media access.

## Paste-ready settings expansion follow-up — 2026-10-26

At the user’s request, expanded both paste-ready settings templates to use their field space for substantive guidance. The Goal now covers the studio mission, song isolation, full-recording creative model, native composition, source roles, discretionary scene implementation, one-prompt workflow, evidence-based review and durable handoffs. Project Instructions add operational intake/evidence recording, source and rights records, scene contract, native execution, plan/render evidence and recovery guidance. Current exact counts, including spaces and line breaks: Goal **7,974 / 8,000**; Project Instructions **15,945 / 16,000**. The Goal is unchanged in this follow-up. No renderer, production or media files changed.
