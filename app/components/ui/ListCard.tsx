/**
 * FLUTTER HANDOFF: ListCard
 * Widget: StatelessWidget (container — wraps a column of rows)
 * Props: children (the rows), className (outer spacing, e.g. "mx-4")
 * State: none
 * Flutter equivalent: list_card.dart (Container + ClipRRect + Column)
 *
 * The filled card that holds a list of rows: dark-primary fill, 1px hairline border, radius.lg, rows clipped
 * to the corners. Rows draw their own full-width separators (the last row omits it). No padding of its own,
 * so the first and last rows get the same padding as every other row.
 * Used by AccountListItem (crm + home variants) and ActionItemList.
 *
 * Tokens: color.dark.primary, color.alpha.white-10 (border), radius.lg
 */

import type { ReactNode } from "react";

export default function ListCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col overflow-hidden ${className}`}
      style={{
        borderRadius: "var(--radius-lg)",
        background: "var(--md-sys-color-dark-primary)",
        border: "1px solid var(--md-sys-color-alpha-white-10)",
      }}
    >
      {children}
    </div>
  );
}
