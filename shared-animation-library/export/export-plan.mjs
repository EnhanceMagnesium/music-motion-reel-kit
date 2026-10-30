// export-plan.mjs — pure export planning: the ONE timing contract for direct (--clip) and saved-frame (--frames/--encode) export.
// No fs, no child processes, no media. render.mjs executes the plan; tests inspect it.
//
// THREE TIME BASES
//   source time      : seconds in the ORIGINAL recording (the master).
//   production time  : seconds within the selected excerpt ("video-local"); production time 0 = source time sourceAudioOffsetSeconds.
//   frame index i    : integer; production time of frame i is exactly i / fps  (sourceSeconds = sourceAudioOffsetSeconds + i / fps).
// ROUNDING CONVENTION
//   Explicit ranges snap to nearest frame (half up, tolerance 1e-9 frames).
//   A full-master export (no explicit range and source offset 0) rounds its video end UP so a fractional final
//   frame cannot shorten the supplied recording. Its video can be less than one frame longer than the master.
//   The audio input limit remains the exact measured master duration; it is not extended to the video boundary.
//   Explicit ranges/excerpts retain nearest-frame bounds.
//   Audio starts at sourceAudioOffsetSeconds + firstFrame/fps; whole-master audio ends at project.duration.
//   Frame j of the export (0-based) is production frame firstFrame + j, sampled at (firstFrame + j) / fps. Cues are never re-snapped.
const EPS = 1e-9;
const isPos = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;
export const roundFrame = (seconds, fps) => Math.round(seconds * fps + EPS);
export const ceilFrame = (seconds, fps) => Math.ceil(seconds * fps - EPS);
/** Frame count for the whole configured project. A zero-offset full master gets an inclusive end boundary. */
export function wholeProjectFrameCount(project) {
  if (!project || !isPos(project.duration) || !isPos(project.fps)) throw new TypeError("wholeProjectFrameCount needs positive project duration and fps");
  return project.sourceAudioOffsetSeconds === 0
    ? ceilFrame(project.duration, project.fps)
    : roundFrame(project.duration, project.fps);
}
/** Remotion composition metadata derived from the same normalized PROJECT and video frame plan. */
export function projectCompositionMetadata(project) {
  return { width: project.width, height: project.height, fps: project.fps, durationInFrames: wholeProjectFrameCount(project) };
}
/** Exact audio source span for a full zero-offset master; legacy excerpt paths follow their frame-bounded video span. */
export function audioDurationInFrames(project, videoDurationInFrames) {
  return project?.sourceAudioOffsetSeconds === 0
    ? project.duration * project.fps
    : videoDurationInFrames;
}
export const frameFileName = (i) => `f${String(i).padStart(5, "0")}.jpg`;   // same naming as upstream render.mjs

/** project: normalized PROJECT. range: [a,b] production seconds or null (= whole excerpt). length: seconds of the thing being rendered (default project.duration). */
export function planExport({ project, range = null, length, audio = null, mode = "clip" } = {}) {
  if (!project || project.normalized !== true) throw new TypeError("planExport needs the object returned by normalizeProject()");
  if (!["clip", "frames", "encode"].includes(mode)) throw new RangeError(`unknown export mode ${mode}`);
  const { fps } = project, len = length ?? project.duration;
  if (!isPos(len)) throw new RangeError(`length must be > 0, got ${len}`);
  const [a, b] = range ?? [0, len];
  if (![a, b].every((v) => typeof v === "number" && Number.isFinite(v)) || a < 0 || !(b > a)) throw new RangeError(`range must be finite with 0 <= start < end, got ${a}:${b}`);
  if (b > len + EPS) throw new RangeError(`range end ${b}s is past the excerpt length ${len}s`);
  const firstFrame = roundFrame(a, fps);
  const wholeMaster = range === null && project.sourceAudioOffsetSeconds === 0 && Math.abs(len - project.duration) <= EPS;
  const endFrame = wholeMaster ? ceilFrame(b, fps) : roundFrame(b, fps), frameCount = endFrame - firstFrame;
  if (frameCount < 1) throw new RangeError(`range ${a}:${b} contains no whole frame at ${fps} fps`);
  const localStartSeconds = firstFrame / fps, durationSeconds = frameCount / fps;
  const audioDurationSeconds = wholeMaster ? project.duration : durationSeconds;
  const plan = {
    mode, fps, width: project.width, height: project.height, requestedRange: [a, b],
    firstFrame, endFrame, frameCount, localStartSeconds, localEndSeconds: endFrame / fps, durationSeconds,
    frameQuantizationDifferenceSeconds: durationSeconds - (b - a),
    endRounding: wholeMaster ? "ceil-to-preserve-full-master" : "nearest-frame",
    sourceAudioOffsetSeconds: project.sourceAudioOffsetSeconds,
    audio: audio ? { path: audio, startSeconds: project.sourceAudioOffsetSeconds + localStartSeconds, durationSeconds: audioDurationSeconds } : null,
    audioVideoEndpointDifferenceSeconds: audio ? durationSeconds - audioDurationSeconds : null,
    frameTimes: (j) => (firstFrame + j) / fps,
    frameIndices: () => Array.from({ length: frameCount }, (_, j) => firstFrame + j),
  };
  plan.ffmpegArgs = ({ framesDir = null, output }) => ffmpegArgs(plan, { framesDir, output });
  return Object.freeze(plan);
}

const audioArgs = (plan, inputIndex) => plan.audio
  ? { input: ["-ss", String(plan.audio.startSeconds), "-t", String(plan.audio.durationSeconds), "-i", plan.audio.path], map: ["-map", "0:v", "-map", `${inputIndex}:a`, "-c:a", "aac", "-b:a", "192k"] }
  : { input: [], map: [] };

/** ffmpeg argument vector for the plan. clip: frames arrive on stdin (image2pipe). encode: saved frames from framesDir. Video length is bounded by -frames:v. */
function ffmpegArgs(plan, { framesDir, output }) {
  if (!output) throw new TypeError("output path required");
  const a = audioArgs(plan, 1), common = ["-c:v", "libx264", "-preset", plan.mode === "clip" ? "medium" : "slow", "-crf", plan.mode === "clip" ? "18" : "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
  if (plan.mode === "clip") return ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(plan.fps), "-c:v", "mjpeg", "-i", "-", ...a.input, ...a.map, "-frames:v", String(plan.frameCount), ...common, output];
  if (plan.mode === "encode") {
    if (!framesDir) throw new TypeError("framesDir required for encode");
    return ["-y", "-loglevel", "error", "-stats", "-framerate", String(plan.fps), "-start_number", String(plan.firstFrame), "-i", `${framesDir}/f%05d.jpg`, ...a.input, ...a.map, "-frames:v", String(plan.frameCount), ...common, output];
  }
  throw new RangeError("ffmpeg arguments exist for clip and encode plans only");
}

/** Frame file names of the plan's selected sequence that `isComplete(name)` rejects. Files outside the sequence (older, longer exports) are ignored. */
export function missingFrames(plan, isComplete) { return plan.frameIndices().map(frameFileName).filter((n) => !isComplete(n)); }
