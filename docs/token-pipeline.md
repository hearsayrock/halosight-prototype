# Token Pipeline

## Ownership

The official repository, [`halosight/design-system`](https://github.com/halosight/design-system), owns shared design values. The prototype consumes a tagged snapshot; its local token JSON is a reproducible copy, not an editing surface.

Current pin: **`v0.5.0`**, commit `553fab8407920f6d35c4262be0d770ab4a04bca5`. Its SHA-256 is recorded in `app/tokens/release.json`. `app/tokens/tokens.json` must match that digest.

Typography, font weights, and elevation were already present in the official token data. The active-listening generator now emits all three. The official naming contract for those sets is prepared in the design-system `0.6.0` branch and must be reviewed and released before consumers advance their pin. The prototype CSS generator already follows that proposed contract so its output matches the Flutter API.

## Update and build

From `app/`:

```sh
npm run sync:tokens -- --ref vX.Y.Z
npm run build:tokens
```

`sync:tokens` clones the requested immutable tag, replaces the pinned snapshot, records its commit and content digest, then generates CSS and JSON. Use the canonical official repo; `--repo <local-checkout>` is available for offline development. Do not edit `tokens/tokens.json`, `tokens/release.json`, or generated output by hand.

`build:tokens` checks the snapshot digest before producing:

- `tokens/generated/design-tokens.css` — CSS custom properties using the naming contract in the official `DESIGN.md`.
- `tokens/generated/tokens.json` — the Style Dictionary JSON export.

The app imports the generated CSS after its local CSS. Color, radius, spacing, elevation, font-family, font-weight, and typography values therefore resolve from the pinned release. Keep `colors.css` for gradient recipes and the legacy prototype light-theme block; keep `spacing.css` for the aside breakpoint and local elevation-5 extension. `typography.css` maps the prototype's utility class names to generated typography variables.

## Mapping decisions

| Official set | CSS output | Flutter equivalent |
|---|---|---|
| `color` | `--md-sys-color-{path}` | `DesignColors` |
| `radius` | `--radius-{path}` | `DesignRadius` |
| `spacing` | `--spacing-{path}` | `DesignSpacing` |
| `elevation` | `--elevation-{path}` (`box-shadow`) | `DesignElevation` (`BoxShadow`) |
| `font.family` | `--font-{path}` | `DesignFonts` |
| `font.weight` | `--font-weight-{path}` | `DesignFontWeights` |
| `typography` | `--typography-{name}-{field}` | `DesignTypography` (`TextStyle`) |

The only dropped path suffix is a trailing `base`. Groups remain in names. Typography emits a property for each composite field. CSS keeps the line-height dimension; Flutter uses the line-height/font-size ratio. Flutter `TextStyle` has no `textTransform`, so the generator exposes it separately for the caller to apply to text. Font-family fallbacks are retained in both CSS and Flutter output.

Legacy CSS names are generated as aliases to canonical properties (for example, `--md-sys-color-success` points to `--md-sys-color-semantic-success`). These aliases preserve existing call sites while components migrate; they do not hold values.

## Reconciliation and explicit exceptions

The local DTCG file had **108 tokens**; official `v0.5.0` has **122**. The prototype contains no token paths absent from the official file. The 14 official paths missing locally were eight `color.legacy.*` app compatibility colors, five typography text-size variants, and `radius.input`. The local `color.data.crm-sync` literal and `typography.subheadline-md` composite are now official aliases with the same resolved values. Two additional dark-overlay roles used by the prototype, `color.alpha.bg-glass` and `color.alpha.scrim`, are included in the pending official `0.6.0` PR; the prototype keeps their current values as release-`0.5.0` fallbacks until that tag exists.

Prototype-only styling remains outside the shared token contract and is documented as such:

- `.text-17`, `.text-15`, `.text-13`, `.text-11`, and `.text-2xs-bold` fill size gaps not represented by an official typography token.
- `--radius-none`, `--elevation-5`, and `--breakpoint-aside` are local layout extensions.
- Gradient recipes are CSS compositions. The dark recipes reference shared colors where available; the existing `--gradient-ai-light` swatch is not synced to or defined by an official light theme.
- `fonts.css` holds font-face asset URLs; the generated font-family values still come from the official file. `icons.css` holds Material Symbols variable-axis utilities and uses `font.family.icon`.

Do not import light-mode values from `docs/prototype-css-reference.css`, add light tokens, or change the existing `[data-theme="light"]` prototype block as part of token sync. Official `v0.5.0` has one value per token and no light/dark modes. Light mode remains a separate design decision, pending the user's go-ahead.

## Handoff files

| Purpose | File |
|---|---|
| Release pin and content digest | `app/tokens/release.json` |
| Read-only DTCG snapshot | `app/tokens/tokens.json` |
| Sync and generation | `app/tokens/sync.mjs`, `app/tokens/sd.config.mjs` |
| Generated CSS | `app/tokens/generated/design-tokens.css` |
| Generated JSON export | `app/tokens/generated/tokens.json` |
| Prototype CSS utility aliases | `app/tokens/typography.css`, `app/tokens/icons.css` |
| Flutter mapping notes | `docs/flutter-handoff.md` |
