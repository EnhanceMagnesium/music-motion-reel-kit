When a song's lyrics are intended to be heard without on-screen text, or a tool cannot produce the requested lyric display, follow the audible-lyrics visual treatment in `PROJECT_INSTRUCTIONS.md`: preserve the master and lyric input, when captions are requested, display the remaining lines supported by the active workflow if only some lines cannot be shown; use kinetic visual storytelling, preserve supplied words, note any unverified playback or sync, and follow the active tool's requirements. Honor an explicit no-caption direction.

User-authored lyrics in `shared-inputs/<song>/lyrics.txt` or another supplied path are final input: preserve the file and its words unless explicitly asked to edit them. Follow the user-authored lyrics and local execution section of `PROJECT_INSTRUCTIONS.md`.

Windows users: read [Windows setup and compatibility](WINDOWS_SETUP_AND_COMPATIBILITY.md), verify this agent’s actual OS and browser path, and record Windows readiness evidence.

# Cursor Local — one-prompt full-song production

Use this prompt in Cursor Agent after opening the extracted animation-kit folder as the **local workspace**. Create `shared-inputs/<song>/` if needed, then put the recording, approved lyrics and optional brief there. Other user-supplied paths or attachments are also supported. A GitHub source clone does not include song inputs or outputs. Replace the three input names below if needed.

```text
Produce a complete, original, code-animated song film in this local kit using the supplied inputs:

- Recording: shared-inputs/<song>/<audio filename>
- Lyrics: shared-inputs/<song>/<lyrics filename>
- Brief: shared-inputs/<song>/<brief filename> (optional)

This message authorizes the local, reversible stages described below through one finished full-song candidate, post-render QA, up to two focused correction rounds and a durable handoff. Do not ask me again for routine aspect, palette, typography, storyboard or implementation choices. Do not publish or send the result externally.

First confirm that this Cursor task is operating in the local extracted kit and can run the local Node, browser and FFmpeg tools. Read `AGENTS.md`, `PROJECT_INSTRUCTIONS.md`, this prompt's linked guides, both shared-library READMEs, and the current source catalog/atlas. If this task is cloud-hosted or lacks a required local tool, report the exact boundary before attempting a render; do not claim it can see a folder merely because that path is in a message.

Keep all work for this song in a new `productions/<song-slug>/` folder. Never edit an existing song or shared renderer for this production. Preserve the supplied master byte-for-byte. Measure its audio-stream duration and use the whole recording. Choose 4:5 or 9:16 from this song's needs; choose and explain a song-specific palette without defaulting to Claude orange, a house palette or prior-song colors.

Before scene code:
1. Rank every R01–R16 catalog entry against actual scene needs. Use the atlas, identify which full checkouts are and are not present, and inspect exact source bodies/dependencies/licenses only for likely candidates. Record exact paths inspected and trace any selected mechanism to a song-local helper or scene call site. Assess the installed R14–R16 skills selectively. Consult R12/Skillry separately from code repositories and footage sources.
2. Search the Moving Image Archive, Wikimedia Commons and Internet Archive/Prelinger as separate footage tracks. Follow their current guides, preview selected material, retain provenance and rights evidence, and don't call a source inspected when only its index was read. If rights or a source-specific helper blocks selection, document the issue accurately; do not bypass safeguards or substitute an unrelated clip.
3. Complete both pre-code storyboard layers: one exact coverage row per second of the measured master, including the final partial second, plus original SVG panels for distinct setups and meaningful action changes. Panels show entry, development and payoff; do not force a cut or drawing every second.
4. Build a scene plan in which code-authored subjects and actions carry meaningful story progression. Track footage screen-time separately from its frame footprint. Footage can remain clear and prominent where the shot needs it; compose code-led action around it so the film is not just a succession of large footage plates.

Implement the song through `shared-animation-library/render.mjs` and the shared Remotion route. Remotion owns the frame clock, master audio, complete composition and final encoding. Choose React/SVG/Canvas/WebGL/GSAP or an eligible HyperFrames child only where it serves the scene and follows the local Remotion contract. Keep frame evaluation deterministic, seeded and safe under arbitrary seek order; clean up graphics resources. Do not create a separate renderer or per-song dependency set.

Run the no-media `--plan`, save exact commands/results, then render a compact risk-based pre-export still set and inspect the originals at full and phone size. If the plan and still review are ready, render the entire measured song to a new, non-overwriting candidate path. Run the installed Playwright review and FFmpeg contact sheet; inspect original captured frames. Review full normal-speed playback with sound if this local task can actually play it. Keep decoding, visual sampling, motion, timing/sync, playback and creative acceptance as separate evidence. Do not claim listening, sync or acceptance that did not occur.

Correct only concrete evidence-supported defects, no more than two focused rounds. Save all plans, storyboard, research, manifests, code, assets, logs, stills, candidate, QA, report and checkpoint inside this song's folder. Do not overwrite old work. Finish with the candidate/checkpoint paths, measured audio duration, aspect/dimensions/fps, frame count, render/QA outcomes, source provenance, corrections and remaining unverified items.
```
