"use client";

/**
 * FLUTTER HANDOFF: BottomNav
 * Widget: StatelessWidget
 * Flat bar at bottom with raised coral Capture button in center.
 * No active pill — active state is icon + label color only.
 * Tokens: --md-sys-color-dark-base, --md-sys-color-alpha-white-10,
 *         --md-sys-color-brand-coral, --md-sys-color-text-primary,
 *         --md-sys-color-text-muted
 */

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.30273 1.04982C8.30834 0.316728 9.69166 0.316728 10.6973 1.04982L16.8691 5.54982C17.5812 6.06914 18 6.88458 18 7.75001V13.75C18 15.821 16.2728 17.5 14.1426 17.5H11.0576V13.002C11.0576 12.4499 10.6096 12.0022 10.0576 12.002H7.94238C7.39036 12.0022 6.94245 12.4499 6.94238 13.002V17.5H3.85742C1.72721 17.5 4.95815e-05 15.821 0 13.75V7.75001C4.73418e-05 6.88458 0.418799 6.06914 1.13086 5.54982L7.30273 1.04982Z"
        fill={active ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)"}
      />
    </svg>
  );
}

function CompaniesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.8984 11.1592C12.4926 11.1592 14.7626 12.697 15.8662 13.7148C16.6443 14.4326 16.647 15.5215 16.1933 16.3096C15.768 17.0481 14.9801 17.5038 14.1279 17.5039H3.91696C3.04814 17.5037 2.2451 17.039 1.81149 16.2861C1.3709 15.5207 1.34294 14.457 2.0859 13.7256C3.13377 12.6944 5.30781 11.1594 8.8984 11.1592ZM9.00875 0.5C11.3543 0.5 13.2861 2.36179 13.2861 4.69531C13.2861 7.02884 11.3543 8.89062 9.00875 8.89062C6.66339 8.89035 4.73144 7.02867 4.73141 4.69531C4.73144 2.36196 6.6634 0.50027 9.00875 0.5Z"
        fill={active ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)"}
      />
    </svg>
  );
}

interface Props {
  onCaptureTap: () => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "Barlow, system-ui, sans-serif",
  fontSize: 10,
  fontWeight: 600,
  lineHeight: 1,
};

export default function BottomNav({ onCaptureTap }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isCompanies = mode === "accounts";
  const isHome = !isCompanies && (pathname === "/relationships" || pathname === "/home");

  return (
    /* Outer wrapper — 16px side padding + 12px bottom gap so bar floats */
    <div style={{ padding: "0 24px 12px" }}>

      {/* Relative container so Capture button can sit above the bar */}
      <div style={{ position: "relative" }}>

        {/* Capture button — floats above the bar, centered */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%) translateY(calc(-50% + 12px))",
            zIndex: 2,
          }}
        >
          <button
            onClick={onCaptureTap}
            className="active:opacity-80 transition-opacity"
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "var(--md-sys-color-brand-coral)",
              border: "3px solid var(--md-sys-color-dark-base)",
              boxShadow: "0 4px 18px rgba(0,0,0,0.70)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="add" size={26} style={{ color: "white" }} />
          </button>
        </div>

        {/* Nav bar */}
        <nav
          style={{
            display: "flex",
            height: 64,
            background: "rgba(13, 15, 26, 0.78)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          {/* Home */}
          <Link
            href="/relationships"
            className="flex flex-col items-center justify-center gap-1 active:opacity-60 transition-opacity"
            style={{ flex: 1, textDecoration: "none", paddingLeft: 24 }}
          >
            <HomeIcon active={isHome} />
            <span
              style={{
                ...labelStyle,
                color: isHome
                  ? "var(--md-sys-color-text-primary)"
                  : "var(--md-sys-color-text-muted)",
              }}
            >
              Home
            </span>
          </Link>

          {/* Center — spacer + Capture label */}
          <div
            className="flex flex-col items-center justify-end"
            style={{ flex: 1, paddingBottom: 10 }}
          >
            <span style={{ ...labelStyle, color: "var(--md-sys-color-brand-coral)" }}>
              Capture
            </span>
          </div>

          {/* Companies */}
          <Link
            href="/relationships?mode=accounts"
            className="flex flex-col items-center justify-center gap-1 active:opacity-60 transition-opacity"
            style={{ flex: 1, textDecoration: "none", paddingRight: 24 }}
          >
            <CompaniesIcon active={isCompanies} />
            <span
              style={{
                ...labelStyle,
                color: isCompanies
                  ? "var(--md-sys-color-text-primary)"
                  : "var(--md-sys-color-text-muted)",
              }}
            >
              Companies
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
