/**
 * FLUTTER HANDOFF: ErrorState
 * Flutter equivalent: a centered Column with an Icon, Text, and TextButton.
 * Wire the onRetry callback to re-trigger the data fetch (e.g. re-call the
 * ViewModel's load() method or invalidate the FutureProvider).
 */

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
        className="text-base font-semibold mb-1.5"
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
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 text-sm font-semibold transition-opacity active:opacity-70"
          style={{
            background: "var(--md-sys-color-dark-secondary)",
            color: "var(--md-sys-color-text-primary)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--md-sys-color-dark-tertiary)",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
