"use client";

/**
 * FLUTTER HANDOFF: ImportDisclosureScreen
 * Route: /import/disclosure
 * Reached via home import card CTA or Data & Connections → Import new activity.
 * Widget: StatelessWidget
 * Tokens: --md-sys-color-background, --md-sys-color-dark-primary, --md-sys-color-alpha-white-10,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary, --md-sys-color-text-disabled,
 *         --md-sys-color-neonindigo, --md-sys-color-brand-teal, --radius-md, --radius-full
 * Flutter equivalent: import_disclosure_page.dart
 */

import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function BulletRow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="flex items-start gap-2 mb-2">
      <span style={{ color, fontSize: 14.5, lineHeight: 1.55, flexShrink: 0 }}>•</span>
      <span style={{ fontSize: 14.5, color: "var(--md-sys-color-text-primary)", lineHeight: 1.55 }}>{children}</span>
    </div>
  );
}

export default function ImportDisclosurePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-5">
        <button
          onClick={() => router.back()}
          className="p-1 active:opacity-60 transition-opacity"
        >
          <Icon name="close" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-secondary)" }}>
          Import from Salesforce
        </span>
        <div style={{ width: 30 }} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">

        {/* Title */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "Roboto Slab, Georgia, serif",
            color: "var(--md-sys-color-text-primary)",
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          Before we connect
        </h1>
        <p style={{ fontSize: 15, color: "var(--md-sys-color-text-primary)", marginBottom: 24 }}>
          You'll sign in to Salesforce next.
        </p>

        {/* We look at */}
        <Eyebrow color="var(--md-sys-color-neonindigo)">We look at</Eyebrow>
        <BulletRow color="var(--md-sys-color-neonindigo)">Your tasks and activity from the last 60 days</BulletRow>
        <BulletRow color="var(--md-sys-color-neonindigo)">The accounts they're attached to</BulletRow>
        <BulletRow color="var(--md-sys-color-neonindigo)">Your Salesforce name and email</BulletRow>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--md-sys-color-alpha-white-10)", margin: "20px 0" }} />

        {/* We copy, once */}
        <Eyebrow color="var(--md-sys-color-brand-teal)">We copy, once</Eyebrow>
        <BulletRow color="var(--md-sys-color-brand-teal)">Those accounts, as companies</BulletRow>
        <BulletRow color="var(--md-sys-color-brand-teal)">The activity, as notes or action items</BulletRow>

        {/* Boundary card */}
        <div
          style={{
            background: "var(--md-sys-color-dark-primary)",
            borderRadius: "var(--radius-md)",
            padding: "16px 18px",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 5 }}>
            A one-time copy, not a sync.
          </div>
          <div style={{ fontSize: 13.5, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.55 }}>
            Halosight won't change anything in Salesforce or check back on its own.
          </div>
        </div>

      </div>

      {/* Sticky footer */}
      <div
        style={{
          borderTop: "1px solid var(--md-sys-color-alpha-white-10)",
          padding: "16px 16px 32px",
        }}
      >
        <p
          className="text-center mb-4"
          style={{ fontSize: 12.5, color: "var(--md-sys-color-text-disabled)" }}
        >
          You'll approve what we found before anything is copied.
        </p>
        <button
          onClick={() => router.push("/import/analysis")}
          className="w-full flex items-center justify-center active:scale-[.97] transition-transform"
          style={{
            height: 50,
            borderRadius: "var(--radius-full)",
            background: "var(--md-sys-color-neonindigo)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Continue to Salesforce
        </button>
      </div>
    </div>
  );
}
