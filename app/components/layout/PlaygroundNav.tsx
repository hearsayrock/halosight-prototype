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

// ── Code snippet ──────────────────────────────────────────────────────────────

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

// ── Instructions modal ────────────────────────────────────────────────────────

const STEPS = [
  {
    num: 1,
    title: "Add the playground to the registry",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          Open <code style={{ fontSize: 12, background: "#0D0F1A", padding: "1px 6px", borderRadius: 4, color: "#C3CAD8" }}>app/lib/playgrounds.config.ts</code> on{" "}
          <strong>main</strong> and add an entry to the <code style={{ fontSize: 12, background: "#0D0F1A", padding: "1px 6px", borderRadius: 4, color: "#C3CAD8" }}>PLAYGROUNDS</code> array:
        </p>
        <Code>{`{
  id: "playground/your-slug",   // must match your branch name
  name: "Your Feature Name",
  description: "One sentence on what you're exploring.",
  url: "",                       // fill in after step 4
  author: "Nate",
  status: "exploring",
  startedAt: "${new Date().toISOString().slice(0, 10)}",
  // routes: [{ label: "Screen", path: "/path" }],
}`}</Code>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5, marginTop: 8 }}>
          Commit this to <strong>main</strong> first so the registry is up to date before you branch.
        </p>
      </>
    ),
  },
  {
    num: 2,
    title: "Create and push the branch",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          The branch name must match the <code style={{ fontSize: 12, background: "#0D0F1A", padding: "1px 6px", borderRadius: 4, color: "#C3CAD8" }}>id</code> you used in step 1 exactly.
        </p>
        <Code>{`git checkout -b playground/your-slug
git push -u origin playground/your-slug`}</Code>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5, marginTop: 8 }}>
          Vercel will automatically detect the new branch and start building a preview deployment (~1–2 min).
        </p>
      </>
    ),
  },
  {
    num: 3,
    title: "Copy the Vercel preview URL",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          Go to <strong>vercel.com → halosight-prototype → Deployments</strong>. Find the deployment for your branch, wait for it to go green, click it, and copy the URL from the browser bar. It will look like:
        </p>
        <Code>{`halosight-prototype-git-playground-your-slug-xxx.vercel.app`}</Code>
      </>
    ),
  },
  {
    num: 4,
    title: "Paste the URL back into the config",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          Back in <code style={{ fontSize: 12, background: "#0D0F1A", padding: "1px 6px", borderRadius: 4, color: "#C3CAD8" }}>playgrounds.config.ts</code>, fill in the <code style={{ fontSize: 12, background: "#0D0F1A", padding: "1px 6px", borderRadius: 4, color: "#C3CAD8" }}>url</code> field with the preview URL, commit, and push. This nav and the DevPanel will now link to your playground.
        </p>
        <Code>{`url: "https://halosight-prototype-git-playground-your-slug-xxx.vercel.app",`}</Code>
      </>
    ),
  },
  {
    num: 5,
    title: "Build your feature",
    body: (
      <>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "6px 0" }}>
          You're live on the branch. Make your changes freely — nothing on <strong>main</strong> is affected. When you're ready:
        </p>
        <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            <>Set <code style={{ fontSize: 12, background: "#0D0F1A", padding: "1px 6px", borderRadius: 4, color: "#C3CAD8" }}>status: "review"</code> to flag it for review.</>,
            <>Set <code style={{ fontSize: 12, background: "#0D0F1A", padding: "1px 6px", borderRadius: 4, color: "#C3CAD8" }}>status: "shipped"</code> once it's merged to main.</>,
            <>Add <code style={{ fontSize: 12, background: "#0D0F1A", padding: "1px 6px", borderRadius: 4, color: "#C3CAD8" }}>routes</code> to the config for quick-jump buttons in the DevPanel — super useful for jumping directly to the screen you're working on.</>,
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              {item}
            </li>
          ))}
        </ul>
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
              Each playground is a git branch + Vercel preview deployment.
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
              href={p.url}
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
              href={p.url}
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
