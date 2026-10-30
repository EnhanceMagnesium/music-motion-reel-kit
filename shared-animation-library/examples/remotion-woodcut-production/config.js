// TECHNICAL FIXTURE for the shared Remotion woodcut adapter (shared-animation-library/adapters/remotion/woodcut/).
// Synthetic, 3 seconds, no recording, fonts, images or song story. Not a finished song and not approved art.
// Default frame is 4:5 (1080x1350). The 9:16 case (1080x1920) is exercised by overriding width/height in the checks' input props, not by a second copy.
const PROJECT = {
  productionId: 'remotion-woodcut-fixture',
  renderEngine: 'remotion',
  width: 1080,
  height: 1350,
  fps: 24,
  duration: 3,
  bpm: 120,          // normalizer default; this fixture schedules nothing on beats
  offset: 0,
  seed: 7,           // explicit stable project seed; scene seeds are derived from it
  sourceAudioOffsetSeconds: 0,
  remotion: {
    scenes: 'remotion/scenes.mjs',   // plain ESM, written without JSX so Node can load it for checks
    publicDir: 'public',
  },
  scenes: [
    { id: 'carve-a', impl: 'CarveA', start: 0, end: 1.5, params: { rayCount: 28 } },
    { id: 'carve-b', impl: 'CarveB', start: 1.5, end: 3, params: { rayCount: 18 } },
  ],
  cues: { entries: [{ id: 'fixture-mark', kind: 'accent', basis: 'production', seconds: 1.5, evidence: 'supplied' }] },
  assets: [],
  fonts: [],
};
