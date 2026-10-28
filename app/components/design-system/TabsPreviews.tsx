"use client";

/** Design-system page previews for Tabs — NOT part of the mobile app UX. Interactive: tap a tab to select it. */

import { useState } from "react";
import Tabs, { type TabItem } from "@/components/ui/Tabs";

export function TabsPreview({ tabs, variant }: { tabs: TabItem[]; variant: "underline" | "segmented" }) {
  const [value, setValue] = useState(tabs[0].id);
  return (
    <div style={variant === "segmented" ? { padding: "var(--spacing-4)" } : { paddingTop: "var(--spacing-4)", paddingBottom: "var(--spacing-4)" }}>
      <Tabs tabs={tabs} value={value} onChange={setValue} variant={variant} />
    </div>
  );
}
