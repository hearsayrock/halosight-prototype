"use client";

/**
 * Design-system page previews for the top pill Toast — NOT part of the mobile app UX.
 * Renders the real ToastCard inside the top of a phone (status bar + island), so the placement reads correctly.
 */

import { useEffect, useState } from "react";
import { ToastCard, ToastCheck, ToastSpinner } from "@/components/ui/Toast";

/** Top of a phone: island and status bar area, then the screen. */
export function PhoneTop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ height: 120, background: "var(--md-sys-color-background)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 110, height: 30, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-dark-base)" }} />
      <div className="flex justify-center" style={{ position: "absolute", top: 56, left: 0, right: 0 }}>{children}</div>
    </div>
  );
}

export function PillPreview({ state }: { state: "processing" | "ready" | "failed" }) {
  return (
    <PhoneTop>
      {state === "processing" && <ToastCard shape="pill" title="Preparing note" leading={<ToastSpinner />} />}
      {state === "ready" && <ToastCard shape="pill" title="Note ready" leading={<ToastCheck />} action={{ label: "View", onPress: () => {} }} />}
      {state === "failed" && <ToastCard shape="pill" tone="error" title="Couldn't prepare note" leading="error" action={{ label: "Try again", onPress: () => {} }} />}
    </PhoneTop>
  );
}

/** Preparing note → Note ready, on a loop, so the swap and the width easing can be seen. */
export function PillSequencePreview() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady((r) => !r), ready ? 2200 : 2800);
    return () => clearTimeout(t);
  }, [ready]);
  return (
    <PhoneTop>
      <ToastCard
        shape="pill"
        title={ready ? "Note ready" : "Preparing note"}
        leading={ready ? <ToastCheck /> : <ToastSpinner />}
        action={ready ? { label: "View", onPress: () => {} } : undefined}
      />
    </PhoneTop>
  );
}
