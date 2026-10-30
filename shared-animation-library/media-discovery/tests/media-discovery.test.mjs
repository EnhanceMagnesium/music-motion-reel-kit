import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildAttribution,
  evaluateArchiveRights,
  evaluateCommonsRights,
  classifyLicenseForTest,
} from "../rights.mjs";
import { normalizeCommonsPage, searchCommons } from "../commons.mjs";
import { isArchiveVideoFile, normalizeArchiveItem, searchInternetArchive } from "../internet-archive.mjs";
import { fetchJson } from "../http.mjs";
import { downloadSelected } from "../download.mjs";
import { applyCandidateFilters } from "../filters.mjs";

const ccByUrl = "https://creativecommons.org/licenses/by/4.0/";

test("rights allowlist recognizes CC0, public domain and CC BY, and rejects restricted terms", () => {
  assert.equal(classifyLicenseForTest("https://creativecommons.org/publicdomain/zero/1.0/").kind, "cc0");
  assert.equal(classifyLicenseForTest("https://creativecommons.org/publicdomain/mark/1.0/").kind, "public-domain");
  assert.equal(classifyLicenseForTest("http://creativecommons.org/licenses/publicdomain/").kind, "public-domain");
  assert.equal(classifyLicenseForTest("Creative Commons Attribution 4.0 International").kind, "cc-by");
  assert.equal(classifyLicenseForTest("CC BY-SA 4.0").kind, "not-allowed");
  assert.equal(classifyLicenseForTest("CC BY-NC 4.0").kind, "not-allowed");
  assert.equal(classifyLicenseForTest("Free to reuse"), null);
});

test("Commons rights require item evidence, reject conflicts and build complete CC BY credit", () => {
  const context = { creator: "A. Creator", title: "A film", sourceUrl: "https://commons.wikimedia.org/wiki/File:A_film.webm" };
  const allowed = evaluateCommonsRights({
    LicenseUrl: { value: ccByUrl },
    LicenseShortName: { value: "CC BY 4.0" },
    Artist: { value: "A. Creator" },
  }, context);
  assert.equal(allowed.status, "eligible");
  assert.match(buildAttribution({ rights: allowed, ...context }), /CC BY 4\.0/);

  assert.equal(evaluateCommonsRights({
    LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0/" },
    LicenseShortName: { value: "CC BY-SA 4.0" },
  }, context).status, "not_allowed");

  assert.equal(evaluateCommonsRights({
    LicenseUrl: { value: ccByUrl },
    LicenseShortName: { value: "Public domain" },
  }, context).status, "rights_unverified");

  assert.equal(evaluateCommonsRights({
    LicenseUrl: { value: ccByUrl },
    Copyrighted: { value: "true" },
  }, context).status, "not_allowed");

  assert.equal(evaluateCommonsRights({}, context).status, "rights_unverified");
});

test("Internet Archive rights treat the uploader statement as evidence and require CC BY credit", () => {
  const context = { creator: "Creator", title: "Item", sourceUrl: "https://archive.org/details/item" };
  assert.equal(evaluateArchiveRights({ rights: "Public Domain" }, context).status, "eligible");
  assert.equal(evaluateArchiveRights({ licenseurl: "http://creativecommons.org/licenses/publicdomain/" }, context).status, "eligible");
  assert.equal(evaluateArchiveRights({ licenseurl: ccByUrl }, { ...context, creator: "" }).status, "rights_unverified");
  assert.equal(evaluateArchiveRights({ licenseurl: "https://creativecommons.org/licenses/by-nc/4.0/" }, context).status, "not_allowed");
  assert.equal(evaluateArchiveRights({ rights: "Free for educational use" }, context).status, "rights_unverified");
});

test("Commons search requests only file namespace and normalizes video while excluding image files", async () => {
  let calledUrl;
  let calledHeaders;
  const data = {
    query: {
      search: [{ title: "File:Sample film.webm", snippet: "moving <span>film</span>" }],
      pages: [
        { pageid: 1, ns: 6, title: "File:Still.jpg", imageinfo: [{ mime: "image/jpeg", mediatype: "BITMAP", url: "https://upload.wikimedia.org/still.jpg" }] },
        {
          pageid: 2, ns: 6, title: "File:Sample film.webm",
          imageinfo: [{
            mime: "video/webm", mediatype: "VIDEO", url: "https://upload.wikimedia.org/sample.webm",
            descriptionurl: "https://commons.wikimedia.org/wiki/File:Sample_film.webm",
            width: 640, height: 360, size: 1234,
            commonmetadata: [{ name: "Duration", value: "00:00:09" }],
            extmetadata: {
              LicenseUrl: { value: ccByUrl }, LicenseShortName: { value: "CC BY 4.0" },
              Artist: { value: "A. Creator" }, Copyrighted: { value: "false" },
            },
          }],
        },
      ],
    },
  };
  const result = await searchCommons({
    query: "sample film", contact: "https://example.org/contact", limit: 2, offset: 0,
    request: async (url, options) => {
      calledUrl = new URL(url); calledHeaders = options.headers; return data;
    },
  });
  assert.equal(calledUrl.searchParams.get("generator"), "search");
  assert.equal(calledUrl.searchParams.get("gsrnamespace"), "6");
  assert.equal(calledUrl.searchParams.get("gsrlimit"), "2");
  assert.match(calledHeaders["User-Agent"], /https:\/\/example\.org\/contact/);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].media.durationSeconds, 9);
  assert.equal(result.candidates[0].rightsStatus, "eligible");
  assert.match(result.candidates[0].matchBasis, /No visual match/);
});

test("Commons refuses to call the API when accurate contact information is absent", async () => {
  let called = false;
  await assert.rejects(searchCommons({
    query: "test",
    request: async () => { called = true; return {}; },
  }), /No request was made/);
  assert.equal(called, false);
});

test("Internet Archive selects actual video file entries, excludes metadata and keeps missing rights unresolved", () => {
  const item = normalizeArchiveItem(
    { identifier: "test-item", title: "Test Item" },
    {
      metadata: { identifier: "test-item", title: "Test Item", creator: "Creator", runtime: "00:00:12", rights: "Public Domain" },
      files: [
        { name: "test-item_meta.xml", format: "Metadata", size: "123" },
        { name: "test-item_thumb.jpg", format: "JPEG Thumb", size: "321" },
        { name: "test-item.mp4", format: "MPEG4", size: "1024", duration: "12.5" },
      ],
    },
  );
  assert.equal(item.videoFiles.length, 1);
  assert.equal(item.videoFiles[0].name, "test-item.mp4");
  assert.equal(item.videoFiles[0].durationSeconds, 12.5);
  assert.equal(item.durationSeconds, 12);
  assert.equal(item.rightsStatus, "eligible");
  assert.equal(isArchiveVideoFile({ name: "clip.mp4", format: "MPEG4" }), true);
  assert.equal(isArchiveVideoFile({ name: "clip.xml", format: "Metadata" }), false);
});

test("Internet Archive search bounds results, quotes query text, fetches item metadata and paginates", async () => {
  const urls = [];
  const result = await searchInternetArchive({
    query: "night stadium",
    collection: "prelinger",
    limit: 1,
    page: 2,
    request: async (url) => {
      urls.push(new URL(url));
      if (url.includes("advancedsearch.php")) {
        return {
          responseHeader: { status: 0 },
          response: { numFound: 3, start: 1, docs: [{ identifier: "test-item", title: "Test Item" }] },
        };
      }
      return {
        metadata: { identifier: "test-item", title: "Test Item", creator: "Creator", rights: "Public Domain" },
        files: [{ name: "clip.mp4", format: "MPEG4", size: "20" }],
      };
    },
  });
  assert.match(urls[0].searchParams.get("q"), /collection:prelinger AND mediatype:movies AND "night stadium"/);
  assert.equal(urls[0].searchParams.get("rows"), "1");
  assert.equal(result.nextPage, 3);
  assert.equal(result.candidates[0].rightsStatus, "eligible");
  assert.equal(urls.length, 2);
});

test("optional filters match only known MIME, dimensions, durations and dates", () => {
  const input = [
    {
      id: "good", date: "1932", videoFiles: [{
        name: "march.mp4", durationSeconds: 12, width: 1920, height: 1080,
      }],
    },
    {
      id: "unknown-duration", date: "1932", videoFiles: [{
        name: "unknown.mp4", width: 1920, height: 1080,
      }],
    },
    {
      id: "wrong-date", date: "1980", videoFiles: [{
        name: "later.mp4", durationSeconds: 12, width: 1920, height: 1080,
      }],
    },
  ];
  const result = applyCandidateFilters(input, {
    mime: "video/mp4",
    minWidth: 1280,
    minHeight: 720,
    durationSeconds: 12,
    durationTolerance: 1,
    yearFrom: 1930,
    yearTo: 1940,
  });
  assert.deepEqual(result.candidates.map((candidate) => candidate.id), ["good"]);
  assert.equal(result.filters.targetDurationToleranceSeconds, 1);
  assert.throws(() => applyCandidateFilters(input, { minDuration: 20, maxDuration: 10 }), /cannot exceed/);
});

test("HTTP client honors Retry-After and enforces response size limits", async () => {
  const sleeps = [];
  let calls = 0;
  const result = await fetchJson("https://example.org/api", {
    cache: false,
    sleep: async (ms) => sleeps.push(ms),
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) return new Response("", { status: 503, headers: { "retry-after": "2" } });
      return new Response('{"ok":true}', { status: 200, headers: { "content-type": "application/json" } });
    },
  });
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(sleeps, [2000]);
  await assert.rejects(fetchJson("https://example.org/large", {
    cache: false, maxBytes: 5,
    fetchImpl: async () => new Response('{"large":true}', { status: 200 }),
  }), /size limit/);
});

test("HTTP timeout remains active while a provider response body is stalled", async () => {
  await assert.rejects(fetchJson("https://example.org/stalled", {
    cache: false,
    timeoutMs: 15,
    fetchImpl: async (_url, { signal }) => new Response(new ReadableStream({
      start(controller) {
        signal.addEventListener("abort", () => controller.error(new Error("aborted")), { once: true });
      },
    }), { status: 200 }),
  }), /request timed out/);
});

test("selected download uses a fresh rights lookup, writes only into the song, records provenance and refuses overwrite", async () => {
  const kitRoot = await mkdtemp(path.join(os.tmpdir(), "media-discovery-test-"));
  const songRoot = path.join(kitRoot, "productions", "fixture-song");
  await mkdir(songRoot, { recursive: true });
  await writeFile(path.join(songRoot, "config.js"), "export const PROJECT = {};\n");
  const apiResponse = {
    metadata: {
      identifier: "fixture-item",
      title: "Fixture clip",
      creator: "Fixture creator",
      rights: "Public Domain",
      collection: ["prelinger"],
    },
    files: [{ name: "fixture.mp4", format: "MPEG4", size: "8", duration: "2" }],
  };
  let apiCalls = 0;
  let downloadCalls = 0;
  const request = async (_url, options) => {
    apiCalls += 1;
    assert.equal(options.cache, false, "download must bypass cached metadata");
    return apiResponse;
  };
  const fetchImpl = async (url) => {
    downloadCalls += 1;
    assert.match(url, /archive\.org\/download\/fixture-item\/fixture\.mp4$/);
    return new Response(Buffer.from("fixture!"), {
      status: 200,
      headers: { "content-type": "video/mp4", "content-length": "8" },
    });
  };
  try {
    const result = await downloadSelected({
      provider: "internet-archive",
      id: "fixture-item",
      fileName: "fixture.mp4",
      productionRoot: "productions/fixture-song",
      kitRoot,
      request,
      fetchImpl,
    });
    assert.equal(result.bytes, 8);
    assert.equal(result.rightsStatus, "eligible");
    assert.equal(apiCalls, 1);
    assert.equal(downloadCalls, 1);
    assert.match(result.file, /productions\/fixture-song\/public\/archive\//);
    const local = await readFile(result.file);
    assert.equal(local.toString(), "fixture!");
    const manifest = JSON.parse(await readFile(result.manifest.jsonPath, "utf8"));
    assert.equal(manifest.entries.length, 1);
    assert.equal(manifest.entries[0].sha256, result.sha256);
    assert.match(await readFile(result.manifest.markdownPath, "utf8"), /Public Domain/);

    await assert.rejects(downloadSelected({
      provider: "internet-archive",
      id: "fixture-item",
      fileName: "fixture.mp4",
      productionRoot: "productions/fixture-song",
      kitRoot,
      request,
      fetchImpl,
    }), /Refusing to overwrite/);
    assert.equal(downloadCalls, 1);
  } finally {
    await rm(kitRoot, { recursive: true, force: true });
  }
});

test("selected download refuses unknown rights before requesting the media file", async () => {
  const kitRoot = await mkdtemp(path.join(os.tmpdir(), "media-discovery-rights-test-"));
  const songRoot = path.join(kitRoot, "productions", "fixture-song");
  await mkdir(songRoot, { recursive: true });
  await writeFile(path.join(songRoot, "config.js"), "export const PROJECT = {};\n");
  let downloadCalls = 0;
  try {
    await assert.rejects(downloadSelected({
      provider: "internet-archive",
      id: "fixture-item",
      fileName: "fixture.mp4",
      productionRoot: "productions/fixture-song",
      kitRoot,
      request: async () => ({
        metadata: { identifier: "fixture-item", title: "Fixture", rights: "Unknown" },
        files: [{ name: "fixture.mp4", format: "MPEG4", size: "8" }],
      }),
      fetchImpl: async () => { downloadCalls += 1; return new Response("x"); },
    }), /Download blocked/);
    assert.equal(downloadCalls, 0);
  } finally {
    await rm(kitRoot, { recursive: true, force: true });
  }
});

test("media download timeout covers the response body and removes partial output", async () => {
  const kitRoot = await mkdtemp(path.join(os.tmpdir(), "media-discovery-timeout-test-"));
  const songRoot = path.join(kitRoot, "productions", "fixture-song");
  await mkdir(songRoot, { recursive: true });
  await writeFile(path.join(songRoot, "config.js"), "export const PROJECT = {};\n");
  try {
    await assert.rejects(downloadSelected({
      provider: "internet-archive",
      id: "fixture-item",
      fileName: "fixture.mp4",
      productionRoot: "productions/fixture-song",
      kitRoot,
      downloadTimeoutMs: 15,
      request: async () => ({
        metadata: { identifier: "fixture-item", title: "Fixture", rights: "Public Domain" },
        files: [{ name: "fixture.mp4", format: "MPEG4", size: "8" }],
      }),
      fetchImpl: async (_url, { signal }) => new Response(new ReadableStream({
        start(controller) {
          signal.addEventListener("abort", () => controller.error(new Error("aborted")), { once: true });
        },
      }), { status: 200, headers: { "content-type": "video/mp4" } }),
    }), /timed out while reading its body/);
    assert.deepEqual(await readdir(path.join(songRoot, "public", "archive")), []);
  } finally {
    await rm(kitRoot, { recursive: true, force: true });
  }
});

test("archive download URLs reject unsafe identifiers and file paths", async () => {
  const { archiveDownloadUrl } = await import("../internet-archive.mjs");
  assert.throws(() => archiveDownloadUrl("../outside", "clip.mp4"), /identifier/);
  assert.throws(() => archiveDownloadUrl("valid-id", "../outside.mp4"), /safe item path/);
});
