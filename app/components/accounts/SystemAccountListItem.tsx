"use client";

/**
 * FLUTTER HANDOFF: SystemAccountListItem
 * Widget: StatelessWidget (tappable row)
 * Purpose: Shows an account that exists in the CRM but is NOT assigned
 *          to the current rep. Used in the "Search all accounts" results.
 *
 * Key visual differences from AccountListItem:
 *  - No task indicator or last-visited date
 *  - "Assigned to [Rep]" shown below location
 *  - Muted color treatment throughout
 *  - Assignee initial avatar on the right instead of a pill badge
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
  const initial = assignedRep.charAt(0).toUpperCase();

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

        </div>

        {/* Right — assignee initial avatar */}
        <div className="flex items-start pt-0.5 flex-shrink-0">
          <div
            className="flex items-center justify-center rounded-full text-[13px] font-semibold"
            style={{
              width: 28,
              height: 28,
              background: "var(--color-dark-tertiary)",
              color: "var(--color-text-muted)",
            }}
          >
            {initial}
          </div>
        </div>
      </div>
    </button>
  );
}
