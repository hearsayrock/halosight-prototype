"use client";

/**
 * FLUTTER HANDOFF: DataAndConnectionsScreen
 * Route: /import/connections
 * Reached via Profile → "Data & Connections".
 * Widget: StatefulWidget
 * State: showDisconnectConfirm, showHistoryRemoveConfirm
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-primary,
 *         --md-sys-color-dark-tertiary, --md-sys-color-alpha-white-10, --md-sys-color-text-primary,
 *         --md-sys-color-text-secondary, --md-sys-color-text-muted, --md-sys-color-text-disabled,
 *         --md-sys-color-neonindigo, --md-sys-color-brand-teal, --radius-md, --radius-xl, --radius-full
 * Flutter equivalent: data_connections_page.dart
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 mb-2">
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase" as const,
        color: "var(--md-sys-color-neonindigo)",
      }}>
        {children}
      </span>
    </div>
  );
}

export default function DataConnectionsPage() {
  const router = useRouter();
  const [showHistorySheet, setShowHistorySheet] = useState(false);

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
        <h1
          style={{
            fontSize: 17,
            fontWeight: 700,
            fontFamily: "Roboto Slab, Georgia, serif",
            color: "var(--md-sys-color-text-primary)",
          }}
        >
          Data &amp; Connections
        </h1>
        <div style={{ width: 30 }} />
      </div>

      <div className="flex-1 overflow-y-auto pb-8">

        {/* Connection card */}
        <div className="px-4 mb-4">
          <div
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              border: "1px solid var(--md-sys-color-alpha-white-10)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <Icon
                name="cloud_download"
                size={22}
                style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0, marginTop: 1 }}
              />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 3 }}>
                  Salesforce quick import
                </div>
                <div style={{ fontSize: 13.5, color: "var(--md-sys-color-text-muted)", marginBottom: 6 }}>
                  Last imported Aug 24 · 18 companies
                </div>
                <div style={{ fontSize: 13.5, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.5 }}>
                  A manual copy of your recent account activity. It doesn't run on its own.
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/import/disclosure")}
              className="flex items-center justify-center gap-2 w-full active:opacity-70 transition-opacity"
              style={{
                height: 44,
                borderRadius: "var(--radius-full)",
                background: "var(--md-sys-color-neonindigo)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <Icon name="cloud_download" size={18} style={{ color: "#fff" }} />
              Import new activity
            </button>
          </div>
        </div>

        {/* Settings / history / disconnect */}
        <div className="px-4 mb-4">
          <div
            style={{
              border: "1px solid var(--md-sys-color-alpha-white-10)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            {/* How activity comes in */}
            <button
              onClick={() => router.push("/import/rules")}
              className="w-full flex items-center justify-between px-4 active:opacity-70 transition-opacity"
              style={{ height: 52, borderBottom: "1px solid var(--md-sys-color-alpha-white-10)" }}
            >
              <div className="flex items-center gap-3">
                <Icon name="tune" size={20} style={{ color: "var(--md-sys-color-text-muted)" }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                  How activity comes in
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>6 rules</span>
                <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
              </div>
            </button>

            {/* Import history */}
            <button
              onClick={() => setShowHistorySheet(true)}
              className="w-full flex items-center justify-between px-4 active:opacity-70 transition-opacity"
              style={{ height: 52, borderBottom: "1px solid var(--md-sys-color-alpha-white-10)" }}
            >
              <div className="flex items-center gap-3">
                <Icon name="history" size={20} style={{ color: "var(--md-sys-color-text-muted)" }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                  Import history
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>3</span>
                <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
              </div>
            </button>

            {/* Disconnect */}
            <button
              className="w-full flex items-center gap-3 px-4 active:opacity-70 transition-opacity"
              style={{ height: 52 }}
            >
              <Icon name="link_off" size={20} style={{ color: "var(--md-sys-color-text-muted)" }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                Disconnect Salesforce
              </span>
            </button>
          </div>
        </div>

        {/* Education card */}
        <div className="px-4">
          <div
            style={{
              border: "1px solid var(--md-sys-color-alpha-white-10)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 6 }}>
              Want Salesforce to stay up to date on its own?
            </div>
            <div style={{ fontSize: 13.5, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.55, marginBottom: 12 }}>
              Full Halosight keeps your accounts and activity connected continuously, across your whole team.
            </div>
            <button
              onClick={() => router.push("/import/lite-vs-full")}
              className="flex items-center gap-1 active:opacity-70 transition-opacity"
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--md-sys-color-neonindigo)" }}>
                Compare quick import and full integration
              </span>
              <Icon name="chevron_right" size={16} style={{ color: "var(--md-sys-color-neonindigo)" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Import history sheet (placeholder) */}
      {showHistorySheet && (
        <ImportHistorySheet onClose={() => setShowHistorySheet(false)} />
      )}
    </div>
  );
}

function ImportHistorySheet({ onClose }: { onClose: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div
      className="absolute inset-0 z-50"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          background: "var(--md-sys-color-dark-primary)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          padding: "20px 0 40px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div style={{ width: 36, height: 4, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-dark-tertiary)" }} />
        </div>

        <div className="px-4 mb-5">
          <h2 style={{ fontSize: 17, fontWeight: 700, fontFamily: "Roboto Slab, Georgia, serif", color: "var(--md-sys-color-text-primary)" }}>
            Import history
          </h2>
        </div>

        {/* History entry */}
        <div className="px-4">
          <div
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              border: "1px solid var(--md-sys-color-alpha-white-10)",
              borderRadius: "var(--radius-md)",
              padding: "14px 16px",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 2 }}>
                  Aug 24, 2026
                </div>
                <div style={{ fontSize: 12.5, color: "var(--md-sys-color-text-muted)" }}>
                  18 companies · 94 notes · 29 action items
                </div>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="active:opacity-60 transition-opacity"
              >
                <Icon name="delete_outline" size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Remove confirm */}
        {showConfirm && (
          <div className="px-4 mt-4">
            <div
              style={{
                background: "var(--md-sys-color-dark-secondary)",
                border: "1px solid rgba(245,166,35,0.35)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--md-sys-color-text-primary)", marginBottom: 6 }}>
                Remove this import?
              </div>
              <div style={{ fontSize: 13, color: "var(--md-sys-color-text-secondary)", lineHeight: 1.55, marginBottom: 14 }}>
                This deletes the 94 notes and 29 action items from the Aug 24 import. Companies stay, and so does anything you've written or changed yourself since. Nothing in Salesforce is affected.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 active:opacity-70 transition-opacity"
                  style={{
                    height: 40,
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--md-sys-color-dark-tertiary)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--md-sys-color-text-primary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 active:opacity-70 transition-opacity"
                  style={{
                    height: 40,
                    borderRadius: "var(--radius-full)",
                    background: "rgba(245,166,35,0.15)",
                    border: "1px solid rgba(245,166,35,0.35)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--md-sys-color-warning)",
                  }}
                >
                  Remove import
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
