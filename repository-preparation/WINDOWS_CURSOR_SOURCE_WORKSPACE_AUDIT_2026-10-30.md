# Windows and Cursor source-workspace review — 2026-10-30

Scope: source-based review on macOS of the GitHub sharing copy and corresponding active-kit guidance, for a Windows Cursor agent with optional Grok Bot coordination. No Windows host, dependency installation, browser, audio, media or rendering was used. This is not comprehensive proof of platform compatibility or an inventory of every upstream file.

## Inspected

README, root instructions, Cursor prompt and compatibility guide, Windows guide, source atlas, project templates 01/02/05/08, shared renderer and runtime READMEs, shared entry, Remotion render entry, QA helper and media-discovery entry. Searched first-party text for Mac path/platform assumptions, excluding upstream sources, installed dependencies and generated files. Audited source checkout and preparation claims and changed relative Markdown links in the main routing files.

## Findings and changes

- The renderer and QA helper search explicit Chrome overrides plus Mac/Linux defaults, but do not automatically search Windows Chrome locations. The Windows guide directs the agent to verify and set `CHROME_EXECUTABLE` in its own shell. This source observation does not prove a Windows browser launch.
- Remotion path resolution uses Node path APIs and converts public asset paths to URL-style separators; this is an inspection finding, not Windows execution evidence. Windows installs must be prepared locally using each isolated lockfile.
- The GitHub workspace includes R01–R16 as 16 gitlinks; recursively cloning fetches their upstream source, while dependency installations in the atlas refer to historical original-machine preparation. Added a context note to the atlas and differentiated the older curated starter package in the Cursor/Grok guide. Actual upstream availability and platform-specific dependencies remain recipient checks.
- The published workspace excludes the separate starter ZIP and personal song material. Corrected its README and clarified that `shared-inputs/` must be created when needed. The active Mac kit retains its existing starter package references.
- Replaced Mac-only wording in Claude's local production prompt and paste-ready Project Instructions with a compatible-environment check; shortened the latter from 16,097 to 15,977 characters. Goal: 7,985 characters. These changes are local files; no Claude settings or library were changed.
- Retained Mac-specific historic observations as historical evidence, not platform setup instructions. The older separate starter package and historical reports were not regenerated or rewritten.

## Checks and remaining work

On the GitHub staging copy: `node shared-animation-library/render.mjs --help` exited 0; 51 relative Markdown links in six changed routing/guide files resolved, zero missing; `git diff --check` passed; 16 gitlinks were counted. These are no-media checks and do not prove a Windows plan, browser decode, rendering, audio sync, installed tools or visual quality. An actual Windows/WSL setup should run the Windows guide's fingerprint, dependency and authorized plan/still/render/QA sequence and record failures; the source-workspace copy has no song production for a plan yet. The separately recorded Prelinger helper/policy inconsistency remains unresolved.
