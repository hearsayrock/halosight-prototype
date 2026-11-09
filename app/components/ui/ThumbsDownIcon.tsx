/**
 * FLUTTER HANDOFF: ThumbsDownIcon
 * Widget: StatelessWidget (CustomPaint or an SVG asset; Material's thumb_down has a wrist cuff we don't want)
 * Props: filled (bool, default false), size (default 15)
 * The "not helpful" mark on AI answers (insight card and chat message). Outline by default; filled (currentColor) once the feedback is given.
 * 15x15 on a 1.6 stroke with round caps and joins; the path is a speech-bubble-style thumb, not Material's.
 * Tokens: inherits currentColor
 */
export default function ThumbsDownIcon({ filled = false, size = 15 }: { filled?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 1.5h7a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H9L7.5 13.5 6 8.5H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
