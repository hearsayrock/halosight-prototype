"use client";

/**
 * FLUTTER HANDOFF: SearchField
 * Widget: StatelessWidget wrapping TextField (text lives in the parent's TextEditingController)
 * Props: value, onChange, placeholder, size ("sm" | "md" | "lg"), inputRef?, active? (force the active stroke), trailing? (e.g. an "ALL" tag),
 *        endSlot? (a control inside the pill after the clear button, e.g. the sort menu)
 * Sizes: sm 36 tall / 14 text / 16 icon · md 44 / 15 / 18 (default) · lg 48 / 17 / 20
 * Active stroke: a 1.5px neonindigo outline and indigo icon while the field has focus, or whenever `active` is set. Every search bar in the
 *        app is this one component, so they all light up the same way.
 * Built on TextField, so its states (default, active, filled) are the app-wide ones. It adds only the search icon, the clear dot and the sizes.
 * Flutter equivalent: halosight_search_field.dart (a HalosightTextField with a search icon, clearable, pill)
 * Tokens: color.dark.secondary (fill), color.text.muted (icon), color.text.primary (text), color.text.disabled (clear dot),
 *         color.neonindigo.base (active outline and icon), color.brand.coral (caret), radius.full, spacing.2/3/4
 */

import type { Ref, ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import TextField from "@/components/ui/TextField";

export type SearchFieldSize = "sm" | "md" | "lg";

const ICON = { sm: 16, md: 18, lg: 20 } as const;

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
  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size={size}
      type="text"
      inputRef={inputRef}
      active={active}
      leading={<Icon name="search" size={ICON[size]} style={{ color: "inherit", flexShrink: 0 }} />}
      trailing={trailing}
      endSlot={endSlot}
      clearable
      className={className}
      style={style}
    />
  );
}
