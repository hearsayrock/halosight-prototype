"use client";

/**
 * FLUTTER HANDOFF: StatusBar
 * Web-only prototype chrome — the iOS-style status bar (time + cellular / wifi /
 * battery) pinned to the top of every screen. Uses the classic 9:41 demo time.
 * Sits in the ~40px top padding the pages already reserve. Remove in production.
 * Tokens: --color-text-primary
 */

function CellularIcon() {
  return (
    <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor" aria-hidden="true">
      <rect x="0" y="7.5" width="3" height="3.5" rx="0.8" />
      <rect x="5" y="5" width="3" height="6" rx="0.8" />
      <rect x="10" y="2.5" width="3" height="8.5" rx="0.8" />
      <rect x="15" y="0" width="3" height="11" rx="0.8" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M1 4.2C4-0.4 13-0.4 16 4.2" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.6 7C6 3.9 11 3.9 13.4 7" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2" y="2" width="18" height="9" rx="2" fill="currentColor" />
      <rect x="24" y="4" width="1.6" height="5" rx="0.8" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

export default function StatusBar() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        color: "var(--color-text-primary)",
        pointerEvents: "none",
        zIndex: 105,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.3px" }}>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <CellularIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}
