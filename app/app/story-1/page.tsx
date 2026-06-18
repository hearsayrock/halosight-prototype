"use client";

/**
 * Story 1: Support Accounts + Leads in the Customer List and Search
 * Full desktop spec page — deliverables, options, and acceptance criteria.
 */

import { useState, useEffect } from "react";
import DecisionWidget from "@/components/decisions/DecisionWidget";

const BASE = process.env.NODE_ENV === "production"
  ? "https://halosight-prototype.vercel.app"
  : "http://localhost:3000";
const protoLink = (p: string) => `${BASE}${p}`;

// ─── Layout primitives ────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 72 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--color-brand-purple)", marginBottom: 24, paddingBottom: 12,
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
    built:    { label: "Built",           bg: "rgba(46,204,113,0.12)",   color: "#2ECC71" },
    decision: { label: "Decision needed", bg: "rgba(245,166,35,0.12)",   color: "#F5A623" },
    design:   { label: "Needs design",    bg: "rgba(139,146,255,0.12)",  color: "var(--color-brand-purple)" },
  };
  const s = map[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function ProtoLink({ path, label }: { path: string; label: string }) {
  return (
    <a href={protoLink(path)} target="_blank" rel="noopener noreferrer" style={{
      fontSize: 12, fontWeight: 600, color: "var(--color-brand-purple)", textDecoration: "none",
      padding: "3px 10px", borderRadius: 20, background: "rgba(139,146,255,0.1)",
    }}>
      {label} ↗
    </a>
  );
}

// ─── Design mock primitives ───────────────────────────────────────────────────

function MockScreen({ children, width = 300, label }: { children: React.ReactNode; width?: number; label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
      {label && <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", margin: 0 }}>{label}</p>}
      <div style={{
        width, background: "var(--color-background)", borderRadius: 16,
        border: "1px solid var(--color-dark-tertiary)", overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

function MockHeader({ title }: { title: string }) {
  return (
    <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid var(--color-dark-tertiary)" }}>
      <p style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", margin: 0, fontFamily: "Roboto Slab, Georgia, serif" }}>
        {title}
      </p>
    </div>
  );
}

function MockSearchBar({ query = "", active = false, pill, placeholder = "Search…" }: { query?: string; active?: boolean; pill?: string; placeholder?: string }) {
  return (
    <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1, display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px",
        borderRadius: 999, background: "var(--color-dark-secondary)",
        outline: active ? "1.5px solid var(--color-brand-purple)" : "none",
      }}>
        <svg width="15" height="15" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7.5" cy="7.5" r="6" stroke={active ? "var(--color-brand-purple)" : "var(--color-text-muted)"} strokeWidth="1.75" />
          <path d="M12 12L16 16" stroke={active ? "var(--color-brand-purple)" : "var(--color-text-muted)"} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 14, color: query ? "var(--color-text-primary)" : "var(--color-text-disabled)", flex: 1 }}>
          {query || placeholder}
        </span>
      </div>
      {pill && (
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-brand-purple)", background: "rgba(139,146,255,0.12)", borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>
          {pill}
        </span>
      )}
    </div>
  );
}

interface MockCardProps {
  name: string;
  meta?: string;
  type: "account" | "lead";
  owned?: boolean;
  sync?: "synced" | "waiting" | "needs-details" | "issue" | "none";
  lastVisited?: string;
  isLast?: boolean;
  restricted?: boolean;
  dim?: boolean;
}

function MockCard({ name, meta, type, owned = true, sync = "synced", lastVisited, isLast, restricted, dim }: MockCardProps) {
  const isAccount = type === "account";
  return (
    <div style={{
      padding: "11px 14px",
      borderBottom: isLast ? "none" : "1px solid var(--color-dark-tertiary)",
      opacity: dim ? 0.45 : 1,
      background: restricted ? "rgba(255,107,90,0.03)" : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: restricted ? "var(--color-text-muted)" : "var(--color-text-primary)", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </p>
          {meta && <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "0 0 6px" }}>{meta}</p>}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            {/* Type chip */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600,
              background: isAccount ? "rgba(139,146,255,0.12)" : "rgba(245,166,35,0.12)",
              color: isAccount ? "var(--color-brand-purple)" : "#F5A623",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: isAccount ? "var(--color-brand-purple)" : "#F5A623", flexShrink: 0 }} />
              {isAccount ? "Account" : "Lead"}
            </span>

            {/* Ownership */}
            {!owned && (
              <span style={{ padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(255,143,130,0.1)", color: "var(--color-brand-coral-light)" }}>
                Not yours
              </span>
            )}
            {owned && type === "account" && (
              <span style={{ padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: "var(--color-dark-secondary)", color: "var(--color-text-disabled)" }}>
                Yours
              </span>
            )}

            {/* Sync */}
            {sync === "synced"        && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(46,204,113,0.1)", color: "#2ECC71" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2ECC71" }} />Synced</span>}
            {sync === "waiting"       && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(245,166,35,0.1)", color: "#F5A623" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623" }} />Waiting to sync</span>}
            {sync === "needs-details" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(255,107,90,0.1)", color: "var(--color-brand-coral)" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-brand-coral)" }} />Needs details</span>}
            {sync === "issue"         && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "rgba(255,77,79,0.1)", color: "#FF4D4F" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4D4F" }} />Sync issue</span>}

            {/* Last visited */}
            {lastVisited && <span style={{ fontSize: 10, color: "var(--color-text-disabled)", marginLeft: 2 }}>Visited {lastVisited}</span>}
          </div>
        </div>

        {/* Right side */}
        {!restricted ? (
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
            <path d="M1 1L6 6L1 11" stroke="var(--color-text-disabled)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
            <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="var(--color-text-disabled)" strokeWidth="1.25"/>
            <path d="M4.5 6V4.5C4.5 3.12 5.62 2 7 2C8.38 2 9.5 3.12 9.5 4.5V6" stroke="var(--color-text-disabled)" strokeWidth="1.25" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      {restricted && (
        <p style={{ fontSize: 10, color: "var(--color-text-disabled)", margin: "5px 0 0" }}>
          View only · Contact admin to request access
        </p>
      )}
    </div>
  );
}

function MockGlobalSearchButton({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <div style={{ padding: "0 12px 10px" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "11px 16px", borderRadius: 999,
        background: "transparent",
        border: `1px solid ${unavailable ? "var(--color-dark-tertiary)" : "var(--color-dark-tertiary)"}`,
        opacity: unavailable ? 0.5 : 1,
      }}>
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke={unavailable ? "var(--color-text-disabled)" : "var(--color-text-secondary)"} strokeWidth="1.5"/>
          <path d="M9 5V9L11.5 11.5" stroke={unavailable ? "var(--color-text-disabled)" : "var(--color-text-secondary)"} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: unavailable ? "var(--color-text-disabled)" : "var(--color-text-primary)" }}>
          {unavailable ? "Global search unavailable" : "Search all companies"}
        </span>
      </div>
      {unavailable && (
        <p style={{ fontSize: 10, color: "var(--color-text-disabled)", textAlign: "center", margin: "6px 0 0" }}>
          Can't reach your CRM right now. You can still create a new record.
        </p>
      )}
    </div>
  );
}

function MockShimmerRow({ isLast }: { isLast?: boolean }) {
  return (
    <div style={{ padding: "11px 14px", borderBottom: isLast ? "none" : "1px solid var(--color-dark-tertiary)" }}>
      <div style={{ height: 14, width: "55%", borderRadius: 6, background: "var(--color-dark-tertiary)", marginBottom: 6 }} />
      <div style={{ height: 11, width: "35%", borderRadius: 6, background: "var(--color-dark-secondary)", marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ height: 18, width: 56, borderRadius: 20, background: "var(--color-dark-tertiary)" }} />
        <div style={{ height: 18, width: 40, borderRadius: 20, background: "var(--color-dark-secondary)" }} />
      </div>
    </div>
  );
}

function MockEmptyState({ label }: { label: string }) {
  return (
    <div style={{ padding: "32px 16px", textAlign: "center" }}>
      <p style={{ fontSize: 22, marginBottom: 8 }}>🔍</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>No results</p>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0 }}>{label}</p>
    </div>
  );
}

// ─── Option cards for decisions ───────────────────────────────────────────────

function OptionCard({
  label,
  recommended,
  description,
  children,
  note,
}: {
  label: string;
  recommended?: boolean;
  description: string;
  children?: React.ReactNode;
  note?: string;
}) {
  return (
    <div style={{
      background: "var(--color-dark-primary)",
      border: `1px solid ${recommended ? "rgba(139,146,255,0.4)" : "var(--color-dark-tertiary)"}`,
      borderRadius: 12,
      overflow: "hidden",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ padding: "14px 16px 12px", borderBottom: children ? "1px solid var(--color-dark-tertiary)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{label}</span>
          {recommended && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "rgba(139,146,255,0.15)", color: "var(--color-brand-purple)" }}>
              Recommended
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55, margin: 0 }}>{description}</p>
        {note && (
          <p style={{ fontSize: 11, color: "var(--color-text-disabled)", lineHeight: 1.5, margin: "8px 0 0", fontStyle: "italic" }}>{note}</p>
        )}
      </div>
      {children && (
        <div style={{ padding: "14px 16px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Chip palette ─────────────────────────────────────────────────────────────

const CHIPS = [
  { label: "Account",          dot: "#8B92FF", bg: "rgba(139,146,255,0.12)", color: "#8B92FF",  usage: "Record is a CRM account" },
  { label: "Lead",             dot: "#F5A623", bg: "rgba(245,166,35,0.12)",  color: "#F5A623",  usage: "Record is an unqualified lead" },
  { label: "Synced",           dot: "#2ECC71", bg: "rgba(46,204,113,0.10)",  color: "#2ECC71",  usage: "Record is live in your CRM" },
  { label: "Waiting to sync",  dot: "#F5A623", bg: "rgba(245,166,35,0.10)",  color: "#F5A623",  usage: "Captured locally, not yet pushed" },
  { label: "Needs details",    dot: "#FF6B5A", bg: "rgba(255,107,90,0.10)",  color: "#FF6B5A",  usage: "Missing required CRM fields" },
  { label: "Sync issue",       dot: "#FF4D4F", bg: "rgba(255,77,79,0.10)",   color: "#FF4D4F",  usage: "Push failed — action required" },
  { label: "Yours",            dot: undefined, bg: "var(--color-dark-secondary)", color: "var(--color-text-disabled)", usage: "Assigned to the logged-in rep" },
  { label: "Not yours",        dot: undefined, bg: "rgba(255,143,130,0.10)", color: "#FF8F82",  usage: "Assigned to another rep or unowned" },
];

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview",     label: "Overview" },
  { id: "decisions",    label: "Key Decisions" },
  { id: "chips",        label: "Chip Specs" },
  { id: "cards",        label: "Customer Cards" },
  { id: "search",       label: "Search States" },
  { id: "global",       label: "Global Search" },
  { id: "access",       label: "Access & Permissions" },
  { id: "criteria",     label: "Acceptance Criteria" },
];

function SidebarNav({ active }: { active: string }) {
  return (
    <nav style={{ position: "sticky", top: 48, width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 8, paddingLeft: 12 }}>
        Story 1
      </p>
      {NAV_ITEMS.map(item => (
        <a key={item.id} href={`#${item.id}`} style={{
          display: "block", fontSize: 13,
          fontWeight: active === item.id ? 600 : 400,
          color: active === item.id ? "var(--color-text-primary)" : "var(--color-text-muted)",
          background: active === item.id ? "var(--color-dark-secondary)" : "transparent",
          borderLeft: `3px solid ${active === item.id ? "var(--color-brand-purple)" : "transparent"}`,
          padding: "6px 12px", borderRadius: "0 8px 8px 0", textDecoration: "none", transition: "all 0.1s",
        }}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

// ─── Deliverable heading ──────────────────────────────────────────────────────

function DeliverableHeading({
  name,
  status,
  protoPath,
}: {
  name: string;
  status: "built" | "decision" | "design";
  protoPath?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>{name}</h3>
      <StatusBadge status={status} />
      {protoPath && <ProtoLink path={protoPath} label="See in prototype" />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Story1Page() {
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
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Story 1</span>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <a href="/story-2" style={{ fontSize: 14, color: "var(--color-text-muted)", textDecoration: "none" }}>Story 2</a>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <a href="/story-3" style={{ fontSize: 14, color: "var(--color-text-muted)", textDecoration: "none" }}>Story 3</a>
          <span style={{ color: "var(--color-dark-tertiary)" }}>/</span>
          <a href="/story-4" style={{ fontSize: 14, color: "var(--color-text-muted)", textDecoration: "none" }}>Story 4</a>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href={protoLink("/accounts")} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-brand-purple)", textDecoration: "none", padding: "4px 12px", background: "rgba(139,146,255,0.1)", borderRadius: 20 }}>
            Open prototype ↗
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 40px", display: "flex", gap: 56, alignItems: "flex-start" }}>
        <SidebarNav active={active} />
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          <Section id="overview" title="Overview">
            <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
                Story 1: Support Accounts + Leads in the Customer List and Search
              </h1>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, margin: "0 0 18px" }}>
                A field rep needs one place to find the right customer record — whether it's an existing account or a new lead —
                so they can quickly start a capture without thinking in CRM object terms.
                This story defines the combined customer list, the search experience, all result card states,
                and how to visually communicate record type, ownership, and sync status at a glance.
              </p>

              {/* Progress overview */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Decisions needed", value: "6", color: "#F5A623", bg: "rgba(245,166,35,0.1)" },
                  { label: "Needs design",      value: "9", color: "var(--color-brand-purple)", bg: "rgba(139,146,255,0.1)" },
                  { label: "Already built",     value: "6", color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What's built vs outstanding */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, padding: "16px 18px" }}>
                <Eyebrow>Already built in prototype</Eyebrow>
                {[
                  "Account list with real-time search",
                  "Account result card (name, distance, city, type badge)",
                  "Account type filter (sold-to, distributor, etc.)",
                  "Last visited filter",
                  "Global search entry + loading + results",
                  "No results empty state (your accounts)",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < 5 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <span style={{ color: "#2ECC71", flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, padding: "16px 18px" }}>
                <Eyebrow>Still outstanding</Eyebrow>
                {[
                  "Umbrella label (what do we call this list?)",
                  "Leads in the customer list",
                  "Lead card design",
                  "Ownership chip",
                  "Sync / source status chip",
                  "Permission-restricted result state",
                  "Unowned account result variant",
                  "Global search unavailable state",
                  "Missing metadata card variant",
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

            {/* Decision 1: Umbrella label */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 12 }}>
                <DeliverableHeading name="1. What is the umbrella label?" status="decision" />
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                  The nav tab, page title, and search bar placeholder all need a word for "the combined list of accounts and leads."
                  This is a brand-level decision — pick one and use it everywhere.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <OptionCard
                  label="Customers"
                  recommended
                  description="Intuitive for a sales rep — anyone you've sold to or are trying to sell to is a customer. Doesn't imply CRM structure."
                  note="Works regardless of CRM object type. Safe for leads and accounts alike."
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ height: 32, display: "flex", alignItems: "center", background: "var(--color-dark-secondary)", borderRadius: 8, padding: "0 12px" }}>
                      <span style={{ fontSize: 13, color: "var(--color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif", fontWeight: 700 }}>Customers</span>
                    </div>
                    <div style={{ height: 32, display: "flex", alignItems: "center", background: "var(--color-dark-secondary)", borderRadius: 8, padding: "0 12px" }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-disabled)" }}>Search customers…</span>
                    </div>
                  </div>
                </OptionCard>
                <OptionCard
                  label="Companies"
                  description="Neutral and non-CRM. Implies an entity you're visiting at a physical location — maps well to the field rep context."
                  note="Slightly misleading if a lead is a person, not a company."
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ height: 32, display: "flex", alignItems: "center", background: "var(--color-dark-secondary)", borderRadius: 8, padding: "0 12px" }}>
                      <span style={{ fontSize: 13, color: "var(--color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif", fontWeight: 700 }}>Companies</span>
                    </div>
                    <div style={{ height: 32, display: "flex", alignItems: "center", background: "var(--color-dark-secondary)", borderRadius: 8, padding: "0 12px" }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-disabled)" }}>Search companies…</span>
                    </div>
                  </div>
                </OptionCard>
                <OptionCard
                  label="Records"
                  description="CRM-accurate but abstract. A field rep wouldn't naturally say 'find me a record.' Risks feeling like an internal tool."
                  note="Not recommended — too technical for a mobile field app."
                />
                <OptionCard
                  label="Book of Business"
                  description="Common in field sales — reps often say 'my book.' Works for accounts, less natural for leads. Too long for UI labels."
                  note="Better as a section concept than a UI label."
                />
              </div>
              <DecisionWidget storyId="story-1" decisionKey="umbrella-label" options={["Customers", "Companies", "Records", "Book of Business"]} />
            </div>

            {/* Decision 2: Together or separate */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 12 }}>
                <DeliverableHeading name="2. Should accounts and leads appear in the same list?" status="decision" />
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                  Reps need to find records fast. The question is whether a unified list (with visual distinction) is clearer
                  than a tab-separated view.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard
                  label="Option A — One unified list"
                  recommended
                  description="Accounts and leads appear together, sorted and filtered the same way. Record type chip on each card tells you what it is. Less cognitive overhead — one place to search, one list to scroll."
                  note="Recommended for v1. Easier to implement, easier to use."
                >
                  <MockScreen label="" width={268}>
                    <MockSearchBar query="Acme" active />
                    <div style={{ padding: "4px 0" }}>
                      <MockCard name="Acme Corp" meta="2.1 mi · Flagstaff, AZ" type="account" sync="synced" lastVisited="2d ago" />
                      <MockCard name="Acme Logistics" meta="8 mi · Phoenix, AZ" type="lead" owned={false} sync="waiting" isLast />
                    </div>
                  </MockScreen>
                </OptionCard>
                <OptionCard
                  label="Option B — Tabbed list (Accounts | Leads)"
                  description="Two separate tabs. Clearer separation of record types, but doubles the places you have to search. A rep looking for 'Acme' would have to check both tabs."
                  note="Adds friction. Not recommended unless leads need very different sorting/filtering rules."
                >
                  <MockScreen label="" width={268}>
                    {/* Fake tabs */}
                    <div style={{ display: "flex", borderBottom: "1px solid var(--color-dark-tertiary)" }}>
                      {["Accounts", "Leads"].map((t, i) => (
                        <div key={t} style={{
                          flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: i === 0 ? 700 : 400,
                          color: i === 0 ? "var(--color-text-primary)" : "var(--color-text-muted)",
                          borderBottom: i === 0 ? "2px solid var(--color-brand-purple)" : "2px solid transparent",
                        }}>
                          {t}
                        </div>
                      ))}
                    </div>
                    <MockCard name="Acme Corp" meta="2.1 mi · Flagstaff, AZ" type="account" sync="synced" lastVisited="2d ago" />
                    <MockCard name="ProFleet Corp" meta="5 mi · Phoenix, AZ" type="account" sync="synced" isLast />
                  </MockScreen>
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-1" decisionKey="unified-vs-tabbed" options={["Option A — One unified list", "Option B — Tabbed list"]} />
            </div>

            {/* Decision 3: Global search on by default */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 12 }}>
                <DeliverableHeading name="3. Is global search on by default?" status="decision" />
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                  Global search queries all records in the company's CRM, not just the rep's assigned accounts.
                  It's useful for finding leads or unowned accounts, but requires an API call and may surface records the rep can't act on.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard
                  label="Option A — Hidden until triggered"
                  recommended
                  description="Assigned results show first. A secondary 'Search all companies' button appears after no results or as a secondary action. Matches current prototype behavior."
                  note="Lower noise, more intentional. Recommended."
                />
                <OptionCard
                  label="Option B — Always on"
                  description="Every search queries both assigned and all-company simultaneously. Results are labeled with a section header ('Your accounts' vs 'All companies')."
                  note="More results but slower and noisier. Consider if reps have small books of business."
                />
              </div>
              <DecisionWidget storyId="story-1" decisionKey="global-search-default" options={["Option A — Hidden until triggered", "Option B — Always on"]} />
            </div>

            {/* Decision 4: Global search unavailable */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 12 }}>
                <DeliverableHeading name="4. What happens when global search is unavailable?" status="decision" />
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                  If the CRM is unreachable or offline, global search can't be performed. The rep should still be able to create a new record.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard
                  label="Option A — Show disabled state with message"
                  recommended
                  description="The 'Search all companies' button is shown but grayed out with a short explanation. Create new record is still available below."
                >
                  <MockScreen width={268}>
                    <MockSearchBar query="Acme" />
                    <MockEmptyState label='"Acme" not in your accounts' />
                    <MockGlobalSearchButton unavailable />
                  </MockScreen>
                </OptionCard>
                <OptionCard
                  label="Option B — Hide the button entirely"
                  description="When global search is unavailable, the button is removed and replaced with a brief inline notice. Cleaner but less transparent about why the option is missing."
                >
                  <MockScreen width={268}>
                    <MockSearchBar query="Acme" />
                    <MockEmptyState label='"Acme" not in your accounts' />
                    <div style={{ padding: "0 14px 12px" }}>
                      <p style={{ fontSize: 11, color: "var(--color-text-disabled)", textAlign: "center", margin: 0 }}>
                        Global search unavailable — create a new record instead
                      </p>
                    </div>
                  </MockScreen>
                </OptionCard>
              </div>
              <DecisionWidget storyId="story-1" decisionKey="global-search-unavailable" options={["Option A — Disabled state with message", "Option B — Hide the button"]} />
            </div>

            {/* Decision 5: Permission-restricted results */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 12 }}>
                <DeliverableHeading name="5. What happens when a result is permission-restricted?" status="decision" />
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                  A record may appear in global search results that the rep doesn't have write access to.
                  They can see it exists, but can they open it or capture against it?
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard
                  label="Option A — Show with lock, view-only"
                  recommended
                  description="Result appears in the list with a lock icon, dimmed chevron, and a short explanation. Rep can open a read-only view but cannot log a visit."
                >
                  <MockScreen width={268}>
                    <MockCard name="Restricted Tire Co" meta="4 mi · Tucson, AZ" type="account" owned={false} sync="synced" restricted isLast />
                  </MockScreen>
                </OptionCard>
                <OptionCard
                  label="Option B — Show grayed out, no tap"
                  description="Result is visible but fully non-interactive. Conveys the record exists but gives no actionable path. Relies on rep knowing to contact admin."
                >
                  <MockScreen width={268}>
                    <MockCard name="Restricted Tire Co" meta="4 mi · Tucson, AZ" type="account" owned={false} sync="synced" dim isLast />
                  </MockScreen>
                </OptionCard>
                <OptionCard
                  label="Option C — Hide completely"
                  description="Restricted records are filtered out before the rep sees them. Simpler UI but may cause confusion when a rep knows a customer exists but can't find them."
                />
              </div>
              <DecisionWidget storyId="story-1" decisionKey="permission-restricted" options={["Option A — Show with lock", "Option B — Show grayed out", "Option C — Hide completely"]} />
            </div>

            {/* Decision 6: Metadata on cards */}
            <div style={{ marginBottom: 0 }}>
              <div style={{ marginBottom: 12 }}>
                <DeliverableHeading name="6. What metadata is required on each result card?" status="decision" />
              </div>
              <div style={{ background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                {[
                  { field: "Name", account: "Always", lead: "Always", note: "" },
                  { field: "Address / location", account: "Show if available", lead: "Show if available", note: "Distance if GPS available, city+state otherwise" },
                  { field: "Record type (Account/Lead)", account: "Always", lead: "Always", note: "Via chip — distinguishes lead from account at a glance" },
                  { field: "Ownership", account: "Always", lead: "Always", note: "'Yours' (subtle) or 'Not yours' (coral)" },
                  { field: "Sync / source status", account: "Always", lead: "Always", note: "Synced · Waiting · Needs details · Issue" },
                  { field: "Last visited", account: "Show if available", lead: "Omit", note: "Leads haven't been visited yet by definition" },
                  { field: "Lead source", account: "Omit", lead: "Optional", note: "e.g. 'Cold call', 'Trade show' — only if useful for rep context" },
                ].map((row, i, arr) => (
                  <div key={row.field} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 2fr", gap: 0, borderBottom: i < arr.length - 1 ? "1px solid var(--color-dark-tertiary)" : "none" }}>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.field}</div>
                    <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--color-text-muted)", borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.account}</div>
                    <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--color-text-muted)", borderRight: "1px solid var(--color-dark-tertiary)" }}>{row.lead}</div>
                    <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--color-text-disabled)", fontStyle: "italic" }}>{row.note}</div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 2fr", gap: 0, background: "var(--color-dark-secondary)" }}>
                  {["Field", "Account", "Lead", "Notes"].map(h => (
                    <div key={h} style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", borderRight: h !== "Notes" ? "1px solid var(--color-dark-tertiary)" : "none" }}>{h}</div>
                  ))}
                </div>
              </div>
              <DecisionWidget storyId="story-1" decisionKey="card-metadata" options={["Approved as-is", "Needs changes"]} />
            </div>

          </Section>

          {/* ── CHIP SPECS ────────────────────────────────────────────────── */}
          <Section id="chips" title="Chip Specifications">
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
              All chips are pill-shaped (border-radius: 20px). Leading dot (6×6px circle) for chips that communicate status.
              No dot for relational chips (Yours / Not yours). Font: 10–11px, weight 600.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CHIPS.map(chip => (
                <div key={chip.label} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 10,
                }}>
                  {/* Rendered chip */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: chip.bg, color: chip.color, whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {chip.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: chip.dot, flexShrink: 0 }} />}
                    {chip.label}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.45 }}>{chip.usage}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 8, background: "rgba(139,146,255,0.06)", border: "1px solid rgba(139,146,255,0.15)" }}>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: "var(--color-text-secondary)" }}>Stacking order on a card:</strong>{" "}
                Type chip (Account/Lead) → Ownership chip → Sync chip → Last visited text.
                Never show more than 3 chips on a single card — truncate with a count badge if needed (rare case).
              </p>
            </div>
          </Section>

          {/* ── CUSTOMER CARDS ────────────────────────────────────────────── */}
          <Section id="cards" title="Customer Cards">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Account card" status="built" protoPath="/accounts" />
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                Largely built. Needs ownership chip and sync chip added to the existing row.
              </p>
              <MockScreen label="Account — owned, synced, recently visited" width={380}>
                <MockCard name="Jack's Tire & Oil" meta="1.2 mi · Elko, NV" type="account" owned sync="synced" lastVisited="3d ago" isLast />
              </MockScreen>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Lead card" status="design" />
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                Visually similar to the account card. Key differences: amber Lead chip instead of purple Account chip,
                no "Last visited" (leads haven't been visited), and may be unowned.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <MockScreen label="Lead — yours, waiting to sync">
                  <MockCard name="Southwest Fleet Services" meta="6 mi · Tucson, AZ" type="lead" owned sync="waiting" isLast />
                </MockScreen>
                <MockScreen label="Lead — not assigned to you">
                  <MockCard name="Riverbend Parts & Supply" meta="12 mi · Phoenix, AZ" type="lead" owned={false} sync="synced" isLast />
                </MockScreen>
                <MockScreen label="Lead — needs details before sync">
                  <MockCard name="New Lead" meta="Address unknown" type="lead" owned sync="needs-details" isLast />
                </MockScreen>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Missing metadata card" status="design" />
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                When a record has no address or location data, the metadata line is omitted. The card still shows type, ownership, and sync status.
              </p>
              <MockScreen label="Account — no address" width={320}>
                <MockCard name="Central Valley Automotive" type="account" owned sync="needs-details" isLast />
              </MockScreen>
            </div>

            <div>
              <DeliverableHeading name="Unowned account search result" status="design" />
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                Appears in global search results when the record is a real CRM account but isn't assigned to the current rep.
                Still tappable — rep can view the account and capture against it, but ownership is clearly flagged.
              </p>
              <MockScreen label="Account — assigned to another rep" width={380}>
                <MockCard name="ProFleet Glendale Store" meta="18 mi · Glendale, AZ" type="account" owned={false} sync="synced" lastVisited="1mo ago" isLast />
              </MockScreen>
            </div>
          </Section>

          {/* ── SEARCH STATES ─────────────────────────────────────────────── */}
          <Section id="search" title="Search States">
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
              These are the states for the primary (assigned) search — the rep's own accounts and leads.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

              <MockScreen label="Default — no query" width={260}>
                <MockHeader title="Customers" />
                <MockSearchBar placeholder="Search customers…" />
                <div style={{ padding: "6px 0" }}>
                  <MockCard name="Jack's Tire & Oil" meta="1.2 mi · Elko, NV" type="account" owned sync="synced" lastVisited="3d ago" />
                  <MockCard name="ProFleet Corp" meta="5 mi · Phoenix, AZ" type="account" owned sync="synced" lastVisited="1wk ago" />
                  <MockCard name="Southwest Fleet" meta="6 mi · Tucson, AZ" type="lead" owned sync="waiting" isLast />
                </div>
              </MockScreen>

              <MockScreen label="Loading — search in flight" width={260}>
                <MockHeader title="Customers" />
                <MockSearchBar query="acme" active />
                <div style={{ padding: "4px 0" }}>
                  <MockShimmerRow />
                  <MockShimmerRow />
                  <MockShimmerRow isLast />
                </div>
              </MockScreen>

              <MockScreen label="Results — mixed types" width={260}>
                <MockHeader title="Customers" />
                <MockSearchBar query="acme" active />
                <div style={{ padding: "2px 0 4px", borderBottom: "1px solid var(--color-dark-tertiary)" }}>
                  <div style={{ padding: "4px 14px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)" }}>
                      Your Customers · 2
                    </span>
                  </div>
                  <MockCard name="Acme Corp" meta="2.1 mi · Flagstaff, AZ" type="account" owned sync="synced" lastVisited="2d ago" />
                  <MockCard name="Acme Logistics" meta="8 mi · Phoenix, AZ" type="lead" owned sync="waiting" isLast />
                </div>
              </MockScreen>

              <MockScreen label="No results — in your accounts" width={260}>
                <MockHeader title="Customers" />
                <MockSearchBar query="canyon co" active />
                <MockEmptyState label='"canyon co" not in your customers' />
              </MockScreen>

            </div>
          </Section>

          {/* ── GLOBAL SEARCH ─────────────────────────────────────────────── */}
          <Section id="global" title="Global Search States">
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
              Global search queries all records in the organization's CRM — not just the rep's assigned customers.
              It appears as a secondary action after assigned search, and its results are visually distinguished.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

              <MockScreen label="Entry — 'Search all' button" width={260}>
                <MockSearchBar query="canyon co" />
                <MockEmptyState label='"canyon co" not in your customers' />
                <div style={{ padding: "0 12px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 999, border: "1px solid var(--color-dark-tertiary)" }}>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7" stroke="var(--color-text-secondary)" strokeWidth="1.5"/>
                      <path d="M5.5 9H12.5M9 5.5V12.5" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>Search all companies</span>
                  </div>
                </div>
              </MockScreen>

              <MockScreen label="Loading — global search in flight" width={260}>
                <MockSearchBar query="canyon co" active pill="ALL" />
                <div style={{ padding: "4px 0" }}>
                  <MockShimmerRow />
                  <MockShimmerRow />
                  <MockShimmerRow isLast />
                </div>
              </MockScreen>

              <MockScreen label="Results — global + assigned" width={260}>
                <MockSearchBar query="canyon co" active pill="ALL" />
                <div style={{ borderBottom: "1px solid var(--color-dark-tertiary)" }}>
                  <div style={{ padding: "4px 14px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)" }}>All Companies · 2</span>
                  </div>
                  <MockCard name="Canyon Country Motors" meta="22 mi · Sedona, AZ" type="account" owned={false} sync="synced" />
                  <MockCard name="Canyon Co Trucking" meta="31 mi · Williams, AZ" type="account" owned={false} sync="synced" isLast />
                </div>
              </MockScreen>

              <MockScreen label="Unavailable — CRM unreachable" width={260}>
                <MockSearchBar query="canyon co" />
                <MockEmptyState label='"canyon co" not in your customers' />
                <MockGlobalSearchButton unavailable />
              </MockScreen>

            </div>
          </Section>

          {/* ── ACCESS & PERMISSIONS ──────────────────────────────────────── */}
          <Section id="access" title="Access & Permission States">

            <div style={{ marginBottom: 32 }}>
              <DeliverableHeading name="Permission-restricted search result" status="design" />
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
                A record the rep can see in global search but doesn't have write access to.
                Recommendation: show the result with a lock icon and a one-line explanation.
                The rep can tap to view read-only detail but cannot start a capture.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <MockScreen label="In search results" width={340}>
                  <MockSearchBar query="central valley" active pill="ALL" />
                  <div style={{ padding: "4px 0 0" }}>
                    <div style={{ padding: "4px 14px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)" }}>All Companies</span>
                    </div>
                    <MockCard name="Central Valley Auto" meta="14 mi · Fresno, CA" type="account" owned={false} sync="synced" restricted isLast />
                  </div>
                </MockScreen>
              </div>
            </div>

          </Section>

          {/* ── ACCEPTANCE CRITERIA ───────────────────────────────────────── */}
          <Section id="criteria" title="Acceptance Criteria">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "A user can see accounts and leads in the same customer/search experience.",
                "A user can tell whether a result is an account or a lead (via type chip).",
                "A user can tell whether a result belongs to them or another rep (via ownership chip).",
                "A user can tell whether a result is synced, waiting to sync, needs details, or has a sync issue (via sync chip).",
                "Expanded/global search is visually secondary to assigned search (triggered, not default).",
                "If global search is unavailable, the UI shows a clear fallback state — the rep is not left stranded.",
                "If a result is permission-restricted, the user understands what they can and cannot do (view-only vs. capture).",
                "Both assigned search and global search have loading states.",
                "Dev has a single reusable customer/result card pattern and a documented chip rule set.",
                "Search works for both accounts and leads — a rep searching for any customer finds it in one place.",
              ].map((criterion, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
                  background: "var(--color-dark-primary)", border: "1px solid var(--color-dark-tertiary)", borderRadius: 8,
                }}>
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
