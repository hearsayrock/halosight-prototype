"use client";

/**
 * FLUTTER HANDOFF: ImportAnalysisScreen
 * Route: /import/analysis
 * Auto-advances to Review at ~4.2s. Not back-navigable.
 * Widget: StatefulWidget
 * State: beatIndex (0=pending, 1=active, 2=done)
 * Tokens: --md-sys-color-background, --md-sys-color-dark-tertiary, --md-sys-color-text-primary,
 *         --md-sys-color-text-muted, --md-sys-color-text-disabled, --md-sys-color-neonindigo,
 *         --md-sys-color-success, --radius-full
 * Flutter equivalent: import_analysis_page.dart
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

const BEATS = [
  {
    label: "Finding your recent activity",
    result: "127 tasks and activities since Jun 25",
  },
  {
    label: "Matching activity to accounts",
    result: "18 accounts · 4 records had none",
  },
  {
    label: "Sorting notes from action items",
    result: "123 sorted · 2 types unclear",
  },
];

const BEAT_TIMES = [1100, 2300, 3400];
const ADVANCE_TIME = 4200;

type BeatStatus = "pending" | "active" | "done";

function BeatIcon({ status }: { status: BeatStatus }) {
  if (status === "done") {
    return <Icon name="check_circle" size={22} style={{ color: "var(--md-sys-color-success)", flexShrink: 0 }} />;
  }
  if (status === "active") {
    return <Icon name="radio_button_unchecked" size={22} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />;
  }
  return <Icon name="circle" size={22} style={{ color: "var(--md-sys-color-dark-tertiary)", flexShrink: 0 }} />;
}

export default function ImportAnalysisPage() {
  const router = useRouter();
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BEAT_TIMES.forEach((t, i) => {
      timers.push(setTimeout(() => setDoneCount(i + 1), t));
    });
    timers.push(setTimeout(() => router.replace("/import/review"), ADVANCE_TIME));
    return () => timers.forEach(clearTimeout);
  }, [router]);

  function statusFor(index: number): BeatStatus {
    if (doneCount > index) return "done";
    if (doneCount === index) return "active";
    return "pending";
  }

  return (
    <div className="flex flex-col h-full items-center justify-start" style={{ background: "var(--md-sys-color-background)", paddingTop: 96 }}>

      <div className="w-full px-6">
        <h1
          style={{
            fontSize: 27,
            fontWeight: 700,
            fontFamily: "Roboto Slab, Georgia, serif",
            color: "var(--md-sys-color-text-primary)",
            lineHeight: 1.2,
            marginBottom: 40,
          }}
        >
          Looking through your Salesforce activity
        </h1>

        <div className="flex flex-col gap-[22px]">
          {BEATS.map((beat, i) => {
            const status = statusFor(i);
            return (
              <div key={i} className="flex items-start gap-3">
                <BeatIcon status={status} />
                <div>
                  <div
                    style={{
                      fontSize: 15.5,
                      fontWeight: 600,
                      color: status === "pending" ? "var(--md-sys-color-text-disabled)" : "var(--md-sys-color-text-primary)",
                      marginBottom: 3,
                    }}
                  >
                    {beat.label}
                  </div>
                  {status !== "pending" && (
                    <div style={{ fontSize: 13.5, color: "var(--md-sys-color-text-muted)" }}>
                      {status === "active" ? "Working…" : beat.result}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p
          className="text-center mt-14"
          style={{ fontSize: 12.5, color: "var(--md-sys-color-text-disabled)" }}
        >
          Reading only. Nothing is copied into Halosight yet.
        </p>
      </div>
    </div>
  );
}
