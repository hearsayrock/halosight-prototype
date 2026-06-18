"use client";

/**
 * Story 4: Home Page Priority Content — Recommended Customers + Action Items
 * Full desktop spec page — decisions, deliverables, and acceptance criteria.
 */

import { useState, useEffect } from "react";

// ─── Accent color for this story ──────────────────────────────────────────────
// Story 1 = purple, Story 2 = teal, Story 3 = coral, Story 4 = amber/gold

const AMBER = "#F5A623";
const AMBER_BG = "rgba(245,166,35,0.1)";
const AMBER_BORDER = "rgba(245,166,35,0.35)";

// ─── Layout primitives ────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 72 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: AMBER, marginBottom: 24, paddingBottom: 12,
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
    built:    { label: "Built",           bg: "rgba(46,204,113,0.12)", color: "#2ECC71" },
    decision: { label: "Decision needed", bg: AMBER_BG,               color: AMBER },
    design:   { label: "Needs design",    bg: AMBER_BG,               color: AMBER },
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
  { id: "overview",      label: "Overview" },
  { id: "decisions",     label: "Key Decisions" },
  { id: "ranking",       label: "Recommendation Logic" },
  { id: "rec-states",    label: "Recommendation States" },
  { id: "action-sort",   label: "Action Item Sorting" },
  { id: "action-states", label: "Action Item States" },
  { id: "criteria",      label: "Acceptance Criteria" },
];

function SidebarNav({ active }: { active: string }) {
  return (
    <nav style={{ position: "sticky", top: 48, width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 8, paddingLeft: 12 }}>
        Story 4
      </p>
      {NAV_ITEMS.map(item => (
        <a key={item.id} href={`#${item.id}`} style={{
          display: "block", fontSize: 13,
          fontWeight: active === item.id ? 600 : 400,
          color: active === item.id ? "var(--color-text-primary)" : "var(--color-text-muted)",
          background: active === item.id ? "var(--color-dark-secondary)" : "transparent",
          borderLeft: `3px solid ${active === item.id ? AMBER : "transparent"}`,
          padding: "6px 12px", borderRadius: "0 8px 8px 0", textDecoration: "none", transition: "all 0.1s",
        }}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

// ─── Option cards ─────────────────────────────────────────────────────────────

function OptionCard({ label, recommended, description, note, children }: {
  label: string; recommended?: boolean; description: string; note?: string; children?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--color-dark-primary)",
      border: `1px solid ${recommended ? AMBER_BORDER : "var(--color-dark-tertiary)"}`,
      borderRadius: 12, overflow: "hidden", flex: 1, minWidth: 0,
    }}>
      <div style={{ padding: "14px 16px 12px", borderBottom: children ? "1px solid var(--color-dark-tertiary)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{label}</span>
          {recommended && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: AMBER_BG, color: AMBER }}>
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

function MockSectionLabel({ label, action }: { label: string; action?: string }) {
  return (
    <div style={{ padding: "10px 14px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)" }}>{label}</span>
      {action && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-brand-purple)" }}>{action}</span>}
    </div>
  );
}

// ─── Mock top customer card (hero) ────────────────────────────────────────────

function MockTopCustomerCard({ name, meta, type = "account", reason, distance, syncChip, dim }: {
  name: string; meta?: string; type?: "account" | "lead"; reason?: string; distance?: string; syncChip?: "synced" | "waiting" | "issue"; dim?: boolean;
}) {
  const syncMap = {
    synced:  { dot: "#2ECC71", label: "Synced",     bg: "rgba(46,204,113,0.1)",  color: "#2ECC71" },
    waiting: { dot: AMBER,     label: "Waiting",    bg: AMBER_BG,               color: AMBER },
    issue:   { dot: "#FF4D4F", label: "Sync issue", bg: "rgba(255,77,79,0.1)",  color: "#FF4D4F" },
  };
  return (
    <div style={{
      margin: "6px 12px", padding: "14px", borderRadius: 14,
      background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)",
      opacity: dim ? 0.45 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 3px" }}>{name}</p>
          {meta && <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 6px" }}>{meta}</p>}
        </div>
        {distance && (
          <span style={{ fontSize: 12, fontWeight: 700, color: AMBER, background: AMBER_BG, padding: "3px 9px", borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
            {distance}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: reason ? 8 : 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: type === "account" ? "rgba(139,146,255,0.12)" : "rgba(245,166,35,0.12)", color: type === "account" ? "#8B92FF" : AMBER }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: type === "account" ? "#8B92FF" : AMBER }} />{type === "account" ? "Account" : "Lead"}
        </span>
        {syncChip && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: syncMap[syncChip].bg, color: syncMap[syncChip].color }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: syncMap[syncChip].dot }} />{syncMap[syncChip].label}
          </span>
        )}
      </div>
      {reason && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 8px", borderRadius: 8, background: "var(--color-dark-secondary)" }}>
          <span style={{ fontSize: 12 }}>💡</span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{reason}</span>
        </div>
      )}
    </div>
  );
}

// ─── Mock small customer cards (top 4) ───────────────────────────────────────

function MockSmallCustomerCard({ name, meta, type = "account", distance, reason, isLast, dim }: {
  name: string; meta?: string; type?: "account" | "lead"; distance?: string; reason?: string; isLast?: boolean; dim?: boolean;
}) {
  return (
    <div style={{ padding: "10px 14px", borderBottom: isLast ? "none" : "1px solid var(--color-dark-tertiary)", opacity: dim ? 0.4 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>{name}</p>
            {distance && <span style={{ fontSize: 10, fontWeight: 700, color: AMBER, background: AMBER_BG, padding: "1px 6px", borderRadius: 20, flexShrink: 0 }}>{distance}</span>}
          </div>
          {meta && <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 4px" }}>{meta}</p>}
          <div style={{ display: "flex", gap: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 6px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: type === "account" ? "rgba(139,146,255,0.12)" : AMBER_BG, color: type === "account" ? "#8B92FF" : AMBER }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: type === "account" ? "#8B92FF" : AMBER }} />{type === "account" ? "Account" : "Lead"}
            </span>
            {reason && <span style={{ fontSize: 10, color: "var(--color-text-disabled)", alignSelf: "center" }}>{reason}</span>}
          </div>
        </div>
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ flexShrink: 0, marginTop: 4 }}>
          <path d="M1 1L5 5L1 9" stroke="var(--color-text-disabled)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Mock action item ─────────────────────────────────────────────────────────

type DueBucket = "overdue" | "today" | "upcoming" | "no-date" | "completed";

function MockActionItem({ title, account, dueLabel, bucket, isLast }: {
  title: string; account?: string; dueLabel?: string; bucket: DueBucket; isLast?: boolean;
}) {
  const bucketMap: Record<DueBucket, { dot: string; label: string; strikethrough?: boolean }> = {
    overdue:   { dot: "#FF4D4F", label: "Overdue" },
    today:     { dot: AMBER,     label: "Due today" },
    upcoming:  { dot: "var(--color-brand-teal)", label: dueLabel ?? "Upcoming" },
    "no-date": { dot: "var(--color-text-disabled)", label: "No due date" },
    completed: { dot: "#2ECC71", label: "Completed", strikethrough: true },
  };
  const s = bucketMap[bucket];
  return (
    <div style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--color-dark-tertiary)", opacity: bucket === "completed" ? 0.45 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Checkbox */}
        <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${bucket === "completed" ? "#2ECC71" : "var(--color-dark-tertiary)"}`, background: bucket === "completed" ? "rgba(46,204,113,0.15)" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {bucket === "completed" && <span style={{ color: "#2ECC71", fontSize: 10, lineHeight: 1 }}>✓</span>}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 3px", textDecoration: s.strikethrough ? "line-through" : "none" }}>
            {title}
          </p>
          {account && <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 5px" }}>{account}</p>}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: bucket === "overdue" ? "#FF4D4F" : bucket === "today" ? AMBER : "var(--color-text-muted)" }}>
              {s.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mock shimmer ─────────────────────────────────────────────────────────────

function MockShimmerCard({ tall }: { tall?: boolean }) {
  return (
    <div style={{ margin: "6px 12px", padding: "14px", borderRadius: 14, background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)" }}>
      <div style={{ height: 14, width: "60%", borderRadius: 6, background: "var(--color-dark-tertiary)", marginBottom: 8 }} />
      <div style={{ height: 11, width: "40%", borderRadius: 6, background: "var(--color-dark-secondary)", marginBottom: tall ? 32 : 8 }} />
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ height: 18, width: 56, borderRadius: 20, background: "var(--color-dark-tertiary)" }} />
        <div style={{ height: 18, width: 44, borderRadius: 20, background: "var(--color-dark-secondary)" }} />
      </div>
    </div>
  );
}

function MockEmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ padding: "28px 16px", textAlign: "center" }}>
      <p style={{ fontSize: 24, marginBottom: 6 }}>{icon}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>{title}</p>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.55 }}>{sub}</p>
    </div>
  );
}

function MockBanner({ icon, text, sub }: { icon: string; text: string; sub?: string }) {
  return (
    <div style={{ margin: "6px 12px", padding: "10px 12px", borderRadius: 10, background: AMBER_BG, border: `1px solid ${AMBER_BORDER}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: AMBER, margin: "0 0 2px" }}>{text}</p>
        {sub && <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Sorting diagram ──────────────────────────────────────────────────────────

function SortRow({ rank, label, color, note }: { rank: string; label: string; color: string; note: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-dark-tertiary)" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-disabled)", width: 20, flexShrink: 0, textAlign: "center" }}>{rank}</span>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>{label}</span>
      <span style={{ fontSize: 11, color: "var(--color-text-disabled)", fontStyle: "italic", maxWidth: 260, textAlign: "right" }}>{note}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Story4Page() {
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
          <a href="/story-3" style={{ fontSize: 14, color: "var(--color-text-muted)", textDecoration: "none" }}>Story 3</a>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Story 4</span>
        </div>
        <a href="http://localhost:3000/accounts" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: AMBER, textDecoration: "none", padding: "4px 12px", background: AMBER_BG, borderRadius: 20 }}>
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
                Story 4: Home Page Priority Content
              </h1>
              <h2 style={{ fontSize: 15, fontWeight: 400, color: "var(--color-text-muted)", margin: "0 0 14px", fontFamily: "inherit" }}>
                Recommended Customers + Action Items
              </h2>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, margin: "0 0 18px" }}>
                The home screen is the rep's daily starting point. It needs to answer two questions at a glance:
                "Who should I visit next?" and "What do I need to do today?" This story defines the ranking model
                for recommended customers, how leads fit into that model, all fallback and empty states,
                and the deterministic sort order for action items.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Key decisions",       value: "17", color: AMBER,    bg: AMBER_BG },
                  { label: "Design deliverables", value: "15", color: AMBER,    bg: AMBER_BG },
                  { label: "Already built",       value: "4",  color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
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
                <Eyebrow>Already built in prototype</Eyebrow>
                {[
                  "Priority hub / home page layout",
                  "Top account card (static mock)",
                  "Top 4 account cards (static mock)",
                  "Action items list (static, date-sorted)",
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <span style={{ color: "#2ECC71", flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, padding: "16px 18px" }}>
                <Eyebrow>Outstanding</Eyebrow>
                {[
                  "Ranking algorithm / signal definition",
                  "Lead eligibility rule for recommendations",
                  "Recommendation reason/metadata label",
                  "Location unavailable / denied state",
                  "Far-away fallback state",
                  "Fewer-than-4 recommendations state",
                  "Recommendation empty state",
                  "Overdue action item visual treatment",
                  "Due today visual treatment",
                  "No-due-date placement rule",
                  "Completed item hidden/separate rule",
                  "Action item empty state",
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <span style={{ color: AMBER, flexShrink: 0, marginTop: 1 }}>○</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── KEY DECISIONS ─────────────────────────────────────────────── */}
          <Section id="decisions" title="Key Decisions">

            {/* 1-2: Top 1 vs top 4 */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="1–2. Is top 1 just the highest-ranked item from the top 4?" status="decision"
                sub="Are the two sections powered by the same ranking model, or do they use separate logic?" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — One model, top 1 = rank #1" recommended
                  description="A single ranking model produces an ordered list of recommended customers. The top card shows item #1. The top 4 section shows items #1–4. Simple, consistent, and easy to reason about."
                  note="Recommended. Avoids divergence between two lists that would confuse both devs and reps." />
                <OptionCard label="Option B — Separate models for top 1 and top 4"
                  description="Top 1 optimizes for 'the single best visit right now' (e.g. strongly weights proximity). Top 4 uses a broader ranking that weights diversity or cadence."
                  note="More sophisticated, but adds two ranking algorithms to build and maintain. Defer to V2." />
              </div>
            </div>

            {/* 3-4: Lead eligibility */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="3–4. Are leads eligible for recommended customer slots?" status="decision"
                sub="If leads exist in the customer list (Story 1), should they compete for recommendation slots alongside accounts?" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, leads are eligible" recommended
                  description="Leads compete with accounts for recommendation slots using the same ranking model. A recently created lead near the rep's location could appear as a top recommendation."
                  note="Recommended if leads represent real prospects worth visiting. Unlocks the full value of Story 2 lead creation.">
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(245,166,35,0.12)", color: AMBER }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: AMBER }} />Lead can appear in top 4
                    </span>
                  </div>
                </OptionCard>
                <OptionCard label="Option B — Leads excluded from recommendations"
                  description="Only CRM accounts are eligible for recommendation slots. Leads are visible in the full customer list but not surfaced on the home page."
                  note="Simpler for V1. Use if leads represent unqualified prospects that shouldn't drive visit planning." />
                <OptionCard label="Option C — Leads weighted differently"
                  description="Leads are eligible but score lower than accounts by default. They only surface in recommendations when no stronger account options exist nearby."
                  note="Best of both worlds but requires a weight tuning decision. Good V2 option." />
              </div>
            </div>

            {/* 5: Ranking signals */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="5. What signals determine recommendation order?" status="decision"
                sub="The ranking model is a product decision, not just an engineering one. Signal weights should be explicitly defined before dev begins." />
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                {[
                  { signal: "Proximity (distance from rep's location)", weight: "High",   note: "Most actionable signal for a field rep about to drive somewhere" },
                  { signal: "Last visited date",                        weight: "High",   note: "Accounts not visited recently should rank up" },
                  { signal: "Visit cadence overdue",                    weight: "High",   note: "Explicit 'this account needs attention' signal" },
                  { signal: "Open action items / overdue tasks",        weight: "Medium", note: "Rep has a specific reason to visit" },
                  { signal: "Priority / tier (A/B/C account)",         weight: "Medium", note: "High-tier accounts should surface more often" },
                  { signal: "Recent activity",                          weight: "Low",    note: "Recently active accounts are lower priority to visit again" },
                  { signal: "Sync issues / needs details",              weight: "Low",    note: "May surface unresolved records but not a primary visit driver" },
                  { signal: "Recently created lead",                    weight: "Medium (if leads eligible)", note: "A newly created lead is a hot prospect worth following up" },
                ].map((row, i, arr) => (
                  <div key={row.signal} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.2fr 2fr", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.signal}</div>
                    <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, borderRight: "1px solid var(--color-dark-tertiary)",
                      color: row.weight === "High" ? "#2ECC71" : row.weight === "Medium" ? AMBER : row.weight.startsWith("Medium") ? AMBER : "var(--color-text-muted)" }}>
                      {row.weight}
                    </div>
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--color-text-disabled)", fontStyle: "italic" }}>{row.note}</div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.2fr 2fr", background: "var(--color-dark-secondary)" }}>
                  {["Signal", "V1 Weight", "Notes"].map(h => (
                    <div key={h} style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", borderRight: h !== "Notes" ? "1px solid var(--color-dark-tertiary)" : "none" }}>{h}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6-8: Location issues */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="6–8. What happens when location is unavailable or all accounts are far away?" status="decision" />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <OptionCard label="Location unavailable — fall back to non-proximity signals" recommended
                  description="If GPS is off or unavailable, drop proximity from the ranking model entirely. Rank by last visited, cadence, open action items, and tier instead. Show a subtle banner: 'Recommendations are based on visit history — turn on location for distance-based suggestions.'"
                  note="Never show an empty state just because GPS is off." />
                <OptionCard label="Location denied — explain and continue" recommended
                  description="If the user has denied location permission, show a one-time prompt explaining the benefit. After dismissal, fall back to non-proximity signals as above."
                  note="Don't repeatedly prompt. Banner is dismissible." />
                <OptionCard label="All accounts far away — still show best available" recommended
                  description="Never show an empty state because accounts are far. If the nearest account is 200 miles away, it still ranks #1 by proximity. Show the distance badge prominently so the rep knows."
                  note="An empty recommendation is always worse than a far-away recommendation." />
              </div>
            </div>

            {/* 9-10: Fewer than 4 / relevance threshold */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="9–10. Fewer than 4 recommendations / relevance threshold" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Always populate — no threshold (recommended)" recommended
                  description="The top 4 always shows up to 4 items if data exists, regardless of relevance scores. If only 2 accounts exist, show 2. Never show empty slots."
                  note="Recommended for V1. Relevance thresholds add complexity and create confusing 'half-full' states." />
                <OptionCard label="Respect a relevance threshold"
                  description="Only show a customer in recommendations if their score exceeds a minimum threshold. Below threshold, show an empty slot with a message like 'No strong match nearby.'"
                  note="Better UX at scale, but threshold tuning is product work. Defer to V2." />
              </div>
            </div>

            {/* 11: Only leads */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="11. What happens if there are leads but no accounts?" status="decision" />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Show leads in recommendation slots" recommended
                  description="If leads are eligible (Decision 3) and no accounts exist, leads fill all recommendation slots. The home page is still useful on day one."
                  note="Required if leads are eligible. Otherwise the home page is empty for new reps." />
                <OptionCard label="Option B — Show empty state with 'add customers' prompt"
                  description="If no accounts exist, recommendations are empty with a CTA to import or create accounts."
                  note="Only valid if leads are excluded from recommendations. A new rep sees nothing — bad first-run experience." />
              </div>
            </div>

            {/* 12: Recommendation reason */}
            <div style={{ marginBottom: 40 }}>
              <DeliverableHeading name="12. Should the UI explain why something is recommended?" status="decision"
                sub="A recommendation reason ('You haven't visited in 3 weeks', '2 open tasks', '0.8 mi away') helps reps trust and act on suggestions." />
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard label="Option A — Yes, show a reason label on each card" recommended
                  description="A single highest-weight reason appears beneath each card. Simple, low-clutter, and helps reps verify the recommendation is relevant."
                  note="Recommended for V1. One reason is enough — a ranked list of signals is noise.">
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 8px", borderRadius: 8, background: "var(--color-dark-secondary)" }}>
                    <span style={{ fontSize: 12 }}>💡</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Overdue for a visit · Last seen 3 weeks ago</span>
                  </div>
                </OptionCard>
                <OptionCard label="Option B — No reason label"
                  description="Cards show name, distance, and type chip only. Recommendations are trusted without explanation."
                  note="Simpler. Works if reps already know their accounts well. Risk: feels arbitrary to new reps." />
              </div>
            </div>

            {/* 13-17: Action item sorting */}
            <div style={{ marginBottom: 0 }}>
              <DeliverableHeading name="13–17. Action item sort order, tie breakers, and empty state" status="decision" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { q: "13. Sort order",          a: "Overdue → Due today → Upcoming (nearest first) → No due date → Completed hidden",       recommended: true },
                  { q: "14. No due date placement", a: "After all dated items, before completed. Always at the bottom of the active list.",       recommended: true },
                  { q: "15. Same due date tie breaker", a: "Older created_at first — so the item that has waited longest surfaces first.",      recommended: true },
                  { q: "16. Completed action items", a: "Hidden from the main list. Show a collapsed 'X completed' section at the bottom, expandable.", recommended: true },
                  { q: "17. Empty state",            a: "Show a positive message: 'All caught up — no action items.' No placeholder items.",    recommended: true },
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 3fr", background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.q}</div>
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{row.a}</span>
                      {row.recommended && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: AMBER_BG, color: AMBER, flexShrink: 0 }}>Recommended</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </Section>

          {/* ── RECOMMENDATION LOGIC ───────────────────────────────────────── */}
          <Section id="ranking" title="Recommendation Logic">
            <DeliverableHeading name="Ranking algorithm — V1 model" status="design"
              sub="A weighted scoring model. Signals combine to produce a score for each customer. The top N by score are shown." />
            <div style={{ background: "var(--color-dark-primary)", border: `1px solid ${AMBER_BORDER}`, borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
              <Eyebrow>V1 Recommended Scoring Model</Eyebrow>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Score each customer with a simple additive model. The weights below are starting points — product should calibrate based on real usage. No ML required for V1.
              </p>
              {[
                { signal: "Proximity", formula: "+30 pts if within 1 mi, +20 if within 5 mi, +10 if within 20 mi, +0 beyond", note: "Drops to 0 if location unavailable" },
                { signal: "Days since last visit", formula: "+20 pts if not visited in 30+ days, +10 if 14–29 days", note: "No penalty for recently visited" },
                { signal: "Cadence overdue", formula: "+25 pts if past scheduled visit date", note: "Requires cadence field on account" },
                { signal: "Open action items", formula: "+5 pts per open item, capped at +20", note: "Direct reason to visit" },
                { signal: "Account tier (A/B/C)", formula: "+15 if tier A, +8 if tier B, +0 if tier C or unset", note: "Prioritizes high-value accounts" },
                { signal: "Recently created lead", formula: "+15 pts if created within 7 days (leads only)", note: "Hot prospect signal" },
              ].map((row, i, arr) => (
                <div key={row.signal} style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1.5fr", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none", gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{row.signal}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "monospace", background: "var(--color-dark-secondary)", padding: "3px 8px", borderRadius: 6 }}>{row.formula}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-disabled)", fontStyle: "italic", alignSelf: "center" }}>{row.note}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(139,146,255,0.05)", border: "1px solid rgba(139,146,255,0.15)", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--color-brand-purple)" }}>Top 1 and top 4:</strong> Sort all customers by descending score. Top 4 = ranks 1–4. Top 1 = rank 1. Same model, same sort. When location is unavailable, remove all proximity points and re-score.
            </div>
          </Section>

          {/* ── RECOMMENDATION STATES ──────────────────────────────────────── */}
          <Section id="rec-states" title="Recommendation States">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Top customer card (top 1) — with recommendation reason" status="design" />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                <MockScreen label="Nearby + overdue" width={280}>
                  <MockSectionLabel label="Top recommendation" />
                  <MockTopCustomerCard name="Jack's Tire & Oil" meta="Elko, NV" distance="0.8 mi" reason="Overdue for a visit · last seen 3 weeks ago" syncChip="synced" />
                </MockScreen>
                <MockScreen label="Lead — recently created" width={280}>
                  <MockSectionLabel label="Top recommendation" />
                  <MockTopCustomerCard name="Canyon Country Motors" meta="Sedona, AZ" type="lead" distance="1.4 mi" reason="New lead — created 2 days ago" syncChip="waiting" />
                </MockScreen>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Top 4 recommended customers" status="design" />
              <MockScreen label="Full top 4 — mixed types" width={310}>
                <MockSectionLabel label="Recommended customers" action="View all" />
                <MockSmallCustomerCard name="Jack's Tire & Oil" meta="Elko, NV" distance="0.8 mi" reason="Overdue" />
                <MockSmallCustomerCard name="ProFleet Corp" meta="Phoenix, AZ" distance="5 mi" reason="Open tasks" />
                <MockSmallCustomerCard name="Canyon Country Motors" meta="Sedona, AZ" type="lead" distance="12 mi" reason="New lead" />
                <MockSmallCustomerCard name="Cedar City Walmart" meta="Cedar City, UT" distance="38 mi" reason="Not visited in 45d" isLast />
              </MockScreen>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Location unavailable — non-proximity ranking" status="design" />
              <MockScreen label="Location off" width={310}>
                <MockBanner icon="📍" text="Location off — showing by visit history" sub="Turn on location for distance-based recommendations." />
                <MockSectionLabel label="Recommended customers" action="View all" />
                <MockSmallCustomerCard name="Jack's Tire & Oil" meta="Elko, NV" reason="Not visited in 3 weeks" />
                <MockSmallCustomerCard name="ProFleet Corp" meta="Phoenix, AZ" reason="2 open tasks" />
                <MockSmallCustomerCard name="Cedar City Walmart" meta="Cedar City, UT" reason="Tier A account" isLast />
              </MockScreen>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Location permission denied" status="design" />
              <MockScreen label="Denied" width={310}>
                <MockBanner icon="🔒" text="Location access denied" sub="Enable location in Settings to see nearby recommendations. Showing by visit history for now." />
                <MockSectionLabel label="Recommended customers" action="View all" />
                <MockSmallCustomerCard name="Jack's Tire & Oil" meta="Elko, NV" reason="Not visited in 3 weeks" />
                <MockSmallCustomerCard name="ProFleet Corp" meta="Phoenix, AZ" reason="2 open tasks" isLast />
              </MockScreen>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="All accounts far away — show best available with distance" status="design" />
              <MockScreen label="Nearest account is 85 miles" width={310}>
                <MockSectionLabel label="Recommended customers" action="View all" />
                <MockSmallCustomerCard name="ProFleet Flagstaff" meta="Flagstaff, AZ" distance="85 mi" reason="Not visited in 2 months" />
                <MockSmallCustomerCard name="Southwest Fleet" meta="Tucson, AZ" distance="112 mi" reason="Open tasks" isLast />
              </MockScreen>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Fewer than 4 recommendations" status="design"
                sub="Only 2 customers exist — show 2, no empty slots." />
              <MockScreen label="2-of-4 slots filled" width={310}>
                <MockSectionLabel label="Recommended customers" action="View all" />
                <MockSmallCustomerCard name="Jack's Tire & Oil" meta="Elko, NV" distance="0.8 mi" />
                <MockSmallCustomerCard name="ProFleet Corp" meta="Phoenix, AZ" distance="5 mi" isLast />
              </MockScreen>
            </div>

            <div>
              <DeliverableHeading name="Recommendation empty state — no customers at all" status="design" />
              <MockScreen label="No customers yet" width={310}>
                <MockSectionLabel label="Recommended customers" />
                <MockEmptyState icon="🗺️" title="No customers yet" sub={"Add your first customer to start getting recommendations."} />
              </MockScreen>
            </div>
          </Section>

          {/* ── ACTION ITEM SORTING ────────────────────────────────────────── */}
          <Section id="action-sort" title="Action Item Sorting">
            <DeliverableHeading name="Sort order — deterministic and fully defined" status="design"
              sub="This is the canonical sort used everywhere action items appear on the home page." />

            <div style={{ background: "var(--color-dark-primary)", border: `1px solid ${AMBER_BORDER}`, borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
              <Eyebrow>Recommended V1 sort order</Eyebrow>
              <div style={{ marginTop: 4 }}>
                <SortRow rank="1" label="Overdue" color="#FF4D4F" note="Due date is in the past and item is not completed" />
                <SortRow rank="2" label="Due today" color={AMBER} note="Due date matches today's date" />
                <SortRow rank="3" label="Upcoming — nearest due date first" color="var(--color-brand-teal)" note="Due date is in the future, sorted ascending" />
                <SortRow rank="4" label="No due date" color="var(--color-text-disabled)" note="After all dated items, before completed" />
                <SortRow rank="5" label="Completed (hidden by default)" color="#2ECC71" note="Collapsed 'X completed' section, expandable" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, padding: "14px 16px" }}>
                <Eyebrow>Tie breaker</Eyebrow>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  When two active items share the same due date, sort by <strong>older created_at first</strong> — the item that has waited longest surfaces at the top.
                </p>
              </div>
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, padding: "14px 16px" }}>
                <Eyebrow>Same-day overdue tie breaker</Eyebrow>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  Multiple overdue items: sort by <strong>oldest due date first</strong> (most overdue at top), then by older created_at within the same due date.
                </p>
              </div>
            </div>
          </Section>

          {/* ── ACTION ITEM STATES ─────────────────────────────────────────── */}
          <Section id="action-states" title="Action Item States">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Full sorted list — all states" status="design"
                sub="Shows the recommended sort order with each bucket visually distinct." />
              <MockScreen label="Action items — full list" width={320}>
                <MockSectionLabel label="Action items" action="View all" />
                <MockActionItem title="Send Q3 proposal to ProFleet" account="ProFleet Corp" dueLabel="2 days ago" bucket="overdue" />
                <MockActionItem title="Follow up on fleet program interest" account="Canyon Country Motors" bucket="today" />
                <MockActionItem title="Schedule quarterly review call" account="Jack's Tire & Oil" dueLabel="Thu Jun 20" bucket="upcoming" />
                <MockActionItem title="Check back on tire inventory" account="Cedar City Walmart" dueLabel="Mon Jun 24" bucket="upcoming" />
                <MockActionItem title="Introduce new account manager" account="Southwest Fleet" bucket="no-date" isLast />
              </MockScreen>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Individual action item state treatments" status="design" />
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>

                <MockScreen label="Overdue" width={260}>
                  <MockActionItem title="Send Q3 proposal" account="ProFleet Corp" dueLabel="2 days ago" bucket="overdue" isLast />
                </MockScreen>

                <MockScreen label="Due today" width={260}>
                  <MockActionItem title="Follow up on fleet program" account="Canyon Country" bucket="today" isLast />
                </MockScreen>

                <MockScreen label="Upcoming" width={260}>
                  <MockActionItem title="Schedule quarterly review" account="Jack's Tire & Oil" dueLabel="Thu Jun 20" bucket="upcoming" isLast />
                </MockScreen>

                <MockScreen label="No due date" width={260}>
                  <MockActionItem title="Introduce new account manager" account="Southwest Fleet" bucket="no-date" isLast />
                </MockScreen>

                <MockScreen label="Completed (shown collapsed)" width={260}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-dark-tertiary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>▶</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>3 completed</span>
                    </div>
                  </div>
                  <MockActionItem title="Confirm Q4 pricing sheet" account="Jack's Tire" bucket="completed" isLast />
                </MockScreen>

              </div>
            </div>

            <div>
              <DeliverableHeading name="No action items — empty state" status="design" />
              <MockScreen label="All caught up" width={310}>
                <MockSectionLabel label="Action items" />
                <MockEmptyState icon="✅" title="All caught up" sub="No open action items. Check back after your next visit." />
              </MockScreen>
            </div>
          </Section>

          {/* ── ACCEPTANCE CRITERIA ───────────────────────────────────────── */}
          <Section id="criteria" title="Acceptance Criteria">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Dev knows how to select the top customer: highest score from the same model used for the top 4.",
                "Dev knows how to select the top 4: the four highest-scoring customers from a single weighted ranking model.",
                "Dev knows whether leads can appear in recommendations — must be an explicit product decision, not an accident.",
                "Dev knows what to do when location is unavailable or denied: drop proximity from scoring, fall back to visit history, tier, and open tasks.",
                "Dev knows whether to use a relevance threshold: V1 recommendation is no threshold — always show best available.",
                "The home page has a defined empty state for recommendations (no customers exist).",
                "The home page has a defined fallback state when location is off or permission is denied.",
                "Action items have a deterministic sort order: overdue → due today → upcoming (nearest first) → no due date → completed hidden.",
                "Action items with no due date are placed after all dated active items.",
                "Same-due-date action items are broken by older created_at first.",
                "Completed action items are hidden in a collapsed section — not mixed into the active list.",
                "The home page has a defined empty state when there are no action items.",
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
