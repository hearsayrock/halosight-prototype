/**
 * Halosight Component Registry
 *
 * The authoritative quick-reference for AI when building any UI in this project.
 * Read this file before creating or modifying any component or screen.
 *
 * Rules enforced by this registry:
 *   1. Never use raw hex values — always var(--color-*)
 *   2. Never recreate a component that already exists here
 *   3. Always use the tokens listed under `tokens.required`
 *   4. Always check `usage.antiPatterns` before writing markup
 *   5. Every new component must be added here AND reflected on /design-system
 *
 * Source of truth for tokens: /app/app/globals.css
 * Live viewer: localhost:3000/design-system
 * Flutter handoff details: docs/flutter-handoff.md
 */

// ─── Schema ───────────────────────────────────────────────────────────────────

interface TokenRef {
  token: string;
  role: string; // what it controls in this component
}

interface PropDef {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

interface Pattern {
  name: string;
  when: string;
  code: string;
}

interface AntiPattern {
  scenario: string;
  why: string;
  instead: string;
}

interface ComponentMeta {
  name: string;
  category: "layout" | "feature" | "ui-primitive";
  type: "interactive" | "display" | "navigation" | "input";
  description: string;
  file: string;
  designSystemSection: string; // anchor on localhost:3000/design-system
  flutterEquivalent: string;
  tokens: {
    required: TokenRef[];
    forbidden: string[]; // raw values or wrong tokens never to use here
  };
  props: PropDef[];
  usage: {
    patterns: Pattern[];
    antiPatterns: AntiPattern[];
  };
  aiHints: {
    priority: "high" | "medium" | "low";
    useWhen: string[];
    neverUseFor: string[];
    alwaysRemember: string[];
  };
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const registry: ComponentMeta[] = [

  // ── BottomNav ───────────────────────────────────────────────────────────────
  {
    name: "BottomNav",
    category: "layout",
    type: "navigation",
    description:
      "Floating glass pill navigation bar with Home and Accounts tabs. " +
      "Sits outside the scroll area at the bottom of every main app screen. " +
      "Active tab indicated by a sliding dark pill with 6px inset.",
    file: "app/components/layout/BottomNav.tsx",
    designSystemSection: "#navigation",
    flutterEquivalent: "Custom NavigationBar — see flutter-handoff.md BottomNav section",
    tokens: {
      required: [
        { token: "--color-alpha-purple-glass", role: "nav background" },
        { token: "--color-alpha-white-10",     role: "nav border" },
        { token: "--color-alpha-dark-glass",   role: "active pill fill" },
        { token: "--color-text-primary",       role: "active icon + label color" },
        { token: "--color-text-muted",         role: "inactive icon + label color" },
        { token: "--radius-full",              role: "nav pill shape" },
      ],
      forbidden: [
        "Any raw hex for background — must be alpha token for glass effect",
        "--color-dark-secondary (not transparent enough for glass)",
        "--color-brand-purple (wrong role — that's for interactive elements)",
      ],
    },
    props: [],
    usage: {
      patterns: [
        {
          name: "standard",
          when: "Every main app screen (Home, Accounts)",
          code: `
import BottomNav from "@/components/layout/BottomNav";

// Place outside the scrollable content area, at bottom of flex column
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-y-auto">
    {/* screen content */}
  </div>
  <BottomNav />
</div>`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Placing BottomNav inside a scrollable container",
          why: "It floats fixed above the viewport — it must sit in the flex column outside the scroll area",
          instead: "Wrap screen content in a flex column; BottomNav is the last sibling, flex-shrink-0",
        },
        {
          scenario: "Recreating nav tabs with plain divs or buttons",
          why: "BottomNav handles active state, glass effect, sliding pill, and label-serif typography",
          instead: "Use <BottomNav /> — it reads the current pathname automatically",
        },
        {
          scenario: "Adding a third tab to BottomNav without updating the active pill logic",
          why: "The pill uses left/right CSS transitions calculated for exactly 2 tabs",
          instead: "Redesign pill logic when adding tabs — document in flutter-handoff.md",
        },
      ],
    },
    aiHints: {
      priority: "high",
      useWhen: [
        "Building any main app screen that is a top-level tab destination",
        "Speccing the persistent navigation layer for Flutter handoff",
      ],
      neverUseFor: [
        "Modal screens, detail screens, or flows nested within a tab",
        "The /design-system page (it's a browser tool, not a mobile screen)",
      ],
      alwaysRemember: [
        "BottomNav reads usePathname() — no activeTab prop needed",
        "The 32px padding (px-8 pb-8) is part of the component — do not add extra margin",
        "label-serif (.label-serif) is the correct class for tab labels — not text-xs or font-medium",
      ],
    },
  },

  // ── AccountListItem ─────────────────────────────────────────────────────────
  {
    name: "AccountListItem",
    category: "feature",
    type: "interactive",
    description:
      "Tappable account card showing type icon, name, distance, last-visited recency, " +
      "and optional city/state. Used in the accounts list. Navigates to /accounts/:id on tap.",
    file: "app/components/accounts/AccountListItem.tsx",
    designSystemSection: "#cards",
    flutterEquivalent: "AccountsViewAccountListItem — lib/view/_widget/account_list/accounts_view_account_list_item.dart",
    tokens: {
      required: [
        { token: "--color-dark-secondary",     role: "card background" },
        { token: "--color-alpha-white-10",     role: "card border (1px)" },
        { token: "--radius-sm",                role: "card border radius" },
        { token: "--color-text-primary",       role: "account name" },
        { token: "--color-text-muted",         role: "distance and last-visited text" },
        { token: "--color-brand-coral",        role: "last-visited label when isToday = true" },
        { token: "--color-brand-purple-light", role: "city, state text" },
      ],
      forbidden: [
        "Raw hex for background (#202535, #252A36, etc.)",
        "--color-dark-primary (too dark — loses hierarchy against page bg)",
        "--color-text-disabled for city/state (too faint — use brand-purple-light)",
        "Adding a count badge (removed — do not re-add)",
      ],
    },
    props: [
      {
        name: "account",
        type: "Account",
        required: true,
        description: "Account entity from lib/types — includes id, name, type, distanceMiles, lastVisited, city, state",
      },
    ],
    usage: {
      patterns: [
        {
          name: "accounts list",
          when: "Rendering the flat list of accounts on /accounts",
          code: `
import AccountListItem from "@/components/accounts/AccountListItem";
import type { Account } from "@/lib/types";

// Inside a flex column with gap-2
<div className="flex flex-col gap-2 px-4 py-2">
  {accounts.map((account) => (
    <AccountListItem key={account.id} account={account} />
  ))}
</div>`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Building an account row with a plain <div> or <Link>",
          why: "AccountListItem handles card styling, icon alignment, recency color, distance formatting, and navigation",
          instead: "Use <AccountListItem account={account} /> — pass the full Account object",
        },
        {
          scenario: "Showing city/state in --color-text-muted",
          why: "City/state is intentionally purple-light to distinguish it from the distance/recency metadata",
          instead: "Always use --color-brand-purple-light for city and state",
        },
        {
          scenario: "Adding hover background highlight",
          why: "Mobile cards use active:opacity-70 — hover states are not part of the mobile design spec",
          instead: "Keep active:opacity-70 transition-opacity only",
        },
      ],
    },
    aiHints: {
      priority: "high",
      useWhen: [
        "Rendering any list of Account objects",
        "Showing account search results",
        "Showing filtered/sorted account lists",
      ],
      neverUseFor: [
        "Non-account entities (contacts, activities, etc.) — build a new component",
        "Detail screen headers — that's a different layout pattern",
      ],
      alwaysRemember: [
        "Icon and city/state use mt-[3px] / mt-[2px] to align with the title baseline — do not change",
        "heading-6 is the correct class for account name (Roboto Slab 18px/700)",
        "formatLastVisited() and formatDistance() from lib/utils handle all formatting — never format inline",
        "gap-2 between cards, px-4 py-2 on the list container",
      ],
    },
  },

  // ── AccountTypeIcon ─────────────────────────────────────────────────────────
  {
    name: "AccountTypeIcon",
    category: "feature",
    type: "display",
    description:
      "SVG icon indicating account hierarchy type: corporate (chain/layered diamonds), " +
      "branch (building with dot grid), standalone (square with dash). " +
      "Used inside AccountListItem — not a standalone UI element.",
    file: "app/components/accounts/AccountTypeIcon.tsx",
    designSystemSection: "#icons",
    flutterEquivalent: "CustomPainter with 3 variants",
    tokens: {
      required: [
        { token: "--color-text-muted",    role: "primary stroke color (#8B94A8)" },
        { token: "--color-text-disabled", role: "secondary/lower-layer stroke (#5D667A)" },
      ],
      forbidden: [
        "Brand colors for these icons — they are intentionally neutral/muted",
        "Filled/solid SVG paths — all icons use stroke-based style",
      ],
    },
    props: [
      {
        name: "type",
        type: '"corporate" | "branch" | "standalone"',
        required: true,
        description: "Determines which SVG icon renders. Maps to AccountType from lib/types.",
      },
    ],
    usage: {
      patterns: [
        {
          name: "inside AccountListItem",
          when: "Always — this icon is only used inside account cards",
          code: `
import AccountTypeIcon from "@/components/accounts/AccountTypeIcon";

<AccountTypeIcon type={account.type} />`,
        },
        {
          name: "design system display",
          when: "Showing all three variants in the design system Icons section",
          code: `
{(["corporate", "branch", "standalone"] as const).map((type) => (
  <AccountTypeIcon key={type} type={type} />
))}`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Using a Material Symbols icon (e.g. 'business', 'store') for account type",
          why: "Account type icons are custom SVGs with specific visual meaning for the Halosight hierarchy system",
          instead: "Always use <AccountTypeIcon type={account.type} />",
        },
        {
          scenario: "Scaling AccountTypeIcon beyond its designed 18×18 size",
          why: "Stroke widths are tuned for 18×18 — scaling distorts the weight",
          instead: "Create a new size variant if a larger version is needed",
        },
      ],
    },
    aiHints: {
      priority: "medium",
      useWhen: [
        "Displaying account type in any list or card context",
        "Showing account hierarchy visually",
      ],
      neverUseFor: [
        "Generic company or building icons — use Icon component with Material Symbols instead",
      ],
      alwaysRemember: [
        "Rendered at 18×18 — the parent (AccountListItem) adds mt-[3px] to align with title baseline",
        "The icon colors are hardcoded SVG fill/stroke values that map to --color-text-muted and --color-text-disabled — they are not CSS variables because SVG fill doesn't read CSS custom properties without currentColor refactor",
      ],
    },
  },

  // ── SortMenu ────────────────────────────────────────────────────────────────
  {
    name: "SortMenu",
    category: "feature",
    type: "interactive",
    description:
      "Sort dropdown for the accounts list. Trigger button opens a floating dropdown " +
      "with 4 sort options. Selected option shows a checkmark. Closes on selection, " +
      "backdrop tap, or Escape key.",
    file: "app/components/accounts/SortMenu.tsx",
    designSystemSection: "#menus",
    flutterEquivalent: "PopupMenuButton<SortOption> or custom overlay",
    tokens: {
      required: [
        { token: "--color-dark-secondary", role: "trigger button background" },
        { token: "--color-text-muted",     role: "trigger icon strokes" },
        { token: "--color-dark-tertiary",  role: "dropdown background" },
        { token: "--color-text-primary",   role: "all option labels (active and inactive)" },
        { token: "--radius-xl",            role: "dropdown border radius" },
      ],
      forbidden: [
        "Raw hex (#2A3042, #F7F8FF, #8B94A8) — all removed in the token migration",
        "--color-text-muted for inactive option labels (all options use text-primary)",
        "--color-dark-secondary for dropdown bg (too light — use dark-tertiary)",
        "--radius-md for dropdown (use radius-xl per design spec)",
      ],
    },
    props: [
      {
        name: "current",
        type: "SortOption",
        required: true,
        description: 'Current active sort. SortOption = "alphabetical" | "distance" | "lastVisited" | "company"',
      },
      {
        name: "onChange",
        type: "(sort: SortOption) => void",
        required: true,
        description: "Called when user selects a new sort option. Parent owns sort state.",
      },
    ],
    usage: {
      patterns: [
        {
          name: "accounts list header",
          when: "In the accounts page header, right-aligned",
          code: `
import SortMenu from "@/components/accounts/SortMenu";
import { useState } from "react";
import type { SortOption } from "@/lib/types";

const [sort, setSort] = useState<SortOption>("alphabetical");

<SortMenu current={sort} onChange={setSort} />`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Building a dropdown with a plain <select> element",
          why: "Native select doesn't match the dark-tertiary glass aesthetic or the checkmark pattern",
          instead: "Use <SortMenu /> or extend it if new sort options are needed",
        },
        {
          scenario: "Managing isOpen state in the parent",
          why: "SortMenu owns its own open/close state internally",
          instead: "Only pass `current` and `onChange` — do not try to control open state from outside",
        },
        {
          scenario: "Using different text colors for active vs inactive options",
          why: "Design spec: ALL options use --color-text-primary. Selection is indicated by checkmark only.",
          instead: "Keep all labels at --color-text-primary regardless of selected state",
        },
      ],
    },
    aiHints: {
      priority: "medium",
      useWhen: [
        "Providing a sort or filter control in a list header",
        "Any dropdown that needs the dark-tertiary glass aesthetic",
      ],
      neverUseFor: [
        "Navigation — use Link or router",
        "Action menus (delete, edit, share) — build a separate ActionMenu component",
      ],
      alwaysRemember: [
        "Dropdown padding: 16px top/bottom, 20px sides (not uniform 24px)",
        "Checkmark slot is 16px wide — always rendered (empty for unselected) to keep labels aligned",
        "Gap between checkmark slot and label: 12px",
        "text-base class for option labels (Barlow 16px/400)",
      ],
    },
  },

  // ── Icon ────────────────────────────────────────────────────────────────────
  {
    name: "Icon",
    category: "ui-primitive",
    type: "display",
    description:
      "Material Symbols Rounded variable font wrapper. Single source for all M3 icons. " +
      "Supports FILL, wght, GRAD, and opsz axes. Icon names are identical to the " +
      "Figma Material Symbols community library.",
    file: "app/components/ui/Icon.tsx",
    designSystemSection: "#icons",
    flutterEquivalent: "Icon(Symbols.name) from material_symbols_icons package",
    tokens: {
      required: [
        { token: "currentColor", role: "icon color — set via style or className on parent" },
      ],
      forbidden: [
        "Hardcoded color in the Icon component itself — always control color from outside via style prop",
        "Using raw <span className='ms'> instead of <Icon /> — bypasses opsz calculation",
      ],
    },
    props: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Material Symbols icon name in underscore_case. E.g. 'home', 'arrow_back', 'check_circle'.",
      },
      {
        name: "fill",
        type: "boolean",
        required: false,
        default: "false",
        description: "FILL axis. true = filled variant, false = outlined.",
      },
      {
        name: "size",
        type: "number",
        required: false,
        default: "24",
        description: "Font size in px. Also drives opsz axis automatically.",
      },
      {
        name: "weight",
        type: "100 | 200 | 300 | 400 | 500 | 600 | 700",
        required: false,
        default: "400",
        description: "wght axis. Lighter weights (100–300) for decorative icons, heavier (600–700) for emphasis.",
      },
      {
        name: "style",
        type: "React.CSSProperties",
        required: false,
        description: "Use this to set color: 'var(--color-text-primary)' etc.",
      },
      {
        name: "label",
        type: "string",
        required: false,
        description: "Accessible label. If omitted, icon is aria-hidden. Provide when icon conveys meaning without adjacent text.",
      },
    ],
    usage: {
      patterns: [
        {
          name: "basic icon",
          when: "Decorative icon next to text — no label needed",
          code: `
import Icon from "@/components/ui/Icon";

<Icon name="home" style={{ color: "var(--color-text-primary)" }} />`,
        },
        {
          name: "filled icon, custom size",
          when: "Hero icons, feature illustrations, filled active states",
          code: `
<Icon name="star" fill size={32} style={{ color: "var(--color-brand-coral)" }} />`,
        },
        {
          name: "lightweight icon",
          when: "Subtle, decorative, or secondary context",
          code: `
<Icon name="arrow_forward" weight={300} size={20} style={{ color: "var(--color-text-muted)" }} />`,
        },
        {
          name: "accessible standalone icon",
          when: "Icon used as the only indicator of an action (no adjacent label)",
          code: `
<Icon name="close" size={20} label="Close" style={{ color: "var(--color-text-muted)" }} />`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Using emoji or text characters as icons",
          why: "Breaks Flutter handoff, accessibility, and visual consistency",
          instead: "Use <Icon name='...' /> with the appropriate Material Symbols name",
        },
        {
          scenario: "Using _outline or _border suffix in icon names (e.g. 'info_outline')",
          why: "Those suffixes don't exist in Material Symbols — the font won't render the ligature and you'll see raw text",
          instead: "Use the base name ('info') and control filled vs outlined via the fill prop",
        },
        {
          scenario: "Inlining SVG for any icon that exists in Material Symbols",
          why: "Breaks consistency and Flutter handoff — the Flutter team uses the material_symbols_icons package",
          instead: "Use <Icon name='...' /> — only use custom SVGs for Halosight-specific icons (AccountTypeIcon, MenuIcon)",
        },
        {
          scenario: "Omitting the style color prop",
          why: "Icon inherits currentColor — if no color is set in the hierarchy it defaults to white which may blend into backgrounds",
          instead: "Always explicitly set color via style={{ color: 'var(--color-*)' }}",
        },
      ],
    },
    aiHints: {
      priority: "high",
      useWhen: [
        "Any icon that exists in Material Symbols Rounded (nearly all standard UI icons)",
        "Navigation arrows, close buttons, action icons, status indicators",
        "Anywhere a Material Symbols icon name is specified in Figma",
      ],
      neverUseFor: [
        "Account type icons — use AccountTypeIcon instead",
        "Top nav hamburger — use MenuIcon instead",
        "Brand logo or wordmark",
      ],
      alwaysRemember: [
        "Icon names are identical between this component and the Figma Material Symbols library",
        "The opsz axis is calculated automatically from the size prop — don't set it manually",
        "Fill=true changes the visual weight significantly — use for active states, not decorative icons",
      ],
    },
  },

  // ── MenuIcon ─────────────────────────────────────────────────────────────────
  {
    name: "MenuIcon",
    category: "ui-primitive",
    type: "display",
    description:
      "Custom two-bar hamburger icon for the top nav drawer trigger. " +
      "Full-width top bar, 56% bottom bar — a Halosight-specific design not in Material Symbols. " +
      "Color controllable via the color prop.",
    file: "app/components/ui/MenuIcon.tsx",
    designSystemSection: "#icons",
    flutterEquivalent: "CustomPainter with two rounded rects, or flutter_svg",
    tokens: {
      required: [
        { token: "--color-text-muted", role: "default icon color" },
      ],
      forbidden: [
        "Raw hex for color — always pass a --color-* token via the color prop",
        "Using Icon name='menu' (Material Symbols menu) instead — that's 3 equal bars, Halosight's is asymmetric",
      ],
    },
    props: [
      {
        name: "size",
        type: "number",
        required: false,
        default: "32",
        description: "Width and height in px. SVG scales proportionally.",
      },
      {
        name: "color",
        type: "string",
        required: false,
        default: "var(--color-text-muted)",
        description: "Fill color for both bars. Always pass a CSS var token.",
      },
    ],
    usage: {
      patterns: [
        {
          name: "top nav drawer trigger",
          when: "Left side of top bar, visible only below the 860px breakpoint",
          code: `
import MenuIcon from "@/components/ui/MenuIcon";

<button
  onClick={() => setDrawerOpen(true)}
  className="aside:hidden flex items-center justify-center w-8 h-8 rounded-lg"
  style={{ background: "var(--color-dark-secondary)" }}
  aria-label="Open navigation"
>
  <MenuIcon size={18} color="var(--color-text-muted)" />
</button>`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Using <Icon name='menu' /> for the top nav trigger",
          why: "Material Symbols 'menu' is 3 equal bars — Halosight's nav icon is asymmetric (full + 56% bar)",
          instead: "Use <MenuIcon /> for the top nav",
        },
        {
          scenario: "Hardcoding the color as a hex value",
          why: "Breaks the token system and makes theme changes impossible",
          instead: `<MenuIcon color="var(--color-text-muted)" />`,
        },
      ],
    },
    aiHints: {
      priority: "low",
      useWhen: [
        "Top nav left side, specifically as the drawer/sidebar trigger on narrow viewports",
      ],
      neverUseFor: [
        "Any context other than the top nav drawer trigger",
        "In-app navigation menus — use Icon with appropriate symbol",
      ],
      alwaysRemember: [
        "Pair with aside:hidden class — only visible below 860px where the sidebar is hidden",
        "Default size is 32px but 18px is used in the actual top bar button",
      ],
    },
  },

];

// ─── Token Quick-Reference ────────────────────────────────────────────────────
// The most commonly misused or confused tokens. Full list: docs/design-system.md

export const tokenRules = {
  backgrounds: {
    page:       "--color-background",       // #111420 — page chrome only
    nav:        "--color-surface-dim",       // #171B29 — persistent nav / sidebar
    card:       "--color-dark-secondary",    // #252A36 — cards, list items, dropdowns
    elevated:   "--color-dark-tertiary",     // #3D4451 — menus, popovers, elevated surfaces
    glass:      "--color-alpha-purple-glass", // rgba — floating pill nav
    activePill: "--color-alpha-dark-glass",  // rgba — active state on glass nav
  },
  text: {
    primary:   "--color-text-primary",    // #F7F8FF — body, names
    secondary: "--color-text-secondary",  // #C3CAD8 — supporting text
    muted:     "--color-text-muted",      // #8B94A8 — metadata, icons, placeholders
    disabled:  "--color-text-disabled",   // #5D667A — inactive, timestamps
    inverse:   "--color-text-inverse",    // #111420 — text on light surfaces
  },
  borders: {
    standard: "--color-alpha-white-10",   // 1px — card borders, nav borders
    emphasis:  "--color-alpha-white-18",  // active field borders
  },
  brand: {
    interactive: "--color-brand-purple",       // primary interactive / accent
    interactiveLight: "--color-brand-purple-light", // city/state text, light accent
    cta:         "--color-brand-coral",        // primary CTA buttons
    secondary:   "--color-brand-blue",         // secondary actions
    today:       "--color-brand-coral",        // "visited today" recency indicator
  },
  radius: {
    card:    "--radius-sm",    // 8px — account cards, inputs
    menu:    "--radius-xl",    // 28px — sort menu, large dropdowns
    button:  "--radius-xl",    // 28px — CTA buttons
    pill:    "--radius-full",  // 100px — nav bar, tags
    chip:    "--radius-full",  // 100px — badges, chips
  },
} as const;

// ─── AI Usage Instructions ────────────────────────────────────────────────────

export const aiInstructions = `
BEFORE BUILDING ANY UI IN THIS PROJECT:

1. Check this registry — if a component exists for your use case, use it. Do not recreate.
2. Check tokenRules above — use the correct token for the surface/text/border role.
3. Never use raw hex values. Every color must be var(--color-*).
4. Every new screen must include <BottomNav /> if it is a top-level tab.
5. Typography classes: headings use .heading-1 through .heading-6 (Roboto Slab).
   Body text uses Tailwind's text-xl/lg/base/sm/xs + .text-*-bold for 600 weight.
   Nav labels use .label-serif. Tiny captions use .text-2xs.
6. Icons: use <Icon name="..." /> for any Material Symbols icon. Use AccountTypeIcon
   for account type. Use MenuIcon for the top nav trigger only.
7. If you add a new component: add it to this registry, add it to the design system
   page, and add it to docs/component-architecture.md.
8. Refer to docs/flutter-handoff.md for Flutter widget equivalents before finalizing any layout.
`;
