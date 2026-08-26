"use client";

/**
 * FLUTTER HANDOFF: SalesforceAuthScreen
 * Route: /import/sf-auth
 * Reached via ImportDisclosureScreen → "Continue to Salesforce".
 * Widget: StatelessWidget
 * Tokens: none — this screen intentionally mimics Salesforce's OAuth web UI,
 *         using Salesforce brand colors rather than Halosight design tokens.
 *         Flutter equivalent: sf_auth_webview_page.dart (show a real WebView here)
 */

import { useRouter } from "next/navigation";

export default function SalesforceAuthPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full" style={{ background: "#EEF1F6" }}>

      {/* Browser chrome */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "52px 16px 10px",
        background: "#FFFFFF",
        borderBottom: "1px solid #E0E4EA",
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#54698D", fontSize: 20, lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#F3F5F7",
          borderRadius: 8,
          padding: "7px 12px",
        }}>
          <svg width="12" height="13" viewBox="0 0 12 13" fill="none" style={{ flexShrink: 0 }}>
            <path d="M9.5 6H2.5M9.5 6V10.5C9.5 10.7761 9.27614 11 9 11H3C2.72386 11 2.5 10.7761 2.5 10.5V6M9.5 6V4C9.5 2.34315 8.15685 1 6.5 1H5.5C3.84315 1 2.5 2.34315 2.5 4V6" stroke="#54698D" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 13, color: "#54698D", fontWeight: 500, letterSpacing: "0.01em" }}>
            login.salesforce.com
          </span>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "36px 22px 24px" }}>

        {/* Eyebrow */}
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#032D60",
          marginBottom: 16,
        }}>
          Salesforce
        </p>

        {/* Headline */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#032D60",
          lineHeight: 1.25,
          marginBottom: 20,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Allow Halosight to access your Salesforce data?
        </h1>

        {/* Body */}
        <p style={{
          fontSize: 14,
          color: "#54698D",
          lineHeight: 1.6,
        }}>
          Signed in as <strong style={{ color: "#032D60", fontWeight: 600 }}>nsmith@fleetsupply.com</strong>. Halosight is requesting read access to your tasks, activities and accounts.
        </p>

      </div>

      {/* Sticky footer — Allow / Deny */}
      <div style={{
        padding: "12px 20px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "#EEF1F6",
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push("/import/analysis")}
          className="active:opacity-90 transition-opacity"
          style={{
            width: "100%",
            height: 52,
            borderRadius: 6,
            background: "#0070D2",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "0.01em",
          }}
        >
          Allow
        </button>
        <button
          onClick={() => router.back()}
          className="active:opacity-70 transition-opacity"
          style={{
            width: "100%",
            height: 52,
            borderRadius: 6,
            background: "#FFFFFF",
            color: "#032D60",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "system-ui, -apple-system, sans-serif",
            border: "1px solid #C9D0DA",
            letterSpacing: "0.01em",
          }}
        >
          Deny
        </button>
      </div>

    </div>
  );
}
