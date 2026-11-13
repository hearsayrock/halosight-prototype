"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { menuPanelTransition, menuPanelVariants } from "@/components/ui/Menu";

/** Shared dismiss layer and animated positioning for anchored menu panels. */
export default function MenuPopover({ open, onClose, placement = "below-left", backdropZIndex = 40, panelZIndex = 50, children }: { open: boolean; onClose: () => void; placement?: "below-left" | "top-right"; backdropZIndex?: number; panelZIndex?: number; children: ReactNode }) {
  const below = placement === "below-left";
  return <AnimatePresence>{open && <><div className="fixed inset-0" style={{ zIndex: backdropZIndex }} onClick={onClose} /><motion.div className={`absolute ${below ? "left-0 top-full mt-1" : "right-0 top-0"}`} style={{ zIndex: panelZIndex, transformOrigin: below ? "top left" : "top right" }} variants={menuPanelVariants} initial="hidden" animate="visible" exit="exit" transition={menuPanelTransition}>{children}</motion.div></>}</AnimatePresence>;
}
