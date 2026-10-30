# GitHub source-workspace export record — 2026-10-30

## Scope

Prepared a portable, private GitHub workspace from the active kit’s reusable first-party files plus R01–R16 as upstream-pinned Git submodules. This export is a source workspace, not a song production. Per-song masters, briefs, lyrics, archive downloads, renders, stills, caches, installed dependencies, and machine-specific audit data are excluded. The active kit was not modified.

## Source material and provenance

- `repository-preparation/GITHUB_SOURCE_WORKSPACE.md` lists every repository URL, exact pinned commit, local submodule path, and the license/provenance caveat recorded for that source.
- `repository-preparation/REPOSITORY_LIBRARY_CATALOG.csv`, `LICENSE_AND_ASSET_REFERENCES.csv`, and the navigation atlas retain the current catalog and evidence. Each upstream checkout remains a separate submodule, preserving ownership and terms.
- Recursive clone is required to materialize R01–R16 locally. GitHub’s Download ZIP does not populate submodules.
- R04 (HyperFrames) contains Git LFS pointers. Install Git LFS and run `git -C repository-downloads/heygen-com/hyperframes lfs pull` if its LFS assets are needed. This export does not claim those LFS objects have been hydrated.
- Duplicate historical partial snapshots under `source-library/raw/github/` are excluded; the complete pinned upstream checkouts are available through the submodules.

## Export hygiene

- The staged workspace is approximately 99 MiB of first-party files, excluding Git object stores and submodule checkouts. The largest included ordinary file is the platform-specific Bun executable in `repository-preparation/bin/`; it is not a portable runtime requirement.
- Historical build logs had 66 occurrences of the owner’s absolute local kit path replaced with `<ACTIVE_KIT_ROOT>` in this export copy. No email address or song production material is included.
- Legacy notes that preserve old duration/catalog guidance are identified in the workspace guide as historical; current operating authority is linked there.

## Clone

```sh
git clone --recurse-submodules https://github.com/EnhanceMagnesium/music-motion-reel-kit.git
```

The parent GitHub repository is intended to be private. Add a collaborator by their GitHub username after the remote is populated.
