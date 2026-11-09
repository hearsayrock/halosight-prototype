"use client";

/**
 * FLUTTER HANDOFF: NoteSheet
 * Widget: StatefulWidget
 * Slides up from the bottom after an action item is checked off.
 * The user can type a note and tap Done, or dismiss without adding one.
 * Either path commits the completion — this sheet has no undo.
 *
 * Fields: one multi-line TextField (3 rows, auto-focused) for the note.
 * Known drift: Done is a hand-built teal button; the shared Button has no teal fill yet.
 * Tokens: color.dark.secondary (the field, via TextField), color.brand.teal (Done), color.text.primary / muted, radius.full, spacing.3
 */

import TextField from "@/components/ui/TextField";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DrawerBackdrop, DrawerPanel, DrawerBody } from "@/components/ui/Drawer";
import { AnimatePresence } from "framer-motion";
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
          <DrawerBackdrop onClick={() => onDone("")} zIndex={70} />

          <DrawerPanel zIndex={71} maxHeight="100%">
          <DrawerBody>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-sm-bold"
                style={{ color: "var(--md-sys-color-text-muted)" }}
              >
                Add a note
              </span>
              <button
                onClick={() => onDone("")}
                className="active:opacity-60 transition-opacity"
              >
                <Icon name="close" size={20} style={{ color: "var(--md-sys-color-text-muted)" }} />
              </button>
            </div>

            {/* Textarea */}
            <TextField
              multiline
              rows={3}
              autoFocus
              value={note}
              onChange={setNote}
              placeholder="Anything worth remembering for next time…"
              style={{ marginBottom: "var(--spacing-3)" }}
            />

            {/* Done / Save note button */}
            <button
              onClick={() => onDone(note)}
              className="w-full h-11 text-sm-bold active:opacity-80 transition-opacity"
              style={{
                background: "var(--md-sys-color-brand-teal)",
                borderRadius: "var(--radius-full)",
                color: "var(--md-sys-color-text-on-teal)",
              }}
            >
              {hasNote ? "Save note" : "Done"}
            </button>
          </DrawerBody>
          </DrawerPanel>
        </>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
