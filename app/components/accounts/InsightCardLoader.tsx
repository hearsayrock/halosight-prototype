"use client";

/**
 * FLUTTER HANDOFF: InsightCardLoader
 * Widget: StatefulWidget (index of the current status line; one Timer.periodic; one repeating AnimationController for the sparkle)
 * Props: messages (string[]), interval (ms, default 1100)
 * State: current message index; advances on a timer and stops on the last message (it waits there until loading ends)
 * Flutter equivalent: insight_card_loader.dart
 *
 * What the account summary looks like while the app is bringing it in. Replaces the card body (the footer is hidden).
 *   - A four-point sparkle in neonindigo turns 90° every 1.6s (ease in-out, repeating) with a gentle 1 → 1.15 → 1 pulse
 *   - Beside it, a status line in the body text size, text-muted: e.g. "Reading 6 visits...", "Checking Salesforce...", "Writing your summary..."
 *   - Every ~1.1s the line slides up 12px and fades out while the next slides in from below (AnimatedSwitcher with a vertical slide + fade, ~300ms)
 *   - When the real text arrives the card body cross-fades to it (InsightCard owns that fade, ~300ms)
 *   - Reduced motion: the sparkle holds still and lines swap with a fade only
 * Tokens: color.neonindigo.base (sparkle), color.text.muted (status line), spacing.3
 *
 * Timings and the sparkle's rotation were read off a screen recording frame by frame, so treat them as a close match, not exact.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export const INSIGHT_LOADING_MESSAGES = ["Reading 6 visits...", "Checking Salesforce...", "Writing your summary..."];

function Sparkle({ still }: { still: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }}
      animate={still ? undefined : { rotate: [0, 90], scale: [1, 1.15, 1] }}
      transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
    >
      <path
        fill="currentColor"
        d="M12 2C12.8 8.2 15.8 11.2 22 12C15.8 12.8 12.8 15.8 12 22C11.2 15.8 8.2 12.8 2 12C8.2 11.2 11.2 8.2 12 2Z"
      />
    </motion.svg>
  );
}

export default function InsightCardLoader({
  messages = INSIGHT_LOADING_MESSAGES, interval = 1100,
}: {
  messages?: string[];
  interval?: number;
}) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), interval);
    return () => clearTimeout(t);
  }, [index, messages.length, interval]);

  return (
    <div role="status" aria-live="polite" className="flex items-center" style={{ gap: "var(--spacing-3)", minHeight: 40 }}>
      <Sparkle still={reduce} />
      <div className="relative flex-1 min-w-0" style={{ height: 26, overflow: "hidden" }}>
        <AnimatePresence initial={false}>
          <motion.span
            key={index}
            className="absolute left-0 top-0 whitespace-nowrap"
            style={{ fontSize: 17, lineHeight: "26px", color: "var(--md-sys-color-text-muted)" }}
            initial={{ y: reduce ? 0 : 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : -14, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {messages[Math.min(index, messages.length - 1)]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
