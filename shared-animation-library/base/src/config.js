// config.js: project settings (DERIVED from the R01/R02 painted template; see ../../provenance/PROVENANCE.json).
//   duration: the video's length in seconds. New productions set the measured full-song duration.
//   maxDurationSeconds: optional per-production validation limit; when omitted it follows duration.
//   bpm:      the rhythm that bounces, dances and pulse() follow; offset = seconds of the first downbeat in VIDEO time.
//   width/height: native output canvas in pixels. ONE source for core.js (W/H), #out width/height, its CSS aspect ratio
//             and the render driver's browser viewport. Production default is portrait 1080x1920.
//   fps:      output sampling rate the render driver uses (frame i is sampled at videoSeconds = i / fps).
//   seed:     production seed for derived effect-event seeds (adapters); song-specific values live in the production.
//   sourceAudioOffsetSeconds: master-audio time at video time 0. sourceSeconds = offset + videoSeconds.
// Song imagery, lyrics, audio and cue timing belong in the individual production folder, not in this library.
const PROJECT = { duration: 11, bpm: 120, offset: 0, width: 1080, height: 1920, fps: 24, seed: 1, sourceAudioOffsetSeconds: 0 };
