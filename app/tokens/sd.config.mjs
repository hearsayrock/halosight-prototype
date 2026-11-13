/**
 * Build the prototype's CSS and Tokens Studio JSON from the pinned official
 * DTCG snapshot. Update that snapshot only with `npm run sync:tokens`.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import StyleDictionary from "style-dictionary";

const sourcePath = "tokens/tokens.json";
const releasePath = "tokens/release.json";
const release = JSON.parse(readFileSync(releasePath, "utf8"));
const tokenBytes = readFileSync(sourcePath);
const tokenHash = createHash("sha256").update(tokenBytes).digest("hex");

if (tokenHash !== release.sha256) {
  throw new Error(
    `${sourcePath} does not match ${release.ref} in ${releasePath}. ` +
      "Run npm run sync:tokens -- --ref <tag>.",
  );
}

const tokens = JSON.parse(tokenBytes.toString("utf8"));
const leaves = flatten(tokens);
const byPath = new Map(leaves.map((token) => [token.path.join("."), token]));
const resolved = leaves.map((token) => ({
  ...token,
  value: resolveValue(token.value, token.path.join("."), new Set()),
}));

const properties = new Map();
for (const token of resolved) {
  const [set, ...path] = token.path;
  if (set === "color") {
    put(properties, `--md-sys-color-${dropBase(path).join("-")}`, cssColor(token.value));
  } else if (set === "radius" || set === "spacing") {
    put(properties, `--${set}-${dropBase(path).join("-")}`, cssDimension(token.value));
  } else if (set === "elevation") {
    put(properties, `--elevation-${dropBase(path).join("-")}`, cssShadow(token.value));
  } else if (set === "font" && path[0] === "family") {
    put(properties, `--font-${dropBase(path.slice(1)).join("-")}`, cssFamily(token.value));
  } else if (set === "font" && path[0] === "weight") {
    put(properties, `--font-weight-${dropBase(path.slice(1)).join("-")}`, String(token.value));
  } else if (set === "typography") {
    for (const [field, value] of Object.entries(token.value)) {
      put(
        properties,
        `--typography-${dropBase(path).join("-")}-${kebab(field)}`,
        cssTypographyField(field, value),
      );
    }
  }
}

// Compatibility names only point to canonical generated properties. They
// keep existing prototype call sites working while the inventory migrates.
const aliases = {
  "--md-sys-color-success": "--md-sys-color-semantic-success",
  "--md-sys-color-success-light": "--md-sys-color-semantic-success-light",
  "--md-sys-color-success-dark": "--md-sys-color-semantic-success-dark",
  "--md-sys-color-warning": "--md-sys-color-semantic-warning",
  "--md-sys-color-warning-light": "--md-sys-color-semantic-warning-light",
  "--md-sys-color-warning-dark": "--md-sys-color-semantic-warning-dark",
  "--md-sys-color-error": "--md-sys-color-semantic-error",
  "--md-sys-color-error-light": "--md-sys-color-semantic-error-light",
  "--md-sys-color-error-dark": "--md-sys-color-semantic-error-dark",
  "--md-sys-color-info": "--md-sys-color-semantic-info",
  "--md-sys-color-info-light": "--md-sys-color-semantic-info-light",
  "--md-sys-color-info-dark": "--md-sys-color-semantic-info-dark",
  "--md-sys-color-recording": "--md-sys-color-brand-recording",
  "--md-sys-color-brand-teal-hover": "--md-sys-color-brand-teal-light",
  "--md-sys-color-dark-elevated": "--md-sys-color-legacy-surface-elevated",
  "--md-sys-color-dark-base": "--md-sys-color-dark",
  "--md-sys-color-surface-static-white": "--md-sys-color-surface-white",
  "--md-sys-color-text-on-coral": "--md-sys-color-surface-white",
  "--md-sys-color-text-on-accent": "--md-sys-color-surface-white",
  "--md-sys-color-text-on-teal": "--md-sys-color-surface-white",
  "--md-sys-color-text-on-white": "--md-sys-color-text-inverse",
  "--palette-green": "--md-sys-color-semantic-success",
  "--palette-amber": "--md-sys-color-semantic-warning",
  "--palette-red": "--md-sys-color-semantic-error",
  "--palette-sky": "--md-sys-color-semantic-info",
};
for (const shade of ["cyan", "lime", "orange", "gold", "violet", "rose"]) {
  aliases[`--md-ref-palette-ext-${shade}`] = `--md-sys-color-ext-${shade}`;
}
for (const step of [50, 200, 400, 600, 800, 950]) {
  aliases[`--md-ref-palette-neutral-${step}`] = `--md-sys-color-neutral-${step}`;
}
for (const [alias, target] of Object.entries(aliases)) {
  if (!properties.has(target)) throw new Error(`Alias target is missing: ${target}`);
  put(properties, alias, `var(${target})`);
}

const css = [
  `/* Generated from ${release.repo} ${release.ref} (${release.commit}). Do not edit. */`,
  "@theme {",
  ...[...properties.entries()].map(([name, value]) => `  ${name}: ${value};`),
  "}",
  "",
].join("\n");
writeFileSync("tokens/generated/design-tokens.css", css);

const sd = new StyleDictionary({
  source: [sourcePath],
  platforms: {
    json: {
      transforms: ["attribute/cti", "name/kebab"],
      buildPath: "tokens/generated/",
      files: [{ destination: "tokens.json", format: "json/nested" }],
    },
  },
});
await sd.buildAllPlatforms();
console.log(`Generated CSS and JSON from ${release.repo} ${release.ref}.`);

function flatten(node, path = [], output = []) {
  for (const [name, child] of Object.entries(node)) {
    if (name.startsWith("$")) continue;
    const nextPath = [...path, name];
    if (child && typeof child === "object" && "$value" in child) {
      output.push({ path: nextPath, type: child.$type, value: child.$value });
    } else if (child && typeof child === "object") {
      flatten(child, nextPath, output);
    }
  }
  return output;
}

function resolveValue(value, owner, seen) {
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, owner, new Set(seen)));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveValue(item, owner, new Set(seen))]),
    );
  }
  if (typeof value !== "string") return value;
  const alias = value.match(/^\{([^{}]+)\}$/);
  if (!alias) return value;
  const target = alias[1];
  if (seen.has(target)) throw new Error(`Alias cycle at ${owner}: ${[...seen, target].join(" → ")}`);
  const token = byPath.get(target);
  if (!token) throw new Error(`Missing alias target at ${owner}: ${target}`);
  return resolveValue(token.value, owner, new Set([...seen, target]));
}

function put(map, name, value) {
  if (map.has(name)) throw new Error(`Two tokens map to ${name}`);
  map.set(name, value);
}

function dropBase(path) {
  return path.length > 1 && path.at(-1) === "base" ? path.slice(0, -1) : path;
}

function kebab(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function cssColor(value) {
  if (typeof value !== "string") throw new Error(`Expected color value, got ${value}`);
  return value;
}

function cssDimension(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && value.unit === "px") return `${value.value}px`;
  throw new Error(`Expected pixel dimension, got ${JSON.stringify(value)}`);
}

function cssFamily(value) {
  const families = Array.isArray(value) ? value : [value];
  return families.map((family) => (/^[a-z-]+$/i.test(family) ? family : JSON.stringify(family))).join(", ");
}

function cssShadow(value) {
  if (value === "none") return value;
  const layers = Array.isArray(value) ? value : [value];
  return layers.map((layer) =>
    [cssDimension(layer.offsetX), cssDimension(layer.offsetY), cssDimension(layer.blur), cssDimension(layer.spread), cssColor(layer.color)].join(" "),
  ).join(", ");
}

function cssTypographyField(field, value) {
  if (field === "fontFamily") return cssFamily(value);
  if (field === "fontWeight") return String(value);
  if (["fontSize", "lineHeight", "letterSpacing"].includes(field)) return cssDimension(value);
  return String(value);
}
