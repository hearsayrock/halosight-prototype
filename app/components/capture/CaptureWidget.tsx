"use client";

/**
 * CaptureWidget — persistent capture bar anchored to the bottom edge.
 * Gradient: 3 blurred color blobs animating under a semi-transparent dark surface.
 * Colors: #FF6B5B (coral), #5C63D6 (indigo), #8C92FF (lavender).
 *
 * The bar is only the recording state now. Account switcher: tapping the account name opens a picker sheet;
 * selecting any account calls switchAccount() without interrupting the recording session.
 *
 * After Finish the note is shown as the top pill Toast ("Preparing note" → "Note ready", tap to open it),
 * not as a bar state. Prospects first get the AIReviewOverlay for the post-meeting AI conversation; the pill
 * stays on "Preparing note" while they review, and flips to "Note ready" when they accept or discard.
 * FLUTTER HANDOFF: capture widget = recording state only; processing/ready come from ToastController (pill shape).
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCapture } from "@/lib/context/CaptureContext";
import { useFakeCall } from "@/lib/context/FakeCallContext";
import { mockAccountDetails } from "@/lib/mock-data/accounts";
import Icon from "@/components/ui/Icon";
import AccountPickerSheet from "@/components/accounts/AccountPickerSheet";
import AIReviewOverlay from "@/components/capture/AIReviewOverlay";
import { ToastCheck, ToastSpinner } from "@/components/ui/Toast";
import { useToast } from "@/lib/context/ToastContext";

// ── Timer ─────────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m} : ${String(s % 60).padStart(2, "0")}`;
}

// ── Animated blob background ──────────────────────────────────────────────────

function BlobBackground({ active, paused }: { active: boolean; paused: boolean }) {
  const speed = active ? 1 : 2.8;

  return (
    <div
      style={{
        position: "absolute",
        top: paused ? 0 : -10,
        left: 0,
        right: 0,
        bottom: 0,
        filter: "blur(28px)",
        opacity: active ? 1 : 0.55,
        transition: "opacity 0.8s ease, top 0.5s ease",
        WebkitMaskImage: paused
          ? "none"
          : "linear-gradient(to bottom, transparent 0px, black 10px, black 100%)",
        maskImage: paused
          ? "none"
          : "linear-gradient(to bottom, transparent 0px, black 10px, black 100%)",
      }}
    >
      <motion.div
        style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "#FF6B5B", left: "0%", top: "0%" }}
        animate={paused ? { x: 0, y: 0 } : { x: [0, 50, 10, 70, 0], y: [0, 15, -10, 5, 0] }}
        transition={paused ? { duration: 0.6, ease: "easeOut" } : { duration: 7 * speed, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "#5C63D6", right: "0%", top: "0%" }}
        animate={paused ? { x: 0, y: 0 } : { x: [0, -40, -5, -60, 0], y: [0, 10, -15, 5, 0] }}
        transition={paused ? { duration: 0.6, ease: "easeOut" } : { duration: 9 * speed, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "#8C92FF", left: "30%", top: "5%" }}
        animate={paused ? { x: 0, y: 0 } : { x: [0, 25, -30, 15, 0], y: [0, -10, 20, -5, 0] }}
        transition={paused ? { duration: 0.6, ease: "easeOut" } : { duration: 6 * speed, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

// ── Account name button — tappable in both recording and ready states ─────────

function AccountButton({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="flex items-center gap-1 active:opacity-60 transition-opacity"
      style={{ maxWidth: "100%" }}
    >
      <span
        className="text-15-bold truncate"
        style={{ color: "var(--md-sys-color-text-secondary)" }}
      >
        {name}
      </span>
      <Icon name="expand_more" size={16} style={{ color: "var(--md-sys-color-text-muted)", flexShrink: 0 }} />
    </button>
  );
}

// ── Widget ────────────────────────────────────────────────────────────────────

export default function CaptureWidget() {
  const {
    status, accountId, accountName, canSwitchAccount, isProspect,
    switchAccount, finishCapture, reviewCapture, readyCapture, dismissCapture,
  } = useCapture();
  const { callStatus } = useFakeCall();
  const callInterrupted = callStatus !== "idle";
  const router = useRouter();
  const { show: showToast } = useToast();
  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (status === "recording") setElapsed(0);
  }, [status]);

  useEffect(() => {
    if (status !== "recording" || callInterrupted) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status, callInterrupted]);

  // After 3 seconds of finalizing: prospects get the AI review overlay, accounts go straight to ready
  useEffect(() => {
    if (status !== "finalizing") return;
    const t = setTimeout(isProspect ? reviewCapture : readyCapture, 3000);
    return () => clearTimeout(t);
  }, [status, isProspect, reviewCapture, readyCapture]);

  useEffect(() => {
    if (status === "idle") setShowPicker(false);
  }, [status]);

  function openNote() {
    if (!accountId) return;
    const detail = mockAccountDetails[accountId];
    const first = detail?.recentActivity?.[0];
    if (first) {
      router.push(`/relationships/${accountId}/activity/${first.id}`);
    } else {
      const nameParam = accountName ? `?name=${encodeURIComponent(accountName)}` : "";
      router.push(`/relationships/${accountId}/activity/new-capture${nameParam}`);
    }
  }

  // After Finish, the note shows up as a top pill: "Preparing note" while it processes (and while a prospect reviews
  // the AI's CRM updates), then "Note ready" — tap it to open the note.
  useEffect(() => {
    if (status === "finalizing" || status === "reviewing") {
      showToast({ shape: "pill", title: "Preparing note", leading: <ToastSpinner />, duration: null }, { replace: true });
    } else if (status === "ready") {
      showToast({ shape: "pill", title: "Note ready", leading: <ToastCheck />, duration: 6000, action: { label: "View", onPress: openNote } }, { replace: true });
      dismissCapture();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;

  if (!overlayRoot) return null;

  return createPortal(
    <>
      {/* ── AI Review Overlay — slides up after finalizing ─────────────── */}
      <AIReviewOverlay />

      {/* ── Capture widget bar ──────────────────────────────────────────── */}
      <AnimatePresence>
        {status === "recording" && (
          <motion.div
            key="capture-widget"
            style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              zIndex: 50,
              pointerEvents: "auto",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <BlobBackground active={status === "recording"} paused={callInterrupted} />

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "20px 20px 0 0",
                background: "color-mix(in srgb, var(--md-sys-color-dark-primary) 82%, transparent)",
                backdropFilter: "blur(4px)",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>

                {/* ── Recording ────────────────────────────────────────── */}
                {status === "recording" && (
                  <motion.div
                    key="recording"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 px-4 pt-4 pb-7"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full" style={{ background: "#ff4444" }} />
                      <span
                        className="text-sm-bold tabular-nums"
                        style={{ color: "var(--md-sys-color-text-primary)", minWidth: 44 }}
                      >
                        {formatTime(elapsed)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 17, fontWeight: 700, color: "var(--md-sys-color-text-primary)", lineHeight: 1.2, marginBottom: 3 }}>
                        {callInterrupted ? "Incoming call" : "Taking notes"}
                      </p>
                      {canSwitchAccount ? (
                        <AccountButton name={accountName ?? ""} onPress={() => setShowPicker(true)} />
                      ) : (
                        <p className="text-15-bold truncate" style={{ color: "var(--md-sys-color-text-secondary)" }}>
                          {accountName}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={callInterrupted ? undefined : finishCapture}
                      className="flex-shrink-0 h-9 px-4 text-sm-bold rounded-full transition-opacity"
                      style={{
                        background: callInterrupted ? "rgba(255,255,255,0.12)" : "var(--md-sys-color-brand-coral-dark)",
                        color: callInterrupted ? "rgba(255,255,255,0.4)" : "var(--md-sys-color-text-on-coral)",
                        cursor: callInterrupted ? "default" : undefined,
                      }}
                    >
                      {callInterrupted ? "Paused" : "Finish"}
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Account picker ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPicker && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
            <AccountPickerSheet
              currentId={accountId}
              onSelect={switchAccount}
              onClose={() => setShowPicker(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </>,
    overlayRoot
  );
}
