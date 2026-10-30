# Remotion woodcut technical fixture

**Technical fixture only. Not a finished song, not approved art.** Three seconds (72 frames at 24 fps), no audio, fonts, images or story. Two synthetic scenes (`carve-a`, `carve-b`) use the shared adapter in `../../adapters/remotion/woodcut/`: seeded carved rays, a hand-cut border, stab flecks and a generic colour plate. It does not test full-song duration, sync, real assets or visual quality.

Default frame 1080×1350 (4:5). The 1080×1920 (9:16) case is exercised by overriding `width`/`height` in the input props (see `productions/will-not-fade/technical-review/woodcut_adapter_browser_check.mjs`), not by a second copy of the fixture. The scenes compose from `project.width/height`.

Registry: `remotion/scenes.mjs` (plain ESM, no JSX). Pure geometry: `remotion/fixture-geometry.mjs`. Scene params used by the checks: `drawDelayMs`, `failAtFrame`, `errorMode`.

No-media plan (Mac, installed dependencies): `node shared-animation-library/render.mjs --root=shared-animation-library/examples/remotion-woodcut-production --plan`
