"use client";

/**
 * PlaygroundNav — left sidebar listing the current app + all registered
 * playgrounds. Collapses to a 48px icon rail.
 */

import { useState } from "react";
import { createPortal } from "react-dom";
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

// ── Shared sub-components ─────────────────────────────────────────────────────

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      display: "block",
      fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
      fontSize: 12,
      background: "#0D0F1A",
      color: "#C3CAD8",
      padding: "8px 12px",
      borderRadius: 7,
      whiteSpace: "pre",
      lineHeight: 1.6,
      marginTop: 6,
    }}>
      {children}
    </code>
  );
}

/** A slash command chip — shows the exact command to type in Claude */
function SkillCall({ command, args }: { command: string; args?: string }) {
  return (
    <div style={{
      marginTop: 8,
      padding: "9px 12px",
      borderRadius: 8,
      background: "color-mix(in srgb, var(--color-brand-purple) 10%, transparent)",
      border: "1px solid color-mix(in srgb, var(--color-brand-purple) 28%, transparent)",
      display: "flex",
      alignItems: "baseline",
      gap: 6,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-brand-purple)", letterSpacing: "0.04em", flexShrink: 0 }}>
        TYPE IN CLAUDE
      </span>
      <code style={{
        fontSize: 13,
        fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
        color: "var(--color-text-primary)",
      }}>
        /{command}{args ? <span style={{ color: "var(--color-text-muted)" }}> {args}</span> : null}
      </code>
    </div>
  );
}

// ── Instructions modal ────────────────────────────────────────────────────────

const STEPS = [
  {
    num: 1,
    title: "Register the playground",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          In your Claude chat, run the <strong style={{ color: "var(--color-text-primary)" }}>/new-playground</strong> skill.
          Give it a name, a one-line description, and who's working on it.
          Claude will add it to the registry and give you the exact commands to run in step 2.
        </p>
        <SkillCall command="new-playground" args='"Map View" "Explore adding a map to the accounts tab" Nate' />
      </>
    ),
  },
  {
    num: 2,
    title: "Create your branch in Terminal",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          Claude will give you the exact two commands to copy-paste. They'll look like this
          (using whatever slug it derived from your name):
        </p>
        <Code>{`git checkout -b playground/map-view\ngit push -u origin playground/map-view`}</Code>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5, marginTop: 8 }}>
          Once you push, Vercel automatically starts building a preview in the background — takes about 1–2 minutes.
        </p>
      </>
    ),
  },
  {
    num: 3,
    title: "Copy the preview URL from Vercel",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          Go to <strong style={{ color: "var(--color-text-primary)" }}>vercel.com</strong>, open the{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>halosight-prototype</strong> project, and
          click <strong style={{ color: "var(--color-text-primary)" }}>Deployments</strong> in the left sidebar.
          Find your branch in the list and wait for the status dot to turn green.
          Once it's green, click <strong style={{ color: "var(--color-text-primary)" }}>Visit</strong> and
          copy the URL from your browser's address bar.
        </p>
      </>
    ),
  },
  {
    num: 4,
    title: "Wire in the URL",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          Run the <strong style={{ color: "var(--color-text-primary)" }}>/playground-url</strong> skill and paste the URL as the argument.
          Claude will add it to the registry and push — this sidebar and the DevPanel on the right will
          now link directly to your playground.
        </p>
        <SkillCall command="playground-url" args="https://halosight-prototype-git-playground-map-view-xxx.vercel.app" />
      </>
    ),
  },
  {
    num: 5,
    title: "Build, then wrap up when you're done",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          You're live on a completely separate branch — nothing on the main app is affected. Build with Claude as usual.
          When you're finished, use <strong style={{ color: "var(--color-text-primary)" }}>/playground-status</strong> to update
          the badge in this sidebar:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
          <SkillCall command="playground-status" args='"Map View" review' />
          <SkillCall command="playground-status" args='"Map View" shipped' />
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5, marginTop: 8 }}>
          <strong style={{ color: "var(--color-text-secondary)" }}>Exploring</strong> = actively working on it (purple) ·{" "}
          <strong style={{ color: "var(--color-text-secondary)" }}>Review</strong> = ready for others to look at (orange) ·{" "}
          <strong style={{ color: "var(--color-text-secondary)" }}>Shipped</strong> = merged and live (green)
        </p>
      </>
    ),
  },
];

function InstructionsModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          overflowY: "auto",
          background: "var(--color-dark-primary)",
          borderRadius: 16,
          border: "1px solid var(--color-dark-tertiary)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          padding: "28px 28px 32px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              How to start a playground
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "4px 0 0" }}>
              Each playground is a git branch + Vercel preview. Three skills handle all the setup automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--color-dark-tertiary)",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            ×
          </button>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {STEPS.map(({ num, title, body }) => (
            <div key={num} style={{ display: "flex", gap: 14 }}>
              {/* Step number */}
              <div style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--color-brand-purple)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}>
                {num}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
                  {title}
                </p>
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
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
  const color = isCurrent ? "#2ECC71" : (status ? STATUS_COLOR[status] : "var(--color-text-secondary)");

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
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
        <span style={{ fontSize: isCurrent ? 12 : 10, color, flexShrink: 0, lineHeight: 1 }}>
          {isCurrent ? "★" : "●"}
        </span>
        <span style={{
          fontSize: 14,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {label}
        </span>
        {author && (
          <span style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--color-dark-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            flexShrink: 0,
          }}>
            {authorInitial(author)}
          </span>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: 12,
        color: "var(--color-text-muted)",
        lineHeight: 1.45,
        margin: "0 0 6px 17px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {description}
      </p>

      {/* Meta row */}
      {(status || startedAt) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 17 }}>
          {status && (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color,
              background: `color-mix(in srgb, ${color} 14%, transparent)`,
              borderRadius: 4,
              padding: "1px 6px",
            }}>
              {STATUS_LABEL[status]}
            </span>
          )}
          {startedAt && (
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
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
        fontSize: 13,
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
  const [showInstructions, setShowInstructions] = useState(false);

  // ── Collapsed rail ──────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <>
        <div style={{
          width: 48,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          alignSelf: "center",
          paddingTop: 4,
        }}>
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
              color: "var(--color-text-secondary)",
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            ▶
          </button>
          <RailDot color="#2ECC71" icon="★" isActive={isMain} href={CURRENT_APP_URL} title="Current App" />
          {PLAYGROUNDS.map(p => (
            <RailDot
              key={p.id}
              color={STATUS_COLOR[p.status]}
              icon="●"
              isActive={currentBranch === p.id}
              href={p.url + (p.routes?.[0]?.path ?? "")}
              title={p.name}
            />
          ))}
        </div>
        {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
      </>
    );
  }

  // ── Expanded ────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{
        width: 220,
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
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
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
              color: "var(--color-text-muted)",
              fontSize: 14,
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
            fontSize: 13,
            color: "var(--color-text-muted)",
            padding: "8px 12px",
            lineHeight: 1.55,
          }}>
            No playgrounds yet.
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
              href={p.url + (p.routes?.[0]?.path ?? "")}
            />
          ))
        )}

        {/* Footer: new playground button */}
        <div style={{ marginTop: 12, paddingLeft: 4, paddingRight: 4 }}>
          <button
            onClick={() => setShowInstructions(true)}
            style={{
              width: "100%",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              background: "var(--color-dark-secondary)",
              border: "1px solid var(--color-dark-tertiary)",
              borderRadius: 10,
              padding: "9px 0",
              cursor: "pointer",
              transition: "opacity 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            + New playground
          </button>
        </div>
      </div>

      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
    </>
  );
}
