# Playwright headless Chrome smoke check — 2026-10-25

Purpose: verify that the isolated `playwright-core` dependency can launch this Mac's existing Chrome headlessly without opening or processing song media.

Command body: import `playwright-core` 1.63.0 from `shared-animation-library/quality-review/node_modules`, launch `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` with `headless: true`, set a tiny inline HTML page, read its title and `#state` text, and close Chrome.

Result: exit 0. Playwright reported Chrome `155.0.8059.86`; page result was title `Playwright headless smoke` and state `ready`.

This establishes a basic Playwright-to-local-Chrome launch on this environment. It does not exercise the MP4 review helper, video codec support, seeks, PNG capture, FFmpeg contact-sheet creation, Remotion composition rendering, song playback, synchronization or visual quality.
