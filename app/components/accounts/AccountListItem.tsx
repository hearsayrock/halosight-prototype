"use client";

/**
 * FLUTTER HANDOFF: AccountListItem
 * Widget: StatelessWidget (tappable row)
 * Props: Account, onTap callback
 * Flutter equivalent: accounts_view_account_list_item.dart
 * Tokens: surface/card, text/primary, text/muted, action/primary (today), border
 * State: none — purely presentational
 */

import Link from "next/link";
import type { Account } from "@/lib/types";
import AccountTypeIcon from "./AccountTypeIcon";
import { formatLastVisited, formatDistance } from "@/lib/utils";

interface Props {
  account: Account;
}

export default function AccountListItem({ account }: Props) {
  const { label, isToday } = formatLastVisited(account.lastVisited);

  return (
    <Link href={`/accounts/${account.id}`}>
      <div
        className="flex items-start gap-3 px-4 py-3 active:opacity-70 transition-opacity"
        style={{
          background: "var(--color-dark-secondary)",
          border: "1px solid var(--color-alpha-white-10)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        {/* Icon — aligned to title baseline */}
        <div className="flex-shrink-0 mt-[3px]">
          <AccountTypeIcon type={account.type} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <span className="heading-6 truncate block" style={{ color: "var(--color-text-primary)" }}>
            {account.name}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {formatDistance(account.distanceMiles)}
            </span>
            <span className="text-sm" style={{ color: "var(--color-text-disabled)" }}>•</span>
            <span
              className="text-sm"
              style={{ color: isToday ? "var(--color-brand-coral)" : "var(--color-text-muted)" }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* City/State — aligned to title */}
        {account.city && account.state && (
          <div className="flex-shrink-0 text-right mt-[2px]">
            <span className="text-sm" style={{ color: "var(--color-brand-purple-light)" }}>
              {account.city}, {account.state}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
