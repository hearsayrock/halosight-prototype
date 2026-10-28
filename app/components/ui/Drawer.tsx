"use client";

/**
 * FLUTTER HANDOFF: Drawer (+ DrawerBackdrop, DrawerPanel, DrawerHandle, DrawerHeader)
 * Widget: showModalBottomSheet (StatefulWidget content inside a DraggableScrollableSheet / Container)
 * Props: open, onClose (backdrop tap), onExitComplete, maxHeight ("88%"), keyboardAware, children
 * State: none — the caller owns open/closed
 * Data: none
 * Flutter equivalent: halosight_drawer.dart (a themed wrapper around showModalBottomSheet)
 *
 * The one bottom drawer. Every sheet in the app uses this chrome so they look and move the same:
 *   - Portals into #phone-overlay-root (above page transitions and the bottom nav)
 *   - Scrim behind: color.alpha.scrim, fades in 200ms, tap to close
 *   - Panel: color.dark.primary fill, radius.xl on the top corners, slides up on a spring (stiffness 380, damping 38)
 *   - 40×4 handle (color.dark.tertiary), 12px from the top
 *   - maxHeight default 88% of the phone, scrolls when taller; keyboardAware lifts it by --keyboard-inset
 *   - Content padding is the caller's job; DrawerBody gives the standard 16px sides / 12px top / 32px bottom
 * DrawerHeader is the Cancel | title | action row used by edit-style drawers.
 *
 * Tokens: color.dark.primary, color.dark.tertiary, color.alpha.scrim, color.text.primary, color.text.muted,
 *         color.neonindigo.base, radius.xl, radius.full, spacing.3, spacing.4, spacing.8
 */

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

const noopSubscribe = () => () => {};

/** #phone-overlay-root, or null on the server and during hydration (so server and first client render agree). */
export function useOverlayRoot(): Element | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => document.getElementById("phone-overlay-root"),
    () => null,
  );
}

export function DrawerBackdrop({ onClick, zIndex }: { onClick?: () => void; zIndex?: number }) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{ background: "var(--md-sys-color-alpha-scrim)", zIndex }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    />
  );
}

export function DrawerHandle() {
  return (
    <div className="flex justify-center flex-shrink-0" style={{ paddingTop: "var(--spacing-3)", paddingBottom: "var(--spacing-1)" }}>
      <div style={{ width: 40, height: 4, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-dark-tertiary)" }} />
    </div>
  );
}

export function DrawerPanel({
  children, maxHeight = "88%", keyboardAware = false, zIndex, flexColumn = false, style,
}: {
  children: ReactNode;
  maxHeight?: string;
  /** Lift the panel above the on-screen keyboard (--keyboard-inset). */
  keyboardAware?: boolean;
  zIndex?: number;
  /** Panel is a flex column (header + a scrolling list) instead of one scrolling block. */
  flexColumn?: boolean;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className="absolute left-0 right-0"
      style={{
        bottom: keyboardAware ? "var(--keyboard-inset, 0px)" : 0,
        transition: keyboardAware ? "bottom 0.28s cubic-bezier(0.32, 0.72, 0, 1)" : undefined,
        zIndex,
        background: "var(--md-sys-color-dark-primary)",
        borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
        maxHeight,
        ...(flexColumn ? { display: "flex", flexDirection: "column" } : { overflowY: "auto" }),
        ...style,
      }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
    >
      <DrawerHandle />
      {children}
    </motion.div>
  );
}

/** Standard content padding for a drawer: 16px sides, 12px top, 32px bottom. */
export function DrawerBody({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ padding: "var(--spacing-3) var(--spacing-4) var(--spacing-8)", ...style }}>
      {children}
    </div>
  );
}

/** Cancel | title | action — for edit-style drawers. */
export function DrawerHeader({
  title, onCancel, onConfirm, confirmLabel = "Save",
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "var(--spacing-2) var(--spacing-4) var(--spacing-3)", borderBottom: "1px solid var(--md-sys-color-alpha-white-10)" }}
    >
      <button
        onClick={onCancel}
        className="active:opacity-60 transition-opacity"
        style={{ minWidth: 64, minHeight: 44, textAlign: "left", fontSize: 16, fontWeight: 600, color: "var(--md-sys-color-text-muted)", fontFamily: "var(--font-serif)" }}
      >
        Cancel
      </button>
      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--md-sys-color-text-primary)", fontFamily: "var(--font-serif)" }}>
        {title}
      </span>
      <button
        onClick={onConfirm}
        aria-label={confirmLabel}
        className="active:opacity-60 transition-opacity flex items-center justify-end"
        style={{ minWidth: 64, minHeight: 44, color: "var(--md-sys-color-neonindigo)" }}
      >
        <Icon name="check" size={26} />
      </button>
    </div>
  );
}

export default function Drawer({
  open, onClose, onExitComplete, children, maxHeight, keyboardAware, zIndex,
}: {
  open: boolean;
  /** Called when the scrim is tapped. The caller flips `open`. */
  onClose: () => void;
  onExitComplete?: () => void;
  children: ReactNode;
  maxHeight?: string;
  keyboardAware?: boolean;
  zIndex?: number;
}) {
  const overlayRoot = useOverlayRoot();
  if (!overlayRoot) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <div className="absolute inset-0" style={{ pointerEvents: "auto", zIndex }}>
          <DrawerBackdrop onClick={onClose} />
          <DrawerPanel maxHeight={maxHeight} keyboardAware={keyboardAware}>{children}</DrawerPanel>
        </div>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}
