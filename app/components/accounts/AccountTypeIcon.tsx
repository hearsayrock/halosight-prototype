/**
 * FLUTTER HANDOFF: AccountTypeIcon
 * Widget: StatelessWidget
 * Props: type (AccountType)
 * Renders stacked squares for corporate, single square for branch/standalone
 * Tokens: text/disabled
 */

import type { AccountType } from "@/lib/types";

export default function AccountTypeIcon({ type }: { type: AccountType }) {
  if (type === "corporate") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="1" y="5" width="13" height="13" rx="2" stroke="#5D667A" strokeWidth="1.5" />
        <rect x="6" y="1" width="13" height="13" rx="2" stroke="#5D667A" strokeWidth="1.5" fill="#111420" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="#5D667A" strokeWidth="1.5" />
    </svg>
  );
}
