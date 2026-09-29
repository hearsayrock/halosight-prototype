"use client";

/**
 * FLUTTER HANDOFF: ThemeController
 * Widget: n/a — ViewModel/state holder
 * State: current ThemeMode ("dark" | "light"), persisted locally
 * Flutter equivalent: theme_controller.dart (ChangeNotifier/Cubit) driving MaterialApp.themeMode
 * Tokens: swaps the whole token set via <html data-theme="light">
 */

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "halosight-theme";
const THEME_EVENT = "halosight-theme-change";

function readStoredTheme(): ThemeMode {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function applyTheme(mode: ThemeMode) {
  if (mode === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    setThemeState(readStoredTheme());
    const sync = () => setThemeState(readStoredTheme());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyTheme(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // storage unavailable — theme still applies for this session
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return { theme, setTheme };
}
