"use client";

/**
 * FLUTTER HANDOFF: ProfileScreen
 * Route: /profile
 * Reached via the profile button on Home or Accounts.
 * Tokens: --color-background, --color-dark-secondary, --color-text-primary,
 *         --color-text-muted, --color-text-disabled, --color-brand-coral, --radius-md
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
    <div className="flex flex-col h-full" style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-6">
        <button
          onClick={() => router.back()}
          className="p-1 active:opacity-60 transition-opacity"
        >
          <Icon name="arrow_back" size={22} style={{ color: "var(--color-text-muted)" }} />
        </button>
        <h1
          className="text-[18px] font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Profile
        </h1>
        <button
          className="text-sm font-semibold active:opacity-60 transition-opacity"
          style={{ color: "var(--color-brand-coral)" }}
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
          style={{ color: "var(--color-text-primary)", fontFamily: "Roboto Slab, Georgia, serif" }}
        >
          Nate Smith
        </h2>
        <p className="text-sm mb-0.5" style={{ color: "var(--color-text-muted)" }}>
          nsmith@halosight.com
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Halosight - Area51
        </p>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-2 px-4 mb-6">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-between px-4 py-4 active:opacity-70 transition-opacity"
            style={{
              background: "var(--color-dark-secondary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {item.label}
            </span>
            <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)" }} />
          </button>
        ))}
      </div>

      {/* App version */}
      <p className="text-center text-xs" style={{ color: "var(--color-text-disabled)" }}>
        App Version 1.3.5+163
      </p>

    </div>
  );
}
