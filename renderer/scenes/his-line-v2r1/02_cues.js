// His Line v2r1 — cue access and typed target records. Original code. Reads the cues_v2.json object passed to window.SCENE_INIT.
// Evidence labels: D detected pulse, M measured energy event, I inferred ghost tick (cue file label "D,U"), S supplied line start (Suno subtitle, approximate),
// E estimated word (provisional). U is an uncertainty annotation (listening / event identity), not a type. listeningVerified is false for every record (no listening verification exists).
// v2r1: Q.resolve(ref) maps a reference such as 'D:8', 'I:9', 'M:energy_return', 'M:low_energy_interval.t1', 'M:vocal_groups_after_return[0]', 'S:3', 'E:westman_line.t0'
// to the ORIGINAL record in its own collection (pulse.times_s, pulse.ghost_ticks_s, events, lines_S, words_E) and normalizes evidence when per-item fields are absent.
HL.module('cues', ['lib'], HL => {
  const { clamp } = HL.m;
  const Q = HL.cue = { ready: false };
  const fin = (x, what) => { if (!Number.isFinite(x)) throw new Error(`cue ${what}: non-finite time ${x}`); return x; };
  Q.init = cues => {
    if (!cues || !cues.pulse || !cues.events || !cues.level || !cues.shots || !cues.lines_S || !cues.words_E) throw new Error("cues_v2.json missing pulse/events/level/shots/lines_S/words_E");
    Q.raw = cues; Q.pulses = cues.pulse.times_s; Q.ghost = cues.pulse.ghost_ticks_s; Q.period = cues.pulse.period_s;
    Q.lv = cues.level.values; Q.lvHop = cues.level.hop_s; Q.ev = cues.events;
    Q.shotById = Object.fromEntries(cues.shots.map(s => [s.id, s])); Q.ready = true;
  };
  // typed target record; throws on unknown type, missing id, non-finite time, or inconsistent collection reference
  Q.resolve = ref => {
    const m = /^([DISME]):(.+)$/.exec(String(ref)); if (!m) throw new Error(`cue ref '${ref}': unknown type or format`);
    const [, type, id] = m, c = Q.raw; let t, src, ev, U = false;
    if (type === 'D') { const i = +id; if (!Number.isInteger(i) || i < 0 || i >= c.pulse.times_s.length) throw new Error(`cue ref '${ref}': no pulse index`); t = c.pulse.times_s[i]; src = `pulse.times_s[${i}]`; ev = c.pulse.ev || 'D'; }
    else if (type === 'I') { const i = +id; if (!Number.isInteger(i) || i < 0 || i >= c.pulse.ghost_ticks_s.length) throw new Error(`cue ref '${ref}': no ghost tick index`); t = c.pulse.ghost_ticks_s[i]; src = `pulse.ghost_ticks_s[${i}]`; ev = c.pulse.ghost_ev || 'D,U'; U = /U/.test(ev); }
    else if (type === 'S') { const l = c.lines_S.find(x => x.id === +id); if (!l) throw new Error(`cue ref '${ref}': no supplied line id`); t = l.t; src = `lines_S[id=${id}].t`; ev = l.ev || 'S'; }
    else if (type === 'E') { const mm = /^([a-z_]+)\.t([01])$/.exec(id); if (!mm) throw new Error(`cue ref '${ref}': expected E:<id>.t0|t1`); const w = c.words_E.find(x => x.id === mm[1]); if (!w) throw new Error(`cue ref '${ref}': no estimated word`); t = w.t[+mm[2]]; src = `words_E[id=${mm[1]}].t[${mm[2]}]`; ev = w.ev || 'E'; U = /U/.test(ev); }
    else { // M
      const mm = /^([a-z_]+)(?:\.(t0|t1)|\[(\d+)\])?$/.exec(id); if (!mm) throw new Error(`cue ref '${ref}': bad event reference`);
      const e = c.events[mm[1]]; if (!e) throw new Error(`cue ref '${ref}': no event '${mm[1]}'`);
      if (mm[2]) { if (typeof e[mm[2]] !== 'number') throw new Error(`cue ref '${ref}': event has no ${mm[2]}`); t = e[mm[2]]; src = `events.${mm[1]}.${mm[2]}`; }
      else if (mm[3] !== undefined) { if (!Array.isArray(e.t) || e.t[+mm[3]] === undefined) throw new Error(`cue ref '${ref}': event has no array element ${mm[3]}`); t = e.t[+mm[3]]; src = `events.${mm[1]}.t[${mm[3]}]`; }
      else { if (typeof e.t !== 'number') throw new Error(`cue ref '${ref}': event time is not a scalar (use .t0/.t1 or [i])`); t = e.t; src = `events.${mm[1]}.t`; }
      ev = e.ev || 'M'; U = e.content === 'U' || /word identity U/.test(e.note || '');
    }
    return { ref, type, t: fin(t, ref), source: src, evidence: ev, uncertain: U, listeningVerified: false };
  };
  Q.event = k => { const e = Q.ev[k]; if (!e) throw new Error(`no cue event '${k}'`); return e.t !== undefined ? e.t : e; };
  // low-band level 0..1 (coarse, 0.1 s hop, linear interpolation; it fluctuates with the low-band pulses): lamp/density only, never for timing
  Q.level = t => { const x = clamp(t / Q.lvHop, 0, Q.lv.length - 1.001), i = Math.floor(x), f = x - i; return Q.lv[i] * (1 - f) + Q.lv[i + 1] * f; };
  Q.nearestPulse = t => Q.pulses.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a);
  Q.lastPulse = t => { let r = null; for (const p of Q.pulses) { if (p <= t) r = p; else break; } return r; };
  Q.pulseDecay = (t, k = 12) => { const p = Q.lastPulse(t); return p === null ? 0 : Math.exp(-(t - p) * k); };   // 1 on a detected pulse, decays after
  Q.pulsesIn = (a, b) => Q.pulses.filter(p => p >= a && p < b);
  Q.ghostIn = (a, b) => Q.ghost.filter(p => p >= a && p < b);
  Q.line = i => { const l = Q.raw.lines_S[i - 1]; if (!l) throw new Error(`no line ${i}`); return l.t; };
});
