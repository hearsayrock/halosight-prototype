"use client";

/**
 * FLUTTER HANDOFF: SectionHeader
 * Widget: StatelessWidget
 * Props: label, count?, onAdd? (round "+" button, with addLabel for accessibility), divider? (label centered between two hairlines)
 * Layout: 16px sides, 8px vertical. Default: small uppercase label + a count pill on the left, optional add button on the right.
 * Flutter equivalent: section_header.dart
 * Tokens: color.text.muted (label), color.text.disabled + color.dark.secondary (count pill), color.alpha.white-10 (divider lines),
 *         color.neonindigo.base (add), radius.full, spacing.2/3/4
 */

import Icon from "@/components/ui/Icon";
import type { ReactNode } from "react";

export default function SectionHeader({
  label, count, onAdd, addLabel = "Add", divider = false, trailing, compact = false,
}: {
  label: string;
  count?: number;
  onAdd?: () => void;
  addLabel?: string;
  divider?: boolean;
  trailing?: ReactNode;
  compact?: boolean;
}) {
  if (divider) {
    const line = { flex: 1, height: 1, background: "var(--md-sys-color-alpha-white-10)" } as const;
    return (
      <div className="flex items-center" style={{ gap: "var(--spacing-3)", padding: "var(--spacing-2) var(--spacing-4)" }}>
        <div style={line} />
        <span className="text-11-bold whitespace-nowrap" style={{ letterSpacing: "0.05em", color: "var(--md-sys-color-text-muted)" }}>{label}</span>
        <div style={line} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between" style={{ padding: compact ? "4px 16px" : "var(--spacing-2) var(--spacing-4)", minHeight: compact ? 40 : undefined }}>
      <div className="flex items-center" style={{ gap: "var(--spacing-2)" }}>
        <span className="text-11-bold" style={{ letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--md-sys-color-text-muted)" }}>{label}</span>
        {count !== undefined && (
          <span className="text-11-bold" style={{ color: "var(--md-sys-color-text-disabled)", background: "var(--md-sys-color-dark-secondary)", borderRadius: "var(--radius-full)", padding: "1px 7px" }}>{count}</span>
        )}
      </div>
      {trailing ?? (onAdd && (
        <button
          type="button"
          onClick={onAdd}
          aria-label={addLabel}
          className="flex items-center justify-center active:opacity-60 transition-opacity"
          style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", background: "color-mix(in srgb, var(--md-sys-color-neonindigo) 15%, transparent)" }}
        >
          <Icon name="add" size={18} style={{ color: "var(--md-sys-color-neonindigo)" }} />
        </button>
      ))}
    </div>
  );
}
