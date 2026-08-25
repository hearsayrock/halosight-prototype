"use client";

/**
 * FLUTTER HANDOFF: LiteVsFullScreen
 * Route: /import/lite-vs-full
 * Reached via Data & Connections → education card.
 * Widget: StatelessWidget
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-primary,
 *         --md-sys-color-alpha-white-10, --md-sys-color-alpha-neonindigo-10,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary, --md-sys-color-text-muted,
 *         --md-sys-color-neonindigo, --radius-md, --radius-full
 * Flutter equivalent: lite_vs_full_page.dart
 */

import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

const COMPARISON_ROWS = [
  { lite: "You import when you want", full: "Stays up to date on its own" },
  { lite: "Recent activity", full: "Full account history" },
  { lite: "Standard tasks and activities", full: "Your custom objects and fields" },
  { lite: "Just your records", full: "Your whole team's" },
  { lite: "You set it up in a minute", full: "Set up with your admin" },
];

export default function LiteVsFullPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-5">
        <button
          onClick={() => router.back()}
          className="p-1 active:opacity-60 transition-opacity"
        >
          <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>
        <div style={{ width: 30 }} />
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-4">

        {/* Title */}
        <div className="mb-6">
          <h1
            style={{
              fontSize: 25,
              fontWeight: 700,
              fontFamily: "Roboto Slab, Georgia, serif",
              color: "var(--md-sys-color-text-primary)",
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            Two ways to work with Salesforce
          </h1>
          <p style={{ fontSize: 14, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.55 }}>
            You're using quick import today. Nothing changes unless your organization moves to full integration.
          </p>
        </div>

        {/* Comparison table */}
        <div
          style={{
            border: "1px solid var(--md-sys-color-alpha-white-10)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {/* Column headers */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              background: "var(--md-sys-color-dark-secondary)",
              borderBottom: "1px solid var(--md-sys-color-alpha-white-10)",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderRight: "1px solid var(--md-sys-color-alpha-white-10)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  color: "var(--md-sys-color-neonindigo)",
                  marginBottom: 3,
                }}
              >
                You're here
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                Quick import
              </div>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  color: "var(--md-sys-color-text-muted)",
                  marginBottom: 3,
                }}
              >
                Organization-wide
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                Full integration
              </div>
            </div>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={i}
              className="grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid var(--md-sys-color-alpha-white-10)" : undefined,
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  borderRight: "1px solid var(--md-sys-color-alpha-white-10)",
                  background: "var(--md-sys-color-alpha-neonindigo-10)",
                }}
              >
                <div className="flex items-start gap-2">
                  <Icon name="check" size={14} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: "var(--md-sys-color-text-primary)", lineHeight: 1.5 }}>
                    {row.lite}
                  </span>
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div className="flex items-start gap-2">
                  <Icon name="check" size={14} style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.5 }}>
                    {row.full}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing copy */}
        <p style={{ fontSize: 13.5, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
          Quick import is the right choice for most people getting started. Full integration is worth it when a whole team needs Halosight and Salesforce to agree without anyone pressing a button.
        </p>

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center active:opacity-70 transition-opacity"
          style={{
            height: 46,
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--md-sys-color-neonindigo)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--md-sys-color-neonindigo)",
          }}
        >
          Talk to us about full integration
        </button>
      </div>
    </div>
  );
}
