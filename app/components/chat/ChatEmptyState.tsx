"use client";

/**
 * FLUTTER HANDOFF: ChatEmptyState (+ SuggestionChip)
 * Widget: StatelessWidget
 * Props: userName, accountName, suggestions, onPick
 * Layout: greeting and subtitle centered in the free space; a horizontally scrolling row of suggestion chips below, 16px side padding
 * Flutter equivalent: chat_empty_state.dart (Column + SingleChildScrollView(horizontal) of chips)
 * Tokens: color.neonindigo (greeting), color.text.muted (subtitle), color.text.primary (chip text),
 *         color.dark.secondary (chip), radius.lg, spacing.2/4/5
 */

export function SuggestionChip({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left active:opacity-70 transition-opacity flex-shrink-0"
      style={{
        width: 176,
        padding: "var(--spacing-4)",
        borderRadius: "var(--radius-lg)",
        background: "var(--md-sys-color-dark-secondary)",
        color: "var(--md-sys-color-text-primary)",
        fontSize: 17,
        lineHeight: "22px",
        fontWeight: 500,
      }}
    >
      {label}
    </button>
  );
}

export default function ChatEmptyState({
  userName, accountName, suggestions, onPick,
}: {
  userName: string;
  accountName: string;
  suggestions: string[];
  onPick?: (s: string) => void;
}) {
  return (
    <div className="flex flex-col justify-center flex-1" style={{ gap: "var(--spacing-8)", paddingBottom: "var(--spacing-8)" }}>
      <div className="text-center" style={{ padding: "0 var(--spacing-4)" }}>
        <h2 style={{ fontSize: 32, lineHeight: "38px", fontWeight: 700, color: "var(--md-sys-color-neonindigo)" }}>
          Hi, {userName}
        </h2>
        <p style={{ marginTop: "var(--spacing-2)", fontSize: 17, color: "var(--md-sys-color-text-muted)" }}>
          Ask anything about {accountName}.
        </p>
      </div>
      <div
        className="flex overflow-x-auto"
        style={{ gap: "var(--spacing-3)", padding: "0 var(--spacing-4)", scrollbarWidth: "none" }}
      >
        {suggestions.map((s) => <SuggestionChip key={s} label={s} onClick={() => onPick?.(s)} />)}
      </div>
    </div>
  );
}
