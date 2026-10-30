// His Line v2 — cue access. Original code. Reads the cues_v2.json object passed to window.SCENE_INIT.
// Evidence labels: D detected pulse, M measured energy event, S Suno line start, E estimated word (provisional), U unverified.
HL.module('cues', ['lib'], HL => {
  const { clamp } = HL.m;
  const Q = HL.cue = { ready: false };
  Q.init = cues => {
    if (!cues || !cues.pulse || !cues.events || !cues.level || !cues.shots) throw new Error("cues_v2.json missing pulse/events/level/shots");
    Q.raw = cues; Q.pulses = cues.pulse.times_s; Q.ghost = cues.pulse.ghost_ticks_s; Q.period = cues.pulse.period_s;
    Q.lv = cues.level.values; Q.lvHop = cues.level.hop_s; Q.ev = cues.events;
    Q.shotById = Object.fromEntries(cues.shots.map(s => [s.id, s])); Q.ready = true;
  };
  Q.event = k => { const e = Q.ev[k]; if (!e) throw new Error(`no cue event '${k}'`); return e.t !== undefined ? e.t : e; };
  // low-band level 0..1 (coarse, 0.1 s hop, linear interpolation): lamp/density only, never for timing
  Q.level = t => { const x = clamp(t / Q.lvHop, 0, Q.lv.length - 1.001), i = Math.floor(x), f = x - i; return Q.lv[i] * (1 - f) + Q.lv[i + 1] * f; };
  Q.nearestPulse = t => Q.pulses.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a);
  Q.pulsesIn = (a, b) => Q.pulses.filter(p => p >= a && p < b);
  Q.ghostIn = (a, b) => Q.ghost.filter(p => p >= a && p < b);
  Q.line = i => { const l = Q.raw.lines_S[i - 1]; if (!l) throw new Error(`no line ${i}`); return l.t; };
});
