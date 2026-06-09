"use client";

/**
 * FLUTTER HANDOFF: ActionItemCard
 * Widget: StatelessWidget (tap opens task detail)
 * Props: ActionItem
 * Flutter equivalent: action_item_card.dart
 * Tokens: --color-dark-tertiary (border, 80% opacity), --color-text-primary (title),
 *         --color-text-secondary (due date), --color-brand-purple-dark (calendar icon),
 *         --color-text-disabled (checkbox + chevron), --radius-md
 */

import Icon from "@/components/ui/Icon";
import type { ActionItem } from "@/lib/types";

function formatDueDate(date: Date | null): string {
  if (!date) return "TBD";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

interface Props {
  item: ActionItem;
}

export default function ActionItemCard({ item }: Props) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        border: "1px solid color-mix(in srgb, var(--color-dark-tertiary) 80%, transparent)",
        borderRadius: "var(--radius-md)",
      }}
    >
      {/* Checkbox circle */}
      <div
        className="flex-shrink-0 w-5 h-5 rounded-full"
        style={{ border: "1.5px solid var(--color-text-disabled)" }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
          {item.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Icon name="calendar_today" size={11} style={{ color: "var(--color-brand-purple-dark)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {formatDueDate(item.dueDate)}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <Icon name="chevron_right" size={18} style={{ color: "var(--color-text-disabled)", flexShrink: 0 }} />
    </div>
  );
}
