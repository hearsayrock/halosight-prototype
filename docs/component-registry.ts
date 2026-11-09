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
  /** Anchor on localhost:3000/design-system. Omitted for flows that have no area of their own (the sheets), which are built from areas that do. */
  designSystemSection?: string;
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
        { token: "color.dark.base",              role: "interaction card and date chips (the title and description fields are TextField, which fills with color.dark.secondary)" },
        { token: "color.dark.secondary",         role: "view-mode chips" },
        { token: "color.dark.tertiary",          role: "chip borders" },
        { token: "color.neonindigo.base",        role: "edit button, selected date chip, interaction chevron (the focus stroke comes from TextField)" },
        { token: "color.neonindigo.dark",        role: "Mark complete fill" },
        { token: "color.semantic.error",         role: "Delete outline (40%) and Yes, delete fill" },
        { token: "color.semantic.error-light",   role: "Delete action item text and icon" },
        { token: "color.text.primary / secondary / muted", role: "title / description and chips / labels and counters" },
        { token: "radius.full / lg / xl",        role: "pills / chips and cards / TextField radii (pill for the title, xl for the description)" },
        { token: "spacing.1–8",                  role: "all gaps: 16 title→chips, 20 between blocks, 24 before the button and between edit fields, 32 before Delete" },
      ],
      forbidden: [
        "A status control (open / done / canceled) in edit — completion is Mark complete only",
        "Raw hex or pixel gaps — use the spacing tokens",
        "A hand-built input or textarea — the title and description are TextField",
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
      "The in-progress indicator that replaces the spinning circle (\"Shuffle\"): a short, a medium and a tall capsule swap places sideways in a loop. " +
      "Heights never change, so it doesn't read as a voice level or a recording meter. Takes the surrounding text colour. Sizes sm (inside buttons), md, lg.",
    file: "app/components/ui/ThinkingDots.tsx",
    designSystemSection: "#buttons",
    flutterEquivalent: "ThinkingDots — lib/view/_widget/thinking_dots.dart (one repeating AnimationController, three capsules each on a TweenSequence of x offsets)",
    tokens: {
      required: [
        { token: "currentColor", role: "bar colour — inherits the label or text colour it sits in" },
        { token: "radius.full",  role: "rounded bar ends" },
      ],
      forbidden: [
        "A spinning circle for any wait — use ThinkingDots",
        "Hard-coding a colour on the bars — let them inherit",
        "Animating capsule height — it brings back the voice-level look; the capsules only move sideways",
      ],
    },
    props: [
      { name: "size", type: '"sm" | "md" | "lg"', required: false, default: '"sm"', description: "Capsule width · tallest height: sm 4 · 16 (buttons), md 5 · 24, lg 6 · 32." },
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
        "Shuffle: three capsules (short, medium, tall) swap places over a 2.1s loop on smooth curves (no pauses at the turns)",
        "Reduced motion: static, capsules rest in their starting slots",
      ],
    },
    changelog: [
      "2026-10-28: new. Existing spinners (processing banner, account Preparing note card, story mocks) still use the old circle and are not migrated yet.",
      "2026-11-05: replaced the rising/falling bars (read as a voice level) with Shuffle; removed the `bars` prop.",
    ],
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
        { token: "color.brand.coral-dark", role: "filled fill (white label); outlined danger uses color.brand.coral" },
        { token: "color.text.on-coral",   role: "filled label (white in both themes)" },
        { token: "color.dark.tertiary",   role: "tonal fill; outlined default border" },
        { token: "color.neonindigo.base", role: "tonal and text label; outlined indigo" },
        { token: "color.text.primary",    role: "outlined default label" },
        { token: "radius.full",           role: "all but text" },
      ],
      forbidden: ["A separate loading spinner inside a button — use the loading prop", "Dimming a loading button — dimming means disabled"],
    },
    props: [
      { name: "variant", type: '"filled" | "tonal" | "outlined" | "text"', required: false, default: '"filled"', description: "Visual style." },
      { name: "tone", type: '"default" | "indigo" | "danger" | "success" | "muted"', required: false, default: '"default"', description: "Outlined: default / indigo / danger. Tonal: default / success. Text: default / muted." },
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
      "\"From Salesforce\" (teal) in place of the duration. Dates are never indigo. Taps through to the activity screen. " +
      "Variants `recent` and `recent-unread` (prop `recent`: RecentActivity) are the Engagements drawer rows: company eyebrow, title, type icon + Meeting / Phone Call, then the date (Today in indigo here, unlike the Activity tab). " +
      "Unread adds an indigo dot, a bolder title and a “Modified …” line. Pressing highlights the row.",
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

  // ── AlertDialog ─────────────────────────────────────────────────────────────
  {
    name: "AlertDialog",
    category: "ui-primitive",
    type: "interactive",
    description:
      "A short centered confirmation over the scrim, for decisions that can't be undone. Title, optional body, a full-width filled confirm button (error color by default, indigo with destructive={false}) " +
      "and a plain text Cancel button. AlertCard is the card alone; AlertDialog adds the portal and scrim. Used for deleting action items and interactions.",
    file: "app/components/ui/AlertDialog.tsx",
    designSystemSection: "#alert-dialog",
    flutterEquivalent: "HalosightAlertDialog — lib/view/_widget/halosight_alert_dialog.dart (Dialog + AlertCard)",
    tokens: {
      required: [
        { token: "color.dark.primary",    role: "card" },
        { token: "color.dark.tertiary",   role: "card border" },
        { token: "color.alpha.scrim",     role: "scrim (via DrawerBackdrop)" },
        { token: "color.error",           role: "destructive confirm" },
        { token: "color.neonindigo.dark", role: "standard confirm" },
        { token: "color.text.secondary",  role: "Cancel" },
        { token: "color.text.muted",      role: "body" },
        { token: "radius.xl / full",      role: "card / buttons" },
      ],
    },
    props: [
      { name: "open", type: "boolean", required: true, description: "Visibility (AlertDialog only)." },
      { name: "title / body", type: "string", required: true, description: "Title is required; body is optional." },
      { name: "confirmLabel / cancelLabel", type: "string", required: true, description: "cancelLabel defaults to “Cancel”." },
      { name: "destructive", type: "boolean", required: false, default: "true", description: "Error vs indigo confirm button." },
      { name: "onConfirm / onCancel", type: "() => void", required: true, description: "Scrim tap calls onCancel." },
    ],
    usage: {
      patterns: [{ name: "confirm delete", when: "Before an irreversible delete", code: `
<AlertDialog open={open} title="Delete interaction?" body="This can't be undone." confirmLabel="Yes, delete" onConfirm={remove} onCancel={() => setOpen(false)} />` }],
      antiPatterns: [{ scenario: "A bottom sheet for a yes/no confirmation", why: "Sheets are for forms and details", instead: "Use AlertDialog (the disqualify confirmation now does)" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Confirming a destructive or irreversible action"],
      neverUseFor: ["Forms, pickers or long content — use Drawer"],
      alwaysRemember: ["Cancel is a text button, not a filled one", "Needs #phone-overlay-root; renders null until it resolves"],
    },
    changelog: ["2026-11-02: new shared component, extracted from the action item delete confirmation. Cancel is now a plain text button."],
  },

  // ── Toast ───────────────────────────────────────────────────────────────────
  {
    name: "Toast",
    category: "ui-primitive",
    type: "interactive",
    description:
      "A brief, non-blocking confirmation that floats above the bottom nav. Tones: neutral (default), success (green check and stroke), error (assertive); the fill stays neutral on every tone. Optional description, leading icon or thumbnail, " +
      "and at most one text action (Undo / View / Change / Retry). Auto-dismisses after 5s, or 7s with an action; pressing or hovering pauses the timer; duration null stays until dismissed and shows a close button; swipe down dismisses. " +
      "Shape `pill` is the top variant: full radius, hugs its content, centered under the status bar, title plus an optional action label (\"View\", \"Try again\") — the whole pill is the tap target, the label only says what it does, fill always neutral with the icon carrying the state — ToastSpinner (\"Preparing note\") then ToastCheck (\"Note ready\"), swapped in place with show(..., { replace: true }). " +
      "Announced politely (role=status; errors role=alert). ToastCard is the card alone; Toast adds the portal, timer and motion; useToast().show() queues one at a time. CompletionToast is a wrapper (success, Undo, optional Add a note).",
    file: "app/components/ui/Toast.tsx",
    designSystemSection: "#toast",
    flutterEquivalent: "HalosightToast — lib/view/_widget/halosight_toast.dart (ToastCard + ToastController queue; SnackBar floating is the closest built-in)",
    tokens: {
      required: [
        { token: "color.dark.secondary",     role: "surface (88% + backdrop blur)" },
        { token: "color.alpha.white-18",     role: "neutral stroke" },
        { token: "elevation.5",              role: "shadow" },
        { token: "color.semantic.success",   role: "success icon and stroke" },
        { token: "color.semantic.error",     role: "error icon and stroke" },
        { token: "color.neonindigo.base",    role: "neutral action" },
        { token: "color.text.primary / muted", role: "title / description, success and error actions" },
        { token: "color.brand.teal",         role: "secondary row" },
        { token: "radius.lg",                role: "card" },
      ],
    },
    props: [
      { name: "visible", type: "boolean", required: true, description: "Controlled by the caller (Toast only)." },
      { name: "title / description", type: "string", required: true, description: "Title required. Two lines of text at most." },
      { name: "tone", type: '"neutral" | "success" | "error"', required: false, default: '"neutral"', description: "Surface, icon and announcement." },
      { name: "leading", type: "string | ReactNode", required: false, description: "Icon name or a node (thumbnail). Defaults per tone." },
      { name: "action", type: "{ label, onPress }", required: false, description: "One text action; closes the toast unless dismissOnAction is false." },
      { name: "duration", type: "number | null", required: false, default: "5000 (7000 with action)", description: "null = stay until dismissed." },
      { name: "bottom", type: "number", required: false, default: "24", description: "Pass ~106 above the bottom nav." },
      { name: "shape", type: '"card" | "pill"', required: false, default: '"card"', description: "pill = top, hugs content, full radius, title only." },
      { name: "placement / top", type: '"top" | "bottom" / number', required: false, default: "pill → top, top 40 (level with the header back / menu buttons)", description: "Where it sits; top is the distance under the phone's top edge." },
      { name: "onDismiss", type: "() => void", required: true, description: "Timer, close, swipe, or action." },
    ],
    usage: {
      patterns: [{ name: "show from anywhere", when: "After an action completes", code: `
const { show } = useToast();
show({ title: "Interaction deleted", action: { label: "Undo", onPress: restore } });` }],
      antiPatterns: [{ scenario: "A toast that asks the user to choose", why: "Toasts disappear; decisions must not", instead: "Use AlertDialog" }, { scenario: "Two or more actions on a toast", why: "Hard to hit before it goes", instead: "One action; put the rest on the screen" }],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Confirming a completed action, with an optional undo"],
      neverUseFor: ["Decisions, long messages, or anything the user must act on — use AlertDialog or an inline message"],
      alwaysRemember: ["Any action on a toast should also be available on the screen, except Undo", "Errors that need attention should persist (duration null) with a close button"],
    },
    changelog: ["2026-11-02: added the `pill` shape (top, full radius) with ToastSpinner / ToastCheck and show(..., { replace: true }), matching how the website shows a note preparing then ready.", "2026-11-02: new. Replaces the old CompletionToast look (CompletionToast now wraps it). Interaction delete shows a Toast with Undo.", "2026-11-02: the pill replaced the capture widget's finalizing/ready bar states (tap Note ready to open the note), the home preview banner (?note=processing|multiprocess|failed) and the account page Preparing note card."],
  },

  // ── EngagementsDrawer ───────────────────────────────────────────────────────
  {
    name: "EngagementsDrawer",
    category: "feature",
    type: "interactive",
    description:
      "The home screen's side drawer: a feed of recent interactions across every account, newest first. Header with the halosight logo and a round search button (opens a search field that filters the feed). " +
      "Under the header: Companies, Action Items and Risks links (serif, with icons) and an \"Interactions\" label; they step aside while searching. Rows are ActivityCard variants `recent` / `recent-unread`; opening a row marks it read. Lazy loads: 12 rows first, then 8 more each time the end of the list scrolls into view (ThinkingDots while loading). " +
      "EngagementsPanel is the stateless body used by the design-system page.",
    file: "app/components/accounts/EngagementsDrawer.tsx",
    designSystemSection: "#engagements-drawer",
    flutterEquivalent: "EngagementsDrawer — lib/view/_widget/engagements/engagements_drawer.dart (Drawer + ListView.builder with cursor paging)",
    tokens: {
      required: [
        { token: "color.dark.primary",    role: "panel" },
        { token: "color.dark.tertiary",   role: "panel edge" },
        { token: "color.alpha.scrim",     role: "scrim (via DrawerBackdrop)" },
        { token: "color.dark.secondary",  role: "search button and field" },
        { token: "color.text.muted",      role: "empty and loading text" },
        { token: "radius.full",           role: "search button and field" },
      ],
    },
    props: [
      { name: "open", type: "boolean", required: true, description: "Visibility." },
      { name: "onClose", type: "() => void", required: true, description: "Scrim tap or a row opened." },
      { name: "onNavigate", type: '(to: "companies" | "actionItems" | "risks") => void', required: false, description: "A top link was tapped (the drawer closes first). Risks has no screen yet: the home screen shows the company list limited to companies with risks." },
    ],
    usage: {
      patterns: [{ name: "home menu", when: "Hamburger on the home screen", code: `<EngagementsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />` }],
      antiPatterns: [{ scenario: "Re-building the row inline", why: "The unread treatment must stay in sync with the Activity Card", instead: "Use <ActivityCard recent={…} variant=\"recent-unread\" />" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Showing recent activity across all accounts"],
      neverUseFor: ["One account's history — use the Activity tab list"],
      alwaysRemember: ["Copy is “Modified …”, never “Created …”", "Read state is in AccountState (prototype); the real feed needs a server read flag"],
    },
    changelog: ["2026-11-02: new. Replaces the old name-only engagements list (Today / Previous groups). ActivityCard gained the recent / recent-unread variants."],
  },

  // ── TextField ───────────────────────────────────────────────────────────────
  {
    name: "TextField",
    category: "ui-primitive",
    type: "interactive",
    description:
      "The one text entry for the whole app. Single-line is a full pill, multi-line a rounded box (radius.xl). Three states: default (empty, no stroke), active (focused: 1.5px neonindigo stroke) and filled (has text: hairline stroke), plus warning and error (a status stroke and helper line) and disabled. Sizes sm 36, md 44, lg 48 (default), xl 56 (the chat composer). Optional label (uppercase eyebrow), helper, n/max counter, leading icon, trailing tag, clear dot, endSlot and flush-right actions. variant=\"bare\" is the input alone for text that edits in place inside a card or row that owns the surface. SearchField and ChatInput are built on it. Used by the lead and action item sheets, the contact and deal forms, notes, feedback, the data-deletion request, the date filter and the AI review fields.",
    file: "app/components/ui/TextField.tsx",
    designSystemSection: "#text-field",
    flutterEquivalent: "HalosightTextField — lib/view/_widget/halosight_text_field.dart (one widget; size is an enum; multiline swaps maxLines; bare is a flag)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "fill" },
        { token: "color.text.primary", role: "text" },
        { token: "color.text.muted", role: "placeholder, label, leading icon, helper, counter" },
        { token: "color.text.disabled", role: "clear dot" },
        { token: "color.neonindigo.base", role: "active stroke, active leading icon" },
        { token: "color.alpha.white.10", role: "filled stroke" },
        { token: "color.error / color.warning", role: "status stroke and helper" },
        { token: "color.brand.coral", role: "caret" },
        { token: "radius.full / radius.xl", role: "single-line pill / multi-line box" },
      ],
      forbidden: [
        "A raw <input> or <textarea> in a screen or sheet — use TextField",
        "Hand-drawing a focus border with onFocus state — TextField owns default, active and filled",
        "A different fill, radius or text size per sheet — pick a size instead",
        "text.disabled for a label — labels are text.muted",
      ],
    },
    props: [
      { name: "value / onChange", type: "string / (v: string) => void", required: true, description: "Controlled text. onChange gets the string, not the event." },
      { name: "label", type: "string", required: false, description: "Uppercase eyebrow above the field. Without it, pass ariaLabel or a placeholder." },
      { name: "placeholder", type: "string", required: false, description: "Muted hint. Also the accessible name when there is no label." },
      { name: "size", type: '"sm" | "md" | "lg" | "xl"', required: false, default: '"lg"', description: "36 / 44 / 48 / 56 tall. Use md for compact forms, xl for the chat composer." },
      { name: "multiline / rows", type: "boolean / number", required: false, default: "false / 3", description: "A textarea in a radius.xl box." },
      { name: "status / helper", type: '"error" | "warning" / string', required: false, description: "Status stroke and a helper line in the same colour. Warning is for soft problems (possible duplicate)." },
      { name: "maxLength / showCount", type: "number / boolean", required: false, description: "Limits input; showCount adds n/max under the field." },
      { name: "leading / trailing / endSlot / actions", type: "ReactNode", required: false, description: "Icon before; tag or spinner after; control after the clear dot; round buttons flush right." },
      { name: "clearable", type: "boolean", required: false, description: "A clear dot once there is text." },
      { name: "active", type: "boolean", required: false, description: "Show the active stroke without focus." },
      { name: "variant", type: '"field" | "bare"', required: false, default: '"field"', description: "bare = input only; pass inputStyle for type." },
      { name: "onSubmit", type: "() => void", required: false, description: "Enter on a single-line field." },
      { name: "inputRef / autoFocus / type / inputMode / enterKeyHint / disabled", type: "—", required: false, description: "Passed to the input." },
    ],
    usage: {
      patterns: [
        { name: "labelled form field", when: "A field in a sheet or form", code: `<TextField label="Company" placeholder="e.g. Saddleback Fleet Services" value={name} onChange={setName} onSubmit={handleCreate} />` },
        { name: "multi-line with counter", when: "Notes and descriptions", code: `<TextField label="Description" multiline rows={5} maxLength={280} showCount value={d} onChange={setD} />` },
        { name: "soft problem", when: "A possible duplicate", code: `<TextField label="Company" value={name} onChange={setName} status="warning" helper="Possible duplicate" />` },
      ],
      antiPatterns: [{ scenario: "Adding a raw <input> with inline styles", why: "Every sheet had drifted: radius, fill, text size, focus colour", instead: "Use <TextField> and pick a size" }],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Any place the user types text: forms, sheets, notes, feedback, chat, filters"],
      neverUseFor: ["Pickers and toggles", "A search bar — use SearchField (it is a TextField with a search icon)"],
      alwaysRemember: [
        "States: default (empty), active (focused), filled (has text); status overrides them",
        "Single-line is a pill; multi-line is radius.xl",
        "onChange receives the string",
      ],
    },
    changelog: ["2026-11-09: new. Replaces every hand-built input and textarea (sheets, forms, notes, feedback, chat, date filter, AI review fields); SearchField and ChatInput now render through it."],
  },

  // ── AddActionItemSheet ──────────────────────────────────────────────────────
  {
    name: "AddActionItemSheet",
    category: "feature",
    type: "interactive",
    description:
      "The bottom sheet for creating an action item: a TextField (\"What needs to be done?\"), an optional due date and an \"Add action item\" button. " +
      "The date is a row of five day chips (today plus four days) with \"Pick another date\", which swaps to a MiniCalendar. The button stays disabled until the title has text. " +
      "Opened from the account page and the interaction (activity) page.",
    file: "app/components/accounts/AddActionItemSheet.tsx",
    flutterEquivalent: "AddActionItemSheet — lib/view/_widget/action_items/add_action_item_sheet.dart (platform date picker instead of MiniCalendar)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "title field (via TextField) and unselected day chips" },
        { token: "color.dark.tertiary", role: "outline of Pick another date / Hide calendar" },
        { token: "color.neonindigo.base", role: "selected day chip" },
        { token: "color.text.primary / muted", role: "chip text / secondary labels" },
        { token: "radius.md / full", role: "day chips / outline pills" },
      ],
      forbidden: [
        "A raw <input> for the title — use TextField",
        "A due date that is required — it is optional",
        "Saving before the button is tapped",
      ],
    },
    props: [
      { name: "accountId", type: "string", required: true, description: "The account the new item belongs to." },
      { name: "onClose", type: "() => void", required: true, description: "Called after the exit animation finishes." },
    ],
    usage: {
      patterns: [{ name: "open from the add button", when: "A + / Add action item control", code: `{showAdd && <AddActionItemSheet accountId={id} onClose={() => setShowAdd(false)} />}` }],
      antiPatterns: [{ scenario: "A second hand-built create form for items", why: "The title rule and the date chips live here", instead: "Reuse this sheet" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Creating a new action item on an account"],
      neverUseFor: ["Editing an item — that is ActionItemDrawer"],
      alwaysRemember: [
        "Title is required, date is optional",
        "Day chips are hand-built here; the edit drawer has its own DateChips (merge them when a chip component exists)",
      ],
    },
    changelog: ["2026-11-09: registry entry added; the title field is now a TextField."],
  },

  // ── MiniCalendar ────────────────────────────────────────────────────────────
  {
    name: "MiniCalendar",
    category: "ui-primitive",
    type: "input",
    description:
      "An inline month grid for choosing a due date: month and year with a dropdown arrow (the next 18 months), a Today button and prev / next chevrons. " +
      "Past days are dimmed and not tappable, and you can't go back before the current month. The selected day is a neonindigo circle. " +
      "Prototype stand-in: Flutter uses the platform date picker.",
    file: "app/components/accounts/MiniCalendar.tsx",
    flutterEquivalent: "Not built — use showDatePicker(firstDate: today) in lib/view/_widget/",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "card fill" },
        { token: "color.dark.tertiary", role: "today circle, Today pill outline" },
        { token: "color.neonindigo.base", role: "selected day, current month in the picker" },
        { token: "color.text.primary / disabled", role: "days, month label / day-of-week headers" },
        { token: "radius.md / full", role: "card / Today pill" },
      ],
    },
    props: [
      { name: "selected", type: "Date | null", required: true, description: "The chosen day." },
      { name: "onSelect", type: "(d: Date) => void", required: true, description: "Called when an enabled day is tapped." },
    ],
    usage: {
      patterns: [{ name: "inline date", when: "Inside a sheet or drawer", code: `<MiniCalendar selected={date} onSelect={setDate} />` }],
      antiPatterns: [{ scenario: "Building the Flutter version of this grid", why: "The platform date picker does the job and handles locale", instead: "showDatePicker with firstDate set to today" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["An inline due-date picker inside AddActionItemSheet or ActionItemDrawer"],
      neverUseFor: ["Date filters — those use TextField type=date"],
      alwaysRemember: ["Past days are disabled", "No design-system area of its own; it appears inside the add and edit flows"],
    },
    changelog: ["2026-11-09: registry entry and handoff comment added."],
  },

  // ── CreateLeadSheet ─────────────────────────────────────────────────────────
  {
    name: "CreateLeadSheet",
    category: "feature",
    type: "interactive",
    description:
      "\"New Lead\": the sheet behind the + on the companies list. One TextField (Company), an \"AI fills the rest\" hint and a Create a lead button. " +
      "400ms after typing stops it fuzzy-matches the name against existing accounts; a spinner shows while it checks, then an amber callout lists up to two matches " +
      "(with \"+N more\"), the field takes the warning stroke, and the person can View an existing account or Create anyway. Creating adds a prospect to the list.",
    file: "app/components/accounts/CreateLeadSheet.tsx",
    flutterEquivalent: "CreateLeadSheet — lib/view/_widget/accounts/create_lead_sheet.dart (use case: CheckDuplicateAccounts, debounced 400ms)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "Company field (via TextField)" },
        { token: "color.neonindigo.base", role: "active stroke, spinner, AI hint text, CTA" },
        { token: "color.alpha.neonindigo-10", role: "AI hint fill" },
        { token: "color.semantic.warning", role: "duplicate callout and the field's warning stroke" },
        { token: "color.text.primary / muted", role: "text / secondary" },
        { token: "radius.lg", role: "callout and hint" },
      ],
      forbidden: [
        "Blocking creation when duplicates are found — it warns, and Create anyway always works",
        "A raw <input> — use TextField (status=\"warning\" for the duplicate state)",
      ],
    },
    props: [
      { name: "onClose", type: "() => void", required: true, description: "Called after the exit animation." },
      { name: "onCreated", type: "(account: Account) => void", required: true, description: "Receives the new prospect (type standalone, halosightType prospect)." },
    ],
    usage: {
      patterns: [{ name: "from the add button", when: "Adding a lead from the companies list", code: `{open && <CreateLeadSheet onClose={() => setOpen(false)} onCreated={handleCreated} />}` }],
      antiPatterns: [{ scenario: "Building a second create-account sheet", why: "CreateAccountSheet already drifted from this one", instead: "Use this sheet; a search entry point passes the query in as the name" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Adding a company or lead by name"],
      neverUseFor: ["Converting a lead to an account — that is ConvertToAccountSheet"],
      alwaysRemember: [
        "Duplicate check is a warning, not a block; the field takes the warning stroke while the callout shows",
        "Matches are name-contains in the prototype; production should match on a server",
        "CreateAccountSheet is the same sheet without duplicate detection; merge them for Flutter",
      ],
    },
    changelog: ["2026-11-09: registry entry added; the Company field is now a TextField with status=warning for the duplicate state."],
  },

  // ── CreateAccountSheet ──────────────────────────────────────────────────────
  {
    name: "CreateAccountSheet",
    category: "feature",
    type: "interactive",
    description:
      "\"New Lead\" opened from the \"create\" prompt under a company search: the same sheet as CreateLeadSheet without duplicate detection, " +
      "pre-filled with the search text. One TextField (Company), an \"AI fills the rest\" hint and an indigo Create a lead button. " +
      "Contact and address fields are reserved for an \"Add more details\" step that is not built.",
    file: "app/components/accounts/CreateAccountSheet.tsx",
    flutterEquivalent: "Merge into CreateLeadSheet (initialName parameter; duplicate check on)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "Company field (via TextField)" },
        { token: "color.neonindigo.base", role: "active stroke, AI hint, CTA" },
        { token: "color.alpha.neonindigo-10", role: "AI hint fill" },
        { token: "color.text.primary", role: "title" },
        { token: "radius.lg", role: "AI hint" },
      ],
    },
    props: [
      { name: "initialName", type: "string", required: false, default: '""', description: "Search text to start from." },
      { name: "onClose", type: "() => void", required: true, description: "Called after the exit animation." },
      { name: "onCreated", type: "(account: Account) => void", required: true, description: "Receives the new prospect." },
    ],
    usage: {
      patterns: [{ name: "from a search prompt", when: "No result matches the search", code: `{open && <CreateAccountSheet initialName={query} onClose={close} onCreated={handleCreated} />}` }],
      antiPatterns: [{ scenario: "Keeping both lead sheets in Flutter", why: "They differ only by duplicate detection", instead: "One sheet with an initial name" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Creating a company from a search that found nothing"],
      neverUseFor: ["The + on the companies list — that is CreateLeadSheet"],
      alwaysRemember: ["Flagged for merge into CreateLeadSheet", "showDetails state exists but the extra fields are not rendered"],
    },
    changelog: ["2026-11-09: registry entry added; Company is a TextField, the unused optional-field helper was removed."],
  },

  // ── ConvertToAccountSheet ───────────────────────────────────────────────────
  {
    name: "ConvertToAccountSheet",
    category: "feature",
    type: "interactive",
    description:
      "Turns a lead into a Salesforce account in one sheet. Pick the account type (Customer, Fleet Account or Distributor), confirm the primary contact " +
      "(name, title and phone, pre-filled from what was captured), and optionally open a deal (a toggle, then deal name and estimated value). " +
      "\"Convert to Account\" shows an \"Account created\" confirmation that names the account and primary contact, then calls onConverted.",
    file: "app/components/accounts/ConvertToAccountSheet.tsx",
    flutterEquivalent: "ConvertToAccountSheet — lib/view/_widget/accounts/convert_to_account_sheet.dart (use case: ConvertLeadToAccount)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "type chips, deal toggle row, fields (via TextField)" },
        { token: "color.neonindigo.base / dark", role: "selected chip, section icons, active stroke" },
        { token: "color.brand.teal", role: "Convert button and success state (hand-built; no teal Button fill yet)" },
        { token: "color.text.primary / secondary / muted / disabled", role: "labels and sub-labels" },
        { token: "radius.xl / md / full", role: "toggle row / chips / pills" },
      ],
      forbidden: ["A raw <input> — fields are TextField size md", "Converting without confirming the contact"],
    },
    props: [
      { name: "accountName", type: "string", required: true, description: "Shown in the success message." },
      { name: "initialContact", type: "{ name; title; phone }", required: true, description: "Pre-filled primary contact." },
      { name: "onClose", type: "() => void", required: true, description: "Close request." },
      { name: "onConverted", type: "() => void", required: true, description: "Runs after the success step (the account screen goes back to the list)." },
    ],
    usage: {
      patterns: [{ name: "from a lead", when: "A lead account page", code: `<ConvertToAccountSheet accountName={account.name} initialContact={contact} onClose={close} onConverted={() => router.push("/relationships")} />` }],
      antiPatterns: [{ scenario: "Creating a deal outside this sheet", why: "The deal is part of conversion and syncs with it", instead: "Use the toggle here" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Converting a lead into a Salesforce account"],
      neverUseFor: ["Creating a new lead — that is CreateLeadSheet"],
      alwaysRemember: [
        "Account type is required (Customer is the default); the deal is optional",
        "Est. Value brings up the number pad (inputMode numeric) but stays a text field",
        "The Convert button and success state are hand-built teal; there is no teal Button fill yet",
      ],
    },
    changelog: ["2026-11-09: registry entry added; the local Field helper now renders a TextField (size md)."],
  },

  // ── NoteSheet ───────────────────────────────────────────────────────────────
  {
    name: "NoteSheet",
    category: "feature",
    type: "interactive",
    description:
      "The sheet that slides up after an action item is checked off, offering a note (\"Anything worth remembering for next time…\"). " +
      "Tap Done with or without text, or dismiss it; either way the completion is committed, so there is no undo here. " +
      "The note is one multi-line TextField, focused as the sheet opens.",
    file: "app/components/ui/NoteSheet.tsx",
    flutterEquivalent: "CompletionNoteSheet — lib/view/_widget/action_items/completion_note_sheet.dart",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "note field (via TextField)" },
        { token: "color.brand.teal", role: "Done button (hand-built; no teal Button fill yet)" },
        { token: "color.text.primary / muted", role: "note text / header" },
        { token: "radius.full", role: "Done button" },
      ],
      forbidden: ["Treating dismiss as undo — it commits without a note", "A raw <textarea> — use TextField multiline"],
    },
    props: [
      { name: "visible", type: "boolean", required: true, description: "Sheet visibility; the note clears each time it opens." },
      { name: "onDone", type: "(note: string) => void", required: true, description: "Called with the note, or an empty string when dismissed without typing." },
    ],
    usage: {
      patterns: [{ name: "after completing an item", when: "A check-off that offers a note", code: `<NoteSheet visible={noteOpen} onDone={(note) => finishCompletion(id, note)} />` }],
      antiPatterns: [{ scenario: "Showing it before the item is checked", why: "It only appears after the completion starts", instead: "Open it from the completion flow" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Offering a note right after an item is completed"],
      neverUseFor: ["General note entry", "Editing an existing note"],
      alwaysRemember: ["Dismiss and Done both commit the completion", "The Done button is hand-built teal"],
    },
    changelog: ["2026-11-09: registry entry added; the note field is now a TextField."],
  },

  // ── FilterDropdown ──────────────────────────────────────────────────────────
  {
    name: "FilterDropdown",
    category: "ui-primitive",
    type: "interactive",
    description:
      "A 32px pill that shows the current choice and opens a check menu. Three looks: resting (dark.secondary fill, muted down arrow), filtered (a small indigo check before the label, when the value is not the default) " +
      "and open (neonindigo fill, up arrow). The menu is the shared Menu (variant `check`, min width 180) anchored top-left under the pill. Used for Open / Done and Due Date / Company on the items list.",
    file: "app/components/ui/FilterDropdown.tsx",
    designSystemSection: "#filter-pill",
    flutterEquivalent: "FilterDropdown — lib/view/_widget/filter_dropdown.dart (pill + PopupMenuButton with HalosightMenu check rows)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "pill fill" },
        { token: "color.neonindigo.base", role: "open fill, filtered check" },
        { token: "color.text.on-accent", role: "label while open" },
        { token: "color.text.primary / muted", role: "label / arrow" },
        { token: "radius.full", role: "pill" },
      ],
      forbidden: [
        "A hand-built dropdown panel — the menu is Menu",
        "A native <select>",
        "More than about six options — use a sheet",
      ],
    },
    props: [
      { name: "options", type: "{ value, label }[]", required: true, description: "The choices. The first one is the unfiltered default unless defaultValue is set." },
      { name: "value", type: "T extends string", required: true, description: "The current choice." },
      { name: "onChange", type: "(v: T) => void", required: true, description: "Called when a row is chosen; the menu closes." },
      { name: "defaultValue", type: "T", required: false, description: "The value that means no filter (drives the filtered check)." },
    ],
    usage: {
      patterns: [{ name: "status filter", when: "A list with a few filter choices", code: `<FilterDropdown options={[{ value: "open", label: "Open" }, { value: "done", label: "Done" }]} value={status} onChange={setStatus} />` }],
      antiPatterns: [{ scenario: "A second hand-built pill with its own menu", why: "The three looks and the Menu panel are shared", instead: "Use FilterDropdown" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Choosing one value from a short list to filter or sort a list"],
      neverUseFor: ["Dates — that is VisitedFilterDropdown", "Record actions — that is KebabMenu"],
      alwaysRemember: ["The filtered check shows only when the value differs from the default", "The open-state arrow is a raw white at 70% (no token yet)"],
    },
    changelog: ["2026-11-09: registry entry and design-system area (Filter Pill) added; removed a duplicated background branch."],
  },

  // ── VisitedFilterDropdown ───────────────────────────────────────────────────
  {
    name: "VisitedFilterDropdown",
    category: "ui-primitive",
    type: "interactive",
    description:
      "The Last Visited filter on the companies list: the same pill as FilterDropdown (it reads \"Last Visited\" until a choice is made), opening a check menu with All time, Last 7 days, " +
      "Last 2 weeks, Last 30 days and Last 90 days (each applies at once), then a divider and Custom range, which expands to two date TextFields (From, To) and an indigo Apply button.",
    file: "app/components/ui/VisitedFilterDropdown.tsx",
    designSystemSection: "#filter-pill",
    flutterEquivalent: "VisitedFilterDropdown — lib/view/_widget/visited_filter_dropdown.dart (custom range via showDateRangePicker)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "pill fill" },
        { token: "color.neonindigo.base", role: "open fill, filtered check" },
        { token: "color.text.on-accent", role: "label while open" },
        { token: "color.text.primary / muted", role: "label / arrow" },
        { token: "radius.full", role: "pill" },
      ],
      forbidden: ["Raw date inputs — the range fields are TextField type=date", "Applying a custom range before Apply is tapped"],
    },
    props: [
      { name: "value", type: '"all" | "7d" | "14d" | "30d" | "90d" | "custom"', required: true, description: "The applied filter." },
      { name: "customFrom / customTo", type: "Date | null", required: true, description: "The applied custom range." },
      { name: "onChange", type: "(v, from?, to?) => void", required: true, description: "Called for a preset, or with the range when Apply is tapped." },
    ],
    usage: {
      patterns: [{ name: "companies list", when: "Filtering companies by last visit", code: `<VisitedFilterDropdown value={visited} customFrom={from} customTo={to} onChange={(v, f, t) => { setVisited(v); setFrom(f ?? null); setTo(t ?? null); }} />` }],
      antiPatterns: [{ scenario: "A different date-range control on another list", why: "One range pattern keeps the pill and menu consistent", instead: "Reuse this, or extract a shared date-range filter" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Filtering a list by how recently something happened"],
      neverUseFor: ["Choosing a due date — that is MiniCalendar or the platform date picker"],
      alwaysRemember: ["Presets apply immediately; the custom range applies on Apply", "Reopening restores the applied dates into the fields"],
    },
    changelog: ["2026-11-09: registry entry and design-system area (Filter Pill) added; the date fields are TextField."],
  },

  // ── KebabMenu ───────────────────────────────────────────────────────────────
  {
    name: "KebabMenu",
    category: "ui-primitive",
    type: "interactive",
    description:
      "The three-dot \"more options\" button for a record's actions (Edit, Share, Delete on the account page): a 40px rounded square on dark.secondary. Tapping it fades the button out " +
      "while the menu springs in from the top-right over the same spot. The menu is the shared Menu (variant `icon`); destructive rows use the error color.",
    file: "app/components/ui/KebabMenu.tsx",
    designSystemSection: "#kebab-menu",
    flutterEquivalent: "KebabMenu — lib/view/_widget/kebab_menu.dart (IconButton + PopupMenuButton with HalosightMenu icon rows)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "button fill" },
        { token: "color.text.muted", role: "the three dots" },
      ],
      forbidden: ["A hand-built panel — the menu is Menu", "More than about five actions"],
    },
    props: [
      { name: "items", type: "{ label, icon?, onClick, destructive? }[]", required: true, description: "One row each; destructive rows use the error color." },
    ],
    usage: {
      patterns: [{ name: "record actions", when: "A header with Edit / Share / Delete", code: `<KebabMenu items={[{ label: "Edit", icon: "edit", onClick: edit }, { label: "Delete", icon: "delete", destructive: true, onClick: remove }]} />` }],
      antiPatterns: [{ scenario: "Putting the destructive action first", why: "It sits last so it is not hit by accident", instead: "Order: Edit, Share, then Delete" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["A short list of actions on a single record"],
      neverUseFor: ["Choosing a filter or sort — that is FilterDropdown or SortMenu"],
      alwaysRemember: ["The trigger fades out as the menu opens", "Delete goes through a confirmation (AlertDialog)"],
    },
    changelog: ["2026-11-09: registry entry and design-system area (More Menu) added."],
  },

  // ── Skeleton ────────────────────────────────────────────────────────────────
  {
    name: "Skeleton",
    category: "ui-primitive",
    type: "display",
    description:
      "Grey shapes that hold a screen's layout while its content loads. Bone is the primitive (a rounded rectangle with a left-to-right sweep from dark.secondary through dark.tertiary, 1.4s); " +
      "AccountListSkeleton (rows, default 6) matches the company row, and AccountDetailSkeleton matches the account page. For whole-screen or whole-list loads only; a short wait is ThinkingDots.",
    file: "app/components/ui/Skeleton.tsx",
    designSystemSection: "#skeleton",
    flutterEquivalent: "Skeleton — lib/view/_widget/skeleton.dart (shimmer package; Shimmer.fromColors around sized Containers)",
    tokens: {
      required: [
        { token: "color.dark.secondary / tertiary", role: "the sweep gradient and the row hairline" },
        { token: "color.background", role: "account page skeleton ground" },
      ],
      forbidden: ["A spinner for a whole-list load — use a skeleton", "Skeleton shapes that do not match the real content's size"],
    },
    props: [
      { name: "Bone: width / height / radius / style", type: "number | string / number / number / CSSProperties", required: false, default: "100% / 14 / 6", description: "One placeholder rectangle." },
      { name: "AccountListSkeleton: rows", type: "number", required: false, default: "6", description: "How many company rows." },
    ],
    usage: {
      patterns: [{ name: "list loading", when: "The companies list is loading", code: `{loading ? <AccountListSkeleton rows={6} /> : <AccountList />}` }],
      antiPatterns: [{ scenario: "A skeleton inside a button", why: "The button already has a loading state", instead: "Pass loading to <Button>" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Loading a list or a whole screen"],
      neverUseFor: ["A short wait next to text or in a button — that is ThinkingDots"],
      alwaysRemember: ["Match the real content's layout so nothing jumps when it arrives", "Bone radius is a number (px) for now"],
    },
    changelog: ["2026-11-09: registry entry and design-system area (Skeleton) added."],
  },

  // ── CompletionToast ─────────────────────────────────────────────────────────
  {
    name: "CompletionToast",
    category: "ui-primitive",
    type: "display",
    description:
      "A thin wrapper over Toast for the pending-complete window after an action item is checked off: a success toast reading \"Item complete\" with one Undo action and, when onAddNote is given, an \"Add a note\" row under it. " +
      "The screens time that window themselves, so it never dismisses on its own and pressing Undo does not close it. In Flutter this is a call to the toast controller, not a widget.",
    file: "app/components/ui/CompletionToast.tsx",
    designSystemSection: "#toast",
    flutterEquivalent: "No widget — ToastController.show(tone: success, title: \"Item complete\", action: Undo, secondary: \"Add a note\") with no auto-dismiss",
    tokens: { required: [{ token: "see Toast", role: "all styling comes from Toast" }], forbidden: ["Restyling it — change Toast instead"] },
    props: [
      { name: "visible", type: "boolean", required: true, description: "Whether the toast shows." },
      { name: "bottom", type: "number", required: false, default: "24", description: "Distance from the bottom of the phone frame; raise it to clear a floating control." },
      { name: "onUndo", type: "() => void", required: true, description: "Undo pressed." },
      { name: "onDismiss", type: "() => void", required: true, description: "The screen hides it." },
      { name: "onAddNote", type: "() => void", required: false, description: "Adds an \"Add a note\" row." },
    ],
    usage: {
      patterns: [{ name: "after check-off", when: "An item is marked complete and can still be undone", code: `<CompletionToast visible={pending} onUndo={undo} onDismiss={hide} onAddNote={openNote} />` }],
      antiPatterns: [{ scenario: "Building a second \"item complete\" toast", why: "Toast already has tone, action and secondary row", instead: "Use CompletionToast, or Toast directly" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Confirming an action item was completed, with Undo"],
      neverUseFor: ["Any other confirmation — use useToast().show(...)"],
      alwaysRemember: ["It does not auto-dismiss; the screen owns the timing", "Flutter: no separate widget"],
    },
    changelog: ["2026-11-09: registry entry added (it already wrapped Toast)."],
  },

  // ── ErrorState ──────────────────────────────────────────────────────────────
  {
    name: "ErrorState",
    category: "ui-primitive",
    type: "display",
    description:
      "What a list or screen shows when its data fails to load, centered in the space it fills: a 52px circle holding a coral warning triangle, a title, a short message (max 260px wide) and, when onRetry is given, a tonal \"Try again\" Button. " +
      "A failed action (a save that did not go through) is a Toast or Banner, not this.",
    file: "app/components/ui/ErrorState.tsx",
    designSystemSection: "#error-state",
    flutterEquivalent: "ErrorState — lib/view/_widget/error_state.dart (centered Column; onRetry re-runs the load)",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "icon circle" },
        { token: "color.brand.coral", role: "warning triangle" },
        { token: "color.text.primary / muted", role: "title / message" },
      ],
      forbidden: ["A hand-built retry button — it is Button (tonal, sm)", "Using it for a failed action — use Toast or Banner"],
    },
    props: [
      { name: "title", type: "string", required: false, default: '"Something went wrong"', description: "Say what failed, e.g. \"Couldn't load accounts\"." },
      { name: "message", type: "string", required: false, default: '"We couldn\'t load this content. Check your connection and try again."', description: "One short line." },
      { name: "onRetry", type: "() => void", required: false, description: "Shows the Try again button and runs the load again." },
    ],
    usage: {
      patterns: [{ name: "failed list load", when: "The data call fails", code: `<ErrorState title="Couldn't load accounts" message="We had trouble reaching the server." onRetry={reload} />` }],
      antiPatterns: [{ scenario: "A red banner for a failed list", why: "The list has nothing to show; it needs a full state", instead: "ErrorState" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["A list or screen could not load its data"],
      neverUseFor: ["A failed save or action", "An empty list — that is an empty state, not an error"],
      alwaysRemember: ["Retry is optional", "The triangle is a raw SVG in coral, not a Material icon"],
    },
    changelog: ["2026-11-09: registry entry and design-system area added; Try again is now the shared Button (tonal) instead of a hand-built pill."],
  },

  // ── ScrollAwareTopBar ───────────────────────────────────────────────────────
  {
    name: "ScrollAwareTopBar",
    category: "layout",
    type: "navigation",
    description:
      "A back button that floats over the top of a scrolling page, with an optional control on the right (Edit, Send). At the top the arrow has no background; after 10px of scroll a 36px glass circle appears behind it. " +
      "The right control fades out while scrolling down and returns when scrolling up. The bar sits 40px from the top and lets taps through everywhere except its controls. Page content needs about 86px of top padding.",
    file: "app/components/ui/ScrollAwareTopBar.tsx",
    designSystemSection: "#scroll-top-bar",
    flutterEquivalent: "ScrollAwareTopBar — lib/view/_widget/scroll_aware_top_bar.dart (Stack overlay driven by the page's ScrollController)",
    tokens: {
      required: [
        { token: "color.text.primary", role: "back arrow" },
        { token: "color.alpha.bg-glass", role: "scrolled circle, with a 16px backdrop blur" },
        { token: "color.alpha.white-10", role: "circle's hairline ring" },
      ],
      forbidden: ["A solid header bar that scrolls away — this one floats", "Putting content under the bar without the 86px top padding"],
    },
    props: [
      { name: "onBack", type: "() => void", required: true, description: "Back pressed." },
      { name: "rightSlot", type: "ReactNode", required: false, description: "A control on the right; fades with scroll direction." },
      { name: "scrollRef", type: "RefObject<HTMLDivElement>", required: true, description: "The scrolling container to listen to." },
    ],
    usage: {
      patterns: [{ name: "page with a floating back", when: "A full page with its own scroll area", code: `
<div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
  <ScrollAwareTopBar onBack={back} rightSlot={<EditButton />} scrollRef={scrollRef} />
  <div ref={scrollRef} style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
    <div style={{ paddingTop: 86 }}>…</div>
  </div>
</div>` }],
      antiPatterns: [{ scenario: "A fixed header with a title", why: "This component is only the back button and one control", instead: "Build a header for that screen" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["A scrolling detail page that needs a floating back button"],
      neverUseFor: ["Sheets and drawers — they have their own header"],
      alwaysRemember: ["The glass circle appears after 10px of scroll", "The right control hides while scrolling down"],
    },
    changelog: ["2026-11-09: registry entry and design-system area (Scroll Top Bar) added; handoff comment corrected to the real tokens."],
  },

  // ── CustomIcons ─────────────────────────────────────────────────────────────
  {
    name: "CustomIcons",
    category: "ui-primitive",
    type: "display",
    description:
      "Icons Material Symbols does not have, drawn as filled SVGs on a 24px grid that take currentColor: LeadStarIcon (a four-pointed star marking a lead), CompanyIcon (a building marking a company) " +
      "and AiChatIcon (a speech bubble with a sparkle, the Ask button on the account page). Each takes size (px), style and className.",
    file: "app/components/ui/CustomIcons.tsx",
    designSystemSection: "#custom-icons",
    flutterEquivalent: "SVG assets via flutter_svg (lead_star.svg, company.svg, ai_chat.svg), tinted with the icon colour",
    tokens: { required: [{ token: "currentColor", role: "the parent's text colour" }], forbidden: ["Hard-coding a colour on the icon", "Redrawing these with a Material Symbols name"] },
    props: [
      { name: "size", type: "number", required: false, default: "18 (24 for AiChatIcon)", description: "Width and height in px." },
      { name: "style / className", type: "CSSProperties / string", required: false, description: "Passed to the SVG." },
    ],
    usage: {
      patterns: [{ name: "lead marker", when: "Marking a lead in a row", code: `<LeadStarIcon size={14} style={{ color: "var(--md-sys-color-neonindigo)" }} />` }],
      antiPatterns: [{ scenario: "Adding another one-off inline SVG", why: "They drift in size and weight", instead: "Add it to CustomIcons" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["An icon Material Symbols lacks (lead star, company, Ask)"],
      neverUseFor: ["Anything Material Symbols has — use Icon"],
      alwaysRemember: ["currentColor only", "Ship as SVG assets in Flutter"],
    },
    changelog: ["2026-11-09: registry entry and design-system area (Custom Icons) added."],
  },

  // ── ThumbsDownIcon ──────────────────────────────────────────────────────────
  {
    name: "ThumbsDownIcon",
    category: "ui-primitive",
    type: "display",
    description:
      "The \"not helpful\" mark on AI answers (the insight card and chat messages): a 15px thumbs-down on a 1.6 stroke, outline by default and filled with currentColor once the feedback is given. " +
      "Drawn by hand because Material's thumb_down has a wrist cuff we don't want.",
    file: "app/components/ui/ThumbsDownIcon.tsx",
    designSystemSection: "#custom-icons",
    flutterEquivalent: "ThumbsDownIcon — an SVG asset or CustomPaint with filled: bool",
    tokens: { required: [{ token: "currentColor", role: "stroke and fill" }], forbidden: ["Swapping in Material's thumb_down"] },
    props: [
      { name: "filled", type: "boolean", required: false, default: "false", description: "Fills the shape once feedback is given." },
      { name: "size", type: "number", required: false, default: "15", description: "Width and height in px." },
    ],
    usage: {
      patterns: [{ name: "feedback button", when: "A thumbs-down control on an AI answer", code: `<ThumbsDownIcon filled={disliked} />` }],
      antiPatterns: [{ scenario: "A thumbs-up beside it for the same answer", why: "The product only asks for negative feedback", instead: "Keep thumbs-down only" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Marking an AI answer not helpful"],
      neverUseFor: ["General dislike or delete actions"],
      alwaysRemember: ["Outline until pressed, then filled"],
    },
    changelog: ["2026-11-09: registry entry added (shares the Custom Icons area)."],
  },

  // ── AccountPickerSheet ──────────────────────────────────────────────────────
  {
    name: "AccountPickerSheet",
    category: "feature",
    type: "interactive",
    description:
      "\"Switch account\": the sheet that moves the capture flow to a different company. A header with a close button, a SearchField (focused as the sheet slides up), then the accounts A to Z. " +
      "Without a search the current account is pinned at the top in indigo with a check, then a hairline and the rest; with a search it is one list filtered by name, city or state, and no match shows a muted \"No accounts match\" line. " +
      "Tapping a row selects it and closes the sheet. It does not portal itself; the parent renders it in the overlay root.",
    file: "app/components/accounts/AccountPickerSheet.tsx",
    designSystemSection: "#account-picker",
    flutterEquivalent: "AccountPickerSheet — lib/view/_widget/accounts/account_picker_sheet.dart (showModalBottomSheet; use case: SearchAccounts)",
    tokens: {
      required: [
        { token: "color.dark.primary", role: "sheet fill (via Drawer)" },
        { token: "color.dark.tertiary", role: "row hairlines" },
        { token: "color.neonindigo.base", role: "current account name and check" },
        { token: "color.text.primary / muted", role: "names / city and state, empty message" },
        { token: "radius.xl", role: "sheet top corners (via Drawer)" },
      ],
      forbidden: ["A hand-built search input — it is SearchField", "text.disabled for the empty message — it is informational, so text.muted"],
    },
    props: [
      { name: "currentId", type: "string | null", required: true, description: "The account to pin and mark." },
      { name: "onSelect", type: "(id: string, name: string) => void", required: true, description: "Called with the chosen account; the sheet then closes." },
      { name: "onClose", type: "() => void", required: true, description: "Close request (backdrop, close button, after a pick)." },
      { name: "autoFocus", type: "boolean", required: false, default: "true", description: "Focus the search field after the slide-up. The design-system preview turns it off." },
    ],
    usage: {
      patterns: [{ name: "from the capture sheet", when: "Changing which account a capture belongs to", code: `
<AnimatePresence>
  {showPicker && <AccountPickerSheet currentId={accountId} onSelect={switchAccount} onClose={() => setShowPicker(false)} />}
</AnimatePresence>` }],
      antiPatterns: [{ scenario: "Using it to browse companies", why: "It is a switcher for capture; browsing is the companies list", instead: "Use the companies screen" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Moving the current capture to another account"],
      neverUseFor: ["Browsing or searching all companies"],
      alwaysRemember: ["The current account is pinned first and marked", "The parent supplies the portal and AnimatePresence", "Z-index 60 / 61 so it sits above the capture sheet"],
    },
    changelog: ["2026-11-09: registry entry and design-system area (Account Picker) added; the empty message now uses text.muted; autoFocus prop added for the preview."],
  },

  // ── InsightCardLoader ───────────────────────────────────────────────────────
  {
    name: "InsightCardLoader",
    category: "feature",
    type: "display",
    description:
      "What the account summary looks like while the app brings it in: a four-point indigo sparkle that turns 90 degrees every 1.6s with a small pulse, and beside it a status line (\"Reading 6 visits...\", \"Checking Salesforce...\", \"Writing your summary...\") " +
      "that slides up and fades every 1.1s until the last one, which it holds until loading ends. It replaces the InsightCard body and the footer is hidden. Reduced motion: the sparkle holds still and lines swap with a fade.",
    file: "app/components/accounts/InsightCardLoader.tsx",
    designSystemSection: "#insight-card",
    flutterEquivalent: "InsightCardLoader — lib/view/_widget/insight_card_loader.dart (Timer.periodic for the lines, a repeating AnimationController for the sparkle, AnimatedSwitcher with a slide and fade)",
    tokens: {
      required: [
        { token: "color.neonindigo.base", role: "sparkle" },
        { token: "color.text.muted", role: "status line" },
        { token: "spacing.3", role: "gap between sparkle and text" },
      ],
      forbidden: ["A spinner or ThinkingDots for the summary load — this is the loading state of the card", "Dismissing early — it waits on the last line until the text arrives"],
    },
    props: [
      { name: "messages", type: "string[]", required: false, default: "Reading 6 visits... / Checking Salesforce... / Writing your summary...", description: "The status lines in order." },
      { name: "interval", type: "number (ms)", required: false, default: "1100", description: "Time each line shows." },
    ],
    usage: {
      patterns: [{ name: "inside InsightCard", when: "The summary is loading", code: `<InsightCard loading loadingMessages={["Reading 6 visits...", "Checking Salesforce...", "Writing your summary..."]} />` }],
      antiPatterns: [{ scenario: "Using it outside the insight card", why: "It is tuned to the card body", instead: "ThinkingDots for short waits; Skeleton for whole lists" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Inside InsightCard while its text is loading"],
      neverUseFor: ["Any other wait"],
      alwaysRemember: ["Timings were read off a screen recording; treat them as a close match", "InsightCard owns the cross-fade to the real text"],
    },
    changelog: ["2026-11-09: registry entry added (it was already shown in the Insight Card area)."],
  },

  // ── AIReviewOverlay ─────────────────────────────────────────────────────────
  {
    name: "AIReviewOverlay",
    category: "feature",
    type: "interactive",
    description:
      "The full-screen review after a capture: the rep checks what the AI pulled out of the visit before it goes to Salesforce, and fixes anything by hand or by voice. " +
      "A header (\"What we learned\" and \"Here's the read on <account>\", or a waveform and live caption while the mic is held), a scrolling list of field cards, and a bottom bar with Use defaults, a hold-to-talk mic and Save. " +
      "Each field card shows the AI's confidence: high (indigo, sparkle), uncertain (dashed outline) or confirmed (green, once edited or spoken). Tap a card to edit; leaving it saves and confirms; empty text is ignored.",
    file: "app/components/capture/AIReviewOverlay.tsx",
    designSystemSection: "#ai-review",
    flutterEquivalent: "AIReviewOverlay — lib/view/_widget/capture/ai_review_overlay.dart; FieldCard — field_card.dart (use cases: ExtractVisitFields, ConfirmField)",
    tokens: {
      required: [
        { token: "color.background", role: "screen" },
        { token: "color.dark.secondary", role: "field cards" },
        { token: "color.neonindigo.base", role: "high-confidence outline and sparkle, mic, focused stroke" },
        { token: "color.semantic.success", role: "confirmed outline, tint and check" },
        { token: "color.alpha.neonindigo-10", role: "Save button fill" },
        { token: "color.text.primary / muted / on-accent", role: "values / labels, eyebrows / mic icon" },
        { token: "radius.lg / full", role: "cards / buttons" },
      ],
      forbidden: [
        "A raw <input> in a card — the text is TextField (bare); the card owns the outline",
        "text.disabled for the eyebrows or \"Listening…\" — informational text is text.muted",
        "Hiding the confidence — it is how the rep decides what to double-check",
      ],
    },
    props: [{ name: "(none)", type: "—", required: false, description: "Shows while CaptureContext.status is \"reviewing\"; reads the account name from it. Use defaults and Save both call readyCapture()." }],
    usage: {
      patterns: [{ name: "mounted once", when: "In the mobile layout, next to the capture widget", code: `<AIReviewOverlay />` }],
      antiPatterns: [{ scenario: "Showing AI fields as a plain form", why: "The rep needs to see how sure the AI was and what changed", instead: "Use the field card states" }],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Reviewing AI-extracted CRM fields after a capture"],
      neverUseFor: ["General forms — those are TextField"],
      alwaysRemember: [
        "Confidence is shown in the card's outline and value colour, not hidden",
        "An edit marks the field confirmed",
        "Tapping \"What we learned\" toggles five extra demo fields (prototype only)",
        "Save and Use defaults are hand-built round buttons (SideButton), not Button or IconButton",
      ],
    },
    changelog: ["2026-11-09: registry entry and design-system area (AI Review) added. The focused field's raw input is now TextField (bare); informational text moved from text.disabled to text.muted. FieldCard, LiveCaption, WaveformBars and SideButton are exported for the previews."],
  },

  // ── CaptureWidget ───────────────────────────────────────────────────────────
  {
    name: "CaptureWidget",
    category: "feature",
    type: "interactive",
    description:
      "The persistent recording bar anchored to the bottom edge while a visit is being captured. A red dot and timer, \"Taking notes\" with the account name (tap it to switch accounts without stopping), and a coral Finish button, over three drifting blurred color blobs. " +
      "When a phone call interrupts, the timer pauses, the blobs settle and Finish turns into a disabled \"Paused\" pill. After Finish the bar leaves; processing and \"Note ready\" show as the top pill Toast, with AIReviewOverlay in between for prospects.",
    file: "app/components/capture/CaptureWidget.tsx",
    flutterEquivalent: "CaptureWidget — lib/view/_widget/capture/capture_widget.dart; state machine in capture_view_model.dart (use cases: StartCapture, FinishCapture, SwitchCaptureAccount)",
    tokens: {
      required: [
        { token: "color.brand.coral", role: "left blob" },
        { token: "color.neonindigo.dark / base", role: "right and middle blobs" },
        { token: "color.semantic.error", role: "recording dot" },
        { token: "color.dark.primary", role: "bar surface (82% over the blobs)" },
        { token: "color.text.primary / secondary", role: "timer, title / account name" },
        { token: "color.brand.coral.dark + color.text.on-coral", role: "Finish button" },
        { token: "color.alpha.white.10 + color.text.muted", role: "Paused button" },
        { token: "radius.full", role: "buttons" },
      ],
      forbidden: [
        "Raw hex or rgba for the blobs, dot or Paused button — they are tokens, so they follow the theme like VoiceAtmosphere",
        "Showing processing or ready inside the bar — those are Toast pill states",
        "A switcher that interrupts the recording",
      ],
    },
    props: [{ name: "(none)", type: "—", required: false, description: "Driven by CaptureContext (status, account, canSwitchAccount, isProspect) and FakeCallContext (callStatus). Renders into #phone-overlay-root." }],
    usage: {
      patterns: [{ name: "mounted once", when: "In the mobile layout, so a capture survives navigation", code: `<CaptureWidget />` }],
      antiPatterns: [{ scenario: "Starting a second capture UI on a screen", why: "There is one capture session at a time, owned by CaptureContext", instead: "Call the capture context's start function" }],
    },
    aiHints: {
      priority: "high",
      useWhen: ["Describing or changing the recording bar and its call-interrupted state"],
      neverUseFor: ["Processing or ready states — those are the Toast pill", "Reviewing AI fields — that is AIReviewOverlay"],
      alwaysRemember: [
        "Bar = recording only; the status machine is idle → recording → finalizing → (reviewing) → ready",
        "Account switching keeps the recording running",
        "No design-system area yet: it needs the capture context, so it is documented here and in the handoff comment",
      ],
    },
    changelog: ["2026-11-09: registry entry and handoff comment added. Blob, recording-dot and Paused-button colors moved from raw hex/rgba to tokens (deep blob is now neonindigo.dark, slightly lighter)."],
  },

  // ── ChatHeader ──────────────────────────────────────────────────────────────
  {
    name: "ChatHeader",
    category: "feature",
    type: "navigation",
    description:
      "The row under the chat drawer's handle: Chat history on the left (turns indigo while its menu is open), New chat and Minimize on the right. Three 44px round touch targets with 26px icons, 12px side padding, no divider.",
    file: "app/components/chat/ChatHeader.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "ChatHeader — lib/view/_widget/chat/chat_header.dart",
    tokens: {
      required: [
        { token: "color.text.secondary", role: "icons" },
        { token: "color.neonindigo.base", role: "history icon while its menu is open" },
        { token: "spacing.3", role: "side padding" },
      ],
      forbidden: ["Adding a divider under it", "Smaller than 44px touch targets"],
    },
    props: [
      { name: "historyOpen", type: "boolean", required: false, default: "false", description: "Marks the history button active (indigo, aria-pressed)." },
      { name: "onHistory / onNewChat / onMinimize", type: "() => void", required: false, description: "Button handlers." },
    ],
    usage: {
      patterns: [{ name: "in the chat drawer", when: "Top of the account chat", code: `<ChatHeader historyOpen={menuOpen} onHistory={toggleHistory} onNewChat={newChat} onMinimize={close} />` }],
      antiPatterns: [{ scenario: "Putting a title in the header", why: "The account name is in the empty state and the conversation", instead: "Leave it three buttons" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["The top of the account chat"],
      neverUseFor: ["Other drawers — they use DrawerHeader"],
      alwaysRemember: ["History turns indigo only while its menu is open"],
    },
    changelog: ["2026-11-09: registry entry added (it was documented inside ChatDrawer)."],
  },

  // ── ChatEmptyState ──────────────────────────────────────────────────────────
  {
    name: "ChatEmptyState",
    category: "feature",
    type: "display",
    description:
      "What the chat shows before anything is asked: a greeting (\"Hi, <name>\", 32px indigo) and \"Ask anything about <account>.\" centered in the free space, and a horizontally scrolling row of SuggestionChips below. " +
      "Each chip is about 1/2.4 of the row wide (148 to 176px), so the third is always cut off by the right edge, which is the cue that the row scrolls. SuggestionChip is a dark.secondary rounded card with 17px text that fills the box when tapped.",
    file: "app/components/chat/ChatEmptyState.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "ChatEmptyState — lib/view/_widget/chat/chat_empty_state.dart (Column + horizontal SingleChildScrollView of chips); SuggestionChip is its own widget",
    tokens: {
      required: [
        { token: "color.neonindigo.base", role: "greeting" },
        { token: "color.text.muted", role: "subtitle" },
        { token: "color.text.primary", role: "chip text" },
        { token: "color.dark.secondary", role: "chip fill" },
        { token: "radius.lg", role: "chips" },
        { token: "spacing.2 / 4 / 5 / 8", role: "gaps and padding" },
      ],
      forbidden: ["Chips so narrow that no chip is cut off — the cut-off one signals the scroll"],
    },
    props: [
      { name: "userName", type: "string", required: true, description: "Greeted by name." },
      { name: "accountName", type: "string", required: true, description: "Shown in the subtitle." },
      { name: "suggestions", type: "string[]", required: true, description: "One chip each." },
      { name: "onPick", type: "(s: string) => void", required: false, description: "A chip is tapped; the text is sent as the question." },
    ],
    usage: {
      patterns: [{ name: "new chat", when: "A chat with no turns", code: `<ChatEmptyState userName="Nate" accountName="Acme Co" suggestions={CHAT_SUGGESTIONS} onPick={send} />` }],
      antiPatterns: [{ scenario: "More than about six suggestions", why: "The row becomes a hunt", instead: "Keep it to a handful of useful questions" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["The first screen of an account chat"],
      neverUseFor: ["An empty list elsewhere"],
      alwaysRemember: ["The third chip is cut off on purpose", "Chips send their text as the question"],
    },
    changelog: ["2026-11-09: registry entry added (it was documented inside ChatDrawer)."],
  },

  // ── ChatMessageList ─────────────────────────────────────────────────────────
  {
    name: "ChatMessageList",
    category: "feature",
    type: "display",
    description:
      "The scrolling conversation: 16px side padding, 24px between messages, 16px under the last. It scrolls to the newest message when the list grows, when the thinking row appears, or as a spoken reply is revealed word by word. " +
      "Renders a ChatMessage per turn and a ThinkingRow while an answer is on its way. `scroll` is off in static previews.",
    file: "app/components/chat/ChatMessageList.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "ChatMessageList — lib/view/_widget/chat/chat_message_list.dart (ListView with reverse: true and a ScrollController)",
    tokens: { required: [{ token: "spacing.2 / 4 / 6", role: "padding and the gap between messages" }] },
    props: [
      { name: "turns", type: "ChatTurn[]", required: true, description: "The conversation." },
      { name: "thinking", type: "boolean", required: false, default: "false", description: "Appends the ThinkingRow." },
      { name: "streamingId", type: "string", required: false, description: "The turn being read aloud." },
      { name: "revealedWords", type: "number", required: false, description: "How many words of the streaming turn are highlighted." },
      { name: "scroll", type: "boolean", required: false, default: "true", description: "Auto-scroll to the newest message; false for static previews." },
    ],
    usage: {
      patterns: [{ name: "in the chat drawer", when: "A chat with turns", code: `<ChatMessageList turns={turns} thinking={thinking} streamingId={streamId} revealedWords={words} />` }],
      antiPatterns: [{ scenario: "Rendering ChatMessage rows by hand in a column", why: "The spacing and auto-scroll live here", instead: "Use ChatMessageList" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Showing the turns of an account chat"],
      neverUseFor: ["The empty chat — that is ChatEmptyState"],
      alwaysRemember: ["It scrolls itself to the newest message", "Flutter: a reversed ListView"],
    },
    changelog: ["2026-11-09: registry entry added (it was documented inside ChatDrawer)."],
  },

  // ── SearchField ────────────────────────────────────────────────────────────────
  {
    name: "SearchField",
    category: "ui-primitive",
    type: "interactive",
    description:
      "The one search bar for the whole app (a TextField with a search icon): a search icon, the text field and a clear button once there is text, in three sizes (sm 36, md 44, lg 48). The indigo stroke shows on focus, or always with `active` (searching beyond your own list). `trailing` takes a small tag; `endSlot` a control inside the pill (the sort menu on the companies list). Used on the companies list, the action item lists, the account picker, the chat history menu and the Engagements drawer.",
    file: "app/components/ui/SearchField.tsx",
    designSystemSection: "#search-field",
    flutterEquivalent: "HalosightSearchField — lib/view/_widget/halosight_search_field.dart",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "fill" },
        { token: "color.text.muted", role: "icon" },
        { token: "color.text.primary", role: "text" },
        { token: "color.text.disabled", role: "clear dot" },
        { token: "color.neonindigo.base", role: "active outline and icon" },
        { token: "color.brand.coral", role: "caret" },
        { token: "radius.full", role: "pill" },
      ],
    },
    props: [
      { name: "value / onChange", type: "string / (v) => void", required: true, description: "Controlled text." },
      { name: "placeholder", type: "string", required: false, description: "Also the accessibility label." },
      { name: "size", type: '"sm" | "md" | "lg"', required: false, default: '"md"', description: "36 / 44 / 48 tall." },
      { name: "active", type: "boolean", required: false, description: "Force the indigo stroke (it also shows on focus)." },
      { name: "endSlot", type: "ReactNode", required: false, description: "A control inside the pill after the clear button." },
      { name: "trailing", type: "ReactNode", required: false, description: "A tag before the clear button." },
    ],
    usage: {
      patterns: [{ name: "default", when: "A list's search bar", code: `<SearchField value={q} onChange={setQ} placeholder="Search items…" />` }],
      antiPatterns: [{ scenario: "Hand-built search pill", why: "Three copies had already drifted", instead: "Use <SearchField>" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Searching a list"],
      neverUseFor: ["Free-text form fields"],
      alwaysRemember: ["Clear button appears only with text"],
    },
    changelog: ["2026-11-02: new. Replaces identical hand-built search bars on the tasks and action item screens.", "2026-11-02: sizes sm / md / lg and endSlot; now also the companies list search (with the sort menu inside) and the Engagements drawer search. Indigo stroke on focus everywhere."],
  },

  // ── SectionHeader ────────────────────────────────────────────────────────────────
  {
    name: "SectionHeader",
    category: "ui-primitive",
    type: "display",
    description:
      "The small label above a list section: uppercase label, optional count pill and round add button; `divider` centers the label between two hairlines (e.g. Company-Wide Results).",
    file: "app/components/ui/SectionHeader.tsx",
    designSystemSection: "#section-header",
    flutterEquivalent: "SectionHeader — lib/view/_widget/section_header.dart",
    tokens: {
      required: [
        { token: "color.text.muted", role: "label" },
        { token: "color.text.disabled", role: "count" },
        { token: "color.dark.secondary", role: "count pill" },
        { token: "color.alpha.white-10", role: "divider lines" },
        { token: "color.neonindigo.base", role: "add button" },
        { token: "radius.full", role: "pills" },
      ],
    },
    props: [
      { name: "label", type: "string", required: true, description: "Section name." },
      { name: "count", type: "number", required: false, description: "Count pill." },
      { name: "onAdd / addLabel", type: "() => void / string", required: false, description: "Round add button and its accessibility label." },
      { name: "divider", type: "boolean", required: false, description: "Centered between hairlines." },
    ],
    usage: {
      patterns: [{ name: "default", when: "Home companies list", code: `<SectionHeader label="Your Companies" count={n} onAdd={addLead} addLabel="Add new lead" />` }],
      antiPatterns: [{ scenario: "Inline section labels", why: "Spacing and casing drift", instead: "Use <SectionHeader>" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Heading a list section"],
      neverUseFor: ["Page titles"],
      alwaysRemember: ["Divider variant takes no count"],
    },
    changelog: ["2026-11-02: new. Moved out of the home screen."],
  },

  // ── IconButton ────────────────────────────────────────────────────────────────
  {
    name: "IconButton",
    category: "ui-primitive",
    type: "interactive",
    description:
      "A round button with one icon. Variants: filled (dark-secondary circle), glass (transparent at rest, blurred translucent once `scrolled`; used for the floating back / more buttons) and plain.",
    file: "app/components/ui/IconButton.tsx",
    designSystemSection: "#icon-button",
    flutterEquivalent: "HalosightIconButton — lib/view/_widget/halosight_icon_button.dart",
    tokens: {
      required: [
        { token: "color.dark.secondary", role: "filled circle" },
        { token: "color.alpha.bg-glass", role: "glass circle when scrolled" },
        { token: "color.alpha.white-10", role: "glass inset stroke" },
        { token: "color.text.primary", role: "icon" },
        { token: "radius.full", role: "circle" },
      ],
    },
    props: [
      { name: "icon / label", type: "string / string", required: true, description: "Material icon name and accessibility label." },
      { name: "variant", type: '"filled" | "glass" | "plain"', required: false, description: "Default filled." },
      { name: "size", type: "32 | 36 | 40 | 44", required: false, description: "Default 40." },
      { name: "scrolled", type: "boolean", required: false, description: "Glass only." },
    ],
    usage: {
      patterns: [{ name: "default", when: "Floating header back button", code: `<IconButton icon="arrow_back" label="Go back" variant="glass" size={36} scrolled={hasScrolled} onClick={back} />` }],
      antiPatterns: [{ scenario: "A bare <button> with an icon and a circle", why: "Sizes and press states drift", instead: "Use <IconButton>" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Any single-icon round button"],
      neverUseFor: ["Buttons with labels — use Button"],
      alwaysRemember: ["Glass only shows its background when scrolled"],
    },
    changelog: ["2026-11-02: new. Used by the interaction page's floating buttons and the home profile button."],
  },

  // ── Banner ────────────────────────────────────────────────────────────────
  {
    name: "Banner",
    category: "ui-primitive",
    type: "display",
    description:
      "An inline message card inside a screen. Tones: info (indigo, default) and warning (amber). Icon at the start, message in secondary text.",
    file: "app/components/ui/Banner.tsx",
    designSystemSection: "#banner",
    flutterEquivalent: "HalosightBanner — lib/view/_widget/halosight_banner.dart",
    tokens: {
      required: [
        { token: "color.neonindigo.base", role: "info icon, tint and stroke" },
        { token: "color.warning", role: "warning icon, tint and stroke" },
        { token: "color.text.secondary", role: "message" },
        { token: "radius.md", role: "card" },
      ],
    },
    props: [
      { name: "tone", type: '"info" | "warning"', required: false, description: "Default info." },
      { name: "icon", type: "string", required: false, description: "Defaults per tone." },
      { name: "children", type: "ReactNode", required: true, description: "The message." },
    ],
    usage: {
      patterns: [{ name: "default", when: "Another rep's account", code: `<Banner>You\'re viewing Dana\'s account.</Banner>` }],
      antiPatterns: [{ scenario: "A toast for context that should stay", why: "Toasts disappear", instead: "Use <Banner> inline" }],
    },
    aiHints: {
      priority: "medium",
      useWhen: ["Context the rep should read once"],
      neverUseFor: ["Transient confirmations — use Toast"],
      alwaysRemember: ["Not dismissible yet"],
    },
    changelog: ["2026-11-02: new. Replaces the hand-built banner on other reps' accounts."],
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
    changelog: ["2026-10-28: new. Entry is the AI chat button next to the more-options dots on the account and interaction screens (Ask is no longer a menu item)."],
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
      "Bottom dock for voice mode, replacing ChatInput. Phases: listening (italic “Listening…”, orb halo), thinking (italic transcript), speaking (flat controls). The coloured haze is VoiceAtmosphere, painted behind the whole panel. " +
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

  // ── VoiceAtmosphere ─────────────────────────────────────────────────────────
  {
    name: "VoiceAtmosphere",
    category: "feature",
    type: "display",
    description:
      "The coloured haze behind a voice conversation, painted over the whole chat panel and behind its content. listening: an indigo haze rises from the bottom and follows the sound of the person talking (height and brightness track the mic level; the prototype simulates speech bursts). " +
      "thinking: coral and indigo blobs flow along the bottom edge, sweeping side to side (~200px tall). speaking: a low coral bloom hugging the bottom edge (~150px, breathing on a 3s cycle). Both stay at the bottom, below the reply text; nothing wraps the panel edges. Colours cross-fade between phases; reduced motion holds everything still.",
    file: "app/components/chat/VoiceAtmosphere.tsx",
    designSystemSection: "#account-chat",
    flutterEquivalent: "VoiceAtmosphere — lib/view/_widget/chat/voice_atmosphere.dart (CustomPaint / ShaderMask in a Stack, ignoring pointers; level from the audio input)",
    tokens: {
      required: [
        { token: "color.neonindigo / light / dark", role: "listening haze, edge glow (mixed to transparent)" },
        { token: "color.brand.coral / coral-dark",  role: "thinking flow, speaking bloom (mixed to transparent)" },
      ],
    },
    props: [
      { name: "phase", type: '"listening" | "thinking" | "speaking"', required: true, description: "Which haze to show." },
      { name: "level", type: "MotionValue<number>", required: false, description: "Voice level 0–1; omitted = simulated speech (useSpeechLevel)." },
    ],
    usage: {
      patterns: [{ name: "behind the chat", when: "Voice mode is on", code: `<VoiceAtmosphere phase={phase} />  // first child; wrap the content in a relative z-index 1 container` }],
      antiPatterns: [{ scenario: "Putting the haze inside the dock", why: "It has to span the panel and sit behind the messages", instead: "Render VoiceAtmosphere as a sibling behind the content" }],
    },
    aiHints: {
      priority: "low",
      useWhen: ["Hands-free chat"],
      neverUseFor: ["Visit capture recording — that has its own widget"],
      alwaysRemember: ["Real builds feed `level` from the microphone", "Modelled on the general shape of Claude's voice haze, not a copy"],
    },
    changelog: ["2026-11-02: new. Replaces the dock's drifting blobs: listening follows the voice, thinking flows along the bottom, speaking sits low."],
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
4. Typography classes: headings use .heading-1 through .heading-6 (Roboto Slab).
   Body text uses Tailwind's text-xl/lg/base/sm/xs + .text-*-bold for 600 weight.
   Nav labels use .label-serif. Tiny captions use .text-2xs.
6. Icons: use <Icon name="..." /> for any Material Symbols icon. Use AccountTypeIcon
   for account type. Use MenuIcon for the top nav trigger only.
7. If you add a new component: add it to this registry, add it to the design system
   page, and add it to docs/component-architecture.md.
8. Refer to docs/flutter-handoff.md for Flutter widget equivalents before finalizing any layout.
`;
