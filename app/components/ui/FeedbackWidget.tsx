"use client";

/**
 * FLUTTER HANDOFF: FeedbackWidget (+ FeedbackEntryCard, FeedbackForm)
 * Widget: StatefulWidget (owns which type is open) · FeedbackEntryCard and FeedbackForm are StatelessWidgets
 * Props: none (FeedbackWidget) · FeedbackEntryCard: onSelect(type) · FeedbackForm: selected, onSelect, text, onText, sent, onSend, onClose
 * State: sheetType (null | "bug" | "idea" | "other"); in the sheet: selected type, text, sent
 * Data: none — Send is simulated (shows "Sent — thanks!" for 1.2s, then closes)
 * Flutter equivalent: feedback_widget.dart, feedback_entry_card.dart, feedback_form.dart
 *
 * Entry card (lives inline in the home scroll): eyebrow (campaign icon + "Share Feedback"), title, subtitle and three full-width
 * options (I noticed a bug / I wish the app could... / Write my own). Tapping one opens the feedback drawer with that type selected.
 *   Card: color.dark.primary fill, 1px color.alpha.white-10 border, radius.md, 16px padding. Eyebrow + title in Roboto Slab 700,
 *   eyebrow neonindigo. Options: 48px, radius.md, color.background fill, 24px neonindigo icon, 15/300 label.
 * Feedback drawer (shared Drawer, keyboard aware, max 90%): "Share feedback" + close button · subtitle · type pills (Bug, Idea, Other)
 *   · textarea (placeholder changes with the type) · Send feedback. Send is disabled and dim until there is text; once sent the button turns
 *   a success tint and reads "Sent — thanks!".
 *   Pill: radius.full, 1.5px dark.tertiary border; selected = neonindigo 18% fill + neonindigo text, no border.
 *   Textarea: color.dark.secondary fill, radius.md. Send: color.brand.teal when ready, color.dark.secondary when empty.
 *
 * Tokens: color.dark.primary, color.dark.secondary, color.dark.tertiary, color.background, color.text.primary/muted/disabled,
 *         color.neonindigo.base, color.brand.teal, color.semantic.success, color.alpha.white-10, radius.md, radius.full
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { DrawerBackdrop, DrawerPanel, DrawerBody, useOverlayRoot } from "@/components/ui/Drawer";

export type FeedbackType = "bug" | "idea" | "other";

const TYPES: { id: FeedbackType; label: string; icon: string; placeholder: string }[] = [
  { id: "bug",   label: "Bug",   icon: "bug_report", placeholder: "What broke? What did you expect to happen?" },
  { id: "idea",  label: "Idea",  icon: "lightbulb",  placeholder: "What should we build or change?" },
  { id: "other", label: "Other", icon: "more_horiz", placeholder: "Tell us more…" },
];

// Entry-card shortcuts — each opens the drawer with that type selected
const ENTRY_OPTIONS: { type: FeedbackType; label: string; icon: string; fill: boolean }[] = [
  { type: "bug",   label: "I noticed a bug",         icon: "bug_report", fill: true  },
  { type: "idea",  label: "I wish the app could...", icon: "lightbulb",  fill: false },
  { type: "other", label: "Write my own",            icon: "edit",       fill: true  },
];

// ── Form (presentational — also rendered statically on the design-system page) ─

export function FeedbackForm({
  selected, onSelect, text, onText, sent, onSend, onClose,
}: {
  selected: FeedbackType;
  onSelect: (t: FeedbackType) => void;
  text: string;
  onText: (v: string) => void;
  sent: boolean;
  onSend: () => void;
  onClose: () => void;
}) {
  const currentType = TYPES.find((t) => t.id === selected) ?? TYPES[0];
  const ready = text.trim().length > 0;

  return (
    <>
      {/* Header row */}
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-[22px] font-bold" style={{ color: "var(--md-sys-color-text-primary)" }}>
          Share feedback
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
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
              onClick={() => onSelect(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 active:opacity-80 transition-opacity"
              style={{
                borderRadius: "var(--radius-full)",
                border: `1.5px solid ${active ? "transparent" : "var(--md-sys-color-dark-tertiary)"}`,
                background: active ? "color-mix(in srgb, var(--md-sys-color-neonindigo) 18%, transparent)" : "transparent",
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
        onChange={(e) => onText(e.target.value)}
        rows={4}
        className="w-full text-[15px] resize-none outline-none"
        style={{
          background: "var(--md-sys-color-dark-secondary)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          color: "var(--md-sys-color-text-primary)",
          caretColor: "var(--md-sys-color-brand-coral)",
          border: "none",
          marginBottom: "var(--spacing-4)",
          display: "block",
        }}
      />

      {/* Send button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSend}
        disabled={!ready || sent}
        className="w-full flex items-center justify-center font-semibold active:opacity-85 transition-opacity"
        style={{
          height: 52,
          borderRadius: "var(--radius-full)",
          background: sent
            ? "color-mix(in srgb, var(--md-sys-color-semantic-success) 15%, transparent)"
            : ready ? "var(--md-sys-color-brand-teal)" : "var(--md-sys-color-dark-secondary)",
          color: sent
            ? "var(--md-sys-color-semantic-success)"
            : ready ? "var(--md-sys-color-text-primary)" : "var(--md-sys-color-text-disabled)",
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
    </>
  );
}

// ── Drawer ─────────────────────────────────────────────────────────────────────

function FeedbackSheet({ initialType, onClose }: { initialType: FeedbackType; onClose: () => void }) {
  const [selected, setSelected] = useState<FeedbackType>(initialType);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const overlayRoot = useOverlayRoot();

  function handleSend() {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(() => setIsVisible(false), 1200);
  }

  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {isVisible && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto" }}>
          <DrawerBackdrop onClick={() => setIsVisible(false)} />
          <DrawerPanel maxHeight="90%" keyboardAware>
            <DrawerBody style={{ paddingLeft: "var(--spacing-5)", paddingRight: "var(--spacing-5)", paddingBottom: "var(--spacing-10)" }}>
              <FeedbackForm
                selected={selected} onSelect={setSelected}
                text={text} onText={setText}
                sent={sent} onSend={handleSend}
                onClose={() => setIsVisible(false)}
              />
            </DrawerBody>
          </DrawerPanel>
        </div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}

// ── Entry card ────────────────────────────────────────────────────────────────

export function FeedbackEntryCard({ onSelect }: { onSelect: (type: FeedbackType) => void }) {
  return (
    <div
      className="mx-4 mb-6"
      style={{
        background: "var(--md-sys-color-dark-primary)",
        borderRadius: "var(--radius-md)",
        padding: "var(--spacing-4)",
        border: "1px solid var(--md-sys-color-alpha-white-10)",
      }}
    >
      {/* Eyebrow */}
      <div className="flex items-center" style={{ gap: "var(--spacing-2)", height: 20 }}>
        <Icon name="campaign" fill size={20} style={{ color: "var(--md-sys-color-neonindigo)" }} />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14, fontWeight: 700, lineHeight: "20px",
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
          fontFamily: "var(--font-serif)",
          fontSize: 22, fontWeight: 700, lineHeight: "28px",
          color: "var(--md-sys-color-text-primary)",
        }}
      >
        Help shape Halosight
      </p>

      {/* Subtitle */}
      <p style={{ marginTop: "var(--spacing-2)", fontSize: 15, fontWeight: 300, lineHeight: "22px", color: "var(--md-sys-color-text-muted)" }}>
        Not sure where to start? Try one:
      </p>

      {/* Full-width options */}
      <div className="flex flex-col" style={{ gap: "var(--spacing-3)", marginTop: 17 }}>
        {ENTRY_OPTIONS.map((o) => (
          <button
            key={o.type}
            onClick={() => onSelect(o.type)}
            className="flex items-center w-full text-left active:opacity-70 transition-opacity"
            style={{
              height: 48,
              paddingLeft: "var(--spacing-3)",
              gap: 8.5,
              borderRadius: "var(--radius-md)",
              background: "var(--md-sys-color-background)",
              color: "var(--md-sys-color-text-primary)",
              fontSize: 15,
              fontWeight: 300,
            }}
          >
            <Icon name={o.icon} fill={o.fill} size={24} style={{ color: "var(--md-sys-color-neonindigo)" }} />
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackWidget() {
  const [sheetType, setSheetType] = useState<FeedbackType | null>(null);

  return (
    <>
      <FeedbackEntryCard onSelect={setSheetType} />
      {sheetType && <FeedbackSheet initialType={sheetType} onClose={() => setSheetType(null)} />}
    </>
  );
}
