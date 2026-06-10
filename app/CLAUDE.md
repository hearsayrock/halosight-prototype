@AGENTS.md

# Design System Rules (always enforced)

## Token Rules — no exceptions
- **Never use raw hex values** — always `var(--color-*)` tokens
- **Never use raw px values for border-radius** — always `var(--radius-*)` tokens
- Alpha/glass effects use `--color-alpha-*` tokens + `backdropFilter`
- If a color doesn't have a token, add it to `globals.css` first

## Component Rules — look before you build
Before writing any UI element, check these locations in order:
1. `components/ui/` — generic primitives (Icon, MenuIcon, Skeleton, FilterDropdown, CompletionToast, ErrorState)
2. `components/accounts/` — account feature components (AccountListItem, SortMenu, SystemAccountListItem)
3. `components/layout/` — structural layout (StaticBottomNav, PlaygroundNav, etc.)

If the component exists, **use it**. Do not re-implement inline.

## Dropdown / Menu Pattern
- Use `FilterDropdown` (`components/ui/FilterDropdown.tsx`) for any filter or sort pill with options
- Use `SortMenu` (`components/accounts/SortMenu.tsx`) for the accounts sort icon button
- Both use: `var(--color-dark-tertiary)` bg, `var(--radius-xl)` border-radius, spring scale animation (stiffness 380, damping 22), `0 8px 32px rgba(0,0,0,0.6)` shadow
- **Never** use `var(--color-dark-elevated)` or raw `borderRadius: 14` for menus

## Flutter Handoff Comment
Every component file must have the handoff comment block at the top:
```
/**
 * FLUTTER HANDOFF: ComponentName
 * Widget: StatelessWidget | StatefulWidget
 * Tokens: list every --color-* and --radius-* token used
 * ...
 */
```
