"use client";

/**
 * FLUTTER HANDOFF: HalosightTabs
 * Widget: StatelessWidget around TabBar (underline) / a custom SegmentedButton-style row (segmented)
 * Props: tabs ({ id, label }[]), value (selected id), onChange(id), variant ("underline" default | "segmented"), style
 * State: none — the caller owns the selected tab
 * Flutter equivalent: halosight_tabs.dart (TabBar with an UnderlineTabIndicator; segmented is a Container + Row of InkWell)
 *
 * underline (default, the most widely used) — labels in a row, 24px apart, 20px side padding, a hairline (alpha-white-10) along the bottom.
 *   Label 16/600: active color.text.primary, inactive color.text.muted (140ms colour fade). The active tab gets a 2px color.brand.teal
 *   bar the width of its label, sitting on the hairline. 10px above and below each label.
 * segmented (sub-variant) — a pill track (color.dark.primary, radius.full, 4px padding, 4px gap) of equal-width tabs;
 *   the active tab is a color.dark.secondary pill. Label 14/600, same text colours. Use where tabs switch a small control rather than a page.
 *
 * Tokens: color.text.primary, color.text.muted, color.brand.teal, color.alpha.white-10, color.dark.primary, color.dark.secondary, radius.full
 */

import type { CSSProperties } from "react";

export interface TabItem { id: string; label: string }

export default function Tabs({
  tabs, value, onChange, variant = "underline", style,
}: {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: "underline" | "segmented";
  /** Extra styles for the row, e.g. sticky positioning and a background on a scrolling screen. */
  style?: CSSProperties;
}) {
  if (variant === "segmented") {
    return (
      <div
        role="tablist"
        className="flex"
        style={{ padding: "var(--spacing-1)", gap: "var(--spacing-1)", background: "var(--md-sys-color-dark-primary)", borderRadius: "var(--radius-full)", ...style }}
      >
        {tabs.map((t) => {
          const on = t.id === value;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(t.id)}
              className="flex-1 transition-all"
              style={{
                padding: "var(--spacing-2) 0", fontSize: 14, fontWeight: 600, borderRadius: "var(--radius-full)",
                background: on ? "var(--md-sys-color-dark-secondary)" : "transparent",
                color: on ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      style={{
        display: "flex", gap: "var(--spacing-6)", padding: "0 var(--spacing-5)",
        borderBottom: "1px solid var(--md-sys-color-alpha-white-10)",
        ...style,
      }}
    >
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            style={{
              fontSize: 16, fontWeight: 600, fontFamily: "var(--font-sans)", padding: "10px 0",
              color: on ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-muted)",
              boxShadow: on ? "inset 0 -2px 0 0 var(--md-sys-color-brand-teal)" : "none",
              transition: "color 140ms ease",
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
