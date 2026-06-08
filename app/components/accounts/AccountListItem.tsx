"use client";

/**
 * FLUTTER HANDOFF: AccountListItem
 * Widget: StatelessWidget (tappable row)
 * Props: Account, onTap callback
 * Flutter equivalent: accounts_view_account_list_item.dart
 * State: none — purely presentational
 *
 * Layout: open card (no bg fill), border-bottom separator.
 * Right column: CRM account type badge (top) + task check + assignee initial (bottom).
 */

import Link from "next/link";
import type { Account, CrmAccountType } from "@/lib/types";
import { formatLastVisited, formatDistance } from "@/lib/utils";

// ── CRM account type badge ────────────────────────────────────────────────────

const CRM_LABEL: Record<CrmAccountType, string> = {
  "sold-to":    "Sold-To",
  "shipped-to": "Shipped-To",
  "distributor":"Distributor",
  "prospect":   "Prospect",
};

function AccountTypeBadge({ type }: { type: CrmAccountType }) {
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{
        background: "var(--color-dark-tertiary)",
        color: "var(--color-text-muted)",
      }}
    >
      {CRM_LABEL[type]}
    </span>
  );
}

// ── Task check icon ───────────────────────────────────────────────────────────

function TaskIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M4.5 6L5.5 7L7.5 5M2.5 1.5H9.5C10.0523 1.5 10.5 1.94772 10.5 2.5V9.5C10.5 10.0523 10.0523 10.5 9.5 10.5H2.5C1.94772 10.5 1.5 10.0523 1.5 9.5V2.5C1.5 1.94772 1.94772 1.5 2.5 1.5Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TaskIndicator({ count }: { count: number }) {
  if (count === 0) {
    return <TaskIcon color="var(--color-text-disabled)" />;
  }
  return (
    <span
      className="flex items-center gap-1 px-1.5 rounded-full"
      style={{
        background: "rgba(255, 143, 130, 0.20)",
        height: 20,
      }}
    >
      <TaskIcon color="var(--color-brand-coral-light)" />
      <span
        className="text-[11px] font-semibold"
        style={{ color: "var(--color-brand-coral-light)", lineHeight: 1 }}
      >
        {count}
      </span>
    </span>
  );
}

// ── Assignee initial circle ───────────────────────────────────────────────────

function AssigneeCircle({ initial }: { initial: string }) {
  return (
    <span
      className="flex items-center justify-center rounded-full text-[11px] font-semibold flex-shrink-0"
      style={{
        width: 22,
        height: 22,
        background: "var(--color-dark-tertiary)",
        color: "var(--color-text-muted)",
      }}
    >
      {initial}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  account: Account;
}

export default function AccountListItem({ account }: Props) {
  const { label, isToday } = formatLastVisited(account.lastVisited);

  return (
    <Link href={`/accounts/${account.id}`}>
      <div
        className="flex items-start gap-3 px-4 py-3.5 active:opacity-70 transition-opacity"
        style={{ borderBottom: "1px solid var(--color-dark-tertiary)" }}
      >
        {/* Left — 3-line text stack */}
        <div className="flex-1 min-w-0">
          {/* Account name */}
          <span
            className="text-[16px] font-semibold truncate block"
            style={{ color: "var(--color-text-primary)" }}
          >
            {account.name}
          </span>

          {/* Distance • location */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {formatDistance(account.distanceMiles)}
            </span>
            {account.city && account.state && (
              <>
                <span className="text-sm" style={{ color: "var(--color-text-disabled)" }}>•</span>
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {account.city}, {account.state}
                </span>
              </>
            )}
          </div>

          {/* Visited */}
          <p className="text-sm mt-0.5">
            <span style={{ color: "var(--color-text-disabled)" }}>Visited </span>
            <span
              className="font-semibold"
              style={{ color: isToday ? "var(--color-brand-coral)" : "var(--color-text-muted)" }}
            >
              {label}
            </span>
          </p>
        </div>

        {/* Right — badge top, task + assignee bottom */}
        <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0" style={{ minHeight: 60 }}>
          {/* CRM account type badge */}
          {account.crmAccountType && (
            <AccountTypeBadge type={account.crmAccountType} />
          )}

          {/* Task indicator + assignee */}
          <div className="flex items-center gap-1.5">
            {account.taskCount !== undefined && (
              <TaskIndicator count={account.taskCount} />
            )}
            {account.assignedInitial && (
              <AssigneeCircle initial={account.assignedInitial} />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
