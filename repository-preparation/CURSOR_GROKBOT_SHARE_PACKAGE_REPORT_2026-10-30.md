# Cursor and Grok Bot starter package — completion report

Date: 2026-10-30  
Active source of truth: ``  
Scope: complete the local Cursor/Grok Bot guidance and curated share archive. No song production was authorized or performed.

## Result

Created the portable starter folder at `share-packages/music-motion-animation-starter/` and archive at `share-packages/music-motion-animation-starter-2026-10-30.zip`. The archive is 2,163,098 bytes with SHA-256 `eacc48ddc3e4f75414fa89d02b511421cbcc2d7987c7d47cde868f3b252c3fe9`. The folder contains 262 files and occupies about 4.7 MB uncompressed.

The starter contains local agent instructions and skills, the Cursor launch prompt and project rule, the shared Remotion renderer source and package locks, the source atlas/catalog and templates, a neutral song fixture, and an empty `shared-inputs/` handoff. It excludes the owner's audio, lyrics, briefs, reference folders, existing song productions, renders and review frames, complete R01–R16 upstream checkouts, `node_modules`, caches, user settings and credentials. Two small documentation JPEGs are retained because the shared library README links to them.

The package copy removes the original owner's local home paths and Wikimedia contact email. Its catalog marks all upstream repositories as not bundled; its atlas explicitly says that checkout locators are not evidence of local source access. The recipient must verify any needed repository checkout and pinned revision before claiming to have inspected it.

## Cursor and Grok Bot operating boundary

The active kit now has `.cursor/rules/music-motion-reel-kit.mdc` and the existing `CURSOR_LOCAL_FULL_SONG_PRODUCTION_PROMPT.md`. Root `AGENTS.md`, `PROJECT_INSTRUCTIONS.md`, and the Cursor/Grok Bot compatibility guide route local work appropriately. The packaged `GROKBOT_WORKFLOW.md` keeps Grok Bot optional and distinguishes its cloud workspace from local files/commands; it recommends retaining per-command approval and keeping personal audio local unless its owner chooses a cloud upload.

The package instructs a recipient to extract/open it in a local coding agent, add song inputs under `shared-inputs/`, install only the pinned Remotion and QA dependencies with the documented `npm ci` commands, confirm Node/Chrome-or-Chromium/FFmpeg, and use the local full-song prompt. No recipient-machine install or production has been performed.

## Checks and evidence limits

- `unzip -t share-packages/music-motion-animation-starter-2026-10-30.zip` — passed; no archive errors.
- A Node-based scan checked 84 relative Markdown links in the package — 0 missing targets.
- File scans found no `node_modules`, song audio/video, rendered PNG/contact-sheet outputs, original-owner home path, original-owner Wikimedia email, or named personal song case in the package. The only raster images are the two documented model-sheet JPEGs listed above.
- The zip hash and byte size were recorded directly after the final archive rebuild.
- No `npm ci`, tests, browser run, media search/download, audio analysis, still render or video render was run in this packaging pass.

## Open kit item

The existing edit log still identifies a Prelinger workflow-policy mismatch: the user's direction treats a film appearing through the Prelinger archive route as available for use, with that basis recorded as such and without calling the film public domain, while the shared Internet Archive helper applies a narrower license allowlist. This pass does not change or claim to resolve that gate. The package flags the issue and preserves the observed rights wording; a future kit edit should reconcile the route-availability policy with the helper and its manifests before relying on a Prelinger item that the helper marks ineligible.

## Files changed in this completion pass

- `.cursor/rules/music-motion-reel-kit.mdc`
- `README.md`
- `repository-preparation/README.txt`
- `repository-preparation/CURSOR_GROKBOT_COMPATIBILITY_GUIDE_2026-10-30.md`
- `repository-preparation/CURSOR_GROKBOT_SHARE_PACKAGE_REPORT_2026-10-30.md`
- `repository-preparation/CHECKPOINT.md`
- `share-packages/music-motion-animation-starter/` (262 curated files; package-specific copied documents are sanitized/portable)
- `share-packages/music-motion-animation-starter-2026-10-30.zip`

No renderer, media-discovery implementation or song production was changed.
