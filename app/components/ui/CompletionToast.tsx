"use client";

/**
 * CompletionToast — portaled "Item complete" banner with undo.
 * Fades in when visible, fades + slides down on exit.
 * Portals into #phone-overlay-root so it sits above everything.
 */

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";

interface Props {
  visible: boolean;
  /** Distance from bottom of phone frame in px. Default: 24 (no nav). Pass ~106 when bottom nav is present. */
  bottom?: number;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function CompletionToast({
  visible,
  bottom = 24,
  onUndo,
  onDismiss,
}: Props) {
  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;

  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="completion-toast"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom,
            left: 16,
            right: 16,
            zIndex: 60,
            pointerEvents: "auto",
          }}
        >
          <div
            className="flex items-center gap-3 px-4"
            style={{
              height: 52,
              background: "var(--md-sys-color-dark-secondary)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--md-sys-color-dark-tertiary)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {/* Green check circle */}
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#2ECC71" }}
            >
              <Icon name="check" size={14} style={{ color: "#fff" }} />
            </div>

            {/* Label */}
            <span
              className="flex-1 text-sm font-semibold"
              style={{ color: "var(--md-sys-color-text-primary)" }}
            >
              Item complete
            </span>

            {/* Undo */}
            <button
              onClick={onUndo}
              className="text-sm font-semibold active:opacity-60 transition-opacity"
              style={{ color: "var(--md-sys-color-neonindigo)" }}
            >
              undo
            </button>

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              className="ml-1 flex items-center justify-center active:opacity-60 transition-opacity"
              style={{ color: "var(--md-sys-color-text-muted)" }}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
