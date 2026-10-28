/**
 * Halosight Component Registry
 *
 * The authoritative quick-reference for AI when building any UI in this project.
 * Read this file before creating or modifying any component or screen.
 *
 * Rules enforced by this registry:
 *   1. Never use raw hex values — always var(--md-sys-color-*)
 *   2. Never recreate a component that already exists here
 *   3. Always use the tokens listed under `tokens.required`
 *   4. Always check `usage.antiPatterns` before writing markup
 *   5. Every new component must be added here AND reflected on /design-system
 *
 * Source of truth for tokens: app/tokens/*.css (hand-maintained; published values live in the design-system repo's tokens/tokens.json)
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
  /** One line per change, newest first: "YYYY-MM-DD: what changed". Lets Flutter see what moved since the last conversion. */
  changelog?: string[];
}

// NOTE: entries written from 2026-10-27 onward cite design-system token PATHS
// (e.g. "color.semantic.error"), not CSS variable names or hex values. Older entries still
// use CSS names and are converted as each component is updated.

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
        { token: "--md-sys-color-alpha-neonindigo-glass", role: "nav background" },
        { token: "--md-sys-color-alpha-white-10",     role: "nav border" },
        { token: "--md-sys-color-alpha-dark-glass",   role: "active pill fill" },
        { token: "--md-sys-color-text-primary",       role: "active icon + label color" },
        { token: "--md-sys-color-text-muted",         role: "inactive icon + label color" },
        { token: "--radius-full",              role: "nav pill shape" },
      ],
      forbidden: [
        "Any raw hex for background — must be alpha token for glass effect",
        "--md-sys-color-dark-secondary (not transparent enough for glass)",
        "--md-sys-color-neonindigo (wrong role — that's for interactive elements)",
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
      "Row in the companies list. Variant `owned` (default): name, distance • location, last-visited recency, " +
      "and risk and task count badges; navigates to /relationships/:id. " +
      "Variant `crm`: a CRM account owned by another rep (company-wide search results): muted name and an " +
      "\"Owner: <name>\" line and a trailing chevron, no visit line or badges; calls onSelect. " +
      "Variant `home`: the compact row in the home Companies card: name, distance · address, risk and task badges, no chevron. " +
      "`crm` and `home` rows sit inside <ListCard> (filled card); `owned` is an open row.",
    file: "app/components/accounts/AccountListItem.tsx",
    designSystemSection: "#account-list-item",
    flutterEquivalent: "AccountsViewAccountListItem — lib/view/_widget/account_list/accounts_view_account_list_item.dart",
    tokens: {
      required: [
        { token: "color.text.primary",            role: "account name (all variants)" },
        { token: "color.text.muted",              role: "distance, location, last-visited text and the owner's name" },
        { token: "color.text.disabled",           role: "separator dots and the \"Visited\" / \"Owner:\" labels" },
        { token: "color.dark.primary",            role: "ListCard fill (crm, home)" },
        { token: "color.dark.tertiary",           role: "row separators (crm, home)" },
        { token: "radius.lg",                     role: "ListCard corners" },
        { token: "color.semantic.error",          role: "risk badge background (18% opacity)" },
        { token: "color.semantic.error-light",    role: "risk badge icon and number" },
        { token: "color.neonindigo.base",         role: "tasks badge background (20% opacity)" },
        { token: "color.neonindigo.light",        role: "tasks badge icon and number" },
        { token: "color.brand.teal",              role: "Lead badge text" },
        { token: "color.semantic.warning",        role: "Needs Info badge" },
        { token: "radius.full",                   role: "all badges" },
      ],
      forbidden: [
        "Raw hex or rgba() for badge colors — derive the background from the token at the stated opacity",
        "A grey placeholder badge for a zero count — a count of 0 or undefined renders nothing",
        "Giving an `owned` row a card background; crm and home rows get theirs from <ListCard>, not from the row",
        "A chevron on the home variant — it was dropped to give the badges room",
      ],
    },
    props: [
      {
        name: "account",
        type: "Account",
        required: true,
        description:
          "Account entity from lib/types. Uses name, distanceMiles, address | city+state, lastVisited, " +
          "halosightType, crmAccountType, taskCount, riskCount.",
      },
      {
        name: "isLast",
        type: "boolean",
        required: false,
        default: "false",
        description: "Hides the bottom separator on the last row of a list.",
      },
      {
        name: "variant",
        type: '"owned" | "crm" | "home"',
        required: false,
        default: '"owned"',
        description: "owned = a company in the rep's portfolio. crm = a CRM account owned by another rep. home = the compact row in the home Companies card.",
      },
      {
        name: "ownerName",
        type: "string",
        required: false,
        description: 'crm variant only — the owning rep\'s name, shown as "Owner: <name>".',
      },
      {
        name: "onSelect",
        type: "(account: Account) => void",
        required: false,
        description: "crm variant only — called on tap instead of navigating.",
      },
    ],
    usage: {
      patterns: [
        {
          name: "companies list",
          when: "Rendering the flat list of companies",
          code: `
import AccountListItem from "@/components/accounts/AccountListItem";

<div className="flex flex-col">
  {accounts.map((account, i) => (
    <AccountListItem key={account.id} account={account} isLast={i === accounts.length - 1} />
  ))}
</div>`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Building an account row with a plain <div> or <Link>",
          why: "AccountListItem handles the layout, recency text, distance formatting, badges and navigation",
          instead: "Use <AccountListItem account={account} /> and pass the full Account object",
        },
        {
          scenario: "Showing a badge when the count is 0",
          why: "The design hides the badge entirely; there is no empty or grey state",
          instead: "Pass the count through; the component renders nothing for 0 or undefined",
        },
        {
          scenario: "Adding a hover background highlight",
          why: "Mobile rows use active:opacity-70 — hover states are not part of the mobile design spec",
          instead: "Keep active:opacity-70 transition-opacity only",
        },
      ],
    },
    aiHints: {
      priority: "high",
      useWhen: [
        "Rendering any list of Account objects",
        "Showing account search results or filtered/sorted lists",
      ],
      neverUseFor: [
        "Non-account entities (contacts, activities) — build a new component",
        "Detail screen headers — that is a different layout pattern",
        "Non-account entities in a list — the crm variant is still an Account, not a different entity",
      ],
      alwaysRemember: [
        "Badge order is risk, then tasks, 8px apart. There is no assignee circle on either variant",
        "Risk badge: `warning` icon, error tone. Tasks badge: `check_box` icon, indigo tone. Both 22.5px tall, full radius, number Barlow 500 11.5px",
        "formatLastVisited() and formatDistance() from lib/utils handle all formatting — never format inline",
      ],
    },
    changelog: [
      "2026-10-27: added `variant=\"home\"` (replaces the inline CompactAccountRow in the relationships page) and the card wrapper (now the generic ListCard). crm and home rows now share the card look: 17px/600 name, 13px muted second line, 19px (crm) / 13px (home) row padding, full-width dark.tertiary separators. crm gained a trailing chevron.",
      "2026-10-27: removed the assignee initial circle from both variants (Account.assignedInitial deleted). The crm variant now shows \"Owner: <name>\" in place of distance and address; prop renamed assignedRep -> ownerName.",
      "2026-10-27: SystemAccountListItem merged in as `variant=\"crm\"` (look unchanged). Badges moved to the shared CountBadge.",
      "2026-10-27: added the risk badge (Account.riskCount). Count badges now hide at 0 instead of showing a grey icon. Tasks badge icon is now `check_box` at a larger size, with lighter indigo text.",
    ],
  },

  // ── ActionItemList ──────────────────────────────────────────────────────────
  {
    name: "ActionItemList",
    category: "feature",
    type: "interactive",
    description:
      "The card of action item rows used on the home, account and interaction screens (replaces ActionItemCard and the " +
      "inline home/interaction rows). Each row: check circle, title (wraps), due text and an optional account name. Also exports ActionItemsHeader (section label + View all or +). " +
      "Behaviour is chosen by props: home = showAccountName + limit; account and interaction = collapsedCount (View all N / Show less); " +
      "full-page Action Items screens (/tasks and priorities mode) = variant=\"page\" (no card, open rows, separators inset 16px).",
    file: "app/components/accounts/ActionItemList.tsx",
    designSystemSection: "#action-item-list",
    flutterEquivalent: "ActionItemList / ActionItemRow / ActionItemsHeader — lib/view/_widget/action_items/",
    tokens: {
      required: [
        { token: "color.text.primary",         role: "title; add icon" },
        { token: "color.text.muted",           role: "non-urgent due text and account name" },
        { token: "color.text.disabled",        role: "check circle outline; the dot between meta parts" },
        { token: "color.brand.coral-light",    role: "urgent due text (overdue, yesterday, today)" },
        { token: "color.semantic.success",     role: "pending (just completed) check circle fill" },
        { token: "color.text.inverse",         role: "check mark on the pending fill" },
        { token: "color.neonindigo.base",      role: "View all / Show less footer and header View all" },
        { token: "color.alpha.white-10",       role: "row separators (via ListCard border)" },
      ],
      forbidden: [
        "Raw hex for the pending check (#2ECC71 / #fff) — use the semantic success and text.inverse tokens",
        "A chevron on the row — the whole row is the tap target",
        "Linking rows to a detail page — rows open the action item drawer",
        "Building another action item row inline on a screen — add a prop here instead",
        "Showing the footer on the home screen — home uses the header View all",
        "Wrapping variant=\"page\" in a card — the page variant is deliberately open",
      ],
    },
    props: [
      { name: "entries", type: "ActionItemEntry[]", required: true, description: "{ item: ActionItem, accountId, itemId?, accountName? } per row. Tapping a row opens the action item drawer." },
      { name: "pendingId", type: "string | null", required: false, description: "Item id to show as just completed (filled check)." },
      { name: "onComplete", type: "(itemId: string) => void", required: false, description: "Called when a check circle is tapped." },
      { name: "showAccountName", type: "boolean", required: false, default: "false", description: "Home: adds “· <account>” after the due text." },
      { name: "collapsedCount", type: "number", required: false, description: "Rows shown before the “View all N action items” footer. Omit for no footer." },
      { name: "limit", type: "number", required: false, description: "Hard cap with no footer (home uses 4)." },
      { name: "variant", type: '"card" | "page"', required: false, default: '"card"', description: "card = rows inside a ListCard. page = open rows on the page background, 16px side padding, separators inset 16px each side." },
    ],
    usage: {
      patterns: [
        {
          name: "account or interaction screen",
          when: "Listing one account's or one interaction's action items",
          code: `
<ActionItemsHeader action={{ kind: "add", onClick: openAddSheet }} />
<ActionItemList entries={items.map((item) => ({ item, accountId }))} collapsedCount={3}
  pendingId={pendingId} onComplete={handleComplete} />`,
        },
        {
          name: "home screen",
          when: "Cross-account list on the home screen",
          code: `
<ActionItemsHeader action={{ kind: "viewAll", onClick: goToPriorities }} />
<ActionItemList entries={entries} showAccountName limit={4} pendingId={pendingId} onComplete={handleComplete} />`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Formatting due text inline",
          why: "formatActionItemDue() in lib/utils owns the wording (Overdue N days, Due yesterday, Due in N weeks)",
          instead: "Pass the ActionItem; the row formats it",
        },
      ],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Showing any list of ActionItem objects on the home, account or interaction screens"],
      neverUseFor: ["Anything that is not an ActionItem"],
      alwaysRemember: [
        "Row min-height 64px; title 16/600 wraps; due text 14px. Urgent = coral-light 600, otherwise muted 500",
        "ActionItem.dueDate null renders “No due date”; the home screen maps its own null (due today) to today before passing it in",
      ],
    },
    changelog: [
      "2026-10-28: removed the type circle (calendar / waveform icon) and the showType option for now; they may come back. ActionItem.originType stays: the drawer's interaction card still uses it.",
      "2026-10-28: new shared component replacing ActionItemCard, the home TaskStrip and the interaction page's inline rows. Added ActionItem.originType, formatActionItemDue(), and the generic ListCard.",
      "2026-10-28: added variant=\"page\" for the full-page Action Items screens; the duplicate row code in /tasks and the priorities view is removed. Also widened the owned AccountListItem separator from 12px to 16px each side so the two open-row lists match.",
    ],
  },

  // ── Drawer ──────────────────────────────────────────────────────────────────
  {
    name: "Drawer",
    category: "ui-primitive",
    type: "interactive",
    description:
      "The one bottom drawer. Composable pieces (DrawerBackdrop, DrawerPanel, DrawerHandle, DrawerBody, DrawerHeader) plus a convenience " +
      "<Drawer open onClose> that portals into #phone-overlay-root. Panel is dark-primary with radius-xl top corners, a 40×4 handle, " +
      "a scrim on a single token and a spring slide. Used by every sheet: Add an item, New Lead, New Account, Convert to Account, " +
      "Account picker, Add a note and the action item drawer.",
    file: "app/components/ui/Drawer.tsx",
    designSystemSection: "#drawer",
    flutterEquivalent: "HalosightDrawer — lib/view/_widget/halosight_drawer.dart (themed showModalBottomSheet)",
    tokens: {
      required: [
        { token: "color.dark.primary",    role: "panel fill" },
        { token: "color.dark.tertiary",   role: "handle" },
        { token: "color.alpha.scrim",     role: "dim behind the drawer (new token; was 0.48–0.6 black per sheet)" },
        { token: "color.alpha.white-10",  role: "DrawerHeader underline" },
        { token: "color.text.primary",    role: "DrawerHeader title" },
        { token: "color.text.muted",      role: "DrawerHeader Cancel" },
        { token: "color.neonindigo.base", role: "DrawerHeader check" },
        { token: "radius.xl",             role: "panel top corners" },
        { token: "spacing.3 / 4 / 8",     role: "DrawerBody padding (12 top, 16 sides, 32 bottom)" },
      ],
      forbidden: [
        "Building a sheet's backdrop and panel inline — use the Drawer pieces",
        "A different panel fill per sheet — the drawer is always dark-primary",
        "Raw rgba() for the scrim — use color.alpha.scrim",
      ],
    },
    props: [
      { name: "open", type: "boolean", required: true, description: "Whether the drawer is shown." },
      { name: "onClose", type: "() => void", required: true, description: "Called when the scrim is tapped; the caller flips `open`." },
      { name: "onExitComplete", type: "() => void", required: false, description: "Called after the exit animation finishes." },
      { name: "maxHeight", type: "string", required: false, default: '"88%"', description: "Panel max height; scrolls beyond it." },
      { name: "keyboardAware", type: "boolean", required: false, default: "false", description: "Lift the panel above the on-screen keyboard (--keyboard-inset)." },
    ],
    usage: {
      patterns: [
        {
          name: "simple drawer",
          when: "A drawer whose content you own",
          code: `
<Drawer open={open} onClose={() => setOpen(false)}>
  <DrawerBody>…</DrawerBody>
</Drawer>`,
        },
        {
          name: "custom open/close choreography",
          when: "The sheet needs its own AnimatePresence or two steps",
          code: `
<AnimatePresence>
  {visible && (<>
    <DrawerBackdrop onClick={close} />
    <DrawerPanel maxHeight="92%">…</DrawerPanel>
  </>)}
</AnimatePresence>`,
        },
      ],
      antiPatterns: [
        { scenario: "Copy-pasting the backdrop + motion.div panel into a new sheet", why: "That is how we ended up with six different fills and three scrim levels", instead: "Use Drawer or DrawerBackdrop + DrawerPanel" },
      ],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Any bottom sheet or drawer"],
      neverUseFor: ["The side menu (EngagementsDrawer) — that slides from the left and is a different component", "Centered dialogs — they reuse DrawerBackdrop for the dim only"],
      alwaysRemember: [
        "Panel fill is dark-primary; fields inside step to dark-base (inset) or dark-secondary (raised)",
        "Content padding is the content's job — DrawerBody gives the standard 12 / 16 / 32",
      ],
    },
    changelog: ["2026-10-28: extracted from six near-identical sheets. Fill unified to dark-primary (was dark-secondary or background); scrim unified on color.alpha.scrim."],
  },

  // ── ActionItemDrawer ────────────────────────────────────────────────────────
  {
    name: "ActionItemDrawer",
    category: "feature",
    type: "interactive",
    description:
      "The drawer that opens when an action item row is tapped (replaces the old full-page detail route). View mode: title with an edit " +
      "button, account and due-date chips, description, the interaction it came from, and Mark complete. Edit mode: Cancel / Edit item / check " +
      "header, title and description fields with counters, the interaction card, a due-date chip carousel with Show calendar, and Delete action item " +
      "behind a confirmation. Opened with useActionItemDrawer().open(accountId, itemId, onComplete).",
    file: "app/components/accounts/ActionItemDrawer.tsx",
    designSystemSection: "#action-item-drawer",
    flutterEquivalent: "ActionItemDrawer — lib/view/_widget/action_items/action_item_drawer.dart",
    tokens: {
      required: [
        { token: "color.dark.base",              role: "inset fields: title, description, interaction card, date chips" },
        { token: "color.dark.secondary",         role: "view-mode chips" },
        { token: "color.dark.tertiary",          role: "field and chip borders" },
        { token: "color.neonindigo.base",        role: "focus ring, edit button, selected date chip, interaction chevron" },
        { token: "color.neonindigo.dark",        role: "Mark complete fill" },
        { token: "color.semantic.error",         role: "Delete outline (40%) and Yes, delete fill" },
        { token: "color.semantic.error-light",   role: "Delete action item text and icon" },
        { token: "color.text.primary / secondary / muted", role: "title / description and chips / labels and counters" },
        { token: "radius.full / lg / xl",        role: "pills and title field / chips and cards / description field" },
        { token: "spacing.1–8",                  role: "all gaps: 16 title→chips, 20 between blocks, 24 before the button and between edit fields, 32 before Delete" },
      ],
      forbidden: [
        "A status control (open / done / canceled) in edit — completion is Mark complete only",
        "Raw hex or pixel gaps — use the spacing tokens",
        "Navigating to a detail page — the drawer replaces it",
      ],
    },
    props: [
      { name: "accountId", type: "string | null", required: true, description: "Owning account." },
      { name: "itemId", type: "string | null", required: true, description: "Item to show; read from ActionItemsContext." },
      { name: "open", type: "boolean", required: true, description: "Drawer visibility." },
      { name: "onClose", type: "() => void", required: true, description: "Close request." },
      { name: "onComplete", type: "() => void", required: false, description: "Runs after Mark complete so the opening screen keeps its own completion flow (pending check, undo toast, note sheet)." },
    ],
    usage: {
      patterns: [
        { name: "open from a row", when: "Anywhere an action item is listed", code: `
const drawer = useActionItemDrawer();
drawer.open(accountId, item.id, () => handleComplete(item.id));` },
      ],
      antiPatterns: [
        { scenario: "Mounting a second ActionItemDrawer on a screen", why: "One lives in the mobile layout and is shared", instead: "Call useActionItemDrawer().open(...)" },
      ],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Showing or editing a single action item"],
      neverUseFor: ["Creating an item — that is AddActionItemSheet"],
      alwaysRemember: [
        "Cancel discards; the check saves; Delete asks first",
        "Date picker: prototype uses chips + MiniCalendar; Flutter uses the platform date picker",
      ],
    },
    changelog: ["2026-10-28: new. Replaces /relationships/[id]/action-items/[itemId]. Spacing normalised to tokens; Delete restyled as an outlined pill. View, edit and confirm bodies are exported so /design-system renders the real ones (3 view states, 3 edit states, delete dialog)."],
  },

  // ── ListCard ────────────────────────────────────────────────────────────────
  {
    name: "ListCard",
    category: "ui-primitive",
    type: "display",
    description:
      "The filled card that holds a column of rows: dark-primary fill, hairline border, radius-lg, rows clipped to the corners. " +
      "No padding of its own — rows draw their own separators. Used by ActionItemList and the crm/home AccountListItem variants.",
    file: "app/components/ui/ListCard.tsx",
    designSystemSection: "#action-item-list",
    flutterEquivalent: "ListCard — lib/view/_widget/list_card.dart",
    tokens: {
      required: [
        { token: "color.dark.primary",   role: "card fill" },
        { token: "color.alpha.white-10", role: "1px border" },
        { token: "radius.lg",            role: "corners" },
      ],
      forbidden: ["Adding vertical padding to the card — it makes the first and last rows taller than the rest"],
    },
    props: [
      { name: "children", type: "ReactNode", required: true, description: "The rows." },
      { name: "className", type: "string", required: false, description: 'Outer spacing, e.g. "mx-4".' },
    ],
    usage: {
      patterns: [
        { name: "list of rows", when: "Any card-shaped list", code: `\n<ListCard className="mx-4">{rows}</ListCard>` },
      ],
      antiPatterns: [
        { scenario: "Re-creating the card with inline styles", why: "Fill, border and radius must stay in one place", instead: "Use <ListCard>" },
      ],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Wrapping a list of rows in the filled card style"],
      neverUseFor: ["Standalone content cards (insight, summary) — those have their own padding"],
      alwaysRemember: ["Rows own their separators; omit the separator on the last row"],
    },
    changelog: ["2026-10-28: extracted from the ListCard wrapper that lived in AccountListItem.tsx."],
  },

  // ── ThinkingDots ────────────────────────────────────────────────────────────
  {
    name: "ThinkingDots",
    category: "ui-primitive",
    type: "display",
    description:
      "The in-progress indicator that replaces the spinning circle: dots that stretch into rounded capsules in a staggered, slightly off-beat wave, " +
      "like a voice level. Takes the surrounding text colour. Sizes sm (inside buttons), md, lg; optional 5 bars for full-screen processing.",
    file: "app/components/ui/ThinkingDots.tsx",
    designSystemSection: "#buttons",
    flutterEquivalent: "ThinkingDots — lib/view/_widget/thinking_dots.dart (one repeating AnimationController, a bar per Interval)",
    tokens: {
      required: [
        { token: "currentColor", role: "bar colour — inherits the label or text colour it sits in" },
        { token: "radius.full",  role: "rounded bar ends" },
      ],
      forbidden: [
        "A spinning circle for any wait — use ThinkingDots",
        "Hard-coding a colour on the bars — let them inherit",
        "Animating scale instead of height — it distorts the rounded ends",
      ],
    },
    props: [
      { name: "size", type: '"sm" | "md" | "lg"', required: false, default: '"sm"', description: "sm 4px · 4→12 (buttons), md 5px · 5→18, lg 6px · 6→26." },
      { name: "bars", type: "number", required: false, default: "3", description: "Number of bars; 5 suits a full-screen processing state." },
      { name: "label", type: "string", required: false, default: '"Working"', description: "Screen-reader text (role=status)." },
    ],
    usage: {
      patterns: [{ name: "status line", when: "A short wait next to text", code: `
<span className="flex items-center gap-2" style={{ color: "var(--md-sys-color-text-muted)" }}>
  <ThinkingDots size="md" label="Syncing" /> Syncing to Salesforce
</span>` }],
      antiPatterns: [{ scenario: "Adding a new CSS spinner to a button", why: "Buttons already support loading", instead: "Pass loading to <Button>" }],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Any action or screen that takes a moment: button loading, status lines, processing states"],
      neverUseFor: ["Content placeholders — use Skeleton"],
      alwaysRemember: [
        "1.2s loop, 0.14s stagger, each bar ±40ms so the wave drifts",
        "Reduced motion: static bars at 40% height",
      ],
    },
    changelog: ["2026-10-28: new. Existing spinners (processing banner, account Preparing note card, story mocks) still use the old circle and are not migrated yet."],
  },

  // ── Button ──────────────────────────────────────────────────────────────────
  {
    name: "Button",
    category: "ui-primitive",
    type: "interactive",
    description:
      "Filled, tonal, outlined (default / indigo / danger) and text buttons, each with a loading state. Loading keeps the button's size, shows ThinkingDots " +
      "(optionally followed by a loadingLabel such as “Saving”), and ignores taps without dimming. Introduced for the loading states; most screens still use inline button styles.",
    file: "app/components/ui/Button.tsx",
    designSystemSection: "#buttons",
    flutterEquivalent: "HalosightButton — lib/view/_widget/halosight_button.dart (FilledButton / .tonal / OutlinedButton / TextButton)",
    tokens: {
      required: [
        { token: "color.brand.coral",     role: "filled fill; outlined danger" },
        { token: "color.text.inverse",    role: "filled label" },
        { token: "color.dark.tertiary",   role: "tonal fill; outlined default border" },
        { token: "color.neonindigo.base", role: "tonal and text label; outlined indigo" },
        { token: "color.text.primary",    role: "outlined default label" },
        { token: "radius.full",           role: "all but text" },
      ],
      forbidden: ["A separate loading spinner inside a button — use the loading prop", "Dimming a loading button — dimming means disabled"],
    },
    props: [
      { name: "variant", type: '"filled" | "tonal" | "outlined" | "text"', required: false, default: '"filled"', description: "Visual style." },
      { name: "tone", type: '"default" | "indigo" | "danger"', required: false, default: '"default"', description: "Outlined only." },
      { name: "size", type: '"md" | "sm"', required: false, default: '"md"', description: "md 48px, sm 44px (text: 40 / 36)." },
      { name: "loading", type: "boolean", required: false, default: "false", description: "Shows ThinkingDots; keeps size; not tappable (aria-busy)." },
      { name: "loadingLabel", type: "string", required: false, description: "Text after the dots while loading; the button is as wide as the wider of the two." },
      { name: "icon", type: "ReactNode", required: false, description: "Leading icon, hidden while loading." },
      { name: "disabled", type: "boolean", required: false, description: "30% opacity, not tappable." },
    ],
    usage: {
      patterns: [{ name: "save with feedback", when: "An action that takes a second", code: `
<Button loading={saving} loadingLabel="Saving" onClick={save}>Save</Button>` }],
      antiPatterns: [{ scenario: "Swapping the label for “…” text while loading", why: "The button changes width and jumps", instead: "Use loading / loadingLabel" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Any new button, especially one that triggers async work"],
      neverUseFor: ["OAuth buttons on the login screen — they have their own 56px style (loading shown on the design-system page)"],
      alwaysRemember: ["Loading is not disabled: full opacity, no pointer events, aria-busy"],
    },
    changelog: ["2026-10-28: new, with loading variants of filled, tonal, outlined (3 tones) and text."],
  },

  // ── Tabs ────────────────────────────────────────────────────────────────────
  {
    name: "Tabs",
    category: "ui-primitive",
    type: "interactive",
    description:
      "Switches between views on a screen. `underline` (default, the most widely used): labels in a row with a teal bar under the active one and a hairline along the bottom. " +
      "`segmented` (sub-variant): a pill track of equal-width tabs with a raised active pill, for small in-place controls.",
    file: "app/components/ui/Tabs.tsx",
    designSystemSection: "#tabs",
    flutterEquivalent: "HalosightTabs — lib/view/_widget/halosight_tabs.dart (TabBar with UnderlineTabIndicator; segmented is a custom row)",
    tokens: {
      required: [
        { token: "color.text.primary",   role: "active label" },
        { token: "color.text.muted",     role: "inactive label" },
        { token: "color.brand.teal",     role: "underline bar (2px, the width of the active label)" },
        { token: "color.alpha.white-10", role: "hairline along the bottom (underline)" },
        { token: "color.dark.primary",   role: "segmented track" },
        { token: "color.dark.secondary", role: "segmented active pill" },
        { token: "radius.full",          role: "segmented track and pill" },
      ],
      forbidden: ["Using segmented for page-level navigation — underline is the default", "Raw hex or pixel borders for the underline — it is a 2px inset shadow in brand.teal"],
    },
    props: [
      { name: "tabs", type: "{ id: string; label: string }[]", required: true, description: "The tabs, in order." },
      { name: "value", type: "string", required: true, description: "Selected tab id." },
      { name: "onChange", type: "(id: string) => void", required: true, description: "Called when a tab is tapped." },
      { name: "variant", type: '"underline" | "segmented"', required: false, default: '"underline"', description: "Underline is the default." },
      { name: "style", type: "CSSProperties", required: false, description: "Extra row styles, e.g. sticky + background on a scrolling screen." },
    ],
    usage: {
      patterns: [{ name: "page tabs", when: "Switching between views on a screen", code: `
<Tabs tabs={[{ id: "overview", label: "Overview" }, { id: "activity", label: "Activity" }]} value={tab} onChange={setTab} />` }],
      antiPatterns: [{ scenario: "Building a tab row inline", why: "It will drift from the shared look", instead: "Use <Tabs>" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Any tab bar or view switcher"],
      neverUseFor: ["Filters and sorting — use FilterDropdown"],
      alwaysRemember: ["Underline is the default; segmented is the sub-variant", "Active and inactive are told apart by colour and the teal bar, not by size or weight"],
    },
    changelog: ["2026-10-28: new shared component. Underline variant extracted from the account screen's inline tab row (look unchanged) and made the default; the old pill tab bar became the `segmented` sub-variant."],
  },

  // ── ActivityCard ────────────────────────────────────────────────────────────
  {
    name: "ActivityCard",
    category: "feature",
    type: "interactive",
    description:
      "A row in an account's Activity tab: title, two-line summary and a meta line. An open row on the page background, separated by hairlines inset 20px. " +
      "Variant `halosight` (default): meta is relative date · duration · who created it. Variant `crm` (item.source = \"salesforce\"): a blue cloud before the title and " +
      "\"From Salesforce\" (teal) in place of the duration. Dates are never indigo. Taps through to the activity screen.",
    file: "app/components/accounts/ActivityCard.tsx",
    designSystemSection: "#activity-card",
    flutterEquivalent: "ActivityCard — lib/view/_widget/activity/activity_card.dart",
    tokens: {
      required: [
        { token: "color.text.primary",     role: "title" },
        { token: "color.text.secondary",   role: "summary" },
        { token: "color.text.muted",       role: "meta line text" },
        { token: "color.text.disabled",    role: "the dots between meta parts" },
        { token: "color.brand.teal",       role: "“From Salesforce”" },
        { token: "color.semantic.info",    role: "cloud icon (crm)" },
        { token: "color.alpha.white-10",   role: "row separators" },
      ],
      forbidden: [
        "Indigo (or any accent) on the date",
        "A card fill or border — activity rows are open",
        "An Unassigned chip or rep initial on the row",
        "Absolute dates or times on the row — use formatRelativeDate()",
      ],
    },
    props: [
      { name: "item", type: "ActivityItem", required: true, description: "Uses title, summary, date, durationMinutes, repName, source." },
      { name: "accountId", type: "string", required: true, description: "Used for the default link." },
      { name: "isLast", type: "boolean", required: false, default: "false", description: "Hides the separator on the last row." },
      { name: "variant", type: '"halosight" | "crm"', required: false, description: "Defaults from item.source." },
      { name: "href", type: "string", required: false, description: "Overrides the default /relationships/:id/activity/:activityId link." },
    ],
    usage: {
      patterns: [{ name: "activity tab", when: "Listing an account's activity", code: `\n{items.map((item, i) => <ActivityCard key={item.id} item={item} accountId={id} isLast={i === items.length - 1} />)}` }],
      antiPatterns: [{ scenario: "Wrapping cards in gaps and a fill", why: "The list is open rows; spacing comes from the row padding", instead: "Render rows with no gap and set isLast" }],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Showing an account's activity history"],
      neverUseFor: ["The Engagements side drawer — it has its own card"],
      alwaysRemember: [
        "Person is who created it: “You” for the signed-in rep, otherwise their name",
        "Row padding 16px vertical / 20px sides; title 17/500, summary 15/21 (2 lines), meta 14",
      ],
    },
    changelog: ["2026-10-28: rebuilt as a shared component with halosight and crm variants (was an inline boxed card on the account page). Added ActivityItem.source and formatRelativeDate()."],
  },

  // ── InsightCard ─────────────────────────────────────────────────────────────
  {
    name: "InsightCard",
    category: "feature",
    type: "interactive",
    description:
      "The AI blocks on an account's Overview tab (“Last time”, “Ideas for next time”). Body is a prose paragraph (string) or a teal-dot bullet list (string[]). " +
      "A hairline separates the body from the footer. Footer always has copy and a thumbs-down toggle; `showSources` adds the sources badges and `showAiActions` adds read-aloud and ask-AI. Both are off for the first handoff.",
    file: "app/components/accounts/InsightCard.tsx",
    designSystemSection: "#insight-card",
    flutterEquivalent: "AccountInsightCard — lib/view/_widget/account/account_insight_card.dart",
    tokens: {
      required: [
        { token: "color.dark.primary",    role: "card fill" },
        { token: "color.alpha.white-10",  role: "card border and footer hairline" },
        { token: "color.text.secondary",  role: "body" },
        { token: "color.text.disabled",   role: "eyebrow, visited meta, footer icons" },
        { token: "color.neonindigo.base", role: "“Visited” day count within a week" },
        { token: "color.brand.teal",      role: "bullet dots, source icons" },
        { token: "color.brand.coral",     role: "thumbs-down active" },
        { token: "radius.md",             role: "card corners" },
      ],
      forbidden: ["Raw pixel radius — use radius.md"],
    },
    props: [
      { name: "eyebrow", type: "string", required: true, description: "Uppercase label." },
      { name: "body", type: "string | string[]", required: true, description: "Prose or bullets." },
      { name: "visitedDaysAgo", type: "number", required: false, description: "Shows “Visited N days ago” in the header." },
      { name: "showSources", type: "boolean", required: false, default: "false", description: "Sources badges and expander." },
      { name: "showAiActions", type: "boolean", required: false, default: "false", description: "Read-aloud and ask-AI icons." },
      { name: "loading", type: "boolean", required: false, default: "false", description: "Swaps the body for InsightCardLoader and hides the footer; the real body fades in when it flips back." },
      { name: "loadingMessages", type: "string[]", required: false, description: "Status lines the loader cycles through (default: Reading 6 visits… / Checking Salesforce… / Writing your summary…)." },
    ],
    usage: {
      patterns: [{ name: "overview blocks", when: "Account Overview tab", code: `
<InsightCard eyebrow="Last Time" visitedDaysAgo={16} body={summary} />
<InsightCard eyebrow="Ideas for Next Time" body={ideas} />` }],
      antiPatterns: [{ scenario: "Re-building the AI block inline", why: "Footer and feedback behavior would drift", instead: "Use <InsightCard>" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Showing AI-generated prep text on an account"],
      neverUseFor: ["Reviewable extracted objects (commitments, risks) — those need accept/edit/reject"],
      alwaysRemember: ["Sources and AI actions default off; the design-system page has a toggle to preview them"],
    },
    changelog: ["2026-10-28: added `loading` with the InsightCardLoader sub-component (sparkle + cycling status lines, read from a screen recording).",
      "2026-10-28: added showSources / showAiActions (default off) so the first handoff matches the app's slimmer footer; radius moved to a token; added to the design-system page."],
  },

  // ── FeedbackWidget ──────────────────────────────────────────────────────────
  {
    name: "FeedbackWidget",
    category: "feature",
    type: "interactive",
    description:
      "The “Help shape Halosight” card on the home screen and the drawer it opens. The card has an eyebrow, title, subtitle and three full-width options " +
      "(I noticed a bug / I wish the app could... / Write my own); each opens the shared Drawer with that type selected. The drawer has type pills (Bug, Idea, Other), " +
      "a textarea whose placeholder follows the type, and Send feedback (dim until there is text, then brand-teal, then “Sent — thanks!”). " +
      "Exports FeedbackEntryCard and FeedbackForm for reuse and for the design-system page.",
    file: "app/components/ui/FeedbackWidget.tsx",
    designSystemSection: "#feedback-widget",
    flutterEquivalent: "FeedbackWidget / FeedbackEntryCard / FeedbackForm — lib/view/_widget/feedback/",
    tokens: {
      required: [
        { token: "color.dark.primary",       role: "entry card fill" },
        { token: "color.alpha.white-10",     role: "entry card border" },
        { token: "color.background",         role: "entry option fill" },
        { token: "color.neonindigo.base",    role: "eyebrow, option icons, selected pill (text; 18% fill)" },
        { token: "color.dark.secondary",     role: "close button, textarea, empty Send" },
        { token: "color.dark.tertiary",      role: "unselected pill border" },
        { token: "color.brand.teal",         role: "Send when ready" },
        { token: "color.semantic.success",   role: "Sent state (15% fill, text)" },
        { token: "color.text.primary / muted / disabled", role: "title and input / helper text / empty Send label" },
        { token: "radius.md / radius.full",  role: "card, options and textarea / pills and Send" },
      ],
      forbidden: [
        "Building the drawer chrome inline — it uses Drawer",
        "Raw rgba() tints for the selected pill or sent state — mix the tokens",
        "More than three entry options without a design decision — the card is deliberately short",
      ],
    },
    props: [
      { name: "(FeedbackWidget)", type: "none", required: false, description: "Self-contained: renders the card and manages the drawer." },
      { name: "onSelect", type: "(type: FeedbackType) => void", required: true, description: "FeedbackEntryCard: called with bug | idea | other when an option is tapped." },
    ],
    usage: {
      patterns: [{ name: "home screen", when: "Below the action items", code: `
<FeedbackWidget />` }],
      antiPatterns: [{ scenario: "A second feedback entry point with its own sheet", why: "One drawer keeps the types and tone consistent", instead: "Open FeedbackWidget's drawer or reuse FeedbackForm in a Drawer" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Collecting product feedback from the home screen"],
      neverUseFor: ["Reporting a problem with a specific record — that belongs on the record"],
      alwaysRemember: ["Types are Bug, Idea, Other only (General was removed)", "Send is simulated in the prototype"],
    },
    changelog: ["2026-10-28: brought in the redesigned card and drawer from playground/add-company-test (three full-width options; Bug / Idea / Other) and moved the drawer onto the shared Drawer. Split into FeedbackEntryCard and FeedbackForm so the design-system page renders the real thing."],
  },

  // ── CountBadge ──────────────────────────────────────────────────────────────
  {
    name: "CountBadge",
    category: "ui-primitive",
    type: "display",
    description:
      "Icon + number pill for per-account counts. Two tones: `risk` (warning icon, error colors) and " +
      "`tasks` (check_box icon, indigo colors). Renders nothing when the count is 0 or undefined.",
    file: "app/components/accounts/CountBadge.tsx",
    designSystemSection: "#account-list-item",
    flutterEquivalent: "AccountCountBadge — lib/view/_widget/account_list/account_count_badge.dart",
    tokens: {
      required: [
        { token: "color.semantic.error",        role: "risk background (18% opacity)" },
        { token: "color.semantic.error-light",  role: "risk icon and number" },
        { token: "color.neonindigo.base",       role: "tasks background (20% opacity)" },
        { token: "color.neonindigo.light",      role: "tasks icon and number" },
        { token: "radius.full",                 role: "pill shape" },
      ],
      forbidden: [
        "Raw hex or rgba() — derive backgrounds from the token at the stated opacity",
        "Rendering a zero-count badge or a grey placeholder",
      ],
    },
    props: [
      { name: "tone", type: '"risk" | "tasks"', required: true, description: "Selects icon and colors." },
      { name: "count", type: "number", required: false, description: "Shown in the pill. 0 or undefined renders nothing." },
      { name: "label", type: "string", required: true, description: 'Screen-reader noun, e.g. "open risks"; read as "<count> <label>".' },
    ],
    usage: {
      patterns: [
        {
          name: "account row badges",
          when: "Showing open risks and tasks on a company row",
          code: `
import CountBadge from "@/components/accounts/CountBadge";

<div className="flex items-center" style={{ gap: 8 }}>
  <CountBadge tone="risk" count={account.riskCount} label="open risks" />
  <CountBadge tone="tasks" count={account.taskCount} label="open tasks" />
</div>`,
        },
      ],
      antiPatterns: [
        {
          scenario: "Guarding with `count > 0 &&` before rendering",
          why: "CountBadge already hides itself at 0; the extra guard adds noise",
          instead: "Pass the count straight through",
        },
      ],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Showing open risk or task counts next to an account"],
      neverUseFor: ["Status labels (Lead, Needs Info) — those are text pills, not counts"],
      alwaysRemember: [
        "Order is risk then tasks, 8px apart",
        "22.5px tall; icon in a 24px slot; number Barlow 500 11.5px",
      ],
    },
    changelog: ["2026-10-27: extracted from AccountListItem so the home rows and the list share one badge."],
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
        { token: "--md-sys-color-text-muted",    role: "primary stroke color (#8B94A8)" },
        { token: "--md-sys-color-text-disabled", role: "secondary/lower-layer stroke (#5D667A)" },
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
        "The icon colors are hardcoded SVG fill/stroke values that map to --md-sys-color-text-muted and --md-sys-color-text-disabled — they are not CSS variables because SVG fill doesn't read CSS custom properties without currentColor refactor",
      ],
    },
  },

  // ── Menu ────────────────────────────────────────────────────────────────────
  {
    name: "Menu",
    category: "ui-primitive",
    type: "interactive",
    description:
      "The popup panel behind every dropdown. Three variants: `icon` (leading icon, for record actions; `destructive` rows use the error color), " +
      "`check` (selection check on the right, for pickers, sort and filters) and `icon-check` (both). Menu is only the panel and rows; the trigger, anchoring and open/close belong to the caller. " +
      "SortMenu, FilterDropdown, KebabMenu and the activity screen's interaction-type picker all render through it.",
    file: "app/components/ui/Menu.tsx",
    designSystemSection: "#menus",
    flutterEquivalent: "HalosightMenu — lib/view/_widget/halosight_menu.dart (PopupMenuButton / showMenu with a custom row)",
    tokens: {
      required: [
        { token: "color.dark.secondary",  role: "panel fill, 88% opaque with a 20px backdrop blur" },
        { token: "color.alpha.white-18", role: "1px panel stroke, at 80% opacity" },
        { token: "color.text.primary",    role: "label, icon" },
        { token: "color.semantic.error",  role: "destructive row" },
        { token: "color.neonindigo.base", role: "selection check" },
        { token: "color.text.muted",      role: "section label" },
        { token: "color.alpha.white-10",  role: "section divider" },
        { token: "radius.lg",             role: "panel corners" },
        { token: "spacing.2 / 3 / 4 / 5", role: "panel and row padding, icon gap" },
      ],
      forbidden: ["Building a dropdown panel inline", "Putting the check on the left — it is on the right"],
    },
    props: [
      { name: "items", type: "MenuItem[]", required: true, description: "{ id, label, icon?, selected?, destructive?, onSelect? }." },
      { name: "variant", type: '"icon" | "check" | "icon-check"', required: true, description: "Which affordances rows show." },
      { name: "minWidth", type: "number", required: false, default: "200", description: "Panel minimum width." },
    ],
    usage: {
      patterns: [{ name: "type picker", when: "Choosing one value from a short list", code: `
<Menu variant="check" items={[{ id: "inperson", label: "In-person", selected: true, onSelect }, { id: "phone", label: "Phone call", onSelect }]} />` }],
      antiPatterns: [{ scenario: "A one-off dropdown div with its own padding and shadow", why: "Rows and the check would drift", instead: "Use <Menu> (or MenuPanel + MenuRow for section labels)" }],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Any popup list of actions or choices"],
      neverUseFor: ["Bottom sheets and forms — use Drawer"],
      alwaysRemember: ["Menu has no trigger; wrap it in your own button + spring", "Panel is translucent dark-secondary with a blur and a white-18 stroke"],
    },
    changelog: ["2026-10-28: new shared component. SortMenu, FilterDropdown, KebabMenu and the interaction-type picker now use it. The selection check moved from the left to the right; KebabMenu rows can take icons."],
  },

  // ── ChatDrawer ──────────────────────────────────────────────────────────────
  {
    name: "ChatDrawer",
    category: "feature",
    type: "interactive",
    description:
      "The account chat: a ~94% tall drawer opened from Ask in the account's more-options menu. Composes ChatHeader, ChatEmptyState or ChatMessageList, and ChatInput or ChatVoiceDock, " +
      "with ChatHistoryMenu as a popover. Replies are canned in the prototype (mock-data/chat.ts); voice mode is simulated: listening, thinking (transcript), speaking (word-by-word highlight).",
    file: "app/components/chat/ChatDrawer.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "AccountChatSheet — lib/view/_widget/chat/account_chat_sheet.dart (ChatViewModel + AskAccountUseCase + ChatRepository)",
    tokens: {
      required: [
        { token: "color.dark.primary", role: "panel (via DrawerPanel)" },
        { token: "radius.xl",          role: "top corners" },
        { token: "spacing.2 / 4",      role: "input dock padding" },
      ],
    },
    props: [
      { name: "open", type: "boolean", required: true, description: "Drawer visibility." },
      { name: "accountName", type: "string", required: true, description: "Shown in the empty-state subtitle." },
      { name: "onClose", type: "() => void", required: true, description: "Scrim tap or minimize." },
    ],
    usage: {
      patterns: [{ name: "open from a screen", when: "Ask on an account", code: `
const { open } = useAccountChat();
open(account.name);` }],
      antiPatterns: [{ scenario: "Mounting ChatDrawer per screen", why: "State and the overlay root are shared", instead: "Use useAccountChat() from ChatProvider" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Letting the rep ask questions about an account"],
      neverUseFor: ["Capturing a visit — that is the capture flow"],
      alwaysRemember: ["Answers are mock; real answers need provenance (sources) before this ships", "Reuses Drawer chrome; the panel is keyboard aware"],
    },
    changelog: ["2026-10-28: new. Entry is the Ask item in the account's more-options menu (KebabMenu with icons)."],
  },

  // ── ChatInput ───────────────────────────────────────────────────────────────
  {
    name: "ChatInput",
    category: "feature",
    type: "interactive",
    description:
      "Pill input for the chat: text field, a dictation mic and a trailing round button that is the voice-mode (waveform) button when empty and Send once there is text.",
    file: "app/components/chat/ChatInput.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "ChatInputBar — lib/view/_widget/chat/chat_input_bar.dart",
    tokens: {
      required: [
        { token: "color.dark.secondary",     role: "pill" },
        { token: "color.dark.tertiary",      role: "mic button" },
        { token: "color.neonindigo.dark",    role: "voice / send button" },
        { token: "color.text.primary",       role: "text, button icon" },
        { token: "radius.full",              role: "pill and buttons" },
      ],
    },
    props: [
      { name: "value / onChange", type: "string / (v) => void", required: true, description: "Controlled text." },
      { name: "onSubmit", type: "() => void", required: true, description: "Send (Enter or the button)." },
      { name: "onVoiceMode", type: "() => void", required: true, description: "Waveform button." },
    ],
    usage: {
      patterns: [{ name: "chat dock", when: "Bottom of the chat", code: `<ChatInput value={v} onChange={setV} onSubmit={send} onVoiceMode={startVoice} />` }],
      antiPatterns: [{ scenario: "Separate send and voice buttons", why: "One slot, two jobs, keeps the dock narrow", instead: "Let ChatInput swap them" }],
    },
    aiHints: { priority: "low", useWhen: ["Any chat-style text entry"], neverUseFor: ["Form fields"], alwaysRemember: ["The trailing button changes with text"] },
    changelog: ["2026-10-28: new."],
  },

  // ── ChatMessage ─────────────────────────────────────────────────────────────
  {
    name: "ChatMessage",
    category: "feature",
    type: "display",
    description:
      "One chat message. User: right-aligned bubble with one tighter corner. Assistant: plain full-width text with copy and thumbs-down underneath, optionally a quoted draft block. " +
      "`revealedWords` highlights a spoken reply word by word (the rest muted). ThinkingRow shows ThinkingDots while an answer is pending.",
    file: "app/components/chat/ChatMessage.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "ChatMessage — lib/view/_widget/chat/chat_message.dart",
    tokens: {
      required: [
        { token: "color.dark.secondary",  role: "user bubble, draft block" },
        { token: "color.text.primary",    role: "message text" },
        { token: "color.text.secondary",  role: "draft text" },
        { token: "color.text.disabled",   role: "not-yet-spoken words, action icons" },
        { token: "color.brand.coral",     role: "thumbs-down active" },
        { token: "radius.lg / xs",        role: "bubble corners" },
      ],
    },
    props: [
      { name: "turn", type: "ChatTurn", required: true, description: "{ id, role, text, draft? }." },
      { name: "revealedWords", type: "number", required: false, description: "Words spoken so far; omit for a finished message." },
    ],
    usage: {
      patterns: [{ name: "list item", when: "Inside ChatMessageList", code: `<ChatMessage turn={turn} />` }],
      antiPatterns: [{ scenario: "A bubble around assistant text", why: "Answers read as text, only your messages are bubbles", instead: "Use AssistantMessage" }],
    },
    aiHints: { priority: "low", useWhen: ["Rendering chat turns"], neverUseFor: ["Reviewable extracted objects"], alwaysRemember: ["Actions hide while a reply is streaming"] },
    changelog: ["2026-10-28: new. Thumbs-down glyph shared with InsightCard via ThumbsDownIcon."],
  },

  // ── ChatVoiceDock ───────────────────────────────────────────────────────────
  {
    name: "ChatVoiceDock",
    category: "feature",
    type: "interactive",
    description:
      "Bottom dock for voice mode, replacing ChatInput. Phases: listening (italic “Listening…”, blue glow, orb halo), thinking (italic transcript), speaking (coral glow, flat controls). " +
      "Controls: add, mute, and a white close button that returns to the text input.",
    file: "app/components/chat/ChatVoiceDock.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "ChatVoiceDock — lib/view/_widget/chat/chat_voice_dock.dart",
    tokens: {
      required: [
        { token: "color.neonindigo / brand.coral", role: "bottom glow (mixed to transparent)" },
        { token: "color.neonindigo.dark",          role: "orb and button fill (mixed)" },
        { token: "color.alpha.white-18",           role: "orb and button ring" },
        { token: "color.text.primary / inverse",   role: "icons; close button fill / icon" },
        { token: "radius.full",                    role: "orb and buttons" },
      ],
    },
    props: [
      { name: "phase", type: '"listening" | "thinking" | "speaking"', required: true, description: "Which state to show." },
      { name: "transcript", type: "string", required: false, description: "Shown in the thinking phase." },
      { name: "onMicTap / onToggleMute / onAdd / onClose", type: "() => void", required: false, description: "Control callbacks." },
    ],
    usage: {
      patterns: [{ name: "voice mode", when: "After tapping the waveform button", code: `<ChatVoiceDock phase={phase} transcript={heard} onClose={endVoice} />` }],
      antiPatterns: [{ scenario: "Raw hex glows", why: "Glow colors are token mixes so light mode works", instead: "color-mix of neonindigo / brand.coral" }],
    },
    aiHints: { priority: "low", useWhen: ["Hands-free chat"], neverUseFor: ["Visit capture recording — use the capture widget"], alwaysRemember: ["Light mode unchecked"] },
    changelog: ["2026-10-28: new."],
  },

  // ── ChatHistoryMenu ─────────────────────────────────────────────────────────
  {
    name: "ChatHistoryMenu",
    category: "feature",
    type: "interactive",
    description:
      "Popover under the history icon: search field, Pinned and Recent groups (empty groups hidden), a pin and delete button on each row, and See all chats. Panel chrome comes from Menu.",
    file: "app/components/chat/ChatHistoryMenu.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "ChatHistoryMenu — lib/view/_widget/chat/chat_history_menu.dart",
    tokens: {
      required: [
        { token: "color.dark.secondary",  role: "search field" },
        { token: "color.neonindigo.base", role: "pinned, See all chats" },
        { token: "color.text.primary / muted", role: "titles / meta and section labels" },
        { token: "color.alpha.white-10",  role: "field border, footer divider" },
      ],
    },
    props: [
      { name: "threads", type: "ChatThread[]", required: true, description: "{ id, title, whenLabel, messageCount, pinned }." },
      { name: "onSelect / onTogglePin / onDelete / onSeeAll", type: "callbacks", required: true, description: "Row and footer actions." },
    ],
    usage: {
      patterns: [{ name: "popover", when: "History icon tapped", code: `<ChatHistoryMenu className="absolute" style={{ top: 52, left: 16, right: 16 }} threads={threads} ... />` }],
      antiPatterns: [{ scenario: "A bespoke list panel", why: "Panel chrome must match Menu", instead: "Wrap in MenuPanel" }],
    },
    aiHints: { priority: "low", useWhen: ["Switching between saved chats"], neverUseFor: ["Generic dropdowns — use Menu"], alwaysRemember: ["Position and width come from the caller"] },
    changelog: ["2026-10-28: new."],
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
        { token: "--md-sys-color-dark-secondary", role: "trigger button background" },
        { token: "--md-sys-color-text-muted",     role: "trigger icon strokes" },
        { token: "--md-sys-color-dark-tertiary",  role: "dropdown background" },
        { token: "--md-sys-color-text-primary",   role: "all option labels (active and inactive)" },
        { token: "--radius-xl",            role: "dropdown border radius" },
      ],
      forbidden: [
        "Raw hex (#2A3042, #F7F8FF, #8B94A8) — all removed in the token migration",
        "--md-sys-color-text-muted for inactive option labels (all options use text-primary)",
        "--md-sys-color-dark-secondary for dropdown bg (too light — use dark-tertiary)",
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
          why: "Design spec: ALL options use --md-sys-color-text-primary. Selection is indicated by checkmark only.",
          instead: "Keep all labels at --md-sys-color-text-primary regardless of selected state",
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
        description: "Use this to set color: 'var(--md-sys-color-text-primary)' etc.",
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

<Icon name="home" style={{ color: "var(--md-sys-color-text-primary)" }} />`,
        },
        {
          name: "filled icon, custom size",
          when: "Hero icons, feature illustrations, filled active states",
          code: `
<Icon name="star" fill size={32} style={{ color: "var(--md-sys-color-brand-coral)" }} />`,
        },
        {
          name: "lightweight icon",
          when: "Subtle, decorative, or secondary context",
          code: `
<Icon name="arrow_forward" weight={300} size={20} style={{ color: "var(--md-sys-color-text-muted)" }} />`,
        },
        {
          name: "accessible standalone icon",
          when: "Icon used as the only indicator of an action (no adjacent label)",
          code: `
<Icon name="close" size={20} label="Close" style={{ color: "var(--md-sys-color-text-muted)" }} />`,
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
          instead: "Always explicitly set color via style={{ color: 'var(--md-sys-color-*)' }}",
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
        { token: "--md-sys-color-text-muted", role: "default icon color" },
      ],
      forbidden: [
        "Raw hex for color — always pass a --md-sys-color-* token via the color prop",
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
        default: "var(--md-sys-color-text-muted)",
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
  style={{ background: "var(--md-sys-color-dark-secondary)" }}
  aria-label="Open navigation"
>
  <MenuIcon size={18} color="var(--md-sys-color-text-muted)" />
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
          instead: `<MenuIcon color="var(--md-sys-color-text-muted)" />`,
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
    page:       "--md-sys-color-background",       // #111420 — page chrome only
    nav:        "--md-sys-color-surface-dim",       // #171B29 — persistent nav / sidebar
    card:       "--md-sys-color-dark-secondary",    // #252A36 — cards, list items, dropdowns
    elevated:   "--md-sys-color-dark-tertiary",     // #3D4451 — menus, popovers, elevated surfaces
    glass:      "--md-sys-color-alpha-neonindigo-glass", // rgba — floating pill nav
    activePill: "--md-sys-color-alpha-dark-glass",  // rgba — active state on glass nav
  },
  text: {
    primary:   "--md-sys-color-text-primary",    // #F7F8FF — body, names
    secondary: "--md-sys-color-text-secondary",  // #C3CAD8 — supporting text
    muted:     "--md-sys-color-text-muted",      // #8B94A8 — metadata, icons, placeholders
    disabled:  "--md-sys-color-text-disabled",   // #5D667A — inactive, timestamps
    inverse:   "--md-sys-color-text-inverse",    // #111420 — text on light surfaces
  },
  borders: {
    standard: "--md-sys-color-alpha-white-10",   // 1px — card borders, nav borders
    emphasis:  "--md-sys-color-alpha-white-18",  // active field borders
  },
  brand: {
    interactive: "--md-sys-color-neonindigo",       // primary interactive / accent
    interactiveLight: "--md-sys-color-neonindigo-light", // city/state text, light accent
    cta:         "--md-sys-color-brand-coral",        // primary CTA buttons
    secondary:   "--md-sys-color-indigo",         // secondary actions
    today:       "--md-sys-color-brand-coral",        // "visited today" recency indicator
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
3. Never use raw hex values. Every color must be var(--md-sys-color-*).
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
