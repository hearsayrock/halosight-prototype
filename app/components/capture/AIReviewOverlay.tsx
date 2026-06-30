"use client";

/**
 * FLUTTER HANDOFF: AIReviewOverlay
 * Widget: StatefulWidget (full-screen overlay, portaled)
 * Trigger: CaptureStatus === "reviewing"
 * Props: none — reads from CaptureContext
 *
 * Shows AI-extracted CRM fields after capture. Rep can hold mic to speak
 * corrections in real time. Field cards update live (green on confirm).
 * "Looks good" / "Use defaults" → readyCapture().
 *
 * Tokens: --color-background, --color-dark-secondary, --color-text-primary,
 *         --color-text-muted, --color-text-disabled, --color-brand-purple,
 *         --color-semantic-success, --radius-lg, --radius-full
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCapture } from "@/lib/context/CaptureContext";
import Icon from "@/components/ui/Icon";

// ── Types ─────────────────────────────────────────────────────────────────────

type FieldConf = "high" | "uncertain" | "confirmed";

interface CRMField {
  id: string;
  label: string;
  value: string;
  conf: FieldConf;
  isDropdown?: boolean;
  multiLine?: boolean;
  /** Demo-only field, hidden by default — revealed via the secret tap toggle to show off scroll behavior */
  demo?: boolean;
}

// ── Demo listen sequence ──────────────────────────────────────────────────────

const LISTEN_STEPS: Array<{
  delay: number;
  transcript: string;
  confirmId?: string;
  newValue?: string;
}> = [
  { delay: 600,  transcript: "Phone is" },
  { delay: 1100, transcript: "Phone is 5-2-0… 5-5-5… 0-1-4-7" },
  { delay: 2200, transcript: "Phone is 5-2-0… 5-5-5… 0-1-4-7", confirmId: "phone", newValue: "(520) 555-0147" },
  { delay: 3300, transcript: "Lead status, prospect." },
  { delay: 4200, transcript: "Lead status, prospect.", confirmId: "leadStatus", newValue: "Prospect" },
];

// ── Live caption — words enter the DOM one at a time so justify-center
//    physically recenters on each addition; layout-prop FLIP slides existing
//    words left as new ones materialise on the right. ────────────────────────

function LiveCaption({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentenceKey = words[0] ?? "";

  const [shownCount, setShownCount] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevSentenceKey = useRef("");
  const prevShownCount = useRef(0);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const isNewSentence = sentenceKey !== prevSentenceKey.current;
    prevSentenceKey.current = sentenceKey;

    // New sentence: clear immediately; same sentence growing: pick up where we left off
    const startFrom = isNewSentence ? 0 : prevShownCount.current;
    if (isNewSentence) {
      setShownCount(0);
      prevShownCount.current = 0;
    }

    let delay = 0;
    for (let i = startFrom; i < words.length; i++) {
      const idx = i;
      timers.current.push(
        setTimeout(() => {
          setShownCount(idx + 1);
          prevShownCount.current = idx + 1;
        }, delay)
      );
      delay += 115;
    }

    return () => timers.current.forEach(clearTimeout);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = words.slice(0, shownCount);

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div className="flex items-center justify-center gap-[5px]">
        {visible.map((word, i) => (
          <motion.span
            key={`${sentenceKey}-${i}`}
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 text-[15px] italic"
            style={{ color: "var(--color-text-muted)" }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// ── Waveform ──────────────────────────────────────────────────────────────────

function WaveformBars() {
  const scales = [0.45, 0.8, 1, 0.7, 0.38];
  return (
    <div className="flex items-end justify-center gap-[5px]" style={{ height: 52 }}>
      {scales.map((s, i) => (
        <motion.div
          key={i}
          style={{ width: 4, borderRadius: 2, background: "var(--color-brand-purple)" }}
          animate={{ height: [10 * s, 44 * s, 7 * s, 40 * s, 10 * s] }}
          transition={{ duration: 0.85 + i * 0.14, repeat: Infinity, ease: "easeInOut", delay: i * 0.11 }}
        />
      ))}
    </div>
  );
}

// ── Field card — always-editable, input styled as text when blurred ───────────

interface FieldCardProps {
  field: CRMField;
  onSave: (id: string, value: string) => void;
}

function FieldCard({ field, onSave }: FieldCardProps) {
  const isHigh      = field.conf === "high";
  const isUncertain = field.conf === "uncertain";
  const isConfirmed = field.conf === "confirmed";
  const isEmpty     = field.value === "Unknown" || field.value === "Select…";

  const [focused, setFocused] = useState(false);
  const [inputVal, setInputVal] = useState(isEmpty ? "" : field.value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when voice-listen fills this field
  useEffect(() => {
    if (!focused) setInputVal(isEmpty ? "" : field.value);
  }, [field.value, isEmpty, focused]);

  const border = focused
    ? "1.5px solid rgba(139,146,255,0.6)"
    : isConfirmed
    ? "1px solid rgba(46,204,113,0.45)"
    : isUncertain
    ? "2px dashed rgba(139,146,255,0.65)"
    : "1px solid rgba(139,146,255,0.28)";

  const bg = isConfirmed && !focused ? "rgba(46,204,113,0.05)" : "var(--color-dark-secondary)";

  const idleValueColor = isConfirmed
    ? "var(--color-text-primary)"
    : isHigh
    ? "var(--color-brand-purple)"
    : "var(--color-text-muted)";

  function focusInput() {
    setFocused(true);
  }

  // Autofocus the input once it mounts (idle state renders a plain span instead)
  useEffect(() => {
    if (focused) inputRef.current?.focus();
  }, [focused]);

  function handleBlur() {
    setFocused(false);
    onSave(field.id, inputVal);
  }

  return (
    <div
      onClick={focusInput}
      className="cursor-text"
      style={{ border, background: bg, borderRadius: "var(--radius-lg)", padding: "13px 14px", transition: "border-color 0.15s, background 0.15s" }}
    >
      {field.multiLine ? (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>{field.label}</span>
            {isHigh && !focused && <Icon name="auto_awesome" size={14} style={{ color: "var(--color-brand-purple)" }} />}
            {isConfirmed && !focused && <span className="text-[15px] font-bold" style={{ color: "var(--color-semantic-success)" }}>✓</span>}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            placeholder={`Enter ${field.label.toLowerCase()}…`}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-[15px] outline-none bg-transparent"
            style={{
              color: focused ? "var(--color-text-primary)" : idleValueColor,
              fontWeight: focused ? 400 : 600,
              transition: "color 0.15s",
            }}
          />
        </>
      ) : (
        <motion.div layout="position" className={`flex items-center gap-3 ${focused ? "justify-start" : "justify-between"}`}>
          <AnimatePresence initial={false}>
            {!focused && (
              <motion.span
                key="label"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="text-[13px] flex-shrink-0"
                style={{ color: "var(--color-text-muted)" }}
              >
                {field.label}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.div layout="position" className={`flex items-center gap-2 min-w-0 ${focused ? "flex-1" : ""}`}>
            <AnimatePresence initial={false}>
              {!focused && isHigh && (
                <motion.span key="sparkle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  <Icon name="auto_awesome" size={14} style={{ color: "var(--color-brand-purple)", flexShrink: 0 }} />
                </motion.span>
              )}
              {!focused && isConfirmed && (
                <motion.span key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="text-[15px] font-bold flex-shrink-0" style={{ color: "var(--color-semantic-success)" }}>
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
            {focused ? (
              <motion.input
                layout
                ref={inputRef}
                type={field.id === "phone" ? "tel" : "text"}
                value={inputVal}
                placeholder=""
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                onClick={(e) => e.stopPropagation()}
                className="outline-none bg-transparent min-w-0 w-full"
                style={{ fontSize: 15, fontWeight: 400, color: "var(--color-text-primary)", textAlign: "left" }}
              />
            ) : (
              <motion.span
                layout
                onClick={(e) => { e.stopPropagation(); focusInput(); }}
                className="truncate"
                style={{ fontSize: 15, fontWeight: 600, color: idleValueColor }}
              >
                {isEmpty ? "Add…" : inputVal}
              </motion.span>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ── Overlay ───────────────────────────────────────────────────────────────────

export default function AIReviewOverlay() {
  const { status, accountName, readyCapture } = useCapture();

  const [fields,     setFields]     = useState<CRMField[]>([]);
  const [listening,  setListening]  = useState(false);
  const [transcript, setTranscript] = useState("");
  // Secret demo toggle — tap "What we learned" to show/hide extra fields for scroll demos
  const [showExtra,  setShowExtra]  = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const visibleFields = fields.filter((f) => showExtra || !f.demo);

  // Reset fields when a new review session begins
  useEffect(() => {
    if (status !== "reviewing") return;
    setListening(false);
    setTranscript("");
    setShowExtra(false);
    setFields([
      { id: "firstName",  label: "First name",      value: "Sandra",                conf: "high" },
      { id: "lastName",   label: "Last name",        value: "Perez",                 conf: "high" },
      { id: "title",      label: "Title",            value: "Operations Director",   conf: "high" },
      { id: "segment",    label: "Market segment",   value: "Commercial Fleet",      conf: "high" },
      { id: "address",    label: "Address",          value: "4820 E Grant Rd, Tucson, AZ 85711", conf: "high", multiLine: true },
      { id: "phone",      label: "Phone",            value: "Unknown",               conf: "uncertain" },
      { id: "leadStatus", label: "Lead status",      value: "Select…",               conf: "uncertain", isDropdown: true },
      { id: "email",      label: "Email",            value: "Unknown",               conf: "uncertain", demo: true },
      { id: "fleetSize",  label: "Fleet size",       value: "42 vehicles",           conf: "high",       demo: true },
      { id: "renewal",    label: "Renewal date",     value: "Select…",               conf: "uncertain", demo: true },
      { id: "budget",     label: "Budget approved",  value: "Yes",                   conf: "high",       demo: true },
      { id: "competitor", label: "Competitor",       value: "Select…",               conf: "uncertain", demo: true },
    ]);
  }, [status]);

  function startListening() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setListening(true);
    setTranscript("");

    LISTEN_STEPS.forEach((step) => {
      const t = setTimeout(() => {
        setTranscript(step.transcript);
        if (step.confirmId && step.newValue) {
          setFields((prev) =>
            prev.map((f) =>
              f.id === step.confirmId
                ? { ...f, value: step.newValue!, conf: "confirmed" }
                : f
            )
          );
        }
      }, step.delay);
      timers.current.push(t);
    });
  }

  function stopListening() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setListening(false);
    setTranscript("");
  }

  const handleFieldSave = useCallback((id: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFields((prev) =>
      prev.map((f) => f.id === id ? { ...f, value: trimmed, conf: "confirmed" } : f)
    );
  }, []);

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;
  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence>
      {status === "reviewing" && (
        <motion.div
          key="ai-review"
          className="absolute inset-0 flex flex-col"
          style={{ background: "var(--color-background)", zIndex: 100, pointerEvents: "auto" }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 36 }}
        >
          {/* ── Fixed header — never scrolls ─────────────────────────────── */}
          <div className="flex-shrink-0 px-5 pt-12">
            <AnimatePresence mode="wait">
              {!listening ? (
                <motion.div
                  key="header-idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mb-6"
                >
                  <motion.p
                    onClick={() => setShowExtra((v) => !v)}
                    whileTap={{ scale: 0.94 }}
                    className="text-[11px] font-semibold mb-1 w-fit"
                    style={{ color: "var(--color-text-disabled)", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    What we learned
                  </motion.p>
                  <h2
                    className="text-[26px] font-bold leading-tight"
                    style={{ fontFamily: "Roboto Slab, Georgia, serif", color: "var(--color-text-primary)" }}
                  >
                    Here's the read on {accountName ?? "this lead"}
                  </h2>
                </motion.div>
              ) : (
                <motion.div
                  key="header-listening"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mb-5"
                >
                  <WaveformBars />

                  {/* Live transcript line */}
                  <div style={{ minHeight: 40 }} className="flex items-center mt-3 mb-3">
                    <AnimatePresence mode="wait">
                      {transcript ? (
                        <motion.div
                          key="caption"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="w-full"
                        >
                          <LiveCaption text={transcript} />
                        </motion.div>
                      ) : (
                        <motion.p
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center text-[13px] w-full"
                          style={{ color: "var(--color-text-disabled)" }}
                        >
                          Listening…
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <p
                    className="text-[11px] font-semibold mb-3"
                    style={{ color: "var(--color-text-disabled)", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    After you speak
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Scrollable field list ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5" style={{ overscrollBehavior: "contain" }}>
            <div className="flex flex-col gap-2.5">
              {visibleFields.map((f) => (
                <FieldCard key={f.id} field={f} onSave={handleFieldSave} />
              ))}
            </div>
            {/* Spacer so the last field can clear the glossy bottom bar */}
            <div style={{ height: 132 }} />
          </div>

          {/* ── Bottom bar — glossy backdrop, fields scroll behind it ────── */}
          <div className="flex-shrink-0 relative" style={{ marginTop: -96 }}>
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{
                top: 0,
                background: "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--color-background) 60%, transparent) 35%, var(--color-background) 75%)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            />
            <div
              className="relative pt-4 pb-10 grid items-center"
              style={{ gridTemplateColumns: "1fr auto 1fr" }}
            >
            {/* Use defaults — centered between left edge and mic */}
            <div className="flex justify-center">
              <SideButton
                icon="block"
                label="Use defaults"
                onPress={readyCapture}
              />
            </div>

            {/* Mic — hold to talk */}
            <div className="flex flex-col items-center gap-2">
              {/* Button wrapper — rings positioned relative to this so they're always perfectly centered */}
              <div className="relative w-20 h-20">
                <AnimatePresence>
                  {listening && (
                    <>
                      {/* Outer ring */}
                      <motion.div
                        key="ring-outer"
                        className="absolute rounded-full pointer-events-none"
                        style={{ inset: "-8px", background: "rgba(139,146,255,0.22)" }}
                        initial={{ scale: 1.08 }}
                        animate={{ scale: [1.08, 1.28, 1.08] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      {/* Inner ring — higher min scale so it doesn't shrink as much */}
                      <motion.div
                        key="ring-inner"
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ background: "rgba(139,146,255,0.22)" }}
                        initial={{ scale: 1.16 }}
                        animate={{ scale: [1.16, 1.28, 1.16] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </>
                  )}
                </AnimatePresence>

              <motion.button
                className="absolute inset-0 rounded-full flex items-center justify-center z-10"
                style={{
                  background: "var(--color-brand-purple)",
                  boxShadow: "0 4px 20px rgba(139,146,255,0.3)",
                }}
                onPointerDown={startListening}
                onPointerUp={stopListening}
                onPointerLeave={() => { if (listening) stopListening(); }}
                whileTap={{ scale: 0.93 }}
              >
                <Icon name="mic" size={34} style={{ color: "#fff" }} />
              </motion.button>
              </div>{/* end button wrapper */}

              <span
                className="text-[12px] font-semibold"
                style={{ color: listening ? "var(--color-brand-purple)" : "var(--color-text-primary)" }}
              >
                {listening ? "Listening…" : "Hold to talk"}
              </span>
            </div>

            {/* Looks good — centered between mic and right edge */}
            <div className="flex justify-center">
              <SideButton
                icon="check"
                label="Save"
                onPress={readyCapture}
                variant="purple"
              />
            </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}

// ── Side button ───────────────────────────────────────────────────────────────

function SideButton({
  icon,
  label,
  onPress,
  variant = "neutral",
}: {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: "neutral" | "purple";
}) {
  const isPurple = variant === "purple";
  return (
    <button
      onClick={onPress}
      className="flex flex-col items-center gap-1.5 active:opacity-60 transition-opacity"
      style={{ minWidth: 68 }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: isPurple ? "var(--color-alpha-purple-10)" : "var(--color-dark-secondary)",
          border: isPurple ? "1.5px solid var(--color-brand-purple)" : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Icon name={icon} size={22} style={{ color: isPurple ? "var(--color-brand-purple)" : "var(--color-text-muted)" }} />
      </div>
      <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{label}</span>
    </button>
  );
}
