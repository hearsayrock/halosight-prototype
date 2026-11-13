# Design System

> The Halosight design system is M3-aligned, Flutter-ready, and Figma-portable. All tokens are named to map directly to Flutter `ThemeData` and Figma variables.

**Live viewer:** `localhost:3000/design-system`  
**Source of truth:** the pinned official token release in `app/tokens/tokens.json`. `app/tokens/generated/design-tokens.css` is generated from that snapshot; do not edit its values by hand. Sync and handoff details are in `docs/token-pipeline.md`.

---

## Token Architecture

Official token values are pinned in `app/tokens/tokens.json` and generated into `app/tokens/generated/design-tokens.css`. Prototype utility classes and icon-axis rules live in `typography.css` and `icons.css`; font-face declarations and gradient compositions remain consumer-owned. There is no `tailwind.config.ts` — Tailwind v4 uses a CSS-first config.

| Layer | Location | Purpose |
|---|---|---|
| **Official tokens** | `app/tokens/generated/design-tokens.css` | Generated values from a pinned release, read by components through `var()`. |
| **Prototype utilities** | `typography.css`, `icons.css`, `spacing.css`, `colors.css` | Class-name adapters, icon-axis rules, and local layout/gradient recipes. They do not own shared token values. |

**Rule:** Never use raw hex values in components. Always use `var(--md-sys-color-*)` tokens.

---

## Color System

### App Surface

| CSS property | Official token path | Use |
|---|---|---|
| `--md-sys-color-background` | `color.background` | Page / app chrome |
| `--md-sys-color-surface-dim` | `color.surface-dim` | Nav, persistent UI |

### Dark Theme

| CSS property | Official token path | Use |
|---|---|---|
| `--md-sys-color-dark-void` | `color.dark.void` | Near-black — deepest chrome |
| `--md-sys-color-dark-base` | `color.dark.base` | Off-black — deepest dark |
| `--md-sys-color-dark-primary` | `color.dark.primary` | Primary dark background |
| `--md-sys-color-dark-secondary` | `color.dark.secondary` | Secondary dark — cards, list items |
| `--md-sys-color-dark-tertiary` | `color.dark.tertiary` | Tertiary dark — dividers, borders |

### Light Theme

| CSS property | Official token path | Use |
|---|---|---|
| `--md-sys-color-surface-white` | `color.surface.white` | Pure white background |
| `--md-sys-color-surface-light` | `color.surface.light` | Light background |
| `--md-sys-color-surface-gray` | `color.surface.gray` | Subtle gray background |

### Text Colors

| CSS property | Official token path | Use |
|---|---|---|
| `--md-sys-color-text-primary` | `color.text.primary` | Primary text |
| `--md-sys-color-text-secondary` | `color.text.secondary` | Supporting text, subtitles |
| `--md-sys-color-text-muted` | `color.text.muted` | Muted text, metadata |
| `--md-sys-color-text-disabled` | `color.text.disabled` | Placeholders, inactive nav, timestamps |
| `--md-sys-color-text-inverse` | `color.text.inverse` | Text on light surfaces |

### Brand — Neon Indigo

Interactive & accent color. Use for interactive elements, hover states, active states, and visual accents.

| CSS property | Official token path |
|---|---|
| `--md-sys-color-neonindigo-light` | `color.neonindigo.light` |
| `--md-sys-color-neonindigo` | `color.neonindigo.base` |
| `--md-sys-color-neonindigo-dark` | `color.neonindigo.dark` |

### Brand — Indigo

Secondary actions & links. Use for secondary CTAs, text links, eyebrow text, and exploratory actions.

| CSS property | Official token path |
|---|---|
| `--md-sys-color-indigo-light` | `color.indigo.light` |
| `--md-sys-color-indigo` | `color.indigo.base` |
| `--md-sys-color-indigo-dark` | `color.indigo.dark` |

### Brand — Coral Ember

Primary CTA & action color. Use for primary call-to-action buttons and high-priority actions.

| CSS property | Official token path |
|---|---|
| `--md-sys-color-brand-coral-light` | `color.brand.coral-light` |
| `--md-sys-color-brand-coral` | `color.brand.coral` |
| `--md-sys-color-brand-coral-dark` | `color.brand.coral-dark` |

### Brand — Teal

Alternative secondary & highlights. Use for account/relationship data visualization, badges, featured highlights.

| CSS property | Official token path |
|---|---|
| `--md-sys-color-brand-teal-light` | `color.brand.teal-light` |
| `--md-sys-color-brand-teal` | `color.brand.teal` |
| `--md-sys-color-brand-teal-dark` | `color.brand.teal-dark` |

### Brand — Pink

Special accents & badges. Use sparingly for promotional badges, featured items, or unique visual accents.

| CSS property | Official token path |
|---|---|
| `--md-sys-color-brand-pink` | `color.brand.pink` |

### Semantic — Success

| CSS property | Official token path |
|---|---|
| `--md-sys-color-semantic-success-light` | `color.semantic.success-light` |
| `--md-sys-color-semantic-success` | `color.semantic.success` |
| `--md-sys-color-semantic-success-dark` | `color.semantic.success-dark` |

### Semantic — Warning

| CSS property | Official token path |
|---|---|
| `--md-sys-color-semantic-warning-light` | `color.semantic.warning-light` |
| `--md-sys-color-semantic-warning` | `color.semantic.warning` |
| `--md-sys-color-semantic-warning-dark` | `color.semantic.warning-dark` |

### Semantic — Error

| CSS property | Official token path |
|---|---|
| `--md-sys-color-semantic-error-light` | `color.semantic.error-light` |
| `--md-sys-color-semantic-error` | `color.semantic.error` |
| `--md-sys-color-semantic-error-dark` | `color.semantic.error-dark` |

### Semantic — Info

| CSS property | Official token path |
|---|---|
| `--md-sys-color-semantic-info-light` | `color.semantic.info-light` |
| `--md-sys-color-semantic-info` | `color.semantic.info` |
| `--md-sys-color-semantic-info-dark` | `color.semantic.info-dark` |

### Data Colors

Used exclusively for data visualization — charts, account health scores, recency indicators.

| CSS property | Official token path | Use |
|---|---|---|
| `--md-sys-color-data-account` | `color.data.account` | Account data |
| `--md-sys-color-data-recency` | `color.data.recency` | Recency indicators |
| `--md-sys-color-data-crm-sync` | `color.data.crm-sync` | CRM sync status |
| `--md-sys-color-data-review` | `color.data.review` | Review / pending states |

### Recording

| CSS property | Official token path | Use |
|---|---|---|
| `--md-sys-color-brand-recording` | `color.brand.recording` | Live recording indicator — visually distinct from error |

### Neutrals

True neutral scale — not tinted. Use for generic backgrounds, dividers, or when brand color would be inappropriate.

| CSS property | Official token path |
|---|---|
| `--md-sys-color-neutral-950` | `color.neutral.950` |
| `--md-sys-color-neutral-800` | `color.neutral.800` |
| `--md-sys-color-neutral-600` | `color.neutral.600` |
| `--md-sys-color-neutral-400` | `color.neutral.400` |
| `--md-sys-color-neutral-200` | `color.neutral.200` |
| `--md-sys-color-neutral-50` | `color.neutral.50` |

### Extended Palette

Supplemental accent colors for data visualization, tags, and categorization when brand colors are exhausted.

| CSS property | Official token path |
|---|---|
| `--md-sys-color-ext-cyan` | `color.ext.cyan` |
| `--md-sys-color-ext-lime` | `color.ext.lime` |
| `--md-sys-color-ext-orange` | `color.ext.orange` |
| `--md-sys-color-ext-gold` | `color.ext.gold` |
| `--md-sys-color-ext-violet` | `color.ext.violet` |
| `--md-sys-color-ext-rose` | `color.ext.rose` |

### Alpha Colors

Transparent overlays for glass effects, borders, and layered surfaces. Always applied over a dark background.

| CSS property | Official token path | Use |
|---|---|---|
| `--md-sys-color-alpha-white-10` | `color.alpha.white-10` | Borders, card edges |
| `--md-sys-color-alpha-white-18` | `color.alpha.white-18` | Active fields, emphasized containers |
| `--md-sys-color-alpha-neonindigo-10` | `color.alpha.neonindigo-10` | Subtle purple backgrounds |
| `--md-sys-color-alpha-neonindigo-glass` | `color.alpha.neonindigo-glass` | Glass nav background |
| `--md-sys-color-alpha-dark-glass` | `color.alpha.dark-glass` | Active pill on glass nav |

### Gradients

Defined in `:root` (not `@theme inline`) — referenced via `var(--gradient-*)`.

| Token | Use |
|---|---|
| `--gradient-login` | Login / splash background |
| `--gradient-ai-dark` | AI feature — dark variant |
| `--gradient-ai-light` | AI feature — light variant |
| `--gradient-hero` | Hero / marketing background |
| `--gradient-card` | Card background |
| `--gradient-text-brand` | Brand text gradient (Halosight wordmark) |

---

## Typography

The official set defines UI sans, display serif, and icon families. Barlow and Roboto Slab font-face assets are self-hosted in `app/tokens/fonts.css`; the icon family is supplied by the prototype's Material Symbols asset.

| CSS variable | Official token path | Use |
|---|---|---|
| `--font-serif` | `font.family.serif` | Headings only |
| `--font-sans` | `font.family.sans` | All UI text |
| `--font-icon` | `font.family.icon` | Material Symbols glyphs |

### Headings

Roboto Slab, weight 700. Apply via CSS class.

| CSS class | Official typography token |
|---|---|
| `.heading-1` | `typography.heading-1` |
| `.heading-2` | `typography.heading-2` |
| `.heading-3` | `typography.heading-3` |
| `.heading-4` | `typography.heading-4` |
| `.heading-5` | `typography.heading-5` |
| `.heading-6` | `typography.heading-6` |

### Body Text

Barlow. Regular and semibold weights come from `font.weight.*`. The CSS utility classes below use the generated typography properties; these token paths carry the actual metrics.

| CSS class | Official typography token | Bold class / token |
|---|---|---|---|
| `.body-xl` | `typography.text-xl` | `.text-xl-bold` · `typography.text-xl-bold` |
| `.body-lg` | `typography.text-lg` | `.text-lg-bold` · `typography.text-lg-bold` |
| `.body-base` | `typography.text-base` | `.text-base-bold` · `typography.text-base-bold` |
| `.body-sm` | `typography.text-sm` | `.text-sm-bold` · `typography.text-sm-bold` |
| `.body-xs` | `typography.text-xs` | `.text-xs-bold` · `typography.text-xs-bold` |

### Subheadlines

Barlow 400. Used for marketing / hero text.

| CSS class | Official typography token |
|---|---|
| `.subheadline-lg` | `typography.subheadline-lg` |
| `.subheadline-md` | `typography.subheadline-md` |

### Labels & Captions

Used for nav labels, timestamps, and micro-copy. See the shared token paths for typography metrics.

| CSS class | Official typography token |
|---|---|
| `.label-serif` | `typography.label-serif` |
| `.text-2xs` | `typography.text-2xs` |

---

## Icons

### Material Symbols Rounded

Self-hosted variable font at `/public/fonts/material-symbols/MaterialSymbolsRounded.woff2`. Loaded via `@font-face` in `app/tokens/fonts.css`. Icon names are identical to the [Figma Material Symbols community library](https://www.figma.com/community/file/1035203688168086460).

**Component:** `<Icon name="home" />` — see `/app/components/ui/Icon.tsx`

**Base class:** `.ms` — sets font family, rendering, and default axes.

**Variable axes** (all controllable via `font-variation-settings`):

| Axis | Range | Default |
|---|---|---|
| `FILL` | 0–1 | 0 (outlined) |
| `wght` | 100–700 | 400 |
| `GRAD` | -50–200 | 0 |
| `opsz` | 20–48 | 24 |

**Modifier classes:**

| Class | Effect |
|---|---|
| `.ms-filled` | FILL = 1 |
| `.ms-100` `.ms-200` `.ms-300` `.ms-500` `.ms-600` `.ms-700` | Weight variants |
| `.ms-16` `.ms-18` `.ms-20` `.ms-24` `.ms-28` `.ms-32` `.ms-40` `.ms-48` | Size variants |

**Usage:**
```tsx
import Icon from "@/components/ui/Icon";

<Icon name="home" />                           // 24px, outlined, wght 400
<Icon name="star" fill size={32} />            // 32px, filled
<Icon name="check" weight={300} size={20} />   // thin, small
```

### Custom Halosight Icons

SVG icons used in specific components. Not part of the Material Symbols set.

| Icon | Component | Use |
|---|---|---|
| Chain (Corporate) | `AccountTypeIcon` | Corporate account type |
| Branch | `AccountTypeIcon` | Branch account type |
| Standalone | `AccountTypeIcon` | Standalone account type |
| Sort | `SortMenu` | Sort trigger |
| Menu | `MenuIcon` (`components/ui/MenuIcon.tsx`) | Top nav drawer trigger |

---

## Shape / Border Radius

M3 shape scale. Applied via `var(--radius-*)` in component styles.

| CSS property | Official token path | M3 Name | Use |
|---|---|---|---|
| `--radius-none` | `prototype-only CSS zero` | None | Dividers, full-bleed images |
| `--radius-xs` | `radius.xs` | Extra Small | Small badges, swatch cards |
| `--radius-sm` | `radius.sm` | Small | Input fields, account cards |
| `--radius-md` | `radius.md` | Medium | Cards, dropdowns |
| `--radius-lg` | `radius.lg` | Large | Sheet surfaces |
| `--radius-xl` | `radius.xl` | Extra Large | Buttons, sort menu |
| `--radius-full` | `radius.full` | Full | Pills, nav bar, tags |
| `--radius-input` | `radius.input` | Input role | Text fields and input controls |

---

## Spacing

4px base grid. 10 steps.

| CSS property | Official token path | Common use |
|---|---|---|
| `--spacing-1` | `spacing.1` | Icon gap, micro padding |
| `--spacing-2` | `spacing.2` | Compact padding |
| `--spacing-3` | `spacing.3` | Input padding, gap between elements |
| `--spacing-4` | `spacing.4` | Standard component padding |
| `--spacing-5` | `spacing.5` | |
| `--spacing-6` | `spacing.6` | Section inner padding |
| `--spacing-8` | `spacing.8` | Nav margins, section gaps |
| `--spacing-10` | `spacing.10` | |
| `--spacing-12` | `spacing.12` | |
| `--spacing-16` | `spacing.16` | Large section breaks |

---

## Elevation

Official levels `elevation.0` through `elevation.4` are generated as CSS `box-shadow` values. Halosight uses drop shadows on dark surfaces. The prototype-only `--elevation-5` remains a local extension until it is considered for the official contract.

| CSS variable | Official token path | Use |
|---|---|---|
| `--elevation-0` | `elevation.0` | Flat surfaces, list items |
| `--elevation-1` | `elevation.1` | Cards at rest |
| `--elevation-2` | `elevation.2` | Floating buttons |
| `--elevation-3` | `elevation.3` | Drawers, bottom sheets, dropdowns |
| `--elevation-4` | `elevation.4` | Modals, dialogs |

---

## Custom Breakpoints

Defined in `@theme inline` — available as Tailwind responsive prefixes.

| CSS property | Official token path | Use |
|---|---|---|
| `--breakpoint-aside` | Prototype extension | Sidebar visible above · drawer below |

Built-in Tailwind breakpoints (`sm` 640px, `md` 768px, `lg` 1024px, etc.) are also available.

---

## Component Token Reference

Quick reference for Flutter engineers — maps components to their token roles:

| Component | Tokens |
|---|---|
| `AccountListItem` | See the component's handoff comment and `/design-system#account-list-item` — three variants (owned, crm, home) plus the `CountBadge` sub-component |
| `AccountTypeIcon` | Custom SVG · `text-muted` stroke · `text-disabled` fill |
| `SortMenu` trigger | `dark-secondary` bg · `text-muted` icon |
| `SortMenu` dropdown | `dark-tertiary` bg · `text-primary` labels · `radius-xl` · `elevation-3` shadow |
| `Icon` | Material Symbols Rounded font · `currentColor` |
| `MenuIcon` | Custom SVG · `text-muted` default fill |
| Top bar | `background` bg · `dark-tertiary` border |
| Inputs | `dark-secondary` bg · `text-primary` input · `text-disabled` placeholder |
| Primary button | `brand-coral` bg · `text-inverse` label · `radius-xl` |
| Secondary button | `indigo` bg · `text-primary` label · `radius-xl` |

---

## Figma Sync

- Every `--md-sys-color-*` token maps 1:1 to a Figma variable of the same name
- Icons: use the [Material Symbols Figma community library](https://www.figma.com/community/file/1035203688168086460) — icon names are identical to code
- Shape scale maps directly to Figma corner radius tokens
- Typography maps to Figma text styles

---

*Last updated: 2026-05-16*
