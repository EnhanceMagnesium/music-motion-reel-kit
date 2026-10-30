# Claude animation project

## Current administration and authorization

Read PROJECT_INSTRUCTIONS.md and CLAUDE_ANIMATION_VIDEO_RUNBOOK.txt first. Claude owns execution of the workflow authorized by the user; GPT is optional assistance, not a mandatory direction or review gate. Honor the initiating prompt across all stages it expressly names. The canonical new-song prompt names the complete in-scope production stages; continue through those stages without repeated approval. When the initiating prompt authorizes planning only, stop at that boundary. Pause for consequential unresolved inputs, spending, credentials or actions outside scope. Current-case media authorization is unchanged. Existing approved source acquisition is complete; use its ledger and indexes for selective reads.

Create one code-rendered music animation video that uses the supplied finished recording from beginning to end at its actual measured duration by default. Do not select an excerpt unless the user explicitly asks. Compose each song natively in the per-song selected 4:5 (1080×1350) or 9:16 (1080×1920) frame. Read PROJECT_INSTRUCTIONS.md, `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`, the filled song brief and `13_REPOSITORY_NAVIGATION_AND_USE.txt`. Use the connected local files for detailed production guidance. Choose a song-specific palette from the song itself, with brief reasoning and roles recorded in the song plan and config; never default to Claude orange, a house palette or a prior song's colors, and do not ask the user for routine swatch choices.

## Repository source and preparation

The original R01–R13 pinned checkouts and approved-use records, plus the later R14–R16 checkouts and skill records, are present locally. Do not rerun historical imports or claim a full source read from disk presence. Before selecting a technique, read the current source router, repository catalog, applicable license/role record and exact source/dependency closure. Use `repository-downloads/` for the full pinned source checkouts after recursive submodule initialization. Use the per-song provenance template and R14–R16 resource guide. Dated acquisition procedures under `claude-animation-project-context/` are records, not standing instructions to re-import repositories.

For every song, read claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt and repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md. Save the required per-song `productions/<song>/research/REPOSITORY_REVIEW.md`: rank all catalogued R01–R16, record paths actually opened, deeply inspect relevant source code and map selected mechanisms to concrete scene/helper callers. Deep-read only plausible candidates. For cross-song repository routing, also read reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt and its current addenda before proposing a technique. It distinguishes full pinned checkouts, historical approved snapshots, installed dependencies, actual source reading, integration and visual acceptance. Use repository-downloads/ for complete pinned originals. Verify each selected path in the active local folder; do not infer that a repository was read from its presence, a Library count or a router entry. The Oct 24 additional-resource install applies to this original kit; the Downloads migration copy predates it.

For every song, include at least one suitable, rights-cleared clip from each of the three required footage sources: Moving Image Archive, Wikimedia Commons and Internet Archive/Prelinger. Follow `10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt` and `15_MEDIA_API_DISCOVERY_WORKFLOW.txt`; preview each item, preserve separate provenance, and do not call the reel finished if any source requirement is unmet. Before storyboarding, record the R01–R16 repository scan/ranking and source evidence in the song’s `research/REPOSITORY_REVIEW.md`. These are footage sources, not renderers.

Use `shared-animation-library/media-discovery/` for required Commons and Internet Archive/Prelinger searches. Public searches need no OAuth; Commons requires truthful contact information in its User-Agent. These API sources do not replace the separate Moving Image Archive clip.
For Prelinger-specific collection search and visual discovery, also use https://prelingerarchives.online/; follow a selected result to its Internet Archive item page for item-level rights, files and the shared helper's download workflow. The site is a discovery route for the IA collection, not another API/provider; collection membership alone does not establish rights.

## Step 1 handoff

The user may supply a text-derived Grok brief as creative input; text alone does not establish audible details or timestamps. Grok Bot can accept audio attachments, but its default computer is cloud-hosted and separate from the local kit. Do not claim that it analyzed the master unless that session actually accessed and assessed the recording. In this Claude Code Local workflow, inspect the exact master, measure its full duration and structure, and use it from beginning to end unless the user explicitly requests an excerpt. For Cursor or Grok Bot setup boundaries, see `repository-preparation/CURSOR_GROKBOT_COMPATIBILITY_GUIDE_2026-10-30.md`.

## Production contract

Plan the full measured song. Use the no-media plan before spending render time and follow `claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt` for risk-based stills, authorized full-candidate playback and bounded revisions. The first playable candidate is the complete full-song animation. Set the song's `PROJECT.duration` explicitly; an omitted `maxDurationSeconds` follows it, and an explicit per-production limit is optional. For a zero-offset full-master export, the shared plan rounds video frames up and Remotion audio is scheduled for the exact measured source duration; the planned video endpoint can be less than one frame later. Report the plan's difference and verify actual encoded endpoints and sync only after authorized rendering/playback. Keep source timing separate from production-local timing. Do not trim, pad or remix the recording without a separate decision.

## Current shared renderer — keep each song in this kit

Use `shared-animation-library/render.mjs` as the single render entry. New song productions use the installed Remotion engine through `PROJECT.renderEngine: 'remotion'`, with React scene components and media in that song's own folder. Existing p5 productions remain supported through the same entry as the legacy route (`renderEngine` omitted or `p5`). Both routes use the shared normalized `PROJECT` and export plan. Do not create a separate Remotion project, move song files outside the connected kit, or assume p5 `PROJECT.modules` load React scenes. Claude chooses per scene whether direct Remotion or a HyperFrames Player HTML/GSAP subcomposition fits; this is not a user choice gate. Remotion always owns the full-song clock, master audio, final composition, export and encoder. Follow `claude-finished-song-animation-project/14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt`; the isolated hybrid example is not a general HyperFrames render route.

Read `shared-animation-library/README.md` and `shared-animation-library/remotion-runtime/README.md` before implementing. Use `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt` as the single canonical per-song initiating prompt; it may authorize a complete named production run once. Use `node shared-animation-library/render.mjs --root=productions/<song> --plan` for the no-media plan. For Remotion, the song config declares `remotion.scenes: 'remotion/scenes.jsx'` and `remotion.publicDir: 'public'`; its scene components export a named `scenes` registry keyed by the scheduled scene `impl` or `id`. The pinned runtime is installed in the shared library, not per song. A plan does not open a browser or produce media. Use Remotion `--stills` for authorized pre-export samples. After an authorized full render, preview the video in the local Claude Code Browser pane when available, then use `claude-finished-song-animation-project/11_HEADLESS_BROWSER_FRAME_REVIEW.txt` for saved Playwright frames and the FFmpeg contact sheet; inspect those PNGs and perform full playback with sound separately.

## Source map

- PROJECT_INSTRUCTIONS.md: current duration, input, budget and production rules.
- `productions/<song>/`: song-specific direction, recording identity, measured full duration, cues, `research/REPOSITORY_REVIEW.md`, archive manifest, scene code and checkpoint. For each song, complete guide 19's per-second coverage CSV and SVG scene-state boards. Keep footage time separate from frame footprint and name code-built action under guide 17.
- GROK_ANIMATION_VIDEO_BRIEF.txt: Grok instructions; its returned filled prompt is the Claude handoff.
- claude-finished-song-animation-project/: canonical paste-ready Goal/Instructions and current operating guides, including `14_HYPERFRAMES_SUBCOMPOSITION_GUIDE.txt`.
- REFERENCE_NOTES.md and ANIMATION_VIDEO_REPOSITORY_SOURCES.txt: source-method and inspection evidence.
- shared-animation-library/README.md: current shared renderer, scene and export contracts.
- shared-animation-library/render.mjs: current single render entry; routes Remotion and legacy p5 from each song's PROJECT.
- shared-animation-library/remotion-runtime/README.md: installed Remotion setup, scene interface and commands.
- claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt: canonical risk-based review, temporal stability, evidence and stop condition.
- claude-finished-song-animation-project/18_TEMPORAL_STABILITY_AND_WORD_TIMING.txt: shared encoded-frame anomaly scan and optional evidence-based word timing.
- shared-animation-library/base/: supported legacy p5 engine and its existing scenes.
- renderer/: historical His Line/v1 files; do not use as the default engine for a new song.
- `productions/<song>/CHECKPOINT.md`: current song stage, evidence, unresolved risks and next authorized action.

## Local execution

Inspect the available shared runtime, then preflight the song-specific `PROJECT` through the shared render entry. Save and render the complete measured song-duration scene source with the configured engine only when authorized. Keep a running job fixed to one version. Preserve the original recording and set any nonzero source offset only for an explicitly requested excerpt. Verify actual exported duration, frame count, audio/video endpoints, lyric alignment and phone-scale readability before marking the video complete.

Record Claude Pro work, optional paid assets and any separately authorized API use distinctly. Save portable source and a precise checkpoint at session boundaries so local rendering and later assistance continue from stable files.

When Codex or Claude changes the reusable kit itself—its instructions, shared tools, templates, source maps or reusable workflow—add a short dated entry to `repository-preparation/CHECKPOINT.md` saying what changed, why, which files, what was checked, what remains and the next kit edit. When a task only uses the kit to make or review a song, record it in that song's own `productions/<song>/CHECKPOINT.md` instead.


ONE-PROMPT PRODUCTION
Use `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt` as the single canonical start for each new song. It authorizes its named production stages once. Read `08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt` for the system objective and evidence-based lessons. The current Will Not Fade media authorization remains unchanged.

R14–R16 MOTION RESOURCES: assess all three before storyboard lock; consultation is required, while code adaptation and GSAP runtime use remain selective. Follow `claude-finished-song-animation-project/17_FOOTAGE_FRAME_FOOTPRINT_AND_CODE_ACTION.txt` and the resource/provenance guides. The skill copies do not add a renderer or shared Remotion runtime dependency.
