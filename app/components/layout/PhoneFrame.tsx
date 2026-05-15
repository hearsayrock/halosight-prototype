"use client";

/**
 * FLUTTER HANDOFF: PhoneFrame
 * Web-only wrapper — simulates a 390×844 mobile viewport.
 * No Flutter equivalent needed; remove in production.
 */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#0C0F1C" }}>
      <div className="phone-frame">
        <div className="phone-screen">{children}</div>
      </div>
    </div>
  );
}
