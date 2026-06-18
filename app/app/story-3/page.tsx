"use client";

/**
 * Story 3: Capture Notes on Accounts the User Does Not Own
 * Full desktop spec page — decisions, deliverables, and acceptance criteria.
 */

import { useState, useEffect } from "react";

// ─── Accent color for this story ──────────────────────────────────────────────
// Story 1 = purple, Story 2 = teal, Story 3 = coral

const CORAL = "var(--color-brand-coral)";
const CORAL_BG = "rgba(255,107,90,0.1)";
const CORAL_BORDER = "rgba(255,107,90,0.35)";

// ─── Layout primitives ────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 72 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: CORAL, marginBottom: 24, paddingBottom: 12,
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
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 6 }}>
      {children}
    </p>
  );
}

function StatusBadge({ status }: { status: "built" | "decision" | "design" }) {
  const map = {
    built:    { label: "Built",           bg: "rgba(46,204,113,0.12)",  color: "#2ECC71" },
    decision: { label: "Decision needed", bg: "rgba(245,166,35,0.12)", color: "#F5A623" },
    design:   { label: "Needs design",    bg: CORAL_BG,                color: CORAL },
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
  { id: "unowned",    label: "Unowned Account" },
  { id: "capture",    label: "Capture Flow" },
  { id: "attachment", label: "Attachment Rules" },
  { id: "visibility", label: "Note Visibility" },
  { id: "attribution",label: "Attribution" },
  { id: "sync",       label: "CRM Sync" },
  { id: "criteria",   label: "Acceptance Criteria" },
];

function SidebarNav({ active }: { active: string }) {
  return (
    <nav style={{ position: "sticky", top: 48, width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 8, paddingLeft: 12 }}>
        Story 3
      </p>
      {NAV_ITEMS.map(item => (
        <a key={item.id} href={`#${item.id}`} style={{
          display: "block", fontSize: 13,
          fontWeight: active === item.id ? 600 : 400,
          color: active === item.id ? "var(--color-text-primary)" : "var(--color-text-muted)",
          background: active === item.id ? "var(--color-dark-secondary)" : "transparent",
          borderLeft: `3px solid ${active === item.id ? CORAL : "transparent"}`,
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
  label, recommended, description, note, children,
}: {
  label: string; recommended?: boolean; description: string; note?: string; children?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--color-dark-primary)",
      border: `1px solid ${recommended ? CORAL_BORDER : "var(--color-dark-tertiary)"}`,
      borderRadius: 12, overflow: "hidden", flex: 1, minWidth: 0,
    }}>
      <div style={{ padding: "14px 16px 12px", borderBottom: children ? "1px solid var(--color-dark-tertiary)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{label}</span>
          {recommended && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: CORAL_BG, color: CORAL }}>
              Recommended
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55, margin: 0 }}>{description}</p>
        {note && <p style={{ fontSize: 11, color: "var(--color-text-disabled)", lineHeight: 1.5, margin: "8px 0 0", fontStyle: "italic" }}>{note}</p>}
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
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>{name}</h3>
        <StatusBadge status={status} />
      </div>
      {sub && <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>{sub}</p>}
    </div>
  );
}

// ─── Mock screen ─────────────────────────────────────────────────────────────

function MockScreen({ children, width = 300, label }: { children: React.ReactNode; width?: number; label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      {label && <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", margin: 0 }}>{label}</p>}
      <div style={{ width, background: "var(--color-background)", borderRadius: 16, border: "1px solid var(--color-dark-tertiary)", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function MockHeader({ title, back }: { title: string; back?: string }) {
  return (
    <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--color-dark-tertiary)", display: "flex", alignItems: "center", gap: 10 }}>
      {back && <span style={{ fontSize: 12, color: "var(--color-brand-purple)", fontWeight: 600, whiteSpace: "nowrap" }}>← {back}</span>}
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", margin: 0, fontFamily: "Roboto Slab, Georgia, serif" }}>{title}</p>
    </div>
  );
}

// ─── Ownership banner ─────────────────────────────────────────────────────────

function MockOwnershipBanner({ variant }: { variant: "warning" | "blocked" | "capture-ok" }) {
  const map = {
    "warning": {
      bg: CORAL_BG,
      border: CORAL_BORDER,
      color: CORAL,
      icon: "⚠",
      title: "Not your account",
      sub: "This account is assigned to Sarah Chen. You can view it and capture a note.",
    },
    "blocked": {
      bg: "rgba(255,77,79,0.08)",
      border: "rgba(255,77,79,0.3)",
      color: "#FF4D4F",
      icon: "🔒",
      title: "Capture restricted",
      sub: "You don't have permission to capture notes on this account. Contact your admin.",
    },
    "capture-ok": {
      bg: "rgba(245,166,35,0.08)",
      border: "rgba(245,166,35,0.3)",
      color: "#F5A623",
      icon: "ℹ",
      title: "Not your account",
      sub: "Owned by Sarah Chen. Any notes you capture will appear in your history and be visible to the account owner.",
    },
  };
  const s = map[variant];
  return (
    <div style={{ margin: "8px 12px", padding: "11px 14px", borderRadius: 10, background: s.bg, border: `1px solid ${s.border}` }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: s.color, margin: "0 0 3px" }}>{s.title}</p>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5, margin: 0 }}>{s.sub}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Mock chips ───────────────────────────────────────────────────────────────

function Chip({ label, variant }: { label: string; variant: "account" | "not-yours" | "synced" | "warning" | "info" }) {
  const map: Record<string, { dot?: string; bg: string; color: string }> = {
    account:    { dot: "#8B92FF", bg: "rgba(139,146,255,0.12)", color: "#8B92FF" },
    "not-yours":{ bg: "rgba(255,143,130,0.1)", color: "#FF8F82" },
    synced:     { dot: "#2ECC71", bg: "rgba(46,204,113,0.1)", color: "#2ECC71" },
    warning:    { dot: "#F5A623", bg: "rgba(245,166,35,0.1)", color: "#F5A623" },
    info:       { bg: CORAL_BG, color: CORAL },
  };
  const s = map[variant];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />}
      {label}
    </span>
  );
}

// ─── Mock action row ──────────────────────────────────────────────────────────

function MockActionRow({ label, color, dim, icon, sub }: { label: string; color?: string; dim?: boolean; icon?: string; sub?: string }) {
  return (
    <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-dark-tertiary)", opacity: dim ? 0.38 : 1, display: "flex", gap: 10, alignItems: "flex-start" }}>
      {icon && <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: color ?? "var(--color-text-primary)", margin: "0 0 2px" }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: "var(--color-text-disabled)", margin: 0 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mock activity items ──────────────────────────────────────────────────────

function MockActivityItem({
  title, time, by, account, isLast, dim, syncChip,
}: {
  title: string; time: string; by?: string; account?: string; isLast?: boolean; dim?: boolean; syncChip?: "synced" | "waiting" | "issue";
}) {
  const syncMap = {
    synced:  { dot: "#2ECC71", label: "Synced",  bg: "rgba(46,204,113,0.1)",  color: "#2ECC71" },
    waiting: { dot: "#F5A623", label: "Waiting", bg: "rgba(245,166,35,0.1)",  color: "#F5A623" },
    issue:   { dot: "#FF4D4F", label: "Sync issue", bg: "rgba(255,77,79,0.1)", color: "#FF4D4F" },
  };
  return (
    <div style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--color-dark-tertiary)", opacity: dim ? 0.45 : 1 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 3px", lineHeight: 1.4 }}>{title}</p>
      <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 5px" }}>{time}</p>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {by && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: CORAL_BG, color: CORAL }}>
            Captured by {by}
          </span>
        )}
        {account && (
          <span style={{ padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(139,146,255,0.1)", color: "#8B92FF" }}>
            {account}
          </span>
        )}
        {syncChip && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: syncMap[syncChip].bg, color: syncMap[syncChip].color }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: syncMap[syncChip].dot }} />
            {syncMap[syncChip].label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Mock modal/sheet ─────────────────────────────────────────────────────────

function MockSheet({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--color-dark-primary)", borderRadius: "16px 16px 0 0", border: "1px solid var(--color-dark-tertiary)", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--color-dark-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>{title}</span>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)", background: "var(--color-dark-secondary)", padding: "2px 8px", borderRadius: 20 }}>Sheet</span>
      </div>
      <div>{children}</div>
      {footer && <div style={{ padding: "12px 14px", borderTop: "1px solid var(--color-dark-tertiary)" }}>{footer}</div>}
    </div>
  );
}

function MockButton({
  label, variant = "primary", full,
}: {
  label: string; variant?: "primary" | "secondary" | "ghost" | "danger"; full?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: CORAL, color: "#fff" },
    secondary: { background: "var(--color-dark-secondary)", color: "var(--color-text-secondary)", border: "1px solid var(--color-dark-tertiary)" },
    ghost:     { background: "transparent", color: "var(--color-text-muted)", border: "1px solid var(--color-dark-tertiary)" },
    danger:    { background: "rgba(255,77,79,0.12)", color: "#FF4D4F" },
  };
  return (
    <div style={{
      ...styles[variant],
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "11px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700,
      width: full ? "100%" : "auto", cursor: "pointer",
    }}>
      {label}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Story3Page() {
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
    <div style={{ minHeight: "100vh", background: "var(--color-background)", color: "var(--color-text-primary)", fontFamily: "Barlow, system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50, background: "var(--color-dark-primary)",
        borderBottom: "1px solid var(--color-dark-tertiary)", padding: "0 40px", height: 48,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/handoff" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", textDecoration: "none" }}>Halosight</a>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <a href="/story-1" style={{ fontSize: 14, color: "var(--color-text-muted)", textDecoration: "none" }}>Story 1</a>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <a href="/story-2" style={{ fontSize: 14, color: "var(--color-text-muted)", textDecoration: "none" }}>Story 2</a>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Story 3</span>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <a href="/story-4" style={{ fontSize: 14, color: "var(--color-text-muted)", textDecoration: "none" }}>Story 4</a>
        </div>
        <a href="http://localhost:3000/accounts" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: CORAL, textDecoration: "none", padding: "4px 12px", background: CORAL_BG, borderRadius: 20 }}>
          Open prototype ↗
        </a>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 40px", display: "flex", gap: 56, alignItems: "flex-start" }}>
        <SidebarNav active={active} />
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          <Section id="overview" title="Overview">
            <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
                Story 3: Capture Notes on Accounts the User Does Not Own
              </h1>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, margin: "0 0 18px" }}>
                A field rep visits a customer that's assigned to someone else. They need to capture a note
                immediately — the account owner shouldn't be a bottleneck for fieldwork. This story defines
                what an unowned account looks like, what actions are available, how capture warnings work,
                who sees the resulting note, and how sync and attribution are handled.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Key decisions",       value: "11", color: "#F5A623", bg: "rgba(245,166,35,0.1)" },
                  { label: "Design deliverables", value: "15", color: CORAL,     bg: CORAL_BG },
                  { label: "Already built",       value: "3",  color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, padding: "16px 18px" }}>
                <Eyebrow>Already built</Eyebrow>
                {[
                  "'Not yours' chip on account list cards",
                  "Account list shows unowned accounts in global search",
                  "Lock icon for permission-restricted results",
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <span style={{ color: "#2ECC71", flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, padding: "16px 18px" }}>
                <Eyebrow>All design deliverables</Eyebrow>
                {[
                  "Unowned account detail page",
                  "Unowned account banner (warning / blocked / capture-ok variants)",
                  "Restricted/disabled edit states",
                  "Permission-restricted capture state",
                  "Available actions list on unowned account",
                  "Capture warning sheet",
                  "Attachment edit rules (post-recording / post-generation / post-sync)",
                  "Attached unowned customer block in capture flow",
                  "Engagement/history item for note on unowned account",
                  "Recording/note processing state (if it affects attachment)",
                  "Account activity item with captured-by attribution",
                  "Action item with captured-by/source attribution",
                  "Sync success state for unowned note",
                  "Sync failure state + copy for unowned notes",
                  "Owner notification rule spec",
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <span style={{ color: "#F5A623", flexShrink: 0, marginTop: 1 }}>○</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── KEY DECISIONS ─────────────────────────────────────────────── */}
          <Section id="decisions" title="Key Decisions">

            {/* 1 — Can users capture? */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="1. Can users capture notes on accounts they do not own?" status="decision"
                sub="The foundational question. Everything else branches from this answer." />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, with a warning" recommended
                  description="Any rep can capture a note on any visible account. A warning banner and/or capture sheet informs them upfront. The note is attributed to the capturing rep and visible to the owner."
                  note="Recommended. Field reps cover for each other constantly. Blocking capture creates friction and data loss." />
                <OptionCard label="Option B — Only with explicit permission"
                  description="Capture on unowned accounts requires an admin-granted 'cross-account capture' permission. Default is blocked."
                  note="Use if the org has strict CRM ownership rules that would reject cross-rep notes." />
                <OptionCard label="Option C — Never"
                  description="Capture is strictly limited to owned accounts. Reps must request ownership transfer before capturing."
                  note="Creates a hard blocker for field ops. Not recommended for V1." />
              </div>
            </div>

            {/* 2 — What can they see? */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="2. What can a rep see on an unowned account?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Full view" recommended
                  description="All account detail, activity history, and action items are visible. Rep can see everything the owner sees."
                  note="Recommended for V1. Keeps the UI simple — one account detail design, not two." />
                <OptionCard label="Option B — Limited view"
                  description="Rep can see the account name, address, and type, but activity and action items are hidden or blurred."
                  note="Adds complexity. Only useful if the org has privacy requirements around account history." />
                <OptionCard label="Option C — Capture-only view"
                  description="Rep sees a minimal capture screen with just enough context to confirm they have the right account."
                  note="Too restrictive. Reps need context to write a meaningful note." />
              </div>
            </div>

            {/* 3 — What can they do? */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="3. What actions are available on an unowned account?" status="decision" />
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                {[
                  { action: "View account detail",       allowed: "Yes",               note: "No restrictions" },
                  { action: "Capture a note",            allowed: "Yes — with warning", note: "Warning banner + capture sheet confirmation" },
                  { action: "Start an interaction",      allowed: "Yes — with warning", note: "Same warning as note capture" },
                  { action: "View existing activity",    allowed: "Yes",               note: "Read-only" },
                  { action: "Create an action item",     allowed: "Decision needed",   note: "Does ownership affect action item creation?" },
                  { action: "Complete an action item",   allowed: "Decision needed",   note: "Can a rep complete tasks on unowned accounts?" },
                  { action: "Edit account details",      allowed: "No",                note: "Edit is owner-only in V1" },
                  { action: "Transfer ownership",        allowed: "No",                note: "Admin-only" },
                ].map((row, i, arr) => (
                  <div key={row.action} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2.5fr", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.action}</div>
                    <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600,
                      color: row.allowed === "Yes" ? "#2ECC71" : row.allowed === "No" ? "#FF4D4F" : row.allowed.startsWith("Yes") ? "#F5A623" : "var(--color-text-muted)",
                      borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.allowed}</div>
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--color-text-disabled)", fontStyle: "italic" }}>{row.note}</div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2.5fr", background: "var(--color-dark-secondary)" }}>
                  {["Action", "Allowed", "Notes"].map(h => (
                    <div key={h} style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", borderRight: h !== "Notes" ? "1px solid var(--color-dark-tertiary)" : "none" }}>{h}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 — Permission-restricted capture */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="4. What happens if capture is permission-restricted?" status="decision"
                sub="If the org's CRM will reject a note from a non-owner, the rep still shouldn't lose their data." />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Save locally, explain the block" recommended
                  description="Rep can still start a capture. The note is saved locally with a 'Sync issue' chip and a message explaining CRM rejection. Rep can copy/forward to the owner to log manually."
                  note="Recommended. Data is never lost. The rep understands exactly what happened." />
                <OptionCard label="Option B — Block capture entirely"
                  description="Capture button is disabled with an explanation: 'Your CRM doesn't allow notes on accounts you don't own.'"
                  note="Cleaner but loses the data. Not recommended unless the org explicitly requires it." />
              </div>
            </div>

            {/* 5 — When does warning appear? */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="5. When does the capture warning appear?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — On the account detail page (persistent banner)" recommended
                  description="A banner is always visible on unowned account detail pages. No additional modal needed — the rep knows before they start."
                  note="Recommended. Upfront context reduces surprise. The rep can decide to capture or leave before they've invested time." />
                <OptionCard label="Option B — At the moment capture is triggered"
                  description="No banner on the detail page. When the rep taps 'Start interaction' or 'Take note', a sheet appears explaining the unowned status and asking them to confirm."
                  note="Less noisy but reactive. Rep may have already started a recording before seeing the warning." />
                <OptionCard label="Option C — Both"
                  description="A subtle banner on detail page + a confirmation sheet when capture is triggered. Belt and suspenders."
                  note="Best UX in most cases — the banner is informational, the sheet is a moment to confirm intent." />
              </div>
            </div>

            {/* 6 — Attachment edit rules */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="6. Can the attached account/customer be changed after capture?" status="decision"
                sub="The most complex decision in this story. Rules must be defined for three distinct post-capture states." />
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                {[
                  { stage: "Before submitting",        owned: "Yes — can change",  unowned: "Yes — can change",  note: "Rep is still filling out the form." },
                  { stage: "After recording, before AI generation", owned: "Yes — can change", unowned: "Yes — with warning", note: "Recording is done but note hasn't been generated yet." },
                  { stage: "After AI note generated",  owned: "Decision needed",   unowned: "Decision needed",   note: "Does re-attaching regenerate the note? Risk of data mismatch." },
                  { stage: "After sync to CRM",        owned: "No",                unowned: "No",                note: "CRM is source of truth. Edit would require CRM API call." },
                  { stage: "For a new lead (unsynced)", owned: "Yes",              unowned: "N/A",               note: "Leads are local-first — attachment can be corrected before first sync." },
                ].map((row, i, arr) => (
                  <div key={row.stage} style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1.3fr 2fr", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.stage}</div>
                    <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600,
                      color: row.owned === "Yes — can change" ? "#2ECC71" : row.owned === "No" ? "#FF4D4F" : row.owned === "Yes" ? "#2ECC71" : "#F5A623",
                      borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.owned}</div>
                    <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600,
                      color: row.unowned.startsWith("Yes") ? "#2ECC71" : row.unowned === "No" ? "#FF4D4F" : row.unowned === "N/A" ? "var(--color-text-disabled)" : "#F5A623",
                      borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.unowned}</div>
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--color-text-disabled)", fontStyle: "italic" }}>{row.note}</div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1.3fr 2fr", background: "var(--color-dark-secondary)" }}>
                  {["Stage", "Owned acct", "Unowned acct", "Notes"].map(h => (
                    <div key={h} style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", borderRight: h !== "Notes" ? "1px solid var(--color-dark-tertiary)" : "none" }}>{h}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                <strong style={{ color: "#F5A623" }}>Recommended rule:</strong> Account attachment is locked after AI generation. Before generation, it can be changed with a confirmation. After CRM sync, it is never changeable from the app — that requires a CRM edit. This gives reps a reasonable correction window without introducing data inconsistency.
              </div>
            </div>

            {/* 7 — Hard no-switch rule */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="7. Is 'you cannot switch the account after capture' a hard rule?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="No — allow correction before generation" recommended
                  description="After recording stops but before the AI note is generated, the rep can change the attached account. Once the note is generated and the rep confirms, the attachment is locked."
                  note="Recommended. The 'recording → generation' gap is the natural correction window. Locking after generation prevents note/account mismatch." />
                <OptionCard label="Yes — lock immediately after recording ends"
                  description="Once recording ends, the account attachment is permanently locked. Simpler logic, no edge cases around re-generation."
                  note="Tighter but may frustrate reps who realize mid-recording they have the wrong account." />
              </div>
            </div>

            {/* 8 — CRM sync */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="8. Do notes on unowned accounts sync to CRM?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, attempt sync; handle rejection gracefully" recommended
                  description="Halosight attempts to sync the note. If the CRM accepts it, great. If it rejects (e.g., Salesforce owner-only write rule), the note stays local with a 'Sync issue' state and an explanation."
                  note="Recommended. Attempt first, fail gracefully. Never silently drop a note." />
                <OptionCard label="Option B — Only sync if rep has write permission"
                  description="Before attempting sync, Halosight checks whether the rep has CRM write access to the account. If not, note is saved locally only."
                  note="Requires a permission-check API call. More complex but avoids failed sync attempts." />
              </div>
            </div>

            {/* 9 — CRM rejects sync */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="9. What happens if the CRM rejects the sync?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Save locally, show 'Sync issue' with explanation" recommended
                  description="Note remains in Halosight. The activity item shows a 'Sync issue' chip with a message: 'CRM rejected this note — [account] is owned by [owner]. Your data is still saved here.'"
                  note="Recommended. The rep always has their data and understands why sync failed." />
                <OptionCard label="Option B — Offer to reassign the note to the owner"
                  description="When sync fails due to ownership, the UI offers: 'Send this note to Sarah Chen to log for you?' This triggers a notification to the owner."
                  note="Good UX addition for V2, but adds complexity and a cross-rep notification system to V1." />
              </div>
            </div>

            {/* 10 — Note visibility */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="10. Where does the note appear?" status="decision" />
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                {[
                  { location: "Capturing rep's engagements / history", appears: "Yes — always", note: "The rep captured it; it's in their activity feed regardless of sync." },
                  { location: "Account's activity feed",                appears: "Yes — if linked", note: "Appears as an activity item with 'Captured by [rep]' attribution. Requires note to be successfully attached to account." },
                  { location: "Account owner's view",                   appears: "Yes — same as account activity", note: "Owner sees the note in the account's activity with attribution." },
                  { location: "Owner's own engagements/history feed",   appears: "No",            note: "It wasn't captured by the owner. It appears in account detail, not in their personal history." },
                  { location: "Owner notification",                     appears: "Decision needed", note: "See Decision 11." },
                ].map((row, i, arr) => (
                  <div key={row.location} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.3fr 2.5fr", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.location}</div>
                    <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600,
                      color: row.appears === "Yes — always" || row.appears.startsWith("Yes") ? "#2ECC71" : row.appears === "No" ? "#FF4D4F" : "#F5A623",
                      borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.appears}</div>
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--color-text-disabled)", fontStyle: "italic" }}>{row.note}</div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.3fr 2.5fr", background: "var(--color-dark-secondary)" }}>
                  {["Where", "Appears?", "Notes"].map(h => (
                    <div key={h} style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", borderRight: h !== "Notes" ? "1px solid var(--color-dark-tertiary)" : "none" }}>{h}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 11 — Owner notification */}
            <div style={{ marginBottom: 0 }}>
              <DeliverableHeading name="11. Does the account owner get notified?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, passive notification" recommended
                  description="Owner sees the note next time they view their account's activity. No push notification. Note appears with 'Captured by [rep]' attribution."
                  note="Recommended for V1. Notifications are a separate system; passive visibility is sufficient for most field orgs." />
                <OptionCard label="Option B — Push notification to owner"
                  description="Owner receives a push/in-app notification: '[Rep] captured a note on [Account].' Owner can tap to view."
                  note="Good for V2. Requires a notification system and opt-in preferences." />
                <OptionCard label="Option C — No notification, note is invisible to owner"
                  description="The note only appears in the capturing rep's history. The account owner doesn't see it unless they specifically search."
                  note="Not recommended — creates a hidden-data problem. Field notes should be shared context." />
              </div>
            </div>

          </Section>

          {/* ── UNOWNED ACCOUNT ────────────────────────────────────────────── */}
          <Section id="unowned" title="Unowned Account">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Unowned account detail page" status="design"
                sub="Full account view, but with an ownership banner at the top. The rest of the page is identical to an owned account." />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

                <MockScreen label="Standard — rep can capture" width={280}>
                  <MockHeader title="ProFleet Corp" back="Customers" />
                  <MockOwnershipBanner variant="capture-ok" />
                  <div style={{ padding: "10px 14px 6px" }}>
                    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                      <Chip label="Account" variant="account" />
                      <Chip label="Not yours" variant="not-yours" />
                      <Chip label="Synced" variant="synced" />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>4.2 mi · Phoenix, AZ</p>
                  </div>
                  <div style={{ borderTop: "1px solid var(--color-dark-tertiary)", padding: "10px 14px" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", margin: "0 0 6px" }}>Actions</p>
                    <MockActionRow label="Start interaction" icon="🎙" />
                    <MockActionRow label="Take note" icon="✏️" />
                    <MockActionRow label="Activity" icon="📋" />
                  </div>
                </MockScreen>

                <MockScreen label="Permission-restricted — capture blocked" width={280}>
                  <MockHeader title="Restricted Account Co" back="Customers" />
                  <MockOwnershipBanner variant="blocked" />
                  <div style={{ padding: "10px 14px 6px" }}>
                    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                      <Chip label="Account" variant="account" />
                      <Chip label="Not yours" variant="not-yours" />
                      <Chip label="Synced" variant="synced" />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>18 mi · Glendale, AZ</p>
                  </div>
                  <div style={{ borderTop: "1px solid var(--color-dark-tertiary)", padding: "10px 14px" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", margin: "0 0 6px" }}>Actions</p>
                    <MockActionRow label="Start interaction" icon="🎙" dim sub="Capture restricted on this account" />
                    <MockActionRow label="Take note" icon="✏️" dim sub="Capture restricted on this account" />
                    <MockActionRow label="Activity" icon="📋" />
                  </div>
                </MockScreen>

              </div>
            </div>

            <div>
              <DeliverableHeading name="Disabled/restricted edit state" status="design"
                sub="Edit button on an unowned account — present but clearly non-functional, with tooltip or sub-text explaining why." />
              <MockScreen label="Edit button — disabled" width={260}>
                <MockHeader title="ProFleet Corp" />
                <div style={{ padding: "10px 14px" }}>
                  <MockActionRow label="Edit account details" icon="✏️" dim sub="Only the account owner can edit" />
                </div>
              </MockScreen>
            </div>
          </Section>

          {/* ── CAPTURE FLOW ───────────────────────────────────────────────── */}
          <Section id="capture" title="Capture Flow">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Capture warning sheet" status="design"
                sub="Appears when the rep taps 'Start interaction' or 'Take note' on an unowned account. Confirms intent before the rep invests time in a recording." />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

                <MockScreen label="Capture warning sheet" width={300}>
                  <div style={{ padding: "16px 14px 0" }}>
                    <MockSheet
                      title="Not your account"
                      footer={
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <MockButton label="Continue capturing" variant="primary" full />
                          <MockButton label="Cancel" variant="ghost" full />
                        </div>
                      }
                    >
                      <div style={{ padding: "14px 16px" }}>
                        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 10px" }}>
                          <strong>ProFleet Corp</strong> is assigned to Sarah Chen.
                        </p>
                        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 10px" }}>
                          You can still capture a note. It will appear in your history and in this account's activity, attributed to you.
                        </p>
                        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55, margin: 0 }}>
                          Ownership does not change. Sarah Chen will be able to see this note.
                        </p>
                      </div>
                    </MockSheet>
                  </div>
                </MockScreen>

                <MockScreen label="Permission-blocked capture sheet" width={300}>
                  <div style={{ padding: "16px 14px 0" }}>
                    <MockSheet
                      title="Capture restricted"
                      footer={
                        <MockButton label="Got it" variant="ghost" full />
                      }
                    >
                      <div style={{ padding: "14px 16px" }}>
                        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 10px" }}>
                          Your CRM settings don't allow notes on accounts you don't own.
                        </p>
                        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 10px" }}>
                          To capture on <strong>Restricted Account Co</strong>, contact your admin or ask Sarah Chen to log the note.
                        </p>
                        <div style={{ padding: "10px 12px", borderRadius: 8, background: CORAL_BG, border: `1px solid ${CORAL_BORDER}` }}>
                          <p style={{ fontSize: 11, color: CORAL, fontWeight: 600, margin: "0 0 3px" }}>Your data won't be lost</p>
                          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>You can write a manual note and save it in your own history without attaching it to this account.</p>
                        </div>
                      </div>
                    </MockSheet>
                  </div>
                </MockScreen>

              </div>
            </div>

            <div>
              <DeliverableHeading name="Attached unowned customer block in capture flow" status="design"
                sub="Once capture is in progress, the attached account is shown in the note editor. On an unowned account, a compact warning label sits beneath the account name." />
              <MockScreen label="Note editor — unowned account attached" width={300}>
                <MockHeader title="New note" back="ProFleet Corp" />
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-dark-tertiary)" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", margin: "0 0 5px" }}>Attached customer</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "var(--color-dark-secondary)", border: `1px solid ${CORAL_BORDER}` }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 3px" }}>ProFleet Corp</p>
                      <div style={{ display: "flex", gap: 5 }}>
                        <Chip label="Not yours" variant="not-yours" />
                        <span style={{ fontSize: 10, color: "var(--color-text-disabled)" }}>Owned by Sarah Chen</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--color-text-disabled)", background: "var(--color-dark-tertiary)", padding: "3px 8px", borderRadius: 6 }}>Locked after save</span>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", minHeight: 100 }}>
                  <p style={{ fontSize: 13, color: "var(--color-text-disabled)", fontStyle: "italic" }}>Type your note…</p>
                </div>
              </MockScreen>
            </div>
          </Section>

          {/* ── ATTACHMENT RULES ───────────────────────────────────────────── */}
          <Section id="attachment" title="Attachment Rules">
            <DeliverableHeading name="Account attachment editability — visual rule summary" status="design"
              sub="The UI communicates at each stage whether the attached customer can still be changed. This prevents confusion when a rep realizes they have the wrong account." />

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>

              <MockScreen label="Before recording — editable" width={250}>
                <MockHeader title="New note" />
                <div style={{ padding: "10px 14px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", margin: "0 0 5px" }}>Attached customer</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "var(--color-dark-secondary)", border: "1px solid var(--color-dark-tertiary)" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>ProFleet Corp</p>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--color-brand-teal)", background: "rgba(72,209,204,0.1)", padding: "3px 8px", borderRadius: 6 }}>Change →</span>
                  </div>
                </div>
              </MockScreen>

              <MockScreen label="After recording, before generation — changeable with warning" width={250}>
                <MockHeader title="Review recording" />
                <div style={{ padding: "10px 14px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", margin: "0 0 5px" }}>Attached customer</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "var(--color-dark-secondary)", border: "1px solid rgba(245,166,35,0.3)" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 3px" }}>ProFleet Corp</p>
                      <p style={{ fontSize: 10, color: "#F5A623" }}>Changing will re-generate the note</p>
                    </div>
                    <span style={{ fontSize: 11, color: "#F5A623", background: "rgba(245,166,35,0.1)", padding: "3px 8px", borderRadius: 6 }}>Change</span>
                  </div>
                </div>
              </MockScreen>

              <MockScreen label="After AI generation — locked" width={250}>
                <MockHeader title="Review note" />
                <div style={{ padding: "10px 14px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", margin: "0 0 5px" }}>Attached customer</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "var(--color-dark-secondary)", opacity: 0.6 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>ProFleet Corp</p>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--color-text-disabled)", background: "var(--color-dark-tertiary)", padding: "3px 8px", borderRadius: 6 }}>🔒 Locked</span>
                  </div>
                  <p style={{ fontSize: 10, color: "var(--color-text-disabled)", margin: "5px 0 0", fontStyle: "italic" }}>To change the account, delete this note and start again.</p>
                </div>
              </MockScreen>

            </div>
          </Section>

          {/* ── NOTE VISIBILITY ────────────────────────────────────────────── */}
          <Section id="visibility" title="Note Visibility">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Capturing rep's engagement/history feed" status="design"
                sub="The note appears in the capturing rep's personal history, attached to the unowned account." />
              <MockScreen label="Rep's history — note on unowned account" width={340}>
                <MockHeader title="My activity" />
                <MockActivityItem
                  title="Visit note · ProFleet Corp"
                  time="Today, 2:14 PM"
                  account="ProFleet Corp — not yours"
                  syncChip="synced"
                />
                <MockActivityItem
                  title="Visit note · Jack's Tire & Oil"
                  time="Yesterday, 10:31 AM"
                  account="Jack's Tire & Oil"
                  syncChip="synced"
                  isLast
                />
              </MockScreen>
            </div>

            <div>
              <DeliverableHeading name="Account activity feed — with attribution" status="design"
                sub="The account owner (and any rep viewing the account) sees the note in the activity feed with a 'Captured by' label." />
              <MockScreen label="Account activity — captured-by attribution" width={340}>
                <MockHeader title="ProFleet Corp" />
                <div style={{ padding: "10px 14px 4px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", margin: "0 0 4px" }}>Activity</p>
                </div>
                <MockActivityItem
                  title="Met with floor manager, discussed Q3 fleet order."
                  time="Today, 2:14 PM"
                  by="Marcus T."
                  syncChip="synced"
                />
                <MockActivityItem
                  title="Quarterly check-in call — renewal on track."
                  time="Jun 12, 9:00 AM"
                  syncChip="synced"
                  isLast
                />
              </MockScreen>
            </div>
          </Section>

          {/* ── ATTRIBUTION ────────────────────────────────────────────────── */}
          <Section id="attribution" title="Attribution">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Activity item — captured-by attribution display" status="design"
                sub="Attribution appears on any activity item where the capturing rep is different from the account owner. A coral chip communicates 'this was someone else's visit.'" />
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <MockScreen label="Activity on unowned account" width={310}>
                  <MockActivityItem
                    title="Stopped by, spoke with Jane Smith about seasonal order."
                    time="Today, 2:14 PM"
                    by="Marcus T."
                    syncChip="synced"
                    isLast
                  />
                </MockScreen>
                <MockScreen label="Activity — own capture (no attribution needed)" width={310}>
                  <MockActivityItem
                    title="Quarterly check-in, renewal confirmed for Q4."
                    time="Jun 12, 9:00 AM"
                    syncChip="synced"
                    isLast
                  />
                </MockScreen>
              </div>
            </div>

            <div>
              <DeliverableHeading name="Action item — captured-by/source attribution" status="design"
                sub="If a note on an unowned account generates an action item, the action item should show who it originated from and which account it belongs to." />
              <MockScreen label="Action item from unowned account note" width={360}>
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>Follow up on Q3 fleet order</p>
                  <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 6px" }}>Due Thursday</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <span style={{ padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(139,146,255,0.1)", color: "#8B92FF" }}>ProFleet Corp</span>
                    <Chip label="Not yours" variant="not-yours" />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: CORAL_BG, color: CORAL }}>
                      From Marcus T.'s note
                    </span>
                  </div>
                </div>
              </MockScreen>
            </div>
          </Section>

          {/* ── CRM SYNC ───────────────────────────────────────────────────── */}
          <Section id="sync" title="CRM Sync">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Sync success — note on unowned account" status="design"
                sub="If the CRM accepts a note from a non-owner, the activity item updates to Synced like any other note." />
              <MockScreen label="Sync success state" width={310}>
                <MockActivityItem
                  title="Stopped by, spoke with Jane Smith about seasonal order."
                  time="Today, 2:14 PM"
                  by="Marcus T."
                  syncChip="synced"
                  isLast
                />
              </MockScreen>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Sync failure — CRM rejected due to ownership" status="design"
                sub="When the CRM rejects the sync because of ownership rules, the activity item shows a specific 'Sync issue' chip with an explanation message." />
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
                <MockScreen label="Activity item — sync rejected" width={340}>
                  <MockActivityItem
                    title="Stopped by, spoke with Jane Smith about seasonal order."
                    time="Today, 2:14 PM"
                    by="Marcus T."
                    syncChip="issue"
                    isLast
                  />
                </MockScreen>
                <MockScreen label="Sync issue — expanded detail" width={310}>
                  <div style={{ padding: "12px 14px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>Stopped by, spoke with Jane Smith about seasonal order.</p>
                    <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 10px" }}>Captured by Marcus T. · Today, 2:14 PM</p>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,77,79,0.06)", border: "1px solid rgba(255,77,79,0.2)", marginBottom: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#FF4D4F", margin: "0 0 3px" }}>Sync rejected by CRM</p>
                      <p style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5, margin: "0 0 8px" }}>
                        ProFleet Corp is owned by Sarah Chen. Your CRM doesn't allow notes from reps who aren't the account owner. Your note is saved here.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <MockButton label="Copy note" variant="secondary" full />
                        </div>
                        <div style={{ flex: 1 }}>
                          <MockButton label="Contact admin" variant="ghost" full />
                        </div>
                      </div>
                    </div>
                  </div>
                </MockScreen>
              </div>
            </div>

            {/* Owner notification spec */}
            <div>
              <DeliverableHeading name="Owner notification — rule spec" status="decision"
                sub="Not a UI deliverable — a rule the dev team needs before implementing." />
              <div style={{ background: "var(--color-dark-primary)", border: `1px solid ${CORAL_BORDER}`, borderRadius: 10, padding: "16px 18px" }}>
                <Eyebrow>Recommended rule for V1</Eyebrow>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { rule: "Passive visibility only",  detail: "Owner sees the note next time they view the account's activity. No push/in-app notification in V1." },
                    { rule: "Attribution always present", detail: "Activity item always shows 'Captured by [rep]' — never appears as if the owner wrote it." },
                    { rule: "No ownership transfer",     detail: "Capturing the note does not change account ownership in Halosight or the CRM." },
                    { rule: "V2 consideration",          detail: "A configurable 'notify account owner' toggle per org. Owner can choose push/email/none." },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                      <span style={{ color: CORAL, flexShrink: 0, fontWeight: 700, fontSize: 13 }}>→</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 2px" }}>{item.rule}</p>
                        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ── ACCEPTANCE CRITERIA ───────────────────────────────────────── */}
          <Section id="criteria" title="Acceptance Criteria">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "A user can identify that an account is not assigned to them (via 'Not yours' chip and ownership banner).",
                "A user understands what they are allowed to do on an unowned account (visible action list, disabled actions explained).",
                "A user is warned before capturing a note on an unowned account (banner + optional confirmation sheet).",
                "The system has clear, documented rules for when the attached account can be changed: editable before recording, changeable-with-warning after recording, locked after AI note generation, locked after CRM sync.",
                "Ownership does not change when a note is captured — the account owner remains unchanged.",
                "The note appears in the capturing rep's engagements/history list.",
                "The note appears in the account's activity feed if successfully linked (with captured-by attribution).",
                "Activity items and action items clearly show who captured or originated them when it differs from the account owner.",
                "If capture is permission-restricted, the UI explains what is blocked and why — and ensures the rep's data is not lost.",
                "CRM sync failure does not delete or hide the note — it stays in Halosight with a 'Sync issue' state and a plain-language explanation.",
                "Dev has a documented rule for owner visibility and notification behavior (V1: passive visibility only, no push notifications).",
              ].map((criterion, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 8 }}>
                  <span style={{ fontSize: 14, color: "var(--color-text-disabled)", flexShrink: 0, marginTop: 1 }}>◻</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{criterion}</span>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
