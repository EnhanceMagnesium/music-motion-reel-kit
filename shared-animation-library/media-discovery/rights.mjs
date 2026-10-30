const ALLOWED_CC_BY = new Set(["1.0", "2.0", "2.5", "3.0", "4.0"]);

function htmlText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:p|div|li)>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

export function extmetaValue(extmetadata, key) {
  const entry = extmetadata?.[key];
  if (entry === undefined || entry === null) return "";
  const value = typeof entry === "object" && "value" in entry ? entry.value : entry;
  return htmlText(value);
}

function normalizeUrl(value) {
  const text = htmlText(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

function classifyUrl(value) {
  const url = normalizeUrl(value);
  if (!url) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.toLowerCase().split("/").filter(Boolean);
  if ((host === "creativecommons.org" || host.endsWith(".creativecommons.org")) &&
      parts[0] === "publicdomain" && parts[1] === "zero" && parts[2] === "1.0") {
    return { kind: "cc0", key: "CC0-1.0", name: "CC0 1.0 Universal", url: url.href };
  }
  if ((host === "creativecommons.org" || host.endsWith(".creativecommons.org")) &&
      parts[0] === "publicdomain" && parts[1] === "mark" && parts[2] === "1.0") {
    return { kind: "public-domain", key: "PDM-1.0", name: "Public Domain Mark 1.0", url: url.href };
  }
  if ((host === "creativecommons.org" || host.endsWith(".creativecommons.org")) &&
      parts[0] === "licenses" && parts[1] === "publicdomain" && parts.length === 2) {
    return {
      kind: "public-domain",
      key: "PUBLIC-DOMAIN-LEGACY-CC-URI",
      name: "Public Domain (legacy Creative Commons URI)",
      url: url.href,
    };
  }
  if ((host === "creativecommons.org" || host.endsWith(".creativecommons.org")) &&
      parts[0] === "licenses") {
    const code = parts[1];
    const version = parts[2];
    if (code === "by" && ALLOWED_CC_BY.has(version)) {
      return { kind: "cc-by", key: "CC-BY-" + version, name: "CC BY " + version, url: url.href };
    }
    if (["by-sa", "by-nc", "by-nd", "by-nc-sa", "by-nc-nd"].includes(code)) {
      return { kind: "not-allowed", key: code.toUpperCase(), name: code.toUpperCase(), url: url.href };
    }
    return { kind: "unknown", key: "unknown:" + url.href, name: url.href, url: url.href };
  }
  return null;
}

function classifyText(value) {
  const text = htmlText(value);
  if (!text) return null;
  const normalized = text.toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ");
  if (/creative commons attribution[- ]share[- ]alike|creative commons attribution[- ]non[- ]commercial|creative commons attribution[- ]no[- ]derivatives/.test(normalized)) {
    return { kind: "not-allowed", key: "RESTRICTED-CC", name: "Creative Commons license outside project allowlist", url: null };
  }
  const spelledCcBy = normalized.match(/creative commons attribution(?:\s|[-])[^.]{0,80}?\b(1\.0|2\.0|2\.5|3\.0|4\.0)\b/);
  if (spelledCcBy) {
    return { kind: "cc-by", key: "CC-BY-" + spelledCcBy[1], name: "CC BY " + spelledCcBy[1],
      url: "https://creativecommons.org/licenses/by/" + spelledCcBy[1] + "/" };
  }
  if (/\b(public domain|public-domain)\b/.test(normalized) ||
      /\bno known copyright restrictions\b/.test(normalized)) {
    return { kind: "public-domain", key: "PUBLIC-DOMAIN-DECLARED", name: "Public domain (item statement)", url: null };
  }
  if (/\bcc\s*0\b|\bcc0\b/.test(normalized)) {
    return { kind: "cc0", key: "CC0-1.0", name: "CC0 (item statement)", url: null };
  }
  const ccBy = normalized.match(/\bcc\s*by(?:\s+|[- ])(1\.0|2\.0|2\.5|3\.0|4\.0)\b/);
  if (ccBy) return { kind: "cc-by", key: "CC-BY-" + ccBy[1], name: "CC BY " + ccBy[1],
    url: "https://creativecommons.org/licenses/by/" + ccBy[1] + "/" };
  if (/\bcc\s*by(?:-|\s+)sa\b|\bcc\s*by(?:-|\s+)nc\b|\bcc\s*by(?:-|\s+)nd\b|\bby-nc-sa\b|\bby-nc-nd\b/.test(normalized)) {
    return { kind: "not-allowed", key: "RESTRICTED-CC", name: "Creative Commons license outside project allowlist", url: null };
  }
  if (/\ball rights reserved\b|\bcopyrighted\b|\bpermission required\b/.test(normalized)) {
    return { kind: "not-allowed", key: "RESTRICTED", name: "Rights statement is not on the project allowlist", url: null };
  }
  if (/creative commons|creativecommons|cc-by|cc0|public domain|public-domain/.test(normalized)) {
    return { kind: "unknown", key: "unknown:" + normalized, name: text, url: null };
  }
  return null;
}

function getRaw(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return typeof value === "object" && "value" in value ? value.value : value;
    }
  }
  return "";
}

function resolveRights(signals, { creator, title, sourceUrl }) {
  const recognized = signals.filter(Boolean);
  if (recognized.some((signal) => signal.kind === "not-allowed")) {
    return {
      status: "not_allowed",
      license: recognized.find((signal) => signal.kind === "not-allowed"),
      reason: "At least one item-level rights field names a license or restriction outside the project allowlist.",
    };
  }
  const accepted = recognized.filter((signal) => ["public-domain", "cc0", "cc-by"].includes(signal.kind));
  const unknown = recognized.filter((signal) => signal.kind === "unknown");
  const identity = (signal) => signal.kind === "public-domain" ? "PUBLIC-DOMAIN"
    : signal.kind === "cc0" ? "CC0-1.0" : signal.key;
  if (unknown.length || (accepted.length && new Set(accepted.map(identity)).size > 1)) {
    return {
      status: "rights_unverified",
      license: accepted[0] ?? unknown[0] ?? null,
      reason: "Rights fields are incomplete, use an unrecognized license, or conflict; do not download for production.",
    };
  }
  if (!accepted.length) {
    return {
      status: "rights_unverified",
      license: null,
      reason: "No explicit item-level Public Domain, CC0, or CC BY basis was established.",
    };
  }
  const license = accepted[0];
  if (license.kind === "cc-by" && !(creator && title && sourceUrl)) {
    return {
      status: "rights_unverified",
      license,
      reason: "CC BY is declared, but creator, title, or source page is missing for required attribution.",
    };
  }
  return {
    status: "eligible",
    license,
    reason: "An item-level rights statement matches the project allowlist. The provider/uploader statement is evidence, not independent legal certification.",
  };
}

export function evaluateCommonsRights(extmetadata, context) {
  const keys = ["LicenseUrl", "LicenseShortName", "License", "UsageTerms", "Copyrighted"];
  const signals = [];
  for (const key of keys) {
    const raw = getRaw(extmetadata, [key]);
    if (!raw) continue;
    if (key === "Copyrighted") {
      const value = htmlText(raw).toLowerCase();
      if (/^(true|yes|1)$/.test(value)) {
        signals.push({ kind: "not-allowed", key: "COPYRIGHTED", name: "Marked copyrighted", url: null });
      }
      continue;
    }
    const fromUrl = key.toLowerCase().includes("url") ? classifyUrl(raw) : null;
    signals.push(fromUrl ?? classifyText(raw));
  }
  const resolved = resolveRights(signals, context);
  return {
    ...resolved,
    evidence: Object.fromEntries(keys.map((key) => [key, getRaw(extmetadata, [key])]).filter(([, value]) => value)),
    creatorEvidence: {
      artist: extmetaValue(extmetadata, "Artist"),
      credit: extmetaValue(extmetadata, "Credit"),
      attributionRequired: extmetaValue(extmetadata, "AttributionRequired"),
    },
  };
}

export function evaluateArchiveRights(metadata, context) {
  const rawUrl = getRaw(metadata, ["licenseurl", "license_url"]);
  const rawRights = getRaw(metadata, ["rights", "license", "usage"]);
  const signals = [
    rawUrl ? (classifyUrl(rawUrl) ?? classifyText(rawUrl)) : null,
    rawRights ? classifyText(rawRights) : null,
  ];
  const resolved = resolveRights(signals, context);
  return {
    ...resolved,
    evidence: {
      licenseurl: rawUrl,
      rights: rawRights,
      collection: metadata?.collection ?? [],
      uploader: metadata?.uploader ?? "",
    },
  };
}

export function buildAttribution({ rights, creator, title, sourceUrl }) {
  if (rights?.status !== "eligible") return null;
  const license = rights.license;
  if (license.kind !== "cc-by") {
    return "Rights evidence: " + license.name + ". Source: " + sourceUrl +
      ". Verify the item-level statement again before publication; no provider certification is implied.";
  }
  if (!(creator && title && sourceUrl && license.url)) return null;
  return creator + ", “" + title + ",” " + sourceUrl + ", " + license.name + " (" + license.url +
    "). Modifications: record any crop, trim, grade, mute, or other change made for this production.";
}

export function classifyLicenseForTest(value) {
  return classifyUrl(value) ?? classifyText(value);
}
