// scene-a.js: classic-script scene module. Registers a whole-frame painted scene through the production host's registerSceneImpl.
// draw(st) is a pure function of st (production time, local time, duration, params): no state survives between frames.
registerSceneImpl('field', {
  draw(st) {
    boilSeed('field');
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: window.NEUTRAL[st.params.bg], washOp: 255, ink: null });
    const k = st.localT / st.duration;                                   // 0..1 across the scene
    paint(ellPts(W / 2, H * (0.7 - 0.2 * k), 260 + 120 * k, 260 + 120 * k, 28, 6), { wash: PAL.cream, fill: PAL.ochre, fillOp: 90, ink: null });
  },
});
