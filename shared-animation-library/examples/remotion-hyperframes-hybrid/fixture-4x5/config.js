// Synthetic integration fixture only: four-second comparison, no song/audio or production art.
const PROJECT = {
  productionId: 'remotion-hyperframes-hybrid-4x5',
  renderEngine: 'remotion',
  width: 1080,
  height: 1350,
  fps: 24,
  duration: 4.8,
  bpm: 120,
  offset: 0,
  seed: 1,
  sourceAudioOffsetSeconds: 0,
  remotion: { scenes: 'remotion/scenes.mjs', publicDir: 'public' },
  scenes: [
    { id: 'direct', impl: 'DirectOrbit', start: 0, end: 2.4 },
    { id: 'hybrid', impl: 'HyperFramesOrbit', start: 2.4, end: 4.8 },
  ],
  assets: [],
  fonts: [],
};

