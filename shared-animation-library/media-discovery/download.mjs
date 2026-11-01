import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { access, link, mkdir, open, readFile, realpath, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { commonsHeaders, inspectCommons } from "./commons.mjs";
import { archiveDownloadUrl, inspectArchive } from "./internet-archive.mjs";
import { ProviderError } from "./http.mjs";

const DEFAULT_MAX_BYTES = 800 * 1024 * 1024;
const ABSOLUTE_MAX_BYTES = 2 * 1024 * 1024 * 1024;
const VIDEO_EXT = /\.(?:mp4|m4v|webm|ogv|ogg|mov|avi|mkv|mpg|mpeg|wmv|flv|3gp|ts)$/i;
const REVIEWED_EVIDENCE_STATUS = "eligible_with_reviewed_evidence";
const REVIEWED_EVIDENCE_ASSESSMENT = "Download permitted based on a reviewer-supplied item-specific permission assertion; the helper did not independently authenticate permission or certify reuse rights.";

function isAllowedHost(provider, hostname) {
  const host = hostname.toLowerCase();
  if (provider === "commons") {
    return host === "upload.wikimedia.org" || host === "commons.wikimedia.org";
  }
  return host === "archive.org" || host.endsWith(".archive.org");
}

function safeSegment(value, fallback = "asset") {
  const cleaned = String(value ?? "").normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_{2,}/g, "_")
    .replace(/^\.+/, "").replace(/^[._-]+|[._-]+$/g, "");
  return (cleaned || fallback).slice(0, 120);
}

function outputFileName(provider, id, sourceName) {
  const base = path.posix.basename(String(sourceName ?? ""));
  const extension = path.extname(base).toLowerCase();
  if (!VIDEO_EXT.test(base)) throw new RangeError("Selected source file does not have a recognized video extension.");
  const stem = safeSegment(path.basename(base, path.extname(base)));
  const name = safeSegment(provider) + "-" + safeSegment(id) + "-" + stem + extension;
  return name.slice(0, 220);
}

async function realProductionRoot(kitRoot, productionRoot) {
  const kit = await import("node:fs/promises").then(({ realpath }) => realpath(kitRoot));
  const requested = path.resolve(kit, productionRoot);
  const productions = path.join(kit, "productions");
  const resolved = await import("node:fs/promises").then(({ realpath }) => realpath(requested));
  const realProductions = await import("node:fs/promises").then(({ realpath }) => realpath(productions));
  if (!resolved.startsWith(realProductions + path.sep)) {
    throw new RangeError("The selected root must be an existing song folder under this kit's productions/ directory.");
  }
  const configPath = path.join(resolved, "config.js");
  await access(configPath, fsConstants.R_OK);
  return resolved;
}

async function writeAll(handle, buffer) {
  let offset = 0;
  while (offset < buffer.length) {
    const result = await handle.write(buffer, offset, buffer.length - offset, null);
    if (!result.bytesWritten) throw new Error("File write made no progress.");
    offset += result.bytesWritten;
  }
}

async function saveManifest(archiveDir, entry, productionRoot) {
  await mkdir(archiveDir, { recursive: true });
  const resolvedDir = await realpath(archiveDir);
  if (!resolvedDir.startsWith(productionRoot + path.sep)) {
    throw new RangeError("Refusing to write API clip provenance outside the selected song folder.");
  }
  const jsonPath = path.join(resolvedDir, "API_CLIP_MANIFEST.json");
  const mdPath = path.join(resolvedDir, "API_CLIP_MANIFEST.md");
  let manifest = { schemaVersion: 1, entries: [] };
  try {
    manifest = JSON.parse(await readFile(jsonPath, "utf8"));
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.entries)) {
      throw new Error("Unsupported API_CLIP_MANIFEST.json shape.");
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (manifest.entries.some((item) => item.provider === entry.provider && item.id === entry.id && item.sourceFile === entry.sourceFile)) {
    throw new Error("This source file is already recorded in API_CLIP_MANIFEST.json; no manifest changes were made.");
  }
  manifest.entries.push(entry);
  manifest.updatedAt = new Date().toISOString();
  const markdown = [
    "# API-sourced video clips",
    "",
    "Supplemental provenance for media selected through Wikimedia Commons or Internet Archive. Each entry records provider-supplied rights evidence; it is not legal certification. Moving Image Archive footage remains documented in its own project manifest.",
    "",
    ...manifest.entries.flatMap((item, index) => [
      "## " + (index + 1) + ". " + item.title,
      "",
      "- Provider: " + item.provider,
      "- Item/source: " + item.sourceUrl,
      "- Original file: " + item.sourceFile,
      "- Local file: " + item.localPath,
      "- Creator/uploader: " + (item.creator || item.uploader || "Not supplied"),
      "- Date: " + (item.date || "Not supplied"),
      "- Rights status at download: " + item.rightsStatus,
      ...(item.rightsStatus === REVIEWED_EVIDENCE_STATUS ? ["- Evidence assessment: " + REVIEWED_EVIDENCE_ASSESSMENT] : []),
      "- Rights/license basis: " + (item.licenseName || "Unverified"),
      "- License URL: " + (item.licenseUrl || "Not supplied"),
      "- Rights evidence: " + JSON.stringify(item.rightsEvidence),
      "- Access date: " + item.accessedAt,
      "- Technical metadata: " + JSON.stringify(item.technical),
      "- SHA-256: " + item.sha256,
      "- Source in/out: not trimmed at download; set exact production-local points after preview.",
      "- Modifications: none at download; record any later trim, mute, crop, grade or transcode.",
      "- Attribution: " + (item.attribution || "No CC BY attribution string required by the recorded basis; retain this provenance."),
      "",
    ]),
  ].join("\n");
  const suffix = "." + process.pid + "." + randomUUID() + ".tmp";
  const tempJson = jsonPath + suffix;
  const tempMd = mdPath + suffix;
  await writeFile(tempJson, JSON.stringify(manifest, null, 2) + "\n", { flag: "wx" });
  await writeFile(tempMd, markdown, { flag: "wx" });
  try {
    await rename(tempJson, jsonPath);
    await rename(tempMd, mdPath);
  } catch (error) {
    await unlink(tempJson).catch(() => {});
    await unlink(tempMd).catch(() => {});
    throw error;
  }
  return { jsonPath, markdownPath: mdPath };
}

export async function downloadSelected({
  provider, id, fileName, productionRoot, kitRoot, contact, prelingerEvidence, maxBytes = DEFAULT_MAX_BYTES,
  downloadTimeoutMs = 10 * 60 * 1000,
  fetchImpl = globalThis.fetch, request = undefined, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) {
  if (!["commons", "internet-archive"].includes(provider)) {
    throw new RangeError("provider must be commons or internet-archive.");
  }
  const limit = Number(maxBytes);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > ABSOLUTE_MAX_BYTES) {
    throw new RangeError("maxBytes must be between 1 byte and 2 GiB.");
  }
  if (!Number.isSafeInteger(downloadTimeoutMs) || downloadTimeoutMs < 1 || downloadTimeoutMs > 60 * 60 * 1000) {
    throw new RangeError("downloadTimeoutMs must be between 1 ms and 1 hour.");
  }
  const root = await realProductionRoot(kitRoot, productionRoot);
  const candidate = provider === "commons"
    ? await inspectCommons({ title: id, contact, request, requestOptions: { cache: false } })
    : await inspectArchive({ identifier: id, request, requestOptions: { cache: false } });
  // A reviewed item-specific permission can supplement missing Prelinger metadata.
  // Collection membership or a user's general preference is not item permission.
  if (prelingerEvidence !== undefined) {
    if (provider !== "internet-archive" || candidate.rightsStatus !== "rights_unverified" ||
        candidate.rights?.license || candidate.rights?.evidence?.licenseurl || candidate.rights?.evidence?.rights) {
      throw new ProviderError("Prelinger evidence is supported only for an Internet Archive item with missing item-level rights metadata and no conflict.");
    }
    const collections = candidate.rights?.evidence?.collection;
    if (!(Array.isArray(collections) ? collections : [collections]).some((x) => String(x).toLowerCase() === "prelinger")) {
      throw new ProviderError("Fresh Internet Archive metadata does not identify this item as Prelinger.");
    }
    if (typeof prelingerEvidence !== "string" || !prelingerEvidence.trim() || path.isAbsolute(prelingerEvidence)) {
      throw new ProviderError("Prelinger evidence must be a song-relative JSON file.");
    }
    const evidencePath = await realpath(path.resolve(root, prelingerEvidence));
    if (!evidencePath.startsWith(root + path.sep)) throw new ProviderError("Prelinger evidence must stay inside the song folder.");
    const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
    let source;
    try { source = new URL(evidence.sourceUrl); } catch { throw new ProviderError("Prelinger evidence needs an HTTPS source URL."); }
    if (source.protocol !== "https:" || evidence.itemId !== candidate.id ||
        typeof evidence.permissionStatement !== "string" || evidence.permissionStatement.trim().length < 30 ||
        typeof evidence.reviewedBy !== "string" || !evidence.reviewedBy.trim() ||
        !/^\d{4}-\d{2}-\d{2}$/.test(evidence.reviewedDate ?? "")) {
      throw new ProviderError("Prelinger evidence must identify this item and include an HTTPS source, specific permission statement, reviewer and date.");
    }
    candidate.rightsStatus = REVIEWED_EVIDENCE_STATUS;
    candidate.rights = { ...candidate.rights, evidence: { ...candidate.rights.evidence, reviewedItemPermission: evidence },
      license: { name: "Reviewed item-specific reuse evidence (not independently verified)", url: source.href } };
    candidate.attribution = "Review item-specific permission and record any required credit; source: " + candidate.sourceUrl;
  }
  if (!["eligible", REVIEWED_EVIDENCE_STATUS].includes(candidate.rightsStatus)) {
    throw new ProviderError("Download blocked: rights status is " + candidate.rightsStatus + ". " +
      (candidate.rights?.reason ?? "No supported item-level rights basis was established."));
  }
  let sourceFile;
  let downloadUrl;
  let technical;
  if (provider === "commons") {
    sourceFile = candidate.fileName;
    downloadUrl = candidate.downloadUrl;
    technical = candidate.media;
  } else {
    const selected = candidate.videoFiles.find((file) => file.name === fileName);
    if (!selected) throw new RangeError("The requested file name is not a video file in the freshly inspected Internet Archive item.");
    sourceFile = selected.name;
    downloadUrl = archiveDownloadUrl(candidate.id, selected.name);
    technical = selected;
  }
  if (!downloadUrl) throw new ProviderError("The selected item has no direct file URL.");
  const url = new URL(downloadUrl);
  if (url.protocol !== "https:" || !isAllowedHost(provider, url.hostname)) {
    throw new ProviderError("Refusing an unexpected provider download host.");
  }
  if (provider === "commons" && !VIDEO_EXT.test(sourceFile)) {
    throw new ProviderError("The fresh Commons metadata does not identify a recognized video file.");
  }
  const expectedSize = Number(technical?.sizeBytes);
  if (Number.isFinite(expectedSize) && expectedSize > limit) {
    throw new RangeError("The selected file's declared size exceeds the configured download limit.");
  }
  const archiveDir = path.join(root, "public", "archive");
  await mkdir(archiveDir, { recursive: true });
  const realArchiveDir = await import("node:fs/promises").then(({ realpath }) => realpath(archiveDir));
  if (!realArchiveDir.startsWith(root + path.sep)) {
    throw new RangeError("Refusing to write archive media outside the selected song folder.");
  }
  const filename = outputFileName(provider, candidate.id, sourceFile);
  const destination = path.join(archiveDir, filename);
  const tempPath = destination + "." + process.pid + "." + randomUUID() + ".partial";
  try {
    await access(destination);
    throw new Error("Refusing to overwrite existing file: " + destination);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const headers = provider === "commons" ? commonsHeaders(contact) : { "Accept": "*/*" };
  let response;
  let controller;
  let timer;
  for (let attempt = 0; attempt <= 2; attempt++) {
    controller = new AbortController();
    timer = setTimeout(() => controller.abort(new Error("Download timed out.")), downloadTimeoutMs);
    try {
      response = await fetchImpl(downloadUrl, { method: "GET", headers, redirect: "follow", signal: controller.signal });
    } catch (error) {
      clearTimeout(timer);
      if (controller.signal.aborted) throw new ProviderError("Media download timed out.", { cause: error });
      throw new ProviderError("Media download request failed: " + error.message, { cause: error });
    }
    if ((response.status === 429 || response.status === 503) && attempt < 2) {
      clearTimeout(timer);
      const raw = response.headers.get("retry-after");
      let delay = null;
      if (raw) {
        const seconds = Number(raw);
        delay = Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds * 1000) : Math.max(0, Date.parse(raw) - Date.now());
        if (!Number.isFinite(delay)) delay = null;
      }
      delay ??= Math.max(5_000, 1_000 * (2 ** attempt));
      await response.body?.cancel().catch(() => {});
      if (delay > 60_000) {
        throw new ProviderError("Provider requested a retry delay of " + Math.ceil(delay / 1000) +
          " seconds; stopping without retrying early.", { status: response.status, retryAfterMs: delay });
      }
      await sleep(delay);
      continue;
    }
    break;
  }
  try {
  if (!response) throw new ProviderError("Media provider returned no response.");
  const finalUrl = new URL(response.url || downloadUrl);
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    throw new ProviderError("Download returned HTTP " + response.status + ".");
  }
  if (finalUrl.protocol !== "https:" || !isAllowedHost(provider, finalUrl.hostname)) {
    await response.body?.cancel().catch(() => {});
    throw new ProviderError("Download redirected to an unexpected host; refusing to save it.");
  }
  const contentType = String(response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!(contentType.startsWith("video/") || [
    "application/octet-stream", "binary/octet-stream", "application/mp4",
    "application/x-matroska", "application/ogg",
  ].includes(contentType))) {
    await response.body?.cancel().catch(() => {});
    throw new ProviderError("Download response is not a recognized video or binary media type: " + (contentType || "missing Content-Type"));
  }
  const declaredSize = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredSize) && declaredSize > limit) {
    await response.body?.cancel().catch(() => {});
    throw new RangeError("Download response exceeds the configured byte limit.");
  }
  if (!response.body) throw new ProviderError("Download response has no body.");
  const handle = await open(tempPath, "wx");
  const reader = response.body.getReader();
  const hash = createHash("sha256");
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = Buffer.from(value);
      bytes += chunk.length;
      if (bytes > limit) throw new RangeError("Download exceeded the configured byte limit.");
      hash.update(chunk);
      await writeAll(handle, chunk);
    }
    await handle.sync();
  } catch (error) {
    await reader.cancel().catch(() => {});
    await handle.close().catch(() => {});
    await unlink(tempPath).catch(() => {});
    if (controller.signal.aborted) throw new ProviderError("Media download timed out while reading its body.", { cause: error });
    throw error;
  } finally {
    reader.releaseLock();
  }
  await handle.close();
  if (!bytes) {
    await unlink(tempPath).catch(() => {});
    throw new ProviderError("Downloaded file is empty.");
  }
  if (Number.isFinite(expectedSize) && expectedSize > 0 && expectedSize !== bytes) {
    await unlink(tempPath).catch(() => {});
    throw new ProviderError("Downloaded byte count differs from the freshly inspected provider size.", {
      expectedBytes: expectedSize, actualBytes: bytes,
    });
  }
  try {
    await link(tempPath, destination);
  } catch (error) {
    await unlink(tempPath).catch(() => {});
    if (error.code === "EEXIST") throw new Error("Refusing to overwrite existing file: " + destination);
    throw error;
  }
  await unlink(tempPath);
  const rights = candidate.rights;
  const entry = {
    provider,
    id: candidate.id,
    title: candidate.title,
    creator: candidate.creator || "",
    uploader: candidate.uploader || "",
    date: candidate.date || "",
    sourceUrl: candidate.sourceUrl,
    sourceFile,
    sourceDownloadUrl: downloadUrl,
    localPath: path.relative(root, destination).split(path.sep).join("/"),
    rightsStatus: candidate.rightsStatus,
    rightsEvidenceAssessment: candidate.rightsStatus === REVIEWED_EVIDENCE_STATUS ? REVIEWED_EVIDENCE_ASSESSMENT : null,
    licenseName: rights?.license?.name ?? null,
    licenseUrl: rights?.license?.url ?? null,
    rightsEvidence: rights?.evidence ?? {},
    attribution: candidate.attribution,
    accessedAt: new Date().toISOString(),
    technical: { ...technical, contentType, downloadedBytes: bytes },
    sha256: hash.digest("hex"),
    sourceInSeconds: null,
    sourceOutSeconds: null,
    modifications: [],
  };
  let manifest;
  try {
    manifest = await saveManifest(path.join(root, "archive"), entry, root);
  } catch (error) {
    await unlink(destination).catch(() => {});
    throw new Error("Download was removed because its provenance manifest could not be written: " + error.message);
  }
  return {
    provider,
    id: candidate.id,
    file: destination,
    bytes,
    sha256: entry.sha256,
    rightsStatus: candidate.rightsStatus,
    rightsEvidenceAssessment: entry.rightsEvidenceAssessment,
    attribution: candidate.attribution,
    manifest,
  };
  } finally {
    clearTimeout(timer);
  }
}

export const downloadLimits = Object.freeze({
  defaultBytes: DEFAULT_MAX_BYTES,
  absoluteMaxBytes: ABSOLUTE_MAX_BYTES,
});
