// manifest.mjs — the files a production DECLARES (modules, cue module, assets, fonts), as one flat list.
// Pure (no fs, no DOM). Used by export/cache-identity.mjs (to hash them) and production/production-host.mjs (to load them), so the
// declaration that is loaded is exactly the declaration that invalidates the frame cache. Paths are relative to the config.js folder.
const base = (p) => p.replace(/^.*\//, "").replace(/\.[^.]+$/, "");

/** project: normalized PROJECT. -> [{kind:'module'|'cues'|'asset'|'font', id, src, type?, assetKind?, face?}] in declaration order (modules in moduleLoadOrder). */
export function declaredFiles(project) {
  const out = [], byId = new Map((project.modules || []).map((m) => [m.id, m]));
  for (const id of project.moduleLoadOrder || []) { const m = byId.get(id); out.push({ kind: "module", id: m.id, src: m.src, type: m.type }); }
  if (project.cues && project.cues.module) out.push({ kind: "cues", id: "cues", src: project.cues.module, type: "module" });
  for (const a of project.assets || []) typeof a === "string" ? out.push({ kind: "asset", id: a, src: a, assetKind: "other" }) : out.push({ kind: "asset", id: a.id, src: a.src, assetKind: a.kind || "other" });
  for (const f of project.fonts || []) {
    const face = typeof f === "string" ? { family: base(f), weight: undefined, style: undefined, unicodeRange: undefined } : f;
    out.push({ kind: "font", id: `${face.family}|${face.weight ?? ""}|${face.style ?? ""}|${face.unicodeRange ?? ""}`, src: typeof f === "string" ? f : f.src, face });
  }
  return out;
}
