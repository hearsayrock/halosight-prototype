"use client";

/**
 * FLUTTER HANDOFF: SystemAccountListItem
 * Widget: StatelessWidget (tappable row)
 * Purpose: Shows an account that exists in the CRM but is NOT assigned
 *          to the current rep. Used in the "Search all accounts" results.
 *
 * Key visual differences from AccountListItem:
 *  - No task indicator or last-visited date
 *  - "Assigned to [Rep]" shown as the bottom line (no assignee avatar)
 *  - Muted color treatment throughout
 */

import type { Account } from "@/lib/types";
import { formatDistance } from "@/lib/utils";
import AccountTypeBadge from "@/components/accounts/AccountTypeBadge";

interface Props {
  account: Account;
  assignedRep: string;
  isLast?: boolean;
  onSelect: (account: Account) => void;
}

export default function SystemAccountListItem({ account, assignedRep, isLast = false, onSelect }: Props) {
  const location = account.address ?? (account.city && account.state ? `${account.city}, ${account.state}` : null);

  return (
    <button
      onClick={() => onSelect(account)}
      className="w-full text-left active:opacity-60 transition-opacity relative"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Separator */}
        {!isLast && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 1, background: "rgba(255,255,255,0.08)" }}
          />
        )}

        {/* Left — name + location */}
        <div className="flex-1 min-w-0">
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
            {location && (
              <>
                <span className="text-sm" style={{ color: "var(--color-text-disabled)" }}>•</span>
                <span className="text-sm truncate" style={{ color: "var(--color-text-muted)" }}>
                  {location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right — account-type pill + assigned rep beneath it, right-justified */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <AccountTypeBadge account={account} />
          <p className="text-sm text-right whitespace-nowrap">
            <span style={{ color: "var(--color-text-disabled)" }}>Assigned to </span>
            <span className="font-semibold" style={{ color: "var(--color-text-muted)" }}>
              {assignedRep}
            </span>
          </p>
        </div>
      </div>
    </button>
  );
}
