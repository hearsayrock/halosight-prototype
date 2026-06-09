"use client";

/**
 * FLUTTER HANDOFF: BottomNav
 * Widget: StatefulWidget (manages active tab state)
 * Floating pill nav — 66px tall, 32px from bottom & sides.
 * Background: --color-alpha-purple-glass (liquid glass)
 * Active pill: --color-alpha-dark-glass, inset 6px top/bottom/outer-edge
 * Tokens: text/primary (active), text/muted (inactive)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.30273 1.04982C8.30834 0.316728 9.69166 0.316728 10.6973 1.04982L16.8691 5.54982C17.5812 6.06914 18 6.88458 18 7.75001V13.75C18 15.821 16.2728 17.5 14.1426 17.5H11.0576V13.002C11.0576 12.4499 10.6096 12.0022 10.0576 12.002H7.94238C7.39036 12.0022 6.94245 12.4499 6.94238 13.002V17.5H3.85742C1.72721 17.5 4.95815e-05 15.821 0 13.75V7.75001C4.73418e-05 6.88458 0.418799 6.06914 1.13086 5.54982L7.30273 1.04982Z"
        fill={active ? "var(--color-text-primary)" : "var(--color-text-muted)"}
      />
    </svg>
  );
}

function AccountsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.8984 11.1592C12.4926 11.1592 14.7626 12.697 15.8662 13.7148C16.6443 14.4326 16.647 15.5215 16.1933 16.3096C15.768 17.0481 14.9801 17.5038 14.1279 17.5039H3.91696C3.04814 17.5037 2.2451 17.039 1.81149 16.2861C1.3709 15.5207 1.34294 14.457 2.0859 13.7256C3.13377 12.6944 5.30781 11.1594 8.8984 11.1592ZM9.00875 0.5C11.3543 0.5 13.2861 2.36179 13.2861 4.69531C13.2861 7.02884 11.3543 8.89062 9.00875 8.89062C6.66339 8.89035 4.73144 7.02867 4.73141 4.69531C4.73144 2.36196 6.6634 0.50027 9.00875 0.5Z"
        fill={active ? "var(--color-text-primary)" : "var(--color-text-muted)"}
      />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const isAccounts = pathname.startsWith("/accounts");
  const isHome = pathname.startsWith("/home") || pathname === "/";

  return (
    /* Outer wrapper: 32px padding on sides and bottom */
    <div className="flex-shrink-0 px-8 pb-8">
      <nav
        className="relative flex items-center"
        style={{
          width: 230,
          height: 66,
          borderRadius: "var(--radius-full)",
          background: "var(--color-alpha-purple-glass)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid var(--color-alpha-white-10)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Active pill — slides between halves, 6px inset top/bottom/outer-edge */}
        <div
          className="absolute"
          style={{
            top: 6,
            bottom: 6,
            left: isHome ? 6 : "50%",
            right: isAccounts ? 6 : "50%",
            background: "var(--color-alpha-dark-glass)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "var(--radius-full)",
            transition: "left 0.2s ease, right 0.2s ease",
          }}
        />

        {/* Home */}
        <Link
          href="/home"
          className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 h-full"
        >
          <HomeIcon active={isHome} />
          <span className="label-serif" style={{ color: isHome ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
            Home
          </span>
        </Link>

        {/* Accounts */}
        <Link
          href="/accounts"
          className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 h-full"
        >
          <AccountsIcon active={isAccounts} />
          <span className="label-serif" style={{ color: isAccounts ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
            Accounts
          </span>
        </Link>
      </nav>
    </div>
  );
}
