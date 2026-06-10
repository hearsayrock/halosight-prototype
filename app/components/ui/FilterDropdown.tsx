"use client";

/**
 * FLUTTER HANDOFF: FilterDropdown
 * Widget: StatefulWidget
 * Props: options[], value, onChange callback, label (optional prefix label)
 * State: open (bool) — internal only
 * Flutter equivalent: PopupMenuButton or custom overlay (same pattern as SortMenu)
 * Tokens: dark-secondary (pill bg), dark-tertiary (menu bg), radius-full (pill), radius-xl (menu),
 *         text-primary, text-muted, brand-purple (active selection)
 * Transitions: iOS UIMenu spring — scale 0→1, origin top-left, items stagger-fade in
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

// Matches SortMenu spring exactly
const menuVariants = {
  hidden:  { opacity: 0, scale: 0.01 },
  visible: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.01 },
};

const menuTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 22,
  mass: 0.9,
};

const itemVariants = {
  hidden:  { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.04 + 0.06, duration: 0.15 },
  }),
  exit: { opacity: 0, transition: { duration: 0.05 } },
};

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M3 8L6.5 11.5L13 5"
        stroke="var(--color-text-primary)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Props<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function FilterDropdown<T extends string>({ options, value, onChange }: Props<T>) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="relative">
      {/* Pill trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-0.5 h-8 px-3 text-sm font-semibold active:opacity-70 transition-opacity"
        style={{
          background: open ? "var(--color-brand-purple)" : "var(--color-dark-secondary)",
          borderRadius: "var(--radius-full)",
          color: open ? "#fff" : "var(--color-text-primary)",
        }}
      >
        {currentLabel}
        <Icon
          name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          size={18}
          style={{ color: open ? "rgba(255,255,255,0.7)" : "var(--color-text-muted)" }}
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
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={menuTransition}
              style={{
                transformOrigin: "top left",
                background: "var(--color-dark-tertiary)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
                paddingTop: 8,
                paddingBottom: 8,
                minWidth: 148,
              }}
            >
              {options.map((opt, i) => {
                const isSelected = value === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="w-full flex items-center text-left text-sm font-semibold"
                    style={{
                      gap: 12,
                      paddingTop: 10,
                      paddingBottom: 10,
                      paddingLeft: 16,
                      paddingRight: 16,
                      background: "transparent",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <span style={{ width: 16, flexShrink: 0, display: "flex", alignItems: "center" }}>
                      {isSelected && <CheckIcon />}
                    </span>
                    {opt.label}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
