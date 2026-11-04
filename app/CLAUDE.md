@AGENTS.md

# Design System Rules (always enforced)

## Token Rules — no exceptions
- **Never use raw hex values** — always `var(--md-sys-color-*)` tokens
- **Never use raw px values for border-radius** — always `var(--radius-*)` tokens
- Alpha/glass effects use `--md-sys-color-alpha-*` tokens + `backdropFilter`
- If a color doesn't have a token, add it to `app/tokens/colors.css` first

## Component Rules — look before you build
Before writing any UI element, check these locations in order:
1. `components/ui/` — generic primitives (Icon, MenuIcon, Skeleton, FilterDropdown, CompletionToast, ErrorState)
2. `components/accounts/` — account feature components (AccountListItem — `owned`, `crm` and `home` variants + `AccountListCard`, CountBadge, SortMenu)
3. `components/layout/` — structural layout (StaticBottomNav, PlaygroundNav, etc.)

If the component exists, **use it**. Do not re-implement inline.

## Dropdown / Menu Pattern
- Use `Menu` (`components/ui/Menu.tsx`) for every popup list: `variant="icon" | "check" | "icon-check"`. `SortMenu`, `FilterDropdown`, `KebabMenu` and `VisitedFilterDropdown` are triggers that render through it
- The panel is translucent `dark-secondary` with a blur, `alpha-white-18` stroke, `--radius-lg` and `--elevation-5`; spring scale-in from the trigger corner (stiffness 380, damping 22)
- **Never** hand-build a dropdown panel, and never use `var(--md-sys-color-dark-elevated)` or raw `borderRadius: 14` for menus

## Other shared pieces — use these before writing inline
- Buttons: `Button` (filled coral/indigo/danger, tonal, outlined, text; lg/md/sm; fullWidth; loading)
- Sheets: `Drawer` / `DrawerPanel` + `DrawerBackdrop`. Confirmations: `AlertDialog`. Feedback: `Toast` (`useToast()`), inline messages: `Banner`
- Fields and bars: `SearchField`, `SectionHeader`, `IconButton`, `Tabs`, `ListCard`, `ThinkingDots`

## Accessibility — always enforced
- **Body / supporting text minimum: `--md-sys-color-text-muted` (#8B94A8)** — never use `--md-sys-color-text-disabled` for readable content, only for placeholders and truly inactive controls
- **`--md-sys-color-text-disabled` (#5D667A) is for placeholders and disabled states only** — it does not pass WCAG AA contrast on dark surfaces and must not be used for descriptive or informational text
- Before shipping any new text, mentally check: "Would this pass contrast?" — when in doubt, go one step lighter
- Prefer `--md-sys-color-text-secondary` (#C3CAD8) for secondary/supporting copy, `--md-sys-color-text-muted` (#8B94A8) for de-emphasized but still readable text

## Flutter Handoff Comment
Every component file must have the handoff comment block at the top:
```
/**
 * FLUTTER HANDOFF: ComponentName
 * Widget: StatelessWidget | StatefulWidget
 * Tokens: list every --md-sys-color-* and --radius-* token used
 * ...
 */
```
