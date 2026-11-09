"use client";

/**
 * FLUTTER HANDOFF: KebabMenu
 * Widget: StatefulWidget (open/close)
 * Props: items ({ label, icon?, onClick, destructive? }[])
 * State: open (bool)
 * Flutter equivalent: kebab_menu.dart (an IconButton opening a PopupMenuButton with HalosightMenu `icon` rows)
 *
 * The "more options" button (three vertical dots, 40x40, rounded square on color.dark.secondary). Tapping it fades the button out (120ms) while the
 * menu springs in from the top-right corner, on top of where the button was. The menu is Menu (variant `icon`): each row has a Material Symbols
 * icon and a label; `destructive` rows use the error color. A tap outside dismisses it. Used on the account page (Edit, Share, Delete).
 *
 * Tokens: color.dark.secondary (button), color.text.muted (dots); the panel and rows come from Menu
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { MenuPanel, MenuRow, menuPanelVariants, menuPanelTransition } from "@/components/ui/Menu";

export interface KebabMenuItem {
  label: string;
  /** Material Symbols name shown before the label */
  icon?: string;
  onClick: () => void;
  destructive?: boolean;
}

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
              className="absolute right-0 top-0 z-20"
              variants={menuPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={menuPanelTransition}
              style={{ transformOrigin: "top right" }}
            >
              <MenuPanel>
                {items.map((item, i) => (
                  <MenuRow
                    key={item.label}
                    index={i}
                    variant="icon"
                    item={{
                      id: item.label,
                      label: item.label,
                      icon: item.icon,
                      destructive: item.destructive,
                      onSelect: () => { item.onClick(); setOpen(false); },
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
