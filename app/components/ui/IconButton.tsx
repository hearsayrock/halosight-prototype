"use client";

/**
 * FLUTTER HANDOFF: IconButton
 * Widget: StatelessWidget (IconButton with a circular decoration)
 * Props: icon (Material name) or glyph (a custom icon node), label (accessibility), onClick, size (36 | 40 | 44), variant ("filled" | "glass" | "plain"), iconColor?
 *   filled — dark.secondary circle (profile / search buttons)
 *   glass  — translucent dark circle with blur once the screen has scrolled (floating back / more buttons); `scrolled` turns the glass on
 *   plain  — no background (back arrows on a flat header)
 * Flutter equivalent: halosight_icon_button.dart
 * Tokens: color.dark.secondary, color.text.primary / muted, color.alpha.bg-glass, color.alpha.white-10, radius.full
 */

import Icon from "@/components/ui/Icon";

export default function IconButton({
  icon, glyph, label, onClick, size = 40, variant = "filled", scrolled = false, iconColor, iconSize, style,
}: {
  /** Material icon name. Ignored when `glyph` is given. */
  icon?: string;
  /** A custom icon node (e.g. from CustomIcons) instead of a Material name. It should use currentColor. */
  glyph?: React.ReactNode;
  label: string;
  onClick?: () => void;
  size?: 32 | 36 | 40 | 44;
  variant?: "filled" | "glass" | "plain";
  /** glass only: show the blurred translucent background (the screen has scrolled under it). */
  scrolled?: boolean;
  iconColor?: string;
  iconSize?: number;
  style?: React.CSSProperties;
}) {
  const bg =
    variant === "filled" ? "var(--md-sys-color-dark-secondary)" :
    variant === "glass"  ? (scrolled ? "var(--md-sys-color-alpha-bg-glass)" : "transparent") : "transparent";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center flex-shrink-0 active:opacity-60 transition-opacity"
      style={{
        width: size, height: size, borderRadius: "var(--radius-full)", background: bg,
        backdropFilter: variant === "glass" && scrolled ? "blur(16px) saturate(180%)" : undefined,
        boxShadow: variant === "glass" && scrolled ? "inset 0 0 0 1px var(--md-sys-color-alpha-white-10)" : undefined,
        transition: "background 180ms ease",
        ...style,
      }}
    >
      {glyph ? (
        <span className="flex items-center justify-center" style={{ color: iconColor ?? "var(--md-sys-color-text-primary)" }}>{glyph}</span>
      ) : (
        <Icon name={icon ?? "help"} size={iconSize ?? Math.round(size * 0.6)} style={{ color: iconColor ?? "var(--md-sys-color-text-primary)" }} />
      )}
    </button>
  );
}
