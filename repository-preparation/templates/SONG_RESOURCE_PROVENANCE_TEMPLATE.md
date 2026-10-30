# Song Resource and Implementation Provenance — [song]

Status: [working / planning complete / implementation complete / superseded]
Updated: [YYYY-MM-DD]
Production root: `productions/[song-slug]/`
Canonical atlas: `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md`
Skill install record: `repository-preparation/ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json`

## Scene needs used to rank resources

Write the song-specific visual and technical needs before selecting sources. Keep these concise and label inferred or provisional needs.

| Need ID | Scene or craft need | Evidence from this song | Planned scene(s) |
|---|---|---|---|
| N1 | [need] | [recording / lyric / brief / measured evidence] | [scene IDs or TBD] |

## Footage time, frame footprint and code-built action

Before storyboard lock, use `claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt` to record selected clip intervals and screen-time separately from each clip's visible viewport, frame-area share and visual attention. For every footage-bearing scene, name the song-specific code-built action (setup → development → resolution). Preserve successful clip selections and durations when only the composition needs improvement; do not enforce a universal footage-area quota. Put the compact scene table in `research/PLAN.md` and link it here. This is an implementation planning requirement, not visual acceptance evidence.

## Ranked repository review — all R01–R16

Ranks are relevance to this song, not an adoption quota. Record exact paths actually opened; listing a checkout or atlas entry is not a source read. Use a distinct rank for every accessible repository. Mark inaccessible repositories unresolved and unranked. Keep depth and evidence claims literal.

| Rank | ID / repository / pinned commit | Need(s), fit and song-specific reason | Exact local paths opened and scope | License/dependency/reuse boundary | Disposition and reason |
|---:|---|---|---|---|---|
| [1–16] | R01 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R02 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R03 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R04 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R05 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R06 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R07 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R08 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R09 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R10 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R11 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R12 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R13 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R14 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R15 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |
| [1–16] | R16 — [name] @ [commit] | [ ] | [ ] | [ ] | [ ] |

Repository source reading is selective. For each promising candidate, follow the selected function/component's imports and record relevant dependency, asset and license closure. Do not imply a complete repository read. For inaccessible sources, state what was tried and what remains unknown.

## Project-local agent skill consultation — R14–R16

Before storyboard lock, assess all three initialized R14–R16 resources against the song's code-animation needs. Skill installation and availability are not proof that a skill was discovered, opened or used. Record only actual access and reading, the decision each opened skill informed, and why any resource was not used. Use the install manifest to resolve upstream commit, source path and hashes; do not copy its full hash table into this song record.

| Agent/session | Skill name and R ID | Installed `SKILL.md` path | Exact skill/support files opened | Access/read state | Song decision it informed, or reason not used |
|---|---|---|---|---|---|
| [Claude Code / Codex Local] | [name / R14–R16] | [.claude/skills/... or .agents/skills/...] | [ ] | [not available / available not opened / opened / consulted] | [ ] |

If a skill influenced scene code, connect its specific guidance to a mechanism and caller below. Skills provide guidance; they do not establish runtime dependencies. The shared runtime currently includes `@remotion/gsap` and `gsap`; R16 skill presence alone is not proof that a song used them. For Remotion choreography, identify the `useGsapTimeline` scene caller and follow `shared-animation-library/remotion-runtime/README.md`.

## Selected mechanism-to-scene trace

Include every adapted or materially influential code mechanism. If nothing is selected, state that and why. A proposal without a caller is not integrated. Distinguish copied, modified, re-authored from an idea, and guidance-only.

| Scene need | Source identity: R ID / URL / commit / path / symbol (or skill file) | Observed mechanism and complete relevant read scope | License, dependency closure and Remotion compatibility | Classification and changes | Song-local file and concrete caller | Verification and limits |
|---|---|---|---|---|---|---|
| [N#] | [ ] | [ ] | [ ] | [copied / modified / re-authored / guidance-only] | [ ] | [not checked / code check / browser / rendered / visually reviewed] |

## Source notices attached to production code

For every song-local helper that copies or materially adapts code, add a concise source notice in the file or a clearly linked adjacent notice. List it here. Do not add attribution comments to unrelated original code.

| Song-local file | Source repository @ commit and exact path/symbol | License / notice path | Change classification | Call sites |
|---|---|---|---|---|
| [ ] | [ ] | [ ] | [ ] | [ ] |

Original song artwork should remain recognizably original. Do not copy a repository demo, prior song's palette/story/layout, creator media, or prompt-linked assets wholesale. Keep sources and musical/artistic choices separate.

## Separate evidence tracks

Link the records; do not merge distinct media/search provenance into the code-repository review.

- R12/Skillry idea shortlist: `research/[path]` — [status]
- Moving Image Archive item and clip manifest: `archive/[path]` — [status]
- Wikimedia Commons manifest: `archive/[path]` — [status]
- Internet Archive/Prelinger manifest: `archive/[path]` — [status]
- Font and other asset provenance: `[path]` — [status]
- Plan/build report and checkpoint: `[paths]`

## Implementation and evidence boundary

- Source code written/changed: [paths]
- Mechanisms actually called by scenes: [call sites]
- Exact checks and evidence paths: [commands/files]
- Browser/render/visual/playback states: [separately identify each]
- Unresolved access, rights, dependency or verification: [items]

Never infer adaptation from a skill or repository being present, and never infer successful integration from a plan or passing source check. Link this record from the song plan, technical report and `CHECKPOINT.md`.
