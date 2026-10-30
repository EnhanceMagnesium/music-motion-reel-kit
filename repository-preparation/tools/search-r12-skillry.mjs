#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(
  scriptDir,
  '../../repository-downloads/yihui-dev/awesome-opus5-5-videos-20261026',
);

function fail(message) {
  console.error(`search-r12-skillry: ${message}`);
  console.error('Usage: node repository-preparation/tools/search-r12-skillry.mjs [--root=PATH] [--limit=N] "scene or technique terms"');
  process.exit(2);
}

let root = defaultRoot;
let limit = 12;
const queryParts = [];
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--root=')) root = path.resolve(process.cwd(), arg.slice('--root='.length));
  else if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length));
  else if (arg.startsWith('--')) fail(`unknown option ${arg}`);
  else queryParts.push(arg);
}

const query = queryParts.join(' ').trim();
if (!query) fail('provide one or more scene or technique terms');
if (!Number.isInteger(limit) || limit < 1 || limit > 50) fail('--limit must be an integer from 1 to 50');

const jsonPath = path.join(root, 'data/videos.json');
if (!fs.existsSync(jsonPath)) fail(`catalog not found: ${jsonPath}`);
const records = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
if (!Array.isArray(records)) fail(`expected an array in ${jsonPath}`);

const terms = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])];
const matches = records.map((record) => {
  const tags = Array.isArray(record.tech_tags) ? record.tech_tags : [];
  const fields = {
    tech_tags: tags.join(' ').toLowerCase(),
    category: String(record.category ?? '').toLowerCase(),
    slug_author: `${record.slug ?? ''} ${record.author ?? ''}`.toLowerCase(),
    prompt: String(record.prompt ?? '').toLowerCase(),
  };
  const matchedTerms = [];
  let score = 0;
  for (const term of terms) {
    let termScore = 0;
    if (fields.tech_tags.split(/\s+/u).includes(term)) termScore += 6;
    if (fields.category.split(/\s+/u).includes(term)) termScore += 4;
    if (fields.slug_author.includes(term)) termScore += 3;
    if (fields.prompt.includes(term)) termScore += 1;
    if (termScore) {
      score += termScore;
      matchedTerms.push(term);
    }
  }
  const promptPath = path.join(root, 'prompts', `${record.slug}.md`);
  return {
    score,
    matched_terms: matchedTerms,
    slug: record.slug,
    author: record.author,
    category: record.category,
    tech_tags: tags,
    prompt_partial: Boolean(record.prompt_partial),
    has_remake: Boolean(record.has_remake),
    prompt_file: fs.existsSync(promptPath) ? path.relative(process.cwd(), promptPath) : null,
    skillry_url: record.skillry_url ?? null,
    creator_post_url: record.post_url ?? null,
    prompt_excerpt: String(record.prompt ?? '').replace(/\s+/gu, ' ').trim().slice(0, 420),
  };
}).filter((record) => record.score > 0)
  .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
  .slice(0, limit);

console.log(JSON.stringify({
  query,
  catalog_root: root,
  catalog_records: records.length,
  result_count: matches.length,
  ranking: 'Exact technology-tag match > category > creator/slug > prompt text; all matching terms add score.',
  tag_scope_note: 'A technology tag may describe a Skillry remake. Read the local prompt file and creator source before attributing a technique to the original creator or adapting any code.',
  rights_note: 'The catalog license covers its authored compilation, not creator videos, linked code, music, images, or other assets.',
  matches,
}, null, 2));
