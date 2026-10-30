# Shared footage discovery helper

This dependency-free Node CLI performs bounded, pre-render search and metadata checks against Wikimedia Commons and Internet Archive. Each finished song must integrate at least one suitable, rights-cleared clip from each API source; Prelinger is an Internet Archive collection that may be used when relevant. For Prelinger-specific human search and preview, use [Prelinger Archives Online](https://prelingerarchives.online/); follow selected films to their Internet Archive item record, then use this CLI for metadata inspection and selected-file download (`--collection prelinger` narrows API search). The CLI does not query prelingerarchives.online. The separate Moving Image Archive clip requirement remains in force too, so footage from all three sources must be present and reviewed.

No provider request is part of the render path. The CLI does not call Remotion, produce previews, automatically alter a song config, or visually evaluate footage. Search output is a shortlist; preview the original item page before selecting a file. A source quota never justifies an irrelevant clip or a rights-gate bypass; if either API source yields no suitable item, mark its required source unmet and do not call the reel finished.

## Public access and contact

Public search and item metadata reads require no API key, OAuth consumer, login or secret. Do not register OAuth for this workflow.

Wikimedia requires a descriptive User-Agent with truthful operator contact information. For this kit, see `../../claude-finished-song-animation-project/15_MEDIA_API_DISCOVERY_WORKFLOW.txt` for the user-authorized contact and pass it with `--contact` on each Commons request. The Commons adapter refuses to make a request without it. This is client identification, not a credential; public search needs no Wikimedia login or OAuth. Internet Archive search and metadata operations do not need this value.

## Commands

Run from the active kit root:

    node shared-animation-library/media-discovery/cli.mjs --help
    node shared-animation-library/media-discovery/cli.mjs search --provider ia --query "night stadium searchlights" --collection prelinger --limit 5
    node shared-animation-library/media-discovery/cli.mjs search --provider commons --query "night stadium searchlights" --limit 5 --contact https://your-real-public-contact.example
    node shared-animation-library/media-discovery/cli.mjs inspect --provider ia --id ITEM_IDENTIFIER
    node shared-animation-library/media-discovery/cli.mjs inspect --provider commons --id "File:Exact title.webm" --contact https://your-real-public-contact.example
    node shared-animation-library/media-discovery/cli.mjs download --provider ia --id ITEM_IDENTIFIER --file "exact video filename.mp4" --root productions/SONG_ID

Each search page is capped at eight candidates. Internet Archive uses --page; Commons uses the returned continuation/offset information. Optional metadata filters include MIME, minimum dimensions, duration range or target with tolerance, and date range. Candidates missing a field needed by an active filter are excluded.

Download is a separate explicit command. It re-fetches current item metadata without the search cache, verifies the selected Internet Archive filename or current Commons file page, applies the strict rights allowlist, validates provider host and response type, enforces an 800 MiB default (2 GiB hard maximum), streams and hashes the unmodified source, writes only under an existing productions/<song>/public/archive/, refuses overwrite, and records supplemental API provenance at productions/<song>/archive/API_CLIP_MANIFEST.json and .md. It does not add the asset to config.js or a scene.

For this project, a film surfaced through Prelinger Archives Online is an available footage-source candidate; its presence in the Prelinger route, rather than the “Download Options” list, establishes source availability. Use “Download Options” only to identify the actual retrievable video file and format, then use its exact filename with this helper. Preserve the item's own rights/reuse statement and verify it under the rights gate; route inclusion does not mean every item is public domain or free of item-specific conditions. Do not mistake torrents, logs, subtitles or metadata files for footage.

## Rights and limits

Only item-level Public Domain, CC0, or CC BY 1.0/2.0/2.5/3.0/4.0 with complete attribution is eligible. CC BY-SA, NC, ND, other restrictive terms, unknowns and conflicts are blocked. Internet Archive rights are often uploader supplied; its metadata is not legal certification. Commons metadata is partly free text and may be missing. Search rank, metadata, MIME, dimensions, thumbnails and checksums do not establish visual suitability or actual rights. Preview selected footage and verify its item page and source terms.

No media was downloaded for the tool's implementation checks. Offline fixtures use only short synthetic byte strings and temporary directories.

For the song workflow and full source boundaries, see ../../claude-finished-song-animation-project/15_MEDIA_API_DISCOVERY_WORKFLOW.txt.
