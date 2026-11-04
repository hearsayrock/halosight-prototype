"use client";

/**
 * FLUTTER HANDOFF: AlertDialog
 * Widget: StatelessWidget (AlertCard) inside showDialog / Dialog; the caller owns `open`
 * Props: open, title, body, confirmLabel, cancelLabel ("Cancel"), destructive (true), onConfirm, onCancel
 * Layout: centered card over the scrim, 24px side margin. Title (heading-6) and body (text-sm, muted) centered,
 *         a full-width filled confirm button, then a plain text Cancel button.
 * Flutter equivalent: halosight_alert_dialog.dart (Dialog + AlertCard)
 * Portals into #phone-overlay-root; the scrim tap cancels.
 * Tokens: color.dark.primary (card), color.dark.tertiary (card border), color.alpha.scrim (via DrawerBackdrop),
 *         color.error (destructive confirm) / color.neonindigo-dark (non-destructive confirm), color.text.primary,
 *         color.text.muted (body), color.text.secondary (Cancel), radius.xl, radius.full, spacing.1/4/6
 */

import { createPortal } from "react-dom";
import { DrawerBackdrop, useOverlayRoot } from "@/components/ui/Drawer";

export interface AlertCardProps {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Error-colored confirm (default). false uses the indigo action color. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** The card on its own, for the design-system page and for callers that position it themselves. */
export function AlertCard({
  title, body, confirmLabel, cancelLabel = "Cancel", destructive = true, onConfirm, onCancel,
}: AlertCardProps) {
  return (
    <div
      role="alertdialog"
      aria-label={title}
      className="relative w-full flex flex-col"
      style={{
        gap: "var(--spacing-4)",
        padding: "var(--spacing-6)",
        borderRadius: "var(--radius-xl)",
        background: "var(--md-sys-color-dark-primary)",
        border: "1px solid var(--md-sys-color-dark-tertiary)",
      }}
    >
      <div className="text-center">
        <p className="heading-6" style={{ color: "var(--md-sys-color-text-primary)", marginBottom: body ? "var(--spacing-1)" : 0 }}>{title}</p>
        {body && <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)" }}>{body}</p>}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="w-full h-12 text-15-bold active:opacity-70 transition-opacity"
        style={{
          borderRadius: "var(--radius-full)",
          background: destructive ? "var(--md-sys-color-error)" : "var(--md-sys-color-neonindigo-dark)",
          color: "var(--md-sys-color-text-primary)",
        }}
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="w-full h-10 text-15-bold active:opacity-60 transition-opacity"
        style={{ color: "var(--md-sys-color-text-secondary)" }}
      >
        {cancelLabel}
      </button>
    </div>
  );
}

export default function AlertDialog({ open, ...card }: AlertCardProps & { open: boolean }) {
  const root = useOverlayRoot();
  if (!root || !open) return null;
  return createPortal(
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 80, padding: "0 var(--spacing-6)", pointerEvents: "auto" }}>
      <DrawerBackdrop onClick={card.onCancel} />
      <AlertCard {...card} />
    </div>,
    root,
  );
}
