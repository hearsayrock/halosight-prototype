"use client";

/**
 * FLUTTER HANDOFF: ChatDrawer
 * Route: opened from the account screen's more-options menu ("Ask")
 * Widget: StatefulWidget (bottom sheet, ~94% tall, keyboard aware)
 * State: turns, input, thinking, mode ("text" | "voice"), voice phase + streamed word count, history open, threads
 * Data: mock-data/chat.ts (canned replies; no model). Flutter: ChatViewModel + AskAccountUseCase + ChatRepository.
 * Flutter equivalent: account_chat_sheet.dart
 * Tokens: color.dark.primary (panel, via DrawerPanel), radius.xl, spacing.2/4; see the parts for the rest
 *
 * Composition: DrawerHandle · ChatHeader · (ChatEmptyState | ChatMessageList) · (ChatInput | ChatVoiceDock)
 * with ChatHistoryMenu as a popover under the history icon.
 * Text flow: send → user bubble → ThinkingDots → reply. Voice flow (simulated): listening → "hears" a question →
 * thinking (transcript shown) → speaking (reply highlights word by word) → listening again; tap the orb to "speak" again.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { DrawerBackdrop, DrawerPanel, useOverlayRoot } from "@/components/ui/Drawer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";
import ChatVoiceDock, { type VoicePhase } from "@/components/chat/ChatVoiceDock";
import ChatHistoryMenu from "@/components/chat/ChatHistoryMenu";
import {
  CHAT_SAMPLE_TURNS, CHAT_SUGGESTIONS, CHAT_THREADS, CHAT_USER_NAME, VOICE_SAMPLE_QUESTION, chatId, replyFor,
} from "@/lib/mock-data/chat";
import type { ChatThread, ChatTurn } from "@/lib/types";

const VOICE_QUESTIONS = [VOICE_SAMPLE_QUESTION, "Draft a quick note to Dana about it", "What's at risk on this account?"];

export default function ChatDrawer({
  open, accountName, onClose,
}: {
  open: boolean;
  accountName: string;
  onClose: () => void;
}) {
  const root = useOverlayRoot();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [phase, setPhase] = useState<VoicePhase>("listening");
  const [transcript, setTranscript] = useState("");
  const [streamId, setStreamId] = useState<string | undefined>();
  const [revealed, setRevealed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>(CHAT_THREADS);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const voiceIndex = useRef(0);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const reply = useCallback((question: string) => {
    const r = replyFor(question);
    const turn: ChatTurn = { id: chatId(), role: "assistant", text: r.text, draft: r.draft };
    setTurns((t) => [...t, turn]);
    return turn;
  }, []);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setTurns((t) => [...t, { id: chatId(), role: "user", text: q }]);
    setThinking(true);
    later(() => { setThinking(false); reply(q); }, 1100);
  }

  // Voice (simulated) ---------------------------------------------------------
  function hear() {
    clearTimers();
    const q = VOICE_QUESTIONS[voiceIndex.current++ % VOICE_QUESTIONS.length];
    setTranscript(q);
    setTurns((t) => [...t, { id: chatId(), role: "user", text: q }]);
    setPhase("thinking");
    later(() => speak(q), 1300);
  }

  function speak(question: string) {
    const turn = reply(question);
    const words = turn.text.split(" ").length;
    setStreamId(turn.id);
    setRevealed(0);
    setPhase("speaking");
    for (let i = 1; i <= words; i++) later(() => setRevealed(i), i * 150);
    later(() => { setStreamId(undefined); setPhase("listening"); }, words * 150 + 600);
  }

  function startVoice() {
    clearTimers();
    setMode("voice");
    setPhase("listening");
    later(hear, 2400);
  }

  function endVoice() {
    clearTimers();
    setStreamId(undefined);
    setMode("text");
  }

  function newChat() {
    clearTimers();
    setTurns([]); setInput(""); setThinking(false); setStreamId(undefined); setMode("text"); setHistoryOpen(false);
  }

  function openThread() {
    clearTimers();
    setTurns(CHAT_SAMPLE_TURNS); setThinking(false); setStreamId(undefined); setMode("text"); setHistoryOpen(false);
  }

  if (!root) return null;

  return createPortal(
    <AnimatePresence onExitComplete={newChat}>
      {open && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>
          <DrawerBackdrop onClick={onClose} />
          <DrawerPanel
            keyboardAware
            flexColumn
            maxHeight="94%"
            style={{ height: "calc(94% - var(--keyboard-inset, 0px))" }}
          >
            <div className="relative flex flex-col flex-1 min-h-0">
              <ChatHeader
                historyOpen={historyOpen}
                onHistory={() => setHistoryOpen((o) => !o)}
                onNewChat={newChat}
                onMinimize={onClose}
              />

              {turns.length === 0 && !thinking ? (
                <ChatEmptyState userName={CHAT_USER_NAME} accountName={accountName} suggestions={CHAT_SUGGESTIONS} onPick={send} />
              ) : (
                <ChatMessageList turns={turns} thinking={thinking} streamingId={streamId} revealedWords={streamId ? revealed : undefined} />
              )}

              {mode === "text" ? (
                <div className="flex-shrink-0" style={{ padding: "var(--spacing-2) var(--spacing-4) var(--spacing-4)" }}>
                  <ChatInput value={input} onChange={setInput} onSubmit={() => send(input)} onVoiceMode={startVoice} autoFocus={false} />
                </div>
              ) : (
                <ChatVoiceDock
                  phase={phase}
                  transcript={transcript}
                  muted={muted}
                  onMicTap={phase === "listening" ? hear : undefined}
                  onToggleMute={() => setMuted((m) => !m)}
                  onClose={endVoice}
                />
              )}

              {historyOpen && (
                <>
                  <div className="absolute inset-0" style={{ zIndex: 1 }} onClick={() => setHistoryOpen(false)} />
                  <ChatHistoryMenu
                    className="absolute"
                    style={{ top: 52, left: "var(--spacing-4)", right: "var(--spacing-4)", zIndex: 2 }}
                    threads={threads}
                    onSelect={openThread}
                    onTogglePin={(t) => setThreads((all) => all.map((x) => (x.id === t.id ? { ...x, pinned: !x.pinned } : x)))}
                    onDelete={(t) => setThreads((all) => all.filter((x) => x.id !== t.id))}
                    onSeeAll={() => setHistoryOpen(false)}
                  />
                </>
              )}
            </div>
          </DrawerPanel>
        </div>
      )}
    </AnimatePresence>,
    root,
  );
}
