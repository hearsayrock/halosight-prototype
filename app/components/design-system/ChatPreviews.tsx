"use client";

/**
 * Design-system page previews for the account chat — NOT part of the mobile app UX.
 * Composes the real chat parts (components/chat/*) inside a static, phone-width drawer frame,
 * so the reference page can never drift from the live ChatDrawer.
 */

import { useEffect, useState } from "react";
import { DrawerHandle } from "@/components/ui/Drawer";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";
import ChatVoiceDock, { type VoicePhase } from "@/components/chat/ChatVoiceDock";
import ChatHistoryMenu from "@/components/chat/ChatHistoryMenu";
import VoiceAtmosphere from "@/components/chat/VoiceAtmosphere";
import { CHAT_SAMPLE_TURNS, CHAT_SUGGESTIONS, CHAT_THREADS, CHAT_USER_NAME, VOICE_SAMPLE_QUESTION } from "@/lib/mock-data/chat";
import type { ChatThread, ChatTurn } from "@/lib/types";

/** Static drawer surface at phone height: dark-primary, radius-xl top corners, handle. */
function ChatFrame({ children, height = 560 }: { children: React.ReactNode; height?: number }) {
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        height,
        margin: "var(--spacing-4) var(--spacing-4) 0",
        background: "var(--md-sys-color-dark-primary)",
        borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
      }}
    >
      <DrawerHandle />
      {children}
    </div>
  );
}

const dock = { padding: "var(--spacing-2) var(--spacing-4) var(--spacing-4)" } as const;

export function EmptyPreview() {
  const [text, setText] = useState("");
  return (
    <ChatFrame>
      <ChatHeader />
      <ChatEmptyState userName={CHAT_USER_NAME} accountName="Acme Co Inc." suggestions={CHAT_SUGGESTIONS} />
      <div style={dock}><ChatInput value={text} onChange={setText} onSubmit={() => {}} onVoiceMode={() => {}} /></div>
    </ChatFrame>
  );
}

export function TypingPreview() {
  const [text, setText] = useState("Draft a quick note to Dana");
  return (
    <ChatFrame height={300}>
      <ChatHeader />
      <div className="flex-1" />
      <div style={dock}><ChatInput value={text} onChange={setText} onSubmit={() => {}} onVoiceMode={() => {}} /></div>
    </ChatFrame>
  );
}

export function ConversationPreview({ turns = CHAT_SAMPLE_TURNS, thinking = false }: { turns?: ChatTurn[]; thinking?: boolean }) {
  const [text, setText] = useState("");
  return (
    <ChatFrame>
      <ChatHeader />
      <ChatMessageList turns={turns} thinking={thinking} scroll={false} />
      <div style={dock}><ChatInput value={text} onChange={setText} onSubmit={() => {}} onVoiceMode={() => {}} /></div>
    </ChatFrame>
  );
}

export function HistoryPreview() {
  const [threads, setThreads] = useState<ChatThread[]>(CHAT_THREADS);
  const [text, setText] = useState("");
  return (
    <ChatFrame>
      <ChatHeader historyOpen />
      <ChatEmptyState userName={CHAT_USER_NAME} accountName="Acme Co Inc." suggestions={CHAT_SUGGESTIONS} />
      <div style={dock}><ChatInput value={text} onChange={setText} onSubmit={() => {}} onVoiceMode={() => {}} /></div>
      <ChatHistoryMenu
        className="absolute"
        style={{ top: 64, left: "var(--spacing-4)", right: "var(--spacing-4)" }}
        threads={threads}
        onSelect={() => {}}
        onTogglePin={(t) => setThreads((all) => all.map((x) => (x.id === t.id ? { ...x, pinned: !x.pinned } : x)))}
        onDelete={(t) => setThreads((all) => all.filter((x) => x.id !== t.id))}
        onSeeAll={() => {}}
      />
    </ChatFrame>
  );
}

/** Words of `text` appearing one at a time, then a pause, then it starts over. */
function useLoopingWords(text: string, active: boolean) {
  const [n, setN] = useState(0);
  const total = text.split(" ").length;
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setN((c) => (c >= total + 5 ? 0 : c + 1)), n === 0 ? 900 : n > total ? 450 : 260);
    return () => clearTimeout(t);
  }, [n, total, active]);
  return text.split(" ").slice(0, Math.min(n, total)).join(" ");
}

export function VoicePreview({ phase }: { phase: VoicePhase }) {
  const [muted, setMuted] = useState(false);
  const live = useLoopingWords(VOICE_SAMPLE_QUESTION, phase === "listening");
  const turns = CHAT_SAMPLE_TURNS.slice(0, 2);
  const question: ChatTurn = { id: "v1", role: "user", text: VOICE_SAMPLE_QUESTION };
  const speaking = phase === "speaking";
  const list: ChatTurn[] = phase === "listening" ? turns : [...turns, question, ...(speaking ? [{ ...turns[1], id: "v2" }] : [])];
  return (
    <ChatFrame>
      <VoiceAtmosphere phase={phase} />
      <div className="relative flex flex-col flex-1 min-h-0" style={{ zIndex: 1 }}>
        <ChatHeader />
        <ChatMessageList turns={list} streamingId={speaking ? "v2" : undefined} revealedWords={speaking ? 31 : undefined} scroll={false} />
        <ChatVoiceDock phase={phase} transcript={VOICE_SAMPLE_QUESTION} liveTranscript={phase === "listening" ? live : undefined} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
      </div>
    </ChatFrame>
  );
}

export function DockPreview({ phase }: { phase: VoicePhase }) {
  return (
    <div style={{ width: 358, borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--md-sys-color-dark-primary)" }}>
      <ChatVoiceDock phase={phase} transcript={VOICE_SAMPLE_QUESTION} />
    </div>
  );
}
