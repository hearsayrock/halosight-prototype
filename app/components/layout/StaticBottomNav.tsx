"use client";

/**
 * Renders BottomNav as an absolute overlay anchored to the bottom of
 * phone-screen — outside PageTransition so it never slides with pages.
 * Hidden on the login screen ("/").
 */

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function StaticBottomNav() {
  const pathname = usePathname();
  const ROOT_PAGES = ["/home", "/accounts"];
  if (!ROOT_PAGES.includes(pathname)) return null;

  return (
    <div className="absolute bottom-0 left-0 z-50">
      <BottomNav />
    </div>
  );
}
