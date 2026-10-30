// cue-schema.mjs — song-neutral cue contract. Cues are PRODUCTION-OWNED data (a cue module or inline `PROJECT.cues.entries`);
// nothing here carries lyrics, durations or timelines. This module only validates, labels evidence, and converts source time to
// production time exactly ONCE with numeric/timebase.mjs (the same rules as export planning: sourceSeconds = offset + productionSeconds).
//
// CUE DOCUMENT   { schemaVersion: 1, recording?: {id, sha256?, durationSeconds?}, entries: [Cue] }
// CUE            { id, kind, basis: 'source'|'production', seconds, endSeconds?, evidence, tool?, confidence?, text?, textSource?, confirmedBy?, data? }
//   basis     which clock `seconds`/`endSeconds` are stated in. 'source' = master recording time; 'production' = excerpt-local video time.
//   evidence  how the TIMING is known — one of:
//     measured   a deterministic signal measurement on the recording (e.g. an RMS-envelope peak at a stated window)
//     estimated  an algorithmic estimate (beat tracker, onset detector, forced aligner, any model output): may be wrong
//     inferred   structure inferred by a person/planner from other evidence (section boundaries, phrase starts)
//     supplied   a time given in supplied material (subtitle/LRC file, user notes) — not checked against the recording
//     confirmed  checked against the recording by a human (requires confirmedBy)
//   text      supplied lyric/caption text for this cue. Lyric TEXT is canonical supplied material (requires textSource:'supplied'); how its
//             TIMING is known is the separate `evidence` field. A word-aligner's output is therefore evidence:'estimated' with supplied text.
//   Conversion is idempotent-guarded: output entries carry both clocks and `converted:true`; feeding converted entries back in is rejected.
import { sourceToVideoSeconds, videoToSourceSeconds } from "../numeric/timebase.mjs";

export const CUE_SCHEMA_VERSION = 1;
export const EVIDENCE = Object.freeze(["measured", "estimated", "inferred", "supplied", "confirmed"]);
const ID = /^[A-Za-z][A-Za-z0-9_.:-]*$/;
const bad = (m) => { throw new RangeError("cues: " + m); };
const fin = (v, name) => (typeof v === "number" && Number.isFinite(v)) ? v : bad(`${name} must be a finite number, got ${String(v)}`);

/** doc: cue document (or undefined = no cues). project: normalized PROJECT. -> frozen cue index. */
export function normalizeCues(doc, project) {
  if (!project || project.normalized !== true) throw new TypeError("normalizeCues needs the object returned by normalizeProject()");
  const entries = doc === undefined ? [] : doc && Array.isArray(doc.entries) ? doc.entries : bad("cue document needs an entries array");
  if (doc && doc.schemaVersion !== undefined && doc.schemaVersion !== CUE_SCHEMA_VERSION) bad(`unsupported schemaVersion ${doc.schemaVersion} (this library reads ${CUE_SCHEMA_VERSION})`);
  const rec = doc && doc.recording;
  if (rec !== undefined) {
    if (!rec || typeof rec !== "object" || typeof rec.id !== "string" || !rec.id) bad("recording needs a string id");
    if (rec.sha256 !== undefined && !/^[0-9a-f]{64}$/i.test(rec.sha256)) bad("recording.sha256 must be 64 hex characters");
    if (rec.durationSeconds !== undefined && !(fin(rec.durationSeconds, "recording.durationSeconds") > 0)) bad("recording.durationSeconds must be > 0");
  }
  const off = project.sourceAudioOffsetSeconds, ids = new Set(), out = [];
  entries.forEach((c, i) => {
    const where = `entries[${i}]${c && c.id ? ` "${c.id}"` : ""}`;
    if (!c || typeof c !== "object") bad(`${where} must be an object`);
    if (c.converted === true) bad(`${where} is already converted (production/source clocks present); pass the original entry, conversion happens once`);
    if (typeof c.id !== "string" || !ID.test(c.id)) bad(`${where}.id must be an identifier`);
    if (ids.has(c.id)) bad(`duplicate cue id "${c.id}"`); ids.add(c.id);
    if (typeof c.kind !== "string" || !ID.test(c.kind)) bad(`${where}.kind must be an identifier (e.g. beat, downbeat, onset, section, lyric-line, lyric-word, accent)`);
    if (c.basis !== "source" && c.basis !== "production") bad(`${where}.basis must be 'source' or 'production', got ${JSON.stringify(c.basis)}`);
    if (!EVIDENCE.includes(c.evidence)) bad(`${where}.evidence must be one of ${EVIDENCE.join(", ")}, got ${JSON.stringify(c.evidence)}`);
    if (c.evidence === "confirmed" && !(typeof c.confirmedBy === "string" && c.confirmedBy)) bad(`${where} is 'confirmed' but names no confirmedBy`);
    if (c.confidence !== undefined && !(fin(c.confidence, `${where}.confidence`) >= 0 && c.confidence <= 1)) bad(`${where}.confidence must be in [0,1]`);
    if (c.text !== undefined) { if (typeof c.text !== "string") bad(`${where}.text must be a string`); if (c.textSource !== "supplied") bad(`${where} has text but textSource is not 'supplied' (lyric text must be supplied material)`); }
    const s = fin(c.seconds, `${where}.seconds`), e = c.endSeconds === undefined ? undefined : fin(c.endSeconds, `${where}.endSeconds`);
    if (e !== undefined && !(e >= s)) bad(`${where} endSeconds ${e} is before seconds ${s}`);
    const toP = c.basis === "source" ? (v) => sourceToVideoSeconds(v, off) : (v) => v, toS = c.basis === "source" ? (v) => v : (v) => videoToSourceSeconds(v, off);
    const base = { id: c.id, kind: c.kind, evidence: c.evidence, productionSeconds: toP(s), sourceSeconds: toS(s) };
    if (e !== undefined) { base.productionEndSeconds = toP(e); base.sourceEndSeconds = toS(e); }
    for (const k of ["tool", "confidence", "text", "textSource", "confirmedBy", "data"]) if (c[k] !== undefined) base[k] = c[k];
    const end = base.productionEndSeconds ?? base.productionSeconds;
    base.inExcerpt = base.productionSeconds >= 0 && end <= project.duration;
    base.overlapsExcerpt = end >= 0 && base.productionSeconds <= project.duration;
    base.converted = true; out.push(Object.freeze(base));
  });
  out.sort((a, b) => a.productionSeconds - b.productionSeconds || (a.id < b.id ? -1 : 1));
  return Object.freeze(buildIndex(out, rec));
}

function buildIndex(all, recording) {
  const frozen = Object.freeze(all.slice());
  const lowerBound = (arr, t) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m].productionSeconds < t) lo = m + 1; else hi = m; } return lo; };
  const pick = (arr, kind) => kind === undefined ? arr : arr.filter((c) => c.kind === kind);
  return {
    recording, all: frozen, overlapping: Object.freeze(frozen.filter((c) => c.overlapsExcerpt)),
    byKind: (kind) => frozen.filter((c) => c.kind === kind),
    /** cues whose productionSeconds lies in [a, b) */
    between(a, b, kind) { const i = lowerBound(frozen, a), r = []; for (let k = i; k < frozen.length && frozen[k].productionSeconds < b; k++) r.push(frozen[k]); return pick(r, kind); },
    /** interval cues with productionSeconds <= t < productionEndSeconds */
    active(t, kind) { return pick(frozen.filter((c) => c.productionEndSeconds !== undefined && c.productionSeconds <= t && t < c.productionEndSeconds), kind); },
    nextAfter(t, kind) { return pick(frozen, kind).find((c) => c.productionSeconds > t); },
    lastAtOrBefore(t, kind) { const a = pick(frozen, kind); for (let k = a.length - 1; k >= 0; k--) if (a[k].productionSeconds <= t) return a[k]; return undefined; },
  };
}

// ---- importers for analysis outputs (shapes read from the pinned sources; NOT yet exercised on real analysis output) --------------------
// Both return RAW cue entries on the SOURCE clock (basis:'source'); normalizeCues() does the single conversion. `trackStartSourceSeconds` is the master time
// at which the analyzed file starts (0 when the unmodified master was analyzed). Analysis evidence is 'estimated' — never 'confirmed'.
const num = (v) => typeof v === "number" && Number.isFinite(v);
/** R04 analyze-beatgrid.py audiomap.json: grid.beats_sec, grid.downbeats_sec, events[{t,bar,beat_in_bar,step16,grid,drum,energy,feel,special}], key_moments[{t,kind}], energy_phases[{start,end,level}] */
export function fromBeatgridAudiomap(doc, { trackStartSourceSeconds = 0, tool = "R04 analyze-beatgrid.py" } = {}) {
  if (!doc || typeof doc !== "object") bad("audiomap must be an object");
  const o = fin(trackStartSourceSeconds, "trackStartSourceSeconds"), out = [], mk = (id, kind, t, extra = {}) => out.push({ id, kind, basis: "source", seconds: o + t, evidence: "estimated", tool, ...extra });
  (doc.grid?.beats_sec || []).filter(num).forEach((t, i) => mk(`beat:${i}`, "beat", t));
  (doc.grid?.downbeats_sec || []).filter(num).forEach((t, i) => mk(`downbeat:${i}`, "downbeat", t));
  (doc.events || []).forEach((e, i) => { if (num(e.t)) mk(`onset:${i}`, "onset", e.t, { data: { drum: e.drum, grid: e.grid, bar: e.bar, beatInBar: e.beat_in_bar, step16: e.step16, energy: e.energy, feel: e.feel, special: e.special ?? null } }); });
  (doc.key_moments || []).forEach((m, i) => { if (num(m.t)) mk(`moment:${i}`, "energy-moment", m.t, { data: { moment: m.kind } }); });
  (doc.energy_phases || []).forEach((p, i) => { if (num(p.start) && num(p.end)) mk(`phase:${i}`, "energy-phase", p.start, { endSeconds: o + p.end, data: { level: p.level } }); });
  return out;
}
/** R07 analysis/analyze.py audio.json (as read by app/src/engine/audio.ts): beats[], downbeats[], sections[{name,start,end}], onsets{kind:[[t,strength],...]} */
export function fromAudioJson(doc, { trackStartSourceSeconds = 0, tool = "R07 analyze.py" } = {}) {
  if (!doc || typeof doc !== "object") bad("audio.json must be an object");
  const o = fin(trackStartSourceSeconds, "trackStartSourceSeconds"), out = [], mk = (id, kind, t, extra = {}) => out.push({ id, kind, basis: "source", seconds: o + t, evidence: "estimated", tool, ...extra });
  (doc.beats || []).filter(num).forEach((t, i) => mk(`beat:${i}`, "beat", t));
  (doc.downbeats || []).filter(num).forEach((t, i) => mk(`downbeat:${i}`, "downbeat", t));
  (doc.sections || []).forEach((s, i) => { if (num(s.start) && num(s.end)) mk(`section:${i}`, "section", s.start, { endSeconds: o + s.end, data: { name: s.name } }); });
  for (const [k, arr] of Object.entries(doc.onsets || {})) (arr || []).forEach(([t, strength], i) => { if (num(t)) mk(`onset-${k}:${i}`, "onset", t, { data: { source: k, strength } }); });
  return out;
}
