"use client";

/**
 * Story 2: Create a New Lead and Handle Missing CRM Details
 * Full desktop spec page — decisions, deliverables, and acceptance criteria.
 */

import { useState, useEffect } from "react";
import DecisionWidget from "@/components/decisions/DecisionWidget";

// ─── Layout primitives ────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 72 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--md-sys-color-brand-teal)", marginBottom: 24, paddingBottom: 12,
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
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--md-sys-color-text-muted)", marginBottom: 6 }}>
      {children}
    </p>
  );
}

function StatusBadge({ status }: { status: "built" | "decision" | "design" }) {
  const map = {
    built:    { label: "Built",           bg: "rgba(46,204,113,0.12)",   color: "#2ECC71" },
    decision: { label: "Decision needed", bg: "rgba(245,166,35,0.12)",   color: "#F5A623" },
    design:   { label: "Needs design",    bg: "rgba(72,209,204,0.12)",   color: "var(--md-sys-color-brand-teal)" },
  };
  const s = map[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview",    label: "Overview" },
  { id: "decisions",  label: "Key Decisions" },
  { id: "entry",      label: "Entry Flow" },
  { id: "form",       label: "Create Form" },
  { id: "sync",       label: "Sync States" },
  { id: "missing",    label: "Missing Fields" },
  { id: "duplicate",  label: "Duplicate Prevention" },
  { id: "contacts",   label: "Contacts" },
  { id: "criteria",   label: "Acceptance Criteria" },
];

function SidebarNav({ active }: { active: string }) {
  return (
    <nav style={{ position: "sticky", top: 48, width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--md-sys-color-text-muted)", marginBottom: 8, paddingLeft: 12 }}>
        Story 2
      </p>
      {NAV_ITEMS.map(item => (
        <a key={item.id} href={`#${item.id}`} style={{
          display: "block", fontSize: 13,
          fontWeight: active === item.id ? 600 : 400,
          color: active === item.id ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)",
          background: active === item.id ? "var(--md-sys-color-dark-secondary)" : "transparent",
          borderLeft: `3px solid ${active === item.id ? "var(--md-sys-color-brand-teal)" : "transparent"}`,
          padding: "6px 12px", borderRadius: "0 8px 8px 0", textDecoration: "none", transition: "all 0.1s",
        }}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

// ─── Option cards ─────────────────────────────────────────────────────────────

function OptionCard({
  label, recommended, description, children, note,
}: {
  label: string; recommended?: boolean; description: string; children?: React.ReactNode; note?: string;
}) {
  return (
    <div style={{
      background: "var(--md-sys-color-dark-primary)",
      border: `1px solid ${recommended ? "rgba(72,209,204,0.4)" : "var(--md-sys-color-dark-tertiary)"}`,
      borderRadius: 12, overflow: "hidden", flex: 1, minWidth: 0,
    }}>
      <div style={{ padding: "14px 16px 12px", borderBottom: children ? "1px solid var(--md-sys-color-dark-tertiary)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--md-sys-color-text-primary)" }}>{label}</span>
          {recommended && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "rgba(72,209,204,0.12)", color: "var(--md-sys-color-brand-teal)" }}>
              Recommended
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", lineHeight: 1.55, margin: 0 }}>{description}</p>
        {note && (
          <p style={{ fontSize: 11, color: "var(--md-sys-color-text-disabled)", lineHeight: 1.5, margin: "8px 0 0", fontStyle: "italic" }}>{note}</p>
        )}
      </div>
      {children && <div style={{ padding: "14px 16px" }}>{children}</div>}
    </div>
  );
}

// ─── Deliverable heading ──────────────────────────────────────────────────────

function DeliverableHeading({ name, status, sub }: { name: string; status: "built" | "decision" | "design"; sub?: string }) {
  return (
    <div style={{ marginBottom: sub ? 6 : 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: sub ? 4 : 0 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--md-sys-color-text-primary)", margin: 0 }}>{name}</h3>
        <StatusBadge status={status} />
      </div>
      {sub && <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", lineHeight: 1.6, margin: 0 }}>{sub}</p>}
    </div>
  );
}

// ─── Mock phone screen ────────────────────────────────────────────────────────

function MockScreen({ children, width = 300, label }: { children: React.ReactNode; width?: number; label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      {label && <p style={{ fontSize: 12, fontWeight: 600, color: "var(--md-sys-color-text-muted)", margin: 0 }}>{label}</p>}
      <div style={{ width, background: "var(--md-sys-color-background)", borderRadius: 16, border: "1px solid var(--md-sys-color-dark-tertiary)", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function MockHeader({ title, back }: { title: string; back?: string }) {
  return (
    <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)", display: "flex", alignItems: "center", gap: 10 }}>
      {back && (
        <span style={{ fontSize: 12, color: "var(--md-sys-color-brand-teal)", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          ← {back}
        </span>
      )}
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--md-sys-color-text-primary)", margin: 0, fontFamily: "Roboto Slab, Georgia, serif" }}>
        {title}
      </p>
    </div>
  );
}

// ─── Mock form fields ─────────────────────────────────────────────────────────

function MockField({
  label, value, placeholder, required, error, hint, isLast,
}: {
  label: string; value?: string; placeholder?: string; required?: boolean; error?: string; hint?: string; isLast?: boolean;
}) {
  return (
    <div style={{ padding: "10px 14px", borderBottom: isLast ? "none" : "1px solid var(--md-sys-color-dark-tertiary)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--md-sys-color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        {required && <span style={{ fontSize: 10, color: "var(--md-sys-color-brand-coral)", fontWeight: 700 }}>*</span>}
      </div>
      <div style={{
        minHeight: 36, padding: "7px 10px", borderRadius: 8,
        background: "var(--md-sys-color-dark-secondary)",
        border: `1px solid ${error ? "rgba(255,107,90,0.5)" : "transparent"}`,
        display: "flex", alignItems: "center",
      }}>
        <span style={{ fontSize: 13, color: value ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-disabled)" }}>
          {value || placeholder || ""}
        </span>
      </div>
      {error && <p style={{ fontSize: 11, color: "var(--md-sys-color-brand-coral)", margin: "4px 0 0" }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: 11, color: "var(--md-sys-color-text-disabled)", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function MockButton({
  label, variant = "primary", loading, full, teal,
}: {
  label: string; variant?: "primary" | "secondary" | "ghost" | "danger"; loading?: boolean; full?: boolean; teal?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: teal ? "var(--md-sys-color-brand-teal)" : "var(--md-sys-color-neonindigo)", color: "#fff" },
    secondary: { background: "var(--md-sys-color-dark-secondary)", color: "var(--md-sys-color-text-secondary)", border: "1px solid var(--md-sys-color-dark-tertiary)" },
    ghost:     { background: "transparent", color: "var(--md-sys-color-text-muted)", border: "1px solid var(--md-sys-color-dark-tertiary)" },
    danger:    { background: "rgba(255,107,90,0.12)", color: "var(--md-sys-color-brand-coral)" },
  };
  return (
    <div style={{
      ...styles[variant],
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "11px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700,
      width: full ? "100%" : "auto", cursor: "pointer",
    }}>
      {loading && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
          <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {label}
    </div>
  );
}

// ─── Mock card variants ───────────────────────────────────────────────────────

function MockLeadCard({
  name, meta, sync, isLast, dim,
}: {
  name: string; meta?: string; sync: "waiting" | "needs-details" | "issue" | "synced"; isLast?: boolean; dim?: boolean;
}) {
  const syncMap = {
    synced:        { dot: "#2ECC71", label: "Synced",           bg: "rgba(46,204,113,0.1)",  color: "#2ECC71" },
    waiting:       { dot: "#F5A623", label: "Waiting to sync",  bg: "rgba(245,166,35,0.1)",  color: "#F5A623" },
    "needs-details":{ dot: "#FF6B5A", label: "Needs details",   bg: "rgba(255,107,90,0.1)",  color: "#FF6B5A" },
    issue:         { dot: "#FF4D4F", label: "Sync issue",       bg: "rgba(255,77,79,0.1)",   color: "#FF4D4F" },
  };
  const s = syncMap[sync];
  return (
    <div style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--md-sys-color-dark-tertiary)", opacity: dim ? 0.45 : 1 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-text-primary)", margin: "0 0 3px" }}>{name}</p>
      {meta && <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: "0 0 6px" }}>{meta}</p>}
      <div style={{ display: "flex", gap: 5 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(245,166,35,0.12)", color: "#F5A623" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Lead
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: s.bg, color: s.color }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />{s.label}
        </span>
      </div>
    </div>
  );
}

function MockToast({ label, sub, variant = "success" }: { label: string; sub?: string; variant?: "success" | "info" }) {
  const color = variant === "success" ? "#2ECC71" : "var(--md-sys-color-brand-teal)";
  const bg = variant === "success" ? "rgba(46,204,113,0.12)" : "rgba(72,209,204,0.1)";
  return (
    <div style={{ margin: "10px 12px", padding: "11px 14px", borderRadius: 12, background: bg, border: `1px solid ${color}33` }}>
      <p style={{ fontSize: 13, fontWeight: 700, color, margin: "0 0 2px" }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: 0 }}>{sub}</p>}
    </div>
  );
}

function MockWarningBanner({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ margin: "8px 12px", padding: "11px 14px", borderRadius: 10, background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.3)" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>⚠</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#F5A623", margin: "0 0 3px" }}>{label}</p>
          {sub && <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", lineHeight: 1.5, margin: 0 }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function MockNoteCard({ body, unsynced }: { body: string; unsynced?: boolean }) {
  return (
    <div style={{ margin: "8px 12px 0", padding: "10px 12px", borderRadius: 10, background: "var(--md-sys-color-dark-secondary)", border: "1px solid var(--md-sys-color-dark-tertiary)" }}>
      <p style={{ fontSize: 12, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.55, margin: "0 0 6px" }}>{body}</p>
      {unsynced && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#F5A623", background: "rgba(245,166,35,0.1)", padding: "1px 7px", borderRadius: 20 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Note saved locally · pending sync
        </span>
      )}
    </div>
  );
}

function MockShimmerRow({ isLast }: { isLast?: boolean }) {
  return (
    <div style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--md-sys-color-dark-tertiary)" }}>
      <div style={{ height: 14, width: "55%", borderRadius: 6, background: "var(--md-sys-color-dark-tertiary)", marginBottom: 6 }} />
      <div style={{ height: 11, width: "35%", borderRadius: 6, background: "var(--md-sys-color-dark-secondary)", marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ height: 18, width: 40, borderRadius: 20, background: "var(--md-sys-color-dark-tertiary)" }} />
        <div style={{ height: 18, width: 72, borderRadius: 20, background: "var(--md-sys-color-dark-secondary)" }} />
      </div>
    </div>
  );
}

function MockSectionHeader({ label }: { label: string }) {
  return (
    <div style={{ padding: "6px 14px 4px", background: "var(--md-sys-color-dark-secondary)" }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--md-sys-color-text-muted)" }}>{label}</span>
    </div>
  );
}

function MockActionRow({ label, color, border }: { label: string; color?: string; border?: boolean }) {
  return (
    <div style={{ padding: "13px 14px", borderTop: border ? "1px solid var(--md-sys-color-dark-tertiary)" : undefined }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: color ?? "var(--md-sys-color-text-primary)" }}>{label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Story2Page() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { for (const e of entries) { if (e.isIntersecting) setActive(e.target.id); } },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    NAV_ITEMS.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--md-sys-color-background)", color: "var(--md-sys-color-text-primary)", fontFamily: "Barlow, system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50, background: "var(--md-sys-color-dark-primary)",
        borderBottom: "1px solid var(--md-sys-color-dark-tertiary)", padding: "0 40px", height: 48,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/handoff" style={{ fontSize: 14, fontWeight: 700, color: "var(--md-sys-color-text-primary)", textDecoration: "none" }}>Halosight</a>
          <span style={{ color: "var(--md-sys-color-dark-tertiary)" }}>/</span>
          <a href="/story-1" style={{ fontSize: 14, color: "var(--md-sys-color-text-muted)", textDecoration: "none" }}>Story 1</a>
          <span style={{ color: "var(--md-sys-color-dark-tertiary)" }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>Story 2</span>
          <span style={{ color: "var(--md-sys-color-dark-tertiary)" }}>/</span>
          <a href="/story-3" style={{ fontSize: 14, color: "var(--md-sys-color-text-muted)", textDecoration: "none" }}>Story 3</a>
          <span style={{ color: "var(--md-sys-color-dark-tertiary)" }}>/</span>
          <a href="/story-4" style={{ fontSize: 14, color: "var(--md-sys-color-text-muted)", textDecoration: "none" }}>Story 4</a>
        </div>
        <a href="http://localhost:3000/accounts" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "var(--md-sys-color-brand-teal)", textDecoration: "none", padding: "4px 12px", background: "rgba(72,209,204,0.1)", borderRadius: 20 }}>
          Open prototype ↗
        </a>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 40px", display: "flex", gap: 56, alignItems: "flex-start" }}>
        <SidebarNav active={active} />
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          <Section id="overview" title="Overview">
            <div style={{ background: "var(--md-sys-color-dark-primary)", border: "1px solid var(--md-sys-color-dark-tertiary)", borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
                Story 2: Create a New Lead and Handle Missing CRM Details
              </h1>
              <p style={{ fontSize: 14, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.7, margin: "0 0 18px" }}>
                A field rep discovers a prospect that doesn't exist in their account list. They need to create a record on the spot —
                without leaving the field — and capture their interaction immediately. This story covers the full creation flow, sync state
                communication, missing required field recovery, lightweight duplicate prevention, and contact scope decisions.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Key decisions",   value: "11", color: "#F5A623", bg: "rgba(245,166,35,0.1)" },
                  { label: "Design deliverables", value: "16", color: "var(--md-sys-color-brand-teal)", bg: "rgba(72,209,204,0.1)" },
                  { label: "Already built",   value: "0",  color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverable checklist */}
            <div style={{ background: "var(--md-sys-color-dark-primary)", border: "1px solid var(--md-sys-color-dark-tertiary)", borderRadius: 10, padding: "16px 18px" }}>
              <Eyebrow>All design deliverables</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 24px" }}>
                {[
                  "Add/create customer entry flow",
                  "Create customer/lead form",
                  "Create lead — submitting state",
                  "Created customer confirmation",
                  "Lead saved locally but not synced",
                  "Waiting-to-sync state",
                  "Needs-details state",
                  "Sync issue state",
                  "Missing required fields form",
                  "Sync retry — in progress state",
                  "Sync retry / success confirmation",
                  "Note attached to unsynced lead",
                  "Address-based duplicate warning",
                  "Suggested existing record state",
                  "Create-anyway rule/copy",
                  "Optional contact field treatment",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                    <span style={{ color: "#F5A623", flexShrink: 0, marginTop: 1 }}>○</span>
                    <span style={{ fontSize: 13, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.45 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── KEY DECISIONS ─────────────────────────────────────────────── */}
          <Section id="decisions" title="Key Decisions">

            {/* 1 — Lead-only creation */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="1. Is V1 creation lead-only?" status="decision"
                sub="Or can a rep create a full account directly? This affects form fields, sync behavior, and the language used throughout the flow." />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Lead only (recommended)" recommended
                  description="Reps always create a Lead. Promotion to Account happens in the CRM, not in Halosight. Simpler V1 scope — one object type, one form, one sync path."
                  note="Most field CRMs (Salesforce, HubSpot) expect leads before accounts. This maps naturally.">
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(245,166,35,0.12)", color: "#F5A623" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />New record is always a Lead
                    </span>
                  </div>
                </OptionCard>
                <OptionCard label="Option B — Flexible (account or lead)"
                  description="Reps choose whether they're creating a lead or an account. More powerful but adds form complexity and two distinct sync paths."
                  note="Not recommended for V1 — doubles the form, sync, and missing-fields logic.">
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="v1-lead-only" options={["Option A — Lead only", "Option B — Flexible"]} />
            </div>

            {/* 2 — Language */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="2. What language does the UI use — 'Create customer' or 'Create lead'?" status="decision"
                sub="If creation is lead-only, the CTA label and sheet title need to either say 'Lead' explicitly or stay brand-neutral with 'Customer.' This affects how a rep understands what they're creating." />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — 'Create customer' everywhere" recommended
                  description="CTA and form always say 'Create customer.' The created record shows a Lead chip automatically. Reps don't think in CRM terms — they're just creating a customer."
                  note="Recommended. Matches the umbrella label from Story 1. The Lead chip on the result card communicates what it is without surfacing CRM jargon.">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ padding: "10px 12px", background: "var(--md-sys-color-dark-secondary)", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-brand-teal)" }}>+ Create customer</div>
                    <div style={{ padding: "2px 0", fontSize: 11, color: "var(--md-sys-color-text-disabled)", fontStyle: "italic" }}>Created record shows Lead chip — no CRM jargon surfaced.</div>
                  </div>
                </OptionCard>
                <OptionCard label="Option B — 'Create lead' explicitly"
                  description="CTA and form say 'Create lead.' Transparent about the CRM object. Reps who know their CRM may find this clearer."
                  note="Risk: reps unfamiliar with CRM object types may be confused by 'lead' vs. 'customer.'">
                  <div style={{ padding: "10px 12px", background: "var(--md-sys-color-dark-secondary)", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#F5A623" }}>+ Create lead</div>
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="create-language" options={["Option A — 'Create customer'", "Option B — 'Create lead'"]} />
            </div>

            {/* 3 — Save locally */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="3. Can Halosight save a lead locally before CRM sync succeeds?" status="decision"
                sub="If sync fails or the rep is offline, does the record persist in Halosight so they don't lose it?" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, save locally always" recommended
                  description="Lead is persisted in Halosight the moment the rep submits. Sync happens asynchronously. The 'Waiting to sync' chip communicates status. The rep can keep working immediately."
                  note="Required for field use — reps often have spotty connectivity. Local save is the foundation of the whole sync-state story.">
                </OptionCard>
                <OptionCard label="Option B — Sync required to save"
                  description="Lead is not saved unless the CRM sync succeeds. If the rep is offline or CRM is unreachable, the form is blocked."
                  note="Not recommended — this is the failure mode the product is explicitly trying to prevent.">
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="save-locally" options={["Option A — Yes, save locally", "Option B — Sync required"]} />
            </div>

            {/* 4 — Create with name only */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="4. Can a rep create with only a name, adding CRM-required fields later?" status="decision"
                sub="Some CRMs require fields (e.g., State, Industry, Phone) that a rep may not know on the spot." />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, capture now, fill in later" recommended
                  description="Reps can submit with just a name. The record is saved locally with a 'Needs details' chip. A recovery flow prompts for missing fields before sync can complete."
                  note="Recommended. Unblocks capture — the rep's primary job is to log the visit, not fill CRM forms.">
                </OptionCard>
                <OptionCard label="Option B — All required fields upfront"
                  description="Form validates all CRM-required fields before allowing submission. Rep must fill them before they can create the record."
                  note="Creates friction in the field. A rep who doesn't know the account's SIC code shouldn't be blocked from creating the record.">
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="name-only-creation" options={["Option A — Capture now, fill later", "Option B — All fields upfront"]} />
            </div>

            {/* 5 — Required fields */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="5. What fields are required immediately on the creation form?" status="decision"
                sub="The minimum a rep must provide to create a lead. Everything else is optional or deferred to the missing-details flow." />
              <div style={{ background: "var(--md-sys-color-dark-primary)", border: "1px solid var(--md-sys-color-dark-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                {[
                  { field: "Company name",  req: "Required",  note: "The only hard requirement. Can't create without it." },
                  { field: "Address",       req: "Recommended", note: "Enables distance sorting and duplicate detection. Strongly encouraged but not blocking." },
                  { field: "City / State",  req: "Optional",  note: "Captured as part of address." },
                  { field: "Phone",         req: "Optional",  note: "Include if rep has it. Not blocking." },
                  { field: "Contact name",  req: "Optional",  note: "If contacts are in scope — see Decision 11." },
                  { field: "CRM-required fields", req: "Deferred", note: "Collected in the Missing Details recovery flow, not at creation time." },
                ].map((row, i, arr) => (
                  <div key={row.field} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2.5fr", borderBottom: i < arr.length - 1 ? "1px solid var(--md-sys-color-dark-tertiary)" : "none" }}>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-text-primary)", borderRight: "1px solid var(--md-sys-color-dark-tertiary)" }}>{row.field}</div>
                    <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: row.req === "Required" ? "var(--md-sys-color-brand-coral)" : row.req === "Deferred" ? "#F5A623" : "var(--md-sys-color-text-muted)", borderRight: "1px solid var(--md-sys-color-dark-tertiary)" }}>{row.req}</div>
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--md-sys-color-text-disabled)", fontStyle: "italic" }}>{row.note}</div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2.5fr", background: "var(--md-sys-color-dark-secondary)" }}>
                  {["Field", "Status", "Notes"].map(h => (
                    <div key={h} style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--md-sys-color-text-muted)", borderRight: h !== "Notes" ? "1px solid var(--md-sys-color-dark-tertiary)" : "none" }}>{h}</div>
                  ))}
                </div>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="required-fields" options={["Approved as-is", "Needs changes"]} />
            </div>

            {/* 6 — Where to add missing fields */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="6. Where does the rep add missing CRM-required fields?" status="decision"
                sub="The 'Needs details' state needs a path to resolution. Where does that happen?" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — From the lead's detail screen" recommended
                  description="The lead card shows a 'Needs details' chip. Tapping it opens the lead detail page, which has an inline banner prompting the rep to fill in missing fields. Tap banner → sheet or form with only the missing fields."
                  note="Recommended. The rep discovers the issue in context and resolves it without leaving the lead.">
                </OptionCard>
                <OptionCard label="Option B — Notification or action item"
                  description="An action item or system notification is generated that links to the missing-fields form. The rep resolves it through the action item flow."
                  note="Works but adds indirection. The rep has to find the action item to understand why the lead isn't synced.">
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="missing-fields-location" options={["Option A — Detail screen", "Option B — Notification"]} />
            </div>

            {/* 7 — Auto-retry */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="7. Does sync retry automatically when missing fields are added?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, auto-retry on save" recommended
                  description="When the rep saves the missing-fields form, sync begins immediately. The record transitions: Needs details → Syncing → Synced (or Sync issue). No manual retry step."
                  note="Best UX. The rep shouldn't have to trigger sync — it just happens.">
                </OptionCard>
                <OptionCard label="Option B — Manual retry button"
                  description="After filling in missing fields, the rep must tap a 'Retry sync' button. More explicit but adds an unnecessary step."
                  note="Only useful if sync has a meaningful cost (slow API, rate limits). For most CRMs, auto-retry is fine.">
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="auto-retry" options={["Option A — Auto-retry", "Option B — Manual retry"]} />
            </div>

            {/* 8 — Sync success confirmation */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="8. What confirmation appears when sync succeeds?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Toast + chip update" recommended
                  description="A brief toast notification appears ('Synced to Salesforce ✓'). The lead card's chip updates from Waiting/Needs details to Synced. No modal or blocking screen needed."
                  note="Recommended. Non-interrupting, consistent with the completion toast pattern already in the app.">
                  <MockToast label="Synced to Salesforce ✓" sub="Southwest Fleet Services is now in your CRM." />
                </OptionCard>
                <OptionCard label="Option B — Full confirmation screen"
                  description="After successful sync, a confirmation screen replaces the form, showing the new record and its CRM ID. More explicit but interrupts the flow."
                  note="Too heavy for what is essentially background work.">
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="sync-success" options={["Option A — Toast + chip update", "Option B — Full confirmation screen"]} />
            </div>

            {/* 9 — Address match / duplicate */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="9. What happens if the address matches an existing account?" status="decision"
                sub="When a rep enters an address that closely matches an existing CRM account, we should surface it to prevent creating a true duplicate." />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Inline warning with suggested match" recommended
                  description="As the rep fills in the address, a banner appears showing the possible match. Rep can tap the match to view it, or dismiss and continue creating."
                  note="Recommended. Non-blocking — the rep decides. Covers the 80% case without a complex deduplication system.">
                  <MockWarningBanner
                    label="Possible duplicate"
                    sub="'Jack's Tire & Oil — 123 Main St, Elko NV' looks similar. View it before creating?" />
                </OptionCard>
                <OptionCard label="Option B — Block creation until resolved"
                  description="If a possible duplicate is found, the rep must either confirm they want to create anyway or navigate to the existing record. No bypassing."
                  note="Creates friction. A rep who knows it's a different location shouldn't be blocked.">
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="address-duplicate" options={["Option A — Inline warning", "Option B — Block creation"]} />
            </div>

            {/* 10 — Override duplicate */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="10. Can the rep override a duplicate warning and create anyway?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, always overrideable" recommended
                  description="The duplicate warning has a 'Create anyway' secondary action. The rep can acknowledge the warning and proceed. A note may be auto-attached: 'Created despite possible duplicate of [account].'">
                </OptionCard>
                <OptionCard label="Option B — Override requires confirmation"
                  description="Tapping 'Create anyway' shows a confirmation dialog asking the rep to confirm before proceeding. More friction but reduces accidental duplicates."
                  note="One confirmation step is fine if the warning is clear. Two steps may be too much.">
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="override-duplicate" options={["Option A — Always overrideable", "Option B — Requires confirmation"]} />
            </div>

            {/* 11 — Contacts */}
            <div style={{ marginBottom: 0 }}>
              <DeliverableHeading name="11. Are contacts in scope for V1?" status="decision"
                sub="Contacts (individual people at a company) are a separate CRM object. The question is how much contact information, if any, is collected during lead creation." />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Optional contact name on form" recommended
                  description="The creation form includes a single optional 'Contact name' field. Not required, not validated, not synced as a Contact object — just a text note for the rep's reference. If CRM requires contact fields, those appear in the missing-details flow."
                  note="Recommended. Gives reps a place to capture a name without opening up the full contact object model.">
                  <MockField label="Contact name" placeholder="e.g. Jane Smith" isLast />
                </OptionCard>
                <OptionCard label="Option B — Contacts fully out of scope"
                  description="The form has no contact fields. If a rep wants to note a contact, they write it in the visit note. A banner in the form explains this."
                  note="Cleanest V1. Works if notes are a reliable fallback. Risk: reps forget to add contacts and data is lost.">
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", fontSize: 11, color: "var(--md-sys-color-text-muted)", lineHeight: 1.5 }}>
                    💡 To add a contact, mention them in your visit note. Contact management coming in a future update.
                  </div>
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-2" decisionKey="contacts-scope" options={["Option A — Optional contact name", "Option B — Out of scope"]} />
            </div>

          </Section>

          {/* ── ENTRY FLOW ─────────────────────────────────────────────────── */}
          <Section id="entry" title="Entry Flow">
            <DeliverableHeading name="Add/create customer entry point" status="design"
              sub="Where does the rep start when they want to create a new customer? Two plausible triggers: from the customer list 'no results' state, or from a persistent FAB/button on the list." />
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

              <MockScreen label="Entry via 'no results'" width={270}>
                <MockHeader title="Customers" />
                <div style={{ padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", borderRadius: 999, background: "var(--md-sys-color-dark-secondary)" }}>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75" /><path d="M12 12L16 16" stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75" strokeLinecap="round" /></svg>
                    <span style={{ fontSize: 13, color: "var(--md-sys-color-text-primary)" }}>Canyon Country Co</span>
                  </div>
                </div>
                <div style={{ padding: "28px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 22, marginBottom: 6 }}>🔍</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-text-primary)", margin: "0 0 4px" }}>Not in your customers</p>
                  <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", margin: "0 0 16px" }}>Try global search or create a new record.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <MockButton label="Search all companies" variant="ghost" full />
                    <MockButton label="+ Create customer" teal full />
                  </div>
                </div>
              </MockScreen>

              <MockScreen label="Entry via list FAB" width={270}>
                <MockHeader title="Customers" />
                <MockLeadCard name="Jack's Tire & Oil" meta="1.2 mi · Elko, NV" sync="synced" />
                <MockLeadCard name="Southwest Fleet" meta="6 mi · Tucson, AZ" sync="waiting" />
                <MockLeadCard name="ProFleet Corp" meta="5 mi · Phoenix, AZ" sync="synced" isLast />
                {/* FAB */}
                <div style={{ padding: "10px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <MockButton label="+ Create customer" teal full />
                </div>
              </MockScreen>

            </div>
          </Section>

          {/* ── CREATE FORM ────────────────────────────────────────────────── */}
          <Section id="form" title="Create Form">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Create customer form" status="design"
                sub="The minimal creation form. One required field (name), encouraged field (address), and optional fields. CRM-required fields are deferred." />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

                <MockScreen label="Empty form" width={270}>
                  <MockHeader title="New customer" back="Customers" />
                  <MockField label="Company name" placeholder="e.g. Canyon Country Motors" required />
                  <MockField label="Address" placeholder="123 Main St" hint="Helps with distance and duplicate detection" />
                  <MockField label="City" placeholder="Flagstaff" />
                  <MockField label="State" placeholder="AZ" />
                  <MockField label="Phone" placeholder="(928) 555-0100" />
                  <MockField label="Contact name" placeholder="e.g. Jane Smith" isLast />
                  <div style={{ padding: "12px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                    <MockButton label="Create customer" teal full />
                  </div>
                </MockScreen>

                <MockScreen label="Filled — ready to submit" width={270}>
                  <MockHeader title="New customer" back="Customers" />
                  <MockField label="Company name" value="Canyon Country Motors" required />
                  <MockField label="Address" value="45 Canyon Rd" />
                  <MockField label="City" value="Sedona" />
                  <MockField label="State" value="AZ" />
                  <MockField label="Phone" placeholder="(928) 555-0100" />
                  <MockField label="Contact name" placeholder="e.g. Jane Smith" isLast />
                  <div style={{ padding: "12px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                    <MockButton label="Create customer" teal full />
                  </div>
                </MockScreen>

                <MockScreen label="Submitting state" width={270}>
                  <MockHeader title="New customer" back="Customers" />
                  <MockField label="Company name" value="Canyon Country Motors" required />
                  <MockField label="Address" value="45 Canyon Rd" />
                  <MockField label="City" value="Sedona" />
                  <MockField label="State" value="AZ" isLast />
                  <div style={{ padding: "12px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)", opacity: 0.6 }}>
                    <MockButton label="Creating…" loading teal full />
                  </div>
                </MockScreen>

              </div>
            </div>

            <div>
              <DeliverableHeading name="Created customer confirmation" status="design"
                sub="What the rep sees immediately after submitting. The record is saved locally and sync has been queued. The rep is returned to the customer list (or the new record's detail page)." />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

                <MockScreen label="Back to list with new record" width={270}>
                  <MockHeader title="Customers" />
                  <MockToast label="Customer created ✓" sub="Canyon Country Motors saved. Syncing to Salesforce…" variant="info" />
                  <MockLeadCard name="Canyon Country Motors" meta="22 mi · Sedona, AZ" sync="waiting" />
                  <MockLeadCard name="Jack's Tire & Oil" meta="1.2 mi · Elko, NV" sync="synced" isLast />
                </MockScreen>

              </div>
            </div>
          </Section>

          {/* ── SYNC STATES ────────────────────────────────────────────────── */}
          <Section id="sync" title="Sync States">
            <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
              A newly created lead can be in any of four sync states. Each state needs a distinct chip (from the Story 1 chip spec)
              and a detail-page treatment so the rep knows what's happening and what, if anything, they need to do.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 32 }}>

              <MockScreen label="Waiting to sync" width={260}>
                <MockHeader title="Canyon Country Motors" />
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(245,166,35,0.12)", color: "#F5A623" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Lead
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(245,166,35,0.1)", color: "#F5A623" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Waiting to sync
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", margin: 0 }}>Saved locally. Will sync to Salesforce when your connection is stable.</p>
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--md-sys-color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>Activity</p>
                  <p style={{ fontSize: 13, color: "var(--md-sys-color-text-disabled)", fontStyle: "italic" }}>No activity yet.</p>
                </div>
              </MockScreen>

              <MockScreen label="Needs details — action required" width={260}>
                <MockHeader title="Canyon Country Motors" />
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(245,166,35,0.12)", color: "#F5A623" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Lead
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(255,107,90,0.1)", color: "#FF6B5A" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF6B5A" }} />Needs details
                    </span>
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,107,90,0.06)", border: "1px solid rgba(255,107,90,0.2)" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#FF6B5A", margin: "0 0 3px" }}>Salesforce requires more info</p>
                    <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: "0 0 8px" }}>2 fields are missing before this lead can sync.</p>
                    <MockButton label="Add missing details →" variant="danger" />
                  </div>
                </div>
              </MockScreen>

              <MockScreen label="Sync issue — error" width={260}>
                <MockHeader title="Canyon Country Motors" />
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(245,166,35,0.12)", color: "#F5A623" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Lead
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(255,77,79,0.1)", color: "#FF4D4F" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4D4F" }} />Sync issue
                    </span>
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,77,79,0.06)", border: "1px solid rgba(255,77,79,0.2)" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#FF4D4F", margin: "0 0 3px" }}>Sync failed</p>
                    <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: "0 0 8px" }}>Salesforce returned an error. Your data is still saved here.</p>
                    <MockButton label="Retry sync" variant="secondary" />
                  </div>
                </div>
              </MockScreen>

              <MockScreen label="Synced — success" width={260}>
                <MockHeader title="Canyon Country Motors" />
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(245,166,35,0.12)", color: "#F5A623" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Lead
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(46,204,113,0.1)", color: "#2ECC71" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2ECC71" }} />Synced
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", margin: 0 }}>Synced to Salesforce. Record is live in your CRM.</p>
                </div>
              </MockScreen>

            </div>

            {/* Sync retry */}
            <div>
              <DeliverableHeading name="Sync retry — in progress + success" status="design" />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                <MockScreen label="Retry in progress" width={260}>
                  <MockHeader title="Canyon Country Motors" />
                  <div style={{ padding: "10px 14px" }}>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--md-sys-color-dark-secondary)", border: "1px solid var(--md-sys-color-dark-tertiary)", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--md-sys-color-brand-teal)", borderTopColor: "transparent", flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--md-sys-color-text-primary)", margin: "0 0 2px" }}>Syncing to Salesforce…</p>
                        <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: 0 }}>This usually takes a few seconds.</p>
                      </div>
                    </div>
                  </div>
                </MockScreen>
                <MockScreen label="Sync success toast" width={260}>
                  <MockHeader title="Canyon Country Motors" />
                  <MockToast label="Synced to Salesforce ✓" sub="Canyon Country Motors is now live in your CRM." />
                </MockScreen>
              </div>
            </div>
          </Section>

          {/* ── MISSING FIELDS ─────────────────────────────────────────────── */}
          <Section id="missing" title="Missing Fields & Recovery">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Missing required fields form" status="design"
                sub="When a lead is in 'Needs details' state, tapping the banner opens this form. It shows only the fields the CRM is missing — nothing the rep already filled in." />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

                <MockScreen label="Missing fields form" width={270}>
                  <MockHeader title="Add missing details" back="Lead" />
                  <div style={{ padding: "8px 14px", background: "rgba(255,107,90,0.05)" }}>
                    <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: 0 }}>Salesforce requires these fields before this lead can sync.</p>
                  </div>
                  <MockField label="Industry" placeholder="e.g. Automotive" required hint="Required by Salesforce" />
                  <MockField label="Annual revenue" placeholder="e.g. $500,000" required hint="Required by Salesforce" isLast />
                  <div style={{ padding: "12px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                    <MockButton label="Save & sync" teal full />
                  </div>
                </MockScreen>

                <MockScreen label="Saving & syncing" width={270}>
                  <MockHeader title="Add missing details" back="Lead" />
                  <div style={{ padding: "8px 14px", background: "rgba(255,107,90,0.05)" }}>
                    <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: 0 }}>Salesforce requires these fields before this lead can sync.</p>
                  </div>
                  <MockField label="Industry" value="Automotive" required />
                  <MockField label="Annual revenue" value="$500,000" required isLast />
                  <div style={{ padding: "12px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)", opacity: 0.6 }}>
                    <MockButton label="Syncing…" loading teal full />
                  </div>
                </MockScreen>

              </div>
            </div>

            <div>
              <DeliverableHeading name="Note attached to an unsynced lead" status="design"
                sub="If a rep captures a visit note before the lead has synced, the note must not be lost. It's saved locally and will sync when the lead does." />
              <MockScreen label="Lead detail with unsynced note" width={310}>
                <MockHeader title="Canyon Country Motors" />
                <div style={{ padding: "8px 14px 10px", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(245,166,35,0.12)", color: "#F5A623" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Lead
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(255,107,90,0.1)", color: "#FF6B5A" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF6B5A" }} />Needs details
                    </span>
                  </div>
                </div>
                <div style={{ padding: "10px 14px 6px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--md-sys-color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Activity</p>
                  <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--md-sys-color-dark-secondary)", border: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                    <p style={{ fontSize: 11, color: "var(--md-sys-color-text-muted)", margin: "0 0 4px" }}>Visit note · Just now</p>
                    <p style={{ fontSize: 13, color: "var(--md-sys-color-text-secondary)", margin: "0 0 8px", lineHeight: 1.5 }}>Met with Jane Smith. Interested in our fleet program for 12 vehicles. Follow up next week.</p>
                    <div style={{ display: "flex", gap: 5 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#F5A623", background: "rgba(245,166,35,0.1)", padding: "1px 7px", borderRadius: 20 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Note saved locally · pending sync
                      </span>
                    </div>
                  </div>
                </div>
              </MockScreen>
            </div>
          </Section>

          {/* ── DUPLICATE PREVENTION ───────────────────────────────────────── */}
          <Section id="duplicate" title="Duplicate Prevention">
            <DeliverableHeading name="Address-based duplicate warning + suggested record" status="design"
              sub="Surfaces while the rep fills in the address on the creation form. Non-blocking — the rep can view the existing record or continue creating." />
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

              <MockScreen label="Duplicate warning on form" width={280}>
                <MockHeader title="New customer" back="Customers" />
                <MockField label="Company name" value="Canyon Country Motors" required />
                <MockField label="Address" value="45 Canyon Rd" />
                <div style={{ padding: "6px 0" }}>
                  <MockWarningBanner
                    label="Possible duplicate found"
                    sub="Canyon Country Auto — 47 Canyon Rd, Sedona AZ looks similar. View it before creating?" />
                </div>
                <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}><MockButton label="View existing" variant="secondary" full /></div>
                    <div style={{ flex: 1 }}><MockButton label="Create anyway" variant="ghost" full /></div>
                  </div>
                </div>
                <MockField label="City" value="Sedona" />
                <MockField label="State" value="AZ" isLast />
                <div style={{ padding: "12px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <MockButton label="Create customer" teal full />
                </div>
              </MockScreen>

              <MockScreen label="Suggested existing record" width={280}>
                <MockSectionHeader label="Did you mean this one?" />
                <MockLeadCard name="Canyon Country Auto" meta="47 Canyon Rd · Sedona, AZ" sync="synced" isLast />
                <div style={{ padding: "8px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <MockActionRow label="Open this record →" color="var(--md-sys-color-brand-teal)" />
                </div>
                <div style={{ borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                  <MockActionRow label="It's different — create anyway" color="var(--md-sys-color-text-muted)" border />
                </div>
              </MockScreen>

            </div>
          </Section>

          {/* ── CONTACTS ───────────────────────────────────────────────────── */}
          <Section id="contacts" title="Contacts">
            <DeliverableHeading name="Contact field treatment (optional vs. out of scope)" status="decision"
              sub="Based on Decision 11, this section shows both design options so the team can pick." />
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--md-sys-color-text-muted)", margin: "0 0 8px" }}>Option A — Optional field on form (recommended)</p>
                <MockScreen width={270}>
                  <MockHeader title="New customer" back="Customers" />
                  <MockField label="Company name" value="Canyon Country Motors" required />
                  <MockField label="Address" value="45 Canyon Rd" />
                  <MockField label="City" value="Sedona" />
                  <MockField label="State" value="AZ" />
                  <MockField label="Contact name" placeholder="e.g. Jane Smith" hint="Optional — just for your reference" isLast />
                  <div style={{ padding: "12px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)" }}>
                    <MockButton label="Create customer" teal full />
                  </div>
                </MockScreen>
              </div>

              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--md-sys-color-text-muted)", margin: "0 0 8px" }}>Option B — Contacts out of scope</p>
                <MockScreen width={270}>
                  <MockHeader title="New customer" back="Customers" />
                  <MockField label="Company name" value="Canyon Country Motors" required />
                  <MockField label="Address" value="45 Canyon Rd" />
                  <MockField label="City" value="Sedona" />
                  <MockField label="State" value="AZ" isLast />
                  <div style={{ margin: "8px 12px", padding: "10px 12px", borderRadius: 8, background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", fontSize: 11, color: "var(--md-sys-color-text-muted)", lineHeight: 1.5 }}>
                    💡 To add a contact, mention them in your visit note after creating this record.
                  </div>
                  <div style={{ padding: "12px 14px", borderTop: "1px solid var(--md-sys-color-dark-tertiary)", marginTop: 4 }}>
                    <MockButton label="Create customer" teal full />
                  </div>
                </MockScreen>
              </div>

            </div>

            <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 8, background: "rgba(72,209,204,0.05)", border: "1px solid rgba(72,209,204,0.15)" }}>
              <p style={{ fontSize: 12, color: "var(--md-sys-color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: "var(--md-sys-color-text-secondary)" }}>Note on structured contact data:</strong>{" "}
                Even if a contact name is captured as free text, it is not synced as a Contact CRM object in V1.
                If the CRM requires a contact record to accompany a lead, that requirement surfaces in the missing-details flow.
                Full contact management is explicitly out of scope for this story.
              </p>
            </div>
          </Section>

          {/* ── ACCEPTANCE CRITERIA ───────────────────────────────────────── */}
          <Section id="criteria" title="Acceptance Criteria">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "A user can create a new lead/customer from the app.",
                "The UI clearly communicates whether the created record is a lead (via chip).",
                "Missing CRM-required fields do not block capture — the record is saved locally with a 'Needs details' state.",
                "If CRM sync cannot complete, the user can see why (Waiting / Needs details / Sync issue).",
                "The user has a clear path from 'Needs details' to the missing-fields form.",
                "The user can see when creation or sync retry is in progress (spinner, loading state).",
                "Notes attached to unsynced leads are saved locally and synced when the lead syncs — no data is lost.",
                "The UI distinguishes: Waiting to sync / Needs details / Sync issue — each has a distinct chip and detail state.",
                "Lightweight duplicate prevention exists: an address-match warning surfaces on the creation form.",
                "The rep can override a duplicate warning and create anyway.",
                "Contact handling is explicitly in scope (optional field) or out of scope — not ambiguous.",
              ].map((criterion, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "var(--md-sys-color-dark-primary)", border: "1px solid var(--md-sys-color-dark-tertiary)", borderRadius: 8 }}>
                  <span style={{ fontSize: 14, color: "var(--md-sys-color-text-disabled)", flexShrink: 0, marginTop: 1 }}>◻</span>
                  <span style={{ fontSize: 13, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.5 }}>{criterion}</span>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
