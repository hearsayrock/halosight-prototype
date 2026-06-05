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

Every CSS token in `globals.css` maps to Flutter `ThemeData`. The token naming in the prototype is intentionally aligned with M3 ColorScheme roles wherever possible.

```dart
// lib/theme/halosight_theme.dart

ThemeData halosightDarkTheme = ThemeData(
  colorScheme: ColorScheme(
    brightness: Brightness.dark,
    // Brand primaries
    primary: Color(0xFFFF6B5A),         // --color-brand-coral
    primaryContainer: Color(0xFFFF8F82), // --color-brand-coral-light
    onPrimary: Color(0xFF111420),        // --color-text-inverse
    secondary: Color(0xFF8B92FF),        // --color-brand-purple
    secondaryContainer: Color(0xFFB3B8FF), // --color-brand-purple-light
    onSecondary: Color(0xFF111420),
    tertiary: Color(0xFF5B63D6),         // --color-brand-blue
    onTertiary: Color(0xFFF7F8FF),
    error: Color(0xFFFF4D4F),            // --color-error
    onError: Color(0xFFF7F8FF),
    // Surfaces
    surface: Color(0xFF252A36),          // --color-dark-secondary
    onSurface: Color(0xFFF7F8FF),        // --color-text-primary
    surfaceContainerLow: Color(0xFF1A1D29),  // --color-dark-primary
    surfaceContainerHigh: Color(0xFF3D4451), // --color-dark-tertiary
    onSurfaceVariant: Color(0xFF8B94A8), // --color-text-muted
    outline: Color(0x1AFFFFFF),          // --color-alpha-white-10
  ),
  scaffoldBackgroundColor: Color(0xFF111420), // --color-background
  fontFamily: 'Barlow',
);
```

---

## Typography Mapping

The prototype uses named CSS classes for typography. Map these to Flutter `TextStyle`:

```dart
// Headings — Roboto Slab, weight 700
// .heading-1 → 60/66
TextStyle heading1 = TextStyle(fontFamily: 'RobotoSlab', fontWeight: FontWeight.w700, fontSize: 60, height: 1.10);
// .heading-2 → 48/58
TextStyle heading2 = TextStyle(fontFamily: 'RobotoSlab', fontWeight: FontWeight.w700, fontSize: 48, height: 1.21);
// .heading-3 → 36/43
TextStyle heading3 = TextStyle(fontFamily: 'RobotoSlab', fontWeight: FontWeight.w700, fontSize: 36, height: 1.19);
// .heading-4 → 24/31
TextStyle heading4 = TextStyle(fontFamily: 'RobotoSlab', fontWeight: FontWeight.w700, fontSize: 24, height: 1.29);
// .heading-5 → 20/26
TextStyle heading5 = TextStyle(fontFamily: 'RobotoSlab', fontWeight: FontWeight.w700, fontSize: 20, height: 1.30);
// .heading-6 → 18/24
TextStyle heading6 = TextStyle(fontFamily: 'RobotoSlab', fontWeight: FontWeight.w700, fontSize: 18, height: 1.33);

// Body — Barlow, weight 400 (regular) / 600 (bold)
// text-xl / .text-xl-bold → 20/30
TextStyle bodyXl     = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w400, fontSize: 20, height: 1.50);
TextStyle bodyXlBold = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w600, fontSize: 20, height: 1.50);
// text-lg / .text-lg-bold → 18/27
TextStyle bodyLg     = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w400, fontSize: 18, height: 1.50);
TextStyle bodyLgBold = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w600, fontSize: 18, height: 1.50);
// text-base / .text-base-bold → 16/24
TextStyle bodyBase     = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w400, fontSize: 16, height: 1.50);
TextStyle bodyBaseBold = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w600, fontSize: 16, height: 1.50);
// text-sm / .text-sm-bold → 14/21
TextStyle bodySm     = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w400, fontSize: 14, height: 1.50);
TextStyle bodySmBold = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w600, fontSize: 14, height: 1.50);
// text-xs / .text-xs-bold → 12/18
TextStyle bodyXs     = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w400, fontSize: 12, height: 1.50);
TextStyle bodyXsBold = TextStyle(fontFamily: 'Barlow', fontWeight: FontWeight.w600, fontSize: 12, height: 1.50);

// Labels & Captions — 10/14
// .label-serif → Roboto Slab 400
TextStyle labelSerif = TextStyle(fontFamily: 'RobotoSlab', fontWeight: FontWeight.w400, fontSize: 10, height: 1.40);
// .text-2xs → Barlow 400
TextStyle text2xs    = TextStyle(fontFamily: 'Barlow',     fontWeight: FontWeight.w400, fontSize: 10, height: 1.40);
```

---

## Icons

The prototype uses **Material Symbols Rounded** as a variable font. In Flutter, use the `material_symbols_icons` package which provides the same icon set.

```yaml
# pubspec.yaml
dependencies:
  material_symbols_icons: ^4.0.0
```

```dart
import 'package:material_symbols_icons/symbols.dart';

// Prototype: <Icon name="home" />
Icon(Symbols.home)

// Prototype: <Icon name="star" fill size={32} />
Icon(Symbols.star, fill: 1, size: 32)

// Prototype: <Icon name="check" weight={300} size={20} />
Icon(Symbols.check, weight: 300, size: 20)
```

Icon names are identical between the prototype (`"home"`, `"sort"`, `"close"`) and the Flutter package (`Symbols.home`, `Symbols.sort`, `Symbols.close`).

### Custom SVG Icons

For Halosight-specific icons (chain, branch, standalone, menu), use `flutter_svg` or convert paths to `CustomPainter`:

| Prototype component | Flutter approach |
|---|---|
| `AccountTypeIcon` | `CustomPainter` — 3 variants (corporate/branch/standalone) |
| `MenuIcon` | `CustomPainter` or `flutter_svg` — 2 pill bars |
| BottomNav home/accounts icons | Inline `Path` in `CustomPaint` |

---

## Component Handoff Reference

### AccountListItem
**Prototype:** `app/components/accounts/AccountListItem.tsx`  
**Flutter equivalent:** `lib/view/_widget/account_list/accounts_view_account_list_item.dart`

```
Widget type: StatelessWidget
Props:
  - account: Account
  - onTap: VoidCallback
Layout:
  Row: [AccountTypeIcon | Column(name, Row(distance · lastVisited)) | city/state?]
  items-start alignment — icon offset 3px top, city/state offset 2px top
  Padding: 16px horizontal, 12px vertical
  Background: --color-dark-secondary
  Border: 1px --color-alpha-white-10
  Radius: --radius-sm
State: none — purely presentational
Tokens:
  bg: dark-secondary
  border: alpha-white-10
  radius: radius-sm
  name: text-primary, heading-6
  distance/meta: text-muted, text-sm (14px)
  lastVisited today: brand-coral
  city/state: brand-purple-light, text-sm (14px)
```

### AccountTypeIcon
**Prototype:** `app/components/accounts/AccountTypeIcon.tsx`  
**Flutter equivalent:** `CustomPainter` or SVG widget

```
Widget type: StatelessWidget
Props: type (AccountType: corporate | branch | standalone)
Size: 18×18
corporate: layered diamond/chain icon — stroked paths, --color-text-muted top layer, --color-text-disabled lower
branch: rectangle outline with dot grid
standalone: rectangle outline with horizontal dash
```

### SortMenu
**Prototype:** `app/components/accounts/SortMenu.tsx`  
**Flutter equivalent:** `PopupMenuButton<SortOption>` or custom overlay

```
Widget type: StatefulWidget (manages open/close)
Props: current (SortOption), onChange (Function)
Trigger:
  Size: 40×40, radius: rounded-xl
  Background: --color-dark-secondary
  Icon: sort (3 horizontal bars), --color-text-muted
  On open: trigger fades + scales down (opacity 0, scale 0.85, 120ms)
Dropdown:
  Background: --color-dark-tertiary
  Radius: --radius-xl
  Padding: 16px top/bottom, 20px sides
  Shadow: --elevation-3
  Row layout: [16px check slot | 12px gap | label text]
  Check icon: visible on selected row only
  All labels: --color-text-primary, text-base (16px)
Options: alphabetical | distance | lastVisited | company
State: isOpen bool
Animation (iOS UIMenu style):
  Origin: top-right corner of trigger — menu's top-right corner is anchored to button position
  Open: scale 0.01→1 + opacity 0→1, spring (stiffness 380, damping 22, mass 0.9)
  Rows: stagger-fade in, 40ms apart, starting at 60ms after open begins
  Close: scale 1→0.01 + opacity 1→0, no bounce (quick snap ~150ms)
  Flutter: AnimationController + CurvedAnimation(curve: spring) + ScaleTransition,
           transformAlignment: Alignment.topRight
```

### BottomNav
**Prototype:** `app/components/layout/BottomNav.tsx`  
**Flutter equivalent:** Custom `BottomNavigationBar` or `NavigationBar`

```
Widget type: StatefulWidget (or driven by router)
Props: activeTab (home | accounts)
Layout:
  Floating pill — 32px margin bottom and sides
  Height: 66px, radius: full (9999px)
  Background: --color-alpha-purple-glass
  Border: 1px --color-alpha-white-10
  Backdrop filter: blur(20px) saturate(180%) — liquid glass
  Shadow: 0 8px 32px rgba(0,0,0,0.35)
Active pill:
  Background: --color-alpha-dark-glass (rgba(255,255,255,0.18))
  Inset: 6px top/bottom/outer-edge
  Animated: left + right CSS transition 200ms ease
Tab labels: .label-serif (Roboto Slab 10px)
Active: --color-text-primary icon + label
Inactive: --color-text-muted icon + label
Icons: filled SVG paths, 22×22 rendered
```

### Icon
**Prototype:** `app/components/ui/Icon.tsx`  
**Flutter equivalent:** `Icon(Symbols.name)` from `material_symbols_icons`

```
Widget type: StatelessWidget
Props:
  name: string (Material Symbols icon name)
  fill: bool (default false)
  size: number (default 24)
  weight: 100|200|300|400|500|600|700 (default 400)
  grade: number (default 0)
Renders Material Symbols Rounded via variable font
Color: currentColor (controlled via className or style)
```

### MenuIcon
**Prototype:** `app/components/ui/MenuIcon.tsx`  
**Flutter equivalent:** `CustomPainter` or inline `Icon(Symbols.menu)`

```
Widget type: StatelessWidget
Props: size (default 32), color (default --color-text-muted)
SVG: two pill-shaped bars
  Top bar: full width (32px), height 5px, y=7, rx=2.5
  Bottom bar: 56% width (18px), height 5px, y=19, rx=2.5
Use: top nav left — triggers side drawer / menu overlay
```

---

## Interaction Conventions

| Prototype pattern | Flutter equivalent |
|---|---|
| `Link href="/accounts"` | `GoRouter.go('/accounts')` or `Navigator.pushNamed` |
| `useState` for local UI state | `setState` in StatefulWidget or local Cubit |
| `active:opacity-60` | `GestureDetector` + `AnimatedOpacity` or `InkWell` |
| Slide-out drawer | `Drawer` widget or custom `AnimatedPositioned` |
| CSS `transition` on transform | `AnimationController` + `Tween` |
| `scroll-behavior: smooth` | `ScrollController.animateTo()` |
| Backdrop blur (`backdropFilter`) | `BackdropFilter(filter: ImageFilter.blur(...))` |

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

- File names: `snake_case`
- Class names: `PascalCase`
- Method names: `camelCase`
- Test files: `{file_being_tested}_test.dart`
- Feature branches: `DELIVERY-{ticket}-short-description`

---

## Production Flutter Component Library

Existing reusable components in production:
- `HalosightFilledButton` → `lib/view/_widget/button/halosight_filled_button.dart`
- `HalosightUnfilledButton` → `lib/view/_widget/button/halosight_unfilled_button.dart`
- `AccountsViewAccountListItem` → `lib/view/_widget/account_list/accounts_view_account_list_item.dart`
- `AccountsViewAccountGroup` → `lib/view/_widget/account_list/accounts_view_account_group.dart`
- `EngagementMenuDrawer` → `lib/view/_widget/account_list/engagement_menu_drawer.dart`
- `HalosightGlassContainer` → `lib/view/_widget/halosight_glass_container.dart`
- `SlidingUnderlay` → `lib/view/_widget/sliding_underlay.dart`
- `ListItemContainer` → `lib/view/_widget/list_item_container.dart`

Check whether a production widget already exists before creating a net-new component.

---

*Last updated: 2026-05-17*
