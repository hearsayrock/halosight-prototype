"use client";

/**
 * FLUTTER HANDOFF: ActionItemCard
 * Widget: StatelessWidget (tap opens task detail)
 * Props: ActionItem
 * Flutter equivalent: action_item_card.dart
 * Tokens: --md-sys-color-dark-tertiary (border, 80% opacity), --md-sys-color-text-primary (title),
 *         --md-sys-color-text-secondary (due date), --md-sys-color-neonindigo-dark (calendar icon),
 *         --md-sys-color-text-disabled (checkbox + chevron), --radius-md
 */

import Icon from "@/components/ui/Icon";
import type { ActionItem } from "@/lib/types";

function formatDueDate(date: Date | null): string {
  if (!date) return "TBD";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

interface Props {
  item: ActionItem;
  onComplete?: () => void;
  pending?: boolean;
}

export default function ActionItemCard({ item, onComplete, pending = false }: Props) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        border: "1px solid color-mix(in srgb, var(--md-sys-color-dark-tertiary) 80%, transparent)",
        borderRadius: "var(--radius-md)",
      }}
    >
      {/* Checkbox circle */}
      <button
        className="flex-shrink-0 w-5 h-5 rounded-full transition-all flex items-center justify-center"
        style={pending
          ? { background: "#2ECC71", border: "1.5px solid #2ECC71" }
          : { border: "1.5px solid var(--md-sys-color-text-disabled)" }
        }
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onComplete?.(); }}
        aria-label="Complete item"
      >
        {pending && <Icon name="check" size={12} style={{ color: "#fff" }} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-15-bold leading-snug" style={{ color: "var(--md-sys-color-text-primary)" }}>
          {item.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Icon name="calendar_today" size={11} style={{ color: "var(--md-sys-color-neonindigo-dark)" }} />
          <span className="text-xs" style={{ color: "var(--md-sys-color-text-secondary)" }}>
            {formatDueDate(item.dueDate)}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-text-disabled)", flexShrink: 0 }} />
    </div>
  );
}
