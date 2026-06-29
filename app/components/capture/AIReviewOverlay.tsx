"use client";

/**
 * FLUTTER HANDOFF: AIReviewOverlay
 * Widget: StatefulWidget (full-screen overlay, portaled)
 * Trigger: CaptureStatus === "reviewing" (after finalizing completes)
 * Props: none — reads from CaptureContext
 *
 * Post-meeting AI conversation. Slides up over everything immediately after
 * capture finalizes. Rep reviews field suggestions, corrects via text, then
 * applies or discards. Dismissing transitions CaptureContext → "ready".
 *
 * Tokens: --color-background, --color-dark-secondary, --color-dark-tertiary,
 *         --color-text-primary, --color-text-secondary, --color-text-muted,
 *         --color-text-disabled, --color-brand-purple, --color-brand-purple-dark,
 *         --color-brand-teal, --color-brand-coral, --color-warning,
 *         --color-alpha-purple-10, --radius-xl, --radius-md, --radius-sm, --radius-full
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useCapture } from "@/lib/context/CaptureContext";
import {
  buildSuggestions,
  getAIResponse,
  type Suggestion,
  type ChatMessage,
} from "@/lib/ai-review-utils";

export default function AIReviewOverlay() {
  const { status, accountId, accountName, readyCapture } = useCapture();

  const [suggestions,  setSuggestions]  = useState<Suggestion[]>([]);
  const [messages,     setMessages]     = useState<ChatMessage[]>([]);
  const [inputText,    setInputText]    = useState("");
  const [isThinking,   setIsThinking]   = useState(false);
  const [applyDone,    setApplyDone]    = useState(false);

  const inputRef  = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset state when a new review session begins
  useEffect(() => {
    if (status === "reviewing") {
      setSuggestions(buildSuggestions(accountId ?? ""));
      setMessages([]);
      setInputText("");
      setIsThinking(false);
      setApplyDone(false);
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  }, [status, accountId]);

  // Auto-scroll when messages or thinking state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const isVisible      = status === "reviewing";
  const activeSuggestions = suggestions.filter((s) => !s.dismissed);
  const selectedCount  = activeSuggestions.filter((s) => s.selected).length;
  const highCount      = activeSuggestions.filter((s) => s.confidence === "high" && s.selected).length;

  function toggleSuggestion(id: string) {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id && s.confidence !== "unknown" ? { ...s, selected: !s.selected } : s))
    );
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || isThinking) return;
    setInputText("");

    const repMsg: ChatMessage = { id: `msg-${Date.now()}`, role: "rep", text };
    setMessages((prev) => [...prev, repMsg]);
    setIsThinking(true);

    setTimeout(() => {
      const { text: aiText, updatedSuggestions } = getAIResponse(text, suggestions);
      setSuggestions(updatedSuggestions);
      const aiMsg: ChatMessage = { id: `msg-${Date.now()}-ai`, role: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 800 + Math.random() * 400);
  }

  function handleApply() {
    setApplyDone(true);
    setTimeout(readyCapture, 1200);
  }

  function handleDiscard() {
    readyCapture();
  }

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;
  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 flex flex-col"
          style={{ background: "var(--color-background)", zIndex: 100 }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 36 }}
        >
          {/* ── Success flash ──────────────────────────────────────────── */}
          <AnimatePresence>
            {applyDone && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
                style={{ background: "var(--color-background)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(107,157,176,0.12)" }}
                >
                  <Icon name="cloud_done" fill size={34} style={{ color: "var(--color-brand-teal)" }} />
                </motion.div>
                <p className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {selectedCount} field{selectedCount !== 1 ? "s" : ""} synced to Salesforce
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 pt-10 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-alpha-purple-10)", border: "1px solid rgba(139,146,255,0.2)" }}
              >
                <Icon name="auto_awesome" size={14} style={{ color: "var(--color-brand-purple)" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold" style={{ color: "var(--color-brand-purple-dark)", letterSpacing: "0.05em" }}>
                  HALOSIGHT AI
                </p>
                {accountName && (
                  <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                    {accountName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleDiscard}
              className="text-sm font-medium active:opacity-60 transition-opacity px-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Skip
            </button>
          </div>

          {/* ── Scrollable conversation ─────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 pb-2"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="flex flex-col gap-3 pb-2">

              {/* AI opening message */}
              <div
                className="px-4 py-4 rounded-2xl"
                style={{ background: "var(--color-dark-secondary)" }}
              >
                <p className="text-[14px] mb-4" style={{ color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                  {activeSuggestions.length > 0
                    ? `I found ${highCount > 0 ? `${highCount} confirmed update${highCount !== 1 ? "s" : ""}` : "a few things"} from today's meeting. Review what looks right before I sync to Salesforce.`
                    : "I wasn't able to pull any CRM fields from this recording. You can add details manually from the account page."
                  }
                </p>

                {/* Suggestion rows */}
                {activeSuggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5 mb-4">
                    {activeSuggestions.map((s) => (
                      <SuggestionRow
                        key={s.id}
                        suggestion={s}
                        onToggle={() => toggleSuggestion(s.id)}
                      />
                    ))}
                  </div>
                )}

                <p className="text-[13px]" style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  Anything you'd like to change or add before I update CRM?
                </p>
              </div>

              {/* Conversation thread */}
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {msg.role === "rep"
                      ? <RepMessage text={msg.text} />
                      : <AIMessage text={msg.text} />
                    }
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Thinking dots */}
              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--color-alpha-purple-10)", border: "1px solid rgba(139,146,255,0.2)" }}
                    >
                      <Icon name="auto_awesome" size={14} style={{ color: "var(--color-brand-purple)" }} />
                    </div>
                    <div
                      className="px-4 py-3 rounded-2xl rounded-tl-sm"
                      style={{ background: "var(--color-dark-secondary)" }}
                    >
                      <ThinkingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* ── Sticky footer ───────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 px-4 pt-3 pb-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            {/* Tell Me More — styled like Log a Visit */}
            <button
              className="w-full flex items-center justify-center gap-2 h-12 mb-3 font-semibold text-[15px] active:opacity-70 transition-opacity"
              style={{
                background: "rgba(255,107,90,0.12)",
                border: "1px solid rgba(255,107,90,0.25)",
                borderRadius: "var(--radius-full)",
                color: "var(--color-brand-coral)",
              }}
            >
              <Icon name="mic" size={18} style={{ color: "var(--color-brand-coral)" }} />
              Tell Me More
            </button>

            {/* Text input row */}
            <div
              className="flex items-center gap-2 mb-3 px-3.5 py-2"
              style={{
                background: "var(--color-dark-secondary)",
                borderRadius: "var(--radius-full)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder='e.g. "His title is actually Service Manager"'
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                className="flex-1 text-[14px] outline-none bg-transparent"
                style={{ color: "var(--color-text-primary)" }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isThinking}
                className="transition-opacity"
                style={{ opacity: inputText.trim() && !isThinking ? 1 : 0.3 }}
              >
                <Icon name="arrow_upward" size={20} style={{ color: "var(--color-brand-purple)" }} />
              </button>
            </div>

            {/* Apply / Discard */}
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                disabled={selectedCount === 0 || applyDone}
                className="flex-1 h-12 font-semibold text-[15px] transition-opacity"
                style={{
                  background: "var(--color-brand-teal)",
                  color: "var(--color-text-primary)",
                  borderRadius: "var(--radius-full)",
                  opacity: selectedCount > 0 && !applyDone ? 1 : 0.35,
                }}
              >
                Apply {selectedCount > 0 ? selectedCount : ""} Update{selectedCount !== 1 ? "s" : ""}
              </button>
              <button
                onClick={handleDiscard}
                className="h-12 px-5 font-semibold text-[15px] active:opacity-60 transition-opacity"
                style={{
                  background: "var(--color-dark-secondary)",
                  color: "var(--color-text-muted)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                Discard
              </button>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SuggestionRow({ suggestion: s, onToggle }: { suggestion: Suggestion; onToggle: () => void }) {
  const isUnknown = s.confidence === "unknown";
  const isHigh    = s.confidence === "high";

  return (
    <button
      onClick={isUnknown ? undefined : onToggle}
      className="w-full text-left"
      style={{ cursor: isUnknown ? "default" : "pointer" }}
    >
      <div
        className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-colors"
        style={{
          background: s.selected
            ? "rgba(107,157,176,0.1)"
            : isUnknown ? "transparent" : "rgba(255,255,255,0.03)",
          border: s.selected
            ? "1px solid rgba(107,157,176,0.2)"
            : "1px solid transparent",
        }}
      >
        {/* Confidence icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isHigh && (
            <Icon name="check_circle" fill size={15}
              style={{ color: s.selected ? "var(--color-brand-teal)" : "var(--color-text-disabled)" }} />
          )}
          {s.confidence === "medium" && (
            <Icon name="warning" fill size={15}
              style={{ color: s.selected ? "var(--color-warning)" : "var(--color-text-disabled)" }} />
          )}
          {isUnknown && (
            <Icon name="help" fill size={15} style={{ color: "var(--color-text-disabled)", opacity: 0.5 }} />
          )}
        </div>

        {/* Label + value */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-disabled)" }}>
              {s.label}
            </span>
            {isUnknown ? (
              <span className="text-[13px]" style={{ color: "var(--color-text-disabled)" }}>Not captured</span>
            ) : (
              <span className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                {s.value}
              </span>
            )}
          </div>
          {s.evidence && (
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--color-text-disabled)" }}>
              {s.evidence}
            </p>
          )}
        </div>

        {/* Checkbox */}
        {!isUnknown && (
          <div
            className="flex-shrink-0 w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center"
            style={{
              borderColor: s.selected
                ? isHigh ? "var(--color-brand-teal)" : "var(--color-warning)"
                : "var(--color-text-disabled)",
              background: s.selected
                ? isHigh ? "var(--color-brand-teal)" : "var(--color-warning)"
                : "transparent",
            }}
          >
            {s.selected && (
              <Icon name="check" size={10} style={{ color: "var(--color-text-primary)" }} />
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function AIMessage({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "var(--color-alpha-purple-10)", border: "1px solid rgba(139,146,255,0.2)" }}
      >
        <Icon name="auto_awesome" size={14} style={{ color: "var(--color-brand-purple)" }} />
      </div>
      <div
        className="max-w-[82%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
        style={{ background: "var(--color-dark-secondary)" }}
      >
        {text.split("\n").map((line, i) => (
          <p key={i} className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function RepMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[78%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm"
        style={{ background: "rgba(139,146,255,0.12)", border: "1px solid rgba(139,146,255,0.15)" }}
      >
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
          {text}
        </p>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--color-text-muted)" }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
