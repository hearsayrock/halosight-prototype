"use client";

/**
 * FLUTTER HANDOFF: FeedbackWidget
 * Widget: StatefulWidget
 * Tokens: --md-sys-color-dark-secondary, --md-sys-color-dark-tertiary, --md-sys-color-background,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary, --md-sys-color-text-muted,
 *         --md-sys-color-text-disabled, --md-sys-color-neonindigo, --md-sys-color-brand-teal,
 *         --radius-xl, --radius-full, --radius-md
 *
 * Entry card lives inline in the home scroll: eyebrow, title, subtitle and three full-width
 * options (bug / idea / write my own). Tapping one opens a bottom sheet portaled into
 * #phone-overlay-root with that type pre-selected.
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

type FeedbackType = "bug" | "idea" | "other";

const TYPES: { id: FeedbackType; label: string; icon: string; placeholder: string }[] = [
  { id: "bug",   label: "Bug",   icon: "bug_report", placeholder: "What broke? What did you expect to happen?" },
  { id: "idea",  label: "Idea",  icon: "lightbulb",  placeholder: "What should we build or change?" },
  { id: "other", label: "Other", icon: "more_horiz", placeholder: "Tell us more…" },
];

// Entry-card shortcuts — each opens the sheet with that type preselected
const ENTRY_OPTIONS: { type: FeedbackType; label: string; icon: string; fill: boolean }[] = [
  { type: "bug",     label: "I noticed a bug",        icon: "bug_report", fill: true  },
  { type: "idea",    label: "I wish the app could...", icon: "lightbulb",  fill: false },
  { type: "other", label: "Write my own",           icon: "edit",       fill: true  },
];

// ── Sheet ─────────────────────────────────────────────────────────────────────

function FeedbackSheet({
  initialType,
  onClose,
}: {
  initialType: FeedbackType;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<FeedbackType>(initialType);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const currentType = TYPES.find((t) => t.id === selected) ?? TYPES[0];

  function handleSend() {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(() => setIsVisible(false), 1200);
  }

  function handleClose() {
    setIsVisible(false);
  }

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;

  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            className="absolute left-0 right-0"
            style={{
              bottom: "var(--keyboard-inset, 0px)",
              transition: "bottom 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
              background: "var(--md-sys-color-background)",
              borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
              maxHeight: "90%",
              overflowY: "auto",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--md-sys-color-dark-tertiary)" }} />
            </div>

            <div className="px-5 pt-3 pb-10">
              {/* Header row */}
              <div className="flex items-start justify-between mb-1">
                <h2
                  className="text-[22px] font-bold"
                  style={{ color: "var(--md-sys-color-text-primary)" }}
                >
                  Share feedback
                </h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60 transition-opacity"
                  style={{ background: "var(--md-sys-color-dark-secondary)", marginTop: 2 }}
                >
                  <Icon name="close" size={16} style={{ color: "var(--md-sys-color-text-muted)" }} />
                </button>
              </div>

              <p className="text-[14px] mb-5" style={{ color: "var(--md-sys-color-text-muted)" }}>
                Pick a type, then tell us more. We read everything.
              </p>

              {/* Type pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {TYPES.map((t) => {
                  const active = selected === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 active:opacity-80 transition-opacity"
                      style={{
                        borderRadius: "var(--radius-full)",
                        border: `1.5px solid ${active ? "transparent" : "var(--md-sys-color-dark-tertiary)"}`,
                        background: active ? "rgba(139,146,255,0.18)" : "transparent",
                        color: active ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-muted)",
                        fontSize: 14,
                        fontWeight: active ? 600 : 500,
                        transition: "background 0.15s, color 0.15s, border-color 0.15s",
                      }}
                    >
                      <Icon name={t.icon} size={15} style={{ color: "inherit" }} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Textarea */}
              <textarea
                placeholder={currentType.placeholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full text-[15px] resize-none outline-none"
                style={{
                  background: "var(--md-sys-color-dark-secondary)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  color: "var(--md-sys-color-text-primary)",
                  caretColor: "var(--md-sys-color-brand-coral)",
                  border: "none",
                  marginBottom: 16,
                  display: "block",
                }}
              />

              {/* Send button */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSend}
                disabled={!text.trim() || sent}
                className="w-full flex items-center justify-center font-semibold active:opacity-85 transition-opacity"
                style={{
                  height: 52,
                  borderRadius: "var(--radius-full)",
                  background: sent
                    ? "rgba(46,204,113,0.15)"
                    : text.trim()
                      ? "var(--md-sys-color-brand-teal)"
                      : "var(--md-sys-color-dark-secondary)",
                  color: sent
                    ? "var(--md-sys-color-semantic-success)"
                    : text.trim()
                      ? "var(--md-sys-color-text-primary)"
                      : "var(--md-sys-color-text-disabled)",
                  fontSize: 16,
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {sent ? (
                  <span className="flex items-center gap-2">
                    <Icon name="check" size={18} style={{ color: "inherit" }} />
                    Sent — thanks!
                  </span>
                ) : (
                  "Send feedback"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}

// ── Entry card ────────────────────────────────────────────────────────────────

export default function FeedbackWidget() {
  const [sheetType, setSheetType] = useState<FeedbackType | null>(null);

  return (
    <>
      <div
        className="mx-4 mb-6"
        style={{
          background: "var(--md-sys-color-dark-primary)",
          borderRadius: "var(--radius-md)",
          padding: 16,
          border: "1px solid var(--md-sys-color-alpha-white-10)",
        }}
      >
        {/* Eyebrow */}
        <div className="flex items-center" style={{ gap: 8, height: 20 }}>
          <Icon name="campaign" fill size={20} style={{ color: "var(--md-sys-color-neonindigo)" }} />
          <span
            style={{
              fontFamily: "Roboto Slab, Georgia, serif",
              fontSize: 14.2, fontWeight: 700, lineHeight: "20px",
              position: "relative", top: 0.8,
              color: "var(--md-sys-color-neonindigo)",
            }}
          >
            Share Feedback
          </span>
        </div>

        {/* Title */}
        <p
          style={{
            marginTop: 12.5,
            fontFamily: "Roboto Slab, Georgia, serif",
            fontSize: 22.5, fontWeight: 700, lineHeight: "28px",
            color: "var(--md-sys-color-text-primary)",
          }}
        >
          Help shape Halosight
        </p>

        {/* Subtitle */}
        <p
          style={{
            marginTop: 8.5,
            fontSize: 15.3, fontWeight: 300, lineHeight: "22px",
            color: "var(--md-sys-color-text-muted)",
          }}
        >
          Not sure where to start? Try one:
        </p>

        {/* Full-width options */}
        <div className="flex flex-col" style={{ gap: 12, marginTop: 17 }}>
          {ENTRY_OPTIONS.map((o) => (
            <button
              key={o.type}
              onClick={() => setSheetType(o.type)}
              className="flex items-center w-full text-left active:opacity-70 transition-opacity"
              style={{
                height: 48,
                paddingLeft: 12,
                gap: 8.5,
                borderRadius: "var(--radius-md)",
                background: "var(--md-sys-color-background)",
                color: "var(--md-sys-color-text-primary)",
                fontSize: 15.3,
                fontWeight: 300,
              }}
            >
              <Icon name={o.icon} fill={o.fill} size={24} style={{ color: "var(--md-sys-color-neonindigo)" }} />
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {sheetType && (
        <FeedbackSheet
          initialType={sheetType}
          onClose={() => setSheetType(null)}
        />
      )}
    </>
  );
}
