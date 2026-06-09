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
 */

import { useState } from "react";
import DevPanel, { type DeviceSize } from "./DevPanel";
import PlaygroundNav from "./PlaygroundNav";

const SIZES: Record<DeviceSize, { width: number; height: number }> = {
  se:  { width: 375, height: 667 },
  14:  { width: 390, height: 844 },
  max: { width: 430, height: 932 },
};

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [deviceSize, setDeviceSize]     = useState<DeviceSize>("14");
  const [leftCollapsed, setLeftCollapsed]   = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const { width, height } = SIZES[deviceSize];
  const currentBranch = process.env.NEXT_PUBLIC_GIT_BRANCH ?? "local";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: 32,
        background: "var(--color-dark-base)",
      }}
    >
      {/* Left: Playground nav */}
      <PlaygroundNav
        collapsed={leftCollapsed}
        onToggle={() => setLeftCollapsed(c => !c)}
        currentBranch={currentBranch}
      />

      {/* Phone */}
      <div
        className="phone-frame"
        style={{ width, height, flexShrink: 0 }}
      >
        {/* overflow-hidden + position:relative clips the sliding pages and
            anchors the static BottomNav overlay to the screen boundary */}
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

      {/* Right: Dev panel */}
      <DevPanel
        deviceSize={deviceSize}
        onDeviceSize={setDeviceSize}
        collapsed={rightCollapsed}
        onToggle={() => setRightCollapsed(c => !c)}
      />
    </div>
  );
}
