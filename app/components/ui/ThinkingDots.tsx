/**
 * FLUTTER HANDOFF: ThinkingDots
 * Widget: StatefulWidget with one repeating AnimationController (2.1s) driving three capsules
 * Props: size ("sm" | "md" | "lg"), label (screen-reader text)
 * State: none (animation only)
 * Flutter equivalent: thinking_dots.dart (Row of three capsules, each an AnimatedBuilder reading the controller through a smooth x-offset curve)
 *
 * The in-progress indicator that replaces the spinning circle ("Shuffle"). Three capsules of different heights (short, medium, tall)
 * swap places in a loop. Heights never change, so it reads as work in progress rather than a voice level or a "recording" meter.
 *   - Slots are one pitch apart (bar width + gap). Over the loop each capsule passes through three slots (in slot units):
 *     short 0 → 1 → 2 → 0, medium 0 → 1 → -1 → 0, tall 0 → -2 → -1 → 0
 *   - The motion never stops: each path is one smooth periodic curve through its three slots (Catmull-Rom / Hermite, so velocity is
 *     continuous at every turn), 2.1s per loop. In CSS it is sampled every ~4% with linear timing. In Flutter use a TweenSequence of
 *     CatmullRom-style segments, or a single Curve over a periodic spline, on one repeating controller
 *   - Colour is currentColor, so it takes the text colour of whatever it sits in
 *   - Reduced motion: no animation; capsules rest in their starting slots
 * Sizes (capsule width · short / medium / tall height): sm 4 · 7 / 12 / 16 (inside buttons) · md 5 · 10 / 17 / 24 · lg 6 · 13 / 23 / 32 (full-screen processing)
 * The box is three capsules wide (3 × width + 2 × gap) and the tall capsule's height, so a loading button never changes size.
 *
 * Tokens: inherits currentColor; radius.full
 */

const SIZES = {
  sm: { w: 4, heights: [7, 12, 16],  gap: "var(--spacing-1)" },
  md: { w: 5, heights: [10, 17, 24], gap: 5 },
  lg: { w: 6, heights: [13, 23, 32], gap: 6 },
} as const;

export type ThinkingDotsSize = keyof typeof SIZES;

export default function ThinkingDots({
  size = "sm", label = "Working",
}: {
  size?: ThinkingDotsSize;
  /** Screen-reader text. */
  label?: string;
}) {
  const s = SIZES[size];
  const pitch = s.w * 2;           // capsule width + gap (the gap tokens equal the capsule width)
  const tallest = s.heights[2];

  return (
    <span
      role="status"
      aria-label={label}
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{ gap: s.gap, height: tallest, minWidth: 3 * s.w + 2 * s.w, color: "inherit" }}
    >
      {s.heights.map((h, i) => (
        <span
          key={i}
          aria-hidden
          className={`halo-shuffle-${i}`}
          style={{
            width: s.w,
            height: h,
            borderRadius: "var(--radius-full)",
            background: "currentColor",
            ["--halo-pitch" as string]: `${pitch}px`,
          }}
        />
      ))}
    </span>
  );
}
