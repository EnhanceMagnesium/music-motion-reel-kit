# Animation Agent Skill Resources and Integration Policy

Updated 2026-10-28. Canonical guide for initialized R14–R16 resources and their project-local agent-skill copies. The full R01–R16 scene-need atlas is `REPOSITORY_NAVIGATION_AND_USE_GUIDE.md`. Every song assesses all three resources before storyboard lock and records the exact skill files opened and the decision informed. Consulting them is required; adopting techniques is selective. They are not extra renderers or compulsory code use.

## Operating rule

For each song, derive scene needs from its supplied recording, lyrics and brief first, then rank all catalogued R01–R16. Before storyboard lock, assess the R14–R16 resources against the song’s code-animation needs and record exact skill/source files opened and the decision they informed. Planning consultation is required; deep reading and code adoption are selective, and a reasoned decline is valid. Use `claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt` to apply their craft guidance to the separate questions of footage screen-time and visual footprint, and to plan original code-built action. Identify a concrete song-local helper/scene caller before claiming adaptation or integration. Keep Moving Image Archive footage discovery, Wikimedia Commons/Internet Archive media discovery, R12/Skillry prompt discovery and code repositories as distinct evidence tracks. Never inherit a sample palette, story, characters, soundtrack or layout.

## Acquired repositories

| ID | Repository and pinned source | Full checkout | License evidence | Tracked source | Role and boundary |
|---|---|---|---|---:|---|
| R14 | [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion), `e627941543d9988b155dc610bb9cc0115a5e365e` | `repository-downloads/whaleyxbt/claude-motion/` | MIT `LICENSE`, SHA-256 `ca02fba63bfcc89f475a8672dd852a220005a17325fc05d7f2299f5adf7f10a4` | 66 files; 15,708,150 bytes | Required planning assessment for motion craft and reusable code references; selective deep reading/adaptation. Independent simulation/capture/audio workflow is not this kit’s renderer or review path. Do not import its sound or palette defaults. |
| R15 | [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill), `f9a8a041b85185ee4881b3471d3415e939aac772` | `repository-downloads/LottieFiles/motion-design-skill/` | MIT `LICENSE`, SHA-256 `9fc2e8685daa09e28d54b6afa8a38f168417c5735a3cd676c80c159785e93a80` | 20 files; 61,257 bytes | Required planning assessment for emotional intent, scene hierarchy and choreography. Implementation-agnostic guidance only; UI timings and style examples are not defaults. |
| R16 | [greensock/gsap-skills](https://github.com/greensock/gsap-skills), `aed9cfd3277740755f6bfc1155c7aa645403b760` | `repository-downloads/greensock/gsap-skills/` | MIT `LICENSE`, SHA-256 `51b04b06556662dd817e8f4aa6d06bc7139dc73739e1319a7233cfde3e147b90` | 44 files; 148,588 bytes | Required planning assessment for choreography, timeline, React lifecycle and performance guidance. R16 remains skills-only; the shared Remotion runtime separately includes the official frame-driven adapter and GSAP peer dependency. Use selectively for concrete scene needs. |

For all three, live GitHub HEAD matched the recorded commit on 2026-10-27; each checkout is non-shallow and clean. No gitlinks/submodules, `.gitmodules`, `.gitattributes`, or tracked Git LFS pointer files were found. Source repositories remain unmodified. At acquisition, no dependency install, package update, browser download, demo build or media action was performed; the separate shared-runtime GSAP addition is recorded below and in the current integration status.

Per-song integration: initialize `productions/<song>/research/REPOSITORY_REVIEW.md` from `templates/SONG_RESOURCE_PROVENANCE_TEMPLATE.md`. Follow `../claude-finished-song-animation-project/16_SOURCE_PROVENANCE_AND_BUILD_TRACE.txt` to record whether any installed skill file was actually opened/consulted and connect a selected principle or code mechanism to the song-local decision/helper and scene caller. Skill visibility alone is not evidence of use.

## Source reading and useful mechanisms

### R14 — claude-motion

Files read: `README.md`, `AGENTS.md`, `CLAUDE.md`, `package.json`, `src/lib.ts`, `src/components/primitives.tsx`, `sims/README.md`, `sims/kit/runtime.js`, `sims/capture.mjs`, and `.claude/skills/{motion-design,review-loop,sound-design,web-sims}/SKILL.md`. This is selective source reading, not a full-repository reading.

- `src/lib.ts`: `clamp01`, `lerp`, `smooth`, `band`, `prog`, `sp`, `effortAt`, `rand`. `sp` imports Remotion `spring`/`Easing`; the file also imports its own `timeline.json`. `TL`, `FPS`, `W`, `H`, `C` tie functions to the source project’s timeline, 1080-square format and palette. Adapt only with explicit song timing/dimensions, dependency closure and frame-pure behavior.
- `src/components/primitives.tsx`: React/Remotion components `Mask`, `Roll`, `Spark`, `Grain`, `WobbleFilter` illustrate masked type, value transitions, SVG accents and texture. Review dependencies and visual assumptions before selective adaptation; do not copy the composition wholesale.
- `sims/kit/runtime.js`: `runSim` and `sim.render(t)` show an explicitly time-driven simulation contract, but this is separate from the kit’s shared scene contract.
- `sims/capture.mjs` and package scripts include separate render/still capture, Python SFX/mux, contact-sheet, GIF and simulation build commands. They overlap the kit’s shared Remotion and Playwright/FFmpeg review path, can create media, and were not run/adopted.
- Its motion-design skill prescribes Coral/Inter/Instrument Serif, `timeline.json`, X feed scale and its sound/render route. Installed copy is renamed `motion-craft` and explicitly overrides these as non-default examples. `review-loop` was declined because it duplicates the bounded kit review; `sound-design` because the supplied master is sole audio; `web-sims` because it introduces another capture route.
- No R14 runtime dependency was installed into the shared renderer, and no helper was copied into the shared adapter in this pass.

### R15 — motion-design-skill

Files read: `README.md`, `LICENSE`, full main `skills/motion-design/SKILL.md`; selected supports `director/core-philosophy.md`, `decision-framework.md`, `narrative-structure.md`, `emotion-mapping.md`, `motion-personality.md`, `choreography.md`, `patterns/multi-element.md`, `reference/quality-checklist.md`. Other support files were inventoried and copied, not all individually read.

Its useful contribution is to define emotional intent, micro-narrative (setup/action/resolution), hero/support/ambient relationships and choreography before choosing properties. It is documentation, not executable code, a Remotion component or runtime dependency. UI interaction duration tables and personality/color examples do not set song rules. The full skill tree is installed as `lottiefiles-motion-principles`.

### R16 — gsap-skills

Files read: `README.md`, `AGENTS.md`, `LICENSE`; skills `gsap-core/SKILL.md`, `gsap-timeline/SKILL.md`, `gsap-react/SKILL.md`, `gsap-performance/SKILL.md`, `gsap-plugins/SKILL.md`, `gsap-utils/SKILL.md`; and `examples/react/App.jsx`, `examples/react/package.json`. Other skill folders were inventoried but not individually read.

- Candidate advice: GSAP timelines, React scoping/cleanup, transform/opacity performance and math utilities can support choreography. For Remotion, Remotion's frame must drive the timeline; ordinary wall-clock examples do not transfer directly.
- Historical status on 2026-10-27: the shared runtime lacked GSAP and import resolution failed. Current status: the separate shared runtime declares exact `@remotion/gsap@4.0.538` and `gsap@3.15.0`, aligned with Remotion 4.0.538. The official `useGsapTimeline` adapter supplies paused, scoped, frame-driven timelines for DOM/SVG; it does not make Canvas/WebGL numeric state reactive or enable GSAP plugins. See `../shared-animation-library/remotion-runtime/README.md`.
- Six selected skill folders are gated optional references. `gsap-scrolltrigger` (scroll-driven UI) and `gsap-frameworks` (Vue/Svelte) were declined for current React/Remotion song needs. No global marketplace or plugin setup.

## Project-local agent skills

The same eight optional skill folders are copied under both agent-specific directories:

- Claude Code: `.claude/skills/` (`motion-craft`, `lottiefiles-motion-principles`, six `gsap-*`).
- Codex: `.agents/skills/` (same names).

Official guidance: [Claude Code skills](https://code.claude.com/docs/en/skills) documents `.claude/skills/<name>/SKILL.md`; [Codex skills](https://developers.openai.com/codex/skills) documents `.agents/skills/<name>/SKILL.md`. Use this kit as project/working directory. This does not change global settings, Claude Project Library or plugin marketplaces. Live app discovery was not tested. Every installed folder contains `KIT_INTEGRATION.md`, `PROVENANCE.md` and upstream MIT `LICENSE`; Lottie also includes its complete support tree. The local skill files have renamed frontmatter and precedence notes; original source checkout remains unchanged. `ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json` records per-file source and installed SHA-256 values.

## Integration matrix

| Resource | Type | Concrete scene value | Overlap | Decision for shared Remotion |
|---|---|---|---|---|
| R14 | Remotion sample code, motion craft skill, independent simulation/capture | Eased value mapping; masked type; number rolls; SVG accents; deterministic texture | Remotion and craft; capture, review sheets and sound overlap shared QA/audio rules | Assess for every song; adapt an individual helper only with source/license closure and a song-local caller. Do not run its renderer, SFX, capture or sheet pipeline. |
| R15 | Design guidance | Emotion, story beats, hero/support hierarchy, choreography and secondary motion | Existing craft/reference guides cover some vocabulary | Assess for every song; apply relevant principles to actual scene staging. No runtime integration. |
| R16 | GSAP agent instructions | Scene choreography, timeline sequencing, React lifecycle and performance practices | R16 is guidance only; the shared runtime uses Remotion's frame-driven adapter to prevent a competing GSAP clock | Assess for every song; use `useGsapTimeline` selectively for DOM/SVG choreography and follow the shared runtime guide. Keep Canvas/WebGL values frame-derived. |

## Verification boundary

Verified: full non-shallow source checkouts at current HEADs; clean upstream state; project-local copies and hashes; required catalog/navigation links; shared runtime package tree includes `@remotion/gsap@4.0.538` and `gsap@3.15.0` with Remotion 4.0.538. The song-neutral `examples/remotion-gsap-choreography/` fixture bundled and rendered ten stills through the shared route at 4:5 and 9:16; repeated requests resolving to frame 48 produced identical PNG hashes. Not verified: live app auto-discovery, running any upstream demo, GSAP use in an actual song scene, continuous motion quality, performance or full media export. Skill, package or import presence does not prove song-scene integration or visual acceptance.
