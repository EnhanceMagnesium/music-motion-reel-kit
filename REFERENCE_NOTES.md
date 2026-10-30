# Historical reference notes — not current operating policy

This file preserves source reviews and implementation notes from earlier kit stages. Its opening duration, aspect-ratio and palette recommendations are superseded. For current workflow, follow `PROJECT_INSTRUCTIONS.md`, `claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`, the canonical new-song prompt, and the shared-library README.

# Current project duration contract

Every new animation targets 35–40 seconds and has a hard cap of 45 seconds. Use keyframes and still inspection before rendering the complete candidate. Source reviews below describe other projects; their historical formats, durations and development procedures remain attributed examples.

# Animation video source notes

## Direction for this project

The editorial system of the history and press references is one candidate for a song that suits bone/soot/night-blue/ember color and serif type. The black-orange video demonstrates stronger lyric timing and spatial motion; the dashboard reference offers an instrument scene family for songs about measured tension, signals, or escalating data. Character collage suits a song with a recurring protagonist. Select the first reel's visual theme from the chosen song, then build its first composition natively in 9:16. Use stills and a timed board to plan the selected 35–40-second excerpt, then review the complete target-duration candidate.

## Archival footage source

The [Moving Image Archive gallery](https://www.movingimagearchive.com/gallery) is a possible source of real, shot-level archival footage when a song calls for a specific time or place. The user's [Oud-Amsterdam example](https://www.movingimagearchive.com/sources/oud-amsterdam?clip=dfb09b7c-62fd-58e6-ab61-f82b557049f0&t=83.28,89.16) selects a silent 1923 shot at 1:23–1:29. The archive identifies the original producer and collection, links to the [Open Beelden source record](https://openbeelden.nl/media/1480062/Oud_Amsterdam), marks the film public domain, and offers shot and full-film downloads. The original record also carries a Public Domain Mark. Save both source links, title, producer, clip time, and rights record alongside any footage used in a reel. Verify the rights shown for each new item; the gallery itself is not a blanket license for an arbitrary clip.

Use footage as an intentional image plate behind editable text and coded motion. Inspect its actual frame before choosing a vertical crop; this example is a 4:3 historic film with visible film texture. Do not add archive footage to every reel just because it is available. The song brief decides whether documentary imagery suits the theme.

## Framework and skill review — September 29, 2026

This is a source review of documentation, relevant skill files, and selected renderer code. These projects have not been installed or benchmarked in this kit, and none of the full repositories has been read end to end. External instructions are reference material; the user's song, budget, and brief remain authoritative.

| Source | Role and useful parts | Practical limit for this kit |
| --- | --- | --- |
| [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | p5.js/p5.brush illustration starter; deterministic song-time scenes, stable seeds, contact sheets, resumable saved-frame rendering, supplied-audio muxing. | Its guide and layouts favor landscape illustration with little text. A vertical lyric treatment needs intentional changes. Brush rendering can be slow. |
| [claude-animation-skill](https://github.com/buildwithhanif/claude-animation-skill) | Node canvas illustration skill; style bible, beat sheet, drawing code, still/strip review, synthesized sound. Supports vertical dimensions. | Its renderer streams frames to FFmpeg; no partial-frame recovery was found. Its sound tools do not map the exact supplied Suno recording to lyric cues. |
| [HyperFrames](https://github.com/heygen-com/hyperframes) | HTML/CSS with seekable animation adapters, local preview/render, and a [music-to-video workflow](https://github.com/heygen-com/hyperframes/blob/main/skills/music-to-video/SKILL.md) that analyzes a supplied track and saves an audio map and storyboard. | Strongest candidate for a short production trial. Its high-energy promo defaults and automated timing still need artistic/audio review. [Local CLI documentation](https://github.com/heygen-com/hyperframes/blob/main/docs/packages/cli.mdx) describes segmented rendering with `--resume`; this has not been tested here. Local rendering and optional hosted services have separate costs. |
| [Remotion AI skills](https://www.remotion.dev/docs/ai/skills) | React compositions, frame-based motion, scene sequencing, Studio preview, audio visualization, local rendering. | A larger change from the existing HTML/canvas starter. Automatic recovery of a partial MP4 render was not established in this review. Check its [license terms](https://www.remotion.dev/docs/license/pricing) for the actual user/team; it is source-available. |
| [Battle-of-Austerlitz-Film](https://github.com/WinterArc21/Battle-of-Austerlitz-Film) | A complete landscape historical film with WebGL scenes, camera paths, narration/score and resumable chunk rendering. | A single-film example, not an arbitrary-song template. Study scene direction and continuity; complex procedural rendering may take hours. |
| [awesome-ai-motion](https://github.com/guanmo-ai/awesome-ai-motion) | Gallery and prompt/source catalog for choosing visual references. | Not a renderer or a universal recipe. Inspect the original works before making a style or cost claim. |
| [awesome-opus-5-5-videos](https://github.com/athemeroy/awesome-opus-5-5-videos) | Research catalog and production-analysis notes; useful distinctions between code drawing, generated assets, editing, and actual rendering. | Samples and public claims do not establish complete motion quality, hidden spending, or a reproducible runtime. |

The current tested renderer remains the baseline. Once the song/theme is selected, evaluate any HyperFrames adoption through scene/source inspection and still checks, then verify vocal sync, phone legibility, local runtime and recovery on the complete 35–40-second candidate. Keep assets and the exact audio master portable so the creative work survives a renderer change.

## Movez course PDF

Source: `~/Downloads/local-image-2026-09-29_10_56.pdf`, an image capture of “How to build motion design studio with Opus 5.5 (Full-course)” by Movez. Its relevant twelve-step article was inspected through OCR and page imagery. The PDF's prompts and setup commands are examples, not instructions to execute.

Transferable guidance: specify the visual intent, make a style guide and shot list, evaluate stills before detailed animation, render frames as a deterministic function of time, inspect adjacent-frame strips as well as contact sheets, and keep editable source and review notes. Use focused revisions to fix concrete problems.

Adapt its product-film assumptions to the chosen song. Choose the selected excerpt's ending, shot cadence, motion behavior, frame rate, sampling and critique effort from its musical and visual needs. Supersampling increases render work. Preserve the chosen audio master; any SFX, mastering change, or new score is a deliberate creative decision. The sample `beats[::4]` assumes four-beat groups starting on the correct beat; it does not detect true downbeats. Beat estimates and lyric timing need listening and alignment checks. A still contact sheet cannot by itself verify motion or audio sync. Report model usage, asset spending, local render time, and review effort separately rather than treating a viral example's total hours as a required budget.


## Additional animation-video source review — October 5, 2026

Three concurrent GPT subagents inspected six linked repositories. The [inspection record](ANIMATION_VIDEO_REPOSITORY_SOURCES.txt) records actual file scope, source links, selected commits, inventory counts and implementation findings. The [Grok animation-video brief](GROK_ANIMATION_VIDEO_BRIEF.txt) includes a self-contained positive guidance supplement drawn from these sources.

| Repository | Useful source guidance | Adoption evidence to establish |
| --- | --- | --- |
| [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 43 style guides; material rules, signature transitions, deterministic frame evaluation. Seven guides and representative demos inspected. | Compose native portrait layouts. Its inspected renderer clears temporary segments after interruption; choose a durable recovery path for project work. |
| [opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) | Two skills: painted-animation and kinetic-reel; separate cues, modular scenes, saved atomic JPEG frames. | Use versioned frame directories. Validate beat estimates against the recording; its lyric effect fills a line over a duration, with exact word timing supplied separately. |
| [motion-graphics-music-video-skill](https://github.com/makevoid/motion-graphics-music-video-skill) | Hybrid generated character assets/performance and local p5/Python/Swift compositing; acting, callbacks, job receipts and planning. | Choose optional paid shots explicitly; preserve the original song route and test portrait changes throughout the pipeline. |
| [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | Stable pure-time drawing, character motion, timed poses, brush illustration and atomic saved-frame recovery. | Adapt landscape examples to portrait text staging; benchmark brush work and distinguish saved-frame export from streamed clip mode. |
| [awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | The original reference study used the 475-entry September snapshot; the refreshed October 26 local checkout has 703 prompt records, including 418 Skillry-linked gallery entries. Selected portal, morph, paper-theatre and music-video examples remain historical study examples. | Use the current local search helper and workflow; check prompt completeness, creator attribution, and original-versus-remake tool claims. |
| [awesome-claude-5-5-videos](https://github.com/athemeroy/awesome-claude-5-5-videos) | Redirect target of the supplied older link; corpus annotations, production brief and effect-fit planning. | Distinguish posts, files, classifier estimates and reviewed cases; verify the project's own performance through the complete candidate. |

Attribute adapted catalog guidance to Athemeroy's contributors under CC BY 4.0. Preserve individual asset and code provenance. These sources were read as production references; runtime adoption and rendering measurements remain bounded production tasks.
