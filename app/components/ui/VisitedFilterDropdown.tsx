"use client";

/**
 * FLUTTER HANDOFF: VisitedFilterDropdown
 * Widget: StatefulWidget
 * Props: value, customFrom, customTo, onChange
 * State: open (bool), showCustom (bool), draftFrom/draftTo (string)
 * Tokens: --md-sys-color-dark-secondary (pill bg), --md-sys-color-dark-tertiary (menu bg),
 *         --md-sys-color-radius-full (pill), --radius-xl (menu), --radius-md (inputs),
 *         --md-sys-color-text-primary, --md-sys-color-text-muted, --md-sys-color-neonindigo
 * Transitions: same spring as FilterDropdown (stiffness 380, damping 22)
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { MenuPanel, MenuRow, MenuDivider, menuPanelVariants, menuPanelTransition } from "@/components/ui/Menu";

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
            <path d="M3 8L6.5 11.5L13 5" stroke="var(--md-sys-color-neonindigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {pillLabel}
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

            {/* Menu */}
            <motion.div
              className="absolute left-0 top-full mt-1 z-50"
              variants={menuPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={menuPanelTransition}
              style={{ transformOrigin: "top left" }}
            >
              <MenuPanel minWidth={176}>
              {PRESETS.map((opt, i) => (
                <MenuRow
                  key={opt.value}
                  index={i}
                  variant="check"
                  item={{ id: opt.value, label: opt.label, selected: value === opt.value && !showCustom, onSelect: () => handlePreset(opt.value) }}
                />
              ))}
              <MenuDivider />
              <MenuRow
                index={PRESETS.length + 1}
                variant="check"
                item={{ id: "custom", label: "Custom range", selected: value === "custom", onSelect: () => handlePreset("custom") }}
              />

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
                        <p className="text-xs-bold mb-1" style={{ color: "var(--md-sys-color-text-muted)", paddingLeft: 2 }}>From</p>
                        <input
                          type="date"
                          value={draftFrom}
                          onChange={e => setDraftFrom(e.target.value)}
                          className="w-full text-sm outline-none px-3 py-2"
                          style={{
                            background: "var(--md-sys-color-dark-secondary)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--md-sys-color-text-primary)",
                            border: "none",
                            colorScheme: "dark",
                          }}
                        />
                      </div>
                      {/* To */}
                      <div>
                        <p className="text-xs-bold mb-1" style={{ color: "var(--md-sys-color-text-muted)", paddingLeft: 2 }}>To</p>
                        <input
                          type="date"
                          value={draftTo}
                          onChange={e => setDraftTo(e.target.value)}
                          className="w-full text-sm outline-none px-3 py-2"
                          style={{
                            background: "var(--md-sys-color-dark-secondary)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--md-sys-color-text-primary)",
                            border: "none",
                            colorScheme: "dark",
                          }}
                        />
                      </div>
                      {/* Apply */}
                      <Button fill="indigo" size="sm" fullWidth onClick={applyCustom}>Apply</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </MenuPanel>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
