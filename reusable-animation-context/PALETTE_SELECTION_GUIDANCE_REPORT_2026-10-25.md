# Palette selection guidance report (2026-10-25)

Scope: guidance wording only. No artwork, production code, tests, installs, browser, renders, stills, images, audio/video processing or settings were touched. No palette is claimed visually approved.

## Policy now expressed
1. Claude chooses each song's palette from that song's recording, lyrics, brief, theme, narrative and treatment, and explains the reasoning briefly before storyboarding.
2. No default to Claude's brand orange, a house palette or a prior song's colors. Orange is allowed with a song-specific rationale.
3. No routine swatch questions to the user. Make a reasoned, editable choice, recorded in that song's plan and config. Ask only if an essential input is missing or the consequence cannot be responsibly inferred.
4. Colors get roles (ground, ink, focal accent, lyric/type treatment, secondary detail). Contrast, hierarchy and readability are checked in rendered work and not claimed before images are reviewed.
5. Reference palettes are evidence about those references; borrow craft, create the song's own color direction.
6. Palette and creative decisions stay in the song's folder and conversation; never promoted to a studio-wide template.
7. Grok palette ideas come from text only, remain suggestions, and cannot be attributed to unheard musical details; Claude makes the final choice.

## Files changed (under )
- claude-finished-song-animation-project/01_PROJECT_DESCRIPTION_TO_PASTE.txt (short inline qualifier; 7,983 characters)
- claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt (short inline qualifier; 15,996 characters)
- claude-finished-song-animation-project/04_REUSABLE_PRODUCTION_STANDARD.txt (full policy)
- claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt (full policy)
- claude-finished-song-animation-project/06_ANIMATION_REFERENCE_CRAFT_GUIDE.txt (P2 note, selection step 5 with full policy, rule-set wording)
- claude-finished-song-animation-project/07_QUALITY_REVIEW_AND_ACCEPTANCE.txt (color review criterion)
- claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt (palette stays per song)
- CLAUDE.md, PROJECT_INSTRUCTIONS.md (the earlier bone/soot/night-blue/ember palette is now "history, not defaults"), CLAUDE_STEP_1_START_PROMPT.txt, GROK_ANIMATION_VIDEO_BRIEF.txt

Files 01 and 02 stay under their limits (counts are characters including spaces and line breaks, measured as Unicode characters; byte sizes are larger because of non-ASCII punctuation). Because their headroom was under 65 characters, they carry a compact qualifier; the full policy lives in 04, 05 and 06.

## Files left unchanged
None of the eleven authorized files was left unchanged.

## Will Not Fade source (read-only, code-level)
- Color literals encoded: `PAPER '#EFE8D8'` and `INK '#15110d'` in `remotion/scenes.mjs`, and `OXBLOOD '#7E1D17'` in `remotion/art/kit.mjs` (used as the print plate). `config.js` records the oxblood color plate as a creative decision.
- These are provisional, song-specific choices in the song's own folder. They could be mistaken for a universal palette only if copied; the guidance now says not to.
- The shared adapter (`shared-animation-library/adapters/remotion/woodcut/index.mjs`) holds upstream default constants (INK #111111, PAPER #EFE8D8, COPPER #C8502A, WOOD #D8C29C). These are generic adapter defaults, and the guidance says each song sets its own.
- Code values do not establish on-screen appearance. How the palette reads (contrast, hierarchy, lyric legibility, the oxblood plate's effect) needs visual review from GPT's planned stills. Nothing was revised.
