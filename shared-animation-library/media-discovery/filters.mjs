const EXT_TO_MIME = Object.freeze({
  ".mp4": "video/mp4", ".m4v": "video/mp4", ".webm": "video/webm",
  ".ogv": "video/ogg", ".ogg": "video/ogg", ".mov": "video/quicktime",
  ".avi": "video/x-msvideo", ".mkv": "video/x-matroska", ".mpg": "video/mpeg",
  ".mpeg": "video/mpeg", ".wmv": "video/x-ms-wmv", ".flv": "video/x-flv",
  ".3gp": "video/3gpp", ".ts": "video/mp2t",
});

function finiteOption(value, name, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new RangeError(name + " must be between " + min + " and " + max + ".");
  }
  return n;
}

function yearOf(value) {
  const match = String(value ?? "").match(/\b(?:18|19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function fileMime(file) {
  const raw = String(file?.mime ?? "").toLowerCase();
  if (raw.startsWith("video/")) return raw;
  const ext = String(file?.name ?? "").match(/\.[^.]+$/)?.[0]?.toLowerCase();
  return EXT_TO_MIME[ext] ?? "";
}

function matchesMime(mime, required) {
  if (!required) return true;
  const wanted = String(required).toLowerCase();
  if (wanted.endsWith("/*")) return mime.startsWith(wanted.slice(0, -1));
  return mime === wanted;
}

function numericWithin(value, min, max) {
  if (min === null && max === null) return true;
  if (value === undefined || value === null || value === "") return false;
  const number = Number(value);
  if (!Number.isFinite(number)) return false;
  return (min === null || number >= min) && (max === null || number <= max);
}

export function applyCandidateFilters(candidates, options = {}) {
  const minDuration = finiteOption(options.minDuration, "min-duration");
  const maxDuration = finiteOption(options.maxDuration, "max-duration");
  const targetDuration = finiteOption(options.durationSeconds, "duration-seconds");
  const tolerance = finiteOption(options.durationTolerance, "duration-tolerance", 0, 86_400) ?? 5;
  const minWidth = finiteOption(options.minWidth, "min-width", 1);
  const minHeight = finiteOption(options.minHeight, "min-height", 1);
  const yearFrom = finiteOption(options.yearFrom, "year-from", 1800, 2200);
  const yearTo = finiteOption(options.yearTo, "year-to", 1800, 2200);
  const mime = options.mime ? String(options.mime).trim().toLowerCase() : "";
  if (mime && !/^video\/(?:[a-z0-9.+*-]+)$/.test(mime)) {
    throw new RangeError("--mime must be a video MIME type or prefix, such as video/mp4 or video/*.");
  }
  if (minDuration !== null && maxDuration !== null && minDuration > maxDuration) throw new RangeError("--min-duration cannot exceed --max-duration.");
  if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) throw new RangeError("--year-from cannot exceed --year-to.");

  const filters = {
    minDurationSeconds: minDuration,
    maxDurationSeconds: maxDuration,
    targetDurationSeconds: targetDuration,
    targetDurationToleranceSeconds: targetDuration === null ? null : tolerance,
    minWidth: minWidth,
    minHeight: minHeight,
    yearFrom: yearFrom,
    yearTo: yearTo,
    mime: mime || null,
  };

  const matched = [];
  for (const original of candidates) {
    const year = yearOf(original.date);
    if (yearFrom !== null && (year === null || year < yearFrom)) continue;
    if (yearTo !== null && (year === null || year > yearTo)) continue;
    if (Array.isArray(original.videoFiles)) {
      const files = original.videoFiles.filter((file) => {
        const duration = file.durationSeconds ?? original.durationSeconds;
        return matchesMime(fileMime(file), mime) &&
          numericWithin(duration, minDuration, maxDuration) &&
          (targetDuration === null || (Number.isFinite(Number(duration)) &&
            Math.abs(Number(duration) - targetDuration) <= tolerance)) &&
          numericWithin(file.width ?? original.width, minWidth, null) &&
          numericWithin(file.height ?? original.height, minHeight, null);
      });
      if (files.length) matched.push({ ...original, videoFiles: files });
    } else {
      const media = original.media ?? {};
      if (!matchesMime(String(media.mime ?? "").toLowerCase(), mime) ||
          !numericWithin(media.durationSeconds, minDuration, maxDuration) ||
          (targetDuration !== null && (!Number.isFinite(Number(media.durationSeconds)) ||
            Math.abs(Number(media.durationSeconds) - targetDuration) > tolerance)) ||
          !numericWithin(media.width, minWidth, null) ||
          !numericWithin(media.height, minHeight, null)) continue;
      matched.push(original);
    }
  }
  return { candidates: matched, filters };
}
