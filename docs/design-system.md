# Design System

> The Halosight design system is M3-aligned, Flutter-ready, and Figma-portable. All tokens are named to map directly to Flutter `ThemeData` and Figma variables.

**Live viewer:** `localhost:3000/design-system`  
**Source of truth:** `/app/app/globals.css` — editing this file updates every swatch on the live viewer automatically.

---

## Token Architecture

Tokens live in `/app/app/globals.css`. There is no `tailwind.config.ts` — Tailwind v4 uses a CSS-first config.

| Layer | Location | Purpose |
|---|---|---|
| **Gradients** | `:root { --gradient-* }` | Gradient definitions. Referenced in components via `var()`. |
| **Semantic tokens** | `@theme { --color-* }` | Role-based color names. Only these go in components. Tailwind generates utility classes from these automatically. CSS vars are emitted to `:root` so the design system viewer can read live values via `getComputedStyle`. |

**Rule:** Never use raw hex values in components. Always use `var(--color-*)` tokens.

---

## Color System

### App Surface

| Token | Value | Use |
|---|---|---|
| `--color-background` | `#111420` | Page / app chrome |
| `--color-surface-dim` | `#171B29` | Nav, persistent UI |

### Dark Theme

| Token | Value | Use |
|---|---|---|
| `--color-dark-base` | `#0D0F1A` | Off-black — deepest dark |
| `--color-dark-primary` | `#1A1D29` | Primary dark background |
| `--color-dark-secondary` | `#252A36` | Secondary dark — cards, list items |
| `--color-dark-tertiary` | `#3D4451` | Tertiary dark — dividers, borders |

### Light Theme

| Token | Value | Use |
|---|---|---|
| `--color-surface-white` | `#FFFFFF` | Pure white background |
| `--color-surface-light` | `#F8FAFC` | Light background |
| `--color-surface-gray` | `#F1F5F9` | Subtle gray background |

### Text Colors

| Token | Value | Use |
|---|---|---|
| `--color-text-primary` | `#F7F8FF` | Primary text |
| `--color-text-secondary` | `#C3CAD8` | Supporting text, subtitles |
| `--color-text-muted` | `#8B94A8` | Muted text, metadata |
| `--color-text-disabled` | `#5D667A` | Placeholders, inactive nav, timestamps |
| `--color-text-inverse` | `#111420` | Text on light surfaces |

### Brand — Neon Indigo

Interactive & accent color. Use for interactive elements, hover states, active states, and visual accents.

| Token | Value |
|---|---|
| `--color-brand-purple-light` | `#B3B8FF` |
| `--color-brand-purple` | `#8B92FF` |
| `--color-brand-purple-dark` | `#6B72E8` |

### Brand — Indigo

Secondary actions & links. Use for secondary CTAs, text links, eyebrow text, and exploratory actions.

| Token | Value |
|---|---|
| `--color-brand-blue-light` | `#7E85E6` |
| `--color-brand-blue` | `#5B63D6` |
| `--color-brand-blue-dark` | `#4850B8` |

### Brand — Coral Ember

Primary CTA & action color. Use for primary call-to-action buttons and high-priority actions.

| Token | Value |
|---|---|
| `--color-brand-coral-light` | `#FF8F82` |
| `--color-brand-coral` | `#FF6B5A` |
| `--color-brand-coral-dark` | `#E64A37` |

### Brand — Teal

Alternative secondary & highlights. Use for account/relationship data visualization, badges, featured highlights.

| Token | Value |
|---|---|
| `--color-brand-teal` | `#6B9DB0` |
| `--color-brand-teal-hover` | `#8CB5C5` |

### Brand — Pink

Special accents & badges. Use sparingly for promotional badges, featured items, or unique visual accents.

| Token | Value |
|---|---|
| `--color-brand-pink` | `#E85D9C` |

### Semantic — Success

| Token | Value |
|---|---|
| `--color-success-light` | `#86EFAC` |
| `--color-success` | `#2ECC71` |
| `--color-success-dark` | `#16A34A` |

### Semantic — Warning

| Token | Value |
|---|---|
| `--color-warning-light` | `#FCD384` |
| `--color-warning` | `#F5A623` |
| `--color-warning-dark` | `#C47D10` |

### Semantic — Error

| Token | Value |
|---|---|
| `--color-error-light` | `#FF8586` |
| `--color-error` | `#FF4D4F` |
| `--color-error-dark` | `#CC1F21` |

### Semantic — Info

| Token | Value |
|---|---|
| `--color-info-light` | `#93C5FD` |
| `--color-info` | `#4DA3FF` |
| `--color-info-dark` | `#1D6FBF` |

### Data Colors

Used exclusively for data visualization — charts, account health scores, recency indicators.

| Token | Value | Use |
|---|---|---|
| `--color-data-account` | `#6B9DB0` | Account data |
| `--color-data-recency` | `#8B92FF` | Recency indicators |
| `--color-data-crm-sync` | `#2ECC71` | CRM sync status |
| `--color-data-review` | `#F5A623` | Review / pending states |

### Recording

| Token | Value | Use |
|---|---|---|
| `--color-recording` | `#FF5A4F` | Live recording indicator — visually distinct from error |

### Neutrals

True neutral scale — not tinted. Use for generic backgrounds, dividers, or when brand color would be inappropriate.

| Token | Value |
|---|---|
| `--color-neutral-950` | `#0A0A0A` |
| `--color-neutral-800` | `#262626` |
| `--color-neutral-600` | `#525252` |
| `--color-neutral-400` | `#A3A3A3` |
| `--color-neutral-200` | `#E5E5E5` |
| `--color-neutral-50` | `#FAFAFA` |

### Extended Palette

Supplemental accent colors for data visualization, tags, and categorization when brand colors are exhausted.

| Token | Value |
|---|---|
| `--color-ext-cyan` | `#5BBFCC` |
| `--color-ext-lime` | `#89B347` |
| `--color-ext-orange` | `#C97A42` |
| `--color-ext-gold` | `#C4962B` |
| `--color-ext-violet` | `#8875C4` |
| `--color-ext-rose` | `#C97888` |

### Alpha Colors

Transparent overlays for glass effects, borders, and layered surfaces. Always applied over a dark background.

| Token | Value | Use |
|---|---|---|
| `--color-alpha-white-10` | `rgba(255,255,255,0.10)` | Borders, card edges |
| `--color-alpha-white-18` | `rgba(255,255,255,0.18)` | Active fields, emphasized containers |
| `--color-alpha-purple-10` | `rgba(179,184,255,0.10)` | Subtle purple backgrounds |
| `--color-alpha-purple-glass` | `rgba(179,184,255,0.10)` | Glass nav background |
| `--color-alpha-dark-glass` | `#0d0f1a` | Active pill on glass nav |

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

Two font families, both self-hosted via `@font-face` in `globals.css`. No Google CDN dependency.

| Variable | Family | Use |
|---|---|---|
| `--font-serif` | Roboto Slab | Headings only |
| `--font-sans` | Barlow | All UI text |

### Headings

Roboto Slab, weight 700. Apply via CSS class.

| Class | Size | Line Height |
|---|---|---|
| `.heading-1` | 60px | 66px |
| `.heading-2` | 48px | 58px |
| `.heading-3` | 36px | 43px |
| `.heading-4` | 24px | 31px |
| `.heading-5` | 20px | 26px |
| `.heading-6` | 18px | 24px |

### Body Text

Barlow. Regular weight is 400, bold variants are 600. Applied via Tailwind utilities (`text-xl`, `text-lg`, etc.) or the bold CSS classes.

| Tailwind class | Size | Line Height | Bold class |
|---|---|---|---|
| `text-xl` | 20px | 30px | `.text-xl-bold` |
| `text-lg` | 18px | 27px | `.text-lg-bold` |
| `text-base` | 16px | 24px | `.text-base-bold` |
| `text-sm` | 14px | 21px | `.text-sm-bold` |
| `text-xs` | 12px | 18px | `.text-xs-bold` |

### Subheadlines

Barlow 400. Used for marketing / hero text.

| Class | Size | Line Height |
|---|---|---|
| `.subheadline-lg` | 24px | 36px |
| `.subheadline-md` | 20px | 30px |

### Labels & Captions

Used for nav labels, timestamps, micro-copy. Two families available at 10px.

| Class | Family | Weight | Size | Line Height |
|---|---|---|---|---|
| `.label-serif` | Roboto Slab | 400 | 10px | 14px |
| `.text-2xs` | Barlow | 400 | 10px | 14px |

---

## Icons

### Material Symbols Rounded

Self-hosted variable font at `/public/fonts/material-symbols/MaterialSymbolsRounded.woff2`. Loaded via `@font-face` in `globals.css`. Icon names are identical to the [Figma Material Symbols community library](https://www.figma.com/community/file/1035203688168086460).

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
| Home | `BottomNav` | Home tab |
| Accounts | `BottomNav` | Accounts tab |
| Sort | `SortMenu` | Sort trigger |
| Menu | `MenuIcon` (`components/ui/MenuIcon.tsx`) | Top nav drawer trigger |

---

## Shape / Border Radius

M3 shape scale. Applied via `var(--radius-*)` in component styles.

| Token | Value | M3 Name | Use |
|---|---|---|---|
| `--radius-none` | `0px` | None | Dividers, full-bleed images |
| `--radius-xs` | `4px` | Extra Small | Small badges, swatch cards |
| `--radius-sm` | `8px` | Small | Input fields, account cards |
| `--radius-md` | `12px` | Medium | Cards, dropdowns |
| `--radius-lg` | `16px` | Large | Sheet surfaces |
| `--radius-xl` | `28px` | Extra Large | Buttons, sort menu |
| `--radius-full` | `100px` | Full | Pills, nav bar, tags |

---

## Spacing

4px base grid. 10 steps.

| Token | Value | Common use |
|---|---|---|
| `--spacing-1` | `4px` | Icon gap, micro padding |
| `--spacing-2` | `8px` | Compact padding |
| `--spacing-3` | `12px` | Input padding, gap between elements |
| `--spacing-4` | `16px` | Standard component padding |
| `--spacing-5` | `20px` | |
| `--spacing-6` | `24px` | Section inner padding |
| `--spacing-8` | `32px` | Nav margins, section gaps |
| `--spacing-10` | `40px` | |
| `--spacing-12` | `48px` | |
| `--spacing-16` | `64px` | Large section breaks |

---

## Elevation

5 levels following M3 tonal elevation. Halosight uses drop shadows (not surface tint) on dark surfaces.

| Token | Level | Shadow | Use |
|---|---|---|---|
| `--elevation-0` | 0 | none | Flat surfaces, list items |
| `--elevation-1` | 1 | subtle | Cards at rest |
| `--elevation-2` | 2 | soft | Floating buttons |
| `--elevation-3` | 3 | medium | Drawers, bottom sheets, dropdowns |
| `--elevation-4` | 4 | strong | Modals, dialogs |

---

## Custom Breakpoints

Defined in `@theme inline` — available as Tailwind responsive prefixes.

| Token | Value | Use |
|---|---|---|
| `--breakpoint-aside` | `860px` | Sidebar visible above · drawer below |

Built-in Tailwind breakpoints (`sm` 640px, `md` 768px, `lg` 1024px, etc.) are also available.

---

## Component Token Reference

Quick reference for Flutter engineers — maps components to their token roles:

| Component | Tokens |
|---|---|
| `AccountListItem` | `dark-secondary` bg · `alpha-white-10` border · `radius-sm` · `text-primary` name · `text-muted` meta · `brand-purple-light` city/state · `brand-coral` today indicator |
| `AccountTypeIcon` | Custom SVG · `text-muted` stroke · `text-disabled` fill |
| `SortMenu` trigger | `dark-secondary` bg · `text-muted` icon |
| `SortMenu` dropdown | `dark-tertiary` bg · `text-primary` labels · `radius-xl` · `elevation-3` shadow |
| `BottomNav` | `alpha-purple-glass` bg · `alpha-white-10` border · `alpha-dark-glass` active pill · `text-primary` active · `text-muted` inactive · `radius-full` |
| `Icon` | Material Symbols Rounded font · `currentColor` |
| `MenuIcon` | Custom SVG · `text-muted` default fill |
| Top bar | `background` bg · `dark-tertiary` border |
| Inputs | `dark-secondary` bg · `text-primary` input · `text-disabled` placeholder |
| Primary button | `brand-coral` bg · `text-inverse` label · `radius-xl` |
| Secondary button | `brand-blue` bg · `text-primary` label · `radius-xl` |

---

## Figma Sync

- Every `--color-*` token maps 1:1 to a Figma variable of the same name
- Icons: use the [Material Symbols Figma community library](https://www.figma.com/community/file/1035203688168086460) — icon names are identical to code
- Shape scale maps directly to Figma corner radius tokens
- Typography maps to Figma text styles

---

*Last updated: 2026-05-16*
