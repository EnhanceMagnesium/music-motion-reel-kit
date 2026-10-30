const PROJECT = {
  productionId: 'remotion-neutral',
  renderEngine: 'remotion',
  width: 1080,
  height: 1920,
  fps: 24,
  duration: 8,
  bpm: 120,
  offset: 0,
  seed: 1,
  sourceAudioOffsetSeconds: 0,
  remotion: {
    scenes: 'remotion/scenes.jsx',
    publicDir: 'public',
  },
  scenes: [
    { id: 'opening', start: 0, end: 3.5, params: { label: 'Opening' } },
    { id: 'closing', start: 3.5, end: 8, params: { label: 'Closing' } },
  ],
  cues: {
    entries: [
      { id: 'fixture-mark', kind: 'accent', basis: 'production', seconds: 3.5, evidence: 'supplied' },
    ],
  },
  assets: [],
  fonts: [],
};
