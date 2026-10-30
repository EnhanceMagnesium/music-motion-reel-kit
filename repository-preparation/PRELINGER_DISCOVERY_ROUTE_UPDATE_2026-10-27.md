# Prelinger Discovery Route Update

Date: 2026-10-27

## Verified source roles

- [Prelinger Archives Online](https://prelingerarchives.online/) is a searchable, Prelinger-specific discovery site. Its current homepage offers title/subject/description search and filters, describes its film collection, and links to the Prelinger collection on Internet Archive.
- [Internet Archive's Prelinger collection](https://archive.org/details/prelinger) is the collection's item and file access route used by the kit's existing Internet Archive metadata/download integration. The shared helper supports bounded search with `--collection prelinger` and item-level inspection/download.
- These are two connected access routes for one Internet Archive collection, not two distinct providers. The required Moving Image Archive is still separate.
- Prelinger collection membership does not itself establish a selected film's reuse rights. The item-level license/rights evidence, actual file and incorporated elements still require review; the kit's existing allowlist and provenance requirements remain in force.

## Guidance changed

- `claude-finished-song-animation-project/15_MEDIA_API_DISCOVERY_WORKFLOW.txt`: made Prelinger Archives Online the collection-specific search/preview route and Internet Archive the item/file verification and API download route.
- `claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt`: added a concise distinction and process pointer for the additional Internet Archive source.
- `shared-animation-library/media-discovery/README.md`: states that the helper does not query the Prelinger website and documents the discovery-to-IA handoff.
- Root `README.md`, `CLAUDE.md`, `PROJECT_INSTRUCTIONS.md`, `CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt`, and `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`: added operational pointers so future builds use the correct discovery site.
- `productions/_comparison-template/ONE_PROMPT_END_TO_END_COMPARISON_LAUNCH_TEMPLATE.txt`: aligned comparison builds.
- `repository-preparation/README.txt`: indexed this route and report.

## Evidence and scope

The current site was opened read-only on 2026-10-27. The visible page identified itself as “Prelinger Archives — Excavator,” provided search over titles, subjects and descriptions, and linked its online collection to Internet Archive. The Internet Archive Prelinger collection was opened from that link. No media was downloaded or previewed, no account was accessed, and no rights determination was made for an individual film.

The shared API helper was not changed: the discovered site is a search/preview route, while the existing Internet Archive adapter remains the selected-item metadata and download route. No package, renderer, song production, checkpoint or media file was changed. No browser, media or code test was run.

## Download-options clarification

The user clarified that the film's appearance in the Prelinger route is the evidence that it is available as a footage-source candidate; the “Download Options” list only identifies retrievable files and formats. Operational guidance now reflects that distinction. It preserves the item's rights/reuse statement and does not claim every Prelinger result is public domain or free of item-specific conditions. Non-video files such as torrents, logs, subtitles and metadata are not footage.
