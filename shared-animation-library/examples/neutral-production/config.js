// Neutral example production: shows the declaration contract (modules, scenes, cues, assets, fonts) with synthetic, song-free content.
// It is NOT a template to copy imagery from, and no recording exists for it: the cues below are labelled 'supplied' because this file supplies them.
// Times: scene start/end are PRODUCTION seconds; cue `seconds` here are SOURCE-recording seconds (sourceAudioOffsetSeconds = master time at excerpt start).
const PROJECT = {
  productionId: 'neutral-example',
  width: 1080, height: 1920, fps: 24, duration: 8, bpm: 120, offset: 0, seed: 7,
  sourceAudioOffsetSeconds: 12.5,
  modules: [
    { id: 'palette',  src: 'scenes/palette.js' },                                         // classic script: window.NEUTRAL
    { id: 'scene-a',  src: 'scenes/scene-a.js',  requires: ['palette'] },                 // classic script: registerSceneImpl('field', ...)
    { id: 'scene-b',  src: 'scenes/scene-b.mjs', type: 'module', requires: ['palette'] }, // ES module: exports scenes {critter-hop}; imports the R06 rig adapter
  ],
  scenes: [
    { id: 'opening', impl: 'field',       start: 0,   end: 3.5, needs: ['scene-a'], params: { bg: 'sky' } },
    { id: 'hop',     impl: 'critter-hop', start: 3.5, end: 8,   needs: ['scene-b'], params: { bg: 'sap' } },
  ],
  cues: { schemaVersion: 1, entries: [
    { id: 'accent-1', kind: 'accent', basis: 'source', seconds: 16.0, evidence: 'supplied' },    // production 3.5 s
    { id: 'accent-2', kind: 'accent', basis: 'source', seconds: 18.5, evidence: 'supplied' },    // production 6.0 s
    { id: 'phrase-1', kind: 'section', basis: 'production', seconds: 3.5, endSeconds: 8, evidence: 'inferred' },
  ] },
  assets: [],
  fonts: [],
};
