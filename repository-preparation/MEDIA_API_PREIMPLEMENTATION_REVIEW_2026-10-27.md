# Wikimedia Commons and Internet Archive API pre-implementation review

Date: 2026-10-27

Scope: preparation for a reusable local media-discovery feature in the active animation kit. This is an audit and implementation design, not an API adapter implementation or a song production pass.

## Executive summary

GPT can do nearly all of the preparation and can also implement the shared discovery tool itself if that becomes the chosen next step. No API keys or accounts are needed for the two providers’ public search/read operations. This review inspected the active project’s archive and render conventions, verified one small live search response from each service in the browser, and specified the implementation seam and rights gate. It did not change renderer code or any song production.

There are two API integrations:

1. Wikimedia Commons MediaWiki Action API.
2. Internet Archive Advanced Search and item metadata APIs. Prelinger is an Internet Archive collection, not a separate provider.

The Moving Image Archive remains the existing, separate website-based workflow. The active project instructions require at least one relevant Moving Image Archive clip in each finished song. Commons and Internet Archive should supplement this source; they do not replace it.

## Active-kit inspection

The source of truth was the active kit at ``. The Downloads migration copy was not used.

Files inspected directly included:

- Root `PROJECT_INSTRUCTIONS.md`, `CLAUDE.md`, and `README.md`.
- `claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt`, `03_REUSABLE_SOURCE_ROUTER.txt`, `05_NEW_SONG_CONVERSATION_PROMPT.txt`, `08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`, and `13_REPOSITORY_NAVIGATION_AND_USE.txt`.
- `repository-preparation/README.txt` and `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md`.
- `shared-animation-library/README.md`, `shared-animation-library/render.mjs`, `shared-animation-library/base/src/project-config.js`, `shared-animation-library/production/manifest.mjs`, `shared-animation-library/remotion-runtime/README.md`, and `shared-animation-library/remotion-runtime/src/song-composition.jsx`.
- The current `productions/the-series-dplus/research/PLAN.md`, its `archive/CLIP_MANIFEST.md`, and its archive search folder; plus the Collective Scale clip manifest.

This was a targeted read of the source and relevant guidance, not a full-kit or full-repository read. A focused search found no first-party Wikimedia Commons or Internet Archive provider adapter in the shared library or the current project guides. The saved API integration prompt is still a proposed implementation task, not evidence of working code.

### Existing media and renderer contract

- `claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt` owns the current per-song footage process: natural-language web search, preview, selected download, rights/provenance record, unchanged original, production copy under `productions/<song>/public/archive/`, and an asset entry in that song’s config.
- The Series Dplus archive folder contains raw Moving Image Archive query results, preview thumbnails and a clip manifest. The manifest records Moving Image Archive endpoints (`POST /api/search` and `/api/clips/<id>/download`). This is useful per-song evidence, not a reusable Commons or Internet Archive adapter.
- `shared-animation-library/base/src/project-config.js` already accepts production-relative `PROJECT.assets` paths and `{id, src, kind}` records. `shared-animation-library/remotion-runtime/README.md` documents how the shared runner checks local asset paths, resolves Remotion `staticFile()` URLs and passes declared assets through the scene contract.
- `shared-animation-library/render.mjs` is the shared p5/Remotion dispatch point. Network discovery should stay outside it and outside the Remotion composition/bundle. Discovery and selected media admission should finish before render planning.
- The current archive workflow keeps source search evidence and chosen media in each production. The new provider layer should be shared code; each song’s candidate list, selected files and rights manifest should remain song-local.

## Live API checks performed

These were small, read-only browser requests. No login, key, account, media download, media processing or render was used.

### Wikimedia Commons

- Endpoint tested: `https://commons.wikimedia.org/w/api.php`.
- Query: `action=query`, `generator=search`, `gsrsearch=fog`, `gsrnamespace=6`, `gsrlimit=3`, `prop=imageinfo`, `iiprop=url|size|mime|extmetadata`.
- Result: the API returned file page URLs, MIME, size and `extmetadata`, including Artist, LicenseShortName, LicenseUrl, UsageTerms and AttributionRequired on examples.
- Limitation: this broad `fog` query returned still images, so it verified API access and metadata shape only. It did not verify video-only search/filtering. The implementation must inspect returned MIME/media type and reject stills. The sample also included CC BY-SA, which is outside the current project allowlist.
- Official docs warn that much file author/license information is free text or not machine-readable, and `extmetadata` is an expensive request. Use a small result set and request expensive detailed fields only for shortlisted files.

### Internet Archive / Prelinger

- Search endpoint tested: `https://archive.org/advancedsearch.php`.
- Query: `collection:prelinger AND mediatype:movies`, requesting identifiers, titles, licenseurl and rights, with two rows.
- Result: JSON search succeeded; it reported 10,461 matches at the time of this request. The two sample result rows contained identifier and title but omitted the requested rights/license fields.
- Limitation: the match count is time-sensitive and is not a claim that all results are available or reusable. Search output is not a rights record. The implementation must fetch `https://archive.org/metadata/{identifier}`, inspect its file list and item-level fields, then review the item page before marking rights eligible.

Official starting points:

- [Wikimedia API access policy](https://www.mediawiki.org/wiki/Wikimedia_APIs/Access_policy)
- [Wikimedia API rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)
- [Commons machine-readable metadata](https://commons.wikimedia.org/wiki/Help:Machine-readable_data)
- [MediaWiki Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo/en)
- [Internet Archive Developer Portal](https://archive.org/developers/)
- [Internet Archive item metadata read API](https://archive.org/developers/md-read.html)
- [Internet Archive rights guidance](https://archivesupport.zendesk.com/hc/en-us/articles/360014759692-Rights)

## Recommended implementation shape

Implement one small shared, local Node discovery command with two provider adapters. Keep it outside `shared-animation-library/remotion-runtime/` and out of `shared-animation-library/render.mjs`. No new renderer, service, background task, aggregator, provider package or per-song dependency is needed.

Suggested lifecycle:

1. **Search:** take a natural-language shot need and bounded filters/limit; query both selected APIs or one provider; return a small ranked candidate list with original item links and preview links where available.
2. **Inspect:** retrieve detailed file/item metadata only for shortlisted candidates. Confirm video MIME/container, technical details and the exact rights fields; do not imply the clip was visually previewed from metadata alone.
3. **Human preview/selection:** open the original item page in the existing browser workflow, check visual suitability, and choose a candidate.
4. **Download:** later, after a per-song media stage is authorized, re-fetch rights metadata and download only the selected file to that production’s existing archive/public convention. Refuse unverified rights and overwrites.
5. **Manifest:** write provider and item identifiers, title, creator/uploader, item/file URLs, exact rights text/license URL, access date, file metadata, SHA-256, local path, trim range/transformations and generated attribution.

Suggested normalized candidate fields:

`provider`, `providerItemId`, `providerFileId`, `title`, `description`, `creator`, `date`, `collection`, `itemUrl`, `fileUrl`, `previewUrl`, `mime`, `width`, `height`, `durationSeconds`, `fileSizeBytes`, `rightsStatus`, `rightsText`, `licenseId`, `licenseUrl`, `attribution`, `rawRightsEvidence`, `matchReason`, `warnings`.

The discovery command should save query records in the production’s `archive/search/` area, consistent with current productions. Only selected downloaded media should enter `public/archive/` and `PROJECT.assets`. Keep original sources separately if the current per-song convention does so.

### Query and request efficiency

- Commons file namespace results can include images and other file kinds. First find a bounded result set, then verify actual `imageinfo.mime`/`mediatype`. Do not assume `namespace=6` means video. Validate the exact video search expression against current API docs and actual results before shipping it.
- Commons `extmetadata` is relatively expensive. Do not request full rights, HTML metadata for hundreds of results. Search broadly with a small cap, then fetch filtered metadata for only a few plausible video results.
- Internet Archive Advanced Search returns identifiers; use it to find candidates, not to establish rights. Follow each selected identifier with one metadata-read call and inspect available video files rather than assuming the first file is footage.
- Cache modest metadata responses, keep concurrency at or below three for Wikimedia, and honor `Retry-After`/back off on rate responses. Avoid bulk catalogue scans and media downloads.

## Rights policy to preserve

Use only assets with item-level evidence that clearly supports one of the user’s chosen classes:

- Public Domain, with a clear item-level basis;
- CC0;
- CC BY, with exact creator, title, source and license/version attribution.

Treat CC BY-SA, NC, ND, missing/ambiguous metadata and conflicting notices as ineligible under this default. Commons’ metadata may be absent or free-text; Internet Archive says it cannot guarantee uploader-supplied rights data. Prelinger membership or old age alone does not prove public-domain status. An API result is not a license grant.

Generate a complete CC BY credit string and keep rights evidence for PD/CC0 too. Do not automatically burn attribution into the frame; store it in the manifest and make it available for delivery credits. Keep source audio muted under the supplied song master unless the song separately authorizes otherwise.

## Verification plan for the later implementation pass

The saved Claude implementation prompt specifies focused offline fixtures plus at most one small read-only live smoke per provider. Appropriate cases include:

- image versus video MIME filtering;
- each accepted rights class and rejected/missing/conflicting rights;
- sanitization and stable normalization of source metadata;
- attribution output for CC BY and evidence preservation for PD/CC0;
- search result cap and pagination;
- IA result with absent rights fields;
- HTTP errors, timeout, 429/503 and `Retry-After` behavior;
- download path traversal/collision protection and refusal when rights are unverified (without actually downloading media in the API setup pass);
- assertion that render, config normalization and Remotion runtime make no external API request.

Do not claim verified video download, browser preview, clip quality, license compliance, Remotion decoding or song synchronization from search-only API checks.

## What GPT can do before Claude

GPT can, without an API key:

- inspect the active kit and map the exact code/documentation seam (done for this review);
- verify current API docs and live read-only access (done in the browser for the sample requests above);
- define normalized records, exact rights policy, user-facing commands, output structure and failure modes (outlined here and in the saved implementation prompt);
- create offline response fixtures and acceptance criteria;
- write the provider adapters, CLI, docs and tests directly in the active kit, then run focused local checks and read-only smoke requests.

Claude is not technically required to write or test this shared tool. If the desired division of work is for GPT to prepare and Claude to implement, give Claude the saved prompt after reviewing this report. If maximizing GPT’s contribution means having GPT implement the adapter first, that can be a separate explicitly scoped code pass; Claude would then only need to use the tested shared command in each new-song workflow.

Manual setup: no API keys or account fields. Wikimedia asks automated clients for a descriptive User-Agent with an accurate contact route. Use an existing truthful project contact URL if one is documented; otherwise provide one short public contact URL or email when the implementation reaches that exact requirement. Do not invent it or commit private contact information into a public source file.

## This pass boundaries and saved handoff

- No code tests or renders were run.
- The two read-only API browser checks above were performed; no API implementation was written.
- No footage was downloaded, and no song production, scene, artwork, cue, recording or output was changed.
- No packages, API keys, accounts, permissions or settings were added.
- The Claude implementation prompt is saved at [`CLAUDE_MEDIA_API_INTEGRATION_PROMPT_2026-10-27.txt`](CLAUDE_MEDIA_API_INTEGRATION_PROMPT_2026-10-27.txt). It was synchronized with the user’s correction to omit “Panix” and use direct markdown links.
