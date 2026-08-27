"use client";

/**
 * FLUTTER HANDOFF: NonStandardFieldsScreen
 * Route: /import/non-standard
 * Empty state shown when Salesforce instance uses custom/non-standard fields
 * that can't be auto-mapped. Prompts user to reach out for manual setup.
 * Widget: StatelessWidget
 * Tokens: --md-sys-color-background, --md-sys-color-dark-primary,
 *         --md-sys-color-dark-secondary, --md-sys-color-text-primary,
 *         --md-sys-color-text-secondary, --md-sys-color-text-muted,
 *         --md-sys-color-neonindigo, --radius-full, --radius-md
 */

import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

const SUPPORT_EMAIL = "support@halosight.com";

export default function NonStandardFieldsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4" style={{ flexShrink: 0 }}>
        <button onClick={() => router.back()} className="p-1 active:opacity-60 transition-opacity">
          <Icon name="close" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-secondary)" }}>
          Import from Salesforce
        </span>
        <div style={{ width: 30 }} />
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">

        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--md-sys-color-dark-primary)",
            border: "1px solid rgba(139,146,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Icon name="dataset" size={32} style={{ color: "var(--md-sys-color-neonindigo)" }} />
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "Roboto Slab, Georgia, serif",
            color: "var(--md-sys-color-text-primary)",
            lineHeight: 1.25,
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          Your Salesforce setup is one of a kind
        </h1>

        {/* Body copy */}
        <p
          style={{
            fontSize: 15,
            color: "var(--md-sys-color-text-secondary)",
            lineHeight: 1.6,
            textAlign: "center",
            marginBottom: 10,
            maxWidth: 300,
          }}
        >
          Looks like your team uses custom Salesforce fields. We can't auto-map those — but getting you set up is a quick lift for our team.
        </p>
        <p
          style={{
            fontSize: 15,
            color: "var(--md-sys-color-text-secondary)",
            lineHeight: 1.6,
            textAlign: "center",
            marginBottom: 36,
            maxWidth: 300,
          }}
        >
          Drop us a line and we'll have it sorted — usually same day.
        </p>

        {/* CTA button */}
        <a
          href="mailto:support@halosight.com?subject=Custom%20Salesforce%20Fields%20Setup&body=Hi%20Halosight%20team%2C%0A%0AI%27d%20love%20help%20importing%20my%20custom%20Salesforce%20fields."
          className="flex items-center justify-center gap-2 active:opacity-80 transition-opacity w-full"
          style={{
            height: 52,
            borderRadius: "var(--radius-full)",
            background: "var(--md-sys-color-neonindigo)",
            color: "var(--md-sys-color-text-primary)",
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: 20,
          }}
        >
          <Icon name="mail" size={18} style={{ color: "var(--md-sys-color-text-primary)" }} />
          Message the Halosight team
        </a>

        {/* Email address */}
        <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
          or email us at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{ color: "var(--md-sys-color-neonindigo)", textDecoration: "none", fontWeight: 500 }}
          >
            {SUPPORT_EMAIL}
          </a>
        </p>

      </div>
    </div>
  );
}
