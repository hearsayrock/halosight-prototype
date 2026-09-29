"use client";

/**
 * FLUTTER HANDOFF: ThemeSwitch
 * Web-only prototype chrome — no Flutter equivalent (the in-app control is ThemeToggle on Profile).
 * State: none locally — reads/writes useTheme() (localStorage-backed, synced across controls)
 * Tokens: --md-sys-color-neonindigo, --md-sys-color-dark-tertiary, --md-sys-color-text-inverse,
 *         --md-sys-color-text-muted, --md-sys-shadow-rgb, --md-sys-shadow-k
 *
 * iOS-style switch pinned bottom-right beside the DEV badge, outside the phone frame.
 * ON = light mode.
 */

import Icon from "@/components/ui/Icon";
import { useTheme } from "@/lib/theme";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const light = theme === "light";

  return (
    <button
      role="switch"
      aria-checked={light}
      aria-label="Light mode"
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      onClick={() => setTheme(light ? "dark" : "light")}
      style={{
        position: "fixed",
        bottom: 15,
        right: 112,
        zIndex: 9999,
        width: 46,
        height: 28,
        padding: 2,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: light ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-dark-tertiary)",
        transition: "background 0.2s",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(var(--md-sys-shadow-rgb), calc(0.4 * var(--md-sys-shadow-k)))",
          transform: light ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <Icon
          name={light ? "light_mode" : "dark_mode"}
          size={15}
          fill
          style={{ color: light ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-muted)" }}
        />
      </span>
    </button>
  );
}
