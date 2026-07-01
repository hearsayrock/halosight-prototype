"use client";

/**
 * FLUTTER HANDOFF: PostMeetingReviewPage
 * Widget: StatefulWidget (full screen)
 * Route: /relationships/[id]/review
 * Params: { id } — account ID
 *
 * Standalone version of the post-meeting AI review.
 * Accessible from the "AI found N updates" banner on lead account pages.
 * The in-capture version of this UI is AIReviewOverlay (shown automatically
 * after capture finalizes). Both share logic from @/lib/ai-review-utils.
 *
 * Tokens: --md-sys-color-background, --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary, --md-sys-color-text-muted,
 *         --md-sys-color-text-disabled, --md-sys-color-neonindigo, --md-sys-color-neonindigo-dark,
 *         --md-sys-color-brand-teal, --md-sys-color-brand-coral, --md-sys-color-warning,
 *         --md-sys-color-alpha-neonindigo-10, --radius-xl, --radius-md, --radius-sm, --radius-full
 */

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { mockAccounts } from "@/lib/mock-data/accounts";
import {
  buildSuggestions,
  getAIResponse,
  type Suggestion,
  type ChatMessage,
} from "@/lib/ai-review-utils";

export default function PostMeetingReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const account = mockAccounts.find((a) => a.id === id);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => buildSuggestions(id));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [applied, setApplied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasReview = suggestions.length > 0;
  const activeSuggestions = suggestions.filter((s) => !s.dismissed);
  const selectedCount = activeSuggestions.filter((s) => s.selected).length;
  const highCount = activeSuggestions.filter((s) => s.confidence === "high" && s.selected).length;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  function toggleSuggestion(sid: string) {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === sid && s.confidence !== "unknown" ? { ...s, selected: !s.selected } : s))
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
    }, 900 + Math.random() * 400);
  }

  function handleApply() {
    setApplied(true);
    setTimeout(() => router.push(`/relationships/${id}`), 1800);
  }

  if (applied) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ background: "var(--md-sys-color-background)" }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(107,157,176,0.12)" }}>
            <Icon name="cloud_done" fill size={34} style={{ color: "var(--md-sys-color-brand-teal)" }} />
          </div>
          <p className="text-[15px] font-semibold" style={{ color: "var(--md-sys-color-text-primary)" }}>
            Synced to Salesforce
          </p>
          <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>
            {selectedCount} field{selectedCount !== 1 ? "s" : ""} updated
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--md-sys-color-background)" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0">
        <button onClick={() => router.back()} className="active:opacity-60 transition-opacity" style={{ color: "var(--md-sys-color-text-muted)" }}>
          <Icon name="arrow_back" size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-semibold truncate" style={{ color: "var(--md-sys-color-text-primary)" }}>
            Meeting Review
          </h1>
          {account && (
            <p className="text-[12px] truncate" style={{ color: "var(--md-sys-color-text-muted)" }}>{account.name}</p>
          )}
        </div>
        <button onClick={() => router.push(`/relationships/${id}`)} className="text-sm active:opacity-60 transition-opacity" style={{ color: "var(--md-sys-color-text-muted)" }}>
          Skip
        </button>
      </div>

      {/* Scrollable conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-3" style={{ overscrollBehavior: "contain" }}>
        {!hasReview ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
            <Icon name="auto_awesome" size={32} style={{ color: "var(--md-sys-color-neonindigo)", opacity: 0.5 }} />
            <p className="text-[15px] font-semibold" style={{ color: "var(--md-sys-color-text-primary)" }}>No review available</p>
            <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)", maxWidth: 240 }}>
              Start a capture session during your next visit and I'll process the meeting automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">

            {/* AI summary bubble */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex items-start gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "var(--md-sys-color-alpha-neonindigo-10)", border: "1px solid rgba(139,146,255,0.2)" }}
                >
                  <Icon name="auto_awesome" size={14} style={{ color: "var(--md-sys-color-neonindigo)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--md-sys-color-neonindigo-dark)", letterSpacing: "0.04em" }}>
                    HALOSIGHT AI
                  </p>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3.5" style={{ background: "var(--md-sys-color-dark-secondary)" }}>
                    <p className="text-[14px] mb-4" style={{ color: "var(--md-sys-color-text-secondary)", lineHeight: 1.6 }}>
                      {highCount > 0
                        ? `I found ${highCount} confirmed update${highCount !== 1 ? "s" : ""} from today's meeting. Review and apply what looks right.`
                        : "Here's what I found from today's meeting. Review and apply what looks right."}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {activeSuggestions.map((s) => (
                        <SuggestionRow key={s.id} suggestion={s} onToggle={() => toggleSuggestion(s.id)} />
                      ))}
                    </div>
                    <p className="text-[13px] mt-4" style={{ color: "var(--md-sys-color-text-muted)", lineHeight: 1.6 }}>
                      Anything you'd like to change or add before I sync?
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chat thread */}
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
                  {msg.role === "rep" ? <RepMessage text={msg.text} /> : <AIMessage text={msg.text} />}
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isThinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "var(--md-sys-color-alpha-neonindigo-10)", border: "1px solid rgba(139,146,255,0.2)" }}
                  >
                    <Icon name="auto_awesome" size={14} style={{ color: "var(--md-sys-color-neonindigo)" }} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: "var(--md-sys-color-dark-secondary)" }}>
                    <ThinkingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasReview && (
        <div className="flex-shrink-0 px-4 pb-8 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            className="w-full flex items-center justify-center gap-2 h-11 mb-3 font-semibold text-[14px] active:opacity-70 transition-opacity"
            style={{
              background: "rgba(255,107,90,0.1)",
              border: "1px solid rgba(255,107,90,0.2)",
              borderRadius: "var(--radius-full)",
              color: "var(--md-sys-color-brand-coral)",
            }}
          >
            <Icon name="mic" size={18} style={{ color: "var(--md-sys-color-brand-coral)" }} />
            Tell Me More
          </button>

          <div
            className="flex items-center gap-2 mb-3 px-3 py-2"
            style={{ background: "var(--md-sys-color-dark-secondary)", borderRadius: "var(--radius-full)" }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a correction or note…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              className="flex-1 text-[14px] outline-none bg-transparent"
              style={{ color: "var(--md-sys-color-text-primary)" }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isThinking}
              className="transition-opacity"
              style={{ opacity: inputText.trim() && !isThinking ? 1 : 0.3 }}
            >
              <Icon name="arrow_upward" size={20} style={{ color: "var(--md-sys-color-neonindigo)" }} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={selectedCount === 0}
              className="flex-1 h-11 font-semibold text-[14px] transition-opacity"
              style={{
                background: "var(--md-sys-color-brand-teal)",
                color: "var(--md-sys-color-text-primary)",
                borderRadius: "var(--radius-full)",
                opacity: selectedCount > 0 ? 1 : 0.35,
              }}
            >
              Apply {selectedCount > 0 ? selectedCount : ""} Update{selectedCount !== 1 ? "s" : ""}
            </button>
            <button
              onClick={() => router.push(`/relationships/${id}`)}
              className="h-11 px-4 font-semibold text-[14px] transition-opacity active:opacity-60"
              style={{
                background: "var(--md-sys-color-dark-secondary)",
                color: "var(--md-sys-color-text-muted)",
                borderRadius: "var(--radius-full)",
              }}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SuggestionRow({ suggestion: s, onToggle }: { suggestion: Suggestion; onToggle: () => void }) {
  const isUnknown = s.confidence === "unknown";
  const isHigh    = s.confidence === "high";
  return (
    <button onClick={isUnknown ? undefined : onToggle} className="w-full text-left" style={{ cursor: isUnknown ? "default" : "pointer" }}>
      <div
        className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-colors"
        style={{
          background: s.selected ? "rgba(107,157,176,0.1)" : isUnknown ? "transparent" : "rgba(255,255,255,0.03)",
          border: s.selected ? "1px solid rgba(107,157,176,0.2)" : "1px solid transparent",
        }}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isHigh && <Icon name="check_circle" fill size={16} style={{ color: s.selected ? "var(--md-sys-color-brand-teal)" : "var(--md-sys-color-text-disabled)" }} />}
          {s.confidence === "medium" && <Icon name="warning" fill size={16} style={{ color: s.selected ? "var(--md-sys-color-warning)" : "var(--md-sys-color-text-disabled)" }} />}
          {isUnknown && <Icon name="help" fill size={16} style={{ color: "var(--md-sys-color-text-disabled)", opacity: 0.5 }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[11px] font-semibold" style={{ color: "var(--md-sys-color-text-disabled)" }}>{s.label}</span>
            {isUnknown
              ? <span className="text-[13px]" style={{ color: "var(--md-sys-color-text-disabled)" }}>Not captured</span>
              : <span className="text-[13px] font-medium" style={{ color: "var(--md-sys-color-text-primary)" }}>{s.value}</span>
            }
          </div>
          {s.evidence && (
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--md-sys-color-text-disabled)" }}>{s.evidence}</p>
          )}
        </div>
        {!isUnknown && (
          <div
            className="flex-shrink-0 w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center"
            style={{
              borderColor: s.selected ? (isHigh ? "var(--md-sys-color-brand-teal)" : "var(--md-sys-color-warning)") : "var(--md-sys-color-text-disabled)",
              background: s.selected ? (isHigh ? "var(--md-sys-color-brand-teal)" : "var(--md-sys-color-warning)") : "transparent",
            }}
          >
            {s.selected && <Icon name="check" size={10} style={{ color: "var(--md-sys-color-text-primary)" }} />}
          </div>
        )}
      </div>
    </button>
  );
}

function AIMessage({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--md-sys-color-alpha-neonindigo-10)", border: "1px solid rgba(139,146,255,0.2)" }}>
        <Icon name="auto_awesome" size={14} style={{ color: "var(--md-sys-color-neonindigo)" }} />
      </div>
      <div className="max-w-[82%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm" style={{ background: "var(--md-sys-color-dark-secondary)" }}>
        {text.split("\n").map((line, i) => (
          <p key={i} className="text-[13px] leading-relaxed" style={{ color: "var(--md-sys-color-text-secondary)" }}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function RepMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm" style={{ background: "rgba(139,146,255,0.12)", border: "1px solid rgba(139,146,255,0.15)" }}>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--md-sys-color-text-primary)" }}>{text}</p>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--md-sys-color-text-muted)" }}
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  );
}
