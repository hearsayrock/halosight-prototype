"use client";

/**
 * FLUTTER HANDOFF: PageTransition
 * Web-only — no Flutter equivalent needed.
 * Flutter uses Navigator push/pop which handles this natively.
 *
 * Direction detection: compares route depth of current vs previous pathname.
 * Deeper route = forward (slide in from right).
 * Shallower route = back (slide out to right).
 *
 * iOS decelerate easing: cubic-bezier(0.32, 0.72, 0, 1)
 */

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

function routeDepth(path: string): number {
  return path.split("/").filter(Boolean).length;
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
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number], // iOS decelerate curve
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Compute direction synchronously during render so AnimatePresence
  // picks up the correct custom value when mounting the new page.
  const prevPathname = useRef<string>(pathname);
  const direction = useRef<number>(1);

  if (prevPathname.current !== pathname) {
    const prev = routeDepth(prevPathname.current);
    const curr = routeDepth(pathname);
    direction.current = curr >= prev ? 1 : -1;
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
