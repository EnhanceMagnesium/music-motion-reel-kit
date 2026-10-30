# Footage Composition and Motion Guidance Update — 2026-10-28

## Scope

This is a reusable project-kit guidance update. It responds to the comparison of *I Am Promethean* and *The Series Dplus*: retain successful footage choices and their useful duration, while planning code animation to carry more of the composition's storytelling and visual attention. It also routes the initialized R14–R16 resources into the future-song planning workflow. It does not revise either song, change the shared renderer, or establish visual acceptance.

## Evidence and interpretation

Source inspection of the two scene implementations found:

- In `productions/i-am-promethean-comparison/claude/remotion/scenes.jsx`, `PLATE` is `{ x: 54, y: 150, w: 972, h: 729 }` within a 1080×1350 frame: 48.6% of frame area.
- In `productions/the-series-dplus/remotion/scenes.jsx`, archive windows vary by scene and camera in a 1080×1920 frame, approximately 31–52% of frame area for inspected examples. The production also builds arena lighting, crowd, keycaps, fans, pick/ban panels, minimap, stage controls and effects in code, with code-only scenes.

These ranges overlap. Area share is a useful layout measurement, but it does not establish perceived prominence, animation quality, or visual success. The reusable distinction is between (a) where, how often, and how long selected footage plays, and (b) how much of the frame it occupies and how strongly it draws attention. A composition can preserve a clip and its timeline interval while original code-built action takes more of the visual story.

This finding is based on source and planned geometry. No candidate was rendered or visually reviewed for this guidance update; the report makes no claims about how either design reads in motion.

## Current operating rule

The canonical policy is `../claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt`. Each song plan records clip source intervals, production intervals/use count, visible viewport or mask/frame-area share, attention role, and a concrete code-authored action with setup, development and resolution. Successful clip selection and duration stay stable when layout or animation can address the issue. There is no universal maximum footage-area percentage.

Footage-bearing scenes plan an original action that advances the song. Borders, tint, labels, captions, grain, static interfaces and generic particles may support the scene but do not by themselves supply its story action. The review guide checks the combined composition and asks whether code-built action has meaningful focal moments across major sections. Appearance claims still require reviewed stills or candidate playback.

## R14–R16 in the per-song build

The already initialized R14–R16 resources are now a required planning assessment before storyboard lock. The production record must state which project-local skill/source files were actually opened, what decision each informed, and why any resource was not used. Exact inspection remains selective; direct code adaptation is not required.

- **R14 — `whaleyxbt/claude-motion`:** motion craft and selected Remotion examples may inform frame-driven easing, masks and animated primitives. Its independent capture/audio pipeline does not replace the shared Remotion route.
- **R15 — `LottieFiles/motion-design-skill`:** motion-design guidance may inform intent, micro-narrative, hero/support/ambient hierarchy and choreography. It is guidance, not a runtime.
- **R16 — `greensock/gsap-skills`:** GSAP skill instructions may inform timeline and lifecycle design. The skill checkout does not install GSAP in shared Remotion, so the future song remains on the existing frame/time-driven contract unless a separate concrete dependency decision is made.

Use `repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md` and `repository-preparation/ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json` for exact commits, installed skill paths, hashes, and boundaries. Availability, consultation, influence, adaptation, integration, browser checks and visual review remain separate evidence states.

## Changed paths

The canonical guide and operating pointers were updated in:

- `claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt` (new canonical guide)
- `claude-finished-song-animation-project/00_SETUP_README.txt`
- `claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`
- `claude-finished-song-animation-project/03_REUSABLE_SOURCE_ROUTER.txt`
- `claude-finished-song-animation-project/04_REUSABLE_PRODUCTION_STANDARD.txt`
- `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`
- `claude-finished-song-animation-project/06_ANIMATION_REFERENCE_CRAFT_GUIDE.txt`
- `claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt`
- `claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`
- `claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt`
- `AGENTS.md`, `CLAUDE.md`, `PROJECT_INSTRUCTIONS.md`, `README.md`
- `CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt`
- `reusable-animation-context/01_TECHNIQUE_ROUTER.txt`
- `reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt`
- `reusable-animation-context/VERIFIED_PRODUCTION_LESSONS.md` (L20 added with evidence limits)
- `repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md`
- `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md`
- `repository-preparation/README.txt`
- `repository-preparation/templates/SONG_RESOURCE_PROVENANCE_TEMPLATE.md`

The paste-ready Goal remains unchanged. No Project Library, Claude UI setting, skill installation, package, repository checkout, renderer source, song production, media asset, scene code, output, or song checkpoint was changed.

## Validation and limits

Static guidance review only. Active router and template wording was searched for contradictory optional-assessment language; the guide links and repository/source examples were checked to exist. The paste-ready Goal is 7,922 characters and Project Instructions are 15,888 characters (including spaces and line breaks), both below their limits. No tests, browser, plan, still, contact sheet, audio analysis or render were run.

Older dated reports retain their original “optional” wording as historical evidence about the previous workflow. The active guidance dated 2026-10-28 supersedes that wording: assess R14–R16 every song; technique adoption remains selective.
