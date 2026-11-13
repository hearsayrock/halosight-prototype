"use client";

import { createContext, useContext } from "react";

export type AtomicTier = "All" | "Atoms" | "Molecules" | "Organisms" | "Templates";
export type LibraryTier = Exclude<AtomicTier, "All">;

export const TIER_BY_SECTION: Record<string, LibraryTier> = {
  buttons: "Atoms", badges: "Atoms", "custom-icons": "Atoms", icons: "Atoms", "icon-button": "Atoms",
  "text-field": "Atoms", "filter-pill": "Atoms", skeleton: "Atoms",
  "account-list-item": "Molecules", tabs: "Molecules", "activity-card": "Molecules", "kebab-menu": "Molecules",
  "search-field": "Molecules", "section-header": "Molecules", "scroll-top-bar": "Molecules", banner: "Molecules",
  "error-state": "Molecules", menus: "Molecules", toast: "Molecules",
  drawer: "Organisms", "action-item-list": "Organisms", "action-item-drawer": "Organisms", "engagements-drawer": "Organisms",
  "insight-card": "Organisms", "ai-review": "Organisms", "account-picker": "Organisms", "alert-dialog": "Organisms",
  "account-chat": "Organisms", "feedback-widget": "Organisms",
};

export interface ComponentCatalogState {
  query: string;
  tier: AtomicTier;
  activeId: string | null;
}

export const ComponentCatalogContext = createContext<ComponentCatalogState>({ query: "", tier: "All", activeId: null });

export function useComponentCatalog() {
  return useContext(ComponentCatalogContext);
}
