# Local vertical renderer

This is the rendering engine for the project for complete target-duration animation candidates. Claude Opus 5.5 may write or revise scenes; Node, Chrome, and FFmpeg turn the saved scene code and song specification into frames and an MP4. The four-second demo uses placeholder words and has no music.

## Start

The required software is installed on this Mac. From this directory:

```sh
npm install
```

After creating and preflighting the song-specific specification below, the detached song-render command prints the job's `status.json` and `render.log` paths. When it finishes, `video.mp4` appears beside them. The job keeps running separately from the Claude chat. A terminal can close or Claude usage can reset without changing the saved scene files or finished frames.

## How a song enters the renderer

Copy `specs/demo.json` to a song-specific JSON file. Set its audio path, duration, frame rate, 1080×1920 dimensions, palette, and scene time ranges. The audio path is relative to the JSON file. Keep the song master fixed once timecodes are set. The current starter draws three simple scene types—`title`, `dots`, and `orbit`—to prove the pipeline; Opus can add further scene functions for a chosen song.

Run a song-specific job with:

```sh
node render.mjs --spec=specs/your-song.json --preflight
node render.mjs --spec=specs/your-song.json --detach
```

Each specification and renderer-code version gets its own output directory. The renderer writes frames atomically and skips valid frames on restart. Re-run the second command to resume a stopped job. `status.json` reports progress; `render.log` records rendering or encoding errors. A live job has a lock file so a second process cannot write the same frames.

## Production order

1. Lock audio, lyrics, and the native 9:16 layout.
2. Select and measure the source excerpt for a 35–40-second video; keep every production export at or below 45 seconds. Plan its scene board and inspect stills.
3. Render the complete target-duration candidate, inspect its contact frames, and review full playback at phone size. Revise source in a fresh versioned job.
4. Complete all scenes within the selected excerpt; complete-duration candidates and revisions share the same export policy.
5. Verify the actual MP4 duration, audio excerpt alignment and frame coverage; deliver the finished vertical video.

This starter does not yet provide automatic beat or lyric alignment, complex character drawing, or platform-specific export presets. Those depend on the first song and its chosen visual direction.

## Excerpt and duration support

The current specification accepts audio, duration, fps and scene ranges. The audio input begins at its own time zero; mid-song playback requires a separate faithful excerpt file or a validated renderer extension for source offset. Preserve the original master and document that derivation. The engine renders ceil(duration × fps) frames; choose an integer frame count and duration equal to frames/fps so the hard cap remains exact after frame quantization. Inspect the encoded file’s actual duration before release. The existing four-second silent demo is a historical pipeline sample; new production follows the 35–40-second target.
