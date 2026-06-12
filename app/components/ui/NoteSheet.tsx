"use client";

/**
 * FLUTTER HANDOFF: NoteSheet
 * Widget: StatefulWidget
 * Slides up from the bottom after an action item is checked off.
 * The user can type a note and tap Done, or dismiss without adding one.
 * Either path commits the completion — this sheet has no undo.
 *
 * Tokens: --color-dark-secondary (sheet bg), --color-dark-tertiary (input bg),
 *         --color-text-primary, --color-text-muted, --color-brand-teal,
 *         --radius-xl, --radius-lg, --radius-full
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";

interface Props {
  visible: boolean;
  /** Called when the user taps Done or dismisses the sheet.
   *  `note` will be an empty string if they closed without typing. */
  onDone: (note: string) => void;
}

export default function NoteSheet({ visible, onDone }: Props) {
  const [note, setNote] = useState("");

  // Clear textarea each time the sheet opens
  useEffect(() => {
    if (visible) setNote("");
  }, [visible]);

  const overlayRoot =
    typeof document !== "undefined"
      ? document.getElementById("phone-overlay-root")
      : null;

  if (!overlayRoot) return null;

  const hasNote = note.trim().length > 0;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — tap to complete without a note */}
          <motion.div
            key="note-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onDone("")}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 70,
              background: "rgba(0,0,0,0.48)",
              pointerEvents: "auto",
            }}
          />

          {/* Sheet */}
          <motion.div
            key="note-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 71,
              pointerEvents: "auto",
              background: "var(--color-dark-secondary)",
              borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
              padding: "20px 16px 36px",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-sm font-bold"
                style={{ color: "var(--color-text-muted)" }}
              >
                Add a note
              </span>
              <button
                onClick={() => onDone("")}
                className="active:opacity-60 transition-opacity"
              >
                <Icon name="close" size={20} style={{ color: "var(--color-text-muted)" }} />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything worth remembering for next time…"
              rows={3}
              className="w-full resize-none outline-none text-sm px-3 py-2.5 mb-3"
              style={{
                background: "var(--color-dark-tertiary)",
                borderRadius: "var(--radius-lg)",
                color: "var(--color-text-primary)",
                lineHeight: "1.6",
                caretColor: "var(--color-brand-teal)",
                display: "block",
              }}
            />

            {/* Done / Save note button */}
            <button
              onClick={() => onDone(note)}
              className="w-full h-11 font-semibold text-sm active:opacity-80 transition-opacity"
              style={{
                background: "var(--color-brand-teal)",
                borderRadius: "var(--radius-full)",
                color: "#fff",
              }}
            >
              {hasNote ? "Save note" : "Done"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
