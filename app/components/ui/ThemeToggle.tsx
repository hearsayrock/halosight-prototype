"use client";

/**
 * FLUTTER HANDOFF: ThemeToggle
 * Widget: StatelessWidget (reads/writes ThemeController)
 * State: none locally — value comes from useTheme()
 * Data: lib/theme.ts (localStorage-backed)
 * Flutter equivalent: appearance_segmented_control.dart (SegmentedButton<ThemeMode>)
 * Tokens: --md-sys-color-dark-secondary, --md-sys-color-dark-primary, --md-sys-color-text-primary,
 *         --md-sys-color-text-muted, --md-sys-color-neonindigo, --md-sys-color-alpha-white-10,
 *         --radius-full, --radius-md
 */

import Icon from "@/components/ui/Icon";
import { useTheme, type ThemeMode } from "@/lib/theme";

const OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "dark", label: "Dark", icon: "dark_mode" },
  { value: "light", label: "Light", icon: "light_mode" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ background: "var(--md-sys-color-dark-secondary)", borderRadius: "var(--radius-md)" }}
    >
      <span className="text-base-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
        Appearance
      </span>

      <div
        role="radiogroup"
        aria-label="Appearance"
        className="flex items-center p-0.5"
        style={{
          background: "var(--md-sys-color-background)",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--md-sys-color-alpha-white-10)",
        }}
      >
        {OPTIONS.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(opt.value)}
              className="flex items-center gap-1.5 px-3 h-8 text-sm-bold transition-colors active:opacity-70"
              style={{
                borderRadius: "var(--radius-full)",
                background: active ? "var(--md-sys-color-neonindigo)" : "transparent",
                color: active ? "var(--md-sys-color-text-inverse)" : "var(--md-sys-color-text-muted)",
              }}
            >
              <Icon
                name={opt.icon}
                size={16}
                fill={active}
                style={{ color: active ? "var(--md-sys-color-text-inverse)" : "var(--md-sys-color-text-muted)" }}
              />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
