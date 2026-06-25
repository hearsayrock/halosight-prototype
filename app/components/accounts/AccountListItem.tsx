"use client";

/**
 * FLUTTER HANDOFF: AccountListItem
 * Widget: StatelessWidget (tappable row)
 * Props: Account, onTap callback
 * Flutter equivalent: accounts_view_account_list_item.dart
 * State: none — purely presentational
 *
 * Layout: open card (no bg fill), border-bottom separator.
 * Title row:   name + account-type pill (aligned with the title).
 * Visited row: "Visited …" + task indicator + open-opportunity indicator.
 */

import Link from "next/link";
import type { Account } from "@/lib/types";
import { formatLastVisited, formatDistance } from "@/lib/utils";
import { LeadStarIcon, CompanyIcon } from "@/components/ui/CustomIcons";
import AccountTypeBadge from "@/components/accounts/AccountTypeBadge";
import { useAccountState } from "@/lib/context/AccountStateContext";

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

// ── Open-opportunity indicator (lucide briefcase, indigo) ──────────────────────

function BriefcaseIcon({ color }: { color: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function OpportunityIndicator({ count }: { count: number }) {
  if (count === 0) {
    return <BriefcaseIcon color="var(--color-text-disabled)" />;
  }
  return (
    <span
      className="flex items-center gap-1 px-1.5 rounded-full"
      style={{
        background: "rgba(139, 146, 255, 0.20)",
        height: 20,
      }}
    >
      <BriefcaseIcon color="var(--color-brand-purple)" />
      <span
        className="text-[11px] font-semibold"
        style={{ color: "var(--color-brand-purple)", lineHeight: 1 }}
      >
        {count}
      </span>
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  account: Account;
  isLast?: boolean;
}

export default function AccountListItem({ account, isLast = false }: Props) {
  const { label } = formatLastVisited(account.lastVisited);
  const location = account.address ?? (account.city && account.state ? `${account.city}, ${account.state}` : null);
  const { needsAttention } = useAccountState();
  const showAttention = account.halosightType === "prospect" && needsAttention(account.id);

  return (
    <Link href={`/relationships/${account.id}`}>
      <div
        className="flex items-start gap-3 px-4 py-3.5 active:opacity-70 transition-opacity relative"
      >
        {/* Separator — inset 12px each side, hidden on last item */}
        {!isLast && <div className="absolute bottom-0 left-3 right-3" style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />}

        {/* Type icon */}
        <div className="flex-shrink-0 mt-[4px]">
          {account.halosightType === "prospect" ? (
            <LeadStarIcon size={18} style={{ color: "var(--color-brand-purple)" }} />
          ) : (
            <CompanyIcon size={18} style={{ color: "var(--color-text-disabled)" }} />
          )}
        </div>

        {/* Left — 3-line text stack */}
        <div className="flex-1 min-w-0">
          {/* Title row — name + account-type pill (aligned with the title) */}
          <div className="flex items-center gap-2">
            <span
              className="text-[16px] font-semibold truncate flex-1 min-w-0"
              style={{ color: "var(--color-text-primary)" }}
            >
              {account.name}
            </span>
            {showAttention && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                style={{ background: "rgba(245,166,35,0.15)", color: "var(--color-warning)", border: "1px solid rgba(245,166,35,0.3)" }}
              >
                Needs Info
              </span>
            )}
            <AccountTypeBadge account={account} />
          </div>

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

          {/* Visited + task / opportunity indicators (aligned on one line) */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-sm">
              <span style={{ color: "var(--color-text-disabled)" }}>Visited </span>
              <span className="font-semibold" style={{ color: "var(--color-text-muted)" }}>
                {label}
              </span>
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {account.taskCount !== undefined && <TaskIndicator count={account.taskCount} />}
              {account.openOpportunities !== undefined && <OpportunityIndicator count={account.openOpportunities} />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
