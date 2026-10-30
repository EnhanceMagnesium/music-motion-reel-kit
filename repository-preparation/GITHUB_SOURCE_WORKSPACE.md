# GitHub source workspace

This portable workspace contains the reusable kit and 16 exact-commit Git submodules. The submodules are full source checkouts after initialization; they are not catalog-only links.

## Clone all source trees

Use a recursive clone so each repository is present as files in the local workspace:

```sh
git clone --recurse-submodules https://github.com/EnhanceMagnesium/music-motion-reel-kit.git
cd music-motion-reel-kit
git submodule status
```

Do not use GitHub’s “Download ZIP” for this workspace; ZIP exports do not materialize the source submodules. R04 contains Git LFS assets. To retrieve them when needed, install Git LFS and run `git -C repository-downloads/heygen-com/hyperframes lfs pull`.

## Repository map

| ID | Repository | Pinned commit | Local checkout | License/provenance note |
|---|---|---|---|---|
| R01 | [https://github.com/JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | `0ac8bf2b31942376cb6b8c4074715595d512acd2` | `repository-downloads/JohnHeibel/ClaudeAnimationBase` | MIT |
| R02 | [https://github.com/tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) | `59744a69c7b916cfbe4c4ec84006b0c2f5e2fde1` | `repository-downloads/tuzhechen2005/opus-video-skills` | MIT |
| R03 | [https://github.com/lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | `b65efe6ea393fdc71212898ea4c57c754cfefa46` | `repository-downloads/lemomo-ai/lemo-opuscar` | MIT |
| R04 | [https://github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | `6791ea580c811fe3f1a532a2ced4bbed29008ee7` | `repository-downloads/heygen-com/hyperframes` | Apache-2.0 |
| R05 | [https://github.com/makevoid/motion-graphics-music-video-skill](https://github.com/makevoid/motion-graphics-music-video-skill) | `1a06e673e3266f8ba94f9aad55669b00fd3a9fca` | `repository-downloads/makevoid/motion-graphics-music-video-skill` | MIT |
| R06 | [https://github.com/buildwithhanif/claude-animation-skill](https://github.com/buildwithhanif/claude-animation-skill) | `4ddb8c80fdec96dc9f55d4b9bdee60bde6f0134b` | `repository-downloads/buildwithhanif/claude-animation-skill` | MIT |
| R07 | [https://github.com/bizarro/evangelion](https://github.com/bizarro/evangelion) | `8f670f3262c75a454d26e01e062da96db7eefb05` | `repository-downloads/bizarro/evangelion` | MIT for code; media/font terms are separate. |
| R08 | [https://github.com/JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) | `fa546a38092e75f2b079e6a86d6abc54dd525d17` | `repository-downloads/JohnHeibel/PDoomVideo` | No reuse grant established in the active catalog; retained as upstream-pinned submodule. |
| R09 | [https://github.com/domenic/domenic.me](https://github.com/domenic/domenic.me) | `db374f65ec29834c5f5120b93c696843cdaa85ae` | `repository-downloads/domenic/domenic.me` | No reuse grant established in the active catalog; retained as upstream-pinned submodule. |
| R10 | [https://github.com/WinterArc21/Battle-of-Austerlitz-Film](https://github.com/WinterArc21/Battle-of-Austerlitz-Film) | `86dae32d20f0a0f2395e7dc8938846fd51e355a6` | `repository-downloads/WinterArc21/Battle-of-Austerlitz-Film` | No reuse grant established in the active catalog; retained as upstream-pinned submodule. |
| R11 | [https://github.com/guanmo-ai/awesome-ai-motion](https://github.com/guanmo-ai/awesome-ai-motion) | `203472a514a4d41c12b1cee8e82423b5ca311186` | `repository-downloads/guanmo-ai/awesome-ai-motion` | MIT for authored catalog; third-party materials remain separately governed. |
| R12 | [https://github.com/yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | `92aee2f586ac0715cb3cbcb6384834f98a33383d` | `repository-downloads/yihui-dev/awesome-opus5-5-videos-20261026` | MIT for authored catalog/prompt index; creator works remain separately governed. |
| R13 | [https://github.com/athemeroy/awesome-claude-5-5-videos](https://github.com/athemeroy/awesome-claude-5-5-videos) | `0b96ca1ec8e03fe72a1c349370ab5dad043c5a1b` | `repository-downloads/athemeroy/awesome-claude-5-5-videos` | CC BY 4.0 annotations with THIRD_PARTY exclusions; review individual linked works separately. |
| R14 | [https://github.com/whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) | `e627941543d9988b155dc610bb9cc0115a5e365e` | `repository-downloads/whaleyxbt/claude-motion` | MIT LICENSE; SHA-256 ca02fba63bfcc89f475a8672dd852a220005a17325fc05d7f2299f5adf7f10a4 |
| R15 | [https://github.com/LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | `f9a8a041b85185ee4881b3471d3415e939aac772` | `repository-downloads/LottieFiles/motion-design-skill` | MIT LICENSE; SHA-256 9fc2e8685daa09e28d54b6afa8a38f168417c5735a3cd676c80c159785e93a80 |
| R16 | [https://github.com/greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `aed9cfd3277740755f6bfc1155c7aa645403b760` | `repository-downloads/greensock/gsap-skills` | MIT LICENSE; SHA-256 51b04b06556662dd817e8f4aa6d06bc7139dc73739e1319a7233cfde3e147b90 |

## Provenance and use

- `repository-preparation/REPOSITORY_LIBRARY_CATALOG.csv` records each ID, origin, exact commit, local checkout path, tracked-file/LFS checks, role and preparation status. Paths are normalized relative to this clone.
- `repository-preparation/LICENSE_AND_ASSET_REFERENCES.csv`, `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md`, the source-specific `LICENSE`/`NOTICE`/`THIRD_PARTY` files, and the R14–R16 skill provenance records retain applicable source and license evidence.
- Submodules preserve upstream ownership and terms. A source being accessible or cloned does not grant permission to copy its code, media, prompts, or assets into a production. R08–R10 remain read-only research references unless a reuse grant is established.
- The root kit intentionally has no blanket license because it contains first-party material and references to sources governed by distinct terms.

## Current guidance versus historical records

Some dated migration reports, prior review notes, and legacy renderer documents preserve earlier choices such as short-reel duration limits or an R01–R13 catalog. Treat them as historical evidence only. Current operating authority is `PROJECT_INSTRUCTIONS.md`, `claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`, the canonical new-song prompt, and the shared renderer README. The root `renderer/` folder is retained for historical/legacy context; new songs use the shared Remotion route. Historical `source-library/raw/github/` snapshot copies are intentionally omitted; current full pinned source trees are the R01–R16 submodules below.

## What is included

- Current reusable project guidance, Claude/Codex/Cursor launch instructions, shared Remotion and legacy renderer source, repository catalog/navigation/provenance records, installed project-local skills, compatibility notes.
- R01–R16, pinned to the catalog commits and materialized under `repository-downloads/` on recursive clone.

## What is kept out

- Per-song `productions/` folders, masters/lyrics/briefs, downloaded archive clips and rendered videos/stills. Each song remains private and isolated in the owner’s active kit.
- `node_modules`, Python virtual environments, build/cache folders, generated contact sheets, per-song material, legacy partial source-library snapshots and machine-audit records. The current source repositories are fetched at their pinned commits from the submodules. Install dependencies from included manifests only when a task requires them.

## Friend access

This GitHub repository is private. The owner must add the friend’s GitHub account as a collaborator before they can clone the workspace. The upstream R01–R16 repositories are fetched from their original remotes at the pinned commits.
