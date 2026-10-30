# Cursor and Grok Bot compatibility for the animation kit

Date: 2026-10-30  
Scope: inspect current project structure and official product documentation; prepare a shareable local starter. No song production or media action is included.

## Recommendation

Use **Cursor Local as the primary build and render workspace** for a first comparison test. Open the extracted starter-kit folder in Cursor, place the friend's own sample recording, lyrics and brief in `shared-inputs/`, then start a Cursor Agent task using `CURSOR_LOCAL_FULL_SONG_PRODUCTION_PROMPT.md`. Cursor's agent can inspect files, search the project, edit code and run terminal commands. The kit's Remotion route is already Node-based and runs from the opened project folder.

Use **Grok Bot Desktop as an optional research and creative assistant**, or as a separate local-execution agent only when its local-computer control is enabled and the user approves its commands. It does not replace Cursor's project workspace, the shared Remotion renderer, or the kit's saved QA workflow. Claude Code Local or Codex Local are also suitable primary build agents when their own session has access to the same extracted folder and local tools.

## Verified compatibility in this kit

- The kit already has a root `AGENTS.md`; no Cursor plugin is required to read project instructions.
- Cursor's current docs recognize root/subdirectory `AGENTS.md`, `.cursor/rules/*.mdc`, and Agent Skills in `.agents/skills/`, `.cursor/skills/`, `.claude/skills/` and `.codex/skills/`. This kit contains eight installed motion skills in both `.agents/skills/` and `.claude/skills/`.
- Cursor Agent supports file operations, project search and terminal commands. This kit now includes `.cursor/rules/music-motion-reel-kit.mdc` and `CURSOR_LOCAL_FULL_SONG_PRODUCTION_PROMPT.md` as its project rule and dedicated local launch prompt.
- The shared renderer remains `shared-animation-library/render.mjs` → Remotion. Its `package.json` and lockfile are included in the share package; `node_modules` is not. A recipient installs the pinned local dependencies with `npm ci` in the documented package directories. Chrome/Chromium and FFmpeg must also be available for the existing render/review workflow.
- The R01–R16 repository catalog and navigation atlas are included in the share package, but the full repository checkouts are not. A future production must rank all entries, accurately note which checkouts are absent, and fetch/deep-inspect only relevant candidates as the production requires. It must not claim to have read or locally held an upstream checkout that is not present.

## Grok Bot's role and local/cloud boundary

Grok Bot is a separate product from the Grok chat app. Current xAI documentation says eligible X Premium, Super and Ultra subscriptions include Grok Bot; confirm the friend's account screen because entitlements can vary by subscription and rollout. The desktop app's Bot normally works on its persistent cloud computer. That computer is separate from the Mac's local folders. Local command/file access is a distinct per-desktop setting under **Settings → Computer → Your computer → Execution on this computer**; the default is to ask for each command. Keep that approval mode for the first test. Do not assume that selecting the kit in Cursor grants Grok Bot access to it.

Grok Bot's desktop composer currently accepts audio attachments up to 250 MB each, along with documents, code and other files. This is an upload to a service, not proof the Bot heard or timed the recording. Only send the friend's sample audio, lyrics or brief to a cloud assistant if the friend is comfortable with that. For the local-first workflow, keep the inputs in `shared-inputs/` and let Cursor, Claude Code Local or Codex Local read them directly.

Cursor's own model picker currently lists Grok models alongside Claude, GPT and other models. That does not make the Grok Bot subscription the same thing as Cursor access, a Cursor account, or local-files permission. Check the model/usage shown in Cursor separately. No OAuth, Grok API key, Wikimedia account, or extra plugin is needed merely for Cursor to read this kit.

## Findings matrix

| Product | Good fit for this kit | Limits to preserve |
| --- | --- | --- |
| Cursor desktop + local Agent | Primary authoring, repository search, local Node/Remotion commands, saved code edits and production files | Requires Cursor account/model access and local Node, Chrome/Chromium, FFmpeg and installed project dependencies; a cloud agent is not the same as the local workspace |
| Grok Bot Desktop | Creative/research partner, browser research, attachment-based discussion, optional local command or file handoff | Cloud computer is default and separate; local execution is separately enabled and approved; paid-plan access does not prove the kit is installed or audio was analyzed |
| Claude Code Local | Full local production using the existing Claude-specific project instructions and prompt | Must select Local and open this kit; Claude project fields/settings are separate from files in the folder |
| Codex Local | Full local production using the existing Codex-specific prompt and root `AGENTS.md` | Must start a local task on the extracted kit; do not use Claude's app procedures |

## Evidence and limits

Inspected the active kit's root instructions, Cursor-related files, skill directories, the shared Remotion entry/runtime and quality-review package, current repository catalog/atlas, and the starter production fixture. The active kit is approximately 15 GB; most of that volume is installed dependencies, full upstream checkouts, generated production outputs and song material. The share package is deliberately curated and excludes those large or personal trees. The full repository copies remain in the original private kit.

Official references checked on 2026-10-30:

- [Cursor Rules and AGENTS.md](https://cursor.com/docs/rules)
- [Cursor Agent Skills](https://cursor.com/docs/skills)
- [Cursor Agent overview](https://docs.cursor.com/en/agent/overview)
- [Cursor models](https://docs.cursor.com/models/)
- [Grok Bot overview and plans](https://docs.x.ai/grok-bot/overview)
- [Grok Bot local execution and security](https://docs.x.ai/grok-bot/security)
- [Grok Bot computer and apps](https://docs.x.ai/grok-bot/computer-and-apps)
- [Grok Bot files and attachment limits](https://docs.x.ai/grok-bot/files-and-results)
- [Grok Bot settings](https://docs.x.ai/grok-bot/settings-and-notifications)
- [The Reddit video-generation example](https://www.reddit.com/r/GrokBot/comments/1xeaglb/tinkering_i_created_a_bot_that_generates_videos/)

The Reddit post is a single feature-video demonstration, not evidence of full-song audio analysis, an editable Remotion project, or this kit's archive/QA workflow. No app was installed or opened, no account was accessed, and no song was built or rendered in this research pass.
