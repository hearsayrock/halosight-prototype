# Component Architecture

> How the prototype's component system is organized, how to add new components, and what conventions to follow.

---

## Folder Structure

```
app/
├── app/                          # Next.js App Router — screens/routes
│   ├── page.tsx                  # Login (/)
│   ├── accounts/
│   │   ├── page.tsx              # Accounts list (/accounts)
│   │   └── [id]/
│   │       ├── page.tsx          # Account detail (/accounts/:id)
│   │       └── capture/
│   │           └── page.tsx      # Capture flow (/accounts/:id/capture)
│   └── design-system/
│       └── page.tsx              # Design system viewer (/design-system)
│
├── components/                   # Reusable UI components
│   ├── layout/                   # App-level structural components
│   │   ├── PhoneFrame.tsx        # Web-only phone viewport simulator
│   │   └── BottomNav.tsx         # Floating glass pill bottom navigation
│   ├── accounts/                 # Account-specific components
│   │   ├── AccountListItem.tsx   # Single account card (dark-secondary bg, alpha-white-10 border)
│   │   ├── AccountTypeIcon.tsx   # Corporate/branch/standalone SVG icon
│   │   └── SortMenu.tsx          # Sort dropdown overlay
│   ├── capture/                  # Capture meeting flow components
│   │   └── (to be built)
│   └── ui/                       # Generic primitives
│       ├── Icon.tsx              # Material Symbols Rounded wrapper
│       └── MenuIcon.tsx          # Custom top nav hamburger icon
│
├── lib/
│   ├── types/index.ts            # All TypeScript interfaces = Flutter Entities
│   ├── mock-data/
│   │   └── accounts.ts           # Account + AccountDetail mock data
│   └── utils.ts                  # formatLastVisited, formatDistance, cn()
│
└── public/
    └── fonts/
        ├── barlow/               # Barlow — all UI text (@font-face, self-hosted)
        ├── roboto-slab/          # Roboto Slab — headings (@font-face, self-hosted)
        └── material-symbols/     # MaterialSymbolsRounded.woff2 (variable font)
```

---

## Component Hierarchy

```
PhoneFrame (web wrapper — no Flutter equivalent)
└── Screen (page.tsx)
    ├── Header / Top Bar
    ├── Content Area (scrollable)
    │   └── Feature Components
    │       └── UI Primitives
    └── BottomNav (floating, outside scroll area)
```

---

## Component Categories

### Layout Components (`components/layout/`)
Structural, app-level. One instance per screen. Not domain-specific.

| Component | Description | Flutter equivalent |
|---|---|---|
| `PhoneFrame` | Web-only 390×844 viewport simulator | No equivalent |
| `BottomNav` | Floating glass pill nav (Home / Accounts) | Custom `NavigationBar` |

### Feature Components (`components/accounts/`, `components/capture/`)
Domain-specific. Tied to a feature area. Reusable across screens within that feature.

| Component | Description | Flutter equivalent |
|---|---|---|
| `AccountListItem` | Account card — icon, name, distance, last visited, city/state | `AccountsViewAccountListItem` |
| `AccountTypeIcon` | SVG icon for corporate / branch / standalone account types | `CustomPainter` |
| `SortMenu` | Sort dropdown with checkmark selection | `PopupMenuButton` or custom overlay |

### UI Primitives (`components/ui/`)
Generic, not domain-aware. Equivalent to Flutter's shared widget library.

| Component | Description | Flutter equivalent |
|---|---|---|
| `Icon` | Material Symbols Rounded variable font wrapper | `Icon(Symbols.name)` |
| `MenuIcon` | Custom two-bar hamburger SVG for top nav | `CustomPainter` |

**To be built:** Button, Badge, Chip, Skeleton, AICard

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Component files | PascalCase | `AccountListItem.tsx` |
| Page files | lowercase | `page.tsx` |
| Utility files | camelCase | `utils.ts` |
| Mock data files | camelCase | `accounts.ts` |
| CSS token names | `--kebab-case` | `--md-sys-color-neonindigo` |
| CSS class names | `.kebab-case` | `.heading-1`, `.label-serif` |

---

## Component File Template

Every component must follow this structure:

```tsx
"use client"; // only if using hooks or browser APIs

/**
 * FLUTTER HANDOFF: ComponentName
 * Widget: StatelessWidget | StatefulWidget
 * Props: list props and types
 * State: none OR describe state
 * Flutter equivalent: path/to/widget.dart (or description)
 * Tokens: list every --md-sys-color-* and --radius-* token used
 * Transitions: describe any animations
 */

import type { SomeType } from "@/lib/types";

interface Props {
  // typed props
}

export default function ComponentName({ prop }: Props) {
  return (/* JSX */);
}
```

The Flutter handoff comment block is **required** on every component. It makes the component self-documenting for engineers reading the prototype as a spec.

---

## Token Usage Rules

1. **Never use raw hex values** in components — always `var(--md-sys-color-*)`.
2. **Never use raw px values for radius** — always `var(--radius-*)`.
3. Alpha/glass effects use `--md-sys-color-alpha-*` tokens + `backdropFilter`.
4. If a color doesn't have a token, add it to `globals.css` and the design system page first.

---

## Design System Sync Rule

> **Any change to a component's visual tokens must be reflected in the design system page** (`/design-system`) before it is considered done.

The design system page imports live components directly (no mocks). Changes to `BottomNav`, `AccountListItem`, `SortMenu`, `Icon`, `MenuIcon` automatically appear on the design system page — no extra step needed for those. For new token additions, add the swatch to the appropriate color section manually.

---

## State Management Rules

| State type | Where it lives |
|---|---|
| UI-only (open/close, active tab) | `useState` in the component |
| Screen-level (search query, sort) | `useState` in `page.tsx` |
| Shared between screens | React Context (when needed) |
| Server data | Mock data imports for now; Supabase later |

No Redux, no Zustand, no global state libraries. Keep it simple — the Flutter BLoC pattern maps cleanly to props + callbacks.

---

## How to Add a New Screen

1. Create `app/app/[route]/page.tsx`
2. Wrap in `<PhoneFrame>` if it's a mobile screen
3. Include `<BottomNav>` if it's a main app tab
4. Add Flutter handoff comment at top of file
5. Pull data from `lib/mock-data/` or define new mock data
6. Use existing components before creating new ones

## How to Add a New Component

1. Determine category: layout / feature / ui primitive
2. Place in correct `components/` subfolder
3. Add Flutter handoff comment block
4. Use `var(--md-sys-color-*)` tokens — never raw hex
5. Export as default export
6. If it's a new primitive, add it to `components/ui/` and document it in this file
7. Add it to the design system page under the appropriate section

## How to Add a New Color Token

1. Add to `@theme inline` in `globals.css`
2. Add the corresponding `ColorSwatch` or `AlphaSwatch` to the design system page
3. Update `docs/design-system.md` token table
4. If it maps to a Flutter color role, update `docs/flutter-handoff.md`

---

*Last updated: 2026-05-16*
