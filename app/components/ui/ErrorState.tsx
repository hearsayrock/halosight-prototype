/**
 * FLUTTER HANDOFF: ErrorState
 * Widget: StatelessWidget
 * Props: title (default "Something went wrong"), message (default "We couldn't load this content. Check your connection and try again."), onRetry?
 * Flutter equivalent: error_state.dart (a centered Column: icon circle, title, message, retry button). Wire onRetry to re-run the load
 *   (the ViewModel's load() or invalidating the FutureProvider).
 *
 * What a list or screen shows when its data fails to load. Centered in the space it fills, 32px side padding:
 *   - a 52px circle on color.dark.secondary holding a 24px warning triangle in color.brand.coral
 *   - the title (base, bold, color.text.primary), then the message (small, color.text.muted, max 260px wide)
 *   - "Try again": a Button (tonal, sm), shown only when onRetry is given
 * Use it for a failed load. A failed action (a save that did not go through) is a Toast or a Banner, not this.
 *
 * Tokens: color.dark.secondary (icon circle), color.brand.coral (triangle), color.text.primary / muted; the button is Button (tonal)
 */

import Button from "@/components/ui/Button";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Check your connection and try again.",
  onRetry,
}: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8"
      style={{ flex: 1 }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "var(--md-sys-color-dark-secondary)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            stroke="var(--md-sys-color-brand-coral)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Title */}
      <p
        className="text-base-bold mb-1.5"
        style={{ color: "var(--md-sys-color-text-primary)" }}
      >
        {title}
      </p>

      {/* Message */}
      <p
        className="text-sm leading-relaxed mb-5"
        style={{ color: "var(--md-sys-color-text-muted)", maxWidth: 260 }}
      >
        {message}
      </p>

      {/* Retry */}
      {onRetry && <Button variant="tonal" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
