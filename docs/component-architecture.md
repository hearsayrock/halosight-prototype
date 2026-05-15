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
│   │   └── BottomNav.tsx         # Bottom navigation bar
│   ├── accounts/                 # Account-specific components
│   │   ├── AccountListItem.tsx   # Single account row
│   │   ├── AccountTypeIcon.tsx   # Corporate/branch/standalone icon
│   │   └── SortMenu.tsx          # Sort dropdown overlay
│   ├── capture/                  # Capture meeting flow components
│   │   └── (to be built)
│   └── ui/                       # Generic primitives
│       └── (to be built)
│
├── lib/
│   ├── types/index.ts            # All TypeScript interfaces = Flutter Entities
│   ├── mock-data/
│   │   └── accounts.ts           # Account + AccountDetail mock data
│   └── utils.ts                  # formatLastVisited, formatDistance, cn()
│
└── public/
    └── fonts/                    # Barlow + Roboto Slab (local @font-face)
```

---

## Component Hierarchy

```
PhoneFrame (web wrapper)
└── Screen (page.tsx)
    ├── TopBar / Header
    ├── Content Area (scrollable)
    │   └── Feature Components
    │       └── UI Primitives
    └── BottomNav
```

---

## Component Categories

### Layout Components (`components/layout/`)
Structural, app-level. One instance per screen. Not domain-specific.
- `PhoneFrame` — web-only 390×844 simulator. No Flutter equivalent.
- `BottomNav` — persistent bottom navigation. Flutter: `BottomNavigationBar`.

### Feature Components (`components/accounts/`, `components/capture/`)
Domain-specific. Tied to a feature area. Reusable across screens within that feature.
- `AccountListItem` — single account row
- `AccountTypeIcon` — icon indicating account hierarchy level
- `SortMenu` — sort dropdown

### UI Primitives (`components/ui/`)
Generic, not domain-aware. Equivalent to Flutter's shared widget library.
- To be built: Button, Badge, Chip, Skeleton, ConfidenceBar, AICard

---

## Naming Conventions

| Type | Naming | Example |
|---|---|---|
| Component files | PascalCase | `AccountListItem.tsx` |
| Page files | lowercase | `page.tsx` |
| Utility files | camelCase | `utils.ts` |
| Mock data files | camelCase | `accounts.ts` |
| CSS class names | kebab-case | `phone-frame` |
| CSS tokens | kebab-case with double dash | `--color-primary` |

---

## Component File Template

Every component should follow this structure:

```tsx
"use client"; // only if needed

/**
 * FLUTTER HANDOFF: ComponentName
 * Widget: StatelessWidget | StatefulWidget
 * Props: list props and types
 * State: none OR describe state
 * Flutter equivalent: path/to/widget.dart
 * Tokens: list tokens used
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

The Flutter handoff comment block is required on every component. It makes the component self-documenting for engineers who read the prototype as a spec.

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
2. Wrap in `<PhoneFrame>` (unless it's a wide browser tool like design system)
3. Include `<BottomNav>` if it's a main app screen
4. Add Flutter handoff comment at top of file
5. Pull data from `lib/mock-data/` or define new mock data
6. Use existing components before creating new ones

## How to Add a New Component

1. Determine category: layout / feature / ui primitive
2. Place in correct `components/` subfolder
3. Include Flutter handoff comment block
4. Use CSS tokens — never raw hex values
5. Export as default export
6. Update this doc if it's a reusable primitive worth documenting

---

*Last updated: 2026-05-14*
