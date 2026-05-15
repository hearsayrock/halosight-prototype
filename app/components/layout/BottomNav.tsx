"use client";

/**
 * FLUTTER HANDOFF: BottomNav
 * Widget: StatefulWidget (manages active tab state)
 * Props: activeTab ("home" | "accounts")
 * Flutter equivalent: BottomNavigationBar with custom styling
 * Tokens: surface/base, action/primary, text/disabled
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15"
        stroke={active ? "#FF6B5A" : "#5D667A"}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={active ? "#FF6B5A" : "#5D667A"} strokeWidth="1.75" />
      <path
        d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
        stroke={active ? "#FF6B5A" : "#5D667A"}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const isAccounts = pathname.startsWith("/accounts");
  const isHome = !isAccounts;

  return (
    <nav
      className="flex-shrink-0 h-[72px] flex items-center justify-around px-8"
      style={{ background: "#171B29", borderTop: "1px solid #2A3042" }}
    >
      <Link href="/" className="flex flex-col items-center gap-1">
        <HomeIcon active={isHome} />
        <span className="text-xs font-medium" style={{ color: isHome ? "#FF6B5A" : "#5D667A" }}>
          Home
        </span>
      </Link>
      <Link href="/accounts" className="flex flex-col items-center gap-1">
        <AccountsIcon active={isAccounts} />
        <span className="text-xs font-medium" style={{ color: isAccounts ? "#FF6B5A" : "#5D667A" }}>
          Accounts
        </span>
      </Link>
    </nav>
  );
}
