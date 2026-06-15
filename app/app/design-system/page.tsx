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
import ActionItemCard from "@/components/accounts/ActionItemCard";
import BottomNav from "@/components/layout/BottomNav";
import SortMenu from "@/components/accounts/SortMenu";
import Icon from "@/components/ui/Icon";
import AccountTypeIcon from "@/components/accounts/AccountTypeIcon";
import MenuIcon from "@/components/ui/MenuIcon";
import { mockAccounts } from "@/lib/mock-data/accounts";

// ─── Section anchor IDs ────────────────────────────────────────────────────
const SECTIONS = [
  { id: "voice-tone",          label: "Voice & Tone" },
  { id: "base-brand-colors",   label: "Base Brand Colors" },
  { id: "light-theme-colors",  label: "Light Theme Colors" },
  { id: "dark-theme-colors",   label: "Dark Theme Colors" },
  { id: "text-colors",         label: "Text Colors" },
  { id: "neutrals",            label: "Neutrals" },
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
  { id: "cards",       label: "Cards & Lists" },
  { id: "menus",       label: "Menus" },
  { id: "icons",       label: "Icons" },
  { id: "navigation",  label: "Navigation" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <div id={id} className="mb-8 pt-2">
      <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "#FFFFFF" }}>{title}</h2>
      {subtitle && <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>}
      <div className="mt-3 h-px" style={{ background: "var(--color-dark-tertiary)" }} />
    </div>
  );
}

function BrandSectionHeader({ id, title }: { id: string; title: string }) {
  return (
    <div id={id} className="mb-8 pt-2">
      <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
      <div className="mt-3 h-px" style={{ background: "var(--color-dark-tertiary)" }} />
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-disabled)" }}>
      {title}
    </h3>
  );
}

function TokenLabel({ name, value }: { name: string; value: string }) {
  return (
    <div className="mt-2">
      <p className="text-[11px] font-mono" style={{ color: "var(--color-brand-purple)" }}>{name}</p>
      <p className="text-[11px] font-mono" style={{ color: "var(--color-text-disabled)" }}>{value}</p>
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
      style={{ color: copied ? "var(--color-brand-purple-light)" : "var(--color-text-disabled)" }}
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
  token: string;   // full CSS var name, e.g. "--color-primary"
  label: string;
  textColor?: string; // kept for API compat, unused
  small?: boolean;
}) {
  const [liveValue, setLiveValue] = useState("…");

  useEffect(() => {
    setLiveValue(
      getComputedStyle(document.documentElement).getPropertyValue(token).trim()
    );
  }, [token]);

  const needsBorder = token === "--color-background" || token === "--color-surface-dim";

  return (
    <div
      className="flex flex-col overflow-hidden w-[180px]"
      style={{
        borderRadius: 5,
        border: "1px solid var(--color-alpha-white-10)",
      }}
    >
      {/* Color block */}
      <div
        style={{
          background: `var(${token})`,
          height: small ? 52 : 80,
          borderBottom: needsBorder ? "1px solid var(--color-alpha-white-10)" : "1px solid rgba(0,0,0,0.15)",
        }}
      />
      {/* Info strip */}
      <div style={{ background: "var(--color-dark-secondary)", padding: "8px 10px", flex: 1 }}>
        <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--color-text-primary)", letterSpacing: "0.01em" }}>{label}</p>
        <div className="flex items-center gap-1 mt-[3px]">
          <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--color-brand-purple-light)", opacity: 0.7 }}>{token}</p>
          <CopyTokenButton token={token} />
        </div>
        <p className="font-mono leading-tight truncate mt-[3px]" style={{ fontSize: 11, color: "var(--color-text-disabled)" }}>{liveValue}</p>
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
        border: "1px solid var(--color-alpha-white-10)",
      }}
    >
      {/* Gradient block */}
      <div style={{ height: 80, background: `var(${token})`, borderBottom: "1px solid rgba(0,0,0,0.15)" }} />
      {/* Info strip */}
      <div style={{ background: "var(--color-dark-secondary)", padding: "8px 10px", flex: 1 }}>
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
        <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--color-text-primary)", letterSpacing: "0.01em" }}>{label}</p>
        <div className="flex items-center gap-1 mt-[3px]">
          <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--color-brand-purple-light)", opacity: 0.7 }}>{token}</p>
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
    setLiveValue(getComputedStyle(document.documentElement).getPropertyValue(token).trim());
  }, [token]);

  return (
    <div
      className="flex flex-col overflow-hidden w-[180px]"
      style={{
        borderRadius: 5,
        border: "1px solid var(--color-alpha-white-10)",
      }}
    >
      {/* Checkered backdrop + alpha layer */}
      <div
        className="relative"
        style={{
          height: 80,
          backgroundImage: [
            "linear-gradient(45deg, #3D4451 25%, transparent 25%)",
            "linear-gradient(-45deg, #3D4451 25%, transparent 25%)",
            "linear-gradient(45deg, transparent 75%, #3D4451 75%)",
            "linear-gradient(-45deg, transparent 75%, #3D4451 75%)",
          ].join(", "),
          backgroundSize: "10px 10px",
          backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
          backgroundColor: "#252A36",
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
      <div style={{ background: "var(--color-dark-secondary)", padding: "8px 10px", flex: 1 }}>
        <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--color-text-primary)", letterSpacing: "0.01em" }}>{label}</p>
        <div className="flex items-center gap-1 mt-[3px]">
          <p className="font-mono leading-tight truncate" style={{ fontSize: 11, color: "var(--color-brand-purple-light)", opacity: 0.7 }}>{token}</p>
          <CopyTokenButton token={token} />
        </div>
        <p className="font-mono leading-tight truncate mt-[3px]" style={{ fontSize: 11, color: "var(--color-text-disabled)" }}>{liveValue}</p>
        <p className="font-mono leading-tight truncate mt-[3px]" style={{ fontSize: 11, color: "var(--color-text-disabled)", opacity: 0.7 }}>{description}</p>
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
        <ColorSwatch token={`--color-${role}`}    label={role}         small />
        <ColorSwatch token={`--color-on-${role}`} label={`on-${role}`} small />
      </div>
      <div className="grid grid-cols-2 gap-1">
        <ColorSwatch token={`--color-${role}-container`}    label={`${role}-container`}    small />
        <ColorSwatch token={`--color-on-${role}-container`} label={`on-${role}-container`} small />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: "var(--color-text-disabled)" }}>{label}</p>
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
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 py-5" style={{ borderBottom: "1px solid var(--color-dark-tertiary)" }}>
      <div className="flex-1 min-w-0">
        <p className={cssClass} style={{ color: "var(--color-text-primary)" }}>{sample}</p>
      </div>
      <div className="sm:w-56 flex-shrink-0 sm:text-right pt-0 sm:pt-1">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--color-brand-purple)" }}>.{cssClass}</p>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--color-text-disabled)" }}>
          {font} · {weight} · {size} · lh {lineHeight}
        </p>
        {extra && <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--color-text-disabled)" }}>{extra}</p>}
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
          background: "var(--color-dark-tertiary)",
          border: "2px solid var(--color-brand-purple)",
          borderRadius: radius,
        }}
      />
      <div className="text-center">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--color-brand-purple)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--color-text-disabled)" }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Spacing swatch ───────────────────────────────────────────────────────
function SpacingSwatch({ token, value }: { token: string; value: string }) {
  const px = parseInt(value);
  return (
    <div className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid var(--color-dark-tertiary)" }}>
      <div className="w-24 flex-shrink-0">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--color-brand-purple)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--color-text-disabled)" }}>{value}</p>
      </div>
      <div
        className="flex-shrink-0"
        style={{ width: px, height: 20, background: "var(--color-brand-coral)", borderRadius: 3, minWidth: 3 }}
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
          background: "var(--color-dark-secondary)",
          boxShadow: shadow,
          height: 100,
        }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-muted)" }}>Level {level}</span>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--color-brand-purple)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--color-text-disabled)" }}>Elevation {level}</p>
      </div>
    </div>
  );
}

// ─── Tab Bar Demo ─────────────────────────────────────────────────────────
// Live component — same JSX as accounts/[id]/page.tsx. Edit there, updates here.
function TabBarDemo() {
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");
  return (
    <div>
      <SubHeader title="Tab Bar" />
      <div className="max-w-xs">
        <div
          className="flex p-1 gap-1"
          style={{ background: "var(--color-dark-primary)", borderRadius: "var(--radius-full)" }}
        >
          {(["overview", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm font-semibold transition-all capitalize"
              style={{
                borderRadius: "var(--radius-full)",
                background: activeTab === tab ? "var(--color-dark-secondary)" : "transparent",
                color: activeTab === tab ? "var(--color-text-primary)" : "var(--color-text-muted)",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <TokenLabel
        name="container: --color-dark-primary · active tab: --color-dark-secondary"
        value="radius: --radius-full on container · --radius-full on tab"
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    <div className="min-h-screen" style={{ background: "var(--color-background)", fontFamily: "Barlow, sans-serif" }}>

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
          background: "var(--color-dark-primary)",
          borderRight: "1px solid var(--color-dark-tertiary)",
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
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-disabled)" }}>
            Contents
          </p>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-opacity active:opacity-60"
            style={{ background: "var(--color-dark-tertiary)" }}
            aria-label="Close navigation"
          >
            <Icon name="close" size={16} style={{ color: "var(--color-text-muted)" }} />
          </button>
        </div>
        {/* Nav links */}
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={() => setDrawerOpen(false)}
            className="block py-1.5 text-[13px] transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Top bar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 h-14"
        style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-dark-tertiary)" }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger — only visible below 860px */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="aside:hidden flex items-center justify-center w-8 h-8 rounded-lg mr-1 transition-opacity active:opacity-60"
            style={{ background: "var(--color-dark-secondary)" }}
            aria-label="Open navigation"
          >
            <Icon name="menu" size={18} style={{ color: "var(--color-text-muted)" }} />
          </button>
          <span className="text-[15px] font-bold" style={{ color: "var(--color-text-primary)" }}>Halosight</span>
          <span style={{ color: "var(--color-text-disabled)" }}>·</span>
          <span className="hidden sm:inline text-[13px]" style={{ color: "var(--color-text-muted)" }}>Design System</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-dark-tertiary)", color: "var(--color-brand-purple)" }}
          >
            M3
          </span>
        </div>
        <Link href="/accounts" className="text-[13px]" style={{ color: "var(--color-brand-purple)" }}>
          ← Back to app
        </Link>
      </div>

      <div className="flex">

        {/* Sticky sidebar — hidden below 860px, drawer handles it there */}
        <nav
          className="hidden aside:block w-52 flex-shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-5"
          style={{ borderRight: "1px solid var(--color-dark-tertiary)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-disabled)" }}>
            Contents
          </p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block py-1.5 text-[13px] transition-colors"
              style={{ color: "var(--color-text-muted)" }}
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
                style={{ background: "var(--color-dark-secondary)", border: "1px solid var(--color-dark-tertiary)" }}
              >
                <p className="text-[13px] font-semibold mb-3" style={{ color: "var(--color-brand-purple)" }}>{card.label}</p>
                <ul className="flex flex-col gap-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                      <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ background: "var(--color-text-disabled)" }} />
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
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Neon Indigo</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Interactive &amp; Accent Color</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--color-text-muted)" }}>
              Use for interactive elements, hover states, active states, and visual accents that guide user attention without demanding immediate action.
            </p>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--color-brand-purple-light" label="light" textColor="#111420" />
              <ColorSwatch token="--color-brand-purple"       label="base"  textColor="#111420" />
              <ColorSwatch token="--color-brand-purple-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Indigo</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Secondary Actions &amp; Links</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--color-text-muted)" }}>
              Use for secondary call-to-action buttons (Date CTAs), text links, eyebrow text, and exploratory actions that support the primary user journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--color-brand-blue-light" label="light" textColor="#111420" />
              <ColorSwatch token="--color-brand-blue"       label="base" />
              <ColorSwatch token="--color-brand-blue-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Coral Ember</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Primary CTA &amp; Action Color</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--color-text-muted)" }}>
              Use for primary call-to-action buttons (Marriage CTAs), important alerts, and high-priority actions that demand immediate attention.
            </p>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--color-brand-coral-light" label="light" textColor="#111420" />
              <ColorSwatch token="--color-brand-coral"       label="base" />
              <ColorSwatch token="--color-brand-coral-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Teal</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Alternative Secondary &amp; Highlights</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--color-text-muted)" }}>
              Use for alternative secondary actions, featured badges, blog card highlights, and supportive elements that need visual distinction.
            </p>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--color-brand-teal"       label="base" />
              <ColorSwatch token="--color-brand-teal-hover" label="hover" textColor="#111420" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Pink</p>
            <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Special Accents &amp; Badges</p>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--color-text-muted)" }}>
              Use sparingly for special promotional badges, featured items, limited-time offers, or unique visual accents that need to stand out.
            </p>
            <div className="flex">
              <ColorSwatch token="--color-brand-pink" label="base" />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Light Theme Colors ────────────────────────────────────── */}
          <BrandSectionHeader id="light-theme-colors" title="Light Theme Colors" />

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--color-surface-white" label="surface-white" textColor="#111420" />
              <ColorSwatch token="--color-surface-light" label="surface-light" textColor="#111420" />
              <ColorSwatch token="--color-surface-gray"  label="surface-gray"  textColor="#111420" />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Dark Theme Colors ─────────────────────────────────────── */}
          <BrandSectionHeader id="dark-theme-colors" title="Dark Theme Colors" />

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--color-dark-base"      label="dark-base"      />
              <ColorSwatch token="--color-dark-primary"   label="dark-primary"   />
              <ColorSwatch token="--color-dark-secondary" label="dark-secondary" />
              <ColorSwatch token="--color-dark-tertiary"  label="dark-tertiary"  />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Text Colors ───────────────────────────────────────────── */}
          <BrandSectionHeader id="text-colors" title="Text Colors" />

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--color-text-primary"   label="text-primary"   textColor="#111420" />
              <ColorSwatch token="--color-text-secondary" label="text-secondary"  textColor="#111420" />
              <ColorSwatch token="--color-text-muted"     label="text-muted"     textColor="#111420" />
              <ColorSwatch token="--color-text-disabled"  label="text-disabled"  />
              <ColorSwatch token="--color-text-inverse"   label="text-inverse"   />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Neutrals ──────────────────────────────────────────────── */}
          <BrandSectionHeader id="neutrals" title="Neutrals" />

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <ColorSwatch token="--color-neutral-950" label="950" />
              <ColorSwatch token="--color-neutral-800" label="800" />
              <ColorSwatch token="--color-neutral-600" label="600" />
              <ColorSwatch token="--color-neutral-400" label="400" textColor="#111420" />
              <ColorSwatch token="--color-neutral-200" label="200" textColor="#111420" />
              <ColorSwatch token="--color-neutral-50"  label="50"  textColor="#111420" />
            </div>
          </div>

          <div className="mb-16" />

          {/* ── Semantic Colors ───────────────────────────────────────── */}
          <BrandSectionHeader id="semantic-colors" title="Semantic Colors" />

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Success</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--color-success-light" label="light" textColor="#111420" />
              <ColorSwatch token="--color-success"       label="base"  textColor="#111420" />
              <ColorSwatch token="--color-success-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Warning</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--color-warning-light" label="light" textColor="#111420" />
              <ColorSwatch token="--color-warning"       label="base"  textColor="#111420" />
              <ColorSwatch token="--color-warning-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Error</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--color-error-light" label="light" textColor="#111420" />
              <ColorSwatch token="--color-error"       label="base" />
              <ColorSwatch token="--color-error-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Info</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--color-info-light" label="light" textColor="#111420" />
              <ColorSwatch token="--color-info"       label="base"  textColor="#111420" />
              <ColorSwatch token="--color-info-dark"  label="dark" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Data Colors</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--color-data-account"  label="account"   />
              <ColorSwatch token="--color-data-recency"  label="recency"   textColor="#111420" />
              <ColorSwatch token="--color-data-crm-sync" label="crm-sync"  textColor="#111420" />
              <ColorSwatch token="--color-data-review"   label="review"    textColor="#111420" />
            </div>
          </div>

          <div className="mb-16" />

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Recording</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--color-recording" label="base" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Extended Palette</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <ColorSwatch token="--color-ext-cyan"   label="cyan"   textColor="#111420" />
              <ColorSwatch token="--color-ext-lime"   label="lime"   textColor="#111420" />
              <ColorSwatch token="--color-ext-orange" label="orange" textColor="#111420" />
              <ColorSwatch token="--color-ext-gold"   label="gold"   textColor="#111420" />
              <ColorSwatch token="--color-ext-violet" label="violet" />
              <ColorSwatch token="--color-ext-rose"   label="rose"   textColor="#111420" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Gradients</p>
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
            <p className="text-[13px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>Alpha Colors</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <AlphaSwatch
                token="--color-alpha-white-10"
                label="White 10%"
                description="Borders"
              />
              <AlphaSwatch
                token="--color-alpha-white-18"
                label="White 18%"
                description="Active fields · emphasized containers"
              />
              <AlphaSwatch
                token="--color-alpha-purple-10"
                label="Purple 10%"
                description="Backgrounds"
              />
              <AlphaSwatch
                token="--color-alpha-purple-glass"
                label="Purple Glass"
                description="Backgrounds"
                glass
              />
              <AlphaSwatch
                token="--color-alpha-dark-glass"
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
            subtitle="M3 button variants — Filled, Filled Tonal, Outlined, Text, Elevated."
          />
          <div className="space-y-8 mb-16">
            <div>
              <SubHeader title="Filled Button — Primary" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--color-brand-coral)", color: "var(--color-text-inverse)" }}>
                  Log a Visit
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70 flex items-center gap-2" style={{ background: "var(--color-brand-coral)", color: "var(--color-text-inverse)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--color-text-inverse)" strokeWidth="1.5"/><path d="M8 5V8L10 10" stroke="var(--color-text-inverse)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  With Icon
                </button>
                <button disabled className="h-12 px-6 rounded-full font-semibold text-[15px] opacity-30 cursor-not-allowed" style={{ background: "var(--color-brand-coral)", color: "var(--color-text-inverse)" }}>
                  Disabled
                </button>
              </div>
              <TokenLabel name="background: --color-brand-coral · color: --color-text-inverse · radius: --radius-full" value="height: 48px · padding: 0 24px · font: 600 15px" />
              {/* Small */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-3">
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ background: "var(--color-brand-coral)", color: "var(--color-text-inverse)" }}>
                  Log a Visit
                </button>
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70 flex items-center gap-1.5" style={{ background: "var(--color-brand-coral)", color: "var(--color-text-inverse)" }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--color-text-inverse)" strokeWidth="1.5"/><path d="M8 5V8L10 10" stroke="var(--color-text-inverse)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  With Icon
                </button>
                <button disabled className="h-11 px-5 rounded-full font-semibold text-[14px] opacity-30 cursor-not-allowed" style={{ background: "var(--color-brand-coral)", color: "var(--color-text-inverse)" }}>
                  Disabled
                </button>
              </div>
              <TokenLabel name="Small" value="height: 44px · padding: 0 20px · font: 600 14px" />
            </div>

            <div>
              <SubHeader title="Filled Tonal Button" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--color-dark-tertiary)", color: "var(--color-brand-purple)" }}>
                  View Transcript
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--color-dark-secondary)", color: "var(--color-success)" }}>
                  Mark Complete
                </button>
              </div>
              <TokenLabel name="background: --color-dark-tertiary · color: --color-brand-purple" value="height: 48px · radius: --radius-full" />
              {/* Small */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-3">
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ background: "var(--color-dark-tertiary)", color: "var(--color-brand-purple)" }}>
                  View Transcript
                </button>
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ background: "var(--color-dark-secondary)", color: "var(--color-success)" }}>
                  Mark Complete
                </button>
              </div>
              <TokenLabel name="Small" value="height: 44px · padding: 0 20px · font: 600 14px" />
            </div>

            <div>
              <SubHeader title="Outlined Button" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-dark-tertiary)", color: "var(--color-text-primary)", background: "transparent" }}>
                  Edit
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-brand-coral)", color: "var(--color-brand-coral)", background: "transparent" }}>
                  Reject
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-brand-purple)", color: "var(--color-brand-purple)", background: "transparent" }}>
                  Regenerate
                </button>
              </div>
              <TokenLabel name="border: --color-dark-tertiary · radius: --radius-full" value="height: 48px · background: transparent" />
              {/* Small */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-3">
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-dark-tertiary)", color: "var(--color-text-primary)", background: "transparent" }}>
                  Edit
                </button>
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-brand-coral)", color: "var(--color-brand-coral)", background: "transparent" }}>
                  Reject
                </button>
                <button className="h-11 px-5 rounded-full font-semibold text-[14px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-brand-purple)", color: "var(--color-brand-purple)", background: "transparent" }}>
                  Regenerate
                </button>
              </div>
              <TokenLabel name="Small" value="height: 44px · padding: 0 20px · font: 600 14px" />
            </div>

            <div>
              <SubHeader title="Text Button" />
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <button className="h-10 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--color-brand-purple)", background: "transparent" }}>
                  Log in with Email
                </button>
                <button className="h-10 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--color-text-muted)", background: "transparent" }}>
                  View transcript →
                </button>
              </div>
              <TokenLabel name="color: --color-brand-purple · background: none" value="height: 40px · font: 600 14px" />
              {/* Small */}
              <div className="flex items-center gap-3 flex-wrap mt-4 mb-3">
                <button className="h-9 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--color-brand-purple)", background: "transparent" }}>
                  Log in with Email
                </button>
                <button className="h-9 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--color-text-muted)", background: "transparent" }}>
                  View transcript →
                </button>
              </div>
              <TokenLabel name="Small" value="height: 36px · font: 600 14px" />
            </div>

            <div>
              <SubHeader title="OAuth Buttons (Login Screen)" />
              <div className="flex items-center gap-4 flex-wrap">
                <button className="h-14 px-6 rounded-2xl font-semibold text-[16px] flex items-center gap-3 transition-opacity active:opacity-70" style={{ background: "var(--color-brand-coral)", color: "var(--color-text-inverse)" }}>
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
              <TokenLabel name="height: 56px · radius: --radius-lg · font: 600 16px" value="Google: --color-brand-coral bg · Microsoft/Apple: white (brand requirement)" />
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
              <div className="flex items-center gap-2 h-11 px-3 rounded-xl" style={{ background: "var(--color-dark-secondary)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="var(--color-text-muted)" strokeWidth="1.75"/><path d="M12 12L16 16" stroke="var(--color-text-muted)" strokeWidth="1.75" strokeLinecap="round"/></svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent text-[15px] outline-none"
                  style={{ color: "var(--color-text-primary)", caretColor: "var(--color-brand-coral)" }}
                />
                {inputValue && (
                  <button onClick={() => setInputValue("")}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="var(--color-text-disabled)"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                )}
              </div>
              <TokenLabel name="background: --color-dark-secondary · height: 44px · radius: --radius-md" value="icon: --color-text-muted · placeholder: --color-text-disabled" />
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
                  <span key={n} className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--color-dark-tertiary)", color: "var(--color-text-primary)" }}>
                    {n}
                  </span>
                ))}
              </div>
              <TokenLabel name="background: --color-dark-tertiary · radius: --radius-full" value="font: 700 11px" />
            </div>
            <div>
              <SubHeader title="Status Chips" />
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-dark-secondary)", color: "var(--color-success)" }}>Visited Today</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-dark-tertiary)", color: "var(--color-brand-purple)" }}>In Progress</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-dark-secondary)", color: "var(--color-warning)" }}>At Risk</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-dark-secondary)", color: "var(--color-error)" }}>Overdue</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-dark-tertiary)", color: "var(--color-text-muted)" }}>No Activity</span>
              </div>
              <TokenLabel name="radius: --radius-full · font: 600 12px" value="dark-secondary / dark-tertiary bg · semantic text color per status" />
            </div>
            <div>
              <SubHeader title="AI Confidence Indicator" />
              <div className="flex items-center gap-4">
                {[
                  { label: "High confidence", pct: 94, token: "--color-success" },
                  { label: "Medium confidence", pct: 71, token: "--color-warning" },
                  { label: "Low confidence", pct: 38, token: "--color-error" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full" style={{ background: "var(--color-dark-tertiary)" }}>
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: `var(${item.token})` }} />
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: `var(${item.token})` }}>{item.pct}%</span>
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--color-text-disabled)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Cards & Lists ─────────────────────────────────────────── */}
          <SectionHeader
            id="cards"
            title="Cards & Lists"
            subtitle="Account list items, AI output cards, and info cards."
          />
          <div className="space-y-8 mb-16">
            <div>
              <SubHeader title="Account List Items (live component)" />
              <div className="flex flex-col">
                {mockAccounts.slice(0, 4).map((account, i) => (
                  <AccountListItem key={account.id} account={account} isLast={i === 3} />
                ))}
              </div>
              <TokenLabel name="AccountListItem — separator: --color-dark-tertiary border-bottom · no card bg" value="name: 600 16px · meta: text-sm · badge: dark-tertiary pill · task pill: coral-light 20% opacity bg" />
            </div>

            <div>
              <SubHeader title="Action Item Cards (live component)" />
              <div className="flex flex-col gap-2 max-w-sm">
                <ActionItemCard item={{ id: "ds-1", title: "Send Q2 pricing update",        dueDate: new Date(2026, 5, 5),  status: "open" }} />
                <ActionItemCard item={{ id: "ds-2", title: "On-site training for new team", dueDate: null,                  status: "open" }} />
                <ActionItemCard item={{ id: "ds-3", title: "Follow up with procurement",    dueDate: new Date(2026, 5, 12), status: "open" }} />
              </div>
              <TokenLabel name="ActionItemCard — border: #3D4451 50% opacity · no fill · radius: --radius-md" value="title: 600 15px --color-text-primary · due: --color-text-secondary · calendar: --color-brand-purple-dark" />
            </div>

            <div>
              <SubHeader title="Task Row (Upcoming)" />
              <div className="flex flex-col max-w-sm">
                {/* Task — due today */}
                <div className="flex items-center gap-3 px-4 py-3.5 relative">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full" style={{ border: "1.5px solid var(--color-text-disabled)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Send Q2 pricing update</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Icon name="calendar_today" size={12} style={{ color: "var(--color-brand-purple-dark)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--color-brand-coral)" }}>Due Today</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14" stroke="var(--color-brand-teal)" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>Acme Corporation</span>
                      </div>
                    </div>
                  </div>
                  <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)", flexShrink: 0 }} />
                  <div className="absolute bottom-0 left-3 right-3" style={{ height: 1, background: "var(--color-dark-tertiary)" }} />
                </div>
                {/* Task — future date */}
                <div className="flex items-center gap-3 px-4 py-3.5 relative">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full" style={{ border: "1.5px solid var(--color-text-disabled)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>On-site training for new team</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Icon name="calendar_today" size={12} style={{ color: "var(--color-brand-purple-dark)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--color-text-disabled)" }}>Jun 4</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14" stroke="var(--color-brand-teal)" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>Reladyne</span>
                      </div>
                    </div>
                  </div>
                  <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)", flexShrink: 0 }} />
                </div>
              </div>
              <TokenLabel name="TaskRow — open style · separator: --color-dark-tertiary inset 12px" value="checkbox: 20px stroke circle · calendar: --color-brand-purple-dark · due today: --color-brand-coral · account: --color-brand-teal user-round icon" />
            </div>

            <div>
              <SubHeader title="Activity Card (Recently Logged)" />
              <div className="flex flex-col gap-3 max-w-sm">
                <div className="flex items-start gap-3 p-4" style={{ background: "var(--color-dark-secondary)", borderRadius: "var(--radius-md)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Discovery Call</p>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      Initial discovery with Jack's Tire and Oil to understand their platform upgrade needs and timeline.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14" stroke="var(--color-brand-teal)" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Jack's Tire &amp; Oil</span>
                      <span style={{ display: "inline-block", width: 4 }} />
                      <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>Jun 02, 3:46 PM</span>
                      <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>•</span>
                      <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>35 mins</span>
                    </div>
                  </div>
                  <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)", flexShrink: 0, marginTop: 2 }} />
                </div>
                <div className="flex items-start gap-3 p-4" style={{ background: "var(--color-dark-secondary)", borderRadius: "var(--radius-md)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Market Research</p>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      Reviewed competitor platforms to identify feature gaps and opportunities for differentiation.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M7.99984 8.66667C9.84079 8.66667 11.3332 7.17428 11.3332 5.33333C11.3332 3.49238 9.84079 2 7.99984 2C6.15889 2 4.6665 3.49238 4.6665 5.33333C4.6665 7.17428 6.15889 8.66667 7.99984 8.66667ZM7.99984 8.66667C9.41433 8.66667 10.7709 9.22857 11.7711 10.2288C12.7713 11.229 13.3332 12.5855 13.3332 14M7.99984 8.66667C6.58535 8.66667 5.2288 9.22857 4.2286 10.2288C3.22841 11.229 2.6665 12.5855 2.6665 14" stroke="var(--color-brand-teal)" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Acme Corporation</span>
                      <span style={{ display: "inline-block", width: 4 }} />
                      <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>Jun 01, 11:00 PM</span>
                      <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>•</span>
                      <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>1hr 20 mins</span>
                    </div>
                  </div>
                  <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)", flexShrink: 0, marginTop: 2 }} />
                </div>
              </div>
              <TokenLabel name="ActivityCard — background: --color-dark-secondary · radius: --radius-md" value="title: 600 16px --color-text-primary · description: text-sm --color-text-muted · account: --color-text-secondary · meta: --color-text-disabled" />
            </div>

            <div>
              <SubHeader title="AI Output Card" />
              <div className="rounded-2xl p-5" style={{ background: "var(--color-dark-secondary)", border: "1px solid var(--color-dark-tertiary)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-purple)" }}>AI Summary</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 rounded-full" style={{ background: "var(--color-dark-tertiary)" }}>
                      <div className="h-full w-[88%] rounded-full" style={{ background: "var(--color-success)" }} />
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--color-success)" }}>88%</span>
                  </div>
                </div>
                <p className="text-[14px] leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
                  Discussed Q3 fleet expansion. Budget confirmed at ~$240k. Manager expressed strong interest in expanded service contract. Follow-up scheduled for next week.
                </p>
                <div className="flex gap-2">
                  <button className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ background: "var(--color-brand-coral)", color: "var(--color-text-inverse)" }}>Accept</button>
                  <button className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ border: "1.5px solid var(--color-dark-tertiary)", color: "var(--color-text-primary)", background: "transparent" }}>Edit</button>
                  <button className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ border: "1.5px solid var(--color-error)", color: "var(--color-error)", background: "transparent" }}>Reject</button>
                </div>
              </div>
              <TokenLabel name="AIOutputCard — surface: --color-dark-secondary · accent: --color-brand-purple" value="confidence bar: --color-success / --color-warning / --color-error" />
            </div>

            <TabBarDemo />
          </div>

          {/* ── Menus ─────────────────────────────────────────────────── */}
          <SectionHeader
            id="menus"
            title="Menus"
            subtitle="Dropdown menus — sort, filter, and action sheets."
          />
          <div className="mb-16">
            <SubHeader title="Sort Menu" />
            <div className="flex items-start gap-8">
              {/* Closed state */}
              <div>
                <p className="text-[11px] mb-3" style={{ color: "var(--color-text-disabled)" }}>Trigger (closed)</p>
                <SortMenu current="alphabetical" onChange={() => {}} />
              </div>
              {/* Open state — rendered inline so it's always visible */}
              <div className="relative" style={{ paddingTop: 0 }}>
                <p className="text-[11px] mb-3" style={{ color: "var(--color-text-disabled)" }}>Dropdown (open)</p>
                <div
                  style={{
                    background: "var(--color-dark-tertiary)",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)",
                    paddingTop: 16,
                    paddingBottom: 16,
                    paddingLeft: 20,
                    paddingRight: 20,
                    width: 224,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {[
                    { label: "Sort Alphabetically", selected: true },
                    { label: "Sort by Distance",    selected: false },
                    { label: "Sort by Last Visited", selected: false },
                    { label: "Sort by Company",     selected: false },
                  ].map((opt) => (
                    <div
                      key={opt.label}
                      className="flex items-center"
                      style={{ gap: 12, paddingTop: 10, paddingBottom: 10 }}
                    >
                      <span style={{ width: 16, flexShrink: 0, display: "flex", alignItems: "center" }}>
                        {opt.selected && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6.5 11.5L13 5" stroke="var(--color-text-primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-base" style={{ color: "var(--color-text-primary)" }}>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <TokenLabel
              name="SortMenu — live component · background: --color-dark-tertiary · text: --color-text-primary"
              value="padding: 16px top/bottom · 20px sides · row gap: 12px · check slot: 16px · radius: --radius-xl"
            />
          </div>

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
                <p className="text-[11px] mb-3" style={{ color: "var(--color-text-disabled)" }}>fill=false / fill=true</p>
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <Icon name="star" size={32} style={{ color: "var(--color-text-primary)" }} />
                    <span className="text-2xs" style={{ color: "var(--color-text-disabled)" }}>outlined</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Icon name="star" fill size={32} style={{ color: "var(--color-text-primary)" }} />
                    <span className="text-2xs" style={{ color: "var(--color-text-disabled)" }}>filled</span>
                  </div>
                </div>
              </div>
              {/* Weight */}
              <div>
                <p className="text-[11px] mb-3" style={{ color: "var(--color-text-disabled)" }}>weight axis</p>
                <div className="flex gap-4 items-center">
                  {([100, 300, 400, 700] as const).map((w) => (
                    <div key={w} className="flex flex-col items-center gap-1">
                      <Icon name="favorite" size={32} weight={w} style={{ color: "var(--color-text-primary)" }} />
                      <span className="text-2xs" style={{ color: "var(--color-text-disabled)" }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Size */}
              <div>
                <p className="text-[11px] mb-3" style={{ color: "var(--color-text-disabled)" }}>size</p>
                <div className="flex gap-4 items-end">
                  {[16, 20, 24, 32, 40].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <Icon name="notifications" size={s} style={{ color: "var(--color-text-primary)" }} />
                      <span className="text-2xs" style={{ color: "var(--color-text-disabled)" }}>{s}</span>
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
                <div key={type} className="flex flex-col items-center gap-2 py-3 px-4 rounded-lg" style={{ background: "var(--color-dark-secondary)" }}>
                  <AccountTypeIcon type={type} />
                  <span className="text-2xs text-center" style={{ color: "var(--color-text-disabled)" }}>
                    {type === "corporate" ? "Chain (Corporate)" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </div>
              ))}
              {/* Nav icons */}
              {[
                { label: "Home (nav)", el: <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.30273 1.04982C8.30834 0.316728 9.69166 0.316728 10.6973 1.04982L16.8691 5.54982C17.5812 6.06914 18 6.88458 18 7.75001V13.75C18 15.821 16.2728 17.5 14.1426 17.5H11.0576V13.002C11.0576 12.4499 10.6096 12.0022 10.0576 12.002H7.94238C7.39036 12.0022 6.94245 12.4499 6.94238 13.002V17.5H3.85742C1.72721 17.5 4.95815e-05 15.821 0 13.75V7.75001C4.73418e-05 6.88458 0.418799 6.06914 1.13086 5.54982L7.30273 1.04982Z" fill="var(--color-text-primary)"/></svg> },
                { label: "Accounts (nav)", el: <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M8.8984 11.1592C12.4926 11.1592 14.7626 12.697 15.8662 13.7148C16.6443 14.4326 16.647 15.5215 16.1933 16.3096C15.768 17.0481 14.9801 17.5038 14.1279 17.5039H3.91696C3.04814 17.5037 2.2451 17.039 1.81149 16.2861C1.3709 15.5207 1.34294 14.457 2.0859 13.7256C3.13377 12.6944 5.30781 11.1594 8.8984 11.1592ZM9.00875 0.5C11.3543 0.5 13.2861 2.36179 13.2861 4.69531C13.2861 7.02884 11.3543 8.89062 9.00875 8.89062C6.66339 8.89035 4.73144 7.02867 4.73141 4.69531C4.73144 2.36196 6.6634 0.50027 9.00875 0.5Z" fill="var(--color-text-primary)"/></svg> },
                { label: "Sort (menu)", el: <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3 5H17" stroke="var(--color-text-primary)" strokeWidth="1.75" strokeLinecap="round"/><path d="M6 10H14" stroke="var(--color-text-primary)" strokeWidth="1.75" strokeLinecap="round"/><path d="M9 15H11" stroke="var(--color-text-primary)" strokeWidth="1.75" strokeLinecap="round"/></svg> },
                { label: "Menu (top nav)", el: <MenuIcon size={22} color="var(--color-text-primary)" /> },
              ].map(({ label, el }) => (
                <div key={label} className="flex flex-col items-center gap-2 py-3 px-4 rounded-lg" style={{ background: "var(--color-dark-secondary)" }}>
                  {el}
                  <span className="text-2xs text-center" style={{ color: "var(--color-text-disabled)" }}>{label}</span>
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
                    style={{ background: "var(--color-dark-secondary)" }}
                  >
                    <Icon name={name} size={24} style={{ color: "var(--color-text-primary)" }} />
                    <span
                      className="text-center font-mono leading-tight"
                      style={{ color: "var(--color-text-disabled)", fontSize: 11, wordBreak: "break-all" }}
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
            <div style={{ background: "var(--color-background)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <BottomNav />
            </div>
            <TokenLabel name="BottomNav — live component · background: --color-alpha-purple-glass · active pill: --color-alpha-dark-glass" value="height: 66px · 32px padding sides & bottom · pill: --radius-full · active inset: 6px" />
          </div>

          {/* Footer */}
          <div className="pt-8" style={{ borderTop: "1px solid var(--color-dark-tertiary)" }}>
            <p className="text-[12px]" style={{ color: "var(--color-text-disabled)" }}>
              Halosight Design System · M3-aligned · Flutter-ready · Last updated 2026
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}
