"use client";

/**
 * FLUTTER HANDOFF: SearchField
 * Widget: StatelessWidget (text lives in the parent's TextEditingController)
 * Props: value, onChange, placeholder, size ("sm" | "md" | "lg"), inputRef?, active? (force the active stroke), trailing? (e.g. an "ALL" tag),
 *        endSlot? (a control inside the pill after the clear button, e.g. the sort menu)
 * Sizes: sm 36 tall / 14 text / 16 icon · md 44 / 15 / 18 (default) · lg 48 / 17 / 20
 * Active stroke: a 1.5px neonindigo outline and indigo icon while the field has focus, or whenever `active` is set. Every search bar in the
 *        app is this one component, so they all light up the same way.
 * Flutter equivalent: halosight_search_field.dart (one widget; size is an enum)
 * Tokens: color.dark.secondary (fill), color.text.muted (icon), color.text.primary (text), color.text.disabled (clear dot),
 *         color.neonindigo.base (active outline and icon), color.brand.coral (caret), radius.full, spacing.2/3/4
 */

import { useState, type Ref, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";

export type SearchFieldSize = "sm" | "md" | "lg";

const SIZES = {
  sm: { height: 36, icon: 16, text: 14, padX: "var(--spacing-3)" },
  md: { height: 44, icon: 18, text: 15, padX: "var(--spacing-3)" },
  lg: { height: 48, icon: 20, text: 17, padX: "var(--spacing-4)" },
} as const;

export default function SearchField({
  value, onChange, placeholder = "Search…", size = "md", inputRef, active = false, trailing, endSlot, className, style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  size?: SearchFieldSize;
  inputRef?: Ref<HTMLInputElement>;
  /** Indigo outline and icon even without focus, e.g. while searching beyond your own list. */
  active?: boolean;
  /** A small tag before the clear button. */
  trailing?: ReactNode;
  /** A control inside the pill after the clear button (the sort menu on the companies list). */
  endSlot?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  const lit = active || focused;
  const z = SIZES[size];
  return (
    <div
      className={`flex items-center ${className ?? ""}`}
      style={{
        gap: "var(--spacing-2)", height: z.height, padding: `0 ${z.padX}`, borderRadius: "var(--radius-full)",
        background: "var(--md-sys-color-dark-secondary)",
        // An inset ring, not an outline, so a parent with overflow hidden (the drawer's animated pill) can never clip the active stroke.
        boxShadow: lit ? "inset 0 0 0 1.5px var(--md-sys-color-neonindigo)" : "inset 0 0 0 1.5px transparent",
        transition: "box-shadow 0.15s",
        ...style,
      }}
    >
      <Icon name="search" size={z.icon} style={{ color: lit ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-muted)", flexShrink: 0, transition: "color 0.2s" }} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 min-w-0 bg-transparent outline-none"
        style={{ fontSize: z.text, color: "var(--md-sys-color-text-primary)", caretColor: "var(--md-sys-color-brand-coral)" }}
      />
      {trailing}
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="flex items-center justify-center active:opacity-60 flex-shrink-0">
          <span className="flex items-center justify-center" style={{ width: 16, height: 16, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-text-disabled)" }}>
            <Icon name="close" size={11} style={{ color: "var(--md-sys-color-background)" }} />
          </span>
        </button>
      )}
      {endSlot}
    </div>
  );
}
