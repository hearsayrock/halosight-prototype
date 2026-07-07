"use client";

/**
 * CompletionToast — portaled "Item complete" banner with undo + optional note CTA.
 * Fades in when visible, fades + slides down on exit.
 * Portals into #phone-overlay-root so it sits above everything.
 *
 * Tokens: --color-dark-secondary (bg), --color-dark-tertiary (border),
 *         --color-text-primary, --color-text-muted, --color-brand-purple,
 *         --color-brand-teal, --radius-xl
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
  /** If provided, an "Add a note" row appears below the main row. */
  onAddNote?: () => void;
}

export default function CompletionToast({
  visible,
  bottom = 24,
  onUndo,
  onDismiss,
  onAddNote,
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
            style={{
              background: "var(--color-dark-secondary)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--color-dark-tertiary)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3)",
              padding: "12px 16px",
            }}
          >
            {/* Row 1: check icon + label + undo + dismiss */}
            <div className="flex items-center gap-3">
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
                style={{ color: "var(--color-text-primary)" }}
              >
                Item complete
              </span>

              {/* Undo */}
              <button
                onClick={onUndo}
                className="text-sm font-semibold active:opacity-60 transition-opacity"
                style={{ color: "var(--color-brand-purple)" }}
              >
                undo
              </button>

              {/* Dismiss */}
              <button
                onClick={onDismiss}
                className="ml-1 flex items-center justify-center active:opacity-60 transition-opacity"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Row 2: Add a note CTA */}
            {onAddNote && (
              <button
                onClick={onAddNote}
                className="flex items-center gap-1.5 mt-2.5 active:opacity-60 transition-opacity"
                style={{ paddingLeft: 36 }}
              >
                <Icon name="edit" size={13} style={{ color: "var(--color-brand-teal)" }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-brand-teal)" }}
                >
                  Add a note
                </span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
