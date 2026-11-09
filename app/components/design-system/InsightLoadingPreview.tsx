"use client";

/**
 * Design-system page preview for the Insight Card loader — NOT part of the mobile app UX.
 * Plays the real loading card for a few seconds, then lets the summary fade in; Replay runs it again.
 */

import { useEffect, useState } from "react";
import InsightCard from "@/components/accounts/InsightCard";

const SUMMARY = "Sandra mentioned the team has been evaluating three vendors — we're the frontrunner. Budget is approved. Main concern is implementation timeline.";

export default function InsightLoadingPreview() {
  const [run, setRun] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 4200);
    return () => clearTimeout(t);
  }, [run]);

  return (
    <div style={{ padding: "var(--spacing-4)" }}>
      <InsightCard key={run} eyebrow="Last Time" visitedDaysAgo={30} body={SUMMARY} loading={loading} />
      <button
        type="button"
        onClick={() => { setLoading(true); setRun((r) => r + 1); }}
        style={{ marginTop: "var(--spacing-3)", fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-neonindigo)" }}
      >
        Replay
      </button>
    </div>
  );
}
