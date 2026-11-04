"use client";

/**
 * FLUTTER HANDOFF: HalosightButton
 * Widget: StatelessWidget wrapping FilledButton / FilledButton.tonal / OutlinedButton / TextButton
 * Props: variant ("filled" | "tonal" | "outlined" | "text"), tone ("default" | "indigo" | "danger"; outlined only),
 *        size ("md" | "sm"), loading, loadingLabel, icon, disabled, onClick, children
 * State: none — the caller owns `loading`
 * Flutter equivalent: halosight_button.dart (loading swaps the child for ThinkingDots inside an AnimatedSwitcher)
 *
 * Loading: the label stays in layout (invisible) and ThinkingDots sits centred in the same cell, so the button keeps its size and
 * nothing jumps when an action starts. Pass loadingLabel ("Saving") to show the dots followed by that text; the button is then as
 * wide as the wider of the label and the dots + loadingLabel.
 * While loading the button is not tappable (aria-busy, pointer-events off) and is NOT dimmed like a disabled one.
 *
 * Sizes: md 48px / 15px type / 24px sides · sm 44px / 14px / 20px (text variant: 40 and 36px, 16 / 16)
 * Variants:
 *   filled   — color.brand.coral-dark fill, color.text.on-coral label
 *   tonal    — color.dark.tertiary fill, color.neonindigo label
 *   outlined — 1.5px border + label: default = dark.tertiary / text.primary · indigo = neonindigo · danger = brand.coral
 *   text     — no fill, color.neonindigo label
 *
 * Tokens: color.brand.coral-dark, color.text.on-coral, color.dark.tertiary, color.neonindigo.base, color.text.primary, radius.full
 */

import type { ReactNode } from "react";
import ThinkingDots from "@/components/ui/ThinkingDots";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "text";
/** Outlined: default | indigo | danger. Tonal: default (indigo label) | success. Text: default (indigo) | muted. */
export type ButtonTone = "default" | "indigo" | "danger" | "success" | "muted";
/** Filled only: which accent fills the button. */
export type ButtonFill = "coral" | "indigo" | "danger" | "white";

const OUTLINE: Record<"default" | "indigo" | "danger", { border: string; color: string }> = {
  default: { border: "var(--md-sys-color-dark-tertiary)",  color: "var(--md-sys-color-text-primary)" },
  indigo:  { border: "var(--md-sys-color-neonindigo)",     color: "var(--md-sys-color-neonindigo)" },
  danger:  { border: "var(--md-sys-color-brand-coral)",    color: "var(--md-sys-color-brand-coral)" },
};

export default function Button({
  variant = "filled", tone = "default", fill = "coral", size = "md", fullWidth = false, keepFocus = false, loading = false, loadingLabel, icon, disabled, onClick, type = "button", children,
}: {
  variant?: ButtonVariant;
  /** Outlined only. */
  tone?: ButtonTone;
  /** Filled only: coral (default), indigo, danger (error red, for irreversible actions), or white (sign-in buttons, with a brand logo as the icon). */
  fill?: ButtonFill;
  /** xl is the 56px sign-in button; lg the 52px sheet CTA; md 48; sm 44. */
  size?: "xl" | "lg" | "md" | "sm";
  /** Stretch to the width of its container. */
  fullWidth?: boolean;
  /** Keep the text field focused (and the keyboard up) when the button is pressed. For CTAs under a field. */
  keepFocus?: boolean;
  type?: "button" | "submit";
  loading?: boolean;
  /** Show the dots followed by this text while loading (e.g. "Saving"). Omit to keep the label's width and show dots only. */
  loadingLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const isText = variant === "text";
  const height = isText ? (size === "sm" ? 36 : 40) : size === "xl" ? 56 : size === "lg" ? 52 : size === "md" ? 48 : 44;
  const padX = isText ? 16 : size === "sm" ? 20 : 24;

  const look =
    variant === "filled"   ? (fill === "indigo"
      ? { background: "var(--md-sys-color-neonindigo)", color: "var(--md-sys-color-text-on-accent)" }
      : fill === "danger"
      ? { background: "var(--md-sys-color-error)", color: "var(--md-sys-color-text-primary)" }
      : fill === "white"
      ? { background: "var(--md-sys-color-surface-static-white)", color: "var(--md-sys-color-text-on-white)" }
      : { background: "var(--md-sys-color-brand-coral-dark)", color: "var(--md-sys-color-text-on-coral)" }) :
    variant === "tonal"    ? (tone === "success"
      ? { background: "var(--md-sys-color-dark-secondary)", color: "var(--md-sys-color-success)" }
      : { background: "var(--md-sys-color-dark-tertiary)", color: "var(--md-sys-color-neonindigo)" }) :
    variant === "outlined" ? (() => { const o = OUTLINE[tone === "indigo" || tone === "danger" ? tone : "default"]; return { background: "transparent", color: o.color, border: `1.5px solid ${o.border}` }; })() :
                             { background: "transparent", color: tone === "muted" ? "var(--md-sys-color-text-muted)" : "var(--md-sys-color-neonindigo)" };

  return (
    <button
      type={type}
      onMouseDown={keepFocus ? (e) => e.preventDefault() : undefined}
      onClick={loading || disabled ? undefined : onClick}
      disabled={disabled}
      aria-busy={loading || undefined}
      className={`relative items-center justify-center font-semibold transition-opacity ${fullWidth ? "flex w-full" : "inline-flex"} ${disabled ? "cursor-not-allowed" : "active:opacity-70"}`}
      style={{
        height, padding: `0 ${padX}px`, gap: "var(--spacing-2)", fontSize: size === "sm" ? 14 : size === "lg" || size === "xl" ? 16 : 15,
        borderRadius: isText ? undefined : "var(--radius-full)",
        opacity: disabled ? 0.3 : 1,
        pointerEvents: loading ? "none" : undefined,
        ...look,
      }}
    >
      {/* Label and loading content share one grid cell, so the button is as wide as the wider of the two and never jumps. */}
      <span className="inline-grid items-center justify-items-center">
        <span className="inline-flex items-center" style={{ gridArea: "1 / 1", gap: "var(--spacing-2)", visibility: loading ? "hidden" : "visible" }}>
          {icon}
          {children}
        </span>
        {loading && (
          <span className="inline-flex items-center justify-center" style={{ gridArea: "1 / 1", gap: 10 }}>
            <ThinkingDots size="sm" label={loadingLabel ?? "Working"} />
            {loadingLabel && <span>{loadingLabel}</span>}
          </span>
        )}
      </span>
    </button>
  );
}
