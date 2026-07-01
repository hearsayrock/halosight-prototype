"use client";

/**
 * FLUTTER HANDOFF: KebabMenu
 * Widget: StatefulWidget (manages open/close)
 * Props: items ({ label, onClick, destructive? }[])
 * Tokens: --md-sys-color-dark-secondary (trigger bg), --md-sys-color-dark-tertiary (menu bg),
 *         --md-sys-color-text-muted (trigger icon), --md-sys-color-text-primary (item text),
 *         --md-sys-color-brand-coral (destructive item), --radius-xl
 * Animation: springs in from top-right anchor, matching SortMenu pattern.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

export interface KebabMenuItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

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

interface Props {
  items: KebabMenuItem[];
}

export default function KebabMenu({ items }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.85 : 1 }}
        transition={{ duration: 0.12 }}
        className="w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ background: "var(--md-sys-color-dark-secondary)" }}
        aria-label="More options"
      >
        <Icon name="more_vert" size={20} style={{ color: "var(--md-sys-color-text-muted)" }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-0 z-20 w-52"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={menuTransition}
              style={{
                transformOrigin: "top right",
                background: "var(--md-sys-color-dark-tertiary)",
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
              {items.map((item, i) => (
                <motion.button
                  key={item.label}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => { item.onClick(); setOpen(false); }}
                  className="w-full text-left text-base"
                  style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    background: "transparent",
                    color: item.destructive ? "var(--md-sys-color-brand-coral)" : "var(--md-sys-color-text-primary)",
                  }}
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
