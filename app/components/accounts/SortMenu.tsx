"use client";

/**
 * FLUTTER HANDOFF: SortMenu
 * Widget: StatefulWidget (manages open/close)
 * Props: currentSort (SortOption), onSortChange callback
 * Flutter equivalent: PopupMenuButton or custom overlay
 * Tokens: panel and rows come from Menu (components/ui/Menu.tsx), `check` variant with section labels
 *
 * Animation: iOS UIMenu — menu scales in from top-right anchor with a
 * spring bounce. Transform origin is top-right so the corner stays pinned
 * to where the trigger button was. Items stagger-fade in on open.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SortOption } from "@/lib/types";
import { MenuPanel, MenuRow, MenuSectionLabel, MenuDivider, menuPanelVariants, menuPanelTransition } from "@/components/ui/Menu";
import type { VisitedFilter } from "@/components/ui/VisitedFilterDropdown";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "alphabetical", label: "Sort Alphabetically" },
  { value: "distance",     label: "Sort by Distance" },
  { value: "lastVisited",  label: "Sort by Last Visited" },
  { value: "company",      label: "Sort by Company" },
];

const VISIT_PRESETS: { value: VisitedFilter; label: string }[] = [
  { value: "all",  label: "All time"      },
  { value: "7d",   label: "Last 7 days"   },
  { value: "14d",  label: "Last 2 weeks"  },
  { value: "30d",  label: "Last 30 days"  },
  { value: "90d",  label: "Last 90 days"  },
];

interface Props {
  current: SortOption;
  onChange: (sort: SortOption) => void;
  visitedFilter?: VisitedFilter;
  onVisitedChange?: (v: VisitedFilter) => void;
}

export default function SortMenu({ current, onChange, visitedFilter = "all", onVisitedChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">

      {/* Trigger — fades out while menu is open so it doesn't peek through */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.85 : 1 }}
        transition={{ duration: 0.12 }}
        className="w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ background: "var(--md-sys-color-dark-secondary)" }}
        aria-label="Sort accounts"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5H17"  stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M6 10H14" stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M9 15H11" stroke="var(--md-sys-color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Dismiss overlay */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

            {/* Menu — top-right corner anchored to where the button sits */}
            <motion.div
              className="absolute right-0 top-0 z-20"
              variants={menuPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={menuPanelTransition}
              style={{ transformOrigin: "top right" }}
            >
              <MenuPanel minWidth={224}>
                <MenuSectionLabel>Sort</MenuSectionLabel>
                {SORT_OPTIONS.map((opt, i) => (
                  <MenuRow
                    key={opt.value}
                    index={i}
                    variant="check"
                    item={{
                      id: opt.value,
                      label: opt.label,
                      selected: current === opt.value,
                      onSelect: () => { onChange(opt.value); setOpen(false); },
                    }}
                  />
                ))}

                <MenuDivider />

                <MenuSectionLabel>Visit Date</MenuSectionLabel>
                {VISIT_PRESETS.map((opt, i) => (
                  <MenuRow
                    key={opt.value}
                    index={SORT_OPTIONS.length + 2 + i}
                    variant="check"
                    item={{
                      id: opt.value,
                      label: opt.label,
                      selected: visitedFilter === opt.value,
                      onSelect: () => { onVisitedChange?.(opt.value); setOpen(false); },
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
