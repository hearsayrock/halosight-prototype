"use client";

/**
 * FLUTTER HANDOFF: ImportSuccessScreen
 * Route: /import/success
 * Widget: StatelessWidget
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-primary,
 *         --md-sys-color-alpha-white-10, --gradient-hero, --md-sys-color-text-primary,
 *         --md-sys-color-text-secondary, --md-sys-color-text-muted, --md-sys-color-neonindigo,
 *         --md-sys-color-brand-teal, --md-sys-color-success, --radius-md, --radius-lg, --radius-full
 * Flutter equivalent: import_success_page.dart
 */

import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

function ResultRow({
  icon,
  iconColor,
  label,
  value,
  borderBottom,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  borderBottom?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        height: 52,
        borderBottom: borderBottom ? "1px solid var(--md-sys-color-alpha-white-10)" : undefined,
      }}
    >
      <Icon name={icon} size={22} style={{ color: iconColor, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 15, color: "var(--md-sys-color-text-primary)" }}>{label}</span>
      <span
        style={{
          fontSize: 17,
          fontWeight: 700,
          fontFamily: "Roboto Slab, Georgia, serif",
          color: "var(--md-sys-color-text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ImportSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>
      <div className="flex-1 overflow-y-auto px-4 pt-16 pb-6">

        {/* Check icon */}
        <div className="flex justify-center mb-6">
          <Icon name="check_circle" size={40} style={{ color: "var(--md-sys-color-success)" }} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            fontFamily: "Roboto Slab, Georgia, serif",
            color: "var(--md-sys-color-text-primary)",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 10,
          }}
        >
          You're ready to go
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--md-sys-color-text-secondary)",
            textAlign: "center",
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          Imported from Salesforce just now. Import again whenever you want more.
        </p>

        {/* Result list */}
        <div
          style={{
            border: "1px solid var(--md-sys-color-alpha-white-10)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <ResultRow icon="domain" iconColor="var(--md-sys-color-brand-teal)" label="Companies added" value={18} borderBottom />
          <ResultRow icon="sticky_note_2" iconColor="var(--md-sys-color-neonindigo)" label="Account notes imported" value={94} borderBottom />
          <ResultRow icon="checklist" iconColor="var(--md-sys-color-brand-teal)" label="Action items created" value={29} />
        </div>

        {/* Handoff card */}
        <div
          style={{
            background: "var(--gradient-hero)",
            border: "1px solid var(--md-sys-color-alpha-white-10)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: "var(--md-sys-color-neonindigo)",
              marginBottom: 8,
            }}
          >
            Start here
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              fontFamily: "Roboto Slab, Georgia, serif",
              color: "var(--md-sys-color-text-primary)",
              marginBottom: 6,
            }}
          >
            Jack's Tire &amp; Oil
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: "var(--md-sys-color-text-secondary)",
              lineHeight: 1.55,
              marginBottom: 16,
            }}
          >
            9 notes and 3 action items came across. You visited 2 weeks ago.
          </div>
          <button
            onClick={() => router.push("/relationships/jacks-tire-elko")}
            className="flex items-center justify-center w-full active:scale-[.97] transition-transform"
            style={{
              height: 44,
              borderRadius: "var(--radius-full)",
              background: "var(--md-sys-color-neonindigo)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Open the account
          </button>
        </div>
      </div>

      {/* Done button */}
      <div style={{ padding: "12px 16px 32px" }}>
        <button
          onClick={() => router.push("/relationships")}
          className="w-full flex items-center justify-center active:opacity-70 transition-opacity"
          style={{
            height: 46,
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--md-sys-color-dark-tertiary)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--md-sys-color-text-primary)",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
