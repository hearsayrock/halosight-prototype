"use client";

/**
 * Flutter Handoff — Next Actions Flow
 * Full desktop page, no phone frame.
 *
 * Sections:
 *   Overview     — what this doc is, how to use it
 *   Screens      — every screen, sheet, and drawer in the next-actions flow
 *   Data Models  — TypeScript interfaces → Dart entity classes
 *   Tokens       — colors, radius, spacing
 *   Components   — reusable widget inventory
 */

import { useState, useEffect } from "react";

// ─── Primitives ───────────────────────────────────────────────────────────────

const BASE = process.env.NODE_ENV === "production"
  ? "https://halosight-prototype.vercel.app"
  : "http://localhost:3000";

function protoLink(path: string) {
  return `${BASE}${path}`;
}

// ─── Layout primitives ────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 72 }}>
      <h2 style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-brand-purple)",
        marginBottom: 24,
        paddingBottom: 12,
        borderBottom: "1px solid var(--color-dark-tertiary)",
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--color-text-muted)",
      marginBottom: 4,
    }}>
      {children}
    </p>
  );
}

function Tag({ children, color = "var(--color-dark-tertiary)", textColor = "var(--color-text-muted)" }: {
  children: React.ReactNode;
  color?: string;
  textColor?: string;
}) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 20,
      background: color,
      color: textColor,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function StateLink({ label, path, variant }: { label: string; path: string; variant: "loading" | "error" | "default" }) {
  const colors = {
    loading: { bg: "rgba(139,146,255,0.12)", text: "var(--color-brand-purple)" },
    error:   { bg: "rgba(255,107,90,0.12)",  text: "var(--color-brand-coral)" },
    default: { bg: "var(--color-dark-secondary)", text: "var(--color-text-secondary)" },
  };
  const c = colors[variant];
  return (
    <a
      href={protoLink(path)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
        background: c.bg,
        color: c.text,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "opacity 0.12s",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      {label} ↗
    </a>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre style={{
      background: "var(--color-dark-base)",
      borderRadius: 10,
      padding: "16px 20px",
      overflow: "auto",
      fontSize: 12,
      lineHeight: 1.7,
      color: "var(--color-text-secondary)",
      fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
      border: "1px solid var(--color-dark-tertiary)",
      margin: 0,
    }}>
      <code>{children}</code>
    </pre>
  );
}

// ─── Screens section ──────────────────────────────────────────────────────────

type ScreenType = "screen" | "sheet" | "drawer" | "modal";

interface ScreenSpec {
  name: string;
  type: ScreenType;
  route: string;
  flutterFile: string;
  description: string;
  states: { label: string; path: string; variant: "loading" | "error" | "default" }[];
  interactions: string[];
  notes?: string;
}

const TYPE_BADGE: Record<ScreenType, { label: string; bg: string; color: string }> = {
  screen:  { label: "Screen",  bg: "rgba(139,146,255,0.12)", color: "var(--color-brand-purple)" },
  sheet:   { label: "Sheet",   bg: "rgba(46,204,113,0.12)",  color: "#2ECC71" },
  drawer:  { label: "Drawer",  bg: "rgba(245,166,35,0.12)",  color: "#F5A623" },
  modal:   { label: "Modal",   bg: "rgba(255,107,90,0.12)",  color: "var(--color-brand-coral)" },
};

const SCREENS: ScreenSpec[] = [
  {
    name: "Home / Priority Hub",
    type: "screen",
    route: "/accounts",
    flutterFile: "accounts_page.dart",
    description: "The main daily hub. Three content sections: a suggested visit card (AI-curated, with a 'Log a Visit' CTA), a compact accounts list (top 4 scored by recency + open tasks + proximity), and an action items strip showing the top 4 open items. 'View all' next to Action Items transitions to the priorities mode of this same page. Hamburger top-left opens the Engagements drawer.",
    states: [
      { label: "Home view", path: "/accounts", variant: "default" },
    ],
    interactions: [
      "Checking a task circle in the action items strip starts a pending completion — the circle fills green with a spring animation (stiffness 500, damping 28), CompletionToast appears, and the item exits after 8s",
      "Undo in the CompletionToast reverts the fill and stops the timer",
      "'Add a note' in the CompletionToast opens NoteSheet before committing the completion",
      "'View all' beside Action Items animates to priorities mode (shared page state, no route change)",
      "Hamburger icon opens the Engagements drawer from the left",
      "Tapping a task row navigates to Action Item Detail with ?from=account",
      "Tapping the link icon on a task row navigates to the originating Activity Detail",
    ],
  },
  {
    name: "All Action Items (priorities mode)",
    type: "screen",
    route: "/accounts?mode=priorities",
    flutterFile: "accounts_page.dart",
    description: "Full-page action items list. Animated transition within the same page — no new route pushed. Items are grouped by date bucket when sorted by due date: Overdue → Today → Tomorrow → per-date labels (e.g. 'Mon, Jun 20'). When sorted by account, groups by account name alphabetically. Filterable open/done. Live search across title and account name.",
    states: [
      { label: "Due date sort", path: "/accounts?mode=priorities", variant: "default" },
    ],
    interactions: [
      "Checking a task circle shows the same CompletionToast + NoteSheet flow as the home strip",
      "Filter pill (Open/Done) swaps the item set with an AnimatePresence transition",
      "Sort pill (Due Date/Account) re-groups all items immediately",
      "Search filters by title and account name in real time",
      "Back arrow animates back to the home view",
      "Tapping a row navigates to Action Item Detail",
      "Link icon navigates to the originating Activity Detail",
    ],
    notes: "This is a mode of accounts_page.dart, not a separate Dart file. Manage as a PageMode enum: home | accounts | priorities.",
  },
  {
    name: "Account Detail",
    type: "screen",
    route: "/accounts/[id]",
    flutterFile: "account_detail_page.dart",
    description: "Two-tab view (Overview / Activity) for a single account. The Overview tab shows action items for this account — each row has a completion circle, title, due date, and chevron to the detail page. A '+' button opens AddActionItemSheet. When an item is checked off here, CompletionToast appears over the bottom nav.",
    states: [
      { label: "With action items", path: "/accounts/jacks-tire-elko", variant: "default" },
      { label: "No data", path: "/accounts/profleet-glendale-1", variant: "default" },
      { label: "Loading", path: "/accounts/jacks-tire-elko?preview=loading", variant: "loading" },
      { label: "Error", path: "/accounts/jacks-tire-elko?preview=error", variant: "error" },
    ],
    interactions: [
      "Completion circle tap → pending state (green fill) → CompletionToast at bottom (above nav, bottom=106px)",
      "CompletionToast 'Add a note' → NoteSheet before committing",
      "When landing with ?just_completed=itemId in the URL, the page auto-triggers completion for that item and cleans the URL via router.replace()",
      "Action item row tap navigates to /accounts/[id]/action-items/[itemId]?from=account",
      "'Add action item' '+' icon → AddActionItemSheet bottom sheet",
    ],
  },
  {
    name: "Activity Detail",
    type: "screen",
    route: "/accounts/[id]/activity/[activityId]",
    flutterFile: "activity_detail_page.dart",
    description: "AI-generated summary of a single field visit. Below the summary card is an Action Items section showing items linked to this activity. Completion works the same as Account Detail. The account name in the header is tappable to open AccountPickerSheet (reassign activity to a different account).",
    states: [
      { label: "With AI summary", path: "/accounts/jacks-tire-elko/activity/ja-1", variant: "default" },
      { label: "With action items", path: "/accounts/walmart-corp/activity/wm-1", variant: "default" },
    ],
    interactions: [
      "Completion circle tap → pending state → CompletionToast (bottom=106px, above nav)",
      "Landing with ?just_completed=itemId triggers the same auto-completion + URL cleanup as Account Detail",
      "Action item row tap navigates to /accounts/[id]/action-items/[itemId]?from=activity&activityId=[activityId]",
      "'+' button opens AddActionItemSheet when action items exist; empty state CTA opens it when list is empty",
      "Account name tap → AccountPickerSheet to reassign the activity to a different account",
    ],
    notes: "The ?from=activity&activityId param on the action item Link is what tells Action Item Detail which page to return to when 'Mark as Complete' is tapped.",
  },
  {
    name: "Action Item Detail",
    type: "screen",
    route: "/accounts/[id]/action-items/[itemId]",
    flutterFile: "action_item_detail_page.dart",
    description: "Two modes controlled by a single isEditing boolean. Read-only mode (default): large serif title, metadata pill chips (account link, originating visit link, due date), optional 'Why this was created' description paragraph, and a teal 'Mark as Complete' CTA fixed at the bottom. Edit mode: same route, editable textarea title, status picker (Open / Done / Canceled), MiniCalendar date picker, and a Delete button with a confirmation modal.",
    states: [
      { label: "Read-only", path: "/accounts/jacks-tire-elko/action-items/ja-t1", variant: "default" },
      { label: "From activity", path: "/accounts/jacks-tire-elko/action-items/ja-t1?from=activity&activityId=ja-1", variant: "default" },
    ],
    interactions: [
      "Read-only back arrow → router.push('/accounts/[id]') always (not router.back())",
      "'Mark as Complete' → does NOT call updateItem here; instead navigates back to origin with ?just_completed=[itemId] appended so the parent page handles the completion state and shows the toast",
      "Origin is determined by ?from= and ?activityId= params passed in when navigating here",
      "'Edit' button top-right → sets isEditing=true, same URL",
      "Edit mode: title autosaves on 800ms debounce while typing; 'Saved' indicator appears briefly",
      "Edit mode back arrow / 'Done' button → flushes pending debounce immediately, sets isEditing=false",
      "Delete → shows inline confirmation modal (not a sheet); confirmed → deleteItem() → router.push('/accounts/[id]')",
      "Status picker: 3-segment control (Open / Done / Canceled) with colored dot indicators",
    ],
    notes: "The ?from=account and ?from=activity routing pattern is how the page knows where to send the user back after completion. Always pass these when navigating to this page.",
  },
  {
    name: "Engagements Drawer",
    type: "drawer",
    route: "/accounts (hamburger icon)",
    flutterFile: "engagements_drawer.dart",
    description: "Slides in from the left over the home view. Lists recently logged activities grouped into Today and Previous. Each row shows the account name and a purple dot indicator. Tapping a row navigates to that Activity Detail and closes the drawer. A scrim covers the rest of the page; tapping it closes the drawer.",
    states: [
      { label: "Open drawer", path: "/accounts", variant: "default" },
    ],
    interactions: [
      "Hamburger icon tap → drawer slides in from left (x: -100% → 0, duration 0.28s, ease [0.32, 0, 0.18, 1])",
      "Scrim tap → drawer slides back out",
      "Row tap → navigates to /accounts/[id]/activity/[activityId] and closes drawer",
      "Portals into #phone-overlay-root so it layers above all page content",
    ],
  },
  {
    name: "Completion Toast",
    type: "sheet",
    route: "(overlay — appears on home, priorities, account detail, activity detail)",
    flutterFile: "completion_toast.dart",
    description: "Slide-up confirmation toast that appears whenever an action item is checked off. Shows a green checkmark, 'Item complete' label, a purple 'Undo' link, a coral 'Add a note' link, and an × dismiss. Auto-commits the completion after 8 seconds if not interacted with. Portals above the phone chrome.",
    states: [
      { label: "Home view", path: "/accounts", variant: "default" },
    ],
    interactions: [
      "Appears with a spring slide-up (stiffness 400, damping 30)",
      "'Undo' clears the timer and reverts the item to open — completion circle empties",
      "'Add a note' pauses the timer and opens NoteSheet",
      "× dismiss immediately commits the completion without waiting for the timer",
      "bottom prop controls Y position: 24px on full-screen pages, 106px on pages with bottom nav",
    ],
  },
  {
    name: "Note Sheet",
    type: "sheet",
    route: "(overlay — triggered from Completion Toast)",
    flutterFile: "note_bottom_sheet.dart",
    description: "Bottom sheet that appears after tapping 'Add a note' in the Completion Toast. A single multiline text field for entering a completion note. 'Done' commits the completion with the note attached to the action item. The timer is paused while this sheet is open.",
    states: [
      { label: "From home strip", path: "/accounts", variant: "default" },
    ],
    interactions: [
      "Slides up from bottom, soft scrim behind",
      "'Done' button → commitCompletion(itemId, accountId, note) → sheet closes, toast disappears",
      "If the note field is empty, the item is completed without a note (no empty string stored)",
      "NoteSheet visible=true suppresses the CompletionToast so both don't show at once",
    ],
  },
  {
    name: "Add Action Item Sheet",
    type: "sheet",
    route: "(overlay — triggered from Account Detail and Activity Detail)",
    flutterFile: "add_action_item_bottom_sheet.dart",
    description: "Bottom sheet for creating a new action item linked to a specific account. Contains a text input for the title and a horizontal date picker strip. Date tiles show day abbreviation, date number, and month. Submitting adds the item to ActionItemsContext immediately (optimistic). The new item appears in the list on the parent screen.",
    states: [
      { label: "From account detail", path: "/accounts/jacks-tire-elko", variant: "default" },
      { label: "From activity detail", path: "/accounts/jacks-tire-elko/activity/ja-1", variant: "default" },
    ],
    interactions: [
      "Slides up from bottom over the current screen",
      "Text field is auto-focused on mount",
      "Date strip scrolls horizontally — today is pre-selected",
      "Submit → calls addItem(accountId, { title, dueDate }) → onClose() → parent list updates",
      "Tapping outside or the scrim closes without saving",
    ],
  },
];

function ScreenCard({ screen }: { screen: ScreenSpec }) {
  const badge = TYPE_BADGE[screen.type];
  return (
    <div style={{
      background: "var(--color-dark-primary)",
      border: "1px solid var(--color-dark-tertiary)",
      borderRadius: 12,
      padding: "20px 24px",
      marginBottom: 16,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              {screen.name}
            </h3>
            <Tag color={badge.bg} textColor={badge.color}>{badge.label}</Tag>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <code style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "ui-monospace, monospace" }}>
              {screen.route}
            </code>
            <span style={{ color: "var(--color-dark-tertiary)" }}>·</span>
            <code style={{ fontSize: 12, color: "var(--color-brand-purple)", fontFamily: "ui-monospace, monospace" }}>
              {screen.flutterFile}
            </code>
          </div>
        </div>

        {/* State links */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0 }}>
          {screen.states.map(s => (
            <StateLink key={s.path} label={s.label} path={s.path} variant={s.variant} />
          ))}
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
        {screen.description}
      </p>

      {/* Interactions */}
      <div style={{ marginBottom: screen.notes ? 14 : 0 }}>
        <Eyebrow>Interactions</Eyebrow>
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {screen.interactions.map((note, i) => (
            <li key={i} style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Notes */}
      {screen.notes && (
        <div style={{
          marginTop: 4,
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(139,146,255,0.07)",
          border: "1px solid rgba(139,146,255,0.2)",
        }}>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55, margin: 0 }}>
            <strong style={{ color: "var(--color-text-secondary)" }}>Note: </strong>{screen.notes}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Data models section ──────────────────────────────────────────────────────

const MODELS: { name: string; dartClass: string; note: string; code: string }[] = [
  {
    name: "ActionItem",
    dartClass: "ActionItem",
    note: "Core next-actions entity. dueDate is nullable — displayed as 'Due Today'. originActivity and originActivityId link back to the visit that generated this item. note is attached when completing via the NoteSheet.",
    code: `interface ActionItem {
  id: string;
  accountId: string;
  title: string;
  dueDate: Date | null;            // null = due today
  status: "open" | "done" | "canceled";
  description?: string;            // AI-generated 'why this was created' text
  originActivity?: string;         // display label for the source visit (e.g. "Quarterly Review")
  originActivityId?: string;       // links to /accounts/[id]/activity/[activityId]
  note?: string;                   // rep note added at completion time
}`,
  },
  {
    name: "Account",
    dartClass: "Account",
    note: "Core account entity. taskCount drives the open items badge on the accounts list and the priority scoring that surfaces accounts in the suggested visit card.",
    code: `interface Account {
  id: string;
  name: string;
  type: "corporate" | "branch" | "standalone";
  crmAccountType?: "sold-to" | "shipped-to" | "distributor" | "prospect";
  taskCount?: number;          // open action items for this account
  city?: string;
  state?: string;
  distanceMiles: number;
  lastVisited: Date;
  childCount?: number;         // corporate accounts only
  parentId?: string;           // branch accounts only
  contactName?: string;
  contactTitle?: string;
  phone?: string;
  address?: string;
  crmId?: string;
  healthScore?: number;        // 0–100
  annualRevenue?: number;
}`,
  },
  {
    name: "ActivityItem",
    dartClass: "ActivityItem",
    note: "A logged visit, call, or interaction. Action items can reference an ActivityItem as their origin. aiSummary is optional — only populated when a transcript was captured.",
    code: `interface ActivityItem {
  id: string;
  accountId: string;
  date: Date;
  type: "visit" | "call" | "email" | "task";
  title: string;               // AI-generated one-line summary of what was discussed
  summary: string;
  durationMinutes?: number;
  hasTranscript: boolean;
  repName: string;
  aiSummary?: {
    title: string;             // AI headline
    tldr: string;              // short paragraph
    keyPoints: string[];       // support **bold** markdown — parse inline
  };
}`,
  },
];

function ModelCard({ model }: { model: typeof MODELS[0] }) {
  return (
    <div style={{
      marginBottom: 24,
      background: "var(--color-dark-primary)",
      border: "1px solid var(--color-dark-tertiary)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--color-dark-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
            {model.name}
          </h3>
          <Tag color="rgba(139,146,255,0.12)" textColor="var(--color-brand-purple)">
            {model.dartClass}.dart
          </Tag>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55, margin: 0 }}>
          {model.note}
        </p>
      </div>
      <div>
        <Code>{model.code}</Code>
      </div>
    </div>
  );
}

// ─── Tokens section ───────────────────────────────────────────────────────────

const COLOR_GROUPS: { label: string; tokens: { name: string; value: string; usage: string }[] }[] = [
  {
    label: "Surfaces",
    tokens: [
      { name: "--color-background",    value: "#111420", usage: "Page / app chrome background" },
      { name: "--color-dark-primary",  value: "#1A1D29", usage: "Card backgrounds, sheet backgrounds" },
      { name: "--color-dark-secondary",value: "#252A36", usage: "Input fields, pressed states, list items" },
      { name: "--color-dark-tertiary", value: "#3D4451", usage: "Dividers, borders, inactive chips" },
    ],
  },
  {
    label: "Text",
    tokens: [
      { name: "--color-text-primary",   value: "#F7F8FF", usage: "Headings, primary content" },
      { name: "--color-text-secondary", value: "#C3CAD8", usage: "Body text, supporting labels" },
      { name: "--color-text-muted",     value: "#8B94A8", usage: "Metadata, timestamps, captions (4.5:1 contrast)" },
      { name: "--color-text-disabled",  value: "#5D667A", usage: "Placeholders only — fails WCAG AA, never use for readable text" },
    ],
  },
  {
    label: "Brand — Purple (primary)",
    tokens: [
      { name: "--color-brand-purple-light", value: "#B3B8FF", usage: "Active text on dark tinted backgrounds" },
      { name: "--color-brand-purple",       value: "#8B92FF", usage: "Primary interactive elements, icons, active states" },
      { name: "--color-brand-purple-dark",  value: "#6B72E8", usage: "Pressed state for purple elements" },
    ],
  },
  {
    label: "Brand — Coral (action / alert)",
    tokens: [
      { name: "--color-brand-coral-light", value: "#FF8F82", usage: "Task count badges" },
      { name: "--color-brand-coral",       value: "#FF6B5A", usage: "Log a Visit CTA, overdue due dates, destructive actions" },
    ],
  },
  {
    label: "Brand — Teal (completion)",
    tokens: [
      { name: "--color-brand-teal", value: "#00BFA5", usage: "'Mark as Complete' CTA on Action Item Detail" },
    ],
  },
  {
    label: "Semantic",
    tokens: [
      { name: "--color-success", value: "#2ECC71", usage: "Completion checkmark fill, 'Done' badge, 'Saved' indicator" },
      { name: "--color-warning", value: "#F5A623", usage: "Due-soon warnings" },
      { name: "--color-error",   value: "#FF4D4F", usage: "Error states, destructive confirmations" },
    ],
  },
];

function Swatch({ token }: { token: { name: string; value: string; usage: string } }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "10px 0",
      borderBottom: "1px solid var(--color-dark-tertiary)",
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: token.value,
        flexShrink: 0,
        border: "1px solid rgba(255,255,255,0.08)",
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <code style={{ fontSize: 12, color: "var(--color-brand-purple)", fontFamily: "ui-monospace, monospace" }}>
            {token.name}
          </code>
          <code style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "ui-monospace, monospace" }}>
            {token.value}
          </code>
        </div>
        <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "2px 0 0", lineHeight: 1.4 }}>
          {token.usage}
        </p>
      </div>
    </div>
  );
}

const RADIUS_TOKENS = [
  { name: "--radius-xs",   value: "4px",   usage: "Tags, small chips" },
  { name: "--radius-sm",   value: "8px",   usage: "Buttons, input fields" },
  { name: "--radius-md",   value: "12px",  usage: "Cards, list items" },
  { name: "--radius-lg",   value: "16px",  usage: "Bottom sheets, large cards" },
  { name: "--radius-xl",   value: "28px",  usage: "FABs, large action cards" },
  { name: "--radius-full", value: "100px", usage: "Pills, avatar circles, filter chips, completion circles" },
];

// ─── Components section ───────────────────────────────────────────────────────

const COMPONENTS: {
  name: string;
  file: string;
  flutterWidget: string;
  description: string;
  props?: string;
}[] = [
  {
    name: "ActionItemCard",
    file: "components/accounts/ActionItemCard.tsx",
    flutterWidget: "action_item_card.dart",
    description: "Tappable card for a single action item. Left: completion circle (button — tapping fills green with spring animation and calls onComplete). Center: title (semibold), due date with calendar icon (coral if today/overdue, disabled if future), account name with person icon. Right: chevron. Used in Account Detail and Activity Detail.",
    props: "item: ActionItem, onComplete?: () => void, pending?: boolean",
  },
  {
    name: "CompletionToast",
    file: "components/ui/CompletionToast.tsx",
    flutterWidget: "SnackBar (custom styled)",
    description: "Slide-up toast confirming an action item was marked complete. Contains: green checkmark circle, 'Item complete' text, purple 'Undo' link, coral 'Add a note' link, and × dismiss. Portals into #phone-overlay-root. Auto-commits after 8 seconds.",
    props: "visible: boolean, bottom?: number, onUndo: () => void, onDismiss: () => void, onAddNote?: () => void",
  },
  {
    name: "NoteSheet",
    file: "components/ui/NoteSheet.tsx",
    flutterWidget: "ModalBottomSheet with TextField",
    description: "Bottom sheet for adding a completion note. Single multiline TextField, 'Done' button. Appears after tapping 'Add a note' in the CompletionToast. The timer that auto-commits the completion is paused while this is open.",
    props: "visible: boolean, onDone: (note: string) => void",
  },
  {
    name: "AddActionItemSheet",
    file: "components/accounts/AddActionItemSheet.tsx",
    flutterWidget: "add_action_item_bottom_sheet.dart",
    description: "Bottom sheet for creating a new action item. Title text input (auto-focused) + horizontal date picker strip. Date tiles show weekday abbreviation, date number, and month. Today is pre-selected. Submitting calls addItem() in ActionItemsContext.",
    props: "accountId: string, onClose: () => void",
  },
  {
    name: "MiniCalendar",
    file: "components/accounts/MiniCalendar.tsx",
    flutterWidget: "TableCalendar or custom CalendarWidget",
    description: "Full month calendar grid used in Action Item Detail edit mode. Supports single-date selection. Selected date shown with brand-purple fill. Used only in the edit mode of the action item detail page.",
    props: "selected: Date | null, onSelect: (date: Date | null) => void",
  },
  {
    name: "FilterDropdown",
    file: "components/ui/FilterDropdown.tsx",
    flutterWidget: "PopupMenuButton styled as pill",
    description: "Pill-shaped dropdown for single-select filtering or sorting. Used in the priorities view header for Open/Done and Due Date/Account. Dropdown appears below the pill with a spring scale animation (stiffness 380, damping 22).",
    props: "options: { value, label }[], value: T, onChange: (v: T) => void",
  },
  {
    name: "AccountListItem",
    file: "components/accounts/AccountListItem.tsx",
    flutterWidget: "accounts_view_account_list_item.dart",
    description: "Tappable row in the full accounts list (accounts mode). Left: account name, distance/city meta. Right: CRM type badge, open task count chip (coral), assignee initial circle. Divider on all rows except the last.",
    props: "account: Account, isLast?: boolean",
  },
  {
    name: "Skeleton / Bone",
    file: "components/ui/Skeleton.tsx",
    flutterWidget: "shimmer package — Shimmer.fromColors",
    description: "Shimmer loading placeholder. Bone is the base primitive. AccountListSkeleton and AccountDetailSkeleton compose bones into full-screen shimmer layouts that match the real content dimensions.",
    props: "Bone: width?, height?, radius? | AccountListSkeleton: rows? | AccountDetailSkeleton: none",
  },
  {
    name: "ErrorState",
    file: "components/ui/ErrorState.tsx",
    flutterWidget: "Centered Column (Icon + Text + TextButton)",
    description: "Full-area error state with triangle warning icon, title, message, and optional retry button. Wire onRetry to re-trigger the ViewModel fetch.",
    props: "title?: string, message?: string, onRetry?: () => void",
  },
];

function ComponentRow({ comp }: { comp: typeof COMPONENTS[0] }) {
  return (
    <div style={{
      padding: "16px 0",
      borderBottom: "1px solid var(--color-dark-tertiary)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
          {comp.name}
        </h3>
        <code style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "ui-monospace, monospace" }}>
          {comp.file}
        </code>
        <Tag color="rgba(139,146,255,0.12)" textColor="var(--color-brand-purple)">
          {comp.flutterWidget}
        </Tag>
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 (comp.props ? 6px : 0)" }}>
        {comp.description}
      </p>
      {comp.props && (
        <p style={{ fontSize: 11, margin: "6px 0 0" }}>
          <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Props: </span>
          <code style={{ color: "var(--color-text-muted)", fontFamily: "ui-monospace, monospace" }}>{comp.props}</code>
        </p>
      )}
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview",    label: "Overview" },
  { id: "screens",     label: "Screens & Sheets" },
  { id: "models",      label: "Data Models" },
  { id: "tokens",      label: "Design Tokens" },
  { id: "components",  label: "Components" },
];

function SidebarNav({ active }: { active: string }) {
  return (
    <nav style={{
      position: "sticky",
      top: 48,
      width: 180,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}>
      <p style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-text-muted)",
        marginBottom: 8,
        paddingLeft: 12,
      }}>
        Sections
      </p>
      {NAV_ITEMS.map(item => (
        <a
          key={item.id}
          href={`#${item.id}`}
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: active === item.id ? 600 : 400,
            color: active === item.id ? "var(--color-text-primary)" : "var(--color-text-muted)",
            background: active === item.id ? "var(--color-dark-secondary)" : "transparent",
            borderLeft: `3px solid ${active === item.id ? "var(--color-brand-purple)" : "transparent"}`,
            padding: "6px 12px",
            borderRadius: "0 8px 8px 0",
            textDecoration: "none",
            transition: "all 0.1s",
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const screenCount = SCREENS.filter(s => s.type === "screen").length;
const sheetCount  = SCREENS.filter(s => s.type !== "screen").length;

export default function HandoffPage() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-background)",
      color: "var(--color-text-primary)",
      fontFamily: "Barlow, system-ui, sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--color-dark-primary)",
        borderBottom: "1px solid var(--color-dark-tertiary)",
        padding: "0 40px",
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
            Halosight
          </span>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>Flutter Handoff</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Tag>Next Actions flow</Tag>
          <a
            href={protoLink("/accounts")}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-brand-purple)",
              textDecoration: "none",
              padding: "4px 12px",
              background: "rgba(139,146,255,0.1)",
              borderRadius: 20,
            }}
          >
            Open prototype ↗
          </a>
        </div>
      </div>

      {/* Body */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "48px 40px",
        display: "flex",
        gap: 56,
        alignItems: "flex-start",
      }}>

        {/* Sidebar */}
        <SidebarNav active={activeSection} />

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Overview ─────────────────────────────────────────────────── */}
          <Section id="overview" title="Overview">
            <div style={{
              background: "var(--color-dark-primary)",
              border: "1px solid var(--color-dark-tertiary)",
              borderRadius: 12,
              padding: "24px 28px",
              marginBottom: 24,
            }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 8px" }}>
                Flutter Handoff — Next Actions Flow
              </h1>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, margin: "0 0 20px" }}>
                This is the living spec for the Halosight Next Actions flow — the set of screens, sheets,
                and drawers a rep uses to view, complete, and manage action items across all their accounts.
                Every entry links directly into the running prototype. Open a screen link to see the interaction,
                then reference the spec below for exact animation values, token names, routing params, and
                Flutter widget equivalents.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href={protoLink("/accounts")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)",
                    background: "var(--color-brand-purple)", textDecoration: "none",
                    padding: "8px 18px", borderRadius: 20,
                  }}
                >
                  Open prototype ↗
                </a>
                <a
                  href={protoLink("/accounts?mode=priorities")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)",
                    background: "var(--color-dark-secondary)", textDecoration: "none",
                    padding: "8px 18px", borderRadius: 20,
                    border: "1px solid var(--color-dark-tertiary)",
                  }}
                >
                  All action items ↗
                </a>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Screens",    value: String(screenCount),       note: "full pages" },
                { label: "Sheets",     value: String(sheetCount),        note: "drawers & modals" },
                { label: "Components", value: String(COMPONENTS.length), note: "reusable widgets" },
                { label: "Tokens",     value: String(COLOR_GROUPS.reduce((n, g) => n + g.tokens.length, 0)), note: "color tokens" },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: "var(--color-dark-primary)",
                  border: "1px solid var(--color-dark-tertiary)",
                  borderRadius: 10,
                  padding: "16px 20px",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: "var(--color-brand-purple)", margin: "0 0 2px" }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0 }}>
                    {stat.label}
                    <br /><span style={{ fontSize: 11 }}>{stat.note}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Routing note */}
            <div style={{
              padding: "14px 18px",
              borderRadius: 10,
              background: "rgba(139,146,255,0.06)",
              border: "1px solid rgba(139,146,255,0.18)",
            }}>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "var(--color-text-primary)" }}>Completion routing pattern: </strong>
                When a rep taps "Mark as Complete" on the Action Item Detail page, the page does NOT commit the completion itself.
                Instead it navigates back to the originating screen with <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 11 }}>?just_completed=[itemId]</code> in the URL.
                The parent screen reads this param on mount, triggers the completion state (pending circle + CompletionToast), then cleans the URL via <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 11 }}>router.replace()</code>.
                This ensures the toast always appears on the list screen the rep came from, not a dead-end detail page.
              </p>
            </div>
          </Section>

          {/* ── Screens & Sheets ──────────────────────────────────────────── */}
          <Section id="screens" title="Screens & Sheets">
            {/* Legend */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {(Object.entries(TYPE_BADGE) as [ScreenType, typeof TYPE_BADGE[ScreenType]][]).map(([, b]) => (
                <Tag key={b.label} color={b.bg} textColor={b.color}>{b.label}</Tag>
              ))}
            </div>
            {SCREENS.map(screen => (
              <ScreenCard key={screen.name} screen={screen} />
            ))}
          </Section>

          {/* ── Data Models ──────────────────────────────────────────────── */}
          <Section id="models" title="Data Models">
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              These TypeScript interfaces map directly to Dart entity classes in <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>lib/entity/</code>.
              Each <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>Date</code> field becomes <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>DateTime</code>.
              Optional fields become nullable types.
            </p>
            {MODELS.map(model => (
              <ModelCard key={model.name} model={model} />
            ))}
          </Section>

          {/* ── Tokens ───────────────────────────────────────────────────── */}
          <Section id="tokens" title="Design Tokens">
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              All tokens are defined in <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>globals.css</code>.
              In Flutter, define these in an <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>AppTheme</code> class and reference via <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>Theme.of(context)</code>.
            </p>

            {COLOR_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 32 }}>
                <Eyebrow>{group.label}</Eyebrow>
                <div style={{
                  background: "var(--color-dark-primary)",
                  border: "1px solid var(--color-dark-tertiary)",
                  borderRadius: 10,
                  padding: "0 16px",
                  overflow: "hidden",
                }}>
                  {group.tokens.map((token, i) => (
                    <div key={token.name} style={{ borderBottom: i < group.tokens.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                      <Swatch token={token} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Border radius */}
            <div style={{ marginBottom: 32 }}>
              <Eyebrow>Border Radius</Eyebrow>
              <div style={{
                background: "var(--color-dark-primary)",
                border: "1px solid var(--color-dark-tertiary)",
                borderRadius: 10,
                padding: "16px 20px",
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
              }}>
                {RADIUS_TOKENS.map(r => (
                  <div key={r.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 80 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      background: "var(--color-dark-secondary)",
                      borderRadius: r.value,
                      border: "1px solid var(--color-dark-tertiary)",
                    }} />
                    <div style={{ textAlign: "center" }}>
                      <code style={{ fontSize: 10, color: "var(--color-brand-purple)", display: "block", fontFamily: "ui-monospace, monospace" }}>
                        {r.name.replace("--radius-", "")}
                      </code>
                      <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{r.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Components ───────────────────────────────────────────────── */}
          <Section id="components" title="Components">
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 8 }}>
              Reusable widgets in the next-actions flow. Each has a source file path and the recommended Flutter widget equivalent.
            </p>
            <div style={{
              background: "var(--color-dark-primary)",
              border: "1px solid var(--color-dark-tertiary)",
              borderRadius: 10,
              padding: "0 20px",
            }}>
              {COMPONENTS.map((comp, i) => (
                <div key={comp.name} style={{ borderBottom: i < COMPONENTS.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                  <ComponentRow comp={comp} />
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
