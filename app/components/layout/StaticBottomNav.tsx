"use client";

/**
 * Renders BottomNav as an absolute overlay anchored to the bottom of
 * phone-screen — outside PageTransition so it never slides with pages.
 * Manages LogVisitSheet open state.
 * Visible on: /relationships (home + companies)
 */

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";
import LogVisitSheet from "./LogVisitSheet";

export default function StaticBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const [showSheet, setShowSheet] = useState(false);
  const showNav = pathname === "/relationships" && (mode === null || mode === "accounts");

  return (
    <>
      {showNav && (
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <BottomNav onCaptureTap={() => setShowSheet(true)} />
        </div>
      )}
      <AnimatePresence>
        {showNav && showSheet && (
          <LogVisitSheet onClose={() => setShowSheet(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
