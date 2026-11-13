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

The prototype pins the official token file and maps it to generated CSS. Active-listening generates `lib/view/theme/design_tokens.dart` from the same release. Consume those generated constants; do not restate values in a second Dart theme file. The new typography and weight classes follow the mapping proposal in the official design-system PR.

```dart
// Import the generated file from active-listening.
import 'package:active_listening/view/theme/design_tokens.dart';

ThemeData halosightDarkTheme = ThemeData(
  colorScheme: ColorScheme(
    brightness: Brightness.dark,
    // Brand primaries
    primary: DesignColors.brandCoral,
    primaryContainer: DesignColors.brandCoralLight,
    onPrimary: DesignColors.textInverse,
    secondary: DesignColors.neonindigo,
    secondaryContainer: DesignColors.neonindigoLight,
    onSecondary: DesignColors.textInverse,
    tertiary: DesignColors.indigo,
    onTertiary: DesignColors.textPrimary,
    error: DesignColors.semanticError,
    onError: DesignColors.textPrimary,
    // Surfaces
    surface: DesignColors.darkSecondary,
    onSurface: DesignColors.textPrimary,
    surfaceContainerLow: DesignColors.darkPrimary,
    surfaceContainerHigh: DesignColors.darkTertiary,
    onSurfaceVariant: DesignColors.textMuted,
    outline: DesignColors.alphaWhite10,
  ),
  scaffoldBackgroundColor: DesignColors.background,
  fontFamily: DesignFonts.sans,
);

// Brand extension colors not mapped to M3 ColorScheme roles
class HalosightColors extends ThemeExtension<HalosightColors> {
  final Color brandTealLight;
  final Color brandTeal;
  final Color brandTealDark;

  const HalosightColors({
    required this.brandTealLight,
    required this.brandTeal,
    required this.brandTealDark,
  });

  static const defaults = HalosightColors(
    brandTealLight: DesignColors.brandTealLight,
    brandTeal: DesignColors.brandTeal,
    brandTealDark: DesignColors.brandTealDark,
  );

  @override
  HalosightColors copyWith({Color? brandTealLight, Color? brandTeal, Color? brandTealDark}) =>
      HalosightColors(
        brandTealLight: brandTealLight ?? this.brandTealLight,
        brandTeal:      brandTeal      ?? this.brandTeal,
        brandTealDark:  brandTealDark  ?? this.brandTealDark,
      );

  @override
  HalosightColors lerp(HalosightColors? other, double t) => this;
}
// Usage: Theme.of(context).extension<HalosightColors>()!.brandTeal
```

---

## Typography Mapping

Typography composites are generated as `TextStyle` constants from the official token file. CSS properties are generated from those same composites.

```dart
TextStyle heading = DesignTypography.heading1;
TextStyle body = DesignTypography.textBase;
TextStyle emphasizedBody = DesignTypography.textBaseBold;
FontWeight semibold = DesignFontWeights.semibold;

// Flutter TextStyle has no textTransform field.
String eyebrowLabel = switch (DesignTypographyTransforms.eyebrow) {
  'uppercase' => label.toUpperCase(),
  _ => label,
};
```

Use the generated elevation values in shared widgets:

```dart
BoxDecoration(boxShadow: DesignElevation.elevation3);
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

---

## Component Handoff Reference

### AccountListItem
**Prototype:** `app/components/accounts/AccountListItem.tsx`  
**Flutter equivalent:** `lib/view/_widget/account_list/accounts_view_account_list_item.dart`

One widget with a `variant` enum (`owned`, `crm`, `home`). The full spec — props, layout, token paths, anti-patterns,
changelog — lives in the component's `FLUTTER HANDOFF` comment and its `docs/component-registry.ts` entry; the live
variants and the `CountBadge` sub-component are on `/design-system#account-list-item`. `crm` and `home` rows sit inside
`ListCard` (`components/ui/ListCard.tsx`: card fill, hairline border, radius).

### AccountTypeIcon
**Prototype:** `app/components/accounts/AccountTypeIcon.tsx`  
**Flutter equivalent:** `CustomPainter` or SVG widget

```
Widget type: StatelessWidget
Props: type (AccountType: corporate | branch | standalone)
Size: 18×18
corporate: layered diamond/chain icon — stroked paths, --md-sys-color-text-muted top layer, --md-sys-color-text-disabled lower
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
  Background: --md-sys-color-dark-secondary
  Icon: sort (3 horizontal bars), --md-sys-color-text-muted
  On open: trigger fades + scales down (opacity 0, scale 0.85, 120ms)
Dropdown:
  Background: --md-sys-color-dark-tertiary
  Radius: --radius-xl
  Padding: 16px top/bottom, 20px sides
  Shadow: --elevation-3
  Row layout: [16px check slot | 12px gap | label text]
  Check icon: visible on selected row only
  All labels: --md-sys-color-text-primary, text-base (16px)
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
Props: size (default 32), color (default --md-sys-color-text-muted)
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
