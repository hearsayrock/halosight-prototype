# Design System

> The Halosight design system is M3-aligned (Material Design 3), Flutter-ready, and Figma-portable. All tokens are named to map directly to Flutter `ThemeData` and future Figma variables.

**Live viewer:** `localhost:3000/design-system`

---

## Token Architecture

Tokens live in `/app/app/globals.css`. There is no `tailwind.config.ts` — Tailwind v4 uses a CSS-first config.

Two layers:

| Layer | Location | Purpose |
|---|---|---|
| **Primitive palette** | `:root { --palette-* }` | Raw hex values. Never referenced directly in components. |
| **Semantic tokens** | `@theme inline { --color-* }` | Role-based names. Only these go in components. Tailwind generates utility classes from these. |

---

## Color System

### Surface (M3 roles)

| Token | Value | Use |
|---|---|---|
| `--color-background` | `#111420` | Page / app chrome |
| `--color-surface-dim` | `#171B29` | Nav, persistent UI |
| `--color-surface` | `#202535` | Cards, list items |
| `--color-surface-variant` | `#2A3042` | Elevated cards, popovers |
| `--color-surface-container-highest` | `#343B4F` | Pressed states, deep elevation |
| `--color-on-background` | `#F7F8FF` | Primary text on page bg |
| `--color-on-surface` | `#F7F8FF` | Primary text on surface |
| `--color-on-surface-variant` | `#8B94A8` | Muted text, metadata, labels |
| `--color-inverse-surface` | `#F7F8FF` | Inverse surface (light) |
| `--color-inverse-on-surface` | `#111420` | Text on inverse surface |

### Supplemental text roles

M3's `on-surface` / `on-surface-variant` pair needs a middle and a disabled tier:

| Token | Value | Use |
|---|---|---|
| `--color-on-surface-subtle` | `#C3CAD8` | Supporting text, subtitles |
| `--color-on-surface-disabled` | `#5D667A` | Placeholders, inactive nav, timestamps |

### Outline

| Token | Value | Use |
|---|---|---|
| `--color-outline` | `#2A3042` | Dividers, card borders, separators |
| `--color-outline-variant` | `#202535` | Subtle section dividers |

### Primary — coral (M3: `primary`)

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#FF6B5A` | CTAs, active nav, "Visited Today" |
| `--color-primary-hover` | `#FF8F82` | Hover state |
| `--color-primary-pressed` | `#E64A37` | Pressed state |
| `--color-on-primary` | `#FFFFFF` | Text / icons on primary |
| `--color-primary-container` | `#5C1A10` | Tonal primary backgrounds |
| `--color-on-primary-container` | `#FF8F82` | Text on primary container |

### Secondary — neon indigo (M3: `secondary`)

| Token | Value | Use |
|---|---|---|
| `--color-secondary` | `#8B92FF` | Links, CRM accent, transcript action |
| `--color-secondary-hover` | `#B3B8FF` | Hover state |
| `--color-secondary-pressed` | `#6B72E8` | Pressed state |
| `--color-on-secondary` | `#111420` | Text on secondary |
| `--color-secondary-container` | `#1A1E40` | Secondary tonal backgrounds |
| `--color-on-secondary-container` | `#B3B8FF` | Text on secondary container |

### Tertiary — success green (M3: `tertiary`)

| Token | Value | Use |
|---|---|---|
| `--color-tertiary` | `#2ECC71` | CRM synced, commitments met |
| `--color-on-tertiary` | `#FFFFFF` | Text on tertiary |
| `--color-tertiary-container` | `#0A2E1A` | Success tonal backgrounds |
| `--color-on-tertiary-container` | `#6EE9A8` | Text on tertiary container |

### Error (M3: `error`)

| Token | Value | Use |
|---|---|---|
| `--color-error` | `#FF4D4F` | Errors, overdue, reject actions |
| `--color-on-error` | `#FFFFFF` | Text on error |
| `--color-error-container` | `#2E0A10` | Error tonal backgrounds |
| `--color-on-error-container` | `#FF9AA2` | Text on error container |

### Warning (M3 supplement)

M3 spec does not include warning — added as a first-class role:

| Token | Value | Use |
|---|---|---|
| `--color-warning` | `#F5A623` | At-risk accounts, pending actions |
| `--color-on-warning` | `#FFFFFF` | Text on warning |
| `--color-warning-container` | `#2E2308` | Warning tonal backgrounds |
| `--color-on-warning-container` | `#F9CC7A` | Text on warning container |

### Info (M3 supplement)

| Token | Value | Use |
|---|---|---|
| `--color-info` | `#4DA3FF` | Informational states, tips |
| `--color-on-info` | `#FFFFFF` | Text on info |
| `--color-info-container` | `#0A1E3C` | Info tonal backgrounds |
| `--color-on-info-container` | `#90CAFF` | Text on info container |

### Halosight custom roles

Roles not covered by M3 that are specific to this product:

| Token | Value | Use |
|---|---|---|
| `--color-recording` | `#FF5A4F` | Live recording indicator (visually distinct from error) |
| `--color-secondary-deep` | `#4850B8` | Deep indigo for filled secondary actions |
| `--color-teal` | `#6B9DB0` | Account / relationship data visualization |
| `--color-teal-hover` | `#8CB5C5` | Hover on teal elements |
| `--color-pink` | `#E85D9C` | Engagement / highlight data visualization |

---

## Primitive Palette

Reference only — never use `--palette-*` directly in components.

```
--palette-coral-subtle: #FF8F82    --palette-coral:        #FF6B5A
--palette-coral-strong: #E64A37

--palette-neon-subtle:  #B3B8FF    --palette-neon:         #8B92FF
--palette-neon-strong:  #6B72E8

--palette-indigo:       #4850B8    --palette-indigo-light: #7E85E6
--palette-teal:         #6B9DB0    --palette-teal-subtle:  #8CB5C5
--palette-pink:         #E85D9C

--palette-green:        #2ECC71    --palette-amber:        #F5A623
--palette-red:          #FF4D4F    --palette-sky:          #4DA3FF
```

---

## Typography

Two font families, both loaded via `@font-face` in `globals.css`:

- **`--font-sans`** → Barlow — all UI text
- **`--font-serif`** → Roboto Slab — emphasis, display contexts (rare)

### M3 Type Scale

| Role | Size | Weight | Line Height | Use in app |
|---|---|---|---|---|
| `displayLarge` | 57px | 300 | 1.12 | Marketing only |
| `displayMedium` | 45px | 300 | 1.15 | Marketing only |
| `headlineLarge` | 32px | 700 | 1.25 | Account names (detail) |
| `headlineMedium` | 26px | 700 | 1.30 | Login tagline |
| `headlineSmall` | 22px | 600 | 1.35 | Section headers (detail) |
| `titleLarge` | 18px | 700 | 1.40 | "Last Time", "Ideas" headers |
| `titleMedium` | 16px | 600 | 1.40 | Button labels, CTA text |
| `titleSmall` | 14px | 600 | 1.50 | Tab labels, sub-section heads |
| `bodyLarge` | 15px | 400 | 1.60 | AI summary body, list item names |
| `bodyMedium` | 14px | 400 | 1.60 | Activity text, secondary content |
| `bodySmall` | 13px | 400 | 1.50 | Distance, secondary metadata |
| `labelLarge` | 16px | 600 | 1.25 | Primary button labels |
| `labelMedium` | 12px | 700 | 1.30 | All-caps labels, badges |
| `labelSmall` | 11px | 500 | 1.30 | Timestamps, status chips |

---

## Shape / Border Radius

Follows M3 shape scale exactly:

| Token | Value | M3 Name | Use |
|---|---|---|---|
| `--radius-none` | 0px | None | Dividers, full-bleed images |
| `--radius-xs` | 4px | Extra Small | Small badges |
| `--radius-sm` | 8px | Small | Input fields, small chips |
| `--radius-md` | 12px | Medium | Cards, list containers |
| `--radius-lg` | 16px | Large | Sheet surfaces |
| `--radius-xl` | 28px | Extra Large | Buttons (primary CTA) |
| `--radius-full` | 100px | Full | Pills, tags, icon buttons |

---

## Spacing

4px base grid. 10 steps.

```
--spacing-1:  4px
--spacing-2:  8px
--spacing-3:  12px
--spacing-4:  16px   ← standard component padding
--spacing-5:  20px
--spacing-6:  24px   ← section spacing
--spacing-8:  32px
--spacing-10: 40px
--spacing-12: 48px
--spacing-16: 64px
```

---

## Elevation

5 levels following M3 tonal elevation. Halosight uses drop shadows rather than surface tint on dark surfaces.

| Token | Level | Use |
|---|---|---|
| `--elevation-0` | 0 | Flat surfaces, list items |
| `--elevation-1` | 1 | Cards at rest |
| `--elevation-2` | 2 | Floating buttons |
| `--elevation-3` | 3 | Drawers, bottom sheets |
| `--elevation-4` | 4 | Modals, dialogs |

---

## Component Token Mapping

Quick reference for Flutter engineers — maps components to their M3 color roles:

| Component | Token roles |
|---|---|
| FilledButton (primary CTA) | `primary` / `on-primary` / `radius-xl` |
| FilledButton (secondary) | `secondary-deep` / `on-primary` / `radius-xl` |
| TextButton / link | `secondary` (text only) |
| Card | `surface` / `outline` / `radius-md` / `elevation-1` |
| BottomNav | `surface-dim` / `primary` (active) / `on-surface-disabled` (inactive) |
| SearchField | `surface` / `on-surface-disabled` (placeholder) / `on-surface` (input) |
| TabBar | `surface` (track) / `surface-variant` (active tab) / `radius-sm` |
| Count badge | `surface-variant` / `on-surface-subtle` / `radius-full` |
| Dropdown | `surface-variant` (bg) / `surface-container-highest` (border) |
| ActivityRow | `outline` (divider) / `on-surface-disabled` (type+date) / `on-surface-variant` (body) |
| Recording CTA | `primary` / `on-primary` / mic icon / `radius-full` |
| StatusChip success | `tertiary-container` / `on-tertiary-container` |
| StatusChip warning | `warning-container` / `on-warning-container` |
| StatusChip error | `error-container` / `on-error-container` |
| StatusChip info | `info-container` / `on-info-container` |

---

## Figma Sync (Future)

When the Figma system is built on M3:
- Every `--color-*` token maps 1:1 to a Figma variable of the same name
- M3 component library in Figma uses identical color role names — zero renaming required
- Type scale roles map directly to Figma text styles
- Shape scale maps to Figma corner radius tokens
- `--palette-*` tokens map to the Figma primitive palette collection

---

*Last updated: 2026-05-15*
