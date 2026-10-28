"use client";

/**
 * FLUTTER HANDOFF: AccountListItem
 * Widget: StatelessWidget (tappable row) with a `variant`
 * Props: account (Account), isLast (hides the separator),
 *        variant ("owned" default | "crm" | "home"), ownerName + onSelect (crm only)
 * State: none — purely presentational. The owned variant reads needs-attention from AccountStateContext.
 * Data: Account (lib/types) — name, distanceMiles, address | city/state, lastVisited,
 *       halosightType, crmAccountType, taskCount, riskCount. The crm variant also takes the owner's name.
 * Flutter equivalent: accounts_view_account_list_item.dart (one widget; variant is an enum)
 *
 * owned (default) — a company in the rep's portfolio. Navigates to /relationships/:id.
 *   Open row (no card fill), 1px separator inset 16px each side. Left: name, distance • location,
 *   "Visited <recency>". Right (bottom-aligned): Lead / Needs Info pill when relevant, then
 *   <CountBadge> risk and <CountBadge> tasks (8px apart, each hidden at 0). No assignee indicator.
 *
 * crm — a CRM account owned by another rep (company-wide search results). A button: calls onSelect.
 *   Two lines: name (color.text.primary, 17px/600) and "Owner: <ownerName>" (color.text.muted, 13px/400),
 *   with a trailing chevron_right (20px, color.text.muted). No distance, address, visit line or badges.
 *   Rows are 19px vertical padding with a full-width color.dark.tertiary separator. Rows sit inside
 *   <ListCard> (components/ui/ListCard.tsx).
 *
 * home — the compact row in the home screen's Companies card. Navigates to /relationships/:id.
 *   Name (17px/600, color.text.primary) and "<distance> mi · <address>" (13px, color.text.muted), 13px row
 *   padding (71px with separator). Right: a warning `error` icon when a lead needs info, then <CountBadge>
 *   risk and tasks (8px apart, each hidden at 0). No chevron — the space goes to the badges. Sits in <ListCard>.
 *
 * Count badges are the shared CountBadge component (components/accounts/CountBadge.tsx).
 *
 * Tokens: color.text.primary, color.text.muted, color.text.disabled, color.dark.tertiary (row separators),
 *         color.brand.teal (Lead pill), color.semantic.warning (Needs Info pill)
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { Account, CrmAccountType } from "@/lib/types";
import { formatLastVisited, formatDistance } from "@/lib/utils";
import CountBadge from "@/components/accounts/CountBadge";
import { LeadStarIcon, CompanyIcon } from "@/components/ui/CustomIcons";
import { useAccountState } from "@/lib/context/AccountStateContext";

// ── Prospect badge (Halosight-created) ───────────────────────────────────────

function ProspectBadge() {
  return (
    <span
      className="text-11-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{
        background: "color-mix(in srgb, var(--md-sys-color-brand-teal) 18%, transparent)",
        color: "var(--md-sys-color-brand-teal)",
      }}
    >
      Lead
    </span>
  );
}

// ── CRM account type badge ────────────────────────────────────────────────────

const CRM_LABEL: Record<CrmAccountType, string> = {
  "sold-to":    "Sold-To",
  "shipped-to": "Shipped-To",
  "distributor":"Distributor",
  "prospect":   "Prospect",
};

function CrmTypeBadge({ type }: { type: CrmAccountType }) {
  return (
    <span
      className="text-11-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{
        background: "var(--md-sys-color-dark-tertiary)",
        color: "var(--md-sys-color-text-muted)",
      }}
    >
      {CRM_LABEL[type]}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  account: Account;
  isLast?: boolean;
  /** "owned" (default): a company in the rep's portfolio. "crm": a CRM account assigned to someone else.
   *  "home": the compact row in the home screen's Companies card. */
  variant?: "owned" | "crm" | "home";
  /** crm variant only — the owning rep's name, shown as "Owner: <name>". */
  ownerName?: string;
  /** crm variant only — called on tap instead of navigating. */
  onSelect?: (account: Account) => void;
}

export default function AccountListItem({ variant = "owned", ownerName, onSelect, ...rest }: Props) {
  if (variant === "home") return <HomeAccountRow {...rest} />;
  if (variant === "crm") return <CrmAccountRow {...rest} ownerName={ownerName ?? "Unknown"} onSelect={onSelect} />;
  return <OwnedAccountRow {...rest} />;
}

// ── crm variant: account assigned to another rep (company-wide search results) ─

function CrmAccountRow({
  account, isLast = false, ownerName, onSelect,
}: { account: Account; isLast?: boolean; ownerName: string; onSelect?: (account: Account) => void }) {
  return (
    <button
      onClick={() => onSelect?.(account)}
      className="w-full text-left active:opacity-60 transition-opacity relative"
    >
      <div className="flex items-center gap-3 px-4 py-[19px]">
        {/* Separator — full width in this variant */}
        {!isLast && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 1, background: "var(--md-sys-color-dark-tertiary)" }}
          />
        )}

        {/* Left — name + owner (no visit date, no badges: the rep doesn't own this account) */}
        <div className="flex-1 min-w-0">
          <span
            className="truncate block"
            style={{ fontSize: 17, fontWeight: 600, lineHeight: "24px", color: "var(--md-sys-color-text-primary)" }}
          >
            {account.name}
          </span>
          <p className="truncate mt-0.5" style={{ fontSize: 13, lineHeight: "19px", color: "var(--md-sys-color-text-muted)" }}>
            Owner: {ownerName}
          </p>
        </div>

        <Icon name="chevron_right" size={20} style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0 }} />
      </div>
    </button>
  );
}

// ── home variant: compact row in the home screen's Companies card ─────────────

function HomeAccountRow({ account, isLast = false }: { account: Account; isLast?: boolean }) {
  const { needsAttention } = useAccountState();
  const showAttention = account.halosightType === "prospect" && needsAttention(account.id);
  const meta = [
    account.distanceMiles < 999 ? `${account.distanceMiles} mi` : null,
    account.address ?? (account.city && account.state ? `${account.city}, ${account.state}` : null),
  ].filter(Boolean).join(" · ");

  return (
    <Link href={`/relationships/${account.id}`}>
      <div className="flex items-center gap-3 px-4 py-[13px] active:opacity-70 transition-opacity relative">
        {!isLast && (
          <div className="absolute bottom-0 left-0 right-0" style={{ height: 1, background: "var(--md-sys-color-dark-tertiary)" }} />
        )}

        {/* Left — name + distance · address */}
        <div className="flex-1 min-w-0">
          <span
            className="truncate block"
            style={{ fontSize: 17, fontWeight: 600, lineHeight: "24px", color: "var(--md-sys-color-text-primary)" }}
          >
            {account.name}
          </span>
          <p className="truncate mt-0.5" style={{ fontSize: 13, lineHeight: "19px", color: "var(--md-sys-color-text-muted)" }}>
            {meta}
          </p>
        </div>

        {/* Right — needs-info marker + count badges (each hidden at 0). No chevron: the row is the tap target. */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showAttention && (
            <Icon name="error" fill size={15} style={{ color: "var(--md-sys-color-warning)" }} />
          )}
          <CountBadge tone="risk" count={account.riskCount} label="open risks" />
          <CountBadge tone="tasks" count={account.taskCount} label="open tasks" />
        </div>
      </div>
    </Link>
  );
}

// ── owned variant: a company in the rep's portfolio ───────────────────────────

function OwnedAccountRow({ account, isLast = false }: { account: Account; isLast?: boolean }) {
  const { label, isToday } = formatLastVisited(account.lastVisited);
  const location = account.address ?? (account.city && account.state ? `${account.city}, ${account.state}` : null);
  const { needsAttention } = useAccountState();
  const showAttention = account.halosightType === "prospect" && needsAttention(account.id);

  return (
    <Link href={`/relationships/${account.id}`}>
      <div
        className="flex items-start gap-3 px-4 py-3.5 active:opacity-70 transition-opacity relative"
      >
        {/* Separator — inset 16px each side, hidden on last item */}
        {!isLast && <div className="absolute bottom-0 left-4 right-4" style={{ height: 1, background: "var(--md-sys-color-alpha-white-10)" }} />}

        {/* Type icon — hidden for now, may restore later
        <div className="flex-shrink-0 mt-[4px]">
          {account.halosightType === "prospect" ? (
            <LeadStarIcon size={18} style={{ color: "var(--md-sys-color-neonindigo)" }} />
          ) : (
            <CompanyIcon size={18} style={{ color: "var(--md-sys-color-text-disabled)" }} />
          )}
        </div>
        */}

        {/* Left — 3-line text stack */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="text-base-bold truncate"
              style={{ color: "var(--md-sys-color-text-primary)" }}
            >
              {account.name}
            </span>
          </div>

          {/* Distance • location */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>
              {formatDistance(account.distanceMiles)}
            </span>
            {location && (
              <>
                <span className="text-sm" style={{ color: "var(--md-sys-color-text-disabled)" }}>•</span>
                <span className="text-sm truncate" style={{ color: "var(--md-sys-color-text-muted)" }}>
                  {location}
                </span>
              </>
            )}
          </div>

          {/* Visited */}
          <p className="text-sm mt-0.5">
            <span style={{ color: "var(--md-sys-color-text-disabled)" }}>Visited </span>
            <span className="font-semibold" style={{ color: "var(--md-sys-color-text-muted)" }}>
              {label}
            </span>
          </p>
        </div>

        {/* Right — badge top (leads only), task + assignee bottom */}
        <div className={`flex flex-col items-end gap-2 flex-shrink-0 ${account.halosightType === "prospect" ? "justify-between" : "justify-end"}`} style={{ minHeight: 60 }}>
          {account.halosightType === "prospect" && <ProspectBadge />}
          {showAttention && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: "color-mix(in srgb, var(--md-sys-color-warning) 15%, transparent)", color: "var(--md-sys-color-warning)", border: "1px solid color-mix(in srgb, var(--md-sys-color-warning) 30%, transparent)" }}
            >
              Needs Info
            </span>
          )}

          {/* Count badges + assignee */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center" style={{ gap: "var(--spacing-2)" }}>
              <CountBadge tone="risk" count={account.riskCount} label="open risks" />
              <CountBadge tone="tasks" count={account.taskCount} label="open tasks" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
