import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const CACHE_DIR = path.join(tmpdir(), "music-motion-reel-media-discovery-v1");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_BYTES = 1_500_000;
const MAX_RETRY_WAIT_MS = 60_000;

export class ProviderError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ProviderError";
    Object.assign(this, details);
  }
}

function cacheKey(url) {
  return createHash("sha256").update(url).digest("hex") + ".json";
}

async function readCache(url, cacheDir) {
  try {
    const filename = path.join(cacheDir, cacheKey(url));
    const info = await stat(filename);
    if (Date.now() - info.mtimeMs > CACHE_TTL_MS || info.size > MAX_CACHE_BYTES) return null;
    const parsed = JSON.parse(await readFile(filename, "utf8"));
    return parsed && parsed.cachedAt && parsed.data ? parsed.data : null;
  } catch {
    return null;
  }
}

async function pruneCache(cacheDir) {
  try {
    const entries = await readdir(cacheDir);
    const records = [];
    for (const name of entries) {
      if (!name.endsWith(".json")) continue;
      const filename = path.join(cacheDir, name);
      try {
        const info = await stat(filename);
        records.push({ filename, mtime: info.mtimeMs });
      } catch {}
    }
    records.sort((a, b) => b.mtime - a.mtime);
    for (const record of records.slice(100)) {
      try { await import("node:fs/promises").then(({ unlink }) => unlink(record.filename)); } catch {}
    }
    for (const record of records) {
      if (Date.now() - record.mtime > CACHE_TTL_MS) {
        try { await import("node:fs/promises").then(({ unlink }) => unlink(record.filename)); } catch {}
      }
    }
  } catch {}
}

async function writeCache(url, data, cacheDir) {
  try {
    const text = JSON.stringify({ cachedAt: new Date().toISOString(), data });
    if (Buffer.byteLength(text) > MAX_CACHE_BYTES) return;
    await mkdir(cacheDir, { recursive: true });
    const target = path.join(cacheDir, cacheKey(url));
    const temp = target + "." + process.pid + ".tmp";
    await writeFile(temp, text, { flag: "wx" });
    const { rename } = await import("node:fs/promises");
    await rename(temp, target);
    await pruneCache(cacheDir);
  } catch {}
}

function parseRetryAfter(value, now = Date.now()) {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1000);
  const date = Date.parse(value);
  if (Number.isFinite(date)) return Math.max(0, date - now);
  return null;
}

async function readLimitedBody(response, maxBytes) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new ProviderError("Provider JSON response exceeds the configured size limit.", {
      status: response.status, declaredBytes: declared, maxBytes,
    });
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new ProviderError("Provider JSON response exceeds the configured size limit.", {
          status: response.status, receivedBytes: total, maxBytes,
        });
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function fetchJson(url, {
  headers = {},
  fetchImpl = globalThis.fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  cache = true,
  cacheDir = CACHE_DIR,
  timeoutMs = 20_000,
  maxBytes = MAX_CACHE_BYTES,
  maxRetries = 2,
} = {}) {
  if (typeof fetchImpl !== "function") throw new TypeError("A Fetch-compatible implementation is required.");
  if (cache) {
    const cached = await readCache(url, cacheDir);
    if (cached) return cached;
  }
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("Request timed out.")), timeoutMs);
    try {
      const response = await fetchImpl(url, { method: "GET", headers, signal: controller.signal, redirect: "follow" });
      if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
        const headerDelay = parseRetryAfter(response.headers.get("retry-after"));
        const delay = headerDelay ?? Math.max(5_000, 1_000 * (2 ** attempt));
        await response.body?.cancel().catch(() => {});
        if (delay > MAX_RETRY_WAIT_MS) {
          throw new ProviderError("Provider requested a retry delay of " + Math.ceil(delay / 1000) +
            " seconds; stopping without retrying early.", { status: response.status, retryAfterMs: delay });
        }
        clearTimeout(timer);
        await sleep(delay);
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        throw new ProviderError("Provider returned HTTP " + response.status + " for " + new URL(url).hostname, {
          status: response.status,
          retryAfter: response.headers.get("retry-after") || null,
        });
      }
      const text = await readLimitedBody(response, maxBytes);
      let data;
      try { data = JSON.parse(text); }
      catch (error) { throw new ProviderError("Provider returned malformed JSON.", { cause: error }); }
      if (cache) await writeCache(url, data, cacheDir);
      return data;
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      if (controller.signal.aborted) {
        throw new ProviderError("Provider request timed out: " + new URL(url).hostname, { cause: error });
      }
      throw new ProviderError("Provider request failed: " + new URL(url).hostname + ": " + error.message, { cause: error });
    } finally {
      clearTimeout(timer);
    }
  }
  throw new ProviderError("Provider retry limit was exceeded.");
}

export function retryAfterMilliseconds(value, now) {
  return parseRetryAfter(value, now);
}

export function cacheDirectoryForTest() {
  return CACHE_DIR;
}
