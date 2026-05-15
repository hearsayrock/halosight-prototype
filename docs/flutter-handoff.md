# Flutter Handoff Guide

> How to translate this prototype into production Flutter code. Intended for Flutter engineers reading the prototype as a living specification.

---

## Architecture Mapping

The prototype uses Next.js with a structure that intentionally mirrors Flutter's clean architecture:

| Prototype Layer | Flutter Equivalent |
|---|---|
| `app/app/[route]/page.tsx` | `lib/view/[feature]/[feature]_page.dart` |
| `components/` (stateful) | `lib/view/_widget/` stateful widgets |
| `components/` (stateless) | `lib/view/_widget/` stateless widgets |
| `lib/types/index.ts` | `lib/entity/` domain models |
| `lib/mock-data/` | `lib/adapter/` repository implementations |
| `lib/utils.ts` | Utility functions across layers |
| State in `useState` | `lib/view_model/` BLoC/Cubit state |
| Page-level data fetching | `lib/use_case/` use cases |

---

## Design Token Mapping

Every CSS token in `globals.css` maps to Flutter `ThemeData`:

```dart
// lib/theme/halosight_theme.dart

ThemeData halosightDarkTheme = ThemeData(
  colorScheme: ColorScheme(
    brightness: Brightness.dark,
    primary: Color(0xFFE8614A),       // --color-primary
    onPrimary: Color(0xFFFFFFFF),     // --color-on-primary
    primaryContainer: Color(0xFF4A1F16),  // --color-primary-container
    onPrimaryContainer: Color(0xFFFFB4A6),
    secondary: Color(0xFF6B7FD7),     // --color-secondary
    onSecondary: Color(0xFFFFFFFF),
    secondaryContainer: Color(0xFF1E2550),
    onSecondaryContainer: Color(0xFFBEC6FF),
    tertiary: Color(0xFF4CAF82),      // --color-tertiary
    onTertiary: Color(0xFFFFFFFF),
    error: Color(0xFFE85A6B),         // --color-error
    onError: Color(0xFFFFFFFF),
    surface: Color(0xFF1C1D2B),       // --color-surface
    onSurface: Color(0xFFFFFFFF),
    surfaceContainerHigh: Color(0xFF22243A),
    onSurfaceVariant: Color(0xFF8B8FA8),
    outline: Color(0xFF2A2D45),
    outlineVariant: Color(0xFF1E2035),
  ),
  textTheme: _barlowTextTheme,
  fontFamily: 'Barlow',
);
```

---

## Typography Mapping

```dart
// M3 TextTheme using Barlow
TextTheme _barlowTextTheme = TextTheme(
  // headlineLarge → account names on detail screen
  headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, height: 1.25),
  // headlineMedium → login tagline
  headlineMedium: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, height: 1.30),
  // headlineSmall → section headers
  headlineSmall: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, height: 1.35),
  // titleLarge → "Last Time", "Ideas for this Time"
  titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, height: 1.40),
  // titleMedium → button labels
  titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, height: 1.40),
  // bodyLarge → AI summary, list item names
  bodyLarge: TextStyle(fontSize: 15, fontWeight: FontWeight.w400, height: 1.60),
  // bodyMedium → secondary content
  bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, height: 1.60),
  // bodySmall → distance, timestamps in list
  bodySmall: TextStyle(fontSize: 13, fontWeight: FontWeight.w400, height: 1.50),
  // labelLarge → CTA button text
  labelLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, height: 1.25),
  // labelMedium → CORPORATE ACCOUNT label, badges
  labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, height: 1.30),
  // labelSmall → timestamps, status text
  labelSmall: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, height: 1.30),
);
```

---

## Component Handoff Reference

### AccountListItem
**Prototype:** [`app/components/accounts/AccountListItem.tsx`](../app/components/accounts/AccountListItem.tsx)
**Flutter equivalent:** `lib/view/_widget/account_list/accounts_view_account_list_item.dart`

```
Widget type: StatelessWidget
Props:
  - account: Account (entity)
  - onTap: VoidCallback
Layout:
  - Row: [AccountTypeIcon | Column(name, badge) + Row(distance, dot, lastVisited) | CityState?]
  - Height: auto (min ~64px)
  - Padding: 16px horizontal, 16px vertical
  - Divider: bottom border, color: outline
State: none — purely presentational
Tokens: surface, on-surface, on-surface-variant, primary (Visited Today), radius-md
```

### AccountTypeIcon
**Prototype:** [`app/components/accounts/AccountTypeIcon.tsx`](../app/components/accounts/AccountTypeIcon.tsx)
**Flutter equivalent:** custom `CustomPainter` or SVG widget

```
Widget type: StatelessWidget
Props: type (AccountType: corporate | branch | standalone)
Corporate: two overlapping rectangles (stacked layers visual)
Branch/Standalone: single rectangle
Color: on-surface-variant
Size: 20×20
```

### SortMenu
**Prototype:** [`app/components/accounts/SortMenu.tsx`](../app/components/accounts/SortMenu.tsx)
**Flutter equivalent:** `PopupMenuButton<SortOption>` or custom overlay

```
Widget type: StatefulWidget (manages open/close)
Props: currentSort (SortOption), onSortChange (Function)
Trigger: filter icon button, 40×40
Dropdown: surface-container-high background, elevation-3 shadow, radius-lg
Items: 4 sort options with checkmark on active
State: isOpen bool
```

### BottomNav
**Prototype:** [`app/components/layout/BottomNav.tsx`](../app/components/layout/BottomNav.tsx)
**Flutter equivalent:** `BottomNavigationBar` with custom styling

```
Widget type: StatefulWidget (or driven by router)
Props: activeTab (home | accounts)
Height: 72px
Tabs: Home (house icon), Accounts (person icon)
Active: primary color
Inactive: on-surface-variant
Top border: outline color, 1px
```

---

## Interaction Conventions

| Prototype pattern | Flutter equivalent |
|---|---|
| `Link href="/accounts"` | `Navigator.pushNamed(context, '/accounts')` or GoRouter |
| `useState` for local UI state | `setState` in StatefulWidget or local Cubit |
| `useMemo` for filtered list | Computed getter on ViewModel |
| `onClick` opacity feedback | `InkWell` with `splashColor` or `GestureDetector` with opacity animation |

---

## Data Flow Convention

```
Prototype:                          Flutter:
mockAccounts (static)     →    Repository → UseCase → ViewModel → View
lib/types/Account.ts      →    lib/entity/account.dart
lib/mock-data/accounts.ts →    lib/adapter/account_repository_impl.dart
page.tsx state            →    AccountsViewModel (BLoC/Cubit)
```

---

## File Naming Conventions (Flutter)

From `AGENTS.md` in the production codebase:
- File names: `snake_case`
- Class names: `PascalCase`
- Method names: `camelCase`
- Test files: `{file_being_tested}_test.dart`
- Feature branches: `DELIVERY-{ticket}-short-description`

---

## Production Flutter Component Library

Existing reusable components in production (from `AGENTS.md`):
- `HalosightFilledButton` → `lib/view/_widget/button/halosight_filled_button.dart`
- `HalosightUnfilledButton` → `lib/view/_widget/button/halosight_unfilled_button.dart`
- `AccountsViewAccountListItem` → `lib/view/_widget/account_list/accounts_view_account_list_item.dart`
- `AccountsViewAccountGroup` → `lib/view/_widget/account_list/accounts_view_account_group.dart`
- `EngagementMenuDrawer` → `lib/view/_widget/account_list/engagement_menu_drawer.dart`
- `HalosightGlassContainer` → `lib/view/_widget/halosight_glass_container.dart`
- `SlidingUnderlay` → `lib/view/_widget/sliding_underlay.dart`
- `ListItemContainer` → `lib/view/_widget/list_item_container.dart`

When building new prototype screens, check whether a production widget already exists for that pattern before creating a net-new component.

---

*Last updated: 2026-05-14*
