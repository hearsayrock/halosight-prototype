"use client";

/**
 * FLUTTER HANDOFF: CountBadge
 * Widget: StatelessWidget (non-interactive pill)
 * Props: tone ("risk" | "tasks"), count (number?), label (screen-reader noun, e.g. "open risks")
 * State: none — purely presentational
 * Data: Account.riskCount / Account.taskCount (lib/types)
 * Flutter equivalent: account_count_badge.dart
 *
 * Icon + number pill. Renders nothing when count is 0 or undefined — there is no empty or grey state.
 *   - risk:  `warning` icon (14.5px), error tone
 *   - tasks: `check_box` icon (21.3px), indigo tone
 * 22.5px tall, full radius. Icon sits in a 24px slot, 4.4px gap to the number, number is Barlow 500 11.5px.
 * Padding: 7.8px left (icon slot), 12.4px right. Role "img" with an aria-label like "2 open risks".
 *
 * Tokens: color.semantic.error (bg 18%), color.semantic.error-light (icon + number),
 *         color.neonindigo.base (bg 20%), color.neonindigo.light (icon + number), radius.full
 */

import Icon from "@/components/ui/Icon";

const TONE = {
  risk: {
    icon: "warning",
    iconSize: 14.5,
    bg: "color-mix(in srgb, var(--md-sys-color-error) 18%, transparent)",
    fg: "var(--md-sys-color-error-light)",
  },
  tasks: {
    icon: "check_box",
    iconSize: 21.3,
    bg: "color-mix(in srgb, var(--md-sys-color-neonindigo) 20%, transparent)",
    fg: "var(--md-sys-color-neonindigo-light)",
  },
} as const;

export type CountBadgeTone = keyof typeof TONE;

interface Props {
  tone: CountBadgeTone;
  count?: number;
  label: string;
}

export default function CountBadge({ tone, count, label }: Props) {
  if (!count || count <= 0) return null;
  const t = TONE[tone];
  return (
    <span
      role="img"
      aria-label={`${count} ${label}`}
      className="flex items-center flex-shrink-0"
      style={{
        height: 22.5,
        padding: "0 12.4px 0 7.8px",
        gap: 4.4,
        borderRadius: "var(--radius-full)",
        background: t.bg,
        color: t.fg,
      }}
    >
      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 24, height: "100%" }}>
        <Icon name={t.icon} size={t.iconSize} style={{ color: "inherit" }} />
      </span>
      <span style={{ fontSize: 11.5, fontWeight: 500, lineHeight: 1 }}>{count}</span>
    </span>
  );
}
