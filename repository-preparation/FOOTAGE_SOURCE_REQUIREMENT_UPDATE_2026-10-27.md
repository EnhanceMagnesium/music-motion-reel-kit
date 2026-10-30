# Per-song footage source policy update — 2026-10-27

## Current policy

Every finished song reel must integrate at least one relevant, previewed and rights-cleared clip from each of these three independent sources:

1. Moving Image Archive (MIA).
2. Wikimedia Commons.
3. Internet Archive (IA); Prelinger is one IA collection and may be used when a relevant item is available.

These are required source contributions, not a requirement to fill every scene with footage. Do not force unrelated content or bypass rights review to satisfy a source count. If a source has no suitable candidate, record the source as unmet; the reel is not complete. Preserve the original song recording and mute archive audio unless a separate song-specific decision says otherwise.

Keep MIA selection and provenance in `productions/<song>/archive/CLIP_MANIFEST.md`. Commons and IA downloads made through the shared helper use the API provenance records under the same song's `archive/` folder. Keep item identity, source URL, rights evidence, attribution, downloaded-file hash, selected source range, production timing and scene call site. Provider metadata is evidence, not legal certification; IA rights statements may be uploader supplied. The shared API helper is a search/inspect/download aid, not a renderer or visual review tool.

Public Commons and IA searches do not require OAuth. Commons requests do require truthful contact information in the HTTP User-Agent. A logged-in browser session does not configure the Node helper's contact field.

## Scope and evidence

This is a first-party guidance and policy update in the original active kit. It does not query either API or MIA, download or integrate media, render a song, or alter production code or existing song records. The earlier `MEDIA_API_IMPLEMENTATION_REPORT_2026-10-27.md` describes the helper's implementation-time optional-source policy and remains historical evidence; this file records the current policy that supersedes that wording.

The requirement is enforced operationally by the canonical per-song prompt and project instructions: the production cannot be labeled finished if any source lacks a suitable, reviewed clip. The helper's rights allowlist is intentionally cautious; when a candidate is outside it or its terms are unclear, do not treat the helper's result as approval.

## Updated files

- `CLAUDE.md`
- `PROJECT_INSTRUCTIONS.md`
- `GROK_ANIMATION_VIDEO_BRIEF.txt`
- `README.md`
- `claude-finished-song-animation-project/00_SETUP_README.txt`
- `claude-finished-song-animation-project/01_PROJECT_DESCRIPTION_TO_PASTE.txt`
- `claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`
- `claude-finished-song-animation-project/03_REUSABLE_SOURCE_ROUTER.txt`
- `claude-finished-song-animation-project/04_REUSABLE_PRODUCTION_STANDARD.txt`
- `claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`
- `claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt`
- `claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt`
- `claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt`
- `claude-finished-song-animation-project/15_MEDIA_API_DISCOVERY_WORKFLOW.txt`
- `reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt`
- `shared-animation-library/README.md`
- `shared-animation-library/media-discovery/README.md`
- `repository-preparation/README.txt`
- `repository-preparation/FOOTAGE_SOURCE_REQUIREMENT_UPDATE_2026-10-27.md`

The paste-ready Goal contains **7,918 characters** and the Project Instructions contain **15,887 characters**, counting spaces and line breaks. Both remain below their limits of 8,000 and 16,000 characters. No Claude settings or Project Library fields were changed.

## Checks and limits

- Scanned current first-party guidance for source-role and optional/required wording; the current operating references now agree on all three required sources. Historical implementation reports and repository source documentation were preserved as history/source material.
- Counted the two paste-ready fields from their saved UTF-8 text using JavaScript string length.
- No code tests, API calls, archive browsing, downloads, media processing, still generation, browser checks or rendering were run in this policy update.
- Each future selection still requires item-level terms review, a visual preview, clip suitability review and integration evidence. A written mandate does not establish that a suitable clip exists or that a particular license is valid for a particular use.
