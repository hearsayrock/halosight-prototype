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
 *
 * MOBILE BREAKPOINT (≤ 767px):
 *   The phone frame chrome disappears entirely — the app fills the real
 *   viewport exactly as it would on a native device.
 */

import { useState, useEffect } from "react";
import DevPanel, { type DeviceSize } from "./DevPanel";
import PlaygroundNav from "./PlaygroundNav";
import MobileKeyboard from "./MobileKeyboard";
import StatusBar from "./StatusBar";
import DevModeOverlay from "./DevModeOverlay";

const SIZES: Record<DeviceSize, { width: number; height: number }> = {
  se:  { width: 375, height: 667 },
  14:  { width: 390, height: 844 },
  max: { width: 430, height: 932 },
};

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [deviceSize, setDeviceSize]         = useState<DeviceSize>("14");
  const [leftCollapsed, setLeftCollapsed]   = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(true);
  // Sidebars hidden on this branch for user testing — flip to false to restore
  const [focusMode, setFocusMode]           = useState(true);
  const [isMobile, setIsMobile]             = useState(false);

  const { width, height } = SIZES[deviceSize];
  const currentBranch = process.env.NEXT_PUBLIC_GIT_BRANCH ?? "local";

  // Track real-device viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Keyboard shortcut: \ toggles focus mode
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "\\" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (document.activeElement?.tagName === "INPUT" ||
            document.activeElement?.tagName === "TEXTAREA") return;
        setFocusMode(f => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const overlayRoot = (
    <div
      id="phone-overlay-root"
      style={{ position: "absolute", inset: 0, zIndex: 100, pointerEvents: "none" }}
    />
  );

  // ── Mobile: no frame chrome, app fills the real screen ───────────────────────
  if (isMobile) {
    return (
      <div
        className="phone-screen"
        style={{ width: "100vw", height: "100dvh", position: "relative", background: "var(--color-background)" }}
      >
        {children}
        {overlayRoot}
        <StatusBar />
        <MobileKeyboard />
        <DevModeOverlay />
      </div>
    );
  }

  // ── Desktop: phone frame mockup ───────────────────────────────────────────────
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
        background: "var(--color-surface-dim)",
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

      {/* Phone */}
      <div
        className="phone-frame"
        style={{ width, height, flexShrink: 0 }}
      >
        <div className="phone-screen" style={{ position: "relative", overflow: "hidden" }}>
          {children}
          {overlayRoot}
          <StatusBar />
          <MobileKeyboard />
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

      <DevModeOverlay />
    </div>
  );
}
