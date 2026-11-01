# Music Motion Reel Kit — source workspace

For Windows and Cursor setup, start with [Windows setup and compatibility](WINDOWS_SETUP_AND_COMPATIBILITY.md). Windows rendering is not yet verified.


This GitHub workspace keeps the reusable kit together with all 16 pinned R01–R16 source repositories as Git submodules. Clone with `--recurse-submodules` to materialize the real source trees locally. Start with [the source workspace guide](repository-preparation/GITHUB_SOURCE_WORKSPACE.md), the [project instructions](PROJECT_INSTRUCTIONS.md), and the [repository navigation atlas](repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md).

This source workspace has no blanket root license. Each upstream checkout retains its own terms. Per-song inputs and outputs are intentionally not part of this reusable-kit workspace.

---

# Music Motion Reel Kit

This connected folder is the one working kit for a reusable finished-song animation workflow. Each song has its own conversation and production directory; the shared renderer and pinned source library stay here. Do not create a separate Remotion project.

For song-specific lyric type, use the [font discovery and typography guide](claude-finished-song-animation-project/20_FONT_DISCOVERY_AND_LYRIC_TYPOGRAPHY.txt) and its [font selection record template](repository-preparation/templates/FONT_SELECTION_RECORD_TEMPLATE.md).

## Start a new song

Place the recording, final lyrics and optional brief together in a per-song folder such as `shared-inputs/my-new-song/`; see [song input folders](shared-inputs/README.md). Give that folder path to the selected agent. Other exact paths and attachments are supported. The agent keeps production work separately under `productions/<song>/`.

## Current workflow

Read [PROJECT_INSTRUCTIONS.md](PROJECT_INSTRUCTIONS.md) and the current song brief. The full measured recording is the default. Choose 4:5 (1080×1350) or 9:16 (1080×1920) for each song, explain the choice before storyboarding, and compose natively for that frame. Claude Code Local, Codex Local and Cursor Local each have their own launch prompt. Grok Bot can assist, but its cloud computer and local-computer access are separate from the coding agent's opened kit; see the [Cursor and Grok Bot compatibility guide](repository-preparation/CURSOR_GROKBOT_COMPATIBILITY_GUIDE_2026-10-30.md).

New song productions use the installed Remotion engine through the same shared render entry used by existing productions:

```sh
node shared-animation-library/render.mjs --root=productions/<song> --plan
```

The `--plan` command reads the production's `config.js` and prints the normalized frame/audio plan. It does not open Chrome, render a still, or create video. For a new Remotion production, `PROJECT` sets `renderEngine: 'remotion'`, `remotion.scenes: 'remotion/scenes.jsx'`, and `remotion.publicDir: 'public'`. The named React `scenes` registry, unchanged recording, media and outputs live in that song's own folder.

Existing p5 productions remain supported through this same render entry with `renderEngine` omitted or set to `p5`. Their scene modules remain p5-specific. Remotion React components and p5 modules are separate scene systems; the shared config and export plan do not make their scene code interchangeable. The old `renderer/` files are historical/production-specific, not the new-song default. Remotion remains the song's master clock and sole full-song composition/encoder. The selected production agent may choose, scene by scene and without asking the user to select the routine implementation route, to host a HyperFrames Player HTML/GSAP subcomposition inside Remotion where that scene's needs justify it. HyperFrames is not a second full-song renderer or a general engine selection in `render.mjs`; the isolated proof is `shared-animation-library/examples/remotion-hyperframes-hybrid/` and its limits are documented in `claude-finished-song-animation-project/14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt`.

## Stage boundaries

Text/source planning, implementation, browser checks, still/keyframe output, audio/video processing, and complete rendering are technically distinct. One initiating prompt may authorize several named stages together; carry them out without repeating the same approval request. Follow its inclusions and exclusions, and pause for consequential out-of-scope work, materially uncertain rights, credentials or spending. A plan is not a render. Do not make a short proof video in place of the complete candidate. Keep the master unchanged and report actual audio duration, frame rate, frame count, video duration and frame-quantization difference.

Use [the quality-review and acceptance guide](claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt) as the canonical process for risk-based still selection, temporal stability, authorized full-candidate playback, evidence categories and bounded corrections. Its [temporal stability and word-timing guide](claude-finished-song-animation-project/18_TEMPORAL_STABILITY_AND_WORD_TIMING.txt) documents the shared encoded-frame anomaly scan and optional word-level cue workflow. Before code, follow [guide 19](claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt) and copy both the [second-by-second coverage CSV](repository-preparation/templates/SONG_SECOND_BY_SECOND_COVERAGE_TEMPLATE.csv) and [visual storyboard template](repository-preparation/templates/SONG_VISUAL_STORYBOARD_TEMPLATE.md): map every second of the whole song, then draw panels for distinct setups and meaningful action changes. This is full-song design coverage, not a requirement for a drawing or cut each second. [Guide 17](claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt) separately tracks clip screen-time, frame footprint and story-carrying code action. In local Claude Code Desktop, its Browser pane can preview the candidate video as a visual companion; that Claude-only step does not apply to Codex. After an authorized full render, both workflows use the [Playwright headless frame review](claude-finished-song-animation-project/11_HEADLESS_BROWSER_FRAME_REVIEW.txt); it writes sampled browser frames and uses FFmpeg for a contact sheet. Neither preview replaces saved QA evidence or separate full playback with sound.

## Working references

- [Canonical one-prompt song production](claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt)
- [Codex Local one-prompt full-song production](CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt)
- [Cursor Local one-prompt full-song production](CURSOR_LOCAL_FULL_SONG_PRODUCTION_PROMPT.md) and [Cursor/Grok Bot compatibility findings](repository-preparation/CURSOR_GROKBOT_COMPATIBILITY_GUIDE_2026-10-30.md)
- [Per-song repository navigation guide](claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt) and [R01–R16 atlas](repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md)
- [Per-song source/skill provenance and scene build trace](claude-finished-song-animation-project/16_SOURCE_PROVENANCE_AND_BUILD_TRACE.txt) with its [copy-ready review template](repository-preparation/templates/SONG_RESOURCE_PROVENANCE_TEMPLATE.md)

- [Shared renderer contracts and current status](shared-animation-library/README.md)
- [Remotion engine setup and scene contract](shared-animation-library/remotion-runtime/README.md)
- [One-prompt Project setup and local context guide](claude-finished-song-animation-project/00_SETUP_README.txt)
- [Claude project Goal text](claude-finished-song-animation-project/01_PROJECT_DESCRIPTION_TO_PASTE.txt)
- [Claude project Instructions text](claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt)
- [Reusable source router](reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt)
- [Moving Image Archive footage workflow](claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt)
- [Required per-song footage workflow](claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt) and [shared API helper](shared-animation-library/media-discovery/README.md): search Moving Image Archive, Commons and Internet Archive separately; use [Prelinger Archives Online](https://prelingerarchives.online/) for Prelinger-specific discovery, then verify/download through its Internet Archive item record. Finished reels need one suitable clip per required source, with separate provenance.
- [R12/Skillry code-animation reference workflow](claude-finished-song-animation-project/12_CODE_ANIMATION_REFERENCE_WORKFLOW.txt)
- [Footage frame prominence and code-built action](claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt): keep archive clip screen-time separate from on-frame prominence, and plan meaningful code animation as a story carrier. Assess initialized R14–R16 motion resources before storyboard lock.
- [Visual storyboard and scene coverage](claude-finished-song-animation-project/19_VISUAL_STORYBOARD_AND_SCENE_COVERAGE.txt), [second-by-second coverage template](repository-preparation/templates/SONG_SECOND_BY_SECOND_COVERAGE_TEMPLATE.csv) and [song storyboard template](repository-preparation/templates/SONG_VISUAL_STORYBOARD_TEMPLATE.md): account for the full song at one-second resolution, then draw panels for distinct visual setups and meaningful action changes.
- [R14–R16 motion resource assessment and provenance](repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md)
- [Claude's discretionary Remotion/HyperFrames scene routing](claude-finished-song-animation-project/14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt) and [isolated integration comparison](shared-animation-library/examples/remotion-hyperframes-hybrid/INTEGRATION_COMPARISON.md)
- [Headless Playwright frame review](claude-finished-song-animation-project/11_HEADLESS_BROWSER_FRAME_REVIEW.txt)
- [Temporal stability and word-level lyric timing](claude-finished-song-animation-project/18_TEMPORAL_STABILITY_AND_WORD_TIMING.txt) plus the shared [frame anomaly scan](shared-animation-library/quality-review/temporal-stability-scan.mjs)
- [Repository catalog and preparation records](repository-preparation/README.txt)
- [Kit edit log](repository-preparation/CHECKPOINT.md): what changed in the reusable kit; song work has its own checkpoint.

## Repository evidence

The pinned repository checkouts are source material, not proof that files were read or integrated. Each song saves `productions/<song>/research/REPOSITORY_REVIEW.md` with ranked dispositions for all 16, paths opened and scene callers for selected mechanisms. Deep-inspect only plausible source code and its dependencies/licenses. Distinguish downloaded, prepared, read, adapted, integrated, checked, browser-loaded and visually reviewed states.


## One-prompt production and source navigation

For each new song, start a new task in the selected local app. Claude uses [the canonical Claude full-song prompt](claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt); Codex Local uses [the Codex full-song prompt](CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt). Supply that song's recording, lyrics and optional brief as attachments or exact local paths. Each prompt authorizes its named stages once; the task must still actually have access to the connected kit and native tools. GPT review is optional.

For required discovery across R01–R16, follow [the per-song repository navigation guide](claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt) and the [evidence-based local repository atlas](repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md). The atlas is a navigation aid: scan and rank all 16 for the song, then deeply inspect only relevant sources. It requires a song-local evidence table and does not imply every file was read or every repository should be integrated. Moving Image Archive footage and R12/Skillry discovery have their own guides and are separate from those repositories.

R14–R16 motion resources are assessed before storyboard lock; consultation is required, use remains selective. See the [resource guide](repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md) and record actual skill reading and scene influence. Full scene-need atlas: [R01–R16 navigation guide](repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md).

## Portable starter for sharing

This GitHub source workspace includes R01–R16 as pinned submodules. Run a recursive clone to fetch their source; install required dependencies on the recipient computer. Create `shared-inputs/` for your own recording, lyrics and brief. The older curated starter package mentioned in historical reports is not included in this source workspace.
