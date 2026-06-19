"use client";

/**
 * FLUTTER HANDOFF: PageTransition
 * Web-only — no Flutter equivalent needed.
 * Flutter uses Navigator push/pop which handles this natively.
 *
 * Direction detection:
 *   - Cross-tab navigation (home ↔ accounts): uses tab order position.
 *     Home (0) → Accounts (1) = forward. Accounts → Home = back.
 *   - Within a tab: uses route depth (deeper = forward, shallower = back).
 *
 * iOS decelerate easing: cubic-bezier(0.32, 0.72, 0, 1)
 */

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

// Tab order — determines slide direction when switching between root tabs.
const TAB_ORDER: { prefix: string; order: number }[] = [
  { prefix: "/relationships", order: 0 },
];

function routeDepth(path: string): number {
  return path.split("/").filter(Boolean).length;
}

function getDirection(prev: string, curr: string): number {
  const prevTab = TAB_ORDER.find((t) => prev.startsWith(t.prefix));
  const currTab = TAB_ORDER.find((t) => curr.startsWith(t.prefix));

  // Cross-tab: use tab order position
  if (prevTab && currTab && prevTab.prefix !== currTab.prefix) {
    return currTab.order > prevTab.order ? 1 : -1;
  }

  // Returning to a root tab from a non-tab page (e.g. /profile → /home): treat as back
  if (currTab && !prevTab) {
    return -1;
  }

  // Within same tab (or unknown): use route depth
  return routeDepth(curr) >= routeDepth(prev) ? 1 : -1;
}

// Forward: new page enters from right, old exits to left (partially)
// Back: new page enters from left (partially), old exits to right
const variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "100%" : "-20%",
    zIndex: dir >= 0 ? 1 : 0,
  }),
  center: {
    x: 0,
    zIndex: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "-20%" : "100%",
    zIndex: 0,
  }),
};

const transition = {
  type: "tween" as const,
  duration: 0.32,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Compute direction synchronously during render so AnimatePresence
  // picks up the correct custom value when mounting the new page.
  const prevPathname = useRef<string>(pathname);
  const direction = useRef<number>(1);

  if (prevPathname.current !== pathname) {
    direction.current = getDirection(prevPathname.current, pathname);
    prevPathname.current = pathname;
  }

  return (
    <AnimatePresence initial={false} custom={direction.current}>
      <motion.div
        key={pathname}
        custom={direction.current}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition}
        style={{ position: "absolute", inset: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
