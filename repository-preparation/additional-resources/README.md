# Additional animation resources installed locally

Prepared 2026-10-24 in the original `music-motion-reel-kit` folder connected to Claude. This is an isolated, optional resource set. It does not alter the default renderer or any song production.

## Installed resources

| Resource | Local path / version | License | Current state |
|---|---|---|---|
| Librosa | `repository-downloads/bizarro/evangelion/analysis/.venv` — 1.0.0, installed from the existing R07 `uv.lock` using Python 3.12.13 | ISC | Import resolved. The complete locked R07 analysis dependencies were installed. No audio was analyzed and no model weights were downloaded. |
| Fontsource | `javascript/node_modules/@fontsource/` — Archivo Black 5.2.8, EB Garamond 5.2.7, Inter 5.2.8, League Gothic 5.2.8, Noto Sans JP 5.2.9, Space Mono 5.2.9 | OFL-1.1 for each selected family | Packages and CSS resolve locally. They are optional assets; the renderer does not yet load them. Each package includes its license file. |
| Flubber | `javascript/node_modules/flubber` — 0.4.2 | MIT | Installed and its API resolves. No production adapter or scene callsite was added. |
| Lottie Web | `javascript/node_modules/lottie-web` — 5.13.0 | MIT | Installed. R04 also contains its own Lottie source adapter. No animation asset was added or played. |
| WhisperX | `whisperx/.venv` — 3.8.6, Python 3.12.13, PyTorch CPU index | BSD-2-Clause; model terms separate | Package imports. No transcript, song audio, alignment model, diarization model or Hugging Face token was used/downloaded. The first actual alignment will need model downloads and must be checked for singing. |
| glTF Sample Assets | `gltf-sample-assets/Models/RiggedSimple` at commit `8f492390ddc7a2ae221a1369ef560589cf8c70fb` | Model CC-BY-4.0; attribution: © 2017 Cesium, “Cesium for Everything” | Selective sparse checkout only. The glTF manifest is valid, references resolve, and it contains one animation and one skin. It is a technical fixture, not a cleared production asset. |
| Pixelmatch | `javascript/node_modules/pixelmatch` — 8.0.0, with `pngjs` 7.0.0 | ISC / MIT | Package imports and resolves. No image baseline or comparison was created. |

## Environment details

- `javascript/package.json` and `javascript/package-lock.json` pin the Node resources. Installed with `npm install --ignore-scripts --no-audit --no-fund`.
- `whisperx/pyproject.toml` and `whisperx/uv.lock` define an isolated Python environment. PyTorch and torchaudio resolve from the official CPU wheel index on macOS.
- R07's existing `analysis/pyproject.toml` and `analysis/uv.lock` remain unchanged. `uv sync --locked` created the ignored `analysis/.venv` at Python 3.12.13 and prepared its declared analysis stack, including Librosa, Demucs, MLX Whisper and Torch.
- The selected glTF fixture is a shallow sparse checkout of the upstream repository. It is not a complete copy of every Khronos sample model.
- Approximate added logical storage: JavaScript packages 118 MB; WhisperX environment 975 MB; R07 analysis environment 1.1 GB; glTF fixture 168 KB. These figures are directory logical sizes, not a guarantee of physical APFS usage.

## Scope and limits

The seven resources are installed or locally available for later, selective work. Their installation does not implement the missing portrait song template, kinetic-type adapter, character-rig adapters, 3D/camera/material compositing, recording-specific cue pipeline, sung-word correction workflow, or browser/visual/audio acceptance. Those require distinct implementation and review. WhisperX, Librosa and Pixelmatch were not run against a song or rendered frames.

The migration copy in Downloads was left unchanged. The install target is the original kit that the Claude local folder previously referenced.
