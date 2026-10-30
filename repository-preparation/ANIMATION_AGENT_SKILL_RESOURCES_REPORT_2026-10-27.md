# Animation Resource Acquisition and Project-Local Skill Integration

Date: 2026-10-27  
Workspace: ``  
This is a repository-resource and project-guidance pass. No song was produced, edited, rendered, or visually reviewed.

## Before-change inventory and inspected scope

The active kit path was confirmed directly; the shell's starting directory was the Downloads migration copy, which was not edited. Before integration, the repository catalog contained R01–R13, the two new resource-checkout targets were absent, and no kit-root `.claude/skills/` or `.agents/skills/` directories existed. The three repositories and local skills had no prior copies in the active kit.

Read and reconciled the active `AGENTS.md`, root `PROJECT_INSTRUCTIONS.md`, `CLAUDE.md`, README, repository catalog, dependency matrix, source router, reusable router and locator, atlas, canonical Claude and Codex song prompts, Claude setup/navigation/production/quality/Skillry/HyperFrames/footage guidance, shared library README, and Remotion runtime README. Inspected R04 HyperFrames' player manifest to distinguish its GSAP dependency scope from the shared Remotion runtime. Read the acquired repositories' orientation files, package/skill entry points and specific source bodies listed in `ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md`; this was selective inspection, not a full read of every repository or every upstream file.

## Acquisition record

Each GitHub `HEAD` was resolved during this pass using `git ls-remote <URL>.git HEAD`, then matched to the local non-shallow checkout at `git rev-parse HEAD`. The checkouts are clean, with full tracked source, no submodule gitlinks, no `.gitmodules` or `.gitattributes`, and no tracked Git LFS pointer files.

| New ID | Repository / URL | Commit | Checkout | Tracked files / bytes | License evidence |
|---|---|---|---|---:|---|
| R14 | [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) | `e627941543d9988b155dc610bb9cc0115a5e365e` | `repository-downloads/whaleyxbt/claude-motion/` | 66 / 15,708,150 | MIT `LICENSE`, SHA-256 `ca02fba63bfcc89f475a8672dd852a220005a17325fc05d7f2299f5adf7f10a4` |
| R15 | [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | `f9a8a041b85185ee4881b3471d3415e939aac772` | `repository-downloads/LottieFiles/motion-design-skill/` | 20 / 61,257 | MIT `LICENSE`, SHA-256 `9fc2e8685daa09e28d54b6afa8a38f168417c5735a3cd676c80c159785e93a80` |
| R16 | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `aed9cfd3277740755f6bfc1155c7aa645403b760` | `repository-downloads/greensock/gsap-skills/` | 44 / 148,588 | MIT `LICENSE`, SHA-256 `51b04b06556662dd817e8f4aa6d06bc7139dc73739e1319a7233cfde3e147b90` |

`source_media_bytes` in the catalog follows its builder's `working_content_bytes` meaning: total tracked working-content bytes, even for code/documentation checkouts. No dependency directories were installed. R14's own package and lockfile remain source-only; R16's example dependency manifest remains source-only.

## Installed agent skill references

Installed as copies under both project-local agent roots:

- `.claude/skills/` for Claude Code project skills.
- `.agents/skills/` for Codex repository skills.

Each root contains `motion-craft`, `lottiefiles-motion-principles`, `gsap-core`, `gsap-timeline`, `gsap-react`, `gsap-performance`, `gsap-plugins`, and `gsap-utils`. This makes 8 local skills per agent, 16 skill copies total. Each has a kit-specific applicability/precedence note, `KIT_INTEGRATION.md`, `PROVENANCE.md`, and its MIT `LICENSE`; the LottieFiles folder also contains its full 16-file supporting reference tree. `SKILL.md` frontmatter names and descriptions are adapted to avoid duplicate names and to gate GSAP usage. Upstream checkouts remain clean and unchanged. Exact per-file source and installed hashes are in `ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json`.

Current official guidance was checked: [Claude Code project skills](https://code.claude.com/docs/en/skills) uses `.claude/skills/<skill-name>/SKILL.md` for local project sessions; [Codex local skills](https://developers.openai.com/codex/skills) scans `.agents/skills` from its working directory. No Claude, Codex or user-global settings were changed, and no plugin/marketplace was registered. The active kit is not a Git repository; start each app/task in the active kit folder. The filesystem copies are in place, but live in-app skill discovery was not exercised.

## Integration decisions

- **R14 / `claude-motion`:** its source offers frame-oriented math and Remotion/React examples such as `clamp01`, `lerp`, `smooth`, `band`, `prog`, `sp`, `effortAt`, `rand`, `Mask`, `Roll`, `Spark`, `Grain`, and `WobbleFilter`. These can be selectively studied for a song-local scene/helper when a concrete need exists. Its `C`, `W`, `H`, `FPS`, and `timeline.json` assumptions belong to its own sample. Its package scripts include a distinct render/capture/simulation, SFX/mux, sheet and GIF pipeline. Those commands were inspected but not run. Its review-loop, sound-design and web-sims skills were declined because they overlap or conflict with the kit's bounded review, supplied-master audio, or Remotion renderer.
- **R15 / `motion-design-skill`:** the implementation-agnostic skill can prompt emotional intent, narrative/action, staging and choreography before code. UI-specific durations and style archetypes are not song defaults. It adds guidance only; no runtime or scene code.
- **R16 / `gsap-skills`:** the six installed skills explain GSAP APIs such as timelines, React scoping/cleanup, utility methods and performance. They are conditional reference only. `gsap-scrolltrigger` and `gsap-frameworks` were declined for the present React/Remotion song route. The repo itself has no root GSAP runtime; its React example has its own dependencies. The repository MIT license covers the skill guidance, not the GSAP runtime or third-party plugins; those terms would need separate verification.
- **Shared-runtime dependency check:** `shared-animation-library/remotion-runtime/package.json` does not declare GSAP. `node --input-type=module -e "import.meta.resolve('gsap')"` from that runtime returned `ERR_MODULE_NOT_FOUND`. R04 HyperFrames' `packages/player` dependency does not flow into shared song scenes. No GSAP dependency, adapter, or lockfile change was made.
- **Renderer and QA boundaries:** Remotion remains the kit's shared production renderer and encoder. R14's capture tool is not an alternate export route. Existing shared Playwright/FFmpeg QA remains unchanged. The supplied master remains the soundtrack; R14's generated sound path is not used. R12/Skillry discovery and the three required footage-source workflows remain distinct from these code/design repositories.

## Guidance and indexes updated

Current per-song guidance now ranks all catalogued R01–R16, with distinct relevance ranks, exact-read evidence and concrete caller tracing for any adapted mechanism. R14–R16 are optional: consult only when a scene need fits; do not force source use. The R01–R13 IDs and historical source/checkpoint records were not renumbered or rewritten. The historical 13-checkout statements in dated records remain historical.

The repository atlas has detailed R14–R16 entries and adds them to the scene-need index. The Claude and Codex song launch prompts mention optional local skills, refer to the canonical resource guide, and keep GSAP conditional. The Goal and Project Instructions fields remain paste-ready and under their limits; exact counts are in the final response.

## Changed-path inventory

The exact first-party paths added or edited in this pass are:

- Acquired full-source checkouts: `repository-downloads/whaleyxbt/claude-motion/`, `repository-downloads/LottieFiles/motion-design-skill/`, and `repository-downloads/greensock/gsap-skills/`.
- Project-local skills, each with `SKILL.md`, `KIT_INTEGRATION.md`, `PROVENANCE.md`, and `LICENSE`: `.claude/skills/{motion-craft,lottiefiles-motion-principles,gsap-core,gsap-timeline,gsap-react,gsap-performance,gsap-plugins,gsap-utils}/` and `.agents/skills/{motion-craft,lottiefiles-motion-principles,gsap-core,gsap-timeline,gsap-react,gsap-performance,gsap-plugins,gsap-utils}/`. The LottieFiles skill directories also contain their copied `director/`, `patterns/`, and `reference/` support files.
- Catalog/navigation/reporting: `repository-preparation/REPOSITORY_LIBRARY_CATALOG.csv`, `repository-preparation/DEPENDENCY_MATRIX.csv`, `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md`, `repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md`, `repository-preparation/ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json`, `repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_REPORT_2026-10-27.md`, `repository-preparation/animation_agent_resource_static_check_2026-10-27.json`, `repository-preparation/tools/verify-animation-agent-resources.py`, and `repository-preparation/README.txt`.
- Root routing: `README.md`, `AGENTS.md`, `CLAUDE.md`, `PROJECT_INSTRUCTIONS.md`, and `CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt`.
- Claude project guidance: `claude-finished-song-animation-project/00_SETUP_README.txt`, `01_PROJECT_DESCRIPTION_TO_PASTE.txt`, `02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`, `03_REUSABLE_SOURCE_ROUTER.txt`, `04_REUSABLE_PRODUCTION_STANDARD.txt`, `05_NEW_SONG_CONVERSATION_PROMPT.txt`, `06_ANIMATION_REFERENCE_CRAFT_GUIDE.txt`, `08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`, `10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt`, `12_CODE_ANIMATION_REFERENCE_WORKFLOW.txt`, `13_REPOSITORY_NAVIGATION_AND_USE.txt`, and `15_MEDIA_API_DISCOVERY_WORKFLOW.txt`.
- Reusable context: `reusable-animation-context/00_REUSABLE_SOURCE_LIBRARY_GUIDE.txt`, `01_TECHNIQUE_ROUTER.txt`, `02_REPOSITORY_LOCATOR.txt`, and `REUSABLE_ANIMATION_SOURCE_ROUTER.txt`.

No song folder or shared renderer source/manifests/lockfiles were changed. The active kit has no reliable Git baseline, so this list reflects the explicit acquisition, copy and edit operations and direct inspection, not a Git diff.

## Checks and evidence

- Live GitHub HEAD and local Git HEAD matched for R14–R16; all were non-shallow and clean; tracked counts/bytes matched the catalog; no submodule or LFS pointer content was found.
- `python3 repository-preparation/tools/verify-animation-agent-resources.py` — exit 0; 114 structural/hash/catalog/skills/link/count assertions passed. The JSON evidence is `repository-preparation/animation_agent_resource_static_check_2026-10-27.json`.
- GSAP resolution from the shared Remotion runtime — `ERR_MODULE_NOT_FOUND`, as expected; no package installed.
- One initial validator run exited 1 because its broad “all 13” text scan misread a historical line about 13 reference contact sheets. The scan was narrowed to repository-count wording; the corrected 66-check run passed. The 13-contact-sheet historical evidence was left intact.
- Paste-ready Goal: 7,922 characters. Project Instructions: 15,787 characters. Both counts include spaces and line breaks and remain below the 8,000/16,000 limits.
- No npm install, package update, local browser/UI launch, demo build, song audio operation, song-footage download, still/contact sheet generation or video render was performed. The acquired repositories may include their own tracked sample assets. No production folder, song config, scene, cue, audio or output was edited.

## Boundaries and next use

Static filesystem checks do not prove that Claude Code or Codex displays each skill in its live app, or that any upstream animation example builds or looks good in Remotion. Before a future song adapts code, inspect the exact function and dependency closure, confirm license/asset terms, make it song-local, and verify it through the shared renderer's existing review path. For GSAP, first establish an explicitly authorized shared runtime dependency and test deterministic arbitrary-frame seeking, readiness and cleanup. The next production can consult these skills without changing its renderer or adding any packages.
