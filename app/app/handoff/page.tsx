"use client";

/**
 * Flutter Handoff — living spec for the Halosight accounts flow.
 * Full desktop page, no phone frame.
 *
 * Sections:
 *   Overview     — what this doc is, how to use it
 *   Screens      — every route with deep-links, Flutter filename, states, interaction notes
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
        color: "var(--md-sys-color-neonindigo)",
        marginBottom: 24,
        paddingBottom: 12,
        borderBottom: "1px solid var(--md-sys-color-dark-tertiary)",
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
      color: "var(--md-sys-color-text-muted)",
      marginBottom: 4,
    }}>
      {children}
    </p>
  );
}

function Tag({ children, color = "var(--md-sys-color-dark-tertiary)", textColor = "var(--md-sys-color-text-muted)" }: {
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
    loading: { bg: "rgba(139,146,255,0.12)", text: "var(--md-sys-color-neonindigo)" },
    error:   { bg: "rgba(255,107,90,0.12)",  text: "var(--md-sys-color-brand-coral)" },
    default: { bg: "var(--md-sys-color-dark-secondary)", text: "var(--md-sys-color-text-secondary)" },
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

function Code({ children, language = "typescript" }: { children: string; language?: string }) {
  return (
    <pre style={{
      background: "var(--md-sys-color-dark-base)",
      borderRadius: 10,
      padding: "16px 20px",
      overflow: "auto",
      fontSize: 12,
      lineHeight: 1.7,
      color: "var(--md-sys-color-text-secondary)",
      fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
      border: "1px solid var(--md-sys-color-dark-tertiary)",
      margin: 0,
    }}>
      <code>{children}</code>
    </pre>
  );
}

// ─── Screens section ──────────────────────────────────────────────────────────

interface ScreenSpec {
  name: string;
  route: string;
  flutterFile: string;
  description: string;
  states: { label: string; path: string; variant: "loading" | "error" | "default" }[];
  interactions: string[];
  notes?: string;
}

const SCREENS: ScreenSpec[] = [
  {
    name: "Home",
    route: "/home",
    flutterFile: "home_page.dart",
    description: "Dashboard showing the rep's daily priorities: upcoming tasks, AI-curated account insights, and the capture button.",
    states: [
      { label: "Default", path: "/home", variant: "default" },
    ],
    interactions: [
      "Tapping a task circle triggers a fill animation (spring, stiffness 500), toast appears, then item exits with AnimatePresence after 5s",
      "Completed task is replaced by the next-highest priority task — list always shows 3",
      "Upcoming section hides entirely when all tasks are cleared",
      "Slide transitions: left/right based on tab depth (PageTransition component)",
    ],
  },
  {
    name: "Accounts List",
    route: "/accounts",
    flutterFile: "accounts_page.dart",
    description: "Searchable, sortable list of all accounts assigned to the rep. Search filters on name, city, and state in real time.",
    states: [
      { label: "Default", path: "/accounts", variant: "default" },
      { label: "Loading", path: "/accounts?preview=loading", variant: "loading" },
      { label: "Error", path: "/accounts?preview=error", variant: "error" },
    ],
    interactions: [
      "Search filters the list in real time (client-side; wire to debounced API in Flutter)",
      "Sort menu: alphabetical, distance, last visited, company — opens as bottom sheet in Flutter",
      "Pull-to-refresh: wrap ListView in RefreshIndicator, re-call ViewModel.loadAccounts()",
      "Tapping a row pushes AccountDetailPage",
    ],
    notes: "Loading skeleton: 6 AccountListItem-shaped shimmer rows. Error card has a Try Again button that re-triggers the fetch.",
  },
  {
    name: "Account Detail",
    route: "/accounts/[id]",
    flutterFile: "account_detail_page.dart",
    description: "Two-tab view (Overview / Activity) for a single account. Overview shows AI-generated last-visit summary, ideas, and action items. Activity lists recorded interactions.",
    states: [
      { label: "With data", path: "/accounts/jacks-tire-elko", variant: "default" },
      { label: "No overview", path: "/accounts/profleet-glendale-1", variant: "default" },
      { label: "Loading", path: "/accounts/jacks-tire-elko?preview=loading", variant: "loading" },
      { label: "Error", path: "/accounts/jacks-tire-elko?preview=error", variant: "error" },
    ],
    interactions: [
      "Tab toggle: animated pill background slides between Overview and Activity",
      "Capture Meeting CTA hides while a capture is in progress for this account",
      "Add Action Item opens a bottom sheet (AddActionItemSheet) with a mini calendar date picker",
      "Pull-to-refresh: RefreshIndicator on the tab body ScrollView, re-call ViewModel.loadAccount(id)",
    ],
    notes: "Accounts without AI-generated data show a 'No overview available yet' empty state followed by the Action Items section — that section is always visible.",
  },
  {
    name: "Activity Detail",
    route: "/accounts/[id]/activity/[activityId]",
    flutterFile: "activity_detail_page.dart",
    description: "AI-generated summary of a single field visit or interaction. Shows TLDR, key points, and categorized insights (commitments, risks, opportunities, follow-ups).",
    states: [
      { label: "With AI summary", path: "/accounts/jacks-tire-elko/activity/ja-1", variant: "default" },
      { label: "Operational (no AI)", path: "/accounts/walmart-cedar-city/activity/wc-1", variant: "default" },
    ],
    interactions: [
      "AI summary section uses the brand gradient background (--gradient-ai-dark)",
      "Key points support **bold** markdown via inline parsing",
      "Action Items section at bottom matches the account detail pattern",
    ],
  },
  {
    name: "Action Item Detail",
    route: "/accounts/[id]/action-items/[itemId]",
    flutterFile: "action_item_detail_page.dart",
    description: "Detail view for a single action item. Shows title, status, and due date. Inline editing of status and due date in Flutter.",
    states: [
      { label: "Default", path: "/accounts/jacks-tire-elko/action-items/ja-t1", variant: "default" },
    ],
    interactions: [
      "Status field: tap opens a picker (open / done / canceled)",
      "Due date field: tap opens date picker",
    ],
  },
  {
    name: "All Tasks",
    route: "/tasks",
    flutterFile: "tasks_page.dart",
    description: "Full list of all action items across all accounts. Filterable (open vs. done) and sortable (by due date or account).",
    states: [
      { label: "Open items", path: "/tasks", variant: "default" },
    ],
    interactions: [
      "Completion animation mirrors the home page: circle fill → AnimatePresence exit",
      "Items group by account when sorted by account; by date when sorted by due date",
      "Switching to Done filter shows completed/canceled items",
    ],
  },
  {
    name: "Profile",
    route: "/profile",
    flutterFile: "profile_page.dart",
    description: "Rep profile screen. Static in prototype — auth, settings, and CRM connection config go here in production.",
    states: [
      { label: "Default", path: "/profile", variant: "default" },
    ],
    interactions: [
      "Slides in from right (reverse of standard depth navigation — see PageTransition)",
    ],
    notes: "This screen is a placeholder. Expand with: rep name/photo, territory, CRM connection status, notification preferences.",
  },
];

function ScreenCard({ screen }: { screen: ScreenSpec }) {
  return (
    <div style={{
      background: "var(--md-sys-color-dark-primary)",
      border: "1px solid var(--md-sys-color-dark-tertiary)",
      borderRadius: 12,
      padding: "20px 24px",
      marginBottom: 16,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--md-sys-color-text-primary)", margin: "0 0 2px" }}>
            {screen.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <code style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", fontFamily: "ui-monospace, monospace" }}>
              {screen.route}
            </code>
            <span style={{ color: "var(--md-sys-color-dark-tertiary)" }}>·</span>
            <code style={{ fontSize: 12, color: "var(--md-sys-color-neonindigo)", fontFamily: "ui-monospace, monospace" }}>
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
      <p style={{ fontSize: 13, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
        {screen.description}
      </p>

      {/* Interactions */}
      <div style={{ marginBottom: screen.notes ? 14 : 0 }}>
        <Eyebrow>Interactions</Eyebrow>
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {screen.interactions.map((note, i) => (
            <li key={i} style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", lineHeight: 1.55 }}>
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
          <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", lineHeight: 1.55, margin: 0 }}>
            <strong style={{ color: "var(--md-sys-color-text-secondary)" }}>Note: </strong>{screen.notes}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Data models section ──────────────────────────────────────────────────────

const MODELS: { name: string; dartClass: string; note: string; code: string }[] = [
  {
    name: "Account",
    dartClass: "Account",
    note: "Core account entity returned by the accounts list endpoint. healthScore and annualRevenue are optional — show a placeholder if absent.",
    code: `interface Account {
  id: string;
  name: string;
  type: "corporate" | "branch" | "standalone";
  crmAccountType?: "sold-to" | "shipped-to" | "distributor" | "prospect";
  assignedInitial?: string;   // team member shown on list card (e.g. "A")
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
    name: "AccountDetail",
    dartClass: "AccountDetail",
    note: "Extends Account with AI-generated content. Fetched separately from the list — only load on AccountDetailPage. If absent, show the 'No overview yet' empty state.",
    code: `interface AccountDetail extends Account {
  lastVisitSummary: string;       // AI narrative paragraph
  ideasForThisTime: string[];     // AI-suggested talking points
  recentActivity: ActivityItem[];
  actionItems: ActionItem[];
  relatedAccountCount: number;
}`,
  },
  {
    name: "ActivityItem",
    dartClass: "ActivityItem",
    note: "A single logged interaction (visit, call, email, task). aiSummary is optional — only populated for interactions with a recorded transcript.",
    code: `interface ActivityItem {
  id: string;
  accountId: string;
  date: Date;
  type: "visit" | "call" | "email" | "task";
  title: string;
  summary: string;
  durationMinutes?: number;
  hasTranscript: boolean;
  repName: string;
  aiSummary?: ActivityAISummary;
}

interface ActivityAISummary {
  title: string;        // AI-generated headline
  tldr: string;         // short paragraph
  keyPoints: string[];  // support **bold** markdown — parse inline
}`,
  },
  {
    name: "ActionItem",
    dartClass: "ActionItem",
    note: "A follow-up task linked to an account. dueDate is nullable (displayed as 'TBD'). Status transitions: open → done or open → canceled.",
    code: `interface ActionItem {
  id: string;
  title: string;
  dueDate: Date | null;        // null = TBD
  status: "open" | "done" | "canceled";
}`,
  },
  {
    name: "AISummary (full)",
    dartClass: "AiSummary",
    note: "Full AI analysis object attached to a captured Interaction. Each insight item has a status so the rep can accept or reject it before it's pushed to the CRM.",
    code: `interface AISummary {
  summary: string;
  keyPoints: string[];
  commitments: Commitment[];    // who owes what
  risks: Risk[];
  opportunities: Opportunity[];
  followUps: FollowUp[];
  suggestedCrmUpdates: CrmUpdate[];
  confidence: number;           // 0–1
}

// All insight interfaces share this status pattern:
// "pending" → shown for review
// "accepted" → pushed to CRM / created as task
// "rejected" → dismissed
interface Commitment {
  id: string; text: string;
  owner: "rep" | "customer";
  dueDate?: Date;
  status: "pending" | "accepted" | "rejected";
}`,
  },
];

function ModelCard({ model }: { model: typeof MODELS[0] }) {
  return (
    <div style={{
      marginBottom: 24,
      background: "var(--md-sys-color-dark-primary)",
      border: "1px solid var(--md-sys-color-dark-tertiary)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--md-sys-color-text-primary)", margin: 0 }}>
            {model.name}
          </h3>
          <Tag color="rgba(139,146,255,0.12)" textColor="var(--md-sys-color-neonindigo)">
            {model.dartClass}.dart
          </Tag>
        </div>
        <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", lineHeight: 1.55, margin: 0 }}>
          {model.note}
        </p>
      </div>
      <div style={{ padding: "0" }}>
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
      { name: "--md-sys-color-background",    value: "#111420", usage: "Page / app chrome background" },
      { name: "--md-sys-color-dark-primary",  value: "#1A1D29", usage: "Card backgrounds, sheet backgrounds" },
      { name: "--md-sys-color-dark-secondary",value: "#252A36", usage: "Input fields, pressed states, list items" },
      { name: "--md-sys-color-dark-tertiary", value: "#3D4451", usage: "Dividers, borders, inactive chips" },
    ],
  },
  {
    label: "Text",
    tokens: [
      { name: "--md-sys-color-text-primary",   value: "#F7F8FF", usage: "Headings, primary content" },
      { name: "--md-sys-color-text-secondary", value: "#C3CAD8", usage: "Body text, supporting labels" },
      { name: "--md-sys-color-text-muted",     value: "#8B94A8", usage: "Metadata, timestamps, captions (4.5:1 contrast)" },
      { name: "--md-sys-color-text-disabled",  value: "#5D667A", usage: "Placeholders only — fails WCAG AA, never use for readable text" },
    ],
  },
  {
    label: "Brand — Purple (primary)",
    tokens: [
      { name: "--md-sys-color-neonindigo-light", value: "#B3B8FF", usage: "Active text on dark tinted backgrounds" },
      { name: "--md-sys-color-neonindigo",       value: "#8B92FF", usage: "Primary interactive elements, icons, active states" },
      { name: "--md-sys-color-neonindigo-dark",  value: "#6B72E8", usage: "Pressed state for purple elements" },
    ],
  },
  {
    label: "Brand — Coral (action / alert)",
    tokens: [
      { name: "--md-sys-color-brand-coral-light", value: "#FF8F82", usage: "Task indicators, urgent badges" },
      { name: "--md-sys-color-brand-coral",       value: "#FF6B5A", usage: "Capture Meeting CTA, primary destructive action" },
      { name: "--md-sys-color-brand-coral-dark",  value: "#E64A37", usage: "Pressed state" },
    ],
  },
  {
    label: "Semantic",
    tokens: [
      { name: "--md-sys-color-success", value: "#2ECC71", usage: "Completion, shipped status, green checkmark" },
      { name: "--md-sys-color-warning", value: "#F5A623", usage: "Review status, due-soon warnings" },
      { name: "--md-sys-color-error",   value: "#FF4D4F", usage: "Error states, destructive confirmations" },
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
      borderBottom: "1px solid var(--md-sys-color-dark-tertiary)",
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
          <code style={{ fontSize: 12, color: "var(--md-sys-color-neonindigo)", fontFamily: "ui-monospace, monospace" }}>
            {token.name}
          </code>
          <code style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", fontFamily: "ui-monospace, monospace" }}>
            {token.value}
          </code>
        </div>
        <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: "2px 0 0", lineHeight: 1.4 }}>
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
  { name: "--radius-full", value: "100px", usage: "Pills, avatar circles, tab selectors" },
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
    name: "AccountListItem",
    file: "components/accounts/AccountListItem.tsx",
    flutterWidget: "accounts_view_account_list_item.dart",
    description: "Tappable row in the accounts list. Left: 3-line text stack (name, distance/city, last visited). Right: CRM type badge + task indicator chip + assignee circle. No background fill — open card with inset border-bottom divider.",
    props: "account: Account, isLast?: boolean",
  },
  {
    name: "ActionItemCard",
    file: "components/accounts/ActionItemCard.tsx",
    flutterWidget: "action_item_card.dart",
    description: "Card showing a single action item's title, due date, and status badge. Used in account detail, activity detail, and the tasks list.",
    props: "item: ActionItem",
  },
  {
    name: "AddActionItemSheet",
    file: "components/accounts/AddActionItemSheet.tsx",
    flutterWidget: "add_action_item_bottom_sheet.dart",
    description: "Modal bottom sheet with a text field and horizontal date-picker strip. Date tiles show day label (bold), date number (primary color), and month. Submits to ActionItemsContext.",
    props: "accountId: string, onClose: () => void",
  },
  {
    name: "CompletionToast",
    file: "components/ui/CompletionToast.tsx",
    flutterWidget: "SnackBar (custom styled)",
    description: "Slide-up toast confirming an action item was marked complete. Green checkmark, 'Item complete' label, purple Undo link, × dismiss. Portals above the bottom nav. Auto-dismisses after 5 seconds.",
    props: "visible: boolean, bottom?: number, onUndo: () => void, onDismiss: () => void",
  },
  {
    name: "Skeleton / Bone",
    file: "components/ui/Skeleton.tsx",
    flutterWidget: "shimmer package — Shimmer.fromColors",
    description: "Shimmer loading placeholder. Bone is the base primitive (a single animated rect). AccountListSkeleton and AccountDetailSkeleton compose Bones into full-screen loading layouts that match the real content dimensions exactly.",
    props: "Bone: width?, height?, radius? | AccountListSkeleton: rows? | AccountDetailSkeleton: none",
  },
  {
    name: "ErrorState",
    file: "components/ui/ErrorState.tsx",
    flutterWidget: "Centered Column (Icon + Text + TextButton)",
    description: "Full-area error state with triangle warning icon, title, message, and optional retry button. Wire onRetry to re-trigger the ViewModel fetch.",
    props: "title?: string, message?: string, onRetry?: () => void",
  },
  {
    name: "StaticBottomNav",
    file: "components/layout/StaticBottomNav.tsx",
    flutterWidget: "BottomNavigationBar",
    description: "4-item bottom nav: Home, Accounts, Tasks, Profile. 230px wide, left-aligned, absolute positioned above page content. Active item uses primary text + brand-purple icon.",
  },
  {
    name: "CaptureWidget",
    file: "components/capture/CaptureWidget.tsx",
    flutterWidget: "Persistent overlay widget (Stack child)",
    description: "Persistent recording pill that appears when a meeting capture is started from the Account Detail CTA. Shows account name, elapsed timer, and stop button. Portals above all navigation.",
  },
];

function ComponentRow({ comp }: { comp: typeof COMPONENTS[0] }) {
  return (
    <div style={{
      padding: "16px 0",
      borderBottom: "1px solid var(--md-sys-color-dark-tertiary)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--md-sys-color-text-primary)", margin: 0 }}>
          {comp.name}
        </h3>
        <code style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", fontFamily: "ui-monospace, monospace" }}>
          {comp.file}
        </code>
        <Tag color="rgba(139,146,255,0.12)" textColor="var(--md-sys-color-neonindigo)">
          {comp.flutterWidget}
        </Tag>
      </div>
      <p style={{ fontSize: 12, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.6, margin: "0 0 (comp.props ? 6px : 0)" }}>
        {comp.description}
      </p>
      {comp.props && (
        <p style={{ fontSize: 11, margin: "6px 0 0" }}>
          <span style={{ color: "var(--md-sys-color-text-muted)", fontWeight: 600 }}>Props: </span>
          <code style={{ color: "var(--md-sys-color-text-muted)", fontFamily: "ui-monospace, monospace" }}>{comp.props}</code>
        </p>
      )}
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview",    label: "Overview" },
  { id: "screens",     label: "Screens" },
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
        color: "var(--md-sys-color-text-muted)",
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
            color: active === item.id ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)",
            background: active === item.id ? "var(--md-sys-color-dark-secondary)" : "transparent",
            borderLeft: `3px solid ${active === item.id ? "var(--md-sys-color-neonindigo)" : "transparent"}`,
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

export default function HandoffPage() {
  const [activeSection, setActiveSection] = useState("overview");

  // Track scroll position to highlight active nav item
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
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
      background: "var(--md-sys-color-background)",
      color: "var(--md-sys-color-text-primary)",
      fontFamily: "Barlow, system-ui, sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--md-sys-color-dark-primary)",
        borderBottom: "1px solid var(--md-sys-color-dark-tertiary)",
        padding: "0 40px",
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--md-sys-color-text-primary)" }}>
            Halosight
          </span>
          <span style={{ color: "var(--md-sys-color-dark-tertiary)" }}>/</span>
          <span style={{ fontSize: 14, color: "var(--md-sys-color-text-muted)" }}>Flutter Handoff</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Tag>Accounts flow</Tag>
          <a
            href={protoLink("/home")}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--md-sys-color-neonindigo)",
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
              background: "var(--md-sys-color-dark-primary)",
              border: "1px solid var(--md-sys-color-dark-tertiary)",
              borderRadius: 12,
              padding: "24px 28px",
              marginBottom: 24,
            }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--md-sys-color-text-primary)", margin: "0 0 8px" }}>
                Flutter Handoff — Accounts Flow
              </h1>
              <p style={{ fontSize: 14, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.7, margin: "0 0 20px" }}>
                This page is the living spec for the Halosight accounts flow. Every screen, data model,
                design token, and component is documented here with direct links into the running prototype.
                Use this alongside the prototype — open a screen link to see the interaction, then reference
                the spec below for the exact dimensions, token names, and Flutter widget equivalents.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href={protoLink("/accounts")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-text-primary)",
                    background: "var(--md-sys-color-neonindigo)", textDecoration: "none",
                    padding: "8px 18px", borderRadius: 20,
                  }}
                >
                  Open accounts flow ↗
                </a>
                <a
                  href={protoLink("/home")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-text-secondary)",
                    background: "var(--md-sys-color-dark-secondary)", textDecoration: "none",
                    padding: "8px 18px", borderRadius: 20,
                    border: "1px solid var(--md-sys-color-dark-tertiary)",
                  }}
                >
                  Full prototype ↗
                </a>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Screens", value: String(SCREENS.length), note: "in this flow" },
                { label: "Components", value: String(COMPONENTS.length), note: "reusable widgets" },
                { label: "Color tokens", value: String(COLOR_GROUPS.reduce((n, g) => n + g.tokens.length, 0)), note: "semantic tokens" },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: "var(--md-sys-color-dark-primary)",
                  border: "1px solid var(--md-sys-color-dark-tertiary)",
                  borderRadius: 10,
                  padding: "16px 20px",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: "var(--md-sys-color-neonindigo)", margin: "0 0 2px" }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", margin: 0 }}>
                    {stat.label}
                    <br /><span style={{ fontSize: 11 }}>{stat.note}</span>
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Screens ──────────────────────────────────────────────────── */}
          <Section id="screens" title="Screens">
            {SCREENS.map(screen => (
              <ScreenCard key={screen.route} screen={screen} />
            ))}
          </Section>

          {/* ── Data Models ──────────────────────────────────────────────── */}
          <Section id="models" title="Data Models">
            <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              These TypeScript interfaces map directly to Dart entity classes in <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>lib/entity/</code>.
              Each <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>Date</code> field becomes a <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>DateTime</code>.
              Optional fields (<code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>?</code>) become nullable types.
            </p>
            {MODELS.map(model => (
              <ModelCard key={model.name} model={model} />
            ))}
          </Section>

          {/* ── Tokens ───────────────────────────────────────────────────── */}
          <Section id="tokens" title="Design Tokens">
            <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              All tokens are defined in <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>tokens/colors.css</code> and <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>tokens/spacing.css</code>.
              In Flutter, define these in a <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>AppTheme</code> class and reference via <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>Theme.of(context)</code>.
            </p>

            {COLOR_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 32 }}>
                <Eyebrow>{group.label}</Eyebrow>
                <div style={{
                  background: "var(--md-sys-color-dark-primary)",
                  border: "1px solid var(--md-sys-color-dark-tertiary)",
                  borderRadius: 10,
                  padding: "0 16px",
                  overflow: "hidden",
                }}>
                  {group.tokens.map((token, i) => (
                    <div key={token.name} style={{ borderBottom: i < group.tokens.length - 1 ? "1px solid var(--md-sys-color-dark-tertiary)" : "none" }}>
                      <Swatch token={token} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Border radius */}
            <div style={{ marginBottom: 32 }}>
              <Eyebrow>Border Radius (M3 shape scale)</Eyebrow>
              <div style={{
                background: "var(--md-sys-color-dark-primary)",
                border: "1px solid var(--md-sys-color-dark-tertiary)",
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
                      background: "var(--md-sys-color-dark-secondary)",
                      borderRadius: r.value,
                      border: "1px solid var(--md-sys-color-dark-tertiary)",
                    }} />
                    <div style={{ textAlign: "center" }}>
                      <code style={{ fontSize: 10, color: "var(--md-sys-color-neonindigo)", display: "block", fontFamily: "ui-monospace, monospace" }}>
                        {r.name.replace("--radius-", "")}
                      </code>
                      <span style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)" }}>{r.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Components ───────────────────────────────────────────────── */}
          <Section id="components" title="Components">
            <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", lineHeight: 1.6, marginBottom: 8 }}>
              Reusable widgets in the accounts flow. Each has a direct source file path and the recommended Flutter widget equivalent.
            </p>
            <div style={{
              background: "var(--md-sys-color-dark-primary)",
              border: "1px solid var(--md-sys-color-dark-tertiary)",
              borderRadius: 10,
              padding: "0 20px",
            }}>
              {COMPONENTS.map((comp, i) => (
                <div key={comp.name} style={{ borderBottom: i < COMPONENTS.length - 1 ? "1px solid var(--md-sys-color-dark-tertiary)" : "none" }}>
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
