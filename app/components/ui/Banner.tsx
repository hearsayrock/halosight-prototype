"use client";

/**
 * FLUTTER HANDOFF: Banner
 * Widget: StatelessWidget
 * Props: tone ("info" | "warning"), icon (Material name; default per tone), children (the message)
 * Layout: inline message card inside a screen: icon top-aligned, text 12/muted-secondary, radius.md, 1px tinted stroke over a faint tint
 * Flutter equivalent: halosight_banner.dart
 * Tokens: color.neonindigo.base / color.warning (icon, tint 8%, stroke 20%), color.text.secondary (message), radius.md, spacing.3/4
 */

import Icon from "@/components/ui/Icon";

const TONE = {
  info:    { color: "var(--md-sys-color-neonindigo)", icon: "info" },
  warning: { color: "var(--md-sys-color-warning)",    icon: "warning" },
} as const;

export default function Banner({
  tone = "info", icon, children, className,
}: {
  tone?: keyof typeof TONE;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      role="note"
      className={`flex items-start ${className ?? ""}`}
      style={{
        gap: "var(--spacing-3)", padding: "var(--spacing-3) var(--spacing-4)", borderRadius: "var(--radius-md)",
        background: `color-mix(in srgb, ${t.color} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${t.color} 20%, transparent)`,
      }}
    >
      <Icon name={icon ?? t.icon} size={16} style={{ color: t.color, flexShrink: 0, marginTop: 1 }} />
      <span className="body-xs" style={{ color: "var(--md-sys-color-text-secondary)", lineHeight: 1.4 }}>{children}</span>
    </div>
  );
}
