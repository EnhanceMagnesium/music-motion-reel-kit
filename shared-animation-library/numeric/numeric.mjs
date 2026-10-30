// numeric.mjs — dependency-free shared numeric core (no DOM, canvas, Node or p5 imports).
// Provenance (pinned sources, MIT; see provenance/PROVENANCE.json and provenance/licenses/):
//   R02 = tuzhechen2005/opus-video-skills kinetic-reel/template/reel/reel.js (math block, easeInOut, ioExpo, beatPulse)
//         and painted-animation/template/src/core.js (painted backOut s=1.9)
//   R03 = lemomo-ai/lemo-opuscar core/lib.js
//   R06 = buildwithhanif/claude-animation-skill lib/core.mjs and lib/film.mjs (exposure)
// Common helpers below are the ones with tested exact sampled agreement across the sources
// (compatibility-preparation/helper-compatibility.txt). Everything whose behaviour differs between sources stays an
// explicit, source-named variant in the `r02`, `r03` and `r06` namespaces: names are never silently unified, and the
// arithmetic of each variant is copied from its source so results are bit-identical, not merely close.

// ------------------------------------------------------------------ common set
export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / (b - a));                       // R02 = R03 (R06 has no seg)
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// smoothstep: TWO DIFFERENT SIGNATURES. unary(k) = R03 ss = R02 ease; window(a,b,x) = R06 ss. Never alias one to the other.
export const smoothstep = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
export const smoothstepWindow = (a, b, x) => smoothstep(seg(x, a, b));
export const easeIn = (k) => Math.pow(clamp(k), 3);
export const easeOut = (k) => 1 - Math.pow(1 - clamp(k), 3);
export const easeInOut = (k) => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
export const expoOut = (k) => { k = clamp(k); return k === 1 ? 1 : 1 - Math.pow(2, -10 * k); };

// ------------------------------------------------------------------ source-specific variants
// RNGs: different algorithms; swapping one for the other changes every trajectory.
// R03 Mulberry32: signed 32-bit coercion, wrapping add, output / 2^32.
export function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// R06 Park–Miller (16807 mod 2^31-1) with R06 seed normalisation: floor, min 1, then % modulus. Compatibility behaviour
// is kept: seed 2147483647 (and positive integer multiples) normalise to 0 and the stream is 0 forever; seed 0 -> 1.
export const parkMiller = (seed) => { let s = Math.max(1, Math.floor(seed)) % 2147483647; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
// True when parkMiller(seed) would be the all-zero degenerate stream (strict callers should reject such seeds).
export const parkMillerIsDegenerate = (seed) => Math.max(1, Math.floor(seed)) % 2147483647 === 0;

// Noise: R03 vnoise is UNSIGNED [0,1] (lerp form); R06 noise1 is SIGNED [-1,1] (weighted-sum form). Mathematically
// related by *2-1 (max sampled delta 4.4e-16) but rounding differs, so both are kept.
export const vnoiseUnsigned = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); };
export const noiseSigned = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (hash(i) * (1 - u) + hash(i + 1) * u) * 2 - 1; };

// Back easing: defaults and arithmetic grouping differ per source.
export const backOutR02Kinetic = (x) => { x = clamp(x); const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };   // reel.js, s fixed 1.7
export const backOutR02Painted = (x) => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };   // painted core.js, s fixed 1.9
export const backR03 = (t, s = 1.8) => { t = clamp(t) - 1; return 1 + t * t * ((s + 1) * t + s); };
export const backR06 = (k, s = 1.8) => { k = clamp(k) - 1; return 1 + (s + 1) * k * k * k + s * k * k; };

// R02 beatPulse: exp(-((t/beat) % 1) * k). JS remainder is negative for t < 0 (beatPulse(-.25) at 120 bpm = exp(3.5) > 1);
// that source behaviour is kept. The beat length is an explicit argument, not an implicit global.
export const beatPulseR02 = (t, beatSeconds, k = 7) => Math.exp(-((t / beatSeconds) % 1) * k);
export const beatSeconds = (bpm) => 60 / bpm;
// Tempo-bound form with the ORIGINAL calling convention (t, k = 7): the source closed over a global BEAT; this closes over one bpm.
export const beatPulseR02ForBpm = (bpm) => { const beat = 60 / bpm; return (t, k = 7) => Math.exp(-((t / beat) % 1) * k); };

// R06 exposure: drawing-only clock (e.g. "on twos"). Track-relative anchoring and the 1e-6 epsilon are intentional; the
// track must be non-empty and fps/on positive (no validation in the source). Camera/root/effect time stays continuous.
export function exposureR06(t, track, fps) {
  let cur = track[0]; for (const e of track) if (t >= e.at) cur = e;
  if (cur.hold) return cur.at;
  const n = cur.on || 1, f = Math.floor((t - cur.at) * fps + 1e-6); return cur.at + Math.floor(f / n) * n / fps;
}

// ------------------------------------------------------------------ namespaces with the original short names
// API EXCEPTION: r02.beatPulse is beatPulseR02(t, beatSeconds, k = 7) -- the beat length is an EXPLICIT second argument, unlike the source's
// beatPulse(t, k = 7) which closed over a global BEAT. Calling r02.beatPulse(t, 3) as in the source would treat 3 as seconds per beat.
// To keep the source call shape use r02.beatPulseForBpm(bpm) -> (t, k = 7) => ... (identical results to the source at that tempo).
// r03.ss(k)=unary smoothstep; r06.ss(a,b,x)=window smoothstep — the original collision is preserved on purpose.
export const r02 = Object.freeze({ clamp, lerp, seg, ease: smoothstep, easeOut, easeIn, easeInOut, expoOut, backOut: backOutR02Kinetic, paintedBackOut: backOutR02Painted, hash, beatPulse: beatPulseR02, beatPulseForBpm: beatPulseR02ForBpm, TAU });
export const r03 = Object.freeze({ clamp, lerp, seg, ss: smoothstep, eio: easeInOut, eo: easeOut, ei: easeIn, back: backR03, mulberry: mulberry32, hash, vnoise: vnoiseUnsigned, TAU });
export const r06 = Object.freeze({ clamp, lerp, ss: smoothstepWindow, hash, rng: parkMiller, noise1: noiseSigned, eOut: easeOut, eIn: easeIn, eIO: easeInOut, eExpo: expoOut, eBack: backR06, exposure: exposureR06 });
