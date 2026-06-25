"use client";

/**
 * FLUTTER HANDOFF: AccountTypeBadge
 * Widget: StatelessWidget (pill)
 * Purpose: The account-type pill shown on relationship cards, aligned with
 *          the title. Halosight-created prospects read "Lead" (teal); every
 *          other account shows its CRM classification (muted).
 * Tokens: --color-brand-teal, --color-dark-tertiary, --color-text-muted
 */

import type { Account, CrmAccountType } from "@/lib/types";

const CRM_LABEL: Record<CrmAccountType, string> = {
  "sold-to":     "Sold-To",
  "shipped-to":  "Shipped-To",
  "distributor": "Distributor",
  "prospect":    "Prospect",
};

export default function AccountTypeBadge({ account }: { account: Account }) {
  // Halosight-created leads take priority over the CRM classification.
  if (account.halosightType === "prospect") {
    return (
      <span
        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
        style={{ background: "rgba(107, 157, 176, 0.18)", color: "var(--color-brand-teal)" }}
      >
        Lead
      </span>
    );
  }

  if (account.crmAccountType) {
    return (
      <span
        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
        style={{ background: "var(--color-dark-tertiary)", color: "var(--color-text-muted)" }}
      >
        {CRM_LABEL[account.crmAccountType]}
      </span>
    );
  }

  return null;
}
