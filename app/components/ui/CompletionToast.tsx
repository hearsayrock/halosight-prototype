"use client";

/**
 * CompletionToast — "Item complete" with Undo and an optional "Add a note" row.
 * Now a thin wrapper over Toast (components/ui/Toast.tsx): success tone, one Undo action, caller-controlled timing.
 * FLUTTER HANDOFF: use ToastController.show(tone: success, title: "Item complete", action: Undo) — no separate widget.
 * Tokens: see Toast.
 */

import Toast from "@/components/ui/Toast";

interface Props {
  visible: boolean;
  /** Distance from bottom of phone frame in px. Default: 24 (no nav). Pass ~106 when bottom nav is present. */
  bottom?: number;
  onUndo: () => void;
  onDismiss: () => void;
  /** If provided, an "Add a note" row appears under the message. */
  onAddNote?: () => void;
}

export default function CompletionToast({ visible, bottom = 24, onUndo, onDismiss, onAddNote }: Props) {
  return (
    <Toast
      visible={visible}
      tone="success"
      title="Item complete"
      action={{ label: "Undo", onPress: onUndo }}
      secondary={onAddNote ? { label: "Add a note", icon: "edit", onPress: onAddNote } : undefined}
      // The screens already time the "pending complete" window themselves, so this toast doesn't dismiss on its own.
      duration={null}
      dismissOnAction={false}
      bottom={bottom}
      onDismiss={onDismiss}
    />
  );
}
