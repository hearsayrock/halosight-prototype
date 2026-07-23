"use client";

/**
 * FLUTTER HANDOFF: AIPrepChat
 * Widget: StatefulWidget (chat + scroll)
 * Tokens: --md-sys-color-dark-primary, --md-sys-color-dark-secondary,
 *         --md-sys-color-dark-tertiary, --md-sys-color-text-primary,
 *         --md-sys-color-text-secondary, --md-sys-color-text-muted,
 *         --md-sys-color-neonindigo, --md-sys-color-brand-coral,
 *         --md-sys-color-alpha-white-10, --radius-xl, --radius-full, --radius-lg
 *
 * Shown on brand-new accounts (no visit history).
 * "And just like that" header fades out when the user first engages.
 * AI responses are hardcoded for the three suggested prompts; free-form
 * input gets a generic fallback.
 */

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
}

const INITIAL_MESSAGE =
  "New account with a blank slate, and nowhere to go but up. What do you want to nail on this visit?";

const PROMPT_RESPONSES: Record<string, string> = {
  "How should I open the conversation?":
    "Since this is a cold visit, lead with curiosity — not pitch.\n\nTry: \"We work with a few businesses in the area and I wanted to stop in and introduce myself. No agenda today — just putting a face to the name.\"\n\nLow pressure, but it opens the door. If they have a minute, follow up with one sentence on what you do.",

  "What should I ask to qualify them?":
    "Focus on two things: decision-making authority and pain.\n\nStart with: \"Who typically handles vendor relationships here?\" — that tells you quickly if you're talking to the right person.\n\nThen: \"What does your current process look like for [your product area]?\" Listen for friction. That's your opening.",

  "Who am I likely talking to?":
    "At a branch location, expect an office manager, branch manager, or dispatcher. They're usually the gatekeeper — not the final buyer, but their opinion matters.\n\nBe respectful of their time, get their name early, and before you leave ask: \"Who would I follow up with on the business side?\"",
};

const FALLBACK_RESPONSE =
  "I don't have specific intel on them yet — but I can help you think through the approach. What would be most useful to prep right now?";

const PROMPTS: Array<{ label: string; icon: string }> = [
  { label: "How should I open the conversation?", icon: "bolt" },
  { label: "What should I ask to qualify them?",  icon: "help"  },
  { label: "Who am I likely talking to?",          icon: "group" },
];

interface Props {
  accountName: string;
  onLogVisit?: () => void;
}

export default function AIPrepChat({ accountName, onLogVisit }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "ai", content: INITIAL_MESSAGE },
  ]);
  const [chatStarted,    setChatStarted]    = useState(false);
  const [promptsVisible, setPromptsVisible] = useState(true);
  const [typing,         setTyping]         = useState(false);
  const [inputValue,     setInputValue]     = useState("");
  const [bottomHeight,   setBottomHeight]   = useState(0);
  const [inputFocused,   setInputFocused]   = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inputFocused) return;
    const close = () => setInputFocused(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [inputFocused]);

  // Measure the fixed bottom bar so the messages area can pad to avoid it
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBottomHeight(el.offsetHeight));
    ro.observe(el);
    setBottomHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (messages.length > 1 || typing) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  function send(content: string) {
    if (!content.trim() || typing) return;
    setChatStarted(true);
    setPromptsVisible(false);
    setInputValue("");
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: content.trim() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    const reply = PROMPT_RESPONSES[content.trim()] ?? FALLBACK_RESPONSE;
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "ai", content: reply }]);
    }, 900 + Math.random() * 500);
  }

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Scrollable messages — padded so fixed bottom bar doesn't cover content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: `0 16px ${bottomHeight + 8}px` }}>

        {/* "And just like that" header */}
        <AnimatePresence>
          {!chatStarted && (
            <motion.div
              key="header"
              initial={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.32, ease: [0.32, 0, 0.67, 0] }}
              style={{ textAlign: "center", paddingTop: 0, paddingBottom: 16, overflow: "hidden" }}
            >
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={{ fontSize: 16, fontWeight: 700, color: "var(--md-sys-color-text-primary)", marginBottom: 4 }}
              >
                And just like that,
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.3 }}
                style={{
                  fontFamily: "Roboto Slab, Georgia, serif",
                  fontSize: 24, fontWeight: 700,
                  color: "var(--md-sys-color-text-primary)",
                  lineHeight: 1.2,
                  marginBottom: 10,
                }}
              >
                {accountName} exists.
              </motion.h2>
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.3 }}
                onClick={onLogVisit}
                className="w-full flex items-center gap-3 px-4 py-4 text-left active:opacity-70 transition-opacity"
                style={{
                  border: "1.5px dashed rgba(139,146,255,0.45)",
                  borderRadius: "var(--radius-xl)",
                  background: "rgba(139,146,255,0.04)",
                  marginTop: 8,
                }}
              >
                <Icon name="auto_awesome" size={20} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[15px] font-bold leading-snug mb-1" style={{ color: "var(--md-sys-color-neonindigo)" }}>
                    Log your first visit
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--md-sys-color-text-muted)" }}>
                    Your first visit will round out the picture.
                  </p>
                </div>
                <Icon name="chevron_right" size={18} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thread */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 9,
              }}
            >
              {msg.role === "ai" && <AgentAvatar />}
              <div
                style={{
                  maxWidth: "84%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "ai"
                    ? "var(--radius-lg) var(--radius-lg) var(--radius-lg) 5px"
                    : "var(--radius-lg) var(--radius-lg) 5px var(--radius-lg)",
                  background: msg.role === "ai"
                    ? "var(--md-sys-color-dark-secondary)"
                    : "var(--md-sys-color-neonindigo)",
                  color: "var(--md-sys-color-text-primary)",
                  fontSize: 14,
                  lineHeight: 1.65,
                  whiteSpace: "pre-line",
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ display: "flex", alignItems: "flex-end", gap: 9 }}
              >
                <AgentAvatar />
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) 5px",
                    background: "var(--md-sys-color-dark-secondary)",
                    display: "flex", gap: 5, alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.13, ease: "easeInOut" }}
                      style={{
                        display: "block", width: 6, height: 6, borderRadius: "50%",
                        background: "var(--md-sys-color-text-muted)",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Bottom bar — absolute within the component so it stays in the phone frame ── */}
      <div
        ref={bottomRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "8px 16px 28px",
        }}
      >
        {/* Suggested prompts */}
        <AnimatePresence>
          {promptsVisible && (
            <motion.div
              key="prompts"
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}
            >
              {PROMPTS.map(({ label, icon }) => (
                <button
                  key={label}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "11px 14px",
                    background: "var(--md-sys-color-dark-secondary)",
                    border: "1px solid var(--md-sys-color-alpha-white-10)",
                    borderRadius: "var(--radius-full)",
                    color: "var(--md-sys-color-text-secondary)",
                    fontSize: 14,
                    cursor: "default",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon name={icon} size={16} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar + Log a Visit */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--md-sys-color-dark-secondary)",
              border: "1px solid var(--md-sys-color-alpha-white-10)",
              borderRadius: "var(--radius-full)",
              padding: "10px 10px 10px 16px",
              minWidth: 0,
            }}
          >
            <div
              onClick={(e) => { e.stopPropagation(); setInputFocused(true); }}
              style={{
                flex: 1,
                fontSize: 15,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                cursor: "text",
                userSelect: "none",
                color: "var(--md-sys-color-text-muted)",
              }}
            >
              {inputFocused ? (
                <span style={{
                  display: "inline-block",
                  width: 2,
                  height: "1.1em",
                  background: "var(--md-sys-color-neonindigo)",
                  borderRadius: 1,
                  animation: "ai-cursor-blink 1s step-end infinite",
                  verticalAlign: "text-bottom",
                }} />
              ) : "Ask about this visit…"}
            </div>
            <style>{`@keyframes ai-cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
            <motion.button
              animate={{ scale: 0.9, opacity: 0.45 }}
              transition={{ duration: 0.15 }}
              disabled
              style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "var(--md-sys-color-neonindigo)",
                border: "none", cursor: "default",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon name="arrow_upward" size={17} style={{ color: "var(--md-sys-color-text-primary)" }} />
            </motion.button>
          </div>

          {onLogVisit && (
            <button
              onClick={onLogVisit}
              className="flex-shrink-0 flex items-center gap-1.5 active:opacity-70 transition-opacity"
              style={{
                background: "var(--md-sys-color-brand-coral)",
                color: "var(--md-sys-color-text-primary)",
                borderRadius: "var(--radius-full)",
                padding: "0 14px",
                height: 54,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <Icon name="border_color" size={14} style={{ color: "var(--md-sys-color-text-primary)" }} />
              Log a Visit
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

function AgentAvatar() {
  return (
    <div
      style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--md-sys-color-brand-coral) 0%, var(--md-sys-color-neonindigo) 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 12px rgba(139, 146, 255, 0.35)",
      }}
    >
      <Icon name="auto_awesome" size={13} style={{ color: "#fff" }} />
    </div>
  );
}
