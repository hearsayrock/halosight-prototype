"use client";

/**
 * FLUTTER HANDOFF: PostMeetingReviewPage
 * Widget: StatefulWidget (full screen)
 * Route: /relationships/[id]/review
 * Params: { id } — account ID
 *
 * Post-meeting AI review. Shown after capture finalizes.
 * Displays AI-extracted field suggestions with confidence levels.
 * Rep can type corrections conversationally before applying to CRM.
 *
 * Tokens: --color-background, --color-dark-secondary, --color-dark-tertiary,
 *         --color-text-primary, --color-text-secondary, --color-text-muted,
 *         --color-text-disabled, --color-brand-purple, --color-brand-purple-dark,
 *         --color-brand-teal, --color-brand-coral, --color-warning,
 *         --color-alpha-purple-10, --radius-xl, --radius-md, --radius-sm, --radius-full
 */

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { mockAccounts } from "@/lib/mock-data/accounts";

// ── Types ─────────────────────────────────────────────────────────────────────

type Confidence = "high" | "medium" | "unknown";

interface Suggestion {
  id: string;
  field: string;
  label: string;
  value: string;
  confidence: Confidence;
  evidence?: string;
  selected: boolean;
  dismissed: boolean;
}

interface Message {
  id: string;
  role: "ai" | "rep";
  text: string;
  updates?: { field: string; value: string }[];
}

// ── Mock AI suggestions (specific to innovative-tech-tucson prototype) ────────

function buildSuggestions(accountId: string): Suggestion[] {
  if (accountId === "innovative-tech-tucson") {
    return [
      {
        id: "s-first",
        field: "firstName",
        label: "First Name",
        value: "Sandra",
        confidence: "high",
        selected: true,
        dismissed: false,
      },
      {
        id: "s-last",
        field: "lastName",
        label: "Last Name",
        value: "Perez",
        confidence: "high",
        selected: true,
        dismissed: false,
      },
      {
        id: "s-title",
        field: "title",
        label: "Title",
        value: "Operations Director",
        confidence: "high",
        selected: true,
        dismissed: false,
      },
      {
        id: "s-segment",
        field: "marketSegment",
        label: "Market Segment",
        value: "Commercial Fleet",
        confidence: "medium",
        evidence: "Sandra mentioned managing customer-facing vehicle fleets for regional service teams",
        selected: false,
        dismissed: false,
      },
      {
        id: "s-industry",
        field: "industry",
        label: "Industry",
        value: "Technology Services",
        confidence: "medium",
        evidence: "Inferred from company name and vendor evaluation context",
        selected: false,
        dismissed: false,
      },
      {
        id: "s-phone",
        field: "phone",
        label: "Phone",
        value: "Not captured",
        confidence: "unknown",
        selected: false,
        dismissed: false,
      },
    ];
  }
  return [];
}

// ── Conversation simulation ───────────────────────────────────────────────────

function getAIResponse(
  input: string,
  suggestions: Suggestion[]
): { text: string; updatedSuggestions: Suggestion[] } {
  const lower = input.toLowerCase();
  let updatedSuggestions = [...suggestions];

  if (lower.match(/title (is|should be|was)|her title|his title|their title/)) {
    const match = input.match(/(?:her|his|their)?\s*title[:\s]+(?:is\s+)?(?:actually\s+)?([^.!?\n]+)/i);
    const newTitle = match?.[1]?.trim();
    if (newTitle) {
      updatedSuggestions = updatedSuggestions.map((s) =>
        s.field === "title" ? { ...s, value: newTitle, selected: true } : s
      );
      return {
        text: `Got it. Updated Title → "${newTitle}". I've pre-selected it for you.`,
        updatedSuggestions,
      };
    }
  }

  if (lower.match(/remove|skip|drop|don.t (use|include|apply)|wrong/) && lower.match(/market|segment/)) {
    updatedSuggestions = updatedSuggestions.map((s) =>
      s.field === "marketSegment" ? { ...s, dismissed: true, selected: false } : s
    );
    return {
      text: "Removed the Market Segment suggestion. You can add it manually from the account page when you know more.",
      updatedSuggestions,
    };
  }

  if (lower.match(/phone|number|mobile|cell|contact number/)) {
    return {
      text: "Noted — I'll flag Phone as a priority to capture next time. It wasn't mentioned during this recording.",
      updatedSuggestions,
    };
  }

  if (lower.match(/industry|sector/)) {
    const match = input.match(/(?:industry|sector)[:\s]+([^.!?\n]+)/i);
    const newIndustry = match?.[1]?.trim();
    if (newIndustry) {
      updatedSuggestions = updatedSuggestions.map((s) =>
        s.field === "industry" ? { ...s, value: newIndustry, selected: true } : s
      );
      return {
        text: `Updated Industry → "${newIndustry}".`,
        updatedSuggestions,
      };
    }
  }

  if (lower.match(/last name|surname|family name/)) {
    const match = input.match(/(?:last name|surname|family name)[:\s]+([^.!?\n]+)/i);
    const newLast = match?.[1]?.trim();
    if (newLast) {
      updatedSuggestions = updatedSuggestions.map((s) =>
        s.field === "lastName" ? { ...s, value: newLast } : s
      );
      return {
        text: `Updated Last Name → "${newLast}".`,
        updatedSuggestions,
      };
    }
  }

  return {
    text: "Got it. I've added that to your meeting notes.",
    updatedSuggestions,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PostMeetingReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const account = mockAccounts.find((a) => a.id === id);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => buildSuggestions(id));
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [applied, setApplied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasReview = suggestions.length > 0;
  const selectedCount = suggestions.filter((s) => s.selected && !s.dismissed).length;
  const activeSuggestions = suggestions.filter((s) => !s.dismissed);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  function toggleSuggestion(id: string) {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id && s.confidence !== "unknown" ? { ...s, selected: !s.selected } : s))
    );
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || isThinking) return;
    setInputText("");

    const repMsg: Message = { id: `msg-${Date.now()}`, role: "rep", text };
    setMessages((prev) => [...prev, repMsg]);
    setIsThinking(true);

    setTimeout(() => {
      const { text: aiText, updatedSuggestions } = getAIResponse(text, suggestions);
      setSuggestions(updatedSuggestions);
      const aiMsg: Message = { id: `msg-${Date.now()}-ai`, role: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 900 + Math.random() * 400);
  }

  function handleApply() {
    setApplied(true);
    setTimeout(() => {
      router.push(`/relationships/${id}`);
    }, 1800);
  }

  if (applied) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ background: "var(--color-background)" }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(107,157,176,0.12)" }}
          >
            <Icon name="cloud_done" fill size={34} style={{ color: "var(--color-brand-teal)" }} />
          </div>
          <p className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Synced to Salesforce
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {selectedCount} field{selectedCount !== 1 ? "s" : ""} updated
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--color-background)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="active:opacity-60 transition-opacity"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Icon name="arrow_back" size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
            Meeting Review
          </h1>
          {account && (
            <p className="text-[12px] truncate" style={{ color: "var(--color-text-muted)" }}>
              {account.name}
            </p>
          )}
        </div>
        <button
          onClick={() => router.push(`/relationships/${id}`)}
          className="text-sm active:opacity-60 transition-opacity"
          style={{ color: "var(--color-text-muted)" }}
        >
          Skip
        </button>
      </div>

      {/* Scrollable conversation area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-3"
        style={{ overscrollBehavior: "contain" }}
      >
        {!hasReview ? (
          /* No review state */
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
            <Icon name="auto_awesome" size={32} style={{ color: "var(--color-brand-purple)", opacity: 0.5 }} />
            <p className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              No review available
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)", maxWidth: 240 }}>
              Start a capture session during your next visit and I'll process the meeting automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">

            {/* AI summary bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-2.5">
                {/* AI avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "var(--color-alpha-purple-10)", border: "1px solid rgba(139,146,255,0.2)" }}
                >
                  <Icon name="auto_awesome" size={14} style={{ color: "var(--color-brand-purple)" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--color-brand-purple-dark)", letterSpacing: "0.04em" }}>
                    HALOSIGHT AI
                  </p>

                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-3.5"
                    style={{ background: "var(--color-dark-secondary)" }}
                  >
                    <p className="text-[14px] mb-4" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                      Here's what I found from today's meeting. Review and apply what looks right — I'll sync it to Salesforce.
                    </p>

                    {/* Suggestions list */}
                    <div className="flex flex-col gap-1.5">
                      {activeSuggestions.map((s) => (
                        <SuggestionRow
                          key={s.id}
                          suggestion={s}
                          onToggle={() => toggleSuggestion(s.id)}
                        />
                      ))}
                    </div>

                    <p className="text-[13px] mt-4" style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                      Anything you'd like to change or add before I sync?
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Conversation thread */}
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {msg.role === "rep" ? (
                    <RepMessage text={msg.text} />
                  ) : (
                    <AIMessage text={msg.text} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Thinking indicator */}
            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
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
        )}
      </div>

      {/* Bottom controls — only shown if review exists */}
      {hasReview && (
        <div className="flex-shrink-0 px-4 pb-8 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Tell Me More */}
          <button
            className="w-full flex items-center justify-center gap-2 h-11 mb-3 font-semibold text-[14px] active:opacity-70 transition-opacity"
            style={{
              background: "rgba(255,107,90,0.1)",
              border: "1px solid rgba(255,107,90,0.2)",
              borderRadius: "var(--radius-full)",
              color: "var(--color-brand-coral)",
            }}
          >
            <Icon name="mic" size={18} style={{ color: "var(--color-brand-coral)" }} />
            Tell Me More
          </button>

          {/* Text input */}
          <div
            className="flex items-center gap-2 mb-3 px-3 py-2"
            style={{
              background: "var(--color-dark-secondary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a correction or note…"
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

          {/* Apply / Discard row */}
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={selectedCount === 0}
              className="flex-1 h-11 font-semibold text-[14px] transition-opacity"
              style={{
                background: "var(--color-brand-teal)",
                color: "var(--color-text-primary)",
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
                background: "var(--color-dark-secondary)",
                color: "var(--color-text-muted)",
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
  const isHigh = s.confidence === "high";
  const isMedium = s.confidence === "medium";

  return (
    <button
      onClick={isUnknown ? undefined : onToggle}
      className="w-full text-left transition-opacity"
      style={{ cursor: isUnknown ? "default" : "pointer" }}
    >
      <div
        className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-colors"
        style={{
          background: s.selected
            ? "rgba(107,157,176,0.1)"
            : isUnknown
            ? "transparent"
            : "rgba(255,255,255,0.03)",
          border: s.selected
            ? "1px solid rgba(107,157,176,0.2)"
            : "1px solid transparent",
        }}
      >
        {/* Confidence icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isHigh && (
            <Icon
              name="check_circle"
              fill
              size={16}
              style={{ color: s.selected ? "var(--color-brand-teal)" : "var(--color-text-disabled)" }}
            />
          )}
          {isMedium && (
            <Icon
              name="warning"
              fill
              size={16}
              style={{ color: s.selected ? "var(--color-warning)" : "var(--color-text-disabled)" }}
            />
          )}
          {isUnknown && (
            <Icon name="help" fill size={16} style={{ color: "var(--color-text-disabled)", opacity: 0.5 }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-disabled)" }}>
              {s.label}
            </span>
            {isUnknown ? (
              <span className="text-[13px]" style={{ color: "var(--color-text-disabled)" }}>
                Not captured
              </span>
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

        {/* Selection indicator */}
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
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {text}
        </p>
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
