"use client";

/**
 * Halosight Design System — Reference Page
 * Browsable reference for foundations and components. Component examples open on demand from a searchable Atomic-tier catalog.
 * M3-aligned naming throughout for Figma + Flutter compatibility.
 * Not part of the mobile app UX — browser-only reference tool.
 *
 * Color swatches read from live CSS custom properties via getComputedStyle —
 * editing globals.css is the only step needed to update colors here.
 */

import Image from "next/image";
import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import AccountListItem from "@/components/accounts/AccountListItem";
import ListCard from "@/components/ui/ListCard";
import { DrawerHandle, DrawerBody, DrawerHeader } from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import ActivityCard from "@/components/accounts/ActivityCard";
import EngagementRow from "@/components/accounts/EngagementRow";
import { EngagementsPanel } from "@/components/accounts/EngagementsDrawer";
import { mockRecentActivities } from "@/lib/mock-data/home";
import Menu from "@/components/ui/Menu";
import { AlertCard } from "@/components/ui/AlertDialog";
import SearchField from "@/components/ui/SearchField";
import { FilterDropdownPreview, SortFilterPreview, VisitedFilterPreview, KebabMenuPreview } from "@/components/design-system/MenuTriggerPreviews";
import { FieldCardsPreview, ListeningHeaderPreview, SideButtonsPreview } from "@/components/design-system/AIReviewPreviews";
import { AccountPickerPreview } from "@/components/design-system/AccountPickerPreview";
import { ErrorStatePreview, ScrollTopBarPreview, CustomIconsPreview } from "@/components/design-system/UtilityPreviews";
import { Bone, AccountListSkeleton, AccountDetailSkeleton } from "@/components/ui/Skeleton";
import { StatesPreview, SizesPreview, MultilinePreview, SlotsPreview, BarePreview } from "@/components/design-system/TextFieldPreviews";
import SectionHeaderRow from "@/components/ui/SectionHeader";
import IconButton from "@/components/ui/IconButton";
import Banner from "@/components/ui/Banner";
import { ToastCard } from "@/components/ui/Toast";
import { PillPreview, PillSequencePreview } from "@/components/design-system/ToastPreviews";
import IconLibraryToggle from "@/components/ui/IconLibraryToggle";
import { SuggestionChip } from "@/components/chat/ChatEmptyState";
import ChatInput from "@/components/chat/ChatInput";
import { UserMessage, AssistantMessage, DraftBlock, ThinkingRow } from "@/components/chat/ChatMessage";
import { EmptyPreview, TypingPreview, ConversationPreview, HistoryPreview, VoicePreview, DockPreview } from "@/components/design-system/ChatPreviews";
import { CHAT_SAMPLE_TURNS, DRAFT_NOTE } from "@/lib/mock-data/chat";
import InsightCard from "@/components/accounts/InsightCard";
import InsightCardLoader from "@/components/accounts/InsightCardLoader";
import InsightLoadingPreview from "@/components/design-system/InsightLoadingPreview";
import { FeedbackEntryPreview, FeedbackFormPreview } from "@/components/design-system/FeedbackPreviews";
import { TabsPreview } from "@/components/design-system/TabsPreviews";
import ThinkingDots from "@/components/ui/ThinkingDots";
import { LoadingRow, TryItButton, DotsOnSurfaces } from "@/components/design-system/ButtonLoadingPreviews";
import { InteractionCard, DateChips } from "@/components/accounts/ActionItemDrawer";
import { ViewPreview, EditPreview, DeletePreview, SAMPLE_FULL, SAMPLE_MINIMAL, SAMPLE_DONE } from "@/components/design-system/ActionItemDrawerPreviews";
import CountBadge from "@/components/accounts/CountBadge";
import { ComponentArea, AreaGroup, VariantCard, SubComponentCard, StateSample } from "@/components/design-system/ComponentArea";
import { ComponentCatalogContext, TIER_BY_SECTION, type AtomicTier, useComponentCatalog } from "@/components/design-system/ComponentCatalogContext";
import ActionItemList, { ActionItemsHeader, type ActionItemEntry } from "@/components/accounts/ActionItemList";
import Icon from "@/components/ui/Icon";
import AccountTypeIcon from "@/components/accounts/AccountTypeIcon";
import MenuIcon from "@/components/ui/MenuIcon";
import { mockAccounts } from "@/lib/mock-data/accounts";
import type { ActivityItem } from "@/lib/types";

// ─── Section anchor IDs ────────────────────────────────────────────────────
const SECTIONS = [
  { id: "voice-tone",          label: "Voice & Tone" },
  { id: "base-brand-colors",   label: "Base Brand Colors" },
  { id: "light-theme-colors",  label: "Light Theme Colors" },
  { id: "dark-theme-colors",   label: "Dark Theme Colors" },
  { id: "text-colors",         label: "Text Colors" },
  { id: "semantic-colors",     label: "Semantic Colors" },
  { id: "color",               label: "Color System" },
  { id: "typography",        label: "Typography" },
  { id: "labels-captions",  label: "Labels & Captions" },
  { id: "shape",             label: "Shape & Radius" },
  { id: "spacing",     label: "Spacing" },
  { id: "elevation",   label: "Elevation" },
  { id: "buttons",     label: "Buttons" },
  { id: "badges",      label: "Badges & Chips" },
  { id: "account-list-item", label: "Account List Item" },
  { id: "drawer", label: "Drawer" },
  { id: "action-item-list", label: "Action Item List" },
  { id: "action-item-drawer", label: "Action Item Drawer" },
  { id: "tabs", label: "Tabs" },
  { id: "activity-card", label: "Activity Card" },
  { id: "engagements-drawer", label: "Engagements Drawer" },
  { id: "insight-card", label: "Insight Card" },
  { id: "text-field", label: "Text Field" },
  { id: "filter-pill", label: "Filter Pill" },
  { id: "kebab-menu", label: "More Menu" },
  { id: "skeleton", label: "Skeleton" },
  { id: "ai-review", label: "AI Review" },
  { id: "account-picker", label: "Account Picker" },
  { id: "error-state", label: "Error State" },
  { id: "scroll-top-bar", label: "Scroll Top Bar" },
  { id: "custom-icons", label: "Custom Icons" },
  { id: "search-field", label: "Search Field" },
  { id: "section-header", label: "Section Header" },
  { id: "icon-button", label: "Icon Button" },
  { id: "banner", label: "Banner" },
  { id: "alert-dialog", label: "Alert Dialog" },
  { id: "toast", label: "Toast" },
  { id: "account-chat", label: "Account Chat" },
  { id: "feedback-widget", label: "Feedback Widget" },
  { id: "menus",       label: "Menu" },
  { id: "icons",       label: "Icons" },
];

const COMPONENT_SECTIONS = SECTIONS.filter((section) => TIER_BY_SECTION[section.id]);
const AREA_BY_SECTION: Record<string, string> = {
  "account-list-item": "Accounts", "action-item-list": "Action items", "action-item-drawer": "Action items",
  "activity-card": "Activity", "engagements-drawer": "Activity", "ai-review": "Capture", "account-picker": "Capture",
  "account-chat": "Chat", "feedback-widget": "Feedback", "insight-card": "AI insights",
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <div id={id} className="mb-8 pt-2">
      <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--md-sys-color-text-primary)" }}>{title}</h2>
      {subtitle && <p className="mt-1 text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>{subtitle}</p>}
      <div className="mt-3 h-px" style={{ background: "var(--md-sys-color-dark-tertiary)" }} />
    </div>
  );
}

function SectionNavLinks({ pageView, onSelect }: { pageView: "components" | "foundations"; onSelect?: (id: string) => void }) {
  const groups = pageView === "foundations"
    ? [
        { label: "Guidance", items: SECTIONS.filter((s) => s.id === "voice-tone") },
        { label: "Color", items: SECTIONS.filter((s) => ["base-brand-colors", "light-theme-colors", "dark-theme-colors", "text-colors", "semantic-colors", "color"].includes(s.id)) },
        { label: "Type & Layout", items: SECTIONS.filter((s) => ["typography", "labels-captions", "shape", "spacing", "elevation"].includes(s.id)) },
      ]
    : (["Atoms", "Molecules", "Organisms", "Templates"] as const).map((tier) => ({ label: tier, items: COMPONENT_SECTIONS.filter((item) => TIER_BY_SECTION[item.id] === tier) }));
  return <div className="space-y-2">{groups.map((group, index) => <details key={group.label} open={index === 0}>
    <summary className="cursor-pointer py-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--md-sys-color-text-disabled)" }}>{group.label} <span>({group.items.length})</span></summary>
    <div className="pl-2">{group.items.length ? group.items.map((item) => <a key={item.id} href={`#${item.id}`} onClick={() => onSelect?.(item.id)} className="block py-1.5 text-[13px] transition-colors" style={{ color: "var(--md-sys-color-text-muted)" }}>{item.label}</a>) : <p className="py-1.5 text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>No screen templates yet</p>}</div>
  </details>)}</div>;
}

function CatalogContextBridge({ query, tier, activeId, children }: { query: string; tier: AtomicTier; activeId: string | null; children: ReactNode }) {
  return <ComponentCatalogContext.Provider value={{ query, tier, activeId }}>{children}</ComponentCatalogContext.Provider>;
}

function CatalogSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const { query, tier, activeId } = useComponentCatalog();
  const atomicTier = TIER_BY_SECTION[id];
  const matches = `${title} ${id}`.toLowerCase().includes(query.trim().toLowerCase());
  const isActive = activeId === id;
  if (activeId ? !isActive : (!matches || (tier !== "All" && tier !== atomicTier))) return null;
  return <section id={id} className="mb-16 rounded-2xl overflow-hidden" style={{ scrollMarginTop: 80, background: "var(--md-sys-color-dark-secondary)", border: "1px solid var(--md-sys-color-dark-tertiary)" }}>
    <div className="flex items-center justify-between px-5 py-4">
      <span className="flex items-center gap-3"><strong style={{ color: "var(--md-sys-color-text-primary)" }}>{title}</strong><span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-muted)" }}>{atomicTier}</span></span>
      </div><div className="px-5 pb-6">{children}</div>
  </section>;
}

function BrandSectionHeader({ id, title }: { id: string; title: string }) {
  return (
    <div id={id} className="mb-8 pt-2">
      <h2 className="text-2xl font-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>{title}</h2>
      <div className="mt-3 h-px" style={{ background: "var(--md-sys-color-dark-tertiary)" }} />
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--md-sys-color-text-disabled)" }}>
      {title}
    </h3>
  );
}

function TokenLabel({ name, value }: { name: string; value: string }) {
  return (
    <div className="mt-2">
      <p className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-neonindigo)" }}>{name}</p>
      <p className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-disabled)" }}>{value}</p>
    </div>
  );
}

// ─── Color Swatch ──────────────────────────────────────────────────────────
// Pantone-style portrait card: color block on top, info strip below.
// ─── Copy Token Button ────────────────────────────────────────────────────
function CopyTokenButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`var(${token})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 flex items-center transition-colors active:opacity-60"
      style={{ color: copied ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-disabled)" }}
      title={`Copy var(${token})`}
    >
      <Icon name={copied ? "check" : "content_copy"} size={11} style={{ lineHeight: 1 }} />
    </button>
  );
}

// Reads live values from CSS custom properties — change globals.css, this updates automatically.
function ColorSwatch({
  token, label, small = false,
}: {
  token: string;   // full CSS var name, e.g. "--md-sys-color-primary"
  label: string;
  textColor?: string; // kept for API compat, unused
  small?: boolean;
}) {
  const [liveValue, setLiveValue] = useState("…");

  useEffect(() => {
    const read = () =>
      setLiveValue(getComputedStyle(document.documentElement).getPropertyValue(token).trim());
    read();
    window.addEventListener("themechange", read);
    return () => window.removeEventListener("themechange", read);
  }, [token]);

  const needsBorder = token === "--md-sys-color-background" || token === "--md-sys-color-surface-dim";

  return (
    <div
      className="flex flex-col overflow-hidden w-[180px]"
      style={{
        borderRadius: 5,
        border: "1px solid var(--md-sys-color-alpha-white-10)",
      }}
    >
      {/* Color block */}
      <div
        style={{
          background: `var(${token})`,
          height: small ? 52 : 80,
          borderBottom: needsBorder ? "1px solid var(--md-sys-color-alpha-white-10)" : "1px solid rgba(0,0,0,0.15)",
        }}
      />
      {/* Info strip */}
      <div style={{ background: "var(--md-sys-color-dark-secondary)", padding: "8px 10px", flex: 1 }}>
        <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--md-sys-color-text-primary)", letterSpacing: "0.01em" }}>{label}</p>
        <div className="flex items-center gap-1 mt-[3px]">
          <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--md-sys-color-neonindigo)", opacity: 0.75 }}>{token}</p>
          <CopyTokenButton token={token} />
        </div>
        <p className="font-mono leading-tight truncate mt-[3px]" style={{ fontSize: 11, color: "var(--md-sys-color-text-disabled)" }}>{liveValue}</p>
      </div>
    </div>
  );
}

// ─── Gradient Swatch ──────────────────────────────────────────────────────
function GradientSwatch({ token, label, textGradient = false }: { token: string; label: string; textGradient?: boolean }) {
  return (
    <div
      className="flex flex-col overflow-hidden w-[180px]"
      style={{
        borderRadius: 5,
        border: "1px solid var(--md-sys-color-alpha-white-10)",
      }}
    >
      {/* Gradient block */}
      <div style={{ height: 80, background: `var(${token})`, borderBottom: "1px solid rgba(0,0,0,0.15)" }} />
      {/* Info strip */}
      <div style={{ background: "var(--md-sys-color-dark-secondary)", padding: "8px 10px", flex: 1 }}>
        {textGradient && (
          <div
            className="font-bold leading-tight mb-1"
            style={{
              fontSize: 11,
              background: `var(${token})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Halosight
          </div>
        )}
        <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--md-sys-color-text-primary)", letterSpacing: "0.01em" }}>{label}</p>
        <div className="flex items-center gap-1 mt-[3px]">
          <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--md-sys-color-neonindigo)", opacity: 0.75 }}>{token}</p>
          <CopyTokenButton token={token} />
        </div>
      </div>
    </div>
  );
}

// ─── Alpha Swatch ─────────────────────────────────────────────────────────
// Same Pantone card shape — checkered top shows transparency, info strip below.
function AlphaSwatch({ token, label, description, glass = false }: {
  token: string; label: string; description: string; glass?: boolean;
}) {
  const [liveValue, setLiveValue] = useState("…");
  useEffect(() => {
    const read = () =>
      setLiveValue(getComputedStyle(document.documentElement).getPropertyValue(token).trim());
    read();
    window.addEventListener("themechange", read);
    return () => window.removeEventListener("themechange", read);
  }, [token]);

  return (
    <div
      className="flex flex-col overflow-hidden w-[180px]"
      style={{
        borderRadius: 5,
        border: "1px solid var(--md-sys-color-alpha-white-10)",
      }}
    >
      {/* Checkered backdrop + alpha layer */}
      <div
        className="relative"
        style={{
          height: 80,
          backgroundImage: [
            "linear-gradient(45deg, var(--md-sys-color-dark-tertiary) 25%, transparent 25%)",
            "linear-gradient(-45deg, var(--md-sys-color-dark-tertiary) 25%, transparent 25%)",
            "linear-gradient(45deg, transparent 75%, var(--md-sys-color-dark-tertiary) 75%)",
            "linear-gradient(-45deg, transparent 75%, var(--md-sys-color-dark-tertiary) 75%)",
          ].join(", "),
          backgroundSize: "10px 10px",
          backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
          backgroundColor: "var(--md-sys-color-dark-secondary)",
          borderBottom: "1px solid rgba(0,0,0,0.15)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `var(${token})`,
            backdropFilter: glass ? "blur(12px) saturate(160%)" : "none",
            WebkitBackdropFilter: glass ? "blur(12px) saturate(160%)" : "none",
          }}
        />
        {glass && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-semibold uppercase tracking-widest" style={{ fontSize: 8, color: "rgba(179,184,255,0.5)" }}>glass</span>
          </div>
        )}
      </div>
      {/* Info strip */}
      <div style={{ background: "var(--md-sys-color-dark-secondary)", padding: "8px 10px", flex: 1 }}>
        <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--md-sys-color-text-primary)", letterSpacing: "0.01em" }}>{label}</p>
        <div className="flex items-center gap-1 mt-[3px]">
          <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--md-sys-color-neonindigo)", opacity: 0.75 }}>{token}</p>
          <CopyTokenButton token={token} />
        </div>
        <p className="font-mono leading-tight truncate mt-[3px]" style={{ fontSize: 11, color: "var(--md-sys-color-text-disabled)" }}>{liveValue}</p>
        <p className="font-mono leading-tight truncate mt-[3px]" style={{ fontSize: 11, color: "var(--md-sys-color-text-disabled)", opacity: 0.7 }}>{description}</p>
      </div>
    </div>
  );
}

// ─── M3 Color Role Group ───────────────────────────────────────────────────
// Shows a primary/on-primary/container/on-container quad the standard M3 way.
function ColorRoleGroup({
  role, label,
}: {
  role: string;   // e.g. "primary", "secondary", "error"
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-2 gap-1">
        <ColorSwatch token={`--md-sys-color-${role}`}    label={role}         small />
        <ColorSwatch token={`--md-sys-color-on-${role}`} label={`on-${role}`} small />
      </div>
      <div className="grid grid-cols-2 gap-1">
        <ColorSwatch token={`--md-sys-color-${role}-container`}    label={`${role}-container`}    small />
        <ColorSwatch token={`--md-sys-color-on-${role}-container`} label={`on-${role}-container`} small />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: "var(--md-sys-color-text-disabled)" }}>{label}</p>
    </div>
  );
}

// ─── Type specimen ────────────────────────────────────────────────────────
function TypeSpecimen({
  cssClass, font, weight, size, lineHeight, sample, extra,
}: {
  cssClass: string; font: string; weight: string; size: string; lineHeight: string; sample: string; extra?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 py-5" style={{ borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
      <div className="flex-1 min-w-0">
        <p className={cssClass} style={{ color: "var(--md-sys-color-text-primary)" }}>{sample}</p>
      </div>
      <div className="sm:w-56 flex-shrink-0 sm:text-right pt-0 sm:pt-1">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--md-sys-color-neonindigo)" }}>.{cssClass}</p>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--md-sys-color-text-disabled)" }}>
          {font} · {weight} · {size} · lh {lineHeight}
        </p>
        {extra && <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--md-sys-color-text-disabled)" }}>{extra}</p>}
      </div>
    </div>
  );
}

// ─── Radius swatch ────────────────────────────────────────────────────────
function RadiusSwatch({ radius, token, value }: { radius: string; token: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-20 h-20 flex items-center justify-center"
        style={{
          background: "var(--md-sys-color-dark-tertiary)",
          border: "2px solid var(--md-sys-color-neonindigo)",
          borderRadius: radius,
        }}
      />
      <div className="text-center">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--md-sys-color-neonindigo)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-disabled)" }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Spacing swatch ───────────────────────────────────────────────────────
function SpacingSwatch({ token, value }: { token: string; value: string }) {
  const px = parseInt(value);
  return (
    <div className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
      <div className="w-24 flex-shrink-0">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--md-sys-color-neonindigo)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-disabled)" }}>{value}</p>
      </div>
      <div
        className="flex-shrink-0"
        style={{ width: px, height: 20, background: "var(--md-sys-color-brand-coral)", borderRadius: 3, minWidth: 3 }}
      />
    </div>
  );
}

// ─── Elevation swatch ─────────────────────────────────────────────────────
function ElevationSwatch({ level, token, shadow }: { level: number; token: string; shadow: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-2xl p-4 flex items-center justify-center"
        style={{
          background: "var(--md-sys-color-dark-secondary)",
          boxShadow: shadow,
          height: 100,
        }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--md-sys-color-text-muted)" }}>Level {level}</span>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--md-sys-color-neonindigo)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-disabled)" }}>Elevation {level}</p>
      </div>
    </div>
  );
}

// ─── Tab Bar Demo ─────────────────────────────────────────────────────────
// Live component — same JSX as accounts/[id]/page.tsx. Edit there, updates here.

// ─── Main Page ─────────────────────────────────────────────────────────────
const SAMPLE_IDS = ["walmart-corp", "jacks-tire-elko", "southwestern-consolidated"];
const sampleOwned = SAMPLE_IDS.map((id) => mockAccounts.find((a) => a.id === id)).filter((a): a is (typeof mockAccounts)[number] => !!a);

const daysFrom = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const sampleActionEntries: ActionItemEntry[] = [
  { item: { id: "s1", title: "Send Q2 pricing update", dueDate: daysFrom(-2), status: "open", originType: "meeting" }, accountId: "demo", accountName: "Acme Co" },
  { item: { id: "s2", title: "Send pricing recap", dueDate: daysFrom(-1), status: "open" }, accountId: "demo", accountName: "Reladyne" },
  { item: { id: "s3", title: "On-site training for new team", dueDate: daysFrom(0), status: "open", originType: "spoken-note" }, accountId: "demo", accountName: "Innovative Tech" },
  { item: { id: "s4", title: "Follow up on seasonal demand", dueDate: daysFrom(3), status: "open", originType: "meeting" }, accountId: "demo", accountName: "Jack's Tire & Oil" },
  { item: { id: "s5", title: "Share subaccount modeling options with Priya", dueDate: daysFrom(14), status: "open" }, accountId: "demo", accountName: "ProFleet" },
];
const daysAgoDate = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const recentSamples = mockRecentActivities.slice(0, 6);

const sampleActivities: ActivityItem[] = [
  { id: "a1", accountId: "demo", date: daysAgoDate(2), type: "visit", title: "QBR planning, product updates and launch coordination", summary: "The team aligned on an in-person QBR in Houston, reviewed Halosight product and Salesforce updates, and agreed on next steps for the pilot group.", durationMinutes: 45, hasTranscript: true, repName: "Jordan Mills" },
  { id: "a2", accountId: "demo", date: daysAgoDate(95), type: "call", title: "Pilot users request date based recap and task digest", summary: "The pilot group praised Halosight's meeting summaries and asked for date-based activity recaps and a daily digest of open tasks.", durationMinutes: 30, hasTranscript: true, repName: "Marcus Webb" },
  { id: "a3", accountId: "demo", date: daysAgoDate(4), type: "email", source: "salesforce", title: "Re: September QBR logistics", summary: "Hi team — confirming we have the Houston room booked for the 14th, 9am to noon. Let me know if Sam should loop in anyone before then.", hasTranscript: false, repName: "Dana Ruiz" },
];
const sampleHome = [...sampleOwned, ...mockAccounts.filter((a) => !SAMPLE_IDS.includes(a.id)).slice(0, 1)];

export default function DesignSystemPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [insightExtras, setInsightExtras] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [pageView, setPageView] = useState<"components" | "foundations">("components");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogTier, setCatalogTier] = useState<AtomicTier>("All");
  const [catalogArea, setCatalogArea] = useState("All areas");
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    window.dispatchEvent(new CustomEvent("themechange"));
  }, [theme]);

  // Close on Escape + lock body scroll when drawer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen" style={{ background: "var(--md-sys-color-background)", fontFamily: "Barlow, sans-serif" }}>

      {/* ── Slide-out drawer (visible below 860px) ───────────────────────── */}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200 aside:hidden"
        style={{
          background: "rgba(0, 0, 0, 0.65)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
        onClick={() => setDrawerOpen(false)}
      />
      {/* Drawer panel */}
      <nav
        className="fixed top-0 left-0 h-full z-50 overflow-y-auto aside:hidden"
        style={{
          width: 240,
          background: "var(--md-sys-color-dark-primary)",
          borderRight: "1px solid var(--md-sys-color-dark-tertiary)",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          paddingTop: 20,
          paddingBottom: 32,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--md-sys-color-text-disabled)" }}>
            Contents
          </p>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-opacity active:opacity-60"
            style={{ background: "var(--md-sys-color-dark-tertiary)" }}
            aria-label="Close navigation"
          >
            <Icon name="close" size={16} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
        </div>
        {/* Nav links */}
        <SectionNavLinks pageView={pageView} onSelect={(id) => { setDrawerOpen(false); if (pageView === "components") { setCatalogQuery(""); setCatalogTier("All"); setCatalogArea("All areas"); setActiveComponentId(id); } }} />
      </nav>

      {/* Top bar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 h-14"
        style={{ background: "var(--md-sys-color-background)", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger — only visible below 860px */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="aside:hidden flex items-center justify-center w-8 h-8 rounded-lg mr-1 transition-opacity active:opacity-60"
            style={{ background: "var(--md-sys-color-dark-secondary)" }}
            aria-label="Open navigation"
          >
            <Icon name="menu" size={18} style={{ color: "var(--md-sys-color-text-muted)" }} />
          </button>
          <span className="text-[15px] font-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>Halosight</span>
          <span style={{ color: "var(--md-sys-color-text-disabled)" }}>·</span>
          <span className="hidden sm:inline text-[13px]" style={{ color: "var(--md-sys-color-text-muted)" }}>Design System</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-neonindigo)" }}
          >
            M3
          </span>
        </div>
        <div className="flex items-center gap-3">
          <IconLibraryToggle />
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition-all"
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              border: "1px solid var(--md-sys-color-alpha-white-10)",
              color: "var(--md-sys-color-text-muted)",
            }}
          >
            <Icon
              name={theme === "dark" ? "dark_mode" : "light_mode"}
              size={14}
              fill
              style={{ color: "var(--md-sys-color-text-muted)" }}
            />
            {theme === "dark" ? "Dark" : "Light"}
          </button>
          <Link href="/relationships" className="text-[13px]" style={{ color: "var(--md-sys-color-neonindigo)" }}>
            ← Back to app
          </Link>
        </div>
      </div>

      <div className="flex">

        {/* Sticky sidebar — hidden below 860px, drawer handles it there */}
        <nav
          className="hidden aside:block w-52 flex-shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-5"
          style={{ borderRight: "1px solid var(--md-sys-color-dark-tertiary)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--md-sys-color-text-disabled)" }}>
            Contents
          </p>
          <SectionNavLinks pageView={pageView} onSelect={(id) => { if (pageView === "components") { setCatalogQuery(""); setCatalogTier("All"); setCatalogArea("All areas"); setActiveComponentId(id); } }} />
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-5xl px-4 sm:px-8 lg:px-12 py-8 lg:py-12">
          <div className="mb-8 mr-4 inline-flex rounded-full p-1" role="tablist" aria-label="Design system sections" style={{ background: "var(--md-sys-color-dark-secondary)" }}>
            {(["components", "foundations"] as const).map((view) => <button key={view} type="button" role="tab" aria-selected={pageView === view} onClick={() => { setPageView(view); setActiveComponentId(null); setCatalogQuery(""); setCatalogTier("All"); setCatalogArea("All areas"); }} className="rounded-full px-4 py-2 text-sm font-semibold capitalize" style={{ background: pageView === view ? "var(--md-sys-color-neonindigo)" : "transparent", color: pageView === view ? "var(--md-sys-color-text-on-accent)" : "var(--md-sys-color-text-muted)" }}>{view === "components" ? "Components" : "Foundations"}</button>)}
          </div>

          {pageView === "foundations" && <>
          {/* ── Voice & Tone ─────────────────────────────────────────── */}
          <SectionHeader
            id="voice-tone"
            title="Voice & Tone"
            subtitle="How Halosight speaks — across UI copy, AI outputs, and empty states."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-16">
            {[
              {
                label: "We are",
                items: ["Confident, not arrogant", "Intelligent, not jargon-heavy", "Direct, not terse", "Helpful, not hand-holding"],
              },
              {
                label: "We are not",
                items: ["Enterprise-bloated", "Mysterious or opaque about AI", "Chatty or over-explaining", "Passive or hedge-everything"],
              },
              {
                label: "UI copy principles",
                items: ["Actions over states — \"Log a Visit\" not \"Visit Recording\"", "Verbs lead buttons", "Errors explain what to do next", "AI outputs are always inspectable"],
              },
              {
                label: "AI output tone",
                items: ["Grounded in evidence, never fabricated", "Presented as suggestion, not command", "Confidence shown explicitly", "Source always traceable"],
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-6"
                style={{ background: "var(--md-sys-color-dark-secondary)", border: "1px solid var(--md-sys-color-dark-tertiary)" }}
              >
                <p className="text-[13px] font-semibold mb-3" style={{ color: "var(--md-sys-color-neonindigo)" }}>{card.label}</p>
                <ul className="flex flex-col gap-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--md-sys-color-text-muted)" }}>
                      <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ background: "var(--md-sys-color-text-disabled)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Color System ──────────────────────────────────────────── */}
          <SectionHeader
            id="color"
            title="Color System"
            subtitle="M3 color roles — edit globals.css to update every swatch automatically."
          />

          {/* ── Base Brand Colors ────────────────────────────────────── */}
          <BrandSectionHeader id="base-brand-colors" title="Base Brand Colors" />

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Neon Indigo</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>Interactive &amp; Accent Color</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--md-sys-color-text-muted)" }}>
              Use for interactive elements, hover states, active states, and visual accents that guide user attention without demanding immediate action.
            </p>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--md-sys-color-neonindigo-light" label="light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-neonindigo"       label="base"  textColor="#111420" />
              <ColorSwatch token="--md-sys-color-neonindigo-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Indigo</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>Secondary Actions &amp; Links</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--md-sys-color-text-muted)" }}>
              Use for secondary call-to-action buttons (Date CTAs), text links, eyebrow text, and exploratory actions that support the primary user journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--md-sys-color-indigo-light" label="light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-indigo"       label="base" />
              <ColorSwatch token="--md-sys-color-indigo-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Coral Ember</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>Primary CTA &amp; Action Color</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--md-sys-color-text-muted)" }}>
              Use for primary call-to-action buttons (Marriage CTAs), important alerts, and high-priority actions that demand immediate attention.
            </p>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--md-sys-color-brand-coral-light" label="light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-brand-coral"       label="base" />
              <ColorSwatch token="--md-sys-color-brand-coral-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Teal</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>Alternative Secondary &amp; Highlights</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--md-sys-color-text-muted)" }}>
              Use for alternative secondary actions, featured badges, blog card highlights, and supportive elements that need visual distinction.
            </p>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--md-sys-color-brand-teal-light" label="light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-brand-teal"       label="base" />
              <ColorSwatch token="--md-sys-color-brand-teal-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Pink</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--md-sys-color-text-primary)" }}>Special Accents &amp; Badges</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--md-sys-color-text-muted)" }}>
              Use sparingly for special promotional badges, featured items, limited-time offers, or unique visual accents that need to stand out.
            </p>
            <div className="flex">
              <ColorSwatch token="--md-sys-color-brand-pink" label="base" />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Light Theme Colors ────────────────────────────────────── */}
          <BrandSectionHeader id="light-theme-colors" title={theme === "light" ? "Dark Theme Colors" : "Light Theme Colors"} />

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--md-sys-color-surface-white" label="surface-white" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-surface-light" label="surface-light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-surface-gray"  label="surface-gray"  textColor="#111420" />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Dark Theme Colors ─────────────────────────────────────── */}
          <BrandSectionHeader id="dark-theme-colors" title={theme === "light" ? "Light Theme Colors" : "Dark Theme Colors"} />

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--md-sys-color-dark-void"      label="dark-void"      />
              <ColorSwatch token="--md-sys-color-dark-base"      label="dark-base"      />
              <ColorSwatch token="--md-sys-color-dark-primary"   label="dark-primary"   />
              <ColorSwatch token="--md-sys-color-dark-secondary" label="dark-secondary" />
              <ColorSwatch token="--md-sys-color-dark-tertiary"  label="dark-tertiary"  />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Text Colors ───────────────────────────────────────────── */}
          <BrandSectionHeader id="text-colors" title="Text Colors" />

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--md-sys-color-text-primary"   label="text-primary"   textColor="#111420" />
              <ColorSwatch token="--md-sys-color-text-secondary" label="text-secondary"  textColor="#111420" />
              <ColorSwatch token="--md-sys-color-text-muted"     label="text-muted"     textColor="#111420" />
              <ColorSwatch token="--md-sys-color-text-disabled"  label="text-disabled"  />
              <ColorSwatch token="--md-sys-color-text-inverse"   label="text-inverse"   />
            </div>
          </div>

          <div className="mb-16" />

          <div className="mb-16" />

          {/* ── Semantic Colors ───────────────────────────────────────── */}
          <BrandSectionHeader id="semantic-colors" title="Semantic Colors" />

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Success</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--md-sys-color-success-light" label="light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-success"       label="base"  textColor="#111420" />
              <ColorSwatch token="--md-sys-color-success-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Warning</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--md-sys-color-warning-light" label="light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-warning"       label="base"  textColor="#111420" />
              <ColorSwatch token="--md-sys-color-warning-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Error</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--md-sys-color-error-light" label="light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-error"       label="base" />
              <ColorSwatch token="--md-sys-color-error-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Info</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--md-sys-color-info-light" label="light" textColor="#111420" />
              <ColorSwatch token="--md-sys-color-info"       label="base"  textColor="#111420" />
              <ColorSwatch token="--md-sys-color-info-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Data Colors</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--md-sys-color-data-account"  label="account"   />
              <ColorSwatch token="--md-sys-color-data-recency"  label="recency"   textColor="#111420" />
              <ColorSwatch token="--md-sys-color-data-crm-sync" label="crm-sync"  textColor="#111420" />
              <ColorSwatch token="--md-sys-color-data-review"   label="review"    textColor="#111420" />
            </div>
          </div>

          <div className="mb-16" />

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Recording</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--md-sys-color-recording" label="base" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Extended Palette</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--md-ref-palette-ext-cyan"   label="cyan"   textColor="#111420" />
              <ColorSwatch token="--md-ref-palette-ext-lime"   label="lime"   textColor="#111420" />
              <ColorSwatch token="--md-ref-palette-ext-orange" label="orange" textColor="#111420" />
              <ColorSwatch token="--md-ref-palette-ext-gold"   label="gold"   textColor="#111420" />
              <ColorSwatch token="--md-ref-palette-ext-violet" label="violet" />
              <ColorSwatch token="--md-ref-palette-ext-rose"   label="rose"   textColor="#111420" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Gradients</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <GradientSwatch token="--gradient-login"      label="Login Background" />
              <GradientSwatch token="--gradient-ai-dark"    label="AI Gradient — Dark" />
              <GradientSwatch token="--gradient-ai-light"   label="AI Gradient — Light" />
              <GradientSwatch token="--gradient-hero"       label="Hero Background" />
              <GradientSwatch token="--gradient-card"       label="Card Background" />
              <GradientSwatch token="--gradient-text-brand" label="Text Gradient — Brand" textGradient />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>Alpha Colors</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <AlphaSwatch
                token="--md-sys-color-alpha-white-10"
                label="White 10%"
                description="Borders"
              />
              <AlphaSwatch
                token="--md-sys-color-alpha-white-18"
                label="White 18%"
                description="Active fields · emphasized containers"
              />
              <AlphaSwatch
                token="--md-sys-color-alpha-neonindigo-10"
                label="Purple 10%"
                description="Backgrounds"
              />
              <AlphaSwatch
                token="--md-sys-color-alpha-neonindigo-glass"
                label="Purple Glass"
                description="Backgrounds"
                glass
              />
              <AlphaSwatch
                token="--md-sys-color-alpha-dark-glass"
                label="Dark Glass"
                description="Backgrounds"
                glass
              />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Typography ────────────────────────────────────────────── */}
          <SectionHeader
            id="typography"
            title="Typography"
            subtitle="Roboto Slab for headings. Barlow for all UI text."
          />

          <SubHeader title="Heading Levels" />
          <div className="mb-10">
            <TypeSpecimen cssClass="heading-1" font="Roboto Slab" weight="700" size="60px" lineHeight="66px" sample="Heading 1" />
            <TypeSpecimen cssClass="heading-2" font="Roboto Slab" weight="700" size="48px" lineHeight="58px" sample="Heading 2" />
            <TypeSpecimen cssClass="heading-3" font="Roboto Slab" weight="700" size="36px" lineHeight="43px" sample="Heading 3" />
            <TypeSpecimen cssClass="heading-4" font="Roboto Slab" weight="700" size="24px" lineHeight="31px" sample="Heading 4" />
            <TypeSpecimen cssClass="heading-5" font="Roboto Slab" weight="700" size="20px" lineHeight="26px" sample="Heading 5" />
            <TypeSpecimen cssClass="heading-6" font="Roboto Slab" weight="700" size="18px" lineHeight="24px" sample="Heading 6" />
          </div>

          <SubHeader title="Body Text" />
          <div className="mb-10">
            <TypeSpecimen cssClass="text-xl"   font="Barlow" weight="400" size="20px" lineHeight="30px" sample="Body large text — visited Walmart Corporation 2 weeks ago." />
            <TypeSpecimen cssClass="text-lg"   font="Barlow" weight="400" size="18px" lineHeight="27px" sample="Body medium text — discussed Q3 expansion and service contract renewal." />
            <TypeSpecimen cssClass="text-base" font="Barlow" weight="400" size="16px" lineHeight="24px" sample="Body base text — follow-up scheduled for next week with Tom." />
            <TypeSpecimen cssClass="text-sm"   font="Barlow" weight="400" size="14px" lineHeight="21px" sample="Body small text — 56.7 mi · Visited 3 days ago" />
            <TypeSpecimen cssClass="text-xs"   font="Barlow" weight="400" size="12px" lineHeight="18px" sample="Body extra small text — Last synced 4 minutes ago" />
          </div>

          <SubHeader title="Body Text — Bold" />
          <div className="mb-10">
            <TypeSpecimen cssClass="text-xl-bold"   font="Barlow" weight="600" size="20px" lineHeight="30px" sample="Body large text — visited Walmart Corporation 2 weeks ago." />
            <TypeSpecimen cssClass="text-lg-bold"   font="Barlow" weight="600" size="18px" lineHeight="27px" sample="Body medium text — discussed Q3 expansion and service contract renewal." />
            <TypeSpecimen cssClass="text-base-bold" font="Barlow" weight="600" size="16px" lineHeight="24px" sample="Body base text — follow-up scheduled for next week with Tom." />
            <TypeSpecimen cssClass="text-sm-bold"   font="Barlow" weight="600" size="14px" lineHeight="21px" sample="Body small text — 56.7 mi · Visited 3 days ago" />
            <TypeSpecimen cssClass="text-xs-bold"   font="Barlow" weight="600" size="12px" lineHeight="18px" sample="Body extra small text — Last synced 4 minutes ago" />
          </div>

          <SubHeader title="Subheadlines & Special Text" />
          <div className="mb-16">
            <TypeSpecimen cssClass="subheadline-lg" font="Barlow" weight="400" size="24px" lineHeight="36px" sample="Subheadline text" />
            <TypeSpecimen cssClass="subheadline-md" font="Barlow" weight="400" size="20px" lineHeight="30px" sample="Subheadline text" />
            <TypeSpecimen cssClass="eyebrow-text"   font="Barlow" weight="600" size="14px" lineHeight="20px" sample="FEATURES" extra="uppercase · ls 1px" />
          </div>

          <div id="labels-captions"><SubHeader title="Labels & Captions" /></div>
          <div className="mb-16">
            <TypeSpecimen cssClass="label-serif" font="Roboto Slab" weight="400" size="10px" lineHeight="14px" sample="Home · Accounts · Settings" extra="nav labels · timestamps · micro UI" />
            <TypeSpecimen cssClass="text-2xs"    font="Barlow"      weight="400" size="10px" lineHeight="14px" sample="Last synced · 4 min ago · 0.3 mi" extra="badges · data labels · captions" />
          </div>

          {/* ── Shape ─────────────────────────────────────────────────── */}
          <SectionHeader
            id="shape"
            title="Shape & Radius"
            subtitle="M3 shape scale — None / Extra-Small / Small / Medium / Large / Extra-Large / Full."
          />
          <div className="flex items-end gap-8 flex-wrap mb-16">
            <RadiusSwatch radius="0px"   token="--radius-none" value="0px   · M3: None" />
            <RadiusSwatch radius="4px"   token="--radius-xs"   value="4px   · M3: Extra Small" />
            <RadiusSwatch radius="8px"   token="--radius-sm"   value="8px   · M3: Small" />
            <RadiusSwatch radius="12px"  token="--radius-md"   value="12px  · M3: Medium" />
            <RadiusSwatch radius="16px"  token="--radius-lg"   value="16px  · M3: Large" />
            <RadiusSwatch radius="28px"  token="--radius-xl"   value="28px  · M3: Extra Large" />
            <RadiusSwatch radius="100px" token="--radius-full" value="100px · M3: Full" />
          </div>

          {/* ── Spacing ───────────────────────────────────────────────── */}
          <SectionHeader
            id="spacing"
            title="Spacing"
            subtitle="4px base grid — 10 steps. Use these tokens everywhere; never hardcode pixel values."
          />
          <div className="max-w-sm mb-16">
            <SpacingSwatch token="--spacing-1"  value="4px" />
            <SpacingSwatch token="--spacing-2"  value="8px" />
            <SpacingSwatch token="--spacing-3"  value="12px" />
            <SpacingSwatch token="--spacing-4"  value="16px" />
            <SpacingSwatch token="--spacing-5"  value="20px" />
            <SpacingSwatch token="--spacing-6"  value="24px" />
            <SpacingSwatch token="--spacing-8"  value="32px" />
            <SpacingSwatch token="--spacing-10" value="40px" />
            <SpacingSwatch token="--spacing-12" value="48px" />
            <SpacingSwatch token="--spacing-16" value="64px" />
          </div>

          {/* ── Elevation ─────────────────────────────────────────────── */}
          <SectionHeader
            id="elevation"
            title="Elevation"
            subtitle="M3 tonal elevation — 5 levels. Halosight uses shadow rather than tint on dark surfaces."
          />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 mb-16">
            <ElevationSwatch level={0} token="--elevation-0" shadow="none" />
            <ElevationSwatch level={1} token="--elevation-1" shadow="0 1px 2px rgba(0,0,0,0.35), 0 1px 3px 1px rgba(0,0,0,0.2)" />
            <ElevationSwatch level={2} token="--elevation-2" shadow="0 1px 2px rgba(0,0,0,0.35), 0 2px 6px 2px rgba(0,0,0,0.2)" />
            <ElevationSwatch level={3} token="--elevation-3" shadow="0 4px 8px 3px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.35)" />
            <ElevationSwatch level={4} token="--elevation-4" shadow="0 6px 10px 4px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.35)" />
          </div>

          </>}
          {pageView === "components" && <>
          {activeComponentId ? (
            <button type="button" onClick={() => setActiveComponentId(null)} className="mb-6 rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "var(--md-sys-color-dark-secondary)", color: "var(--md-sys-color-neonindigo)" }}>← All components</button>
          ) : <div id="component-catalog" className="mb-8 rounded-2xl p-5" style={{ background: "var(--md-sys-color-dark-secondary)", border: "1px solid var(--md-sys-color-dark-tertiary)" }}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div><h1 className="text-2xl font-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>Component library</h1><p className="mt-1 text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>Browse by Atomic tier, search by name, then open a component to inspect its variants and handoff details.</p></div>
              <input value={catalogQuery} onChange={(e) => setCatalogQuery(e.target.value)} placeholder="Search components" aria-label="Search components" className="h-10 w-full lg:w-72 rounded-full px-4 text-sm outline-none" style={{ background: "var(--md-sys-color-background)", border: "1px solid var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-primary)" }} />
            </div>
            <p className="mt-4 text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>{COMPONENT_SECTIONS.filter((item) => (catalogTier === "All" || TIER_BY_SECTION[item.id] === catalogTier) && (catalogArea === "All areas" || (AREA_BY_SECTION[item.id] ?? "Core UI") === catalogArea) && `${item.label} ${item.id} ${AREA_BY_SECTION[item.id] ?? "Core UI"}`.toLowerCase().includes(catalogQuery.trim().toLowerCase())).length} components shown · select a card to open its live examples and implementation notes.</p>
            <div className="flex gap-2 flex-wrap mt-3" role="group" aria-label="Filter components by Atomic tier">
              {(["All", "Atoms", "Molecules", "Organisms", "Templates"] as AtomicTier[]).map((tier) => <button key={tier} type="button" onClick={() => setCatalogTier(tier)} className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: catalogTier === tier ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-tertiary)", color: catalogTier === tier ? "var(--md-sys-color-text-on-accent)" : "var(--md-sys-color-text-muted)" }}>{tier}{tier === "Templates" ? " · coming later" : ""}</button>)}
            </div>
            <div className="flex gap-2 flex-wrap mt-3" role="group" aria-label="Filter components by product area">
              {["All areas", "Accounts", "Action items", "Activity", "Capture", "Chat", "Feedback", "AI insights", "Core UI"].map((area) => <button key={area} type="button" onClick={() => setCatalogArea(area)} className="rounded-full px-3 py-1.5 text-xs" style={{ background: catalogArea === area ? "var(--md-sys-color-dark-tertiary)" : "transparent", color: catalogArea === area ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)", border: "1px solid var(--md-sys-color-dark-tertiary)" }}>{area}</button>)}
            </div>
            <div className="mt-5 space-y-6">
              {(["Atoms", "Molecules", "Organisms", "Templates"] as const).filter((tier) => catalogTier === "All" || catalogTier === tier).map((tier) => {
                const items = COMPONENT_SECTIONS.filter((item) => TIER_BY_SECTION[item.id] === tier && (catalogArea === "All areas" || (AREA_BY_SECTION[item.id] ?? "Core UI") === catalogArea) && `${item.label} ${item.id} ${AREA_BY_SECTION[item.id] ?? "Core UI"}`.toLowerCase().includes(catalogQuery.trim().toLowerCase()));
                if (!items.length) return null;
                return <section key={tier} aria-label={tier}>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--md-sys-color-text-disabled)" }}>{tier} <span>({items.length})</span></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveComponentId(item.id);
                          requestAnimationFrame(() => {
                            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          });
                        }}
                        className="text-left rounded-xl p-4 transition-colors hover:border-[var(--md-sys-color-neonindigo)]"
                        style={{ background: "var(--md-sys-color-background)", border: "1px solid var(--md-sys-color-dark-tertiary)" }}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <strong className="text-sm" style={{ color: "var(--md-sys-color-text-primary)" }}>{item.label}</strong>
                          <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--md-sys-color-neonindigo)" }}>{tier}</span>
                        </span>
                        <span className="mt-1 block text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                          {AREA_BY_SECTION[item.id] || "Core UI"} · Open live preview and handoff details →
                        </span>
                      </button>
                    ))}
                  </div>
                </section>;
              })}
            </div>
            {catalogTier !== "Templates" && !COMPONENT_SECTIONS.some((item) => (catalogTier === "All" || TIER_BY_SECTION[item.id] === catalogTier) && (catalogArea === "All areas" || (AREA_BY_SECTION[item.id] ?? "Core UI") === catalogArea) && `${item.label} ${item.id} ${AREA_BY_SECTION[item.id] ?? "Core UI"}`.toLowerCase().includes(catalogQuery.trim().toLowerCase())) && <p className="mt-4 text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>No components match those filters.</p>}
            {catalogTier === "Templates" && <p className="mt-4 text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>There are no screen-level templates in the current library yet. This tier is reserved for full page compositions.</p>}
          </div>}
          <CatalogContextBridge query={catalogQuery} tier={catalogTier} activeId={activeComponentId}>
          {/* ── Buttons ───────────────────────────────────────────────── */}
          <CatalogSection id="buttons" title="Buttons">
          <SectionHeader
            id="buttons-heading"
            title="Buttons"
            subtitle="One Button component: Filled (coral, indigo, danger), Tonal, Outlined and Text, in three heights, full width, and with a loading state."
          />
          <div className="space-y-8 mb-16">
            <div>
              <SubHeader title="Filled Button" />
              <p className="text-sm mb-4 max-w-2xl" style={{ color: "var(--md-sys-color-text-muted)" }}>
                The one button (<code className="font-mono">components/ui/Button.tsx</code>). Coral is the default main action, indigo is for sheet CTAs that create something, danger is for irreversible actions. Every fill is a full pill (<code className="font-mono">--radius-full</code>) with font weight 600.
              </p>
              {/* Each button carries its own caption, so a label can never describe a neighbour. */}
              {([
                { title: "Fill", items: [
                  { node: <Button>Create a lead</Button>, name: "coral (default)", spec: "bg brand-coral-dark · text on-coral" },
                  { node: <Button fill="indigo">Create a lead</Button>, name: "indigo", spec: "bg neonindigo · text on-accent" },
                  { node: <Button fill="danger">Send deletion request</Button>, name: "danger", spec: "bg error · irreversible only" },
                ] },
                { title: "Size", items: [
                  { node: <Button size="lg">Create a lead</Button>, name: "lg · 52", spec: "sheet CTA · font 16" },
                  { node: <Button>Log a Visit</Button>, name: "md · 48 (default)", spec: "font 15 · padding 0 24" },
                  { node: <Button size="sm">Log a Visit</Button>, name: "sm · 44", spec: "font 14 · padding 0 20" },
                ] },
                { title: "State", items: [
                  { node: <Button icon={<Icon name="schedule" size={16} style={{ color: "var(--md-sys-color-text-on-coral)" }} />}>With Icon</Button>, name: "icon", spec: "any node before the label" },
                  { node: <Button disabled>Disabled</Button>, name: "disabled", spec: "30% opacity · not tappable" },
                ] },
              ] as { title: string; items: { node: React.ReactNode; name: string; spec: string }[] }[]).map((group) => (
                <div key={group.title} className="mb-6">
                  <p className="text-[11px] font-semibold uppercase mb-3" style={{ color: "var(--md-sys-color-text-muted)", letterSpacing: "0.08em" }}>{group.title}</p>
                  <div className="flex items-start gap-x-6 gap-y-5 flex-wrap">
                    {group.items.map((it) => (
                      <div key={it.name} className="flex flex-col items-start gap-2">
                        {it.node}
                        <div className="pl-1">
                          <p className="text-xs font-mono" style={{ color: "var(--md-sys-color-text-secondary)" }}>{it.name}</p>
                          <p className="text-[11px] font-mono" style={{ color: "var(--md-sys-color-text-muted)" }}>{it.spec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-4 max-w-xs"><Button fullWidth keepFocus>Full width</Button></div>
              <TokenLabel name="fullWidth stretches to its container · keepFocus keeps the keyboard up when the button sits under a text field" value="" />
              <div className="mt-6"><LoadingRow variant="filled" label="Log a Visit" loadingLabel="Logging" /></div>
              <TokenLabel name="Loading — dots only keeps the button's exact size · dots + label for longer waits" value="ThinkingDots sm · color: currentColor (text.on-coral here) · not dimmed, not tappable (aria-busy)" />
            </div>

            <div>
              <SubHeader title="Filled Tonal Button" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <Button variant="tonal">View Transcript</Button>
                <Button variant="tonal" tone="success">Mark Complete</Button>
                <Button variant="tonal" size="sm">View Transcript</Button>
                <Button variant="tonal" tone="success" size="sm">Mark Complete</Button>
              </div>
              <TokenLabel name="default · background: --md-sys-color-dark-tertiary · color: --md-sys-color-neonindigo    tone=success · background: --md-sys-color-dark-secondary · color: --md-sys-color-success" value="heights as Filled (md 48 · sm 44) · radius: --radius-full" />
              <div className="mt-6"><LoadingRow variant="tonal" label="View Transcript" loadingLabel="Opening" /></div>
              <TokenLabel name="Loading" value="dots take the label colour (neonindigo on tonal)" />
            </div>

            <div>
              <SubHeader title="Outlined Button" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <Button variant="outlined">Edit</Button>
                <Button variant="outlined" tone="danger">Reject</Button>
                <Button variant="outlined" tone="indigo">Regenerate</Button>
                <Button variant="outlined" size="sm">Edit</Button>
                <Button variant="outlined" tone="danger" size="sm">Reject</Button>
                <Button variant="outlined" tone="indigo" size="sm">Regenerate</Button>
              </div>
              <TokenLabel name="border: 1.5px --md-sys-color-dark-tertiary (tone=danger brand-coral · tone=indigo neonindigo) · radius: --radius-full" value="heights as Filled · background: transparent" />
              <div className="mt-6 flex flex-col gap-3">
                <LoadingRow variant="outlined" label="Edit" loadingLabel="Saving" />
                <LoadingRow variant="outlined" tone="danger" label="Reject" loadingLabel="Rejecting" />
                <LoadingRow variant="outlined" tone="indigo" label="Regenerate" loadingLabel="Regenerating" />
              </div>
              <TokenLabel name="Loading" value="border stays; dots take the outline colour (default / danger / indigo)" />
            </div>

            <div>
              <SubHeader title="Text Button" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <Button variant="text">Log in with Email</Button>
                <Button variant="text" tone="muted">View transcript →</Button>
                <Button variant="text" size="sm">Log in with Email</Button>
                <Button variant="text" tone="muted" size="sm">View transcript →</Button>
              </div>
              <TokenLabel name="color: --md-sys-color-neonindigo (tone=muted --md-sys-color-text-muted) · background: none" value="height: 40px (sm 36) · font: 600 14px" />
              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <Button variant="text" loading>Log in with Email</Button>
                <Button variant="text" loading loadingLabel="Signing in">Log in with Email</Button>
                <TryItButton variant="text" label="Log in — try it" loadingLabel="Signing in" />
              </div>
              <TokenLabel name="Loading" value="no fill, so the dots are the only thing that changes" />
            </div>

            <div>
              <SubHeader title="Sign-in Buttons (Login Screen)" />
              <p className="text-sm mb-4 max-w-xl" style={{ color: "var(--md-sys-color-text-muted)" }}>
                White pills with the provider&apos;s logo and a dark label, the same for every provider. They are <code className="font-mono">Button</code> with <code className="font-mono">fill=&quot;white&quot;</code> and <code className="font-mono">size=&quot;xl&quot;</code>.
              </p>
              <div className="flex flex-col gap-3 max-w-sm p-6" style={{ background: "var(--gradient-login)", borderRadius: "var(--radius-lg)" }}>
                <Button fill="white" size="xl" fullWidth icon={<Image src="/google-g.svg" alt="" width={20} height={20} />}>Continue with Google</Button>
                <Button fill="white" size="xl" fullWidth icon={<Image src="/microsoft-logo.svg" alt="" width={20} height={20} />}>Continue with Microsoft</Button>
                <Button fill="white" size="xl" fullWidth icon={<Image src="/apple-logo.svg" alt="" width={18} height={22} style={{ height: "auto" }} />}>Sign in with Apple</Button>
              </div>
              <TokenLabel name="fill=white · background: --md-sys-color-surface-static-white · color: --md-sys-color-text-on-white · radius: --radius-full" value="size xl · height 56px · font 600 16px · same white in light and dark (brand requirement) · logo is the icon" />
              <div className="flex flex-col gap-3 max-w-sm mt-6">
                <Button fill="white" size="xl" fullWidth loading loadingLabel="Signing in…">Continue with Google</Button>
              </div>
              <TokenLabel name="Loading — the button keeps its width and shows the dots plus “Signing in…”" value="dots use the button's text colour" />
            </div>

            <div>
              <SubHeader title="Loading Animation" />
              <p className="text-sm mb-4 max-w-xl" style={{ color: "var(--md-sys-color-text-muted)" }}>
                Shuffle: a short, a medium and a tall capsule swap places sideways. Heights never change, so it reads as work in progress, not a voice level. Replaces the spinning circle; colour is the surrounding text colour.
              </p>
              <DotsOnSurfaces />
              <TokenLabel name="ThinkingDots — Shuffle · 3 capsules · 2.1s loop · continuous easing, no stops" value="sm 4px · 7/12/16 · md 5px · 10/17/24 · lg 6px · 13/23/32 · reduced motion: static" />
            </div>
          </div>

          </CatalogSection>
          {/* ── Badges ────────────────────────────────────────────────── */}
          <CatalogSection id="badges" title="Badges & Chips">
          <SectionHeader
            id="badges-heading"
            title="Badges & Chips"
            subtitle="Count badges, status chips, and filter chips."
          />
          <div className="space-y-8 mb-16">
            <div>
              <SubHeader title="Count Badges" />
              <div className="flex items-center gap-4">
                {[7, 14, 24, 142].map((n) => (
                  <span key={n} className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-primary)" }}>
                    {n}
                  </span>
                ))}
              </div>
              <TokenLabel name="background: --md-sys-color-dark-tertiary · radius: --radius-full" value="font: 700 11px" />
            </div>
            <div>
              <SubHeader title="Status Chips" />
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--md-sys-color-dark-secondary)", color: "var(--md-sys-color-success)" }}>Visited Today</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-neonindigo)" }}>In Progress</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--md-sys-color-dark-secondary)", color: "var(--md-sys-color-warning)" }}>At Risk</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--md-sys-color-dark-secondary)", color: "var(--md-sys-color-error)" }}>Overdue</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-muted)" }}>No Activity</span>
              </div>
              <TokenLabel name="radius: --radius-full · font: 600 12px" value="dark-secondary / dark-tertiary bg · semantic text color per status" />
            </div>
          </div>

          </CatalogSection>
          {/* ── Account List Item (component area) ─────────────────────── */}
          <ComponentArea
            id="account-list-item"
            name="Account List Item"
            kind="Library"
            description="One row in an account list. A single widget with a variant for each place it appears; the count badges are a separate sub-component it composes."
            source="components/accounts/AccountListItem.tsx"
            flutter="accounts_view_account_list_item.dart"
            anatomy="name · meta lines · type pill · count badges (owned) — name · owner (crm)"
          >
            <AreaGroup title="Variants" count={3}>
              <VariantCard
                name="Owned"
                prop='variant="owned"'
                status="default"
                description="A company in the rep's own portfolio. Tapping opens the account."
                notes={[
                  "Name, distance • location, and last-visited recency",
                  "Lead / Needs Info pill on top right when relevant",
                  "Risk and task badges bottom right; each hides at 0",
                  "Separator inset 16px each side",
                ]}
              >
                <div className="flex flex-col">
                  {sampleOwned.map((account, i) => (
                    <AccountListItem key={account.id} account={account} isLast={i === sampleOwned.length - 1} />
                  ))}
                </div>
              </VariantCard>

              <VariantCard
                name="Company-wide (CRM)"
                prop='variant="crm"'
                description="A CRM account owned by another rep, shown in company-wide search results. Calls onSelect instead of navigating."
                notes={[
                  "Name plus “Owner: <rep name>” and a trailing chevron — no distance, address, visit line, or badges",
                  "Sits in an ListCard: dark-primary fill, hairline border, radius-lg, no extra top/bottom padding; trailing chevron; full-width separators",
                  "Props: ownerName, onSelect",
                ]}
              >
                <div className="py-4"><ListCard className="mx-4">
                  {sampleOwned.map((account, i) => (
                    <AccountListItem
                      key={account.id}
                      variant="crm"
                      account={account}
                      ownerName={["Linda F.", "Carlos R.", "Dana M."][i % 3]}
                      isLast={i === sampleOwned.length - 1}
                      onSelect={() => {}}
                    />
                  ))}
                </ListCard></div>
              </VariantCard>

              <VariantCard
                name="Home"
                prop='variant="home"'
                description="The compact row in the home screen's Companies card. Same card as the company-wide variant, but these are the rep's own accounts, so risks and tasks show."
                notes={[
                  "Name plus “distance · address” — no visit line",
                  "Risk and task badges on the right, each hidden at 0; no chevron so the badges get the room",
                  "Warning icon when a lead still needs info",
                  "Sits in an ListCard; 71px rows",
                ]}
              >
                <div className="py-4"><ListCard className="mx-4">
                  {sampleHome.map((account, i) => (
                    <AccountListItem key={account.id} variant="home" account={account} isLast={i === sampleHome.length - 1} />
                  ))}
                </ListCard></div>
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Sub-components" count={1}>
              <SubComponentCard
                name="Count Badge"
                source="components/accounts/CountBadge.tsx"
                usedBy={["Account List Item (owned)", "Account List Item (home)"]}
                description="Icon + number pill. Renders nothing at 0 or undefined, so there is no grey or empty state."
                notes={[
                  "22.5px tall, full radius; number is Barlow 500 11.5px",
                  "Risk: error at 18% fill, error-light icon + number",
                  "Tasks: neonindigo at 20% fill, neonindigo-light icon + number",
                  "Pair with 8px between badges",
                ]}
              >
                <StateSample caption='tone="risk" count=1'><CountBadge tone="risk" count={1} label="open risks" /></StateSample>
                <StateSample caption='tone="tasks" count=2'><CountBadge tone="tasks" count={2} label="open tasks" /></StateSample>
                <StateSample caption="both, 8px apart">
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <CountBadge tone="risk" count={2} label="open risks" />
                    <CountBadge tone="tasks" count={5} label="open tasks" />
                  </div>
                </StateSample>
                <StateSample caption="count=0 → renders nothing">
                  <span style={{ fontSize: 12, color: "var(--md-sys-color-text-disabled)" }}>(hidden)</span>
                  <CountBadge tone="risk" count={0} label="open risks" />
                </StateSample>
              </SubComponentCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Drawer (component area) ────────────────────────────────── */}
          <ComponentArea
            id="drawer"
            name="Drawer"
            kind="Library"
            description="The one bottom drawer every sheet in the app uses: same fill, handle, scrim and motion. The panel is dark-primary; fields inside it step down to dark-base (inset) or up to dark-secondary (raised)."
            source="components/ui/Drawer.tsx"
            flutter="halosight_drawer.dart (themed showModalBottomSheet)"
            anatomy="scrim · panel (dark-primary, radius-xl top) · handle · content (DrawerBody) · optional DrawerHeader"
          >
            <AreaGroup title="Variants" count={2}>
              <VariantCard
                name="Content drawer"
                prop="<Drawer> + <DrawerBody>"
                status="default"
                description="Handle, then content. Used for Add an item, New Lead, Add a note, account picker and the action item view."
                notes={[
                  "Fill color.dark.primary, radius-xl on the top corners, 40×4 handle",
                  "DrawerBody: 16px sides, 12px top, 32px bottom",
                  "Scrim: --md-sys-color-alpha-scrim; tap to close",
                  "Max height 88%; scrolls when taller",
                ]}
              >
                <div style={{ background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-xl) var(--radius-xl) 0 0", margin: "var(--spacing-4) 0 0" }}>
                  <DrawerHandle />
                  <DrawerBody>
                    <h4 style={{ fontSize: 22, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: "var(--md-sys-color-text-primary)" }}>Add an item</h4>
                    <div style={{ marginTop: "var(--spacing-4)", height: 50, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-dark-secondary)", padding: "0 var(--spacing-5)", display: "flex", alignItems: "center", fontSize: 15, color: "var(--md-sys-color-text-disabled)" }}>What needs to be done?</div>
                  </DrawerBody>
                </div>
              </VariantCard>

              <VariantCard
                name="Edit drawer"
                prop="<DrawerHeader> inside the panel"
                description="Adds a sticky Cancel | title | check header. Cancel discards, the check saves. Fields are inset: dark-base fill, tertiary border, neonindigo while focused."
                notes={["Header title is Roboto Slab 18/700", "Cancel is muted; the check is neonindigo", "Counters (31/200) sit right-aligned under each field"]}
              >
                <div style={{ background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-xl) var(--radius-xl) 0 0", margin: "var(--spacing-4) 0 0" }}>
                  <DrawerHandle />
                  <DrawerHeader title="Edit item" onCancel={() => {}} onConfirm={() => {}} />
                  <div style={{ padding: "var(--spacing-5) var(--spacing-4) var(--spacing-6)" }}>
                    <div style={{ height: 50, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-dark-base)", border: "1.5px solid var(--md-sys-color-neonindigo)", padding: "0 var(--spacing-5)", display: "flex", alignItems: "center", fontSize: 17, color: "var(--md-sys-color-text-primary)" }}>Enable Add Account feature flag</div>
                    <p className="text-right" style={{ marginTop: "var(--spacing-1)", fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>31/200</p>
                  </div>
                </div>
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Sub-components" count={3}>
              <SubComponentCard
                name="Drawer Handle"
                source="components/ui/Drawer.tsx"
                usedBy={["Drawer"]}
                description="The grab bar at the top of every drawer."
                notes={["40×4, radius-full, color.dark.tertiary", "12px above, 4px below"]}
              >
                <div className="w-48"><DrawerHandle /></div>
              </SubComponentCard>
              <SubComponentCard
                name="Drawer Header"
                source="components/ui/Drawer.tsx"
                usedBy={["Action Item Drawer (edit)"]}
                description="Cancel on the left, a serif title in the middle, a check on the right. Sticks to the top while the drawer scrolls."
                notes={["Hairline underneath (alpha-white-10)", "44px minimum tap targets"]}
              >
                <div className="w-72"><DrawerHeader title="Edit item" onCancel={() => {}} onConfirm={() => {}} /></div>
              </SubComponentCard>
              <SubComponentCard
                name="Drawer Backdrop (scrim)"
                source="components/ui/Drawer.tsx"
                usedBy={["Drawer", "Alert Dialog"]}
                description="The dim behind a drawer or dialog. One token for every overlay, so they all dim the same amount."
                notes={["--md-sys-color-alpha-scrim: 60% black in dark, 32% ink in light", "Fades in over 200ms"]}
              >
                <div style={{ width: 160, height: 56, borderRadius: "var(--radius-md)", background: "var(--md-sys-color-alpha-scrim)", border: "1px solid var(--md-sys-color-dark-tertiary)" }} />
              </SubComponentCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Action Item List (component area) ──────────────────────── */}
          <ComponentArea
            id="action-item-list"
            name="Action Item List"
            kind="Library"
            description="The list of open action items, shared by the home, account and interaction screens. One list and one row; behaviour comes from props. The header and the card are separate pieces it composes."
            source="components/accounts/ActionItemList.tsx"
            flutter="action_item_list.dart · action_item_row.dart"
            anatomy="header · card of rows (check circle · title · due text · account name) · View all / Show less footer"
          >
            <AreaGroup title="Variants" count={3}>
              <VariantCard
                name="Home"
                prop='showAccountName · limit={4} · header "viewAll"'
                status="default"
                description="Action items across all accounts, so each row says which account it is for. Capped at four with no footer; View all sits in the header."
                notes={[
                  "Second line: due text · account name",
                  "Header action: View all (text button)",
                  "Rows disappear when completed",
                ]}
              >
                <div className="py-4">
                  <ActionItemsHeader action={{ kind: "viewAll", onClick: () => {} }} />
                  <ActionItemList entries={sampleActionEntries} showAccountName limit={4} />
                </div>
              </VariantCard>

              <VariantCard
                name="Account & interaction"
                prop="collapsedCount={3} · header &quot;add&quot;"
                description="Items for one account or one interaction. Shows three rows; View all N action items expands the rest and Show less collapses them."
                notes={[
                  "Second line: due text only",
                  "Header action: + (adds an item)",
                  "Footer only appears when there are more than three items",
                ]}
              >
                <div className="py-4">
                  <ActionItemsHeader action={{ kind: "add", onClick: () => {} }} />
                  <ActionItemList entries={sampleActionEntries} collapsedCount={3} />
                </div>
              </VariantCard>

              <VariantCard
                name="Full page"
                prop='variant="page" · showAccountName'
                description="The full-page Action Items screen (opened from View all on home). Same rows, but no card: they sit open on the page background, separated by strokes like the accounts list."
                notes={[
                  "16px side padding; separators inset 16px each side",
                  "Grouped under Overdue / Today / … headers by the screen",
                  "Shows the account name, like home",
                ]}
              >
                <div className="py-4">
                  <ActionItemList entries={sampleActionEntries.slice(0, 4)} variant="page" showAccountName />
                </div>
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Sub-components" count={2}>
              <SubComponentCard
                name="Action Items Header"
                source="components/accounts/ActionItemList.tsx"
                usedBy={["Home", "Account", "Interaction"]}
                description="The small uppercase section label with one action on the right."
                notes={["viewAll: neonindigo text button", "add: 20px plus icon in a 32px tap target"]}
              >
                <div className="w-64"><ActionItemsHeader action={{ kind: "viewAll", onClick: () => {} }} /></div>
                <div className="w-64"><ActionItemsHeader action={{ kind: "add", onClick: () => {} }} /></div>
              </SubComponentCard>

              <SubComponentCard
                name="List Card"
                source="components/ui/ListCard.tsx"
                usedBy={["Action Item List", "Account List Item (crm, home)"]}
                description="The filled card that holds a column of rows. No padding of its own; rows draw their own separators."
                notes={["dark-primary fill, hairline border, radius-lg"]}
              >
                <div className="w-64">
                  <ListCard>
                    <div style={{ padding: 16, fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>Row content</div>
                  </ListCard>
                </div>
              </SubComponentCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Action Item Drawer (component area) ────────────────────── */}
          <ComponentArea
            id="action-item-drawer"
            name="Action Item Drawer"
            kind="Feature"
            description="Opens when an action item row is tapped, from home, an account, an interaction or the full-page list. It replaces the old detail page. These previews render the real view and edit bodies, so they match the app."
            source="components/accounts/ActionItemDrawer.tsx"
            flutter="action_item_drawer.dart · action_item_edit_view.dart"
            anatomy="Drawer · view body or edit body · delete confirmation dialog"
          >
            <AreaGroup title="View" count={3}>
              <VariantCard
                name="Default"
                prop="open item with description and interaction"
                status="default"
                description="Title and edit button, account and due chips, the description, the interaction it came from, and Mark complete."
                notes={["Gaps: 16 title→chips, 20 between blocks, 24 before the button", "Interaction card is inset (dark-base) and opens that interaction", "Mark complete runs the opening screen's completion flow"]}
              >
                <ViewPreview item={SAMPLE_FULL} />
              </VariantCard>
              <VariantCard
                name="Minimal"
                prop="no description, no interaction, no due date"
                description="Blocks that have no content are left out rather than shown empty. A long title wraps and keeps the 16px gap before the chips."
                notes={["Due chip reads “No due date” in muted text"]}
              >
                <ViewPreview item={SAMPLE_MINIMAL} />
              </VariantCard>
              <VariantCard
                name="Completed"
                prop='status="done"'
                description="A Completed chip appears and Mark complete is removed. Editing is still available."
              >
                <ViewPreview item={SAMPLE_DONE} />
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Edit" count={2}>
              <VariantCard
                name="Edit"
                prop="mode: edit"
                description="Sticky Cancel / Edit item / check header, then Title and Description with counters, the interaction card, the Due date chips with Show calendar, and Delete action item. Cancel discards; the check saves."
                notes={["Fields are inset: dark-base fill, tertiary border", "Counters: title 200, description 2000", "Date chips scroll sideways; the selected one is neonindigo", "Flutter uses the platform date picker in place of Show calendar"]}
              >
                <EditPreview />
              </VariantCard>
              <VariantCard
                name="Edit, calendar open"
                prop="showCalendar"
                description="Show calendar expands the mini calendar under the chips; the button becomes Hide calendar."
              >
                <EditPreview calendar />
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Dialog" count={1}>
              <VariantCard
                name="Delete confirmation"
                prop="Delete action item → confirm"
                description="The shared Alert Dialog (see its own area): Yes, delete is the error fill and Cancel is a plain text button. Delete is permanent."
                notes={["Scrim: --md-sys-color-alpha-scrim"]}
              >
                <DeletePreview />
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Sub-components" count={2}>
              <SubComponentCard
                name="Interaction Card"
                source="components/accounts/ActionItemDrawer.tsx"
                usedBy={["Action Item Drawer (view)", "Action Item Drawer (edit)"]}
                description="The interaction the item came from: type and date, its title, and a chevron. Tapping opens the interaction."
                notes={["Type: Meeting or Spoken note (from originType)", "dark-base fill, tertiary border, radius-lg"]}
              >
                <div className="w-72"><InteractionCard item={SAMPLE_FULL} activityDate={new Date()} onOpen={() => {}} /></div>
              </SubComponentCard>
              <SubComponentCard
                name="Date Chips"
                source="components/accounts/ActionItemDrawer.tsx"
                usedBy={["Action Item Drawer (edit)"]}
                description="A sideways-scrolling row of days. The selected day is filled neonindigo; the rest are inset cards."
                notes={["78×86, radius-lg, 8px apart", "The Add an item sheet has its own smaller chip row; the two should converge"]}
              >
                <div className="w-80 overflow-hidden"><DateChips selected={new Date()} onSelect={() => {}} /></div>
              </SubComponentCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Tabs (component area) ──────────────────────────────────── */}
          <ComponentArea
            id="tabs"
            name="Tabs"
            kind="Library"
            description="Switches between views on a screen. The underlined version is the default and the one to reach for; the segmented pill is a sub-variant for small controls."
            source="components/ui/Tabs.tsx"
            flutter="halosight_tabs.dart"
            anatomy="row of labels · active label brighter with a teal bar · hairline along the bottom (underline) — or a pill track with a raised active pill (segmented)"
          >
            <AreaGroup title="Variants" count={2}>
              <VariantCard
                name="Underline"
                prop='variant="underline"'
                status="default"
                description="Used on the account screen (Overview / Activity) and anywhere tabs switch a page. Tap the previews to try them."
                notes={[
                  "Labels 16/600, 24px apart, 20px side padding",
                  "Active: text-primary with a 2px brand-teal bar the width of the label; inactive: text-muted",
                  "Hairline (alpha-white-10) runs the full width under the row",
                  "Pass style to make it sticky with a background on a scrolling screen",
                ]}
              >
                <TabsPreview variant="underline" tabs={[{ id: "overview", label: "Overview" }, { id: "activity", label: "Activity" }]} />
                <TabsPreview variant="underline" tabs={[{ id: "all", label: "All" }, { id: "open", label: "Open" }, { id: "done", label: "Done" }]} />
              </VariantCard>

              <VariantCard
                name="Segmented"
                prop='variant="segmented"'
                description="Sub-variant: a pill track with equal-width tabs. Use for a small control that switches content in place, not for page-level navigation."
                notes={[
                  "Track: dark-primary, radius-full, 4px padding and gap",
                  "Active tab: dark-secondary pill; labels 14/600",
                ]}
              >
                <TabsPreview variant="segmented" tabs={[{ id: "overview", label: "Overview" }, { id: "activity", label: "Activity" }]} />
                <TabsPreview variant="segmented" tabs={[{ id: "all", label: "All" }, { id: "open", label: "Open" }, { id: "done", label: "Done" }]} />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Activity Card (component area) ─────────────────────────── */}
          <ComponentArea
            id="activity-card"
            name="Activity & Engagement Rows"
            kind="Library"
            description="Two distinct open-row components: account activity history, plus the recent engagement feed with read and unread states."
            source="components/accounts/ActivityCard.tsx · components/accounts/EngagementRow.tsx"
            flutter="activity_card.dart · engagement_row.dart"
            anatomy="Activity: title · summary · meta. Engagement: company · interaction · date."
          >
            <AreaGroup title="Variants" count={4}>
              <VariantCard
                name="Halosight"
                prop='variant="halosight" (item.source undefined)'
                status="default"
                description="An activity logged in Halosight. Meta line: relative date, duration, and who created it."
                notes={[
                  "Title 17/500, summary 15/21 in text-secondary, clamped to two lines",
                  "Meta 14, all text-muted; dots in text-disabled. Dates are never indigo",
                  "“You” when the signed-in rep created it, otherwise their name",
                  "Duration is left out when there isn't one",
                ]}
              >
                <div className="py-2">
                  {sampleActivities.filter((a) => !a.source).map((a, i, all) => (
                    <ActivityCard key={a.id} item={a} accountId="demo" isLast={i === all.length - 1} />
                  ))}
                </div>
              </VariantCard>

              <VariantCard
                name="CRM (Salesforce)"
                prop='variant="crm" (item.source = "salesforce")'
                description="An activity synced from Salesforce, such as an email. A blue cloud sits before the title and the meta line says From Salesforce in place of a duration."
                notes={[
                  "Cloud icon 20px in color.semantic.info",
                  "“From Salesforce” in color.brand.teal",
                  "Person is the Salesforce creator",
                ]}
              >
                <div className="py-2">
                  {sampleActivities.filter((a) => a.source).map((a) => (
                    <ActivityCard key={a.id} item={a} accountId="demo" isLast />
                  ))}
                </div>
              </VariantCard>

              <VariantCard
                name="Recent"
                prop='variant="recent"'
                description="A row in the Engagements side drawer: the feed of recent interactions across every account. Company, what happened, the kind of interaction and when. Already opened."
                notes={[
                  "Company: 12/600 uppercase, brand-teal. Title 17/500, text-primary",
                  "Meta: type icon + Meeting / Phone Call, then the date. Today is neonindigo; then Yesterday, a weekday, Last Friday, Oct 12",
                  "Pressing highlights the row (dark-secondary, radius-md); the row sits 8px in from the list edge so the fill has room",
                ]}
              >
                <div style={{ padding: "var(--spacing-2) 0" }}>
                  {recentSamples.filter((r) => !r.unread).map((r, i, all) => (
                    <EngagementRow key={r.id} recent={r} variant="recent" isLast={i === all.length - 1} />
                  ))}
                </div>
              </VariantCard>

              <VariantCard
                name="Recent — unread"
                prop='variant="recent-unread"'
                description="Not opened yet: an indigo dot before the company, a bolder title, and a “Modified …” line that says what changed. Opening the row makes it read."
                notes={["Dot 8px neonindigo; title 17/600; change line 14 text-muted behind a 2px text-disabled bar", "Copy is “Modified”, not “Created”"]}
              >
                <div style={{ padding: "var(--spacing-2) 0" }}>
                  {recentSamples.filter((r) => r.unread).map((r, i, all) => (
                    <EngagementRow key={r.id} recent={r} variant="recent-unread" isLast={i === all.length - 1} />
                  ))}
                </div>
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Engagements Drawer (component area) ───────────────────── */}
          <ComponentArea
            id="engagements-drawer"
            name="Engagements Drawer"
            kind="Feature"
            description="The side drawer behind the home screen's menu button: a feed of recent interactions across every account, newest first, with unread rows marked. It loads more as you scroll."
            source="components/accounts/EngagementsDrawer.tsx"
            flutter="engagements_drawer.dart"
            anatomy="logo · search button (opens a search field) · Activity Card rows (recent / recent-unread) · end-of-list loader"
          >
            <AreaGroup title="States" count={2}>
              <VariantCard
                name="Feed"
                prop="items"
                status="default"
                description="Rows are Activity Card variants. The first 12 load with the drawer."
                notes={["Panel: dark-primary, 86% of the phone wide, slides in from the left over the scrim"]}
              >
                <div style={{ height: 560, overflow: "hidden", background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-md)" }}>
                  <EngagementsPanel items={recentSamples} isUnread={(r) => !!r.unread} />
                </div>
              </VariantCard>
              <VariantCard
                name="Loading more"
                prop="loading"
                description="When the end of the list scrolls into view, the next 8 rows load after a short beat. ThinkingDots show at the bottom until they arrive, and the list ends when the feed does."
                notes={["Lazy loading: pages of 8 after the first 12. Prototype delay is simulated (700ms)"]}
              >
                <div style={{ height: 560, overflow: "hidden", background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-md)" }}>
                  <EngagementsPanel items={recentSamples.slice(0, 3)} loading isUnread={(r) => !!r.unread} />
                </div>
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Insight Card (component area) ──────────────────────────── */}
          <ComponentArea
            id="insight-card"
            name="Insight Card"
            kind="Feature"
            description="The AI blocks on an account's Overview tab: “Last time” and “Ideas for next time”. Prose or a bullet list, a hairline, then the feedback icons."
            source="components/accounts/InsightCard.tsx"
            flutter="account_insight_card.dart"
            anatomy="eyebrow · visited meta (prose only) · body (or loader) · hairline · [sources] · [read aloud · ask AI] · copy · thumbs-down"
          >
            <label className="flex items-center gap-3 cursor-pointer w-fit" style={{ color: "var(--md-sys-color-text-secondary)", fontSize: 14 }}>
              <input type="checkbox" checked={insightExtras} onChange={(e) => setInsightExtras(e.target.checked)} />
              Show sources and AI actions (off for the first handoff)
            </label>
            <AreaGroup title="Variants" count={3}>
              <VariantCard
                name="Prose"
                prop="body: string"
                status="default"
                description="“Last time”: a paragraph with “Visited N days ago” on the right of the eyebrow."
                notes={[
                  "Visited label: bold day count in neonindigo within a week, text-disabled after",
                  "Card: dark-primary, alpha-white-10 border, radius-md, 16px padding",
                  "Body 17/1.5 text-secondary",
                ]}
              >
                <div style={{ padding: 16 }}>
                  <InsightCard
                    eyebrow="Last Time"
                    visitedDaysAgo={30}
                    body="Sandra mentioned the team has been evaluating three vendors — we're the frontrunner. Budget is approved. Main concern is implementation timeline."
                    showSources={insightExtras}
                    showAiActions={insightExtras}
                  />
                </div>
              </VariantCard>
              <VariantCard
                name="Bullets"
                prop="body: string[]"
                description="“Ideas for next time”: one teal-dotted line per idea. Wraps under the text, not the dot."
              >
                <div style={{ padding: 16 }}>
                  <InsightCard
                    eyebrow="Ideas for Next Time"
                    body={[
                      "Present implementation timeline to address concerns",
                      "Offer a phased rollout option",
                      "Introduce Sandra to our customer success lead",
                    ]}
                    showSources={insightExtras}
                    showAiActions={insightExtras}
                  />
                </div>
              </VariantCard>
              <VariantCard
                name="Loading"
                prop="loading"
                description="While the account summary is being brought in, the body is replaced by the loader and the footer is hidden. When the text arrives it fades in. Replay runs the whole sequence."
                notes={["Eyebrow and Visited label stay in place", "Pass loadingMessages to change the status lines"]}
              >
                <InsightLoadingPreview />
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Sub-components" count={1}>
              <SubComponentCard
                name="InsightCardLoader"
                source="components/accounts/InsightCardLoader.tsx"
                usedBy={["InsightCard"]}
                description="A spinning four-point sparkle beside a status line that cycles while the summary loads. The lines slide up and fade, about 1.1s apart, and stay on the last one until the text is ready."
                notes={[
                  "Sparkle: neonindigo, 20px, turns 90° every 1.6s with a small pulse",
                  "Status line: body size 17, text-muted; one line, no wrapping",
                  "Timings were read from a screen recording, so they are a close match",
                ]}
              >
                <StateSample caption="Reading"><div style={{ width: 300 }}><InsightCardLoader messages={["Reading 6 visits..."]} /></div></StateSample>
                <StateSample caption="Checking"><div style={{ width: 300 }}><InsightCardLoader messages={["Checking Salesforce..."]} /></div></StateSample>
                <StateSample caption="Writing"><div style={{ width: 300 }}><InsightCardLoader messages={["Writing your summary..."]} /></div></StateSample>
              </SubComponentCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Alert Dialog (component area) ───────────────────────────── */}
          <ComponentArea
            id="alert-dialog"
            name="Alert Dialog"
            kind="Library"
            description="A short, centered confirmation over the scrim, for decisions that can't be undone. One filled confirm button and a plain text Cancel."
            source="components/ui/AlertDialog.tsx"
            flutter="halosight_alert_dialog.dart"
            anatomy="card · title · body · confirm button · text Cancel"
          >
            <AreaGroup title="Variants" count={2}>
              <VariantCard
                name="Destructive"
                prop="destructive (default)"
                status="default"
                description="Deleting or discarding. The confirm button uses the error color. Used for deleting an action item or an interaction."
                notes={["Card: dark-primary, radius-xl, 24px padding, 16px gap", "Cancel: text-secondary, no fill"]}
              >
                <div style={{ padding: 16 }}>
                  <AlertCard title="Delete interaction?" body="This removes the visit and its summary. It can't be undone." confirmLabel="Yes, delete" onConfirm={() => {}} onCancel={() => {}} />
                </div>
              </VariantCard>
              <VariantCard
                name="Standard"
                prop="destructive={false}"
                description="A confirmation that isn't destructive. The confirm button uses the indigo action color."
              >
                <div style={{ padding: 16 }}>
                  <AlertCard title="Send follow-up?" body="Dana will get the draft from your email." confirmLabel="Send" destructive={false} onConfirm={() => {}} onCancel={() => {}} />
                </div>
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Toast (component area) ─────────────────────────────────── */}
          <ComponentArea
            id="toast"
            name="Toast"
            kind="Library"
            description="A brief, non-blocking message that confirms something just happened, with at most one action. It floats above the bottom nav, dismisses itself, and never asks for a decision (that is an Alert Dialog)."
            source="components/ui/Toast.tsx"
            flutter="halosight_toast.dart"
            anatomy="[leading icon or thumbnail] · title · [description] · [action] · [close] · [secondary row]"
          >
            <AreaGroup title="Tones" count={3}>
              <VariantCard
                name="Neutral"
                prop='tone="neutral"'
                status="default"
                description="Information with an optional action: “Interaction deleted · Undo”. The action is indigo."
                notes={["Surface: dark-secondary at 88% with a blur, white-18 stroke, elevation-5", "Title 15/600 on one line; the action is a plain text button"]}
              >
                <div style={{ padding: 16 }}>
                  <ToastCard title="Interaction deleted" action={{ label: "Undo", onPress: () => {} }} />
                </div>
              </VariantCard>
              <VariantCard
                name="Success"
                prop='tone="success"'
                description="Something finished: a green check and a soft green stroke on the normal toast surface, with the action underlined in the primary text color."
              >
                <div style={{ padding: 16 }}>
                  <ToastCard tone="success" title="Item removed everywhere" action={{ label: "Undo", onPress: () => {} }} />
                </div>
              </VariantCard>
              <VariantCard
                name="Error"
                prop='tone="error"'
                description="Something didn't go through, with the one thing to try next. Announced assertively to screen readers."
              >
                <div style={{ padding: 16 }}>
                  <ToastCard tone="error" title="Couldn't sync with Salesforce" action={{ label: "Retry", onPress: () => {} }} />
                </div>
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Layouts" count={4}>
              <VariantCard
                name="With description"
                prop="description"
                description="A second line of muted text for context. Title and description together stay within two lines."
              >
                <div style={{ padding: 16 }}>
                  <ToastCard tone="success" title="Visit saved" description="Synced to Salesforce · Acme Co" action={{ label: "View", onPress: () => {} }} />
                </div>
              </VariantCard>
              <VariantCard
                name="With thumbnail"
                prop="leading={node}"
                description="Any node can lead: a record thumbnail, an avatar, a logo."
              >
                <div style={{ padding: 16 }}>
                  <ToastCard
                    title="Saved to Rooms in France"
                    leading={<div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--md-sys-color-dark-tertiary)" }}><Icon name="image" size={20} style={{ color: "var(--md-sys-color-text-muted)" }} /></div>}
                    action={{ label: "Change", onPress: () => {} }}
                  />
                </div>
              </VariantCard>
              <VariantCard
                name="Stays until dismissed"
                prop="duration={null}"
                description="For messages that need to be read carefully. Shows a close button because it never times out."
                notes={["Default timing: 5s, or 7s when there is an action; pressing or hovering pauses the timer", "Swipe down also dismisses"]}
              >
                <div style={{ padding: 16 }}>
                  <ToastCard tone="error" title="You're offline" description="Visits are saved on this phone and will sync when you reconnect." showClose onClose={() => {}} />
                </div>
              </VariantCard>
              <VariantCard
                name="With secondary row"
                prop="secondary"
                description="Used by Item complete: Undo on the main row and a quiet “Add a note” link under it. Use sparingly; prefer one action."
              >
                <div style={{ padding: 16 }}>
                  <ToastCard tone="success" title="Item complete" action={{ label: "Undo", onPress: () => {} }} secondary={{ label: "Add a note", icon: "edit", onPress: () => {} }} showClose onClose={() => {}} />
                </div>
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Top pill" count={4}>
              <VariantCard
                name="Preparing note"
                prop='shape="pill" · leading={ToastSpinner}'
                description="The top toast for a note in progress. Full radius, hugs its content, centered just under the status bar. A small turning ring is the right use of a spinner here: it is a short, indeterminate wait."
                notes={["Fill neutral (dark-secondary, blurred, white-18 stroke); text 15/500 text-secondary", "Stays up until the note is ready (duration={null}); no close button"]}
              >
                <PillPreview state="processing" />
              </VariantCard>
              <VariantCard
                name="Note ready"
                prop='shape="pill" · leading={ToastCheck}'
                description="The same pill, replaced in place: the ring becomes a solid green check, the text changes, a “View” label appears and the width eases. The whole pill opens the note; it dismisses itself after a few seconds."
                notes={["Swap with useToast().show({...}, { replace: true }) so it does not queue behind the first one", "action.label is only the visible hint; the whole pill is the tap target"]}
              >
                <PillPreview state="ready" />
              </VariantCard>
              <VariantCard
                name="Failed"
                prop='shape="pill" · tone="error"'
                description="The pill keeps its neutral fill; only the icon turns red. “Try again” is a label; the whole pill retries. Announced assertively."
              >
                <PillPreview state="failed" />
              </VariantCard>
              <VariantCard
                name="Preparing → ready"
                prop="replace"
                description="The two states in sequence, on a loop, the way the website shows it."
              >
                <PillSequencePreview />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Shared primitives (component areas) ───────────────────── */}
          <ComponentArea
            id="text-field"
            name="Text Field"
            kind="Library"
            description="The one text entry. Every field in the app is this widget: the sheets that create a lead or an action item, the contact and deal forms, notes, feedback, the chat composer and the date filter. Search Field is this with a search icon. Single-line is a full pill; multi-line is a rounded box. It goes default, active, then filled, so a field you have filled in reads as done."
            source="components/ui/TextField.tsx"
            flutter="halosight_text_field.dart"
            anatomy="[label] · field ([leading] · text · [trailing] · [clear] · [actions]) · [helper] · [n/max]"
          >
            <AreaGroup title="States" count={6}>
              <VariantCard name="Default, active, filled" prop="value · focus · status · disabled" status="default" description="Empty fields have no stroke. Focus draws a 1.5px neonindigo stroke; once there is text and focus has left, a hairline stroke marks it filled. Warning is for a soft problem (a possible duplicate), error for a blocking one. The caret is brand coral. These fields are live: type in them.">
                <StatesPreview />
              </VariantCard>
            </AreaGroup>
            <AreaGroup title="Variants" count={4}>
              <VariantCard name="Sizes" prop='size="sm" | "md" | "lg" | "xl"' description="36, 44, 48 (default for forms) and 56 tall. Text and icon step up with them; xl is the chat composer.">
                <SizesPreview />
              </VariantCard>
              <VariantCard name="Multi-line" prop="multiline · rows · maxLength · showCount" description="A rounded box that grows with rows, with an optional n/max counter under it.">
                <MultilinePreview />
              </VariantCard>
              <VariantCard name="Slots" prop="leading · trailing · clearable · endSlot · actions" description="An icon before the text, a tag or button after it, a clear dot, and round action buttons flush right (the chat composer).">
                <SlotsPreview />
              </VariantCard>
              <VariantCard name="Bare" prop='variant="bare"' description="Just the input, no fill or stroke, for text that edits in place inside a card or row that owns the surface (renaming a participant, an AI-extracted field).">
                <BarePreview />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="filter-pill"
            name="Filter Pill"
            kind="Library"
            description="A small pill that shows the current choice and opens a check menu: Open / Done and Due Date / Company on the items list, and Last Visited on the companies list. It has three looks: resting, filtered (an indigo check before the label) and open (indigo fill). The menu is the shared Menu. These are live: tap them."
            source="components/ui/FilterDropdown.tsx · components/ui/VisitedFilterDropdown.tsx"
            flutter="filter_dropdown.dart · visited_filter_dropdown.dart"
            anatomy="pill ([filtered check] · label · arrow) · Menu (check rows) · [custom range: From · To · Apply]"
          >
            <AreaGroup title="Variants" count={3}>
              <VariantCard name="Filter" prop="FilterDropdown · options · value · defaultValue" status="default" description="A value picker. The first option is the unfiltered default; choosing anything else adds the indigo check to the pill. Open turns the pill indigo.">
                <FilterDropdownPreview />
              </VariantCard>
              <VariantCard name="Sort" prop="FilterDropdown" description="The same widget used to pick a sort order (Due Date, Company). Nothing marks it filtered because the first option is the default.">
                <SortFilterPreview />
              </VariantCard>
              <VariantCard name="Last visited (with a custom range)" prop="VisitedFilterDropdown · value · customFrom · customTo" description="Five presets that apply at once, then a divider and Custom range, which opens two date fields and an Apply button. The pill reads Last Visited until a choice is made.">
                <VisitedFilterPreview />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="kebab-menu"
            name="More Menu"
            kind="Library"
            description="The three-dot button for a record's actions (Edit, Share, Delete on the account page). The button fades out as the menu springs in over it from the top-right; destructive rows use the error color. The menu itself is the shared Menu. Tap it."
            source="components/ui/KebabMenu.tsx"
            flutter="kebab_menu.dart"
            anatomy="40px button (more_vert) · Menu (icon rows, [destructive])"
          >
            <AreaGroup title="Variants" count={1}>
              <VariantCard name="Record actions" prop="items: { label, icon?, onClick, destructive? }[]" status="default" description="Each row has an icon and a label. A destructive row is drawn in the error color.">
                <KebabMenuPreview />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="skeleton"
            name="Skeleton"
            kind="Library"
            description="Grey shapes that hold a screen's layout while its content loads. One Bone primitive (a rounded rectangle with a left-to-right sweep) builds the rest: a companies list and the account page. Use it for whole-screen or whole-list loads; a short wait in a button or beside text is Thinking Dots."
            source="components/ui/Skeleton.tsx"
            flutter="skeleton.dart (shimmer package)"
            anatomy="Bone · AccountListSkeleton (rows) · AccountDetailSkeleton"
          >
            <AreaGroup title="Variants" count={3}>
              <VariantCard name="Bone" prop="width · height · radius" status="default" description="The primitive. 1.4s sweep from dark.secondary through dark.tertiary and back.">
                <div className="flex flex-col" style={{ padding: 16, gap: 10 }}>
                  <Bone width="70%" height={16} />
                  <Bone width="45%" height={13} />
                  <Bone width={68} height={20} radius={20} />
                </div>
              </VariantCard>
              <VariantCard name="Account list" prop="AccountListSkeleton · rows" description="Rows shaped like a company row: three lines of text on the left, a pill and a badge on the right.">
                <div style={{ background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <AccountListSkeleton rows={3} />
                </div>
              </VariantCard>
              <VariantCard name="Account page" prop="AccountDetailSkeleton" description="The account page header (close, name, two tabs) and three content blocks.">
                <div style={{ height: 460, overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
                  <AccountDetailSkeleton />
                </div>
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="ai-review"
            name="AI Review"
            kind="Feature"
            description="The screen after a capture where the rep checks what the AI pulled out of the visit before it goes to Salesforce. Each field is a card that shows how sure the AI was: confident (indigo, sparkle), uncertain (dashed outline) or confirmed (green, once the rep edits it or says it). Tap a card to edit; hold the mic to correct by voice. The full overlay is driven by the capture flow, so its parts are shown here on their own."
            source="components/capture/AIReviewOverlay.tsx"
            flutter="ai_review_overlay.dart · field_card.dart"
            anatomy="header (eyebrow · title | waveform · live caption) · field cards · bottom bar (Use defaults · hold-to-talk mic · Save)"
          >
            <AreaGroup title="Field card" count={3}>
              <VariantCard name="Confidence states" prop="conf: high | uncertain | confirmed" status="default" description="Title is confident, Phone is uncertain and empty, Lead status is confirmed, Address is confident and multi-line. Tap one to edit it: it takes an indigo stroke, and leaving it saves the text and marks it confirmed. Live.">
                <FieldCardsPreview />
              </VariantCard>
              <VariantCard name="Listening header" prop="listening" description="While the mic is held: the waveform, the live caption (words fade in one at a time) and the next-step eyebrow.">
                <ListeningHeaderPreview />
              </VariantCard>
              <VariantCard name="Bottom bar buttons" prop="SideButton: neutral | purple" description="Use defaults (neutral) and Save (indigo). Hand-built round buttons for now.">
                <SideButtonsPreview />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="account-picker"
            name="Account Picker"
            kind="Feature"
            description="'Switch account': the sheet that moves the capture flow to a different company. A search field, then the accounts A to Z with the current one pinned at the top (indigo, with a check). Searching filters by name, city or state. Tapping a row selects it and closes the sheet. Live: search and tap."
            source="components/accounts/AccountPickerSheet.tsx"
            flutter="account_picker_sheet.dart"
            anatomy="header (title · close) · Search Field · current account (pinned) · hairline · account rows (name · city, state)"
          >
            <AreaGroup title="Variants" count={1}>
              <VariantCard name="Switch account" prop="currentId · onSelect · onClose" status="default" description="The real sheet inside a phone-height box. Nothing is saved; picking a row just moves the indigo check.">
                <AccountPickerPreview />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="error-state"
            name="Error State"
            kind="Library"
            description="What a list or screen shows when its data fails to load: a warning mark, a title, a short message and a Try again button. Centered in the space it fills. A failed action (a save that did not go through) is a Toast or a Banner, not this."
            source="components/ui/ErrorState.tsx"
            flutter="error_state.dart"
            anatomy="icon circle (warning) · title · message · [Try again]"
          >
            <AreaGroup title="Variants" count={2}>
              <VariantCard name="Default" prop="onRetry" status="default" description="The default title and message, with a Try again button (a tonal Button). Without onRetry the button is left out.">
                <ErrorStatePreview />
              </VariantCard>
              <VariantCard name="Custom text" prop="title · message" description="Say what failed. The companies list uses 'Couldn't load accounts'.">
                <ErrorStatePreview custom />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="scroll-top-bar"
            name="Scroll Top Bar"
            kind="Library"
            description="A back button that floats over the top of a scrolling page, with an optional control on the right. At the top the arrow has no background; once you scroll a glass circle appears behind it. The right control fades out as you scroll down and returns when you scroll up. Scroll inside the preview."
            source="components/ui/ScrollAwareTopBar.tsx"
            flutter="scroll_aware_top_bar.dart"
            anatomy="back button ([glass circle after 10px]) · [right control]"
          >
            <AreaGroup title="Variants" count={1}>
              <VariantCard name="Back with a right control" prop="onBack · rightSlot · scrollRef" status="default" description="The page content needs about 86px of top padding so it starts below the bar.">
                <ScrollTopBarPreview />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="custom-icons"
            name="Custom Icons"
            kind="Library"
            description="Icons Material Symbols does not have, drawn as SVG on currentColor so they take the colour of whatever they sit in: the lead star, the company building, the Ask (AI chat) bubble, and the thumbs-down mark on AI answers (outline, then filled once feedback is given)."
            source="components/ui/CustomIcons.tsx · components/ui/ThumbsDownIcon.tsx"
            flutter="SVG assets via flutter_svg"
            anatomy="LeadStarIcon · CompanyIcon · AiChatIcon · ThumbsDownIcon"
          >
            <AreaGroup title="Icons" count={4}>
              <VariantCard name="All custom icons" prop="size · [filled]" status="default" description="Set the size in px; colour comes from the parent.">
                <CustomIconsPreview />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="search-field"
            name="Search Field"
            kind="Library"
            description="The one search bar (a Text Field with a search icon), used on the companies list, the action item lists and the Engagements drawer. A search icon, the field, and a clear button once there is text, in three sizes. It gets an indigo stroke while focused."
            source="components/ui/SearchField.tsx"
            flutter="halosight_search_field.dart"
            anatomy="search icon · text field · [trailing tag] · [clear]"
          >
            <AreaGroup title="Variants" count={3}>
              <VariantCard name="Sizes" prop='size="sm" | "md" | "lg"' status="default" description="36, 44 (default) and 48 tall, with the icon and text stepping up with them. The caret is brand coral; the stroke turns indigo on focus.">
                <div className="flex flex-col" style={{ padding: 16, gap: 12 }}>
                  <SearchField size="sm" value="" onChange={() => {}} placeholder="Small" />
                  <SearchField size="md" value="" onChange={() => {}} placeholder="Medium" />
                  <SearchField size="lg" value="" onChange={() => {}} placeholder="Large" />
                </div>
              </VariantCard>
              <VariantCard name="Active" prop="active · trailing · endSlot" description="The indigo stroke and icon. It shows on focus, or all the time while searching beyond your own list, with an optional tag and a control inside the pill (the sort menu).">
                <div style={{ padding: 16 }}><SearchField value="Acme" onChange={() => {}} placeholder="Searching all companies…" active trailing={<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: "var(--md-sys-color-neonindigo)", background: "color-mix(in srgb, var(--md-sys-color-neonindigo) 12%, transparent)", borderRadius: "var(--radius-xs)", padding: "2px 6px" }}>ALL</span>} /></div>
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="section-header"
            name="Section Header"
            kind="Library"
            description="The small label that heads a list section, with an optional count and add button, or centered between two hairlines."
            source="components/ui/SectionHeader.tsx"
            flutter="section_header.dart"
            anatomy="label · [count pill] · [add button]  |  hairline · label · hairline"
          >
            <AreaGroup title="Variants" count={2}>
              <VariantCard name="Label and count" prop="count · onAdd" status="default" description="Uppercase label, a count pill and a round add button.">
                <SectionHeaderRow label="Your Companies" count={7} onAdd={() => {}} addLabel="Add new lead" />
              </VariantCard>
              <VariantCard name="Divider" prop="divider" description="Separates two result groups, e.g. Company-Wide Results.">
                <SectionHeaderRow label="Company-Wide Results" divider />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="icon-button"
            name="Icon Button"
            kind="Library"
            description="A round button with one icon: profile and search buttons, and the floating back and more buttons that turn to glass once the screen scrolls."
            source="components/ui/IconButton.tsx"
            flutter="halosight_icon_button.dart"
            anatomy="circle · icon"
          >
            <AreaGroup title="Variants" count={3}>
              <VariantCard name="Filled" prop='variant="filled"' status="default" description="dark-secondary circle."><div className="flex" style={{ padding: 16, gap: 12 }}><IconButton icon="person" label="Profile" size={36} /><IconButton icon="search" label="Search" size={44} /></div></VariantCard>
              <VariantCard name="Glass" prop='variant="glass" scrolled' description="Transparent at rest; a blurred translucent circle once the page has scrolled under it."><div className="flex" style={{ padding: 16, gap: 12 }}><IconButton icon="arrow_back" label="Back" variant="glass" size={36} /><IconButton icon="arrow_back" label="Back" variant="glass" size={36} scrolled /></div></VariantCard>
              <VariantCard name="Plain" prop='variant="plain"' description="No background, for flat headers."><div style={{ padding: 16 }}><IconButton icon="arrow_back" label="Back" variant="plain" /></div></VariantCard>
            </AreaGroup>
          </ComponentArea>

          <ComponentArea
            id="banner"
            name="Banner"
            kind="Library"
            description="An inline message card inside a screen, for context the rep should read once: a heads-up, not an interruption."
            source="components/ui/Banner.tsx"
            flutter="halosight_banner.dart"
            anatomy="icon · message"
          >
            <AreaGroup title="Tones" count={2}>
              <VariantCard name="Info" prop='tone="info"' status="default" description="Indigo. Used on another rep's account.">
                <div style={{ padding: 16 }}><Banner>You&apos;re viewing Dana&apos;s account — notes you capture here will be visible to them.</Banner></div>
              </VariantCard>
              <VariantCard name="Warning" prop='tone="warning"' description="Amber, for something that may need attention.">
                <div style={{ padding: 16 }}><Banner tone="warning">This lead is missing contact info. It will sync without it.</Banner></div>
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Account Chat (component area) ──────────────────────────── */}
          <ComponentArea
            id="account-chat"
            name="Account Chat"
            kind="Feature"
            description="Ask anything about an account, by typing or by voice. A tall drawer opened from Ask in the account's more-options menu. Answers come from the account's visits, calls and Salesforce activity."
            source="components/chat/ChatDrawer.tsx"
            flutter="account_chat_sheet.dart"
            anatomy="handle · header (history · new chat · minimize) · empty state or message list · input or voice dock · history menu popover"
          >
            <AreaGroup title="States" count={7}>
              <VariantCard
                name="Empty"
                prop="turns = []"
                status="default"
                description="First thing you see: a greeting, the account name and a row of suggested questions that scrolls sideways. Tapping a chip sends it."
                notes={["Greeting 32/700 in neonindigo; subtitle 17 text-muted", "Chips 176 wide, dark-secondary, radius-lg"]}
              >
                <EmptyPreview />
              </VariantCard>
              <VariantCard
                name="Typing"
                prop="input has text"
                description="The waveform button becomes Send once there is text. The mic beside it is dictation."
              >
                <TypingPreview />
              </VariantCard>
              <VariantCard
                name="Conversation"
                prop="turns.length > 0"
                description="Your messages are bubbles on the right; answers are plain text with copy and thumbs-down underneath. An answer can carry a quoted draft."
                notes={["Body 17/24 for every message", "A ThinkingDots row shows while an answer is on its way"]}
              >
                <ConversationPreview />
              </VariantCard>
              <VariantCard
                name="History menu"
                prop="historyOpen"
                description="Opens under the history icon, which turns indigo. Search, Pinned and Recent groups, pin and delete on each row, and See all chats."
                notes={["Panel is the shared Menu chrome", "Titles truncate to one line; pin fills indigo"]}
              >
                <HistoryPreview />
              </VariantCard>
              <VariantCard
                name="Voice — listening"
                prop='phase="listening"'
                description="Tapping the waveform button swaps the input for the voice dock. An indigo haze rises from the bottom edge and follows the sound of the person talking: it climbs and brightens with the voice and settles in the pauses. The words they say appear above the orb one at a time, as they are heard."
              >
                <VoicePreview phase="listening" />
              </VariantCard>
              <VariantCard
                name="Voice — thinking"
                prop='phase="thinking"'
                description="What you just said appears as an italic line over the orb while the answer is prepared. Coral and indigo flow along the bottom edge, sweeping side to side, so it feels like the screen is working."
              >
                <VoicePreview phase="thinking" />
              </VariantCard>
              <VariantCard
                name="Voice — speaking"
                prop='phase="speaking"'
                description="A low coral bloom hugs the bottom edge, well below the reply text, and nothing wraps the edges. The answer highlights word by word as it is read aloud; the rest stays muted. The close button returns to the text input."
              >
                <VoicePreview phase="speaking" />
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Sub-components" count={4}>
              <SubComponentCard
                name="SuggestionChip"
                source="components/chat/ChatEmptyState.tsx"
                usedBy={["ChatEmptyState"]}
                description="A tappable suggested question."
              >
                <StateSample caption="Default"><SuggestionChip label="Prep me for the Houston QBR" /></StateSample>
                <StateSample caption="Two lines"><SuggestionChip label="What's still open with this account?" /></StateSample>
              </SubComponentCard>
              <SubComponentCard
                name="ChatInput"
                source="components/chat/ChatInput.tsx"
                usedBy={["ChatDrawer"]}
                description="Pill with the text field, a dictation mic and a trailing round button that is voice mode when empty and Send once there is text."
                notes={["Pill dark-secondary; mic dark-tertiary; action button neonindigo-dark"]}
              >
                <StateSample caption="Empty"><div style={{ width: 340 }}><ChatInput value="" onChange={() => {}} onSubmit={() => {}} onVoiceMode={() => {}} /></div></StateSample>
                <StateSample caption="With text"><div style={{ width: 340 }}><ChatInput value="What's at risk?" onChange={() => {}} onSubmit={() => {}} onVoiceMode={() => {}} /></div></StateSample>
              </SubComponentCard>
              <SubComponentCard
                name="ChatMessage"
                source="components/chat/ChatMessage.tsx"
                usedBy={["ChatMessageList"]}
                description="One message: your bubble, the assistant's plain text with actions, a quoted draft, or the thinking row."
              >
                <StateSample caption="You"><div style={{ width: 340 }}><UserMessage text="Draft a quick note to Dana about it" /></div></StateSample>
                <StateSample caption="Assistant"><div style={{ width: 340 }}><AssistantMessage turn={CHAT_SAMPLE_TURNS[1]} /></div></StateSample>
                <StateSample caption="Draft block"><div style={{ width: 340 }}><DraftBlock text={DRAFT_NOTE} /></div></StateSample>
                <StateSample caption="Thinking"><ThinkingRow /></StateSample>
              </SubComponentCard>
              <SubComponentCard
                name="ChatVoiceDock"
                source="components/chat/ChatVoiceDock.tsx"
                usedBy={["ChatDrawer"]}
                description="The bottom dock in voice mode: status line, mic orb, add, mute and a white close button."
              >
                <StateSample caption="Listening"><DockPreview phase="listening" /></StateSample>
                <StateSample caption="Thinking"><DockPreview phase="thinking" /></StateSample>
                <StateSample caption="Speaking"><DockPreview phase="speaking" /></StateSample>
              </SubComponentCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Feedback Widget (component area) ───────────────────────── */}
          <ComponentArea
            id="feedback-widget"
            name="Feedback Widget"
            kind="Feature"
            description="The “Help shape Halosight” card on the home screen and the drawer it opens. Three shortcuts (bug, idea, write my own) open the drawer with that type already selected."
            source="components/ui/FeedbackWidget.tsx"
            flutter="feedback_widget.dart · feedback_entry_card.dart · feedback_form.dart"
            anatomy="entry card (eyebrow · title · subtitle · three options) → Drawer (header · type pills · textarea · Send)"
          >
            <AreaGroup title="Entry card" count={1}>
              <VariantCard
                name="Entry card"
                prop="<FeedbackEntryCard onSelect />"
                status="default"
                description="Sits in the home scroll under the action items. Each option is full width and opens the drawer."
                notes={[
                  "Card: dark-primary, hairline border, radius-md, 16px padding",
                  "Eyebrow and title in Roboto Slab 700; eyebrow is neonindigo",
                  "Options: 48px, radius-md, color.background fill, 24px neonindigo icon",
                  "Bug and Write my own use filled icons; the idea bulb is outlined",
                ]}
              >
                <FeedbackEntryPreview />
              </VariantCard>
            </AreaGroup>

            <AreaGroup title="Drawer states" count={3}>
              <VariantCard
                name="Empty"
                prop="type selected, no text"
                description="Opens with the tapped type selected. Send is dim and can't be tapped until there is text."
                notes={["Pills: selected = neonindigo 18% fill; others have a tertiary border", "Placeholder follows the type", "Send: dark-secondary with disabled text"]}
              >
                <FeedbackFormPreview />
              </VariantCard>
              <VariantCard
                name="Ready to send"
                prop="type: idea · text entered"
                description="Once there is text, Send turns brand-teal."
                notes={["Placeholder for Idea: “What should we build or change?”"]}
              >
                <FeedbackFormPreview initialType="idea" initialText="Let me add a photo to a visit note." />
              </VariantCard>
              <VariantCard
                name="Sent"
                prop="sent"
                description="After Send the button shows a success tint and “Sent — thanks!”, then the drawer closes after about a second."
              >
                <FeedbackFormPreview initialType="other" initialText="Loving the new activity rows." sent />
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Menu (component area) ──────────────────────────────────── */}
          <ComponentArea
            id="menus"
            name="Menu"
            kind="Library"
            description="The popup panel behind every dropdown: row actions, pickers and the sort/filter menus. Three variants — a leading icon, a selection check, or both. The trigger is the caller's; the Menu is just the panel."
            source="components/ui/Menu.tsx"
            flutter="halosight_menu.dart"
            anatomy="panel · rows (icon · label · check) · section label and divider (sort menu only)"
          >
            <AreaGroup title="Variants" count={3}>
              <VariantCard
                name="Icon"
                prop='variant="icon"'
                status="default"
                description="Actions on a record, e.g. the activity screen's more-options menu. Destructive rows use the error color."
                notes={[
                  "Icon 22 (17 when the icon library is Lucide) · 16px gap · label 16",
                  "destructive: true → semantic-error for icon and label",
                ]}
              >
                <div style={{ padding: 16 }}>
                  <Menu
                    variant="icon"
                    style={{ width: "fit-content" }}
                    items={[
                      { id: "edit", label: "Edit", icon: "edit" },
                      { id: "ask", label: "Ask", icon: "auto_awesome" },
                      { id: "share", label: "Share", icon: "ios_share" },
                      { id: "delete", label: "Delete", icon: "delete", destructive: true },
                    ]}
                  />
                </div>
              </VariantCard>
              <VariantCard
                name="Check"
                prop='variant="check"'
                description="Picking one value, e.g. In-person / Phone call, filters and sort. The selected row shows a check on the right."
                notes={[
                  "Check: neonindigo, right-aligned in a 20px slot so labels line up",
                  "Sort and filter menus use this variant; section labels and a divider split the groups",
                ]}
              >
                <div style={{ padding: 16 }}>
                  <Menu
                    variant="check"
                    style={{ width: "fit-content" }}
                    items={[
                      { id: "inperson", label: "In-person", selected: true },
                      { id: "phone", label: "Phone call" },
                    ]}
                  />
                </div>
              </VariantCard>
              <VariantCard
                name="Icon and check"
                prop='variant="icon-check"'
                description="A pick-one list where each choice has an icon."
              >
                <div style={{ padding: 16 }}>
                  <Menu
                    variant="icon-check"
                    style={{ width: "fit-content" }}
                    items={[
                      { id: "inperson", label: "In-person", icon: "groups", selected: true },
                      { id: "phone", label: "Phone call", icon: "call" },
                      { id: "video", label: "Video call", icon: "videocam" },
                    ]}
                  />
                </div>
              </VariantCard>
            </AreaGroup>
          </ComponentArea>

          {/* ── Icons ─────────────────────────────────────────────────── */}
          <SectionHeader
            id="icons"
            title="Icons"
            subtitle="Material Symbols Rounded variable font — weight, fill, and size axes. Names match the Figma Material Symbols community library exactly."
          />

          {/* Variable axes demo */}
          <div className="mb-10">
            <SubHeader title="Variable Axes" />
            <div className="flex flex-wrap gap-8 items-end">
              {/* Fill */}
              <div>
                <p className="text-[11px] mb-3" style={{ color: "var(--md-sys-color-text-disabled)" }}>fill=false / fill=true</p>
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <Icon name="star" size={32} style={{ color: "var(--md-sys-color-text-primary)" }} />
                    <span className="text-2xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>outlined</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Icon name="star" fill size={32} style={{ color: "var(--md-sys-color-text-primary)" }} />
                    <span className="text-2xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>filled</span>
                  </div>
                </div>
              </div>
              {/* Weight */}
              <div>
                <p className="text-[11px] mb-3" style={{ color: "var(--md-sys-color-text-disabled)" }}>weight axis</p>
                <div className="flex gap-4 items-center">
                  {([100, 300, 400, 700] as const).map((w) => (
                    <div key={w} className="flex flex-col items-center gap-1">
                      <Icon name="favorite" size={32} weight={w} style={{ color: "var(--md-sys-color-text-primary)" }} />
                      <span className="text-2xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Size */}
              <div>
                <p className="text-[11px] mb-3" style={{ color: "var(--md-sys-color-text-disabled)" }}>size</p>
                <div className="flex gap-4 items-end">
                  {[16, 20, 24, 32, 40].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <Icon name="notifications" size={s} style={{ color: "var(--md-sys-color-text-primary)" }} />
                      <span className="text-2xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custom icons */}
          <div className="mb-10">
            <SubHeader title="Custom — Halosight" />
            <div className="flex flex-wrap gap-4">
              {/* Account type icons — live components */}
              {(["corporate", "branch", "standalone"] as const).map((type) => (
                <div key={type} className="flex flex-col items-center gap-2 py-3 px-4 rounded-lg" style={{ background: "var(--md-sys-color-dark-secondary)" }}>
                  <AccountTypeIcon type={type} />
                  <span className="text-2xs text-center" style={{ color: "var(--md-sys-color-text-disabled)" }}>
                    {type === "corporate" ? "Chain (Corporate)" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </div>
              ))}
              {/* Nav icons */}
              {[
                { label: "Home (nav)", el: <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.30273 1.04982C8.30834 0.316728 9.69166 0.316728 10.6973 1.04982L16.8691 5.54982C17.5812 6.06914 18 6.88458 18 7.75001V13.75C18 15.821 16.2728 17.5 14.1426 17.5H11.0576V13.002C11.0576 12.4499 10.6096 12.0022 10.0576 12.002H7.94238C7.39036 12.0022 6.94245 12.4499 6.94238 13.002V17.5H3.85742C1.72721 17.5 4.95815e-05 15.821 0 13.75V7.75001C4.73418e-05 6.88458 0.418799 6.06914 1.13086 5.54982L7.30273 1.04982Z" fill="var(--md-sys-color-text-primary)"/></svg> },
                { label: "Accounts (nav)", el: <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M8.8984 11.1592C12.4926 11.1592 14.7626 12.697 15.8662 13.7148C16.6443 14.4326 16.647 15.5215 16.1933 16.3096C15.768 17.0481 14.9801 17.5038 14.1279 17.5039H3.91696C3.04814 17.5037 2.2451 17.039 1.81149 16.2861C1.3709 15.5207 1.34294 14.457 2.0859 13.7256C3.13377 12.6944 5.30781 11.1594 8.8984 11.1592ZM9.00875 0.5C11.3543 0.5 13.2861 2.36179 13.2861 4.69531C13.2861 7.02884 11.3543 8.89062 9.00875 8.89062C6.66339 8.89035 4.73144 7.02867 4.73141 4.69531C4.73144 2.36196 6.6634 0.50027 9.00875 0.5Z" fill="var(--md-sys-color-text-primary)"/></svg> },
                { label: "Sort (menu)", el: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3 5H17" stroke="var(--md-sys-color-text-primary)" strokeWidth="1.75" strokeLinecap="round"/><path d="M6 10H14" stroke="var(--md-sys-color-text-primary)" strokeWidth="1.75" strokeLinecap="round"/><path d="M9 15H11" stroke="var(--md-sys-color-text-primary)" strokeWidth="1.75" strokeLinecap="round"/></svg> },
                { label: "Menu (top nav)", el: <MenuIcon size={22} color="var(--md-sys-color-text-primary)" /> },
              ].map(({ label, el }) => (
                <div key={label} className="flex flex-col items-center gap-2 py-3 px-4 rounded-lg" style={{ background: "var(--md-sys-color-dark-secondary)" }}>
                  {el}
                  <span className="text-2xs text-center" style={{ color: "var(--md-sys-color-text-disabled)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* M3 icon grid — organized by category */}
          {[
            {
              category: "Navigation & Actions",
              icons: ["home","menu","close","arrow_back","arrow_forward","chevron_right","chevron_left","expand_more","expand_less","more_vert","more_horiz","open_in_new","launch","undo","redo","refresh","search","filter_list","sort","tune"],
            },
            {
              category: "Communication",
              icons: ["mail","email","phone","chat","sms","send","reply","forward","inbox","drafts","notifications","notifications_active","notification_add","call","call_end","video_call","message","forum","comment","announcement"],
            },
            {
              category: "Content & Editing",
              icons: ["edit","delete","add","remove","content_copy","content_paste","content_cut","select_all","clear","done","check","check_circle","cancel","block","flag","bookmark","bookmark_add","label","tag","attachment"],
            },
            {
              category: "Media & Files",
              icons: ["image","photo","movie","audio_file","folder","folder_open","draft","download","upload","cloud","cloud_upload","cloud_download","share","link","print","save","text_snippet","insert_drive_file","description","article"],
            },
            {
              category: "People & Places",
              icons: ["person","people","group","account_circle","manage_accounts","badge","contacts","location_on","map","place","directions","my_location","near_me","store","business","home_work","apartment","corporate_fare","domain","work"],
            },
            {
              category: "Data & Charts",
              icons: ["bar_chart","pie_chart","show_chart","trending_up","trending_down","analytics","insights","query_stats","assessment","table_chart","leaderboard","stacked_bar_chart","timeline","data_usage","donut_large","ssid_chart","waterfall_chart","area_chart","scatter_plot","bubble_chart"],
            },
            {
              category: "Status & Feedback",
              icons: ["info","warning","error","help","check_circle","task_alt","highlight_off","cancel","verified","new_releases","report","report_problem","feedback","thumb_up","thumb_down","star","grade","favorite","sentiment_satisfied","mood_bad"],
            },
            {
              category: "Settings & System",
              icons: ["settings","manage_search","admin_panel_settings","lock","lock_open","security","privacy_tip","visibility","visibility_off","key","password","shield","gpp_good","verified_user","device_unknown","devices","smartphone","computer","wifi","bluetooth"],
            },
          ].map(({ category, icons }) => (
            <div key={category} className="mb-10">
              <SubHeader title={category} />
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
                {icons.map((name) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-lg"
                    style={{ background: "var(--md-sys-color-dark-secondary)" }}
                  >
                    <Icon name={name} size={24} style={{ color: "var(--md-sys-color-text-primary)" }} />
                    <span
                      className="text-center font-mono leading-tight"
                      style={{ color: "var(--md-sys-color-text-disabled)", fontSize: 11, wordBreak: "break-all" }}
                    >
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <TokenLabel
            name="Icon — material-symbols-rounded · self-hosted · variable font · wght 100–700 · FILL 0–1"
            value="Component: <Icon name='home' fill size={24} weight={400} /> · Figma: Material Symbols community library (names identical)"
          />
          <div className="mb-16" />

          {/* Footer */}
          <div className="pt-8" style={{ borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
            <p className="text-[12px]" style={{ color: "var(--md-sys-color-text-disabled)" }}>
              Halosight Design System · M3-aligned · Flutter-ready · Last updated 2026
            </p>
          </div>

          </CatalogContextBridge>
          </>}
        </main>
      </div>
    </div>
  );
}
