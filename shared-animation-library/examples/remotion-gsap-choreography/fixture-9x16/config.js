// Synthetic GSAP choreography fixture. No song, audio, sourced footage, or production art.
const PROJECT = {
  productionId: 'remotion-gsap-choreography-9x16',
  renderEngine: 'remotion',
  width: 1080,
  height: 1920,
  fps: 24,
  duration: 4,
  bpm: 120,
  offset: 0,
  seed: 1,
  sourceAudioOffsetSeconds: 0,
  remotion: { scenes: 'remotion/scenes.jsx', publicDir: 'public' },
  scenes: [
    { id: 'choreography-study', impl: 'ChoreographyStudy', start: 0, end: 4 },
  ],
  assets: [],
  fonts: [],
};
