"use client";

/**
 * Icon library switch (exploration): "material" (default), "lucide" or "fontawesome".
 * Stored in localStorage so the design-system page and the app share it; toggle it from the
 * design-system header or the DevPanel. Not part of the product UX.
 */

import { useSyncExternalStore } from "react";

export type IconLibrary = "material" | "lucide" | "fontawesome";

const KEY = "halo-icon-library";
const listeners = new Set<() => void>();

function read(): IconLibrary {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "lucide" || v === "fontawesome" ? v : "material";
  } catch {
    return "material";
  }
}

export function setIconLibrary(lib: IconLibrary) {
  try { window.localStorage.setItem(KEY, lib); } catch { /* private mode: switch only lasts until reload */ }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
}

export function useIconLibrary(): IconLibrary {
  return useSyncExternalStore(subscribe, read, () => "material");
}
