"use client";

/**
 * FLUTTER HANDOFF: FilterDropdown
 * Widget: StatefulWidget (open/close only; the selected value lives in the parent)
 * Props: options ({ value, label }[]), value, onChange(value), defaultValue? (the value that means "no filter", default the first option)
 * State: open (bool)
 * Flutter equivalent: filter_dropdown.dart (a pill that opens a PopupMenuButton / showMenu with HalosightMenu `check` rows)
 *
 * A 32px pill that shows the current choice and opens a check menu. Three looks:
 *   - default: color.dark.secondary fill, color.text.primary label, a muted down arrow
 *   - filtered (value is not the default): a small neonindigo check before the label
 *   - open: neonindigo fill, color.text.on-accent label, an up arrow
 * The menu is Menu (variant `check`, min width 180), anchored top-left under the pill; a tap outside dismisses it.
 * Used for the Open / Done and Due Date / Company pills on the items list and the companies screen's items section.
 * Known drift: the open-state arrow is a raw white at 70%; there is no token for it yet (flagged, not invented).
 *
 * Tokens: color.dark.secondary (pill), color.neonindigo.base (open fill, filtered check), color.text.on-accent (open label),
 *         color.text.primary / muted, radius.full; the menu uses Menu's tokens
 * Transitions: Menu's spring (scale 0 to 1 from the top-left corner, rows fade in one after another)
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { MenuPanel, MenuRow, menuPanelVariants, menuPanelTransition } from "@/components/ui/Menu";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Value that represents "no filter active" — defaults to first option's value */
  defaultValue?: T;
}

export default function FilterDropdown<T extends string>({ options, value, onChange, defaultValue }: Props<T>) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label ?? value;
  const baseValue = defaultValue ?? options[0]?.value;
  const isFiltered = value !== baseValue;

  return (
    <div className="relative">
      {/* Pill trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center h-8 px-3 text-sm-bold active:opacity-70 transition-opacity"
        style={{
          gap: isFiltered ? 4 : 2,
          background: open ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-secondary)",
          borderRadius: "var(--radius-full)",
          color: open ? "var(--md-sys-color-text-on-accent)" : "var(--md-sys-color-text-primary)",
        }}
      >
        {isFiltered && !open && (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginRight: 1 }}>
            <path
              d="M3 8L6.5 11.5L13 5"
              stroke="var(--md-sys-color-neonindigo)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {currentLabel}
        <Icon
          name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          size={18}
          style={{ color: open ? "color-mix(in srgb, var(--md-sys-color-text-on-accent) 70%, transparent)" : "var(--md-sys-color-text-muted)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Dismiss overlay */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            {/* Menu — top-left corner anchored to where the pill sits */}
            <motion.div
              className="absolute left-0 top-full mt-1 z-50"
              variants={menuPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={menuPanelTransition}
              style={{ transformOrigin: "top left" }}
            >
              <MenuPanel minWidth={180}>
                {options.map((opt, i) => (
                  <MenuRow
                    key={opt.value}
                    index={i}
                    variant="check"
                    item={{
                      id: opt.value,
                      label: opt.label,
                      selected: value === opt.value,
                      onSelect: () => { onChange(opt.value); setOpen(false); },
                    }}
                  />
                ))}
              </MenuPanel>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
