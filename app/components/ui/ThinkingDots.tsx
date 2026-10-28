/**
 * FLUTTER HANDOFF: ThinkingDots
 * Widget: StatefulWidget with one repeating AnimationController (1.2s) driving N bars
 * Props: size ("sm" | "md" | "lg"), bars (3 default), label (screen-reader text)
 * State: none (animation only)
 * Flutter equivalent: thinking_dots.dart (Row of AnimatedBuilder bars, each reading the controller through its own Interval)
 *
 * The in-progress indicator that replaces the spinning circle. Dots that stretch into rounded capsules in a staggered,
 * slightly off-beat wave, like a voice level: it echoes the product (voice debriefs) without copying a chat "thinking" animation.
 *   - Each bar animates height min → max → ~35% of the way back → min over 1.2s, easing (0.4, 0, 0.2, 1), opacity 0.5 → 1 → 0.8 → 0.5
 *   - Bars start 0.14s apart and each runs 40ms faster or slower than its neighbour, so the wave drifts instead of ticking
 *   - Colour is currentColor, so it takes the text colour of whatever it sits in (button label, status line)
 *   - Reduced motion: no animation; bars rest at 40% height, opacity 0.8
 * Sizes (bar width · min → max height): sm 4 · 4→12 (inside buttons) · md 5 · 5→18 · lg 6 · 6→26 (full-screen processing)
 *
 * Tokens: inherits currentColor; radius.full
 */

const SIZES = {
  sm: { w: 4, min: 4,  max: 12, gap: "var(--spacing-1)" },
  md: { w: 5, min: 5,  max: 18, gap: 5 },
  lg: { w: 6, min: 6,  max: 26, gap: 6 },
} as const;

export type ThinkingDotsSize = keyof typeof SIZES;

export default function ThinkingDots({
  size = "sm", bars = 3, label = "Working",
}: {
  size?: ThinkingDotsSize;
  bars?: number;
  /** Screen-reader text. */
  label?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{ gap: s.gap, height: s.max, color: "inherit" }}
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="halo-bar"
          style={{
            width: s.w,
            borderRadius: "var(--radius-full)",
            background: "currentColor",
            ["--halo-min" as string]: `${s.min}px`,
            ["--halo-max" as string]: `${s.max}px`,
            ["--halo-duration" as string]: `${1.2 + (i % 3 === 1 ? 0.04 : i % 3 === 2 ? -0.04 : 0)}s`,
            animationDelay: `${i * 0.14}s`,
            height: s.min,
          }}
        />
      ))}
    </span>
  );
}
