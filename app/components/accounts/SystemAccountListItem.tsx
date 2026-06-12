"use client";

/**
 * FLUTTER HANDOFF: SystemAccountListItem
 * Widget: StatelessWidget (tappable row)
 * Purpose: Shows an account that exists in the CRM but is NOT assigned
 *          to the current rep. Used in the "Search all accounts" results.
 *
 * Key visual differences from AccountListItem:
 *  - No task indicator or last-visited date
 *  - "Assigned to [Rep]" or "Unassigned" shown in place of visited line
 *  - Muted color treatment throughout
 *  - "Not your account" pill badge instead of CRM type badge
 */

import type { Account } from "@/lib/types";
import { formatDistance } from "@/lib/utils";

interface Props {
  account: Account;
  assignedRep: string;
  isLast?: boolean;
  onSelect: (account: Account) => void;
}

export default function SystemAccountListItem({ account, assignedRep, isLast = false, onSelect }: Props) {
  const isUnassigned = assignedRep === "Unassigned";

  return (
    <button
      onClick={() => onSelect(account)}
      className="w-full text-left active:opacity-60 transition-opacity relative"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Separator */}
        {!isLast && (
          <div
            className="absolute bottom-0 left-3 right-3"
            style={{ height: 1, background: "var(--color-dark-secondary)" }}
          />
        )}

        {/* Left — text stack */}
        <div className="flex-1 min-w-0">
          {/* Account name */}
          <span
            className="text-[15px] font-semibold truncate block"
            style={{ color: "var(--color-text-secondary)" }}
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

          {/* Assigned to — only shown when there's a named rep */}
          {!isUnassigned && (
            <p className="text-sm mt-0.5">
              <span style={{ color: "var(--color-text-disabled)" }}>
                Assigned to {assignedRep}
              </span>
            </p>
          )}
        </div>

        {/* Right — "not mine" badge */}
        <div className="flex flex-col items-end justify-between flex-shrink-0" style={{ minHeight: 60 }}>
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
            style={{
              background: "rgba(139,146,255,0.1)",
              color: "var(--color-brand-purple)",
              border: "1px solid rgba(139,146,255,0.2)",
            }}
          >
            {isUnassigned ? "Unassigned" : "Not mine"}
          </span>
        </div>
      </div>
    </button>
  );
}
