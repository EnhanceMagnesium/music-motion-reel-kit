import { buildAttribution, evaluateCommonsRights, extmetaValue } from "./rights.mjs";
import { fetchJson, ProviderError } from "./http.mjs";

const API = "https://commons.wikimedia.org/w/api.php";
const VIDEO_EXT = /\.(?:mp4|m4v|webm|ogv|ogg|mov|avi|mkv|mpg|mpeg|wmv|flv|3gp)$/i;
const USER_AGENT_NAME = "MusicMotionReelKitMediaDiscovery/1.0";
const EXT_KEYS = "License|LicenseShortName|LicenseUrl|UsageTerms|Artist|Credit|AttributionRequired|Copyrighted";

export function validContact(contact) {
  const value = String(contact ?? "").trim();
  if (!value || /[()\r\n]/.test(value)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

export function commonsHeaders(contact) {
  if (!validContact(contact)) {
    throw new ProviderError("Commons requests need --contact=<public URL or email> for a compliant descriptive User-Agent. No request was made.");
  }
  return {
    "User-Agent": USER_AGENT_NAME + " (" + String(contact).trim() + ")",
    "Accept": "application/json",
  };
}

function cleanSnippet(text) {
  return String(text ?? "").replace(/<[^>]*>/g, " ").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+/g, " ").trim();
}

function durationFromMetadata(info) {
  const entries = [...(info?.commonmetadata ?? []), ...(info?.metadata ?? [])];
  const duration = entries.find((entry) => /duration/i.test(entry?.name ?? ""));
  if (!duration?.value) return null;
  const value = Array.isArray(duration.value) ? duration.value[0] : duration.value;
  const number = Number(String(value).replace(/s$/i, ""));
  if (Number.isFinite(number)) return number;
  const hms = String(value).match(/^(?:(\d+):)?(\d{1,2}):(\d{2}(?:\.\d+)?)$/);
  if (!hms) return null;
  return Number(hms[1] ?? 0) * 3600 + Number(hms[2]) * 60 + Number(hms[3]);
}

export function normalizeCommonsPage(page, snippet = "") {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const mime = String(info.mime ?? "").toLowerCase();
  const isVideo = String(info.mediatype ?? "").toUpperCase() === "VIDEO" || mime.startsWith("video/") ||
    VIDEO_EXT.test(info.url ?? page.title ?? "");
  if (!isVideo) return null;
  const sourceUrl = info.descriptionurl ?? "https://commons.wikimedia.org/wiki/" + encodeURIComponent(page.title);
  const creator = extmetaValue(info.extmetadata, "Artist") || extmetaValue(info.extmetadata, "Credit");
  const title = page.title?.replace(/^File:/, "") ?? "";
  const rights = evaluateCommonsRights(info.extmetadata, { creator, title, sourceUrl });
  const durationSeconds = durationFromMetadata(info);
  return {
    provider: "commons",
    id: page.title,
    fileName: title,
    title,
    description: extmetaValue(info.extmetadata, "ImageDescription") || cleanSnippet(snippet),
    creator,
    date: extmetaValue(info.extmetadata, "DateTimeOriginal") || extmetaValue(info.extmetadata, "DateTime"),
    sourceUrl,
    downloadUrl: info.url ?? null,
    previewUrl: sourceUrl,
    thumbnailUrl: info.thumburl ?? null,
    media: {
      mime,
      mediaType: info.mediatype ?? null,
      width: info.width ?? null,
      height: info.height ?? null,
      sizeBytes: info.size ?? null,
      durationSeconds,
      durationRaw: durationSeconds === null ? null : undefined,
    },
    matchBasis: "Wikimedia Commons file-page full-text search; provider search ordering. No visual match was evaluated.",
    rightsStatus: rights.status,
    rights,
    attribution: buildAttribution({ rights, creator, title, sourceUrl }),
  };
}

function positiveInt(value, name, max) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0 || number > max) {
    throw new RangeError(name + " must be an integer between 0 and " + max + ".");
  }
  return number;
}

export async function searchCommons({
  query, limit = 5, offset = 0, contact, request = fetchJson, requestOptions = {},
}) {
  const text = String(query ?? "").trim();
  if (!text || text.length > 300) throw new RangeError("Commons query must contain 1–300 characters.");
  const boundedLimit = positiveInt(limit, "limit", 8);
  if (boundedLimit < 1) throw new RangeError("limit must be at least 1.");
  const boundedOffset = positiveInt(offset, "offset", 10_000);
  const headers = commonsHeaders(contact);
  const url = new URL(API);
  const params = url.searchParams;
  params.set("action", "query");
  params.set("format", "json");
  params.set("formatversion", "2");
  params.set("utf8", "1");
  params.set("generator", "search");
  params.set("gsrsearch", text);
  params.set("gsrnamespace", "6");
  params.set("gsrlimit", String(boundedLimit));
  if (boundedOffset) params.set("gsroffset", String(boundedOffset));
  params.set("prop", "imageinfo");
  params.set("iiprop", "url|size|mime|mediatype|extmetadata|commonmetadata");
  params.set("iiurlwidth", "640");
  params.set("iiextmetadatafilter", EXT_KEYS);
  params.set("iimetadataversion", "2");
  const data = await request(url.href, { headers, ...requestOptions });
  if (data?.error) throw new ProviderError("Commons API error: " + (data.error.info ?? data.error.code ?? "unknown"));
  const pages = Array.isArray(data?.query?.pages) ? data.query.pages : Object.values(data?.query?.pages ?? {});
  const snippets = new Map((data?.query?.search ?? []).map((item) => [item.title, item.snippet]));
  const candidates = pages.map((page) => normalizeCommonsPage(page, snippets.get(page.title))).filter(Boolean);
  return {
    provider: "commons",
    query: text,
    returned: candidates.length,
    candidates,
    nextOffset: data?.continue?.gsroffset ?? null,
    continuation: data?.continue ?? null,
    note: "Search metadata is not visual review. Rights may be free text; only eligible statuses pass the download gate.",
  };
}

export async function inspectCommons({ title, contact, request = fetchJson, requestOptions = {} }) {
  const fileTitle = String(title ?? "").startsWith("File:") ? String(title) : "File:" + String(title ?? "");
  if (fileTitle.length > 300 || fileTitle === "File:") throw new RangeError("A Commons file title is required.");
  const headers = commonsHeaders(contact);
  const url = new URL(API);
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    titles: fileTitle,
    prop: "imageinfo",
    iiprop: "url|size|mime|mediatype|extmetadata|commonmetadata",
    iiurlwidth: "640",
    iiextmetadatafilter: EXT_KEYS,
    iimetadataversion: "2",
  }).toString();
  const data = await request(url.href, { headers, ...requestOptions });
  if (data?.error) throw new ProviderError("Commons API error: " + (data.error.info ?? data.error.code ?? "unknown"));
  const pages = Array.isArray(data?.query?.pages) ? data.query.pages : Object.values(data?.query?.pages ?? {});
  const candidate = pages.map((page) => normalizeCommonsPage(page)).find(Boolean);
  if (!candidate) throw new ProviderError("The Commons file was missing, unavailable, or was not identified as video.");
  return candidate;
}
