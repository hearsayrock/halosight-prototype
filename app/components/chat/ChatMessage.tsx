"use client";

/**
 * FLUTTER HANDOFF: ChatMessage (user bubble, assistant text, draft block, thinking row)
 * Widget: StatefulWidget for the assistant row (thumbs-down toggle); the rest are stateless
 * Props: turn (ChatTurn); `revealedWords` while a spoken reply is streaming (words after the count render muted)
 * Layout: user = right-aligned bubble, max 82% wide, one tighter corner; assistant = full-width text, no bubble, with copy + thumbs-down underneath
 * Flutter equivalent: chat_message.dart
 * Tokens: color.dark.secondary (user bubble, draft block), color.text.primary / secondary / muted / disabled,
 *         color.brand.coral (thumbs-down active), radius.lg / xs, spacing.2/3/4/5
 */

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import ThinkingDots from "@/components/ui/ThinkingDots";
import ThumbsDownIcon from "@/components/ui/ThumbsDownIcon";
import type { ChatTurn } from "@/lib/types";

const BODY: React.CSSProperties = { fontSize: 17, lineHeight: "24px" };

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        style={{
          ...BODY,
          maxWidth: "82%",
          padding: "var(--spacing-3) var(--spacing-4)",
          borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-xs) var(--radius-lg)",
          background: "var(--md-sys-color-dark-secondary)",
          color: "var(--md-sys-color-text-primary)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

export function DraftBlock({ text }: { text: string }) {
  return (
    <div
      style={{
        ...BODY,
        marginTop: "var(--spacing-3)",
        padding: "var(--spacing-4)",
        borderRadius: "var(--radius-lg)",
        background: "var(--md-sys-color-dark-secondary)",
        color: "var(--md-sys-color-text-secondary)",
      }}
    >
      {text}
    </div>
  );
}

function ActionButton({ label, onClick, pressed, children }: { label: string; onClick?: () => void; pressed?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="flex items-center justify-center active:opacity-60 transition-opacity"
      style={{
        width: 32, height: 32, borderRadius: "var(--radius-full)",
        color: pressed ? "var(--md-sys-color-brand-coral)" : "var(--md-sys-color-text-disabled)",
      }}
    >
      {children}
    </button>
  );
}

/** Copy + thumbs-down under an assistant message. */
export function MessageActions({ text }: { text: string }) {
  const [down, setDown] = useState(false);
  return (
    <div className="flex items-center" style={{ gap: "var(--spacing-1)", marginTop: "var(--spacing-2)", marginLeft: "calc(var(--spacing-2) * -1)" }}>
      <ActionButton label="Copy" onClick={() => navigator.clipboard?.writeText(text).catch(() => {})}>
        <Icon name="content_copy" size={18} />
      </ActionButton>
      <ActionButton label="Not helpful" pressed={down} onClick={() => setDown((d) => !d)}>
        <ThumbsDownIcon filled={down} />
      </ActionButton>
    </div>
  );
}

/** Words up to `revealed` are bright; the rest are muted, so a spoken reply reads like a lyric follow-along. */
function StreamingText({ text, revealed }: { text: string; revealed: number }) {
  const words = text.split(" ");
  return (
    <p style={{ ...BODY, color: "var(--md-sys-color-text-primary)" }}>
      {words.map((w, i) => (
        <span key={i} style={{ color: i < revealed ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-disabled)", transition: "color 0.25s" }}>
          {w}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

export function AssistantMessage({ turn, revealedWords }: { turn: ChatTurn; revealedWords?: number }) {
  const streaming = revealedWords !== undefined;
  return (
    <div>
      {streaming ? (
        <StreamingText text={turn.text} revealed={revealedWords} />
      ) : (
        <p style={{ ...BODY, color: "var(--md-sys-color-text-primary)" }}>{turn.text}</p>
      )}
      {turn.draft && <DraftBlock text={turn.draft} />}
      {!streaming && <MessageActions text={turn.draft ? `${turn.text}\n\n${turn.draft}` : turn.text} />}
    </div>
  );
}

/** Shown while the assistant is working on a typed question. */
export function ThinkingRow() {
  return (
    <div style={{ color: "var(--md-sys-color-text-muted)", padding: "var(--spacing-2) 0" }}>
      <ThinkingDots size="md" label="Thinking" />
    </div>
  );
}

export default function ChatMessage({ turn, revealedWords }: { turn: ChatTurn; revealedWords?: number }) {
  return turn.role === "user" ? <UserMessage text={turn.text} /> : <AssistantMessage turn={turn} revealedWords={revealedWords} />;
}
