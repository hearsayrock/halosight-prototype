"use client";

/**
 * FLUTTER HANDOFF: CompletionToast
 * Widget: none. In Flutter this is a call, not a widget: ToastController.show(tone: success, title: "Item complete", action: Undo,
 *   secondary: "Add a note" (optional)), with no auto-dismiss.
 *
 * A thin wrapper over Toast for the "pending complete" window after an action item is checked off: a success toast saying "Item complete" with one
 * Undo action and, when onAddNote is given, an "Add a note" row (edit icon) under it. The screens time the pending window themselves, so this toast
 * never dismisses on its own (duration null) and pressing Undo does not close it (dismissOnAction false); the screen hides it. `bottom` lifts it
 * above a floating control (default 24).
 *
 * Tokens: see Toast
 */

import Toast from "@/components/ui/Toast";

interface Props {
  visible: boolean;
  /** Distance from bottom of phone frame in px. Default: 24. */
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
