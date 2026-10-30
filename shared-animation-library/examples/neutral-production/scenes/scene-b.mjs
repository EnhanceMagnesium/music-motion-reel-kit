// scene-b.mjs: ES-module scene module. Exports `scenes` {implId: impl}; the host registers them. Demonstrates the R06 critter rig adapter:
// the rig is created once at module load (pure data), drawn on the overlay layer from the scene-local clock, so it is seekable at any timestamp.
import { createCritterRig } from '../../../adapters/r06-critter-rig.mjs';

const rig = createCritterRig({
  gaitRate: 16,
  poseTrack: [                                                          // SCENE-LOCAL seconds (this scene lasts 4.5 s)
    { t: 0.0, face: 'normal', run: true, color: '#D97757' },
    { t: 1.8, crouch: 0 },
    { t: 2.1, crouch: 1, run: false, face: 'focus' },                   // wind-up
    { t: 2.5, crouch: 0, sq: 0.8, air: true, face: 'surprised', rot: 0 },
    { t: 3.1, sq: 1, rot: 6.283185307179586, air: true },               // one full tumble
    { t: 3.4, sq: 1.25, air: false, face: 'happy', arms: 'up', rot: 6.283185307179586 },
    { t: 4.5, sq: 1, face: 'happy', arms: 'up' },
  ],
});

export const scenes = {
  'critter-hop': {
    draw(st) {
      boilSeed('hop');
      paint(rectPts(-60, -60, W + 120, H + 120), { wash: window.NEUTRAL[st.params.bg], washOp: 255, ink: null });
    },
    // native screen pixels, above the grain: x travels left to right over the scene, feet on y = 1500, scale 2.2
    overlay(ctx, st) {
      rig.draw(ctx, st, { x: (s) => 140 + 800 * (s.localT / s.duration), groundY: 1500, scale: 2.2 });
    },
  },
};
