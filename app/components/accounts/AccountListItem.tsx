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
        className="flex items-start gap-3 px-4 py-4 active:opacity-70 transition-opacity"
        style={{ borderBottom: "1px solid #2A3042" }}
      >
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0">
          <AccountTypeIcon type={account.type} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px] leading-tight truncate" style={{ color: "#F7F8FF" }}>
              {account.name}
            </span>
            {account.childCount != null && (
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "#2A3042", color: "#C3CAD8" }}
              >
                {account.childCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[13px]" style={{ color: "#8B94A8" }}>
              {formatDistance(account.distanceMiles)}
            </span>
            <span style={{ color: "#5D667A" }}>•</span>
            <span
              className="text-[13px] font-medium"
              style={{ color: isToday ? "#FF6B5A" : "#8B94A8" }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* City/State */}
        {account.city && account.state && (
          <div className="flex-shrink-0 text-right">
            <span className="text-[13px] font-medium" style={{ color: "#8B94A8" }}>
              {account.city}, {account.state}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
