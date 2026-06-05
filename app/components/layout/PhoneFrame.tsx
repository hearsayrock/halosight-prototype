"use client";

/**
 * FLUTTER HANDOFF: PhoneFrame
 * Web-only wrapper — simulates a 390×844 mobile viewport.
 * No Flutter equivalent needed; remove in production.
 *
 * Hosts PageTransition — all page enter/exit animations are
 * contained within the phone screen so they don't affect the
 * surrounding browser chrome.
 */

import PageTransition from "./PageTransition";

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "var(--color-dark-base)" }}
    >
      <div className="phone-frame">
        {/* overflow-hidden + position:relative clip the sliding pages
            to the phone screen boundary during transitions */}
        <div className="phone-screen" style={{ position: "relative", overflow: "hidden" }}>
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
