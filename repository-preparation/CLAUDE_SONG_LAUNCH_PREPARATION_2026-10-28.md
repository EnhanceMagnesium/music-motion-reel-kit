# Claude project fields and song launch preparation — 2026-10-28

## Song inputs located

The new song appears to be **Chalk it up to White wellbeing, the Spirit of the West**. Its supplied files are in the active kit under a folder whose name ends with a space:

- `Chalk it up to White wellbeing, the Spirit of the West audio plus brief /Chalk it up to White wellbeing, the Spirit of the West.mp3`
- `Chalk it up to White wellbeing, the Spirit of the West audio plus brief /Chalk it up to White wellbeing, the Spirit of the West brief.txt`

The brief contains lyrics and a musical-style note. The originals were left untouched. No audio was analyzed or rendered.

## Prepared materials

- `CLAUDE_COMPOSER_LAUNCH_CHALK_IT_UP_2026-10-28.txt`: song-specific, full-production composer prompt, pointing to `productions/chalk-it-up-white-wellbeing-the-spirit-of-the-west/` and authorizing the complete in-scope workflow when submitted in an appropriate local Claude Code session.
- `../claude-finished-song-animation-project/01_PROJECT_DESCRIPTION_TO_PASTE.txt`: paste-ready Goal field, updated to include Remotion-frame-driven GSAP choreography.
- `../claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt`: paste-ready Instructions field, updated with exact MIA query logging and the installed GSAP adapter’s supported use.
- `../claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt`: corrected the obsolete statement that GSAP is unavailable.

Field counts include spaces and line breaks: Goal **7,979 / 8,000**; Project Instructions **15,948 / 16,000**.

Claude’s actual project fields were not changed. To apply the updated fields, paste the text from the two `*_TO_PASTE.txt` files into the Claude Project Goal and Project Instructions settings. Then start a new Code task in that project, choose Local with the active kit folder, and paste the song-specific composer prompt. No upload is needed because the files are already local.

## Verification and scope

- Verified the exact audio and brief paths exist.
- Verified the shared Remotion package manifest declares `@remotion/gsap` 4.0.538 and `gsap` 3.15.0, and the GSAP package directory exists. The reusable fixture report records the already completed non-song checks; no GSAP fixture was rerun here.
- Verified Goal and Project Instructions remain under their field limits.
- Checked the prompt, canonical launch prompt, and paste-ready fields for the stale “GSAP is not available” claim; none remains in those active files.
- No song production folder, source copies, scene code, archive media, stills or candidate video were created in this pass. No packages were installed; no Claude setting or Project Library was changed.
