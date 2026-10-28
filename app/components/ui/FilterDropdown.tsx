"use client";

/**
 * FLUTTER HANDOFF: FilterDropdown
 * Widget: StatefulWidget
 * Props: options[], value, onChange callback, label (optional prefix label)
 * State: open (bool) — internal only
 * Flutter equivalent: PopupMenuButton or custom overlay (same pattern as SortMenu)
 * Tokens: dark-secondary (pill bg), radius-full (pill), text-primary, text-muted;
 *         the menu comes from Menu (components/ui/Menu.tsx), `check` variant
 * Transitions: iOS UIMenu spring — scale 0→1, origin top-left, items stagger-fade in
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
          background: open ? "var(--md-sys-color-neonindigo)" : isFiltered ? "var(--md-sys-color-dark-secondary)" : "var(--md-sys-color-dark-secondary)",
          borderRadius: "var(--radius-full)",
          color: open ? "#fff" : "var(--md-sys-color-text-primary)",
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
          style={{ color: open ? "rgba(255,255,255,0.7)" : "var(--md-sys-color-text-muted)" }}
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
