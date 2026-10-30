import { buildAttribution, evaluateArchiveRights } from "./rights.mjs";
import { fetchJson, ProviderError } from "./http.mjs";

const SEARCH_URL = "https://archive.org/advancedsearch.php";
const METADATA_BASE = "https://archive.org/metadata/";
const VIDEO_EXT = /\.(?:mp4|m4v|webm|ogv|ogg|mov|avi|mkv|mpg|mpeg|wmv|flv|3gp|ts)$/i;
const VIDEO_FORMAT = /^(mpeg[- ]?4|mpeg[- ]?2|mpeg[- ]?1|h\.?264|h\.?265|matroska|webm|quicktime|avi|windows media|ogv|ogg video)(?:\b|$)/i;

function text(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join("; ");
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+/g, " ").trim();
}

function validateId(identifier) {
  const id = String(identifier ?? "").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(id)) {
    throw new RangeError("Internet Archive identifier contains unsupported characters.");
  }
  return id;
}

function toPositiveNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseDuration(value) {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parts = String(value).trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2}(?:\.\d+)?)$/);
  if (!parts) return null;
  return Number(parts[1] ?? 0) * 3600 + Number(parts[2]) * 60 + Number(parts[3]);
}

export function isArchiveVideoFile(file) {
  const name = String(file?.name ?? "");
  const format = String(file?.format ?? "");
  const source = String(file?.source ?? "");
  if (file?.private === "true" || file?.private === true) return false;
  if (VIDEO_EXT.test(name)) return true;
  if (VIDEO_FORMAT.test(format)) return true;
  return /original/i.test(source) && VIDEO_EXT.test(name);
}

function archiveFileUrl(identifier, fileName) {
  const id = validateId(identifier);
  const file = String(fileName ?? "");
  if (!file || file.length > 500 || file.startsWith("/") || file.includes("\\") ||
      file.split("/").some((part) => part === ".." || part === ".")) {
    throw new RangeError("Internet Archive file name is not a safe item path.");
  }
  const encoded = file.split("/").map(encodeURIComponent).join("/");
  return "https://archive.org/download/" + encodeURIComponent(id) + "/" + encoded;
}

function normalizeFile(file, identifier) {
  const name = String(file.name ?? "");
  const length = toPositiveNumber(file.length);
  const sizeBytes = toPositiveNumber(file.size);
  const duration = parseDuration(file.duration);
  return {
    name,
    format: text(file.format),
    mime: text(file.mimetype ?? file.mime),
    sizeBytes,
    durationSeconds: duration,
    durationEvidence: duration === null ? null : "Internet Archive per-file duration field",
    rawLengthField: file.length ?? null,
    width: toPositiveNumber(file.width),
    height: toPositiveNumber(file.height),
    downloadUrl: archiveFileUrl(identifier, name),
    sourceFlag: text(file.source),
  };
}

export function normalizeArchiveItem(searchDoc, metadata) {
  const itemMeta = metadata?.metadata ?? {};
  const identifier = validateId(metadata?.metadata?.identifier ?? searchDoc?.identifier);
  const title = text(itemMeta.title ?? searchDoc?.title ?? identifier);
  const sourceUrl = "https://archive.org/details/" + encodeURIComponent(identifier);
  const creator = text(itemMeta.creator ?? itemMeta.artist ?? searchDoc?.creator);
  const itemDuration = parseDuration(itemMeta.runtime ?? itemMeta.duration);
  const rights = evaluateArchiveRights(itemMeta, { creator, title, sourceUrl });
  const files = (metadata?.files ?? []).filter(isArchiveVideoFile).map((file) => normalizeFile(file, identifier))
    .filter((file) => file.sizeBytes === null || file.sizeBytes > 0);
  return {
    provider: "internet-archive",
    id: identifier,
    title,
    description: text(itemMeta.description ?? searchDoc?.description),
    creator,
    uploader: text(itemMeta.uploader),
    date: text(itemMeta.date ?? searchDoc?.date),
    durationSeconds: itemDuration,
    durationEvidence: itemDuration === null ? null : "Internet Archive item runtime/duration metadata",
    collection: text(itemMeta.collection ?? searchDoc?.collection),
    sourceUrl,
    previewUrl: sourceUrl,
    thumbnailUrl: "https://archive.org/services/img/" + encodeURIComponent(identifier),
    matchBasis: "Internet Archive Advanced Search over mediatype:movies; provider search ordering. No visual match was evaluated.",
    rightsStatus: rights.status,
    rights,
    attribution: buildAttribution({ rights, creator, title, sourceUrl }),
    videoFiles: files,
  };
}

function positiveInt(value, name, min, max) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw new RangeError(name + " must be an integer between " + min + " and " + max + ".");
  }
  return number;
}

function quoteSearchText(query) {
  return '"' + String(query).trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

export async function getArchiveMetadata({ identifier, request = fetchJson, requestOptions = {} }) {
  const id = validateId(identifier);
  const url = METADATA_BASE + encodeURIComponent(id);
  const data = await request(url, { headers: { Accept: "application/json" }, ...requestOptions });
  if (data?.error || !data?.metadata) {
    throw new ProviderError("Internet Archive item metadata unavailable for " + id + ": " +
      String(data?.error ?? "missing metadata"));
  }
  return data;
}

export async function searchInternetArchive({
  query, page = 1, limit = 5, collection, request = fetchJson, requestOptions = {},
}) {
  const searchText = String(query ?? "").trim();
  if (!searchText || searchText.length > 300) throw new RangeError("Internet Archive query must contain 1–300 characters.");
  const boundedPage = positiveInt(page, "page", 1, 10_000);
  const boundedLimit = positiveInt(limit, "limit", 1, 8);
  const clauses = ["mediatype:movies", quoteSearchText(searchText)];
  const collectionName = String(collection ?? "").trim();
  if (collectionName) {
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(collectionName)) throw new RangeError("Invalid collection identifier.");
    clauses.unshift("collection:" + collectionName);
  }
  const url = new URL(SEARCH_URL);
  const params = url.searchParams;
  params.set("q", clauses.join(" AND "));
  for (const field of ["identifier", "title", "date", "creator", "description", "collection", "mediatype"]) {
    params.append("fl[]", field);
  }
  params.set("rows", String(boundedLimit));
  params.set("page", String(boundedPage));
  params.set("output", "json");
  const data = await request(url.href, { headers: { Accept: "application/json" }, ...requestOptions });
  if (data?.responseHeader?.status !== undefined && data.responseHeader.status !== 0) {
    throw new ProviderError("Internet Archive Advanced Search returned status " + data.responseHeader.status + ".");
  }
  const docs = data?.response?.docs ?? [];
  const candidates = [];
  for (const doc of docs) {
    if (!doc?.identifier) continue;
    try {
      const metadata = await getArchiveMetadata({ identifier: doc.identifier, request, requestOptions });
      const candidate = normalizeArchiveItem(doc, metadata);
      if (candidate.videoFiles.length) candidates.push(candidate);
    } catch (error) {
      candidates.push({
        provider: "internet-archive",
        id: String(doc.identifier),
        title: text(doc.title ?? doc.identifier),
        sourceUrl: "https://archive.org/details/" + encodeURIComponent(String(doc.identifier)),
        previewUrl: "https://archive.org/details/" + encodeURIComponent(String(doc.identifier)),
        matchBasis: "Search result only; metadata lookup failed, so media type and rights remain unverified.",
        rightsStatus: "rights_unverified",
        error: error.message,
        videoFiles: [],
      });
    }
  }
  return {
    provider: "internet-archive",
    query: searchText,
    collection: collectionName || null,
    page: boundedPage,
    totalHits: data?.response?.numFound ?? null,
    returned: candidates.length,
    candidates,
    nextPage: docs.length === boundedLimit && (data?.response?.start ?? 0) + docs.length < (data?.response?.numFound ?? 0)
      ? boundedPage + 1 : null,
    note: "Internet Archive rights fields may be uploader-supplied and are not certified by the Archive. Search metadata is not visual review.",
  };
}

export async function inspectArchive({ identifier, request = fetchJson, requestOptions = {} }) {
  const metadata = await getArchiveMetadata({ identifier, request, requestOptions });
  return normalizeArchiveItem({ identifier }, metadata);
}

export function archiveDownloadUrl(identifier, fileName) {
  return archiveFileUrl(identifier, fileName);
}
