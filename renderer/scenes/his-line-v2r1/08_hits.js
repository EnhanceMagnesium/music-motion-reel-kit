// His Line v2r1 — hit table: every cut and landing, keyed to a DECLARED cue target. Original code.
// Convention: nearest-frame contact. contactFrame = round(24 * targetT); residual = contactFrame/24 - targetT (ms); the continuous target time is preserved in the resolved record.
// A hit is {id, shot, ref, leadFrames, frame} (on target) or {id, shot, ref, leadFrames, action:{declaredT, frame, reason}} (a deliberate action offset from its governing cue).
// `ref` points into the ORIGINAL cue collection (see 02_cues.js Q.resolve): D pulse.times_s, I pulse.ghost_ticks_s (inferred, label "D,U"), M events, S lines_S, E words_E.
// Frame alignment verifies alignment to that record only; it does not verify an inferred pulse, an estimated word or a lyric association (listeningVerified is false everywhere;
// the 32.91 s event is an energy return whose word identity is U).
// Validation recomputes frame, contact time and residual from the record; stored `frame` values are intentions that must match, and there is no blanket waiver for off-target actions:
// an action is validated against its OWN declaredT (frame === round(24*declaredT), half-frame bound) and its offset from the governing cue is reported separately.
HL.module('hits', ['core', 'cues'], HL => {
  const FPS = HL.FPS, HALF_MS = 500 / FPS + 1e-6;
  const HITS = [
    { id: 's01.line_lands', shot: 's01', ref: 'D:0', leadFrames: 9, frame: 10, note: "bead lands the hairline; crash-in and plate kick on this frame" },
    { id: 's01.band1', shot: 's01', ref: 'D:2', leadFrames: 7, frame: 28, note: "dot band 1 complete" },
    { id: 's01.band2', shot: 's01', ref: 'D:4', leadFrames: 7, frame: 45, note: "dot band 2 complete" },
    { id: 's01.band3', shot: 's01', ref: 'D:6', leadFrames: 7, frame: 63, note: "dot band 3 complete" },
    { id: 's02.cut', shot: 's02', ref: 'D:8', leadFrames: 0, frame: 80, note: "hard cut" },
    { id: 's02.edge1', shot: 's02', ref: 'D:9', leadFrames: 8, frame: 89, note: "pen edge 1 lands" },
    { id: 's02.edge2', shot: 's02', ref: 'D:10', leadFrames: 8, frame: 98, note: "pen edge 2 lands" },
    { id: 's02.edge3', shot: 's02', ref: 'D:11', leadFrames: 8, frame: 107, note: "pen edge 3 lands" },
    { id: 's02.edge4', shot: 's02', ref: 'D:12', leadFrames: 8, frame: 115, note: "pen edge 4 lands" },
    { id: 's02.fill', shot: 's02', ref: 'D:13', leadFrames: 6, frame: 124, note: "deed paper lands" },
    { id: 's02.label', shot: 's02', ref: 'D:14', leadFrames: 6, frame: 133, note: "label scrap lands" },
    { id: 's02.rule', shot: 's02', ref: 'D:15', leadFrames: 7, frame: 142, note: "rule lands" },
    { id: 's02.lift', shot: 's02', ref: 'D:16', leadFrames: 7, action: { declaredT: 6.2083, frame: 149, reason: "deed lift completes on the last s02 frame (149), one frame before the s03 cut on pulse 16 (frame 150)" }, note: "deed lift completes; shadow reaches its widest" },
    { id: 's03.cut', shot: 's03', ref: 'D:16', leadFrames: 0, frame: 150, note: "hard cut" },
    { id: 's03.plaque', shot: 's03', ref: 'E:civic_chamber.t0', leadFrames: 6, frame: 158, note: "plaque lands (estimated word start; E)" },
    { id: 's03.course0', shot: 's03', ref: 'I:0', leadFrames: 7, frame: 159, note: "courses 0 and 1 complete" },
    { id: 's03.course1', shot: 's03', ref: 'I:1', leadFrames: 7, frame: 168, note: "course 2" },
    { id: 's03.course2', shot: 's03', ref: 'I:2', leadFrames: 7, frame: 176, note: "course 3" },
    { id: 's03.course3', shot: 's03', ref: 'I:3', leadFrames: 7, frame: 185, note: "courses 4 and 5" },
    { id: 's03.course4', shot: 's03', ref: 'I:4', leadFrames: 7, frame: 193, note: "course 6" },
    { id: 's03.course5', shot: 's03', ref: 'I:5', leadFrames: 7, frame: 203, note: "course 7" },
    { id: 's03.course6', shot: 's03', ref: 'I:6', leadFrames: 7, frame: 211, note: "courses 8 and 9" },
    { id: 's03.course7', shot: 's03', ref: 'I:7', leadFrames: 7, frame: 220, note: "course 10" },
    { id: 's03.course8', shot: 's03', ref: 'I:8', leadFrames: 7, frame: 229, note: "course 11 (top); wall complete" },
    { id: 's04.cut', shot: 's04', ref: 'I:9', leadFrames: 0, frame: 237, note: "cut on the ghost tick record (cue row 9.89 is a different value); UPON starts dropping" },
    { id: 's04.word2', shot: 's04', ref: 'I:10', leadFrames: 6, frame: 246, note: "THE starts dropping" },
    { id: 's04.word3', shot: 's04', ref: 'I:11', leadFrames: 6, frame: 254, note: "WALL starts dropping" },
    { id: 's04.hold', shot: 's04', ref: 'M:energy_minimum', leadFrames: 0, frame: 277, note: "sample-and-hold of selected channels starts (measured energy minimum)" },
    { id: 's05.cut', shot: 's05', ref: 'M:reentry', leadFrames: 6, frame: 289, note: "line complete, ground flip, kick, flash, ember spark on this frame; the bead travels through s04 (lead)" },
    { id: 's05.edge1', shot: 's05', ref: 'D:20', leadFrames: 8, frame: 298, note: "deed edge 1 lands" },
    { id: 's05.edge2', shot: 's05', ref: 'D:21', leadFrames: 8, frame: 307, note: "deed edge 2 lands" },
    { id: 's05.edge3', shot: 's05', ref: 'D:22', leadFrames: 8, frame: 316, note: "deed edge 3 lands" },
    { id: 's05.punch', shot: 's05', ref: 'D:23', leadFrames: 0, frame: 324, note: "punch-in" },
    { id: 's06.cut', shot: 's06', ref: 'D:26', leadFrames: 0, frame: 350, note: "hard cut; THE lands" },
    { id: 's06.word2', shot: 's06', ref: 'D:27', leadFrames: 0, frame: 359, note: "WESTMAN’S lands" },
    { id: 's06.word3', shot: 's06', ref: 'D:28', leadFrames: 0, frame: 368, note: "LINE lands" },
    { id: 's06.register', shot: 's06', ref: 'D:31', leadFrames: 3, frame: 394, note: "double impression collapses into register (first fix)" },
    { id: 's07.cut', shot: 's07', ref: 'D:32', leadFrames: 0, frame: 402, note: "cut" },
    { id: 's07.marker', shot: 's07', ref: 'S:4', leadFrames: 0, frame: 404, note: "reading marker starts (supplied line 4 start)" },
    { id: 's08.cut', shot: 's08', ref: 'D:40', leadFrames: 0, frame: 472, note: "cut" },
    { id: 's09.cut', shot: 's09', ref: 'D:49', leadFrames: 0, frame: 550, note: "cut" },
    { id: 's09.o1', shot: 's09', ref: 'D:50', leadFrames: 0, frame: 558, note: "outline 1" },
    { id: 's09.o2', shot: 's09', ref: 'D:51', leadFrames: 0, frame: 567, note: "outline 2" },
    { id: 's09.o3', shot: 's09', ref: 'D:52', leadFrames: 0, frame: 576, note: "outline 3" },
    { id: 's09.o4', shot: 's09', ref: 'D:53', leadFrames: 0, frame: 584, note: "outline 4" },
    { id: 's09.o5', shot: 's09', ref: 'D:54', leadFrames: 0, frame: 593, note: "outline 5" },
    { id: 's09.o6', shot: 's09', ref: 'D:55', leadFrames: 0, frame: 602, note: "outline 6" },
    { id: 's10.cut', shot: 's10', ref: 'D:56', leadFrames: 0, frame: 610, note: "cut" },
    { id: 's10.stroke2', shot: 's10', ref: 'D:57', leadFrames: 8, frame: 619, note: "room stroke 2 lands" },
    { id: 's10.stroke3', shot: 's10', ref: 'D:58', leadFrames: 8, frame: 627, note: "room stroke 3 lands" },
    { id: 's10.stroke4', shot: 's10', ref: 'D:59', leadFrames: 8, frame: 636, note: "room stroke 4 lands" },
    { id: 's10.rule', shot: 's10', ref: 'D:60', leadFrames: 7, frame: 645, note: "deed rule extends across the room" },
    { id: 's11.cut', shot: 's11', ref: 'D:64', leadFrames: 0, frame: 679, note: "cut; first layer drops" },
    { id: 's11.drop2', shot: 's11', ref: 'D:65', leadFrames: 0, frame: 688, note: "layer 2 drops" },
    { id: 's11.drop3', shot: 's11', ref: 'D:66', leadFrames: 0, frame: 697, note: "layer 3 drops" },
    { id: 's11.drop4', shot: 's11', ref: 'D:67', leadFrames: 0, frame: 706, note: "vignette drops" },
    { id: 's11.drift_start', shot: 's11', ref: 'D:67', leadFrames: 0, action: { declaredT: 29.5, frame: 708, reason: "drift begins after the layers are gone; deliberate offset from the governing pulse" }, note: "registration drift starts 0.1 s after the last drop" },
    { id: 's11.drift_end', shot: 's11', ref: 'D:72', leadFrames: 0, action: { declaredT: 31.1667, frame: 748, reason: "outgoing frozen frame of s11 (last frame before the s12 cut)" }, note: "drift reaches 18 px at the outgoing frozen frame" },
    { id: 's12.cut', shot: 's12', ref: 'D:72', leadFrames: 0, frame: 749, note: "iris from the ember; seal starts as the ember" },
    { id: 's12.silence_start', shot: 's12', ref: 'M:low_energy_interval.t0', leadFrames: 0, frame: 785, note: "measured silence starts; sway and ember drift hold" },
    { id: 's12.lift', shot: 's12', ref: 'M:energy_return', leadFrames: 3, action: { declaredT: 32.79, frame: 787, reason: "anticipation lift inside the measured silence (32.71-32.87); lands at the contact frame" }, note: "anticipation lift inside the silence" },
    { id: 's12.silence_end', shot: 's12', ref: 'M:low_energy_interval.t1', leadFrames: 0, frame: 789, note: "measured silence ends" },
    { id: 's12.contact', shot: 's12', ref: 'M:energy_return', leadFrames: 3, frame: 790, note: "CONTACT: stamp, shake, flash, ring, registration snap, sparks, line closure, camera crash-in (word identity U)" },
    { id: 's12.vocal1', shot: 's12', ref: 'M:vocal_groups_after_return[0]', leadFrames: 0, frame: 794, note: "RIGHT ON starts (content U)" },
    { id: 's12.vocal2', shot: 's12', ref: 'M:vocal_groups_after_return[1]', leadFrames: 0, frame: 802, note: "TIME. starts (content U)" },
    { id: 's12.audible_end', shot: 's12', ref: 'M:audible_end', leadFrames: 0, frame: 814, note: "last audible sound" },
    { id: 's12.clear_start', shot: 's12', ref: 'M:audible_end', leadFrames: 0, action: { declaredT: 34.5, frame: 828, reason: "reading hold of 24 frames after the phrase completes at frame 804" }, note: "text clear starts (reading window option 2)" },
    { id: 's12.clear_end', shot: 's12', ref: 'M:audible_end', leadFrames: 0, action: { declaredT: 34.92, frame: 838, reason: "clear over frames 828-838" }, note: "text fully cleared" },
    { id: 's12.gloss_start', shot: 's12', ref: 'M:master_end', leadFrames: 0, action: { declaredT: 35, frame: 840, reason: "first image-only frame is 839; gloss begins at frame 840" }, note: "gloss starts drying to matte (image-only ending)" },
    { id: 's12.gloss_end', shot: 's12', ref: 'M:master_end', leadFrames: 0, action: { declaredT: 35.625, frame: 855, reason: "gloss to matte over frames 840-855" }, note: "matte reached" },
  ];
  const H = HL.hits = { list: HITS, byId: Object.fromEntries(HITS.map(h => [h.id, h])), report: [], ready: false };
  const shotRange = id => { const i = +id.slice(1) - 1; return [HL.CUT_FRAMES[i], i + 1 < HL.CUT_FRAMES.length ? HL.CUT_FRAMES[i + 1] : HL.END_FRAME]; };
  // validate every hit against the cue file; throws (naming the hit id) on any inconsistency; fills H.report with computed values
  H.init = () => {
    const seen = new Set(); H.report = [];
    for (const h of HITS) {
      if (seen.has(h.id)) throw new Error(`hit '${h.id}': duplicate id`); seen.add(h.id);
      if (!/^s(0[1-9]|1[0-2])$/.test(h.shot)) throw new Error(`hit '${h.id}': unknown shot '${h.shot}'`);
      if (!Number.isInteger(h.leadFrames) || h.leadFrames < 0) throw new Error(`hit '${h.id}': bad leadFrames`);
      const rec = HL.cue.resolve(h.ref);                       // throws on unknown type / missing id / non-finite time / bad reference
      let frame, row;
      if (h.action) {
        const a = h.action; if (!Number.isFinite(a.declaredT) || !a.reason || h.frame !== undefined) throw new Error(`hit '${h.id}': action needs declaredT + reason and no stored frame`);
        frame = Math.round(a.declaredT * FPS);
        if (a.frame !== frame) throw new Error(`hit '${h.id}': action frame ${a.frame} != round(24*declaredT) = ${frame}`);
        const q = (frame / FPS - a.declaredT) * 1000; if (Math.abs(q) > HALF_MS) throw new Error(`hit '${h.id}': action quantization ${q.toFixed(1)} ms exceeds half a frame`);
        row = { quantMs: q, offsetFromGoverningMs: (a.declaredT - rec.t) * 1000, reason: a.reason };
      } else {
        frame = Math.round(rec.t * FPS);
        if (h.frame !== frame) throw new Error(`hit '${h.id}': stored frame ${h.frame} != round(24*${rec.t}) = ${frame} (target ${h.ref})`);
        const res = (frame / FPS - rec.t) * 1000; if (Math.abs(res) > HALF_MS) throw new Error(`hit '${h.id}': residual ${res.toFixed(1)} ms exceeds half a frame`);
        row = { residualMs: res };
      }
      if (frame < 0 || frame > HL.END_FRAME - 1) throw new Error(`hit '${h.id}': frame ${frame} outside 0..${HL.END_FRAME - 1}`);
      if (frame - h.leadFrames < 0) throw new Error(`hit '${h.id}': lead starts before frame 0`);
      const [a0, a1] = shotRange(h.shot); if (frame < a0 || frame >= a1) throw new Error(`hit '${h.id}': contact frame ${frame} outside shot ${h.shot} frames ${a0}-${a1 - 1}`);
      h.contactFrame = frame; h.contactT = frame / FPS; h.record = rec;
      H.report.push(Object.assign({ id: h.id, ref: h.ref, type: rec.type, evidence: rec.evidence, uncertain: rec.uncertain, listeningVerified: rec.listeningVerified, targetT: rec.t, source: rec.source, leadFrames: h.leadFrames, contactFrame: frame, contactT: frame / FPS }, row));
    }
    H.ready = true; return H.report;
  };
  H.frame = id => { const h = H.byId[id]; if (!h || h.contactFrame === undefined) throw new Error(`hit '${id}' unknown or not validated`); return h.contactFrame; };
  H.t = id => H.frame(id) / FPS;                 // contact sampling time (frame/24)
  H.lead = id => H.byId[id].leadFrames / FPS;     // anticipation seconds before contact
});
