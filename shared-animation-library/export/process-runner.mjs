// process-runner.mjs — child-process supervision for ffmpeg. `spawn` is injectable so tests use doubles (no media, no ffmpeg).
// Handlers are attached synchronously at spawn time. Outcomes:
//   failed startup (spawn 'error'), nonzero exit, signal termination, and exit BEFORE the input was finished (early termination,
//   even with code 0) all reject `done` with an ExportError and stop further writes. Success = exit code 0 AFTER end() was called.
import { spawn as nodeSpawn } from "node:child_process";

export class ExportError extends Error {
  constructor(kind, message, { stderrTail = "", cause } = {}) { super(message); this.name = "ExportError"; this.kind = kind; this.stderrTail = stderrTail; if (cause) this.cause = cause; }
}

export function startProcess(cmd, args, { spawn = nodeSpawn, feed = false, label = cmd } = {}) {
  let child; const tail = []; let failure = null, inputEnded = !feed, finished = false;
  const tailText = () => tail.join("").slice(-2000);
  let resolveDone, rejectDone; const done = new Promise((res, rej) => { resolveDone = res; rejectDone = rej; }); done.catch(() => {});   // outcome surfaced via wait()/write()
  const fail = (kind, msg, cause) => {
    if (finished) return; finished = true; failure = new ExportError(kind, `${label}: ${msg}${tailText() ? `\n--- ${label} stderr (tail) ---\n${tailText()}` : ""}`, { stderrTail: tailText(), cause });
    try { child && child.stdin && !child.stdin.destroyed && child.stdin.destroy && child.stdin.destroy(); } catch {}
    rejectDone(failure);
  };
  try { child = spawn(cmd, args, { stdio: [feed ? "pipe" : "ignore", "ignore", "pipe"] }); }
  catch (e) { fail("startup", `could not start (${e.message}). Is ${cmd} installed and on PATH?`, e); child = null; }
  if (child) {
    child.on("error", (e) => fail("startup", `could not start or communicate (${e.code || e.message}). Is ${cmd} installed and on PATH?`, e));
    child.on("close", (code, signal) => {
      if (finished) return;
      if (signal) return fail("signal", `terminated by signal ${signal}`);
      if (code !== 0) return fail("exit", `exited with code ${code}`);
      if (!inputEnded) return fail("early-exit", "exited before all input was supplied (early encoder termination)");
      finished = true; resolveDone({ code });
    });
    if (child.stderr) child.stderr.on("data", (d) => { tail.push(String(d)); if (tail.length > 40) tail.shift(); });
    if (child.stdin) child.stdin.on("error", (e) => fail("input", `input pipe failed (${e.code || e.message})`, e));
  }
  return {
    get failed() { return failure; },
    async write(buf) {
      if (failure) throw failure;
      if (!child || !child.stdin) throw new ExportError("input", `${label}: no input pipe`);
      if (!child.stdin.write(buf)) await Promise.race([new Promise((r) => child.stdin.once("drain", r)), done.catch(() => {})]);
      if (failure) throw failure;
    },
    end() { inputEnded = true; if (child && child.stdin && !failure) child.stdin.end(); },
    wait: () => done,
    abort() { if (!finished) fail("aborted", "aborted by caller"); try { child && child.kill && child.kill(); } catch {} },
  };
}

/**
 * Feed `frameCount` rendered frames to an encoder writing to `output`. The encoder writes to `<output>.part.mp4`, renamed to `output`
 * only after a zero exit, so a failed export never leaves a file that looks complete. Returns only after successful completion.
 * io = { spawn, rename, remove } (injectable). renderFrame(j) -> Buffer for frame j of the plan.
 */
export async function runClipExport({ plan, ffmpegBin = "ffmpeg", output, renderFrame, io = {}, onProgress = () => {} }) {
  const { rename, remove } = io; const part = output.replace(/(\.mp4)?$/, ".part.mp4");
  const proc = startProcess(ffmpegBin, plan.ffmpegArgs({ output: part }), { spawn: io.spawn, feed: true, label: "ffmpeg" });
  try {
    for (let j = 0; j < plan.frameCount; j++) { await proc.write(await renderFrame(j)); onProgress(j + 1, plan.frameCount); }
    proc.end(); await proc.wait();
  } catch (e) {
    proc.abort(); if (remove) await remove(part).catch(() => {});
    throw e instanceof ExportError ? e : new ExportError("render", `frame rendering or export failed: ${e.message}`, { cause: e });
  }
  if (rename) await rename(part, output);
  return { output, frames: plan.frameCount };
}

/** Encode saved frames (no input pipe). Same part-file + exit-code rules. */
export async function runEncode({ plan, framesDir, ffmpegBin = "ffmpeg", output, io = {} }) {
  const { rename, remove } = io; const part = output.replace(/(\.mp4)?$/, ".part.mp4");
  const proc = startProcess(ffmpegBin, plan.ffmpegArgs({ framesDir, output: part }), { spawn: io.spawn, feed: false, label: "ffmpeg" });
  try { await proc.wait(); } catch (e) { if (remove) await remove(part).catch(() => {}); throw e; }
  if (rename) await rename(part, output);
  return { output, frames: plan.frameCount };
}
