"use client";

/**
 * Halosight Design System — Reference Page
 * Live viewer for all tokens, type scale, and components.
 * M3-aligned naming throughout for Figma + Flutter compatibility.
 * Not part of the mobile app UX — browser-only reference tool.
 *
 * Color swatches read from live CSS custom properties via getComputedStyle —
 * editing globals.css is the only step needed to update colors here.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import AccountListItem from "@/components/accounts/AccountListItem";
import ListCard from "@/components/ui/ListCard";
import { DrawerHandle, DrawerBody, DrawerHeader } from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import ActivityCard from "@/components/accounts/ActivityCard";
import Menu from "@/components/ui/Menu";
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
import ActionItemList, { ActionItemsHeader, type ActionItemEntry } from "@/components/accounts/ActionItemList";
import BottomNav from "@/components/layout/BottomNav";
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
  { id: "inputs",      label: "Inputs" },
  { id: "badges",      label: "Badges & Chips" },
  { id: "account-list-item", label: "Account List Item" },
  { id: "drawer", label: "Drawer" },
  { id: "action-item-list", label: "Action Item List" },
  { id: "action-item-drawer", label: "Action Item Drawer" },
  { id: "tabs", label: "Tabs" },
  { id: "activity-card", label: "Activity Card" },
  { id: "insight-card", label: "Insight Card" },
  { id: "account-chat", label: "Account Chat" },
  { id: "feedback-widget", label: "Feedback Widget" },
  { id: "menus",       label: "Menu" },
  { id: "icons",       label: "Icons" },
  { id: "navigation",  label: "Navigation" },
];

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
const sampleActivities: ActivityItem[] = [
  { id: "a1", accountId: "demo", date: daysAgoDate(2), type: "visit", title: "QBR planning, product updates and launch coordination", summary: "The team aligned on an in-person QBR in Houston, reviewed Halosight product and Salesforce updates, and agreed on next steps for the pilot group.", durationMinutes: 45, hasTranscript: true, repName: "Jordan Mills" },
  { id: "a2", accountId: "demo", date: daysAgoDate(95), type: "call", title: "Pilot users request date based recap and task digest", summary: "The pilot group praised Halosight's meeting summaries and asked for date-based activity recaps and a daily digest of open tasks.", durationMinutes: 30, hasTranscript: true, repName: "Marcus Webb" },
  { id: "a3", accountId: "demo", date: daysAgoDate(4), type: "email", source: "salesforce", title: "Re: September QBR logistics", summary: "Hi team — confirming we have the Houston room booked for the 14th, 9am to noon. Let me know if Sam should loop in anyone before then.", hasTranscript: false, repName: "Dana Ruiz" },
];
const sampleHome = [...sampleOwned, ...mockAccounts.filter((a) => !SAMPLE_IDS.includes(a.id)).slice(0, 1)];

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [insightExtras, setInsightExtras] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={() => setDrawerOpen(false)}
            className="block py-1.5 text-[13px] transition-colors"
            style={{ color: "var(--md-sys-color-text-muted)" }}
          >
            {s.label}
          </a>
        ))}
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
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block py-1.5 text-[13px] transition-colors"
              style={{ color: "var(--md-sys-color-text-muted)" }}
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-5xl px-4 sm:px-8 lg:px-12 py-8 lg:py-12">

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

          {/* ── Buttons ───────────────────────────────────────────────── */}
          <SectionHeader
            id="buttons"
            title="Buttons"
            subtitle="M3 button variants — Filled, Filled Tonal, Outlined, Text — each with a loading state."
          />
          <div className="space-y-8 mb-16">
            <div>
              <SubHeader title="Filled Button — Primary" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-text-inverse)" }}>
                  Log a Visit
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70 flex items-center gap-2" style={{ background: "var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-text-inverse)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--md-sys-color-text-inverse)" strokeWidth="1.5"/><path d="M8 5V8L10 10" stroke="var(--md-sys-color-text-inverse)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  With Icon
                </button>
                <button disabled className="h-12 px-6 rounded-full font-semibold text-[15px] opacity-30 cursor-not-allowed" style={{ background: "var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-text-inverse)" }}>
                  Disabled
                </button>
              </div>
              <TokenLabel name="background: --md-sys-color-brand-coral · color: --md-sys-color-text-inverse · radius: --radius-full" value="height: 48px · padding: 0 24px · font: 600 15px" />
              {/* Small */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-3">
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ background: "var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-text-inverse)" }}>
                  Log a Visit
                </button>
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70 flex items-center gap-1.5" style={{ background: "var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-text-inverse)" }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--md-sys-color-text-inverse)" strokeWidth="1.5"/><path d="M8 5V8L10 10" stroke="var(--md-sys-color-text-inverse)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  With Icon
                </button>
                <button disabled className="h-11 px-5 rounded-full font-semibold text-[14px] opacity-30 cursor-not-allowed" style={{ background: "var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-text-inverse)" }}>
                  Disabled
                </button>
              </div>
              <TokenLabel name="Small" value="height: 44px · padding: 0 20px · font: 600 14px" />
              <div className="mt-6"><LoadingRow variant="filled" label="Log a Visit" loadingLabel="Logging" /></div>
              <TokenLabel name="Loading — dots only keeps the button's exact size · dots + label for longer waits" value="ThinkingDots sm · color: currentColor (text.inverse here) · not dimmed, not tappable (aria-busy)" />
            </div>

            <div>
              <SubHeader title="Filled Tonal Button" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-neonindigo)" }}>
                  View Transcript
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--md-sys-color-dark-secondary)", color: "var(--md-sys-color-success)" }}>
                  Mark Complete
                </button>
              </div>
              <TokenLabel name="background: --md-sys-color-dark-tertiary · color: --md-sys-color-neonindigo" value="height: 48px · radius: --radius-full" />
              {/* Small */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-3">
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-neonindigo)" }}>
                  View Transcript
                </button>
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ background: "var(--md-sys-color-dark-secondary)", color: "var(--md-sys-color-success)" }}>
                  Mark Complete
                </button>
              </div>
              <TokenLabel name="Small" value="height: 44px · padding: 0 20px · font: 600 14px" />
              <div className="mt-6"><LoadingRow variant="tonal" label="View Transcript" loadingLabel="Opening" /></div>
              <TokenLabel name="Loading" value="dots take the label colour (neonindigo on tonal)" />
            </div>

            <div>
              <SubHeader title="Outlined Button" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-primary)", background: "transparent" }}>
                  Edit
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-brand-coral)", background: "transparent" }}>
                  Reject
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--md-sys-color-neonindigo)", color: "var(--md-sys-color-neonindigo)", background: "transparent" }}>
                  Regenerate
                </button>
              </div>
              <TokenLabel name="border: --md-sys-color-dark-tertiary · radius: --radius-full" value="height: 48px · background: transparent" />
              {/* Small */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-3">
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-text-primary)", background: "transparent" }}>
                  Edit
                </button>
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-brand-coral)", background: "transparent" }}>
                  Reject
                </button>
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--md-sys-color-neonindigo)", color: "var(--md-sys-color-neonindigo)", background: "transparent" }}>
                  Regenerate
                </button>
              </div>
              <TokenLabel name="Small" value="height: 44px · padding: 0 20px · font: 600 14px" />
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
                <button className="h-10 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--md-sys-color-neonindigo)", background: "transparent" }}>
                  Log in with Email
                </button>
                <button className="h-10 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--md-sys-color-text-muted)", background: "transparent" }}>
                  View transcript →
                </button>
              </div>
              <TokenLabel name="color: --md-sys-color-neonindigo · background: none" value="height: 40px · font: 600 14px" />
              {/* Small */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-3">
                <button className="h-9 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--md-sys-color-neonindigo)", background: "transparent" }}>
                  Log in with Email
                </button>
                <button className="h-9 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--md-sys-color-text-muted)", background: "transparent" }}>
                  View transcript →
                </button>
              </div>
              <TokenLabel name="Small" value="height: 36px · font: 600 14px" />
              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <Button variant="text" loading>Log in with Email</Button>
                <Button variant="text" loading loadingLabel="Signing in">Log in with Email</Button>
                <TryItButton variant="text" label="Log in — try it" loadingLabel="Signing in" />
              </div>
              <TokenLabel name="Loading" value="no fill, so the dots are the only thing that changes" />
            </div>

            <div>
              <SubHeader title="OAuth Buttons (Login Screen)" />
              <div className="flex items-center gap-4 flex-wrap">
                <button className="h-14 px-6 rounded-2xl font-semibold text-[16px] flex items-center gap-3 transition-opacity active:opacity-70" style={{ background: "var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-text-inverse)" }}>
                  <span style={{ fontFamily: "serif", fontWeight: 700, fontSize: 18 }}>G</span>
                  Continue with Google
                </button>
                <button className="h-14 px-6 rounded-2xl font-semibold text-[16px] flex items-center gap-3 transition-opacity active:opacity-70" style={{ background: "#FFFFFF", color: "#111420" }}>
                  <span style={{ fontSize: 16 }}>⊞</span>
                  Continue with Microsoft
                </button>
                <button className="h-14 px-6 rounded-2xl font-semibold text-[16px] flex items-center gap-3 transition-opacity active:opacity-70" style={{ background: "#FFFFFF", color: "#111420" }}>
                  <span style={{ fontSize: 18 }}>&#63743;</span>
                  Sign in with Apple
                </button>
              </div>
              <TokenLabel name="height: 56px · radius: --radius-lg · font: 600 16px" value="Google: --md-sys-color-brand-coral bg · Microsoft/Apple: white (brand requirement)" />
              <div className="flex items-center gap-4 flex-wrap mt-6">
                <button aria-busy className="h-14 px-6 rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-3" style={{ background: "var(--md-sys-color-brand-coral)", color: "var(--md-sys-color-text-inverse)", minWidth: 244, pointerEvents: "none" }}>
                  <ThinkingDots size="sm" label="Signing in with Google" />
                  <span>Signing in…</span>
                </button>
                <button aria-busy className="h-14 px-6 rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-3" style={{ background: "#FFFFFF", color: "#111420", minWidth: 244, pointerEvents: "none" }}>
                  <ThinkingDots size="sm" label="Signing in with Microsoft" />
                  <span>Signing in…</span>
                </button>
              </div>
              <TokenLabel name="Loading — OAuth buttons keep their width and show the dots plus “Signing in…”" value="dots use the button's text colour" />
            </div>

            <div>
              <SubHeader title="Loading Animation — Listening Bars" />
              <p className="text-sm mb-4 max-w-xl" style={{ color: "var(--md-sys-color-text-muted)" }}>
                Replaces the spinning circle. Dots stretch into rounded capsules in a staggered, slightly off-beat wave, like a voice level,
                so it echoes what Halosight does without copying a chat &ldquo;thinking&rdquo; animation. Colour is the surrounding text colour.
              </p>
              <DotsOnSurfaces />
              <TokenLabel name="ThinkingDots — 3 bars · 1.2s loop · 0.14s stagger · easing (0.4, 0, 0.2, 1)" value="sm 4px · 4→12 · md 5px · 5→18 · lg 6px · 6→26 · reduced motion: static at 40% height" />
            </div>
          </div>

          {/* ── Inputs ────────────────────────────────────────────────── */}
          <SectionHeader
            id="inputs"
            title="Inputs"
            subtitle="Search bar and text field variants."
          />
          <div className="space-y-6 mb-16 max-w-lg">
            <div>
              <SubHeader title="Search Field" />
              <div className="flex items-center gap-2 h-11 px-3 rounded-xl" style={{ background: "var(--md-sys-color-dark-secondary)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75"/><path d="M12 12L16 16" stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75" strokeLinecap="round"/></svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent text-[15px] outline-none"
                  style={{ color: "var(--md-sys-color-text-primary)", caretColor: "var(--md-sys-color-brand-coral)" }}
                />
                {inputValue && (
                  <button onClick={() => setInputValue("")}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="var(--md-sys-color-text-disabled)"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                )}
              </div>
              <TokenLabel name="background: --md-sys-color-dark-secondary · height: 44px · radius: --radius-md" value="icon: --md-sys-color-text-muted · placeholder: --md-sys-color-text-disabled" />
            </div>
          </div>

          {/* ── Badges ────────────────────────────────────────────────── */}
          <SectionHeader
            id="badges"
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
            <div>
              <SubHeader title="AI Confidence Indicator" />
              <div className="flex items-center gap-4">
                {[
                  { label: "High confidence", pct: 94, token: "--md-sys-color-success" },
                  { label: "Medium confidence", pct: 71, token: "--md-sys-color-warning" },
                  { label: "Low confidence", pct: 38, token: "--md-sys-color-error" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)" }}>
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: `var(${item.token})` }} />
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: `var(${item.token})` }}>{item.pct}%</span>
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--md-sys-color-text-disabled)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                usedBy={["Drawer", "Delete confirmation"]}
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

            <AreaGroup title="Edit" count={3}>
              <VariantCard
                name="Edit"
                prop="mode: edit"
                description="Sticky Cancel / Edit item / check header, then Title and Description with counters, the interaction card, the Due date chips with Show calendar, and Delete action item. Cancel discards; the check saves."
                notes={["Fields are inset: dark-base fill, tertiary border", "Counters: title 200, description 2000", "Date chips scroll sideways; the selected one is neonindigo", "Flutter uses the platform date picker in place of Show calendar"]}
              >
                <EditPreview />
              </VariantCard>
              <VariantCard
                name="Edit, field focused"
                prop="focus: title | description"
                description="The focused field gets a 1.5px neonindigo border."
              >
                <EditPreview focus="title" />
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
                description="A centered card over the scrim. Yes, delete is the error fill; Cancel is quiet. Delete is permanent."
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
            name="Activity Card"
            kind="Library"
            description="One row in an account's Activity tab. Open rows on the page background, separated by hairlines. Two variants: logged in Halosight, or brought in from Salesforce."
            source="components/accounts/ActivityCard.tsx"
            flutter="activity_card.dart"
            anatomy="title · two-line summary · meta line (relative date · duration or source · who created it)"
          >
            <AreaGroup title="Variants" count={2}>
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
                description="Tapping the waveform button swaps the input for the voice dock. Blue glow rises from the bottom edge; the orb has a soft halo."
              >
                <VoicePreview phase="listening" />
              </VariantCard>
              <VariantCard
                name="Voice — thinking"
                prop='phase="thinking"'
                description="What you just said appears as an italic line over the orb while the answer is prepared."
              >
                <VoicePreview phase="thinking" />
              </VariantCard>
              <VariantCard
                name="Voice — speaking"
                prop='phase="speaking"'
                description="The glow turns coral and the controls go flat. The answer highlights word by word as it is read aloud; the rest stays muted. The close button returns to the text input."
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
                  "Icon 22 · 16px gap · label 16",
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

          {/* ── Navigation ────────────────────────────────────────────── */}
          <SectionHeader
            id="navigation"
            title="Navigation"
            subtitle="Bottom navigation bar — Home and Accounts tabs."
          />
          <div className="max-w-xs mb-16">
            <div style={{ background: "var(--md-sys-color-background)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <BottomNav />
            </div>
            <TokenLabel name="BottomNav — live component · background: --md-sys-color-alpha-neonindigo-glass · active pill: --md-sys-color-alpha-dark-glass" value="height: 66px · 32px padding sides & bottom · pill: --radius-full · active inset: 6px" />
          </div>

          {/* Footer */}
          <div className="pt-8" style={{ borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
            <p className="text-[12px]" style={{ color: "var(--md-sys-color-text-disabled)" }}>
              Halosight Design System · M3-aligned · Flutter-ready · Last updated 2026
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}
