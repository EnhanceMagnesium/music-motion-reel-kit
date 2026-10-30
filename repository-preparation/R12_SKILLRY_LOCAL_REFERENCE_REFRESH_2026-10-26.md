# R12 / Skillry Local Reference Refresh

**Prepared:** 2026-10-26  
**Workspace:** original active `music-motion-reel-kit`  
**Purpose:** make the code-animation examples from the 11-page Skillry gallery locally searchable for Claude song planning, while preserving creator-rights boundaries and the prior pinned snapshot.

## Result

The current upstream catalog was cloned into a new sibling checkout. The older prepared checkout and its historical source pack were preserved.

| Item | Verified result |
|---|---|
| Upstream | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) |
| Current commit | `92aee2f586ac0715cb3cbcb6384834f98a33383d` (2026-10-13) |
| Current checkout | `repository-downloads/yihui-dev/awesome-opus5-5-videos-20261026/` |
| Previous checkout retained | `repository-downloads/yihui-dev/awesome-opus5-5-videos/` at `3d54892e2ae5b0e8d337171e6508bba4cec01ab8` |
| Tracked files | 707 total: 703 prompt Markdown files plus README, LICENSE, `.gitignore`, and `data/videos.json` |
| Catalog | 703 JSON records; 684 distinct prompt strings; 207 marked `prompt_partial`; 418 have a Skillry URL / `has_remake` |
| Skillry gallery | The live gallery reports 418 entries over 11 pages. The local catalog’s 418 Skillry-linked records match that reported count; individual links were not all visited or validated. |
| Repository media | 0 tracked video files; no preview clips, creator source projects, submodules, or LFS objects |
| Runtime / install | Catalog only. No animation runtime, browser, package or project dependency was installed. The search helper uses Node built-ins only. |
| Checkout status | `main` at the recorded commit; clean worktree; one `origin` remote; no submodule entries |

The 703 records are not 703 Skillry gallery videos. They include 418 Skillry-linked entries and additional creator-post/prompt records. Categories: motion 369, 3D 117, explainer 116, interactive 101. Technology-tag counts (multi-label) are Canvas 267, SVG 183, Three.js 131, shader 92, GSAP 86, CSS 57, audio 39, playable 22, particles 17, pixel 15, WebGL 9, physics 9, and AI image 6.

The refreshed checkout contains 1,675,403 tracked source bytes and 967,837 bytes of `.git` metadata. `data/videos.json` is 813,423 bytes. No video media was downloaded. The previous snapshot’s 475-record counts in older reports remain valid descriptions of that earlier snapshot, not the current catalog.

## What was fetched and why

Skillry’s [Opus 5.5 gallery](https://skillry.dev/ai-videos/opus-5-5) links to the GitHub catalog. The repository provides a full local prompt/metadata index for discovering animation approaches and linking back to each creator’s source. It is the reusable local reference needed for Claude to search without loading 11 web pages into each production context. The JSON contains the Skillry page URL, creator post URL, prompt text, category, technology tags, partial-prompt flag, poster URL and remake flag. A Markdown file `prompts/<slug>.md` provides the corresponding record for closer reading.

This is not an offline copy of Skillry’s running remakes or the 418 preview videos. The checked-out repository has zero video media and no runtime. Neither its MIT license nor Skillry’s statement that prompts are free to copy grants rights to creators’ videos, linked implementations, code, music, images or other assets. The MIT license applies to the repository author’s compilation and files covered by it. The local corpus is used to discover and compare techniques; production scenes remain original unless direct reuse has a separate applicable grant and is explicitly documented. Do not use creator preview clips as the required Moving Image Archive footage.

Technology tags may describe the Skillry remake rather than the original creator’s implementation. The prompt Markdown sometimes labels a “Remake built with” stack. Confirm what each tag describes before attributing a method. Treat `prompt_partial: true`, post summaries, and missing prompt text as incomplete leads. Do not assume that the 703 records or linked works were individually inspected.

## Local search helper

Added `repository-preparation/tools/search-r12-skillry.mjs`. It reads the current `data/videos.json` with Node built-ins, ranks each search term by an exact technology-tag hit, category, slug/author, then prompt text, and prints JSON containing score, matched terms, category, tags, partial status, local Markdown path, Skillry URL, creator post URL and a short prompt excerpt. It does not make network requests, execute prompt content, install packages, open a browser, or download media. A returned record is a research lead; read its Markdown and source links before using it.

From the kit root:

```sh
node repository-preparation/tools/search-r12-skillry.mjs --limit=12 "scene need technique terms"
node repository-preparation/tools/search-r12-skillry.mjs --limit=8 "kinetic lyric typography reveal"
```

To search a different snapshot, add `--root=/absolute/path/to/checkout`. `--limit` accepts 1–50 and defaults to 12. Search using song-specific scene needs and implementation mechanisms, such as “lyric type mask reveal,” “formation parallax scale,” “procedural ink hatching,” “camera orbit webgl,” or “canvas particles.” Narrow the search into a shortlist of three to five strong references; do not dump the full catalog into a song folder or copy a finished video wholesale.

## Per-song Claude procedure

The canonical workflow is `claude-finished-song-animation-project/12_CODE_ANIMATION_REFERENCE_WORKFLOW.txt`. It now points to this snapshot and helper. Before storyboarding is finalized, Claude should:

1. Start from this song’s lyrics, supplied recording, brief and scene needs; then run several focused local searches.
2. Open only the strongest local `prompts/<slug>.md` records and inspect their creator/Skillry links when access is available. Record the date and exact URL for live-site viewing.
3. For each shortlisted record, state what the prompt actually says, what its technology tags refer to, and whether its prompt is complete or partial.
4. Identify a transferable mechanism and map it to a concrete proposed song scene/helper. Compare it against the R01–R13 scan and the shared Remotion scene contract.
5. Re-author original song-specific art and timing. Preserve attribution and distinguish inspired, copied, modified and newly written code. Check exact license/asset terms for any direct reuse.
6. Keep the Skillry corpus separate from Moving Image Archive footage and from R10’s cinematic-study role. Remotion remains the renderer; R12 is not a replacement engine.
7. Save the required `productions/<song>/research/CODE_ANIMATION_REFERENCE_SHORTLIST.md`. A no-fit result is acceptable when it states the queries and why the nearest examples do not help.

## Acquisition, integrity and focused checks

The current checkout was acquired without replacing the old copy:

```sh
git clone https://github.com/yihui-dev/awesome-opus5-5-videos.git repository-downloads/yihui-dev/awesome-opus5-5-videos-20261026
```

Verified from local Git and files:

- `git rev-parse HEAD` → `92aee2f586ac0715cb3cbcb6384834f98a33383d`.
- `git status --short --branch` → `## main...origin/main`.
- `git ls-files` → 707 tracked files; 703 `prompts/*.md`; zero `.mp4`, `.webm`, `.mov` or `.m4v` files.
- `git submodule status` → no entries; root has no package manifest or lockfile.
- New checkout `LICENSE` SHA-256 matches the retained older R12 license copy: `0adca04960d4c36b2524d26a400b790c28e583ce019635ab2d3a9ba3dc9dda7f`.
- Local helper smoke checks searched Canvas/kinetic/typography and Three.js/shader/particles. Both returned five local prompt paths from all 703 records; a Node assertion parsed both JSON outputs and verified catalog count, nonempty results and prompt paths.

Exact helper checks (each command exited `0`):

```sh
node repository-preparation/tools/search-r12-skillry.mjs --limit=5 "canvas kinetic typography lyric reveal" > repository-preparation/logs/R12_search_canvas_kinetic_typography_20261026.json
node repository-preparation/tools/search-r12-skillry.mjs --limit=5 "threejs shader particles camera" > repository-preparation/logs/R12_search_threejs_shader_particles_20261026.json
```

The output-validation command also exited `0`: it parsed both saved JSON files, asserted `catalog_records === 703`, required at least one result in each, and required a local prompt path for every returned match. Each query returned five results. The helper was run locally against the checked-out JSON and made no network request.

Search test output files:

- `repository-preparation/logs/R12_search_canvas_kinetic_typography_20261026.json`
- `repository-preparation/logs/R12_search_threejs_shader_particles_20261026.json`

No video rendering, browser execution, image generation, creator-media download, source-code adaptation, or production scene edit was performed in this refresh.

## Changed paths

- `repository-downloads/yihui-dev/awesome-opus5-5-videos-20261026/` — new exact upstream clone; prior sibling unchanged.
- `repository-preparation/tools/search-r12-skillry.mjs` — local zero-dependency search.
- `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md` — current R12 navigation, commit, contents, and boundaries.
- `repository-preparation/REPOSITORY_LIBRARY_CATALOG.csv` — current R12 row points at the refreshed checkout and current counts.
- `repository-preparation/LICENSE_AND_ASSET_REFERENCES.csv` — appended the current commit’s license evidence; old record retained.
- `repository-preparation/README.txt` — current R12 preparation status.
- `repository-preparation/logs/R12_search_canvas_kinetic_typography_20261026.json` and `R12_search_threejs_shader_particles_20261026.json` — helper outputs.
- `claude-finished-song-animation-project/12_CODE_ANIMATION_REFERENCE_WORKFLOW.txt` — canonical search/reuse procedure.
- `claude-finished-song-animation-project/03_REUSABLE_SOURCE_ROUTER.txt`, `reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt`, `reusable-animation-context/02_REPOSITORY_LOCATOR.txt` — current R12 route and pointers.
- `claude-repository-context/R12_REPOSITORY_SOURCE_CONTEXT.txt` — historical-pack banner; embedded prior snapshot left intact.
- `ANIMATION_VIDEO_REPOSITORY_SOURCES.txt` — dated current-status addendum; October 5 inspection findings remain historical.
- `REFERENCE_NOTES.md` — current count added beside the earlier 475-entry study reference.
- This report.

The Downloads migration copy and song productions were not edited. No Claude app setting, Project Library, GitHub state, dependency install, renderer, song code, or generated media was changed.
