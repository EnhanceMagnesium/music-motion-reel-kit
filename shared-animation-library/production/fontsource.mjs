// fontsource.mjs — Node-side authoring helper: turn an installed @fontsource package's own CSS into font-manifest entries for PROJECT.fonts.
// It READS the package's `<weight>[-italic].css` and returns {family, src, weight, style, unicodeRange, subset} with `src` relative to the production's
// config folder, for pasting into config.js. It does not copy binaries and does not check glyph coverage: the package splits each family into
// unicode-range subsets (latin, latin-ext, cyrillic, ...); the declared `unicodeRange` is what the PACKAGE claims, not a cmap check of the font file.
// The recorded local install is repository-preparation/additional-resources/javascript/node_modules/@fontsource (see ADDITIONAL_RESOURCE_INSTALLS.csv).
import { readFileSync, existsSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";

export function parseFontsourceCss(css, pkgDir) {
  const faces = [];
  for (const m of css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)) {
    const body = m[2], get = (k) => (body.match(new RegExp(`${k}\\s*:\\s*([^;]+);`)) || [])[1]?.trim();
    const woff2 = (body.match(/url\(\s*([^)]+?)\s*\)\s*format\(\s*['"]woff2['"]\s*\)/) || [])[1];
    if (!woff2) continue;
    faces.push({ comment: m[1], family: get("font-family").replace(/^['"]|['"]$/g, ""), style: get("font-style"), weight: get("font-weight"), unicodeRange: get("unicode-range"), file: resolve(pkgDir, woff2.replace(/^['"]|['"]$/g, "")) });
  }
  return faces;
}

/** fontsourceFaces({ packagesDir, pkg, weight, style, subsets, configDir }) -> manifest entries; throws if the CSS, a subset or a font file is missing. */
export function fontsourceFaces({ packagesDir, pkg, weight = 400, style = "normal", subsets = ["latin"], configDir }) {
  const pkgDir = resolve(packagesDir, pkg), cssPath = resolve(pkgDir, `${weight}${style === "italic" ? "-italic" : ""}.css`);
  if (!existsSync(cssPath)) throw new Error(`fontsource: ${cssPath} not found (is ${pkg} installed with weight ${weight} ${style}?)`);
  const faces = parseFontsourceCss(readFileSync(cssPath, "utf8"), dirname(cssPath));
  return subsets.map((sub) => {
    const f = faces.find((x) => x.comment === `${pkg}-${sub}-${weight}-${style}`);
    if (!f) throw new Error(`fontsource: ${pkg} has no "${sub}" subset at ${weight} ${style} (available: ${faces.map((x) => x.comment).join(", ")})`);
    if (!existsSync(f.file)) throw new Error(`fontsource: font file missing: ${f.file}`);
    return { family: f.family, src: relative(configDir, f.file).split("\\").join("/"), weight: String(weight), style, unicodeRange: f.unicodeRange, subset: sub };
  });
}
