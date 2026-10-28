"use client";

/**
 * FLUTTER HANDOFF: ChatMessageList
 * Widget: StatefulWidget (ScrollController; jumps to the newest message when the list grows)
 * Props: turns, thinking, streamingId + revealedWords (a spoken reply being highlighted word by word)
 * Layout: 16px side padding, 24px between messages, 16px under the last one
 * Flutter equivalent: chat_message_list.dart (ListView with reverse: true)
 * Tokens: spacing.4/6
 */

import { useEffect, useRef } from "react";
import ChatMessage, { ThinkingRow } from "@/components/chat/ChatMessage";
import type { ChatTurn } from "@/lib/types";

export default function ChatMessageList({
  turns, thinking = false, streamingId, revealedWords, scroll = true,
}: {
  turns: ChatTurn[];
  thinking?: boolean;
  streamingId?: string;
  revealedWords?: number;
  /** false in static previews */
  scroll?: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scroll) return;
    const el = endRef.current?.parentElement;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns.length, thinking, revealedWords, scroll]);

  return (
    <div
      className="flex-1 min-h-0 flex flex-col"
      style={{ overflowY: scroll ? "auto" : "hidden", padding: "var(--spacing-2) var(--spacing-4) var(--spacing-4)", gap: "var(--spacing-6)" }}
    >
      {turns.map((t) => (
        <ChatMessage key={t.id} turn={t} revealedWords={t.id === streamingId ? revealedWords : undefined} />
      ))}
      {thinking && <ThinkingRow />}
      <div ref={endRef} />
    </div>
  );
}
