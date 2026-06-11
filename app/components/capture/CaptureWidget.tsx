"use client";

/**
 * CaptureWidget — persistent capture bar anchored to the bottom edge.
 * Gradient: 3 blurred color blobs animating under a semi-transparent dark surface.
 * Colors: #FF6B5B (coral), #5C63D6 (indigo), #8C92FF (lavender).
 *
 * Account switcher: tapping the account name in recording OR ready state opens
 * a picker sheet. Selecting any account calls switchAccount() without
 * interrupting the recording session.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCapture } from "@/lib/context/CaptureContext";
import { mockAccountDetails, mockAccounts } from "@/lib/mock-data/accounts";
import Icon from "@/components/ui/Icon";

// ── Timer ─────────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m} : ${String(s % 60).padStart(2, "0")}`;
}

// ── Animated blob background ──────────────────────────────────────────────────

function BlobBackground({ active }: { active: boolean }) {
  const speed = active ? 1 : 2.8;

  return (
    <div
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        right: 0,
        bottom: 0,
        filter: "blur(28px)",
        opacity: active ? 1 : 0.55,
        transition: "opacity 0.8s ease",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, black 10px, black 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, black 10px, black 100%)",
      }}
    >
      <motion.div
        style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "#FF6B5B", left: "0%", top: "0%" }}
        animate={{ x: [0, 50, 10, 70, 0], y: [0, 15, -10, 5, 0] }}
        transition={{ duration: 7 * speed, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "#5C63D6", right: "0%", top: "0%" }}
        animate={{ x: [0, -40, -5, -60, 0], y: [0, 10, -15, 5, 0] }}
        transition={{ duration: 9 * speed, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "#8C92FF", left: "30%", top: "5%" }}
        animate={{ x: [0, 25, -30, 15, 0], y: [0, -10, 20, -5, 0] }}
        transition={{ duration: 6 * speed, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

// ── Account name button — tappable in both recording and ready states ─────────

function AccountButton({
  name,
  onPress,
}: {
  name: string;
  onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className="flex items-center gap-1 active:opacity-60 transition-opacity"
      style={{ maxWidth: "100%" }}
    >
      <span
        className="truncate font-semibold"
        style={{ fontSize: 15, color: "var(--color-text-secondary)" }}
      >
        {name}
      </span>
      <Icon
        name="expand_more"
        size={16}
        style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
      />
    </button>
  );
}

// ── Account picker sheet ──────────────────────────────────────────────────────

function AccountPickerSheet({
  currentId,
  onSelect,
  onClose,
}: {
  currentId: string | null;
  onSelect: (id: string, name: string) => void;
  onClose: () => void;
}) {
  const sorted = [...mockAccounts].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)", zIndex: 60 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="absolute left-0 right-0 bottom-0"
        style={{
          zIndex: 61,
          background: "var(--color-dark-primary)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          maxHeight: "72%",
          display: "flex",
          flexDirection: "column",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--color-dark-tertiary)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <h3
            style={{
              fontFamily: "Roboto Slab, Georgia, serif",
              fontSize: 18, fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            Switch account
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center active:opacity-60 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            <Icon name="close" size={18} style={{ color: "var(--color-text-muted)" }} />
          </button>
        </div>

        {/* Account list */}
        <div style={{ overflowY: "auto", paddingBottom: 40 }}>
          {sorted.map((account, i) => {
            const isSelected = account.id === currentId;
            return (
              <button
                key={account.id}
                onClick={() => { onSelect(account.id, account.name); onClose(); }}
                className="w-full flex items-center justify-between px-5 py-3.5 active:opacity-60 transition-opacity relative"
                style={{ textAlign: "left" }}
              >
                {/* Separator */}
                {i > 0 && (
                  <div className="absolute top-0 left-5 right-5" style={{ height: 1, background: "var(--color-dark-tertiary)" }} />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{
                      fontSize: 15,
                      color: isSelected ? "var(--color-brand-purple)" : "var(--color-text-primary)",
                    }}
                  >
                    {account.name}
                  </p>
                  {(account.city || account.state) && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {[account.city, account.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <Icon name="check" size={18} style={{ color: "var(--color-brand-purple)", flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

// ── Widget ────────────────────────────────────────────────────────────────────

export default function CaptureWidget() {
  const { status, accountId, accountName, switchAccount, finishCapture, readyCapture, dismissCapture } =
    useCapture();
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (status !== "recording") return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== "finalizing") return;
    const t = setTimeout(readyCapture, 3000);
    return () => clearTimeout(t);
  }, [status, readyCapture]);

  // Close picker if widget is dismissed
  useEffect(() => {
    if (status === "idle") setShowPicker(false);
  }, [status]);

  function handleReview() {
    if (!accountId) return;
    const detail = mockAccountDetails[accountId];
    const first = detail?.recentActivity?.[0];
    router.push(first ? `/accounts/${accountId}/activity/${first.id}` : `/accounts/${accountId}`);
    dismissCapture();
  }

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;

  if (!overlayRoot) return null;

  return createPortal(
    <>
      {/* ── Capture widget ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {status !== "idle" && (
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
            <BlobBackground active={status === "recording"} />

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "20px 20px 0 0",
                background: "color-mix(in srgb, var(--color-dark-primary) 82%, transparent)",
                backdropFilter: "blur(4px)",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>

                {/* ── Recording ──────────────────────────────────────── */}
                {status === "recording" && (
                  <motion.div
                    key="recording"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 px-4 pt-4 pb-7"
                  >
                    {/* Timer */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full" style={{ background: "#ff4444" }} />
                      <span
                        className="font-bold tabular-nums"
                        style={{ fontSize: 14, color: "var(--color-text-primary)", minWidth: 44 }}
                      >
                        {formatTime(elapsed)}
                      </span>
                    </div>

                    {/* Label + account */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2, marginBottom: 3 }}>
                        Taking notes
                      </p>
                      <AccountButton
                        name={accountName ?? ""}
                        onPress={() => setShowPicker(true)}
                      />
                    </div>

                    {/* Finish */}
                    <button
                      onClick={finishCapture}
                      className="flex-shrink-0 h-9 px-4 font-bold rounded-full active:opacity-70 transition-opacity"
                      style={{ fontSize: 14, background: "var(--color-brand-coral)", color: "var(--color-text-primary)" }}
                    >
                      Finish
                    </button>
                  </motion.div>
                )}

                {/* ── Finalizing / Ready ──────────────────────────────── */}
                {(status === "finalizing" || status === "ready") && (
                  <motion.div
                    key="finalizing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pt-4 pb-7"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                        {status === "ready" ? "Note is ready! 🎉" : "Finalizing your note…"}
                      </p>
                      <button
                        onClick={dismissCapture}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center active:opacity-60 transition-opacity"
                        style={{ color: "var(--color-text-muted)", fontSize: 18, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {status === "ready" ? (
                        <AccountButton
                          name={accountName ?? ""}
                          onPress={() => setShowPicker(true)}
                        />
                      ) : (
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          I'll let you know when it's ready.
                        </p>
                      )}

                      <AnimatePresence>
                        {status === "ready" && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.2 }}
                            onClick={handleReview}
                            className="flex-shrink-0 h-8 px-4 text-sm font-bold rounded-full active:opacity-70 transition-opacity"
                            style={{ background: "var(--color-brand-purple)", color: "var(--color-text-primary)" }}
                          >
                            Review
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
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
          <AccountPickerSheet
            currentId={accountId}
            onSelect={switchAccount}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </>,
    overlayRoot
  );
}
