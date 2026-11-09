"use client";

/**
 * FLUTTER HANDOFF: ScrollAwareTopBar
 * Widget: StatefulWidget (a scroll listener on the page's ScrollController)
 * Props: onBack, rightSlot? (ReactNode), scrollRef (the scrolling container)
 * State: hasScrolled (scrolled more than 10px), scrollingUp
 * Flutter equivalent: scroll_aware_top_bar.dart (a Stack overlay driven by the ScrollController: SliverAppBar-style, but floating over the content)
 *
 * A back button floating over the top of a scrolling page, with an optional control on the right (for example "Edit" or "Send"):
 *   - at the top of the page the back arrow has no background; after 10px of scroll a 36px glass circle (color.alpha.bg-glass, 16px blur, hairline
 *     color.alpha.white-10 ring) appears behind it, 180ms
 *   - the right control fades out while scrolling down and returns when scrolling up (160ms)
 *   - the bar sits 40px from the top (below the status bar), 16px side padding, and passes taps through everywhere except its controls
 * The page content needs about 86px of top padding so it starts below the bar.
 *
 * Tokens: color.text.primary (arrow), color.alpha.bg-glass (scrolled circle), color.alpha.white-10 (circle ring)
 */

import React, { useRef, useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";

interface ScrollAwareTopBarProps {
  onBack: () => void;
  rightSlot?: React.ReactNode;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export default function ScrollAwareTopBar({ onBack, rightSlot, scrollRef }: ScrollAwareTopBarProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(false);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      const top = el!.scrollTop;
      setHasScrolled(top > 10);
      setScrollingUp(top < lastScrollTopRef.current);
      lastScrollTopRef.current = top;
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  const showRight = !hasScrolled || scrollingUp;

  return (
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        zIndex: 10,
        paddingTop: 40,
        paddingBottom: 10,
        paddingLeft: 16,
        paddingRight: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
      }}
    >
      <button
        onClick={onBack}
        aria-label="Go back"
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: hasScrolled ? "var(--md-sys-color-alpha-bg-glass)" : "transparent",
          backdropFilter: hasScrolled ? "blur(16px) saturate(180%)" : undefined,
          boxShadow: hasScrolled ? "inset 0 0 0 1px var(--md-sys-color-alpha-white-10)" : "none",
          transition: "background 180ms ease",
          flexShrink: 0,
          pointerEvents: "auto",
        }}
      >
        <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-primary)" }} />
      </button>

      {rightSlot && (
        <div
          style={{
            opacity: showRight ? 1 : 0,
            pointerEvents: showRight ? "auto" : "none",
            transition: "opacity 160ms ease",
          }}
        >
          {rightSlot}
        </div>
      )}
    </div>
  );
}
