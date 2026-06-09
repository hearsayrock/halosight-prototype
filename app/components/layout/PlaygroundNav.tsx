"use client";

/**
 * PlaygroundNav — left sidebar listing the current app + all registered
 * playgrounds. Collapses to a 48px icon rail.
 */

import { PLAYGROUNDS, CURRENT_APP_URL, type PlaygroundStatus } from "@/lib/playgrounds.config";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<PlaygroundStatus, string> = {
  exploring: "var(--color-brand-purple)",
  review:    "var(--color-brand-coral)",
  shipped:   "#2ECC71",
};

const STATUS_LABEL: Record<PlaygroundStatus, string> = {
  exploring: "Exploring",
  review:    "Review",
  shipped:   "Shipped",
};

function relativeDate(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function authorInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

// ── Expanded nav item ─────────────────────────────────────────────────────────

function NavItem({
  label,
  description,
  author,
  status,
  startedAt,
  isCurrent,
  isActive,
  href,
}: {
  label: string;
  description: string;
  author?: string;
  status?: PlaygroundStatus;
  startedAt?: string;
  isCurrent?: boolean;
  isActive: boolean;
  href: string;
}) {
  const color = isCurrent ? "#2ECC71" : (status ? STATUS_COLOR[status] : "var(--color-text-muted)");

  return (
    <a
      href={href}
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 10,
        background: isActive ? "var(--color-dark-secondary)" : "transparent",
        textDecoration: "none",
        transition: "background 0.12s",
        borderLeft: `3px solid ${isActive ? color : "transparent"}`,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
        {/* Status dot / star */}
        <span style={{ fontSize: isCurrent ? 11 : 8, color, flexShrink: 0, lineHeight: 1 }}>
          {isCurrent ? "★" : "●"}
        </span>

        {/* Name */}
        <span style={{
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {label}
        </span>

        {/* Author initial */}
        {author && (
          <span style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "var(--color-dark-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--color-text-muted)",
            flexShrink: 0,
          }}>
            {authorInitial(author)}
          </span>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: 11,
        color: "var(--color-text-disabled)",
        lineHeight: 1.4,
        margin: "0 0 5px 15px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {description}
      </p>

      {/* Meta row */}
      {(status || startedAt) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 15 }}>
          {status && (
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              borderRadius: 4,
              padding: "1px 5px",
            }}>
              {STATUS_LABEL[status]}
            </span>
          )}
          {startedAt && (
            <span style={{ fontSize: 10, color: "var(--color-text-disabled)" }}>
              {relativeDate(startedAt)}
            </span>
          )}
        </div>
      )}
    </a>
  );
}

// ── Collapsed rail dot ────────────────────────────────────────────────────────

function RailDot({
  color,
  icon,
  isActive,
  href,
  title,
}: {
  color: string;
  icon: string;
  isActive: boolean;
  href: string;
  title: string;
}) {
  return (
    <a
      href={href}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: isActive ? "var(--color-dark-secondary)" : "transparent",
        border: isActive ? `2px solid ${color}` : "2px solid transparent",
        fontSize: 12,
        color,
        textDecoration: "none",
        transition: "all 0.12s",
        flexShrink: 0,
      }}
    >
      {icon}
    </a>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  currentBranch: string;
}

export default function PlaygroundNav({ collapsed, onToggle, currentBranch }: Props) {
  const isMain = currentBranch === "main" || currentBranch === "local";
  const activePlayground = PLAYGROUNDS.find(p => p.id === currentBranch);

  // ── Collapsed rail ──────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div style={{
        width: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        alignSelf: "center",
        paddingTop: 4,
      }}>
        {/* Toggle */}
        <button
          onClick={onToggle}
          title="Expand playground nav"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--color-dark-secondary)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          ▶
        </button>

        {/* Current app dot */}
        <RailDot
          color="#2ECC71"
          icon="★"
          isActive={isMain}
          href={CURRENT_APP_URL}
          title="Current App"
        />

        {/* Playground dots */}
        {PLAYGROUNDS.map(p => (
          <RailDot
            key={p.id}
            color={STATUS_COLOR[p.status]}
            icon="●"
            isActive={currentBranch === p.id}
            href={p.url}
            title={p.name}
          />
        ))}
      </div>
    );
  }

  // ── Expanded ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: 210,
      alignSelf: "center",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 12,
        paddingRight: 4,
        marginBottom: 8,
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-disabled)",
        }}>
          Playgrounds
        </span>
        <button
          onClick={onToggle}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-disabled)",
            fontSize: 13,
          }}
          title="Collapse"
        >
          ◀
        </button>
      </div>

      {/* Current App — always first */}
      <NavItem
        label="Current App"
        description="The baseline prototype with all shipped features."
        isCurrent
        isActive={isMain}
        href={CURRENT_APP_URL}
      />

      {/* Divider */}
      {PLAYGROUNDS.length > 0 && (
        <div style={{ height: 1, background: "var(--color-dark-tertiary)", margin: "6px 12px" }} />
      )}

      {/* Playgrounds */}
      {PLAYGROUNDS.length === 0 ? (
        <p style={{
          fontSize: 11,
          color: "var(--color-text-disabled)",
          padding: "8px 12px",
          lineHeight: 1.5,
        }}>
          No playgrounds yet.{" "}
          <br />
          Start one with the instructions below.
        </p>
      ) : (
        PLAYGROUNDS.map(p => (
          <NavItem
            key={p.id}
            label={p.name}
            description={p.description}
            author={p.author}
            status={p.status}
            startedAt={p.startedAt}
            isActive={currentBranch === p.id}
            href={p.url}
          />
        ))
      )}

      {/* New playground instructions */}
      <div style={{
        marginTop: 12,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px dashed var(--color-dark-tertiary)",
      }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-disabled)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Start a playground
        </p>
        <ol style={{ margin: 0, padding: "0 0 0 14px", display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            <>Add entry to <code style={{ fontSize: 9, background: "var(--color-dark-tertiary)", padding: "1px 4px", borderRadius: 3 }}>playgrounds.config.ts</code></>,
            <><code style={{ fontSize: 9, background: "var(--color-dark-tertiary)", padding: "1px 4px", borderRadius: 3 }}>git checkout -b playground/&lt;id&gt;</code></>,
            <>Push → copy Vercel preview URL → paste into config</>,
          ].map((step, i) => (
            <li key={i} style={{ fontSize: 10, color: "var(--color-text-disabled)", lineHeight: 1.45 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
