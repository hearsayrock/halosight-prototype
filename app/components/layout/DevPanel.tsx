"use client";

/**
 * DevPanel — prototype playground sidebar (right side).
 * Sits next to the phone frame on desktop. Not rendered in the phone UI.
 * Provides: quick-jump nav to every screen, device size toggle, demo reset.
 * Collapses to a 28px strip.
 *
 * When viewing a playground branch, routes are sourced from that playground's
 * `routes` array (if defined) with the default NAV appended below it.
 */

import { usePathname, useRouter } from "next/navigation";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import { useCapture } from "@/lib/context/CaptureContext";
import { PLAYGROUNDS, type PlaygroundRoute } from "@/lib/playgrounds.config";

export type DeviceSize = "se" | "14" | "max";

interface Props {
  deviceSize: DeviceSize;
  onDeviceSize: (s: DeviceSize) => void;
  collapsed: boolean;
  onToggle: () => void;
}

// ── Default nav config ────────────────────────────────────────────────────────

const DEFAULT_NAV = [
  {
    group: "Root",
    routes: [
      { label: "Home",      path: "/accounts" },
      { label: "Accounts",  path: "/accounts" },
      { label: "All Items", path: "/tasks" },
      { label: "Profile",   path: "/profile" },
    ],
  },
  {
    group: "Accounts",
    routes: [
      { label: "Jack's Tire",       path: "/accounts/jacks-tire-elko" },
      { label: "ProFleet Corp",     path: "/accounts/profleet-corp" },
      { label: "Cedar City",        path: "/accounts/walmart-cedar-city" },
      { label: "Innovative Tech",   path: "/accounts/innovative-tech-tucson" },
      { label: "No data (empty)",   path: "/accounts/profleet-glendale-1" },
    ],
  },
  {
    group: "Detail",
    routes: [
      { label: "Activity + AI",     path: "/accounts/jacks-tire-elko/activity/ja-1" },
      { label: "Activity (ops)",    path: "/accounts/walmart-cedar-city/activity/wc-1" },
      { label: "Action Item",       path: "/accounts/jacks-tire-elko/action-items/ja-t1" },
    ],
  },
  {
    group: "States",
    routes: [
      { label: "List → loading",    path: "/accounts?preview=loading" },
      { label: "List → error",      path: "/accounts?preview=error" },
      { label: "Detail → loading",  path: "/accounts/jacks-tire-elko?preview=loading" },
      { label: "Detail → error",    path: "/accounts/jacks-tire-elko?preview=error" },
    ],
  },
];

const DEVICES: { key: DeviceSize; label: string }[] = [
  { key: "se",  label: "SE"  },
  { key: "14",  label: "14"  },
  { key: "max", label: "Max" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function DevPanel({ deviceSize, onDeviceSize, collapsed, onToggle }: Props) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { reset } = useActionItems();
  const { dismissCapture } = useCapture();

  const currentBranch = process.env.NEXT_PUBLIC_GIT_BRANCH ?? "local";
  const isMain = currentBranch === "main" || currentBranch === "local";
  const activePlayground = PLAYGROUNDS.find(p => p.id === currentBranch);

  // Build nav: playground routes (if any) first, then default nav groups
  const playgroundRoutes: PlaygroundRoute[] = activePlayground?.routes ?? [];
  const nav = playgroundRoutes.length > 0
    ? [
        { group: activePlayground!.name, routes: playgroundRoutes },
        ...DEFAULT_NAV,
      ]
    : DEFAULT_NAV;

  function handleReset() {
    reset();
    dismissCapture();
    router.push("/accounts");
  }

  // ── Collapsed strip ─────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div
        style={{
          width: 28,
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onToggle}
          title="Expand dev panel"
          style={{
            width: 28,
            height: 64,
            borderRadius: 8,
            background: "var(--color-dark-secondary)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            fontSize: 11,
          }}
        >
          ◀
        </button>
      </div>
    );
  }

  // ── Expanded ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: 160,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        alignSelf: "center",
        flexShrink: 0,
      }}
    >
      {/* Header: playground identity + collapse toggle */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {isMain ? "Current App" : (activePlayground?.name ?? currentBranch)}
          </p>
          {!isMain && activePlayground && (
            <p style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              margin: "2px 0 0",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {activePlayground.description}
            </p>
          )}
          {isMain && (
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "2px 0 0" }}>
              Prototype baseline
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          title="Collapse"
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ▶
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--color-dark-tertiary)", marginTop: -8 }} />

      {/* Quick Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {nav.map(({ group, routes }) => (
          <div key={group}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: 4,
                paddingLeft: 10,
              }}
            >
              {group}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {routes.map(({ label, path }) => {
                const active = pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => router.push(path)}
                    style={{
                      textAlign: "left",
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
                      background: active ? "var(--color-dark-secondary)" : "transparent",
                      borderRadius: 8,
                      padding: "5px 10px",
                      transition: "background 0.12s, color 0.12s",
                      cursor: "pointer",
                      border: "none",
                      width: "100%",
                    }}
                  >
                    {active && (
                      <span style={{ color: "var(--color-brand-purple)", marginRight: 6, fontSize: 10 }}>▶</span>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--color-dark-tertiary)" }} />

      {/* Device size */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: 6,
            paddingLeft: 2,
          }}
        >
          Device
        </p>
        <div style={{ display: "flex", gap: 4 }}>
          {DEVICES.map(({ key, label }) => {
            const active = deviceSize === key;
            return (
              <button
                key={key}
                onClick={() => onDeviceSize(key)}
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  background: active ? "var(--color-dark-secondary)" : "transparent",
                  border: active ? "1px solid var(--color-dark-tertiary)" : "1px solid transparent",
                  borderRadius: 8,
                  padding: "5px 0",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Handoff */}
      <a
        href="/handoff"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-brand-purple)",
          background: "rgba(139,146,255,0.08)",
          border: "1px solid rgba(139,146,255,0.2)",
          borderRadius: 20,
          padding: "7px 0",
          textAlign: "center",
          textDecoration: "none",
          transition: "opacity 0.12s",
          width: "100%",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        Flutter handoff ↗
      </a>

      {/* Reset */}
      <button
        onClick={handleReset}
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-text-muted)",
          background: "transparent",
          border: "1px solid var(--color-dark-tertiary)",
          borderRadius: 20,
          padding: "7px 0",
          cursor: "pointer",
          transition: "opacity 0.12s",
          width: "100%",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        ↺ Reset demo
      </button>

    </div>
  );
}
