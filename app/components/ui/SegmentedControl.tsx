"use client";

/**
 * FLUTTER HANDOFF: SegmentedControl
 * Widget: StatelessWidget
 * Tokens: --md-sys-color-dark-base (track), --md-sys-color-dark-tertiary (active segment bg),
 *         --md-sys-color-text-primary (active label), --md-sys-color-text-disabled (inactive label),
 *         --radius-full
 * Flutter equivalent: segmented_control.dart
 */

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div
      className="flex gap-1"
      style={{
        background: "var(--md-sys-color-dark-base)",
        borderRadius: "var(--radius-full)",
        padding: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-1 flex items-center justify-center active:opacity-80 transition-all"
            style={{
              height: 32,
              borderRadius: "var(--radius-full)",
              fontSize: 13,
              fontWeight: 600,
              background: active ? "var(--md-sys-color-dark-tertiary)" : "transparent",
              color: active ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-disabled)",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
