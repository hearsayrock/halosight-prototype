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
import { mockAccounts } from "@/lib/mock-data/accounts";

// ─── Section anchor IDs ────────────────────────────────────────────────────
const SECTIONS = [
  { id: "voice-tone",  label: "Voice & Tone" },
  { id: "color",       label: "Color System" },
  { id: "typography",  label: "Typography" },
  { id: "shape",       label: "Shape & Radius" },
  { id: "spacing",     label: "Spacing" },
  { id: "elevation",   label: "Elevation" },
  { id: "buttons",     label: "Buttons" },
  { id: "inputs",      label: "Inputs" },
  { id: "badges",      label: "Badges & Chips" },
  { id: "cards",       label: "Cards & Lists" },
  { id: "navigation",  label: "Navigation" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <div id={id} className="mb-8 pt-2">
      <h2 className="text-2xl font-bold" style={{ color: "var(--color-on-background)" }}>{title}</h2>
      {subtitle && <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{subtitle}</p>}
      <div className="mt-3 h-px" style={{ background: "var(--color-outline)" }} />
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-on-surface-disabled)" }}>
      {title}
    </h3>
  );
}

function TokenLabel({ name, value }: { name: string; value: string }) {
  return (
    <div className="mt-2">
      <p className="text-[11px] font-mono" style={{ color: "var(--color-secondary)" }}>{name}</p>
      <p className="text-[11px] font-mono" style={{ color: "var(--color-on-surface-disabled)" }}>{value}</p>
    </div>
  );
}

// ─── Color Swatch ──────────────────────────────────────────────────────────
// Reads live values from CSS custom properties — change globals.css, this updates automatically.
function ColorSwatch({
  token, label, textColor = "#fff", small = false,
}: {
  token: string;   // full CSS var name, e.g. "--color-primary"
  label: string;
  textColor?: string;
  small?: boolean;
}) {
  const [liveValue, setLiveValue] = useState("…");

  useEffect(() => {
    setLiveValue(
      getComputedStyle(document.documentElement).getPropertyValue(token).trim()
    );
  }, [token]);

  const needsBorder = token === "--color-background" || token === "--color-surface-dim"
    || token === "--color-on-primary" || token === "--color-inverse-surface"
    || token === "--color-on-tertiary";

  return (
    <div className="flex flex-col">
      <div
        className="rounded-xl flex items-end p-3"
        style={{
          background: `var(${token})`,
          height: small ? 64 : 96,
          border: needsBorder ? "1px solid var(--color-outline)" : "none",
        }}
      >
        <span className="text-[11px] font-semibold leading-tight" style={{ color: textColor }}>{label}</span>
      </div>
      <div className="mt-2">
        <p className="text-[11px] font-mono leading-tight" style={{ color: "var(--color-secondary)" }}>{token}</p>
        <p className="text-[11px] font-mono leading-tight" style={{ color: "var(--color-on-surface-disabled)" }}>{liveValue}</p>
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
        <ColorSwatch token={`--color-on-${role}`} label={`on-${role}`} small textColor={role === "on-primary" || role === "on-tertiary" ? "#fff" : "#111420"} />
      </div>
      <div className="grid grid-cols-2 gap-1">
        <ColorSwatch token={`--color-${role}-container`}    label={`${role}-container`}    small />
        <ColorSwatch token={`--color-on-${role}-container`} label={`on-${role}-container`} small />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: "var(--color-on-surface-disabled)" }}>{label}</p>
    </div>
  );
}

// ─── Type specimen ────────────────────────────────────────────────────────
function TypeSpecimen({
  role, size, weight, lineHeight, sample, token
}: {
  role: string; size: string; weight: string; lineHeight: string; sample: string; token: string;
}) {
  return (
    <div className="flex items-start gap-8 py-5" style={{ borderBottom: "1px solid var(--color-outline)" }}>
      <div className="w-48 flex-shrink-0 pt-1">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--color-secondary)" }}>{token}</p>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--color-on-surface-disabled)" }}>{size} · {weight} · lh {lineHeight}</p>
      </div>
      <div className="flex-1">
        <p style={{ fontSize: size, fontWeight: weight, lineHeight, color: "var(--color-on-surface)", fontFamily: "Barlow, sans-serif" }}>
          {sample}
        </p>
      </div>
      <div className="w-32 flex-shrink-0 text-right pt-1">
        <span className="text-[11px]" style={{ color: "var(--color-on-surface-disabled)" }}>{role}</span>
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
          background: "var(--color-surface-variant)",
          border: "2px solid var(--color-secondary)",
          borderRadius: radius,
        }}
      />
      <div className="text-center">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--color-secondary)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--color-on-surface-disabled)" }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Spacing swatch ───────────────────────────────────────────────────────
function SpacingSwatch({ token, value }: { token: string; value: string }) {
  const px = parseInt(value);
  return (
    <div className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid var(--color-outline)" }}>
      <div className="w-24 flex-shrink-0">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--color-secondary)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--color-on-surface-disabled)" }}>{value}</p>
      </div>
      <div
        className="flex-shrink-0"
        style={{ width: px, height: 20, background: "var(--color-primary)", borderRadius: 3, minWidth: 3 }}
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
          background: "var(--color-surface)",
          boxShadow: shadow,
          height: 100,
        }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>Level {level}</span>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-mono font-semibold" style={{ color: "var(--color-secondary)" }}>{token}</p>
        <p className="text-[11px] font-mono" style={{ color: "var(--color-on-surface-disabled)" }}>Elevation {level}</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)", fontFamily: "Barlow, sans-serif" }}>

      {/* Top bar */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-8 h-14"
        style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-outline)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-bold" style={{ color: "var(--color-on-background)" }}>Halosight</span>
          <span style={{ color: "var(--color-outline)" }}>·</span>
          <span className="text-[13px]" style={{ color: "var(--color-on-surface-variant)" }}>Design System</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}
          >
            M3
          </span>
        </div>
        <Link href="/" className="text-[13px]" style={{ color: "var(--color-secondary)" }}>
          ← Back to app
        </Link>
      </div>

      <div className="flex">

        {/* Sticky sidebar */}
        <nav
          className="w-52 flex-shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-5"
          style={{ borderRight: "1px solid var(--color-outline)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-on-surface-disabled)" }}>
            Contents
          </p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block py-1.5 text-[13px] transition-colors"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-5xl px-12 py-12">

          {/* ── Voice & Tone ─────────────────────────────────────────── */}
          <SectionHeader
            id="voice-tone"
            title="Voice & Tone"
            subtitle="How Halosight speaks — across UI copy, AI outputs, and empty states."
          />
          <div className="grid grid-cols-2 gap-6 mb-16">
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
                items: ["Actions over states — \"Capture Meeting\" not \"Meeting Recording\"", "Verbs lead buttons", "Errors explain what to do next", "AI outputs are always inspectable"],
              },
              {
                label: "AI output tone",
                items: ["Grounded in evidence, never fabricated", "Presented as suggestion, not command", "Confidence shown explicitly", "Source always traceable"],
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-6"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-outline)" }}
              >
                <p className="text-[13px] font-semibold mb-3" style={{ color: "var(--color-secondary)" }}>{card.label}</p>
                <ul className="flex flex-col gap-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--color-on-surface-variant)" }}>
                      <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ background: "var(--color-on-surface-disabled)" }} />
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

          {/* Surfaces */}
          <SubHeader title="Surface Scale" />
          <div className="grid grid-cols-5 gap-4 mb-10">
            <ColorSwatch token="--color-background"                label="background"                small />
            <ColorSwatch token="--color-surface-dim"               label="surface-dim"               small />
            <ColorSwatch token="--color-surface"                   label="surface"                   small />
            <ColorSwatch token="--color-surface-variant"           label="surface-variant"           small />
            <ColorSwatch token="--color-surface-container-highest" label="surface-container-highest" small />
          </div>

          {/* On-surface / text */}
          <SubHeader title="Foreground (Text) Scale" />
          <div className="grid grid-cols-5 gap-4 mb-10">
            <ColorSwatch token="--color-on-background"      label="on-background"      textColor="#111420" small />
            <ColorSwatch token="--color-on-surface-subtle"  label="on-surface-subtle"  textColor="#111420" small />
            <ColorSwatch token="--color-on-surface-variant" label="on-surface-variant" textColor="#111420" small />
            <ColorSwatch token="--color-on-surface-disabled" label="on-surface-disabled" small />
            <ColorSwatch token="--color-inverse-on-surface" label="inverse-on-surface" textColor="#F7F8FF" small />
          </div>

          {/* Outline */}
          <SubHeader title="Outline" />
          <div className="grid grid-cols-2 gap-4 mb-10 max-w-xs">
            <ColorSwatch token="--color-outline"         label="outline"         small />
            <ColorSwatch token="--color-outline-variant" label="outline-variant" small />
          </div>

          {/* M3 color role groups */}
          <SubHeader title="Primary — Neon Indigo" />
          <div className="grid grid-cols-3 gap-4 mb-10">
            <ColorSwatch token="--color-primary-hover"   label="primary-hover"   textColor="#111420" />
            <ColorSwatch token="--color-primary"         label="primary"         textColor="#111420" />
            <ColorSwatch token="--color-primary-pressed" label="primary-pressed" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-10">
            <ColorSwatch token="--color-on-primary"           label="on-primary"           small />
            <ColorSwatch token="--color-primary-container"    label="primary-container"    small />
            <ColorSwatch token="--color-on-primary-container" label="on-primary-container" textColor="#111420" small />
          </div>

          <SubHeader title="Secondary — Neon Indigo" />
          <div className="grid grid-cols-3 gap-4 mb-10">
            <ColorSwatch token="--color-secondary"         label="secondary" />
            <ColorSwatch token="--color-secondary-hover"   label="secondary-hover"   textColor="#111420" />
            <ColorSwatch token="--color-secondary-pressed" label="secondary-pressed" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-10">
            <ColorSwatch token="--color-on-secondary"           label="on-secondary"           small />
            <ColorSwatch token="--color-secondary-container"    label="secondary-container"    small />
            <ColorSwatch token="--color-on-secondary-container" label="on-secondary-container" textColor="#111420" small />
          </div>

          <SubHeader title="Tertiary — Success Green" />
          <div className="grid grid-cols-4 gap-4 mb-10">
            <ColorSwatch token="--color-tertiary"              label="tertiary" />
            <ColorSwatch token="--color-on-tertiary"           label="on-tertiary" textColor="#111420" small />
            <ColorSwatch token="--color-tertiary-container"    label="tertiary-container" small />
            <ColorSwatch token="--color-on-tertiary-container" label="on-tertiary-container" small />
          </div>

          <SubHeader title="Error / Warning / Info" />
          <div className="grid grid-cols-4 gap-4 mb-4">
            <ColorSwatch token="--color-error"   label="error" />
            <ColorSwatch token="--color-warning" label="warning" />
            <ColorSwatch token="--color-info"    label="info" textColor="#111420" />
            <div />
          </div>
          <div className="grid grid-cols-4 gap-4 mb-10">
            <ColorSwatch token="--color-error-container"    label="error-container"    small />
            <ColorSwatch token="--color-warning-container"  label="warning-container"  small />
            <ColorSwatch token="--color-info-container"     label="info-container"     small />
            <div />
          </div>
          <div className="grid grid-cols-4 gap-4 mb-10">
            <ColorSwatch token="--color-on-error-container"   label="on-error-container"   small />
            <ColorSwatch token="--color-on-warning-container" label="on-warning-container" textColor="#111420" small />
            <ColorSwatch token="--color-on-info-container"    label="on-info-container"    textColor="#111420" small />
            <div />
          </div>

          <SubHeader title="Halosight Custom Roles" />
          <div className="grid grid-cols-5 gap-4 mb-10">
            <ColorSwatch token="--color-recording"      label="recording" />
            <ColorSwatch token="--color-secondary-deep" label="secondary-deep" />
            <ColorSwatch token="--color-teal"           label="teal" />
            <ColorSwatch token="--color-teal-hover"     label="teal-hover" textColor="#111420" />
            <ColorSwatch token="--color-pink"           label="pink" />
          </div>

          <SubHeader title="Login Background Gradient" />
          <div className="rounded-2xl overflow-hidden mb-4" style={{ height: 100 }}>
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: "radial-gradient(ellipse 70% 60% at 50% 40%, #1A1E44 0%, #131728 40%, #111420 100%)",
              }}
            >
              <span className="text-[15px] font-semibold" style={{ color: "var(--color-on-background)" }}>Login Background Gradient</span>
            </div>
          </div>
          <p className="text-[11px] font-mono mb-16" style={{ color: "var(--color-on-surface-disabled)" }}>
            radial-gradient(ellipse 70% 60% at 50% 40%, #1A1E44, #131728, #111420)
          </p>

          {/* ── Typography ────────────────────────────────────────────── */}
          <SectionHeader
            id="typography"
            title="Typography"
            subtitle="Barlow (sans) for UI. Roboto Slab (serif) for emphasis. M3 type role names throughout."
          />

          <SubHeader title="Font Families" />
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-outline)" }}>
              <p className="text-[11px] font-mono mb-3" style={{ color: "var(--color-secondary)" }}>--font-sans · Barlow</p>
              <p className="text-[32px] font-light mb-1" style={{ color: "var(--color-on-surface)", fontFamily: "Barlow, sans-serif" }}>Aa Bb Cc</p>
              <p className="text-[14px]" style={{ color: "var(--color-on-surface-variant)", fontFamily: "Barlow, sans-serif" }}>
                The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-[11px] mt-3" style={{ color: "var(--color-on-surface-disabled)" }}>Thin · Light · Regular · Medium · SemiBold · Bold · ExtraBold · Black</p>
            </div>
            <div className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-outline)" }}>
              <p className="text-[11px] font-mono mb-3" style={{ color: "var(--color-secondary)" }}>--font-serif · Roboto Slab</p>
              <p className="text-[32px] font-light mb-1" style={{ color: "var(--color-on-surface)", fontFamily: "Roboto Slab, serif" }}>Aa Bb Cc</p>
              <p className="text-[14px]" style={{ color: "var(--color-on-surface-variant)", fontFamily: "Roboto Slab, serif" }}>
                The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-[11px] mt-3" style={{ color: "var(--color-on-surface-disabled)" }}>Light · Regular · Medium · SemiBold · Bold · ExtraBold</p>
            </div>
          </div>

          <SubHeader title="Type Scale (M3 Roles)" />
          <div className="mb-16">
            <TypeSpecimen role="Display Large"   token="displayLarge"   size="57px" weight="300" lineHeight="1.12" sample="Field Intelligence" />
            <TypeSpecimen role="Display Medium"  token="displayMedium"  size="45px" weight="300" lineHeight="1.15" sample="Field Intelligence" />
            <TypeSpecimen role="Headline Large"  token="headlineLarge"  size="32px" weight="700" lineHeight="1.25" sample="Walmart Corporation" />
            <TypeSpecimen role="Headline Medium" token="headlineMedium" size="26px" weight="700" lineHeight="1.3"  sample="Smarter meetings. Anywhere." />
            <TypeSpecimen role="Headline Small"  token="headlineSmall"  size="22px" weight="600" lineHeight="1.35" sample="Ideas for this Time" />
            <TypeSpecimen role="Title Large"     token="titleLarge"     size="18px" weight="700" lineHeight="1.4"  sample="Last Time" />
            <TypeSpecimen role="Title Medium"    token="titleMedium"    size="16px" weight="600" lineHeight="1.4"  sample="Continue with Google" />
            <TypeSpecimen role="Title Small"     token="titleSmall"     size="14px" weight="600" lineHeight="1.5"  sample="Overview · Activity" />
            <TypeSpecimen role="Body Large"      token="bodyLarge"      size="15px" weight="400" lineHeight="1.6"  sample="Visited 2 weeks ago. Recent conversation focused on current service satisfaction." />
            <TypeSpecimen role="Body Medium"     token="bodyMedium"     size="14px" weight="400" lineHeight="1.6"  sample="Discussed Q2 supply chain concerns. Tom mentioned potential for expanded order." />
            <TypeSpecimen role="Body Small"      token="bodySmall"      size="13px" weight="400" lineHeight="1.5"  sample="56.7 mi · Visited 3 days ago" />
            <TypeSpecimen role="Label Large"     token="labelLarge"     size="16px" weight="600" lineHeight="1.25" sample="Capture Meeting" />
            <TypeSpecimen role="Label Medium"    token="labelMedium"    size="12px" weight="700" lineHeight="1.3"  sample="CORPORATE ACCOUNT" />
            <TypeSpecimen role="Label Small"     token="labelSmall"     size="11px" weight="500" lineHeight="1.3"  sample="Visited Today · Cedar City, UT" />
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
          <div className="grid grid-cols-5 gap-6 mb-16">
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
              <div className="flex items-center gap-4 flex-wrap">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                  Capture Meeting
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70 flex items-center gap-2" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/><path d="M8 5V8L10 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  With Icon
                </button>
                <button disabled className="h-12 px-6 rounded-full font-semibold text-[15px] opacity-30 cursor-not-allowed" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                  Disabled
                </button>
              </div>
              <TokenLabel name="background: --color-primary · color: --color-on-primary · radius: --radius-full" value="height: 48px · padding: 0 24px · font: titleMedium" />
            </div>

            <div>
              <SubHeader title="Filled Tonal Button — Secondary Container" />
              <div className="flex items-center gap-4 flex-wrap">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                  View Transcript
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ background: "var(--color-tertiary-container)", color: "var(--color-on-tertiary-container)" }}>
                  Mark Complete
                </button>
              </div>
              <TokenLabel name="background: --color-secondary-container · color: --color-on-secondary-container" value="height: 48px · radius: --radius-full" />
            </div>

            <div>
              <SubHeader title="Outlined Button" />
              <div className="flex items-center gap-4 flex-wrap">
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-outline)", color: "var(--color-on-surface)", background: "transparent" }}>
                  Edit
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-primary)", color: "var(--color-primary)", background: "transparent" }}>
                  Reject
                </button>
                <button className="h-12 px-6 rounded-full font-semibold text-[15px] transition-opacity active:opacity-70" style={{ border: "1.5px solid var(--color-secondary)", color: "var(--color-secondary)", background: "transparent" }}>
                  Regenerate
                </button>
              </div>
              <TokenLabel name="border: --color-outline · radius: --radius-full" value="height: 48px · background: transparent" />
            </div>

            <div>
              <SubHeader title="Text Button" />
              <div className="flex items-center gap-4 flex-wrap">
                <button className="h-10 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--color-secondary)", background: "transparent" }}>
                  Log in with Email
                </button>
                <button className="h-10 px-4 font-semibold text-[14px] transition-opacity active:opacity-70" style={{ color: "var(--color-on-surface-variant)", background: "transparent" }}>
                  View transcript →
                </button>
              </div>
              <TokenLabel name="color: --color-secondary · background: none" value="height: 40px · font: bodyMedium semibold" />
            </div>

            <div>
              <SubHeader title="OAuth Buttons (Login Screen)" />
              <div className="flex items-center gap-4 flex-wrap">
                <button className="h-14 px-6 rounded-2xl font-semibold text-[16px] flex items-center gap-3 transition-opacity active:opacity-70" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
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
              <TokenLabel name="height: 56px · radius: --radius-lg · font: labelLarge" value="Google: --color-primary bg · Microsoft/Apple: white (brand requirement)" />
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
              <div className="flex items-center gap-2 h-11 px-3 rounded-xl" style={{ background: "var(--color-surface)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="#8B94A8" strokeWidth="1.75"/><path d="M12 12L16 16" stroke="#8B94A8" strokeWidth="1.75" strokeLinecap="round"/></svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent text-[15px] outline-none"
                  style={{ color: "var(--color-on-surface)", caretColor: "var(--color-primary)" }}
                />
                {inputValue && (
                  <button onClick={() => setInputValue("")}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#5D667A"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                )}
              </div>
              <TokenLabel name="background: --color-surface · height: 44px · radius: --radius-md" value="icon: --color-on-surface-variant · placeholder: --color-on-surface-disabled" />
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
                  <span key={n} className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--color-outline)", color: "var(--color-on-surface)" }}>
                    {n}
                  </span>
                ))}
              </div>
              <TokenLabel name="background: --color-outline · radius: --radius-full" value="font: labelSmall bold" />
            </div>
            <div>
              <SubHeader title="Status Chips" />
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-tertiary-container)", color: "var(--color-on-tertiary-container)" }}>Visited Today</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>In Progress</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-warning-container)", color: "var(--color-on-warning-container)" }}>At Risk</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>Overdue</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-outline)", color: "var(--color-on-surface-variant)" }}>No Activity</span>
              </div>
              <TokenLabel name="radius: --radius-full · font: labelMedium semibold" value="color pairs: *-container + on-*-container semantic tokens" />
            </div>
            <div>
              <SubHeader title="AI Confidence Indicator" />
              <div className="flex items-center gap-4">
                {[
                  { label: "High confidence", pct: 94, token: "--color-tertiary" },
                  { label: "Medium confidence", pct: 71, token: "--color-warning" },
                  { label: "Low confidence", pct: 38, token: "--color-error" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full" style={{ background: "var(--color-outline)" }}>
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: `var(${item.token})` }} />
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: `var(${item.token})` }}>{item.pct}%</span>
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--color-on-surface-disabled)" }}>{item.label}</span>
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
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-outline)" }}>
                {mockAccounts.slice(0, 4).map((account) => (
                  <AccountListItem key={account.id} account={account} />
                ))}
              </div>
              <TokenLabel name="AccountListItem — background: --color-surface · divider: --color-outline" value="radius: --radius-lg on container · font: titleSmall + bodySmall" />
            </div>

            <div>
              <SubHeader title="AI Output Card" />
              <div className="rounded-2xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-outline)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--color-secondary)" }}>AI Summary</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 rounded-full" style={{ background: "var(--color-outline)" }}>
                      <div className="h-full w-[88%] rounded-full" style={{ background: "var(--color-tertiary)" }} />
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--color-tertiary)" }}>88%</span>
                  </div>
                </div>
                <p className="text-[14px] leading-relaxed mb-4" style={{ color: "var(--color-on-surface-variant)" }}>
                  Discussed Q3 fleet expansion. Budget confirmed at ~$240k. Manager expressed strong interest in expanded service contract. Follow-up scheduled for next week.
                </p>
                <div className="flex gap-2">
                  <button className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>Accept</button>
                  <button className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ border: "1.5px solid var(--color-outline)", color: "var(--color-on-surface)", background: "transparent" }}>Edit</button>
                  <button className="h-9 px-4 rounded-full text-[13px] font-semibold" style={{ border: "1.5px solid var(--color-error)", color: "var(--color-error)", background: "transparent" }}>Reject</button>
                </div>
              </div>
              <TokenLabel name="AIOutputCard — surface: --color-surface · accent: --color-secondary" value="confidence bar: tertiary / warning / error · actions: filled + outlined" />
            </div>

            <div>
              <SubHeader title="Tab Bar" />
              <div className="flex rounded-xl p-1 gap-1 max-w-xs" style={{ background: "var(--color-surface)" }}>
                <div className="flex-1 py-2 rounded-lg text-[14px] font-semibold text-center" style={{ background: "var(--color-surface-variant)", color: "var(--color-on-surface)" }}>Overview</div>
                <div className="flex-1 py-2 text-[14px] font-semibold text-center" style={{ color: "var(--color-on-surface-variant)" }}>Activity</div>
              </div>
              <TokenLabel name="container: --color-surface · active tab: --color-surface-variant" value="radius: --radius-md on container, --radius-sm on tab" />
            </div>
          </div>

          {/* ── Navigation ────────────────────────────────────────────── */}
          <SectionHeader
            id="navigation"
            title="Navigation"
            subtitle="Bottom navigation bar — Home and Accounts tabs."
          />
          <div className="max-w-xs mb-16">
            <div
              className="flex items-center justify-around px-8 h-[72px] rounded-2xl"
              style={{ background: "var(--color-surface-dim)", border: "1px solid var(--color-outline)" }}
            >
              <div className="flex flex-col items-center gap-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15" stroke="#8B94A8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Home</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--color-primary)" strokeWidth="1.75"/><path d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20" stroke="var(--color-primary)" strokeWidth="1.75" strokeLinecap="round"/></svg>
                <span className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>Accounts</span>
              </div>
            </div>
            <TokenLabel name="BottomNav — background: --color-surface-dim · active: --color-primary · inactive: --color-on-surface-variant" value="height: 72px · top border: --color-outline" />
          </div>

          {/* Footer */}
          <div className="pt-8" style={{ borderTop: "1px solid var(--color-outline)" }}>
            <p className="text-[12px]" style={{ color: "var(--color-on-surface-disabled)" }}>
              Halosight Design System · M3-aligned · Flutter-ready · Last updated 2026
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}
