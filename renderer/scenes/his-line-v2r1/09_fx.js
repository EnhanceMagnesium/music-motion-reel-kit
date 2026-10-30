// His Line v2r1 — effects: registration state, the ember track, the seal, seeded sparks and motes. Original code.
// Guidance only (nothing copied): R03 silkscreen/risograph STYLE (kick, drift, snap into register), R01 core.js arcPt L64 (arc idea), R06 fx.mjs burstParticles (NOT adapted: it consumes a shared
// random stream with 5 draws per dead and 4 per live particle, so later particles change as earlier ones die). Here every constant is a per-index hash, so evaluation order and death cannot matter.
// Every function is a pure function of absolute time t (seconds). Ownership: the ember is SCREEN-owned in s05-s11 (X.ember.screen); the seal is WORLD-owned in s12 (X.seal).
HL.module('fx', ['lib', 'print', 'cam', 'hits'], HL => {
  const { clamp, lerp, seg, ss, eio, eo, ei, h2, hold } = HL.m, TAU = HL.m.TAU, F = f => f / HL.FPS, H = HL.hits, Q = HL.cue, C = HL.C;
  const X = HL.fx = {};

  // ---------------- registration (image plates) ----------------
  // magnitude (px) of the ghost impression's offset; direction DIR points up-right, opposite the lower-right cast shadows.
  const DIR = X.DIR = [1, -.6];
  X.regParts = t => {
    const kick = (id, amp, dur = .3, k = 12) => { const t0 = H.t(id); return t >= t0 && t <= t0 + dur ? amp * Math.exp(-(t - t0) * k) : 0; };
    const base = 3, k1 = kick('s01.line_lands', 10), k2 = kick('s05.cut', 10);
    const ds = H.byId['s11.drift_start'].action.declaredT, de = H.byId['s11.drift_end'].action.declaredT, tc = H.t('s12.contact');
    const drift = t >= ds && t < tc ? 18 * eio(seg(t, ds, de)) : 0;                       // loosening through the quiet line; snaps to 0 AT the contact frame
    return { base, kick: k1 + k2, drift, total: base + k1 + k2 + drift };
  };
  X.reg = t => { const a = X.regParts(t).total; return [a * DIR[0], a * DIR[1]]; };
  // s06: the double impression of the phrase collapses into register on the 's06.register' frame (primary impression is never offset)
  X.regText = t => 14 * (1 - seg(t, H.t('s06.register') - 3 / HL.FPS, H.t('s06.register')));

  // ---------------- ember (screen-owned s05-s11) ----------------
  let tE0 = 0, WP = [], track = null;
  X.init = () => { tE0 = H.t('s05.cut'); WP = [[tE0, [900, 300, 12]], [14.6, [880, 260, 14]], [16.77, [860, 300, 18]], [19.65, [850, 330, 20]], [22.91, [850, 310, 22]], [25.43, [840, 300, 24]], [28.31, [860, 300, 28]]]; X.ember.waypoints = WP; track = HL.m.track(WP); };
  X.EMBER_END = [700, 560, 46];
  const tArc0 = 28.31;
  X.emberEndT = () => F(HL.CUT_FRAMES[11] - 1);                // last s11 frame (frame 748): the frozen outgoing frame of the iris transition
  X.ember = {
    waypoints: WP,
    screen(t) {
      if (!track) throw new Error('HL.fx.init() has not run');
      const tArc1 = X.emberEndT(); let x, y, r;
      if (t < tE0 - 1e-9) return { x: WP[0][1][0], y: WP[0][1][1], r: WP[0][1][2], swell: 0, a: 0 };
      if (t <= tArc0) { [x, y, r] = track(t); }
      else {
        const u = clamp((t - tArc0) / (tArc1 - tArc0)), e = eio(u), p0 = WP[WP.length - 1][1], p1 = X.EMBER_END;
        x = lerp(p0[0], p1[0], e); y = lerp(p0[1], p1[1], e) - 90 * 4 * u * (1 - u); r = lerp(p0[2], p1[2], e);   // arc: lob peaking 90 px above the chord
      }
      return { x, y, r, swell: 3 * Q.pulseDecay(t, 7), a: 1 };
    },
  };
  // soft glow + disc with an upper-left highlight (light from the upper left). o: {glow, alpha}
  X.drawEmber = (g, t, o = {}) => {
    const e = X.ember.screen(t); if (e.a <= 0) return; const r = e.r + e.swell, k = o.glow ?? 1;
    g.save(); g.fillStyle = C.ember;
    g.globalAlpha = .10 * k * (o.alpha ?? 1); g.beginPath(); g.arc(e.x, e.y, r * 2.6, 0, TAU); g.fill();
    g.globalAlpha = .18 * k * (o.alpha ?? 1); g.beginPath(); g.arc(e.x, e.y, r * 1.7, 0, TAU); g.fill();
    g.globalAlpha = o.alpha ?? 1; g.beginPath(); g.arc(e.x, e.y, r, 0, TAU); g.fill();
    g.globalAlpha = .35 * (o.alpha ?? 1); g.fillStyle = '#ffd9b8'; g.beginPath(); g.arc(e.x - r * .3, e.y - r * .32, r * .32, 0, TAU); g.fill();
    g.restore();
  };

  // ---------------- seal (world-owned in s12) ----------------
  const CAM12 = X.CAM12 = { cx: 540, cy: 960, zoom: 1.5 };          // hover camera of s12, constant until the contact frame
  const R_WORLD = X.R_WORLD = 120, HOVER = [672, 532], HOVER_R = R_WORLD * CAM12.zoom, TOP_DY = -10, TOP_SCALE = 1.18;
  X.contactScreen = () => HL.cam.toScreen(CAM12, HL.DEED.x + HL.DEED.w / 2, HL.LINE_Y);   // deed centre on the line row, defined from the DEED, not from the seal
  X.seal = t => {
    const tc = H.t('s12.contact'), tS0 = H.t('s12.silence_start'), tTop = H.t('s12.lift'), tDrop = F(H.frame('s12.contact') - 2);
    const tA0 = X.emberEndT(), tA1 = 32.6, E = X.EMBER_END, C0 = X.contactScreen();
    const arr = ss(seg(t, tA0, tA1)), th = hold(t, [[tS0, tc, 0]]);                         // sway uses the held clock; every landing effect uses the real clock
    const sway = ss(seg(t, tA0 + .8, tA1)), swx = 8 * Math.sin(2.1 * th) * sway, swy = 10 * Math.sin(1.7 * th + 1) * sway;
    let px = lerp(E[0], HOVER[0], arr) + swx, py = lerp(E[1], HOVER[1], arr) + swy, rs = lerp(E[2], HOVER_R, arr), lift = .8 * arr, scale = 1, contact = t >= tc;
    if (t >= tS0 && t < tc) {
      const up = ss(seg(t, tS0, tTop)), dn = ei(seg(t, tDrop, tc)), topY = py + TOP_DY;
      const ux = px, uy = lerp(py, topY, up), us = lerp(1, TOP_SCALE, up);
      px = lerp(ux, C0[0], dn); py = lerp(uy, C0[1], dn); scale = lerp(us, 1, dn); lift = lerp(.8 + .2 * up, 0, dn);
    }
    const dt = Math.max(0, t - tc);
    let sx = 1, sy = 1, wx, wy;
    if (contact) { const b = 1 + .05 * Math.sin(30 * dt) * Math.exp(-9 * dt), sq = Math.exp(-12 * dt); scale = b; sx = 1 + .1 * sq; sy = 1 - .1 * sq; lift = 0; wx = HL.DEED.x + HL.DEED.w / 2; wy = HL.LINE_Y; px = C0[0]; py = C0[1]; }
    else { [wx, wy] = HL.cam.toWorld(CAM12, px, py); }
    const wr = (contact ? R_WORLD : rs / CAM12.zoom) * scale;
    const gloss = t < F(HL.hits.byId['s12.gloss_start'].action.frame) ? 1 : 1 - ss(seg(t, F(HL.hits.byId['s12.gloss_start'].action.frame), F(HL.hits.byId['s12.gloss_end'].action.frame)));
    return { screen: [px, py], rScreen: rs * scale, wx, wy, wr, sx, sy, lift: clamp(lift), gloss, detail: seg(rs, 70, 110), contact, dt };
  };
  // seal body drawn into a stamp buffer centred at (cx,cy) at screen scale k. d = ghost offset for the ring/line plate (px, screen). Light upper left: rim light top-left.
  X.drawSeal = (b, cx, cy, k, st, d) => {
    const R = st.wr * k;
    b.save(); b.translate(cx, cy);
    b.fillStyle = C.ember; b.beginPath(); for (let i = 0; i < 64; i++) { const a = i / 64 * TAU, r = R * (1 + (i % 2 ? .035 : 0)); b.lineTo(Math.cos(a) * r, Math.sin(a) * r); } b.closePath(); b.fill();
    const D = st.detail; if (D > 0) {
      b.save(); b.translate(d[0], d[1]); b.globalAlpha = D;
      b.strokeStyle = C.emberDeep; b.lineWidth = Math.max(2, 7 * k / 1.5); b.beginPath(); b.arc(0, 0, R * .86, 0, TAU); b.stroke();
      b.strokeStyle = 'rgba(231,223,204,.6)'; b.lineWidth = Math.max(1.5, 4 * k / 1.5); b.beginPath(); b.arc(0, 0, R * .7, 0, TAU); b.stroke();
      b.strokeStyle = 'rgba(231,223,204,.85)'; b.lineWidth = Math.max(2, 6 * k / 1.5); b.beginPath(); b.moveTo(-R * .5, 0); b.lineTo(R * .5, 0); b.stroke();
      for (let i = -2; i <= 2; i++) { b.beginPath(); b.moveTo(i * R * .22, -R * .08); b.lineTo(i * R * .22, R * .08); b.stroke(); }
      b.restore();
    }
    if (st.gloss > 0) { b.globalAlpha = .5 * st.gloss; b.fillStyle = '#fff'; b.beginPath(); b.ellipse(-R * .35, -R * .45, R * .28, R * .12, -.5, 0, TAU); b.fill(); }
    b.restore();
  };

  // ---------------- seeded sparks and motes (per-index hashed constants; analytic) ----------------
  X.sparkConst = (seed, i) => ({ a: h2(seed, i, 1) * TAU, v: 320 + 620 * h2(seed, i, 2), life: .45 + .7 * h2(seed, i, 3), size: 2.5 + 4 * h2(seed, i, 4), c: h2(seed, i, 5) });
  X.sparkAt = (seed, i, dt, grav = 700) => {
    const k = X.sparkConst(seed, i); if (!(dt >= 0) || dt > k.life) return null;
    const vx = Math.cos(k.a) * k.v, vy = Math.sin(k.a) * k.v;
    return { x: vx * dt, y: vy * dt + .5 * grav * dt * dt, vx, vy: vy + grav * dt, alpha: 1 - dt / k.life, size: k.size, c: k.c };
  };
  X.drawSparks = (g, t, t0, x, y, n, seed) => {
    const dt = t - t0; if (dt < 0 || dt > 1.3) return;
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const s = X.sparkAt(seed, i, dt); if (!s) continue; const vl = Math.hypot(s.vx, s.vy) || 1;
      g.globalAlpha = s.alpha; g.strokeStyle = s.c < .6 ? C.ember : C.bone; g.lineWidth = s.size * .6;
      g.beginPath(); g.moveTo(x + s.x, y + s.y); g.lineTo(x + s.x - s.vx / vl * s.size * 3, y + s.y - s.vy / vl * s.size * 3); g.stroke();
    }
    g.restore();
  };
  // motes: embers drifting inward toward a target (tx,ty), each on its own cycle; position is a closed form of t
  X.moteAt = (seed, i, t, tx, ty) => {
    const per = 3 + 3 * h2(seed, i, 1), ph = h2(seed, i, 2), u = ((t / per + ph) % 1 + 1) % 1, th = h2(seed, i, 3) * TAU + u * 1.4, rho = (240 + 360 * h2(seed, i, 4)) * (1 - u);
    return { x: tx + Math.cos(th) * rho, y: ty + Math.sin(th) * rho * .8, alpha: Math.sin(Math.PI * u) * .85, size: 2 + 3 * h2(seed, i, 5) };
  };
  X.drawMotes = (g, t, n, seed, tx, ty, amt = 1) => {
    g.save(); g.fillStyle = C.ember;
    for (let i = 0; i < n; i++) { const m = X.moteAt(seed, i, t, tx, ty); if (m.alpha <= .02 || amt <= 0) continue; g.globalAlpha = m.alpha * amt; g.beginPath(); g.arc(m.x, m.y, m.size, 0, TAU); g.fill(); }
    g.restore();
  };
});
