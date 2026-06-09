"use client";

/**
 * CaptureWidget — persistent capture bar anchored to the bottom edge.
 * Gradient: 3 blurred color blobs animating under a semi-transparent dark surface.
 * Colors: #FF6B5B (coral), #5C63D6 (indigo), #8C92FF (lavender).
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCapture } from "@/lib/context/CaptureContext";
import { mockAccountDetails } from "@/lib/mock-data/accounts";

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
        // Starts 10px above the widget top so blobs peek out
        position: "absolute",
        top: -10,
        left: 0,
        right: 0,
        bottom: 0,
        filter: "blur(28px)",
        opacity: active ? 1 : 0.55,
        transition: "opacity 0.8s ease",
        // Mask: fade from transparent at the top (peek area) to fully opaque 10px in
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, black 10px, black 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, black 10px, black 100%)",
      }}
    >
      {/* Coral blob — left */}
      <motion.div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "#FF6B5B",
          left: "0%",
          top: "0%",
        }}
        animate={{ x: [0, 50, 10, 70, 0], y: [0, 15, -10, 5, 0] }}
        transition={{ duration: 7 * speed, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Indigo blob — right */}
      <motion.div
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "#5C63D6",
          right: "0%",
          top: "0%",
        }}
        animate={{ x: [0, -40, -5, -60, 0], y: [0, 10, -15, 5, 0] }}
        transition={{ duration: 9 * speed, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Lavender blob — center */}
      <motion.div
        style={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "#8C92FF",
          left: "30%",
          top: "5%",
        }}
        animate={{ x: [0, 25, -30, 15, 0], y: [0, -10, 20, -5, 0] }}
        transition={{ duration: 6 * speed, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

// ── Widget ────────────────────────────────────────────────────────────────────

export default function CaptureWidget() {
  const { status, accountId, accountName, finishCapture, readyCapture, dismissCapture } =
    useCapture();
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

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
    <AnimatePresence>
      {status !== "idle" && (
        <motion.div
          key="capture-widget"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            pointerEvents: "auto",
            // No overflow:hidden — lets blobs peek above the top edge
          }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
        >
          {/* Animated color blobs — extend 10px above widget, masked to fade softly */}
          <BlobBackground active={status === "recording"} />

          {/* Glass-effect dark surface — owns the border-radius and clips content */}
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

              {/* ── Recording ──────────────────────────────────────────── */}
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
                      className="text-sm font-bold tabular-nums"
                      style={{ color: "var(--color-text-primary)", minWidth: 44 }}
                    >
                      {formatTime(elapsed)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                      Taking notes
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                      {accountName}
                    </p>
                  </div>

                  <button
                    onClick={finishCapture}
                    className="flex-shrink-0 h-9 px-4 text-sm font-bold rounded-full active:opacity-70 transition-opacity"
                    style={{ background: "var(--color-brand-coral)", color: "var(--color-text-primary)" }}
                  >
                    Finish
                  </button>
                </motion.div>
              )}

              {/* ── Finalizing / Ready ──────────────────────────────────── */}
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
                      {status === "ready" ? "Note is ready! 🎉" : "Finalizing your note!"}
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
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {status === "ready" ? accountName : "I will let you know when it's ready."}
                    </p>

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
    </AnimatePresence>,
    overlayRoot
  );
}
