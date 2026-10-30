# Moving Image Archive search learning review — I Am Promethean

Date: 2026-10-28  
Scope: inspect saved archive-search and selection evidence in the active kit; improve future per-song search guidance. This is a documentation pass. No media was searched live, downloaded, modified, rendered or visually reviewed here.

## Case evidence inspected

- `productions/i-am-promethean-comparison/claude/archive/mia-search/`: 13 topic-named JSON results (`baker`, `baker2`, `boxing`, `classroom`, `doctor`, `forestlight`, `law`, `moon`, `plane`, `ranch`, `seaside`, `tree`, `waltz`). Each has 24 candidates and fields including source/clip IDs, title, source interval, duration, color mode, aspect ratio, match timestamp and score.
- `productions/i-am-promethean-comparison/claude/archive/mia-pages/clips.tsv`: selected item/clip identifiers and their saved local media locations.
- `productions/i-am-promethean-comparison/claude/archive/mia-pages/` and `archive/CLIP_MANIFEST.md`: saved item pages, displayed item details and links from selected sources to production scenes, source intervals and filenames.
- `productions/i-am-promethean-comparison/claude/research/PLAN.md`: scene-to-footage plan and the distinction between archival story information and code-authored continuity devices.
- `productions/i-am-promethean-comparison/claude/research/REPOSITORY_REVIEW.md`: bounded evidence of how footage and code craft were treated in the project review.

The local MIA result JSON schema does not retain the exact natural-language query or filter values. The filenames identify topics, not verbatim search strings. The saved manifest also contains user-provided leads and selected clips that cannot all be attributed to those 13 result files. This review therefore does not reconstruct query wording or claim every selected clip was produced by the saved search batch.

## What the case teaches

The strongest reusable pattern is not “search a lyric phrase.” It is:

1. Define the shot's visible job in the storyboard: subject, action, setting, context and frame/layout need.
2. Search a small ladder of focused phrases, changing one concept at a time: direct image; grounded period/location variant; adjacent image that still serves the scene.
3. Open the actual clip at the relevant time. Separate visible evidence from catalog description and interpretation.
4. Compare a few candidates against the same visual target. Treat the archive's score as a discovery hint, not the editor's ranking. Keep rights/provenance as a separate gate.
5. Trace the chosen clip through source interval, production timeline, scene ID and manifest. Preserve rejected near-matches and no-result needs so the next search can improve.

The case includes useful examples of direct visual matches (woodland path for a forest passage, hand harvest for plains, craft worker at a bench for inherited work, physician/patient for a doctor passage, and a choir for shared singing). Other imagery was associative or contextual and should be described that way instead of stated as literal evidence. The quilt layout and its large film plates are specific to this song; future work should decide footage footprint and code-built action from its own story.

## Changes made

- Expanded `claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt` with a visual-target/query-ladder method, actual-preview evidence rules, a comparative shortlist rubric, and explicit limits on what the Promethean search records establish.
- Added `repository-preparation/templates/MIA_SEARCH_LOG_TEMPLATE.md` so future productions record the exact query, filters, candidate previews, result evidence and decisions as the search happens.
- Updated `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt` to make the song-local search log a required part of the launch workflow.
- Updated `claude-finished-song-animation-project/00_SETUP_README.txt` to route project setup to the canonical search guide and log template.

## Verification and limits

Reviewed the edited paragraphs and checked the referenced local paths exist. No render, media check, live archive call, or code test was run. The stronger workflow improves search traceability and editorial selection; it cannot guarantee a relevant archive result, rights status or visual quality without per-song search and preview evidence.
