"use client";

/**
 * Design-system previews for the menu triggers (FilterDropdown, VisitedFilterDropdown, KebabMenu). Prototype-only: each one is live,
 * so tap the trigger and the real menu opens. The preview boxes reserve height so an opened menu is not clipped.
 */

import { useState } from "react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import VisitedFilterDropdown, { type VisitedFilter } from "@/components/ui/VisitedFilterDropdown";
import KebabMenu from "@/components/ui/KebabMenu";

const box = { padding: 16, minHeight: 170 } as const;

export function FilterDropdownPreview({ initial = "open" }: { initial?: "open" | "done" }) {
  const [v, setV] = useState<"open" | "done">(initial);
  return (
    <div style={box}>
      <FilterDropdown
        options={[{ value: "open" as const, label: "Open" }, { value: "done" as const, label: "Done" }]}
        value={v}
        onChange={setV}
      />
    </div>
  );
}

export function SortFilterPreview() {
  const [v, setV] = useState<"dueDate" | "account">("dueDate");
  return (
    <div style={box}>
      <FilterDropdown
        options={[{ value: "dueDate" as const, label: "Due Date" }, { value: "account" as const, label: "Company" }]}
        value={v}
        onChange={setV}
      />
    </div>
  );
}

export function VisitedFilterPreview() {
  const [v, setV] = useState<VisitedFilter>("all");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  return (
    <div style={{ ...box, minHeight: 560 }}>
      <VisitedFilterDropdown value={v} customFrom={from} customTo={to} onChange={(nv, f, t) => { setV(nv); setFrom(f ?? null); setTo(t ?? null); }} />
    </div>
  );
}

export function KebabMenuPreview() {
  return (
    <div className="flex justify-end" style={box}>
      <KebabMenu
        items={[
          { label: "Edit", icon: "edit", onClick: () => {} },
          { label: "Share", icon: "ios_share", onClick: () => {} },
          { label: "Delete", icon: "delete", destructive: true, onClick: () => {} },
        ]}
      />
    </div>
  );
}
