# Windows setup and compatibility for Cursor

Status: source-based guidance, **not yet verified by a Windows render**. Cursor may run in Windows PowerShell, Command Prompt, Git Bash, WSL (Linux), a remote machine or cloud. Identify the agent's own shell and filesystem before installing anything or making a song. Keep all dependencies for a run in the same environment; a Windows Chrome path does not work as a Linux executable in WSL. Choose native Windows or WSL deliberately and report which one is in use.

## What to expect from these apps

Cursor documents that its agent uses the first available terminal profile by default; PowerShell is a useful Windows starting example, but the chosen profile and workspace determine the actual shell. See https://cursor.com/docs/agent/overview. Grok Bot normally works on a separate cloud computer, whose hosted environment runs Linux; local Windows commands require local-computer access to be enabled and approved under that app's policy. See https://docs.x.ai/grok-bot/faq and https://docs.x.ai/grok-bot/deployment. A Windows desktop app alone therefore does not establish where the Bot's shell or files live. Verify the actual session and route before work.

## Recommended Cursor terminal profile

For a native Windows Cursor workspace, start with **PowerShell** (the installed PowerShell profile, including Windows PowerShell if that is what the computer provides). The examples in this guide use PowerShell syntax. No separate PowerShell installation or administrator shell is required merely to select it.

In Cursor, press `Ctrl+Shift+P`, search for `Terminal: Select Default Profile`, select **PowerShell**, and open a new terminal. Cursor documents that its agent uses the first available terminal profile by default: https://cursor.com/docs/agent/overview. Ask Cursor to identify and verify the shell and operating system used by its own commands; the interactive terminal profile alone does not establish that a remote, WSL, cloud or separately routed agent runs in Windows. If PowerShell is unavailable or restricted, report the exact issue and use the available shell with appropriate command syntax; do not change Windows execution policies as a routine setup step. Grok Bot has its own cloud/local execution settings and must check its environment separately.

## Get the kit

Open Cursor's terminal and ask the agent to check `git --version`. Install Git for Windows from https://git-scm.com/downloads/win if missing, with your approval; reopen Cursor after installation. In the folder where you want the kit, run:

```powershell
git clone --recurse-submodules https://github.com/EnhanceMagnesium/music-motion-reel-kit.git
cd music-motion-reel-kit
```

A private repository requires account access; a public one does not. A downloaded ZIP does not populate the 16 Git submodules. The source trees live at pinned upstream commits and require network access. To obtain the large files in the R04 HyperFrames checkout, check `git lfs version`; if Git LFS is installed run `git -C repository-downloads/heygen-com/hyperframes lfs pull`. If it is missing, ask before installing from https://git-lfs.com/. Record failures instead of assuming all files downloaded.

## Identify the execution environment

In Cursor's PowerShell terminal run:

```powershell
Get-Location
node -p "process.platform + ' ' + process.arch"
git --version
node --version
npm --version
ffmpeg -version
ffprobe -version
```

`win32` indicates native Windows Node; `linux` indicates Linux, such as WSL or a remote environment. If Node is missing, the Node command will fail; check the active terminal profile and location before deciding. In a Linux shell use `pwd`, `uname -s`, `uname -m` and the same version commands instead. Cursor's terminal and the agent's execution tool may differ: have Cursor run and report its own fingerprint and kit path. If Grok Bot is used for local work, have it separately identify its execution environment and actual folder access; if it lacks a shell, report that boundary rather than assuming the Windows or Cursor environment. No operating system is inferred from the computer alone.

## Prepare the runtime

The shared Remotion runtime and review helper are isolated Node projects with lockfiles; installed Mac `node_modules` are not portable. Read `shared-animation-library/remotion-runtime/README.md` and `shared-animation-library/quality-review/README.md`. Check the Node engine requirements in their current manifests and lockfiles; use a compatible Node version in the selected environment. After inspecting the manifests and with installation approval, from the kit root install each package in its own directory:

```powershell
npm ci --prefix shared-animation-library/remotion-runtime
npm ci --prefix shared-animation-library/quality-review
```

These may require network access and platform-specific dependencies. Report errors instead of claiming Windows readiness. The legacy p5 route has its own dependencies; new songs use Remotion. Use separately installed `ffmpeg` and `ffprobe` in the same environment; Playwright review uses FFmpeg for its contact sheet. The helper uses `playwright-core` and an existing Chrome/Chromium; it does not install a browser.

## Select Chrome on native Windows

The shared Remotion renderer and Playwright helper currently search explicit overrides plus Mac/Linux default paths; they do not automatically enumerate standard Windows Chrome locations. Find the actual `chrome.exe`, then set `CHROME_EXECUTABLE` in the same PowerShell session that runs the agent's commands. For example, **only if this path exists**:

```powershell
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
Test-Path $chrome
$env:CHROME_EXECUTABLE = $chrome
```

Check the value in the agent's own shell. The setting above lasts for that terminal session; it does not configure other sessions. Alternatively pass the supported `--chrome` argument with the actual path when the relevant command supports it. In WSL use a Linux browser executable available inside WSL, and validate that setup independently. System Chrome with Playwright is a project choice, not a guaranteed browser-protocol or video-codec match.

## Evidence and first run

1. Read `CURSOR_LOCAL_FULL_SONG_PRODUCTION_PROMPT.md`, `PROJECT_INSTRUCTIONS.md`, the two runtime/review READMEs and the repository navigation atlas. An agent must read actual sources and record what it used.
2. Confirm the clone contains the submodule checkouts (`git submodule status --recursive`), the expected source paths, and the required local dependencies. `git lfs pull` is a separate check for R04 large assets.
3. When a real song production and its config exist, use the shared `node shared-animation-library/render.mjs --root=productions/<song> --plan` command from the kit root, replacing `<song>` with the actual folder name. It is a no-media plan; success does not prove browser, codec or rendering compatibility. The shared GitHub copy intentionally contains no song productions, so there is no pre-existing song root to plan.
4. Only when rendering is authorized, use a small, non-overwriting risk-based still check, then the authorized candidate render and Playwright/FFmpeg review. Record exact commands, OS, Node, browser, FFmpeg versions, output and failures. Review full playback with sound and lyric sync separately. A plan or installed dependency is not a successful render.
5. Save Windows findings in a new local report. Propose general fixes for the shared kit and keep song evidence in its production folder. Do not assume macOS paths, bundled Mac binaries or a previous Mac success demonstrate Windows compatibility.

Consult the `README.md` and `repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md` for the full source and licensing context. Grok Bot's suggestions do not establish access to the local clone or prove that a tool ran.
