# Halosight Design System

Halosight is an AI-powered field sales execution platform. Reps use a mobile app to capture in-person customer visits via voice, get AI summaries, and auto-populate Salesforce. The UI is a dark-themed, mobile-first app (390×844 viewport).

The design system is M3-aligned (Google Material Design 3), Flutter-ready, and Figma-portable. All tokens are named to map directly to Flutter `ThemeData` and Figma variables.

---

## Color Tokens

Token names use CSS custom property syntax (`--color-*`). Never use raw hex values — always reference by token name.

### App Surface

| Token | Value | Use |
|---|---|---|
| `--color-background` | `#111420` | Page / app chrome |
| `--color-surface-dim` | `#171B29` | Nav, persistent UI |

### Dark Theme Scale

| Token | Value | Use |
|---|---|---|
| `--color-dark-base` | `#0D0F1A` | Off-black — deepest dark |
| `--color-dark-primary` | `#1A1D29` | Primary dark background |
| `--color-dark-secondary` | `#252A36` | Cards, list items |
| `--color-dark-tertiary` | `#3D4451` | Dividers, borders |

### Light Theme Scale

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

### Brand — Neon Indigo (Interactive & Accent)

Use for interactive elements, hover states, active states, and visual accents.

| Token | Value |
|---|---|
| `--color-brand-purple-light` | `#B3B8FF` |
| `--color-brand-purple` | `#8B92FF` |
| `--color-brand-purple-dark` | `#6B72E8` |

### Brand — Indigo (Secondary Actions & Links)

Use for secondary CTAs, text links, eyebrow text, and exploratory actions.

| Token | Value |
|---|---|
| `--color-brand-blue-light` | `#7E85E6` |
| `--color-brand-blue` | `#5B63D6` |
| `--color-brand-blue-dark` | `#4850B8` |

### Brand — Coral Ember (Primary CTA)

Use for primary call-to-action buttons and high-priority actions.

| Token | Value |
|---|---|
| `--color-brand-coral-light` | `#FF8F82` |
| `--color-brand-coral` | `#FF6B5A` |
| `--color-brand-coral-dark` | `#E64A37` |

### Brand — Teal (Relationship Data)

Use for account/relationship data visualization, badges, featured highlights.

| Token | Value |
|---|---|
| `--color-brand-teal` | `#6B9DB0` |
| `--color-brand-teal-hover` | `#8CB5C5` |

### Brand — Pink (Special Accents)

Use sparingly for promotional badges, featured items, or unique visual accents.

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

### Data Visualization

Used exclusively for charts, account health scores, recency indicators.

| Token | Value | Use |
|---|---|---|
| `--color-data-account` | `#6B9DB0` | Account data |
| `--color-data-recency` | `#8B92FF` | Recency indicators |
| `--color-data-crm-sync` | `#2ECC71` | CRM sync status |
| `--color-data-review` | `#F5A623` | Review / pending states |

### Recording

| Token | Value | Use |
|---|---|---|
| `--color-recording` | `#FF5A4F` | Live recording indicator (distinct from error red) |

### Neutrals (Un-tinted)

Use for generic backgrounds, dividers, or when brand color is inappropriate.

| Token | Value |
|---|---|
| `--color-neutral-950` | `#0A0A0A` |
| `--color-neutral-800` | `#262626` |
| `--color-neutral-600` | `#525252` |
| `--color-neutral-400` | `#A3A3A3` |
| `--color-neutral-200` | `#E5E5E5` |
| `--color-neutral-50` | `#FAFAFA` |

### Extended Palette (Data Visualization Overflow)

Supplemental accent colors for tags, categories, and data viz when brand colors are exhausted.

| Token | Value |
|---|---|
| `--color-ext-cyan` | `#5BBFCC` |
| `--color-ext-lime` | `#89B347` |
| `--color-ext-orange` | `#C97A42` |
| `--color-ext-gold` | `#C4962B` |
| `--color-ext-violet` | `#8875C4` |
| `--color-ext-rose` | `#C97888` |

### Alpha / Glass

Transparent overlays for glass effects, borders, and layered surfaces. Always applied over a dark background.

| Token | Value | Use |
|---|---|---|
| `--color-alpha-white-10` | `rgba(255,255,255,0.10)` | Borders, card edges |
| `--color-alpha-white-18` | `rgba(255,255,255,0.18)` | Active fields, emphasized containers |
| `--color-alpha-purple-10` | `rgba(179,184,255,0.10)` | Subtle purple backgrounds |
| `--color-alpha-purple-glass` | `rgba(179,184,255,0.10)` | Glass nav background |
| `--color-alpha-dark-glass` | `rgba(255,255,255,0.18)` | Active pill on glass nav |

### Gradients

Referenced via `var(--gradient-*)`.

| Token | Use |
|---|---|
| `--gradient-login` | `radial-gradient(ellipse 70% 60% at 50% 40%, #1A1E44 0%, #131728 40%, #111420 100%)` — Login / splash background |
| `--gradient-ai-dark` | AI feature — dark variant (purple + coral radial blobs over `#7874D8`) |
| `--gradient-ai-light` | AI feature — light variant |
| `--gradient-hero` | `linear-gradient(to bottom right, #1A1D29, #252A36, #1A1D29)` — Hero background |
| `--gradient-card` | `linear-gradient(to bottom right, #475569, #334155)` — Card background |
| `--gradient-text-brand` | `linear-gradient(to right, #8B92FF, #5B63D6)` — Halosight wordmark gradient |

---

## Typography

Two font families, both self-hosted. No Google CDN dependency.

| Variable | Family | Use |
|---|---|---|
| `--font-serif` | Roboto Slab | Headings only |
| `--font-sans` | Barlow | All UI text |

### Headings (Roboto Slab, weight 700)

| Class | Size | Line Height |
|---|---|---|
| `.heading-1` | 60px | 66px |
| `.heading-2` | 48px | 58px |
| `.heading-3` | 36px | 43px |
| `.heading-4` | 24px | 31px |
| `.heading-5` | 20px | 26px |
| `.heading-6` | 18px | 24px |

### Body Text (Barlow — regular 400, bold 600)

| Size class | px | Line Height | Bold variant |
|---|---|---|---|
| `text-xl` | 20px | 30px | `.text-xl-bold` |
| `text-lg` | 18px | 27px | `.text-lg-bold` |
| `text-base` | 16px | 24px | `.text-base-bold` |
| `text-sm` | 14px | 21px | `.text-sm-bold` |
| `text-xs` | 12px | 18px | `.text-xs-bold` |

### Subheadlines (Barlow 400 — marketing / hero text)

| Class | Size | Line Height |
|---|---|---|
| `.subheadline-lg` | 24px | 36px |
| `.subheadline-md` | 20px | 30px |

### Eyebrow Text

`.eyebrow-text` — Barlow 600, 14px/20px, uppercase, letter-spacing 1px.

### Labels & Captions (10px)

| Class | Family | Weight |
|---|---|---|
| `.label-serif` | Roboto Slab | 400 |
| `.text-2xs` | Barlow | 400 |

---

## Icons

### Material Symbols Rounded

Self-hosted variable font (`MaterialSymbolsRounded.woff2`). Icon names are identical to the Figma Material Symbols community library.

**Variable axes:**

| Axis | Range | Default |
|---|---|---|
| `FILL` | 0–1 | 0 (outlined) |
| `wght` | 100–700 | 400 |
| `GRAD` | -50–200 | 0 |
| `opsz` | 20–48 | 24 |

**Size modifier classes:** `.ms-16` `.ms-18` `.ms-20` `.ms-24` `.ms-28` `.ms-32` `.ms-40` `.ms-48`

**Weight modifier classes:** `.ms-100` `.ms-200` `.ms-300` `.ms-500` `.ms-600` `.ms-700`

**Fill modifier:** `.ms-filled` (FILL = 1)

**Usage:**
```tsx
<Icon name="home" />                  // 24px, outlined, wght 400
<Icon name="star" fill size={32} />   // 32px, filled
<Icon name="check" weight={300} size={20} />
```

### Custom Halosight SVG Icons

| Icon | Component | Use |
|---|---|---|
| Chain (Corporate) | `AccountTypeIcon` | Corporate account type |
| Branch | `AccountTypeIcon` | Branch account type |
| Standalone | `AccountTypeIcon` | Standalone account type |
| Home | `BottomNav` | Home tab |
| Accounts | `BottomNav` | Accounts tab |
| Sort | `SortMenu` | Sort trigger |
| Menu (hamburger) | `MenuIcon` | Top nav drawer trigger |

---

## Shape / Border Radius (M3 Scale)

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

## Spacing (4px Base Grid)

| Token | Value | Common Use |
|---|---|---|
| `--spacing-1` | `4px` | Icon gap, micro padding |
| `--spacing-2` | `8px` | Compact padding |
| `--spacing-3` | `12px` | Input padding, element gap |
| `--spacing-4` | `16px` | Standard component padding |
| `--spacing-5` | `20px` | |
| `--spacing-6` | `24px` | Section inner padding |
| `--spacing-8` | `32px` | Nav margins, section gaps |
| `--spacing-10` | `40px` | |
| `--spacing-12` | `48px` | |
| `--spacing-16` | `64px` | Large section breaks |

---

## Elevation (M3 Tonal — Drop Shadow on Dark)

| Token | Shadow | Use |
|---|---|---|
| `--elevation-0` | none | Flat surfaces, list items |
| `--elevation-1` | `0 1px 2px rgba(0,0,0,0.35), 0 1px 3px 1px rgba(0,0,0,0.2)` | Cards at rest |
| `--elevation-2` | `0 1px 2px rgba(0,0,0,0.35), 0 2px 6px 2px rgba(0,0,0,0.2)` | Floating buttons |
| `--elevation-3` | `0 4px 8px 3px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.35)` | Drawers, bottom sheets, dropdowns |
| `--elevation-4` | `0 6px 10px 4px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.35)` | Modals, dialogs |

---

## Component Token Reference

| Component | Tokens Used |
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

## Token Rules

1. Never use raw hex values — always `var(--color-*)`.
2. Never use raw px values for radius — always `var(--radius-*)`.
3. Alpha/glass effects use `--color-alpha-*` tokens + `backdrop-filter: blur()`.
4. If a color doesn't have a token, add it to `globals.css` first.

---

## Screen Inventory

| Route | Screen | Status |
|---|---|---|
| `/` | Login — logo, gradient bg, Google/Microsoft/Apple/Email auth buttons | Complete |
| `/accounts` | Accounts list — search, sort (4 options), account rows | Complete |
| `/accounts/[id]` | Account detail — back, type label, Overview/Activity tabs, Capture Meeting CTA | Complete |
| `/design-system` | Token reference viewer | Complete |
| `/accounts/[id]/capture` | Capture Meeting flow — recording → processing → AI summary → accept/edit/reject | Not built |
| Home screen | | Not built |
