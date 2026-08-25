"use client";

/**
 * FLUTTER HANDOFF: ImportingScreen
 * Route: /import/importing
 * Deliberately inert — no actions while import runs server-side.
 * Widget: StatefulWidget
 * State: progress (driven from SalesforceContext)
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-text-primary,
 *         --md-sys-color-text-secondary, --md-sys-color-text-muted, --md-sys-color-neonindigo,
 *         --radius-full
 * Flutter equivalent: importing_page.dart
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSalesforce } from "@/lib/context/SalesforceContext";

export default function ImportingPage() {
  const router = useRouter();
  const { run, startImport } = useSalesforce();

  useEffect(() => {
    if (run.status === "idle") {
      startImport();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (run.status === "done" || run.status === "partial") {
      router.replace("/import/success");
    }
  }, [run.status, router]);

  const pct = Math.round(run.progress);

  return (
    <div
      className="flex flex-col h-full items-center justify-start"
      style={{ background: "var(--md-sys-color-background)", paddingTop: 240 }}
    >
      <div className="w-full px-6">
        <h1
          style={{
            fontSize: 27,
            fontWeight: 700,
            fontFamily: "Roboto Slab, Georgia, serif",
            color: "var(--md-sys-color-text-primary)",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Importing
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--md-sys-color-text-secondary)",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          This can take a few minutes.
        </p>

        {/* Progress track */}
        <div
          style={{
            height: 6,
            borderRadius: "var(--radius-full)",
            background: "var(--md-sys-color-dark-secondary)",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "var(--radius-full)",
              background: "var(--md-sys-color-neonindigo)",
              width: `${pct}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", textAlign: "center" }}>
          {pct}%
        </p>
      </div>
    </div>
  );
}
