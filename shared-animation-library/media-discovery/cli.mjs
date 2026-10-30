#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchCommons, inspectCommons } from "./commons.mjs";
import { searchInternetArchive, inspectArchive } from "./internet-archive.mjs";
import { downloadSelected, downloadLimits } from "./download.mjs";
import { applyCandidateFilters } from "./filters.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = path.resolve(HERE, "../..");

function usage() {
  return [
    "Song-local archival video discovery (read-only search/inspect; explicit download only)",
    "",
    "  node shared-animation-library/media-discovery/cli.mjs search --provider commons --query \"night stadium\" --limit 5 --contact https://your-public-contact.example",
    "  node shared-animation-library/media-discovery/cli.mjs search --provider ia --query \"night stadium\" --collection prelinger --limit 5",
    "  node shared-animation-library/media-discovery/cli.mjs inspect --provider commons --id \"File:Example.webm\" --contact https://your-public-contact.example",
    "  node shared-animation-library/media-discovery/cli.mjs inspect --provider ia --id item_identifier",
    "  node shared-animation-library/media-discovery/cli.mjs download --provider ia --id item_identifier --file \"exact source filename.mp4\" --root productions/song",
    "",
    "Options use --name value or --name=value. A contact is required for Commons and may be set with MEDIA_DISCOVERY_CONTACT.",
    "The search limit is 1–8. Internet Archive pagination uses --page; Commons pagination uses --offset.",
    "Optional filters: --mime video/mp4, --min-width, --min-height, --min-duration, --max-duration, --duration-seconds with --duration-tolerance, and --year-from/--year-to.",
    "Download rechecks item rights and file metadata, writes only under an existing song folder, refuses overwrites, and defaults to an 800 MiB limit (absolute maximum 2 GiB).",
    "No command modifies Remotion/render code or automatically adds a clip to a song config or scene.",
  ].join("\n");
}

function parseArgs(argv) {
  const result = { positionals: [], options: {} };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      result.positionals.push(...argv.slice(i + 1));
      break;
    }
    if (!arg.startsWith("--")) {
      result.positionals.push(arg);
      continue;
    }
    const equals = arg.indexOf("=");
    const key = arg.slice(2, equals < 0 ? undefined : equals);
    if (!key) throw new Error("Empty option name.");
    if (equals >= 0) result.options[key] = arg.slice(equals + 1);
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) result.options[key] = argv[++i];
    else result.options[key] = true;
  }
  return result;
}

function required(options, name) {
  const value = options[name];
  if (typeof value !== "string" || !value.trim()) throw new Error("Missing required --" + name + ".");
  return value.trim();
}

function numberOption(options, name, fallback) {
  if (options[name] === undefined) return fallback;
  const value = Number(options[name]);
  if (!Number.isSafeInteger(value)) throw new Error("--" + name + " must be an integer.");
  return value;
}

function providerName(value) {
  if (value === "ia" || value === "internet-archive" || value === "archive") return "internet-archive";
  if (value === "commons" || value === "wikimedia-commons") return "commons";
  throw new Error("--provider must be commons or ia.");
}

function output(value) {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

function filterOptions(options) {
  return {
    mime: options.mime,
    minWidth: options["min-width"],
    minHeight: options["min-height"],
    minDuration: options["min-duration"],
    maxDuration: options["max-duration"],
    durationSeconds: options["duration-seconds"],
    durationTolerance: options["duration-tolerance"],
    yearFrom: options["year-from"],
    yearTo: options["year-to"],
  };
}

function applyFiltersToResult(result, options) {
  const filtered = applyCandidateFilters(result.candidates ?? [], options);
  return {
    ...result,
    providerReturned: result.returned,
    returned: filtered.candidates.length,
    candidates: filtered.candidates,
    appliedFilters: filtered.filters,
  };
}

async function main() {
  const { positionals, options } = parseArgs(process.argv.slice(2));
  const command = positionals[0];
  if (options.help || command === "help" || !command) {
    process.stdout.write(usage() + "\n");
    return;
  }
  if (!["search", "inspect", "download"].includes(command)) {
    throw new Error("Unknown command: " + command + "\n\n" + usage());
  }
  const provider = providerName(required(options, "provider"));
  const contact = options.contact || process.env.MEDIA_DISCOVERY_CONTACT;
  if (command === "search") {
    const query = required(options, "query");
    const limit = numberOption(options, "limit", 5);
    if (provider === "commons") {
      const result = await searchCommons({
        query, limit, offset: numberOption(options, "offset", 0), contact,
      });
      output(applyFiltersToResult(result, filterOptions(options)));
    } else {
      const result = await searchInternetArchive({
        query, limit, page: numberOption(options, "page", 1), collection: options.collection,
      });
      output(applyFiltersToResult(result, filterOptions(options)));
    }
    return;
  }
  const id = required(options, "id");
  if (command === "inspect") {
    output(provider === "commons"
      ? await inspectCommons({ title: id, contact })
      : await inspectArchive({ identifier: id }));
    return;
  }
  const root = required(options, "root");
  const fileName = provider === "internet-archive" ? required(options, "file") : undefined;
  const maxBytes = numberOption(options, "max-bytes", downloadLimits.defaultBytes);
  output(await downloadSelected({
    provider, id, fileName, productionRoot: root, kitRoot: KIT_ROOT, contact, maxBytes,
  }));
}

main().catch((error) => {
  process.stderr.write("media-discovery: " + error.message + "\n");
  process.exitCode = 1;
});
