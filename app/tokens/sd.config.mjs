/**
 * Style Dictionary v4 — token build config
 *
 * Input:  tokens/tokens.json  (W3C DTCG format, edited by hand or by Tokens Studio)
 * Output: tokens/generated/tokens.json  (flattened JSON for Tokens Studio round-tripping)
 *
 * Run:  npm run build:tokens   (from the app/ directory)
 *
 * CSS is NOT generated here. The authoritative CSS token source is tokens/colors.css
 * (M3-named --md-sys-color-* custom properties). Edit that file directly.
 */

import StyleDictionary from "style-dictionary";

// ── Config ────────────────────────────────────────────────────────────────────

const sd = new StyleDictionary({
  source: ["tokens/tokens.json"],

  platforms: {
    // JSON export — used by Tokens Studio for round-tripping
    json: {
      transforms: ["attribute/cti", "name/kebab"],
      buildPath: "tokens/generated/",
      files: [
        {
          destination: "tokens.json",
          format: "json/nested",
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
console.log("\n✅  Token build complete → tokens/generated/");
