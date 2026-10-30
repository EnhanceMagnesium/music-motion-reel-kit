// timebase.mjs — video/source time conversion. Dependency-free.
// Contract (export/export-plan.mjs states the full frame/audio rounding convention): output frame i is sampled at videoSeconds = i / fps;
// sourceSeconds = sourceAudioOffsetSeconds + videoSeconds. Cues measured on the master are converted to video time ONCE, at load; cue
// evidence keeps the original source timestamp. Nothing here snaps time to any style-local cadence.
const finite = (v, name) => { if (typeof v !== "number" || !Number.isFinite(v)) throw new RangeError(`${name} must be a finite number, got ${v}`); return v; };
// Cue conversions are snapped to 1e-9 s so float noise (12.4 - 10 = 2.4000000000000004) cannot put a cue an ulp AFTER its own frame time
// (72/30 = 2.4) or change floor(t*1000) event seeds; 1e-9 s is ~1e-8 of a frame, far below anything audible or visible.
const snap = (v) => Math.round(v * 1e9) / 1e9;
const out = (v, name) => { if (!Number.isFinite(v)) throw new RangeError(`${name} overflowed to ${v}`); return v; };
export const frameToVideoSeconds = (frameIndex, fps) => {
  if (!Number.isSafeInteger(frameIndex) || frameIndex < 0) throw new RangeError(`frameIndex must be a non-negative safe integer, got ${frameIndex}`);
  if (!(finite(fps, "fps") > 0)) throw new RangeError(`fps must be > 0, got ${fps}`);
  return out(frameIndex / fps, "videoSeconds");
};
export const videoToSourceSeconds = (videoSeconds, sourceAudioOffsetSeconds = 0) => out(snap(finite(sourceAudioOffsetSeconds, "sourceAudioOffsetSeconds") + finite(videoSeconds, "videoSeconds")), "sourceSeconds");
export const sourceToVideoSeconds = (sourceSeconds, sourceAudioOffsetSeconds = 0) => out(snap(finite(sourceSeconds, "sourceSeconds") - finite(sourceAudioOffsetSeconds, "sourceAudioOffsetSeconds")), "videoSeconds");
