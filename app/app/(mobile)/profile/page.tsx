"use client";

/**
 * FLUTTER HANDOFF: ProfileScreen
 * Route: /profile
 * Reached via the profile button on Home or Accounts.
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-text-primary,
 *         --md-sys-color-text-muted, --md-sys-color-text-disabled, --md-sys-color-brand-coral,
 *         --md-sys-color-neonindigo, --md-sys-color-alpha-neonindigo-10, --radius-md, --radius-xl, --radius-full
 * Flutter equivalent: profile_page.dart
 */

import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

const MENU_ITEMS = [
  { label: "Report a Bug" },
  { label: "Suggest a Feature" },
  { label: "Support" },
  { label: "Switch Tenant" },
];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-6">
        <button
          onClick={() => router.back()}
          className="p-1 active:opacity-60 transition-opacity"
        >
          <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-muted)" }} />
        </button>
        <h1
          className="text-[18px] font-bold"
          style={{ color: "var(--md-sys-color-text-primary)" }}
        >
          Profile
        </h1>
        <button
          className="text-sm-bold active:opacity-60 transition-opacity"
          style={{ color: "var(--md-sys-color-brand-coral)" }}
        >
          Log Out
        </button>
      </div>

      {/* Avatar + user info */}
      <div className="flex flex-col items-center px-4 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "#607D8B" }}
        >
          <span className="text-[32px] font-bold" style={{ color: "#fff" }}>N</span>
        </div>
        <h2
          className="text-[22px] font-bold mb-1"
          style={{ color: "var(--md-sys-color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
        >
          Nate Smith
        </h2>
        <p className="text-sm mb-0.5" style={{ color: "var(--md-sys-color-text-muted)" }}>
          nsmith@halosight.com
        </p>
        <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>
          Halosight - Area51
        </p>
      </div>

      {/* Trial-mode card */}
      <div
        className="mx-4 mb-5 px-4 py-4 flex items-start gap-3"
        style={{
          background: "var(--md-sys-color-alpha-neonindigo-10)",
          border: "1px solid rgba(139,146,255,0.18)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <Icon
          name="science"
          size={18}
          style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0, marginTop: 1 }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--md-sys-color-text-primary)" }}>
              Halosight Lite
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--md-sys-color-neonindigo)",
                background: "rgba(139,146,255,0.12)",
                border: "1px solid rgba(139,146,255,0.25)",
                borderRadius: "var(--radius-full)",
                padding: "2px 7px",
                lineHeight: 1.6,
              }}
            >
              Trial
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--md-sys-color-text-muted)", lineHeight: 1.55 }}>
            You're exploring without a CRM connection. All data is local to this session.
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-2 px-4 mb-6">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
            style={{
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span className="text-base-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
              {item.label}
            </span>
            <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
          </button>
        ))}
      </div>

      {/* App version */}
      <p className="text-center text-xs" style={{ color: "var(--md-sys-color-text-disabled)" }}>
        App Version 1.3.5+163
      </p>

    </div>
  );
}
