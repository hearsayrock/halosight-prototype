"use client";

/**
 * FLUTTER HANDOFF: Toast
 * Widget: StatefulWidget (auto-dismiss timer, pause on press, swipe-to-dismiss) — Flutter equivalent is a custom
 *         OverlayEntry or a SnackBar with SnackBarBehavior.floating; ToastCard maps to the SnackBar content.
 * Props: visible, tone ("neutral" | "success" | "error"), title, description?, leading? (icon name or widget),
 *        action? { label, onPress }, secondary? { label, icon?, onPress }, duration (ms | null), dismissible, bottom, onDismiss
 * State: none beyond the dismiss timer; the caller owns `visible`
 * Flutter equivalent: halosight_toast.dart (ToastCard + ToastController queue, one toast at a time)
 * Portals into #phone-overlay-root, so it sits above sheets and the bottom nav; pass `bottom` to clear a nav or floating button.
 *
 * Shapes: "card" (default, bottom, full width) and "pill" (top, hugs its content, full radius). The pill is how a note shows
 *   "Preparing note" (neutral spinner) then "Note ready" (green check): same pill, the icon and text swap and the width eases.
 *   Pills can carry one action label ("View", "Try again"); the whole pill is the tap target, the label just says what it does.
 *   It sits just under the status bar / island, centered (top: 40 in the prototype frame, level with the back / menu buttons; pass `top` for other headers); pill toasts carry a title only. Spinner and check are ToastSpinner / ToastCheck.
 *
 * Behaviour (the rules, from the product team's reference toasts and published guidance):
 *   - One line of title, optional description, never more than 2 lines of text in total (clamped)
 *   - At most one action, a plain text button ("Undo", "View", "Change"). Anything else belongs on the screen itself
 *   - Auto-dismiss after 5s, or 7s when there is an action (more time to reach it). Pressing or hovering pauses the timer
 *   - `duration: null` keeps it up until dismissed and shows a close button; so does `dismissible`
 *   - Swipe down to dismiss; spring in from 16px below with a fade
 *   - Announced politely (role="status"); errors use role="alert"
 *   - Reduced motion: fade only
 * Tokens: color.dark.secondary (surface, 88% + backdrop blur), color.alpha.white-18 (stroke), elevation.5,
 *         color.semantic.success / error (the icon and a 32% stroke only; the fill stays neutral so they are not loud), color.neonindigo.base (action),
 *         color.text.primary / secondary / muted, radius.lg, spacing.2/3/4
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useOverlayRoot } from "@/components/ui/Drawer";

export type ToastTone = "neutral" | "success" | "error";
export type ToastShape = "card" | "pill";

export interface ToastAction { label: string; onPress: () => void }
export interface ToastSecondary { label: string; icon?: string; onPress: () => void }

export interface ToastCardProps {
  tone?: ToastTone;
  title: string;
  description?: string;
  /** Material icon name, or any node (a thumbnail). Defaults per tone: check_circle for success, error for error, none for neutral. */
  leading?: string | React.ReactNode;
  action?: ToastAction;
  /** A quiet row under the message (e.g. "Add a note"). Use sparingly; prefer a single action. */
  secondary?: ToastSecondary;
  /** "pill": top toast, hugs its content, full radius, title only. Default "card". */
  shape?: ToastShape;
  /** Pill only: makes the whole pill tappable (e.g. "Note ready" opens the note). */
  onPress?: () => void;
  /** Shows a close button. Always on when the toast has no timer. */
  showClose?: boolean;
  onClose?: () => void;
}

const TONE = {
  neutral: { fill: "var(--md-sys-color-dark-secondary)", edge: "var(--md-sys-color-alpha-white-18)", icon: "var(--md-sys-color-text-secondary)", defaultIcon: undefined as string | undefined },
  success: { fill: "var(--md-sys-color-dark-secondary)", edge: "color-mix(in srgb, var(--md-sys-color-semantic-success) 32%, transparent)", icon: "var(--md-sys-color-semantic-success)", defaultIcon: "check_circle" },
  error:   { fill: "var(--md-sys-color-dark-secondary)", edge: "color-mix(in srgb, var(--md-sys-color-semantic-error) 32%, transparent)", icon: "var(--md-sys-color-semantic-error)", defaultIcon: "error" },
} as const;

const clamp2: React.CSSProperties = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };

/** In-progress indicator for pill toasts: a 3/4 ring that turns. Takes the text color of its surroundings. */
export function ToastSpinner({ size = 18 }: { size?: number }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ color: "var(--md-sys-color-text-secondary)", flexShrink: 0 }}
      animate={reduce ? undefined : { rotate: 360 }}
      transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
    >
      <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </motion.svg>
  );
}

/** Done indicator for pill toasts: a solid success circle with a dark check. */
export function ToastCheck({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill="var(--md-sys-color-semantic-success)" />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="var(--md-sys-color-dark-secondary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The toast itself, without the portal, timer or motion — rendered as-is on the design-system page. */
export function ToastCard({ tone = "neutral", title, description, leading, action, secondary, shape = "card", onPress, showClose = false, onClose }: ToastCardProps) {
  const t = TONE[tone];
  // Pill: fade the new text in only when the title *changes* (processing → ready), never on first show.
  const [prevTitle, setPrevTitle] = useState(title);
  const titleChanged = prevTitle !== title;
  if (titleChanged) setPrevTitle(title);
  const lead = leading ?? t.defaultIcon;

  if (shape === "pill") {
    // The pill's fill is always neutral; only the icon carries the state.
    const n = TONE.neutral;
    // The whole pill is the tap target. `action` only adds the visible label ("View", "Try again"); onPress alone makes it tappable with no label.
    const press = action?.onPress ?? onPress;
    return (
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 38 }}
        role={press ? "button" : undefined}
        tabIndex={press ? 0 : undefined}
        aria-label={press && action ? `${title}. ${action.label}` : undefined}
        onClick={press}
        onKeyDown={press ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); press(); } } : undefined}
        className={`inline-flex items-center${press ? " active:opacity-70 cursor-pointer" : ""}`}
        style={{
          gap: "var(--spacing-2)",
          height: 40,
          padding: "0 var(--spacing-4)",
          background: n.fill,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${n.edge}`,
          borderRadius: "var(--radius-full)",
          boxShadow: "var(--elevation-5)",
          overflow: "hidden",
        }}
      >
        {/* Keyed on the title: when it changes, the new icon and text fade in while the pill eases to its new width. */}
        <motion.span
          key={title}
          className="inline-flex items-center whitespace-nowrap"
          style={{ gap: "var(--spacing-2)" }}
          initial={titleChanged ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {typeof lead === "string" ? <Icon name={lead} size={18} style={{ color: t.icon, flexShrink: 0 }} /> : lead}
          <span className="text-15" style={{ fontWeight: 500, color: "var(--md-sys-color-text-secondary)" }}>{title}</span>
          {action && (
            <span className="text-15" style={{ fontWeight: 600, color: "var(--md-sys-color-neonindigo)", marginLeft: "var(--spacing-1)" }}>{action.label}</span>
          )}
        </motion.span>
      </motion.div>
    );
  }

  return (
    <div
      className="w-full"
      style={{
        background: t.fill,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${t.edge}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--elevation-5)",
        padding: "var(--spacing-3) var(--spacing-4)",
      }}
    >
      <div className="flex items-center" style={{ gap: "var(--spacing-3)", minHeight: 28 }}>
        {typeof lead === "string" ? (
          <Icon name={lead} fill size={24} style={{ color: t.icon, flexShrink: 0 }} />
        ) : lead ? (
          <div className="flex-shrink-0">{lead}</div>
        ) : null}
        <div className="flex-1 min-w-0">
          <p className="text-15-bold" style={{ color: "var(--md-sys-color-text-primary)", ...(description ? {} : clamp2) }}>{title}</p>
          {description && <p className="text-sm" style={{ color: "var(--md-sys-color-text-muted)", ...clamp2 }}>{description}</p>}
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onPress}
            className="text-15-bold active:opacity-60 transition-opacity flex-shrink-0"
            style={{ color: tone === "neutral" ? "var(--md-sys-color-neonindigo)" : "var(--md-sys-color-text-primary)", textDecoration: tone === "neutral" ? "none" : "underline", padding: "var(--spacing-1) 0 var(--spacing-1) var(--spacing-2)" }}
          >
            {action.label}
          </button>
        )}
        {showClose && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onClose}
            className="flex items-center justify-center active:opacity-60 transition-opacity flex-shrink-0"
            style={{ width: 28, height: 28, color: "var(--md-sys-color-text-muted)" }}
          >
            <Icon name="close" size={18} />
          </button>
        )}
      </div>
      {secondary && (
        <button
          type="button"
          onClick={secondary.onPress}
          className="flex items-center active:opacity-60 transition-opacity"
          style={{ gap: "var(--spacing-1)", marginTop: "var(--spacing-2)", paddingLeft: lead ? 36 : 0 }}
        >
          {secondary.icon && <Icon name={secondary.icon} size={14} style={{ color: "var(--md-sys-color-brand-teal)" }} />}
          <span className="text-xs-bold" style={{ color: "var(--md-sys-color-brand-teal)" }}>{secondary.label}</span>
        </button>
      )}
    </div>
  );
}

export interface ToastProps extends Omit<ToastCardProps, "showClose" | "onClose"> {
  visible: boolean;
  /** ms before it dismisses itself. Default 5000, or 7000 with an action. null = stay until dismissed. */
  duration?: number | null;
  /** Show a close button even when it auto-dismisses. */
  dismissible?: boolean;
  /** Close the toast after its action is pressed. Default true. */
  dismissOnAction?: boolean;
  /** Distance from the bottom of the phone frame. 24 with no nav, about 106 above the bottom nav. */
  bottom?: number;
  /** "top" puts the toast under the status bar instead of at the bottom; the pill shape defaults to it. */
  placement?: "top" | "bottom";
  /** Distance from the top of the phone frame when placed at the top. Default 40: centers the 40px pill on the header's back / menu button row (those sit about 58px down in the prototype frame). A real phone's status bar pushes that row lower; pass `top` to match. */
  top?: number;
  onDismiss: () => void;
}

export default function Toast({ visible, duration, dismissible = false, dismissOnAction = true, bottom = 24, top = 40, placement, onDismiss, ...card }: ToastProps) {
  const isTop = (placement ?? (card.shape === "pill" ? "top" : "bottom")) === "top";
  const dir = isTop ? -1 : 1;
  const root = useOverlayRoot();
  const reduce = useReducedMotion() ?? false;
  const ms = duration === undefined ? (card.action ? 7000 : 5000) : duration;
  const paused = useRef(false);
  const remaining = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(0);
  const dismissRef = useRef(onDismiss);
  useEffect(() => { dismissRef.current = onDismiss; });

  function start(delay: number) {
    if (timer.current) clearTimeout(timer.current);
    remaining.current = delay;
    startedAt.current = Date.now();
    timer.current = setTimeout(() => dismissRef.current(), delay);
  }

  // (Re)start the clock whenever a toast appears or its message changes.
  useEffect(() => {
    if (!visible || ms === null) return;
    start(ms);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [visible, ms, card.title]);

  function pause() {
    if (ms === null || paused.current) return;
    paused.current = true;
    if (timer.current) clearTimeout(timer.current);
    remaining.current = Math.max(1500, remaining.current - (Date.now() - startedAt.current));
  }
  function resume() {
    if (ms === null || !paused.current) return;
    paused.current = false;
    start(remaining.current);
  }

  if (!root) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          role={card.tone === "error" ? "alert" : "status"}
          aria-live={card.tone === "error" ? "assertive" : "polite"}
          initial={{ opacity: 0, y: reduce ? 0 : 16 * dir }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 16 * dir }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={isTop ? { top: 0.6, bottom: 0 } : { top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => { if (info.offset.y * dir > 40 || info.velocity.y * dir > 400) onDismiss(); }}
          onPointerDown={pause}
          onPointerUp={resume}
          onPointerEnter={pause}
          onPointerLeave={resume}
          style={{ position: "absolute", ...(isTop ? { top } : { bottom }), left: "var(--spacing-4)", right: "var(--spacing-4)", zIndex: 60, pointerEvents: "auto", ...(card.shape === "pill" ? { display: "flex", justifyContent: "center", pointerEvents: "none" } : {}) }}
        >
          <div style={{ pointerEvents: "auto", width: card.shape === "pill" ? undefined : "100%" }}>
          <ToastCard
            {...card}
            onPress={card.onPress && (() => { card.onPress?.(); if (dismissOnAction) onDismiss(); })}
            action={card.action && { ...card.action, onPress: () => { card.action?.onPress(); if (dismissOnAction) onDismiss(); } }}
            showClose={dismissible || (ms === null && card.shape !== "pill")}
            onClose={onDismiss}
          />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    root,
  );
}
