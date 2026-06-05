"use client";

/**
 * FLUTTER HANDOFF: SortMenu
 * Widget: StatefulWidget (manages open/close)
 * Props: currentSort (SortOption), onSortChange callback
 * Flutter equivalent: PopupMenuButton or custom overlay
 * Tokens: dark-tertiary (fill), text/primary, elevation-3
 *
 * Animation: iOS UIMenu — menu scales in from top-right anchor with a
 * spring bounce. Transform origin is top-right so the corner stays pinned
 * to where the trigger button was. Items stagger-fade in on open.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SortOption } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "alphabetical", label: "Sort Alphabetically" },
  { value: "distance",     label: "Sort by Distance" },
  { value: "lastVisited",  label: "Sort by Last Visited" },
  { value: "company",      label: "Sort by Company" },
];

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

// Menu container: springs open from scale 0 → 1, origin pinned to top-right.
// stiffness/damping tuned to match iOS UIMenu overshoot (~10%).
const menuVariants = {
  hidden: { opacity: 0, scale: 0.01 },
  visible: { opacity: 1, scale: 1 },
  exit:   { opacity: 0, scale: 0.01 },
};

const menuTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 22,
  mass: 0.9,
};

// Opacity only — items fade in with a stagger after the container springs open.
const itemVariants = {
  hidden:  { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.04 + 0.06, duration: 0.15 },
  }),
  exit: { opacity: 0, transition: { duration: 0.05 } },
};

interface Props {
  current: SortOption;
  onChange: (sort: SortOption) => void;
}

export default function SortMenu({ current, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">

      {/* Trigger — fades out while menu is open so it doesn't peek through */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.85 : 1 }}
        transition={{ duration: 0.12 }}
        className="w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ background: "var(--color-dark-secondary)" }}
        aria-label="Sort accounts"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5H17"  stroke="var(--color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M6 10H14" stroke="var(--color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M9 15H11" stroke="var(--color-text-muted)" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Dismiss overlay */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

            {/* Menu — top-right corner anchored to where the button sits */}
            <motion.div
              className="absolute right-0 top-0 z-20 w-56"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={menuTransition}
              style={{
                transformOrigin: "top right",
                background: "var(--color-dark-tertiary)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {SORT_OPTIONS.map((opt, i) => {
                const isSelected = current === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="w-full flex items-center text-left text-base"
                    style={{
                      gap: 12,
                      paddingTop: 10,
                      paddingBottom: 10,
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
