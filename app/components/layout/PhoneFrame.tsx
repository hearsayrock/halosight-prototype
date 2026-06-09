"use client";

/**
 * FLUTTER HANDOFF: PhoneFrame
 * Web-only wrapper — simulates a mobile viewport.
 * No Flutter equivalent needed; remove in production.
 *
 * Renders three columns:
 *  [PlaygroundNav]  [Phone]  [DevPanel]
 *
 * Both sidebars are independently collapsible.
 * Press \ (backslash) or click the toggle above the phone to hide/show all panels.
 */

import { useState, useEffect } from "react";
import DevPanel, { type DeviceSize } from "./DevPanel";
import PlaygroundNav from "./PlaygroundNav";

const SIZES: Record<DeviceSize, { width: number; height: number }> = {
  se:  { width: 375, height: 667 },
  14:  { width: 390, height: 844 },
  max: { width: 430, height: 932 },
};

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [deviceSize, setDeviceSize]         = useState<DeviceSize>("14");
  const [leftCollapsed, setLeftCollapsed]   = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [focusMode, setFocusMode]           = useState(false);

  const { width, height } = SIZES[deviceSize];
  const currentBranch = process.env.NEXT_PUBLIC_GIT_BRANCH ?? "local";

  // Keyboard shortcut: \ toggles focus mode
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "\\" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Don't fire if typing in an input
        if (document.activeElement?.tagName === "INPUT" ||
            document.activeElement?.tagName === "TEXTAREA") return;
        setFocusMode(f => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showSidebars = !focusMode;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: showSidebars ? 40 : 0,
        padding: 32,
        background: "var(--color-dark-base)",
        transition: "gap 0.2s ease",
      }}
    >
      {/* Left: Playground nav */}
      {showSidebars && (
        <PlaygroundNav
          collapsed={leftCollapsed}
          onToggle={() => setLeftCollapsed(c => !c)}
          currentBranch={currentBranch}
        />
      )}

      {/* Phone + toggle button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flexShrink: 0 }}>

        {/* Focus mode toggle */}
        <button
          onClick={() => setFocusMode(f => !f)}
          title={focusMode ? "Show panels  (\\ key)" : "Hide panels  (\\ key)"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 20,
            background: focusMode ? "var(--color-dark-secondary)" : "transparent",
            border: `1px solid ${focusMode ? "var(--color-dark-tertiary)" : "transparent"}`,
            cursor: "pointer",
            color: focusMode ? "var(--color-text-secondary)" : "var(--color-text-disabled)",
            fontSize: 11,
            fontWeight: 500,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--color-dark-secondary)";
            e.currentTarget.style.borderColor = "var(--color-dark-tertiary)";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
          onMouseLeave={e => {
            if (!focusMode) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "var(--color-text-disabled)";
            }
          }}
        >
          {/* Icon: two vertical bars (panels visible) or just a rect (focus) */}
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" style={{ flexShrink: 0 }}>
            {focusMode ? (
              // Show panels icon: three columns
              <>
                <rect x="0"  y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.6" />
                <rect x="5.5" y="0" width="3" height="12" rx="1" fill="currentColor" />
                <rect x="11" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.6" />
              </>
            ) : (
              // Hide panels icon: just center column highlighted
              <>
                <rect x="0"  y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.25" />
                <rect x="5.5" y="0" width="3" height="12" rx="1" fill="currentColor" />
                <rect x="11" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.25" />
              </>
            )}
          </svg>
          {focusMode ? "Show panels" : "Hide panels"}
          <span style={{ opacity: 0.45, fontSize: 10, letterSpacing: "0.02em" }}>\\</span>
        </button>

        {/* Phone */}
        <div
          className="phone-frame"
          style={{ width, height }}
        >
          <div className="phone-screen" style={{ position: "relative", overflow: "hidden" }}>
            {children}
            {/* Overlay root — sheets/modals portal here to sit above PageTransition + BottomNav */}
            <div
              id="phone-overlay-root"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 100,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Right: Dev panel */}
      {showSidebars && (
        <DevPanel
          deviceSize={deviceSize}
          onDeviceSize={setDeviceSize}
          collapsed={rightCollapsed}
          onToggle={() => setRightCollapsed(c => !c)}
        />
      )}
    </div>
  );
}
