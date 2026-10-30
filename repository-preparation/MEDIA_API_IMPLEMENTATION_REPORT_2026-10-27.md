# Shared Media API Discovery — Implementation Report

Date: 2026-10-27  
Scope: reusable, pre-render supplemental footage discovery in the active kit. This did not change a song production or the Remotion renderer.

## What was added

The dependency-free Node tool lives in `shared-animation-library/media-discovery/`:

- `cli.mjs` exposes bounded `search`, `inspect` and explicitly invoked `download` commands.
- `commons.mjs` searches Wikimedia Commons' file namespace, requests current image/file metadata and normalizes only video candidates.
- `internet-archive.mjs` searches the Internet Archive movie index, optionally filters a collection such as `prelinger`, and retrieves each shortlisted item's file metadata.
- `filters.mjs` applies optional known-metadata filters for media type, dimensions, duration and year. Missing values do not pass an active filter.
- `rights.mjs` implements a closed allowlist for item-level Public Domain, CC0 and CC BY 1.0/2.0/2.5/3.0/4.0. It also recognizes the exact legacy Creative Commons public-domain URI observed in the live IA result. Restricted, conflicting and unclear statements remain blocked.
- `http.mjs` bounds JSON response size, uses a small 24-hour OS-temp cache, honors 429/503 retry delays and applies timeouts through the response body.
- `download.mjs` re-fetches item metadata without cache, requires explicit exact-file selection, checks provider host, response type and size, preserves the original bytes, hashes the download, refuses overwrite and writes only under an existing song production. It creates separate `archive/API_CLIP_MANIFEST.json` and `.md` provenance records and leaves any Moving Image Archive manifest untouched.
- `tests/media-discovery.test.mjs` uses synthetic fixture data and temporary folders; it does not fetch or render media.

The tool never runs during `render.mjs`, does not add an asset to `config.js` or a scene, and adds no package to a song. It supplements the required Moving Image Archive workflow; it does not replace that archive, R10, R12/Skillry or the R01–R13 code repositories.

## OAuth and sign-in

**OAuth is not needed for the implemented public search, public metadata reads or explicitly selected public-file downloads.** MediaWiki describes OAuth as an application requesting permission to act through a user's wiki account. Wikimedia's API policy says public requests need a descriptive User-Agent and that authentication provides higher rate limits; it allows a Wikimedia user page, relevant website URL or email as User-Agent contact. The helper therefore requires a truthful contact for Commons via `--contact` or `MEDIA_DISCOVERY_CONTACT`; it does not require account credentials or an OAuth consumer. Signing into Commons or Internet Archive in Claude's browser does not pass browser cookies into this local Node CLI.

Official references:

- [MediaWiki OAuth for Developers](https://www.mediawiki.org/wiki/OAuth/For_Developers#OAuth_2)
- [Wikimedia API access policy](https://www.mediawiki.org/wiki/Wikimedia_APIs/Access_policy)
- [Internet Archive Developer Portal](https://archive.org/developers/)
- [Internet Archive rights guidance](https://archivesupport.zendesk.com/hc/en-us/articles/360014759692-Rights)
- [Creative Commons license-property mapping](https://wiki.creativecommons.org/wiki/License_Properties)

## Verification

### Offline code checks

Command:

```sh
node --check shared-animation-library/media-discovery/cli.mjs && node --check shared-animation-library/media-discovery/http.mjs && node --check shared-animation-library/media-discovery/commons.mjs && node --check shared-animation-library/media-discovery/internet-archive.mjs && node --check shared-animation-library/media-discovery/rights.mjs && node --check shared-animation-library/media-discovery/filters.mjs && node --check shared-animation-library/media-discovery/download.mjs && node --test shared-animation-library/media-discovery/tests/media-discovery.test.mjs && node shared-animation-library/media-discovery/cli.mjs --help
```

Result: exit 0. All seven module syntax checks passed, all **14 tests passed** (0 failed), and CLI help printed successfully. Coverage includes license classifications and conflicts, Commons video filtering and required contact, IA file filtering and bounded search/metadata, metadata filters, retry/response-size behavior, body timeouts, explicit safe download and provenance writing with temporary synthetic bytes, refusal to overwrite, cleanup after timeout, and unsafe path rejection.

### Live metadata-only smoke

One small Internet Archive query was run on Darwin arm64 with Node v26.7.0:

```sh
node shared-animation-library/media-discovery/cli.mjs search --provider ia --query "fog" --collection prelinger --limit 1
```

The helper returned complete JSON for one candidate, `American1956`, from a search reporting 66 hits. The candidate description is about a 1956 engineering recruitment film and does not visibly establish a fog match; this demonstrates why provider search order and metadata are not semantic or visual review. Its metadata included the legacy URI `http://creativecommons.org/licenses/publicdomain/`, which the first parser version conservatively marked unverified. The exact URI is now recognized as the legacy Creative Commons Public Domain case, with an offline test. The saved live output is historical evidence from before that correction; the API was not queried again.

Raw output: `repository-preparation/media_api_ia_smoke_2026-10-27.txt`. That wrapper printed the full helper JSON, then failed while recording the exit code because interactive zsh reserves the variable name `status`. Therefore the shell-wrapper exit is 1 and the helper's exit code was not independently captured; the complete JSON output and the CLI control flow indicate a successful helper response, but I do not report an exact helper exit code from that run.

No Wikimedia live query was made because no truthful operator contact URL/email was supplied or configured. This is a User-Agent contact requirement, not an OAuth or login requirement. The adapter's refusal when contact is missing is covered by an offline test.

## Boundaries and remaining verification

- No package was installed or updated; no OAuth app was registered; no user account or browser session was accessed.
- No media file was downloaded, no API media asset was added to a song, and no audio/image/video was analyzed, rendered or visually reviewed.
- Rights metadata from either provider is evidence, not legal certification. Internet Archive expressly does not guarantee rights statements on item pages; manual item-page review remains required before use.
- File response type/size/host and byte integrity are guarded in source and covered with synthetic fixtures, but a real selected media download has not been exercised. Codec validity, playback, scene suitability, clip timing and rights for any future item remain to be checked per song.
- Commons live behavior remains unverified until a truthful contact value is configured and one low-volume query is made.
- The separate Moving Image Archive requirement still applies to each finished song.

## Changed paths

- `shared-animation-library/media-discovery/cli.mjs`
- `shared-animation-library/media-discovery/commons.mjs`
- `shared-animation-library/media-discovery/internet-archive.mjs`
- `shared-animation-library/media-discovery/filters.mjs`
- `shared-animation-library/media-discovery/rights.mjs`
- `shared-animation-library/media-discovery/http.mjs`
- `shared-animation-library/media-discovery/download.mjs`
- `shared-animation-library/media-discovery/tests/media-discovery.test.mjs`
- `shared-animation-library/media-discovery/README.md`
- `shared-animation-library/README.md`
- `claude-finished-song-animation-project/00_SETUP_README.txt`
- `claude-finished-song-animation-project/03_REUSABLE_SOURCE_ROUTER.txt`
- `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`
- `claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`
- `claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt`
- `claude-finished-song-animation-project/15_MEDIA_API_DISCOVERY_WORKFLOW.txt`
- `repository-preparation/README.txt`
- `repository-preparation/media_api_ia_smoke_2026-10-27.txt` (saved live evidence)
- `repository-preparation/MEDIA_API_IMPLEMENTATION_REPORT_2026-10-27.md` (this report)
