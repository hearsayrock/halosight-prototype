"use client";

/**
 * FLUTTER HANDOFF: ImportReviewScreen
 * Route: /import/review
 * AI-first summary screen — never blocks the import CTA.
 * Exceptions (non-standard Salesforce types) are resolved inline.
 * Widget: StatefulWidget
 * State: exceptionChoices (per-type note/task override)
 * Tokens: --md-sys-color-background, --md-sys-color-dark-primary, --md-sys-color-alpha-white-10,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary, --md-sys-color-text-muted,
 *         --md-sys-color-text-disabled, --md-sys-color-neonindigo, --md-sys-color-brand-teal,
 *         --md-sys-color-warning, --radius-md, --radius-full
 * Flutter equivalent: import_review_page.dart
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useSalesforce } from "@/lib/context/SalesforceContext";
import { mockAnalysis } from "@/lib/mock-data/salesforce";

type DestChoice = "note" | "task";

export default function ImportReviewPage() {
  const router = useRouter();
  const { analysis } = useSalesforce();
  const data = analysis ?? mockAnalysis;

  const confidentTypes = data.activityTypes.filter((t) => t.confident);
  const exceptionTypes = data.activityTypes.filter((t) => !t.confident);

  const [exceptionChoices, setExceptionChoices] = useState<Record<string, DestChoice>>(() =>
    Object.fromEntries(exceptionTypes.map((t) => [t.name, "note"]))
  );

  const noteCount =
    confidentTypes.filter((t) => t.recommended === "note").reduce((s, t) => s + t.count, 0) +
    exceptionTypes.filter((t) => exceptionChoices[t.name] === "note").reduce((s, t) => s + t.count, 0);

  const taskCount =
    confidentTypes.filter((t) => t.recommended === "task").reduce((s, t) => s + t.count, 0) +
    exceptionTypes.filter((t) => exceptionChoices[t.name] === "task").reduce((s, t) => s + t.count, 0);

  const totalImport = noteCount + taskCount;

  const top2 = data.accounts.slice(0, 2).map((a) => a.name);
  const accountHook =
    top2.length === 2 ? `${top2[0]} and ${top2[1]}` : top2[0] ?? "";

  const windowLabel = data.windowStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

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

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 100 }}>
        <div className="px-4">

          {/* Headline */}
          <h1 style={{
            fontSize: 27, fontWeight: 700,
            fontFamily: "Roboto Slab, Georgia, serif",
            color: "var(--md-sys-color-text-primary)",
            lineHeight: 1.2, marginBottom: 8,
          }}>
            Ready to import
          </h1>

          {/* Personal hook */}
          <p style={{ fontSize: 14.5, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>
            {data.accounts.length} accounts including{" "}
            <span style={{ fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
              {accountHook}
            </span>
          </p>
          <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", marginBottom: 26 }}>
            Activity since {windowLabel}
          </p>

          {/* Outcome stat cards */}
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            {[
              { count: noteCount,           label: "Visit notes",   color: "var(--md-sys-color-neonindigo)" },
              { count: taskCount,           label: "Action items",  color: "var(--md-sys-color-brand-teal)" },
              { count: data.unlinkedCount,  label: "Skipped",       color: "var(--md-sys-color-text-disabled)" },
            ].map(({ count, label, color }) => (
              <div key={label} style={{
                flex: 1,
                background: "var(--md-sys-color-dark-primary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--md-sys-color-alpha-white-10)",
                padding: "14px 8px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              }}>
                <span style={{
                  fontSize: 26, fontWeight: 700,
                  fontFamily: "Roboto Slab, Georgia, serif",
                  color,
                }}>
                  {count}
                </span>
                <span style={{
                  fontSize: 11, color: "var(--md-sys-color-text-muted)",
                  textAlign: "center", lineHeight: 1.3,
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* How we sorted it */}
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: "var(--md-sys-color-text-muted)",
            marginBottom: 10,
          }}>
            How we sorted it
          </p>

          <div style={{
            background: "var(--md-sys-color-dark-primary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--md-sys-color-alpha-white-10)",
            overflow: "hidden",
            marginBottom: exceptionTypes.length > 0 ? 10 : 0,
          }}>
            {confidentTypes.map((type, i) => {
              const isNote = type.recommended === "note";
              const color = isNote ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-brand-teal)";
              const icon = isNote ? "sticky_note_2" : "checklist";
              const destLabel = isNote ? "Visit notes" : "Action items";
              const isLast = i === confidentTypes.length - 1 && data.unlinkedCount === 0;
              return (
                <div key={type.name} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 16px",
                  borderBottom: isLast ? "none" : "1px solid var(--md-sys-color-alpha-white-10)",
                }}>
                  <Icon name={icon} size={18} style={{ color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                      {type.name}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--md-sys-color-text-muted)" }}>
                      {" "}→ {destLabel}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-text-muted)" }}>
                    {type.count}
                  </span>
                </div>
              );
            })}
            {data.unlinkedCount > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 16px",
              }}>
                <Icon name="link_off" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, color: "var(--md-sys-color-text-muted)" }}>
                    No account attached → skipped
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--md-sys-color-text-disabled)" }}>
                  {data.unlinkedCount}
                </span>
              </div>
            )}
          </div>

          {/* Exception types — inline, non-blocking */}
          {exceptionTypes.length > 0 && (
            <div style={{
              background: "var(--md-sys-color-alpha-coral-10)",
              border: "1px solid rgba(245,166,35,0.28)",
              borderRadius: "var(--radius-md)",
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <Icon name="auto_awesome" size={16} style={{ color: "var(--md-sys-color-warning)", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13.5, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  {exceptionTypes.map((t) => `"${t.name}"`).join(" and ")}{" "}
                  {exceptionTypes.length === 1 ? "isn't" : "aren't"} a standard Salesforce type — we defaulted{" "}
                  {exceptionTypes.length === 1 ? "it" : "them"} to visit notes.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {exceptionTypes.map((type) => (
                  <div key={type.name} style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 10,
                  }}>
                    <span style={{ fontSize: 13.5, color: "var(--md-sys-color-text-primary)", fontWeight: 600 }}>
                      {type.name}
                      <span style={{ fontWeight: 400, color: "var(--md-sys-color-text-muted)" }}>
                        {" "}({type.count})
                      </span>
                    </span>
                    <div style={{
                      display: "flex", flexShrink: 0,
                      borderRadius: "var(--radius-full)",
                      overflow: "hidden",
                      border: "1px solid rgba(245,166,35,0.35)",
                    }}>
                      {(["note", "task"] as DestChoice[]).map((opt) => {
                        const active = exceptionChoices[type.name] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() =>
                              setExceptionChoices((prev) => ({ ...prev, [type.name]: opt }))
                            }
                            style={{
                              padding: "5px 11px",
                              fontSize: 12.5, fontWeight: 600,
                              background: active ? "rgba(245,166,35,0.22)" : "transparent",
                              color: active ? "var(--md-sys-color-warning)" : "var(--md-sys-color-text-muted)",
                              borderRight: opt === "note" ? "1px solid rgba(245,166,35,0.35)" : "none",
                              transition: "background 0.15s, color 0.15s",
                            }}
                          >
                            {opt === "note" ? "Visit note" : "Action item"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky footer — always live */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "12px 16px 28px",
        borderTop: "1px solid var(--md-sys-color-alpha-white-10)",
        background: "var(--md-sys-color-background)",
      }}>
        <button
          onClick={() => router.push("/import/importing")}
          className="w-full flex items-center justify-center active:scale-[.97] transition-transform"
          style={{
            height: 50,
            borderRadius: "var(--radius-full)",
            background: "var(--md-sys-color-neonindigo)",
            color: "var(--md-sys-color-text-primary)",
            fontSize: 16, fontWeight: 600,
          }}
        >
          Import {totalImport} activities
        </button>
      </div>

    </div>
  );
}
