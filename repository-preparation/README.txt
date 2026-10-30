REUSABLE ANIMATION LIBRARY — LOCAL PREPARATION RESULTS
Prepared 2026-10-05, America/Chicago.

KIT EDIT LOG: `CHECKPOINT.md` records changes to the reusable kit. Song work that only uses the kit belongs in that song's checkpoint.

CURRENT INDEX NOTE (2026-10-27)
The original acquisition and integrity figures below describe the R01–R13 source set as prepared in October. R14–R16 were added later as full pinned checkouts plus project-local Claude/Codex skills; their current commits, skill copies, hashes and limits are in ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md and ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json. The current per-song atlas is R01–R16. Use the per-song source/provenance template at templates/SONG_RESOURCE_PROVENANCE_TEMPLATE.md and the operating guide at ../claude-finished-song-animation-project/16_SOURCE_PROVENANCE_AND_BUILD_TRACE.txt.

CURRENT COMPOSITION GUIDANCE (2026-10-28)
For new songs, keep selected archive clip timing/use count separate from visible frame footprint and attention. Preserve successful clips and durations when code action and staging can carry more of the visual storytelling. Assess initialized R14–R16 before storyboard lock, with selective technique adoption. Canonical guide: ../claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt. Evidence and changes: FOOTAGE_COMPOSITION_AND_MOTION_GUIDANCE_UPDATE_2026-10-28.md.
Before implementation, complete the one-row-per-second full-song coverage CSV and the visual storyboard with SVG action panels for each scene. Canonical guide: ../claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt. Copy `templates/SONG_SECOND_BY_SECOND_COVERAGE_TEMPLATE.csv` and `templates/SONG_VISUAL_STORYBOARD_TEMPLATE.md`. The CSV indexes every second; SVG panels show distinct setups and meaningful action changes without forcing a cut per second. A post-code still/contact sheet is QA evidence, not a substitute for these design artifacts.
Guidance update record: `SECOND_BY_SECOND_STORYBOARD_COVERAGE_UPDATE_2026-10-28.md`.
Expanded row semantics, boundary handling, panel triggers and coverage audit: `STORYBOARD_COVERAGE_GUIDANCE_DETAIL_2026-10-29.md`.

PRELINGER DISCOVERY (2026-10-27)
Use https://prelingerarchives.online/ for Prelinger-specific collection search and preview. Follow selected films to their Internet Archive item records for item-level rights, file inspection and download through the shared media-discovery helper; Prelinger is an IA collection, not a separate provider or API. Operational details: ../claude-finished-song-animation-project/15_MEDIA_API_DISCOVERY_WORKFLOW.txt and ../shared-animation-library/media-discovery/README.md. Evidence-based update: PRELINGER_DISCOVERY_ROUTE_UPDATE_2026-10-27.md.

DOWNLOADS
Original R01–R13 acquisition: thirteen repositories are checked out under repository-downloads/<owner>/<repository>/ at the exact commits recorded in the original import ledger. These are complete tracked working copies for those commits, with shallow Git history. Independently verified all 13,674 tracked entries against Git blob hashes, symlink contents or LFS SHA-256 object hashes: zero missing entries and zero content mismatches. HyperFrames contains 171 LFS entries; every object was retrieved and verified.

Hyperframes upstream attributes mark some already-committed ordinary HTML as LFS content. Strict pointer fsck warns about those historical files. Object fsck passes, and the working copies match the pinned Git blobs. This is an upstream pointer-attribute inconsistency, not missing downloaded media. Download/parser recovery and installation/build failures are retained in logs; final statuses describe successful recovery separately.

PREPARED CAPABILITIES
R01 ClaudeAnimationBase: p5/p5.brush/Puppeteer dependencies installed; resolution and existing Chrome launcher checked.
R02 opus-video-skills: both painted and kinetic template dependencies installed; package resolution and browser launcher checked.
R03 lemo-opuscar: shared Node/browser/Three core and Python NumPy/SciPy/SoundFile/soxr/Pillow environment installed. Paper-popup has its own local demo dependencies because its HTML imports local node_modules. Halftone-dossier and game-show browser packages resolve through the root. The complete 43-style source catalog remains available.
R04 hyperframes: filtered local Bun workspace installed; parsers, lint, studio-server, core, engine, producer, player, Studio and CLI final builds passed; core/engine/producer imports and CLI help passed. Cloud deployment and playground scopes remain optional.
R05 motion-graphics-music-video-skill: local Node/p5, isolated Python tools and compiled Swift VFX prepared. Optional Ruby orchestration, ImageMagick and external service branches remain deferred.
R06 claude-animation-skill: native Canvas dependencies installed; shared module imports checked.
R07 evangelion: app dependencies installed; Three/OpenType imports checked. Code compilation passed using a separate preparation config that skips its absent separately licensed soundtrack. This is not a media-complete preview. Python analysis/Demucs pipeline remains a separate preparation choice for future audio analysis.
R08 PDoomVideo: p5/p5.brush/Puppeteer packages installed for study; use the renderer's --chrome option on Mac. Existing approved study-only role remains.
R09 domenic.me: complete browser-native worker, page and six genre engine sources downloaded and syntax checked. Website-building dependencies are deferred. Current study preference remains anisong/Eurodance/K-pop.
R10 Battle-of-Austerlitz-Film: Playwright installed; R10_CHROME_PRELOAD.mjs patches its default launch to installed Mac Chrome. Launcher check passed. Film source retains study-only role.
R11 awesome-ai-motion: catalog check passed for 464 cases; local Node maintenance needs no installation.
R12 awesome-opus5-5-videos: refreshed local snapshot at commit 92aee2f586ac0715cb3cbcb6384834f98a33383d (703 prompt records, including all 418 Skillry-linked entries counted on 2026-10-26); zero-dependency search helper added; no animation runtime installation required. Full detail: R12_SKILLRY_LOCAL_REFERENCE_REFRESH_2026-10-26.md.
R13 awesome-claude-5-5-videos: catalog/docs downloaded; optional collection/thumbnail/chart maintenance dependencies inventoried and deferred.

ENVIRONMENT
The Mac's default runtime was preserved. Node 26.7.0/npm 11.19.0 are the existing runtime. Git LFS 3.8.0 and Bun 1.4.2 were installed into repository-preparation/bin/. Project-specific Python environments use their recorded interpreters. Source activate.sh in a terminal session to add this project's tools and Chrome variables without editing the shell profile.

CURRENT LOCAL PYTHON ADDENDUM — 2026-10-28
In the user's verified macOS zsh session, `python3` now resolves to Homebrew Python 3.14.10 through `/opt/homebrew/opt/python@3.14/libexec/bin/python3`; its executable is `/opt/homebrew/opt/python@3.14/bin/python3.14`. This is a PATH selection and leaves Apple's Command Line Tools Python installed. It does not change the kit's pinned or isolated Python environments: use each environment's recorded `.venv/bin/python` and lockfile. The shared animation renderer remains Node/Remotion; this system Python is available for Python-based preparation and analysis tools where their declared environment supports it. Other shells may have a different PATH and should verify `command -v python3` and `python3 --version` before using the system default.

R01/R02: CHROME_PATH points to installed Google Chrome.
R03: PLAYWRIGHT_CHROME points to installed Google Chrome.
R08: pass the existing --chrome option as documented by its renderer.
R10: use Node --import <absolute path to repository-preparation/R10_CHROME_PRELOAD.mjs> before the selected upstream entry. Its preparation log records the successful default-launch check. This adapter does not authorize running a render.

DEPENDENCY RECORDS
REPOSITORY_LIBRARY_CATALOG.csv: commits, paths, integrity/LFS, source/Git/dependency sizes, status, roles and entry points.
DEPENDENCY_MATRIX.csv: 46 project/manifest inventory rows, prepared or deferred status, command, runtime and checks.
DEPENDENCY_PROJECT_INVENTORY.csv: original declarations and scripts for those scopes.
LICENSE_AND_ASSET_REFERENCES.csv: 75 retained license/credit documents; specific asset terms remain subject to the selected use.
CHECKOUT_INTEGRITY.json: independently verified tracked content.
DOWNLOAD_RESULTS.json: checkout/LFS command results.
STORAGE_BREAKDOWN.json: source/media, Git metadata and installed dependency sizes by repository.
R01_R03_DEPENDENCIES.json, R04_R07_DEPENDENCIES.json and R05_R13_DEPENDENCIES.json: detailed commands, versions, checks, exceptions and deferred scopes.

STORAGE
Tracked source and media: 1,269,119,183 bytes (1.27 GB).
Git metadata and LFS object store: approximately 1.02 GB of logical file content.
Installed node_modules and Python environments: approximately 2.00 GB of logical file content.
Tool binaries, build outputs and retained preparation caches are additional. APFS shared/cloned blocks and allocation overhead mean logical totals and du totals differ from physically reclaimable storage. Disposable Bun cache was removed after verifying installed packages did not depend on it. Existing user caches were preserved.

VERIFICATION LIMITS
Downloaded, dependencies installed, module/launcher checked, build checked and visually reviewed are separate states. No scene screenshots, generated images, frames or video were produced. Installed browser launchers do not establish every demo's visual correctness or render performance. Optional runtimes and external media remain explicit requirements.

CLAUDE ACCESS
Local Claude Code with music-motion-reel-kit selected can read complete repositories and prepared dependencies. Use reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt plus the canonical atlas to rank R01–R16 for each song and choose a selective source working set. Read relevant source before adapting it. Project-local R14–R16 skills are guidance references; record exact files opened and any influence in the song's provenance review. Chat Project Knowledge cannot be assumed to index every local file or inherit Code's connector/tools.

No Claude chat context connections were replaced during this task. Existing source-library snapshots, renderer files and productions remain intact.


REPOSITORY NAVIGATION ATLAS
`REPOSITORY_NAVIGATION_AND_USE_GUIDE.md` is the canonical R01–R16 navigation atlas. It records exact start paths, selected APIs, scope, dependency state, compatibility and rights boundaries without claiming every source file was read. Claude’s per-song operating steps are in `../claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt`. Every new song scans/ranks all 16, then deep-reads only relevant sources. The song-local review is initialized from `templates/SONG_RESOURCE_PROVENANCE_TEMPLATE.md`; the Moving Image Archive and R10/R12 roles remain distinct.


MEDIA API DISCOVERY IMPLEMENTATION
The shared dependency-free tool is at `../shared-animation-library/media-discovery/`; its provider commands, no-OAuth public-read behavior, Commons contact requirement, rights screen, safe explicit download and limits are described in its README. Claude's operating guide is `../claude-finished-song-animation-project/15_MEDIA_API_DISCOVERY_WORKFLOW.txt`. Every finished song now requires at least one suitable clip from Commons and one from Internet Archive/Prelinger, in addition to the Moving Image Archive clip; keep source manifests separate and do not claim completion if any requirement is unmet. `MEDIA_API_PREIMPLEMENTATION_REVIEW_2026-10-27.md` records the research basis, `CLAUDE_MEDIA_API_INTEGRATION_PROMPT_2026-10-27.txt` authorized the helper implementation, and `MEDIA_API_IMPLEMENTATION_REPORT_2026-10-27.md` records its checks. The policy update is `FOOTAGE_SOURCE_REQUIREMENT_UPDATE_2026-10-27.md`.

R14–R16 resource guide: ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md. Install manifest/hashes: ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json. Execution report: ANIMATION_AGENT_SKILL_RESOURCES_REPORT_2026-10-27.md.

CURSOR + GROK BOT HANDOFF (2026-10-30)
Use CURSOR_GROKBOT_COMPATIBILITY_GUIDE_2026-10-30.md for the local/cloud product boundary and current evidence. The kit now includes root .cursor/rules/music-motion-reel-kit.mdc and CURSOR_LOCAL_FULL_SONG_PRODUCTION_PROMPT.md. The curated share package is share-packages/music-motion-animation-starter/ with archive share-packages/music-motion-animation-starter-2026-10-30.zip. It excludes song materials, rendered media, installed dependencies and full upstream checkouts; see its PACKAGE_SCOPE_AND_OMISSIONS.md. The package is a starter handoff, not a recipient-machine validation. The open Prelinger route-authorization versus IA rights-allowlist issue remains listed in CHECKPOINT.md and package scope; do not call it resolved until the helper and workflow policy agree.
