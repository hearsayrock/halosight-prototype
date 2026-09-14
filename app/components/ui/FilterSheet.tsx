"use client";

/**
 * FLUTTER HANDOFF: FilterSheet
 * Widget: StatelessWidget (bottom sheet)
 * Slides up from the bottom of the phone frame.
 * Single-select: tapping an option selects it and closes the sheet.
 *
 * Tokens: --md-sys-color-dark-secondary (bg), --md-sys-color-dark-tertiary (row bg),
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-neonindigo,
 *         --radius-xl, --radius-full
 */

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  open: boolean;
  onClose: () => void;
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Value that means "no filter active" — defaults to first option's value */
  defaultValue?: T;
}

export default function FilterSheet<T extends string>({
  open,
  onClose,
  label,
  options,
  value,
  onChange,
  defaultValue,
}: Props<T>) {
  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;

  if (!overlayRoot) return null;

  const baseValue = defaultValue ?? options[0]?.value;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="filter-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 70,
              background: "rgba(0,0,0,0.52)",
              pointerEvents: "auto",
            }}
          />

          {/* Sheet */}
          <motion.div
            key="filter-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 71,
              pointerEvents: "auto",
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
              paddingBottom: 36,
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
            </div>

            {/* Section label */}
            <p
              className="text-11-bold px-5 pt-3 pb-2"
              style={{
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--md-sys-color-text-muted)",
              }}
            >
              {label}
            </p>

            {/* Options */}
            <div className="flex flex-col">
              {options.map((opt, i) => {
                const isSelected = value === opt.value;
                const isLast = i === options.length - 1;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { onChange(opt.value); onClose(); }}
                    className="flex items-center justify-between px-5 active:opacity-70 transition-opacity relative"
                    style={{ height: 52 }}
                  >
                    {!isLast && (
                      <div
                        className="absolute bottom-0 left-5 right-5"
                        style={{ height: 1, background: "rgba(255,255,255,0.07)" }}
                      />
                    )}
                    <span
                      className="text-base"
                      style={{
                        color: isSelected
                          ? "var(--md-sys-color-text-primary)"
                          : "var(--md-sys-color-text-muted)",
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Icon
                        name="check"
                        size={18}
                        style={{ color: "var(--md-sys-color-neonindigo)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
