"use client";

/**
 * FLUTTER HANDOFF: VisitedFilterDropdown
 * Widget: StatefulWidget
 * Props: value, customFrom, customTo, onChange
 * State: open (bool), showCustom (bool), draftFrom/draftTo (string)
 * Tokens: --color-dark-secondary (pill bg), --color-dark-tertiary (menu bg),
 *         --color-radius-full (pill), --radius-xl (menu), --radius-md (inputs),
 *         --color-text-primary, --color-text-muted, --color-brand-purple
 * Transitions: same spring as FilterDropdown (stiffness 380, damping 22)
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

export type VisitedFilter = "all" | "7d" | "14d" | "30d" | "90d" | "custom";

interface Props {
  value: VisitedFilter;
  customFrom: Date | null;
  customTo: Date | null;
  onChange: (value: VisitedFilter, from?: Date | null, to?: Date | null) => void;
}

const PRESETS: { value: VisitedFilter; label: string; pillLabel: string }[] = [
  { value: "all", label: "All time",     pillLabel: "Last Visited" },
  { value: "7d",  label: "Last 7 days",  pillLabel: "Last 7 days"  },
  { value: "14d", label: "Last 2 weeks", pillLabel: "Last 2 weeks" },
  { value: "30d", label: "Last 30 days", pillLabel: "Last 30 days" },
  { value: "90d", label: "Last 90 days", pillLabel: "Last 90 days" },
];

function toInputVal(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

function fromInputVal(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 8L6.5 11.5L13 5" stroke="var(--color-text-primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const menuVariants = {
  hidden:  { opacity: 0, scale: 0.01 },
  visible: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.01 },
};
const menuTransition = { type: "spring" as const, stiffness: 380, damping: 22, mass: 0.9 };
const itemVariants = {
  hidden:  { opacity: 0 },
  visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0.04 + 0.06, duration: 0.15 } }),
  exit:    { opacity: 0, transition: { duration: 0.05 } },
};

export default function VisitedFilterDropdown({ value, customFrom, customTo, onChange }: Props) {
  const [open, setOpen]             = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [draftFrom, setDraftFrom]   = useState(toInputVal(customFrom));
  const [draftTo, setDraftTo]       = useState(toInputVal(customTo));

  const isFiltered  = value !== "all";
  const pillLabel   = value === "custom"
    ? "Custom"
    : (PRESETS.find(p => p.value === value)?.pillLabel ?? "Last Visited");

  function openDropdown() {
    // Sync draft dates with current applied values on open
    setDraftFrom(toInputVal(customFrom));
    setDraftTo(toInputVal(customTo));
    setShowCustom(value === "custom");
    setOpen(true);
  }

  function handlePreset(v: VisitedFilter) {
    if (v === "custom") {
      setShowCustom(true);
    } else {
      onChange(v);
      setOpen(false);
      setShowCustom(false);
    }
  }

  function applyCustom() {
    onChange("custom", fromInputVal(draftFrom), fromInputVal(draftTo));
    setOpen(false);
  }

  return (
    <div className="relative">

      {/* Pill trigger */}
      <button
        onClick={() => open ? setOpen(false) : openDropdown()}
        className="flex items-center h-8 px-3 text-sm font-semibold active:opacity-70 transition-opacity"
        style={{
          gap: isFiltered ? 4 : 2,
          background: open ? "var(--color-brand-purple)" : "var(--color-dark-secondary)",
          borderRadius: "var(--radius-full)",
          color: open ? "#fff" : "var(--color-text-primary)",
        }}
      >
        {isFiltered && !open && (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginRight: 1 }}>
            <path d="M3 8L6.5 11.5L13 5" stroke="var(--color-brand-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {pillLabel}
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

            {/* Menu */}
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
                minWidth: 176,
              }}
            >
              {/* Preset rows */}
              {PRESETS.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => handlePreset(opt.value)}
                  className="w-full flex items-center text-left text-sm font-semibold"
                  style={{ gap: 12, padding: "10px 16px", background: "transparent", color: "var(--color-text-primary)" }}
                >
                  <span style={{ width: 16, flexShrink: 0, display: "flex", alignItems: "center" }}>
                    {value === opt.value && !showCustom && <CheckIcon />}
                  </span>
                  {opt.label}
                </motion.button>
              ))}

              {/* Divider */}
              <motion.div
                custom={PRESETS.length}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "4px 12px" }}
              />

              {/* Custom range row */}
              <motion.button
                custom={PRESETS.length + 1}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handlePreset("custom")}
                className="w-full flex items-center text-left text-sm font-semibold"
                style={{ gap: 12, padding: "10px 16px", background: "transparent", color: "var(--color-text-primary)" }}
              >
                <span style={{ width: 16, flexShrink: 0, display: "flex", alignItems: "center" }}>
                  {value === "custom" && <CheckIcon />}
                </span>
                Custom range
              </motion.button>

              {/* Custom date pickers — expands when custom is selected */}
              <AnimatePresence>
                {showCustom && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "6px 12px 4px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* From */}
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text-muted)", paddingLeft: 2 }}>From</p>
                        <input
                          type="date"
                          value={draftFrom}
                          onChange={e => setDraftFrom(e.target.value)}
                          className="w-full text-sm outline-none px-3 py-2"
                          style={{
                            background: "var(--color-dark-secondary)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text-primary)",
                            border: "none",
                            colorScheme: "dark",
                          }}
                        />
                      </div>
                      {/* To */}
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text-muted)", paddingLeft: 2 }}>To</p>
                        <input
                          type="date"
                          value={draftTo}
                          onChange={e => setDraftTo(e.target.value)}
                          className="w-full text-sm outline-none px-3 py-2"
                          style={{
                            background: "var(--color-dark-secondary)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text-primary)",
                            border: "none",
                            colorScheme: "dark",
                          }}
                        />
                      </div>
                      {/* Apply */}
                      <button
                        onClick={applyCustom}
                        className="w-full text-sm font-semibold py-2 active:opacity-80 transition-opacity"
                        style={{
                          background: "var(--color-brand-purple)",
                          borderRadius: "var(--radius-full)",
                          color: "#fff",
                          marginTop: 2,
                          marginBottom: 4,
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
