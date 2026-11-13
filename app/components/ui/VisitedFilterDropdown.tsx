"use client";

/**
 * FLUTTER HANDOFF: VisitedFilterDropdown
 * Widget: StatefulWidget
 * Props: value ("all" | "7d" | "14d" | "30d" | "90d" | "custom"), customFrom, customTo, onChange(value, from?, to?)
 * State: open, showCustom, draftFrom / draftTo (strings; synced from the applied range each time it opens)
 * Flutter equivalent: visited_filter_dropdown.dart (the pill plus a menu; the custom range uses showDateRangePicker instead of two date fields)
 *
 * The "Last Visited" filter on the companies list. A 32px pill in the same three looks as FilterDropdown (default, filtered with an indigo check,
 * open). The label reads "Last Visited" until something is chosen, then the choice ("Last 7 days", "Custom"). The menu is Menu (`check`, min width 176):
 *   - All time, Last 7 days, Last 2 weeks, Last 30 days, Last 90 days apply immediately and close the menu
 *   - a divider, then "Custom range", which expands (opacity and height, 180ms) to two date TextFields (From, To; md) and an indigo Apply button
 * Apply sends the typed dates as the range. Reopening restores the applied dates into the fields.
 * Known drift: the open-state arrow is a raw white at 70% (no token yet).
 *
 * Tokens: color.dark.secondary (pill), color.neonindigo.base (open fill, check), color.text.on-accent, color.text.primary / muted, radius.full;
 *         the menu uses Menu's tokens; the date fields are TextField
 */

import TextField from "@/components/ui/TextField";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FilterPill from "@/components/ui/FilterPill";
import MenuPopover from "@/components/ui/MenuPopover";
import Button from "@/components/ui/Button";
import { MenuPanel, MenuRow, MenuDivider } from "@/components/ui/Menu";

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

      <FilterPill label={pillLabel} open={open} filtered={isFiltered} onClick={() => open ? setOpen(false) : openDropdown()} />

      <MenuPopover open={open} onClose={() => setOpen(false)} placement="below-left" backdropZIndex={40} panelZIndex={50}>
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
                      <TextField size="md" label="From" type="date" value={draftFrom} onChange={setDraftFrom} />
                      {/* To */}
                      <TextField size="md" label="To" type="date" value={draftTo} onChange={setDraftTo} />
                      {/* Apply */}
                      <Button fill="indigo" size="sm" fullWidth onClick={applyCustom}>Apply</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </MenuPanel>
      </MenuPopover>
    </div>
  );
}
