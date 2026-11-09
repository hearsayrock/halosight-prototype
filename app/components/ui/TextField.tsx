"use client";

/**
 * FLUTTER HANDOFF: TextField
 * Widget: StatefulWidget (owns only the focus state; the text lives in the parent's TextEditingController)
 * Props: value, onChange(string), label?, placeholder?, type?, size ("sm" | "md" | "lg"), multiline? + rows?, status? ("error" | "warning") + helper?,
 *        maxLength? + showCount?, leading?, trailing?, clearable?, endSlot?, actions?, active?, disabled?, inputRef?, autoFocus?, onSubmit?, onFocus?/onBlur?,
 *        variant ("field" | "bare")
 * Sizes: sm 36 tall / 14 text / 16 icon · md 44 / 15 / 18 · lg 48 / 17 / 20 (default) · xl 56 / 17 / 22 (the chat composer). Multi-line grows with `rows` and always uses 16 text.
 * States (all one widget, the ring is an inset box-shadow so a parent with overflow hidden can't clip it):
 *   - default: empty. Fill color.dark.secondary, no stroke, muted placeholder.
 *   - active:  focused. A 1.5px neonindigo stroke (and the leading icon turns indigo). Caret is brand coral.
 *   - filled:  has text, not focused. Same fill with a hairline alpha-white-10 stroke, so a completed field reads as done.
 *   - error / warning: a 1.5px error or warning stroke plus the helper line in the same color (warning is for soft problems such as
 *              a possible duplicate). Overrides the other strokes.
 *   - disabled: 50% opacity, not editable.
 * Shape: single-line is a full pill (radius.full); multi-line is radius.xl. Every text entry in the app is this one widget, so they all light up alike.
 * Label: an uppercase eyebrow above the field (text.muted). Helper and the "n/max" counter sit under it.
 * Slots: `leading` (an icon), `trailing` (a tag or a button inside the pill), `clearable` (a clear dot once there is text).
 * Bare variant: the input with no chrome at all, for text that edits in place inside a card or row that owns the surface and the state
 *   (renaming a participant, an AI-extracted field). Pass `inputStyle` for the type.
 * Flutter equivalent: halosight_text_field.dart (one widget; size is an enum; multiline swaps maxLines; bare is a flag)
 * Tokens: color.dark.secondary (fill), color.text.primary (text), color.text.muted (placeholder, label, leading icon), color.text.disabled (clear dot),
 *         color.neonindigo.base (active stroke), color.alpha.white.10 (filled stroke), color.error / color.warning (status), color.brand.coral (caret),
 *         radius.full / radius.xl, spacing.2/3/4/5
 */

import { useState, type ReactNode, type Ref, type KeyboardEvent } from "react";
import Icon from "@/components/ui/Icon";

export type TextFieldSize = "sm" | "md" | "lg" | "xl";

const SIZES = {
  sm: { height: 36, icon: 16, text: 14, padX: "var(--spacing-3)" },
  md: { height: 44, icon: 18, text: 15, padX: "var(--spacing-4)" },
  lg: { height: 48, icon: 20, text: 17, padX: "var(--spacing-5)" },
  xl: { height: 56, icon: 22, text: 17, padX: "var(--spacing-5)" },
} as const;

const STATUS_COLOR = {
  error: "var(--md-sys-color-error)",
  warning: "var(--md-sys-color-warning)",
} as const;

export default function TextField({
  value, onChange, label, placeholder, type = "text", size = "lg", multiline = false, rows = 3,
  status, helper, maxLength, showCount = false, leading, trailing, clearable = false, endSlot, actions, active = false, disabled = false,
  inputRef, autoFocus = false, onSubmit, onFocus, onBlur, onKeyDown, variant = "field", inputStyle, ariaLabel, inputMode, enterKeyHint, name, className, style,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Uppercase eyebrow above the field. */
  label?: string;
  placeholder?: string;
  type?: "text" | "tel" | "email" | "url" | "date" | "number" | "search";
  size?: TextFieldSize;
  /** A textarea; the field grows with `rows` and uses radius.xl. */
  multiline?: boolean;
  rows?: number;
  /** A problem state: a stroke and helper line in the error or warning color. */
  status?: "error" | "warning";
  /** A line under the field (status color when `status` is set, muted otherwise). */
  helper?: string;
  maxLength?: number;
  /** Show "n/maxLength" under the field. */
  showCount?: boolean;
  /** An icon (or small node) before the text. Turns indigo while active. */
  leading?: ReactNode;
  /** A tag or button inside the field, after the text. */
  trailing?: ReactNode;
  /** A clear dot after the text once there is something to clear. */
  clearable?: boolean;
  /** A control inside the field after the clear dot (the sort menu on the companies list). */
  endSlot?: ReactNode;
  /** Round buttons flush to the right edge inside the pill (the chat composer's mic and send). The field pads 8px around them. */
  actions?: ReactNode;
  /** Draw the active stroke even without focus, e.g. while searching beyond your own list. */
  active?: boolean;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  autoFocus?: boolean;
  /** Fires on Enter (single-line only). */
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** "bare": no fill, stroke or padding; the parent draws the surface. */
  variant?: "field" | "bare";
  /** Bare variant only: type styling for the text. */
  inputStyle?: React.CSSProperties;
  /** Needed when there is no `label` or `placeholder` to name the field for screen readers. */
  ariaLabel?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url" | "search" | "decimal";
  enterKeyHint?: "enter" | "done" | "go" | "next" | "search" | "send";
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  const z = SIZES[size];
  const filled = value.length > 0;
  const lit = active || focused;
  const accessibleName = ariaLabel ?? label ?? placeholder;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (!multiline && e.key === "Enter" && onSubmit) onSubmit();
  };
  const common = {
    value,
    placeholder,
    disabled,
    maxLength,
    name,
    autoFocus,
    "aria-label": accessibleName,
    "aria-invalid": status === "error" || undefined,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    onFocus: () => { setFocused(true); onFocus?.(); },
    onBlur: () => { setFocused(false); onBlur?.(); },
    onKeyDown: handleKeyDown,
    className: "text-field-input flex-1 min-w-0 w-full bg-transparent outline-none",
  };

  if (variant === "bare") {
    return multiline ? (
      <textarea ref={inputRef as unknown as Ref<HTMLTextAreaElement>} rows={rows} {...common} className={`${common.className} resize-none ${className ?? ""}`}
        style={{ color: "var(--md-sys-color-text-primary)", caretColor: "var(--md-sys-color-brand-coral)", ...inputStyle, ...style }} />
    ) : (
      <input ref={inputRef} type={type} inputMode={inputMode} enterKeyHint={enterKeyHint} {...common} className={`${common.className} ${className ?? ""}`}
        style={{ color: "var(--md-sys-color-text-primary)", caretColor: "var(--md-sys-color-brand-coral)", colorScheme: "dark", ...inputStyle, ...style }} />
    );
  }

  const ring = status
    ? STATUS_COLOR[status]
    : lit
      ? "var(--md-sys-color-neonindigo)"
      : filled
        ? "var(--md-sys-color-alpha-white-10)"
        : "transparent";
  const helperText = helper ?? "";
  const counter = showCount && maxLength ? `${value.length}/${maxLength}` : "";

  return (
    <div className={className} style={style}>
      {label && (
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--md-sys-color-text-muted)", marginBottom: "var(--spacing-2)", paddingLeft: "var(--spacing-1)" }}>
          {label}
        </p>
      )}
      <div
        className="flex"
        style={{
          alignItems: multiline ? "flex-start" : "center",
          gap: "var(--spacing-2)",
          minHeight: z.height,
          padding: multiline ? "var(--spacing-4) var(--spacing-5)" : `0 ${actions ? "var(--spacing-2)" : z.padX} 0 ${z.padX}`,
          borderRadius: multiline ? "var(--radius-xl)" : "var(--radius-full)",
          background: "var(--md-sys-color-dark-secondary)",
          boxShadow: `inset 0 0 0 1.5px ${ring}`,
          opacity: disabled ? 0.5 : 1,
          transition: "box-shadow 0.15s",
        }}
      >
        {leading && (
          <span className="flex items-center flex-shrink-0" style={{ color: lit ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-muted)", transition: "color 0.2s" }}>
            {leading}
          </span>
        )}
        {multiline ? (
          <textarea
            ref={inputRef as unknown as Ref<HTMLTextAreaElement>}
            rows={rows}
            {...common}
            className={`${common.className} resize-none block`}
            style={{ fontSize: 16, lineHeight: "23px", color: "var(--md-sys-color-text-primary)", caretColor: "var(--md-sys-color-brand-coral)" }}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            inputMode={inputMode}
            enterKeyHint={enterKeyHint}
            {...common}
            style={{ fontSize: z.text, height: z.height, color: "var(--md-sys-color-text-primary)", caretColor: "var(--md-sys-color-brand-coral)", colorScheme: "dark" }}
          />
        )}
        {trailing}
        {clearable && filled && !disabled && (
          <button type="button" aria-label="Clear" onClick={() => onChange("")} className="flex items-center justify-center active:opacity-60 flex-shrink-0">
            <span className="flex items-center justify-center" style={{ width: 16, height: 16, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-text-disabled)" }}>
              <Icon name="close" size={11} style={{ color: "var(--md-sys-color-background)" }} />
            </span>
          </button>
        )}
        {endSlot}
        {actions}
      </div>
      {(helperText || counter) && (
        <div className="flex items-start justify-between" style={{ marginTop: "var(--spacing-1)", paddingLeft: "var(--spacing-1)", paddingRight: "var(--spacing-1)", gap: "var(--spacing-3)", fontSize: 13 }}>
          <span style={{ color: status ? STATUS_COLOR[status] : "var(--md-sys-color-text-muted)" }}>{helperText}</span>
          <span className="tabular-nums flex-shrink-0" style={{ color: "var(--md-sys-color-text-muted)" }}>{counter}</span>
        </div>
      )}
    </div>
  );
}
