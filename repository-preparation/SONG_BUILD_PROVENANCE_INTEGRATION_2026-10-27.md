# Song Build Provenance Integration

Date: 2026-10-27  
Scope: first-party production guidance and per-song evidence scaffolding in the original active kit. This is not a song-production, renderer or media pass.

## Outcome

R14–R16 now enter the actual future-song build record instead of appearing only in the acquisition guide. New Claude and Codex productions are instructed to initialize one variant-local `research/REPOSITORY_REVIEW.md` from `templates/SONG_RESOURCE_PROVENANCE_TEMPLATE.md`, rank all R01–R16, record exact source paths read, and trace selected mechanisms to song-local files and scene callers. The same record contains a separate skills table that distinguishes available, opened and consulted states and captures which decision a skill informed—or why it was not used.

The canonical operating policy is `claude-finished-song-animation-project/16_SOURCE_PROVENANCE_AND_BUILD_TRACE.txt`. It establishes source identity, reading scope, license/dependency closure, copied/modified/re-authored/guidance-only status, direct code notices for adapted code, caller trace, and separate provenance tracks for R12, Moving Image Archive, Commons, Internet Archive/Prelinger, fonts and other assets. The evidence review links from the song plan, technical report and checkpoint. R14–R16 remain optional fits; repository presence and skill availability are not evidence of consultation or integration.

The reusable Claude and Codex one-song prompts, Claude setup/index/source/production guides, root project instructions, and the paired-production scaffold now point to the same template and rules. Each comparison variant records its own repository and skill review. R14–R16 do not become rendering dependencies; GSAP remains absent from the shared Remotion runtime. No renderer/config schema change was justified: provenance belongs to the per-song research and build handoff, not the render-time `PROJECT` contract.

## Historical evidence preserved

The October 5 R01–R13 acquisition counts, source imports, dated reports, and older completed song reviews remain historical records. Current indexes now state that the atlas covers R01–R16 and link the later R14–R16 acquisition/skill evidence. Existing song productions, source repositories, package installations, recordings and outputs were not modified.

## Changed paths

### New canonical material

- `claude-finished-song-animation-project/16_SOURCE_PROVENANCE_AND_BUILD_TRACE.txt`
- `repository-preparation/templates/SONG_RESOURCE_PROVENANCE_TEMPLATE.md`
- `repository-preparation/SONG_BUILD_PROVENANCE_INTEGRATION_2026-10-27.md`

### Future song launch, operating guidance and indexes

- `claude-finished-song-animation-project/00_SETUP_README.txt`
- `claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`
- `claude-finished-song-animation-project/03_REUSABLE_SOURCE_ROUTER.txt`
- `claude-finished-song-animation-project/04_REUSABLE_PRODUCTION_STANDARD.txt`
- `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`
- `claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`
- `claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt`
- `README.md`
- `CLAUDE.md`
- `PROJECT_INSTRUCTIONS.md`
- `CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt`
- `reusable-animation-context/00_REUSABLE_SOURCE_LIBRARY_GUIDE.txt`
- `reusable-animation-context/01_TECHNIQUE_ROUTER.txt`
- `reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt`
- `repository-preparation/README.txt`
- `repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md`
- `repository-preparation/CHECKPOINT.md`

### Reusable comparison scaffold

- `productions/_comparison-template/CODEX_LOCAL_START_PROMPT.txt`
- `productions/_comparison-template/README.md`
- `productions/_comparison-template/COMPARISON_PROTOCOL.md`
- `productions/_comparison-template/COMPARISON_SCORECARD_TEMPLATE.md`
- `productions/_comparison-template/VARIANT_CHECKPOINT_TEMPLATE.md`
- `productions/_comparison-template/ONE_PROMPT_END_TO_END_COMPARISON_LAUNCH_TEMPLATE.txt`

## Unchanged boundaries

- Goal text and its paste-ready file were not changed.
- No completed or active song production folder was changed.
- No source repository, shared render code, Remotion config, dependency, runtime, media or output was changed.
- No video, still, image, audio analysis or browser action was run.
- No package installation or test suite was run.

## Read-back and limits

The changed prompts and guides were read back, and the previous active guidance statements that treated the current source set as only R01–R13 were reconciled. Dated acquisition/history statements were preserved with their historical scope. The paste-ready field files remain within their limits: Goal `01_PROJECT_DESCRIPTION_TO_PASTE.txt` is 7,922 characters; Project Instructions `02_PROJECT_INSTRUCTIONS_TO_PASTE.txt` is 15,969 characters, including spaces and line breaks. The project-local skill discovery behavior in live Claude/Codex app sessions remains untested; the instructions therefore require recording actual access and reading rather than assuming auto-discovery.
